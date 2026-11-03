
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Message = {
    id: string;
    name: string;
    email: string;
    message: string;
    is_read: boolean;
    created_at: string;
};

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState<Message | null>(null);
    const [error, setError] = useState("");

    async function loadMessages() {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("contact_submissions")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            setError("Unable to load messages. Please check your permissions.");
        } else {
            setMessages(data ?? []);
            setError("");
        }

        setLoading(false);
    }

    useEffect(() => {
        loadMessages();
    }, []);

    async function toggleRead(message: Message) {
        const supabase = createClient();

        const { error } = await supabase
            .from("contact_submissions")
            .update({ is_read: !message.is_read })
            .eq("id", message.id);

        if (error) {
            setError("Could not update message.");
            return;
        }

        if (selected?.id === message.id) {
            setSelected({ ...message, is_read: !message.is_read });
        }

        await loadMessages();
    }

    async function deleteMessage(id: string) {
        if (!window.confirm("Delete this message permanently?")) return;

        const supabase = createClient();

        const { error } = await supabase
            .from("contact_submissions")
            .delete()
            .eq("id", id);

        if (error) {
            setError("Could not delete message.");
            return;
        }

        if (selected?.id === id) setSelected(null);

        await loadMessages();
    }

    const unreadCount = messages.filter((m) => !m.is_read).length;

    return (
        <main className="min-h-screen bg-[var(--background)] px-5 py-10 text-[var(--foreground)] md:px-10">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/admin"
                    className="text-sm text-[var(--muted)] transition-colors hover:text-[var(--accent)]"
                >
                    ← Back to dashboard
                </Link>

                <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                            Admin / Inbox
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold">
                            Messages
                        </h1>

                        <p className="mt-2 text-sm text-[var(--muted)]">
                            Messages sent through your portfolio contact form.
                        </p>
                    </div>

                    <div className="border border-[var(--border)] px-5 py-4">
                        <p className="text-xs text-[var(--muted)]">Unread</p>
                        <p className="mt-1 text-3xl font-semibold text-[var(--accent)]">
                            {unreadCount}
                        </p>
                    </div>
                </div>

                {error && (
                    <p className="mt-6 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
                        {error}
                    </p>
                )}

                {loading ? (
                    <p className="mt-10 text-sm text-[var(--muted)]">
                        Loading messages...
                    </p>
                ) : messages.length === 0 ? (
                    <div className="mt-10 border border-[var(--border)] p-10 text-center">
                        <p className="text-[var(--foreground)]">
                            Your inbox is empty.
                        </p>
                        <p className="mt-2 text-sm text-[var(--muted)]">
                            New contact form submissions will appear here.
                        </p>
                    </div>
                ) : (
                    <div className="mt-10 grid gap-6 md:grid-cols-[1fr_1.2fr]">
                        {/* List */}
                        <div className="space-y-2">
                            {messages.map((message) => (
                                <button
                                    key={message.id}
                                    onClick={() => setSelected(message)}
                                    className={`w-full border p-4 text-left transition-colors ${
                                        selected?.id === message.id
                                            ? "border-[var(--accent)]"
                                            : "border-[var(--border)] hover:bg-[var(--surface)]"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <span className="font-medium">
                                            {message.name}
                                        </span>

                                        <span
                                            className={`text-[10px] uppercase tracking-wider ${
                                                message.is_read
                                                    ? "text-[var(--muted)]"
                                                    : "text-[var(--accent)]"
                                            }`}
                                        >
                                            {message.is_read ? "Read" : "New"}
                                        </span>
                                    </div>

                                    <p className="mt-1 truncate text-xs text-[var(--muted)]">
                                        {message.email}
                                    </p>

                                    <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
                                        {message.message}
                                    </p>

                                    <p className="mt-3 text-[11px] text-[var(--muted)] opacity-60">
                                        {new Date(message.created_at).toLocaleString()}
                                    </p>
                                </button>
                            ))}
                        </div>

                        {/* Detail panel */}
                        <div className="min-h-72 border border-[var(--border)] p-6">
                            {selected ? (
                                <>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h2 className="text-xl font-semibold">
                                                {selected.name}
                                            </h2>

                                            <a
                                                href={`mailto:${selected.email}`}
                                                className="mt-1 block break-all text-sm text-[var(--accent)] hover:underline"
                                            >
                                                {selected.email}
                                            </a>
                                        </div>

                                        <span className="text-xs text-[var(--muted)]">
                                            {selected.is_read ? "Read" : "Unread"}
                                        </span>
                                    </div>

                                    <div className="my-6 border-t border-[var(--border)]" />

                                    <p className="whitespace-pre-wrap break-words text-sm leading-7 text-[var(--foreground)]">
                                        {selected.message}
                                    </p>

                                    <p className="mt-8 text-xs text-[var(--muted)]">
                                        Received:{" "}
                                        {new Date(selected.created_at).toLocaleString()}
                                    </p>

                                    <div className="mt-6 flex flex-wrap gap-3">
                                        <button
                                            onClick={() => toggleRead(selected)}
                                            className="border border-[var(--border)] px-4 py-2 text-xs text-[var(--foreground)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                        >
                                            Mark as{" "}
                                            {selected.is_read ? "unread" : "read"}
                                        </button>

                                        <button
                                            onClick={() =>
                                                deleteMessage(selected.id)
                                            }
                                            className="border border-red-500/30 px-4 py-2 text-xs text-red-400 transition-colors hover:bg-red-500/10"
                                        >
                                            Delete message
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex h-full min-h-64 items-center justify-center text-sm text-[var(--muted)]">
                                    Select a message to read it.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
