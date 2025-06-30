"use client"

import type React from "react"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { ToastProvider } from "./contexts/ToastContext"
import { AuthForm } from "./components/auth/AuthForm"
import { DashboardLayout } from "./components/dashboard/DashboardLayout"
import { DashboardOverview } from "./components/dashboard/DashboardOverview"
import { ResumesList } from "./components/dashboard/ResumesList"
import { UploadResume } from "./components/dashboard/UploadResume"
import { FoldersPage } from "./components/dashboard/FoldersPage"
import { TemplatesPage } from "./components/dashboard/TemplatesPage"
import { SettingsPage } from "./components/dashboard/SettingsPage"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { ErrorBoundary } from "./components/ui/error-boundary"
import { KeyboardShortcuts } from "./components/ui/keyboard-shortcuts"

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/auth"
        element={
          <PublicRoute>
            <AuthForm />
          </PublicRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="resumes" element={<ResumesList />} />
        <Route path="upload" element={<UploadResume />} />
        <Route path="folders" element={<FoldersPage />} />
        <Route path="templates" element={<TemplatesPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ToastProvider>
          <AuthProvider>
            <KeyboardShortcuts />
            <AppRoutes />
          </AuthProvider>
        </ToastProvider>
      </Router>
    </ErrorBoundary>
  )
}

export default App
