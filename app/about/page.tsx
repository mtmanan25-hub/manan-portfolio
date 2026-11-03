"use client";

import LiveStats from "@/components/live-stats";
import Link from "next/link";
import { motion } from "motion/react";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)] transition-colors duration-300">
      {/* HEADER */}
      <header className="border-b border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.18em] transition-colors hover:text-[var(--accent)]"
          >
            MANAN.
          </Link>

          <Link
            href="/"
            className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
          >
            ← Back home
          </Link>
        </div>
      </header>

      {/* HERO */}
      <section className="mx-auto max-w-7xl px-6 py-24 lg:px-10 lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl"
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            About me
          </p>

          <h1 className="mt-5 text-5xl font-semibold leading-[1] tracking-[-0.04em] sm:text-6xl md:text-7xl">
            Hey, I&apos;m Manan.
            <br />
            <span className="text-[var(--accent)]">
              I like building things with technology.
            </span>
          </h1>

          <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            I&apos;m a programmer who enjoys understanding how technology
            works and turning ideas into things that actually work.
          </p>
        </motion.div>
      </section>

      {/* BIRTHDAY COUNTDOWN */}
      <LiveStats />

      {/* JOURNEY */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-24 lg:grid-cols-[0.8fr_1.2fr] lg:px-10">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              My journey
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              Curiosity came first.
            </h2>
          </div>

          <div className="max-w-2xl space-y-6 leading-8 text-[var(--muted)]">
            <p>
              I&apos;ve been interested in computers and technology for a
              long time. My maternal aunts encouraged that interest and
              made me curious about what I could actually create with
              technology.
            </p>

            <p>
              That curiosity eventually led me to programming. Once I
              started learning how code could turn an idea into something
              real, I wanted to keep exploring.
            </p>

            <p>
              Since then, I&apos;ve built different projects, experimented
              with new technologies and kept learning through actually
              making things.
            </p>
          </div>
        </div>
      </section>

      {/* PROGRAMMING */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              Programming
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              Learning by building.
            </h2>

            <div className="mt-8 space-y-6 leading-8 text-[var(--muted)]">
              <p>
                Python and Go are the languages I enjoy working with the
                most. I&apos;m learning both properly, including more
                advanced tools and concepts.
              </p>

              <p>
                I&apos;m not completely new to programming, but I&apos;m
                also nowhere near finished learning. There&apos;s always
                another concept, tool or problem to understand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERESTS */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            Interests
          </p>

          <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            More than just code.
          </h2>

          <div className="mt-12 grid gap-px border border-[var(--border)] bg-[var(--border)] sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Programming",
              "Python",
              "Go",
              "Web3",
              "Blockchain",
              "Cryptocurrency",
              "Robotics",
              "Rubik's Cubes",
            ].map((interest, index) => (
              <motion.div
                key={interest}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.04,
                }}
                className="bg-[var(--background)] p-7 text-lg font-medium transition-colors duration-300 hover:bg-[var(--surface)] hover:text-[var(--accent)]"
              >
                {interest}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ACHIEVEMENT */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                Achievement
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                Built. Competed. Learned.
              </h2>
            </div>

            <div className="border border-[var(--border)] bg-[var(--surface)] p-8">
              <p className="text-sm uppercase tracking-[0.15em] text-[var(--accent)]">
                3rd Position
              </p>

              <h3 className="mt-4 text-2xl font-semibold">
                Robo War Robotics
              </h3>

              <p className="mt-3 leading-7 text-[var(--muted)]">
                Akriti Fest 2026 · Mayo College Girls&apos; School,
                Ajmer
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* BEYOND TECHNOLOGY */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="max-w-3xl">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              Beyond technology
            </p>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
              There&apos;s more to learning than marks.
            </h2>

            <div className="mt-8 space-y-6 leading-8 text-[var(--muted)]">
              <p>
                I get more than average marks in class, although I&apos;m
                not always the student with the highest scores.
              </p>

              <p>
                I don&apos;t think marks are the only way to measure
                learning. Building things, solving problems, experimenting
                and understanding how things work matter too.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT'S NEXT */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <div className="grid gap-12 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
                What&apos;s next
              </p>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
                Build bigger things.
              </h2>
            </div>

            <div className="max-w-2xl leading-8 text-[var(--muted)]">
              <p>
                My long-term goal is to become a professional Web3
                developer. Blockchain and cryptocurrency are areas I&apos;m
                particularly interested in, and I want to keep learning
                how they can be used to build useful technology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* MINDSET */}
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-28 lg:px-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl"
          >
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
              Mindset
            </p>

            <h2 className="mt-5 text-5xl font-semibold tracking-[-0.04em] md:text-7xl">
              I&apos;m proud to be a beginner.
            </h2>

            <p className="mt-8 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Being a beginner means there is still a lot of room to
              build, learn, fail, improve and discover what I&apos;m
              capable of.
            </p>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)]">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between lg:px-10">
          <p>© 2026 Manan Khatri</p>

          <Link
            href="/"
            className="transition-colors hover:text-[var(--accent)]"
          >
            Back to home →
          </Link>
        </div>
      </footer>
    </main>
  );
}