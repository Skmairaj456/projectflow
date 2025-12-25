import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession, getOrCreateDemoSession } from "@/lib/demo"
import { prisma, prismaQuery } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export const dynamic = 'force-dynamic'

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

    const formData = await req.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
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

    // For now, store file info in database (in production, upload to S3/Cloudinary)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads", "tasks", taskId)
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const fileName = `${Date.now()}-${file.name}`
    const filePath = join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    const fileUrl = `/uploads/tasks/${taskId}/${fileName}`

    // Save attachment record
    const attachment = await prismaQuery(() =>
      prisma.taskAttachment.create({
        data: {
          taskId,
          fileName: file.name,
          fileUrl,
          fileSize: file.size,
          fileType: file.type,
        },
      })
    )

    return NextResponse.json({ attachment }, { status: 201 })
  } catch (error) {
    console.error("[DEMO_ATTACHMENTS_UPLOAD_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to upload file"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function GET(
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

    const attachments = await prismaQuery(() =>
      prisma.taskAttachment.findMany({
        where: { 
          taskId,
        },
        orderBy: {
          uploadedAt: "desc",
        },
      })
    )

    return NextResponse.json({ attachments })
  } catch (error) {
    console.error("[DEMO_ATTACHMENTS_GET_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch attachments" },
      { status: 500 }
    )
  }
}

