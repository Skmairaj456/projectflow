import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession } from "@/lib/demo"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      )
    }

    const valid = await isValidDemoSession(sessionId)
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid or expired session" },
        { status: 401 }
      )
    }

    const workspaces = await prisma.workspace.findMany({
      where: {
        demoSessionId: sessionId,
      },
      include: {
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error("[DEMO_WORKSPACES_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    )
  }
}


