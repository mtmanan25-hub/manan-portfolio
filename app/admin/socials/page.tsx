
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  display_order: number;
  published: boolean;
};

const platforms = [
  "GitHub",
  "Discord",
  "Instagram",
  "YouTube",
  "Spotify",
  "Twitch",
  "Reddit",
  "X",
  "LinkedIn",
  "Telegram",
  "Other",
];

export default function SocialsManager() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [platform, setPlatform] = useState("GitHub");
  const [url, setUrl] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const supabase = createClient();

  async function loadLinks() {
    const { data, error } = await supabase
      .from("social_links")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: true });

    if (error) {
      setMessage("Could not load social links: " + error.message);
    } else {
      setLinks(data ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadLinks();
  }, []);

  function resetForm() {
    setPlatform("GitHub");
    setUrl("");
    setDisplayOrder("0");
    setEditingId(null);
    setMessage("");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const cleanUrl = url.trim();

    if (!/^https?:\/\/.+/i.test(cleanUrl)) {
      setMessage("Enter a valid URL starting with https://");
      setSaving(false);
      return;
    }

    const values = {
      platform,
      url: cleanUrl,
      display_order: Number(displayOrder) || 0,
    };

    const result = editingId
      ? await supabase
          .from("social_links")
          .update(values)
          .eq("id", editingId)
      : await supabase.from("social_links").insert(values);

    if (result.error) {
      setMessage("Error: " + result.error.message);
    } else {
      setMessage(editingId ? "Social link updated!" : "Social link added!");
      resetForm();
      await loadLinks();
    }

    setSaving(false);
  }

  function startEditing(link: SocialLink) {
    setEditingId(link.id);
    setPlatform(link.platform);
    setUrl(link.url);
    setDisplayOrder(String(link.display_order));
    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function togglePublished(link: SocialLink) {
    const { error } = await supabase
      .from("social_links")
      .update({ published: !link.published })
      .eq("id", link.id);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      await loadLinks();
    }
  }

  async function deleteLink(id: string) {
    if (!confirm("Delete this social link?")) return;

    const { error } = await supabase
      .from("social_links")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage("Error: " + error.message);
    } else {
      setMessage("Social link deleted.");
      await loadLinks();
    }
  }

  return (
    <main className="min-h-screen bg-[#0b0d0b] px-6 py-12 text-white">
      <div className="mx-auto max-w-4xl">
        <a
          href="/admin"
          className="font-mono text-xs text-lime-400 hover:text-white"
        >
          ← BACK TO DASHBOARD
        </a>

        <div className="mb-10 mt-8">
          <p className="font-mono text-xs tracking-widest text-lime-400">
            ADMIN / SOCIALS
          </p>
          <h1 className="mt-3 text-4xl font-semibold">
            Social Links Manager
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Manage the social platforms displayed on your portfolio.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border border-white/10 bg-white/[0.02] p-6"
        >
          <h2 className="text-lg font-medium">
            {editingId ? "Edit social link" : "Add a social link"}
          </h2>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Platform
            </label>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#151815] px-4 py-3 text-sm outline-none focus:border-lime-400"
            >
              {platforms.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Profile URL
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://github.com/username"
              className="w-full rounded-lg border border-white/10 bg-[#151815] px-4 py-3 text-sm outline-none focus:border-lime-400"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-zinc-400">
              Display order
            </label>
            <input
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-[#151815] px-4 py-3 text-sm outline-none focus:border-lime-400"
            />
          </div>

          {message && (
            <p className="text-sm text-lime-400">{message}</p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-lime-400 px-5 py-3 text-sm font-semibold text-black transition hover:bg-lime-300 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update link"
                  : "Add link"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-white/10 px-5 py-3 text-sm text-zinc-300 hover:border-white/30"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="mt-12">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your social links</h2>
            <span className="font-mono text-xs text-zinc-500">
              {links.length} TOTAL
            </span>
          </div>

          {loading ? (
            <p className="text-sm text-zinc-500">Loading links...</p>
          ) : links.length === 0 ? (
            <p className="rounded-xl border border-white/10 p-6 text-sm text-zinc-500">
              No social links added yet.
            </p>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="min-w-0">
                    <h3 className="font-medium">{link.platform}</h3>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block break-all text-xs text-zinc-500 hover:text-lime-400"
                    >
                      {link.url}
                    </a>
                    <p className="mt-2 font-mono text-[10px] text-zinc-600">
                      ORDER: {link.display_order} ·{" "}
                      {link.published ? "PUBLISHED" : "HIDDEN"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startEditing(link)}
                      className="rounded-md border border-white/10 px-3 py-2 text-xs hover:border-lime-400"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => togglePublished(link)}
                      className="rounded-md border border-white/10 px-3 py-2 text-xs hover:border-lime-400"
                    >
                      {link.published ? "Hide" : "Publish"}
                    </button>
                    <button
                      onClick={() => deleteLink(link.id)}
                      className="rounded-md border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:border-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
