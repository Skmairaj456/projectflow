import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export function StatsCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mt-2" />
            </div>
            <Skeleton className="h-12 w-12 rounded-lg" />
          </div>
        </Card>
      ))}
    </div>
  )
}

export function WorkspacesSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </Card>
  )
}

export function ProjectsSkeleton() {
  return (
    <Card className="p-6">
      <Skeleton className="h-6 w-32 mb-4" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700">
            <Skeleton className="h-5 w-40 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </div>
    </Card>
  )
}

