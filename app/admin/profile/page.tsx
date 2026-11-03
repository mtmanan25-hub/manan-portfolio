
"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import ProfileImageUpload from "@/components/profile-image-upload";

type Profile = {
  id: string;
  name: string;
  headline: string | null;
  about: string | null;
  location: string | null;
  email: string | null;
  avatar_url: string | null;
};

export default function ProfileManager() {
  const supabase = createClient();

  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [location, setLocation] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadProfile() {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (error) {
        setMessage("Could not load profile: " + error.message);
      } else if (data) {
        setProfile(data);
        setName(data.name || "");
        setHeadline(data.headline || "");
        setAbout(data.about || "");
        setLocation(data.location || "");
        setEmail(data.email || "");
        setAvatarUrl(data.avatar_url || "");
      }

      setLoading(false);
    }

    loadProfile();
  }, []);

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    const values = {
      name,
      headline,
      about,
      location,
      email,
      avatar_url: avatarUrl || null,
      updated_at: new Date().toISOString(),
    };

    const result = profile
      ? await supabase.from("profile").update(values).eq("id", profile.id)
      : await supabase.from("profile").insert(values);

    if (result.error) {
      setMessage("Error: " + result.error.message);
    } else {
      setMessage("Profile saved successfully!");

      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        setAvatarUrl(data.avatar_url || "");
      }
    }

    setSaving(false);
  }

  const fieldClass =
    "w-full rounded-lg border border-white/10 bg-[#111] px-4 py-3 text-sm text-white outline-none focus:border-lime-400";

  if (loading) {
    return (
      <main className="min-h-screen bg-[#090909] p-8 text-white">
        Loading profile...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090909] px-6 py-10 text-white">
      <div className="mx-auto max-w-3xl">
        <a href="/admin" className="text-sm text-lime-400 hover:underline">
          ← Back to dashboard
        </a>

        <p className="mt-10 text-xs tracking-[0.3em] text-lime-400">
          ADMIN / PROFILE
        </p>

        <h1 className="mt-3 text-4xl font-semibold">Profile Manager</h1>

        <p className="mt-3 text-sm text-white/50">
          Update the information displayed on your portfolio.
        </p>

        <form onSubmit={saveProfile} className="mt-10 space-y-6">
          <div>
            <label className="mb-4 block text-sm text-white/70">
              Profile Picture
            </label>

            <ProfileImageUpload
              currentImage={avatarUrl}
              onUpload={(url) => {
                setAvatarUrl(url);
                setMessage("Image uploaded. Save your profile to publish it.");
              }}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">Name</label>
            <input
              className={fieldClass}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">Headline</label>
            <input
              className={fieldClass}
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="Developer & Tech Enthusiast"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">About</label>
            <textarea
              className={fieldClass}
              value={about}
              onChange={(e) => setAbout(e.target.value)}
              rows={6}
              placeholder="Write a short introduction..."
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">Location</label>
            <input
              className={fieldClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-white/70">
              Public email
            </label>
            <input
              type="email"
              className={fieldClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-lime-400 px-6 py-3 text-sm font-semibold text-black transition hover:bg-lime-300 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Profile"}
          </button>

          {message && (
            <p className="text-sm text-lime-400">{message}</p>
          )}
        </form>
      </div>
    </main>
  );
}
