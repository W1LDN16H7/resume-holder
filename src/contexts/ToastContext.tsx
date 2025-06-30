"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { Toaster } from "sonner"
import { toast as sonnerToast } from "sonner"

interface ToastContextType {
  toast: typeof sonnerToast
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  return (
    <ToastContext.Provider value={{ toast: sonnerToast }}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "white",
            border: "1px solid #e2e8f0",
            color: "#0f172a",
          },
        }}
      />
    </ToastContext.Provider>
  )
}

// useToast hook moved to ToastHooks.ts
