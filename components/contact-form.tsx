"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        console.log("SEND BUTTON CLICKED");

        setStatus("");

        if (loading) return;

        const cleanName = name.trim();
        const cleanEmail = email.trim();
        const cleanMessage = message.trim();

        if (!cleanName || !cleanEmail || !cleanMessage) {
            setStatus("Please fill in all fields.");
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
            setStatus("Please enter a valid email address.");
            return;
        }

        if (cleanMessage.length < 10) {
            setStatus("Message must be at least 10 characters.");
            return;
        }

        setLoading(true);

        try {
            const supabase = createClient();

            // Save message to Supabase
            const { error: databaseError } = await supabase
                .from("contact_submissions")
                .insert({
                    name: cleanName,
                    email: cleanEmail,
                    message: cleanMessage,
                });

            if (databaseError) {
                console.error("SUPABASE ERROR:", databaseError);

                setStatus("Could not save your message.");
                setLoading(false);
                return;
            }

            console.log("MESSAGE SAVED TO SUPABASE");

            // Send emails
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: cleanName,
                    email: cleanEmail,
                    message: cleanMessage,
                }),
            });

            const result = await response.json();

            console.log("EMAIL API RESPONSE:", result);

            if (!response.ok) {
                setStatus(
                    result?.error ||
                        "Message saved, but email could not be sent."
                );

                setLoading(false);
                return;
            }

            setName("");
            setEmail("");
            setMessage("");

            setStatus("Message sent successfully!");
        } catch (error) {
            console.error("CONTACT FORM ERROR:", error);

            setStatus("Something went wrong. Please try again.");
        }

        setLoading(false);
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="relative space-y-5"
        >
            {/* Name */}
            <div>
                <label
                    htmlFor="contact-name"
                    className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                    Name
                </label>

                <input
                    id="contact-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={loading}
                    className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
            </div>

            {/* Email */}
            <div>
                <label
                    htmlFor="contact-email"
                    className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                    Email
                </label>

                <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
            </div>

            {/* Message */}
            <div>
                <label
                    htmlFor="contact-message"
                    className="mb-2 block text-sm font-medium text-[var(--foreground)]"
                >
                    Message
                </label>

                <textarea
                    id="contact-message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Write your message..."
                    rows={6}
                    required
                    disabled={loading}
                    className="w-full resize-none border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
            </div>

            {/* Button */}
            <button
                type="submit"
                disabled={loading}
                className="relative z-10 cursor-pointer border border-[var(--accent)] bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--background)] transition hover:bg-transparent hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Sending..." : "Send Message"}
            </button>

            {/* Status */}
            {status && (
                <p
                    className="text-sm text-[var(--muted)]"
                    aria-live="polite"
                >
                    {status}
                </p>
            )}
        </form>
    );
}