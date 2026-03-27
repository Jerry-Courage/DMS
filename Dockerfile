# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: Production Django + Gunicorn
FROM python:3.12-slim

WORKDIR /app

# Install Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Django project files
COPY manage.py ./
COPY backend/ ./backend/
COPY companies/ ./companies/
COPY create_admin.py ./

# Copy React build output
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Set up Django templates to find React's index.html
RUN mkdir -p templates
RUN cp ./frontend/dist/index.html ./templates/index.html

# Collect Django static files
ENV DJANGO_SETTINGS_MODULE=backend.settings
ENV DEBUG=False
RUN python manage.py collectstatic --noinput || true

EXPOSE 8000

# Migrate, seed admin, then start gunicorn
CMD ["sh", "-c", "python manage.py migrate && python create_admin.py && gunicorn backend.wsgi:application --bind 0.0.0.0:8000 --workers 2"]
