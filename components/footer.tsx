import Link from "next/link";
import { Box, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return <footer className="bg-ink text-white">
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
      <div><Link href="/" className="flex items-center gap-2 text-xl font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand"><Box size={21}/></span>Betty</Link><p className="mt-4 max-w-xs text-sm leading-6 text-slate-400">A simpler way to turn your packaging designs into polished, realistic 3D box mockups.</p><div className="mt-5 flex gap-3 text-slate-400"><Instagram size={18}/><Youtube size={18}/></div></div>
      <div><h3 className="font-bold">Explore</h3><div className="mt-4 grid gap-3 text-sm text-slate-400"><Link href="/editor">3D Editor</Link><Link href="/gallery">Gallery</Link><Link href="/pricing">Pricing</Link><Link href="/subscription">Manage subscription</Link></div></div>
      <div><h3 className="font-bold">Legal</h3><div className="mt-4 grid gap-3 text-sm text-slate-400"><Link href="/terms-and-conditions">Terms &amp; Conditions</Link><Link href="/privacy-policy">Privacy Policy</Link><Link href="/refund-policy">Refund Policy</Link><Link href="/cancellation-policy">Cancellation Policy</Link></div></div>
      <div><h3 className="font-bold">Create something brilliant.</h3><p className="mt-3 text-sm leading-6 text-slate-400">Your next product presentation starts with six editable faces.</p><Link href="/editor" className="mt-5 inline-flex rounded-full bg-brand px-5 py-3 text-sm font-bold">Start creating <span className="ml-2">↗</span></Link></div>
    </div>
    <div className="border-t border-white/10 px-5 py-5 text-center text-xs text-slate-500">© {new Date().getFullYear()} Betty Studio. All rights reserved.</div>
  </footer>;
}
