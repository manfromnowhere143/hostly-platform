// ═══════════════════════════════════════════════════════════════════════════════
// AVATAR COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
// User/entity representation with image, initials, or placeholder fallback.
// ═══════════════════════════════════════════════════════════════════════════════

'use client'

import { forwardRef, useState, type ImgHTMLAttributes } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface AvatarProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'size'> {
  size?: AvatarSize
  name?: string
  src?: string
  fallback?: string
  status?: 'online' | 'offline' | 'away' | 'busy'
}

// ─── Size Styles ──────────────────────────────────────────────────────────────
const sizeStyles: Record<AvatarSize, { container: string; text: string; status: string }> = {
  xs: {
    container: 'w-6 h-6',
    text: 'text-[10px]',
    status: 'w-1.5 h-1.5 border',
  },
  sm: {
    container: 'w-8 h-8',
    text: 'text-xs',
    status: 'w-2 h-2 border',
  },
  md: {
    container: 'w-10 h-10',
    text: 'text-sm',
    status: 'w-2.5 h-2.5 border-2',
  },
  lg: {
    container: 'w-12 h-12',
    text: 'text-base',
    status: 'w-3 h-3 border-2',
  },
  xl: {
    container: 'w-16 h-16',
    text: 'text-lg',
    status: 'w-4 h-4 border-2',
  },
  '2xl': {
    container: 'w-24 h-24',
    text: 'text-2xl',
    status: 'w-5 h-5 border-2',
  },
}

// ─── Status Colors ────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  online: 'bg-green-500',
  offline: 'bg-gray-400',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
}

// ─── Get Initials ─────────────────────────────────────────────────────────────
function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase()
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// ─── Generate Background Color ────────────────────────────────────────────────
function getBackgroundColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ]

  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }

  return colors[Math.abs(hash) % colors.length]
}

// ─── Component ────────────────────────────────────────────────────────────────
export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      size = 'md',
      name,
      src,
      alt,
      fallback,
      status,
      className = '',
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false)
    const styles = sizeStyles[size]

    const showImage = src && !imageError
    const showInitials = !showImage && name
    const showFallback = !showImage && !showInitials

    return (
      <div ref={ref} className={`relative inline-block ${className}`}>
        <div
          className={`
            ${styles.container}
            rounded-full overflow-hidden
            flex items-center justify-center
            ${showInitials ? getBackgroundColor(name!) : 'bg-[var(--background-muted)]'}
          `}
        >
          {showImage && (
            <img
              src={src}
              alt={alt || name || 'Avatar'}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              {...props}
            />
          )}

          {showInitials && (
            <span className={`${styles.text} font-medium text-white select-none`}>
              {getInitials(name!)}
            </span>
          )}

          {showFallback && (
            fallback ? (
              <span className={`${styles.text} font-medium text-[var(--foreground-muted)]`}>
                {fallback}
              </span>
            ) : (
              <svg
                className="w-1/2 h-1/2 text-[var(--foreground-subtle)]"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
                  clipRule="evenodd"
                />
              </svg>
            )
          )}
        </div>

        {status && (
          <span
            className={`
              absolute bottom-0 right-0
              ${styles.status}
              ${statusColors[status]}
              rounded-full border-white
            `}
            aria-label={`Status: ${status}`}
          />
        )}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

export default Avatar
