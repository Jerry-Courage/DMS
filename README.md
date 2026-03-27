# DMS - Document Management System

## Project Structure
```
DMS/
├── backend/          # Django settings
├── companies/        # Django app (models, views, API)
├── frontend/         # React + Vite app
├── manage.py
└── create_admin.py
```

## Backend Setup (Django)

```bash
# Install dependencies (already done)
python -m pip install django djangorestframework djangorestframework-simplejwt django-cors-headers

# Run migrations (already done)
python manage.py migrate

# Create admin user (already done)
python create_admin.py

# Start server
python manage.py runserver
```

Default admin credentials: `admin / admin123`

## Frontend Setup (React)

> Requires Node.js — download from https://nodejs.org (LTS)

```bash
cd frontend
npm install
npm run dev
```

App runs at: http://localhost:5173
API runs at: http://localhost:8000

## Sectors
Health, Agriculture, Mining, Agrochemicals, Infrastructure, Hospitality, Telemast

## Features
- JWT auth with Admin/Staff roles
- Full CRUD for companies across all sectors
- Search by name, file number, permit, district, location
- Filter by sector, district, date range
- Dashboard: overview cards, bar chart, line chart, recent activity
- Admin-only user management
