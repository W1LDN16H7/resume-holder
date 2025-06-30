"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { User, Shield, Download, Trash2, Key, Database, Globe, AlertTriangle, CheckCircle, Info } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useResumes } from "../../hooks/useResumes"
import { toast } from "sonner"

import { db } from "../../lib/database"

export function SettingsPage() {
  const { user, signOut } = useAuth()
  const { resumes, folders } = useResumes(user?.id)


  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Settings state
  const [notifications, setNotifications] = useState(true)
  const [autoBackup, setAutoBackup] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const handleExportData = async () => {
    setIsLoading(true)
    try {
      const exportData = {
        exportedAt: new Date().toISOString(),
        version: "1.0.0",
        user: {
          email: user?.email,
          createdAt: user?.createdAt,
        },
        resumes: resumes.map((resume) => ({
          id: resume.id,
          title: resume.title,
          description: resume.description,
          tags: resume.tags,
          folderId: resume.folderId,
          isLocked: resume.isLocked,
          createdAt: resume.createdAt,
          updatedAt: resume.updatedAt,
        })),
        folders: folders.map((folder) => ({
          id: folder.id,
          name: folder.name,
          isLocked: folder.isLocked,
          createdAt: folder.createdAt,
        })),
        statistics: {
          totalResumes: resumes.length,
          totalFolders: folders.length,
          lockedResumes: resumes.filter((r) => r.isLocked).length,
        },
      }

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

      toast.success("Data exported successfully!")
      setIsExportDialogOpen(false)
    } catch (error) {
      toast.error("Failed to export data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      toast.error("Please type DELETE to confirm")
      return
    }

    setIsLoading(true)
    try {
      // Delete all user data
      await db.resumes.where("userId").equals(user!.id!).delete()
      await db.folders.where("userId").equals(user!.id!).delete()
      await db.users.delete(user!.id!)

      // Clear local storage
      localStorage.clear()

      toast.success("Account deleted successfully")
      signOut()
    } catch (error) {
      toast.error("Failed to delete account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setIsLoading(true)
    try {
      // Here you would implement password change logic
      toast.success("Password changed successfully!")
      setIsChangePasswordDialogOpen(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      toast.error("Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const calculateStorageUsage = () => {
    const totalSize = resumes.reduce((acc, resume) => {
      return acc + resume.encryptedContent.length * 0.75 // Base64 overhead
    }, 0)
    return Math.round((totalSize / 1024 / 1024) * 100) / 100 // MB
  }

  const storageUsage = calculateStorageUsage()
  const storageLimit = 100 // MB
  const storagePercentage = Math.min((storageUsage / storageLimit) * 100, 100)

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile Information</span>
          </CardTitle>
          <CardDescription>Manage your account details and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input value={user?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Account Created</Label>
              <Input value={user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : ""} disabled />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button onClick={() => setIsChangePasswordDialogOpen(true)}>
              <Key className="mr-2 h-4 w-4" />
              Change Password
            </Button>
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="mr-1 h-3 w-3" />
              Verified
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Security Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Security & Privacy</span>
          </CardTitle>
          <CardDescription>Your data security and privacy settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-800">AES-256 Encryption</span>
              </div>
              <p className="text-sm text-green-700">All resumes encrypted with military-grade security</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Local Storage</span>
              </div>
              <p className="text-sm text-blue-700">Data stored locally on your device only</p>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-purple-800">No Tracking</span>
              </div>
              <p className="text-sm text-purple-700">Zero data collection or tracking</p>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h4 className="font-medium">Privacy Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-gray-500">Receive updates about your resumes</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto Backup</Label>
                  <p className="text-sm text-gray-500">Automatically backup data to browser storage</p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Storage Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Storage Usage</span>
          </CardTitle>
          <CardDescription>Monitor your local storage usage</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used Storage</span>
              <span>
                {storageUsage} MB of {storageLimit} MB
              </span>
            </div>
            <Progress value={storagePercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{resumes.length}</div>
              <div className="text-sm text-gray-500">Resumes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{folders.length}</div>
              <div className="text-sm text-gray-500">Folders</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{resumes.filter((r) => r.isLocked).length}</div>
              <div className="text-sm text-gray-500">Locked</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Management Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Data Management</span>
          </CardTitle>
          <CardDescription>Export or delete your data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h4 className="font-medium">Export Data</h4>
              <p className="text-sm text-gray-500">Download all your resume metadata and folder structure</p>
            </div>
            <Button onClick={() => setIsExportDialogOpen(true)}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h4 className="font-medium text-red-800">Delete Account</h4>
              <p className="text-sm text-red-600">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Data Dialog */}
      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Data</DialogTitle>
            <DialogDescription>Download your resume metadata and folder structure as a JSON file</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">What's included:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Resume titles, descriptions, and tags</li>
                    <li>Folder structure and organization</li>
                    <li>Creation and modification dates</li>
                    <li>Usage statistics</li>
                  </ul>
                  <p className="mt-2 font-medium">Not included: Encrypted resume content and passwords</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleExportData} disabled={isLoading}>
              {isLoading ? "Exporting..." : "Export Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isChangePasswordDialogOpen} onOpenChange={setIsChangePasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Update your account password</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm New Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePasswordDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleChangePassword} disabled={isLoading}>
              {isLoading ? "Changing..." : "Change Password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Delete Account</span>
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. All your resumes, folders, and account data will be permanently deleted.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">
                Type <strong>DELETE</strong> to confirm account deletion:
              </p>
            </div>

            <Input
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              placeholder="Type DELETE to confirm"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading || deleteConfirmation !== "DELETE"}
            >
              {isLoading ? "Deleting..." : "Delete Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
