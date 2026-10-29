FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2 and audio handling
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy and install python dependencies
COPY core_backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend app and ai_engine modules
COPY core_backend/ /app/core_backend/
COPY ai_engine/ /app/ai_engine/

# Configure Python path for monorepo imports
ENV PYTHONPATH=/app:/app/core_backend

EXPOSE 8000

WORKDIR /app/core_backend
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
