"use client"
import { Button } from "@/components/ui/button"
import { LogOut, FileText } from "lucide-react"
import { useAuth } from "../hooks/useAuth"

export function Header() {
  const { user, signOut } = useAuth()

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Resume Wallet</h1>
            <p className="text-sm text-gray-600">Organize your professional documents</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500">Signed in</p>
          </div>
          <Button variant="outline" size="sm" onClick={signOut} className="flex items-center space-x-2 bg-transparent">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
