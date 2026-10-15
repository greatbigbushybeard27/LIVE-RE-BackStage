REGENCY EVENTS AV TRACKER V59 - CREW MANAGEMENT & CASUAL INDUCTION

Files in this build
- index.html: V58.8 base with the Casual Crew management entry, materials manager, submission history viewer and requested stock-row button styling.
- casual-induction.html: phone-friendly public induction form. Casual workers do not need a tracker login.
- SUPABASE-CASUAL-CREW-SETUP.sql: database tables, row-level security and safe public RPC functions.
- sw.js: refreshed cache version and casual induction page in the core cache.
- manifest.webmanifest: retained from V58.8.

IMPORTANT: the public form will not save submissions until the SQL setup is run and required material is added.

SETUP (one time)
1. In Supabase, open the existing Regency project and go to SQL Editor.
2. Create a new query, paste all of SUPABASE-CASUAL-CREW-SETUP.sql, and run it.
3. Register the Director's Supabase Auth user ID:
   - In Supabase Dashboard, open Authentication -> Users.
   - Copy the UUID for the Director account used to log in to Regency Cloud.
   - In SQL Editor, run the following, replacing the example UUID with that user's UUID:
       insert into public.regency_casual_hs_directors(user_id) values ('00000000-0000-0000-0000-000000000000') on conflict do nothing;
   - Never share the user's password or secret keys. The UUID is an account identifier, not a password.
4. Deploy all files in the ZIP to the same website folder as index.html. Keep existing banner, icon, and image assets in the repository. Do not upload this ZIP as a ZIP into the repository root; extract it and replace the files.
5. Open the installed app online, sign in to Regency Cloud with the registered Director account, and open Create & Modify -> Crew Management.
6. Add each required Health & Safety document/video. Use HTTPS links accessible to the casual workers who will open the form. Use a clear version label such as 1.0.
7. Copy the Casual Crew induction link from Crew Management and send it to casual workers.

HOW VERSIONED INDUCTION WORKS
- First-time casual workers must acknowledge all active required items.
- Returning workers enter the same email address. Items whose ID and version label they already acknowledged are skipped.
- When an item is updated, edit it and change its version label (for example, 1.0 to 1.1). Only workers missing that version must acknowledge it again.
- Old submission rows and their acknowledgement snapshots remain available to the Director.
- Deactivating a material removes it from future inductions but does not delete old acknowledgement records.

SECURITY NOTES
- Public users can retrieve only active induction material and submit a validated induction. They cannot query the submissions table directly.
- Submission records and material editing are protected by Supabase row-level security and a dedicated Director allowlist table.
- Director management requires both the existing app Director role and registration of the logged-in Supabase Auth UUID in regency_casual_hs_directors.
- Use links that are safe to share publicly. Do not put private staff files or sensitive medical information into public URLs.

TEST BEFORE ROLL-OUT
- Add a test material with a safe public document/video URL.
- Submit a test induction using a test email address.
- Confirm it appears in Crew Management and that the recorded version is correct.
- Re-open the public link using the same email: it should say the user is up to date.
- Change the material's version label and check that only that item is required again.
- Verify a non-Director cloud account cannot read submissions or edit materials.

This build does not alter the existing Supabase cloud login credentials or existing Regency state table. Run the SQL setup only once; it is written to be repeatable.


V59.2 UPDATE: REUSE EXISTING HEALTH & SAFETY CONTENT
1. Run SUPABASE-V59.2-HS-SYNC-MIGRATION.sql in Supabase SQL Editor.
2. In Regency AV Tracker, connect to Regency Cloud and open Crew Management > Casual Crew.
3. Tap “Sync from Health & Safety”. This mirrors the current document/video metadata into the public induction material list; manage the actual content in the existing Health & Safety section.
4. Items stored only locally or without a shareable cloud/HTTPS link are skipped until they are synced to Regency Cloud. Cloud file links are signed URLs and may need refreshing by running sync again later.
5. Test the public induction link before sending it to staff.
