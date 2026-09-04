"use server";

import { createClient } from "../../lib/supabase/server";

export async function completeContract(contractId: string) {
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

  const { data: contract, error: contractError } = await supabase
    .from("contracts")
    .select("id, client_id, status")
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

  if (contract.client_id !== clientProfile.id) {
    return {
      success: false,
      message: "You are not authorized to complete this contract.",
    };
  }

  if (contract.status !== "active") {
    return {
      success: false,
      message: "Only active contracts can be completed.",
    };
  }

  const { error: updateError } = await supabase
    .from("contracts")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", contractId)
    .eq("status", "active");

  if (updateError) {
    return {
      success: false,
      message: updateError.message,
    };
  }

  return {
    success: true,
    message: "Contract marked as completed.",
  };
}