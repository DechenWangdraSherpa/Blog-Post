import PostEditor from "../../../../components/PostEditor";
import { getSession, getPostBySlug } from "../../../../lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EditPostPage({
  params,
}: {
  readonly params: { slug: string };
}) {
  const session = await getSession();
  if (!session?.user?.email || session.user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    redirect("/");
  }
  const post = await getPostBySlug(params.slug);
  if (!post) redirect("/admin");

  return (
    <div className="py-8 relative">
      <div className="orb orb-cyan" style={{ width: 280, height: 280, top: -50, right: -60, opacity: 0.25 }} />
      <div className="relative z-10 mb-7">
        <Link href="/admin" className="text-xs font-semibold mb-4 inline-flex items-center gap-1 t-muted">
          ← Back to Admin
        </Link>
        <h1 className="text-3xl font-black tracking-tight mt-2 t-heading">
          Edit Post
        </h1>
        <p className="text-sm mt-1 t-muted">{post.title}</p>
      </div>
      <div className="relative z-10">
        <PostEditor mode="edit" post={post} />
      </div>
    </div>
  );
}
