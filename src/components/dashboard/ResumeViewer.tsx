"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  FileText,
  Download,
  Share,
  Lock,
  Unlock,
  Edit,
  Trash2,
  MoreVertical,
  Eye,
  Calendar,
  Tag,
  Folder,
  ZoomIn,
  ZoomOut,
  RotateCw,
  X,
} from "lucide-react"
import { Document, Page, pdfjs } from "react-pdf"
import { CryptoService } from "../../lib/crypto"
import { toast } from "sonner"

import type { Resume } from "../../lib/database"

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`

interface ResumeViewerProps {
  resume: Resume
  onUpdate: (id: number, updates: Partial<Resume>) => Promise<{ success: boolean; error?: string }>
  onDelete: (id: number) => Promise<{ success: boolean; error?: string }>
  folders: Array<{ id: number; name: string }>
}

export function ResumeViewer({ resume, onUpdate, onDelete, folders }: ResumeViewerProps) {
  const [isViewerOpen, setIsViewerOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [pdfData, setPdfData] = useState<string | null>(null)
  const [numPages, setNumPages] = useState<number>(0)
  const [pageNumber, setPageNumber] = useState(1)
  const [scale, setScale] = useState(1.0)
  const [rotation, setRotation] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Edit form state
  const [editTitle, setEditTitle] = useState(resume.title)
  const [editDescription, setEditDescription] = useState(resume.description)
  const [editTags, setEditTags] = useState(resume.tags.join(", "))

  const folder = folders.find((f) => f.id === resume.folderId)

  const handleViewResume = async () => {
    setIsPasswordDialogOpen(true)
  }

  const handlePasswordSubmit = async () => {
    if (!password) {
      toast.error("Password is required")
      return
    }

    setIsLoading(true)

    try {
      const decryptedContent = await CryptoService.decrypt(resume.encryptedContent, resume.iv, password)
      const pdfBlob = new Blob([CryptoService.base64ToArrayBuffer(decryptedContent)], { type: "application/pdf" })
      const pdfUrl = URL.createObjectURL(pdfBlob)

      setPdfData(pdfUrl)
      setIsPasswordDialogOpen(false)
      setIsViewerOpen(true)
      setPassword("")

      toast.success("Resume decrypted successfully!")
    } catch (error) {
      toast.error("Invalid password or failed to decrypt resume")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = async () => {
    if (!pdfData) {
      handleViewResume()
      return
    }

    try {
      const link = document.createElement("a")
      link.href = pdfData
      link.download = `${resume.title.replace(/\s+/g, "_")}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast.success("Resume downloaded successfully!")
    } catch (error) {
      toast.error("Failed to download resume")
    }
  }

  const handleShare = async () => {
    if (!pdfData) {
      toast.error("Please view the resume first")
      return
    }

    try {
      await navigator.clipboard.writeText(pdfData)
      toast.success("Share link copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy share link")
    }
  }

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      toast.error("Title is required")
      return
    }

    setIsLoading(true)

    const tags = editTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 5)

    const result = await onUpdate(resume.id!, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      tags,
    })

    if (result.success) {
      toast.success("Resume updated successfully!")
      setIsEditDialogOpen(false)
    } else {
      toast.error(result.error || "Failed to update resume")
    }

    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this resume? This action cannot be undone.")) {
      const result = await onDelete(resume.id!)

      if (result.success) {
        toast.success("Resume deleted successfully!")
      } else {
        toast.error(result.error || "Failed to delete resume")
      }
    }
  }

  const handleToggleLock = async () => {
    const newPassword = prompt(resume.isLocked ? "Enter password to unlock:" : "Enter password to lock this resume:")

    if (!newPassword) return

    setIsLoading(true)

    try {
      if (resume.isLocked) {
        // Unlock logic
        if (resume.encryptedPassword && resume.passwordIv) {
          await CryptoService.decrypt(resume.encryptedPassword, resume.passwordIv, newPassword)
        }

        const result = await onUpdate(resume.id!, {
          isLocked: false,
          encryptedPassword: undefined,
          passwordIv: undefined,
        })

        if (result.success) {
          toast.success("Resume unlocked successfully!")
        }
      } else {
        // Lock logic
        const { encrypted, iv } = await CryptoService.encrypt(newPassword, newPassword)

        const result = await onUpdate(resume.id!, {
          isLocked: true,
          encryptedPassword: encrypted,
          passwordIv: iv,
        })

        if (result.success) {
          toast.success("Resume locked successfully!")
        }
      }
    } catch (error) {
      toast.error("Invalid password or operation failed")
    } finally {
      setIsLoading(false)
    }
  }

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages)
  }

  const closeViewer = () => {
    setIsViewerOpen(false)
    if (pdfData) {
      URL.revokeObjectURL(pdfData)
      setPdfData(null)
    }
    setPageNumber(1)
    setScale(1.0)
    setRotation(0)
  }

  return (
    <>
      <Card className="group hover:shadow-lg transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              {resume.isLocked && (
                <div className="p-1 bg-amber-100 rounded">
                  <Lock className="h-3 w-3 text-amber-600" />
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleViewResume}>
                  <Eye className="mr-2 h-4 w-4" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleShare}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleToggleLock}>
                  {resume.isLocked ? (
                    <>
                      <Unlock className="mr-2 h-4 w-4" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Lock
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-lg line-clamp-2">{resume.title}</CardTitle>
          {resume.description && <p className="text-sm text-muted-foreground line-clamp-2">{resume.description}</p>}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Tags */}
            {resume.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {resume.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    <Tag className="mr-1 h-2 w-2" />
                    {tag}
                  </Badge>
                ))}
                {resume.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{resume.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center space-x-3">
                {folder && (
                  <div className="flex items-center space-x-1">
                    <Folder className="h-3 w-3" />
                    <span>{folder.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 pt-2">
              <Button size="sm" onClick={handleViewResume} className="flex-1">
                <Eye className="mr-2 h-4 w-4" />
                View
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Password</DialogTitle>
            <DialogDescription>Enter the password to decrypt and view "{resume.title}"</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter encryption password"
                onKeyPress={(e) => e.key === "Enter" && handlePasswordSubmit()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePasswordSubmit} disabled={isLoading || !password}>
              {isLoading ? "Decrypting..." : "View Resume"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* PDF Viewer Dialog */}
      <Dialog open={isViewerOpen} onOpenChange={closeViewer}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <div className="flex items-center justify-between">
              <DialogTitle>{resume.title}</DialogTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={() => setScale(Math.max(0.5, scale - 0.1))}>
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{Math.round(scale * 100)}%</span>
                <Button variant="outline" size="sm" onClick={() => setScale(Math.min(2.0, scale + 0.1))}>
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setRotation((rotation + 90) % 360)}>
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={closeViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-auto p-6 pt-0">
            {pdfData && (
              <div className="flex flex-col items-center space-y-4">
                <Document file={pdfData} onLoadSuccess={onDocumentLoadSuccess} className="max-w-full">
                  <Page pageNumber={pageNumber} scale={scale} rotate={rotation} className="shadow-lg" />
                </Document>

                {numPages > 1 && (
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber(Math.max(1, pageNumber - 1))}
                      disabled={pageNumber <= 1}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pageNumber} of {numPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPageNumber(Math.min(numPages, pageNumber + 1))}
                      disabled={pageNumber >= numPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Resume</DialogTitle>
            <DialogDescription>Update the resume information</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input id="edit-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} maxLength={100} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Input
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
              <Input
                id="edit-tags"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
