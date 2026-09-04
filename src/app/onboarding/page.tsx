import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("default_role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  if (!profile) {
    redirect("/");
  }

  if (profile.default_role === "client") {
    const { data: clientProfile, error: clientProfileError } =
      await supabase
        .from("client_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (clientProfileError) {
      throw new Error(clientProfileError.message);
    }

    if (!clientProfile) {
      redirect("/profile/client");
    }

    redirect("/jobs/my");
  }

  if (profile.default_role === "freelancer") {
    const { data: freelancerProfile, error: freelancerProfileError } =
      await supabase
        .from("freelancer_profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

    if (freelancerProfileError) {
      throw new Error(freelancerProfileError.message);
    }

    if (!freelancerProfile) {
      redirect("/profile/freelancer");
    }

    redirect("/jobs");
  }

  redirect("/");
}