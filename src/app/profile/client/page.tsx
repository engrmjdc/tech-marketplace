"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";

export default function ClientProfilePage() {
  const [companyName, setCompanyName] = useState("");
  const [companyDescription, setCompanyDescription] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoadingProfile(false);
        return;
      }

      const { data: profile } = await supabase
        .from("client_profiles")
        .select(
          "company_name, company_description, website_url, industry"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setCompanyName(profile.company_name ?? "");
        setCompanyDescription(profile.company_description ?? "");
        setWebsiteUrl(profile.website_url ?? "");
        setIndustry(profile.industry ?? "");
      }

      setLoadingProfile(false);
    }

    loadProfile();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setMessage("You must be logged in to create a client profile.");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("client_profiles")
      .upsert(
        {
          user_id: user.id,
          company_name: companyName || null,
          company_description: companyDescription || null,
          website_url: websiteUrl || null,
          industry: industry || null,
        },
        {
          onConflict: "user_id",
        }
      );

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Client profile saved successfully.");
    setLoading(false);
  }

  if (loadingProfile) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p>Loading profile...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold">Client Profile</h1>

      <p className="mt-2 text-gray-600">
        Tell freelancers about your company and organization.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Company Name
          </label>

          <input
            type="text"
            placeholder="e.g. Acme Technologies"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Company Description
          </label>

          <textarea
            placeholder="Tell freelancers about your company..."
            value={companyDescription}
            onChange={(e) => setCompanyDescription(e.target.value)}
            rows={5}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Website URL
          </label>

          <input
            type="url"
            placeholder="https://example.com"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Industry
          </label>

          <input
            type="text"
            placeholder="e.g. Software, Fintech, E-commerce"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>

      {message && (
        <p className="mt-4 rounded bg-gray-100 p-3 text-sm">
          {message}
        </p>
      )}
    </main>
  );
}