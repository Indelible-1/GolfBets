import {
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import type { Season, SeasonPeriod, SeasonStanding } from '@/types'
import { seasonsCollection, seasonDoc } from '@/lib/firestore/collections'

// ============ CREATE ============

export async function createSeason(
  groupId: string,
  period: SeasonPeriod,
  referenceDate: Date = new Date()
): Promise<string> {
  const { start, end, name } = getSeasonDates(period, referenceDate)

  const seasonRef = seasonDoc(crypto.randomUUID())

  const season: Season = {
    id: seasonRef.id,
    groupId,
    name,
    period,
    startDate: start,
    endDate: end,
    status: 'active',
    standings: [],
  }

  await setDoc(seasonRef, season)

  return seasonRef.id
}

// ============ READ ============

export async function getSeason(seasonId: string): Promise<Season | null> {
  const docRef = seasonDoc(seasonId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  return docSnap.data()
}

export async function getGroupSeasons(groupId: string): Promise<Season[]> {
  const q = query(
    seasonsCollection(),
    where('groupId', '==', groupId),
    orderBy('startDate', 'desc')
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => doc.data())
}

export async function getActiveGroupSeason(groupId: string): Promise<Season | null> {
  const q = query(
    seasonsCollection(),
    where('groupId', '==', groupId),
    where('status', '==', 'active'),
    limit(1)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  return snapshot.docs[0].data()
}

export async function getOrCreateCurrentSeason(
  groupId: string,
  period: SeasonPeriod = 'monthly'
): Promise<Season> {
  const activeSeason = await getActiveGroupSeason(groupId)

  if (activeSeason) {
    // Check if the active season is still current
    const now = new Date()
    if (now >= activeSeason.startDate && now <= activeSeason.endDate) {
      return activeSeason
    }

    // Mark old season as completed
    await completeSeason(activeSeason.id)
  }

  // Create new season
  const seasonId = await createSeason(groupId, period)
  const newSeason = await getSeason(seasonId)

  if (!newSeason) {
    throw new Error('Failed to create season')
  }

  return newSeason
}

// ============ UPDATE ============

export async function updateSeasonStandings(
  seasonId: string,
  standings: SeasonStanding[]
): Promise<void> {
  const docRef = seasonDoc(seasonId)
  await updateDoc(docRef, {
    standings,
  })
}

export async function completeSeason(seasonId: string): Promise<void> {
  const docRef = seasonDoc(seasonId)
  await updateDoc(docRef, {
    status: 'completed',
  })
}

// ============ HELPERS ============

export function getSeasonDates(
  period: SeasonPeriod,
  referenceDate: Date = new Date()
): { start: Date; end: Date; name: string } {
  const year = referenceDate.getFullYear()
  const month = referenceDate.getMonth()

  switch (period) {
    case 'monthly': {
      const start = new Date(year, month, 1, 0, 0, 0, 0)
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
      const name = start.toLocaleString('default', { month: 'long', year: 'numeric' })
      return { start, end, name }
    }
    case 'quarterly': {
      const quarter = Math.floor(month / 3)
      const start = new Date(year, quarter * 3, 1, 0, 0, 0, 0)
      const end = new Date(year, quarter * 3 + 3, 0, 23, 59, 59, 999)
      const name = `Q${quarter + 1} ${year}`
      return { start, end, name }
    }
    case 'yearly': {
      const start = new Date(year, 0, 1, 0, 0, 0, 0)
      const end = new Date(year, 11, 31, 23, 59, 59, 999)
      const name = year.toString()
      return { start, end, name }
    }
    case 'custom': {
      // For custom, just use monthly as default
      const start = new Date(year, month, 1, 0, 0, 0, 0)
      const end = new Date(year, month + 1, 0, 23, 59, 59, 999)
      const name = `Custom Season`
      return { start, end, name }
    }
  }
}

export function isSeasonActive(season: Season): boolean {
  const now = new Date()
  return season.status === 'active' && now >= season.startDate && now <= season.endDate
}

export function getSeasonProgress(season: Season): number {
  const now = new Date()
  const total = season.endDate.getTime() - season.startDate.getTime()
  const elapsed = now.getTime() - season.startDate.getTime()

  return Math.min(100, Math.max(0, (elapsed / total) * 100))
}
