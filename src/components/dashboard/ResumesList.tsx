"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { DndContext, type DragEndEvent, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { Search, Filter, Grid, List, Upload } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { useResumes } from "../../hooks/useResumes"
import { ResumeViewer } from "./ResumeViewer"

export function ResumesList() {
  const { user } = useAuth()
  const {
    resumes,
    folders,
    allTags,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedFolder,
    setSelectedFolder,
    selectedTags,
    setSelectedTags,
    updateResume,
    deleteResume,
    moveResumeToFolder,
  } = useResumes(user?.id)

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"title" | "createdAt" | "updatedAt">("updatedAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  // Filtered and sorted resumes
  const filteredResumes = useMemo(() => {
    let filtered = resumes

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (resume) =>
          resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resume.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          resume.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    // Apply folder filter
    if (selectedFolder !== null) {
      filtered = filtered.filter((resume) => resume.folderId === selectedFolder)
    }

    // Apply tag filter
    if (selectedTags.length > 0) {
      filtered = filtered.filter((resume) => selectedTags.every((tag) => resume.tags.includes(tag)))
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title)
          break
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case "updatedAt":
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
      }

      return sortOrder === "asc" ? comparison : -comparison
    })

    return filtered
  }, [resumes, searchTerm, selectedFolder, selectedTags, sortBy, sortOrder])

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) return

    const resumeId = Number.parseInt(active.id as string)
    const targetFolderId = over.id === "all-resumes" ? undefined : Number.parseInt(over.id as string)

    await moveResumeToFolder(resumeId, targetFolderId)
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag))
    } else {
      setSelectedTags([...selectedTags, tag])
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-20 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters and Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filter & Search</span>
          </CardTitle>
          <CardDescription>Find and organize your resumes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search resumes by title, description, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-4">
            <Select
              value={selectedFolder?.toString() || "all"}
              onValueChange={(value) => setSelectedFolder(value === "all" ? null : Number.parseInt(value))}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Folders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Folders</SelectItem>
                {folders.map((folder) => (
                  <SelectItem key={folder.id} value={folder.id!.toString()}>
                    {folder.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [newSortBy, newSortOrder] = value.split("-") as [typeof sortBy, typeof sortOrder]
                setSortBy(newSortBy)
                setSortOrder(newSortOrder)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
                <SelectItem value="updatedAt-asc">Oldest Updated</SelectItem>
                <SelectItem value="createdAt-desc">Recently Created</SelectItem>
                <SelectItem value="createdAt-asc">Oldest Created</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Tag Filter */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by tags:</label>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Active Filters */}
          {(searchTerm || selectedFolder !== null || selectedTags.length > 0) && (
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Active filters:</span>
              {searchTerm && (
                <Badge variant="secondary">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-red-600">
                    ×
                  </button>
                </Badge>
              )}
              {selectedFolder !== null && (
                <Badge variant="secondary">
                  Folder: {folders.find((f) => f.id === selectedFolder)?.name}
                  <button onClick={() => setSelectedFolder(null)} className="ml-1 hover:text-red-600">
                    ×
                  </button>
                </Badge>
              )}
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                  <button onClick={() => toggleTag(tag)} className="ml-1 hover:text-red-600">
                    ×
                  </button>
                </Badge>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("")
                  setSelectedFolder(null)
                  setSelectedTags([])
                }}
              >
                Clear All
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filteredResumes.length} of {resumes.length} resumes
        </p>
      </div>

      {/* Resumes Grid/List */}
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filteredResumes.map((r) => r.id!.toString())} strategy={verticalListSortingStrategy}>
          {filteredResumes.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Upload className="h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No resumes found</h3>
                <p className="text-gray-600 mb-4 text-center">
                  {searchTerm || selectedTags.length > 0 || selectedFolder !== null
                    ? "Try adjusting your filters or search terms"
                    : "Upload your first resume to get started"}
                </p>
                <Button onClick={() => (window.location.href = "/dashboard/upload")}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Resume
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === "grid" ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3" : "space-y-4"}>
              {filteredResumes.map((resume) => (
                <ResumeViewer
                  key={resume.id}
                  resume={resume}
                  folders={folders}
                  onUpdate={updateResume}
                  onDelete={deleteResume}
                />
              ))}
            </div>
          )}
        </SortableContext>
      </DndContext>
    </div>
  )
}
