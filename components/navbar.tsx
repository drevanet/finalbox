import Link from "next/link";
import { Box } from "lucide-react";
import { currentUser } from "@/lib/auth";

export async function Navbar() {
  const user = await currentUser();
  return <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
    <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
      <Link href="/" className="flex items-center gap-2 text-xl font-black tracking-tight"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand text-white"><Box size={21}/></span>Betty</Link>
      <div className="hidden items-center gap-7 text-sm font-semibold text-slate-600 md:flex">
        <Link href="/#features" className="hover:text-brand">Features</Link><Link href="/pricing" className="hover:text-brand">Pricing</Link><Link href="/gallery" className="hover:text-brand">Gallery</Link><Link href="/#faq" className="hover:text-brand">FAQ</Link>
      </div>
      <div className="flex items-center gap-2">
        {user ? <><Link className="rounded-full border px-4 py-2 text-sm font-semibold" href="/dashboard">Dashboard</Link><Link className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white" href="/editor">Open editor</Link></> : <><Link className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold" href="/sign-in">Sign in</Link><Link className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand/20" href="/sign-up">Sign up</Link></>}
      </div>
    </nav>
  </header>;
}
