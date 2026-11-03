
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const instant = false;

export async function signOutAction() {
  "use server";

  const supabase = await createClient();
  await supabase.auth.signOut();

  redirect("/auth/login");
}

async function AdminDashboard() {
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

  const [
    projectsResult,
    skillsResult,
    educationResult,
    messagesResult,
  ] = await Promise.all([
    supabase
      .from("projects")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("skills")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("education")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("contact_submissions")
      .select("*", { count: "exact", head: true })
      .eq("is_read", false),
  ]);

  const stats = [
    {
      label: "Projects",
      count: projectsResult.count ?? 0,
      detail: "Total projects",
    },
    {
      label: "Skills",
      count: skillsResult.count ?? 0,
      detail: "Listed skills",
    },
    {
      label: "Education",
      count: educationResult.count ?? 0,
      detail: "Records added",
    },
    {
      label: "Messages",
      count: messagesResult.count ?? 0,
      detail: "Unread messages",
    },
  ];

  const items = [
    {
      number: "01",
      name: "Projects",
      description: "Add, edit and publish your work.",
      href: "/admin/projects",
    },
    {
      number: "02",
      name: "Skills",
      description: "Manage your technical skills.",
      href: "/admin/skills",
    },
    {
      number: "03",
      name: "Social links",
      description: "Manage your social profiles.",
      href: "/admin/socials",
    },
    {
      number: "04",
      name: "Education",
      description: "Manage education and achievements.",
      href: "/admin/education",
    },
    {
      number: "05",
      name: "Messages",
      description: "Read and manage contact messages.",
      href: "/admin/messages",
    },
    {
      number: "06",
      name: "Profile",
      description: "Update your profile and picture.",
      href: "/admin/profile",
    },
  ];

  return (
    <main className="min-h-screen bg-[#10110f] px-5 py-10 text-white sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-5 border-b border-white/10 pb-8">
          <div>
            <p className="text-xs font-medium tracking-[0.25em] text-[#c5f467]">
              MANAN / ADMIN
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Dashboard<span className="text-[#c5f467]">.</span>
            </h1>

            <p className="mt-2 text-sm text-white/50">
              Welcome to your portfolio control panel.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/15 px-4 py-2.5 text-sm text-white/80 transition hover:border-[#c5f467] hover:text-[#c5f467]"
            >
              View website ↗
            </a>

            <form action={signOutAction}>
              <button
                type="submit"
                className="border border-red-400/30 px-4 py-2.5 text-sm text-red-300 transition hover:border-red-400 hover:bg-red-400/10"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        {/* Overview */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-sm font-medium text-white/70">
              Overview
            </h2>

            <span className="text-xs text-white/30">
              Database statistics
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="border border-white/10 bg-white/[0.02] p-5 transition-colors hover:border-white/20"
              >
                <p className="text-sm text-white/50">
                  {stat.label}
                </p>

                <p className="mt-3 text-3xl font-semibold tracking-tight">
                  {stat.count}
                </p>

                <p className="mt-1 text-xs text-white/30">
                  {stat.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Management */}
        <section className="mt-14">
          <div className="mb-5">
            <h2 className="text-sm font-medium text-white/70">
              Manage your website
            </h2>

            <p className="mt-1 text-xs text-white/30">
              Select a section to manage its content.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="group border border-white/10 p-6 transition-all duration-200 hover:border-[#c5f467]/50 hover:bg-white/[0.025]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-wider text-white/30">
                    {item.number}
                  </span>

                  <span className="text-white/30 transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#c5f467]">
                    ↗
                  </span>
                </div>

                <h3 className="mt-7 text-xl font-semibold transition-colors group-hover:text-[#c5f467]">
                  {item.name}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/45">
                  {item.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-16 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/30">
          <span>Portfolio Control Panel</span>
          <span>manankhatri.xyz</span>
        </footer>

      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#10110f] p-10 text-white">
          Loading dashboard...
        </main>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}
