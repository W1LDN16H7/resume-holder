"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { db, type User } from "../lib/database"
import { CryptoService } from "../lib/crypto"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
 

  const isAuthenticated = !!user

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const storedUserId = localStorage.getItem("resume_wallet_user_id")
      if (storedUserId) {
        const user = await db.users.get(Number.parseInt(storedUserId))
        if (user) {
          setUser(user)
        } else {
          // Clean up invalid stored user ID
          localStorage.removeItem("resume_wallet_user_id")
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      localStorage.removeItem("resume_wallet_user_id")
    } finally {
      setIsLoading(false)
    }
  }

  const signUp = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)

      // Check if user already exists
      const existingUser = await db.users.where("email").equals(email).first()
      if (existingUser) {
        return { success: false, error: "User already exists" }
      }

      // Create new user
      const salt = await CryptoService.generateSalt()
      const passwordHash = await CryptoService.hashPassword(password, salt)

      const userId = await db.users.add({
        email,
        passwordHash,
        salt: Array.from(salt)
          .map((b) => b.toString(16).padStart(2, "0"))
          .join(""),
        createdAt: new Date(),
      })

      const newUser = await db.users.get(userId)
      if (newUser) {
        localStorage.setItem("resume_wallet_user_id", userId.toString())
        setUser(newUser)
        toast("Your account has been created successfully.")
        return { success: true }
      }

      return { success: false, error: "Failed to create user" }
    } catch (error) {
      console.error("Sign up error:", error)
      return { success: false, error: "Sign up failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true)

      const user = await db.users.where("email").equals(email).first()
      if (!user) {
        return { success: false, error: "User not found" }
      }

      const salt = new Uint8Array(user.salt.match(/.{1,2}/g)!.map((byte) => Number.parseInt(byte, 16)))
      const passwordHash = await CryptoService.hashPassword(password, salt)

      if (passwordHash !== user.passwordHash) {
        return { success: false, error: "Invalid password" }
      }

      localStorage.setItem("resume_wallet_user_id", user.id!.toString())
      setUser(user)
      toast("You have been signed in successfully.")
      return { success: true }
    } catch (error) {
      console.error("Sign in error:", error)
      return { success: false, error: "Sign in failed" }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = () => {
    localStorage.removeItem("resume_wallet_user_id")
    setUser(null)
    toast("You have been signed out successfully.")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
