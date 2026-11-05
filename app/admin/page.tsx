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
      detail: "Published projects",
      href: "/admin/projects",
    },
    {
      label: "Skills",
      count: skillsResult.count ?? 0,
      detail: "Technical skills",
      href: "/admin/skills",
    },
    {
      label: "Education",
      count: educationResult.count ?? 0,
      detail: "Education records",
      href: "/admin/education",
    },
    {
      label: "Messages",
      count: messagesResult.count ?? 0,
      detail: "Unread messages",
      href: "/admin/messages",
    },
  ];

  const management = [
    {
      number: "01",
      name: "Projects",
      description: "Create and manage the projects shown on your portfolio.",
      href: "/admin/projects",
      icon: "↗",
    },
    {
      number: "02",
      name: "Skills",
      description: "Manage programming languages, tools and technologies.",
      href: "/admin/skills",
      icon: "⌘",
    },
    {
      number: "03",
      name: "Social links",
      description: "Control the social platforms displayed on your website.",
      href: "/admin/socials",
      icon: "◎",
    },
    {
      number: "04",
      name: "Education",
      description: "Add and manage your education and achievements.",
      href: "/admin/education",
      icon: "◇",
    },
    {
      number: "05",
      name: "Messages",
      description: "Read messages submitted through your contact form.",
      href: "/admin/messages",
      icon: "□",
    },
    {
      number: "06",
      name: "Profile",
      description: "Update your bio, profile details and profile picture.",
      href: "/admin/profile",
      icon: "○",
    },
  ];

  return (
    <main className="min-h-screen bg-[#0a0b09] text-[#f4f5ef]">
      <div className="flex min-h-screen">

        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-white/[0.08] bg-[#0d0e0c] lg:flex lg:flex-col">

          <div className="border-b border-white/[0.08] px-6 py-6">
            <a href="/" className="group inline-block">
              <p className="text-[11px] font-semibold tracking-[0.28em] text-[#c5f467]">
                MANAN
              </p>

              <p className="mt-1 text-xs tracking-wide text-white/35">
                CONTROL PANEL
              </p>
            </a>
          </div>

          <nav className="flex-1 px-3 py-6">

            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
              Overview
            </p>

            <a
              href="/admin"
              className="flex items-center gap-3 border-l-2 border-[#c5f467] bg-[#c5f467]/[0.06] px-3 py-2.5 text-sm text-[#c5f467]"
            >
              <span className="text-base">⌂</span>
              Dashboard
            </a>

            <p className="mt-8 px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
              Content
            </p>

            <div className="space-y-1">
              {[
                ["Projects", "/admin/projects", "↗"],
                ["Skills", "/admin/skills", "⌘"],
                ["Social links", "/admin/socials", "◎"],
                ["Education", "/admin/education", "◇"],
                ["Profile", "/admin/profile", "○"],
              ].map(([name, href, icon]) => (
                <a
                  key={name}
                  href={href}
                  className="group flex items-center gap-3 border-l-2 border-transparent px-3 py-2.5 text-sm text-white/50 transition-colors hover:border-white/20 hover:bg-white/[0.025] hover:text-white"
                >
                  <span className="w-5 text-center text-sm text-white/30 transition-colors group-hover:text-[#c5f467]">
                    {icon}
                  </span>

                  {name}
                </a>
              ))}
            </div>

            <p className="mt-8 px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/25">
              Communication
            </p>

            <a
              href="/admin/messages"
              className="group flex items-center justify-between border-l-2 border-transparent px-3 py-2.5 text-sm text-white/50 transition-colors hover:border-white/20 hover:bg-white/[0.025] hover:text-white"
            >
              <span className="flex items-center gap-3">
                <span className="w-5 text-center text-sm text-white/30">
                  □
                </span>
                Messages
              </span>

              {messagesResult.count && messagesResult.count > 0 ? (
                <span className="min-w-5 bg-[#c5f467] px-1.5 py-0.5 text-center text-[10px] font-bold text-[#0a0b09]">
                  {messagesResult.count}
                </span>
              ) : null}
            </a>
          </nav>

          <div className="border-t border-white/[0.08] p-4">

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="mb-2 flex items-center gap-3 px-3 py-2.5 text-sm text-white/45 transition hover:text-[#c5f467]"
            >
              <span>↗</span>
              View website
            </a>

            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm text-white/35 transition hover:text-red-300"
              >
                <span>→</span>
                Sign out
              </button>
            </form>
          </div>
        </aside>

        {/* MAIN */}
        <section className="min-w-0 flex-1">

          {/* TOP BAR */}
          <header className="flex min-h-20 items-center justify-between border-b border-white/[0.08] px-5 sm:px-8 lg:px-10">

            <div className="flex items-center gap-3">
              <span className="h-2 w-2 bg-[#c5f467]" />

              <span className="text-xs font-medium tracking-[0.16em] text-white/40">
                ADMIN / DASHBOARD
              </span>
            </div>

            <div className="flex items-center gap-4">
              <span className="hidden text-xs text-white/30 sm:block">
                {user.email}
              </span>

              <div className="flex h-8 w-8 items-center justify-center border border-white/10 text-xs text-[#c5f467]">
                M
              </div>
            </div>
          </header>

          {/* CONTENT */}
          <div className="mx-auto max-w-[1400px] px-5 py-8 sm:px-8 sm:py-10 lg:px-10">

            {/* HERO */}
            <section className="border-b border-white/[0.08] pb-10">

              <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">

                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[#c5f467]">
                    Overview
                  </p>

                  <h1 className="mt-3 text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
                    Good to see you<span className="text-[#c5f467]">.</span>
                  </h1>

                  <p className="mt-4 max-w-xl text-sm leading-6 text-white/40">
                    Manage your portfolio, content and incoming messages
                    from one place.
                  </p>
                </div>

                <div className="flex gap-2">
                  <a
                    href="/admin/projects/new"
                    className="border border-[#c5f467] bg-[#c5f467] px-4 py-2.5 text-sm font-medium text-[#0a0b09] transition hover:bg-[#d4ff86]"
                  >
                    + New project
                  </a>

                  <a
                    href="/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-white/10 px-4 py-2.5 text-sm text-white/60 transition hover:border-white/25 hover:text-white"
                  >
                    Preview ↗
                  </a>
                </div>

              </div>
            </section>

            {/* STATS */}
            <section className="border-b border-white/[0.08] py-8">

              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/30">
                    Content overview
                  </p>
                </div>

                <span className="text-[10px] uppercase tracking-[0.16em] text-white/20">
                  Live database
                </span>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4">

                {stats.map((stat, index) => (
                  <a
                    key={stat.label}
                    href={stat.href}
                    className={`group relative border-white/[0.08] p-5 transition-colors hover:bg-white/[0.025] ${
                      index !== 0 ? "border-l" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">

                      <span className="text-sm text-white/40">
                        {stat.label}
                      </span>

                      <span className="text-white/15 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[#c5f467]">
                        ↗
                      </span>

                    </div>

                    <p className="mt-7 text-4xl font-semibold tracking-[-0.04em]">
                      {stat.count}
                    </p>

                    <p className="mt-2 text-xs text-white/25">
                      {stat.detail}
                    </p>

                    <div className="absolute bottom-0 left-0 h-px w-0 bg-[#c5f467] transition-all duration-300 group-hover:w-full" />
                  </a>
                ))}

              </div>
            </section>

            {/* MANAGEMENT */}
            <section className="py-10">

              <div className="mb-6 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/30">
                    Content management
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                    Your website
                  </h2>
                </div>

                <span className="hidden text-xs text-white/20 sm:block">
                  06 sections
                </span>
              </div>

              <div className="grid border border-white/[0.08] sm:grid-cols-2 lg:grid-cols-3">

                {management.map((item, index) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`group relative min-h-[190px] border-white/[0.08] p-6 transition-all duration-300 hover:bg-white/[0.025] ${
                      index % 3 !== 0 ? "lg:border-l" : ""
                    } ${
                      index >= 3 ? "border-t" : ""
                    } ${
                      index % 2 !== 0 ? "sm:border-l lg:border-l" : ""
                    }`}
                  >

                    <div className="flex items-start justify-between">

                      <span className="text-[11px] font-medium tracking-[0.15em] text-white/20">
                        {item.number}
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center border border-white/10 text-sm text-white/25 transition-all group-hover:border-[#c5f467]/50 group-hover:text-[#c5f467]">
                        {item.icon}
                      </span>

                    </div>

                    <div className="mt-12">

                      <h3 className="text-lg font-semibold tracking-tight transition-colors group-hover:text-[#c5f467]">
                        {item.name}
                      </h3>

                      <p className="mt-2 max-w-xs text-sm leading-6 text-white/35">
                        {item.description}
                      </p>

                    </div>

                    <span className="absolute bottom-6 right-6 text-white/15 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#c5f467]">
                      ↗
                    </span>

                  </a>
                ))}

              </div>
            </section>

            {/* QUICK ACTIONS */}
            <section className="border-t border-white/[0.08] py-8">

              <p className="mb-5 text-xs uppercase tracking-[0.18em] text-white/30">
                Quick actions
              </p>

              <div className="flex flex-wrap gap-2">

                <a
                  href="/admin/projects/new"
                  className="border border-white/10 px-4 py-2.5 text-sm text-white/55 transition hover:border-[#c5f467]/50 hover:text-[#c5f467]"
                >
                  Create project
                </a>

                <a
                  href="/admin/profile"
                  className="border border-white/10 px-4 py-2.5 text-sm text-white/55 transition hover:border-[#c5f467]/50 hover:text-[#c5f467]"
                >
                  Edit profile
                </a>

                <a
                  href="/admin/socials"
                  className="border border-white/10 px-4 py-2.5 text-sm text-white/55 transition hover:border-[#c5f467]/50 hover:text-[#c5f467]"
                >
                  Manage socials
                </a>

                <a
                  href="/admin/messages"
                  className="border border-white/10 px-4 py-2.5 text-sm text-white/55 transition hover:border-[#c5f467]/50 hover:text-[#c5f467]"
                >
                  Open inbox
                </a>

              </div>
            </section>

            {/* FOOTER */}
            <footer className="flex flex-col gap-2 border-t border-white/[0.08] pt-6 text-[11px] text-white/20 sm:flex-row sm:items-center sm:justify-between">
              <span>Portfolio Control Panel</span>
              <span>manankhatri.xyz</span>
            </footer>

          </div>
        </section>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#0a0b09] text-sm text-white/40">
          Loading dashboard...
        </main>
      }
    >
      <AdminDashboard />
    </Suspense>
  );
}