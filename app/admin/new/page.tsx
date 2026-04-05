import PostEditor from "../../../components/PostEditor";
import { getSession } from "../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function NewPostPage() {
  const session = await getSession();
  if (!session?.user?.email || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect("/");
  }

  return (
    <div className="py-8 relative">
      <div className="orb orb-purple" style={{ width: 300, height: 300, top: -60, left: -80, opacity: 0.3 }} />
      <div className="relative z-10 mb-7">
        <Link href="/admin" className="text-xs font-semibold mb-4 inline-flex items-center gap-1 transition-colors t-muted">
          ← Back to Admin
        </Link>
        <h1 className="text-3xl font-black tracking-tight mt-2 t-heading">
          New Post
        </h1>
      </div>
      <div className="relative z-10">
        <PostEditor mode="create" />
      </div>
    </div>
  );
}
