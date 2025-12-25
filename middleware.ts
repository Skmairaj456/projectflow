import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// No authentication middleware - all routes are public
export function middleware(request: NextRequest) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
