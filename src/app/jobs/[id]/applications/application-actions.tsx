"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateApplicationStatus } from "./actions";

type ApplicationActionsProps = {
  applicationId: string;
  status: string;
};

export default function ApplicationActions({
  applicationId,
  status,
}: ApplicationActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleStatusChange(
    newStatus: "accepted" | "rejected"
  ) {
    const confirmed = window.confirm(
      `Are you sure you want to ${newStatus} this application?`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await updateApplicationStatus(
      applicationId,
      newStatus
    );

    if (!result.success) {
      setMessage(result.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  if (status !== "pending") {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => handleStatusChange("accepted")}
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {loading ? "Updating..." : "Accept"}
        </button>

        <button
          type="button"
          onClick={() => handleStatusChange("rejected")}
          disabled={loading}
          className="rounded border px-4 py-2 text-sm disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      {message && (
        <p className="mt-3 rounded bg-red-100 p-3 text-sm text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}