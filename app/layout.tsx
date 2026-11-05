import type { Metadata } from "next";
import "./globals.css";
import ThemeToggle from "@/components/theme-toggle";
import AnalyticsTracker from "@/components/analytics-tracker";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://manankhatri.xyz"
  ),

  title: {
    default: "Manan Khatri — Developer & Tech Enthusiast",
    template: "%s — Manan Khatri",
  },

  description:
    "Portfolio of Manan Khatri — programmer, technology enthusiast, robotics enthusiast, and aspiring Web3 developer.",

  applicationName: "Manan Khatri",

  keywords: [
    "Manan Khatri",
    "developer",
    "programmer",
    "Python",
    "Go",
    "Web3",
    "blockchain",
    "robotics",
  ],

  authors: [
    {
      name: "Manan Khatri",
    },
  ],

  creator: "Manan Khatri",

  openGraph: {
    title: "Manan Khatri — Developer & Tech Enthusiast",
    description:
      "Portfolio of Manan Khatri — programmer, technology enthusiast, robotics enthusiast, and aspiring Web3 developer.",
    url: "https://manankhatri.xyz",
    siteName: "Manan Khatri",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Manan Khatri — Developer & Tech Enthusiast",
    description:
      "Portfolio of Manan Khatri — programmer, technology enthusiast, robotics enthusiast, and aspiring Web3 developer.",
  },

  robots: {
    index: true,
    follow: true,
  },

  alternates: {
    canonical: "https://manankhatri.xyz",
  },

  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        <AnalyticsTracker />

        {children}

        <ThemeToggle />
      </body>
    </html>
  );
}