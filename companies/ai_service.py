"""
OpenRouter AI service — uses the auto-routing model (free tier friendly).
"""
import json
import requests
from django.conf import settings

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def _chat(messages, temperature=0.3):
    """Send a chat request to OpenRouter using auto model selection."""
    headers = {
        "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173",
        "X-Title": "DMS Portal",
    }
    payload = {
        "model": "openrouter/auto",
        "messages": messages,
        "temperature": temperature,
    }
    resp = requests.post(OPENROUTER_URL, json=payload, headers=headers, timeout=30)
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"].strip()


def natural_language_to_filters(query: str) -> dict:
    """
    Convert a plain English search query into DMS filter params.
    Returns a dict with keys: search, sector, district, date_from, date_to, permit_expired
    """
    sectors = "health, agriculture, mining, agrochemicals, infrastructure, hospitality, telemast"
    system = f"""You are a query parser for a company database management system.
Convert the user's natural language query into a JSON filter object.

Available filter fields:
- search (string): general text search across company name, file number, permit number, location
- sector (string): one of [{sectors}] — only set if clearly mentioned
- district (string): district name if mentioned
- date_from (string): ISO date YYYY-MM-DD if a start date is mentioned
- date_to (string): ISO date YYYY-MM-DD if an end date is mentioned
- permit_expired (string): "true" if user asks for expired permits, "false" for active permits

Return ONLY valid JSON, no explanation. Example:
{{"sector": "mining", "district": "Accra", "permit_expired": "true"}}
"""
    content = _chat([
        {"role": "system", "content": system},
        {"role": "user", "content": query},
    ])
    # Extract JSON safely
    try:
        # Strip markdown code blocks if present
        clean = content.strip().strip("```json").strip("```").strip()
        return json.loads(clean)
    except Exception:
        # Fallback: treat as plain search
        return {"search": query}


def generate_dashboard_insights(stats: dict) -> str:
    """Generate a plain-English AI summary of dashboard statistics."""
    system = """You are an analyst for a regulatory document management system in Ghana.
Given dashboard statistics, write a concise 3-5 sentence insight summary.
Focus on: notable trends, sectors needing attention, permit expiry risks, and data gaps.
Be direct and actionable. No bullet points, just flowing sentences."""

    user_content = f"Dashboard statistics:\n{json.dumps(stats, indent=2)}"
    return _chat([
        {"role": "system", "content": system},
        {"role": "user", "content": user_content},
    ], temperature=0.5)


def detect_anomalies(companies: list) -> list:
    """
    Detect anomalies: duplicates, missing critical fields, unusual patterns.
    Returns a list of anomaly dicts: {type, company_id, company_name, message}
    """
    if not companies:
        return []

    system = """You are a data quality analyst for a company registry database.
Analyze the provided company records and identify anomalies such as:
1. Potential duplicate companies (similar names in same sector/district)
2. Companies with missing critical fields (permit number, file number, district)
3. Companies with permits already expired
4. Unusual patterns (e.g. payment amount of 0, very old submission dates with no permit)

Return ONLY a JSON array of anomaly objects. Each object must have:
- type: "duplicate" | "missing_data" | "expired_permit" | "unusual"
- company_id: integer
- company_name: string
- message: short description of the issue

Return [] if no anomalies found. Return ONLY JSON, no explanation."""

    # Send a condensed version to avoid token limits
    condensed = [
        {
            "id": c["id"],
            "company_name": c["company_name"],
            "sector": c["sector"],
            "district": c.get("district", ""),
            "file_number": c.get("file_number", ""),
            "permit_number": c.get("permit_number", ""),
            "permit_expiry_date": c.get("permit_expiry_date", ""),
            "payment_amount": c.get("payment_amount", ""),
            "date_of_submission": c.get("date_of_submission", ""),
        }
        for c in companies[:80]  # cap to avoid token overflow
    ]

    content = _chat([
        {"role": "system", "content": system},
        {"role": "user", "content": json.dumps(condensed)},
    ])
    try:
        clean = content.strip().strip("```json").strip("```").strip()
        return json.loads(clean)
    except Exception:
        return []


def generate_report(sector: str, filters: dict, companies: list) -> str:
    """Generate a formatted text report for a set of companies."""
    if not companies:
        return "No companies found for the selected sector/filters. Add company records first before generating a report."

    system = """You are a report writer for a regulatory document management system.
Write a professional summary report based STRICTLY on the provided company data.
CRITICAL RULES:
- Only use numbers and facts from the actual data provided. Do NOT invent, estimate, or assume any figures.
- If a field is missing or empty for a company, note it as missing — do not fill it in.
- Base all statistics only on what is explicitly present in the JSON data.
Include: overview, key statistics (derived only from the data), permit status summary, and observations.
Use clear headings and professional language."""

    user_content = f"""
Sector: {sector or 'All Sectors'}
Total companies in dataset: {len(companies)}
Company data:
{json.dumps(companies[:50], indent=2)}

Generate a report using ONLY the above data. Do not add any figures not present in this data.
"""
    return _chat([
        {"role": "system", "content": system},
        {"role": "user", "content": user_content},
    ], temperature=0.1)
