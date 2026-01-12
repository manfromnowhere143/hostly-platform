// ═══════════════════════════════════════════════════════════════════════════════
// BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Accessible, polymorphic button with multiple variants and sizes.
// Supports brand theming through CSS custom properties.
// ═══════════════════════════════════════════════════════════════════════════════

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
  children: ReactNode
}

// ─── Variant Styles ───────────────────────────────────────────────────────────
const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    bg-[var(--brand-primary)] text-white
    hover:brightness-110
    active:brightness-95
    focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100
  `,
  secondary: `
    bg-[var(--brand-secondary)] text-white
    hover:brightness-110
    active:brightness-95
    focus-visible:ring-2 focus-visible:ring-[var(--brand-secondary)] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  outline: `
    bg-transparent border-2 border-[var(--brand-primary)] text-[var(--brand-primary)]
    hover:bg-[var(--brand-primary)] hover:text-white
    active:brightness-95
    focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--brand-primary)]
  `,
  ghost: `
    bg-transparent text-[var(--foreground-muted)]
    hover:bg-[var(--background-subtle)] hover:text-[var(--foreground)]
    active:bg-[var(--background-muted)]
    focus-visible:ring-2 focus-visible:ring-[var(--border-focus)] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  danger: `
    bg-[var(--error-500)] text-white
    hover:bg-[var(--error-600)]
    active:brightness-95
    focus-visible:ring-2 focus-visible:ring-[var(--error-500)] focus-visible:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
}

// ─── Size Styles ──────────────────────────────────────────────────────────────
const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5 rounded-[var(--radius-md)]',
  md: 'px-4 py-2 text-base gap-2 rounded-[var(--radius-md)]',
  lg: 'px-6 py-3 text-lg gap-2 rounded-[var(--radius-lg)]',
  xl: 'px-8 py-4 text-xl gap-3 rounded-[var(--radius-lg)]',
}

// ─── Loading Spinner ──────────────────────────────────────────────────────────
function LoadingSpinner({ size }: { size: ButtonSize }) {
  const spinnerSize = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  }[size]

  return (
    <svg
      className={`animate-spin ${spinnerSize}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      disabled,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      inline-flex items-center justify-center
      font-medium
      transition-all duration-[var(--duration-fast)] ease-[var(--ease-default)]
      select-none
      outline-none
    `

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {isLoading ? (
          <>
            <LoadingSpinner size={size} />
            <span>Loading...</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button
