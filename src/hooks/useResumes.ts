"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { db, type Resume, type Folder } from "../lib/database"
import { CryptoService } from "../lib/crypto"

export function useResumes(userId: number | undefined) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const loadData = useCallback(async () => {
    if (!userId) return

    setIsLoading(true)
    try {
      const [resumeData, folderData] = await Promise.all([
        db.resumes.where("userId").equals(userId).toArray(),
        db.folders.where("userId").equals(userId).toArray(),
      ])

      setResumes(resumeData)
      setFolders(folderData)
    } catch (error) {
      console.error("Failed to load data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadData()
  }, [loadData])

  const addResume = useCallback(
    async (
      title: string,
      description: string,
      tags: string[],
      pdfContent: string,
      password: string,
      folderId?: number,
    ): Promise<{ success: boolean; error?: string }> => {
      if (!userId) return { success: false, error: "User not authenticated" }

      try {
        const { encrypted, iv } = await CryptoService.encrypt(pdfContent, password)

        const resumeId = await db.resumes.add({
          userId,
          title,
          description,
          tags,
          encryptedContent: encrypted,
          iv,
          folderId,
          isLocked: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })

        await loadData()
        return { success: true }
      } catch (error) {
        return { success: false, error: "Failed to add resume" }
      }
    },
    [userId, loadData],
  )

  const updateResume = useCallback(
    async (id: number, updates: Partial<Resume>): Promise<{ success: boolean; error?: string }> => {
      try {
        await db.resumes.update(id, { ...updates, updatedAt: new Date() })
        await loadData()
        return { success: true }
      } catch (error) {
        return { success: false, error: "Failed to update resume" }
      }
    },
    [loadData],
  )

  const deleteResume = useCallback(
    async (id: number): Promise<{ success: boolean; error?: string }> => {
      try {
        await db.resumes.delete(id)
        await loadData()
        return { success: true }
      } catch (error) {
        return { success: false, error: "Failed to delete resume" }
      }
    },
    [loadData],
  )

  const addFolder = useCallback(
    async (name: string, password?: string): Promise<{ success: boolean; error?: string }> => {
      if (!userId) return { success: false, error: "User not authenticated" }

      try {
        const folderData: Omit<Folder, "id"> = {
          userId,
          name,
          isLocked: !!password,
          createdAt: new Date(),
        }

        if (password) {
          const { encrypted, iv } = await CryptoService.encrypt(password, password)
          folderData.encryptedPassword = encrypted
          folderData.passwordIv = iv
        }

        await db.folders.add(folderData)
        await loadData()
        return { success: true }
      } catch (error) {
        return { success: false, error: "Failed to create folder" }
      }
    },
    [userId, loadData],
  )

  const deleteFolder = useCallback(
    async (id: number): Promise<{ success: boolean; error?: string }> => {
      try {
        // Move resumes out of folder first
        await db.resumes.where("folderId").equals(id).modify({ folderId: undefined })
        await db.folders.delete(id)
        await loadData()
        return { success: true }
      } catch (error) {
        return { success: false, error: "Failed to delete folder" }
      }
    },
    [loadData],
  )

  const moveResumeToFolder = useCallback(
    async (resumeId: number, folderId: number | undefined): Promise<{ success: boolean; error?: string }> => {
      try {
        await db.resumes.update(resumeId, { folderId, updatedAt: new Date() })
        await loadData()
        return { success: true }
      } catch (error) {
        return { success: false, error: "Failed to move resume" }
      }
    },
    [loadData],
  )

  const filteredResumes = useMemo(() => {
    return resumes.filter((resume) => {
      const matchesSearch =
        !searchTerm ||
        resume.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resume.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesFolder = selectedFolder === null || resume.folderId === selectedFolder

      const matchesTags = selectedTags.length === 0 || selectedTags.every((tag) => resume.tags.includes(tag))

      return matchesSearch && matchesFolder && matchesTags
    })
  }, [resumes, searchTerm, selectedFolder, selectedTags])

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    resumes.forEach((resume) => {
      resume.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }, [resumes])

  return {
    resumes: filteredResumes,
    folders,
    allTags,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedFolder,
    setSelectedFolder,
    selectedTags,
    setSelectedTags,
    addResume,
    updateResume,
    deleteResume,
    addFolder,
    deleteFolder,
    moveResumeToFolder,
    loadData,
  }
}
