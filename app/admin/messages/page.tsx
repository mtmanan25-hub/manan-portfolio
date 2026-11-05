
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
    is_important: boolean;
    created_at: string;
};

type Draft = {
    id: string;
    draft_token: string;
    visitor_id: string | null;
    name: string | null;
    email: string | null;
    message: string | null;
    created_at: string;
    updated_at: string;
    abandoned_at: string | null;
};

type ViewMode = "messages" | "drafts";
type MessageFilter = "all" | "unread" | "important";

function formatDate(date: string) {
    return new Date(date).toLocaleString();
}

export default function MessagesPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [drafts, setDrafts] = useState<Draft[]>([]);

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState("");

    const [selected, setSelected] = useState<Message | null>(null);
    const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);

    const [viewMode, setViewMode] = useState<ViewMode>("messages");
    const [filter, setFilter] = useState<MessageFilter>("all");
    const [search, setSearch] = useState("");

    const [busyId, setBusyId] = useState<string | null>(null);

    async function loadAll(showRefresh = false) {
        if (showRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        setError("");

        const supabase = createClient();

        const [messagesResult, draftsResult] = await Promise.all([
            supabase
                .from("contact_submissions")
                .select("*")
                .order("created_at", { ascending: false }),

            supabase
                .from("contact_drafts")
                .select("*")
                .not("abandoned_at", "is", null)
                .order("updated_at", { ascending: false }),
        ]);

        if (messagesResult.error) {
            console.error("MESSAGE LOAD ERROR:", messagesResult.error);
            setError("Unable to load messages. Check your permissions.");
        } else {
            setMessages((messagesResult.data ?? []) as Message[]);
        }

        if (draftsResult.error) {
            console.error("DRAFT LOAD ERROR:", draftsResult.error);
            setError((current) =>
                current
                    ? `${current} Drafts could not be loaded.`
                    : "Unable to load drafts. Check your permissions."
            );
        } else {
            setDrafts((draftsResult.data ?? []) as Draft[]);
        }

        setLoading(false);
        setRefreshing(false);
    }

    useEffect(() => {
        void loadAll();
    }, []);

    async function toggleRead(message: Message) {
        setBusyId(message.id);
        setError("");

        const nextValue = !message.is_read;
        const supabase = createClient();

        const { error } = await supabase
            .from("contact_submissions")
            .update({ is_read: nextValue })
            .eq("id", message.id);

        if (error) {
            console.error("READ UPDATE ERROR:", error);
            setError("Could not update message.");
            setBusyId(null);
            return;
        }

        setMessages((current) =>
            current.map((item) =>
                item.id === message.id
                    ? { ...item, is_read: nextValue }
                    : item
            )
        );

        setSelected((current) =>
            current?.id === message.id
                ? { ...current, is_read: nextValue }
                : current
        );

        setBusyId(null);
    }

    async function toggleImportant(message: Message) {
        setBusyId(message.id);
        setError("");

        const nextValue = !message.is_important;
        const supabase = createClient();

        const { error } = await supabase
            .from("contact_submissions")
            .update({ is_important: nextValue })
            .eq("id", message.id);

        if (error) {
            console.error("IMPORTANT UPDATE ERROR:", error);
            setError("Could not update important status.");
            setBusyId(null);
            return;
        }

        setMessages((current) =>
            current.map((item) =>
                item.id === message.id
                    ? { ...item, is_important: nextValue }
                    : item
            )
        );

        setSelected((current) =>
            current?.id === message.id
                ? { ...current, is_important: nextValue }
                : current
        );

        setBusyId(null);
    }

    async function deleteMessage(id: string) {
        if (!window.confirm("Delete this message permanently?")) return;

        setBusyId(id);
        setError("");

        const supabase = createClient();

        const { error } = await supabase
            .from("contact_submissions")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("MESSAGE DELETE ERROR:", error);
            setError("Could not delete message.");
            setBusyId(null);
            return;
        }

        setMessages((current) =>
            current.filter((message) => message.id !== id)
        );

        setSelected((current) =>
            current?.id === id ? null : current
        );

        setBusyId(null);
    }

    async function deleteDraft(id: string) {
        if (!window.confirm("Delete this draft permanently?")) return;

        setBusyId(id);
        setError("");

        const supabase = createClient();

        const { error } = await supabase
            .from("contact_drafts")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("DRAFT DELETE ERROR:", error);
            setError("Could not delete draft.");
            setBusyId(null);
            return;
        }

        setDrafts((current) =>
            current.filter((draft) => draft.id !== id)
        );

        setSelectedDraft((current) =>
            current?.id === id ? null : current
        );

        setBusyId(null);
    }

    const unreadCount = messages.filter(
        (message) => !message.is_read
    ).length;

    const importantCount = messages.filter(
        (message) => message.is_important
    ).length;

    const draftCount = drafts.length;

    const query = search.trim().toLowerCase();

    const filteredMessages = messages.filter((message) => {
        const matchesSearch =
            !query ||
            message.name.toLowerCase().includes(query) ||
            message.email.toLowerCase().includes(query) ||
            message.message.toLowerCase().includes(query);

        const matchesFilter =
            filter === "all" ||
            (filter === "unread" && !message.is_read) ||
            (filter === "important" && message.is_important);

        return matchesSearch && matchesFilter;
    });

    const filteredDrafts = drafts.filter((draft) => {
        return (
            !query ||
            (draft.name ?? "").toLowerCase().includes(query) ||
            (draft.email ?? "").toLowerCase().includes(query) ||
            (draft.message ?? "").toLowerCase().includes(query)
        );
    });

    const activeMessage = selected
        ? filteredMessages.find((message) => message.id === selected.id) ?? null
        : null;

    const activeDraft = selectedDraft
        ? filteredDrafts.find((draft) => draft.id === selectedDraft.id) ?? null
        : null;

    return (
        <main className="min-h-screen bg-[var(--background)] px-5 py-8 text-[var(--foreground)] md:px-10">
            <div className="mx-auto max-w-7xl">

                {/* HEADER */}

                <div className="flex flex-wrap items-center justify-between gap-4">
                    <Link
                        href="/admin"
                        className="text-sm text-[var(--muted)] transition hover:text-[var(--accent)]"
                    >
                        ← Back to dashboard
                    </Link>

                    <button
                        type="button"
                        onClick={() => void loadAll(true)}
                        disabled={loading || refreshing}
                        className="border border-[var(--border)] px-4 py-2 text-xs transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40"
                    >
                        {refreshing ? "Refreshing..." : "↻ Refresh inbox"}
                    </button>
                </div>

                <div className="mt-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
                    <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
                            Admin / Communication
                        </p>

                        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                            Inbox<span className="text-[var(--accent)]">.</span>
                        </h1>

                        <p className="mt-3 text-sm text-[var(--muted)]">
                            Manage messages, replies and abandoned contact drafts.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 border border-[var(--border)]">
                        <div className="p-4 sm:px-6">
                            <p className="text-xs text-[var(--muted)]">Total</p>
                            <p className="mt-2 text-2xl font-semibold">
                                {messages.length}
                            </p>
                        </div>

                        <div className="border-l border-[var(--border)] p-4 sm:px-6">
                            <p className="text-xs text-[var(--muted)]">Unread</p>
                            <p className="mt-2 text-2xl font-semibold text-[var(--accent)]">
                                {unreadCount}
                            </p>
                        </div>

                        <div className="border-l border-[var(--border)] p-4 sm:px-6">
                            <p className="text-xs text-[var(--muted)]">Drafts</p>
                            <p className="mt-2 text-2xl font-semibold">
                                {draftCount}
                            </p>
                        </div>
                    </div>
                </div>

                {/* ERRORS */}

                {error && (
                    <div className="mt-6 border border-red-500/30 bg-red-500/5 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {/* MAIN TABS */}

                <div className="mt-10 flex gap-6 border-b border-[var(--border)]">
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode("messages");
                            setSelectedDraft(null);
                        }}
                        className={`border-b-2 px-1 pb-4 text-sm transition ${
                            viewMode === "messages"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                    >
                        Messages
                        <span className="ml-2 opacity-60">{messages.length}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            setViewMode("drafts");
                            setSelected(null);
                        }}
                        className={`border-b-2 px-1 pb-4 text-sm transition ${
                            viewMode === "drafts"
                                ? "border-[var(--accent)] text-[var(--accent)]"
                                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]"
                        }`}
                    >
                        Abandoned drafts
                        <span className="ml-2 opacity-60">{draftCount}</span>
                    </button>
                </div>

                {/* SEARCH */}

                <div className="mt-7">
                    <input
                        type="search"
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder={
                            viewMode === "messages"
                                ? "Search by name, email or message..."
                                : "Search abandoned drafts..."
                        }
                        className="w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    />
                </div>

                {/* MESSAGE FILTERS */}

                {viewMode === "messages" && (
                    <div className="mt-5 flex flex-wrap items-center gap-2">
                        {([
                            ["all", "All messages", messages.length],
                            ["unread", "Unread", unreadCount],
                            ["important", "Important", importantCount],
                        ] as const).map(([value, label, count]) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFilter(value)}
                                className={`border px-4 py-2 text-xs transition ${
                                    filter === value
                                        ? "border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--accent)]"
                                        : "border-[var(--border)] text-[var(--muted)] hover:text-[var(--foreground)]"
                                }`}
                            >
                                {label}
                                <span className="ml-2 opacity-60">{count}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* LOADING */}

                {loading ? (
                    <div className="mt-12 border border-[var(--border)] p-10 text-center text-sm text-[var(--muted)]">
                        Loading your inbox...
                    </div>
                ) : viewMode === "messages" ? (

                    /* MESSAGES */

                    filteredMessages.length === 0 ? (
                        <div className="mt-8 border border-[var(--border)] p-12 text-center">
                            <p className="text-lg font-medium">
                                {messages.length === 0
                                    ? "Your inbox is empty."
                                    : "No matching messages."}
                            </p>

                            <p className="mt-2 text-sm text-[var(--muted)]">
                                {messages.length === 0
                                    ? "New contact form submissions will appear here."
                                    : "Try another search or filter."}
                            </p>

                            {search && (
                                <button
                                    type="button"
                                    onClick={() => setSearch("")}
                                    className="mt-5 text-xs text-[var(--accent)] hover:underline"
                                >
                                    Clear search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">

                            {/* MESSAGE LIST */}

                            <div className="space-y-2">
                                <div className="mb-3 flex items-center justify-between">
                                    <p className="text-xs uppercase tracking-wider text-[var(--muted)]">
                                        {filteredMessages.length} messages
                                    </p>
                                </div>

                                {filteredMessages.map((message) => (
                                    <div
                                        key={message.id}
                                        className={`relative border transition ${
                                            activeMessage?.id === message.id
                                                ? "border-[var(--accent)] bg-[var(--surface)]"
                                                : "border-[var(--border)] hover:bg-[var(--surface)]"
                                        }`}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setSelected(message)}
                                            className="w-full p-4 pr-14 text-left"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`h-2 w-2 shrink-0 ${
                                                        message.is_read
                                                            ? "bg-[var(--muted)] opacity-30"
                                                            : "bg-[var(--accent)]"
                                                    }`}
                                                />

                                                <span className="truncate text-sm font-semibold">
                                                    {message.name}
                                                </span>

                                                {!message.is_read && (
                                                    <span className="text-[9px] uppercase tracking-wider text-[var(--accent)]">
                                                        New
                                                    </span>
                                                )}
                                            </div>

                                            <p className="mt-2 truncate text-xs text-[var(--muted)]">
                                                {message.email}
                                            </p>

                                            <p className="mt-3 line-clamp-2 text-sm leading-5 text-[var(--muted)]">
                                                {message.message}
                                            </p>

                                            <p className="mt-4 text-[10px] text-[var(--muted)] opacity-60">
                                                {formatDate(message.created_at)}
                                            </p>
                                        </button>

                                        <button
                                            type="button"
                                            title={
                                                message.is_important
                                                    ? "Remove important mark"
                                                    : "Mark as important"
                                            }
                                            disabled={busyId === message.id}
                                            onClick={() => void toggleImportant(message)}
                                            className={`absolute right-4 top-4 text-xl transition hover:scale-110 disabled:opacity-40 ${
                                                message.is_important
                                                    ? "text-[var(--accent)]"
                                                    : "text-[var(--muted)] opacity-40 hover:opacity-100"
                                            }`}
                                        >
                                            {message.is_important ? "★" : "☆"}
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* MESSAGE DETAIL */}

                            <div className="border border-[var(--border)] lg:sticky lg:top-6">
                                {activeMessage ? (
                                    <div className="p-5 sm:p-7">

                                        <div className="flex flex-wrap items-start justify-between gap-4">
                                            <div className="min-w-0">
                                                <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">
                                                    Message details
                                                </p>

                                                <h2 className="mt-3 break-words text-2xl font-semibold">
                                                    {activeMessage.name}
                                                </h2>

                                                <a
                                                    href={`mailto:${activeMessage.email}`}
                                                    className="mt-2 block break-all text-sm text-[var(--accent)] hover:underline"
                                                >
                                                    {activeMessage.email}
                                                </a>
                                            </div>

                                            <span
                                                className={`border px-3 py-1 text-[10px] uppercase tracking-wider ${
                                                    activeMessage.is_read
                                                        ? "border-[var(--border)] text-[var(--muted)]"
                                                        : "border-[var(--accent)]/40 text-[var(--accent)]"
                                                }`}
                                            >
                                                {activeMessage.is_read ? "Read" : "Unread"}
                                            </span>
                                        </div>

                                        <div className="my-7 border-t border-[var(--border)]" />

                                        <div className="min-h-40">
                                            <p className="whitespace-pre-wrap break-words text-sm leading-7">
                                                {activeMessage.message}
                                            </p>
                                        </div>

                                        <p className="mt-7 text-xs text-[var(--muted)]">
                                            Received {formatDate(activeMessage.created_at)}
                                        </p>

                                        <div className="mt-7 flex flex-wrap gap-2 border-t border-[var(--border)] pt-6">

                                            <a
                                                href={`mailto:${activeMessage.email}?subject=${encodeURIComponent(`Re: Message from ${activeMessage.name}`)}`}
                                                className="border border-[var(--accent)] bg-[var(--accent)] px-4 py-2.5 text-xs font-semibold text-[var(--background)] transition hover:bg-transparent hover:text-[var(--accent)]"
                                            >
                                                Reply ↗
                                            </a>

                                            <button
                                                type="button"
                                                disabled={busyId === activeMessage.id}
                                                onClick={() => void toggleRead(activeMessage)}
                                                className="border border-[var(--border)] px-4 py-2.5 text-xs transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40"
                                            >
                                                Mark as {activeMessage.is_read ? "unread" : "read"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busyId === activeMessage.id}
                                                onClick={() => void toggleImportant(activeMessage)}
                                                className="border border-[var(--border)] px-4 py-2.5 text-xs transition hover:border-[var(--accent)] hover:text-[var(--accent)] disabled:opacity-40"
                                            >
                                                {activeMessage.is_important
                                                    ? "★ Important"
                                                    : "☆ Mark important"}
                                            </button>

                                            <button
                                                type="button"
                                                disabled={busyId === activeMessage.id}
                                                onClick={() => void deleteMessage(activeMessage.id)}
                                                className="border border-red-500/30 px-4 py-2.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex min-h-80 flex-col items-center justify-center p-8 text-center">
                                        <span className="text-3xl text-[var(--muted)] opacity-30">
                                            □
                                        </span>

                                        <p className="mt-4 text-sm font-medium">
                                            Select a message
                                        </p>

                                        <p className="mt-2 max-w-xs text-xs leading-5 text-[var(--muted)]">
                                            Choose a message from your inbox to read it and manage its status.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                ) : (

                    /* ABANDONED DRAFTS */

                    filteredDrafts.length === 0 ? (
                        <div className="mt-8 border border-[var(--border)] p-12 text-center">
                            <p className="text-lg font-medium">
                                {drafts.length === 0
                                    ? "No abandoned drafts."
                                    : "No matching drafts."}
                            </p>

                            <p className="mt-2 text-sm text-[var(--muted)]">
                                Unfinished contact forms will appear here when someone leaves without sending.
                            </p>
                        </div>
                    ) : (
                        <div className="mt-8 grid items-start gap-5 lg:grid-cols-[0.9fr_1.1fr]">

                            {/* DRAFT LIST */}

                            <div className="space-y-2">
                                <p className="mb-3 text-xs uppercase tracking-wider text-[var(--muted)]">
                                    {filteredDrafts.length} abandoned drafts
                                </p>

                                {filteredDrafts.map((draft) => (
                                    <button
                                        key={draft.id}
                                        type="button"
                                        onClick={() => setSelectedDraft(draft)}
                                        className={`w-full border p-4 text-left transition ${
                                            activeDraft?.id === draft.id
                                                ? "border-[var(--accent)] bg-[var(--surface)]"
                                                : "border-[var(--border)] hover:bg-[var(--surface)]"
                                        }`}
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="truncate text-sm font-semibold">
                                                {draft.name || "Unknown visitor"}
                                            </span>

                                            <span className="shrink-0 text-[9px] uppercase tracking-wider text-[var(--muted)]">
                                                Abandoned
                                            </span>
                                        </div>

                                        <p className="mt-2 truncate text-xs text-[var(--muted)]">
                                            {draft.email || "No email entered"}
                                        </p>

                                        <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
                                            {draft.message || "No message written yet."}
                                        </p>

                                        <p className="mt-4 text-[10px] text-[var(--muted)] opacity-60">
                                            Updated {formatDate(draft.updated_at)}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            {/* DRAFT DETAIL */}

                            <div className="border border-[var(--border)] lg:sticky lg:top-6">
                                {activeDraft ? (
                                    <div className="p-5 sm:p-7">
                                        <p className="text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">
                                            Abandoned contact draft
                                        </p>

                                        <h2 className="mt-3 break-words text-2xl font-semibold">
                                            {activeDraft.name || "Unknown visitor"}
                                        </h2>

                                        {activeDraft.email ? (
                                            <a
                                                href={`mailto:${activeDraft.email}`}
                                                className="mt-2 block break-all text-sm text-[var(--accent)] hover:underline"
                                            >
                                                {activeDraft.email}
                                            </a>
                                        ) : (
                                            <p className="mt-2 text-sm text-[var(--muted)]">
                                                No email entered
                                            </p>
                                        )}

                                        <div className="my-7 border-t border-[var(--border)]" />

                                        <p className="whitespace-pre-wrap break-words text-sm leading-7">
                                            {activeDraft.message || "No message was written."}
                                        </p>

                                        <div className="mt-8 space-y-3 border-t border-[var(--border)] pt-6 text-xs text-[var(--muted)]">
                                            <p>
                                                Started: {formatDate(activeDraft.created_at)}
                                            </p>

                                            <p>
                                                Last updated: {formatDate(activeDraft.updated_at)}
                                            </p>

                                            {activeDraft.abandoned_at && (
                                                <p>
                                                    Left site: {formatDate(activeDraft.abandoned_at)}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-7 flex flex-wrap gap-2">
                                            {activeDraft.email && (
                                                <a
                                                    href={`mailto:${activeDraft.email}`}
                                                    className="border border-[var(--border)] px-4 py-2.5 text-xs transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                                                >
                                                    Email visitor ↗
                                                </a>
                                            )}

                                            <button
                                                type="button"
                                                disabled={busyId === activeDraft.id}
                                                onClick={() => void deleteDraft(activeDraft.id)}
                                                className="border border-red-500/30 px-4 py-2.5 text-xs text-red-400 transition hover:bg-red-500/10 disabled:opacity-40"
                                            >
                                                Delete draft
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex min-h-80 items-center justify-center p-8 text-center text-sm text-[var(--muted)]">
                                        Select a draft to inspect it.
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}
            </div>
        </main>
    );
}
