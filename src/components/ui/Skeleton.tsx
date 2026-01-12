// ═══════════════════════════════════════════════════════════════════════════════
// SKELETON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// Loading placeholder with shimmer animation.
// ═══════════════════════════════════════════════════════════════════════════════

import { forwardRef, type HTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded'

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant
  width?: string | number
  height?: string | number
  lines?: number
  animation?: 'shimmer' | 'pulse' | 'none'
}

// ─── Variant Styles ───────────────────────────────────────────────────────────
const variantStyles: Record<SkeletonVariant, string> = {
  text: 'rounded-[var(--radius-sm)]',
  circular: 'rounded-full',
  rectangular: 'rounded-none',
  rounded: 'rounded-[var(--radius-md)]',
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      variant = 'text',
      width,
      height,
      lines = 1,
      animation = 'shimmer',
      className = '',
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'bg-[var(--neutral-200)]'

    const animationStyles = {
      shimmer: 'skeleton',
      pulse: 'animate-pulse',
      none: '',
    }

    // Default dimensions based on variant
    const defaultDimensions = {
      text: { width: '100%', height: '1em' },
      circular: { width: '40px', height: '40px' },
      rectangular: { width: '100%', height: '100px' },
      rounded: { width: '100%', height: '100px' },
    }

    const computedWidth = width ?? defaultDimensions[variant].width
    const computedHeight = height ?? defaultDimensions[variant].height

    // For text variant with multiple lines
    if (variant === 'text' && lines > 1) {
      return (
        <div ref={ref} className={`space-y-2 ${className}`} {...props}>
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`
                ${baseStyles}
                ${variantStyles[variant]}
                ${animationStyles[animation]}
              `}
              style={{
                width: index === lines - 1 ? '80%' : computedWidth,
                height: computedHeight,
                ...style,
              }}
            />
          ))}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={`
          ${baseStyles}
          ${variantStyles[variant]}
          ${animationStyles[animation]}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        style={{
          width: computedWidth,
          height: computedHeight,
          ...style,
        }}
        {...props}
      />
    )
  }
)

Skeleton.displayName = 'Skeleton'

// ─── Preset Skeletons ─────────────────────────────────────────────────────────

export function SkeletonCard() {
  return (
    <div className="card p-4 space-y-4">
      <Skeleton variant="rounded" height={200} />
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" lines={2} />
      </div>
      <div className="flex justify-between items-center pt-2">
        <Skeleton variant="text" width={80} />
        <Skeleton variant="rounded" width={100} height={36} />
      </div>
    </div>
  )
}

export function SkeletonAvatar({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 32, md: 40, lg: 48 }
  return <Skeleton variant="circular" width={sizes[size]} height={sizes[size]} />
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return <Skeleton variant="text" lines={lines} />
}

export function SkeletonButton() {
  return <Skeleton variant="rounded" width={120} height={40} />
}

export default Skeleton
