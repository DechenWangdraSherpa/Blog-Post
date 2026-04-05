

# Full-Stack Blog Platform — AI Builder Prompt

Use the prompt below to build a complete, production-ready blog application with Next.js and Supabase.

---

## Prompt

**Project: Full-Stack Blog Platform with Supabase, Role-Based Access, and Dark/Light Mode**

Build a complete, production-ready blog application using **Next.js (App Router)** on the frontend and **Supabase** as the backend (database, auth, storage, and realtime). Follow every instruction precisely — do not skip or simplify any section.

---

### 1. Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Row Level Security, Storage, Realtime)
- **Styling**: Tailwind CSS with `next-themes` for dark/light mode
- **Rich Text Editor**: Tiptap or BlockNote (for the admin post editor)
- **State**: React Server Components where possible; Zustand or Context for client state
- **Deployment**: Vercel (frontend) + Supabase cloud

---

### 2. Roles and Access Rules

There are exactly **three user types**. Enforce all rules at both the UI layer AND via Supabase Row Level Security (RLS) policies — never trust the UI alone.

| Action                | Guest (not logged in) | Member (logged in) | Admin (you) |
| --------------------- | --------------------- | ------------------ | ----------- |
| View blog post list   | ✅                    | ✅                 | ✅          |
| View full post detail | ✅                    | ✅                 | ✅          |
| Like a post           | ❌                    | ✅                 | ✅          |
| Write a comment       | ❌                    | ✅                 | ✅          |
| Create a post         | ❌                    | ❌                 | ✅          |
| Edit a post           | ❌                    | ❌                 | ✅          |
| Delete a post         | ❌                    | ❌                 | ✅          |
| Delete any comment    | ❌                    | ❌                 | ✅          |

**Admin identity**: The admin is identified by a specific email address stored in an environment variable (`NEXT_PUBLIC_ADMIN_EMAIL`). After sign-in, check if `user.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL`. Also add a custom claim `role: 'admin'` to the Supabase JWT via a Database Function + Auth Hook so RLS policies can use `auth.jwt() ->> 'role' = 'admin'`.

---

### 3. Supabase Database Schema

Create exactly these tables with the specified columns. Use `uuid` primary keys with `gen_random_uuid()` defaults. Enable RLS on every table.

```sql
-- profiles (auto-created on user signup via trigger)
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique not null,
  avatar_url text,
  created_at timestamptz default now()
);

-- posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  cover_image_url text,
  content text not null,           -- rich HTML from the editor
  excerpt text,
  published boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- comments
create table comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  body text not null,
  created_at timestamptz default now()
);

-- likes
create table likes (
  id uuid primary key default gen_random_uuid(),
  post_id uuid references posts(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  unique(post_id, user_id)
);
```

---

### 4. Row Level Security (RLS) Policies

Write and apply all of the following RLS policies after creating the tables:

**posts table**

- Anyone can `SELECT` published posts (`WHERE published = true`)
- Only admin can `INSERT`, `UPDATE`, `DELETE`

**comments table**

- Anyone can `SELECT` comments
- Only authenticated members can `INSERT` (their own `user_id` must match `auth.uid()`)
- Only admin can `DELETE` any comment; members can delete only their own

**likes table**

- Anyone can `SELECT`
- Only authenticated users can `INSERT` (their own)
- Users can only `DELETE` their own like

**profiles table**

- Anyone can `SELECT`
- Users can only `UPDATE` their own profile

---

### 5. Frontend Pages and Routes

Build all of the following routes:

| Route                | Description                                                                                                                |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `/`                  | Blog homepage — grid/list of published posts with cover image, title, excerpt, date, like count, comment count             |
| `/blog/[slug]`       | Full post detail — rendered rich HTML, like button, comment section at the bottom                                          |
| `/admin`             | Admin dashboard — list of all posts (published + drafts) with edit/delete actions. Protected: redirect to `/` if not admin |
| `/admin/new`         | Create new post — rich text editor, title, slug (auto-generated from title), cover image upload, excerpt, published toggle |
| `/admin/edit/[slug]` | Edit existing post — same form pre-populated                                                                               |
| `/auth/login`        | Login page — email/password and optional OAuth (Google). After login, redirect back to the previous page                   |
| `/auth/signup`       | Signup page — email, password, username                                                                                    |

---

### 6. Comments Section

- Render comments at the **very bottom** of every post detail page (`/blog/[slug]`), below all post content
- Each comment shows: avatar (from `profiles.avatar_url` or a default initial-based avatar), username, comment body, and relative timestamp (e.g. "3 hours ago")
- Sort comments: **oldest first** (ascending `created_at`)
- If the user is **not logged in**: show comments but display a message — "Log in to leave a comment" — where the comment box would be. The textarea and submit button must be hidden/disabled
- If the user **is logged in as a member**: show a textarea and "Post comment" button. On submit, insert into the `comments` table via Supabase client. Show the new comment immediately (optimistic UI update) without a full page reload
- Use **Supabase Realtime** to subscribe to new comments on the current post, so if another user posts a comment it appears live without refreshing
- Admin can delete any comment with a small delete icon next to each comment (only visible when logged in as admin)

---

### 7. Like Button

- Display a heart icon with the like count on both the blog list and post detail pages
- If the user is not logged in: clicking the like button redirects to `/auth/login`
- If the user is logged in: toggle the like (insert if not liked, delete if already liked). Update the UI instantly (optimistic update)
- Highlight the heart icon when the current user has already liked the post

---

### 8. Admin Post Editor

- Use **Tiptap** or **BlockNote** as the rich text editor
- Editor must support: bold, italic, underline, headings (H1–H3), bullet lists, numbered lists, blockquotes, inline code, code blocks, links, and image insertion
- Cover image upload goes to **Supabase Storage** in a bucket called `blog-images`. Generate a public URL after upload and store it in `posts.cover_image_url`
- Slug is auto-generated from the title (lowercase, hyphens, no special characters) but remains editable
- Include a "Published" toggle. Unpublished posts are only visible in the admin dashboard
- On save, `updated_at` is updated via a Supabase trigger

---

### 9. UI and Design

Use a **strong, bold, masculine design language**:

- Typography: use a strong sans-serif (e.g. Inter, Geist, or Space Grotesk). Headings should be heavy (font-weight 700–900)
- Color palette — **light mode**: white or off-white background (`#F9F9F7`), near-black text (`#111111`), sharp accent color (deep amber `#D97706` or electric blue `#2563EB`)
- Color palette — **dark mode**: deep charcoal background (`#0F0F0F` or `#111827`), near-white text (`#F3F4F6`), same accent color as light mode
- Use clean card layouts with subtle borders, no rounded-corner excess. Cards have a hover state with a slight lift (`translateY(-2px)`) and shadow
- Navigation bar: fixed at top, shows logo/site name on the left, nav links (Home, Admin if admin) on the right, and a theme toggle button (sun/moon icon)
- The dark/light mode toggle must work via `next-themes`. Default to system preference. Persist the user's choice in `localStorage`
- No gradients, no excessive animations. Keep it sharp, fast, and clean
- Fully responsive: mobile, tablet, desktop breakpoints

---

### 10. Authentication Flow

- Use **Supabase Auth** with the `@supabase/ssr` package for cookie-based sessions in Next.js App Router
- On new user signup, a Postgres trigger automatically inserts a row into `profiles` using `auth.users.id` and the metadata username
- Protect the `/admin` route with a Next.js **middleware** (`middleware.ts`) that checks the session and `user.email` against `NEXT_PUBLIC_ADMIN_EMAIL`. Redirect unauthenticated users to `/auth/login` and non-admin users to `/`
- After login, if the user's email matches the admin email, set a custom claim `role: 'admin'` via a Supabase Auth hook (use the "Custom Access Token" hook in the Supabase dashboard linked to a Postgres function)

---

### 11. Environment Variables

Create a `.env.local` file with the following keys (provide placeholder values):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=
```

---

### 12. Folder Structure

Follow this structure strictly:

```
/app
  /admin
    page.tsx           ← admin dashboard
    /new/page.tsx
    /edit/[slug]/page.tsx
  /auth
    /login/page.tsx
    /signup/page.tsx
  /blog
    /[slug]/page.tsx
  page.tsx             ← homepage
  layout.tsx
  middleware.ts
/components
  Navbar.tsx
  ThemeToggle.tsx
  PostCard.tsx
  CommentSection.tsx
  LikeButton.tsx
  PostEditor.tsx
  AdminPostList.tsx
/lib
  supabase/
    client.ts          ← browser client
    server.ts          ← server client (cookies)
    middleware.ts      ← middleware client
  utils.ts
/types
  index.ts             ← all TypeScript types
```

---

### 13. What to Deliver

Deliver all source files, complete and runnable. Include:

- All SQL (schema, RLS policies, triggers, auth hook function) in a single `/supabase/schema.sql` file
- All environment variable keys documented in a `README.md` with setup instructions
- No placeholder or stub code — every function must be fully implemented
