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


## 🤗 How to Contribute

We love your ideas and improvements! To contribute:

- **Open Issues**: Found a bug or have a feature request? [Open an issue](https://github.com/W1LDN16H7/resume-holder/issues).
- **Pull Requests**: Fork, branch, and submit a PR. Please follow our [Contributing Guide](CONTRIBUTING.md).
- **Discussions**: Join the conversation in [GitHub Discussions](https://github.com/W1LDN16H7/resume-holder/discussions).

All contributions—code, docs, design, or feedback—are welcome!



**Made with ❤️ for privacy-conscious professionals**

*Your resumes, your device, your control.*
