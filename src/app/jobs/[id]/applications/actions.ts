"use server";

import { createClient } from "../../../../lib/supabase/server";

export async function updateApplicationStatus(
  applicationId: string,
  status: "accepted" | "rejected"
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

  const { data: clientProfile, error: clientError } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (clientError) {
    return {
      success: false,
      message: clientError.message,
    };
  }

  if (!clientProfile) {
    return {
      success: false,
      message: "Client profile not found.",
    };
  }

  const { data: application, error: applicationError } = await supabase
    .from("applications")
    .select(
      `
      id,
      job_id,
      freelancer_id,
      proposed_rate,
      estimated_duration,
      status,
      jobs (
        id,
        client_id,
        budget_type
      ),
      freelancer_profiles (
        user_id
      )
      `
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (applicationError) {
    return {
      success: false,
      message: applicationError.message,
    };
  }

  if (!application) {
    return {
      success: false,
      message: "Application not found.",
    };
  }

  const job = Array.isArray(application.jobs)
    ? application.jobs[0]
    : application.jobs;

  const freelancerProfile = Array.isArray(
    application.freelancer_profiles
  )
    ? application.freelancer_profiles[0]
    : application.freelancer_profiles;

  if (!job) {
    return {
      success: false,
      message: "Job not found.",
    };
  }

  if (!freelancerProfile) {
    return {
      success: false,
      message: "Freelancer profile not found.",
    };
  }

  if (job.client_id !== clientProfile.id) {
    return {
      success: false,
      message: "You are not authorized to update this application.",
    };
  }

  if (application.status !== "pending") {
    return {
      success: false,
      message: "This application has already been processed.",
    };
  }

  if (status === "rejected") {
    const { error: rejectError } = await supabase
      .from("applications")
      .update({
        status: "rejected",
      })
      .eq("id", applicationId);

    if (rejectError) {
      return {
        success: false,
        message: rejectError.message,
      };
    }

    return {
      success: true,
      message: "Application rejected.",
    };
  }

  if (freelancerProfile.user_id === user.id) {
    return {
      success: false,
      message: "You cannot accept your own application.",
    };
  }

  const { error: contractError } = await supabase
    .from("contracts")
    .insert({
      application_id: application.id,
      job_id: application.job_id,
      client_id: clientProfile.id,
      freelancer_id: application.freelancer_id,
      contract_type: job.budget_type,
      agreed_rate: application.proposed_rate,
      estimated_duration: application.estimated_duration,
      status: "active",
    });

  if (contractError) {
    return {
      success: false,
      message: contractError.message,
    };
  }

  const { error: acceptError } = await supabase
    .from("applications")
    .update({
      status: "accepted",
    })
    .eq("id", applicationId);

  if (acceptError) {
    return {
      success: false,
      message: acceptError.message,
    };
  }

  return {
    success: true,
    message: "Application accepted and contract created.",
  };
}