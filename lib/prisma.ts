import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Helper function to create Prisma client with proper error handling
function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

  // Handle connection errors
  client.$on("error" as never, (e: unknown) => {
    console.error("[PRISMA] Database error:", e)
  })

  // Handle disconnections
  process.on("beforeExit", async () => {
    await client.$disconnect()
  })

  return client
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma

// Helper function to execute queries with retry logic
export async function prismaQuery<T>(
  queryFn: () => Promise<T>,
  retries = 2
): Promise<T> {
  try {
    return await queryFn()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorCode = error && typeof error === 'object' && 'code' in error 
      ? error.code 
      : error && typeof error === 'object' && 'errno' in error
      ? error.errno
      : undefined
    const isConnectionError =
      errorMessage.includes("Server has closed the connection") ||
      errorMessage.includes("Connection closed") ||
      errorMessage.includes("Connection terminated") ||
      errorMessage.includes("ECONNRESET") ||
      errorMessage.includes("ETIMEDOUT") ||
      errorMessage.includes("Connection pool") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("forcibly closed") ||
      errorCode === 10054 || // Windows error: Connection reset by peer
      errorCode === "ECONNRESET" ||
      errorCode === "ETIMEDOUT"

    if (isConnectionError && retries > 0) {
      console.log(`[PRISMA] Connection error detected: ${errorMessage}`)
      console.log(`[PRISMA] Retrying query... (${retries} retries left)`)
      
      // Wait a bit before retrying (exponential backoff)
      const delay = (3 - retries) * 500 // 500ms, 1000ms
      await new Promise((resolve) => setTimeout(resolve, delay))
      
      // Try to reconnect by testing the connection
      try {
        // Test connection with a simple query
        await prisma.$queryRaw`SELECT 1`
        console.log(`[PRISMA] Connection test successful, retrying query...`)
      } catch (reconnectError) {
        console.log(`[PRISMA] Connection test failed, will retry anyway...`)
        // Disconnect and let Prisma reconnect automatically
        try {
          await prisma.$disconnect()
        } catch {
          // Ignore disconnect errors
        }
      }
      
      // Retry the query
      return prismaQuery(queryFn, retries - 1)
    }

    // Not a connection error or out of retries - throw the error
    console.error(`[PRISMA] Query failed after retries:`, errorMessage)
    throw error
  }
}
