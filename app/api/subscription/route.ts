import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
export async function GET(){const user=await currentUser();if(!user)return NextResponse.json({error:"Sign in required"},{status:401});return NextResponse.json({subscription:user.subscription});}
