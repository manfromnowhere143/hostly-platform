// ═══════════════════════════════════════════════════════════════════════════════
// CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Flexible container component with variants for different use cases.
// Supports header, body, footer sections and interactive states.
// ═══════════════════════════════════════════════════════════════════════════════

import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type CardVariant = 'elevated' | 'outlined' | 'filled' | 'ghost'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
  padding?: 'none' | 'sm' | 'md' | 'lg'
  children: ReactNode
}

export interface CardHeaderProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  title?: ReactNode
  subtitle?: ReactNode
  action?: ReactNode
  children?: ReactNode
}

export interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

// ─── Variant Styles ───────────────────────────────────────────────────────────
const variantStyles: Record<CardVariant, string> = {
  elevated: `
    bg-[var(--background-elevated)]
    shadow-[var(--shadow-card)]
    hover:shadow-[var(--shadow-card-hover)]
  `,
  outlined: `
    bg-[var(--background-elevated)]
    border border-[var(--border)]
    hover:border-[var(--border-strong)]
  `,
  filled: `
    bg-[var(--background-subtle)]
  `,
  ghost: `
    bg-transparent
  `,
}

// ─── Padding Styles ───────────────────────────────────────────────────────────
const paddingStyles: Record<'none' | 'sm' | 'md' | 'lg', string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
}

// ─── Card Component ───────────────────────────────────────────────────────────
export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'elevated',
      interactive = false,
      padding = 'none',
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      rounded-[var(--radius-lg)]
      transition-all duration-[var(--duration-normal)] ease-[var(--ease-default)]
      overflow-hidden
    `

    const interactiveStyles = interactive
      ? 'cursor-pointer hover:translate-y-[-2px] active:translate-y-0'
      : ''

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${paddingStyles[padding]}
          ${interactiveStyles}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// ─── Card Header ──────────────────────────────────────────────────────────────
export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ title, subtitle, action, children, className = '', ...props }, ref) => {
    // If children are provided, render them directly
    if (children) {
      return (
        <div
          ref={ref}
          className={`px-4 py-3 border-b border-[var(--border-muted)] ${className}`}
          {...props}
        >
          {children}
        </div>
      )
    }

    // Otherwise, render structured header
    return (
      <div
        ref={ref}
        className={`px-4 py-3 border-b border-[var(--border-muted)] flex items-start justify-between gap-4 ${className}`}
        {...props}
      >
        <div className="flex-1 min-w-0">
          {title && (
            <h3 className="text-lg font-semibold text-[var(--foreground)] truncate">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-[var(--foreground-muted)] mt-0.5">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

// ─── Card Body ────────────────────────────────────────────────────────────────
export const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div ref={ref} className={`p-4 ${className}`} {...props}>
        {children}
      </div>
    )
  }
)

CardBody.displayName = 'CardBody'

// ─── Card Footer ──────────────────────────────────────────────────────────────
export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`px-4 py-3 border-t border-[var(--border-muted)] bg-[var(--background-subtle)] ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'

// ─── Exports ──────────────────────────────────────────────────────────────────
export default Card
