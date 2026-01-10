'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface FormFieldProps {
  /** Field label text */
  label: string
  /** Error message to display */
  error?: string
  /** Additional hint text */
  hint?: string
  /** Whether field is required */
  required?: boolean
  /** Form control element(s) */
  children: ReactNode
  /** Additional className for the wrapper */
  className?: string
  /** ID to link label with input */
  htmlFor?: string
}

/**
 * Form field wrapper with label, error, and hint display
 * Provides consistent styling and accessibility for form inputs
 *
 * @example
 * <FormField label="Email" error={errors.email} required>
 *   <input type="email" ... />
 * </FormField>
 */
export function FormField({
  label,
  error,
  hint,
  required,
  children,
  className,
  htmlFor,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {children}

      {error && (
        <p className="text-sm text-red-600" role="alert" aria-live="polite">
          {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
    </div>
  )
}

/**
 * Inline error message component for validation errors
 */
export function InlineError({ message }: { message?: string }) {
  if (!message) return null

  return (
    <p className="text-sm text-red-600 mt-1" role="alert" aria-live="polite">
      {message}
    </p>
  )
}

/**
 * Error summary for displaying multiple form errors at once
 */
export function ErrorSummary({ errors }: { errors: Record<string, string> }) {
  const errorEntries = Object.entries(errors).filter(([, value]) => value)

  if (errorEntries.length === 0) return null

  return (
    <div
      className="rounded-md bg-red-50 p-4 mb-4"
      role="alert"
      aria-live="assertive"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            Please fix the following errors:
          </h3>
          <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
            {errorEntries.map(([field, message]) => (
              <li key={field}>{message}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
