
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  onValue,
  ref,
  remove,
} from "firebase/database";
import { db } from "@/lib/firebase";

type UserRecord = {
  id: string;
  user?: string;
  phone?: string;
  mail?: string;
  country?: string;
  timestamp?: number | string;
  [key: string]: any;
};

const Retrieve = () => {
  const [data, setData] = useState<UserRecord[]>([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const itemsPerPage = 50;

  // ============================================================
  // FETCH USERS FROM FIREBASE REALTIME DATABASE
  // ============================================================
  useEffect(() => {
    const collectionRef = ref(db, "USERS");

    setLoading(true);

    const unsubscribe = onValue(
      collectionRef,
      (snapshot) => {
        const dataItem = snapshot.val();

        if (dataItem) {
          const displayItem: UserRecord[] = Object.entries(
            dataItem as Record<string, Partial<UserRecord> | null>
          )
            .map(([key, value]) => ({
              id: key,
              ...(value || {}),
            }) as UserRecord)
            .sort((a: UserRecord, b: UserRecord) => {
              return (
                Number(b.timestamp || 0) -
                Number(a.timestamp || 0)
              );
            });

          setData(displayItem);
        } else {
          setData([]);
        }

        setLoading(false);
      },
      (error) => {
        console.error(
          "Error loading subscribers:",
          error
        );

        setData([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ============================================================
  // SEARCH
  // ============================================================
  const filteredData = useMemo(() => {
    const searchTerm = search.toLowerCase().trim();

    if (!searchTerm) {
      return data;
    }

    return data.filter((item) => {
      return (
        String(item.user || "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(item.phone || "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(item.mail || "")
          .toLowerCase()
          .includes(searchTerm) ||
        String(item.country || "")
          .toLowerCase()
          .includes(searchTerm)
      );
    });
  }, [data, search]);

  // ============================================================
  // RESET PAGE AFTER SEARCH
  // ============================================================
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  // ============================================================
  // PAGINATION
  // ============================================================
  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredData.length / itemsPerPage
    )
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages
  );

  const indexOfLastItem =
    safeCurrentPage * itemsPerPage;

  const indexOfFirstItem =
    indexOfLastItem - itemsPerPage;

  const currentItems = filteredData.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  // ============================================================
  // DELETE SUBSCRIBER
  // ============================================================
  const handleDelete = async (userId: React.SetStateAction<string | null>) => {
    if (!userId || deletingId) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete this subscription?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(userId);

      const userRef = ref(
        db,
        `USERS/${userId}`
      );

      await remove(userRef);

      /*
       * No need to manually remove the item
       * from state because onValue() will
       * automatically update the list.
       */
    } catch (error) {
      console.error(
        "Error deleting subscriber:",
        error
      );

      alert(
        "Failed to delete subscriber. Please try again."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // FORMAT DATE
  // ============================================================
  type TimestampValue = number | string | null | undefined;

  const formatDate = (timestamp: TimestampValue): string => {
    if (!timestamp) {
      return "—";
    }

    const date = new Date(
      Number(timestamp)
    );

    if (Number.isNaN(date.getTime())) {
      return "—";
    }

    return date.toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  // ============================================================
  // GET INITIAL
  // ============================================================
  const getInitial = (name: string | undefined) => {
    const value = String(name || "").trim();

    if (!value) {
      return "?";
    }

    return value.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

      {/* ========================================================
          HEADER
      ======================================================== */}
      <div className="px-5 sm:px-6 py-5 border-b border-slate-200 bg-white">

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">

          {/* TITLE */}
          <div>

            <div className="flex items-center gap-3">

              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600">

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.7"
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952M15 19.128v-.003c0-.836.156-1.637.444-2.374M15 19.128v-.003c0-.836.156-1.637.444-2.374m0 0a9.373 9.373 0 0 0 1.681-2.753M12 14.25a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z"
                  />
                </svg>

              </div>

              <div>

                <h2 className="text-lg font-semibold text-slate-900">
                  Subscriptions
                </h2>

                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your subscribers
                </p>

              </div>

            </div>

          </div>

          {/* SEARCH */}
          <div className="relative w-full lg:w-96">

            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.7"
              stroke="currentColor"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.61 10.61Z"
              />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search name, phone, email..."
              className="w-full h-11 pl-11 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all focus:bg-white focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition"
                aria-label="Clear search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18 18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}

          </div>

        </div>

      </div>

      {/* ========================================================
          SUMMARY
      ======================================================== */}
      <div className="px-5 sm:px-6 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">

        <div className="flex items-center gap-2 text-sm text-slate-500">

          <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-lg bg-white border border-slate-200 font-semibold text-slate-700">
            {filteredData.length}
          </span>

          <span>
            {search
              ? "matching subscribers"
              : "total subscribers"}
          </span>

        </div>

        {search && (
          <span className="text-xs text-slate-400">
            Searching for{" "}
            <span className="font-medium text-slate-600">
              "{search}"
            </span>
          </span>
        )}

      </div>

      {/* ========================================================
          LOADING
      ======================================================== */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center">

          <svg
            className="w-8 h-8 animate-spin text-blue-600"
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

          <p className="mt-3 text-sm text-slate-500">
            Loading subscribers...
          </p>

        </div>
      ) : (
        <>
          {/* ======================================================
              DESKTOP TABLE
          ====================================================== */}
          <div className="hidden sm:block overflow-x-auto">

            <table className="w-full border-collapse">

              <thead>
                <tr className="bg-slate-50/80">

                  <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    #
                  </th>

                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Subscriber
                  </th>

                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Phone
                  </th>

                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Email
                  </th>

                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Country
                  </th>

                  <th className="px-4 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Joined
                  </th>

                  <th className="px-6 py-3.5 text-center text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Action
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">

                {currentItems.length > 0 ? (
                  currentItems.map(
                    (item, index) => (

                      <tr
                        key={item.id}
                        className="group hover:bg-blue-50/30 transition-colors duration-150"
                      >

                        {/* NUMBER */}
                        <td className="px-6 py-4 whitespace-nowrap">

                          <span className="text-xs font-medium text-slate-400">
                            {indexOfFirstItem +
                              index +
                              1}
                          </span>

                        </td>

                        {/* SUBSCRIBER */}
                        <td className="px-4 py-4">

                          <div className="flex items-center gap-3 min-w-[170px]">

                            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
                              {getInitial(
                                item.user
                              )}
                            </div>

                            <div className="min-w-0">

                              <div className="font-medium text-slate-800 truncate">
                                {item.user ||
                                  "Unknown"}
                              </div>

                              <div className="text-[11px] text-slate-400">
                                Subscriber
                              </div>

                            </div>

                          </div>

                        </td>

                        {/* PHONE */}
                        <td className="px-4 py-4 whitespace-nowrap">

                          <span className="text-sm text-slate-600">
                            {item.phone || "—"}
                          </span>

                        </td>

                        {/* EMAIL */}
                        <td className="px-4 py-4">

                          <span className="text-sm text-slate-600 break-all">
                            {item.mail || "—"}
                          </span>

                        </td>

                        {/* COUNTRY */}
                        <td className="px-4 py-4 whitespace-nowrap">

                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-medium text-slate-600">
                            {item.country ||
                              "—"}
                          </span>

                        </td>

                        {/* JOINED */}
                        <td className="px-4 py-4 whitespace-nowrap">

                          <span className="text-xs text-slate-500">
                            {formatDate(
                              item.timestamp
                            )}
                          </span>

                        </td>

                        {/* DELETE */}
                        <td className="px-6 py-4 text-center">

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(
                                item.id
                              )
                            }
                            disabled={
                              deletingId ===
                              item.id
                            }
                            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label="Delete subscription"
                          >

                            {deletingId ===
                            item.id ? (
                              <svg
                                className="w-5 h-5 animate-spin"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="3"
                                />

                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth="1.6"
                                stroke="currentColor"
                                className="w-5 h-5"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                />
                              </svg>
                            )}

                          </button>

                        </td>

                      </tr>

                    )
                  )
                ) : (
                  <tr>

                    <td
                      colSpan={7}
                      className="py-16 text-center"
                    >

                      <EmptyState
                        search={search}
                      />

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

          {/* ======================================================
              MOBILE CARDS
          ====================================================== */}
          <div className="sm:hidden p-4 space-y-3 bg-slate-50/40">

            {currentItems.length > 0 ? (
              currentItems.map(
                (item, index) => (

                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="flex items-center gap-3">

                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center font-semibold">

                          {getInitial(
                            item.user
                          )}

                        </div>

                        <div>

                          <h3 className="font-semibold text-slate-800">
                            {item.user ||
                              "Unknown"}
                          </h3>

                          <p className="text-xs text-slate-400">
                            #
                            {indexOfFirstItem +
                              index +
                              1}
                          </p>

                        </div>

                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(
                            item.id
                          )
                        }
                        disabled={
                          deletingId ===
                          item.id
                        }
                        className="w-9 h-9 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition disabled:opacity-40"
                        aria-label="Delete subscription"
                      >

                        {deletingId ===
                        item.id ? (
                          <svg
                            className="w-5 h-5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="3"
                            />

                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.6"
                            stroke="currentColor"
                            className="w-5 h-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m7.5 0a48.667 48.667 0 0 0-7.5 0"
                            />
                          </svg>
                        )}

                      </button>

                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3">

                      <div>

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Email
                        </p>

                        <p className="text-sm text-slate-600 break-all mt-0.5">
                          {item.mail || "—"}
                        </p>

                      </div>

                      <div className="grid grid-cols-2 gap-3">

                        <div>

                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Phone
                          </p>

                          <p className="text-sm text-slate-600 mt-0.5">
                            {item.phone || "—"}
                          </p>

                        </div>

                        <div>

                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Country
                          </p>

                          <p className="text-sm text-slate-600 mt-0.5">
                            {item.country || "—"}
                          </p>

                        </div>

                      </div>

                      <div className="pt-2 border-t border-slate-100">

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          Joined
                        </p>

                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDate(
                            item.timestamp
                          )}
                        </p>

                      </div>

                    </div>

                  </div>

                )
              )
            ) : (
              <div className="py-12 text-center">

                <EmptyState
                  search={search}
                />

              </div>
            )}

          </div>
        </>
      )}

      {/* ========================================================
          PAGINATION
      ======================================================== */}
      {!loading &&
        filteredData.length > 0 &&
        totalPages > 1 && (

          <div className="px-5 sm:px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between gap-4">

            <p className="text-xs text-slate-400 hidden sm:block">

              Showing{" "}

              <span className="font-medium text-slate-600">
                {indexOfFirstItem + 1}
              </span>

              {" "}to{" "}

              <span className="font-medium text-slate-600">
                {Math.min(
                  indexOfLastItem,
                  filteredData.length
                )}
              </span>

              {" "}of{" "}

              <span className="font-medium text-slate-600">
                {filteredData.length}
              </span>

            </p>

            <div className="flex items-center gap-2 ml-auto">

              {/* PREVIOUS */}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.max(page - 1, 1)
                  )
                }
                disabled={safeCurrentPage === 1}
                className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.7"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 19.5 8.25 12l7.5-7.5"
                  />
                </svg>

                <span className="hidden sm:inline">
                  Previous
                </span>

              </button>

              {/* CURRENT PAGE */}
              <div className="flex items-center justify-center min-w-9 h-9 px-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm">
                {safeCurrentPage}
              </div>

              <span className="text-sm text-slate-400">
                of {totalPages}
              </span>

              {/* NEXT */}
              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(
                      page + 1,
                      totalPages
                    )
                  )
                }
                disabled={
                  safeCurrentPage ===
                  totalPages
                }
                className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >

                <span className="hidden sm:inline">
                  Next
                </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.7"
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8.25 4.5 7.5 7.5-7.5 7.5"
                  />
                </svg>

              </button>

            </div>

          </div>
        )}

    </div>
  );
};

/* ================================================================
   EMPTY STATE
================================================================ */

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex flex-col items-center">

      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="w-6 h-6 text-slate-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m21 21-4.35-4.35m0 0A7.5 7.5 0 1 0 6.04 6.04a7.5 7.5 0 0 0 10.61 10.61Z"
          />
        </svg>

      </div>

      <p className="font-medium text-slate-700">
        {search
          ? "No subscribers found"
          : "No subscribers yet"}
      </p>

      <p className="text-sm text-slate-400 mt-1">
        {search
          ? "Try searching with a different keyword."
          : "Registered subscribers will appear here."}
      </p>

    </div>
  );
}

export default Retrieve;
