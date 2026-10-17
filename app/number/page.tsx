
"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";

export default function Retrieve() {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const usersRef = ref(db, "USERS");

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const users = snapshot.val();

        if (!users) {
          setEmails([]);
          setLoading(false);
          return;
        }

        // Extract email addresses only.
        const emailList = Object.values(
          users as Record<string, { mail?: unknown } | null>
        )
          .map((user) =>
            typeof user?.mail === "string"
              ? user.mail.trim()
              : ""
          )
          .filter((mail) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)
          );

        // Remove duplicates, ignoring letter case.
        const uniqueEmails = Array.from(
          new Map(
            emailList.map((email) => [
              email.toLowerCase(),
              email,
            ])
          ).values()
        );

        setEmails(uniqueEmails);
        setError("");
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching emails:", err);
        setError("Failed to fetch email addresses.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Download a text file: one email per line.
  const downloadTXT = () => {
    if (emails.length === 0) return;

    const content = emails.join("\n");

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "email-addresses.txt";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  // Download a JSON file containing only email addresses.
  const downloadJSON = () => {
    if (emails.length === 0) return;

    const content = JSON.stringify(emails, null, 2);

    const blob = new Blob([content], {
      type: "application/json;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "email-addresses.json";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Email Addresses
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Export subscriber email addresses from Firebase.
        </p>
      </div>

      {/* Summary and downloads */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800">
            {loading ? "..." : emails.length}
          </span>

          <div>
            <p className="text-sm font-medium text-slate-800">
              {loading
                ? "Loading emails"
                : "Unique email addresses"}
            </p>

            <p className="text-xs text-slate-500">
              Emails only — no names or phone numbers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={downloadTXT}
            disabled={loading || emails.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3v12m0 0 4-4m-4 4-4-4M5 17v3h14v-3"
              />
            </svg>
            Download TXT
          </button>

          <button
            type="button"
            onClick={downloadJSON}
            disabled={loading || emails.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M8 3v5h5M8 3l5 5m0-5h6a2 2 0 0 1 2 2v7m-8-4h8m-8 4h8"
              />
            </svg>
            Download JSON
          </button>
        </div>
      </div>

      {/* Email list */}
      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Fetching email addresses...
          </div>
        ) : error ? (
          <div
            role="alert"
            className="rounded-xl bg-red-50 p-4 text-sm text-red-600"
          >
            {error}
          </div>
        ) : emails.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No email addresses found.
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Check that your Firebase USERS records contain a
              valid mail field.
            </p>
          </div>
        ) : (
          <div className="max-h-[500px] overflow-y-auto rounded-xl border border-slate-200">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email list
              </p>
            </div>

            <ol className="divide-y divide-slate-100">
              {emails.map((email, index) => (
                <li
                  key={email.toLowerCase()}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <span className="w-7 shrink-0 pt-0.5 text-right text-xs text-slate-400">
                    {index + 1}.
                  </span>

                  <span className="break-all text-sm text-slate-700">
                    {email}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
