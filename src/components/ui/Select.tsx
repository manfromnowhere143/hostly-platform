// ═══════════════════════════════════════════════════════════════════════════════
// SELECT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Accessible select dropdown with custom styling.
// ═══════════════════════════════════════════════════════════════════════════════

import { forwardRef, type SelectHTMLAttributes, useId } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type SelectSize = 'sm' | 'md' | 'lg'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  size?: SelectSize
  options: SelectOption[]
  placeholder?: string
  fullWidth?: boolean
}

// ─── Size Styles ──────────────────────────────────────────────────────────────
const sizeStyles: Record<SelectSize, string> = {
  sm: 'px-3 py-1.5 text-sm rounded-[var(--radius-md)]',
  md: 'px-4 py-2.5 text-base rounded-[var(--radius-md)]',
  lg: 'px-5 py-3.5 text-lg rounded-[var(--radius-lg)]',
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      options,
      placeholder,
      fullWidth = false,
      disabled,
      className = '',
      id: providedId,
      ...props
    },
    ref
  ) => {
    const generatedId = useId()
    const id = providedId || generatedId
    const helperId = `${id}-helper`
    const errorId = `${id}-error`

    const hasError = !!error

    const baseSelectStyles = `
      w-full appearance-none
      bg-[var(--background-elevated)]
      border border-[var(--border)]
      text-[var(--foreground)]
      transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]
      outline-none
      focus:border-[var(--border-focus)]
      focus:ring-2 focus:ring-[var(--border-focus)] focus:ring-opacity-20
      disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--background-subtle)]
      pr-10
    `

    const errorStyles = hasError
      ? 'border-[var(--error-500)] focus:border-[var(--error-500)] focus:ring-[var(--error-500)]'
      : ''

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

        <div className="relative">
          <select
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={`
              ${baseSelectStyles}
              ${sizeStyles[size]}
              ${errorStyles}
            `.replace(/\s+/g, ' ').trim()}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>

          {/* Dropdown Arrow */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--foreground-subtle)]">
            <svg
              className="w-5 h-5"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>

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

Select.displayName = 'Select'

export default Select
