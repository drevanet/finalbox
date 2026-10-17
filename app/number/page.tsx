
'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '@/lib/firebase';

const PAGE_SIZE = 100;

type UserRecord = {
  mail?: unknown;
  createdAt?: unknown;
  created_at?: unknown;
  timestamp?: unknown;
  dateCreated?: unknown;
  registeredAt?: unknown;
  created?: unknown;
  date?: unknown;
};

type EmailEntry = {
  email: string;
  key: string;
  createdTime: number | null;
};

function getCreatedTime(user: UserRecord): number | null {
  const fields = [
    user.createdAt,
    user.created_at,
    user.timestamp,
    user.dateCreated,
    user.registeredAt,
    user.created,
    user.date,
  ];

  for (const value of fields) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      // Support Unix timestamps in seconds or milliseconds.
      return value < 1e12 ? value * 1000 : value;
    }

    if (typeof value === 'string' && value.trim()) {
      const numeric = Number(value);

      if (Number.isFinite(numeric)) {
        return numeric < 1e12 ? numeric * 1000 : numeric;
      }

      const parsed = Date.parse(value);

      if (!Number.isNaN(parsed)) {
        return parsed;
      }
    }
  }

  return null;
}

// Firebase push IDs contain their creation time in the first 8 characters.
function getPushIdTime(key: string): number | null {
  const alphabet =
    '-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghijklmnopqrstuvwxyz';

  if (!/^[\w-]{20}$/.test(key)) {
    return null;
  }

  let time = 0;

  for (const char of key.slice(0, 8)) {
    const digit = alphabet.indexOf(char);

    if (digit < 0) return null;

    time = time * 64 + digit;
  }

  return time;
}

function isValidEmail(email: string): boolean {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return false;
  }

  if (email.includes('..')) {
    return false;
  }

  const parts = email.split('@');

  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;

  if (
    !localPart ||
    !domain ||
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    domain.startsWith('.') ||
    domain.endsWith('.')
  ) {
    return false;
  }

  const labels = domain.split('.');

  return labels.every(
    (label) =>
      label.length > 0 &&
      !label.startsWith('-') &&
      !label.endsWith('-')
  );
}

export default function Retrieve() {
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const usersRef = ref(db, 'USERS');

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const users = snapshot.val() as
          | Record<string, UserRecord | null>
          | null;

        if (!users || typeof users !== 'object') {
          setEmails([]);
          setCurrentPage(1);
          setLoading(false);
          return;
        }

        const entries: EmailEntry[] = Object.entries(users)
          .map(([key, user]) => {
            const email =
              typeof user?.mail === 'string'
                ? user.mail.trim()
                : '';

            const createdTime = user
              ? getCreatedTime(user)
              : null;

            return {
              email,
              key,
              createdTime:
                createdTime ?? getPushIdTime(key),
            };
          })
          .filter((entry) => isValidEmail(entry.email));

        // Oldest records first.
        entries.sort((a, b) => {
          if (
            a.createdTime !== null &&
            b.createdTime !== null
          ) {
            return (
              a.createdTime - b.createdTime ||
              a.key.localeCompare(b.key)
            );
          }

          if (a.createdTime !== null) return -1;
          if (b.createdTime !== null) return 1;

          // Fallback when timestamps are unavailable.
          return a.key.localeCompare(b.key);
        });

        // Deduplicate after sorting so the oldest occurrence wins.
        const seen = new Set<string>();

        const uniqueEntries = entries.filter((entry) => {
          const normalized = entry.email.toLowerCase();

          if (seen.has(normalized)) {
            return false;
          }

          seen.add(normalized);
          return true;
        });

        setEmails(uniqueEntries);
        setCurrentPage(1);
        setError('');
        setLoading(false);
      },
      (err) => {
        console.error('Firebase error:', err);
        setError('Failed to retrieve emails from Firebase.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const totalPages = Math.ceil(emails.length / PAGE_SIZE);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const currentEmails = emails.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const copyText = async (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');

        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);
        textarea.select();

        const successful = document.execCommand('copy');

        document.body.removeChild(textarea);

        if (!successful) {
          throw new Error('Clipboard copy failed.');
        }
      }

      setMessage('Copied successfully!');
    } catch (err) {
      console.error('Clipboard error:', err);
      setMessage('Unable to copy. Please try again.');
    }
  };

  // Copy only emails on the currently selected page.
  const copyCurrentPage = () => {
    if (currentEmails.length === 0) {
      setMessage('No email addresses on this page.');
      return;
    }

    copyText(
      currentEmails.map((entry) => entry.email).join(', ')
    );
  };

  const copySingleEmail = (email: string) => {
    copyText(email);
  };

  const downloadFile = (
    content: string,
    filename: string,
    mimeType: string
  ) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // Downloads include all valid, unique emails in oldest-first order.
  const downloadTXT = () => {
    downloadFile(
      emails.map((entry) => entry.email).join('\n'),
      'emails.txt',
      'text/plain;charset=utf-8'
    );
  };

  const downloadJSON = () => {
    downloadFile(
      JSON.stringify(
        emails.map((entry) => entry.email),
        null,
        2
      ),
      'emails.json',
      'application/json'
    );
  };

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Email Addresses
        </h1>

        <p className="mb-5 text-sm text-gray-500">
          Emails are sorted oldest first and displayed 100 per page.
        </p>

        {loading && (
          <p className="py-4 text-gray-500">
            Loading email addresses...
          </p>
        )}

        {error && (
          <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {message && (
          <p
            role="status"
            className="mb-4 rounded-md bg-blue-50 p-3 text-sm text-blue-700"
          >
            {message}
          </p>
        )}

        {!loading && !error && (
          <>
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <button
                type="button"
                onClick={copyCurrentPage}
                disabled={currentEmails.length === 0}
                className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Copy Current Page ({currentEmails.length})
              </button>

              <button
                type="button"
                onClick={downloadTXT}
                disabled={emails.length === 0}
                className="rounded-lg bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                Download All TXT
              </button>

              <button
                type="button"
                onClick={downloadJSON}
                disabled={emails.length === 0}
                className="rounded-lg bg-purple-600 px-4 py-3 font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                Download All JSON
              </button>
            </div>

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-gray-800">
                Valid email addresses
              </h2>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {emails.length} unique emails
              </span>
            </div>

            {emails.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No valid email addresses found.
              </p>
            ) : (
              <>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-gray-600">
                    Showing {startIndex + 1}–
                    {Math.min(startIndex + PAGE_SIZE, emails.length)} of{' '}
                    {emails.length}
                  </p>

                  <p className="text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </p>
                </div>

                <ul className="max-h-[500px] divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                  {currentEmails.map((entry) => (
                    <li
                      key={entry.key}
                      className="flex items-center justify-between gap-3 p-3 hover:bg-gray-50"
                    >
                      <span className="min-w-0 break-all text-sm text-gray-700">
                        {entry.email}
                      </span>

                      <button
                        type="button"
                        onClick={() => copySingleEmail(entry.email)}
                        className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        Copy
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            <p className="mt-4 text-xs text-gray-500">
              Copy Current Page copies no more than 100 emails. Downloads
              include all valid, unique addresses. Invalid addresses and
              consecutive dots are filtered out; Firebase records are
              not deleted or modified.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
