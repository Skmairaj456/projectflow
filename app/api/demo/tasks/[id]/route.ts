import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession, getOrCreateDemoSession } from "@/lib/demo"
import { prisma, prismaQuery } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const updateTaskSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().nullable().optional(),
  columnId: z.string().optional(),
  order: z.number().optional(),
  assigneeId: z.string().nullable().optional(),
})

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId")
    const { id } = await params

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
    const validatedData = updateTaskSchema.parse(body)

    // Verify task exists and belongs to demo session
    const task = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          id: id,
          project: {
            workspace: {
              demoSessionId: sessionId,
            },
          },
        },
      })
    )

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    const updateData: Prisma.TaskUpdateInput = {}
    
    if (validatedData.title !== undefined) updateData.title = validatedData.title
    if (validatedData.description !== undefined)
      updateData.description = validatedData.description
    if (validatedData.priority !== undefined)
      updateData.priority = validatedData.priority
    if (validatedData.dueDate !== undefined)
      updateData.dueDate = validatedData.dueDate
        ? new Date(validatedData.dueDate)
        : null
    if (validatedData.columnId !== undefined) {
      updateData.column = { connect: { id: validatedData.columnId } }
      // Update status based on column name
      const column = await prismaQuery(() =>
        prisma.column.findUnique({
          where: { id: validatedData.columnId },
          select: { name: true },
        })
      )
      if (column) {
        const statusMap: Record<string, "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE"> = {
          "To Do": "TODO",
          "In Progress": "IN_PROGRESS",
          "In Review": "IN_REVIEW",
          "Done": "DONE",
        }
        updateData.status = statusMap[column.name] || "TODO"
      }
    }
    if (validatedData.order !== undefined) {
      updateData.order = validatedData.order
    }
    if (validatedData.assigneeId !== undefined) {
      updateData.assignee = validatedData.assigneeId
        ? { connect: { id: validatedData.assigneeId } }
        : { disconnect: true }
    }

    const updatedTask = await prismaQuery(() =>
      prisma.task.update({
        where: {
          id: id,
        },
        data: updateData,
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

    return NextResponse.json({ task: updatedTask })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("[DEMO_TASKS_UPDATE_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to update task"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId")
    const { id } = await params

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

    const task = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          id: id,
          project: {
            workspace: {
              demoSessionId: sessionId,
            },
          },
        },
      })
    )

    if (!task) {
      return NextResponse.json(
        { error: "Task not found" },
        { status: 404 }
      )
    }

    await prismaQuery(() =>
      prisma.task.delete({
        where: {
          id: id,
        },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DEMO_TASKS_DELETE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to delete task" },
      { status: 500 }
    )
  }
}

