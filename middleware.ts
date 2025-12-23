import { NextResponse } from "next/server"

// No authentication middleware - all routes are public
export function middleware(request: any) {
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
