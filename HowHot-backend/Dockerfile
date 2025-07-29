FROM python:3.11-slim

WORKDIR /app

# Install HEIC + ffmpeg dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg libheif-dev libde265-dev && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Install Python packages
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code (including model dir)
COPY . .

# Expose port expected by Amplify
EXPOSE 8080
ENV PORT=8080

# Start FastAPI server
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
