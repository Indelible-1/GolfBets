# Changelog

All notable changes to GolfSettled MVP will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- **Side Bets Feature** - Three new side bet types for golf matches:
  - **Greenies**: Closest to pin on par 3 holes
  - **Sandies**: Up and down from bunker for par or better
  - **Bingo Bango Bongo**: 3 points per hole (first on green, closest when all on, first in hole)
- Side bet logic and settlement calculations (`src/lib/bets/sideBets/`)
- Side bet UI components for score entry:
  - `SideBetInput`: Main container for all side bet inputs
  - `GreenieSelector`: Player selector for par 3 greenie winners
  - `SandyToggle`: Toggle buttons for sandy claims
  - `BBBScorer`: Bingo/Bango/Bongo point assignment
- Side bet configuration UI (`SideBetSelector`) for match creation
- Settlement integration for calculating combined side bet payouts
- Comprehensive unit tests for side bet logic (60+ tests)
- Stats dashboard page (`/stats`) with user statistics display
- Head-to-head record tracking against all opponents
- Head-to-head detail page (`/stats/[opponentId]`) with match history
- Golf Wrapped year-end summary page (`/wrapped`)
- Analytics utility functions for computing user stats, streaks, and H2H records
- React hooks: `useUserStats`, `useHeadToHead`, `useHeadToHeadDetail`, `useGolfWrapped`
- Stats UI components: `StatCard`, `StreakBadge`, `WinLossRatio`, `HeadToHeadRow`, `NetChart`, `WrappedCard`
- Comprehensive unit tests for analytics functions (53 tests)

#### Social Features (2026-01-05)

- **Friend Groups**: Create named groups for recurring players
  - Group creation, editing, and deletion
  - Member management (add/remove)
  - Default bet configurations per group
  - Group statistics tracking
  - Pages: `/groups`, `/groups/new`, `/groups/[id]`, `/groups/[id]/settings`
- **Season Leaderboards**: Monthly/quarterly standings within groups
  - Automatic season creation (monthly by default)
  - Rankings with trend indicators (up/down/same)
  - Win-loss records and net amounts
  - Historical season data
  - Page: `/groups/[id]/leaderboard`
- **Quick Rematch**: One-tap to recreate completed matches
  - Preserves participants, course, and bet configuration
  - Allows modifications before starting
  - Integrated into match results page
- **Bet Templates**: Save and reuse favorite bet configurations
  - Create templates from match setup
  - Set default template for quick match creation
  - Private templates (user-owned)
  - Page: `/templates`
- Social library (`src/lib/social/`) with groups, seasons, leaderboard, rematch, and templates modules
- React hooks: `useGroups`, `useGroup`, `useSeasonStandings`, `useBetTemplates`
- Social UI components: `GroupCard`, `GroupMemberList`, `LeaderboardTable`, `SeasonSelector`, `QuickRematchButton`, `TemplateSelector`
- Firestore collections: `groups`, `seasons`, `betTemplates`
- Unit tests for social features (groups, leaderboard, rematch, seasons)

### Changed

- Updated Firestore security rules for groups, seasons, and bet templates

### Fixed

- (Bug fixes go here)

### Removed

- (Removed features go here)

### Security

- Firestore rules enforce group membership for reads
- Only group creators can modify group settings
- Bet templates are private to the owner
- Season updates restricted to standings and status fields

---

## [0.1.0] - 2025-01-XX (Target: End of Week 1)

### Added

- Initial project scaffolding with Next.js 14 App Router
- TypeScript configuration with strict mode
- PWA manifest and service worker via `next-pwa`
- Tailwind CSS with mobile-first configuration
- Firebase project initialization
- Firebase Auth with Magic Link support
- Protected route middleware
- User profile creation on first login
- Bottom navigation shell (Home, New, Ledger, Profile)
- Basic CLAUDE.md and project documentation

### Security

- Environment variables for all Firebase credentials
- `.gitignore` configured for secrets
- Firestore security rules (draft)

---

## Version History Template

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New feature description

### Changed
- What was modified and why

### Fixed
- Bug description and resolution

### Removed
- What was removed and why

### Security
- Security-related changes
```

---

*Maintained by the development team. Update after each feature completion.*
