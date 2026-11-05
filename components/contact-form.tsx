"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const DRAFT_KEY = "manan_contact_draft";
const VISITOR_KEY = "manan_visitor_id";

type DraftData = {
    draftToken: string;
    visitorId: string;
    name: string;
    email: string;
    message: string;
};

export default function ContactForm() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState("");

    const draftRef = useRef<DraftData | null>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        try {
            let visitorId = localStorage.getItem(VISITOR_KEY);

            if (!visitorId) {
                visitorId = crypto.randomUUID();
                localStorage.setItem(VISITOR_KEY, visitorId);
            }

            const savedDraft = localStorage.getItem(DRAFT_KEY);

            if (savedDraft) {
                const draft = JSON.parse(savedDraft) as DraftData;

                if (draft?.draftToken) {
                    draftRef.current = {
                        ...draft,
                        visitorId,
                    };

                    setName(draft.name || "");
                    setEmail(draft.email || "");
                    setMessage(draft.message || "");
                }
            }
        } catch (error) {
            console.error("DRAFT LOAD ERROR:", error);
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, []);

    function getDraft() {
        if (!draftRef.current) {
            const visitorId =
                localStorage.getItem(VISITOR_KEY) || crypto.randomUUID();

            localStorage.setItem(VISITOR_KEY, visitorId);

            draftRef.current = {
                draftToken: crypto.randomUUID(),
                visitorId,
                name: "",
                email: "",
                message: "",
            };
        }

        return draftRef.current;
    }

    function saveDraft(
        nextName: string,
        nextEmail: string,
        nextMessage: string
    ) {
        if (
            !nextName.trim() &&
            !nextEmail.trim() &&
            !nextMessage.trim()
        ) {
            return;
        }

        const draft = getDraft();

        draft.name = nextName;
        draft.email = nextEmail;
        draft.message = nextMessage;

        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));

        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        saveTimeoutRef.current = setTimeout(async () => {
            try {
                await fetch("/api/contact/draft", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(draft),
                    keepalive: true,
                });
            } catch (error) {
                console.error("DRAFT SAVE ERROR:", error);
            }
        }, 700);
    }

    function handleNameChange(value: string) {
        setName(value);
        saveDraft(value, email, message);
    }

    function handleEmailChange(value: string) {
        setEmail(value);
        saveDraft(name, value, message);
    }

    function handleMessageChange(value: string) {
        setMessage(value);
        saveDraft(name, email, value);
    }

    useEffect(() => {
        function handleLeave() {
            const draft = draftRef.current;

            if (!draft) return;

            if (
                !draft.name.trim() &&
                !draft.email.trim() &&
                !draft.message.trim()
            ) {
                return;
            }

            const payload = JSON.stringify(draft);

            navigator.sendBeacon(
                "/api/contact/draft/abandon",
                new Blob([payload], {
                    type: "application/json",
                })
            );
        }

        window.addEventListener("pagehide", handleLeave);

        return () => {
            window.removeEventListener("pagehide", handleLeave);
        };
    }, []);

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

            const draft = draftRef.current;

            if (draft) {
                try {
                    await fetch("/api/contact/draft/delete", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            draftToken: draft.draftToken,
                        }),
                    });
                } catch (error) {
                    console.error("DRAFT DELETE ERROR:", error);
                }
            }

            localStorage.removeItem(DRAFT_KEY);

            draftRef.current = null;

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
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Your name"
                    required
                    disabled={loading}
                    className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
            </div>

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
                    onChange={(e) => handleEmailChange(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={loading}
                    className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
            </div>

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
                    onChange={(e) => handleMessageChange(e.target.value)}
                    placeholder="Write your message..."
                    rows={6}
                    required
                    disabled={loading}
                    className="w-full resize-none border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] outline-none transition focus:border-[var(--accent)]"
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="relative z-10 cursor-pointer border border-[var(--accent)] bg-[var(--accent)] px-6 py-3 font-semibold text-[var(--background)] transition hover:bg-transparent hover:text-[var(--accent)] disabled:cursor-not-allowed disabled:opacity-60"
            >
                {loading ? "Sending..." : "Send Message"}
            </button>

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