#!/bin/bash
# Deploy backend to Google Cloud Run

set -e

PROJECT_ID="pet-store-direct"
SERVICE_NAME="out-of-office-transfer"
REGION="us-central1"
IMAGE_NAME="gcr.io/${PROJECT_ID}/${SERVICE_NAME}:latest"

echo "=========================================="
echo "Deploying ${SERVICE_NAME} to Cloud Run"
echo "=========================================="
echo "Project ID: ${PROJECT_ID}"
echo "Service: ${SERVICE_NAME}"
echo "Region: ${REGION}"
echo "Image: ${IMAGE_NAME}"
echo ""

# Check if gcloud is configured
if ! gcloud config get-value project &> /dev/null; then
  echo "Error: gcloud is not configured. Please run 'gcloud auth login' and 'gcloud config set project ${PROJECT_ID}'"
  exit 1
fi

# Set the project
gcloud config set project ${PROJECT_ID} --quiet

# Build Docker image
echo "Building Docker image..."
docker build -t ${IMAGE_NAME} .

# Push to Container Registry
echo "Pushing image to Container Registry..."
docker push ${IMAGE_NAME}

# Deploy to Cloud Run
echo "Deploying to Cloud Run..."
echo ""
echo "Note: Environment variables will be preserved from the existing service."
echo "If you need to update env vars, use:"
echo "  gcloud run services update ${SERVICE_NAME} --update-env-vars KEY=VALUE"
echo ""

gcloud run deploy ${SERVICE_NAME} \
  --image ${IMAGE_NAME} \
  --platform managed \
  --region ${REGION} \
  --allow-unauthenticated \
  --no-cpu-throttling \
  --max-instances 10

echo ""
echo "=========================================="
echo "Deployment complete!"
echo "=========================================="
gcloud run services describe ${SERVICE_NAME} --region ${REGION} --format="value(status.url)"

