import Link from "next/link";
import { createClient } from "../../lib/supabase/server";

type Job = {
  id: string;
  title: string;
  description: string;
  category: string;
  experience_level: string;
  budget_type: string;
  budget_min: number | null;
  budget_max: number | null;
  created_at: string;
};

export default async function JobsPage() {
  const supabase = await createClient();

  const { data: jobs, error } = await supabase
    .from("jobs")
    .select(
      "id, title, description, category, experience_level, budget_type, budget_min, budget_max, created_at"
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">Available Jobs</h1>

        <p className="mt-4 rounded bg-red-100 p-4 text-sm text-red-700">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Available Jobs</h1>

          <p className="mt-2 text-gray-600">
            Find your next technology project.
          </p>
        </div>

        <Link
          href="/jobs/new"
          className="rounded bg-black px-4 py-2 text-sm text-white"
        >
          Post a Job
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {jobs?.length === 0 && (
          <div className="rounded border p-8 text-center">
            <p className="text-gray-600">
              No open jobs available yet.
            </p>
          </div>
        )}

        {jobs?.map((job: Job) => (
          <article
            key={job.id}
            className="rounded-lg border p-6 hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {job.title}
                </h2>

                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  <span className="rounded bg-gray-100 px-2 py-1">
                    {job.category}
                  </span>

                  <span className="rounded bg-gray-100 px-2 py-1">
                    {job.experience_level}
                  </span>

                  <span className="rounded bg-gray-100 px-2 py-1">
                    {job.budget_type}
                  </span>
                </div>
              </div>

              <div className="text-right text-sm">
                <p className="font-medium">
                  {job.budget_min !== null && job.budget_max !== null
                    ? `$${job.budget_min} - $${job.budget_max}`
                    : "Budget not specified"}
                </p>
              </div>
            </div>

            <p className="mt-4 line-clamp-3 text-gray-600">
              {job.description}
            </p>

            <div className="mt-5">
              <Link
                href={`/jobs/${job.id}`}
                className="text-sm font-medium hover:underline"
              >
                View Job →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}