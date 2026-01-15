#!/bin/bash

# Test script for Out-of-Office Transfer Custom Function
# This script checks recent Cloud Run logs to verify the function is working

export PATH="/Users/developer/google-cloud-sdk/bin:$PATH"

echo "🔍 Checking recent Cloud Run logs for out-of-office-transfer service..."
echo ""

# Check if authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Not authenticated. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Set project
gcloud config set project pet-store-direct > /dev/null 2>&1

echo "📋 Recent transfer requests (last 20):"
echo ""

# Get recent logs
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=out-of-office-transfer AND (textPayload=~\"call_id\" OR textPayload=~\"Transfer\" OR textPayload=~\"transfer\")" \
  --limit=20 \
  --format="table(timestamp,textPayload)" \
  --project=pet-store-direct 2>&1 | head -30

echo ""
echo "---"
echo ""

# Check for "unknown" call_id
echo "🔍 Checking for 'unknown' call_id issues..."
UNKNOWN_COUNT=$(gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=out-of-office-transfer AND textPayload=~\"unknown\"" \
  --limit=5 \
  --format="value(timestamp)" \
  --project=pet-store-direct 2>&1 | wc -l | tr -d ' ')

if [ "$UNKNOWN_COUNT" -gt 0 ]; then
    echo "⚠️  Found requests with 'unknown' call_id"
    echo "   This means Retell configuration still needs to be fixed"
    echo "   Update call_id to: {{call.call_id}}"
else
    echo "✅ No 'unknown' call_id found in recent logs"
fi

echo ""
echo "---"
echo ""

# Check for successful transfers
echo "🔍 Checking for successful transfers..."
SUCCESS_COUNT=$(gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=out-of-office-transfer AND textPayload=~\"Transfer successful\"" \
  --limit=5 \
  --format="value(timestamp)" \
  --project=pet-store-direct 2>&1 | wc -l | tr -d ' ')

if [ "$SUCCESS_COUNT" -gt 0 ]; then
    echo "✅ Found $SUCCESS_COUNT successful transfer(s)"
else
    echo "ℹ️  No successful transfers found in recent logs"
    echo "   Make a test call during business hours to verify"
fi

echo ""
echo "---"
echo ""

# Show latest parsed request body
echo "📋 Latest request details:"
gcloud logging read \
  "resource.type=cloud_run_revision AND resource.labels.service_name=out-of-office-transfer AND textPayload=~\"Parsed request body\"" \
  --limit=1 \
  --format="value(textPayload)" \
  --project=pet-store-direct 2>&1 | tail -1

echo ""
echo "💡 To test:"
echo "   1. Make a call to your Retell agent"
echo "   2. Trigger the transfer function"
echo "   3. Run this script again to see the results"
