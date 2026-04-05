"use client";
import { useState, useEffect, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { slugify } from "../lib/utils";
import { uploadImage, createPost, updatePost } from "../lib/supabase/client";
import { useRouter } from "next/navigation";

// ─── Toolbar button ──────────────────────────────────────
function TB({
  onClick, active, title, children,
}: {
  onClick: () => void; active?: boolean; title: string; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="px-2.5 py-1 rounded-lg text-xs font-bold transition-all"
      style={{
        background: active ? "var(--accent)" : "var(--surface-alt)",
        color: active ? "#fff" : "var(--text-muted)",
        border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      }}
    >
      {children}
    </button>
  );
}

// ─── Section label ───────────────────────────────────────
function Label({ children }: { children: React.ReactNode }) {
  return (
    <label
      className="block text-xs font-semibold uppercase tracking-wider mb-2"
      style={{ color: "#8A8A9A" }}
    >
      {children}
    </label>
  );
}

// ─── Glass panel ─────────────────────────────────────────
function Panel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Convert markdown to HTML (using markdown-it if available) ──
function mdToHtml(md: string): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const MarkdownIt = require("markdown-it");
    const mdi = new MarkdownIt({ html: false, linkify: true, typographer: true });
    return mdi.render(md);
  } catch {
    // Fallback: return as preformatted text
    return `<pre>${md.replace(/</g, "&lt;")}</pre>`;
  }
}

export default function PostEditor({
  mode,
  post,
}: {
  readonly mode: "create" | "edit";
  readonly post?: any;
}) {
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [coverImage, setCoverImage] = useState(post?.cover_image_url || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [published, setPublished] = useState(post?.published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [slugManual, setSlugManual] = useState(false);

  // Content mode: "rich" | "markdown"
  const [contentMode, setContentMode] = useState<"rich" | "markdown">("rich");
  const [markdownText, setMarkdownText] = useState("");
  const [showMdPreview, setShowMdPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: post?.content || "<p></p>",
  });

  useEffect(() => {
    if (!slugManual) setSlug(slugify(title));
  }, [title, slugManual]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    const { url, error } = await uploadImage(file);
    if (url) setCoverImage(url);
    if (error) setError(String(error));
    setLoading(false);
    // reset input so same file can be re-selected
    e.target.value = "";
  };

  const getContent = (): string => {
    if (contentMode === "markdown") return mdToHtml(markdownText);
    return editor?.getHTML() || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const postData = {
      title,
      slug,
      cover_image_url: coverImage || null,
      content: getContent(),
      excerpt,
      published,
    };
    const result = mode === "create"
      ? await createPost(postData)
      : await updatePost(post!.id, postData);
    setLoading(false);
    if (result?.error) {
      setError(result.error.message ?? "An error occurred");
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* Title */}
      <div>
        <Label>Title</Label>
        <input
          className="input-dark"
          placeholder="Post title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      {/* Slug */}
      <div>
        <Label>Slug</Label>
        <input
          className="input-dark font-mono"
          placeholder="post-slug"
          value={slug}
          onChange={(e) => { setSlugManual(true); setSlug(e.target.value); }}
          required
        />
      </div>

      {/* Excerpt */}
      <div>
        <Label>Excerpt</Label>
        <textarea
          className="input-dark resize-none"
          style={{ borderRadius: 10 }}
          placeholder="Short summary…"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
        />
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setPublished((v: boolean) => !v)}
          className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
          style={{ background: published ? "var(--accent)" : "var(--surface-alt)", border: "1px solid var(--border-input)" }}
        >
          <span
            className="inline-block h-4 w-4 rounded-full bg-white transition-transform"
            style={{ transform: published ? "translateX(22px)" : "translateX(4px)" }}
          />
        </button>
        <span className="text-sm font-semibold" style={{ color: published ? "var(--accent)" : "var(--text-muted)" }}>
          {published ? "Published" : "Draft"}
        </span>
      </div>

      {/* Cover image upload */}
      <div>
        <Label>Cover Image</Label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleImageUpload}
        />
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          {coverImage ? "Change Cover Image" : "Upload Cover Image"}
        </button>
        {coverImage && (
          <div className="mt-3 relative inline-block">
            <img
              src={coverImage}
              alt="cover preview"
              className="object-cover"
              style={{ maxHeight: 140, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}
            />
            <button
              type="button"
              onClick={() => setCoverImage("")}
              className="absolute top-1.5 right-1.5 text-xs font-bold rounded-full px-2 py-0.5"
              style={{ background: "rgba(0,0,0,0.7)", color: "#f87171" }}
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Content section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
          <Label>Content</Label>
          {/* Mode toggle */}
          <div
            className="flex items-center rounded-full p-0.5 text-xs font-semibold"
            style={{ background: "var(--surface-alt)", border: "1px solid var(--border)" }}
          >
            <button
              type="button"
              onClick={() => { setContentMode("rich"); setShowMdPreview(false); }}
              className="px-3 py-1 rounded-full transition-all"
              style={{
                background: contentMode === "rich" ? "var(--accent)" : "transparent",
                color: contentMode === "rich" ? "#fff" : "var(--text-muted)",
              }}
            >
              Rich Text
            </button>
            <button
              type="button"
              onClick={() => setContentMode("markdown")}
              className="px-3 py-1 rounded-full transition-all"
              style={{
                background: contentMode === "markdown" ? "var(--accent)" : "transparent",
                color: contentMode === "markdown" ? "#fff" : "var(--text-muted)",
              }}
            >
              Markdown
            </button>
          </div>
        </div>

        {/* Rich Text editor */}
        {contentMode === "rich" && editor && (
          <Panel>
            {/* Toolbar */}
            <div
              className="flex flex-wrap gap-1.5 p-3"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <TB onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold">B</TB>
              <TB onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><em>I</em></TB>
              <TB onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strike"><s>S</s></TB>
              <div style={{ width: 1, background: "var(--border)", margin: "0 2px" }} />
              <TB onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive("heading", { level: 1 })} title="H1">H1</TB>
              <TB onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive("heading", { level: 2 })} title="H2">H2</TB>
              <TB onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive("heading", { level: 3 })} title="H3">H3</TB>
              <div style={{ width: 1, background: "var(--border)", margin: "0 2px" }} />
              <TB onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list">• List</TB>
              <TB onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list">1. List</TB>
              <TB onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote">❝</TB>
              <TB onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive("code")} title="Inline code">{"`code`"}</TB>
              <TB onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block">{"{ }"}</TB>
            </div>
            <EditorContent
              editor={editor}
              className="p-4"
              style={{ minHeight: 280 }}
            />
          </Panel>
        )}

        {/* Markdown editor */}
        {contentMode === "markdown" && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={() => setShowMdPreview(false)}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
                style={{
                  background: !showMdPreview ? "var(--accent)" : "var(--surface-alt)",
                  color: !showMdPreview ? "#fff" : "var(--text-muted)",
                  border: `1px solid ${!showMdPreview ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                Write
              </button>
              <button
                type="button"
                onClick={() => setShowMdPreview(true)}
                className="text-xs font-semibold px-3 py-1 rounded-full transition-all"
                style={{
                  background: showMdPreview ? "var(--accent)" : "var(--surface-alt)",
                  color: showMdPreview ? "#fff" : "var(--text-muted)",
                  border: `1px solid ${showMdPreview ? "var(--accent)" : "var(--border)"}`,
                }}
              >
                Preview
              </button>
              <span className="text-xs ml-auto" style={{ color: "#8A8A9A" }}>
                Markdown supported
              </span>
            </div>

            {!showMdPreview ? (
              <textarea
                className="input-dark font-mono resize-none"
                style={{ minHeight: 320, borderRadius: 14, lineHeight: 1.7, fontSize: "0.875rem" }}
                value={markdownText}
                onChange={(e) => setMarkdownText(e.target.value)}
                placeholder={`# Title\n\nWrite your post in **Markdown**...\n\n- List item\n- Another item\n\n> Blockquote\n\n\`\`\`js\nconsole.log('code block')\n\`\`\``}
              />
            ) : (
              <Panel style={{ padding: "1rem 1.25rem", minHeight: 320 }}>
                {markdownText.trim() ? (
                  <div
                    className="md-preview"
                    dangerouslySetInnerHTML={{ __html: mdToHtml(markdownText) }}
                  />
                ) : (
                  <p className="text-sm" style={{ color: "#8A8A9A" }}>
                    Nothing to preview yet. Switch to Write and add some Markdown.
                  </p>
                )}
              </Panel>
            )}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div
          className="text-sm rounded-xl px-4 py-3"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}
        >
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          className="btn-primary"
          disabled={loading}
        >
          {loading
            ? mode === "create" ? "Creating…" : "Saving…"
            : mode === "create" ? "Publish Post" : "Save Changes"}
        </button>
        <a
          href="/admin"
          className="text-sm font-semibold"
          style={{ color: "#8A8A9A" }}
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
