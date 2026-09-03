"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "../../../../lib/supabase/client";

export default function ApplyPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [jobTitle, setJobTitle] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [proposedRate, setProposedRate] = useState("");
  const [estimatedDuration, setEstimatedDuration] = useState("");

  const [loadingJob, setLoadingJob] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadJob() {
      const supabase = createClient();

      const { data: job, error } = await supabase
        .from("jobs")
        .select("title")
        .eq("id", jobId)
        .eq("status", "open")
        .maybeSingle();

      if (error) {
        setMessage(error.message);
      } else if (!job) {
        setMessage("Job not found.");
      } else {
        setJobTitle(job.title);
      }

      setLoadingJob(false);
    }

    loadJob();
  }, [jobId]);

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
      setMessage("You must be logged in to apply for a job.");
      setLoading(false);
      return;
    }

    const { data: freelancerProfile, error: freelancerError } =
      await supabase
        .from("freelancer_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (freelancerError) {
      setMessage(freelancerError.message);
      setLoading(false);
      return;
    }

    if (!freelancerProfile) {
      setMessage(
        "Please create your freelancer profile before applying."
      );
      setLoading(false);
      return;
    }

    const { error: applicationError } = await supabase
      .from("applications")
      .insert({
        job_id: jobId,
        freelancer_id: freelancerProfile.id,
        cover_letter: coverLetter,
        proposed_rate: proposedRate
          ? Number(proposedRate)
          : null,
        estimated_duration: estimatedDuration || null,
      });

    if (applicationError) {
      setMessage(applicationError.message);
      setLoading(false);
      return;
    }

    router.push(`/jobs/${jobId}`);
    router.refresh();
  }

  if (loadingJob) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-12">
        <p>Loading job...</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link
        href={`/jobs/${jobId}`}
        className="text-sm text-gray-600 hover:underline"
      >
        ← Back to Job
      </Link>

      <h1 className="mt-6 text-3xl font-bold">
        Apply for this Job
      </h1>

      <p className="mt-2 text-gray-600">
        {jobTitle}
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Cover Letter
          </label>

          <textarea
            placeholder="Tell the client why you're a good fit for this project..."
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            required
            rows={8}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Proposed Rate
          </label>

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 250"
            value={proposedRate}
            onChange={(e) => setProposedRate(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Estimated Duration
          </label>

          <input
            type="text"
            placeholder="e.g. 2 weeks"
            value={estimatedDuration}
            onChange={(e) => setEstimatedDuration(e.target.value)}
            className="w-full rounded border p-3"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Application"}
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