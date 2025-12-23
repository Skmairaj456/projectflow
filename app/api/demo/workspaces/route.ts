import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession, getOrCreateDemoSession } from "@/lib/demo"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"
import { generateSlug } from "@/lib/utils"

export const dynamic = 'force-dynamic' // Ensure this route is always rendered dynamically
export const runtime = 'nodejs' // Ensure Node.js runtime

const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
})

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

    const workspaces = await prismaQuery(() =>
      prisma.workspace.findMany({
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
    )

    return NextResponse.json({ workspaces })
  } catch (error) {
    console.error("[DEMO_WORKSPACES_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch workspaces" },
      { status: 500 }
    )
  }
}

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
      // Try to create the session if it doesn't exist
      await getOrCreateDemoSession(sessionId)
    }

    const body = await req.json()
    const validatedData = createWorkspaceSchema.parse(body)

    const slug = generateSlug(validatedData.name)

    // Check if slug already exists
    const existingWorkspace = await prismaQuery(() =>
      prisma.workspace.findUnique({
        where: { slug },
      })
    )

    const finalSlug = existingWorkspace
      ? `${slug}-${Date.now()}`
      : slug

    // Create workspace associated with demo session
    const workspace = await prismaQuery(() =>
      prisma.workspace.create({
        data: {
          name: validatedData.name,
          description: validatedData.description,
          slug: finalSlug,
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
      })
    )

    return NextResponse.json({ workspace }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("[DEMO_WORKSPACES_CREATE_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create workspace"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
