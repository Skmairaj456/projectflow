import { NextResponse } from "next/server"
import { prisma, prismaQuery } from "@/lib/prisma"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

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
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updateTaskSchema.parse(body)

    // Verify task exists and user has access via project's workspace membership
    const task = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          id: id,
          project: {
            workspace: {
              members: {
                some: {
                  user: {
                    email: session.user?.email as string,
                  },
                },
              },
            },
          },
        },
      })
    )

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
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

    const errorMessage = error instanceof Error ? error.message : "Failed to update task"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const task = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          id: id,
          project: {
            workspace: {
              members: {
                some: {
                  user: {
                    email: session.user?.email as string,
                  },
                },
              },
            },
          },
        },
      })
    )

    if (!task) {
      return NextResponse.json(
        { error: "Task not found or access denied" },
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete task"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}


