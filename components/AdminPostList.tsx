"use client";
import { useState } from "react";
import { deletePost } from "../lib/supabase/client";
import Link from "next/link";

export default function AdminPostList({ posts }: { readonly posts: any[] }) {
  const [postList, setPostList] = useState(posts);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this post? This cannot be undone.")) return;
    setDeleting(id);
    await deletePost(id);
    setPostList((prev) => prev.filter((p) => p.id !== id));
    setDeleting(null);
  };

  if (postList.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 rounded-2xl text-sm t-muted"
        style={{ border: "1px dashed var(--border-input)" }}
      >
        <p className="mb-3">No posts yet.</p>
        <Link href="/admin/new" className="btn-primary text-sm">Create your first post</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {postList.map((post) => (
        <div
          key={post.id}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-2xl"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div className="min-w-0">
            <div className="font-bold text-sm truncate t-heading">{post.title}</div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono truncate t-muted">/{post.slug}</span>
              <span
                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={
                  post.published
                    ? { background: "rgba(34,197,94,0.12)", color: "var(--success)", border: "1px solid rgba(34,197,94,0.2)" }
                    : { background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-glow)" }
                }
              >
                {post.published ? "Published" : "Draft"}
              </span>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0 items-center">
            <Link
              href={`/admin/edit/${post.slug}`}
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
              style={{ background: "var(--accent-dim)", color: "var(--accent)", border: "1px solid var(--accent-glow)" }}
            >
              Edit
            </Link>
            <button
              className="text-xs font-semibold px-3 py-1.5 rounded-full transition-colors disabled:opacity-40"
              style={{ background: "rgba(239,68,68,0.08)", color: "var(--danger)", border: "1px solid rgba(239,68,68,0.15)" }}
              onClick={() => handleDelete(post.id)}
              disabled={deleting === post.id}
            >
              {deleting === post.id ? "…" : "Delete"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
