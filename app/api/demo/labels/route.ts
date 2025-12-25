import { NextRequest, NextResponse } from "next/server"
import { isValidDemoSession, getOrCreateDemoSession } from "@/lib/demo"
import { prisma, prismaQuery } from "@/lib/prisma"
import { z } from "zod"

export const dynamic = 'force-dynamic'

const createLabelSchema = z.object({
  name: z.string().min(1, "Name is required"),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, "Invalid color format"),
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

    // Verify session is valid
    let valid = await isValidDemoSession(sessionId)
    if (!valid) {
      await getOrCreateDemoSession(sessionId)
    }

    // In demo mode, return all labels (they're shared)
    const labels = await prismaQuery(() =>
      prisma.label.findMany({
        orderBy: {
          createdAt: "desc",
        },
      })
    )

    return NextResponse.json({ labels })
  } catch (error) {
    console.error("[DEMO_LABELS_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to fetch labels" },
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
      await getOrCreateDemoSession(sessionId)
    }

    const body = await req.json()
    const validatedData = createLabelSchema.parse(body)

    const label = await prismaQuery(() =>
      prisma.label.create({
        data: validatedData,
      })
    )

    return NextResponse.json({ label }, { status: 201 })
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("[DEMO_LABELS_CREATE_ERROR]", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to create label"
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

