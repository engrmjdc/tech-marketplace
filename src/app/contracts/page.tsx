import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import ContractActions from "./contract-actions";
import ReviewForm from "./review-form";

export default async function ContractsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: freelancerProfile } = await supabase
    .from("freelancer_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const contractFilters: string[] = [];

  if (clientProfile?.id) {
    contractFilters.push(`client_id.eq.${clientProfile.id}`);
  }

  if (freelancerProfile?.id) {
    contractFilters.push(`freelancer_id.eq.${freelancerProfile.id}`);
  }

  if (contractFilters.length === 0) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">My Contracts</h1>

        <p className="mt-4 text-gray-600">
          You do not have a client or freelancer profile yet.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/profile/freelancer"
            className="rounded bg-black px-4 py-2 text-white"
          >
            Create Freelancer Profile
          </Link>

          <Link
            href="/profile/client"
            className="rounded border px-4 py-2"
          >
            Create Client Profile
          </Link>
        </div>
      </main>
    );
  }

  const { data: contracts, error } = await supabase
    .from("contracts")
    .select(
      `
      id,
      client_id,
      freelancer_id,
      contract_type,
      agreed_rate,
      estimated_duration,
      status,
      started_at,
      completed_at,
      jobs (
        id,
        title,
        category,
        description
      )
      `
    )
    .or(contractFilters.join(","))
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">My Contracts</h1>

        <p className="mt-4 rounded bg-red-100 p-4 text-sm text-red-700">
          {error.message}
        </p>
      </main>
    );
  }

  const contractIds = contracts?.map((contract) => contract.id) ?? [];

  const { data: reviews, error: reviewsError } =
    contractIds.length > 0
      ? await supabase
          .from("reviews")
          .select(
            "id, contract_id, reviewer_id, rating, comment, created_at"
          )
          .in("contract_id", contractIds)
      : { data: [], error: null };

  if (reviewsError) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="text-3xl font-bold">My Contracts</h1>

        <p className="mt-4 rounded bg-red-100 p-4 text-sm text-red-700">
          {reviewsError.message}
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-12">
      <div>
        <h1 className="text-3xl font-bold">My Contracts</h1>

        <p className="mt-2 text-gray-600">
          View your active and completed work agreements.
        </p>
      </div>

      <div className="mt-8 space-y-5">
        {contracts?.length === 0 && (
          <div className="rounded-lg border p-8 text-center">
            <p className="text-gray-600">
              You do not have any contracts yet.
            </p>
          </div>
        )}

        {contracts?.map((contract) => {
          const job = Array.isArray(contract.jobs)
            ? contract.jobs[0]
            : contract.jobs;

          const isClient =
            clientProfile?.id === contract.client_id;

          const currentUserReview = reviews?.find(
            (review) =>
              review.contract_id === contract.id &&
              review.reviewer_id === user.id
          );

          return (
            <article
              key={contract.id}
              className="rounded-lg border p-6"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h2 className="text-xl font-semibold">
                    {job?.title ?? "Contract"}
                  </h2>

                  <div className="mt-2 flex flex-wrap gap-2 text-sm">
                    {job?.category && (
                      <span className="rounded bg-gray-100 px-3 py-1">
                        {job.category}
                      </span>
                    )}

                    <span className="rounded bg-gray-100 px-3 py-1">
                      {contract.contract_type}
                    </span>

                    <span className="rounded bg-gray-100 px-3 py-1">
                      {isClient ? "Client" : "Freelancer"}
                    </span>
                  </div>
                </div>

                <span className="rounded bg-gray-100 px-3 py-1 text-sm">
                  {contract.status}
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
                    Agreed Rate
                  </p>

                  <p className="mt-1 font-medium">
                    {contract.agreed_rate !== null
                      ? `$${contract.agreed_rate}`
                      : "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Estimated Duration
                  </p>

                  <p className="mt-1 font-medium">
                    {contract.estimated_duration ??
                      "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">
                    Started On
                  </p>

                  <p className="mt-1 font-medium">
                    {new Date(
                      contract.started_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {contract.completed_at && (
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Completed On
                  </p>

                  <p className="mt-1 font-medium">
                    {new Date(
                      contract.completed_at
                    ).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center gap-4">
                {job?.id && (
                  <Link
                    href={`/jobs/${job.id}`}
                    className="text-sm font-medium hover:underline"
                  >
                    View Job →
                  </Link>
                )}
              </div>

              <ContractActions
                contractId={contract.id}
                status={contract.status}
                isClient={isClient}
              />

              {contract.status === "completed" &&
                !currentUserReview && (
                  <ReviewForm contractId={contract.id} />
                )}

              {contract.status === "completed" &&
                currentUserReview && (
                  <div className="mt-6 rounded-lg border p-5">
                    <h3 className="text-lg font-semibold">
                      Your Review
                    </h3>

                    <p className="mt-3 font-medium">
                      Rating: {currentUserReview.rating}/5
                    </p>

                    <p className="mt-2 whitespace-pre-wrap text-gray-700">
                      {currentUserReview.comment ||
                        "No written comment."}
                    </p>

                    <p className="mt-3 text-sm text-gray-500">
                      Submitted on{" "}
                      {new Date(
                        currentUserReview.created_at
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}
            </article>
          );
        })}
      </div>
    </main>
  );
}