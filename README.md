<div align="center">

# ⛳ GolfSettled

### Track golf bets with friends. Settle up later.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)](https://firebase.google.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

<br />

[**Live Demo**](#) · [**Documentation**](./docs/) · [**Report Bug**](../../issues) · [**Request Feature**](../../issues)

<br />

<img src="./docs/assets/mockup.png" alt="GolfSettled App Mockup" width="600" />

</div>

> ⚠️ **Project Status:** Early Development
> Authentication is the current blocker. Most features are documented but not yet implemented.
> See [ROADMAP.md](./docs/ROADMAP.md) for current progress.

---

## 🎯 What is GolfSettled?

**GolfSettled** is a mobile-first Progressive Web App (PWA) for tracking golf side bets between friends. It works offline on the course, calculates complex bet types automatically, and provides a clear ledger for settling up after the round.

> **No real money is handled by this app.** It's a ledger and calculator — settle up offline via Venmo, Zelle, or cash.

### The Problem

Every golf group has "that guy" who tracks bets on a crumpled scorecard, argues about presses, and somehow always wins the math. Disputes happen. Friendships are tested.

### The Solution

GolfSettled provides:
- 📱 **Mobile-first scoring** — Big buttons for gloved hands in bright sunlight
- ⛳ **Nassau + Skins** — Automatic calculation of complex bet types
- 📴 **Offline-first** — Works in dead zones, syncs when connected
- 📊 **Clear ledger** — Who owes whom, no disputes
- 🔗 **Easy sharing** — Invite friends with a link, no app store needed

---

## ✨ Features

### Core Features (MVP)

| Feature | Description |
|---------|-------------|
| **🏌️ Match Creation** | Set up rounds with course, tee time, and bet configuration |
| **👥 Group Invites** | Share a link to invite players — no accounts required to view |
| **📝 Live Scoring** | Enter scores hole-by-hole with optimistic updates |
| **🏆 Nassau Bets** | Front 9, Back 9, Overall with auto-press support |
| **💰 Skins Games** | Carryover skins with tie handling |
| **📊 Ledger** | Running balance between all players across matches |
| **📴 Offline Mode** | Full functionality without connectivity |
| **📱 PWA Install** | Add to home screen, works like a native app |

### Coming Soon

- [ ] Handicap integration (GHIN lookup)
- [ ] Course database with pars
- [ ] Group/league management
- [ ] Historical stats and trends
- [ ] Venmo/Zelle deep links

---

## 🛠 Tech Stack

| Layer | Technology | Why |
|-------|------------|-----|
| **Framework** | Next.js 16 (App Router) | React Server Components, edge-ready |
| **Language** | TypeScript 5 | Type safety, better DX |
| **Styling** | Tailwind CSS 4 | Utility-first, mobile responsive |
| **Backend** | Firebase (Auth, Firestore) | Real-time sync, generous free tier |
| **Hosting** | Vercel | Zero-config Next.js deployment |
| **PWA** | next-pwa + Workbox | Offline support, installable |
| **Validation** | Zod | Runtime type validation |

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Client (PWA)                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │   Next.js   │  │  React Query │  │   Workbox   │     │
│  │  App Router │  │  (caching)   │  │  (offline)  │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                    Firebase Backend                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │
│  │    Auth     │  │  Firestore  │  │  Functions  │     │
│  │ (Magic Link)│  │  (Real-time)│  │  (Triggers) │     │
│  └─────────────┘  └─────────────┘  └─────────────┘     │
└─────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ 
- npm 10+
- Firebase project (free tier works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/golfsettled.git
cd golfsettled
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Firebase credentials:

```env
# Firebase (from Firebase Console → Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Set Up Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize project (select Firestore, Auth, Functions)
firebase init

# Deploy security rules
firebase deploy --only firestore:rules
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

### 6. (Optional) Start Firebase Emulators

```bash
npm run emulators
```

---

## 📁 Project Structure

```
golfsettled/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth routes (login, callback)
│   │   ├── match/              # Match routes
│   │   │   ├── [id]/           # Match detail, scorecard, results
│   │   │   └── new/            # Create match wizard
│   │   ├── ledger/             # Balance/settlement page
│   │   ├── settings/           # User profile
│   │   ├── layout.tsx          # Root layout with providers
│   │   └── page.tsx            # Home dashboard
│   │
│   ├── components/
│   │   ├── ui/                 # Design system (Button, Card, etc.)
│   │   ├── layout/             # Layout components (Nav, Header)
│   │   ├── match/              # Match-specific components
│   │   ├── scorecard/          # Scoring components
│   │   ├── ledger/             # Balance components
│   │   └── offline/            # Offline indicators
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useAuth.ts          # Authentication state
│   │   ├── useMatch.ts         # Match data & actions
│   │   ├── useScores.ts        # Score management
│   │   └── useLedger.ts        # Balance calculations
│   │
│   ├── lib/
│   │   ├── firebase.ts         # Firebase initialization
│   │   ├── auth/               # Auth config & provider
│   │   ├── firestore/          # Data access functions
│   │   ├── betting/            # Bet calculation logic
│   │   ├── validators/         # Zod schemas
│   │   └── utils.ts            # Helper functions
│   │
│   └── types/                  # TypeScript definitions
│       └── database.ts         # Firestore document types
│
├── functions/                  # Firebase Cloud Functions
│   └── src/
│       └── index.ts            # Triggers & callable functions
│
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # App icons
│
├── docs/                       # Documentation
│   ├── ARCHITECTURE.md
│   ├── DATA_MODEL.md
│   ├── BETTING_RULES.md
│   └── ...
│
├── firestore.rules             # Security rules
├── tailwind.config.ts          # Tailwind configuration
├── next.config.js              # Next.js configuration
└── package.json
```

---

## 📖 Documentation

| Document | Description |
|----------|-------------|
| [Architecture](./docs/ARCHITECTURE.md) | System design and data flow |
| [Data Model](./docs/DATA_MODEL.md) | Firestore collections and schemas |
| [Betting Rules](./docs/BETTING_RULES.md) | Nassau, Skins, and scoring logic |
| [Security](./docs/SECURITY.md) | Auth flows and Firestore rules |
| [Testing](./docs/TESTING.md) | Test strategy and commands |
| [Onboarding](./docs/ONBOARDING.md) | New developer setup guide |

---

## 🧪 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Run TypeScript compiler |
| `npm run test` | Run test suite |
| `npm run emulators` | Start Firebase emulators |

### Code Quality

```bash
# Run all checks (before committing)
npm run lint && npm run typecheck && npm run build
```

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes, commit with conventional commits
git commit -m "feat: add skins calculation"

# Push and create PR
git push origin feature/your-feature
```

**Commit Convention:**
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Code restructure
- `test:` Tests
- `chore:` Maintenance

---

## 📱 PWA Installation

### iOS (Safari)
1. Open app in Safari
2. Tap Share button
3. Tap "Add to Home Screen"

### Android (Chrome)
1. Open app in Chrome
2. Tap menu (⋮)
3. Tap "Add to Home Screen"

### Desktop (Chrome/Edge)
1. Look for install icon in address bar
2. Click "Install"

---

## 🔐 Security

- **Authentication:** Firebase Auth with Magic Link (passwordless) and Google OAuth
- **Authorization:** Firestore security rules enforce participant-only access
- **Data:** No payment data stored — we're a ledger, not a payment processor
- **Validation:** All inputs validated with Zod on client and server

See [SECURITY.md](./docs/SECURITY.md) for details.

---

## 🗺 Roadmap

### Phase 1: MVP (In Progress)

**✅ Completed**
- [x] Project setup and architecture
- [x] PWA manifest and service worker scaffold
- [x] Tailwind CSS configuration
- [x] Project documentation

**🏗️ In Progress**
- [-] Authentication (Magic Link) — *Currently blocking*
- [-] Firebase project initialization

**📋 Up Next**
- [ ] Protected routes and middleware
- [ ] User profile creation
- [ ] Match creation and management
- [ ] Basic scoring interface
- [ ] Nassau bet calculations
- [ ] Skins bet calculations
- [ ] Ledger with balances
- [ ] Offline support
- [ ] PWA installation (full)

### Phase 2: Enhanced UX
- [ ] Google OAuth (secondary auth)
- [ ] Course database integration
- [ ] GHIN handicap lookup
- [ ] Push notifications
- [ ] Dark mode
- [ ] Haptic feedback

### Phase 3: Social Features
- [ ] Groups/leagues
- [ ] Invite via SMS/email
- [ ] Recurring games
- [ ] Leaderboards
- [ ] Stats dashboard

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines before submitting a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Philosophy

- **MVP First:** Ship fast, iterate based on feedback
- **Mobile First:** Design for phones, enhance for desktop
- **Offline First:** Assume spotty connectivity
- **Type Safety:** TypeScript everywhere
- **Accessibility:** 48px tap targets, high contrast

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) — The React Framework
- [Firebase](https://firebase.google.com/) — Backend infrastructure
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Vercel](https://vercel.com/) — Deployment platform
- All the golf groups who gave feedback

---

<div align="center">

**Built with ☕ and ⛳ by golfers, for golfers**

[⬆ Back to Top](#-golfsettled)

</div>