
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Skill = {
  id: string;
  name: string;
  category: string;
  proficiency: string | null;
  display_order: number;
  published: boolean;
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Frontend");
  const [proficiency, setProficiency] = useState("Beginner");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const supabase = createClient();

  async function loadSkills() {
    setLoading(true);

    const { data, error } = await supabase
      .from("skills")
      .select("*")
      .order("display_order", { ascending: true })
      .order("name", { ascending: true });

    if (error) {
      setError(error.message);
    } else {
      setSkills(data ?? []);
      setError("");
    }

    setLoading(false);
  }

  useEffect(() => {
    loadSkills();
  }, []);

  async function addSkill(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");

    const { error } = await supabase.from("skills").insert({
      name: name.trim(),
      category,
      proficiency: proficiency || null,
      display_order: Number(displayOrder) || 0,
      published,
    });

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    setName("");
    setDisplayOrder("0");
    setPublished(true);
    await loadSkills();
  }

  async function togglePublished(skill: Skill) {
    const { error } = await supabase
      .from("skills")
      .update({ published: !skill.published })
      .eq("id", skill.id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadSkills();
  }

  async function deleteSkill(id: string) {
    if (!window.confirm("Delete this skill?")) return;

    const { error } = await supabase
      .from("skills")
      .delete()
      .eq("id", id);

    if (error) {
      setError(error.message);
      return;
    }

    await loadSkills();
  }

  const inputClass =
    "w-full rounded-lg border border-white/10 bg-[#181916] px-4 py-3 text-white outline-none focus:border-[#c5f467]";

  return (
    <main className="min-h-screen bg-[#10110f] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="text-sm text-[#c5f467] hover:underline"
        >
          ← Back to dashboard
        </Link>

        <p className="mt-8 text-sm text-[#c5f467]">MANAN / ADMIN</p>
        <h1 className="mt-2 text-4xl font-bold">Skills Manager</h1>
        <p className="mt-2 text-white/50">
          Add and manage the skills displayed on your portfolio.
        </p>

        <form
          onSubmit={addSkill}
          className="mt-10 space-y-5 rounded-xl border border-white/10 p-6"
        >
          <h2 className="text-xl font-semibold">Add a skill</h2>

          <div>
            <label className="mb-2 block text-sm">Skill name *</label>
            <input
              className={inputClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="JavaScript"
              required
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm">Category</label>
              <select
                className={inputClass}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option>Frontend</option>
                <option>Backend</option>
                <option>Languages</option>
                <option>Tools</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm">Proficiency</label>
              <select
                className={inputClass}
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
                <option value="">Not specified</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm">Display order</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(e.target.value)}
            />
            <p className="mt-1 text-xs text-white/40">
              Lower numbers appear first.
            </p>
          </div>

          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="accent-[#c5f467]"
            />
            Show this skill on my portfolio
          </label>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#c5f467] px-5 py-3 font-semibold text-black hover:bg-[#d5ff7a] disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add skill"}
          </button>
        </form>

        {error && (
          <p className="mt-6 rounded-lg border border-red-500/30 p-4 text-sm text-red-300">
            {error}
          </p>
        )}

        <section className="mt-12">
          <h2 className="text-2xl font-semibold">Your skills</h2>

          {loading ? (
            <p className="mt-5 text-white/50">Loading skills...</p>
          ) : skills.length === 0 ? (
            <p className="mt-5 rounded-xl border border-white/10 p-8 text-center text-white/50">
              No skills added yet.
            </p>
          ) : (
            <div className="mt-5 space-y-3">
              {skills.map((skill) => (
                <div
                  key={skill.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 p-5"
                >
                  <div>
                    <h3 className="font-semibold">{skill.name}</h3>
                    <p className="mt-1 text-sm text-white/50">
                      {skill.category} · {skill.proficiency || "No level specified"} · Order {skill.display_order}
                    </p>
                    <p className="mt-1 text-xs text-white/40">
                      {skill.published ? "Published" : "Hidden"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => togglePublished(skill)}
                      className="rounded-lg border border-white/15 px-3 py-2 text-sm hover:border-[#c5f467] hover:text-[#c5f467]"
                    >
                      {skill.published ? "Hide" : "Publish"}
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteSkill(skill.id)}
                      className="rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:border-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
