import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(_req) {
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        if (pathname === "/owner/login") return true
        if (pathname.startsWith("/employee/join/")) return true
        return !!token
      },
    },
  },
)

export const config = {
  matcher: ["/admin/:path*", "/owner/:path*", "/employee/:path*"],
}
