export const APP_CONFIG = {
  name: "Resume Wallet",
  description: "Secure, client-side resume management with encryption",
  version: "1.0.0",
  maxFileSize: 5 * 1024 * 1024, // 5MB
  maxResumes: 100,
  maxFolders: 20,
  maxTags: 5,
  supportedFileTypes: ["application/pdf"],
  encryptionAlgorithm: "AES-GCM",
  keyDerivationIterations: 100000,
} as const

export const ROUTES = {
  AUTH: "/auth",
  DASHBOARD: "/dashboard",
  RESUMES: "/dashboard/resumes",
  UPLOAD: "/dashboard/upload",
  FOLDERS: "/dashboard/folders",
  TEMPLATES: "/dashboard/templates",
  SETTINGS: "/dashboard/settings",
} as const

export const STORAGE_KEYS = {
  USER_ID: "resume_wallet_user_id",
  TEMPLATES: "resume_wallet_templates",
  PREFERENCES: "resume_wallet_preferences",
} as const

export const ERROR_MESSAGES = {
  INVALID_FILE_TYPE: "Please select a PDF file",
  FILE_TOO_LARGE: "File size must be less than 5MB",
  INVALID_PASSWORD: "Password must be at least 6 characters",
  PASSWORDS_DONT_MATCH: "Passwords do not match",
  TITLE_REQUIRED: "Title is required",
  EMAIL_INVALID: "Please enter a valid email address",
  USER_EXISTS: "User already exists",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  ENCRYPTION_FAILED: "Failed to encrypt data",
  DECRYPTION_FAILED: "Failed to decrypt data - invalid password",
} as const

export const SUCCESS_MESSAGES = {
  RESUME_UPLOADED: "Resume uploaded successfully!",
  RESUME_UPDATED: "Resume updated successfully!",
  RESUME_DELETED: "Resume deleted successfully!",
  FOLDER_CREATED: "Folder created successfully!",
  FOLDER_DELETED: "Folder deleted successfully!",
  TEMPLATE_CREATED: "Template created successfully!",
  TEMPLATE_UPDATED: "Template updated successfully!",
  TEMPLATE_DELETED: "Template deleted successfully!",
  DATA_EXPORTED: "Data exported successfully!",
  PASSWORD_CHANGED: "Password changed successfully!",
  ACCOUNT_CREATED: "Account created successfully!",
  SIGNED_IN: "Signed in successfully!",
  SIGNED_OUT: "Signed out successfully!",
} as const
