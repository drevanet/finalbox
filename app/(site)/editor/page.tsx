
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import BoxEditor from "@/components/box-editor";
import Link from "next/link";
import { PLANS, isPlanKey } from "@/lib/plans";

export default async function EditorPage() {
  const user = await currentUser();
  const sub = user?.subscription;

  const plan =
    sub && isPlanKey(sub.planKey)
      ? PLANS[sub.planKey]
      : null;

  const active =
    !!sub && ["active", "on_trial"].includes(sub.status);

  const remaining =
    active && plan
      ? plan.downloads === Infinity
        ? "Unlimited"
        : Math.max(0, plan.downloads - sub.downloadsUsed)
      : 0;

  const projects = user
    ? await db.project.count({
        where: { userId: user.id },
      })
    : 0;

  const downloadLimitReached =
    active &&
    !!plan &&
    plan.downloads !== Infinity &&
    sub!.downloadsUsed >= plan.downloads;

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
      {/* Page heading */}
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[.2em] text-brand">
            Betty Studio
          </p>

          <h1 className="mt-2 text-4xl font-black">
            3D box editor
          </h1>

          <p className="mt-2 text-slate-600">
            Edit each face and rotate your box to inspect your design.
          </p>
        </div>

        <Link
          href="/pricing"
          className="rounded-full bg-brand px-5 py-3 font-bold text-white"
        >
          View plans
        </Link>
      </div>

      {/* Account information */}
      <div className="mb-7 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border p-5">
          <p className="text-sm text-slate-500">Account</p>
          <p className="mt-1 break-words font-bold">
            {user?.email || "Guest mode"}
          </p>
        </div>

        <div className="rounded-2xl border p-5">
          <p className="text-sm text-slate-500">Subscription</p>
          <p className="mt-1 font-bold">
            {active && plan
              ? `${plan.name} · ${sub?.status}`
              : "No active subscription"}
          </p>
        </div>

        <div className="rounded-2xl border p-5">
          <p className="text-sm text-slate-500">
            Downloads remaining
          </p>
          <p className="mt-1 font-bold">{remaining}</p>
        </div>
      </div>

      {/* Subscription prompt */}
      {!active && (
        <div className="mb-7 flex flex-col justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center">
          <div>
            <p className="font-bold text-amber-950">
              Subscribe to download your designs
            </p>

            <p className="mt-1 text-sm text-amber-900">
              You can still edit and preview your box.
              Choose a plan to unlock downloads.
            </p>
          </div>

          <Link
            href="/pricing?required=download"
            className="shrink-0 rounded-full bg-ink px-5 py-3 text-center text-sm font-bold text-white"
          >
            See subscription plans
          </Link>
        </div>
      )}

      {/* Download limit notice */}
      {downloadLimitReached && (
        <div className="mb-7 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <p className="font-bold">
            You have reached this plan’s download limit.
          </p>

          <Link
            className="mt-2 inline-block font-bold text-brand"
            href="/pricing"
          >
            Upgrade your plan →
          </Link>
        </div>
      )}

      {/* 3D editor */}
      <BoxEditor />

      {/* Footer information */}
      <div className="mt-8 text-sm text-slate-500">
        Saved projects: {projects} ·{" "}
        <Link
          className="font-bold text-brand"
          href="/dashboard"
        >
          Manage projects
        </Link>{" "}
        ·{" "}
        <Link
          className="font-bold text-brand"
          href="/subscription"
        >
          Subscription details
        </Link>
      </div>
    </main>
  );
}
