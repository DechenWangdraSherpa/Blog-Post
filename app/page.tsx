import PostCard from "../components/PostCard";
import { getPublishedPosts } from "../lib/supabase/server";
import Image from "next/image";
import HeroCTA from "../components/HeroCTA";

export default async function HomePage() {
  const posts = await getPublishedPosts();

  return (
    <div className="py-8 relative">

      {/* Decorative orbs — hidden automatically in light mode via CSS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="orb orb-purple" style={{ width: 500, height: 500, top: -120, left: -180, opacity: 0.6 }} />
        <div className="orb orb-orange" style={{ width: 320, height: 320, top: 80, right: -120, opacity: 0.5 }} />
        <div className="orb orb-cyan"   style={{ width: 260, height: 260, top: 300, left: "40%", opacity: 0.3 }} />
      </div>

      {/* Hero */}
      <section className="relative z-10 mb-16 pb-12" style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-10 md:gap-8">

          {/* Left: text */}
          <div className="flex-1">
            <p className="t-accent text-xs font-bold tracking-[0.22em] uppercase mb-4">
              Personal Blog
            </p>
            <h1 className="text-5xl md:text-6xl font-black tracking-tight leading-[1.05] mb-5 t-heading">
              Dw4ngSh3rs
              <br />
              <span className="t-accent">Blog</span>
            </h1>
            <p className="text-base md:text-lg max-w-md mb-8 t-muted" style={{ fontStyle: "italic" }}>
              Light from the quiet side — DwangShers
            </p>
            <HeroCTA />
          </div>

          {/* Right: profile image */}
          <div className="flex-shrink-0 flex justify-center md:justify-end">
            <div
              className="profile-ring relative"
              style={{
                borderRadius: "50%",
                padding: 4,
                background: "linear-gradient(135deg, var(--accent) 0%, #22D3EE 50%, #F97316 100%)",
                boxShadow: "0 0 64px var(--accent-glow), 0 0 120px rgba(124,92,252,0.15)",
              }}
            >
              <div style={{ borderRadius: "50%", overflow: "hidden", width: "100%", height: "100%" }}>
                <Image
                  src="/images/profile.jpg"
                  alt="Dw4ngSh3rs"
                  width={280}
                  height={280}
                  className="object-cover profile-img"
                  priority
                />
              </div>
              <div
                className="absolute inset-0 rounded-full"
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.12)", pointerEvents: "none" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Posts grid */}
      <section className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold tracking-tight t-heading">Latest Posts</h2>
          <span className="text-sm t-muted">
            {posts.length} post{posts.length !== 1 ? "s" : ""}
          </span>
        </div>

        {posts.length === 0 ? (
          <div
            className="flex items-center justify-center h-48 rounded-2xl"
            style={{ border: "1px dashed var(--border-input)" }}
          >
            <span className="text-sm t-muted">No posts yet. Check back soon.</span>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
