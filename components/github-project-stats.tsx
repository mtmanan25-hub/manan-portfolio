"use client";

import { useEffect, useState } from "react";

type Repo = {
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string | null;
  html_url: string;
  updated_at: string;
};

type Props = {
  githubUrl: string;
};

function getRepoPath(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname !== "github.com") return null;

    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;

    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  } catch {
    return null;
  }
}

export default function GitHubProjectStats({ githubUrl }: Props) {
  const [repo, setRepo] = useState<Repo | null>(null);

  useEffect(() => {
    const path = getRepoPath(githubUrl);
    if (!path) return;

    const controller = new AbortController();

    fetch(
      `https://api.github.com/repos/${encodeURIComponent(path.owner)}/${encodeURIComponent(path.repo)}`,
      {
        signal: controller.signal,
        headers: { Accept: "application/vnd.github+json" },
      }
    )
      .then((response) => {
        if (!response.ok) throw new Error("GitHub request failed");
        return response.json();
      })
      .then((data: Repo) => setRepo(data))
      .catch(() => {});

    return () => controller.abort();
  }, [githubUrl]);

  if (!repo) return null;

  return (
    <section className="mt-16 border-t border-[var(--border)] pt-10">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
            GitHub
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Repository activity
          </h2>
        </div>

        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-[var(--muted)] hover:text-[var(--accent)]"
        >
          Open repository ↗
        </a>
      </div>

      <div className="mt-6 grid border border-[var(--border)] sm:grid-cols-4">
        <div className="p-5">
          <p className="text-xs text-[var(--muted)]">Stars</p>
          <p className="mt-2 text-2xl font-semibold">{repo.stargazers_count}</p>
        </div>

        <div className="border-t border-[var(--border)] p-5 sm:border-l sm:border-t-0">
          <p className="text-xs text-[var(--muted)]">Forks</p>
          <p className="mt-2 text-2xl font-semibold">{repo.forks_count}</p>
        </div>

        <div className="border-t border-[var(--border)] p-5 sm:border-l sm:border-t-0">
          <p className="text-xs text-[var(--muted)]">Open issues</p>
          <p className="mt-2 text-2xl font-semibold">{repo.open_issues_count}</p>
        </div>

        <div className="border-t border-[var(--border)] p-5 sm:border-l sm:border-t-0">
          <p className="text-xs text-[var(--muted)]">Language</p>
          <p className="mt-2 text-2xl font-semibold">
            {repo.language || "—"}
          </p>
        </div>
      </div>
    </section>
  );
}
