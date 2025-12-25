import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession, getOrCreateDemoSession } from "@/lib/demo"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const addLabelSchema = z.object({
  labelId: z.string().min(1, "Label ID is required"),
})

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId")
    const { id: taskId } = await params

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
    const { labelId } = addLabelSchema.parse(body)

    // Verify task belongs to demo session
    const task = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          id: taskId,
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

    // Check if label already exists on task
    const existing = await prismaQuery(() =>
      prisma.taskLabel.findUnique({
        where: {
          taskId_labelId: {
            taskId,
            labelId,
          },
        },
      })
    )

    if (existing) {
      return NextResponse.json(
        { error: "Label already added to task" },
        { status: 400 }
      )
    }

    const taskLabel = await prismaQuery(() =>
      prisma.taskLabel.create({
        data: {
          taskId,
          labelId,
        },
        include: {
          label: true,
        },
      })
    )

    return NextResponse.json({ taskLabel }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    const errorMessage = error instanceof Error ? error.message : "Failed to add label"
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
    const { id: taskId } = await params
    const labelId = req.nextUrl.searchParams.get("labelId")

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      )
    }

    if (!labelId) {
      return NextResponse.json(
        { error: "Label ID is required" },
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

    // Verify task belongs to demo session
    const task = await prismaQuery(() =>
      prisma.task.findFirst({
        where: {
          id: taskId,
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
      prisma.taskLabel.delete({
        where: {
          taskId_labelId: {
            taskId,
            labelId,
          },
        },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to remove label" },
      { status: 500 }
    )
  }
}


