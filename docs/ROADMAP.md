# GolfSettled MVP — Project Roadmap

> Track progress with checkboxes: `[ ]` Todo → `[-]` In Progress → `[x]` Done
>
> Add timestamps when starting (🏗️) and completing (✅)

---

## ✅ Completed

### Infrastructure & Setup
- [x] Project scaffolding — Next.js 16 + TypeScript ✅ 2025-01-01
- [x] PWA manifest and service worker setup ✅ 2025-01-01
- [x] Tailwind CSS configuration ✅ 2025-01-01
- [x] Firebase project initialization ✅ 2025-01-01
- [x] ESLint v9 flat config with Next.js rules ✅ 2025-01-01
- [x] Jest testing framework setup ✅ 2025-01-01
- [x] Husky pre-commit hooks ✅ 2025-01-01

### Authentication
- [x] Firebase Auth with Magic Link ✅ 2025-01-03
  - [x] Magic link send API with rate limiting
  - [x] Auth callback handler
  - [x] Protected routes component
  - [x] Login page UI
  - [x] useAuth hook

### Match Creation
- [x] Create Match flow ✅ 2025-01-03
  - [x] Course name input
  - [x] Date/time picker
  - [x] Holes selection (9/18)
  - [x] Bet configuration wizard
  - [x] Invite link generation

### Betting System
- [x] Nassau bet configuration ✅ 2025-01-03
  - [x] BetSelector component
  - [x] Nassau config types and helpers
  - [x] Auto-press option
- [x] Skins bet with carryover ✅ 2025-01-03
  - [x] Skins config types and helpers
  - [x] Carryover option support

### Score Entry
- [x] Hole-by-hole score entry ✅ 2025-01-03
  - [x] HoleInput component
  - [x] Scorecard with running totals
  - [x] Leaderboard display
  - [x] Score persistence to Firestore

### Offline Support
- [x] Offline score persistence ✅ 2025-01-03
  - [x] IndexedDB setup (idb)
  - [x] Score caching layer
  - [x] Match caching layer
  - [x] Pending changes queue
  - [x] Sync manager with retry logic
  - [x] Sync status indicator UI
  - [x] Offline banner component

### Ledger & Settlements
- [x] Basic ledger (who owes whom) ✅ 2025-01-03
  - [x] Ledger page UI
  - [x] Balance calculation utilities
  - [x] Pairwise balance display
  - [x] Settlement list component

### PWA Features
- [x] PWA install prompts ✅ 2025-01-03
  - [x] Android install prompt
  - [x] iOS install instructions modal
  - [x] PWA provider context

### Security
- [x] Input validation with Zod schemas ✅ 2025-01-03
- [x] Rate limiting on auth endpoints ✅ 2025-01-03
- [x] Security validation tests ✅ 2025-01-03
- [x] Structured logger (no PII leakage) ✅ 2025-01-03

### UI Components
- [x] Core UI components ✅ 2025-01-03
  - [x] Button, Card, Input, Modal, Badge
  - [x] Header with navigation
  - [x] Bottom navigation
  - [x] Screen layout wrapper
  - [x] Error boundary

### Code Quality
- [x] Tech debt cleanup ✅ 2025-01-04
  - [x] Documentation consolidation to docs/
  - [x] Removed duplicate files (outputs/)
  - [x] Cleaned up .DS_Store and debug logs
  - [x] TypeScript firebase-admin type fixes

---

## 🏗️ In Progress

### Payout Calculations
- [-] Payout calculation engine — 🏗️ Started 2025-01-03
  - [x] Nassau estimation helpers (client-side)
  - [x] Skins estimation helpers (client-side)
  - [ ] Cloud Functions for final calculations
  - [ ] Ledger entry creation from match results

---

## 📋 Backlog (Prioritized)

### Must Have (MVP)
- [ ] Shareable results card — UI exists, needs share functionality
- [ ] Score edit audit log — Logging in place, needs Firestore audit trail
- [ ] Firestore security rules — Structure exists, needs RLS implementation

### Should Have (Week 4 Stretch)
- [ ] Google OAuth
- [ ] Match play format
- [ ] Handicap stroke allocation
- [ ] Push notifications (Android)
- [ ] Rematch button

### Could Have (Phase 2)
- [ ] Season leaderboards
- [ ] Team formats (Four-Ball)
- [ ] Course database integration
- [ ] Apple Watch companion
- [ ] Payment app deep links (no pre-filled amounts)

---

## 📝 Notes

### Decisions Made

- Using Firebase over Supabase for offline-first support
- Magic link as primary auth (golfer demographic prefers no passwords)
- PWA-first, no app store submission for MVP
- Next.js 16 with App Router for modern React patterns
- IndexedDB via `idb` for offline storage

### Blockers

- None currently

### Risks

- Firebase quota costs if viral — set budget alerts at $10, $25, $50

---

*Last updated: 2025-01-04*
