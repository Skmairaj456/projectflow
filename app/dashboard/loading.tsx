import { StatsCardsSkeleton, WorkspacesSkeleton, ProjectsSkeleton } from "@/components/dashboard/DashboardSkeleton"

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
          <div className="h-6 w-96 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <StatsCardsSkeleton />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <WorkspacesSkeleton />
        <ProjectsSkeleton />
      </div>
    </div>
  )
}








