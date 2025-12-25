import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import type { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")
    const taskId = searchParams.get("taskId")

    const where: Prisma.ActivityWhereInput = {
      OR: [
        {
          project: {
            workspace: {
              demoSessionId: null, // Exclude demo workspaces
              members: {
                some: {
                  user: {
                    email: session.user.email,
                  },
                },
              },
            },
          },
        },
        {
          task: {
            project: {
              workspace: {
                demoSessionId: null, // Exclude demo workspaces
                members: {
                  some: {
                    user: {
                      email: session.user.email,
                    },
                  },
                },
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch activities"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

