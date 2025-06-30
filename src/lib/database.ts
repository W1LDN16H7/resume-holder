import Dexie, { type Table } from "dexie"

export interface User {
  id?: number
  email: string
  passwordHash: string
  salt: string
  createdAt: Date
}

export interface Resume {
  id?: number
  userId: number
  title: string
  description: string
  tags: string[]
  encryptedContent: string
  iv: string
  folderId?: number
  isLocked: boolean
  encryptedPassword?: string
  passwordIv?: string
  createdAt: Date
  updatedAt: Date
}

export interface Folder {
  id?: number
  userId: number
  name: string
  isLocked: boolean
  encryptedPassword?: string
  passwordIv?: string
  createdAt: Date
}

export interface Template {
  id?: number
  name: string
  content: string
  type: "professional" | "tech" | "creative" | "custom"
  isDefault: boolean
  createdAt: Date
}

export class ResumeDatabase extends Dexie {
  users!: Table<User>
  resumes!: Table<Resume>
  folders!: Table<Folder>
  templates!: Table<Template>

  constructor() {
    super("ResumeWalletDB")
    this.version(1).stores({
      users: "++id, email",
      resumes: "++id, userId, folderId, title, createdAt, updatedAt",
      folders: "++id, userId, name, createdAt",
      templates: "++id, name, type, isDefault",
    })
  }
}

export const db = new ResumeDatabase()
