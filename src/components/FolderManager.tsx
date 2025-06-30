"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FolderPlus, Folder, MoreVertical, Trash2, Lock } from "lucide-react"
import type { Folder as FolderType } from "../lib/database"
import { toast } from "sonner"


interface FolderManagerProps {
  folders: FolderType[]
  onAddFolder: (name: string, password?: string) => Promise<{ success: boolean; error?: string }>
  onDeleteFolder: (id: number) => Promise<{ success: boolean; error?: string }>
  selectedFolder: number | null
  onSelectFolder: (folderId: number | null) => void
}

export function FolderManager({
  folders,
  onAddFolder,
  onDeleteFolder,
  selectedFolder,
  onSelectFolder,
}: FolderManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [folderToDelete, setFolderToDelete] = useState<FolderType | null>(null)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderPassword, setNewFolderPassword] = useState("")
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      toast({
        title: "Validation Error",
        description: "Folder name is required",
        variant: "destructive",
      })
      return
    }

    if (isPasswordProtected && (!newFolderPassword || newFolderPassword.length < 6)) {
      toast({
        title: "Validation Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    const result = await onAddFolder(newFolderName.trim(), isPasswordProtected ? newFolderPassword : undefined)

    if (result.success) {
      toast("Folder created successfully!")
      setIsCreateDialogOpen(false)
      setNewFolderName("")
      setNewFolderPassword("")
      setIsPasswordProtected(false)
    } else {
      toast(result.error || "Failed to create folder")
    }
    setIsLoading(false)
  }

  const handleDeleteFolder = async () => {
    if (!folderToDelete) return

    setIsLoading(true)
    const result = await onDeleteFolder(folderToDelete.id!)

    if (result.success) {
      toast("Folder deleted successfully!")
      setIsDeleteDialogOpen(false)
      setFolderToDelete(null)
      if (selectedFolder === folderToDelete.id) {
        onSelectFolder(null)
      }
    } else {
      toast(result.error || "Failed to delete folder")
    }
    setIsLoading(false)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Folders</CardTitle>
              <CardDescription>Organize your resumes into folders</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
              <FolderPlus className="w-4 h-4 mr-2" />
              New Folder
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {/* All Resumes Option */}
            <div
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedFolder === null ? "bg-blue-100 border border-blue-200" : "hover:bg-gray-50"
              }`}
              onClick={() => onSelectFolder(null)}
            >
              <div className="flex items-center space-x-2">
                <Folder className="w-4 h-4 text-gray-600" />
                <span className="font-medium">All Resumes</span>
              </div>
            </div>

            {/* Folder List */}
            {folders.map((folder) => (
              <div
                key={folder.id}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedFolder === folder.id ? "bg-blue-100 border border-blue-200" : "hover:bg-gray-50"
                }`}
                onClick={() => onSelectFolder(folder.id!)}
              >
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{folder.name}</span>
                  {folder.isLocked && <Lock className="w-3 h-3 text-amber-600" />}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation()
                        setFolderToDelete(folder)
                        setIsDeleteDialogOpen(true)
                      }}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}

            {folders.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Folder className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No folders created yet</p>
                <p className="text-xs">Create your first folder to organize resumes</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Folder Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
            <DialogDescription>Create a folder to organize your resumes</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="folder-name">Folder Name</Label>
              <Input
                id="folder-name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name"
                maxLength={50}
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="password-protected"
                checked={isPasswordProtected}
                onChange={(e) => setIsPasswordProtected(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="password-protected">Password protect this folder</Label>
            </div>

            {isPasswordProtected && (
              <div className="space-y-2">
                <Label htmlFor="folder-password">Password</Label>
                <Input
                  id="folder-password"
                  type="password"
                  value={newFolderPassword}
                  onChange={(e) => setNewFolderPassword(e.target.value)}
                  placeholder="Enter password"
                  minLength={6}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Folder Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Folder</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{folderToDelete?.name}"? Resumes in this folder will be moved to "All
              Resumes".
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
