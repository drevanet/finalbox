import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { PLANS, isPlanKey } from "@/lib/plans";
import { createCheckout } from "@/lib/lemonsqueezy";
export async function POST(req:Request) {
 const user=await currentUser(); if(!user)return NextResponse.json({error:"Please sign in before subscribing."},{status:401});
 const parsed=z.object({planKey:z.string()}).safeParse(await req.json()); if(!parsed.success||!isPlanKey(parsed.data.planKey))return NextResponse.json({error:"Choose a valid plan."},{status:400});
 try { const plan=PLANS[parsed.data.planKey]; const variant=process.env[plan.env]; const url=await createCheckout(variant||"",{id:user.id,email:user.email}); return NextResponse.json({url}); }
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Checkout is unavailable."},{status:503});}
}
