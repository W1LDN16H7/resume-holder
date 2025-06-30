"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { FileText, MoreVertical, Edit, Download, Trash2, Lock, Unlock, Calendar, FolderOpen } from "lucide-react"
import type { Resume } from "../lib/database"
import { toast } from "sonner"

import { CryptoService } from "../lib/crypto"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

interface ResumeCardProps {
  resume: Resume
  folders: Array<{ id: number; name: string }>
  onUpdate: (id: number, updates: Partial<Resume>) => Promise<{ success: boolean; error?: string }>
  onDelete: (id: number) => Promise<{ success: boolean; error?: string }>
  onDownload: (resume: Resume) => void
}

export function ResumeCard({ resume, folders, onUpdate, onDelete, onDownload }: ResumeCardProps) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [editTitle, setEditTitle] = useState(resume.title)
  const [editDescription, setEditDescription] = useState(resume.description)
  const [editTags, setEditTags] = useState(resume.tags.join(", "))
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)



  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: resume.id! })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const folder = folders.find((f) => f.id === resume.folderId)

  const handleEdit = async () => {
    if (!editTitle.trim()) {
      toast("Title is required")
      return
    }

    if (editTitle.length > 100) {
      toast("Title must be less than 100 characters")
      return
    }

    if (editDescription.length > 5000) {
      toast("Description must be less than 5000 characters")
       
      return
    }

    const tags = editTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0)
      .slice(0, 5)

    setIsLoading(true)
    const result = await onUpdate(resume.id!, {
      title: editTitle.trim(),
      description: editDescription.trim(),
      tags,
    })

    if (result.success) {
      toast("Resume updated successfully!")
      setIsEditDialogOpen(false)
    } else {
      toast(result.error || "Failed to update resume")
     
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    setIsLoading(true)
    const result = await onDelete(resume.id!)

    if (result.success) {
      toast("Resume deleted successfully!")
      setIsDeleteDialogOpen(false)
    } else {
      toast(result.error || "Failed to delete resume")
      
    }
    setIsLoading(false)
  }

  const handleToggleLock = async () => {
    if (resume.isLocked) {
      // Unlock
      if (!password) {
        toast("Password Required: Please enter the password to unlock")
        return
      }

      try {
        // Verify password by trying to decrypt
        if (resume.encryptedPassword && resume.passwordIv) {
          await CryptoService.decrypt(resume.encryptedPassword, resume.passwordIv, password)
        }

        const result = await onUpdate(resume.id!, {
          isLocked: false,
          encryptedPassword: undefined,
          passwordIv: undefined,
        })

        if (result.success) {
          toast("Resume unlocked successfully!")
          setIsPasswordDialogOpen(false)
          setPassword("")
        }
      } catch (error) {
        toast("Failed to unlock resume")
      }
    } else {
      // Lock
      if (!password || password.length < 6) {
        toast("Invalid Password: The password you entered is incorrect")
      } else {
        // Lock
        if (!password || password.length < 6) {
          toast("Invalid Password: Password must be at least 6 characters")
          return
        }
      }

      try {
        const { encrypted, iv } = await CryptoService.encrypt(password, password)

        const result = await onUpdate(resume.id!, {
          isLocked: true,
          encryptedPassword: encrypted,
          passwordIv: iv,
        })

        if (result.success) {
          toast("Resume locked successfully!")
          setIsPasswordDialogOpen(false)
          setPassword("")
        }
      } catch (error) {
        toast( "Failed to lock resume")
      }
    }
  }

  return (
    <>
      <Card
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`cursor-grab active:cursor-grabbing transition-all hover:shadow-md ${
          resume.isLocked ? "border-amber-200 bg-amber-50" : ""
        }`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-blue-600" />
              {resume.isLocked && <Lock className="w-4 h-4 text-amber-600" />}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDownload(resume)}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsPasswordDialogOpen(true)}>
                  {resume.isLocked ? (
                    <>
                      <Unlock className="w-4 h-4 mr-2" />
                      Unlock
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Lock
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsDeleteDialogOpen(true)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <CardTitle className="text-lg">{resume.title}</CardTitle>
          <CardDescription className="line-clamp-2">{resume.description || "No description provided"}</CardDescription>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Tags */}
            {resume.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {resume.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Metadata */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-4">
                {folder && (
                  <div className="flex items-center space-x-1">
                    <FolderOpen className="w-3 h-3" />
                    <span>{folder.name}</span>
                  </div>
                )}
                <div className="flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(resume.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <Textarea
                id="edit-description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                maxLength={5000}
                rows={3}
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

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resume</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{resume.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{resume.isLocked ? "Unlock Resume" : "Lock Resume"}</DialogTitle>
            <DialogDescription>
              {resume.isLocked ? "Enter the password to unlock this resume" : "Set a password to lock this resume"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                minLength={6}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleToggleLock} disabled={isLoading}>
              {isLoading ? "Processing..." : resume.isLocked ? "Unlock" : "Lock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
