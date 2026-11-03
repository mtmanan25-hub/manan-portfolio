
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteProjectButton({ id }: { id: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project? This cannot be undone."
    );

    if (!confirmed) return;

    setDeleting(true);

    const supabase = createClient();

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", id);

    setDeleting(false);

    if (error) {
      window.alert("Could not delete project: " + error.message);
      return;
    }

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={deleting}
      className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300 transition-colors hover:border-red-400 hover:bg-red-500/10 disabled:opacity-50"
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
