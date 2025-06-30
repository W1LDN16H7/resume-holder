"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FolderPlus, Folder, MoreVertical, Trash2, Lock, Unlock, FileText, Calendar, Edit, Eye } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useResumes } from "../../hooks/useResumes"
import { toast } from "sonner"

import { CryptoService } from "../../lib/crypto"

export function FoldersPage() {
  const { user } = useAuth()
  const { folders, resumes, addFolder, deleteFolder, updateResume } = useResumes(user?.id)


  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)

  const [selectedFolder, setSelectedFolder] = useState<any>(null)
  const [folderName, setFolderName] = useState("")
  const [folderPassword, setFolderPassword] = useState("")
  const [isPasswordProtected, setIsPasswordProtected] = useState(false)
  const [unlockPassword, setUnlockPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Folder name is required")
      return
    }

    if (isPasswordProtected && (!folderPassword || folderPassword.length < 6)) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    const result = await addFolder(folderName.trim(), isPasswordProtected ? folderPassword : undefined)

    if (result.success) {
      toast.success("Folder created successfully!")
      setIsCreateDialogOpen(false)
      setFolderName("")
      setFolderPassword("")
      setIsPasswordProtected(false)
    } else {
      toast.error(result.error || "Failed to create folder")
    }
    setIsLoading(false)
  }

  const handleDeleteFolder = async () => {
    if (!selectedFolder) return

    setIsLoading(true)
    const result = await deleteFolder(selectedFolder.id)

    if (result.success) {
      toast.success("Folder deleted successfully!")
      setIsDeleteDialogOpen(false)
      setSelectedFolder(null)
    } else {
      toast.error(result.error || "Failed to delete folder")
    }
    setIsLoading(false)
  }

  const handleUnlockFolder = async () => {
    if (!selectedFolder || !unlockPassword) {
      toast.error("Password is required")
      return
    }

    try {
      if (selectedFolder.encryptedPassword && selectedFolder.passwordIv) {
        await CryptoService.decrypt(selectedFolder.encryptedPassword, selectedFolder.passwordIv, unlockPassword)
        toast.success("Folder unlocked successfully!")
        setIsPasswordDialogOpen(false)
        setUnlockPassword("")
        // Here you could update the folder state or navigate to folder contents
      }
    } catch (error) {
      toast.error("Invalid password")
    }
  }

  const getFolderResumeCount = (folderId: number) => {
    return resumes.filter((resume) => resume.folderId === folderId).length
  }

  const openEditDialog = (folder: any) => {
    setSelectedFolder(folder)
    setFolderName(folder.name)
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (folder: any) => {
    setSelectedFolder(folder)
    setIsDeleteDialogOpen(true)
  }

  const openPasswordDialog = (folder: any) => {
    setSelectedFolder(folder)
    setIsPasswordDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Folders</h2>
          <p className="text-gray-600">Organize your resumes into folders for better management</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <FolderPlus className="mr-2 h-4 w-4" />
          New Folder
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Folders</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{folders.length}</div>
            <p className="text-xs text-muted-foreground">Active folders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Folders</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{folders.filter((f) => f.isLocked).length}</div>
            <p className="text-xs text-muted-foreground">Password protected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organized Resumes</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumes.filter((r) => r.folderId).length}</div>
            <p className="text-xs text-muted-foreground">In folders</p>
          </CardContent>
        </Card>
      </div>

      {/* Folders Grid */}
      {folders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Folder className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
            <p className="text-gray-600 mb-4 text-center">Create your first folder to organize your resumes</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <FolderPlus className="mr-2 h-4 w-4" />
              Create Folder
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Card key={folder.id} className="group hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Folder className="h-5 w-5 text-blue-600" />
                    </div>
                    {folder.isLocked && (
                      <div className="p-1 bg-amber-100 rounded">
                        <Lock className="h-3 w-3 text-amber-600" />
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => (window.location.href = `/dashboard/resumes?folder=${folder.id}`)}
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        View Contents
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditDialog(folder)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Rename
                      </DropdownMenuItem>
                      {folder.isLocked && (
                        <DropdownMenuItem onClick={() => openPasswordDialog(folder)}>
                          <Unlock className="mr-2 h-4 w-4" />
                          Unlock
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={() => openDeleteDialog(folder)} className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardTitle className="text-lg">{folder.name}</CardTitle>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {getFolderResumeCount(folder.id!)} resume{getFolderResumeCount(folder.id!) !== 1 ? "s" : ""}
                      </span>
                    </div>
                    {folder.isLocked && (
                      <Badge variant="secondary" className="text-xs">
                        <Lock className="mr-1 h-2 w-2" />
                        Protected
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>Created {new Date(folder.createdAt).toLocaleDateString()}</span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                    onClick={() => (window.location.href = `/dashboard/resumes?folder=${folder.id}`)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Contents
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
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
                  value={folderPassword}
                  onChange={(e) => setFolderPassword(e.target.value)}
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

      {/* Edit Folder Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Folder</DialogTitle>
            <DialogDescription>Change the folder name</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-folder-name">Folder Name</Label>
              <Input
                id="edit-folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                maxLength={50}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                // Handle folder rename logic here
                toast.success("Folder renamed successfully!")
                setIsEditDialogOpen(false)
              }}
            >
              Save Changes
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
              Are you sure you want to delete "{selectedFolder?.name}"? Resumes in this folder will be moved to "All
              Resumes".
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteFolder} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete Folder"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unlock Folder</DialogTitle>
            <DialogDescription>Enter the password to unlock "{selectedFolder?.name}"</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unlock-password">Password</Label>
              <Input
                id="unlock-password"
                type="password"
                value={unlockPassword}
                onChange={(e) => setUnlockPassword(e.target.value)}
                placeholder="Enter folder password"
                onKeyPress={(e) => e.key === "Enter" && handleUnlockFolder()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnlockFolder} disabled={!unlockPassword}>
              Unlock Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
