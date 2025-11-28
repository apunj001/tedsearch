#!/bin/bash

# Deploy Cloud Function for logging
echo "🚀 Deploying Cloud Function for server-side logging..."

cd functions/log-generation

gcloud functions deploy logGeneration \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --project tedsearch \
  --entry-point logGeneration

echo "✅ Cloud Function deployed!"
echo "📊 View logs at: https://console.cloud.google.com/logs/query?project=tedsearch"
