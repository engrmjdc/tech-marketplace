"use client";

import { FormEvent, useState } from "react";
import { createClient } from "../../lib/supabase/client";

export default function SignupPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [defaultRole, setDefaultRole] = useState<
    "freelancer" | "client"
  >("freelancer");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          default_role: defaultRole,
        },
      },
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Signup successful. Check your email if email confirmation is enabled."
      );
    }

    setLoading(false);
  }

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <h1 className="text-3xl font-bold">Create your account</h1>

      <p className="mt-2 text-gray-600">
        Join the Tech Marketplace.
      </p>

      <form onSubmit={handleSignup} className="mt-8 space-y-5">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Full Name
          </label>

          <input
            type="text"
            placeholder="Your full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Email
          </label>

          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Password
          </label>

          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded border p-3"
          />
        </div>

        <div>
          <p className="mb-3 text-sm font-medium">
            How do you want to use Tech Marketplace?
          </p>

          <div className="space-y-3">
            <label className="flex cursor-pointer items-start gap-3 rounded border p-4">
              <input
                type="radio"
                name="defaultRole"
                value="freelancer"
                checked={defaultRole === "freelancer"}
                onChange={() => setDefaultRole("freelancer")}
                className="mt-1"
              />

              <div>
                <p className="font-medium">I want to find work</p>

                <p className="mt-1 text-sm text-gray-600">
                  Create a freelancer profile, browse jobs, and submit
                  applications.
                </p>
              </div>
            </label>

            <label className="flex cursor-pointer items-start gap-3 rounded border p-4">
              <input
                type="radio"
                name="defaultRole"
                value="client"
                checked={defaultRole === "client"}
                onChange={() => setDefaultRole("client")}
                className="mt-1"
              />

              <div>
                <p className="font-medium">I want to hire talent</p>

                <p className="mt-1 text-sm text-gray-600">
                  Create a client profile, post jobs, and hire technology
                  professionals.
                </p>
              </div>
            </label>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      {message && (
        <p className="mt-4 rounded bg-gray-100 p-3 text-sm">
          {message}
        </p>
      )}
    </main>
  );
}