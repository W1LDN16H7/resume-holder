"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, Plus, MoreVertical, Edit, Trash2, Download } from "lucide-react"
import { TemplateService, defaultTemplates } from "../lib/templates"
import { toast } from "sonner"

export function TemplateManager() {
  const [templates, setTemplates] = useState(defaultTemplates)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [templateName, setTemplateName] = useState("")
  const [templateContent, setTemplateContent] = useState("")
  const [templateType, setTemplateType] = useState<"professional" | "tech" | "creative" >("tech")
  const [isLoading, setIsLoading] = useState(false)

  

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const loadedTemplates = await TemplateService.getTemplates()
      setTemplates(loadedTemplates)
    } catch (error) {
      toast("Failed to load templates")
    }
  }

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      toast("Template name is required")
      return
    }

    if (!templateContent.trim()) {
      toast("Template content is required")
      return
    }

    setIsLoading(true)
    try {
      await TemplateService.addTemplate({
        name: templateName.trim(),
        content: templateContent.trim(),
        type: templateType,
        createdAt: new Date(),
      })

      await loadTemplates()
      toast("Template created successfully!")

      setIsCreateDialogOpen(false)
      setTemplateName("")
      setTemplateContent("")
      setTemplateType("tech")
    } catch (error) {
      toast("Failed to create template")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditTemplate = async () => {
    if (!templateName.trim()) {
      toast("Template name is required")
      return
    }

    if (!templateContent.trim()) {
      toast("Template content is required")
      return
    }

    setIsLoading(true)
    try {
      await TemplateService.updateTemplate(editingIndex, {
        name: templateName.trim(),
        content: templateContent.trim(),
        type: templateType,
      })

      await loadTemplates()
      toast("Template updated successfully!")

      setIsEditDialogOpen(false)
      setEditingIndex(-1)
      setTemplateName("")
      setTemplateContent("")
      setTemplateType("tech")
    } catch (error) {
      toast("Failed to update template")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTemplate = async (index: number) => {
    if (templates[index].isDefault) {
      toast("Default templates cannot be deleted")
      return
    }

    setIsLoading(true)
    try {
      await TemplateService.deleteTemplate(index)
      await loadTemplates()
      toast("Template deleted successfully!")
    } catch (error) {
      toast("Failed to delete template")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTemplate = (template: (typeof templates)[0]) => {
    const blob = new Blob([template.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${template.name.replace(/\s+/g, "_")}_template.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const openEditDialog = (index: number) => {
    const template = templates[index]
    setEditingIndex(index)
    setTemplateName(template.name)
    setTemplateContent(template.content)
    setTemplateType(template.type)
    setIsEditDialogOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resume Templates</CardTitle>
              <CardDescription>Manage and create resume templates</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)} size="sm">
              <Plus className="w-4 h-4 mr-2" />
              New Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      <Badge variant={template.isDefault ? "default" : "secondary"}>{template.type}</Badge>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEditDialog(index)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </DropdownMenuItem>
                        {!template.isDefault && (
                          <DropdownMenuItem onClick={() => handleDeleteTemplate(index)} className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="text-sm text-gray-600 line-clamp-3">{template.content.substring(0, 150)}...</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>Create a new resume template that can be used by all users</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="template-type">Template Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-content">Template Content (Markdown)</Label>
              <Textarea
                id="template-content"
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder="Enter template content in Markdown format..."
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Use Markdown formatting. Placeholders like [Your Name], [Company Name] will be highlighted for users.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTemplate} disabled={isLoading}>
              {isLoading ? "Creating..." : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>Update the template information and content</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-template-name">Template Name</Label>
                <Input
                  id="edit-template-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  maxLength={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-template-type">Template Type</Label>
                <Select value={templateType} onValueChange={setTemplateType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="tech">Tech</SelectItem>
                    <SelectItem value="creative">Creative</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-template-content">Template Content (Markdown)</Label>
              <Textarea
                id="edit-template-content"
                value={templateContent}
                onChange={(e) => setTemplateContent(e.target.value)}
                placeholder="Enter template content in Markdown format..."
                rows={15}
                className="font-mono text-sm"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditTemplate} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
