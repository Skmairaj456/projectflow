"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import axios from "axios"

export default function NewWorkspacePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post("/api/workspaces", formData)

      if (response.data.workspace) {
        toast.success("Workspace created successfully!")
        router.prefetch(`/dashboard/workspaces/${response.data.workspace.id}`)
        router.push(`/dashboard/workspaces/${response.data.workspace.id}`)
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

  return (
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
  )
}


