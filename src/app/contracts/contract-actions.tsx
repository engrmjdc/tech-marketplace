"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeContract } from "./actions";

type ContractActionsProps = {
  contractId: string;
  status: string;
  isClient: boolean;
};

export default function ContractActions({
  contractId,
  status,
  isClient,
}: ContractActionsProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleComplete() {
    const confirmed = window.confirm(
      "Are you sure you want to mark this contract as completed?"
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setMessage("");

    const result = await completeContract(contractId);

    if (!result.success) {
      setMessage(result.message);
      setLoading(false);
      return;
    }

    router.refresh();
  }

  if (!isClient || status !== "active") {
    return null;
  }

  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={handleComplete}
        disabled={loading}
        className="rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Completing..." : "Mark as Completed"}
      </button>

      {message && (
        <p className="mt-3 rounded bg-red-100 p-3 text-sm text-red-700">
          {message}
        </p>
      )}
    </div>
  );
}