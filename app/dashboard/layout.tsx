"use client"

import Sidebar from "@/components/dashboard/Sidebar"
import Header from "@/components/dashboard/Header"
import { useState } from "react"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

// Client component - no export const needed for dynamic
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()
  
  // Check if we're in demo mode
  const isDemo = pathname?.startsWith('/demo')
  
  // Get user data - use session if authenticated, otherwise null (Header will handle demo mode)
  const user = isDemo ? null : session?.user || null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="lg:pl-64 flex flex-col min-h-screen">
        <Header 
          user={user} 
          onMenuClick={() => setIsSidebarOpen(true)} 
        />
        <main className="flex-1 py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}


