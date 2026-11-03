
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProjectImageUpload from "@/components/project-image-upload";

export default function NewProjectPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase.from("projects").insert({
      title,
      description,
      image_url: imageUrl || null,
      technologies: technologies
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      live_url: liveUrl || null,
      github_url: githubUrl || null,
      featured,
      published,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin/projects");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#181916] px-4 py-3 text-white outline-none focus:border-[#c5f467]";

  return (
    <main className="min-h-screen bg-[#10110f] px-6 py-12 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/admin/projects"
          className="text-sm text-[#c5f467] hover:underline"
        >
          ← Back to projects
        </Link>

        <p className="mt-8 text-sm text-[#c5f467]">MANAN / ADMIN</p>
        <h1 className="mt-2 text-4xl font-bold">Add project</h1>
        <p className="mt-2 text-white/50">
          Add a new project to your portfolio.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-6">
          <div>
            <label className="mb-2 block text-sm">Project title *</label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My awesome project"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Description *</label>
            <textarea
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your project does..."
              rows={5}
              required
            />
          </div>

          <ProjectImageUpload
            currentImage={imageUrl}
            onUpload={(url) => setImageUrl(url)}
          />

          <div>
            <label className="mb-2 block text-sm">
              Technologies (separate with commas)
            </label>
            <input
              className={inputClass}
              value={technologies}
              onChange={(e) => setTechnologies(e.target.value)}
              placeholder="HTML, CSS, JavaScript"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Live website URL</label>
            <input
              className={inputClass}
              type="url"
              value={liveUrl}
              onChange={(e) => setLiveUrl(e.target.value)}
              placeholder="https://myproject.com"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">GitHub URL</label>
            <input
              className={inputClass}
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/username/project"
            />
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="accent-[#c5f467]"
            />
            Feature this project
          </label>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-[#c5f467]"
            />
            Publish this project on my portfolio
          </label>

          {error && (
            <p className="rounded-lg border border-red-500/30 p-4 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#c5f467] px-5 py-3 font-semibold text-black transition-colors hover:bg-[#d5ff7a] disabled:opacity-50"
          >
            {loading ? "Saving project..." : "Save project"}
          </button>
        </form>
      </div>
    </main>
  );
}
