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
  className
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
        className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-left hover:bg-gray-50"
      >
        <div>
          <span className="text-sm text-gray-500">Bet Template</span>
          <p className="font-medium text-gray-900">
            {selectedTemplate?.name ?? 'Custom Bets'}
          </p>
          {selectedTemplate && (
            <p className="text-xs text-gray-500 mt-0.5">
              {getTemplateSummary(selectedTemplate)}
            </p>
          )}
        </div>
        <svg
          className={cn('w-5 h-5 text-gray-400 transition-transform', isOpen && 'rotate-180')}
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
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden max-h-64 overflow-y-auto">
            {/* Custom option */}
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100',
                !selectedTemplate && 'bg-emerald-50'
              )}
            >
              <p className={cn(
                'font-medium',
                !selectedTemplate ? 'text-emerald-700' : 'text-gray-900'
              )}>
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
                    'w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors',
                    isSelected && 'bg-emerald-50'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <p className={cn(
                      'font-medium',
                      isSelected ? 'text-emerald-700' : 'text-gray-900'
                    )}>
                      {template.name}
                    </p>
                    {template.isDefault && (
                      <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {getTemplateSummary(template)}
                  </p>
                </button>
              )
            })}

            {templates.length === 0 && (
              <div className="px-4 py-3 text-sm text-gray-500">
                No saved templates
              </div>
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
  className
}: TemplateCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 p-4',
      template.isDefault && 'border-emerald-300 bg-emerald-50/30',
      className
    )}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-medium text-gray-900">{template.name}</h3>
          <p className="text-sm text-gray-500">{getTemplateSummary(template)}</p>
        </div>
        {template.isDefault && (
          <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">
            Default
          </span>
        )}
      </div>

      {/* Bet details */}
      <div className="mt-3 space-y-1">
        {template.bets.map((bet, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-gray-600 capitalize">{bet.type.replace('_', ' ')}</span>
            <span className="text-gray-900 font-medium">${bet.unitValue}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-4 flex items-center gap-2">
        {!template.isDefault && onSetDefault && (
          <button
            onClick={onSetDefault}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium"
          >
            Set as Default
          </button>
        )}
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-gray-600 hover:text-gray-700 font-medium"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  )
}
