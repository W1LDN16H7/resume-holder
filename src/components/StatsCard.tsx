"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Folder, Lock, TrendingUp } from "lucide-react"
import type { Resume, Folder as FolderType } from "../lib/database"

interface StatsCardProps {
  resumes: Resume[]
  folders: FolderType[]
}

export function StatsCard({ resumes, folders }: StatsCardProps) {
  const totalResumes = resumes.length
  const lockedResumes = resumes.filter((r) => r.isLocked).length
  const totalFolders = folders.length
  const recentResumes = resumes.filter((r) => {
    const daysSinceCreated = (Date.now() - new Date(r.createdAt).getTime()) / (1000 * 60 * 60 * 24)
    return daysSinceCreated <= 7
  }).length

  const totalSize = resumes.reduce((acc, resume) => {
    // Estimate size based on encrypted content length
    return acc + resume.encryptedContent.length * 0.75 // Base64 overhead
  }, 0)

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const stats = [
    {
      title: "Total Resumes",
      value: totalResumes,
      description: "Resumes in your wallet",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Folders",
      value: totalFolders,
      description: "Organization folders",
      icon: Folder,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Locked",
      value: lockedResumes,
      description: "Password protected",
      icon: Lock,
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
    {
      title: "Recent",
      value: recentResumes,
      description: "Added this week",
      icon: TrendingUp,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}

      {/* Storage Usage Card */}
      <Card className="md:col-span-2 lg:col-span-4">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatSize(totalSize)}</div>
              <p className="text-xs text-muted-foreground">Encrypted resume data</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {totalResumes} files
              </Badge>
              <Badge variant="outline" className="text-xs">
                Client-side only
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
