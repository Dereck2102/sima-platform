FROM python:3.11-slim

LABEL maintainer="Dereck Amacoria <amacoriadereck@gmail.com>"
LABEL description="SIMA Analytics Engine - Asset analytics service"

WORKDIR /app

# Install dependencies
COPY apps/analytics-engine/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY apps/analytics-engine/ .

# Environment
ENV PORT=3010
ENV PYTHONUNBUFFERED=1

EXPOSE 3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:3010/api/health')" || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "3010"]
