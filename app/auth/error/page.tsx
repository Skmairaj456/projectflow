"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const errorMessages: { [key: string]: string } = {
    Configuration: "There is a problem with the server configuration. Check if your options are correct.",
    AccessDenied: "Access denied. You do not have permission to view this page.",
    Verification: "The verification link has expired or has already been used.",
    Default: "An unexpected error occurred. Please try again later.",
  }

  const errorMessage = error && errorMessages[error] ? errorMessages[error] : errorMessages.Default

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center text-2xl font-bold text-red-600">Authentication Error</CardTitle>
          <CardDescription className="text-center">
            Something went wrong during the authentication process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-700 dark:text-red-400">
              {errorMessage}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <Button asChild className="w-full">
            <Link href="/auth/signin">
              Back to Sign In
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

