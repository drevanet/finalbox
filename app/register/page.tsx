"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { push, ref, serverTimestamp, set } from "firebase/database";
import { db } from "@/lib/firebase";

export default function Register() {
  const router = useRouter();

  const [user, setUser] = useState("");
  const [phone, setPhone] = useState("");
  const [mail, setMail] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getPaymentUrl = (selectedCountry: string) => {
    switch (selectedCountry) {
      case "UK":
      case "US":
      case "Canada":
      case "Newzealand":
      case "Europe":
      case "others":
        return "https://bettystoredigital.lemonsqueezy.com/checkout/buy/48651416-37a9-40b3-947c-d7f05c768237?media=0&logo=0&desc=0&discount=0";

      case "SA":
        return "https://flutterwave.com/pay/footballsouthafrica";

      case "Ghana":
        return "https://flutterwave.com/pay/footballghana";

      case "Kenya":
        return "https://flutterwave.com/pay/footballkenya";

      default:
        return null;
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (loading) return;

    setError("");

    const cleanName = user.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = mail.trim().toLowerCase();

    // Validation
    if (!cleanName || !cleanPhone || !cleanEmail || !country) {
      setError("Please fill out all fields and select your country.");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(cleanEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      /*
       * Save registration to Firebase Realtime Database
       *
       * USERS/
       *   generated-id/
       *     user
       *     phone
       *     mail
       *     country
       *     timestamp
       */

      const usersRef = ref(db, "USERS");
      const newUserRef = push(usersRef);

      await set(newUserRef, {
        user: cleanName,
        phone: cleanPhone,
        mail: cleanEmail,
        country: country,
        timestamp: serverTimestamp(),
      });

      /*
       * IMPORTANT:
       *
       * Turn loading OFF before navigating away.
       *
       * This prevents the button from remaining
       * in the "Processing..." state if this component
       * remains mounted during navigation.
       */

      // Nigeria
      if (country === "Nigeria") {
        setLoading(false);

        router.push("/nigeria");

        return;
      }

      /*
       * All other countries
       */

      const paymentUrl = getPaymentUrl(country);

      if (!paymentUrl) {
        setLoading(false);

        setError(
          "A payment option is not currently available for your selected country."
        );

        return;
      }

      /*
       * Turn loading off BEFORE leaving the page.
       */

      setLoading(false);

      /*
       * External payment redirect
       */

      window.location.href = paymentUrl;
    } catch (err) {
      console.error("Registration error:", err);

      /*
       * Always reset loading when an error occurs.
       */

      setLoading(false);

      setError(
        "We could not save your registration. Please check your internet connection and try again."
      );
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 pt-24 sm:px-6 lg:px-8 font-sans antialiased selection:bg-indigo-500 selection:text-white">

      {/* =========================================================
          TOP PAYMENT NOTICE
      ========================================================== */}

      <div className="fixed top-0 left-0 right-0 z-50 bg-[#023363] px-4 py-3 text-center shadow-md">
        <p className="text-xs sm:text-sm font-bold tracking-wide text-white">
          Charged once for the first month and twice for the subsequent months
        </p>
      </div>

      {/* =========================================================
          HEADER
      ========================================================== */}

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">

        <div className="flex justify-center">
          <div className="inline-flex items-center justify-center px-3 py-1 mb-5 text-[11px] font-bold tracking-wider text-indigo-700 uppercase bg-indigo-50 rounded-full border border-indigo-100">
            🔥 50% Off First Month
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight text-center leading-none">
          Betis Spot Activation
        </h1>

        <p className="mt-3 text-center text-sm text-slate-500">
          Enter your details to continue with your activation.
        </p>

      </div>

      {/* =========================================================
          REGISTRATION CARD
      ========================================================== */}

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-[480px] px-4">

        <div className="bg-white py-9 px-6 shadow-xl shadow-slate-200/50 rounded-2xl border border-slate-100/80 sm:px-10">

          {/* =====================================================
              ERROR MESSAGE
          ====================================================== */}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm font-semibold text-red-700">
                {error}
              </p>
            </div>
          )}

          {/* =====================================================
              FORM
          ====================================================== */}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            {/* ===================================================
                FULL NAME
            ==================================================== */}

            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                Full Name
              </label>

              <div className="relative group">

                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>

                </div>

                <input
                  type="text"
                  id="name"
                  name="name"
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="John Doe"
                  autoComplete="name"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400/80 transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />

              </div>
            </div>

            {/* ===================================================
                PHONE NUMBER
            ==================================================== */}

            <div>
              <label
                htmlFor="phone"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                Phone Number
              </label>

              <div className="relative group">

                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.72.13.13 0 01.02.06l.8 3.2a1 1 0 01-.07.831l-1.39 1.39a11.942 11.942 0 005.454 5.454l1.39-1.39a1 1 0 01.911-.271l3.2.8a1 1 0 01.712.959V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>

                </div>

                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+44 7000 000000"
                  autoComplete="tel"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400/80 transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />

              </div>
            </div>

            {/* ===================================================
                EMAIL
            ==================================================== */}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                Email Address
              </label>

              <div className="relative group">

                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>

                </div>

                <input
                  type="email"
                  id="email"
                  name="email"
                  value={mail}
                  onChange={(e) => setMail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 py-3 pl-10 pr-4 text-sm font-semibold text-slate-800 placeholder-slate-400/80 transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none disabled:opacity-60 disabled:cursor-not-allowed"
                />

              </div>
            </div>

            {/* ===================================================
                COUNTRY
            ==================================================== */}

            <div>
              <label
                htmlFor="country"
                className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2"
              >
                Country / Region
              </label>

              <div className="relative">

                <select
                  id="country"
                  name="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/40 py-3 px-4 text-sm font-semibold text-slate-800 transition-all duration-200 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 outline-none cursor-pointer appearance-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    --Choose your location--
                  </option>

                  <option value="UK">
                    United Kingdom
                  </option>

                  <option value="US">
                    United States
                  </option>

                  <option value="Nigeria">
                    Nigeria
                  </option>

                  <option value="Canada">
                    Canada
                  </option>

                  <option value="SA">
                    South Africa
                  </option>

                  <option value="Newzealand">
                    New Zealand
                  </option>

                  <option value="Europe">
                    Europe
                  </option>

                  <option value="Ghana">
                    Ghana
                  </option>

                  <option value="Kenya">
                    Kenya
                  </option>

                  <option value="others">
                    Other Countries
                  </option>
                </select>

                {/* Dropdown Arrow */}

                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400">

                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>

                </div>

              </div>
            </div>

            {/* ===================================================
                SUBMIT BUTTON
            ==================================================== */}

            <div className="pt-2">

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-slate-900 to-indigo-950 hover:from-indigo-950 hover:to-slate-900 shadow-lg shadow-slate-900/10 py-4 px-8 rounded-xl text-center text-sm font-bold text-white transition-all duration-200 active:scale-[0.98] outline-none cursor-pointer tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              >

                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />

                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>

                    Processing...
                  </>
                ) : (
                  <>
                    Next

                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M14 5l7 7m0 0l-7 7m7-7H3"
                      />
                    </svg>
                  </>
                )}

              </button>

            </div>

          </form>

          {/* =====================================================
              SUPPORT
          ====================================================== */}

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">

            <p className="text-xs text-slate-400 font-medium">
              Need help making payment?{" "}

              <a
                href="https://wa.me/447541095459"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors inline-flex items-center gap-1 ml-0.5 text-[15px]"
              >
                Click to chat Support
              </a>

            </p>

          </div>

        </div>

      </div>

    </main>
  );
}