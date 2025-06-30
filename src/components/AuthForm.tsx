"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useAuth } from "../hooks/useAuth"

import { toast } from "sonner"

export function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const { signIn, signUp } = useAuth()
 

  const validateForm = () => {
    if (!email || !password) {
      toast("Email and password are required")
      return false
    }

    if (password.length < 6) {
      toast("Password must be at least 6 characters")
      return false
    }

    if (isSignUp && password !== confirmPassword) {
      toast("Passwords do not match")
       
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const result = isSignUp ? await signUp(email, password) : await signIn(email, password)

      if (!result.success) {
        toast(result.error || "Authentication failed")
      } else {
        toast(isSignUp ? "Account created successfully!" : "Signed in successfully!")
      }
    } catch (error) {
      toast("An unexpected error occurred")
       
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </CardTitle>
          <CardDescription className="text-center">
            {isSignUp ? "Create your Resume Wallet account" : "Sign in to your Resume Wallet"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
