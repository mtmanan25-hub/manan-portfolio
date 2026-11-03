
"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
    currentImage?: string | null;
    onUpload: (url: string) => void;
};

export default function ProfileImageUpload({
    currentImage,
    onUpload,
}: Props) {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");

    async function handleUpload(
        event: React.ChangeEvent<HTMLInputElement>
    ) {
        const file = event.target.files?.[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setMessage("Please select an image file.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage("Image must be smaller than 5 MB.");
            return;
        }

        setUploading(true);
        setMessage("");

        const supabase = createClient();
        const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const filePath = `profile-${crypto.randomUUID()}.${extension}`;

        const { error } = await supabase.storage
            .from("profile-images")
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            setMessage("Upload failed: " + error.message);
            setUploading(false);
            return;
        }

        const { data } = supabase.storage
            .from("profile-images")
            .getPublicUrl(filePath);

        onUpload(data.publicUrl);
        setMessage("Image uploaded successfully!");
        setUploading(false);
        event.target.value = "";
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-5">
                <div className="h-24 w-24 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900">
                    {currentImage ? (
                        <img
                            src={currentImage}
                            alt="Profile preview"
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-xs text-zinc-500">
                            No image
                        </div>
                    )}
                </div>

                <div>
                    <label className="inline-block cursor-pointer border border-zinc-700 px-4 py-2 text-sm text-zinc-300 transition-colors hover:border-[#c4f56b] hover:text-[#c4f56b]">
                        {uploading ? "Uploading..." : "Choose image"}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleUpload}
                            disabled={uploading}
                            className="hidden"
                        />
                    </label>

                    <p className="mt-2 text-xs text-zinc-500">
                        JPG, PNG or WebP. Maximum 5 MB.
                    </p>
                </div>
            </div>

            {message && (
                <p className="text-sm text-zinc-400">{message}</p>
            )}
        </div>
    );
}
