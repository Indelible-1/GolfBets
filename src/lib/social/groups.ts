import {
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore'
import type { Group, GroupSettings, GroupWithMembers, GroupMember, User } from '@/types'
import { groupsCollection, groupDoc } from '@/lib/firestore/collections'

// ============ CREATE ============

export async function createGroup(
  name: string,
  creatorId: string,
  memberIds: string[],
  settings?: Partial<GroupSettings>
): Promise<string> {
  const groupRef = groupDoc(crypto.randomUUID())

  // Ensure creator is in members
  const allMembers = Array.from(new Set([creatorId, ...memberIds]))

  const group: Group = {
    id: groupRef.id,
    name: name.trim(),
    createdBy: creatorId,
    memberIds: allMembers,
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: {
      defaultBets: settings?.defaultBets ?? [],
      defaultCourse: settings?.defaultCourse ?? null,
    },
    stats: {
      totalMatches: 0,
      lastMatchDate: null,
    },
  }

  await setDoc(groupRef, group)

  return groupRef.id
}

// ============ READ ============

export async function getGroup(groupId: string): Promise<Group | null> {
  const docRef = groupDoc(groupId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  return docSnap.data()
}

export async function getUserGroups(userId: string): Promise<Group[]> {
  const q = query(groupsCollection(), where('memberIds', 'array-contains', userId))
  const snapshot = await getDocs(q)

  return snapshot.docs.map((doc) => doc.data())
}

export async function getGroupWithMembers(
  groupId: string,
  users: Map<string, User>
): Promise<GroupWithMembers | null> {
  const group = await getGroup(groupId)
  if (!group) return null

  const members: GroupMember[] = group.memberIds.map((id) => {
    const user = users.get(id)
    return {
      id,
      displayName: user?.displayName ?? 'Unknown',
      avatarUrl: user?.avatarUrl ?? null,
      matchesPlayed: 0,
      netAmount: 0,
    }
  })

  return { ...group, members }
}

// ============ UPDATE ============

export async function updateGroupName(groupId: string, name: string): Promise<void> {
  const docRef = groupDoc(groupId)
  await updateDoc(docRef, {
    name: name.trim(),
    updatedAt: Timestamp.now(),
  })
}

export async function updateGroupSettings(
  groupId: string,
  settings: Partial<GroupSettings>
): Promise<void> {
  const docRef = groupDoc(groupId)
  const existingGroup = await getGroup(groupId)

  if (!existingGroup) {
    throw new Error('Group not found')
  }

  await updateDoc(docRef, {
    settings: {
      ...existingGroup.settings,
      ...settings,
    },
    updatedAt: Timestamp.now(),
  })
}

export async function addGroupMember(groupId: string, userId: string): Promise<void> {
  const docRef = groupDoc(groupId)
  await updateDoc(docRef, {
    memberIds: arrayUnion(userId),
    updatedAt: Timestamp.now(),
  })
}

export async function removeGroupMember(groupId: string, userId: string): Promise<void> {
  const docRef = groupDoc(groupId)
  await updateDoc(docRef, {
    memberIds: arrayRemove(userId),
    updatedAt: Timestamp.now(),
  })
}

// ============ DELETE ============

export async function deleteGroup(groupId: string): Promise<void> {
  const docRef = groupDoc(groupId)
  await deleteDoc(docRef)
}

// ============ STATS UPDATE ============

export async function incrementGroupStats(groupId: string): Promise<void> {
  const docRef = groupDoc(groupId)
  const group = await getGroup(groupId)

  if (!group) return

  await updateDoc(docRef, {
    'stats.totalMatches': (group.stats.totalMatches ?? 0) + 1,
    'stats.lastMatchDate': Timestamp.now(),
    updatedAt: Timestamp.now(),
  })
}

// ============ VALIDATION ============

export function validateGroupName(name: string): { valid: boolean; error?: string } {
  const trimmed = name.trim()

  if (trimmed.length < 2) {
    return { valid: false, error: 'Group name must be at least 2 characters' }
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Group name must be less than 50 characters' }
  }

  return { valid: true }
}

export function canDeleteGroup(group: Group, userId: string): boolean {
  return group.createdBy === userId
}

export function canEditGroup(group: Group, userId: string): boolean {
  return group.createdBy === userId
}

export function isGroupMember(group: Group, userId: string): boolean {
  return group.memberIds.includes(userId)
}
