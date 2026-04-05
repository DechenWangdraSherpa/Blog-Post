import Link from "next/link";

export default function PostCard({ post }: { readonly post: any }) {
  const date = new Date(post.created_at).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/blog/${post.slug}`}
      className="card block overflow-hidden focus:outline-none group"
      tabIndex={0}
    >
      {/* Cover image */}
      {post.cover_image_url ? (
        <img
          src={post.cover_image_url}
          alt={post.title}
          className="w-full object-cover"
          style={{ height: 200, borderRadius: "18px 18px 0 0" }}
        />
      ) : (
        <div
          className="w-full flex items-center justify-center text-5xl font-black select-none"
          style={{
            height: 200,
            borderRadius: "var(--card-radius) var(--card-radius) 0 0",
            background: "var(--surface-alt)",
            color: "var(--accent)",
          }}
        >
          {post.title?.[0]?.toUpperCase() || "?"}
        </div>
      )}

      {/* Body */}
      <div className="p-5">
        <h2 className="font-bold text-base leading-snug mb-2 t-heading transition-colors">
          {post.title}
        </h2>
        {post.excerpt && (
          <p
            className="text-sm line-clamp-2 mb-4"
            style={{ color: "var(--text-muted)" }}
          >
            {post.excerpt}
          </p>
        )}

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs" style={{ color: "var(--text-muted)" }}>
          <span>{date}</span>
          <div className="flex items-center gap-3">
            {/* Likes */}
            <span className="flex items-center gap-1">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
                />
              </svg>
              {post.like_count ?? 0}
            </span>
            {/* Comments */}
            <span className="flex items-center gap-1">
              <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              {post.comment_count ?? 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
