"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../lib/supabase/client";

export default function NewJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Development");
  const [experienceLevel, setExperienceLevel] = useState("entry");
  const [budgetType, setBudgetType] = useState("fixed");
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

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
      setMessage("You must be logged in to post a job.");
      setLoading(false);
      return;
    }

    const { data: clientProfile, error: clientError } = await supabase
      .from("client_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (clientError) {
      setMessage(clientError.message);
      setLoading(false);
      return;
    }

    if (!clientProfile) {
      setMessage(
        "Please create your client profile before posting a job."
      );
      setLoading(false);
      return;
    }

    const { error: jobError } = await supabase.from("jobs").insert({
      client_id: clientProfile.id,
      title,
      description,
      category,
      experience_level: experienceLevel,
      budget_type: budgetType,
      budget_min: budgetMin ? Number(budgetMin) : null,
      budget_max: budgetMax ? Number(budgetMax) : null,
      status: "open",
    });

    if (jobError) {
      setMessage(jobError.message);
      setLoading(false);
      return;
    }

    setMessage("Job posted successfully.");
    setLoading(false);

    router.push("/jobs");
    router.refresh();
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-bold">Post a Job</h1>

      <p className="mt-2 text-gray-600">
        Find the right technology professional for your project.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Job Title
          </label>

          <input
            type="text"
            placeholder="e.g. QA Engineer for Web Application"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Job Description
          </label>

          <textarea
            placeholder="Describe the project, responsibilities, requirements, and expected deliverables..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={8}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Category
          </label>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded border p-3"
          >
            <option value="Development">Development</option>
            <option value="QA">QA & Testing</option>
            <option value="DevOps">DevOps</option>
            <option value="Cloud">Cloud</option>
            <option value="AI & Data">AI & Data</option>
            <option value="Design">UI/UX Design</option>
            <option value="IT Support">IT Support</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Experience Level
          </label>

          <select
            value={experienceLevel}
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="w-full rounded border p-3"
          >
            <option value="entry">Entry Level</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
          </select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Budget Type
          </label>

          <select
            value={budgetType}
            onChange={(e) => setBudgetType(e.target.value)}
            className="w-full rounded border p-3"
          >
            <option value="fixed">Fixed Price</option>
            <option value="hourly">Hourly</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm font-medium">
              Minimum Budget
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 100"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Maximum Budget
            </label>

            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 500"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="w-full rounded border p-3"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Posting..." : "Post Job"}
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