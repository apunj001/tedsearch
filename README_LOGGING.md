# Server-Side Logging Setup

I've implemented server-side logging for CoverQuest using Google Cloud Functions and Cloud Logging.

## What Gets Logged

Every time a user generates covers, the following data is logged to Google Cloud:
- User's input query (5 sentences)
- Generated front cover prompt
- Generated back cover prompt
- Art style details
- Web sources (if any)
- Timestamp
- User agent
- IP address

## How to Deploy the Logging Function

1. **Deploy the Cloud Function**:
   ```bash
   ./deploy-function.sh
   ```

2. **View Logs**:
   - Go to [Google Cloud Logs](https://console.cloud.google.com/logs/query?project=tedsearch)
   - Filter by: `logName="projects/tedsearch/logs/coverquest-generations"`

## How It Works

1. User generates covers
2. Frontend sends log data to Cloud Function endpoint
3. Cloud Function writes to Google Cloud Logging
4. You can view/query all logs in Cloud Console

## Files Created

- `functions/log-generation/index.js` - Cloud Function code
- `functions/log-generation/package.json` - Dependencies
- `deploy-function.sh` - Deployment script
- `components/ResultsView.tsx` - Updated to send logs

## Cost

Cloud Functions free tier: 2M invocations/month
Cloud Logging free tier: 50 GB/month

You're well within free limits for this use case.
