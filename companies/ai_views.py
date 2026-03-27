from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Company
from .serializers import CompanySerializer, CompanyListSerializer
from . import ai_service


class AISearchView(APIView):
    """POST {query: string} → returns parsed filters + matching companies"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        query = request.data.get("query", "").strip()
        if not query:
            return Response({"error": "query is required"}, status=400)

        try:
            filters = ai_service.natural_language_to_filters(query)
        except Exception as e:
            return Response({"error": str(e)}, status=502)

        # Apply parsed filters to queryset
        from django.db.models import Q
        qs = Company.objects.all()

        if filters.get("search"):
            s = filters["search"]
            qs = qs.filter(
                Q(company_name__icontains=s) |
                Q(file_number__icontains=s) |
                Q(permit_number__icontains=s) |
                Q(district__icontains=s) |
                Q(location__icontains=s)
            )
        if filters.get("sector"):
            qs = qs.filter(sector=filters["sector"])
        if filters.get("district"):
            qs = qs.filter(district__icontains=filters["district"])
        if filters.get("date_from"):
            qs = qs.filter(created_at__date__gte=filters["date_from"])
        if filters.get("date_to"):
            qs = qs.filter(created_at__date__lte=filters["date_to"])
        if filters.get("permit_expired") == "true":
            qs = qs.filter(permit_expiry_date__lt=timezone.now().date())
        elif filters.get("permit_expired") == "false":
            qs = qs.filter(permit_expiry_date__gte=timezone.now().date())

        companies = CompanyListSerializer(qs[:50], many=True).data
        return Response({
            "parsed_filters": filters,
            "count": qs.count(),
            "results": companies,
        })


class AIInsightsView(APIView):
    """GET → AI-generated dashboard insights"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.db.models import Count, Sum, Avg

        today = timezone.now().date()
        expiring_soon = Company.objects.filter(
            permit_expiry_date__gte=today,
            permit_expiry_date__lte=today.replace(day=today.day)
        )

        # Build stats payload for AI
        sector_counts = list(
            Company.objects.values("sector")
            .annotate(count=Count("id"))
            .order_by("-count")
        )
        total = Company.objects.count()
        expired = Company.objects.filter(permit_expiry_date__lt=today).count()
        expiring_90 = Company.objects.filter(
            permit_expiry_date__gte=today,
            permit_expiry_date__lte=today + timedelta(days=90)
        ).count()
        no_permit = Company.objects.filter(permit_number="").count()
        no_file = Company.objects.filter(file_number="").count()

        # Recent 30 days
        from datetime import timedelta
        last_30 = Company.objects.filter(
            created_at__date__gte=today - timedelta(days=30)
        ).count()

        stats = {
            "total_companies": total,
            "companies_per_sector": sector_counts,
            "expired_permits": expired,
            "expiring_in_90_days": expiring_90,
            "missing_permit_number": no_permit,
            "missing_file_number": no_file,
            "registered_last_30_days": last_30,
            "today": str(today),
        }

        if total == 0:
            return Response({"insight": "No company data available yet. Add companies to start seeing AI-powered insights.", "stats": stats})

        try:
            insight = ai_service.generate_dashboard_insights(stats)
        except Exception as e:
            return Response({"error": str(e)}, status=502)

        return Response({"insight": insight, "stats": stats})


class AIAnomaliesView(APIView):
    """GET → list of detected anomalies across all companies"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        companies = list(
            Company.objects.values(
                "id", "company_name", "sector", "district",
                "file_number", "permit_number", "permit_expiry_date",
                "payment_amount", "date_of_submission", "phone_number",
            )
        )
        # Convert dates/decimals to strings for JSON serialization
        for c in companies:
            for k, v in c.items():
                if hasattr(v, 'isoformat'):
                    c[k] = v.isoformat()
                elif v is not None:
                    c[k] = str(v) if not isinstance(v, (str, int, float, bool)) else v

        try:
            anomalies = ai_service.detect_anomalies(companies)
        except Exception as e:
            return Response({"error": str(e)}, status=502)

        return Response({"anomalies": anomalies, "total": len(anomalies)})


class AIReportView(APIView):
    """POST {sector?, filters?} → generated report text"""
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sector = request.data.get("sector", "")
        filters = request.data.get("filters", {})

        qs = Company.objects.all()
        if sector:
            qs = qs.filter(sector=sector)

        companies = list(
            qs.values(
                "company_name", "sector", "district", "file_number",
                "permit_number", "permit_expiry_date", "type_of_application",
                "payment_amount", "date_of_permit_issued", "remarks"
            )[:50]
        )

        if not companies:
            return Response({"error": f"No companies found{' in the ' + sector + ' sector' if sector else ''}. Add records first."}, status=400)
        for c in companies:
            for k, v in c.items():
                if hasattr(v, 'isoformat'):
                    c[k] = v.isoformat()
                elif v is not None:
                    c[k] = str(v) if not isinstance(v, (str, int, float, bool)) else v

        try:
            report = ai_service.generate_report(sector, filters, companies)
        except Exception as e:
            return Response({"error": str(e)}, status=502)

        return Response({"report": report, "company_count": len(companies)})


class PermitAlertsView(APIView):
    """GET → companies with expired or soon-expiring permits"""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from datetime import timedelta
        today = timezone.now().date()
        days = int(request.query_params.get("days", 90))

        expired = CompanyListSerializer(
            Company.objects.filter(permit_expiry_date__lt=today).order_by("permit_expiry_date"),
            many=True
        ).data

        expiring = CompanyListSerializer(
            Company.objects.filter(
                permit_expiry_date__gte=today,
                permit_expiry_date__lte=today + timedelta(days=days)
            ).order_by("permit_expiry_date"),
            many=True
        ).data

        return Response({
            "expired": expired,
            "expiring_soon": expiring,
            "days_window": days,
        })
