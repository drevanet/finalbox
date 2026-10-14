"use client";
import { useState } from "react";
export default function CheckoutButton({planKey}:{planKey:string}) {
 const [busy,setBusy]=useState(false),[error,setError]=useState("");
 async function go(){setBusy(true);setError("");try{const r=await fetch("/api/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({planKey})});const d=await r.json();if(r.status===401){location.href="/sign-in?next=/pricing";return;}if(!r.ok)throw new Error(d.error||"Checkout failed");location.href=d.url;}catch(e){setError(e instanceof Error?e.message:"Something went wrong");setBusy(false);}}
 return <div><button disabled={busy} onClick={go} className="w-full rounded-full bg-brand px-4 py-3 font-bold text-white disabled:opacity-50">{busy?"Preparing checkout…":"Choose plan"}</button>{error&&<p className="mt-2 text-xs text-red-600">{error}</p>}</div>
}
