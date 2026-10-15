Regency Events AV Tracker V59 - Crew Management & Casual Induction

Replace these files in the repository root:
- index.html
- sw.js
- manifest.webmanifest
- casual-induction.html

Also run SUPABASE-CASUAL-CREW-SETUP.sql once in the existing Regency Supabase project's SQL Editor and follow README-CASUAL-CREW.txt to register the Director account and add induction materials.

Keep existing logo/banner, icon, and other image assets already in the repository. This ZIP intentionally does not include image/icon assets.

This ZIP's static JavaScript files have been syntax-checked with Node.js. The app has not been run against the live Supabase project from this environment, so complete the supplied setup and test checklist before rolling it out to crew.

V59.2 adds a Health & Safety sync for casual induction and removes the Regular Crew shortcut from the Casual Crew panel. Run SUPABASE-V59.2-HS-SYNC-MIGRATION.sql before using the sync.
