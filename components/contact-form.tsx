
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [website, setWebsite] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus("");

        if (website) return;

        const cleanName = name.trim();
        const cleanEmail = email.trim();
        const cleanMessage = message.trim();

        if (
            cleanName.length < 1 ||
            cleanName.length > 80 ||
            cleanEmail.length < 5 ||
            cleanEmail.length > 254 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
            cleanMessage.length < 10 ||
            cleanMessage.length > 3000
        ) {
            setStatus("Please check your details and try again.");
            return;
        }

        setLoading(true);

        const supabase = createClient();

        const { error } = await supabase
            .from("contact_submissions")
            .insert({
                name: cleanName,
                email: cleanEmail,
                message: cleanMessage,
            });

        if (error) {
            setStatus("Something went wrong. Please try again.");
        } else {
            setName("");
            setEmail("");
            setMessage("");
            setStatus("Message sent. Thanks for reaching out!");
        }

        setLoading(false);
    }

    return (
        <form onSubmit={handleSubmit} className="relative space-y-5">
            <div>
                <label className="mb-2 block text-sm text-[var(--muted)]">
                    Your name
                </label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={80}
                    required
                    placeholder="Enter your name"
                    className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm text-[var(--muted)]">
                    Email address
                </label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    maxLength={254}
                    required
                    placeholder="you@example.com"
                    className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
            </div>

            <div>
                <label className="mb-2 block text-sm text-[var(--muted)]">
                    Message
                </label>
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    minLength={10}
                    maxLength={3000}
                    required
                    rows={5}
                    placeholder="Tell me what you have in mind..."
                    className="w-full resize-y border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                />
                <p className="mt-1 text-right text-xs text-[var(--muted)]">
                    {message.length}/3000
                </p>
            </div>

            {/* Honeypot — hidden from real users */}
            <div
                aria-hidden="true"
                className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
            >
                <label>
                    Leave this field empty
                    <input
                        type="text"
                        tabIndex={-1}
                        autoComplete="off"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                    />
                </label>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="border border-[var(--foreground)] bg-[var(--foreground)] px-6 py-3 text-sm font-medium text-[var(--background)] transition-all duration-300 hover:border-[var(--accent)] hover:bg-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-50"
            >
                {loading ? "Sending..." : "Send message →"}
            </button>

            {status && (
                <p
                    role="status"
                    className={`text-sm ${
                        status.startsWith("Message sent")
                            ? "text-[var(--accent)]"
                            : "text-[var(--muted)]"
                    }`}
                >
                    {status}
                </p>
            )}
        </form>
    );
}
