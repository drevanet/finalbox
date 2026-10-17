
"use client";

import { useEffect, useState } from "react";
import { onValue, ref } from "firebase/database";
import { db } from "@/lib/firebase";

export default function Retrieve() {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");

  // Fetch email addresses from Firebase.
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

        const emailList = Object.values(
          users as Record<string, { mail?: unknown } | null>
        )
          .map((user) =>
            typeof user?.mail === "string"
              ? user.mail.trim()
              : ""
          )
          .filter((email) =>
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
          );

        // Remove duplicates, ignoring capitalization.
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

  // Copy text to clipboard with a fallback.
  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";

        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();

        const success = document.execCommand("copy");
        textarea.remove();

        if (!success) {
          throw new Error("Clipboard copy failed");
        }
      }

      return true;
    } catch (err) {
      console.error("Copy failed:", err);
      return false;
    }
  };

  // Copy all addresses for an email app's To field.
  const copyAllEmails = async () => {
    if (!emails.length) return;

    // Comma-separated addresses are suitable for the To field.
    const success = await copyText(emails.join(", "));

    setCopied(
      success
        ? `Copied ${emails.length} email addresses! Paste into To or BCC.`
        : "Copy failed. Please try again."
    );
  };

  // Copy a single email address.
  const copySingleEmail = async (email: string) => {
    const success = await copyText(email);

    setCopied(
      success
        ? `Copied ${email}`
        : "Copy failed. Please try again."
    );
  };

  // Download TXT: one email address per line.
  const downloadTXT = () => {
    if (!emails.length) return;

    downloadFile(
      emails.join("\n"),
      "email-addresses.txt",
      "text/plain;charset=utf-8"
    );
  };

  // Download JSON: an array of email addresses only.
  const downloadJSON = () => {
    if (!emails.length) return;

    downloadFile(
      JSON.stringify(emails, null, 2),
      "email-addresses.json",
      "application/json;charset=utf-8"
    );
  };

  // Shared download helper.
  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    link.remove();

    // Delay revocation to allow the download to start.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
        <h2 className="text-lg font-semibold text-slate-900">
          Email Addresses
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage, copy, and export subscriber email addresses.
        </p>
      </div>

      {/* Summary and action buttons */}
      <div className="flex flex-col gap-4 border-b border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 min-w-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800">
            {loading ? "..." : emails.length}
          </span>

          <div>
            <p className="text-sm font-medium text-slate-800">
              {loading
                ? "Loading email addresses"
                : "Unique email addresses"}
            </p>

            <p className="text-xs text-slate-500">
              Email addresses only. No names or phone numbers.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {/* Copy all */}
          <button
            type="button"
            onClick={copyAllEmails}
            disabled={loading || emails.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.8}
              stroke="currentColor"
              className="h-5 w-5"
            >
              <rect x="8" y="8" width="13" height="13" rx="2" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"
              />
            </svg>
            Copy All Emails
          </button>

          {/* Download TXT */}
          <button
            type="button"
            onClick={downloadTXT}
            disabled={loading || emails.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download TXT
          </button>

          {/* Download JSON */}
          <button
            type="button"
            onClick={downloadJSON}
            disabled={loading || emails.length === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Download JSON
          </button>
        </div>

        {/* Copy feedback */}
        {copied && (
          <div
            role="status"
            className="flex items-center justify-between gap-3 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
          >
            <span>{copied}</span>

            <button
              type="button"
              onClick={() => setCopied("")}
              className="shrink-0 font-medium hover:underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Email list */}
      <div className="p-5 sm:p-6">
        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Fetching email addresses from Firebase...
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
              Check that your USERS records contain a valid mail field.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Email list
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Click any address to copy it individually.
              </p>
            </div>

            <ol className="max-h-[500px] divide-y divide-slate-100 overflow-y-auto">
              {emails.map((email, index) => (
                <li
                  key={email.toLowerCase()}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-slate-50"
                >
                  <span className="w-7 shrink-0 text-right text-xs text-slate-400">
                    {index + 1}.
                  </span>

                  <button
                    type="button"
                    onClick={() => copySingleEmail(email)}
                    title="Click to copy this email address"
                    className="min-w-0 flex-1 break-all text-left text-sm text-slate-700 hover:text-blue-600 hover:underline"
                  >
                    {email}
                  </button>

                  <button
                    type="button"
                    onClick={() => copySingleEmail(email)}
                    aria-label={`Copy ${email}`}
                    className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-blue-50 hover:text-blue-600"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.8}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <rect
                        x="8"
                        y="8"
                        width="13"
                        height="13"
                        rx="2"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"
                      />
                    </svg>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
