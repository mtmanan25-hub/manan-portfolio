"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  SiDiscord,
  SiGithub,
  SiInstagram,
  SiReddit,
  SiSpotify,
  SiTelegram,
  SiTwitch,
  SiX,
  SiYoutube,
} from "react-icons/si";
import { createClient } from "@/lib/supabase/client";
import ContactForm from "@/components/contact-form";

type Project = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  live_url: string | null;
  github_url: string | null;
  technologies: string[] | null;
  published: boolean;
};

type Skill = {
  id: string;
  name: string;
  category: string | null;
  level: string | null;
  icon: string | null;
};

type SocialLink = {
  id: string;
  platform: string;
  url: string;
  username: string | null;
};

type Education = {
  id: string;
  title: string;
  institution: string | null;
  description: string | null;
  start_year: number | null;
  end_year: number | null;
};

type Profile = {
  id?: string;
  name: string;
  headline: string;
  about: string;
  avatar_url: string | null;
};

const defaultProfile: Profile = {
  name: "Manan Khatri",
  headline: "Class 8 student & programmer",
  about:
    "I'm a Class 8 student and programmer interested in computers, technology, Web3, robotics, and building things with code.",
  avatar_url: null,
};

const defaultSkills: Skill[] = [
  {
    id: "python",
    name: "Python",
    category: "Programming",
    level: "Advanced",
    icon: null,
  },
  {
    id: "go",
    name: "Go",
    category: "Programming",
    level: "Intermediate",
    icon: null,
  },
  {
    id: "web",
    name: "Web Development",
    category: "Development",
    level: "Intermediate",
    icon: null,
  },
  {
    id: "web3",
    name: "Web3",
    category: "Technology",
    level: "Learning",
    icon: null,
  },
];

const defaultEducation: Education[] = [
  {
    id: "achievement",
    title: "3rd Position — Robo War Robotics",
    institution: "Akriti Fest 2026 · Mayo College Girls' School, Ajmer",
    description: null,
    start_year: null,
    end_year: null,
  },
];

const socialIcons: Record<string, React.ReactNode> = {
  github: <SiGithub />,
  discord: <SiDiscord />,
  instagram: <SiInstagram />,
  youtube: <SiYoutube />,
  spotify: <SiSpotify />,
  twitch: <SiTwitch />,
  reddit: <SiReddit />,
  x: <SiX />,
  telegram: <SiTelegram />,
};

const navLinks: [string, string][] = [
  ["About Me", "about-page"],
  ["Skills", "skills"],
  ["Projects", "projects"],
  ["Education", "education"],
  ["Contact", "contact"],
];

export default function Home() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<Skill[]>(defaultSkills);
  const [socials, setSocials] = useState<SocialLink[]>([]);
  const [education, setEducation] = useState<Education[]>(defaultEducation);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [
        profileResult,
        projectsResult,
        skillsResult,
        socialsResult,
        educationResult,
      ] = await Promise.all([
        supabase
          .from("profile")
          .select("*")
          .limit(1)
          .maybeSingle(),

        supabase
          .from("projects")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false }),

        supabase
          .from("skills")
          .select("*")
          .order("created_at", { ascending: true }),

        supabase
          .from("social_links")
          .select("*")
          .order("created_at", { ascending: true }),

        supabase
          .from("education")
          .select("*")
          .order("start_year", { ascending: false }),
      ]);

      if (profileResult.data) {
        setProfile(profileResult.data);
      }

      if (projectsResult.data) {
        setProjects(projectsResult.data);
      }

      if (skillsResult.data && skillsResult.data.length > 0) {
        setSkills(skillsResult.data);
      }

      if (socialsResult.data) {
        setSocials(socialsResult.data);
      }

      if (educationResult.data && educationResult.data.length > 0) {
        setEducation(educationResult.data);
      }
    }

    loadData();
  }, []);

  // Close menu on nav click
  function handleNavClick() {
    setMenuOpen(false);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">

      {/* NAVIGATION */}
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.18em] transition-colors hover:text-[var(--accent)]"
          >
            MANAN.
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            {navLinks.map(([label, target]) =>
              target === "about-page" ? (
                <Link
                  key={label}
                  href="/about"
                  className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                >
                  {label}
                </Link>
              ) : (
                <a
                  key={label}
                  href={`#${target}`}
                  className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
                >
                  {label}
                </a>
              )
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 flex-col items-center justify-center gap-[5px] md:hidden"
          >
            <span
              className={`block h-px w-5 bg-[var(--foreground)] transition-all duration-300 ${menuOpen ? "translate-y-[6px] rotate-45" : ""}`}
            />
            <span
              className={`block h-px w-5 bg-[var(--foreground)] transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`block h-px w-5 bg-[var(--foreground)] transition-all duration-300 ${menuOpen ? "-translate-y-[6px] -rotate-45" : ""}`}
            />
          </button>
        </div>

        {/* Mobile menu drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden border-t border-[var(--border)] md:hidden"
            >
              <div className="flex flex-col px-6 py-4">
                {navLinks.map(([label, target]) =>
                  target === "about-page" ? (
                    <Link
                      key={label}
                      href="/about"
                      onClick={handleNavClick}
                      className="border-b border-[var(--border)] py-4 text-sm text-[var(--muted)] transition-colors last:border-b-0 hover:text-[var(--foreground)]"
                    >
                      {label}
                    </Link>
                  ) : (
                    <a
                      key={label}
                      href={`#${target}`}
                      onClick={handleNavClick}
                      className="border-b border-[var(--border)] py-4 text-sm text-[var(--muted)] transition-colors last:border-b-0 hover:text-[var(--foreground)]"
                    >
                      {label}
                    </a>
                  )
                )}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      {/* HERO */}
      <section className="mx-auto flex min-h-[calc(100vh-65px)] max-w-7xl items-center px-6 py-20 lg:px-10">
        <div className="max-w-5xl">
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-5 text-sm font-medium uppercase tracking-[0.2em] text-[var(--accent)]"
          >
            {profile.name} — {profile.headline}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
            className="max-w-4xl text-5xl font-semibold leading-[0.98] tracking-[-0.04em] sm:text-6xl md:text-7xl lg:text-8xl"
          >
            Learning.
            <br />
            Building.
            <br />
            <span className="text-[var(--accent)]">Experimenting.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 max-w-2xl text-base leading-7 text-[var(--muted)] md:text-lg"
          >
            I&apos;m a programmer interested in computers, technology,
            Python, Go, robotics, blockchain and Web3. I like learning
            by building things and experimenting with ideas.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <a
              href="#projects"
              className="border border-[var(--foreground)] bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-[var(--background)] transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--accent)]"
            >
              View projects
            </a>

            <Link
              href="/about"
              className="border border-[var(--border)] px-6 py-3 text-sm font-medium transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              About me
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ABOUT */}
      <section
        id="about-page"
        className="border-t border-[var(--border)]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                About
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                Curious by nature.
              </h2>
            </div>

            <div className="max-w-2xl space-y-6 leading-8 text-[var(--muted)]">
              <p>
                I&apos;ve always been interested in computers and
                technology. My maternal aunts encouraged that interest
                and made me curious about what I could actually create
                with technology.
              </p>

              <p>
                That curiosity eventually turned into programming. I
                enjoy working with Python and Go and learning how
                different technologies work behind the scenes.
              </p>

              <p>
                Outside programming, I&apos;m interested in robotics,
                blockchain, cryptocurrency, Web3 and solving different
                types of Rubik&apos;s cubes.
              </p>

              <Link
                href="/about"
                className="inline-block text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-strong)]"
              >
                Read the full story →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* SKILLS */}
      <section
        id="skills"
        className="border-t border-[var(--border)]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              Skills
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              Things I&apos;m learning.
            </h2>
          </div>

          <div className="grid gap-px border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {skills.map((skill, index) => (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.05,
                }}
                className="bg-[var(--background)] p-7 transition-colors duration-300 hover:bg-[var(--surface)]"
              >
                <p className="text-xl font-semibold">
                  {skill.name}
                </p>

                {skill.category && (
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {skill.category}
                  </p>
                )}

                {skill.level && (
                  <p className="mt-8 text-xs uppercase tracking-[0.15em] text-[var(--accent)]">
                    {skill.level}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section
        id="projects"
        className="border-t border-[var(--border)]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="mb-12">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              Projects
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              Things I&apos;ve built.
            </h2>
          </div>

          {projects.length === 0 ? (
            <div className="border border-[var(--border)] p-8">
              <p className="text-[var(--muted)]">
                Projects will appear here as I build and publish them.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {projects.map((project, index) => (
                <motion.article
                  key={project.id}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.08,
                  }}
                  className="group overflow-hidden border border-[var(--border)] bg-[var(--surface)]"
                >
                  {project.image_url && (
                    <div className="aspect-video overflow-hidden border-b border-[var(--border)]">
                      <img
                        src={project.image_url}
                        alt={project.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}

                  <div className="p-7">
                    <h3 className="text-2xl font-semibold">
                      {project.title}
                    </h3>

                    {project.description && (
                      <p className="mt-4 leading-7 text-[var(--muted)]">
                        {project.description}
                      </p>
                    )}

                    {project.technologies &&
                      project.technologies.length > 0 && (
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
                      )}

                    <div className="mt-7 flex flex-wrap gap-5 text-sm">
                      {project.live_url && (
                        <a
                          href={project.live_url}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-[var(--accent)] hover:text-[var(--accent-strong)]"
                        >
                          View project →
                        </a>
                      )}

                      <Link
                        href={`/projects/${project.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")}`}
                        className="font-medium text-[var(--foreground)] hover:text-[var(--accent)]"
                      >
                        Case study →
                      </Link>

                      {project.github_url && (
                        <a
                          href={project.github_url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[var(--muted)] hover:text-[var(--foreground)]"
                        >
                          GitHub →
                        </a>
                      )}
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* EDUCATION / ACHIEVEMENTS */}
      <section
        id="education"
        className="border-t border-[var(--border)]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                Education & achievements
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                Still learning.
              </h2>
            </div>

            <div className="space-y-5">
              {education.map((item) => (
                <div
                  key={item.id}
                  className="border border-[var(--border)] p-7 transition-colors duration-300 hover:bg-[var(--surface)]"
                >
                  <h3 className="text-xl font-semibold">
                    {item.title}
                  </h3>

                  {item.institution && (
                    <p className="mt-3 text-[var(--muted)]">
                      {item.institution}
                    </p>
                  )}

                  {item.description && (
                    <p className="mt-4 leading-7 text-[var(--muted)]">
                      {item.description}
                    </p>
                  )}

                  {(item.start_year || item.end_year) && (
                    <p className="mt-5 text-xs uppercase tracking-[0.15em] text-[var(--accent)]">
                      {item.start_year ?? ""}
                      {item.end_year
                        ? ` — ${item.end_year}`
                        : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SOCIALS */}
      {socials.length > 0 && (
        <section className="border-t border-[var(--border)]">
          <div className="mx-auto max-w-7xl px-6 py-20 lg:px-10">
            <div className="flex flex-wrap gap-3">
              {socials.map((social) => {
                const icon =
                  socialIcons[social.platform.toLowerCase()];

                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 border border-[var(--border)] px-5 py-3 text-sm transition-all duration-300 hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    <span className="text-base">
                      {icon}
                    </span>

                    <span>
                      {social.username ||
                        social.platform}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CONTACT */}
      <section
        id="contact"
        className="border-t border-[var(--border)]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                Contact
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                Let&apos;s talk.
              </h2>

              <p className="mt-6 max-w-md leading-7 text-[var(--muted)]">
                Have an idea, question, or something interesting to
                discuss? Send me a message.
              </p>
            </div>

            <div>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© 2026 Manan Khatri</p>

          <p>
            Built with curiosity.
          </p>
        </div>
      </footer>
    </main>
  );
}
