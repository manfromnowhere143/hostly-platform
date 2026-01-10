import { headers } from 'next/headers'
import { verifyToken } from './jwt'
import { TenantContext, JWTPayload } from '@/types'
import prisma from '@/lib/db/client'

// Get tenant context from the current request
export async function getTenantContext(): Promise<TenantContext | null> {
  const headersList = await headers()
  const authHeader = headersList.get('authorization')

  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.slice(7)

  try {
    const payload = verifyToken(token)

    return {
      organizationId: payload.org,
      organizationSlug: payload.slug,
      userId: payload.sub,
      userRole: payload.role as TenantContext['userRole'],
      permissions: payload.permissions,
    }
  } catch {
    return null
  }
}

// Require authentication - throws if not authenticated
export async function requireAuth(): Promise<TenantContext> {
  const context = await getTenantContext()

  if (!context) {
    throw new AuthError('Authentication required', 'AUTH_REQUIRED')
  }

  return context
}

// Check if user has specific permission
export function hasPermission(context: TenantContext, permission: string): boolean {
  // Owners have all permissions
  if (context.userRole === 'owner') return true

  // Admins have most permissions except billing
  if (context.userRole === 'admin' && !permission.startsWith('billing:')) return true

  // Check specific permissions
  return context.permissions.includes(permission)
}

// Require specific permission
export async function requirePermission(permission: string): Promise<TenantContext> {
  const context = await requireAuth()

  if (!hasPermission(context, permission)) {
    throw new AuthError('Insufficient permissions', 'FORBIDDEN')
  }

  return context
}

// Custom auth error class
export class AuthError extends Error {
  code: string

  constructor(message: string, code: string) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

// Resolve tenant from subdomain or custom domain
export async function resolveTenant(domain: string) {
  // First try subdomain match
  let website = await prisma.website.findFirst({
    where: { subdomain: domain },
    include: { organization: true },
  })

  // Then try custom domain
  if (!website) {
    website = await prisma.website.findFirst({
      where: {
        customDomain: domain,
        domainVerified: true,
      },
      include: { organization: true },
    })
  }

  return website?.organization ?? null
}
