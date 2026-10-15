"use client";

import { useEffect, useState } from "react";

export default function Transfer() {
  const [packageType, setPackageType] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Reset loading state when the browser restores this page
  // after returning from the payment page.
  useEffect(() => {
    const handlePageShow = () => {
      setLoading(false);
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pageshow", handlePageShow);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (loading) return;

    if (!packageType) {
      setError("Please choose a subscription package.");
      return;
    }

    setError("");
    setLoading(true);

    let paymentUrl = "";

    switch (packageType) {
      case "one":
        paymentUrl = "https://paystack.shop/pay/3z128hy9m0";
        break;

      case "three":
        paymentUrl = "https://paystack.shop/pay/wz7koxx4m-";
        break;

      case "six":
        paymentUrl = "https://paystack.shop/pay/bettysixmthspay";
        break;

      case "year":
        paymentUrl = "https://paystack.shop/pay/bettyoneyearpay";
        break;

      default:
        paymentUrl = "";
    }

    if (!paymentUrl) {
      setLoading(false);
      setError("Invalid subscription package.");
      return;
    }

    // Go to Paystack
    window.location.assign(paymentUrl);
  };

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-[550px] rounded-lg bg-white p-6 shadow-md sm:p-8">
        <form onSubmit={handleSubmit}>
          {/* Subscription Package */}
          <div className="mb-6">
            <label
              htmlFor="package"
              className="mb-2 block text-[15px] font-medium text-[#07074D]"
            >
              Choose Subscription Package
            </label>

            <select
              id="package"
              name="package"
              value={packageType}
              onChange={(e) => {
                setPackageType(e.target.value);
                setError("");
              }}
              disabled={loading}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-3 text-[15px] font-medium text-gray-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-gray-100"
            >
              <option value="" className="bg-white text-gray-900">
                -- Choose an option --
              </option>

              <option value="one" className="bg-white text-gray-900">
                One Month (₦3,590.00)
              </option>

              <option value="three" className="bg-white text-gray-900">
                Three Months (₦8,600.00)
              </option>

              <option value="six" className="bg-white text-gray-900">
                Six Months (₦14,000.00)
              </option>

              <option value="year" className="bg-white text-gray-900">
                One Year (₦25,850.00)
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
            disabled={loading}
            className="w-full rounded-md bg-blue-500 px-8 py-3 text-center text-base font-semibold text-white outline-none transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Redirecting..." : "Next"}
          </button>
        </form>
      </div>
    </main>
  );
}