# GolfSettled MVP — Architecture

> **Version:** 0.1.0
> **Last Updated:** 2025-01-01
> **Status:** Planning

---

## 📋 Overview

GolfSettled is a **PWA-first** golf betting tracker that helps casual golf groups track Nassau, Skins, and other friendly wagers without handling real money. Users settle offline via Venmo/cash.

### Core Principles

1. **Offline-First** — Works on golf courses with spotty connectivity
2. **Mobile-First** — Designed for one-handed use while playing
3. **No Money Handling** — Legal bright line; IOU ledger only
4. **Simple > Perfect** — MVP in 30 days, iterate later

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                    Next.js 14 PWA                           │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────────────────┐│ │
│  │  │  React  │ │ Service │ │IndexedDB│ │   Firestore SDK     ││ │
│  │  │   UI    │ │ Worker  │ │ (Local) │ │   (Offline Sync)    ││ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────────────────┘│ │
│  └─────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                      Vercel Edge                            │ │
│  │              (CDN, SSL, Preview Deploys)                    │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                        FIREBASE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │   Firebase   │  │    Cloud     │  │    Cloud Functions     │ │
│  │     Auth     │  │   Firestore  │  │   (Bet Calc, Audit)    │ │
│  │              │  │              │  │                        │ │
│  │ • Magic Link │  │ • Users      │  │ • calculatePayouts     │ │
│  │ • Google SSO │  │ • Matches    │  │ • createAuditEntry     │ │
│  │              │  │ • Scores     │  │ • processInvite        │ │
│  │              │  │ • Ledger     │  │ • sendNotification     │ │
│  └──────────────┘  └──────────────┘  └────────────────────────┘ │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │                 Firebase Security Rules                     │ │
│  │           (RLS-style per-document access control)           │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Justification |
|-------|------------|---------|---------------|
| **Frontend** | Next.js | 14.x | App Router, RSC, excellent PWA support |
| **Language** | TypeScript | 5.x | Type safety, better DX |
| **Styling** | Tailwind CSS | 3.x | Rapid prototyping, mobile-first |
| **Auth** | Firebase Auth | 10.x | Magic link + OAuth, free tier |
| **Database** | Cloud Firestore | 10.x | Real-time sync, offline persistence |
| **Functions** | Cloud Functions | 2nd gen | Bet calculations, audit logging |
| **Hosting** | Vercel | - | Auto-deploy, preview branches |
| **Monitoring** | Sentry | - | Error tracking (free tier) |

---

## 📁 Directory Structure

```
golfsettled-mvp/
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD pipeline
├── .claude/
│   └── settings.json           # AI assistant security config
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth routes (grouped)
│   │   │   ├── login/
│   │   │   └── callback/
│   │   ├── match/              # Match routes
│   │   │   ├── new/
│   │   │   └── [id]/
│   │   │       ├── scorecard/
│   │   │       └── results/
│   │   ├── ledger/             # Ledger view
│   │   ├── settings/           # User settings
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                 # Base UI components
│   │   ├── layout/             # Layout components
│   │   ├── match/              # Match-specific
│   │   ├── scorecard/          # Scorecard components
│   │   ├── results/            # Results & sharing
│   │   ├── ledger/             # Ledger components
│   │   └── offline/            # Offline indicators
│   ├── lib/
│   │   ├── firebase.ts         # Firebase client init
│   │   ├── auth/               # Auth utilities
│   │   ├── firestore/          # Data access layer
│   │   ├── bets/               # Betting logic
│   │   ├── offline/            # Offline sync
│   │   ├── utils/              # General utilities
│   │   └── validators/         # Zod schemas
│   ├── hooks/                  # Custom React hooks
│   └── types/                  # TypeScript types
├── functions/                  # Cloud Functions
│   ├── src/
│   └── package.json
├── public/
│   ├── manifest.json           # PWA manifest
│   └── icons/                  # App icons
├── docs/                       # Documentation
│   └── prompts/                # Engineer role prompts
├── scripts/                    # Dev scripts
├── __tests__/                  # Test files
├── .env.example
├── CLAUDE.md                   # AI assistant config
├── firebase.json
├── firestore.rules
└── package.json
```

---

## 🔄 Data Flow

### Score Entry Flow (Offline-Capable)

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User taps  │────▶│  Validate    │────▶│ Save to      │
│   score      │     │  input       │     │ IndexedDB    │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Update UI  │◀────│  Firestore   │◀────│ Background   │
│   optimistic │     │  confirms    │     │ sync queue   │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Match Lifecycle

```
PENDING ──▶ ACTIVE ──▶ COMPLETED
   │           │            │
   │           │            └── Final scores locked
   │           │                Payouts calculated
   │           │                Results shareable
   │           │
   │           └── Score entry enabled
   │               Press mechanics active
   │               Real-time sync
   │
   └── Players invited
       Bets configured
       Waiting for start
```

---

## 📱 Screen Architecture

### Navigation (4-Tab Bottom Nav)

| Tab | Icon | Screen | Purpose |
|-----|------|--------|---------|
| Home | 🏠 | Dashboard | Active matches, quick actions |
| New | ➕ | Create Match | Start new match wizard |
| Ledger | 💰 | Balances | Who owes whom |
| Profile | 👤 | Settings | User preferences |

### Screen Hierarchy

```
Home (/)
├── Match List
├── Active Match Card
└── Start Match CTA

Create Match (/match/new)
├── Step 1: Course & Date
├── Step 2: Players & Invites
├── Step 3: Bet Configuration
└── Step 4: Confirm & Start

Match Detail (/match/[id])
├── Overview Tab
├── Scorecard Tab (/match/[id]/scorecard)
│   ├── Hole-by-hole entry
│   ├── Running totals
│   └── Press indicators
└── Results Tab (/match/[id]/results)
    ├── Final scores
    ├── Payout summary
    └── Share card

Ledger (/ledger)
├── Net Balance Summary
├── Pending Settlements
└── History

Settings (/settings)
├── Profile
├── Handicap
├── Notifications
└── Payment Preferences
```

---

## 🔐 Security Architecture

### Authentication Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User       │────▶│  Firebase    │────▶│  Magic Link  │
│   enters     │     │  Auth        │     │  sent to     │
│   email      │     │              │     │  email       │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                                                 ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User       │◀────│  Session     │◀────│  User clicks │
│   logged in  │     │  created     │     │  link        │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Authorization Model

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Own Profile | ✅ | ✅ | ✅ | ❌ |
| Match (as participant) | ✅ | ✅ | ✅ | ❌ |
| Match (as creator) | ✅ | ✅ | ✅ | ✅ |
| Scores (own) | ✅ | ✅ | ✅ | ❌ |
| Scores (others in match) | ❌ | ✅ | ❌ | ❌ |
| Ledger (own entries) | ❌ | ✅ | ✅ | ❌ |
| Audit Log | ❌ | ✅ | ❌ | ❌ |

---

## 📶 Offline Architecture

### Sync Strategy

| Feature | Offline Capability | Sync Strategy |
|---------|-------------------|---------------|
| Score entry | ✅ Full | Background sync with timestamps |
| View current match | ✅ Full | Cache-first |
| View ledger | ✅ Cached | Stale-while-revalidate |
| Create new match | ⚠️ Draft mode | Saves locally, syncs when online |
| Send invites | ❌ Requires network | Invite links need server |

### Conflict Resolution

**Strategy:** Last-write-wins with timestamps

```typescript
interface SyncableScore {
  value: number
  timestamp: number      // Unix ms
  deviceId: string       // For debugging
  version: number        // Optimistic locking
}
```

When conflicts occur:
1. Compare timestamps
2. Keep most recent
3. Show toast: "Score updated by [Player]"
4. Log to audit trail

---

## 📊 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| First Contentful Paint | < 1.5s | Lighthouse |
| Time to Interactive | < 3s | Lighthouse |
| Lighthouse Score | > 90 | Mobile |
| Offline Load | < 500ms | Service Worker |
| Score Entry Response | < 100ms | UI feedback |
| Bundle Size | < 200KB | gzipped JS |

---

## 🧪 Testing Strategy

| Type | Tool | Coverage Target |
|------|------|-----------------|
| Unit Tests | Jest | 80% for betting logic |
| Component Tests | React Testing Library | Key flows |
| E2E Tests | Playwright (Phase 2) | Critical paths |
| Manual Testing | Real devices | Offline scenarios |

---

## 📈 Scaling Considerations (Post-MVP)

### Current Limits (Firebase Free Tier)
- 50K reads/day
- 20K writes/day
- 1GB storage
- 10GB bandwidth

### When to Scale
- 1,000+ daily active users
- 100+ concurrent matches
- Response times > 500ms

### Scaling Path
1. Compound queries to batch reads
2. Firestore indexes for common queries
3. Cloud Functions optimization
4. Consider Firestore bundles for common data

---

## 🔗 External Dependencies

| Dependency | Purpose | Fallback |
|------------|---------|----------|
| Firebase Auth | Authentication | None (critical) |
| Firestore | Data storage | IndexedDB (offline) |
| Vercel | Hosting | Manual deploy |
| Sentry | Error tracking | Console logs |

---

## 📝 Decision Log

| Date | Decision | Rationale | Alternatives Considered |
|------|----------|-----------|------------------------|
| 2025-01-01 | Firebase over Supabase | Offline-first support | Supabase (no offline), Convex |
| 2025-01-01 | Magic Link auth | No passwords, golfer demographic | Email/password, SMS |
| 2025-01-01 | PWA over native | Faster MVP, no app store | React Native, Flutter |
| 2025-01-01 | Last-write-wins sync | Simple, good enough for MVP | CRDT, operational transform |

---

*This document should be updated when architectural decisions change.*
