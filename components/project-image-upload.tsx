"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  onUpload: (url: string) => void;
  currentImage?: string;
};

export default function ProjectImageUpload({
  onUpload,
  currentImage,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];

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
    const filePath = `${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from("project-images")
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
      .from("project-images")
      .getPublicUrl(filePath);

    onUpload(data.publicUrl);
    setMessage("Image uploaded successfully!");
    setUploading(false);
    e.target.value = "";
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-white/80">
        Project image
      </label>

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
        className="block w-full rounded-lg border border-white/10 bg-[#181916] p-3 text-sm text-white file:mr-4 file:rounded-md file:border-0 file:bg-[#c5f467] file:px-4 file:py-2 file:font-semibold file:text-black"
      />

      {uploading && (
        <p className="text-sm text-white/50">Uploading image...</p>
      )}

      {message && (
        <p className="text-sm text-[#c5f467]">{message}</p>
      )}

      {currentImage && (
        <img
          src={currentImage}
          alt="Project preview"
          className="max-h-48 rounded-lg border border-white/10 object-cover"
        />
      )}
    </div>
  );
}