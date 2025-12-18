import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/auth/signin",
  },
})

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/api/projects/:path*",
    "/api/tasks/:path*",
    "/api/workspaces/:path*",
    "/api/activities/:path*",
    "/api/attachments/:path*",
    "/api/labels/:path*",
  ],
}
