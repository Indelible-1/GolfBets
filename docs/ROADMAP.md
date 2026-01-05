# GolfSettled MVP — Project Roadmap

> Track progress with checkboxes: `[ ]` Todo → `[-]` In Progress → `[x]` Done
> 
> Add timestamps when starting (🏗️) and completing (✅)

---

## 🎯 Current Sprint (Week 1)

### In Progress 🏗️

- [-] Firebase Auth with Magic Link — 🏗️ Started 2025-01-01
  - [ ] Firebase project setup
  - [ ] Magic link configuration
  - [ ] Protected routes
  - [ ] User profile creation

### Up Next

- [ ] Create Match flow
  - [ ] Course name input
  - [ ] Date picker
  - [ ] Invite link generation

---

## 📋 Backlog (Prioritized)

### Must Have (MVP)

- [ ] Nassau bet configuration
- [ ] Skins bet with carryover
- [ ] Hole-by-hole score entry
- [ ] Offline score persistence
- [ ] Payout calculation
- [ ] Shareable results card
- [ ] Basic ledger (who owes whom)
- [ ] Score edit audit log

### Should Have (Week 4 Stretch)

- [ ] Google OAuth
- [ ] Match play format
- [ ] Handicap stroke allocation
- [ ] Push notifications (Android)
- [ ] Rematch button

### Could Have (Phase 2)

- [x] User stats dashboard — ✅ 2026-01-05
- [x] Head-to-head records — ✅ 2026-01-05
- [x] Golf Wrapped (year-end summary) — ✅ 2026-01-05
- [x] Side bets (Greenies, Sandies, BBB) — ✅ 2026-01-05
- [ ] Season leaderboards
- [ ] Team formats (Four-Ball)
- [ ] Course database integration
- [ ] Apple Watch companion
- [ ] Payment app deep links (no pre-filled amounts)

---

## ✅ Completed

### Week 1
- [x] Project scaffolding — Next.js 14 + TypeScript ✅ 2025-01-01
- [x] PWA manifest and service worker setup ✅ 2025-01-01
- [x] Tailwind CSS configuration ✅ 2025-01-01
- [x] Firebase project initialization ✅ 2025-01-01

---

## 📝 Notes

### Decisions Made

- Using Firebase over Supabase for offline-first support
- Magic link as primary auth (golfer demographic prefers no passwords)
- PWA-first, no app store submission for MVP

### Blockers

- None currently

### Risks

- Firebase quota costs if viral — set budget alerts at $10, $25, $50

---

*Last updated: 2026-01-05*
