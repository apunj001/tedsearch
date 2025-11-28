# How to Fix "Forbidden" Error (403)

If you see "Your client does not have permission to get URL / from this server", it means your Cloud Run service is private. You need to make it public.

## Steps to Make it Public

1.  Go to the **[Google Cloud Run Console](https://console.cloud.google.com/run?project=tedsearch)**.
2.  Click on the service name **`coverquest`**.
3.  Click on the **Security** tab (top menu).
4.  Look for the **Authentication** section.
    *   Select **Allow unauthenticated invocations**.
    *   Click **Save**.

## Alternative Method (via Permissions Tab)

If you don't see the Security tab option:

1.  Click on the **Permissions** tab.
2.  Click **Add Principal**.
3.  In "New principals", type: `allUsers`
4.  In "Select a role", choose: **Cloud Run** > **Cloud Run Invoker**.
5.  Click **Save**.
6.  It may ask "Are you sure you want to make this resource public?" -> Click **Allow Public Access**.

After doing this, refresh your URL. It should work immediately!
