import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  Users, 
  Zap, 
  Shield, 
  Calendar,
  MessageSquare,
} from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  const features = [
    {
      icon: BarChart3,
      title: "Kanban Boards",
      description: "Visualize your workflow with drag-and-drop task management",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with role-based access control",
    },
    {
      icon: Zap,
      title: "Real-time Updates",
      description: "See changes instantly as your team works together",
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Enterprise-grade security for your projects and data",
    },
    {
      icon: Calendar,
      title: "Task Management",
      description: "Track deadlines, priorities, and assignments effortlessly",
    },
    {
      icon: MessageSquare,
      title: "Comments & Activity",
      description: "Stay in sync with team discussions and activity logs",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-primary">
            ProjectFlow
          </Link>
          <div className="flex items-center gap-4">
            {session ? (
              <Link href="/dashboard">
                <Button variant="default">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="default">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-block">
            <span className="px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
              🚀 Enterprise Project Management
            </span>
          </div>
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
            ProjectFlow
          </h1>
          <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 mt-2">
            by <span className="font-semibold text-primary">ProjectPilot</span>
          </p>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            The all-in-one project management platform built for modern teams.
            <br />
            <span className="text-primary font-semibold">Plan, track, and deliver</span> with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link href={session ? "/dashboard" : "/auth/signup"}>
              <Button size="lg" className="text-lg px-8 py-6">
                {session ? "Go to Dashboard" : "Start for free"}
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-32 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to manage projects
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Powerful features designed for teams of all sizes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="p-6 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all hover:border-primary/50"
                >
                  <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-32 text-center">
          <div className="max-w-3xl mx-auto p-12 rounded-2xl bg-gradient-to-r from-primary to-indigo-600 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">
              Ready to get started?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of teams already using ProjectFlow to manage their projects.
            </p>
            <Link href={session ? "/dashboard" : "/auth/signup"}>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                {session ? "Go to Dashboard" : "Create your account"}
              </Button>
            </Link>
          </div>
        </div>
      </div>
      
      <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-12">
        <div className="container mx-auto px-4 text-center space-y-2">
          <p className="text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} ProjectFlow by <span className="font-semibold">ProjectPilot</span>. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            Visit us at{" "}
            <a 
              href="https://projectpilot.co.in" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              projectpilot.co.in
            </a>
          </p>
        </div>
      </footer>
    </div>
  )
}


