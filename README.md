# Dw4ngSh3rs Blog

A full-stack personal blog platform built with **Next.js 14**, **Supabase**, and **Tailwind CSS**. Features a rich text editor, real-time comments, like system, dark/light mode, and a protected admin dashboard — all backed by PostgreSQL with Row Level Security.

> *"Light from the quiet side — DwangShers"*

---

## Problem Statement

Most blogging solutions are either too heavyweight (WordPress) or too limited (static site generators). This project aims to provide a lightweight, self-owned blog platform where a single author can write and publish rich content, while readers can engage through comments and likes — all without a separate backend server.

---

## Features

- **Public blog feed** — browsable post grid with cover images and excerpts
- **Rich text editor** — Tiptap-powered editor with formatting, headings, and image embeds
- **Admin dashboard** — create, edit, publish/draft, and delete posts
- **Cover image upload** — direct upload to Supabase Storage
- **Authentication** — sign up / log in with email; admin identified by email address
- **Comments** — authenticated users can post comments; real-time updates via Supabase Realtime
- **Likes** — one like per user per post, toggleable
- **Dark / Light mode** — system-aware theme toggle powered by `next-themes`
- **Row Level Security** — database-level access control; no separate auth middleware layer needed
- **Protected admin routes** — Next.js middleware blocks non-admin access to `/admin`
- **Slug-based routing** — SEO-friendly URLs for every post

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 14](https://nextjs.org/) (App Router, SSR) |
| Language | TypeScript |
| Styling | Tailwind CSS + `@tailwindcss/typography` |
| Theme | `next-themes` (dark/light mode) |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (`blog-images` bucket) |
| Realtime | Supabase Realtime (comments) |
| Rich Text | Tiptap (`@tiptap/react`, `@tiptap/starter-kit`) |
| State | Zustand |

---

## Project Structure

```
.
├── app/
│   ├── page.tsx                  # Home page — post grid + hero
│   ├── layout.tsx                # Root layout (Navbar, ThemeProvider)
│   ├── middleware.ts              # Route-level middleware (legacy export)
│   ├── admin/
│   │   ├── page.tsx              # Admin dashboard — post list
│   │   ├── new/page.tsx          # Create new post
│   │   └── edit/[slug]/page.tsx  # Edit existing post
│   ├── auth/
│   │   ├── login/page.tsx        # Login page
│   │   └── signup/page.tsx       # Sign-up page
│   └── blog/
│       └── [slug]/page.tsx       # Individual post page
├── components/
│   ├── Navbar.tsx                # Top navigation bar
│   ├── ThemeToggle.tsx           # Dark/light mode button
│   ├── ThemeProvider.tsx         # next-themes wrapper
│   ├── PostCard.tsx              # Post preview card
│   ├── PostEditor.tsx            # Tiptap rich text editor wrapper
│   ├── AdminPostList.tsx         # Admin post management table
│   ├── CommentSection.tsx        # Real-time comments UI
│   ├── LikeButton.tsx            # Like/unlike toggle
│   ├── HeroCTA.tsx               # Hero call-to-action buttons
│   └── auth/
│       ├── LoginForm.tsx
│       └── SignupForm.tsx
├── lib/
│   └── supabase/
│       ├── client.ts             # Browser Supabase client
│       ├── server.ts             # Server Supabase client (RSC)
│       └── middleware.ts         # Supabase client for middleware
├── types/
│   └── index.ts                  # Shared TypeScript types
├── supabase/
│   └── schema.sql                # Full DB schema, RLS policies, triggers
├── middleware.ts                  # Next.js middleware (admin route protection)
├── next.config.js
├── tailwind.config.js
└── tsconfig.json
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- A free [Supabase](https://supabase.com/) account
- [Git](https://git-scm.com/)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/blog-platform.git
cd blog-platform
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com
```

> **Never commit `.env.local` to version control.** Verify it is listed in `.gitignore`.

You can find these values in your Supabase Dashboard under **Project Settings → API**.

---

## Supabase Setup

### Step 1 — Run the database schema

1. Open your [Supabase Dashboard](https://supabase.com/dashboard)
2. Go to **SQL Editor → New query**
3. Paste the entire contents of `supabase/schema.sql`
4. Click **Run**

This creates the four tables (`profiles`, `posts`, `comments`, `likes`), enables Row Level Security, installs all RLS policies, and sets up the database triggers.

### Step 2 — Create the storage bucket

1. Go to **Storage → New bucket**
2. Name it `blog-images` (must match exactly)
3. Enable **Public bucket**
4. Add the following policies to the bucket:

| Policy | Operation | Role | Expression |
|---|---|---|---|
| Public read | SELECT | (any) | `true` |
| Authenticated upload | INSERT | `authenticated` | `true` |
| Authenticated delete | DELETE | `authenticated` | `true` |

### Step 3 — Enable Realtime on comments

1. Go to **Database → Replication**
2. Find the `comments` table and toggle Realtime **ON**

### Step 4 — (Optional) Configure the Admin Auth Hook

This adds a `role: 'admin'` claim to your JWT for additional RLS verification.

1. Go to **Authentication → Hooks**
2. Set **Custom Access Token** hook → Postgres function → `public.set_admin_role`
3. Save

> The RLS policies work without this hook (they check the JWT email directly). This step is recommended for production security.

### Step 5 — Create your admin account

1. Start the app locally (`npm run dev`)
2. Navigate to `http://localhost:3000/auth/signup`
3. Sign up with the email matching `NEXT_PUBLIC_ADMIN_EMAIL`
4. Confirm your email via the link Supabase sends
5. Log in — the **Admin** link will appear in the navbar

---

## Running Locally

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

Other commands:

```bash
npm run build   # Production build
npm run start   # Start production server
npm run lint    # Run ESLint
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase public anon key (safe to expose in browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key — **keep this secret, server-side only** |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Email address that has admin privileges |

---

## Database Schema

The database has four tables:

```
profiles   — one row per user, auto-created on signup via trigger
posts      — blog posts (title, slug, content, cover_image_url, published)
comments   — user comments linked to posts
likes      — one row per user+post pair (unique constraint)
```

All tables have Row Level Security enabled. Policies enforce:
- Anyone can read published posts and all comments/likes
- Only the admin can create, edit, or delete posts
- Authenticated users can comment and like
- Users can only delete their own comments and likes

---

## API Routes

This project uses **Next.js Server Components and Server Actions** rather than explicit REST API routes. Data fetching happens server-side via Supabase client calls in page components and `lib/supabase/server.ts`.

Key data access functions in `lib/supabase/server.ts`:

| Function | Description |
|---|---|
| `getPublishedPosts()` | Fetch all published posts for the home page |
| `getPostBySlug(slug)` | Fetch a single post by slug for the blog detail page |
| `getAllPostsForAdmin()` | Fetch all posts (draft + published) for the admin dashboard |

Supabase Realtime handles live comment updates on the client side via `CommentSection.tsx`.

---

## Deployment

### Deploy to Vercel

#### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

#### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and log in
2. Click **Add New → Project** and import your GitHub repository
3. Vercel auto-detects Next.js — no build settings needed
4. Before deploying, add your environment variables under **Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key |
| `NEXT_PUBLIC_ADMIN_EMAIL` | Your admin email |

5. Click **Deploy**

#### 3. Update Supabase Auth settings

After your Vercel URL is live:

1. Supabase Dashboard → **Authentication → URL Configuration**
2. Set **Site URL** to `https://your-app.vercel.app`
3. Under **Redirect URLs**, add `https://your-app.vercel.app/**`

---

## Usage

### As a visitor
- Browse posts on the home page
- Click any post card to read the full article
- Sign up for an account to leave comments and like posts

### As the admin
- Log in with the admin email
- Access the **Admin** link in the navbar
- Create posts at `/admin/new`
- Edit or delete existing posts from the admin dashboard
- Toggle posts between draft and published state

---

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository
2. Create a feature branch

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes and commit

   ```bash
   git commit -m "feat: add your feature description"
   ```

4. Push to your fork and open a pull request

   ```bash
   git push origin feature/your-feature-name
   ```

Please keep pull requests focused — one feature or fix per PR.

---

## Future Improvements

- [ ] Post categories and tags with filter/search
- [ ] RSS feed for subscribers
- [ ] Reading time estimate on post cards
- [ ] View count tracking per post
- [ ] Nested / threaded comments
- [ ] Author bio section on post pages
- [ ] Email notifications for new comments
- [ ] Open Graph / SEO meta tags per post
- [ ] Multiple author support

---

## Troubleshooting

**Cover image upload fails (403)**
→ The `blog-images` storage bucket is missing the INSERT policy. See Supabase Setup → Step 2.

**RLS violation when publishing a post**
→ Re-run `supabase/schema.sql` to apply the updated dual-check RLS policies. See `configuration.md` for a full explanation.

**Comments not updating in real time**
→ Enable Realtime on the `comments` table in Supabase Dashboard → Database → Replication.

**Admin link not showing after login**
→ Make sure the email you signed up with exactly matches `NEXT_PUBLIC_ADMIN_EMAIL`.

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

*Built with Next.js and Supabase.*
