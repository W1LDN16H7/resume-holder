"use client"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, X, Filter } from "lucide-react"

interface FilterControlsProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  selectedTags: string[]
  onTagsChange: (tags: string[]) => void
  allTags: string[]
  sortBy: "title" | "createdAt" | "updatedAt"
  onSortChange: (sort: "title" | "createdAt" | "updatedAt") => void
  sortOrder: "asc" | "desc"
  onSortOrderChange: (order: "asc" | "desc") => void
}

export function FilterControls({
  searchTerm,
  onSearchChange,
  selectedTags,
  onTagsChange,
  allTags,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
}: FilterControlsProps) {
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      onTagsChange([...selectedTags, tag])
    }
  }

  const removeTag = (tag: string) => {
    onTagsChange(selectedTags.filter((t) => t !== tag))
  }

  const clearAllFilters = () => {
    onSearchChange("")
    onTagsChange([])
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="w-5 h-5" />
              <span>Filter & Search</span>
            </CardTitle>
            <CardDescription>Find and organize your resumes</CardDescription>
          </div>
          {(searchTerm || selectedTags.length > 0) && (
            <Button variant="outline" size="sm" onClick={clearAllFilters}>
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search resumes by title, description, or tags..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort Controls */}
        <div className="flex gap-2">
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="createdAt">Created Date</SelectItem>
              <SelectItem value="updatedAt">Updated Date</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={onSortOrderChange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tag Filter */}
        {allTags.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Filter by tags:</label>
            <div className="flex flex-wrap gap-1">
              {allTags.map((tag) => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer hover:bg-blue-100"
                  onClick={() => (selectedTags.includes(tag) ? removeTag(tag) : addTag(tag))}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Active filters:</label>
            <div className="flex flex-wrap gap-1">
              {selectedTags.map((tag) => (
                <Badge key={tag} className="flex items-center gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
