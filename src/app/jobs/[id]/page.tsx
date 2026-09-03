import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: job, error } = await supabase
    .from("jobs")
    .select(
      "id, title, description, category, experience_level, budget_type, budget_min, budget_max, created_at"
    )
    .eq("id", id)
    .eq("status", "open")
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-12">
        <p className="rounded bg-red-100 p-4 text-sm text-red-700">
          {error.message}
        </p>
      </main>
    );
  }

  if (!job) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/jobs"
        className="text-sm text-gray-600 hover:underline"
      >
        ← Back to Jobs
      </Link>

      <article className="mt-6 rounded-lg border p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                {job.category}
              </span>

              <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                {job.experience_level}
              </span>

              <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                {job.budget_type}
              </span>
            </div>
          </div>

          <div className="text-right">
            <p className="text-sm text-gray-500">Budget</p>

            <p className="text-xl font-semibold">
              {job.budget_min !== null && job.budget_max !== null
                ? `$${job.budget_min} - $${job.budget_max}`
                : "Not specified"}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Project Description</h2>

          <p className="mt-3 whitespace-pre-wrap leading-7 text-gray-700">
            {job.description}
          </p>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-gray-500">
            Posted on{" "}
            {new Date(job.created_at).toLocaleDateString()}
          </p>
        </div>

        <div className="mt-8">
          <Link
            href={`/jobs/${job.id}/apply`}
            className="block w-full rounded bg-black px-4 py-3 text-center text-white"
          >
            Apply for this Job
          </Link>
        </div>
      </article>
    </main>
  );
}