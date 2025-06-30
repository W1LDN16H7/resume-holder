"use client"

import { useState, useEffect, useCallback } from "react"
import { db, type User } from "../lib/database"
import { CryptoService } from "../lib/crypto"

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  })

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = useCallback(async () => {
    try {
      const storedUserId = localStorage.getItem("resume_wallet_user_id")
      if (storedUserId) {
        const user = await db.users.get(Number.parseInt(storedUserId))
        if (user) {
          setAuthState({
            user,
            isLoading: false,
            isAuthenticated: true,
          })
          return
        }
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    }

    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
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

      const user = await db.users.get(userId)
      if (user) {
        localStorage.setItem("resume_wallet_user_id", userId.toString())
        setAuthState({
          user,
          isLoading: false,
          isAuthenticated: true,
        })
        return { success: true }
      }

      return { success: false, error: "Failed to create user" }
    } catch (error) {
      return { success: false, error: "Sign up failed" }
    }
  }, [])

  const signIn = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
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
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
      })

      return { success: true }
    } catch (error) {
      return { success: false, error: "Sign in failed" }
    }
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem("resume_wallet_user_id")
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    })
  }, [])

  return {
    ...authState,
    signUp,
    signIn,
    signOut,
  }
}
