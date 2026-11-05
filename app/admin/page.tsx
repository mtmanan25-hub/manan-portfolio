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

function getStartOfDay(daysAgo = 0) {
  const date = new Date();

  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);

  return date.toISOString();
}

function getDateLabel(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "short",
  });
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

  /*
   * ---------------------------------------------------------
   * CONTENT COUNTS
   * ---------------------------------------------------------
   */

  const [
    projectsResult,
    skillsResult,
    educationResult,
    messagesResult,
    visitsResult,
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

    supabase
      .from("site_visits")
      .select("visitor_id, created_at, path, device_type")
      .order("created_at", { ascending: false }),
  ]);

  /*
   * ---------------------------------------------------------
   * VISITOR ANALYTICS
   * ---------------------------------------------------------
   */

  const visits = visitsResult.data ?? [];

  const uniqueVisitors = new Set(
    visits
      .map((visit) => visit.visitor_id)
      .filter(Boolean)
  ).size;

  const todayStart = getStartOfDay(0);
  const weekStart = getStartOfDay(6);
  const monthStart = getStartOfDay(29);

  const todayVisitors = new Set(
    visits
      .filter((visit) => visit.created_at >= todayStart)
      .map((visit) => visit.visitor_id)
      .filter(Boolean)
  ).size;

  const weekVisitors = new Set(
    visits
      .filter((visit) => visit.created_at >= weekStart)
      .map((visit) => visit.visitor_id)
      .filter(Boolean)
  ).size;

  const monthVisitors = new Set(
    visits
      .filter((visit) => visit.created_at >= monthStart)
      .map((visit) => visit.visitor_id)
      .filter(Boolean)
  ).size;

  /*
   * Popular pages
   */

  const pageCounts: Record<string, number> = {};

  for (const visit of visits) {
    const path = visit.path || "/";

    pageCounts[path] = (pageCounts[path] || 0) + 1;
  }

  const popularPages = Object.entries(pageCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  /*
   * Device breakdown
   */

  const deviceCounts: Record<string, number> = {
    desktop: 0,
    mobile: 0,
    tablet: 0,
  };

  for (const visit of visits) {
    const device = visit.device_type;

    if (device && device in deviceCounts) {
      deviceCounts[device]++;
    }
  }

  /*
   * 7-day chart
   */

  const chartData = [];

  for (let i = 6; i >= 0; i--) {
    const start = getStartOfDay(i);

    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    endDate.setDate(endDate.getDate() - i + 1);

    const end = endDate.toISOString();

    const dayVisitors = new Set(
      visits
        .filter(
          (visit) =>
            visit.created_at >= start &&
            visit.created_at < end
        )
        .map((visit) => visit.visitor_id)
        .filter(Boolean)
    ).size;

    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - i);

    chartData.push({
      label: getDateLabel(date.toISOString()),
      value: dayVisitors,
    });
  }

  const maxChartValue = Math.max(
    ...chartData.map((day) => day.value),
    1
  );

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
      description:
        "Create and manage the projects shown on your portfolio.",
      href: "/admin/projects",
      icon: "↗",
    },
    {
      number: "02",
      name: "Skills",
      description:
        "Manage programming languages, tools and technologies.",
      href: "/admin/skills",
      icon: "⌘",
    },
    {
      number: "03",
      name: "Social links",
      description:
        "Control the social platforms displayed on your website.",
      href: "/admin/socials",
      icon: "◎",
    },
    {
      number: "04",
      name: "Education",
      description:
        "Add and manage your education and achievements.",
      href: "/admin/education",
      icon: "◇",
    },
    {
      number: "05",
      name: "Messages",
      description:
        "Read messages submitted through your contact form.",
      href: "/admin/messages",
      icon: "□",
    },
    {
      number: "06",
      name: "Profile",
      description:
        "Update your bio, profile details and profile picture.",
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

            {/* CONTENT STATS */}
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

            {/* ANALYTICS */}
            <section className="border-b border-white/[0.08] py-10">

              <div className="mb-7 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-[#c5f467]">
                    Analytics
                  </p>

                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">
                    Visitors
                  </h2>

                  <p className="mt-2 text-sm text-white/35">
                    One visitor is counted once per browser.
                  </p>
                </div>

                <span className="text-xs text-white/25">
                  {uniqueVisitors} total unique visitors
                </span>
              </div>

              {/* VISITOR NUMBERS */}

              <div className="grid border border-white/[0.08] sm:grid-cols-4">

                <div className="p-5">
                  <p className="text-xs text-white/30">
                    Total
                  </p>

                  <p className="mt-3 text-3xl font-semibold">
                    {uniqueVisitors}
                  </p>
                </div>

                <div className="border-t border-white/[0.08] p-5 sm:border-l sm:border-t-0">
                  <p className="text-xs text-white/30">
                    Today
                  </p>

                  <p className="mt-3 text-3xl font-semibold">
                    {todayVisitors}
                  </p>
                </div>

                <div className="border-t border-white/[0.08] p-5 sm:border-l sm:border-t-0">
                  <p className="text-xs text-white/30">
                    Last 7 days
                  </p>

                  <p className="mt-3 text-3xl font-semibold">
                    {weekVisitors}
                  </p>
                </div>

                <div className="border-t border-white/[0.08] p-5 sm:border-l sm:border-t-0">
                  <p className="text-xs text-white/30">
                    Last 30 days
                  </p>

                  <p className="mt-3 text-3xl font-semibold">
                    {monthVisitors}
                  </p>
                </div>

              </div>

              {/* 7 DAY CHART */}

              <div className="mt-6 border border-white/[0.08] p-5 sm:p-7">

                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Visitor activity
                    </p>

                    <p className="mt-1 text-xs text-white/25">
                      Unique visitors over the last 7 days
                    </p>
                  </div>

                  <span className="h-2 w-2 bg-[#c5f467]" />
                </div>

                <div className="flex h-48 items-end gap-2 sm:gap-4">

                  {chartData.map((day) => {
                    const height =
                      day.value === 0
                        ? 3
                        : Math.max(
                            (day.value / maxChartValue) * 100,
                            8
                          );

                    return (
                      <div
                        key={day.label}
                        className="flex h-full flex-1 flex-col items-center justify-end gap-3"
                      >
                        <span className="text-[10px] text-white/30">
                          {day.value}
                        </span>

                        <div className="flex h-full w-full items-end">
                          <div
                            className="w-full bg-[#c5f467] transition-all duration-500"
                            style={{
                              height: `${height}%`,
                              opacity:
                                day.value === 0 ? 0.15 : 0.85,
                            }}
                          />
                        </div>

                        <span className="text-[10px] text-white/25">
                          {day.label}
                        </span>
                      </div>
                    );
                  })}

                </div>
              </div>

              {/* PAGE + DEVICE DATA */}

              <div className="mt-6 grid gap-6 lg:grid-cols-2">

                {/* POPULAR PAGES */}

                <div className="border border-white/[0.08] p-5 sm:p-7">

                  <div className="mb-6">
                    <p className="text-sm font-medium">
                      Popular pages
                    </p>

                    <p className="mt-1 text-xs text-white/25">
                      Pages opened by visitors
                    </p>
                  </div>

                  <div className="space-y-4">

                    {popularPages.length === 0 ? (
                      <p className="text-sm text-white/25">
                        No visitor data yet.
                      </p>
                    ) : (
                      popularPages.map(([path, count], index) => (
                        <div
                          key={path}
                          className="flex items-center gap-4"
                        >
                          <span className="w-5 text-xs text-white/20">
                            0{index + 1}
                          </span>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-4">
                              <span className="truncate text-sm text-white/70">
                                {path}
                              </span>

                              <span className="text-xs text-white/30">
                                {count}
                              </span>
                            </div>

                            <div className="mt-2 h-px bg-white/[0.08]">
                              <div
                                className="h-px bg-[#c5f467]"
                                style={{
                                  width: `${Math.min(
                                    (count /
                                      (popularPages[0]?.[1] || 1)) *
                                      100,
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      ))
                    )}

                  </div>
                </div>

                {/* DEVICES */}

                <div className="border border-white/[0.08] p-5 sm:p-7">

                  <div className="mb-6">
                    <p className="text-sm font-medium">
                      Devices
                    </p>

                    <p className="mt-1 text-xs text-white/25">
                      Visitor device breakdown
                    </p>
                  </div>

                  <div className="space-y-5">

                    {Object.entries(deviceCounts).map(
                      ([device, count]) => {
                        const percentage =
                          visits.length > 0
                            ? Math.round(
                                (count / visits.length) * 100
                              )
                            : 0;

                        return (
                          <div key={device}>

                            <div className="mb-2 flex justify-between">
                              <span className="text-sm capitalize text-white/60">
                                {device}
                              </span>

                              <span className="text-xs text-white/30">
                                {percentage}%
                              </span>
                            </div>

                            <div className="h-1 bg-white/[0.08]">
                              <div
                                className="h-1 bg-[#c5f467]"
                                style={{
                                  width: `${percentage}%`,
                                }}
                              />
                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>
                </div>

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
                      index % 2 !== 0
                        ? "sm:border-l lg:border-l"
                        : ""
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