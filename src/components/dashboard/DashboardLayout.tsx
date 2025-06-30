"use client"

import { useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import {
  FileText,
  FolderOpen,
  Upload,
  Settings,
  Search,
  Menu,
  LogOut,
  User,
  BarChart3,
  LayoutTemplateIcon as Template,
  Download,
  Shield,
  Bell,
  HelpCircle,
} from "lucide-react"
import { useAuth } from "../../contexts/AuthContext"
import { cn } from "../../lib/utils"

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    name: "My Resumes",
    href: "/dashboard/resumes",
    icon: FileText,
  },
  {
    name: "Upload Resume",
    href: "/dashboard/upload",
    icon: Upload,
  },
  {
    name: "Folders",
    href: "/dashboard/folders",
    icon: FolderOpen,
  },
  {
    name: "Templates",
    href: "/dashboard/templates",
    icon: Template,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, signOut } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const currentPage = navigation.find((item) => item.href === location.pathname)

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="flex h-full flex-col">
            <div className="flex h-16 items-center border-b px-6">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                  <FileText className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-semibold">Resume Wallet</span>
              </div>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Button
                    key={item.name}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-secondary text-secondary-foreground font-medium",
                    )}
                    onClick={() => {
                      navigate(item.href)
                      setSidebarOpen(false)
                    }}
                  >
                    <item.icon className="mr-3 h-4 w-4" />
                    {item.name}
                  </Button>
                )
              })}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <FileText className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold">Resume Wallet</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    return (
                      <li key={item.name}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start",
                            isActive && "bg-secondary text-secondary-foreground font-medium",
                          )}
                          onClick={() => navigate(item.href)}
                        >
                          <item.icon className="mr-3 h-4 w-4" />
                          {item.name}
                        </Button>
                      </li>
                    )
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-green-600" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-900">Secure & Private</p>
                      <p className="text-gray-600">All data encrypted locally</p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>

          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400 pl-3" />
              <Input
                placeholder="Search resumes..."
                className="block h-full w-full border-0 py-0 pl-10 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm bg-transparent"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>

              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user?.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user?.email}</p>
                      <p className="text-xs leading-none text-muted-foreground">Manage your account</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="mr-2 h-4 w-4" />
                    <span>Export Data</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help & Support</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="px-4 sm:px-6 lg:px-8">
            {currentPage && (
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">{currentPage.name}</h1>
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
