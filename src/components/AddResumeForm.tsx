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
import { Upload, X, Plus } from "lucide-react"
import { CryptoService } from "../lib/crypto"
import { toast } from "sonner"

interface AddResumeFormProps {
  folders: Array<{ id: number; name: string }>
  onAddResume: (
    title: string,
    description: string,
    tags: string[],
    pdfContent: string,
    password: string,
    folderId?: number,
  ) => Promise<{ success: boolean; error?: string }>
}

export function AddResumeForm({ folders, onAddResume }: AddResumeFormProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [selectedFolder, setSelectedFolder] = useState("")
  const [password, setPassword] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)


  const validateForm = () => {
    if (!title.trim()) {
      toast("Title is required")
      return false
    }

    if (title.length > 100) {
      toast("Title must be less than 100 characters")
   
      return false
    }

    if (description.length > 5000) {
      toast("Description must be less than 5000 characters")
      return false
    }

    if (tags.length > 5) {
      toast("Maximum 5 tags allowed")
      return false
    }

    if (!password || password.length < 6) {
      toast("Password must be at least 6 characters")
      return false
    }

    if (!file) {
      toast("Please select a PDF file")
       
      return false
    }

    return true
  }

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== "application/pdf") {
      toast("Please select a PDF file")
      return
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      // 5MB
      toast("File size must be less than 5MB")
      return
    }

    setFile(selectedFile)
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

    try {
      // Convert PDF to base64
      const arrayBuffer = await file!.arrayBuffer()
      const base64Content = CryptoService.arrayBufferToBase64(arrayBuffer)

      const result = await onAddResume(
        title.trim(),
        description.trim(),
        tags,
        base64Content,
        password,
        selectedFolder ? Number.parseInt(selectedFolder) : undefined,
      )

      if (result.success) {
        toast("Resume added successfully!")

        // Reset form
        setTitle("")
        setDescription("")
        setTags([])
        setNewTag("")
        setSelectedFolder("")
        setPassword("")
        setFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
      } else {
        toast(result.error || "Failed to add resume")
      }
    } catch (error) {
      toast("Failed to process file")
       
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Resume</CardTitle>
        <CardDescription>Upload and organize your resume with secure encryption</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>PDF File</Label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
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
                <div className="flex items-center justify-center space-x-2">
                  <Upload className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-700">
                    {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setFile(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 mb-2">
                    Drag and drop your PDF here, or{" "}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">Maximum file size: 5MB</p>
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
              placeholder="Enter resume title"
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
              placeholder="Brief description of this resume"
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
                placeholder="Add a tag"
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
          </div>

          {/* Folder Selection */}
          <div className="space-y-2">
            <Label>Folder (optional)</Label>
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

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Encryption Password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password for encryption"
              minLength={6}
              required
            />
            <p className="text-xs text-gray-500">This password will be used to encrypt your resume content</p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Adding Resume..." : "Add Resume"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
