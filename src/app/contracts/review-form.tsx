"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createReview } from "./review-actions";

type ReviewFormProps = {
  contractId: string;
};

export default function ReviewForm({
  contractId,
}: ReviewFormProps) {
  const router = useRouter();

  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setMessage("");

    const result = await createReview(
      contractId,
      Number(rating),
      comment
    );

    if (!result.success) {
      setMessage(result.message);
      setLoading(false);
      return;
    }

    setMessage(result.message);
    setLoading(false);

    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-6 rounded-lg border p-5"
    >
      <h3 className="text-lg font-semibold">
        Leave a Review
      </h3>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">
          Rating
        </label>

        <select
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-full rounded border p-3"
        >
          <option value="5">5 - Excellent</option>
          <option value="4">4 - Very Good</option>
          <option value="3">3 - Good</option>
          <option value="2">2 - Fair</option>
          <option value="1">1 - Poor</option>
        </select>
      </div>

      <div className="mt-4">
        <label className="mb-2 block text-sm font-medium">
          Comment
        </label>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={4}
          placeholder="Share your experience working on this contract..."
          className="w-full rounded border p-3"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>

      {message && (
        <p className="mt-3 rounded bg-gray-100 p-3 text-sm">
          {message}
        </p>
      )}
    </form>
  );
}