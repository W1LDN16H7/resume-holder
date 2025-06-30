"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Shield, Zap, Users, Eye, EyeOff } from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { toast } from "sonner"
import { validateEmail, validatePassword } from "../../lib/utils"
import { Icons } from "@/components/ui/icons"

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Sign In Form
  const [signInEmail, setSignInEmail] = useState("")
  const [signInPassword, setSignInPassword] = useState("")

  // Sign Up Form
  const [signUpEmail, setSignUpEmail] = useState("")
  const [signUpPassword, setSignUpPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const { signIn, signUp } = useAuth()


  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(signInEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (!signInPassword) {
      toast.error("Password is required")
      return
    }

    setIsLoading(true)

    const result = await signIn(signInEmail, signInPassword)

    if (!result.success) {
      toast.error(result.error || "Sign in failed")
    }

    setIsLoading(false)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateEmail(signUpEmail)) {
      toast.error("Please enter a valid email address")
      return
    }

    const passwordValidation = validatePassword(signUpPassword)
    if (!passwordValidation.isValid) {
      toast.error(passwordValidation.errors[0])
      return
    }

    if (signUpPassword !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsLoading(true)

    const result = await signUp(signUpEmail, signUpPassword)

    if (!result.success) {
      toast.error(result.error || "Sign up failed")
    }

    setIsLoading(false)
  }

  const features = [
    {
      icon: Shield,
      title: "Bank-Level Security",
      description: "AES-256 encryption with client-side password hashing",
    },
    {
      icon: FileText,
      title: "Smart Organization",
      description: "Folders, tags, and powerful search capabilities",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "No servers, no delays - everything runs locally",
    },
    {
      icon: Users,
      title: "Template Library",
      description: "Professional templates for every industry",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Left Side - Features */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center p-12 bg-gradient-to-br from-blue-600 to-purple-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Resume Wallet</h1>
                <p className="text-blue-100">Secure. Private. Professional.</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Your Professional Documents,
              <br />
              <span className="text-blue-200">Secured & Organized</span>
            </h2>

            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Store, organize, and manage your resumes with military-grade encryption. No servers, no tracking, just
              pure privacy.
            </p>

            <div className="space-y-6">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="flex items-start space-x-4"
                >
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{feature.title}</h3>
                    <p className="text-blue-100">{feature.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-300/20 rounded-full blur-xl" />
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-900">Welcome</CardTitle>
              <CardDescription className="text-gray-600">Sign in to your account or create a new one</CardDescription>
            </CardHeader>

            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signInEmail}
                        onChange={(e) => setSignInEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signin-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={signInPassword}
                          onChange={(e) => setSignInPassword(e.target.value)}
                          required
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      Sign In
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={handleSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        required
                        className="h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a password"
                          value={signUpPassword}
                          onChange={(e) => setSignUpPassword(e.target.value)}
                          required
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <div className="relative">
                        <Input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="h-11 pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>

                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                      Password must contain at least 6 characters with uppercase, lowercase, and numbers.
                    </div>

                    <Button type="submit" className="w-full h-11" disabled={isLoading}>
                      {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                      Create Account
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                  <br />
                  All data is encrypted and stored locally on your device.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
