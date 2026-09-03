import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../../../lib/supabase/server";
import ApplicationActions from "./application-actions";

export default async function JobApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="rounded bg-red-100 p-4 text-sm text-red-700">
          {clientError.message}
        </p>
      </main>
    );
  }

  if (!clientProfile) {
    redirect("/profile/client");
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, title")
    .eq("id", id)
    .eq("client_id", clientProfile.id)
    .maybeSingle();

  if (jobError) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <p className="rounded bg-red-100 p-4 text-sm text-red-700">
          {jobError.message}
        </p>
      </main>
    );
  }

  if (!job) {
    notFound();
  }

  const { data: applications, error: applicationsError } =
    await supabase
      .from("applications")
      .select(
        `
        id,
        freelancer_id,
        cover_letter,
        proposed_rate,
        estimated_duration,
        status,
        created_at,
        freelancer_profiles (
          title,
          hourly_rate,
          experience_years,
          availability,
          github_url,
          linkedin_url,
          portfolio_url,
          freelancer_skills (
            skill_id,
            skills (
              id,
              name,
              category
            )
          )
        )
        `
      )
      .eq("job_id", id)
      .order("created_at", { ascending: false });

  if (applicationsError) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Applications</h1>

        <p className="mt-4 rounded bg-red-100 p-4 text-sm text-red-700">
          {applicationsError.message}
        </p>
      </main>
    );
  }

  const freelancerIds = [
    ...new Set(
      applications?.map((application) => application.freelancer_id) ?? []
    ),
  ];

  const { data: freelancerProfiles, error: profilesError } =
    await supabase
      .from("freelancer_profiles")
      .select("id, user_id")
      .in("id", freelancerIds);

  if (profilesError) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Applications</h1>

        <p className="mt-4 rounded bg-red-100 p-4 text-sm text-red-700">
          {profilesError.message}
        </p>
      </main>
    );
  }

  const userIds =
    freelancerProfiles?.map((profile) => profile.user_id) ?? [];

  const { data: profiles, error: profilesError2 } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .in("id", userIds);

  if (profilesError2) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold">Applications</h1>

        <p className="mt-4 rounded bg-red-100 p-4 text-sm text-red-700">
          {profilesError2.message}
        </p>
      </main>
    );
  }

  const freelancerUserMap = new Map(
    freelancerProfiles?.map((profile) => [
      profile.id,
      profile.user_id,
    ])
  );

  const userProfileMap = new Map(
    profiles?.map((profile) => [profile.id, profile])
  );

  return (
    <main className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href="/jobs/my"
        className="text-sm text-gray-600 hover:underline"
      >
        ← Back to My Jobs
      </Link>

      <h1 className="mt-6 text-3xl font-bold">Applications</h1>

      <p className="mt-2 text-gray-600">{job.title}</p>

      <div className="mt-8 space-y-5">
        {applications?.length === 0 && (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-gray-600">No applications yet.</p>
          </div>
        )}

        {applications?.map((application) => {
          const freelancer = Array.isArray(
            application.freelancer_profiles
          )
            ? application.freelancer_profiles[0]
            : application.freelancer_profiles;

          const freelancerUserId = freelancerUserMap.get(
            application.freelancer_id
          );

          const profile = freelancerUserId
            ? userProfileMap.get(freelancerUserId)
            : null;

          const skills =
            freelancer?.freelancer_skills?.map(
              (freelancerSkill) => freelancerSkill.skills
            ) ?? [];

          return (
            <article
              key={application.id}
              className="rounded-lg border p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {profile?.full_name || "Freelancer"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-600">
                    {freelancer?.title ||
                      "Technology Professional"}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Applied on{" "}
                    {new Date(
                      application.created_at
                    ).toLocaleDateString()}
                  </p>
                </div>

                <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                  {application.status}
                </span>
              </div>

              {freelancer && (
                <div className="mt-6 rounded-lg bg-gray-50 p-5">
                  <h3 className="text-lg font-semibold">
                    Freelancer Profile
                  </h3>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-gray-500">
                        Professional Title
                      </p>

                      <p className="mt-1 font-medium">
                        {freelancer.title}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Experience
                      </p>

                      <p className="mt-1 font-medium">
                        {freelancer.experience_years !== null
                          ? `${freelancer.experience_years} years`
                          : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Hourly Rate
                      </p>

                      <p className="mt-1 font-medium">
                        {freelancer.hourly_rate !== null
                          ? `$${freelancer.hourly_rate}/hr`
                          : "Not specified"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">
                        Availability
                      </p>

                      <p className="mt-1 font-medium">
                        {freelancer.availability ??
                          "Not specified"}
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <p className="text-sm text-gray-500">
                        Skills
                      </p>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {skills.length > 0 ? (
                          skills.map((skill) => (
                            <span
                              key={skill.id}
                              className="rounded bg-white px-3 py-1 text-sm"
                            >
                              {skill.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No skills added.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-4 text-sm">
                    {freelancer.github_url && (
                      <a
                        href={freelancer.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        GitHub →
                      </a>
                    )}

                    {freelancer.linkedin_url && (
                      <a
                        href={freelancer.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        LinkedIn →
                      </a>
                    )}

                    {freelancer.portfolio_url && (
                      <a
                        href={freelancer.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium hover:underline"
                      >
                        Portfolio →
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-6">
                <h3 className="font-medium">Cover Letter</h3>

                <p className="mt-2 whitespace-pre-wrap text-gray-700">
                  {application.cover_letter}
                </p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
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
              </div>

              <ApplicationActions
                applicationId={application.id}
                status={application.status}
              />
            </article>
          );
        })}
      </div>
    </main>
  );
}