'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '@/lib/firebase';

export default function Retrieve() {
  const [emails, setEmails] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const usersRef = ref(db, 'USERS');

    const unsubscribe = onValue(
      usersRef,
      (snapshot) => {
        const users = snapshot.val();

        if (!users || typeof users !== 'object') {
          setEmails([]);
          setLoading(false);
          return;
        }

        const emailList = Object.values(
          users as Record<string, { mail?: unknown } | null>
        )
          .map((user) =>
            typeof user?.mail === 'string'
              ? user.mail.trim()
              : ''
          )
          .filter((email) => {
            // Basic email format validation
            const basicEmailRegex =
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // Reject empty or incorrectly formatted addresses
            if (!basicEmailRegex.test(email)) {
              return false;
            }

            // Reject consecutive dots anywhere in the address
            if (email.includes('..')) {
              return false;
            }

            const [localPart, domain] = email.split('@');

            // Reject missing parts
            if (!localPart || !domain) {
              return false;
            }

            // Reject local parts starting or ending with a dot
            if (
              localPart.startsWith('.') ||
              localPart.endsWith('.')
            ) {
              return false;
            }

            // Reject domains starting or ending with a dot
            if (
              domain.startsWith('.') ||
              domain.endsWith('.')
            ) {
              return false;
            }

            // Reject domain labels that start or end with a hyphen
            const domainLabels = domain.split('.');

            if (
              domainLabels.some(
                (label) =>
                  !label ||
                  label.startsWith('-') ||
                  label.endsWith('-')
              )
            ) {
              return false;
            }

            return true;
          });

        // Remove duplicate emails, ignoring letter case
        const uniqueEmails = Array.from(
          new Map(
            emailList.map((email) => [
              email.toLowerCase(),
              email,
            ])
          ).values()
        );

        setEmails(uniqueEmails);
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

  // Copy text to clipboard
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
          throw new Error('Copy failed');
        }
      }

      setMessage('Copied successfully!');
    } catch (err) {
      console.error('Clipboard error:', err);
      setMessage('Unable to copy. Please try again.');
    }

    setTimeout(() => setMessage(''), 3000);
  };

  // Copy all emails for an email app's To field
  const copyAllEmails = () => {
    if (emails.length === 0) {
      setMessage('No valid email addresses to copy.');
      return;
    }

    copyText(emails.join(', '));
  };

  // Copy one email address
  const copySingleEmail = (email: string) => {
    copyText(email);
  };

  // Download helper
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

    URL.revokeObjectURL(url);
  };

  // Download TXT: one email per line
  const downloadTXT = () => {
    if (emails.length === 0) {
      setMessage('No valid email addresses to download.');
      return;
    }

    downloadFile(
      emails.join('\n'),
      'emails.txt',
      'text/plain;charset=utf-8'
    );
  };

  // Download JSON: an array of email addresses
  const downloadJSON = () => {
    if (emails.length === 0) {
      setMessage('No valid email addresses to download.');
      return;
    }

    downloadFile(
      JSON.stringify(emails, null, 2),
      'emails.json',
      'application/json'
    );
  };

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-2 text-2xl font-bold text-gray-900">
          Email Addresses
        </h1>

        <p className="mb-5 text-sm text-gray-500">
          Retrieve, validate, and export email addresses from Firebase.
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
                onClick={copyAllEmails}
                disabled={emails.length === 0}
                className="rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Copy All Emails
              </button>

              <button
                type="button"
                onClick={downloadTXT}
                disabled={emails.length === 0}
                className="rounded-lg bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download TXT
              </button>

              <button
                type="button"
                onClick={downloadJSON}
                disabled={emails.length === 0}
                className="rounded-lg bg-purple-600 px-4 py-3 font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Download JSON
              </button>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-gray-800">
                Valid email addresses
              </h2>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
                {emails.length} unique
              </span>
            </div>

            {emails.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
                No valid email addresses found.
              </p>
            ) : (
              <ul className="max-h-[500px] divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200">
                {emails.map((email) => (
                  <li
                    key={email.toLowerCase()}
                    className="flex items-center justify-between gap-3 p-3 transition hover:bg-gray-50"
                  >
                    <span className="min-w-0 break-all text-sm text-gray-700">
                      {email}
                    </span>

                    <button
                      type="button"
                      onClick={() => copySingleEmail(email)}
                      className="shrink-0 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      aria-label={`Copy ${email}`}
                    >
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <p className="mt-4 text-xs text-gray-500">
              Invalid formats and addresses containing consecutive dots
              are excluded. Duplicate addresses are removed without
              deleting or changing Firebase records.
            </p>
          </>
        )}
      </div>
    </main>
  );
}