"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText, Folder, Shield } from "lucide-react"
import type { Resume, Folder as FolderType } from "../lib/database"

import { toast } from "sonner"

interface ExportDialogProps {
  isOpen: boolean
  onClose: () => void
  resumes: Resume[]
  folders: FolderType[]
}

export function ExportDialog({ isOpen, onClose, resumes, folders }: ExportDialogProps) {
  const [includeMetadata, setIncludeMetadata] = useState(true)
  const [includeFolders, setIncludeFolders] = useState(true)
  const [includeStats, setIncludeStats] = useState(true)
  const [isExporting, setIsExporting] = useState(false)



  const handleExport = async () => {
    setIsExporting(true)

    try {
      const exportData: any = {
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        totalResumes: resumes.length,
      }

      if (includeMetadata) {
        exportData.resumes = resumes.map((resume) => ({
          id: resume.id,
          title: resume.title,
          description: resume.description,
          tags: resume.tags,
          folderId: resume.folderId,
          isLocked: resume.isLocked,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
          // Note: We don't export encrypted content for security
        }))
      }

      if (includeFolders) {
        exportData.folders = folders.map((folder) => ({
          id: folder.id,
          name: folder.name,
          isLocked: folder.isLocked,
          createdAt: folder.createdAt,
        }))
      }

      if (includeStats) {
        const now = new Date()
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const lastMonth = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

        exportData.statistics = {
          totalResumes: resumes.length,
          totalFolders: folders.length,
          lockedResumes: resumes.filter((r) => r.isLocked).length,
          resumesThisWeek: resumes.filter((r) => new Date(r.createdAt) > lastWeek).length,
          resumesThisMonth: resumes.filter((r) => new Date(r.createdAt) > lastMonth).length,
          allTags: Array.from(new Set(resumes.flatMap((r) => r.tags))),
          averageTagsPerResume:
            resumes.length > 0 ? resumes.reduce((sum, r) => sum + r.tags.length, 0) / resumes.length : 0,
        }
      }

      // Create and download the file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      })

      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `resume-wallet-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast("Your resume data has been exported successfully!")

      onClose()
    } catch (error) {
      toast("Failed to export resume data. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Export Resume Data</DialogTitle>
          <DialogDescription>Choose what data to include in your export file</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Export Options</CardTitle>
              <CardDescription>Select the data you want to include</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox id="metadata" checked={includeMetadata} onCheckedChange={setIncludeMetadata} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="metadata" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Resume Metadata</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Titles, descriptions, tags, and dates</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="folders" checked={includeFolders} onCheckedChange={setIncludeFolders} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="folders" className="flex items-center space-x-2">
                    <Folder className="w-4 h-4" />
                    <span>Folder Structure</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Folder names and organization</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="stats" checked={includeStats} onCheckedChange={setIncludeStats} />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="stats" className="flex items-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>Usage Statistics</span>
                  </Label>
                  <p className="text-xs text-muted-foreground">Summary statistics and insights</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Shield className="w-5 h-5 text-amber-600 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-medium mb-1">Security Notice</p>
                <p>
                  Encrypted resume content and passwords are never included in exports for your security and privacy.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
