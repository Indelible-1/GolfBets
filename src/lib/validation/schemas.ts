import { z } from 'zod'

// ============ AUTH VALIDATION ============

export const emailSchema = z
  .string()
  .email('Invalid email address')
  .min(5, 'Email too short')
  .max(254, 'Email too long')
  .toLowerCase()
  .trim()

export const magicLinkSchema = z.object({
  email: emailSchema,
})

// ============ USER VALIDATION ============

export const displayNameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .trim()
  .regex(/^[a-zA-Z0-9\s'-]+$/, 'Name contains invalid characters')

export const handicapSchema = z
  .number()
  .min(0, 'Handicap cannot be negative')
  .max(54, 'Handicap cannot exceed 54')
  .nullable()
  .optional()

export const teeBoxSchema = z.enum(['championship', 'blue', 'white', 'red'])

export const updateUserProfileSchema = z.object({
  displayName: displayNameSchema.optional(),
  handicapIndex: handicapSchema,
  homeClub: z.string().max(100).nullable().optional(),
  defaultTeeBox: teeBoxSchema.optional(),
  notificationsEnabled: z.boolean().optional(),
})

// ============ MATCH VALIDATION ============

export const createMatchSchema = z.object({
  courseName: z.string().min(1, 'Course name required').max(100, 'Course name too long'),
  courseId: z.string().nullable().optional(),
  teeTime: z.coerce.date().refine(
    (date) => date > new Date(),
    'Tee time must be in the future'
  ),
  holes: z.union([z.literal(9), z.literal(18)]),
})

export const updateMatchStatusSchema = z.object({
  status: z.enum(['pending', 'active', 'completed', 'cancelled']),
})

// ============ SCORE VALIDATION ============

export const scoreSchema = z.object({
  participantId: z.string().min(1, 'Participant ID required'),
  holeNumber: z.number().int().min(1).max(18),
  strokes: z.number().int().min(1, 'Strokes must be at least 1').max(20, 'Max 20 strokes'),
  putts: z.number().int().min(0).max(10).nullable().optional(),
  fairwayHit: z.boolean().nullable().optional(),
  greenInRegulation: z.boolean().nullable().optional(),
})

// ============ BET VALIDATION ============

export const nassauConfigSchema = z.object({
  frontAmount: z.number().min(0.01).max(1000),
  backAmount: z.number().min(0.01).max(1000),
  overallAmount: z.number().min(0.01).max(1000),
  autoPress: z.boolean(),
  pressTrigger: z.number().int().min(1).max(9),
  maxPresses: z.number().int().min(0).max(10),
})

export const skinsConfigSchema = z.object({
  skinValue: z.number().min(0.01).max(1000),
  carryover: z.boolean(),
  validation: z.boolean(),
})

export const createBetSchema = z.object({
  type: z.enum(['nassau', 'skins', 'match_play', 'stroke_play']),
  unitValue: z.number().min(0.01).max(1000),
  scoringMode: z.enum(['gross', 'net']),
  nassauConfig: nassauConfigSchema.nullable().optional(),
  skinsConfig: skinsConfigSchema.nullable().optional(),
})

// ============ INVITE VALIDATION ============

export const createInviteSchema = z
  .object({
    matchId: z.string().min(1).nullable().optional(),
    groupId: z.string().min(1).nullable().optional(),
    maxUses: z.number().int().min(1).max(100).default(10),
    expiresInDays: z.number().int().min(1).max(30).default(7),
  })
  .refine(
    (data) => data.matchId || data.groupId,
    'Either matchId or groupId must be provided'
  )

// ============ UTILITY FUNCTION ============

/**
 * Safely parse data with a Zod schema
 * Returns { success: true, data } or { success: false, errors }
 */
export function safeValidate<T extends z.ZodSchema>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors = result.error.issues.map((issue: z.ZodIssue) => issue.message)
  return { success: false, errors }
}
