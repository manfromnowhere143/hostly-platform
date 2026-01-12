// ═══════════════════════════════════════════════════════════════════════════════
// SPINNER COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Loading indicator with multiple styles and sizes.
// ═══════════════════════════════════════════════════════════════════════════════

import { forwardRef, type HTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type SpinnerVariant = 'default' | 'primary' | 'secondary' | 'white'

export interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize
  variant?: SpinnerVariant
  label?: string
}

// ─── Size Styles ──────────────────────────────────────────────────────────────
const sizeStyles: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12',
}

// ─── Variant Colors ───────────────────────────────────────────────────────────
const variantStyles: Record<SpinnerVariant, { track: string; spinner: string }> = {
  default: {
    track: 'text-[var(--neutral-200)]',
    spinner: 'text-[var(--neutral-600)]',
  },
  primary: {
    track: 'text-[var(--primary-100)]',
    spinner: 'text-[var(--brand-primary)]',
  },
  secondary: {
    track: 'text-[var(--secondary-100)]',
    spinner: 'text-[var(--brand-secondary)]',
  },
  white: {
    track: 'text-white/20',
    spinner: 'text-white',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      variant = 'default',
      label = 'Loading',
      className = '',
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant]

    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={`inline-flex ${className}`}
        {...props}
      >
        <svg
          className={`animate-spin ${sizeStyles[size]}`}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Track */}
          <circle
            className={styles.track}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="3"
          />
          {/* Spinner */}
          <path
            className={styles.spinner}
            d="M12 2C6.47715 2 2 6.47715 2 12"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="sr-only">{label}</span>
      </div>
    )
  }
)

Spinner.displayName = 'Spinner'

// ─── Full Page Spinner ────────────────────────────────────────────────────────
export function PageSpinner({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-[var(--background)]">
      <Spinner size="xl" variant="primary" />
      {message && (
        <p className="mt-4 text-[var(--foreground-muted)]">{message}</p>
      )}
    </div>
  )
}

// ─── Inline Spinner with Text ─────────────────────────────────────────────────
export function InlineSpinner({
  text = 'Loading...',
  size = 'sm'
}: {
  text?: string
  size?: SpinnerSize
}) {
  return (
    <div className="inline-flex items-center gap-2 text-[var(--foreground-muted)]">
      <Spinner size={size} />
      <span>{text}</span>
    </div>
  )
}

export default Spinner
