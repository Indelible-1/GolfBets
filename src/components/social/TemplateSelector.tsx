'use client'

import { useState } from 'react'
import type { BetTemplate } from '@/types'
import { cn } from '@/lib/utils'
import { getTemplateSummary } from '@/lib/social/templates'

interface TemplateSelectorProps {
  templates: BetTemplate[]
  selectedTemplate: BetTemplate | null
  onTemplateSelect: (template: BetTemplate | null) => void
  className?: string
}

export function TemplateSelector({
  templates,
  selectedTemplate,
  onTemplateSelect,
  className,
}: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleSelect = (template: BetTemplate | null) => {
    onTemplateSelect(template)
    setIsOpen(false)
  }

  return (
    <div className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-left hover:bg-gray-50"
      >
        <div>
          <span className="text-sm text-gray-500">Bet Template</span>
          <p className="font-medium text-gray-900">{selectedTemplate?.name ?? 'Custom Bets'}</p>
          {selectedTemplate && (
            <p className="mt-0.5 text-xs text-gray-500">{getTemplateSummary(selectedTemplate)}</p>
          )}
        </div>
        <svg
          className={cn('h-5 w-5 text-gray-400 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 left-0 z-20 mt-1 max-h-64 overflow-hidden overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
            {/* Custom option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                'w-full border-b border-gray-100 px-4 py-3 text-left transition-colors hover:bg-gray-50',
                !selectedTemplate && 'bg-emerald-50'
              )}
            >
              <p
                className={cn(
                  'font-medium',
                  !selectedTemplate ? 'text-emerald-700' : 'text-gray-900'
                )}
              >
                Custom Bets
              </p>
              <p className="text-xs text-gray-500">Configure bets manually</p>
            </button>

            {/* Templates */}
            {templates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id

              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelect(template)}
                  className={cn(
                    'w-full px-4 py-3 text-left transition-colors hover:bg-gray-50',
                    isSelected && 'bg-emerald-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p
                      className={cn(
                        'font-medium',
                        isSelected ? 'text-emerald-700' : 'text-gray-900'
                      )}
                    >
                      {template.name}
                    </p>
                    {template.isDefault && (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{getTemplateSummary(template)}</p>
                </button>
              )
            })}

            {templates.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">No saved templates</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// Compact template card for templates page
interface TemplateCardProps {
  template: BetTemplate
  onEdit?: () => void
  onDelete?: () => void
  onSetDefault?: () => void
  className?: string
}

export function TemplateCard({
  template,
  onEdit,
  onDelete,
  onSetDefault,
  className,
}: TemplateCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white p-4',
        template.isDefault && 'border-emerald-300 bg-emerald-50/30',
        className
      )}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="font-medium text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-500">{getTemplateSummary(template)}</p>
        </div>
        {template.isDefault && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
            Default
          </span>
        )}
      </div>

      {/* Bet details */}
      <div className="mt-3 space-y-1">
        {template.bets.map((bet, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 capitalize">{bet.type.replace('_', ' ')}</span>
            <span className="font-medium text-gray-900">${bet.unitValue}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {!template.isDefault && onSetDefault && (
          <button
            onClick={onSetDefault}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700"
          >
            Set as Default
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs font-medium text-gray-600 hover:text-gray-700"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-xs font-medium text-red-600 hover:text-red-700"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
