REGENCY EVENTS BACKSTAGE LIVE - HEALTH & SAFETY BULK MOVE V64

This package is based on the live Backstage V63 release and adds:
- Separate Health & Safety pages for Risk Assessments, Safe Systems of Work, and Training Videos.
- An upload destination selector for Risk Assessments and Safe Systems of Work.
- A Manage Documents pop-up with search, category filtering, multi-select, select-all, and bulk move confirmation.
- A service-worker cache version bump so the updated live app can refresh.

IMPORTANT DEPLOYMENT NOTES
1. This is for the LIVE GREEN Regency Events app, not the blue test app.
2. The live Supabase URL, publishable key, organisation ID, manifest, app identity, branding, and other existing files have been preserved.
3. To deploy as a safe feature update, upload and replace ONLY index.html and sw.js in the live repository root. Leave all other live files and SQL setup files untouched.
4. No database migration is included or expected for this feature. Document categories are stored with the existing Health & Safety document metadata.
5. After GitHub Pages finishes publishing, close and reopen the live app. If the old version remains cached, refresh the website or fully close and reopen the installed app.
6. Test with one or two non-critical documents first. Confirm the category change appears correctly after cloud sync and on another logged-in device before moving a large group.

Validation performed for this package: ZIP integrity check passed and all 11 inline JavaScript blocks passed Node syntax checks. The live browser and real cloud-sync behaviour have not been independently exercised as part of this build.
