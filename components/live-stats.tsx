"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getNextBirthday() {
  const now = new Date();

  const birthday = new Date(
    now.getFullYear(),
    2,
    25,
    0,
    0,
    0,
    0
  );

  if (birthday.getTime() <= now.getTime()) {
    birthday.setFullYear(now.getFullYear() + 1);
  }

  return birthday;
}

function getTimeLeft(): TimeLeft {
  const difference = Math.max(
    0,
    getNextBirthday().getTime() - Date.now()
  );

  return {
    days: Math.floor(difference / 86400000),
    hours: Math.floor((difference / 3600000) % 24),
    minutes: Math.floor((difference / 60000) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

const units = [
  { key: "days", label: "Days" },
  { key: "hours", label: "Hours" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
] as const;

export default function LiveStats() {
  const [time, setTime] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTime(getTimeLeft());

    const interval = window.setInterval(() => {
      setTime(getTimeLeft());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  if (!time) {
    return (
      <section className="border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            Birthday In
          </p>

          <div className="mt-10 grid grid-cols-2 border border-[var(--border)] sm:grid-cols-4">
            {units.map((unit) => (
              <div
                key={unit.key}
                className="border-b border-[var(--border)] p-7 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0"
              >
                <div className="mx-auto h-16 w-20 animate-pulse bg-[var(--surface)]" />

                <p className="mt-4 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                  {unit.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            Birthday In
          </p>

          <div className="mt-10 grid grid-cols-2 border border-[var(--border)] sm:grid-cols-4">
            {units.map((unit, index) => {
              const value = time[unit.key];

              return (
                <div
                  key={unit.key}
                  className={`
                    group
                    relative
                    overflow-hidden
                    border-b
                    border-[var(--border)]
                    p-7
                    text-center
                    transition-colors
                    duration-300
                    hover:bg-[var(--surface)]
                    sm:border-b-0
                    sm:border-r
                    sm:last:border-r-0
                    ${index >= 2 ? "border-b-0" : ""}
                  `}
                >
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-500 group-hover:scale-x-100" />

                  <div className="relative flex h-20 items-center justify-center overflow-hidden md:h-24">
                    <motion.span
                      key={value}
                      initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{
                        duration: 0.25,
                        ease: "easeOut",
                      }}
                      className="font-mono text-5xl font-medium tracking-[-0.05em] tabular-nums md:text-7xl"
                    >
                      {String(value).padStart(2, "0")}
                    </motion.span>
                  </div>

                  <p className="mt-3 text-[10px] font-medium uppercase tracking-[0.2em] text-[var(--muted)] transition-colors duration-300 group-hover:text-[var(--foreground)]">
                    {unit.label}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-5 text-xs text-[var(--muted)]">
            Live countdown
          </p>
        </motion.div>
      </div>
    </section>
  );
}