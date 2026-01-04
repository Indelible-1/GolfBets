🏗️ SUPER PROMPT: Manager Engineer
Role: Manager Engineer (Role #1) Project: GolfSettled MVP — Golf Side-Bet Tracker PWA Duration: Day 1 Dependencies: None (you are first)

🎯 YOUR MISSION
You are the Manager Engineer responsible for establishing the foundational repository structure, development tooling, documentation, and project scaffolding for the GolfSettled MVP. Every other engineer will build upon your work.

Your work is complete when: Another engineer can clone the repo, run npm install && npm run dev, and immediately start building features in a consistent environment with all documentation in place.

📋 PREREQUISITES
Before starting, ensure you have these installed:

bash
# Check Node.js (need 20+)
node --version  # Should be v20.x.x or higher

# Check npm (need 10+)
npm --version   # Should be 10.x.x or higher

# Install Firebase CLI globally
npm install -g firebase-tools

# Verify Firebase CLI
firebase --version  # Should be 13.x.x or higher

# Login to Firebase
firebase login

# Install Vercel CLI (optional, for manual deploys)
npm install -g vercel
If Prerequisites Are Missing
bash
# Install Node.js 20 via nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
nvm use 20

# Or via Homebrew (macOS)
brew install node@20
📋 TASK CHECKLIST
Complete these tasks in order. Check each box as you finish:

Phase 1: Project Initialization
 Create new Next.js 14 project with App Router
bash
  npx create-next-app@latest golfsettled-mvp --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
  cd golfsettled-mvp
 Verify TypeScript strict mode in tsconfig.json:
json
  {
    "compilerOptions": {
      "strict": true
    }
  }
 Install core dependencies:
bash
  # Utilities
  npm install clsx tailwind-merge zod date-fns
  
  # Firebase
  npm install firebase
  
  # Dev dependencies
  npm install -D husky @types/node jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom
 Initialize Husky for pre-commit hooks:
bash
  npx husky install
  npx husky add .husky/pre-commit "npm run lint && npm run typecheck"
  chmod +x .husky/pre-commit
 Initialize Firebase in project:
bash
  firebase init
  # Select: Firestore, Functions, Emulators
  # Use existing project or create new
  # Accept defaults for rules files
  # Select Node.js 20 for functions
  # Enable Auth, Firestore, Functions emulators
```

---

### Phase 2: Complete Folder Structure

Create this exact structure:
```
golfsettled-mvp/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .claude/
│   └── settings.json
├── .husky/
│   └── pre-commit
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   └── callback/
│   │   │       └── page.tsx
│   │   ├── match/
│   │   │   ├── new/
│   │   │   │   └── page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       ├── scorecard/
│   │   │       │   └── page.tsx
│   │   │       └── results/
│   │   │           └── page.tsx
│   │   ├── ledger/
│   │   │   └── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/
│   │   │   └── .gitkeep
│   │   ├── layout/
│   │   │   └── .gitkeep
│   │   ├── match/
│   │   │   └── .gitkeep
│   │   ├── scorecard/
│   │   │   └── .gitkeep
│   │   ├── results/
│   │   │   └── .gitkeep
│   │   ├── ledger/
│   │   │   └── .gitkeep
│   │   └── offline/
│   │       └── .gitkeep
│   ├── lib/
│   │   ├── firebase.ts
│   │   ├── utils/
│   │   │   └── index.ts
│   │   ├── auth/
│   │   │   └── .gitkeep
│   │   ├── firestore/
│   │   │   └── .gitkeep
│   │   ├── bets/
│   │   │   └── .gitkeep
│   │   ├── offline/
│   │   │   └── .gitkeep
│   │   └── validators/
│   │       └── .gitkeep
│   ├── hooks/
│   │   └── .gitkeep
│   └── types/
│       └── index.ts
├── functions/
│   ├── src/
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── public/
│   ├── manifest.json
│   └── icons/
│       └── .gitkeep
├── docs/                            # 📚 DOCUMENTATION
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── BETTING_RULES.md
│   ├── SECURITY.md
│   ├── LEGAL.md
│   ├── TESTING.md
│   ├── ONBOARDING.md
│   ├── ROADMAP.md
│   └── CHANGELOG.md
├── prompts/                         # 🤖 ENGINEER PROMPTS
│   ├── MANAGER_ENGINEER_PROMPT.md
│   ├── SECURITY_ENGINEER_PROMPT.md
│   ├── BACKEND_ENGINEER_PROMPT.md
│   ├── FRONTEND_ENGINEER_PROMPT.md
│   ├── PWA_ENGINEER_PROMPT.md
│   └── BETTING_ENGINEER_PROMPT.md
├── scripts/
│   └── .gitkeep
├── __tests__/
│   ├── lib/
│   │   ├── bets/
│   │   │   └── .gitkeep
│   │   └── utils/
│   │       └── .gitkeep
│   └── components/
│       └── .gitkeep
├── .env.example
├── .gitignore
├── CLAUDE.md                        # 🤖 AI ASSISTANT CONFIG
├── SKILLS.md                        # 🤖 AI PERMISSIONS
├── ENGINEERING_ROLES.md             # 👥 ROLE DEFINITIONS
├── firebase.json
├── firestore.rules
├── firestore.indexes.json
├── jest.config.js
├── jest.setup.js
├── tailwind.config.ts
├── next.config.js
└── package.json
Create directories with:

bash
# Create all directories
mkdir -p .github/workflows .claude src/app/\(auth\)/login src/app/\(auth\)/callback
mkdir -p src/app/match/new src/app/match/\[id\]/scorecard src/app/match/\[id\]/results
mkdir -p src/app/ledger src/app/settings
mkdir -p src/components/{ui,layout,match,scorecard,results,ledger,offline}
mkdir -p src/lib/{utils,auth,firestore,bets,offline,validators}
mkdir -p src/hooks src/types
mkdir -p functions/src
mkdir -p public/icons
mkdir -p docs prompts scripts
mkdir -p __tests__/lib/{bets,utils} __tests__/components

# Create .gitkeep files for empty directories
find . -type d -empty -not -path './.git/*' -exec touch {}/.gitkeep \;
Phase 3: Root Configuration Files
3.1 — .env.example
env
# ============================================
# Firebase Configuration (Client-side)
# Prefix with NEXT_PUBLIC_ to expose to browser
# ============================================
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ============================================
# Firebase Configuration (Server-side only)
# For Cloud Functions - never prefix with NEXT_PUBLIC_
# ============================================
FIREBASE_ADMIN_PROJECT_ID=your_project_id

# ============================================
# App Configuration
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=GolfSettled
3.2 — .gitignore
gitignore
# ============================================
# Dependencies
# ============================================
node_modules/
.pnp
.pnp.js

# ============================================
# Build outputs
# ============================================
.next/
out/
build/
dist/

# ============================================
# Environment files (CRITICAL - never commit)
# ============================================
.env
.env.*
.env.local
.env.development
.env.production
.env.development.local
.env.test.local
.env.production.local
!.env.example

# ============================================
# Firebase credentials (CRITICAL)
# ============================================
firebase-debug.log
firebase-debug.*.log
.firebase/
firebase-admin-key.json
serviceAccountKey.json
*-firebase-adminsdk-*.json
*serviceAccount*.json

# ============================================
# Keys and certificates (CRITICAL)
# ============================================
*.pem
*.key
*.p12
*.pfx
*.crt

# ============================================
# Secrets directories
# ============================================
secrets/
.secrets/
config/credentials.json
credentials/

# ============================================
# Claude Code local settings
# ============================================
.claude/settings.local.json

# ============================================
# IDE and editors
# ============================================
.idea/
.vscode/
*.swp
*.swo
*.sublime-workspace
*.sublime-project

# ============================================
# OS files
# ============================================
.DS_Store
.DS_Store?
._*
Thumbs.db
ehthumbs.db

# ============================================
# Logs
# ============================================
logs/
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# ============================================
# Testing
# ============================================
coverage/
.nyc_output/

# ============================================
# Misc
# ============================================
*.tsbuildinfo
.eslintcache
.vercel
.turbo
.netlify
.sentryclirc
3.3 — .claude/settings.json
json
{
  "permissions": {
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)",
      "Read(./**/firebase-admin*.json)",
      "Read(./**/*serviceAccount*.json)",
      "Read(./**/*.pem)",
      "Read(./**/*.key)",
      "Read(./credentials/**)"
    ]
  }
}
3.4 — tailwind.config.ts
typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Golf-inspired palette
        'fairway': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'bunker': {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
          400: '#a8a29e',
          500: '#78716c',
          600: '#57534e',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
      fontSize: {
        // Minimum 16px base for mobile readability
        'score': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'score-lg': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'score-xl': ['2rem', { lineHeight: '2.5rem', fontWeight: '700' }],
      },
      spacing: {
        // 48px minimum tap target (golf gloves make tapping harder)
        'tap': '3rem',
        'tap-lg': '3.5rem',
      },
      minHeight: {
        'tap': '3rem',
        'tap-lg': '3.5rem',
      },
      minWidth: {
        'tap': '3rem',
        'tap-lg': '3.5rem',
      },
      borderRadius: {
        'card': '0.75rem',
      },
      boxShadow: {
        'card': '0 2px 8px -2px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 12px -2px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
3.5 — next.config.js
javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Optimize images from Firebase Storage
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
3.6 — jest.config.js
javascript
const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverageFrom: [
    'src/lib/**/*.{ts,tsx}',
    'src/components/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    'src/lib/bets/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
}

module.exports = createJestConfig(customJestConfig)
3.7 — jest.setup.js
javascript
import '@testing-library/jest-dom'

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  app: {},
  auth: {},
  db: {},
}))
3.8 — firebase.json
json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"],
    "runtime": "nodejs20"
  },
  "emulators": {
    "auth": { "port": 9099 },
    "firestore": { "port": 8080 },
    "functions": { "port": 5001 },
    "ui": { "enabled": true, "port": 4000 },
    "singleProjectMode": true
  }
}
```

#### 3.9 — `firestore.rules`
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // ⚠️ PLACEHOLDER - Security Engineer will implement
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
3.10 — firestore.indexes.json
json
{
  "indexes": [
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "participantIds", "arrayConfig": "CONTAINS" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "teeTime", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
Phase 4: Source Files
4.1 — src/app/globals.css
css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-size: 16px;
    -webkit-tap-highlight-color: transparent;
    -webkit-text-size-adjust: 100%;
  }
  
  body {
    @apply bg-white text-gray-900 antialiased;
    overscroll-behavior-y: contain;
  }
  
  :root {
    --foreground: #111827;
    --background: #ffffff;
    --primary: #16a34a;
    --primary-foreground: #ffffff;
    --muted: #6b7280;
    --border: #e5e7eb;
    --error: #dc2626;
    --success: #16a34a;
  }
  
  *:focus-visible {
    @apply outline-none ring-2 ring-fairway-500 ring-offset-2;
  }
}

@layer components {
  .tap-target {
    @apply min-h-tap min-w-tap flex items-center justify-center;
  }
  
  .score-positive { @apply text-red-600 font-semibold; }
  .score-negative { @apply text-fairway-600 font-semibold; }
  .score-even { @apply text-gray-600 font-semibold; }
  
  .card { @apply bg-white rounded-card shadow-card p-4; }
  .card-interactive { @apply card hover:shadow-card-hover transition-shadow cursor-pointer; }
  
  .btn { @apply tap-target px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50; }
  .btn-primary { @apply btn bg-fairway-600 text-white hover:bg-fairway-700; }
  .btn-secondary { @apply btn bg-gray-100 text-gray-700 hover:bg-gray-200; }
}

@layer utilities {
  .safe-top { padding-top: env(safe-area-inset-top); }
  .safe-bottom { padding-bottom: env(safe-area-inset-bottom); }
}
4.2 — src/app/layout.tsx
tsx
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'GolfSettled', template: '%s | GolfSettled' },
  description: 'Track golf bets with friends. Offline-first, no money handled.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'GolfSettled' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#16a34a',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${inter.className} safe-top safe-bottom`}>
        <main className="min-h-screen pb-20">{children}</main>
      </body>
    </html>
  )
}
4.3 — src/app/page.tsx
tsx
export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-fairway-700 mb-2">⛳ GolfSettled</h1>
        <p className="text-gray-500 text-sm">Track bets, not payments</p>
      </div>
      
      <div className="w-full max-w-sm space-y-4">
        <button className="btn-primary w-full">Start a Match</button>
        <button className="btn-secondary w-full">Join a Match</button>
      </div>
      
      <div className="mt-12 grid grid-cols-3 gap-4 text-center">
        <div><div className="text-2xl mb-1">🏆</div><div className="text-xs text-gray-500">Nassau</div></div>
        <div><div className="text-2xl mb-1">💰</div><div className="text-xs text-gray-500">Skins</div></div>
        <div><div className="text-2xl mb-1">📊</div><div className="text-xs text-gray-500">Ledger</div></div>
      </div>
      
      <footer className="mt-auto pt-8 text-center">
        <p className="text-xs text-gray-400">v0.1.0 — MVP Setup</p>
        <p className="text-xs text-gray-400 mt-1">No real money handled</p>
      </footer>
    </div>
  )
}
4.4 — src/lib/firebase.ts
typescript
import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, Auth } from 'firebase/auth'
import { getFirestore, Firestore, enableIndexedDbPersistence } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let app: FirebaseApp
let auth: Auth
let db: Firestore

if (typeof window !== 'undefined') {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]
  auth = getAuth(app)
  db = getFirestore(app)
  
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Firestore persistence: Multiple tabs open')
    } else if (err.code === 'unimplemented') {
      console.warn('Firestore persistence not supported')
    }
  })
}

export { app, auth, db }
4.5 — src/lib/utils/index.ts
typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatScore(score: number): string {
  if (score === 0) return 'E'
  return score > 0 ? `+${score}` : `${score}`
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount)
}

export function generateInviteToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('')
}
4.6 — src/types/index.ts
typescript
export interface User {
  id: string
  displayName: string
  email: string
  handicapIndex: number | null
  avatarUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export type TeeBox = 'championship' | 'blue' | 'white' | 'red'
export type MatchStatus = 'pending' | 'active' | 'completed' | 'cancelled'
export type BetType = 'nassau' | 'skins' | 'match_play' | 'stroke_play'
export type ScoringMode = 'gross' | 'net'

export interface Match {
  id: string
  courseName: string
  teeTime: Date
  holes: 9 | 18
  status: MatchStatus
  createdBy: string
  participantIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface Score {
  id: string
  participantId: string
  holeNumber: number
  strokes: number
  putts: number | null
  createdAt: Date
  updatedAt: Date
  version: number
}
4.7 — public/manifest.json
json
{
  "name": "GolfSettled",
  "short_name": "GolfSettled",
  "description": "Track golf bets with friends. Offline-first.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#16a34a",
  "orientation": "portrait",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
  ],
  "shortcuts": [
    { "name": "New Match", "url": "/match/new" },
    { "name": "Ledger", "url": "/ledger" }
  ]
}
Phase 5: Cloud Functions Setup
5.1 — functions/package.json
json
{
  "name": "golfsettled-functions",
  "version": "0.1.0",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "deploy": "firebase deploy --only functions"
  },
  "engines": { "node": "20" },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^12.0.0",
    "firebase-functions": "^4.5.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  },
  "private": true
}
5.2 — functions/tsconfig.json
json
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2022"
  },
  "include": ["src"]
}
5.3 — functions/src/index.ts
typescript
import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

export const healthCheck = functions.https.onRequest((req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '0.1.0' })
})
Phase 6: Placeholder Pages
Create these placeholder pages for other engineers:

src/app/(auth)/login/page.tsx
tsx
export default function LoginPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      <p className="text-gray-500">Security Engineer will implement</p>
    </div>
  )
}
src/app/(auth)/callback/page.tsx
tsx
export default function AuthCallbackPage() {
  return <div className="flex items-center justify-center min-h-screen"><p>Processing...</p></div>
}
src/app/match/new/page.tsx
tsx
export default function NewMatchPage() {
  return <div className="p-4"><h1 className="text-xl font-bold">New Match</h1><p className="text-gray-500">Frontend Engineer will implement</p></div>
}
src/app/match/[id]/page.tsx
tsx
export default function MatchPage({ params }: { params: { id: string } }) {
  return <div className="p-4"><h1 className="text-xl font-bold">Match: {params.id}</h1></div>
}
src/app/match/[id]/scorecard/page.tsx
tsx
export default function ScorecardPage() {
  return <div className="p-4"><h1 className="text-xl font-bold">Scorecard</h1></div>
}
src/app/match/[id]/results/page.tsx
tsx
export default function ResultsPage() {
  return <div className="p-4"><h1 className="text-xl font-bold">Results</h1></div>
}
src/app/ledger/page.tsx
tsx
export default function LedgerPage() {
  return <div className="p-4"><h1 className="text-xl font-bold">Ledger</h1></div>
}
src/app/settings/page.tsx
tsx
export default function SettingsPage() {
  return <div className="p-4"><h1 className="text-xl font-bold">Settings</h1></div>
}
Phase 7: GitHub Actions
.github/workflows/deploy.yml
yaml
name: CI/CD
on:
  push:
    branches: [main, dev]
  pull_request:
    branches: [main, dev]

jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test -- --coverage --watchAll=false

  build:
    runs-on: ubuntu-latest
    needs: lint-and-test
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build

  deploy:
    runs-on: ubuntu-latest
    needs: build
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
Phase 8: Package.json Scripts
Update package.json:

json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "typecheck": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "emulators": "firebase emulators:start",
    "deploy:rules": "firebase deploy --only firestore:rules",
    "deploy:functions": "firebase deploy --only functions",
    "prepare": "husky install"
  }
}
Phase 9: Copy Documentation Files
CRITICAL: Copy all documentation files to the repo. These files are provided separately:

Source File	Destination	Purpose
ARCHITECTURE.md	docs/	System design
DATA_MODEL.md	docs/	Firestore schemas
BETTING_RULES.md	docs/	Nassau, Skins rules
SECURITY.md	docs/	Security practices
LEGAL.md	docs/	Compliance
TESTING.md	docs/	Test strategy
ONBOARDING.md	docs/	Engineer guide
ROADMAP.md	docs/	Progress tracking
CHANGELOG.md	docs/	Version history
CLAUDE.md	root	AI config
SKILLS.md	root	AI permissions
ENGINEERING_ROLES.md	root	Role definitions
MANAGER_ENGINEER_PROMPT.md	prompts/	This file
⚠️ RULES FOR THIS ROLE
DO NOT implement authentication — Security Engineer's job
DO NOT create UI components beyond placeholders — Frontend Engineer's job
DO NOT implement Cloud Functions logic — Backend Engineer's job
DO create ALL placeholder files for other engineers
DO copy ALL documentation files
DO verify everything builds successfully
📤 HANDOFF CHECKLIST
Before declaring complete, verify ALL:

Commands Must Pass
bash
npm install          # ✅ No errors
npm run dev          # ✅ Starts on localhost:3000
npm run build        # ✅ Builds successfully
npm run lint         # ✅ No errors
npm run typecheck    # ✅ No errors
npm test             # ✅ Runs (can have no tests yet)
npm run emulators    # ✅ Firebase emulators start
Files Must Exist
 All 9 docs in docs/
 CLAUDE.md in root
 SKILLS.md in root
 ENGINEERING_ROLES.md in root
 .env.example with all variables
 .gitignore with security patterns
 All placeholder pages in src/app/
 All component directories with .gitkeep
Security
 No secrets in committed files
 .claude/settings.json blocks sensitive files
📝 PR TEMPLATE
Title: [MANAGER] Initial repo setup with tooling and documentation

Body:

markdown
## Summary
Complete repository setup for GolfSettled MVP.

## Added
- Next.js 14 + TypeScript + Tailwind CSS
- Firebase configuration with offline persistence
- Cloud Functions scaffold
- GitHub Actions CI/CD
- Husky pre-commit hooks
- Jest test configuration
- All 12 documentation files
- Complete folder structure

## Verification
- [x] npm run dev works
- [x] npm run build passes
- [x] npm run lint passes
- [x] npm run typecheck passes
- [x] All docs in place

## Next Steps
→ Security Engineer: Firebase Auth
→ Frontend Engineer: UI components
→ Backend Engineer: Firestore data layer
🚀 START NOW
Verify prerequisites installed
Run through phases 1-9 in order
Check off each item as completed
Run all verification commands
Complete handoff checklist
Create PR
Your foundation determines everyone else's success. Take your time to get it right.







