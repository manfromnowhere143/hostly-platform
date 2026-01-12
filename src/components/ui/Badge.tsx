// ═══════════════════════════════════════════════════════════════════════════════
// BADGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Status indicator and label component with multiple variants.
// ═══════════════════════════════════════════════════════════════════════════════

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type BadgeSize = 'sm' | 'md' | 'lg'

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  removable?: boolean
  onRemove?: () => void
  children: ReactNode
}

// ─── Variant Styles ───────────────────────────────────────────────────────────
const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  default: {
    bg: 'bg-[var(--background-subtle)]',
    text: 'text-[var(--foreground-muted)]',
    dot: 'bg-[var(--foreground-subtle)]',
  },
  primary: {
    bg: 'bg-[var(--primary-100)]',
    text: 'text-[var(--primary-700)]',
    dot: 'bg-[var(--primary-500)]',
  },
  secondary: {
    bg: 'bg-[var(--secondary-100)]',
    text: 'text-[var(--secondary-700)]',
    dot: 'bg-[var(--secondary-500)]',
  },
  success: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    dot: 'bg-green-500',
  },
  warning: {
    bg: 'bg-amber-100',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  error: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    dot: 'bg-red-500',
  },
  info: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
}

// ─── Size Styles ──────────────────────────────────────────────────────────────
const sizeStyles: Record<BadgeSize, { badge: string; dot: string; remove: string }> = {
  sm: {
    badge: 'px-2 py-0.5 text-xs gap-1',
    dot: 'w-1.5 h-1.5',
    remove: 'w-3 h-3',
  },
  md: {
    badge: 'px-2.5 py-1 text-sm gap-1.5',
    dot: 'w-2 h-2',
    remove: 'w-4 h-4',
  },
  lg: {
    badge: 'px-3 py-1.5 text-base gap-2',
    dot: 'w-2.5 h-2.5',
    remove: 'w-5 h-5',
  },
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      variant = 'default',
      size = 'md',
      dot = false,
      removable = false,
      onRemove,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const styles = variantStyles[variant]
    const sizes = sizeStyles[size]

    return (
      <span
        ref={ref}
        className={`
          inline-flex items-center font-medium
          rounded-[var(--radius-full)]
          ${styles.bg}
          ${styles.text}
          ${sizes.badge}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {dot && (
          <span
            className={`rounded-full ${styles.dot} ${sizes.dot}`}
            aria-hidden="true"
          />
        )}
        {children}
        {removable && (
          <button
            type="button"
            onClick={onRemove}
            className={`
              ${sizes.remove}
              rounded-full ml-0.5 -mr-1
              hover:bg-black/10
              transition-colors duration-[var(--duration-fast)]
              flex items-center justify-center
            `}
            aria-label="Remove"
          >
            <svg
              className="w-3 h-3"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </span>
    )
  }
)

Badge.displayName = 'Badge'

export default Badge
