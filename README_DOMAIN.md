# How to Connect cover-quest.com to Google Cloud Run

Since you bought your domain on GoDaddy, you need to point it to your deployed Google Cloud Run service.

## Step 1: Get DNS Records from Google Cloud

1.  Go to the **[Google Cloud Run Console](https://console.cloud.google.com/run?project=tedsearch)**.
2.  Click on the **Manage Custom Domains** button (top bar) or go to the "Integrations" tab of your service.
    *   *Note: If you don't see "Manage Custom Domains", look for "Cloud Run Domain Mappings" in the main menu.*
3.  Click **Add Mapping**.
4.  **Select Service**: Choose `coverquest`.
5.  **Select Domain**:
    *   Select "Verify a new domain..."
    *   Enter `cover-quest.com` (and `www.cover-quest.com` if you want both).
6.  Google will ask you to verify ownership. It will give you a **TXT record** to add to GoDaddy.

## Step 2: Verify Ownership in GoDaddy

1.  Log in to **GoDaddy**.
2.  Go to **DNS Management** for `cover-quest.com`.
3.  Click **Add**.
    *   **Type**: `TXT`
    *   **Name**: `@`
    *   **Value**: (Paste the text Google gave you)
    *   **TTL**: `1 Hour`
4.  Save. Wait a few minutes, then click **Verify** in the Google Cloud Console.

## Step 3: Point Domain to Cloud Run

Once verified, Google will give you a set of **A** and **AAAA** records.

1.  Back in **GoDaddy DNS Management**:
2.  **Delete** any existing "Parked" A records.
3.  **Add the A Records** from Google:
    *   **Type**: `A`
    *   **Name**: `@`
    *   **Value**: (First IP Address from Google)
    *   **TTL**: `1 Hour`
    *   *(Repeat for all 4 IP addresses Google gives you)*
4.  **Add the AAAA Records** (if provided):
    *   Repeat the process for the AAAA records.

## Step 4: Wait for Propagation

*   It can take anywhere from **15 minutes to 48 hours** for the changes to spread across the internet.
*   Google will automatically provision a **free SSL certificate** (HTTPS) for you. This usually takes about 15-60 minutes after the DNS is correct.

Your site will then be live at `https://cover-quest.com`!
