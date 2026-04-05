# Configuration Guide — Dw4ngSh3rs Blog

Everything you need to configure to get this app running locally and in production.

---

## 1. Environment Variables

Your `.env.local` file already exists at the project root and is filled in correctly:

```
NEXT_PUBLIC_SUPABASE_URL=https://wjcdegmjrmkcekppzfym.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
NEXT_PUBLIC_ADMIN_EMAIL=02230281.cst@rub.edu.bt
```

**Nothing to change here unless you switch Supabase projects.**

> Keep `.env.local` out of git. Check that `.gitignore` includes it.

---

## 2. Supabase Setup (Do This First)

All of steps 2.1–2.6 are done in your Supabase Dashboard at:
`https://supabase.com/dashboard/project/wjcdegmjrmkcekppzfym`

---

### 2.1 Run the Database Schema

1. Go to **SQL Editor** (left sidebar)
2. Click **New query**
3. Paste the entire contents of `/supabase/schema.sql`
4. Click **Run**

This creates the 4 tables (`profiles`, `posts`, `comments`, `likes`), enables Row Level Security, sets all RLS policies, sets the admin email config, and creates the triggers and auth hook function.

> The updated schema.sql now includes `ALTER DATABASE postgres SET "app.admin_email" = '...'` directly — you do not need to run a separate SQL command for this.

---

### 2.2 Set Up the Admin Auth Hook (Recommended)

This adds `role: 'admin'` to your JWT token on login, which is used by RLS as an additional verification layer.

1. Go to **Authentication** (left sidebar)
2. Click **Hooks**
3. Find **Custom Access Token** and click **Edit**
4. Set:
   - **Hook type**: Postgres function
   - **Function**: `public.set_admin_role`
5. Click **Save**

> This step is now optional — the updated RLS policies check your email directly in the JWT (which is always present). But setting the hook is still recommended for production security.

---

### 2.3 Create the Storage Bucket

Cover images for posts are uploaded here.

1. Go to **Storage** (left sidebar)
2. Click **New bucket**
3. Fill in:
   - **Name**: `blog-images` (must match exactly)
   - **Public bucket**: toggle **ON**
4. Click **Save**

---

### 2.4 Set Storage Policies (Required for Upload to Work)

After creating the bucket, you need two policies: one for public reading, one to allow authenticated users to upload.

**Policy 1 — Public read (anyone can view images):**

1. Click the `blog-images` bucket → **Policies** tab
2. Click **New policy** → **For full customization**
3. Fill in:
   - **Policy name**: `Public read`
   - **Allowed operation**: SELECT
   - **Target roles**: leave blank
   - **USING expression**: `true`
4. Save

**Policy 2 — Authenticated upload (admin can upload cover images):**

1. Click **New policy** → **For full customization**
2. Fill in:
   - **Policy name**: `Authenticated upload`
   - **Allowed operation**: INSERT
   - **Target roles**: `authenticated`
   - **WITH CHECK expression**: `true`
3. Save

**Policy 3 — Authenticated delete (optional, lets admin remove images):**

1. Click **New policy** → **For full customization**
2. Fill in:
   - **Policy name**: `Authenticated delete`
   - **Allowed operation**: DELETE
   - **Target roles**: `authenticated`
   - **USING expression**: `true`
3. Save

> Without Policy 2 (INSERT), every cover image upload will fail with a 403 error — the image file will not be saved even though the form appears to accept it.

---

### 2.5 Enable Realtime on Comments

This powers live comment updates (new comments appear without page refresh).

1. Go to **Database** (left sidebar)
2. Click **Replication**
3. Under **Tables**, find `comments`
4. Toggle it **ON**

---

### 2.6 Sign Up as Admin

Your admin account is identified by email — it is NOT auto-created.

1. Run the app locally (`npm run dev`)
2. Go to `http://localhost:3000/auth/signup`
3. Sign up with:
   - **Email**: `02230281.cst@rub.edu.bt` (must match `NEXT_PUBLIC_ADMIN_EMAIL`)
   - **Username**: anything you want
   - **Password**: min 6 characters
4. Check your email and click the confirmation link
5. Log in at `/auth/login`
6. You will now see **Admin** in the navbar

---

## 3. Running Locally

```bash
# Install dependencies (only needed once)
npm install

# Start development server
npm run dev
```

App runs at `http://localhost:3000`

---

## 4. Deploying to Vercel (Production)

### 4.1 Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 4.2 Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **Add New → Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no build settings to change
5. Before clicking **Deploy**, add your environment variables:

   | Key | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon/public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
   | `NEXT_PUBLIC_ADMIN_EMAIL` | `02230281.cst@rub.edu.bt` |

6. Click **Deploy**

### 4.3 Update Supabase Auth Settings for Production

1. Go to Supabase Dashboard → **Authentication → URL Configuration**
2. Set **Site URL** to your Vercel URL (e.g. `https://your-app.vercel.app`)
3. Under **Redirect URLs**, add: `https://your-app.vercel.app/**`

---

## 5. How the Admin Works

- Only **one admin**: whoever signs in with `02230281.cst@rub.edu.bt`
- The `/admin` route is protected by middleware AND server-side session checks
- RLS policies check `auth.jwt() ->> 'email'` against the stored `app.admin_email` setting — this is the reliable path that works without the auth hook
- The auth hook adds `role: 'admin'` to the JWT as a secondary check

---

## 6. Cover Image Upload — Troubleshooting

### Why uploads fail

The cover image upload works by calling the Supabase Storage API from the browser. There are three reasons it can fail:

**Reason 1: The `blog-images` bucket does not exist**

The bucket must be created manually in the Supabase Dashboard (see Section 2.3). The code cannot create it automatically.

Symptom: Upload returns an error like `"Bucket not found"`.

Fix: Create the bucket as described in Section 2.3.

---

**Reason 2: No INSERT policy on the storage bucket**

Even if the bucket exists and is set to "public", Supabase Storage still requires an explicit RLS policy to allow file uploads. "Public bucket" only controls read access — it does not automatically allow uploads.

Symptom: The upload silently fails or returns `"new row violates row-level security policy"` in the browser console.

Fix: Add the Authenticated upload policy described in Section 2.4, Policy 2.

---

**Reason 3: User is not authenticated when uploading**

The upload uses the browser Supabase client which sends the user's JWT. If the session has expired or the user is not logged in, the upload will fail with a 401 or 403 error.

Fix: Make sure you are logged in as admin before creating/editing a post.

---

### How to verify storage is working

After setting up the bucket and policies:

1. Log in as admin
2. Go to `/admin/new`
3. Click **Upload Cover Image** and select any image file
4. If it works: a preview thumbnail appears immediately
5. If it fails: open browser DevTools → Network tab → look for a request to `*.supabase.co/storage/v1/object` and check the response status code:
   - `400` or `404`: bucket doesn't exist
   - `403`: missing upload policy or not authenticated
   - `200`: success

---

## 7. RLS Violation When Publishing a Post — Explanation and Fix

### What the error means

When you try to create a post and see:

```
new row violates row-level security policy for table "posts"
```

This means the database rejected the INSERT because the RLS policy check returned false for your session.

### Root cause

The original RLS policy was:

```sql
create policy "Admin can insert posts" on posts
  for insert with check (auth.jwt() ->> 'role' = 'admin');
```

This checks for a **custom JWT claim** called `role`. This claim is only added to your JWT if:

1. The `public.set_admin_role` function exists in the database ✓ (created by schema.sql)
2. The `public.admin_email()` helper function exists in the database ✓ (created by schema.sql)
3. The **Custom Access Token hook** is linked to that function in the Supabase Dashboard ✗ (this is a manual step many users miss)

If step 3 is not done, your JWT never gets `role: 'admin'`, so `auth.jwt() ->> 'role'` is null, and the check fails for every insert — even for the correct admin account.

### What was fixed in the code

The RLS policies in `supabase/schema.sql` have been updated to use a **dual check**:

```sql
create policy "Admin can insert posts" on posts
  for insert with check (
    auth.jwt() ->> 'email' = public.admin_email()
    OR auth.jwt() ->> 'role' = 'admin'
  );
```

The `auth.jwt() ->> 'email'` field is **always present** in every Supabase JWT — it is the user's authenticated email set by Supabase itself and cannot be forged. This means the policy works correctly as long as:

- You are logged in with the admin email
- The `public.admin_email()` function exists in the database (created by schema.sql)

### How to apply the fix

You need to re-run the updated SQL schema to replace the old policies:

1. Go to Supabase Dashboard → **SQL Editor**
2. Paste the entire contents of the updated `/supabase/schema.sql`
3. Click **Run**

The schema uses `DROP POLICY IF EXISTS` before creating each policy, so running it again is safe — it replaces the old policies without errors.

### Why this happened before (and won't again)

| Check | Requires auth hook? | Always works? |
|---|---|---|
| `auth.jwt() ->> 'role' = 'admin'` | Yes — hook must be set up in dashboard | No |
| `auth.jwt() ->> 'email' = public.admin_email()` | No | Yes, as long as schema.sql has been run |

The new policy uses both checks with `OR`, so it works in both cases.

---

## 8. Checklist Before Going Live

- [ ] Schema SQL has been run in Supabase (updated version with dual-check RLS)
- [ ] Auth hook linked to `public.set_admin_role` (optional but recommended)
- [ ] `blog-images` storage bucket created with Public ON
- [ ] Storage Policy 1: Public SELECT (`true`)
- [ ] Storage Policy 2: Authenticated INSERT (`true`)
- [ ] Realtime enabled for the `comments` table
- [ ] Admin account created and email confirmed
- [ ] Environment variables added to Vercel
- [ ] Supabase Site URL and Redirect URLs updated with your Vercel domain
