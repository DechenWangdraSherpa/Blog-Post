# Blog Platform Setup Instructions

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Set up environment variables:**
   Create a `.env.local` file in the root with the following keys:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_ADMIN_EMAIL=your_admin_email@example.com
   ```
3. **Set up Supabase:**
   - Create a new Supabase project.
   - Run the SQL in `/supabase/schema.sql` in the Supabase SQL editor.
   - Set the `app.admin_email` config in Supabase to your admin email.
   - Set up the "Custom Access Token" auth hook to use the provided function.
   - Create a storage bucket named `blog-images`.
4. **Run the development server:**
   ```bash
   npm run dev
   ```
5. **Deploy:**
   - Deploy frontend to Vercel.
   - Use Supabase cloud for backend.

## Tech Stack

- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS (with next-themes for dark/light mode)
- Supabase (PostgreSQL, Auth, RLS, Storage, Realtime)
- Tiptap (rich text editor)
- Zustand (state management)

## Folder Structure

```
/app
  /admin
    page.tsx
    /new/page.tsx
    /edit/[slug]/page.tsx
  /auth
    /login/page.tsx
    /signup/page.tsx
  /blog
    /[slug]/page.tsx
  page.tsx
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
  /auth/LoginForm.tsx
  /auth/SignupForm.tsx
/lib
  /supabase/
    client.ts
    server.ts
    middleware.ts
  utils.ts
/types
  index.ts
/supabase
  schema.sql
```

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_ADMIN_EMAIL`

---

For full requirements and architecture, see the original project README and `/supabase/schema.sql`.