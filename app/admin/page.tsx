import AdminPostList from "../../components/AdminPostList";
import { getAllPosts, getSession } from "../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getSession();
  if (!session?.user?.email || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect("/");
  }
  const posts = await getAllPosts();

  return (
    <div className="py-8 relative">
      <div className="orb orb-purple" style={{ width: 340, height: 340, top: -80, right: -80, opacity: 0.35 }} />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-bold tracking-[0.22em] uppercase mb-1 t-accent">
            Admin Panel
          </p>
          <h1 className="text-3xl font-black tracking-tight t-heading">
            All Posts
          </h1>
          <p className="text-sm mt-1 t-muted">
            {posts.length} post{posts.length !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link href="/admin/new" className="btn-primary">
          + New Post
        </Link>
      </div>

      <div className="relative z-10">
        <AdminPostList posts={posts} />
      </div>
    </div>
  );
}
