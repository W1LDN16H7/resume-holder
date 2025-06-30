"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

export function KeyboardShortcuts() {
  const navigate = useNavigate()


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return
      }

      // Cmd/Ctrl + K for search
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault()
        // Focus search input if available
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Cmd/Ctrl + U for upload
      if ((event.metaKey || event.ctrlKey) && event.key === "u") {
        event.preventDefault()
        navigate("/dashboard/upload")
      }

      // Cmd/Ctrl + D for dashboard
      if ((event.metaKey || event.ctrlKey) && event.key === "d") {
        event.preventDefault()
        navigate("/dashboard")
      }

      // Cmd/Ctrl + R for resumes
      if ((event.metaKey || event.ctrlKey) && event.key === "r") {
        event.preventDefault()
        navigate("/dashboard/resumes")
      }

      // Cmd/Ctrl + F for folders
      if ((event.metaKey || event.ctrlKey) && event.key === "f") {
        event.preventDefault()
        navigate("/dashboard/folders")
      }

      // Cmd/Ctrl + T for templates
      if ((event.metaKey || event.ctrlKey) && event.key === "t") {
        event.preventDefault()
        navigate("/dashboard/templates")
      }

      // ? for help
      if (event.key === "?" && !event.shiftKey) {
        event.preventDefault()
        toast.success(
          "Keyboard shortcuts: ⌘K (Search), ⌘U (Upload), ⌘D (Dashboard), ⌘R (Resumes), ⌘F (Folders), ⌘T (Templates)",
        )
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [navigate, toast])

  return null
}
