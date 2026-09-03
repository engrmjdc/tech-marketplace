"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "../../../lib/supabase/client";
import SkillSelector from "../../../components/freelancer/skill-selector";

export default function FreelancerProfilePage() {
  const [title, setTitle] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [experienceYears, setExperienceYears] = useState("");
  const [availability, setAvailability] = useState("available");
  const [githubUrl, setGithubUrl] = useState("");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
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
        .from("freelancer_profiles")
        .select(
          "title, hourly_rate, experience_years, availability, github_url, linkedin_url, portfolio_url"
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setTitle(profile.title ?? "");
        setHourlyRate(profile.hourly_rate?.toString() ?? "");
        setExperienceYears(profile.experience_years?.toString() ?? "");
        setAvailability(profile.availability ?? "available");
        setGithubUrl(profile.github_url ?? "");
        setLinkedinUrl(profile.linkedin_url ?? "");
        setPortfolioUrl(profile.portfolio_url ?? "");

        const { data: freelancerSkills } = await supabase
          .from("freelancer_skills")
          .select("skill_id")
          .eq(
            "freelancer_id",
            (
              await supabase
                .from("freelancer_profiles")
                .select("id")
                .eq("user_id", user.id)
                .single()
            ).data?.id
          );

        setSelectedSkills(
          freelancerSkills?.map((skill) => skill.skill_id) ?? []
        );
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
      setMessage("You must be logged in to create a freelancer profile.");
      setLoading(false);
      return;
    }

    const { data: freelancerProfile, error: profileError } = await supabase
      .from("freelancer_profiles")
      .upsert(
        {
          user_id: user.id,
          title,
          hourly_rate: hourlyRate ? Number(hourlyRate) : null,
          experience_years: experienceYears
            ? Number(experienceYears)
            : null,
          availability,
          github_url: githubUrl || null,
          linkedin_url: linkedinUrl || null,
          portfolio_url: portfolioUrl || null,
        },
        {
          onConflict: "user_id",
        }
      )
      .select("id")
      .single();

    if (profileError || !freelancerProfile) {
      setMessage(profileError?.message ?? "Failed to save profile.");
      setLoading(false);
      return;
    }

    const { error: deleteSkillsError } = await supabase
      .from("freelancer_skills")
      .delete()
      .eq("freelancer_id", freelancerProfile.id);

    if (deleteSkillsError) {
      setMessage(deleteSkillsError.message);
      setLoading(false);
      return;
    }

    if (selectedSkills.length > 0) {
      const skillRows = selectedSkills.map((skillId) => ({
        freelancer_id: freelancerProfile.id,
        skill_id: skillId,
      }));

      const { error: skillsError } = await supabase
        .from("freelancer_skills")
        .insert(skillRows);

      if (skillsError) {
        setMessage(skillsError.message);
        setLoading(false);
        return;
      }
    }

    setMessage("Freelancer profile saved successfully.");
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
      <h1 className="text-3xl font-bold">Freelancer Profile</h1>

      <p className="mt-2 text-gray-600">
        Tell clients about your professional experience and skills.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Professional Title
          </label>

          <input
            type="text"
            placeholder="e.g. Software QA Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Hourly Rate
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 15"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Years of Experience
          </label>

          <input
            type="number"
            min="0"
            step="0.1"
            placeholder="e.g. 3"
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Availability
          </label>

          <select
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
            className="w-full rounded border p-3"
          >
            <option value="available">Available</option>
            <option value="part_time">Part-time</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Skills
          </label>

          <SkillSelector
            selectedSkills={selectedSkills}
            onChange={setSelectedSkills}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            GitHub URL
          </label>

          <input
            type="url"
            placeholder="https://github.com/..."
            value={githubUrl}
            onChange={(e) => setGithubUrl(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            LinkedIn URL
          </label>

          <input
            type="url"
            placeholder="https://linkedin.com/in/..."
            value={linkedinUrl}
            onChange={(e) => setLinkedinUrl(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Portfolio URL
          </label>

          <input
            type="url"
            placeholder="https://..."
            value={portfolioUrl}
            onChange={(e) => setPortfolioUrl(e.target.value)}
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