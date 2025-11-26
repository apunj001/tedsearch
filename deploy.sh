#!/bin/bash

# Configuration
PROJECT_ID="tedsearch"
SERVICE_NAME="coverquest"
REGION="us-central1"

echo "🚀 Deploying to Google Cloud Run (Project: $PROJECT_ID)..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed."
    exit 1
fi

# Ask for API Key
echo -n "🔑 Enter your GEMINI_API_KEY: "
read -s GEMINI_API_KEY
echo ""

if [ -z "$GEMINI_API_KEY" ]; then
    echo "❌ Error: API Key is required."
    exit 1
fi

# 1. Build the container image using Cloud Build
echo "📦 Building container image..."
gcloud builds submit --config cloudbuild.yaml \
  --project $PROJECT_ID \
  --substitutions=_GEMINI_API_KEY="$GEMINI_API_KEY"

# 2. Deploy to Cloud Run
echo "🚀 Deploying to Cloud Run..."
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME \
  --platform managed \
  --region $REGION \
  --project $PROJECT_ID \
  --allow-unauthenticated

echo "✅ Deployment complete!"
