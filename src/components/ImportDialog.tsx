"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Link, FileText, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { CryptoService } from "../lib/crypto"

interface ImportDialogProps {
  isOpen: boolean
  onClose: () => void
  folders: Array<{ id: number; name: string }>
  onImportResume: (
    title: string,
    description: string,
    tags: string[],
    pdfContent: string,
    password: string,
    folderId?: number,
  ) => Promise<{ success: boolean; error?: string }>
}

export function ImportDialog({ isOpen, onClose, folders, onImportResume }: ImportDialogProps) {
  const [activeTab, setActiveTab] = useState("url")
  const [isLoading, setIsLoading] = useState(false)

  // URL Import
  const [importUrl, setImportUrl] = useState("")

  // File Import
  const [importFile, setImportFile] = useState<File | null>(null)

  // Common fields
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [password, setPassword] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")



  const resetForm = () => {
    setImportUrl("")
    setImportFile(null)
    setTitle("")
    setDescription("")
    setTags("")
    setPassword("")
    setSelectedFolder("")
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const validateForm = () => {
    if (!title.trim()) {
      toast("Title is required")
      return false
    }

    if (!password || password.length < 6) {
      toast("Password must be at least 6 characters")
      return false
    }

    if (activeTab === "url" && !importUrl.trim()) {
      toast("Please enter a valid URL")
      return false
    }

    if (activeTab === "file" && !importFile) {
      toast("Please select a file")
       
      return false
    }

    return true
  }

  const processFile = async (file: File): Promise<string> => {
    if (file.type !== "application/pdf") {
      throw new Error("Only PDF files are supported")
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error("File size must be less than 5MB")
    }

    const arrayBuffer = await file.arrayBuffer()
    return CryptoService.arrayBufferToBase64(arrayBuffer)
  }

  const handleUrlImport = async () => {
    try {
      let downloadUrl = importUrl.trim()

      // Convert Google Drive share URL to direct download URL
      if (downloadUrl.includes("drive.google.com")) {
        const fileIdMatch = downloadUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)
        if (fileIdMatch) {
          downloadUrl = `https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`
        } else {
          throw new Error("Invalid Google Drive URL format")
        }
      }

      // Fetch the file
      const response = await fetch(downloadUrl, {
        mode: "cors",
        headers: {
          Accept: "application/pdf",
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`)
      }

      const blob = await response.blob()
      const file = new File([blob], "imported_resume.pdf", { type: "application/pdf" })

      return await processFile(file)
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error("Failed to import from URL")
    }
  }

  const handleFileImport = async () => {
    if (!importFile) {
      throw new Error("No file selected")
    }

    return await processFile(importFile)
  }

  const handleImport = async () => {
    if (!validateForm()) return

    setIsLoading(true)

    try {
      let pdfContent: string

      if (activeTab === "url") {
        pdfContent = await handleUrlImport()
      } else {
        pdfContent = await handleFileImport()
      }

      const tagArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
        .slice(0, 5)

      const result = await onImportResume(
        title.trim(),
        description.trim(),
        tagArray,
        pdfContent,
        password,
        selectedFolder ? Number.parseInt(selectedFolder) : undefined,
      )

      if (result.success) {
        toast({
          title: "Success",
          description: "Resume imported successfully!",
        })
        handleClose()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to import resume",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: error instanceof Error ? error.message : "Failed to import resume",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileSelect = (file: File | null) => {
    setImportFile(file)
    if (file && !title) {
      // Auto-populate title from filename
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
      setTitle(nameWithoutExt.replace(/[_-]/g, " "))
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Resume</DialogTitle>
          <DialogDescription>Import a resume from an external source or upload a local file</DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="flex items-center space-x-2">
              <Link className="w-4 h-4" />
              <span>From URL</span>
            </TabsTrigger>
            <TabsTrigger value="file" className="flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>Upload File</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Import from URL</CardTitle>
                <CardDescription>Import a resume from Google Drive or any direct PDF URL</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="import-url">PDF URL</Label>
                  <Input
                    id="import-url"
                    value={importUrl}
                    onChange={(e) => setImportUrl(e.target.value)}
                    placeholder="https://drive.google.com/file/d/... or direct PDF URL"
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Google Drive Instructions:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Right-click your PDF in Google Drive</li>
                        <li>Select "Get link" and set to "Anyone with the link"</li>
                        <li>Copy and paste the share URL here</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="file" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Upload File</CardTitle>
                <CardDescription>Upload a PDF file from your device</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>PDF File</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {importFile ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FileText className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-700">
                          {importFile.name} ({(importFile.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => handleFileSelect(null)}>
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600 mb-2">Click to select a PDF file</p>
                        <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => handleFileSelect(e.target.files?.[0] || null)}
                    className="hidden"
                    id="file-input"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("file-input")?.click()}
                    className="w-full"
                  >
                    Select PDF File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Common Fields */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resume Information</CardTitle>
            <CardDescription>Provide details about the resume you're importing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="import-title">Title *</Label>
                <Input
                  id="import-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter resume title"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="import-folder">Folder (optional)</Label>
                <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a folder" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">No folder</SelectItem>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.id.toString()}>
                        {folder.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-description">Description</Label>
              <Textarea
                id="import-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this resume"
                maxLength={5000}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-tags">Tags (comma-separated, max 5)</Label>
              <Input
                id="import-tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="e.g., software engineer, react, frontend"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="import-password">Encryption Password *</Label>
              <Input
                id="import-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password for encryption"
                minLength={6}
              />
              <p className="text-xs text-gray-500">This password will be used to encrypt the imported resume</p>
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={isLoading}>
            {isLoading ? "Importing..." : "Import Resume"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
