
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DeleteProjectButton from "@/components/delete-project-button";

async function ProjectsManager() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  if (
    !user ||
    !adminEmail ||
    user.email?.toLowerCase() !== adminEmail
  ) {
    redirect("/");
  }

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-[#10110f] px-6 py-12 text-white">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="text-sm text-[#c5f467] hover:underline"
        >
          ← Back to dashboard
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-[#c5f467]">MANAN / ADMIN</p>
            <h1 className="mt-2 text-4xl font-bold">Projects</h1>
            <p className="mt-2 text-white/50">
              Manage the projects displayed on your portfolio.
            </p>
          </div>

          <Link
            href="/admin/projects/new"
            className="rounded-lg bg-[#c5f467] px-5 py-3 font-semibold text-black hover:bg-[#d5ff7a]"
          >
            + Add project
          </Link>
        </div>

        {error ? (
          <p className="mt-10 rounded-lg border border-red-500/30 p-5 text-red-300">
            Could not load projects: {error.message}
          </p>
        ) : (projects ?? []).length === 0 ? (
          <div className="mt-10 rounded-xl border border-white/10 p-10 text-center">
            <h2 className="text-xl font-semibold">No projects yet</h2>
            <p className="mt-2 text-sm text-white/50">
              Add your first project to get started.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-3">
            {(projects ?? []).map((project) => (
              <div
                key={project.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 p-5"
              >
                <div>
                  <h2 className="font-semibold">{project.title}</h2>
                  <p className="mt-1 text-sm text-white/50">
                    {project.published ? "Published" : "Draft"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xs text-white/40">
                    {project.technologies?.join(" · ") || "No technologies added"}
                  </span>

                  <Link
                    href={`/projects/${project.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
                    target="_blank"
                    className="rounded-lg border border-white/15 px-4 py-2 text-sm transition-colors hover:border-[#c5f467] hover:text-[#c5f467]"
                  >
                    Preview ↗
                  </Link>

                  <Link
                    href={`/admin/projects/${project.id}`}
                    className="rounded-lg border border-white/15 px-4 py-2 text-sm transition-colors hover:border-[#c5f467] hover:text-[#c5f467]"
                  >
                    Edit
                  </Link>

                  <DeleteProjectButton id={project.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#10110f] p-10 text-white">
          Loading projects...
        </main>
      }
    >
      <ProjectsManager />
    </Suspense>
  );
}
