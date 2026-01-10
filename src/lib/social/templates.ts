import {
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from 'firebase/firestore'
import type { BetTemplate, Bet } from '@/types'
import { betTemplatesCollection, betTemplateDoc } from '@/lib/firestore/collections'

// ============ CREATE ============

export async function createBetTemplate(
  userId: string,
  name: string,
  bets: Bet[],
  isDefault: boolean = false
): Promise<string> {
  const templateRef = betTemplateDoc(crypto.randomUUID())

  // If this is being set as default, unset other defaults
  if (isDefault) {
    await unsetDefaultTemplate(userId)
  }

  const template: BetTemplate = {
    id: templateRef.id,
    userId,
    name: name.trim(),
    bets: bets.map(cloneBetForTemplate),
    createdAt: new Date(),
    isDefault,
  }

  await setDoc(templateRef, template)

  return templateRef.id
}

// ============ READ ============

export async function getBetTemplate(templateId: string): Promise<BetTemplate | null> {
  const docRef = betTemplateDoc(templateId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  return docSnap.data()
}

export async function getUserBetTemplates(userId: string): Promise<BetTemplate[]> {
  const q = query(
    betTemplatesCollection(),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  )
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => doc.data())
}

export async function getDefaultBetTemplate(userId: string): Promise<BetTemplate | null> {
  const q = query(
    betTemplatesCollection(),
    where('userId', '==', userId),
    where('isDefault', '==', true)
  )
  const snapshot = await getDocs(q)

  if (snapshot.empty) return null

  return snapshot.docs[0].data()
}

// ============ UPDATE ============

export async function updateBetTemplateName(templateId: string, name: string): Promise<void> {
  const docRef = betTemplateDoc(templateId)
  await updateDoc(docRef, {
    name: name.trim(),
  })
}

export async function updateBetTemplateBets(templateId: string, bets: Bet[]): Promise<void> {
  const docRef = betTemplateDoc(templateId)
  await updateDoc(docRef, {
    bets: bets.map(cloneBetForTemplate),
  })
}

export async function setDefaultTemplate(userId: string, templateId: string): Promise<void> {
  // First, unset any existing default
  await unsetDefaultTemplate(userId)

  // Then set this one as default
  const docRef = betTemplateDoc(templateId)
  await updateDoc(docRef, {
    isDefault: true,
  })
}

async function unsetDefaultTemplate(userId: string): Promise<void> {
  const templates = await getUserBetTemplates(userId)
  const defaultTemplates = templates.filter((t) => t.isDefault)

  for (const template of defaultTemplates) {
    const docRef = betTemplateDoc(template.id)
    await updateDoc(docRef, {
      isDefault: false,
    })
  }
}

// ============ DELETE ============

export async function deleteBetTemplate(templateId: string): Promise<void> {
  const docRef = betTemplateDoc(templateId)
  await deleteDoc(docRef)
}

// ============ HELPERS ============

/**
 * Clone a bet for storage in a template (removes match-specific data)
 */
function cloneBetForTemplate(bet: Bet): Bet {
  return {
    id: bet.id,
    type: bet.type,
    unitValue: bet.unitValue,
    scoringMode: bet.scoringMode,
    nassauConfig: bet.nassauConfig ? { ...bet.nassauConfig } : null,
    skinsConfig: bet.skinsConfig ? { ...bet.skinsConfig } : null,
    createdAt: bet.createdAt,
    createdBy: bet.createdBy,
  }
}

/**
 * Apply a template's bets to create new bet instances
 */
export function applyBetTemplate(template: BetTemplate, createdBy: string): Bet[] {
  return template.bets.map((bet) => ({
    ...bet,
    id: crypto.randomUUID(),
    createdAt: new Date(),
    createdBy,
  }))
}

/**
 * Validate a template name
 */
export function validateTemplateName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim()

  if (trimmed.length < 2) {
    return { valid: false, error: 'Template name must be at least 2 characters' }
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Template name must be less than 50 characters' }
  }

  return { valid: true }
}

/**
 * Get a summary of the bets in a template
 */
export function getTemplateSummary(template: BetTemplate): string {
  if (template.bets.length === 0) {
    return 'No bets configured'
  }

  const betDescriptions = template.bets.map((bet) => {
    switch (bet.type) {
      case 'nassau':
        return `Nassau $${bet.unitValue}`
      case 'skins':
        return `Skins $${bet.skinsConfig?.skinValue ?? bet.unitValue}`
      case 'match_play':
        return `Match Play $${bet.unitValue}`
      case 'stroke_play':
        return `Stroke Play $${bet.unitValue}`
      default:
        return `$${bet.unitValue}`
    }
  })

  return betDescriptions.join(', ')
}

/**
 * Check if user owns the template
 */
export function isTemplateOwner(template: BetTemplate, userId: string): boolean {
  return template.userId === userId
}
