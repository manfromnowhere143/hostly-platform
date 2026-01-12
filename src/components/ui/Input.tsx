// ═══════════════════════════════════════════════════════════════════════════════
// INPUT COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Accessible text input with label, helper text, and error states.
// Supports all native input types and integrates with form libraries.
// ═══════════════════════════════════════════════════════════════════════════════

import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type InputSize = 'sm' | 'md' | 'lg'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  size?: InputSize
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

// ─── Size Styles ──────────────────────────────────────────────────────────────
const sizeStyles: Record<InputSize, { input: string; icon: string }> = {
  sm: {
    input: 'px-3 py-1.5 text-sm rounded-[var(--radius-md)]',
    icon: 'w-4 h-4',
  },
  md: {
    input: 'px-4 py-2.5 text-base rounded-[var(--radius-md)]',
    icon: 'w-5 h-5',
  },
  lg: {
    input: 'px-5 py-3.5 text-lg rounded-[var(--radius-lg)]',
    icon: 'w-6 h-6',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      size = 'md',
      leftIcon,
      rightIcon,
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
    const hasLeftIcon = !!leftIcon
    const hasRightIcon = !!rightIcon

    const baseInputStyles = `
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
    `

    const errorStyles = hasError
      ? 'border-[var(--error-500)] focus:border-[var(--error-500)] focus:ring-[var(--error-500)]'
      : ''

    const iconPadding = {
      sm: { left: hasLeftIcon ? 'pl-9' : '', right: hasRightIcon ? 'pr-9' : '' },
      md: { left: hasLeftIcon ? 'pl-11' : '', right: hasRightIcon ? 'pr-11' : '' },
      lg: { left: hasLeftIcon ? 'pl-13' : '', right: hasRightIcon ? 'pr-13' : '' },
    }

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
          {/* Left Icon */}
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)] pointer-events-none">
              <span className={sizeStyles[size].icon}>{leftIcon}</span>
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError ? errorId : helperText ? helperId : undefined
            }
            className={`
              ${baseInputStyles}
              ${sizeStyles[size].input}
              ${errorStyles}
              ${iconPadding[size].left}
              ${iconPadding[size].right}
            `.replace(/\s+/g, ' ').trim()}
            {...props}
          />

          {/* Right Icon */}
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--foreground-subtle)]">
              <span className={sizeStyles[size].icon}>{rightIcon}</span>
            </div>
          )}
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

Input.displayName = 'Input'

export default Input
