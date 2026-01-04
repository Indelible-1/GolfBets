// Type declarations for firebase-admin subpath imports
// These are needed because bundler module resolution doesn't always
// properly resolve package.json exports for some packages

declare module 'firebase-admin/app' {
  export interface App {
    name: string
    options: AppOptions
  }

  export interface AppOptions {
    credential?: Credential
    databaseAuthVariableOverride?: object | null
    databaseURL?: string
    httpAgent?: object
    projectId?: string
    serviceAccountId?: string
    storageBucket?: string
  }

  export interface ServiceAccount {
    projectId?: string
    clientEmail?: string
    privateKey?: string
  }

  export interface Credential {
    getAccessToken(): Promise<{ access_token: string; expires_in: number }>
  }

  export function initializeApp(options?: AppOptions, name?: string): App
  export function getApp(name?: string): App
  export function getApps(): App[]
  export function deleteApp(app: App): Promise<void>
  export function cert(serviceAccountPathOrObject: string | ServiceAccount): Credential
}

declare module 'firebase-admin/auth' {
  import type { App } from 'firebase-admin/app'

  export interface SessionCookieOptions {
    expiresIn: number
  }

  export interface Auth {
    app: App
    verifyIdToken(idToken: string, checkRevoked?: boolean): Promise<DecodedIdToken>
    verifySessionCookie(sessionCookie: string, checkRevoked?: boolean): Promise<DecodedIdToken>
    createSessionCookie(idToken: string, options: SessionCookieOptions): Promise<string>
    createCustomToken(uid: string, developerClaims?: object): Promise<string>
    getUser(uid: string): Promise<UserRecord>
    getUserByEmail(email: string): Promise<UserRecord>
    revokeRefreshTokens(uid: string): Promise<void>
  }

  export interface DecodedIdToken {
    uid: string
    email?: string
    email_verified?: boolean
    [key: string]: unknown
  }

  export interface UserRecord {
    uid: string
    email?: string
    emailVerified: boolean
    displayName?: string
    photoURL?: string
    disabled: boolean
  }

  export function getAuth(app?: App): Auth
}
