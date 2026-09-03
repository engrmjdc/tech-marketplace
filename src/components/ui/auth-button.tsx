"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase/client";

export default function AuthButton() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  if (!email) {
    return (
      <a
        href="/login"
        className="rounded bg-black px-4 py-2 text-white"
      >
        Log in
      </a>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm">{email}</span>

      <button
        onClick={handleLogout}
        className="rounded border px-4 py-2"
      >
        Log out
      </button>
    </div>
  );
}