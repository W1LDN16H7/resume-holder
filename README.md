# 🔐 Resume Wallet

A secure, client-side resume management application with military-grade encryption and modern UI/UX.

![Resume Wallet](https://img.shields.io/badge/Resume-Wallet-blue?style=for-the-badge)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

## ✨ Features

### 🔒 **Security & Privacy**
- **AES-256 Encryption** - Military-grade encryption for all resume content
- **Client-side Only** - No servers, no tracking, complete privacy
- **Password Hashing** - PBKDF2 with 100,000 iterations
- **Local Storage** - All data stays on your device

### 📄 **Resume Management**
- **PDF Upload** - Drag & drop or browse to upload
- **PDF Viewer** - Built-in viewer with zoom, rotation, and navigation
- **Smart Organization** - Folders, tags, and advanced search
- **Bulk Operations** - Manage multiple resumes at once
- **Lock/Unlock** - Individual resume password protection

### 🎨 **Modern UI/UX**
- **Beautiful Dashboard** - Inspired by modern design systems
- **Responsive Design** - Works perfectly on all devices
- **Dark Mode Ready** - Elegant light and dark themes
- **Smooth Animations** - Powered by Framer Motion
- **Keyboard Shortcuts** - Power user friendly

### 📊 **Analytics & Insights**
- **Usage Statistics** - Track your resume collection
- **Storage Monitoring** - Monitor local storage usage
- **Export Data** - Download your metadata anytime
- **Template Library** - Professional resume templates

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/resume-wallet.git
   cd resume-wallet
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Start development server**
   \`\`\`bash
   npm run dev
   \`\`\`

4. **Open in browser**
   \`\`\`
   http://localhost:3000
   \`\`\`

### Build for Production

\`\`\`bash
npm run build
npm run preview
\`\`\`

## 🎯 Usage

### Getting Started
1. **Create Account** - Sign up with email and secure password
2. **Upload Resume** - Drag & drop your PDF resume
3. **Add Metadata** - Title, description, tags for organization
4. **Encrypt & Store** - Your resume is encrypted and stored locally

### Managing Resumes
- **View** - Click any resume to view in built-in PDF viewer
- **Edit** - Update title, description, and tags
- **Download** - Download decrypted PDF files
- **Share** - Generate secure sharing links
- **Lock** - Add extra password protection

### Organization
- **Folders** - Create folders to organize resumes
- **Tags** - Add tags for easy filtering and search
- **Search** - Powerful search across titles, descriptions, and tags
- **Filter** - Filter by folder, tags, or creation date

### Templates
- **Professional** - Business-focused resume templates
- **Tech** - Developer and technical role templates  
- **Creative** - Design and creative industry templates
- **Custom** - Create your own templates

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `⌘/Ctrl + K` | Focus search |
| `⌘/Ctrl + U` | Upload resume |
| `⌘/Ctrl + D` | Go to dashboard |
| `⌘/Ctrl + R` | Go to resumes |
| `⌘/Ctrl + F` | Go to folders |
| `⌘/Ctrl + T` | Go to templates |
| `?` | Show help |

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations

### UI Components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icons
- **Sonner** - Toast notifications
- **React PDF** - PDF viewing capabilities

### Data & Storage
- **Dexie** - IndexedDB wrapper for local storage
- **Web Crypto API** - Browser-native encryption
- **React Router** - Client-side routing

### Development
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🔐 Security Architecture

### Encryption
- **Algorithm**: AES-256-GCM
- **Key Derivation**: PBKDF2 with 100,000 iterations
- **Salt**: Cryptographically secure random salt per user
- **IV**: Unique initialization vector per file

### Data Flow
1. User uploads PDF file
2. File converted to base64
3. Encrypted with user's password
4. Stored in IndexedDB with metadata
5. Original file data never persists unencrypted

### Privacy
- **No Servers** - Everything runs in your browser
- **No Tracking** - Zero analytics or data collection
- **No Cloud** - Data never leaves your device
- **Open Source** - Fully auditable code

## 📱 Browser Support

- **Chrome** 90+
- **Firefox** 88+
- **Safari** 14+
- **Edge** 90+

*Requires modern browser with Web Crypto API support*

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Radix UI** - For accessible component primitives
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon set
- **Vercel** - For the amazing deployment platform

## 📞 Support

- **Documentation**: [docs.resumewallet.com](https://docs.resumewallet.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/resume-wallet/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/resume-wallet/discussions)

---

**Made with ❤️ for privacy-conscious professionals**

*Your resumes, your device, your control.*
\`\`\`

Finally, let's add a proper package.json with all the correct dependencies:

```typescriptreact file="package.json"
[v0-no-op-code-block-prefix]{
  "name": "resume-wallet",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "description": "Secure, client-side resume management with encryption",
  "keywords": ["resume", "portfolio", "encryption", "privacy", "pdf", "react"],
  "author": "Resume Wallet Team",
  "license": "MIT",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "preview": "vite preview",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "react-pdf": "^7.6.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "dexie": "^4.0.1",
    "jspdf": "^2.5.1",
    "lucide-react": "^0.294.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "framer-motion": "^10.16.5",
    "sonner": "^1.2.4",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.3.6",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
