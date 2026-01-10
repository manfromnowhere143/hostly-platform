import { NextRequest } from 'next/server'
import { success, error, handleError } from '@/lib/utils/api'
import { verifyPassword } from '@/lib/auth/password'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import { loginSchema } from '@/lib/auth/schemas'
import prisma from '@/lib/db/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: data.email },
      include: { organization: true },
    })

    if (!user || !user.passwordHash) {
      return error('AUTH_INVALID', 'Invalid email or password', undefined, 401)
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash)

    if (!isValid) {
      return error('AUTH_INVALID', 'Invalid email or password', undefined, 401)
    }

    // Check user status
    if (user.status !== 'active') {
      return error('AUTH_INVALID', 'Account is not active', undefined, 401)
    }

    // Check organization status
    if (user.organization.status !== 'active') {
      return error('AUTH_INVALID', 'Organization is not active', undefined, 401)
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    // Generate tokens
    const accessToken = signAccessToken({
      sub: user.id,
      org: user.organizationId,
      slug: user.organization.slug,
      role: user.role,
      permissions: user.permissions,
    })
    const refreshToken = signRefreshToken(user.id)

    return success({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      organization: {
        id: user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
      },
      accessToken,
      refreshToken,
    })
  } catch (err) {
    return handleError(err)
  }
}
