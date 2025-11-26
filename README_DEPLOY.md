# Deployment Guide for CoverQuest

You have two ways to deploy this application to Google Cloud Run.

## Option 1: Automatic Deployment via GitHub (Recommended)

Since your code is already on GitHub (`apunj001/tedsearch`), you can set up Google Cloud Build to automatically deploy whenever you push changes.

1.  **Go to Google Cloud Console**:
    *   Navigate to [Cloud Build > Triggers](https://console.cloud.google.com/cloud-build/triggers?project=tedsearch).
    *   Ensure you are in the `tedsearch` project.

2.  **Create a Trigger**:
    *   Click **Create Trigger**.
    *   **Name**: `deploy-coverquest`
    *   **Event**: Push to a branch
    *   **Source**: Connect your GitHub repository (`apunj001/tedsearch`) and select the `main` branch.
    *   **Configuration**: Select **Cloud Build configuration file (yaml or json)**.
    *   **Location**: `cloudbuild.yaml` (default).

3.  **Add API Key**:
    *   Scroll down to **Advanced**.
    *   Under **Substitution variables**, click **Add Variable**.
    *   **Variable**: `_GEMINI_API_KEY`
    *   **Value**: `your_actual_gemini_api_key` (Paste your key here).

4.  **Deploy**:
    *   Click **Create**.
    *   Click **Run** on the new trigger to deploy the current code immediately.

## Option 2: Manual Deployment (Requires gcloud CLI)

If you have the `gcloud` CLI installed on your local machine:

1.  **Login**:
    ```bash
    gcloud auth login
    gcloud config set project tedsearch
    ```

2.  **Run the Script**:
    ```bash
    ./deploy.sh
    ```
    *   Paste your API key when prompted.
    *   The script will build the container and deploy it to Cloud Run.

## Architecture

*   **Dockerfile**: Multi-stage build (Node.js build -> Nginx serve).
*   **Cloud Run**: Hosts the container as a serverless service.
*   **Nginx**: Serves the static React files and handles routing.
