"use server";

import { createClient } from "../../lib/supabase/server";

export async function createReview(
  contractId: string,
  rating: number,
  comment: string
) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      success: false,
      message: "You must be logged in.",
    };
  }

  if (rating < 1 || rating > 5) {
    return {
      success: false,
      message: "Rating must be between 1 and 5.",
    };
  }

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select(
      `
      id,
      status,
      client_id,
      freelancer_id,
      client_profiles (
        user_id
      ),
      freelancer_profiles (
        user_id
      )
      `
    )
    .eq("id", contractId)
    .maybeSingle();

  if (contractError) {
    return {
      success: false,
      message: contractError.message,
    };
  }

  if (!contract) {
    return {
      success: false,
      message: "Contract not found.",
    };
  }

  if (contract.status !== "completed") {
    return {
      success: false,
      message: "Only completed contracts can be reviewed.",
    };
  }

  const clientProfile = Array.isArray(contract.client_profiles)
    ? contract.client_profiles[0]
    : contract.client_profiles;

  const freelancerProfile = Array.isArray(
    contract.freelancer_profiles
  )
    ? contract.freelancer_profiles[0]
    : contract.freelancer_profiles;

  if (!clientProfile || !freelancerProfile) {
    return {
      success: false,
      message: "Contract participants could not be found.",
    };
  }

  let reviewerRole: "client" | "freelancer";
  let revieweeId: string;

  if (user.id === clientProfile.user_id) {
    reviewerRole = "client";
    revieweeId = freelancerProfile.user_id;
  } else if (user.id === freelancerProfile.user_id) {
    reviewerRole = "freelancer";
    revieweeId = clientProfile.user_id;
  } else {
    return {
      success: false,
      message: "You are not authorized to review this contract.",
    };
  }

  const { data: existingReview, error: existingReviewError } =
    await supabase
      .from("reviews")
      .select("id")
      .eq("contract_id", contractId)
      .eq("reviewer_id", user.id)
      .maybeSingle();

  if (existingReviewError) {
    return {
      success: false,
      message: existingReviewError.message,
    };
  }

  if (existingReview) {
    return {
      success: false,
      message: "You have already reviewed this contract.",
    };
  }

  const { error: reviewError } = await supabase
    .from("reviews")
    .insert({
      contract_id: contractId,
      reviewer_id: user.id,
      reviewee_id: revieweeId,
      reviewer_role: reviewerRole,
      rating,
      comment: comment.trim() || null,
    });

  if (reviewError) {
    return {
      success: false,
      message: reviewError.message,
    };
  }

  return {
    success: true,
    message: "Review submitted successfully.",
  };
}