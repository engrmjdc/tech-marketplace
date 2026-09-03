import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase/server";

export default async function MyJobsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: clientProfile, error: clientError } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clientError) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <p className="rounded bg-red-100 p-4 text-sm text-red-700">
          {clientError.message}
        </p>
      </main>
    );
  }

  if (!clientProfile) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">My Jobs</h1>

        <p className="mt-4 text-gray-600">
          You need to create a client profile before posting jobs.
        </p>

        <Link
          href="/profile/client"
          className="mt-6 inline-block rounded bg-black px-4 py-2 text-white"
        >
          Create Client Profile
        </Link>
      </main>
    );
  }

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select(
      "id, title, description, category, experience_level, budget_type, budget_min, budget_max, status, created_at"
    )
    .eq("client_id", clientProfile.id)
    .order("created_at", { ascending: false });

  if (jobsError) {
    return (
      <main className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">My Jobs</h1>

        <p className="mt-4 rounded bg-red-100 p-4 text-sm text-red-700">
          {jobsError.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Jobs</h1>

          <p className="mt-2 text-gray-600">
            Manage the jobs you have posted.
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
              You have not posted any jobs yet.
            </p>

            <Link
              href="/jobs/new"
              className="mt-4 inline-block text-sm font-medium hover:underline"
            >
              Post your first job →
            </Link>
          </div>
        )}

        {jobs?.map((job) => (
          <article
            key={job.id}
            className="rounded-lg border p-6"
          >
            <div className="flex items-start justify-between gap-6">
              <div>
                <h2 className="text-xl font-semibold">
                  {job.title}
                </h2>

                <div className="mt-2 flex flex-wrap gap-2 text-sm">
                  <span className="rounded bg-gray-100 px-3 py-1">
                    {job.category}
                  </span>

                  <span className="rounded bg-gray-100 px-3 py-1">
                    {job.experience_level}
                  </span>

                  <span className="rounded bg-gray-100 px-3 py-1">
                    {job.budget_type}
                  </span>

                  <span className="rounded bg-gray-100 px-3 py-1">
                    {job.status}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm text-gray-500">Budget</p>

                <p className="font-semibold">
                  {job.budget_min !== null &&
                  job.budget_max !== null
                    ? `$${job.budget_min} - $${job.budget_max}`
                    : "Not specified"}
                </p>
              </div>
            </div>

            <p className="mt-4 line-clamp-2 text-gray-600">
              {job.description}
            </p>

            <div className="mt-5 flex gap-4">
              <Link
                href={`/jobs/${job.id}`}
                className="text-sm font-medium hover:underline"
              >
                View Job →
              </Link>

              <Link
                href={`/jobs/${job.id}/applications`}
                className="text-sm font-medium hover:underline"
              >
                View Applications →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}