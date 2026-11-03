"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setDark(false);
    } else {
      document.documentElement.classList.add("dark");
      setDark(true);
    }

    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;

    setDark(nextDark);

    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }

  if (!mounted) {
    return null;
  }

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.9 }}
      transition={{ duration: 0.2 }}
      aria-label={dark ? "Switch to light mode" : "Switch to night mode"}
      className="
        fixed
        bottom-5
        left-5
        z-[100]
        flex
        h-10
        w-10
        items-center
        justify-center
        border
        bg-[var(--surface)]
        text-[var(--foreground)]
        transition-all
        duration-300
        hover:border-[var(--accent)]
        hover:text-[var(--accent-strong)]
      "
    >
      <motion.span
        key={dark ? "moon" : "sun"}
        initial={{
          opacity: 0,
          rotate: -30,
          scale: 0.7,
        }}
        animate={{
          opacity: 1,
          rotate: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className="text-base leading-none"
      >
        {dark ? "☾" : "☀"}
      </motion.span>
    </motion.button>
  );
}