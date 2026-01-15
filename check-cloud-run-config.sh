#!/bin/bash

# Add gcloud to PATH
export PATH="/Users/developer/google-cloud-sdk/bin:$PATH"

echo "Checking Cloud Run service configuration..."
echo ""

# First, check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "⚠️  Not authenticated. Please run:"
    echo "   gcloud auth login"
    echo ""
    echo "Then run this script again."
    exit 1
fi

# Try to get the project ID from current config
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)

if [ -z "$PROJECT_ID" ]; then
    echo "No default project set. Listing available projects..."
    gcloud projects list --format="table(projectId,projectNumber,name)"
    echo ""
    echo "Please set the project:"
    echo "   gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "Using project: $PROJECT_ID"
echo ""

# Get the service configuration
echo "Fetching environment variables for 'out-of-office-transfer' service..."
echo ""

gcloud run services describe out-of-office-transfer \
  --region=us-central1 \
  --format="yaml(spec.template.spec.containers[0].env)" 2>&1

echo ""
echo "---"
echo ""
echo "To see all service details:"
echo "   gcloud run services describe out-of-office-transfer --region=us-central1 --format=yaml"
