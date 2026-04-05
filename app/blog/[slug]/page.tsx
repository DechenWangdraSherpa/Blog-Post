import { getPostBySlug, getCommentsByPost } from "../../../lib/supabase/server";
import CommentSection from "../../../components/CommentSection";
import LikeButton from "../../../components/LikeButton";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function BlogPostPage({
  params,
}: {
  readonly params: { slug: string };
}) {
  const post = await getPostBySlug(params.slug);
  if (!post) redirect("/");

  const comments = await getCommentsByPost(post.id);

  return (
    <article className="py-6 sm:py-8 relative">
      <div className="orb orb-purple" style={{ width: 320, height: 320, top: -80, right: -80, opacity: 0.3 }} />

      <div className="relative z-10">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-xs font-semibold mb-6 t-muted"
        >
          ← All posts
        </Link>

        {/* Header */}
        <header className="mb-6 sm:mb-8">
          <h1
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight mb-4 t-heading"
          >
            {post.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm t-muted">
              {new Date(post.created_at).toLocaleDateString(undefined, {
                month: "long", day: "numeric", year: "numeric",
              })}
            </span>
            <LikeButton postId={post.id} />
          </div>
        </header>

        {/* Cover image */}
        {post.cover_image_url && (
          <img
            src={post.cover_image_url}
            alt={post.title}
            className="w-full object-cover mb-8"
            style={{ maxHeight: 380, borderRadius: 16 }}
          />
        )}

        {/* Content */}
        <div
          className="md-preview leading-relaxed"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Comments */}
        <CommentSection postId={post.id} initialComments={comments} />
      </div>
    </article>
  );
}
