# 🎲 SUPER PROMPT: Betting Logic Engineer

> **Role:** Betting Logic Engineer (Role #6)
> **Project:** GolfSettled MVP — Golf Side-Bet Tracker PWA
> **Duration:** Day 5-7
> **Dependencies:** Manager ✅, Security ✅, Backend ✅, Frontend ✅ (partial)

---

## 🎯 YOUR MISSION

You are the **Betting Logic Engineer** responsible for implementing all golf betting calculations: Nassau (with presses), Skins (with carryovers), and generating the ledger entries that determine who owes whom. Your calculations must be correct, fair, and handle all edge cases.

**Your work is complete when:** All bet types calculate correctly, ledger entries are generated accurately, and results can be verified manually against traditional golf betting rules.

---

## 📋 PREREQUISITES

Before starting, verify previous engineers' work:

```bash
cd /Users/neilfrye/docs/AI/SideBets

# Verify these pass
npm run dev          # Should start
npm run build        # Should build
npm run lint         # Should pass

# Verify types exist
cat src/types/database.ts  # Should have Bet, Score, LedgerEntry types
```

### Critical Understanding

**You must deeply understand golf betting before coding:**

| Bet Type | Description | Complexity |
|----------|-------------|------------|
| **Nassau** | 3 bets in one (Front 9, Back 9, Overall 18) | Medium |
| **Presses** | New sub-bets triggered when down by N holes | High |
| **Skins** | Lowest score on a hole wins the "skin" | Low |
| **Carryovers** | Tied holes carry value to next hole | Medium |

---

## 📋 TASK CHECKLIST

Complete these tasks in order:

---

### Phase 1: Core Betting Types

#### 1.1 — Betting Constants

**File: `src/lib/betting/constants.ts`**
```typescript
// ============================================
// HOLE RANGES
// ============================================

export const FRONT_NINE = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const
export const BACK_NINE = [10, 11, 12, 13, 14, 15, 16, 17, 18] as const
export const ALL_HOLES = [...FRONT_NINE, ...BACK_NINE] as const

export type HoleNumber = typeof ALL_HOLES[number]

// ============================================
// SCORING
// ============================================

export const DEFAULT_PARS: Record<HoleNumber, number> = {
  1: 4, 2: 4, 3: 3, 4: 5, 5: 4, 6: 4, 7: 3, 8: 4, 9: 5,
  10: 4, 11: 4, 12: 3, 13: 5, 14: 4, 15: 4, 16: 3, 17: 4, 18: 5,
}

// ============================================
// BETTING DEFAULTS
// ============================================

export const DEFAULT_NASSAU_CONFIG = {
  frontAmount: 5,
  backAmount: 5,
  overallAmount: 5,
  autoPress: true,
  pressTrigger: 2, // Auto-press when 2 down
  maxPresses: 4,
} as const

export const DEFAULT_SKINS_CONFIG = {
  skinValue: 1,
  carryover: true,
  validation: false, // Require all players to have score
} as const

// ============================================
// RESULT TYPES
// ============================================

export type MatchPlayResult = 'win' | 'loss' | 'halve' | 'all-square'
export type HoleResult = 'win' | 'loss' | 'tie'
```

#### 1.2 — Score Utilities

**File: `src/lib/betting/scoreUtils.ts`**
```typescript
import type { Score, Participant } from '@/types'
import { FRONT_NINE, BACK_NINE, HoleNumber } from './constants'

// ============================================
// SCORE EXTRACTION
// ============================================

/**
 * Get a participant's score for a specific hole
 */
export function getHoleScore(
  scores: Score[],
  participantId: string,
  holeNumber: number
): number | null {
  const score = scores.find(
    s => s.participantId === participantId && s.holeNumber === holeNumber
  )
  return score?.strokes ?? null
}

/**
 * Get all scores for a participant
 */
export function getParticipantScores(
  scores: Score[],
  participantId: string
): Map<number, number> {
  const result = new Map<number, number>()
  
  for (const score of scores) {
    if (score.participantId === participantId) {
      result.set(score.holeNumber, score.strokes)
    }
  }
  
  return result
}

/**
 * Get total strokes for a range of holes
 */
export function getTotalForHoles(
  scores: Score[],
  participantId: string,
  holes: readonly number[]
): number | null {
  let total = 0
  
  for (const hole of holes) {
    const strokes = getHoleScore(scores, participantId, hole)
    if (strokes === null) return null // Incomplete
    total += strokes
  }
  
  return total
}

/**
 * Get front 9 total
 */
export function getFrontNineTotal(scores: Score[], participantId: string): number | null {
  return getTotalForHoles(scores, participantId, FRONT_NINE)
}

/**
 * Get back 9 total
 */
export function getBackNineTotal(scores: Score[], participantId: string): number | null {
  return getTotalForHoles(scores, participantId, BACK_NINE)
}

/**
 * Get overall 18 total
 */
export function getOverallTotal(scores: Score[], participantId: string): number | null {
  return getTotalForHoles(scores, participantId, [...FRONT_NINE, ...BACK_NINE])
}

// ============================================
// NET SCORE CALCULATIONS
// ============================================

/**
 * Calculate net score (gross - handicap strokes)
 */
export function calculateNetScore(
  grossScore: number,
  holeNumber: number,
  courseHandicap: number | null,
  holes: 9 | 18 = 18
): number {
  if (courseHandicap === null || courseHandicap === 0) {
    return grossScore
  }
  
  // Determine handicap strokes for this hole
  // Simple distribution: give strokes on hardest holes first
  // For MVP, assume hole number = difficulty ranking
  const handicapStrokes = getHandicapStrokesForHole(holeNumber, courseHandicap, holes)
  
  return grossScore - handicapStrokes
}

/**
 * Get handicap strokes allocated to a specific hole
 */
export function getHandicapStrokesForHole(
  holeNumber: number,
  courseHandicap: number,
  holes: 9 | 18 = 18
): number {
  // Simplified handicap distribution for MVP
  // In reality, courses have specific stroke indexes
  
  if (courseHandicap <= 0) return 0
  
  // Distribute strokes across holes
  // Full stroke on each hole until we run out
  const strokesPerHole = Math.floor(courseHandicap / holes)
  const extraStrokes = courseHandicap % holes
  
  // Give extra strokes to lower-numbered holes (simplified)
  if (holeNumber <= extraStrokes) {
    return strokesPerHole + 1
  }
  
  return strokesPerHole
}

// ============================================
// COMPARISON UTILITIES
// ============================================

/**
 * Compare two scores for a hole (lower is better)
 * Returns: 1 if player1 wins, -1 if player2 wins, 0 if tie
 */
export function compareHoleScores(
  player1Score: number | null,
  player2Score: number | null
): -1 | 0 | 1 {
  if (player1Score === null || player2Score === null) return 0
  
  if (player1Score < player2Score) return 1  // Player 1 wins (lower score)
  if (player1Score > player2Score) return -1 // Player 2 wins
  return 0 // Tie
}

/**
 * Get the winner of a hole among multiple players
 * Returns null if tie or incomplete
 */
export function getHoleWinner(
  scores: Score[],
  participantIds: string[],
  holeNumber: number
): string | null {
  const holeScores: { participantId: string; strokes: number }[] = []
  
  for (const participantId of participantIds) {
    const strokes = getHoleScore(scores, participantId, holeNumber)
    if (strokes === null) return null // Incomplete
    holeScores.push({ participantId, strokes })
  }
  
  // Find minimum
  const minStrokes = Math.min(...holeScores.map(s => s.strokes))
  const winners = holeScores.filter(s => s.strokes === minStrokes)
  
  // If multiple tied for lowest, no winner
  if (winners.length !== 1) return null
  
  return winners[0].participantId
}
```

---

### Phase 2: Nassau Calculation

#### 2.1 — Nassau Calculator

**File: `src/lib/betting/nassau.ts`**
```typescript
import type { Score, Bet, NassauConfig, LedgerEntryCreateData } from '@/types'
import { FRONT_NINE, BACK_NINE, HoleResult } from './constants'
import { getHoleScore, compareHoleScores } from './scoreUtils'

// ============================================
// TYPES
// ============================================

interface NassauState {
  frontNine: MatchState
  backNine: MatchState
  overall: MatchState
  presses: PressState[]
}

interface MatchState {
  player1Holes: number  // Holes won by player 1
  player2Holes: number  // Holes won by player 2
  status: 'in-progress' | 'player1-wins' | 'player2-wins' | 'all-square'
  holesPlayed: number
}

interface PressState {
  id: string
  startHole: number
  segment: 'front' | 'back' | 'overall'
  triggeredBy: string  // Player who triggered (was down)
  player1Holes: number
  player2Holes: number
  status: 'in-progress' | 'player1-wins' | 'player2-wins' | 'all-square'
}

interface NassauResult {
  frontNine: SegmentResult
  backNine: SegmentResult
  overall: SegmentResult
  presses: PressResult[]
  totalPlayer1Owes: number
  totalPlayer2Owes: number
  netSettlement: number  // Positive = Player 2 owes Player 1
}

interface SegmentResult {
  winner: 'player1' | 'player2' | 'tie'
  margin: number  // Holes up
  amount: number
}

interface PressResult {
  id: string
  segment: 'front' | 'back' | 'overall'
  startHole: number
  winner: 'player1' | 'player2' | 'tie'
  amount: number
}

// ============================================
// NASSAU CALCULATOR
// ============================================

export class NassauCalculator {
  private scores: Score[]
  private player1Id: string
  private player2Id: string
  private config: NassauConfig
  private bet: Bet

  constructor(
    scores: Score[],
    player1Id: string,
    player2Id: string,
    bet: Bet
  ) {
    this.scores = scores
    this.player1Id = player1Id
    this.player2Id = player2Id
    this.bet = bet
    this.config = bet.nassauConfig || {
      frontAmount: bet.unitValue,
      backAmount: bet.unitValue,
      overallAmount: bet.unitValue,
      autoPress: true,
      pressTrigger: 2,
      maxPresses: 4,
    }
  }

  /**
   * Calculate full Nassau result
   */
  calculate(): NassauResult {
    const state = this.buildState()
    
    // Calculate segment results
    const frontNine = this.calculateSegmentResult(state.frontNine, this.config.frontAmount)
    const backNine = this.calculateSegmentResult(state.backNine, this.config.backAmount)
    const overall = this.calculateSegmentResult(state.overall, this.config.overallAmount)
    
    // Calculate press results
    const presses = state.presses.map(press => this.calculatePressResult(press))
    
    // Calculate totals
    let totalPlayer1Owes = 0
    let totalPlayer2Owes = 0
    
    // Main bets
    if (frontNine.winner === 'player2') totalPlayer1Owes += frontNine.amount
    else if (frontNine.winner === 'player1') totalPlayer2Owes += frontNine.amount
    
    if (backNine.winner === 'player2') totalPlayer1Owes += backNine.amount
    else if (backNine.winner === 'player1') totalPlayer2Owes += backNine.amount
    
    if (overall.winner === 'player2') totalPlayer1Owes += overall.amount
    else if (overall.winner === 'player1') totalPlayer2Owes += overall.amount
    
    // Presses
    for (const press of presses) {
      if (press.winner === 'player2') totalPlayer1Owes += press.amount
      else if (press.winner === 'player1') totalPlayer2Owes += press.amount
    }
    
    return {
      frontNine,
      backNine,
      overall,
      presses,
      totalPlayer1Owes,
      totalPlayer2Owes,
      netSettlement: totalPlayer2Owes - totalPlayer1Owes,
    }
  }

  /**
   * Build current state from scores
   */
  private buildState(): NassauState {
    const state: NassauState = {
      frontNine: { player1Holes: 0, player2Holes: 0, status: 'in-progress', holesPlayed: 0 },
      backNine: { player1Holes: 0, player2Holes: 0, status: 'in-progress', holesPlayed: 0 },
      overall: { player1Holes: 0, player2Holes: 0, status: 'in-progress', holesPlayed: 0 },
      presses: [],
    }
    
    let pressCounter = 0
    
    // Process each hole
    for (const hole of [...FRONT_NINE, ...BACK_NINE]) {
      const p1Score = getHoleScore(this.scores, this.player1Id, hole)
      const p2Score = getHoleScore(this.scores, this.player2Id, hole)
      
      if (p1Score === null || p2Score === null) continue // Hole not played yet
      
      const result = compareHoleScores(p1Score, p2Score)
      const isFrontNine = hole <= 9
      
      // Update segment
      const segment = isFrontNine ? state.frontNine : state.backNine
      segment.holesPlayed++
      if (result === 1) segment.player1Holes++
      else if (result === -1) segment.player2Holes++
      
      // Update overall
      state.overall.holesPlayed++
      if (result === 1) state.overall.player1Holes++
      else if (result === -1) state.overall.player2Holes++
      
      // Check for auto-press
      if (this.config.autoPress && state.presses.length < this.config.maxPresses) {
        const holesDiff = Math.abs(segment.player1Holes - segment.player2Holes)
        const shouldPress = holesDiff >= this.config.pressTrigger
        
        // Check if we need a new press
        const lastPressForSegment = state.presses
          .filter(p => p.segment === (isFrontNine ? 'front' : 'back'))
          .pop()
        
        if (shouldPress && (!lastPressForSegment || this.getPressHolesDiff(lastPressForSegment) >= this.config.pressTrigger)) {
          const triggeredBy = segment.player1Holes > segment.player2Holes 
            ? this.player2Id 
            : this.player1Id
          
          state.presses.push({
            id: `press-${++pressCounter}`,
            startHole: hole + 1, // Press starts on next hole
            segment: isFrontNine ? 'front' : 'back',
            triggeredBy,
            player1Holes: 0,
            player2Holes: 0,
            status: 'in-progress',
          })
        }
      }
      
      // Update active presses
      for (const press of state.presses) {
        if (hole >= press.startHole) {
          if (result === 1) press.player1Holes++
          else if (result === -1) press.player2Holes++
        }
      }
    }
    
    // Determine final statuses
    this.updateMatchStatus(state.frontNine, 9)
    this.updateMatchStatus(state.backNine, 9)
    this.updateMatchStatus(state.overall, 18)
    
    for (const press of state.presses) {
      const maxHoles = press.segment === 'overall' ? 18 - press.startHole + 1 : 9 - (press.startHole % 10) + 1
      this.updatePressStatus(press, maxHoles)
    }
    
    return state
  }

  private getPressHolesDiff(press: PressState): number {
    return Math.abs(press.player1Holes - press.player2Holes)
  }

  private updateMatchStatus(match: MatchState, totalHoles: number): void {
    if (match.holesPlayed < totalHoles) {
      match.status = 'in-progress'
      return
    }
    
    if (match.player1Holes > match.player2Holes) {
      match.status = 'player1-wins'
    } else if (match.player2Holes > match.player1Holes) {
      match.status = 'player2-wins'
    } else {
      match.status = 'all-square'
    }
  }

  private updatePressStatus(press: PressState, maxHoles: number): void {
    const holesPlayed = press.player1Holes + press.player2Holes
    // This is simplified - actual tracking would be more complex
    press.status = press.player1Holes > press.player2Holes ? 'player1-wins' :
                   press.player2Holes > press.player1Holes ? 'player2-wins' :
                   'all-square'
  }

  private calculateSegmentResult(match: MatchState, amount: number): SegmentResult {
    if (match.status === 'player1-wins') {
      return {
        winner: 'player1',
        margin: match.player1Holes - match.player2Holes,
        amount,
      }
    }
    if (match.status === 'player2-wins') {
      return {
        winner: 'player2',
        margin: match.player2Holes - match.player1Holes,
        amount,
      }
    }
    return {
      winner: 'tie',
      margin: 0,
      amount: 0,
    }
  }

  private calculatePressResult(press: PressState): PressResult {
    const amount = this.config.frontAmount // Presses usually match the main bet
    
    let winner: 'player1' | 'player2' | 'tie' = 'tie'
    if (press.player1Holes > press.player2Holes) winner = 'player1'
    else if (press.player2Holes > press.player1Holes) winner = 'player2'
    
    return {
      id: press.id,
      segment: press.segment,
      startHole: press.startHole,
      winner,
      amount: winner === 'tie' ? 0 : amount,
    }
  }

  /**
   * Generate ledger entries from result
   */
  generateLedgerEntries(): LedgerEntryCreateData[] {
    const result = this.calculate()
    const entries: LedgerEntryCreateData[] = []
    
    // Only create entry if there's a net difference
    if (result.netSettlement === 0) return entries
    
    const fromUserId = result.netSettlement > 0 ? this.player2Id : this.player1Id
    const toUserId = result.netSettlement > 0 ? this.player1Id : this.player2Id
    const amount = Math.abs(result.netSettlement)
    
    entries.push({
      fromUserId,
      toUserId,
      amount,
      betType: 'nassau',
      betId: this.bet.id,
      description: this.buildDescription(result),
    })
    
    return entries
  }

  private buildDescription(result: NassauResult): string {
    const parts: string[] = []
    
    if (result.frontNine.winner !== 'tie') {
      parts.push(`Front: ${result.frontNine.winner === 'player1' ? 'W' : 'L'}`)
    }
    if (result.backNine.winner !== 'tie') {
      parts.push(`Back: ${result.backNine.winner === 'player1' ? 'W' : 'L'}`)
    }
    if (result.overall.winner !== 'tie') {
      parts.push(`Overall: ${result.overall.winner === 'player1' ? 'W' : 'L'}`)
    }
    if (result.presses.length > 0) {
      const pressWins = result.presses.filter(p => p.winner !== 'tie').length
      if (pressWins > 0) {
        parts.push(`${pressWins} press${pressWins !== 1 ? 'es' : ''}`)
      }
    }
    
    return `Nassau: ${parts.join(', ')}`
  }
}

// ============================================
// CONVENIENCE FUNCTION
// ============================================

export function calculateNassau(
  scores: Score[],
  player1Id: string,
  player2Id: string,
  bet: Bet
): NassauResult {
  const calculator = new NassauCalculator(scores, player1Id, player2Id, bet)
  return calculator.calculate()
}

export function generateNassauLedgerEntries(
  scores: Score[],
  player1Id: string,
  player2Id: string,
  bet: Bet
): LedgerEntryCreateData[] {
  const calculator = new NassauCalculator(scores, player1Id, player2Id, bet)
  return calculator.generateLedgerEntries()
}
```

---

### Phase 3: Skins Calculation

#### 3.1 — Skins Calculator

**File: `src/lib/betting/skins.ts`**
```typescript
import type { Score, Bet, SkinsConfig, LedgerEntryCreateData } from '@/types'
import { ALL_HOLES, HoleNumber } from './constants'
import { getHoleScore, getHoleWinner } from './scoreUtils'

// ============================================
// TYPES
// ============================================

interface SkinResult {
  holeNumber: number
  winner: string | null  // participantId or null if carryover
  value: number          // Total value (including carryovers)
  carryover: boolean     // Whether this was from a carryover
}

interface SkinsResult {
  skins: SkinResult[]
  standings: Map<string, number>  // participantId -> total won
  totalPot: number
  holesWithCarryover: number[]
}

// ============================================
// SKINS CALCULATOR
// ============================================

export class SkinsCalculator {
  private scores: Score[]
  private participantIds: string[]
  private config: SkinsConfig
  private bet: Bet
  private holes: number

  constructor(
    scores: Score[],
    participantIds: string[],
    bet: Bet,
    holes: 9 | 18 = 18
  ) {
    this.scores = scores
    this.participantIds = participantIds
    this.bet = bet
    this.holes = holes
    this.config = bet.skinsConfig || {
      skinValue: bet.unitValue,
      carryover: true,
      validation: false,
    }
  }

  /**
   * Calculate skins results
   */
  calculate(): SkinsResult {
    const skins: SkinResult[] = []
    const standings = new Map<string, number>()
    const holesWithCarryover: number[] = []
    
    // Initialize standings
    for (const participantId of this.participantIds) {
      standings.set(participantId, 0)
    }
    
    let carryoverValue = 0
    const holesToProcess = this.holes === 9 ? ALL_HOLES.slice(0, 9) : ALL_HOLES
    
    for (const holeNumber of holesToProcess) {
      const currentValue = this.config.skinValue + carryoverValue
      const winner = getHoleWinner(this.scores, this.participantIds, holeNumber)
      
      if (winner === null) {
        // Tie or incomplete - carryover
        if (this.config.carryover) {
          carryoverValue += this.config.skinValue
          holesWithCarryover.push(holeNumber)
          
          skins.push({
            holeNumber,
            winner: null,
            value: 0,
            carryover: true,
          })
        } else {
          // No carryover - skin is lost
          skins.push({
            holeNumber,
            winner: null,
            value: 0,
            carryover: false,
          })
        }
      } else {
        // We have a winner
        skins.push({
          holeNumber,
          winner,
          value: currentValue,
          carryover: carryoverValue > 0,
        })
        
        // Update standings
        const currentWinnings = standings.get(winner) || 0
        standings.set(winner, currentWinnings + currentValue)
        
        // Reset carryover
        carryoverValue = 0
      }
    }
    
    // Calculate total pot
    const totalPot = Array.from(standings.values()).reduce((sum, val) => sum + val, 0)
    
    return {
      skins,
      standings,
      totalPot,
      holesWithCarryover,
    }
  }

  /**
   * Generate ledger entries from result
   * 
   * For skins, each player puts in equal amount, winners take from the pot.
   * Net settlement is: winnings - (skinValue * holes)
   */
  generateLedgerEntries(): LedgerEntryCreateData[] {
    const result = this.calculate()
    const entries: LedgerEntryCreateData[] = []
    
    // Calculate each player's buy-in
    const buyIn = this.config.skinValue * this.holes
    
    // Calculate net position for each player
    const netPositions = new Map<string, number>()
    
    for (const participantId of this.participantIds) {
      const winnings = result.standings.get(participantId) || 0
      const net = winnings - buyIn
      netPositions.set(participantId, net)
    }
    
    // Generate entries: players with negative net pay those with positive net
    const losers = Array.from(netPositions.entries())
      .filter(([_, net]) => net < 0)
      .sort((a, b) => a[1] - b[1]) // Most negative first
    
    const winners = Array.from(netPositions.entries())
      .filter(([_, net]) => net > 0)
      .sort((a, b) => b[1] - a[1]) // Most positive first
    
    // Match losers to winners
    let loserIdx = 0
    let winnerIdx = 0
    let loserRemaining = losers[0] ? Math.abs(losers[0][1]) : 0
    let winnerRemaining = winners[0] ? winners[0][1] : 0
    
    while (loserIdx < losers.length && winnerIdx < winners.length) {
      const amount = Math.min(loserRemaining, winnerRemaining)
      
      if (amount > 0) {
        entries.push({
          fromUserId: losers[loserIdx][0],
          toUserId: winners[winnerIdx][0],
          amount,
          betType: 'skins',
          betId: this.bet.id,
          description: `Skins: ${this.getSkinsDescription(result, winners[winnerIdx][0])}`,
        })
      }
      
      loserRemaining -= amount
      winnerRemaining -= amount
      
      if (loserRemaining <= 0) {
        loserIdx++
        loserRemaining = losers[loserIdx] ? Math.abs(losers[loserIdx][1]) : 0
      }
      
      if (winnerRemaining <= 0) {
        winnerIdx++
        winnerRemaining = winners[winnerIdx] ? winners[winnerIdx][1] : 0
      }
    }
    
    return entries
  }

  private getSkinsDescription(result: SkinsResult, winnerId: string): string {
    const skinsWon = result.skins.filter(s => s.winner === winnerId).length
    const total = result.standings.get(winnerId) || 0
    return `${skinsWon} skin${skinsWon !== 1 ? 's' : ''} won ($${total})`
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

export function calculateSkins(
  scores: Score[],
  participantIds: string[],
  bet: Bet,
  holes: 9 | 18 = 18
): SkinsResult {
  const calculator = new SkinsCalculator(scores, participantIds, bet, holes)
  return calculator.calculate()
}

export function generateSkinsLedgerEntries(
  scores: Score[],
  participantIds: string[],
  bet: Bet,
  holes: 9 | 18 = 18
): LedgerEntryCreateData[] {
  const calculator = new SkinsCalculator(scores, participantIds, bet, holes)
  return calculator.generateLedgerEntries()
}

/**
 * Get current skin status for a hole (for live display)
 */
export function getCurrentSkinStatus(
  scores: Score[],
  participantIds: string[],
  holeNumber: number,
  skinValue: number,
  carryover: boolean = true
): {
  winner: string | null
  value: number
  isCarryover: boolean
} {
  const winner = getHoleWinner(scores, participantIds, holeNumber)
  
  if (winner === null && !carryover) {
    return { winner: null, value: 0, isCarryover: false }
  }
  
  // Calculate carryover value
  let carryoverValue = 0
  for (let h = 1; h < holeNumber; h++) {
    const holeWinner = getHoleWinner(scores, participantIds, h)
    if (holeWinner === null) {
      carryoverValue += skinValue
    } else {
      carryoverValue = 0 // Reset on any win
    }
  }
  
  return {
    winner,
    value: skinValue + carryoverValue,
    isCarryover: carryoverValue > 0,
  }
}
```

---

### Phase 4: Ledger Generation

#### 4.1 — Match Settler

**File: `src/lib/betting/matchSettler.ts`**
```typescript
import type { Match, Bet, Score, Participant, LedgerEntryCreateData } from '@/types'
import { generateNassauLedgerEntries } from './nassau'
import { generateSkinsLedgerEntries } from './skins'

// ============================================
// TYPES
// ============================================

interface SettlementResult {
  entries: LedgerEntryCreateData[]
  summary: SettlementSummary
  errors: string[]
}

interface SettlementSummary {
  totalBets: number
  totalAmount: number
  participantBalances: Map<string, number>  // Net balance per participant
}

// ============================================
// MATCH SETTLER
// ============================================

export class MatchSettler {
  private match: Match
  private bets: Bet[]
  private scores: Score[]
  private participants: Participant[]

  constructor(
    match: Match,
    bets: Bet[],
    scores: Score[],
    participants: Participant[]
  ) {
    this.match = match
    this.bets = bets
    this.scores = scores
    this.participants = participants
  }

  /**
   * Generate all ledger entries for a completed match
   */
  settle(): SettlementResult {
    const entries: LedgerEntryCreateData[] = []
    const errors: string[] = []
    
    // Validate match is complete
    if (this.match.status !== 'completed') {
      errors.push('Match is not completed')
      return { entries, summary: this.createEmptySummary(), errors }
    }
    
    // Validate we have enough scores
    const expectedScores = this.participants.length * this.match.holes
    if (this.scores.length < expectedScores) {
      errors.push(`Incomplete scores: ${this.scores.length}/${expectedScores}`)
      // Continue anyway for partial settlement
    }
    
    const participantIds = this.participants.map(p => p.userId)
    
    // Process each bet
    for (const bet of this.bets) {
      try {
        const betEntries = this.settleBet(bet, participantIds)
        entries.push(...betEntries)
      } catch (error) {
        errors.push(`Error settling ${bet.type}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    // Calculate summary
    const summary = this.calculateSummary(entries)
    
    return { entries, summary, errors }
  }

  /**
   * Settle a single bet
   */
  private settleBet(bet: Bet, participantIds: string[]): LedgerEntryCreateData[] {
    switch (bet.type) {
      case 'nassau':
        return this.settleNassau(bet, participantIds)
      case 'skins':
        return this.settleSkins(bet, participantIds)
      case 'match_play':
        return this.settleMatchPlay(bet, participantIds)
      case 'stroke_play':
        return this.settleStrokePlay(bet, participantIds)
      default:
        throw new Error(`Unknown bet type: ${bet.type}`)
    }
  }

  /**
   * Settle Nassau bet
   */
  private settleNassau(bet: Bet, participantIds: string[]): LedgerEntryCreateData[] {
    // Nassau is typically 2-player
    if (participantIds.length !== 2) {
      // For >2 players, create pairwise Nassau bets
      // For MVP, just handle 2 players
      throw new Error('Nassau requires exactly 2 players for MVP')
    }
    
    return generateNassauLedgerEntries(
      this.scores,
      participantIds[0],
      participantIds[1],
      bet
    )
  }

  /**
   * Settle Skins bet
   */
  private settleSkins(bet: Bet, participantIds: string[]): LedgerEntryCreateData[] {
    return generateSkinsLedgerEntries(
      this.scores,
      participantIds,
      bet,
      this.match.holes
    )
  }

  /**
   * Settle Match Play bet (simplified - full implementation similar to Nassau)
   */
  private settleMatchPlay(bet: Bet, participantIds: string[]): LedgerEntryCreateData[] {
    // For MVP, treat as simple overall winner
    if (participantIds.length !== 2) {
      throw new Error('Match Play requires exactly 2 players for MVP')
    }
    
    const p1Total = this.getPlayerTotal(participantIds[0])
    const p2Total = this.getPlayerTotal(participantIds[1])
    
    if (p1Total === null || p2Total === null) {
      return [] // Incomplete
    }
    
    if (p1Total === p2Total) {
      return [] // Tie
    }
    
    const winnerId = p1Total < p2Total ? participantIds[0] : participantIds[1]
    const loserId = p1Total < p2Total ? participantIds[1] : participantIds[0]
    
    return [{
      fromUserId: loserId,
      toUserId: winnerId,
      amount: bet.unitValue,
      betType: 'match_play',
      betId: bet.id,
      description: `Match Play: ${Math.abs(p1Total - p2Total)} stroke${Math.abs(p1Total - p2Total) !== 1 ? 's' : ''}`,
    }]
  }

  /**
   * Settle Stroke Play bet (lowest total wins)
   */
  private settleStrokePlay(bet: Bet, participantIds: string[]): LedgerEntryCreateData[] {
    // Calculate totals
    const totals: { participantId: string; total: number }[] = []
    
    for (const participantId of participantIds) {
      const total = this.getPlayerTotal(participantId)
      if (total === null) continue
      totals.push({ participantId, total })
    }
    
    if (totals.length < 2) return [] // Not enough scores
    
    // Sort by total (lowest first)
    totals.sort((a, b) => a.total - b.total)
    
    // Winner takes from all losers
    const winner = totals[0]
    const entries: LedgerEntryCreateData[] = []
    
    for (let i = 1; i < totals.length; i++) {
      entries.push({
        fromUserId: totals[i].participantId,
        toUserId: winner.participantId,
        amount: bet.unitValue,
        betType: 'stroke_play',
        betId: bet.id,
        description: `Stroke Play: Lost by ${totals[i].total - winner.total}`,
      })
    }
    
    return entries
  }

  /**
   * Get total strokes for a player
   */
  private getPlayerTotal(participantId: string): number | null {
    let total = 0
    
    for (let hole = 1; hole <= this.match.holes; hole++) {
      const score = this.scores.find(
        s => s.participantId === participantId && s.holeNumber === hole
      )
      if (!score) return null
      total += score.strokes
    }
    
    return total
  }

  /**
   * Calculate settlement summary
   */
  private calculateSummary(entries: LedgerEntryCreateData[]): SettlementSummary {
    const participantBalances = new Map<string, number>()
    let totalAmount = 0
    
    // Initialize balances
    for (const participant of this.participants) {
      participantBalances.set(participant.userId, 0)
    }
    
    // Process entries
    for (const entry of entries) {
      totalAmount += entry.amount
      
      // From user owes, so decrease their balance
      const fromBalance = participantBalances.get(entry.fromUserId) || 0
      participantBalances.set(entry.fromUserId, fromBalance - entry.amount)
      
      // To user is owed, so increase their balance
      const toBalance = participantBalances.get(entry.toUserId) || 0
      participantBalances.set(entry.toUserId, toBalance + entry.amount)
    }
    
    return {
      totalBets: this.bets.length,
      totalAmount,
      participantBalances,
    }
  }

  private createEmptySummary(): SettlementSummary {
    return {
      totalBets: 0,
      totalAmount: 0,
      participantBalances: new Map(),
    }
  }
}

// ============================================
// CONVENIENCE FUNCTION
// ============================================

export function settleMatch(
  match: Match,
  bets: Bet[],
  scores: Score[],
  participants: Participant[]
): SettlementResult {
  const settler = new MatchSettler(match, bets, scores, participants)
  return settler.settle()
}
```

---

### Phase 5: Live Bet Status

#### 5.1 — Live Bet Tracker

**File: `src/lib/betting/liveBetTracker.ts`**
```typescript
import type { Score, Bet, Participant } from '@/types'
import { calculateNassau, NassauResult } from './nassau'
import { calculateSkins, SkinsResult } from './skins'
import { getHoleScore, compareHoleScores } from './scoreUtils'

// ============================================
// TYPES
// ============================================

export interface LiveBetStatus {
  nassau?: LiveNassauStatus
  skins?: LiveSkinsStatus
}

export interface LiveNassauStatus {
  frontNine: LiveMatchStatus
  backNine: LiveMatchStatus
  overall: LiveMatchStatus
  activePresses: number
  estimatedSettlement: number
}

export interface LiveMatchStatus {
  player1Up: number      // Positive = player1 up, Negative = player2 up
  holesRemaining: number
  status: 'in-progress' | 'dormie' | 'closed-out' | 'complete'
}

export interface LiveSkinsStatus {
  currentCarryover: number
  skinsWon: Map<string, number>
  totalPot: number
  lastSkinHole: number | null
  lastSkinWinner: string | null
}

// ============================================
// LIVE BET TRACKER
// ============================================

export function getLiveBetStatus(
  scores: Score[],
  participants: Participant[],
  bets: Bet[],
  holes: 9 | 18 = 18
): LiveBetStatus {
  const status: LiveBetStatus = {}
  const participantIds = participants.map(p => p.userId)
  
  for (const bet of bets) {
    switch (bet.type) {
      case 'nassau':
        if (participantIds.length === 2) {
          status.nassau = getLiveNassauStatus(
            scores,
            participantIds[0],
            participantIds[1],
            bet,
            holes
          )
        }
        break
        
      case 'skins':
        status.skins = getLiveSkinsStatus(
          scores,
          participantIds,
          bet,
          holes
        )
        break
    }
  }
  
  return status
}

/**
 * Get live Nassau status
 */
function getLiveNassauStatus(
  scores: Score[],
  player1Id: string,
  player2Id: string,
  bet: Bet,
  holes: 9 | 18
): LiveNassauStatus {
  const result = calculateNassau(scores, player1Id, player2Id, bet)
  
  // Calculate current standings
  const frontUp = countHolesUp(scores, player1Id, player2Id, 1, 9)
  const backUp = countHolesUp(scores, player1Id, player2Id, 10, 18)
  const overallUp = frontUp + backUp
  
  // Calculate holes remaining
  const frontRemaining = 9 - countHolesPlayed(scores, player1Id, player2Id, 1, 9)
  const backRemaining = holes === 18 ? 9 - countHolesPlayed(scores, player1Id, player2Id, 10, 18) : 0
  const overallRemaining = frontRemaining + backRemaining
  
  return {
    frontNine: {
      player1Up: frontUp,
      holesRemaining: frontRemaining,
      status: getMatchStatus(frontUp, frontRemaining),
    },
    backNine: {
      player1Up: backUp,
      holesRemaining: backRemaining,
      status: getMatchStatus(backUp, backRemaining),
    },
    overall: {
      player1Up: overallUp,
      holesRemaining: overallRemaining,
      status: getMatchStatus(overallUp, overallRemaining),
    },
    activePresses: result.presses.filter(p => p.winner === 'tie').length,
    estimatedSettlement: result.netSettlement,
  }
}

/**
 * Get live Skins status
 */
function getLiveSkinsStatus(
  scores: Score[],
  participantIds: string[],
  bet: Bet,
  holes: 9 | 18
): LiveSkinsStatus {
  const result = calculateSkins(scores, participantIds, bet, holes)
  
  // Find current carryover
  let currentCarryover = 0
  let lastSkinHole: number | null = null
  let lastSkinWinner: string | null = null
  
  for (const skin of result.skins) {
    if (skin.winner !== null) {
      currentCarryover = 0
      lastSkinHole = skin.holeNumber
      lastSkinWinner = skin.winner
    } else if (skin.carryover) {
      currentCarryover += bet.skinsConfig?.skinValue || bet.unitValue
    }
  }
  
  return {
    currentCarryover,
    skinsWon: result.standings,
    totalPot: result.totalPot,
    lastSkinHole,
    lastSkinWinner,
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function countHolesUp(
  scores: Score[],
  player1Id: string,
  player2Id: string,
  startHole: number,
  endHole: number
): number {
  let up = 0
  
  for (let hole = startHole; hole <= endHole; hole++) {
    const p1Score = getHoleScore(scores, player1Id, hole)
    const p2Score = getHoleScore(scores, player2Id, hole)
    
    if (p1Score !== null && p2Score !== null) {
      up += compareHoleScores(p1Score, p2Score)
    }
  }
  
  return up
}

function countHolesPlayed(
  scores: Score[],
  player1Id: string,
  player2Id: string,
  startHole: number,
  endHole: number
): number {
  let count = 0
  
  for (let hole = startHole; hole <= endHole; hole++) {
    const p1Score = getHoleScore(scores, player1Id, hole)
    const p2Score = getHoleScore(scores, player2Id, hole)
    
    if (p1Score !== null && p2Score !== null) {
      count++
    }
  }
  
  return count
}

function getMatchStatus(
  holesUp: number,
  holesRemaining: number
): 'in-progress' | 'dormie' | 'closed-out' | 'complete' {
  if (holesRemaining === 0) return 'complete'
  
  const absUp = Math.abs(holesUp)
  
  // Closed out: leading by more holes than remaining
  if (absUp > holesRemaining) return 'closed-out'
  
  // Dormie: leading by exactly holes remaining
  if (absUp === holesRemaining && absUp > 0) return 'dormie'
  
  return 'in-progress'
}
```

---

### Phase 6: Betting Hooks

#### 6.1 — useBetStatus Hook

**File: `src/hooks/useBetStatus.ts`**
```typescript
'use client'

import { useState, useEffect, useMemo } from 'react'
import type { Score, Bet, Participant } from '@/types'
import { getLiveBetStatus, LiveBetStatus } from '@/lib/betting/liveBetTracker'

interface UseBetStatusReturn {
  status: LiveBetStatus | null
  loading: boolean
  error: Error | null
}

export function useBetStatus(
  scores: Score[],
  participants: Participant[],
  bets: Bet[],
  holes: 9 | 18 = 18
): UseBetStatusReturn {
  const [status, setStatus] = useState<LiveBetStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Recalculate when scores change
  const scoresKey = useMemo(() => {
    return scores.map(s => `${s.participantId}-${s.holeNumber}-${s.strokes}`).join('|')
  }, [scores])

  useEffect(() => {
    if (bets.length === 0 || participants.length < 2) {
      setStatus(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const newStatus = getLiveBetStatus(scores, participants, bets, holes)
      setStatus(newStatus)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to calculate bet status'))
    } finally {
      setLoading(false)
    }
  }, [scoresKey, participants, bets, holes])

  return { status, loading, error }
}
```

#### 6.2 — useSettlement Hook

**File: `src/hooks/useSettlement.ts`**
```typescript
'use client'

import { useState, useCallback } from 'react'
import type { Match, Bet, Score, Participant, LedgerEntryCreateData } from '@/types'
import { settleMatch, SettlementResult } from '@/lib/betting/matchSettler'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase'

interface UseSettlementReturn {
  result: SettlementResult | null
  loading: boolean
  error: Error | null
  settle: () => Promise<void>
  submitToLedger: () => Promise<boolean>
}

export function useSettlement(
  match: Match | null,
  bets: Bet[],
  scores: Score[],
  participants: Participant[]
): UseSettlementReturn {
  const [result, setResult] = useState<SettlementResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const settle = useCallback(async () => {
    if (!match) {
      setError(new Error('No match provided'))
      return
    }

    setLoading(true)
    setError(null)

    try {
      const settlementResult = settleMatch(match, bets, scores, participants)
      setResult(settlementResult)
      
      if (settlementResult.errors.length > 0) {
        console.warn('Settlement warnings:', settlementResult.errors)
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to settle match'))
    } finally {
      setLoading(false)
    }
  }, [match, bets, scores, participants])

  const submitToLedger = useCallback(async (): Promise<boolean> => {
    if (!match || !result || result.entries.length === 0) {
      return false
    }

    setLoading(true)
    setError(null)

    try {
      // Call Cloud Function to create ledger entries
      const createLedgerEntries = httpsCallable(functions, 'createLedgerEntries')
      await createLedgerEntries({
        matchId: match.id,
        entries: result.entries,
      })
      
      return true
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to submit to ledger'))
      return false
    } finally {
      setLoading(false)
    }
  }, [match, result])

  return {
    result,
    loading,
    error,
    settle,
    submitToLedger,
  }
}
```

---

### Phase 7: Export All Betting Functions

**File: `src/lib/betting/index.ts`**
```typescript
// Constants
export * from './constants'

// Score utilities
export * from './scoreUtils'

// Nassau
export { 
  NassauCalculator, 
  calculateNassau, 
  generateNassauLedgerEntries 
} from './nassau'

// Skins
export { 
  SkinsCalculator, 
  calculateSkins, 
  generateSkinsLedgerEntries,
  getCurrentSkinStatus 
} from './skins'

// Match Settler
export { MatchSettler, settleMatch } from './matchSettler'

// Live Status
export { getLiveBetStatus } from './liveBetTracker'
export type { LiveBetStatus, LiveNassauStatus, LiveSkinsStatus } from './liveBetTracker'
```

---

## ⚠️ RULES FOR THIS ROLE

1. **DO NOT** modify UI components — Frontend Engineer's job
2. **DO NOT** modify data access patterns — Backend Engineer's job
3. **DO NOT** modify security rules — Security Engineer's job
4. **DO** ensure calculations match traditional golf betting rules
5. **DO** handle all edge cases (ties, incomplete rounds, etc.)
6. **DO** provide clear settlement descriptions
7. **DO** write comprehensive tests

---

## 📤 HANDOFF CHECKLIST

Before declaring complete, verify ALL:

### Calculations
- [ ] Nassau front 9 calculates correctly
- [ ] Nassau back 9 calculates correctly
- [ ] Nassau overall calculates correctly
- [ ] Auto-press triggers at correct threshold
- [ ] Maximum presses enforced
- [ ] Skins with carryover works
- [ ] Skins without carryover works
- [ ] Ties handled correctly

### Ledger Generation
- [ ] Correct from/to user assignment
- [ ] Correct amounts calculated
- [ ] Meaningful descriptions generated
- [ ] Multiple bets combine correctly

### Live Status
- [ ] Holes up/down accurate
- [ ] Dormie detection works
- [ ] Closed-out detection works
- [ ] Carryover tracking accurate

### Code Quality
- [ ] `npm run lint` passes
- [ ] `npm run typecheck` passes
- [ ] `npm run build` passes
- [ ] Unit tests written and passing

---

## 📝 PR TEMPLATE

**Title:** `[BETTING] Nassau, Skins, and settlement calculations`

**Body:**
```markdown
## Summary
Complete betting calculation engine for Nassau and Skins.

## Added
- Nassau calculator with auto-press support
- Skins calculator with carryover support
- Match settler for generating ledger entries
- Live bet status tracker
- useBetStatus and useSettlement hooks

## Betting Rules Implemented
- [x] Nassau: Front/Back/Overall
- [x] Nassau: Auto-press at N down
- [x] Nassau: Max presses limit
- [x] Skins: Winner takes pot
- [x] Skins: Carryover on ties
- [x] Skins: Multiple player support

## Testing
- [x] Unit tests for all calculators
- [x] Edge cases tested (ties, incomplete, etc.)
- [x] Manual verification against known scenarios

## Next Steps
→ Integration testing with full app flow
→ User acceptance testing
```

---

## 🚀 START NOW

1. Verify Backend Engineer work is complete
2. Study golf betting rules thoroughly
3. Implement score utilities first
4. Build Nassau calculator with tests
5. Build Skins calculator with tests
6. Implement match settler
7. Add live tracking
8. Complete handoff checklist
9. Create PR

**Correct math is non-negotiable. Test every calculation against manual examples.**
