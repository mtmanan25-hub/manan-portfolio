
"use client";

import { Suspense, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import ProjectImageUpload from "@/components/project-image-upload";

type Project = {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  technologies: string[] | null;
  live_url: string | null;
  github_url: string | null;
  featured: boolean;
  published: boolean;
};

function EditProjectForm() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [liveUrl, setLiveUrl] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProject() {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setProject(data);
      setTitle(data.title);
      setDescription(data.description);
      setImageUrl(data.image_url || "");
      setTechnologies(data.technologies?.join(", ") || "");
      setLiveUrl(data.live_url || "");
      setGithubUrl(data.github_url || "");
      setFeatured(data.featured);
      setPublished(data.published);
      setLoading(false);
    }

    loadProject();
  }, [id]);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();

    const { error } = await supabase
      .from("projects")
      .update({
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
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admin/projects");
    router.refresh();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#181916] px-4 py-3 text-white outline-none focus:border-[#c5f467]";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#10110f] p-10 text-white">
        Loading project...
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen bg-[#10110f] p-10 text-white">
        Project not found. {error}
      </main>
    );
  }

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
        <h1 className="mt-2 text-4xl font-bold">Edit project</h1>
        <p className="mt-2 text-white/50">
          Update your project details.
        </p>

        <form onSubmit={handleUpdate} className="mt-10 space-y-6">
          <div>
            <label className="mb-2 block text-sm">Project title *</label>
            <input
              className={inputClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">Description *</label>
            <textarea
              className={inputClass}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
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
            />
          </div>

          <div>
            <label className="mb-2 block text-sm">GitHub URL</label>
            <input
              className={inputClass}
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
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
            disabled={saving}
            className="w-full rounded-lg bg-[#c5f467] px-5 py-3 font-semibold text-black transition-colors hover:bg-[#d5ff7a] disabled:opacity-50"
          >
            {saving ? "Saving changes..." : "Save changes"}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function EditProjectPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#10110f] p-10 text-white">
          Loading editor...
        </main>
      }
    >
      <EditProjectForm />
    </Suspense>
  );
}
