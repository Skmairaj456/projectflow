"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import axios from "axios"
import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"

function DemoNewWorkspace() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session")
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sessionId) {
      router.push("/demo")
    }
  }, [sessionId, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post(`/api/demo/workspaces?sessionId=${sessionId}`, formData)

      if (response.data.workspace) {
        toast.success("Workspace created successfully!")
        router.prefetch(`/demo/workspaces/${response.data.workspace.id}?session=${sessionId}`)
        router.push(`/demo/workspaces/${response.data.workspace.id}?session=${sessionId}`)
      }
    } catch (error: unknown) {
      const errorMessage = 
        (error && typeof error === "object" && "response" in error && 
         error.response && typeof error.response === "object" && 
         "data" in error.response && error.response.data &&
         typeof error.response.data === "object" && "error" in error.response.data)
          ? String(error.response.data.error)
          : "Failed to create workspace"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (!sessionId) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header user={undefined} onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Create New Workspace
                </h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">
                  Set up a new workspace for your team to collaborate on projects.
                </p>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Workspace Details</CardTitle>
                  <CardDescription>
                    Enter the details for your new workspace.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label
                        htmlFor="name"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Workspace Name *
                      </label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="My Workspace"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                      >
                        Description
                      </label>
                      <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) =>
                          setFormData({ ...formData, description: e.target.value })
                        }
                        placeholder="A brief description of your workspace..."
                        className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? "Creating..." : "Create Workspace"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function DemoNewWorkspacePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      }
    >
      <DemoNewWorkspace />
    </Suspense>
  )
}






