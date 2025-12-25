import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession } from "@/lib/demo"
import { prisma, prismaQuery } from "@/lib/prisma"
import { unlink } from "fs/promises"
import { join } from "path"

export const dynamic = 'force-dynamic'

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

    // Get attachment info before deleting and verify it belongs to demo session
    const attachment = await prismaQuery(() =>
      prisma.taskAttachment.findFirst({
        where: { 
          id,
          task: {
            project: {
              workspace: {
                demoSessionId: sessionId,
              },
            },
          },
        },
      })
    )

    if (!attachment) {
      return NextResponse.json(
        { error: "Attachment not found" },
        { status: 404 }
      )
    }

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), "public", attachment.fileUrl)
      await unlink(filePath)
    } catch (fileError) {
      // File might not exist, continue with database deletion
    }

    // Delete from database
    await prismaQuery(() =>
      prisma.taskAttachment.delete({
        where: { id },
      })
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[DEMO_ATTACHMENTS_DELETE_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to delete attachment" },
      { status: 500 }
    )
  }
}


