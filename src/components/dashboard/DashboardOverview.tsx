"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, FolderOpen, Upload, TrendingUp, Clock, Shield, Star, ArrowRight, Download, Eye } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useResumes } from "../../hooks/useResumes"
import { useAuth } from "../../contexts/AuthContext"
import { formatDate } from "../../lib/utils"

export function DashboardOverview() {
  const { user } = useAuth()
  const { resumes, folders, isLoading } = useResumes(user?.id)
  const navigate = useNavigate()

  const stats = [
    {
      name: "Total Resumes",
      value: resumes.length,
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      name: "Folders",
      value: folders.length,
      icon: FolderOpen,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+5%",
      changeType: "positive" as const,
    },
    {
      name: "This Month",
      value: resumes.filter((r) => {
        const monthAgo = new Date()
        monthAgo.setMonth(monthAgo.getMonth() - 1)
        return new Date(r.createdAt) > monthAgo
      }).length,
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      change: "+23%",
      changeType: "positive" as const,
    },
    {
      name: "Secured",
      value: resumes.filter((r) => r.isLocked).length,
      icon: Shield,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      change: "100%",
      changeType: "neutral" as const,
    },
  ] as const

  const recentResumes = resumes
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const quickActions = [
    {
      name: "Upload Resume",
      description: "Add a new resume to your collection",
      icon: Upload,
      href: "/dashboard/upload",
      color: "bg-blue-600",
    },
    {
      name: "Create Folder",
      description: "Organize your resumes",
      icon: FolderOpen,
      href: "/dashboard/folders",
      color: "bg-green-600",
    },
    {
      name: "Browse Templates",
      description: "Professional resume templates",
      icon: Star,
      href: "/dashboard/templates",
      color: "bg-purple-600",
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back!</h2>
            <p className="text-blue-100">
              You have {resumes.length} resumes in your secure wallet. Ready to manage your professional documents?
            </p>
          </div>
          <div className="hidden md:block">
            <Button variant="secondary" onClick={() => navigate("/dashboard/upload")}>
              <Upload className="mr-2 h-4 w-4" />
              Upload Resume
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.name}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    stat.changeType === "positive"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {stat.change}
                </span>
                <span className="ml-2">from last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks to manage your resumes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickActions.map((action) => (
              <div
                key={action.name}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(action.href)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${action.color} text-white`}>
                    <action.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-medium">{action.name}</p>
                    <p className="text-sm text-muted-foreground">{action.description}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Resumes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Resumes</CardTitle>
              <CardDescription>Your latest uploaded documents</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard/resumes")}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {recentResumes.length === 0 ? (
              <div className="text-center py-6">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes yet</h3>
                <p className="text-gray-600 mb-4">Upload your first resume to get started</p>
                <Button onClick={() => navigate("/dashboard/upload")}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentResumes.map((resume) => (
                  <div key={resume.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{resume.title}</p>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{formatDate(new Date(resume.updatedAt))}</span>
                          {resume.isLocked && (
                            <Badge variant="secondary" className="text-xs">
                              <Shield className="h-3 w-3 mr-1" />
                              Locked
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Storage Usage</CardTitle>
          <CardDescription>Your local storage usage and security status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium">Local Storage</p>
                <p className="text-xs text-muted-foreground">{resumes.length} resumes • All data encrypted locally</p>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-600">
                <Shield className="h-3 w-3 mr-1" />
                Secure
              </Badge>
            </div>
            <Progress value={Math.min((resumes.length / 100) * 100, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{resumes.length} / 100 resumes</span>
              <span>Unlimited storage</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
