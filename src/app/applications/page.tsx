import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function MyApplicationsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: freelancerProfile, error: freelancerError } =
    await supabase
      .from("freelancer_profiles")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (freelancerError) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <p className="rounded bg-red-100 p-4 text-sm text-red-700">
          {freelancerError.message}
        </p>
      </main>
    );
  }

  if (!freelancerProfile) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">My Applications</h1>

        <p className="mt-4 text-gray-600">
          You need to create a freelancer profile before applying for jobs.
        </p>

        <Link
          href="/profile/freelancer"
          className="mt-6 inline-block rounded bg-black px-4 py-2 text-white"
        >
          Create Freelancer Profile
        </Link>
      </main>
    );
  }

  const { data: applications, error: applicationsError } =
    await supabase
      .from("applications")
      .select(
        `
        id,
        job_id,
        cover_letter,
        proposed_rate,
        estimated_duration,
        status,
        created_at,
        jobs (
          id,
          title,
          description,
          category,
          experience_level,
          budget_type,
          budget_min,
          budget_max,
          status
        )
        `
      )
      .eq("freelancer_id", freelancerProfile.id)
      .order("created_at", { ascending: false });

  if (applicationsError) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">My Applications</h1>

        <p className="mt-4 rounded bg-red-100 p-4 text-sm text-red-700">
          {applicationsError.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold">My Applications</h1>

        <p className="mt-2 text-gray-600">
          Track the jobs you have applied for.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {applications?.length === 0 && (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-gray-600">
              You have not applied for any jobs yet.
            </p>

            <Link
              href="/jobs"
              className="mt-4 inline-block text-sm font-medium hover:underline"
            >
              Browse Jobs →
            </Link>
          </div>
        )}

        {applications?.map((application) => {
          const job = Array.isArray(application.jobs)
            ? application.jobs[0]
            : application.jobs;

          return (
            <article
              key={application.id}
              className="rounded-lg border p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {job?.title ?? "Job"}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {job?.category && (
                      <span className="rounded bg-gray-100 px-3 py-1">
                        {job.category}
                      </span>
                    )}

                    {job?.experience_level && (
                      <span className="rounded bg-gray-100 px-3 py-1">
                        {job.experience_level}
                      </span>
                    )}

                    {job?.budget_type && (
                      <span className="rounded bg-gray-100 px-3 py-1">
                        {job.budget_type}
                      </span>
                    )}
                  </div>
                </div>

                <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                  {application.status}
                </span>
              </div>

              {job?.description && (
                <p className="mt-4 line-clamp-2 text-gray-600">
                  {job.description}
                </p>
              )}

              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-sm text-gray-500">
                    Proposed Rate
                  </p>

                  <p className="mt-1 font-medium">
                    {application.proposed_rate !== null
                      ? `$${application.proposed_rate}`
                      : "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Estimated Duration
                  </p>

                  <p className="mt-1 font-medium">
                    {application.estimated_duration ??
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Applied On
                  </p>

                  <p className="mt-1 font-medium">
                    {new Date(
                      application.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4">
                {job?.id && (
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    View Job →
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}