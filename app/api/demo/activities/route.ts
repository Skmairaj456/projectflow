import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession } from "@/lib/demo"
import { prisma, prismaQuery } from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId")
    const projectId = req.nextUrl.searchParams.get("projectId")
    const taskId = req.nextUrl.searchParams.get("taskId")

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

    const where: any = {
      OR: [
        {
          project: {
            workspace: {
              demoSessionId: sessionId,
            },
          },
        },
        {
          task: {
            project: {
              workspace: {
                demoSessionId: sessionId,
              },
            },
          },
        },
      ],
    }
    
    if (projectId) where.projectId = projectId
    if (taskId) where.taskId = taskId

    const activities = await prismaQuery(() =>
      prisma.activity.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 50,
      })
    )

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("[DEMO_ACTIVITIES_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 }
    )
  }
}


