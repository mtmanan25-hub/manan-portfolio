
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Education = {
    id: string;
    title: string;
    institution: string;
    description: string | null;
    category: string;
    start_year: number | null;
    end_year: number | null;
    display_order: number;
    published: boolean;
};

const emptyForm = {
    title: "",
    institution: "",
    description: "",
    category: "Education",
    start_year: "",
    end_year: "",
    display_order: "0",
    published: true,
};

export default function EducationManager() {
    const [items, setItems] = useState<Education[]>([]);
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function loadItems() {
        const supabase = createClient();

        const { data, error } = await supabase
            .from("education")
            .select("*")
            .order("display_order", { ascending: true })
            .order("created_at", { ascending: false });

        if (error) {
            setError("Unable to load records.");
        } else {
            setItems(data ?? []);
        }

        setLoading(false);
    }

    useEffect(() => {
        loadItems();
    }, []);

    function updateField(
        field: keyof typeof emptyForm,
        value: string | boolean
    ) {
        setForm((previous) => ({
            ...previous,
            [field]: value,
        }));
    }

    function resetForm() {
        setForm(emptyForm);
        setEditingId(null);
        setError("");
        setSuccess("");
    }

    function editItem(item: Education) {
        setForm({
            title: item.title,
            institution: item.institution,
            description: item.description ?? "",
            category: item.category,
            start_year: item.start_year?.toString() ?? "",
            end_year: item.end_year?.toString() ?? "",
            display_order: item.display_order.toString(),
            published: item.published,
        });

        setEditingId(item.id);
        setSuccess("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function saveItem(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        const startYear = form.start_year
            ? Number(form.start_year)
            : null;

        const endYear = form.end_year
            ? Number(form.end_year)
            : null;

        const validYear = (year: number | null) =>
            year === null ||
            (Number.isInteger(year) && year >= 1900 && year <= 2100);

        if (!validYear(startYear) || !validYear(endYear)) {
            setError("Please enter valid years.");
            setSaving(false);
            return;
        }

        if (
            startYear !== null &&
            endYear !== null &&
            endYear < startYear
        ) {
            setError("End year cannot be earlier than start year.");
            setSaving(false);
            return;
        }

        const payload = {
            title: form.title.trim(),
            institution: form.institution.trim(),
            description: form.description.trim() || null,
            category: form.category,
            start_year: startYear,
            end_year: endYear,
            display_order: Number(form.display_order) || 0,
            published: form.published,
        };

        const supabase = createClient();

        const result = editingId
            ? await supabase
                .from("education")
                .update(payload)
                .eq("id", editingId)
            : await supabase.from("education").insert(payload);

        if (result.error) {
            setError(result.error.message);
        } else {
            setSuccess(editingId ? "Record updated!" : "Record added!");
            resetForm();
            await loadItems();
        }

        setSaving(false);
    }

    async function togglePublished(item: Education) {
        const supabase = createClient();

        const { error } = await supabase
            .from("education")
            .update({ published: !item.published })
            .eq("id", item.id);

        if (error) {
            setError("Unable to update publishing status.");
        } else {
            await loadItems();
        }
    }

    async function deleteItem(id: string) {
        if (!window.confirm("Delete this record permanently?")) return;

        const supabase = createClient();

        const { error } = await supabase
            .from("education")
            .delete()
            .eq("id", id);

        if (error) {
            setError("Unable to delete record.");
        } else {
            if (editingId === id) resetForm();
            await loadItems();
        }
    }

    return (
        <main className="min-h-screen bg-[#090909] px-5 py-10 text-white md:px-10">
            <div className="mx-auto max-w-5xl">
                <Link
                    href="/admin"
                    className="text-sm text-zinc-500 transition-colors hover:text-[#c4f56b]"
                >
                    &larr; Back to dashboard
                </Link>

                <div className="mt-8">
                    <p className="text-xs uppercase tracking-[0.2em] text-[#c4f56b]">
                        Admin / Content
                    </p>

                    <h1 className="mt-3 text-3xl font-semibold">
                        Education & Achievements
                    </h1>

                    <p className="mt-2 text-sm text-zinc-500">
                        Manage your education, certificates and milestones.
                    </p>
                </div>

                <form
                    onSubmit={saveItem}
                    className="mt-10 space-y-5 border border-zinc-800 p-5 md:p-7"
                >
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-lg font-semibold">
                            {editingId ? "Edit record" : "Add new record"}
                        </h2>

                        {editingId && (
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-xs text-zinc-500 hover:text-white"
                            >
                                Cancel editing
                            </button>
                        )}
                    </div>

                    <div className="grid gap-5 md:grid-cols-2">
                        <div>
                            <label className="mb-2 block text-xs text-zinc-400">
                                Title
                            </label>

                            <input
                                required
                                maxLength={120}
                                value={form.title}
                                onChange={(e) => updateField("title", e.target.value)}
                                placeholder="e.g. Secondary Education"
                                className="w-full border border-zinc-800 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#c4f56b]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs text-zinc-400">
                                Institution / Organisation
                            </label>

                            <input
                                required
                                maxLength={150}
                                value={form.institution}
                                onChange={(e) =>
                                    updateField("institution", e.target.value)
                                }
                                placeholder="School or organisation"
                                className="w-full border border-zinc-800 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#c4f56b]"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="mb-2 block text-xs text-zinc-400">
                            Description
                        </label>

                        <textarea
                            rows={3}
                            maxLength={1000}
                            value={form.description}
                            onChange={(e) =>
                                updateField("description", e.target.value)
                            }
                            placeholder="Add some details..."
                            className="w-full border border-zinc-800 bg-[#111] px-4 py-3 text-sm outline-none focus:border-[#c4f56b]"
                        />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-4">
                        <div>
                            <label className="mb-2 block text-xs text-zinc-400">
                                Category
                            </label>

                            <select
                                value={form.category}
                                onChange={(e) =>
                                    updateField("category", e.target.value)
                                }
                                className="w-full border border-zinc-800 bg-[#111] px-3 py-3 text-sm outline-none focus:border-[#c4f56b]"
                            >
                                <option value="Education">Education</option>
                                <option value="Achievement">Achievement</option>
                                <option value="Certificate">Certificate</option>
                                <option value="Experience">Experience</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-2 block text-xs text-zinc-400">
                                Start year
                            </label>

                            <input
                                type="number"
                                min="1900"
                                max="2100"
                                value={form.start_year}
                                onChange={(e) =>
                                    updateField("start_year", e.target.value)
                                }
                                placeholder="2025"
                                className="w-full border border-zinc-800 bg-[#111] px-3 py-3 text-sm outline-none focus:border-[#c4f56b]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs text-zinc-400">
                                End year
                            </label>

                            <input
                                type="number"
                                min="1900"
                                max="2100"
                                value={form.end_year}
                                onChange={(e) =>
                                    updateField("end_year", e.target.value)
                                }
                                placeholder="2026"
                                className="w-full border border-zinc-800 bg-[#111] px-3 py-3 text-sm outline-none focus:border-[#c4f56b]"
                            />
                        </div>

                        <div>
                            <label className="mb-2 block text-xs text-zinc-400">
                                Display order
                            </label>

                            <input
                                type="number"
                                value={form.display_order}
                                onChange={(e) =>
                                    updateField("display_order", e.target.value)
                                }
                                className="w-full border border-zinc-800 bg-[#111] px-3 py-3 text-sm outline-none focus:border-[#c4f56b]"
                            />
                        </div>
                    </div>

                    <label className="flex items-center gap-3 text-sm text-zinc-400">
                        <input
                            type="checkbox"
                            checked={form.published}
                            onChange={(e) =>
                                updateField("published", e.target.checked)
                            }
                            className="accent-[#c4f56b]"
                        />
                        Publish on website
                    </label>

                    {error && (
                        <p className="text-sm text-red-400">{error}</p>
                    )}

                    {success && (
                        <p className="text-sm text-[#c4f56b]">{success}</p>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-[#c4f56b] px-5 py-3 text-sm font-semibold text-[#090909] transition-opacity hover:opacity-90 disabled:opacity-50"
                    >
                        {saving
                            ? "Saving..."
                            : editingId
                                ? "Update record"
                                : "Add record"}
                    </button>
                </form>

                <div className="mt-12">
                    <h2 className="mb-5 text-xl font-semibold">
                        Your records ({items.length})
                    </h2>

                    {loading ? (
                        <p className="text-sm text-zinc-500">Loading...</p>
                    ) : items.length === 0 ? (
                        <p className="border border-zinc-800 p-8 text-sm text-zinc-500">
                            No records added yet.
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-col justify-between gap-4 border border-zinc-800 p-5 sm:flex-row sm:items-center"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <h3 className="font-semibold">{item.title}</h3>

                                            <span className="text-[10px] uppercase tracking-wider text-[#c4f56b]">
                                                {item.category}
                                            </span>
                                        </div>

                                        <p className="mt-1 text-sm text-zinc-400">
                                            {item.institution}
                                        </p>

                                        {item.start_year && (
                                            <p className="mt-1 text-xs text-zinc-600">
                                                {item.start_year}
                                                {item.end_year
                                                    ? ` — ${item.end_year}`
                                                    : " — Present"}
                                            </p>
                                        )}

                                        <p className="mt-2 text-xs text-zinc-600">
                                            {item.published ? "Published" : "Hidden"}
                                        </p>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() => editItem(item)}
                                            className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-zinc-500"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => togglePublished(item)}
                                            className="border border-zinc-700 px-3 py-2 text-xs text-zinc-300 hover:border-[#c4f56b] hover:text-[#c4f56b]"
                                        >
                                            {item.published ? "Hide" : "Publish"}
                                        </button>

                                        <button
                                            onClick={() => deleteItem(item.id)}
                                            className="border border-red-900 px-3 py-2 text-xs text-red-400 hover:bg-red-950"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
