"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

type Project = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  technologies: string[] | null;
  featured: boolean;
  published: boolean;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("featured", { ascending: false })
        .order("created_at", { ascending: false });

      setProjects((data ?? []) as Project[]);
      setLoading(false);
    }

    void load();
  }, []);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="text-sm font-semibold tracking-[0.18em] hover:text-[var(--accent)]">
            MANAN.
          </Link>
          <Link href="/" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← Home
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
        <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
          Projects
        </p>
        <h1 className="mt-4 max-w-4xl text-5xl font-semibold tracking-[-0.04em] sm:text-6xl">
          Things I&apos;ve built.
        </h1>
        <p className="mt-6 max-w-2xl leading-7 text-[var(--muted)]">
          A collection of projects, experiments and things I&apos;ve learned by building.
        </p>

        {loading ? (
          <div className="mt-14 border border-[var(--border)] p-8 text-sm text-[var(--muted)]">
            Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="mt-14 border border-[var(--border)] p-8 text-sm text-[var(--muted)]">
            No published projects yet.
          </div>
        ) : (
          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {projects.map((project, index) => (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.15 }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
                className="group border border-[var(--border)] bg-[var(--surface)]"
              >
                {project.image_url && (
                  <Link href={"/projects/" + slugify(project.title)}>
                    <div className="aspect-video overflow-hidden border-b border-[var(--border)]">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  </Link>
                )}

                <div className="p-7">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-2xl font-semibold">{project.title}</h2>
                    {project.featured && (
                      <span className="shrink-0 text-[10px] uppercase tracking-[0.16em] text-[var(--accent)]">
                        Featured
                      </span>
                    )}
                  </div>

                  {project.description && (
                    <p className="mt-4 line-clamp-3 leading-7 text-[var(--muted)]">
                      {project.description}
                    </p>
                  )}

                  {project.technologies?.length ? (
                    <div className="mt-6 flex flex-wrap gap-2">
                      {project.technologies.map((technology) => (
                        <span
                          key={technology}
                          className="border border-[var(--border)] px-3 py-1 text-xs text-[var(--muted)]"
                        >
                          {technology}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  <div className="mt-7 flex flex-wrap gap-5 text-sm">
                    <Link
                      href={"/projects/" + slugify(project.title)}
                      className="font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
                    >
                      View case study →
                    </Link>

                    {project.live_url && (
                      <a
                        href={project.live_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        Live site ↗
                      </a>
                    )}

                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--muted)] hover:text-[var(--foreground)]"
                      >
                        GitHub ↗
                      </a>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
