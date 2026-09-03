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
    .select("id, job_id")
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

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", application.job_id)
    .eq("client_id", clientProfile.id)
    .maybeSingle();

  if (jobError) {
    return {
      success: false,
      message: jobError.message,
    };
  }

  if (!job) {
    return {
      success: false,
      message: "You are not authorized to update this application.",
    };
  }

  const { error: updateError } = await supabase
    .from("applications")
    .update({
      status,
    })
    .eq("id", applicationId);

  if (updateError) {
    return {
      success: false,
      message: updateError.message,
    };
  }

  return {
    success: true,
    message: `Application ${status}.`,
  };
}