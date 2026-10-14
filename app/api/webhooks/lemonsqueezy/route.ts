import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { validWebhook } from "@/lib/lemonsqueezy";
import { PLANS } from "@/lib/plans";

export async function POST(req:Request) {
 const raw=await req.text();
 if(!validWebhook(raw,req.headers.get("x-signature")))return NextResponse.json({error:"Invalid webhook signature"},{status:401});
 let event:any; try{event=JSON.parse(raw)}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}
 const type=event?.meta?.event_name, attrs=event?.data?.attributes, custom=event?.meta?.custom_data;
 const userId=custom?.user_id;
 if(!userId||!attrs)return NextResponse.json({received:true});
 const variantId=String(attrs.variant_id||"");
 const planEntry=Object.entries(PLANS).find(([_,p])=>process.env[p.env]===variantId);
 const planKey=planEntry?.[0]||"";
 if(["subscription_created","subscription_updated","subscription_resumed","subscription_payment_success"].includes(type)&&planKey){
  await db.subscription.upsert({where:{userId},create:{userId,planKey,status:attrs.status||"active",lemonSqueezyCustomerId:String(attrs.customer_id||""),lemonSqueezySubscriptionId:String(event.data.id),variantId,renewsAt:attrs.renews_at?new Date(attrs.renews_at):null,endsAt:attrs.ends_at?new Date(attrs.ends_at):null,downloadsUsed:0},update:{planKey,status:attrs.status||"active",lemonSqueezyCustomerId:String(attrs.customer_id||""),lemonSqueezySubscriptionId:String(event.data.id),variantId,renewsAt:attrs.renews_at?new Date(attrs.renews_at):null,endsAt:attrs.ends_at?new Date(attrs.ends_at):null}});
 } else if(["subscription_cancelled","subscription_expired","subscription_paused","subscription_payment_failed"].includes(type)){
  await db.subscription.updateMany({where:{userId},data:{status:type==="subscription_cancelled"?"cancelled":type==="subscription_expired"?"expired":type==="subscription_paused"?"paused":"past_due"}});
 }
 return NextResponse.json({received:true});
}
