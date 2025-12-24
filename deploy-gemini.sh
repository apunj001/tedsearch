#!/bin/bash

# Deploy Gemini Cloud Function
echo "🚀 Deploying Gemini Cloud Function..."

gcloud functions deploy geminiGenerate \
  --runtime nodejs20 \
  --trigger-http \
  --allow-unauthenticated \
  --region us-central1 \
  --source functions/gemini-generate \
  --entry-point geminiGenerate \
  --set-env-vars GEMINI_API_KEY=AIzaSyBtMih7GR0tmwCxzss02HId1rvecOvwo3M \
  --project ted-search-478518

echo "✅ Gemini Cloud Function deployed!"
