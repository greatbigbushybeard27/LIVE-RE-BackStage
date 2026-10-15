REGENCY EVENTS BACKSTAGE — V60 BUILD

This ZIP is a complete replacement bundle based on V59.2. It includes:
- Regency Events Backstage banner and updated app icon/PWA manifest.
- App title/branding updates where AV Tracker referred to the app name. AV remains as a stock category.
- Dashboard App Tutorials button and tutorial library. Directors can add HTTPS video links later. Tutorial links are currently stored in this browser/device.
- Dedicated Director-only Submitted Inductions button under the Casual Crew heading, showing submitted records and acknowledgement versions using the existing Supabase tables and access checks.
- Updated service-worker cache version for the new assets.

UPLOAD
Replace the repository files with the files in this ZIP, keeping the included filenames and folder layout. Upload the full set, including regency-banner.png, regency-app-logo.png, apple-touch-icon.png, manifest.webmanifest and sw.js.

IMPORTANT
The submitted forms page uses the existing Supabase tables and requires a connected cloud session plus Director registration. It does not create or alter Supabase schema. Tutorial links are saved locally in the browser for now; use the same device/browser to manage them.

The ZIP was assembled from the V59.2 source and statically checked for file presence and JavaScript syntax. A live Supabase sign-in/submission test was not performed.
