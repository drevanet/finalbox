"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Nigeria() {
  const [paymentOption, setPaymentOption] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    if (!paymentOption) {
      setError("Please choose a payment option.");
      return;
    }

    setError("");

    if (paymentOption === "card") {
      router.push("/card");
    } else if (paymentOption === "transfer") {
      router.push("/transfer");
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-[550px] rounded-lg bg-white p-6 sm:p-8 shadow-md">
        <form onSubmit={handleSubmit}>
          {/* Payment Option */}
          <div className="mb-6">
            <label
              htmlFor="paymentOption"
              className="mb-2 block text-[15px] font-medium text-[#07074D]"
            >
              Choose Payment Option
            </label>

            <select
              id="paymentOption"
              name="paymentOption"
              value={paymentOption}
              onChange={(e) => {
                setPaymentOption(e.target.value);
                setError("");
              }}
              className="block w-full appearance-auto rounded-md border border-gray-300 bg-white px-3 py-3 text-[15px] font-medium text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option
                value=""
                className="bg-white text-gray-900"
              >
                -- Choose an option --
              </option>

              <option
                value="card"
                className="bg-white text-gray-900"
              >
                Card
              </option>

              <option
                value="transfer"
                className="bg-white text-gray-900"
              >
                Bank Transfer
              </option>
            </select>

            {error && (
              <p className="mt-2 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* Next Button */}
          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-8 py-3 text-center text-base font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Next
          </button>
        </form>
      </div>
    </main>
  );
}