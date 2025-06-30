"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, X, Plus, AlertCircle, CheckCircle } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useResumes } from "../../hooks/useResumes"
import { toast } from "sonner"

import { CryptoService } from "../../lib/crypto"
import { useNavigate } from "react-router-dom"

export function UploadResume() {
  const { user } = useAuth()
  const { folders, addResume } = useResumes(user?.id)

  const navigate = useNavigate()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("0") // Updated default value to "0"
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Title is required")
      return false
    }

    if (title.length > 100) {
      toast.error("Title must be less than 100 characters")
      return false
    }

    if (description.length > 5000) {
      toast.error("Description must be less than 5000 characters")
      return false
    }

    if (tags.length > 5) {
      toast.error("Maximum 5 tags allowed")
      return false
    }

    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return false
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return false
    }

    if (!file) {
      toast.error("Please select a PDF file")
      return false
    }

    return true
  }

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast.error("Please select a PDF file")
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB")
      return
    }

    setFile(selectedFile)

    // Auto-populate title if empty
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "")
      setTitle(nameWithoutExt.replace(/[_-]/g, " "))
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setUploadProgress(0)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90))
      }, 100)

      // Convert PDF to base64
      const arrayBuffer = await file!.arrayBuffer()
      const base64Content = CryptoService.arrayBufferToBase64(arrayBuffer)

      clearInterval(progressInterval)
      setUploadProgress(95)

      const result = await addResume(
        title.trim(),
        description.trim(),
        tags,
        base64Content,
        password,
        selectedFolder ? Number.parseInt(selectedFolder) : undefined,
      )

      setUploadProgress(100)

      if (result.success) {
        toast.success("Resume uploaded successfully!")

        // Reset form
        setTitle("")
        setDescription("")
        setTags([])
        setNewTag("")
        setSelectedFolder("0") // Updated default value to "0"
        setPassword("")
        setConfirmPassword("")
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }

        // Navigate to resumes list
        setTimeout(() => {
          navigate("/dashboard/resumes")
        }, 1000)
      } else {
        toast.error(result.error || "Failed to upload resume")
      }
    } catch (error) {
      toast.error("Failed to process file")
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Resume</CardTitle>
          <CardDescription>Upload and securely encrypt your resume with metadata for easy organization</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label>PDF File *</Label>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : file
                      ? "border-green-500 bg-green-50"
                      : "border-gray-300 hover:border-gray-400"
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {file ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-green-700">{file.name}</p>
                      <p className="text-sm text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                    </div>
                    <Button type="button" variant="outline" onClick={() => setFile(null)}>
                      <X className="w-4 h-4 mr-2" />
                      Remove File
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center">
                      <Upload className="w-12 h-12 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900 mb-2">
                        Drag and drop your PDF here, or{" "}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          browse files
                        </button>
                      </p>
                      <p className="text-sm text-gray-500">Maximum file size: 5MB • PDF files only</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter resume title (e.g., Software Engineer Resume)"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500">{title.length}/100 characters</p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this resume (optional)"
                maxLength={5000}
                rows={3}
              />
              <p className="text-xs text-gray-500">{description.length}/5000 characters</p>
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags (max 5)</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag (e.g., frontend, react, senior)"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                  disabled={tags.length >= 5}
                />
                <Button
                  type="button"
                  onClick={addTag}
                  disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 5}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500">Tags help you organize and find your resumes quickly</p>
            </div>

            {/* Folder Selection */}
            <div className="space-y-2">
              <Label>Folder (optional)</Label>
              <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No folder</SelectItem> {/* Updated value prop to "0" */}
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id!.toString()}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Encryption Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  minLength={6}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  minLength={6}
                  required
                />
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Security Notice</p>
                  <p>
                    Your resume will be encrypted with AES-256 encryption using your password. Make sure to remember
                    this password as it cannot be recovered.
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            {isLoading && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Uploading and encrypting...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <Button type="submit" disabled={isLoading} className="w-full h-12">
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Uploading Resume...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
