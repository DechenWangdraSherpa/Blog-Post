import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function getSupabaseServerClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          // Return all cookies as an array of { name, value }
          return cookieStore.getAll().map((cookie: { name: string; value: string }) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookies: Array<{ name: string; value: string; options?: any }>) {
          for (const { name, value, options } of cookies) {
            cookieStore.set(name, value, options);
          }
        },
      },
    }
  );
}

export async function getSession() {
  const supabase = getSupabaseServerClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

export async function getPublishedPosts() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("posts")
    .select(`
      *,
      like_count:likes(count),
      comment_count:comments(count)
    `)
    .eq("published", true)
    .order("created_at", { ascending: false });
  return (data || []).map((post: any) => ({
    ...post,
    like_count: post.like_count?.[0]?.count ?? 0,
    comment_count: post.comment_count?.[0]?.count ?? 0,
  }));
}

export async function getAllPosts() {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getPostBySlug(slug: string) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .single();
  return data;
}

export async function getCommentsByPost(postId: string) {
  const supabase = getSupabaseServerClient();
  const { data } = await supabase
    .from("comments")
    .select("*, profiles(username, avatar_url)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  return (data || []).map((c: any) => ({
    ...c,
    username: c.profiles?.username,
    avatar_url: c.profiles?.avatar_url,
  }));
}