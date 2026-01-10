import { NextRequest } from 'next/server'
import { success, error, handleError } from '@/lib/utils/api'
import { verifyToken, signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import { refreshTokenSchema } from '@/lib/auth/schemas'
import prisma from '@/lib/db/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = refreshTokenSchema.parse(body)

    // Verify refresh token
    const payload = verifyToken(refreshToken)

    // Check if it's a refresh token
    if ((payload as { type?: string }).type !== 'refresh') {
      return error('AUTH_INVALID', 'Invalid refresh token', undefined, 401)
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { organization: true },
    })

    if (!user || user.status !== 'active') {
      return error('AUTH_INVALID', 'User not found or inactive', undefined, 401)
    }

    if (user.organization.status !== 'active') {
      return error('AUTH_INVALID', 'Organization is not active', undefined, 401)
    }

    // Generate new tokens
    const newAccessToken = signAccessToken({
      sub: user.id,
      org: user.organizationId,
      slug: user.organization.slug,
      role: user.role,
      permissions: user.permissions,
    })
    const newRefreshToken = signRefreshToken(user.id)

    return success({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    })
  } catch (err) {
    return handleError(err)
  }
}
