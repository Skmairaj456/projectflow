"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import toast from "react-hot-toast"
import axios from "axios"

export default function NewProjectPage() {
  const router = useRouter()
  const params = useParams()
  const workspaceId = params.id as string

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await axios.post("/api/projects", {
        ...formData,
        workspaceId,
      })

      if (response.data.project) {
        toast.success("Project created successfully!")
        router.prefetch(`/dashboard/projects/${response.data.project.id}`)
        router.push(`/dashboard/projects/${response.data.project.id}`)
      }
    } catch (error: unknown) {
      const errorMessage = 
        (error && typeof error === "object" && "response" in error && 
         error.response && typeof error.response === "object" && 
         "data" in error.response && error.response.data &&
         typeof error.response.data === "object" && "error" in error.response.data)
          ? String(error.response.data.error)
          : "Failed to create project"
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const colors = [
    "#3b82f6", // blue
    "#10b981", // green
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#06b6d4", // cyan
    "#84cc16", // lime
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Create New Project
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Set up a new project to organize and track your tasks.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Enter the details for your new project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                Project Name *
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="My Project"
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
                placeholder="A brief description of your project..."
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Project Color
              </label>
              <div className="flex gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-full border-2 ${
                      formData.color === color
                        ? "border-gray-900 dark:border-white scale-110"
                        : "border-gray-300 dark:border-gray-600"
                    } transition-transform`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Project"}
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


