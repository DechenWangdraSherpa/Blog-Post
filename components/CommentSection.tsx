"use client";
import { useSession, addComment, deleteComment, ensureProfile } from "../lib/supabase/client";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";

function formatRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}

function InitialAvatar({ username }: { username: string }) {
  return (
    <div
      className="flex-shrink-0 flex items-center justify-center text-xs font-bold select-none"
      style={{
        width: 32, height: 32, borderRadius: "50%",
        background: "linear-gradient(135deg, var(--accent), #22D3EE)",
        color: "#fff",
      }}
    >
      {username?.[0]?.toUpperCase() || "?"}
    </div>
  );
}

export default function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: any[];
}) {
  const { session } = useSession();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin = session?.user?.email === adminEmail;

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const channel = supabase
      .channel(`comments:${postId}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "comments",
        filter: `post_id=eq.${postId}`,
      }, (payload) => {
        setComments((prev) => {
          if (prev.some((c) => c.id === payload.new.id)) return prev;
          // If there's a pending optimistic comment from the same user, replace it
          // instead of appending — prevents duplicates when realtime fires before
          // addComment resolves.
          const tempIdx = prev.findIndex(
            (c) => String(c.id).startsWith("temp-") && c.user_id === payload.new.user_id
          );
          if (tempIdx !== -1) {
            const updated = [...prev];
            updated[tempIdx] = {
              ...payload.new,
              username: prev[tempIdx].username,
              avatar_url: prev[tempIdx].avatar_url,
            };
            return updated;
          }
          return [...prev, payload.new];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !body.trim()) return;
    setLoading(true);
    setSubmitError("");
    await ensureProfile(session.user.id, session.user.email, session.user.user_metadata?.username);
    const optimistic = {
      id: `temp-${Date.now()}`,
      post_id: postId,
      user_id: session.user.id,
      body,
      created_at: new Date().toISOString(),
      username: session.user.user_metadata?.username || session.user.email,
      avatar_url: session.user.user_metadata?.avatar_url,
    };
    setComments((prev) => [...prev, optimistic]);
    setBody("");
    const { data, error } = await addComment(postId, optimistic.body, session.user.id);
    if (!error && data) {
      setComments((prev) => prev.map((c) =>
        c.id === optimistic.id
          ? { ...data, username: session.user.user_metadata?.username || session.user.email, avatar_url: session.user.user_metadata?.avatar_url }
          : c
      ));
    } else {
      console.error("Comment error:", error);
      setComments((prev) => prev.filter((c) => c.id !== optimistic.id));
      setSubmitError(error?.message || "Failed to post comment. Please try again.");
    }
    setLoading(false);
  };

  const handleDelete = async (commentId: string) => {
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    await deleteComment(commentId);
  };

  return (
    <section className="mt-14 pt-8" style={{ borderTop: "1px solid var(--border)" }}>
      <h3 className="font-extrabold text-lg mb-6 tracking-tight t-heading">
        Comments{" "}
        <span className="font-normal text-sm t-muted">({comments.length})</span>
      </h3>

      <div className="space-y-4 mb-8">
        {comments.length === 0 && (
          <p className="text-sm t-muted">No comments yet. Be the first!</p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="flex items-start gap-3 p-4 rounded-2xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            {comment.avatar_url ? (
              <img src={comment.avatar_url} alt="avatar" className="flex-shrink-0 object-cover" style={{ width: 32, height: 32, borderRadius: "50%" }} />
            ) : (
              <InitialAvatar username={comment.username || "?"} />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold t-heading">{comment.username}</span>
                <span className="text-xs t-muted">{formatRelativeTime(comment.created_at)}</span>
              </div>
              <p className="text-sm break-words t-body">{comment.body}</p>
              {(isAdmin || session?.user?.id === comment.user_id) && (
                <button
                  className="text-xs mt-1.5 transition-colors t-muted"
                  style={{ color: "var(--text-muted)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--danger)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {submitError && (
        <p className="text-sm mb-3" style={{ color: "var(--danger)" }}>{submitError}</p>
      )}
      {session ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <textarea
            className="input-dark resize-none"
            style={{ borderRadius: 14, minHeight: 90 }}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment…"
            required
            disabled={loading}
          />
          <div className="flex justify-end">
            <button type="submit" className="btn-primary w-full sm:w-auto" disabled={loading || !body.trim()}>
              {loading ? "Posting…" : "Post Comment"}
            </button>
          </div>
        </form>
      ) : (
        <div
          className="rounded-2xl p-5 text-center text-sm"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <span className="t-muted">
            <a href="/auth/login" style={{ color: "var(--accent)", fontWeight: 600 }}>Log in</a>{" "}
            to leave a comment
          </span>
        </div>
      )}
    </section>
  );
}
