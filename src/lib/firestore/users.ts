import { getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { User, TeeBox } from '@/types'
import { userDoc } from './collections'

// ============ READ ============

/**
 * Fetch user document by ID
 */
export async function getUser(userId: string): Promise<User | null> {
  try {
    const snapshot = await getDoc(userDoc(userId))
    return snapshot.exists() ? snapshot.data() : null
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}

// ============ CREATE ============

/**
 * Create new user document (called after first sign-in)
 */
export async function createUser(
  userId: string,
  data: {
    displayName: string
    email: string
  },
): Promise<User> {
  const now = new Date()
  const user: User = {
    id: userId,
    displayName: data.displayName,
    email: data.email,
    avatarUrl: null,

    // Golf profile defaults
    handicapIndex: null,
    homeClub: null,
    defaultTeeBox: 'blue' as TeeBox,

    // Preferences defaults
    notificationsEnabled: true,

    // Metadata
    createdAt: now,
    updatedAt: now,
    lastActiveAt: now,
  }

  try {
    await setDoc(userDoc(userId), user)
    return user
  } catch (error) {
    console.error('Error creating user:', error)
    throw error
  }
}

// ============ UPDATE ============

/**
 * Update user profile fields (displayName, handicap, etc.)
 */
export async function updateUser(
  userId: string,
  updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>,
): Promise<void> {
  try {
    await updateDoc(userDoc(userId), {
      ...updates,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error updating user:', error)
    throw error
  }
}

/**
 * Update user's last active timestamp (for stale user cleanup)
 */
export async function updateUserActivity(userId: string): Promise<void> {
  try {
    await updateDoc(userDoc(userId), {
      lastActiveAt: new Date(),
    })
  } catch (error) {
    console.error('Error updating user activity:', error)
    throw error
  }
}

/**
 * Update user's golf preferences
 */
export async function updateUserGolfProfile(
  userId: string,
  profile: {
    handicapIndex?: number | null
    homeClub?: string | null
    defaultTeeBox?: TeeBox
  },
): Promise<void> {
  try {
    await updateDoc(userDoc(userId), {
      ...profile,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error updating golf profile:', error)
    throw error
  }
}

/**
 * Update user notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  notificationsEnabled: boolean,
): Promise<void> {
  try {
    await updateDoc(userDoc(userId), {
      notificationsEnabled,
      updatedAt: new Date(),
    })
  } catch (error) {
    console.error('Error updating notification preferences:', error)
    throw error
  }
}
