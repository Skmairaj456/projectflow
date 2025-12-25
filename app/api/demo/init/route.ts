import { NextResponse } from "next/server"
import { getOrCreateDemoSession } from "@/lib/demo"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID required" },
        { status: 400 }
      )
    }

    // Create or get demo session
    const session = await getOrCreateDemoSession(sessionId)

    // Check if demo workspace already exists for this session
    const existingWorkspace = await prisma.workspace.findFirst({
      where: {
        demoSessionId: sessionId,
      },
    })

    if (existingWorkspace) {
      return NextResponse.json({
        sessionId,
        workspaceId: existingWorkspace.id,
        message: "Demo session resumed",
      })
    }

    // Create demo workspace with sample data
    const workspace = await prisma.workspace.create({
      data: {
        name: "Demo Workspace",
        slug: `demo-${sessionId.substring(0, 8)}`,
        description: "This is a demo workspace. All data will be deleted when the session expires.",
        demoSessionId: sessionId,
      },
    })

    // Create a sample project
    const project = await prisma.project.create({
      data: {
        name: "Sample Project",
        description: "Welcome to ProjectFlow! This is a sample project to help you get started.",
        color: "#3b82f6",
        workspaceId: workspace.id,
        columns: {
          create: [
            { name: "To Do", order: 0 },
            { name: "In Progress", order: 1 },
            { name: "In Review", order: 2 },
            { name: "Done", order: 3 },
          ],
        },
      },
      include: {
        columns: true,
      },
    })

    // Create sample tasks
    const todoColumn = project.columns.find((c) => c.name === "To Do")
    const inProgressColumn = project.columns.find((c) => c.name === "In Progress")
    const doneColumn = project.columns.find((c) => c.name === "Done")

    if (todoColumn && inProgressColumn && doneColumn) {
      await prisma.task.createMany({
        data: [
          {
            title: "Welcome to ProjectFlow!",
            description: "This is your first task. Try moving it between columns.",
            status: "TODO",
            priority: "MEDIUM",
            columnId: todoColumn.id,
            projectId: project.id,
            order: 0,
          },
          {
            title: "Create your first project",
            description: "Start by creating a new project in your workspace.",
            status: "IN_PROGRESS",
            priority: "HIGH",
            columnId: inProgressColumn.id,
            projectId: project.id,
            order: 0,
          },
          {
            title: "Invite team members",
            description: "Collaborate with your team by inviting them to your workspace.",
            status: "DONE",
            priority: "LOW",
            columnId: doneColumn.id,
            projectId: project.id,
            order: 0,
          },
        ],
      })
    }

    return NextResponse.json({
      sessionId,
      workspaceId: workspace.id,
      projectId: project.id,
      message: "Demo session created successfully",
    })
  } catch (error) {
    console.error("[DEMO_INIT_ERROR]", error)
    return NextResponse.json(
      { error: "Failed to initialize demo session" },
      { status: 500 }
    )
  }
}






