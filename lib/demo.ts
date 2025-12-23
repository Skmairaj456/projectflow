import { prisma } from "./prisma"

export interface DemoSession {
  sessionId: string
  createdAt: Date
  expiresAt: Date
}

// Demo sessions expire after 2 hours of inactivity
const DEMO_SESSION_DURATION = 2 * 60 * 60 * 1000 // 2 hours in milliseconds

/**
 * Create or get a demo session
 */
export async function getOrCreateDemoSession(sessionId: string): Promise<DemoSession> {
  // Clean up expired sessions first
  await cleanupExpiredDemoSessions()

  // Check if session exists
  const existing = await prisma.demoSession.findUnique({
    where: { sessionId },
  })

  if (existing) {
    // Update expiration time on access
    const expiresAt = new Date(Date.now() + DEMO_SESSION_DURATION)
    await prisma.demoSession.update({
      where: { sessionId },
      data: { expiresAt },
    })
    return {
      sessionId: existing.sessionId,
      createdAt: existing.createdAt,
      expiresAt,
    }
  }

  // Create new session
  const expiresAt = new Date(Date.now() + DEMO_SESSION_DURATION)
  await prisma.demoSession.create({
    data: {
      sessionId,
      expiresAt,
    },
  })

  return {
    sessionId,
    createdAt: new Date(),
    expiresAt,
  }
}

/**
 * Clean up expired demo sessions and their data
 */
export async function cleanupExpiredDemoSessions() {
  const now = new Date()
  
  // Find expired sessions
  const expiredSessions = await prisma.demoSession.findMany({
    where: {
      expiresAt: {
        lt: now,
      },
    },
    select: {
      sessionId: true,
    },
  })

  if (expiredSessions.length === 0) return

  const sessionIds = expiredSessions.map(s => s.sessionId)

  // Delete all demo data for expired sessions
  await prisma.$transaction([
    // Delete demo tasks
    prisma.task.deleteMany({
      where: {
        project: {
          workspace: {
            demoSessionId: { in: sessionIds },
          },
        },
      },
    }),
    // Delete demo projects
    prisma.project.deleteMany({
      where: {
        workspace: {
          demoSessionId: { in: sessionIds },
        },
      },
    }),
    // Delete demo workspaces
    prisma.workspace.deleteMany({
      where: {
        demoSessionId: { in: sessionIds },
      },
    }),
    // Delete demo sessions
    prisma.demoSession.deleteMany({
      where: {
        sessionId: { in: sessionIds },
      },
    }),
  ])
}

/**
 * Check if a session is valid
 */
export async function isValidDemoSession(sessionId: string): Promise<boolean> {
  const session = await prisma.demoSession.findUnique({
    where: { sessionId },
  })

  if (!session) return false

  if (session.expiresAt < new Date()) {
    // Session expired, clean it up
    await cleanupExpiredDemoSessions()
    return false
  }

  // Update expiration on access
  await prisma.demoSession.update({
    where: { sessionId },
    data: {
      expiresAt: new Date(Date.now() + DEMO_SESSION_DURATION),
    },
  })

  return true
}

