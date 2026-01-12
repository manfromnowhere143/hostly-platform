// ═══════════════════════════════════════════════════════════════════════════════
// TEXTAREA COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Multi-line text input with auto-resize option.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { forwardRef, type TextareaHTMLAttributes, useId, useCallback, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  autoResize?: boolean
  minRows?: number
  maxRows?: number
  fullWidth?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      helperText,
      error,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      fullWidth = false,
      disabled,
      className = '',
      id: providedId,
      onChange,
      ...props
    },
    forwardedRef
  ) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const helperId = `${id}-helper`
    const errorId = `${id}-error`
    const internalRef = useRef<HTMLTextAreaElement>(null)

    const hasError = !!error

    // Merge refs
    const ref = (forwardedRef || internalRef) as React.RefObject<HTMLTextAreaElement>

    // Auto-resize logic
    const adjustHeight = useCallback(() => {
      const textarea = ref.current
      if (!textarea || !autoResize) return

      // Reset height to measure scrollHeight
      textarea.style.height = 'auto'

      // Calculate line height
      const computedStyle = window.getComputedStyle(textarea)
      const lineHeight = parseInt(computedStyle.lineHeight) || 24
      const paddingTop = parseInt(computedStyle.paddingTop) || 0
      const paddingBottom = parseInt(computedStyle.paddingBottom) || 0

      // Calculate min/max heights
      const minHeight = lineHeight * minRows + paddingTop + paddingBottom
      const maxHeight = lineHeight * maxRows + paddingTop + paddingBottom

      // Set height within bounds
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)
      textarea.style.height = `${newHeight}px`
    }, [autoResize, minRows, maxRows, ref])

    // Handle change with auto-resize
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e)
        if (autoResize) {
          adjustHeight()
        }
      },
      [onChange, autoResize, adjustHeight]
    )

    // Initial height adjustment
    useEffect(() => {
      if (autoResize) {
        adjustHeight()
      }
    }, [autoResize, adjustHeight])

    const baseStyles = `
      w-full
      bg-[var(--background-elevated)]
      border border-[var(--border)]
      text-[var(--foreground)]
      placeholder:text-[var(--foreground-subtle)]
      transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]
      outline-none
      focus:border-[var(--border-focus)]
      focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-opacity-20
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--background-subtle)]
      px-4 py-2.5 text-base rounded-[var(--radius-md)]
      resize-vertical
    `

    const errorStyles = hasError
      ? 'border-[var(--error-500)] focus:border-[var(--error-500)] focus:ring-[var(--error-500)]'
      : ''

    const autoResizeStyles = autoResize ? 'resize-none overflow-hidden' : ''

    return (
      <div className={`${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-[var(--foreground)] mb-1.5"
          >
            {label}
          </label>
        )}

        <textarea
          ref={ref}
          id={id}
          disabled={disabled}
          rows={autoResize ? minRows : props.rows || minRows}
          aria-invalid={hasError}
          aria-describedby={
            hasError ? errorId : helperText ? helperId : undefined
          }
          onChange={handleChange}
          className={`
            ${baseStyles}
            ${errorStyles}
            ${autoResizeStyles}
          `.replace(/\s+/g, ' ').trim()}
          {...props}
        />

        {/* Helper Text */}
        {helperText && !hasError && (
          <p
            id={helperId}
            className="mt-1.5 text-sm text-[var(--foreground-muted)]"
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {hasError && (
          <p
            id={errorId}
            role="alert"
            className="mt-1.5 text-sm text-[var(--error-500)] flex items-center gap-1"
          >
            <svg
              className="w-4 h-4 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
