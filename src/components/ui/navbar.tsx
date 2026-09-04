import Link from "next/link";
import { createClient } from "../../lib/supabase/server";
import AuthButton from "./auth-button";

export default async function Navbar() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultRole: "freelancer" | "client" | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("default_role")
      .eq("id", user.id)
      .maybeSingle();

    if (
      profile?.default_role === "freelancer" ||
      profile?.default_role === "client"
    ) {
      defaultRole = profile.default_role;
    }
  }

  return (
    <nav className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-xl font-bold">
          Tech Marketplace
        </Link>

        <div className="flex items-center gap-6">
          {!user && (
            <>
              <Link href="/jobs" className="text-sm hover:underline">
                Find Work
              </Link>

              <Link href="/" className="text-sm hover:underline">
                Find Talent
              </Link>
            </>
          )}

          {user && defaultRole === "freelancer" && (
            <>
              <Link href="/jobs" className="text-sm hover:underline">
                Find Work
              </Link>

              <Link
                href="/applications"
                className="text-sm hover:underline"
              >
                My Applications
              </Link>

              <Link
                href="/contracts"
                className="text-sm hover:underline"
              >
                My Contracts
              </Link>
            </>
          )}

          {user && defaultRole === "client" && (
            <>
              <Link href="/" className="text-sm hover:underline">
                Find Talent
              </Link>

              <Link
                href="/jobs/my"
                className="text-sm hover:underline"
              >
                My Jobs
              </Link>

              <Link
                href="/contracts"
                className="text-sm hover:underline"
              >
                My Contracts
              </Link>
            </>
          )}

          <AuthButton />
        </div>
      </div>
    </nav>
  );
}