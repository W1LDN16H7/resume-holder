"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import {
  FileText,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Copy,
  Star,
  Eye,
  Briefcase,
  Code,
  Palette,
  User,
} from "lucide-react"
import { TemplateService, defaultTemplates } from "../../lib/templates"
import { toast } from "sonner"


export function TemplatesPage() {
  const [templates, setTemplates] = useState(defaultTemplates)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(-1)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)

  const [templateName, setTemplateName] = useState("")
  const [templateContent, setTemplateContent] = useState("")
  const [templateType, setTemplateType] = useState<"professional" | "tech" | "creative" | "custom">("custom")
  const [isLoading, setIsLoading] = useState(false)


  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const loadedTemplates = await TemplateService.getTemplates()
      setTemplates(loadedTemplates)
    } catch (error) {
      toast.error("Failed to load templates")
    }
  }

  const handleCreateTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Template name is required")
      return
    }

    if (!templateContent.trim()) {
      toast.error("Template content is required")
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
      toast.success("Template created successfully!")

      setIsCreateDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to create template")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditTemplate = async () => {
    if (!templateName.trim()) {
      toast.error("Template name is required")
      return
    }

    if (!templateContent.trim()) {
      toast.error("Template content is required")
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
      toast.success("Template updated successfully!")

      setIsEditDialogOpen(false)
      resetForm()
    } catch (error) {
      toast.error("Failed to update template")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteTemplate = async (index: number) => {
    if (templates[index].isDefault) {
      toast.error("Default templates cannot be deleted")
      return
    }

    if (!window.confirm("Are you sure you want to delete this template?")) {
      return
    }

    setIsLoading(true)
    try {
      await TemplateService.deleteTemplate(index)
      await loadTemplates()
      toast.success("Template deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete template")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadTemplate = (template: any) => {
    const blob = new Blob([template.content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${template.name.replace(/\s+/g, "_")}_template.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Template downloaded successfully!")
  }

  const handleCopyTemplate = async (template: any) => {
    try {
      await navigator.clipboard.writeText(template.content)
      toast.success("Template content copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy template content")
    }
  }

  const openEditDialog = (index: number) => {
    const template = templates[index]
    setEditingIndex(index)
    setTemplateName(template.name)
    setTemplateContent(template.content)
    setTemplateType(template.type)
    setIsEditDialogOpen(true)
  }

  const openPreviewDialog = (template: any) => {
    setSelectedTemplate(template)
    setIsPreviewDialogOpen(true)
  }

  const resetForm = () => {
    setTemplateName("")
    setTemplateContent("")
    setTemplateType("custom")
    setEditingIndex(-1)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "professional":
        return <Briefcase className="h-4 w-4" />
      case "tech":
        return <Code className="h-4 w-4" />
      case "creative":
        return <Palette className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "professional":
        return "bg-blue-100 text-blue-800"
      case "tech":
        return "bg-green-100 text-green-800"
      case "creative":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Templates</h2>
          <p className="text-gray-600">Professional templates to help you create stunning resumes</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Professional</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.filter((t) => t.type === "professional").length}</div>
            <p className="text-xs text-muted-foreground">Business focused</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tech</CardTitle>
            <Code className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.filter((t) => t.type === "tech").length}</div>
            <p className="text-xs text-muted-foreground">Developer focused</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Creative</CardTitle>
            <Palette className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.filter((t) => t.type === "creative").length}</div>
            <p className="text-xs text-muted-foreground">Design focused</p>
          </CardContent>
        </Card>
      </div>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template, index) => (
          <Card key={index} className="group hover:shadow-lg transition-all duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <Badge className={`${getTypeColor(template.type)} flex items-center space-x-1`}>
                    {getTypeIcon(template.type)}
                    <span className="capitalize">{template.type}</span>
                  </Badge>
                  {template.isDefault && (
                    <Badge variant="outline" className="text-xs">
                      <Star className="mr-1 h-2 w-2" />
                      Default
                    </Badge>
                  )}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openPreviewDialog(template)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleCopyTemplate(template)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Content
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    {!template.isDefault && (
                      <>
                        <DropdownMenuItem onClick={() => openEditDialog(index)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteTemplate(index)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <CardTitle className="text-lg">{template.name}</CardTitle>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="text-sm text-gray-600 line-clamp-3 bg-gray-50 p-3 rounded-lg font-mono text-xs">
                  {template.content.substring(0, 150)}...
                </div>

                <div className="flex items-center space-x-2">
                  <Button size="sm" onClick={() => openPreviewDialog(template)} className="flex-1">
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleCopyTemplate(template)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate(template)}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Template</DialogTitle>
            <DialogDescription>Create a new resume template for future use</DialogDescription>
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

      {/* Preview Template Dialog */}
      <Dialog open={isPreviewDialogOpen} onOpenChange={setIsPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <span>{selectedTemplate?.name}</span>
              <Badge className={getTypeColor(selectedTemplate?.type || "custom")}>{selectedTemplate?.type}</Badge>
            </DialogTitle>
            <DialogDescription>Template preview and content</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="whitespace-pre-wrap text-sm font-mono">{selectedTemplate?.content}</pre>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleCopyTemplate(selectedTemplate)}>
              <Copy className="mr-2 h-4 w-4" />
              Copy Content
            </Button>
            <Button onClick={() => handleDownloadTemplate(selectedTemplate)}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
