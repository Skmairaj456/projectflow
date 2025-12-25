import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession, getOrCreateDemoSession } from "@/lib/demo"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  dueDate: z.string().nullable().optional(),
  projectId: z.string().min(1, "Project ID is required"),
  columnId: z.string().min(1, "Column ID is required"),
})

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      )
    }

    // Verify session is valid
    let valid = await isValidDemoSession(sessionId)
    if (!valid) {
      await getOrCreateDemoSession(sessionId)
    }

    const body = await req.json()
    const validatedData = createTaskSchema.parse(body)

    // Verify project exists and belongs to demo session
    const project = await prismaQuery(() =>
      prisma.project.findFirst({
        where: {
          id: validatedData.projectId,
          workspace: {
            demoSessionId: sessionId,
          },
        },
        include: {
          columns: {
            where: {
              id: validatedData.columnId,
            },
          },
        },
      })
    )

    if (!project || project.columns.length === 0) {
      return NextResponse.json(
        { error: "Project or column not found" },
        { status: 404 }
      )
    }

    // Get max order in column
    const maxOrder = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          columnId: validatedData.columnId,
        },
        orderBy: {
          order: "desc",
        },
        select: {
          order: true,
        },
      })
    )

    const column = project.columns[0]
    const statusMap: Record<string, "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"> = {
      "To Do": "TODO",
      "In Progress": "IN_PROGRESS",
      "In Review": "IN_REVIEW",
      "Done": "DONE",
    }

    const task = await prismaQuery(() =>
      prisma.task.create({
        data: {
          title: validatedData.title,
          description: validatedData.description,
          priority: validatedData.priority,
          dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : null,
          projectId: validatedData.projectId,
          columnId: validatedData.columnId,
          order: maxOrder ? maxOrder.order + 1 : 0,
          status: statusMap[column.name] || "TODO",
        },
        include: {
          assignee: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          labels: {
            include: {
              label: true,
            },
          },
          _count: {
            select: {
              comments: true,
              attachments: true,
            },
          },
        },
      })
    )

    return NextResponse.json({ task }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("[DEMO_TASKS_CREATE_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create task"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

