# GolfSettled MVP — Engineering Roles & Missions

> **Project:** Golf side-bet / ledger PWA
> **Timeline:** 30 days to functional MVP
> **Approach:** Specialized AI-assisted engineers with clear handoffs

---

## 🎯 Overview

This document defines the engineering roles, their missions, dependencies, and handoff points for building the GolfSettled MVP. Each role has a dedicated super prompt and works in sequence to avoid conflicts.

---

## 📋 Role Summary

| # | Role | Mission | Dependencies | Est. Duration |
|---|------|---------|--------------|---------------|
| 1 | **Manager Engineer** | Repo setup, structure, tooling | None | Day 1 |
| 2 | **Security Engineer** | Auth, rules, secrets management | Manager | Day 1-2 |
| 3 | **Backend Engineer** | Firestore schema, Cloud Functions | Security | Day 2-4 |
| 4 | **Frontend Engineer** | UI components, navigation, styling | Manager | Day 2-5 |
| 5 | **PWA/Offline Engineer** | Service worker, offline sync, caching | Frontend, Backend | Day 5-7 |
| 6 | **Betting Logic Engineer** | Nassau, Skins, press, payouts | Backend | Day 4-7 |

---

## 🔧 Role 1: Manager Engineer

### Mission
Establish the foundational repository structure, development tooling, and project scaffolding that all other engineers will build upon.

### Responsibilities
- Initialize Next.js 14 project with App Router and TypeScript
- Configure Tailwind CSS with mobile-first breakpoints
- Set up ESLint, Prettier, and TypeScript strict mode
- Create folder structure following established patterns
- Initialize Firebase project configuration (client-side only)
- Set up PWA manifest and basic service worker scaffold
- Configure Vercel deployment pipeline
- Create `.env.example` with required variables
- Initialize CLAUDE.md and docs folder structure
- Set up Git hooks (husky) for pre-commit linting

### Deliverables
```
├── .github/workflows/deploy.yml
├── .husky/pre-commit
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   ├── components/
│   │   └── ui/
│   ├── lib/
│   │   ├── firebase.ts
│   │   └── utils/
│   ├── hooks/
│   └── types/
├── public/
│   ├── manifest.json
│   └── icons/
├── docs/
│   ├── ROADMAP.md
│   └── CHANGELOG.md
├── CLAUDE.md
├── .env.example
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### Success Criteria
- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run lint` passes with no errors
- [ ] PWA manifest loads correctly
- [ ] Vercel preview deploy works
- [ ] All documentation files in place

### Handoff To
- Security Engineer (for auth and rules)
- Frontend Engineer (for UI development)

---

## 🛡️ Role 2: Security Engineer

### Mission
Implement authentication, security rules, and establish security best practices that protect user data and prevent common vulnerabilities.

### Responsibilities
- Configure Firebase Auth with Magic Link
- Set up Google OAuth as secondary auth method
- Create Firestore security rules with RLS patterns
- Implement protected route middleware
- Configure `.claude/settings.json` deny rules
- Set up rate limiting patterns
- Create input validation schemas with Zod
- Document security practices in `docs/SECURITY.md`
- Audit and finalize `.gitignore` for secrets

### Deliverables
```
├── src/
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── config.ts
│   │   │   ├── providers.tsx
│   │   │   └── middleware.ts
│   │   └── validators/
│   │       └── schemas.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   └── app/
│       ├── (auth)/
│       │   ├── login/page.tsx
│       │   └── callback/page.tsx
│       └── middleware.ts
├── firestore.rules
├── .claude/settings.json
└── docs/SECURITY.md
```

### Success Criteria
- [ ] Magic link auth flow works end-to-end
- [ ] Google OAuth works as alternative
- [ ] Unauthenticated users redirected to login
- [ ] Firestore rules block unauthorized access
- [ ] No secrets in codebase (verified)
- [ ] Rate limiting documented

### Handoff To
- Backend Engineer (secure data layer)
- All other engineers (auth context available)

---

## 🗄️ Role 3: Backend Engineer

### Mission
Build the data layer including Firestore collections, Cloud Functions, and all server-side logic for match management and scoring.

### Responsibilities
- Implement Firestore collections (users, matches, scores, ledger)
- Create typed data access functions
- Build Cloud Functions for:
  - Bet calculations
  - Audit logging
  - Invite link processing
  - Push notification triggers
- Implement optimistic locking for score updates
- Create seed data scripts for development
- Set up Firebase Local Emulator Suite

### Deliverables
```
├── src/
│   ├── lib/
│   │   ├── firestore/
│   │   │   ├── collections.ts
│   │   │   ├── matches.ts
│   │   │   ├── scores.ts
│   │   │   ├── users.ts
│   │   │   └── ledger.ts
│   │   └── types/
│   │       ├── match.ts
│   │       ├── score.ts
│   │       └── bet.ts
├── functions/
│   ├── src/
│   │   ├── calculatePayouts.ts
│   │   ├── createAuditEntry.ts
│   │   ├── processInvite.ts
│   │   └── index.ts
│   └── package.json
├── scripts/
│   └── seed-data.ts
└── firebase.json
```

### Success Criteria
- [ ] All collections have typed access functions
- [ ] CRUD operations work with proper auth
- [ ] Cloud Functions deploy without errors
- [ ] Emulator suite runs locally
- [ ] Optimistic locking prevents race conditions
- [ ] Audit trail captures all score changes

### Handoff To
- Betting Logic Engineer (data layer ready)
- PWA Engineer (sync endpoints ready)

---

## 🎨 Role 4: Frontend Engineer

### Mission
Build all user interface components with mobile-first design, proper accessibility, and golf-course-friendly UX (large tap targets, high contrast).

### Responsibilities
- Create bottom navigation component (4 tabs)
- Build screen layouts for all 7 primary screens
- Implement scorecard UI with hole-by-hole entry
- Create match creation wizard flow
- Build results card component (shareable)
- Implement ledger/balance view
- Create loading states and error boundaries
- Ensure 48×48dp minimum tap targets
- Implement offline status indicator

### Deliverables
```
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Modal.tsx
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Screen.tsx
│   │   ├── match/
│   │   │   ├── MatchCard.tsx
│   │   │   ├── CreateMatchWizard.tsx
│   │   │   └── BetSelector.tsx
│   │   ├── scorecard/
│   │   │   ├── Scorecard.tsx
│   │   │   ├── HoleInput.tsx
│   │   │   └── RunningTotal.tsx
│   │   ├── results/
│   │   │   ├── ResultsCard.tsx
│   │   │   └── ShareButton.tsx
│   │   └── ledger/
│   │       ├── BalanceCard.tsx
│   │       └── SettlementList.tsx
│   └── app/
│       ├── page.tsx (Home/Dashboard)
│       ├── match/
│       │   ├── new/page.tsx
│       │   └── [id]/
│       │       ├── page.tsx
│       │       ├── scorecard/page.tsx
│       │       └── results/page.tsx
│       ├── ledger/page.tsx
│       └── settings/page.tsx
```

### Success Criteria
- [ ] All screens render without errors
- [ ] Bottom navigation works correctly
- [ ] Scorecard allows hole-by-hole entry
- [ ] Tap targets meet 48×48dp minimum
- [ ] High contrast for sunlight readability
- [ ] One-handed operation possible

### Handoff To
- PWA Engineer (UI components ready)
- Betting Logic Engineer (UI for bet display)

---

## 📱 Role 5: PWA/Offline Engineer

### Mission
Implement offline-first functionality including service worker caching, local data persistence, and background sync for score data.

### Responsibilities
- Configure next-pwa for service worker generation
- Implement IndexedDB for local score storage
- Create offline queue for pending writes
- Build sync status indicator component
- Implement conflict resolution (last-write-wins)
- Cache critical assets for offline use
- Handle offline match viewing
- Create "draft mode" for offline match creation
- Test airplane mode scenarios

### Deliverables
```
├── src/
│   ├── lib/
│   │   ├── offline/
│   │   │   ├── db.ts (IndexedDB setup)
│   │   │   ├── queue.ts (write queue)
│   │   │   ├── sync.ts (background sync)
│   │   │   └── cache.ts (asset caching)
│   │   └── hooks/
│   │       ├── useOnlineStatus.ts
│   │       ├── useOfflineScores.ts
│   │       └── useSyncStatus.ts
│   ├── components/
│   │   └── offline/
│   │       ├── SyncIndicator.tsx
│   │       ├── OfflineBanner.tsx
│   │       └── PendingChanges.tsx
├── public/
│   └── sw.js (generated)
└── next.config.js (PWA config)
```

### Success Criteria
- [ ] App works in airplane mode
- [ ] Scores save locally when offline
- [ ] Scores sync when back online
- [ ] Sync status clearly visible
- [ ] Conflicts resolved correctly
- [ ] PWA installable on iOS/Android

### Handoff To
- Final integration and testing

---

## 🎲 Role 6: Betting Logic Engineer

### Mission
Implement all golf betting calculations including Nassau, Skins, press mechanics, and payout computations with full test coverage.

### Responsibilities
- Implement Nassau bet calculator
- Implement Skins bet calculator with carryover
- Build press mechanics (auto-press at 2-down)
- Create payout computation engine
- Handle handicap stroke allocation
- Build match play scoring logic
- Write comprehensive unit tests
- Document betting rules in `docs/BETTING_RULES.md`

### Deliverables
```
├── src/
│   ├── lib/
│   │   └── bets/
│   │       ├── types.ts
│   │       ├── nassau.ts
│   │       ├── skins.ts
│   │       ├── matchPlay.ts
│   │       ├── press.ts
│   │       ├── handicap.ts
│   │       ├── payouts.ts
│   │       └── index.ts
│   └── __tests__/
│       └── bets/
│           ├── nassau.test.ts
│           ├── skins.test.ts
│           ├── press.test.ts
│           └── payouts.test.ts
└── docs/BETTING_RULES.md
```

### Success Criteria
- [ ] Nassau calculates front/back/overall correctly
- [ ] Skins with carryover works
- [ ] Auto-press triggers at 2-down
- [ ] Payouts compute who-owes-whom
- [ ] All edge cases tested
- [ ] 90%+ test coverage on betting logic

### Handoff To
- Final integration with UI

---

## 🔄 Execution Order

```
Day 1:
├── Manager Engineer (repo setup)
└── Security Engineer (starts after Manager)

Day 2-3:
├── Security Engineer (completes auth)
├── Backend Engineer (starts data layer)
└── Frontend Engineer (starts UI components)

Day 4-5:
├── Backend Engineer (completes)
├── Frontend Engineer (continues)
└── Betting Logic Engineer (starts)

Day 6-7:
├── Frontend Engineer (completes)
├── Betting Logic Engineer (continues)
└── PWA Engineer (starts integration)

Day 8+:
├── PWA Engineer (completes)
├── Integration testing
└── Bug fixes and polish
```

---

## 📝 PR Naming Convention

Each engineer creates PRs with this format:
```
[ROLE] Brief description of changes

Examples:
[MANAGER] Initial repo setup and tooling
[SECURITY] Firebase Auth with Magic Link
[BACKEND] Firestore collections and typed access
[FRONTEND] Bottom navigation and screen layouts
[PWA] Offline score persistence
[BETTING] Nassau calculator with press mechanics
```

---

## ⚠️ Coordination Rules

1. **No overlapping files** — Each role owns specific directories
2. **Clear handoffs** — Wait for dependencies before starting
3. **Update ROADMAP.md** — Mark tasks complete with timestamps
4. **Update CHANGELOG.md** — Document all changes
5. **Run tests** — Before any PR, ensure all tests pass
6. **No scope creep** — Stick to assigned deliverables

---

*This document is the source of truth for role assignments. Update as needed.*
