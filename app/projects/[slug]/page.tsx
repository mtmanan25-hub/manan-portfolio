import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GitHubProjectStats from "@/components/github-project-stats";

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

async function getProject(slug: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true);

  return ((data ?? []) as Project[]).find(
    (project) => slugify(project.title) === slug
  ) ?? null;
}

export async function generateStaticParams() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("projects")
    .select("title")
    .eq("published", true);

  return (data ?? []).map((project) => ({
    slug: slugify(project.title),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    return {
      title: "Project not found | Manan Khatri",
    };
  }

  return {
    title: project.title,
    description: project.description ?? "Project by Manan Khatri.",
    openGraph: {
      title: project.title,
      description: project.description ?? "Project by Manan Khatri.",
      images: project.image_url ? [project.image_url] : undefined,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProject(slug);

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 lg:px-10">
          <Link href="/" className="text-sm font-semibold tracking-[0.18em] hover:text-[var(--accent)]">
            MANAN.
          </Link>
          <Link href="/projects" className="text-sm text-[var(--muted)] hover:text-[var(--foreground)]">
            ← All projects
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-5xl px-6 py-16 lg:px-10 lg:py-24">
        <div className="max-w-3xl">
          {project.featured && (
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
              Featured project
            </p>
          )}

          <h1 className="mt-3 text-5xl font-semibold tracking-[-0.045em] sm:text-6xl">
            {project.title}
          </h1>

          {project.description && (
            <p className="mt-7 text-lg leading-8 text-[var(--muted)]">
              {project.description}
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {project.live_url && (
              <a
                href={project.live_url}
                target="_blank"
                rel="noreferrer"
                className="border border-[var(--accent)] bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-[var(--background)] transition hover:bg-transparent hover:text-[var(--accent)]"
              >
                Open live project ↗
              </a>
            )}

            {project.github_url && (
              <a
                href={project.github_url}
                target="_blank"
                rel="noreferrer"
                className="border border-[var(--border)] px-5 py-3 text-sm font-medium hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                View source on GitHub ↗
              </a>
            )}
          </div>
        </div>

        {project.image_url && (
          <div className="mt-14 overflow-hidden border border-[var(--border)]">
            <img
              src={project.image_url}
              alt={project.title}
              className="max-h-[650px] w-full object-cover"
            />
          </div>
        )}

        <div className="mt-14 grid gap-10 md:grid-cols-[1fr_280px]">
          <section>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
              About the project
            </p>
            <div className="mt-5 whitespace-pre-wrap text-base leading-8 text-[var(--muted)]">
              {project.description || "No project description has been added yet."}
            </div>
          </section>

          <aside className="border-t border-[var(--border)] pt-6 md:border-l md:border-t-0 md:pl-7">
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
              Built with
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(project.technologies ?? []).map((technology) => (
                <span
                  key={technology}
                  className="border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)]"
                >
                  {technology}
                </span>
              ))}
            </div>
          </aside>
        </div>

        {project.github_url && (
          <GitHubProjectStats githubUrl={project.github_url} />
        )}
      </article>
    </main>
  );
}
