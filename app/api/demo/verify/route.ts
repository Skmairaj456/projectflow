import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession } from "@/lib/demo"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ valid: false }, { status: 400 })
    }

    const valid = await isValidDemoSession(sessionId)

    return NextResponse.json({ valid })
  } catch (error) {
    
    return NextResponse.json({ valid: false }, { status: 500 })
  }
}


