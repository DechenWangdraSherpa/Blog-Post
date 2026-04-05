"use client";
import { useSession, getLikeState, getLikeCount, likePost, unlikePost, ensureProfile } from "../lib/supabase/client";
import { useState, useEffect } from "react";

export default function LikeButton({ postId }: { readonly postId: string }) {
  const { session } = useSession();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [likeError, setLikeError] = useState("");

  useEffect(() => {
    getLikeCount(postId).then(setCount);
    if (session) getLikeState(postId, session.user.id).then(setLiked);
  }, [postId, session]);

  const handleClick = async () => {
    if (!session) {
      globalThis.location.href = "/auth/login";
      return;
    }
    setLoading(true);
    setLikeError("");
    await ensureProfile(session.user.id, session.user.email, session.user.user_metadata?.username);
    if (liked) {
      setLiked(false);
      setCount((c) => c - 1);
      const { error } = await unlikePost(postId, session.user.id);
      if (error) {
        console.error("Unlike error:", error);
        setLiked(true);
        setCount((c) => c + 1);
        setLikeError(error.message);
      }
    } else {
      setLiked(true);
      setCount((c) => c + 1);
      const { error } = await likePost(postId, session.user.id);
      if (error) {
        console.error("Like error:", error);
        setLiked(false);
        setCount((c) => c - 1);
        setLikeError(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all"
        style={{
          background: liked ? "rgba(124,92,252,0.18)" : "rgba(255,255,255,0.05)",
          border: `1px solid ${liked ? "rgba(124,92,252,0.4)" : "rgba(255,255,255,0.08)"}`,
          color: liked ? "#7C5CFC" : "#8A8A9A",
          boxShadow: liked ? "0 0 14px rgba(124,92,252,0.2)" : "none",
        }}
        aria-label="Like post"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill={liked ? "#7C5CFC" : "none"}
          stroke={liked ? "#7C5CFC" : "currentColor"}
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 116.364 6.364L12 21.364l-7.682-7.682a4.5 4.5 0 010-6.364z"
          />
        </svg>
        <span>{count}</span>
      </button>
      {likeError && (
        <p className="text-xs" style={{ color: "var(--danger)" }}>{likeError}</p>
      )}
    </div>
  );
}
