"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

function getNextBirthday() {
  const now = new Date();

  let birthday = new Date(
    now.getFullYear(),
    2,
    25,
    0,
    0,
    0
  );

  if (birthday <= now) {
    birthday = new Date(
      now.getFullYear() + 1,
      2,
      25,
      0,
      0,
      0
    );
  }

  return birthday;
}

function calculateTimeLeft() {
  const difference = getNextBirthday().getTime() - Date.now();

  const days = Math.floor(
    difference / (1000 * 60 * 60 * 24)
  );

  const hours = Math.floor(
    (difference / (1000 * 60 * 60)) % 24
  );

  const minutes = Math.floor(
    (difference / (1000 * 60)) % 60
  );

  const seconds = Math.floor(
    (difference / 1000) % 60
  );

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

export default function LiveStats() {
  const [time, setTime] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const update = () => {
      setTime(calculateTimeLeft());
    };

    update();

    const interval = setInterval(update, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) {
    return null;
  }

  const values = [
    ["days", time.days],
    ["hours", time.hours],
    ["minutes", time.minutes],
    ["seconds", time.seconds],
  ];

  return (
    <section className="border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-6 py-24 lg:px-10">
        <div className="mb-10">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--accent)]">
            Birthday In
          </p>

          <h2 className="mt-3 text-4xl font-semibold tracking-[-0.03em] md:text-5xl">
            March 25
          </h2>
        </div>

        <div className="grid grid-cols-2 border border-[var(--border)] sm:grid-cols-4">
          {values.map(([label, value], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
              }}
              className="border-b border-[var(--border)] p-7 text-center transition-colors duration-300 hover:bg-[var(--surface)] sm:border-b-0 sm:border-r last:border-r-0"
            >
              <motion.p
                key={value}
                initial={{ opacity: 0.6 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.15 }}
                className="font-mono text-4xl font-semibold tracking-tight md:text-6xl"
              >
                {String(value).padStart(2, "0")}
              </motion.p>

              <p className="mt-3 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                {label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}