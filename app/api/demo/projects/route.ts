import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession } from "@/lib/demo"
import { prisma } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

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

    const projects = await prisma.project.findMany({
      where: {
        workspace: {
          demoSessionId: sessionId,
        },
      },
      include: {
        workspace: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 10,
    })

    return NextResponse.json({ projects })
  } catch (error) {
    
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}


