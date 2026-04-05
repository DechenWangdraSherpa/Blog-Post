import { createBrowserClient } from "@supabase/ssr";
import { useState, useEffect } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

export function useSession() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return { session };
}

// Ensure a profile row exists for the current user.
// Called before any write that references profiles(id) via FK.
// Safe to call every time — uses ON CONFLICT DO NOTHING.
export async function ensureProfile(userId: string, email: string, username?: string) {
  await supabase
    .from("profiles")
    .upsert(
      { id: userId, username: username || email.split("@")[0] },
      { onConflict: "id", ignoreDuplicates: true }
    );
}

// Comment helpers
export async function addComment(postId: string, body: string, userId: string) {
  const { data, error } = await supabase
    .from("comments")
    .insert({ post_id: postId, body, user_id: userId })
    .select()
    .single();
  return { data, error };
}

export async function deleteComment(commentId: string) {
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);
  return { error };
}

// Like helpers
export async function getLikeState(postId: string, userId: string) {
  const { data } = await supabase
    .from("likes")
    .select("*")
    .eq("post_id", postId)
    .eq("user_id", userId)
    .single();
  return !!data;
}

export async function getLikeCount(postId: string) {
  const { count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);
  return count || 0;
}

export async function likePost(postId: string, userId: string) {
  const { error } = await supabase
    .from("likes")
    .insert({ post_id: postId, user_id: userId });
  return { error };
}

export async function unlikePost(postId: string, userId: string) {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("post_id", postId)
    .eq("user_id", userId);
  return { error };
}

// Post helpers (for create/update/delete)
export async function createPost(post: any) {
  const { data, error } = await supabase
    .from("posts")
    .insert(post)
    .select()
    .single();
  return { data, error };
}

export async function updatePost(id: string, post: any) {
  const { data, error } = await supabase
    .from("posts")
    .update(post)
    .eq("id", id)
    .select()
    .single();
  return { data, error };
}

export async function deletePost(id: string) {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  return { error };
}

// Image upload helper
export async function uploadImage(file: File) {
  const filePath = `${Date.now()}-${file.name}`;
  const { error } = await supabase.storage
    .from("blog-images")
    .upload(filePath, file);
  if (error) return { url: null, error };
  const { data: urlData } = supabase.storage
    .from("blog-images")
    .getPublicUrl(filePath);
  return { url: urlData.publicUrl, error: null };
}
