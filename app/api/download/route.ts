import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PLANS, isPlanKey } from "@/lib/plans";

const face=z.object({title:z.string().max(160),text:z.string().max(1200),color:z.string().regex(/^#[0-9a-fA-F]{6}$/)});
const schema=z.object({name:z.string().min(1).max(120),design:z.object({front:face,back:face,left:face,right:face,top:face,bottom:face})});
export async function POST(req:Request){
 const user=await currentUser(); if(!user)return NextResponse.json({error:"Sign in required"},{status:401});
 const body=schema.safeParse(await req.json());if(!body.success)return NextResponse.json({error:"Invalid project data"},{status:400});
 const sub=user.subscription;
 if(!sub||!["active","on_trial"].includes(sub.status)||!isPlanKey(sub.planKey))return NextResponse.json({error:"Subscription required"},{status:402});
 const plan=PLANS[sub.planKey];
 try {
  const result=await db.$transaction(async tx=>{
   const fresh=await tx.subscription.findUnique({where:{userId:user.id}});
   if(!fresh||!["active","on_trial"].includes(fresh.status)||!isPlanKey(fresh.planKey))throw new Error("SUBSCRIPTION_REQUIRED");
   const currentPlan=PLANS[fresh.planKey];
   if(currentPlan.downloads!==Infinity&&fresh.downloadsUsed>=currentPlan.downloads)throw new Error("LIMIT_REACHED");
   await tx.subscription.update({where:{userId:user.id},data:{downloadsUsed:{increment:1}}});
   await tx.project.create({data:{userId:user.id,name:body.data.name,data:body.data.design}});
   return body.data;
  });
  return new Response(JSON.stringify(result,null,2),{headers:{"Content-Type":"application/json","Content-Disposition":'attachment; filename="betty-box-design.json"',"Cache-Control":"no-store"}});
 }catch(e){const message=e instanceof Error?e.message:"";if(message==="LIMIT_REACHED")return NextResponse.json({error:"Download limit reached"},{status:402});if(message==="SUBSCRIPTION_REQUIRED")return NextResponse.json({error:"Subscription required"},{status:402});return NextResponse.json({error:"Download failed"},{status:500});}
}
