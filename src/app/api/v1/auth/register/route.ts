import { NextRequest } from 'next/server'
import { success, error, handleError } from '@/lib/utils/api'
import { ids } from '@/lib/utils/id'
import { hashPassword } from '@/lib/auth/password'
import { signAccessToken, signRefreshToken } from '@/lib/auth/jwt'
import { registerSchema } from '@/lib/auth/schemas'
import prisma from '@/lib/db/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    // Check if email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email },
    })

    if (existingUser) {
      return error('ALREADY_EXISTS', 'Email already registered', undefined, 409)
    }

    // Create organization slug from name
    const slug = data.organizationName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Check if slug exists
    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    })

    if (existingOrg) {
      return error('ALREADY_EXISTS', 'Organization name already taken', undefined, 409)
    }

    // Hash password
    const passwordHash = await hashPassword(data.password)

    // Create organization, user, and website in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create organization
      const organization = await tx.organization.create({
        data: {
          id: ids.organization(),
          name: data.organizationName,
          slug,
        },
      })

      // Create user
      const user = await tx.user.create({
        data: {
          id: ids.user(),
          organizationId: organization.id,
          email: data.email,
          passwordHash,
          name: data.name,
          role: 'owner',
          permissions: ['*'], // Owners have all permissions
        },
      })

      // Create website with subdomain
      await tx.website.create({
        data: {
          organizationId: organization.id,
          subdomain: slug,
        },
      })

      // Log event
      await tx.event.create({
        data: {
          id: ids.event(),
          organizationId: organization.id,
          type: 'organization.created',
          aggregateType: 'Organization',
          aggregateId: organization.id,
          data: { name: organization.name, slug: organization.slug },
          userId: user.id,
        },
      })

      return { organization, user }
    })

    // Generate tokens
    const accessToken = signAccessToken({
      sub: result.user.id,
      org: result.organization.id,
      slug: result.organization.slug,
      role: result.user.role,
      permissions: result.user.permissions,
    })
    const refreshToken = signRefreshToken(result.user.id)

    return success(
      {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          role: result.user.role,
        },
        organization: {
          id: result.organization.id,
          name: result.organization.name,
          slug: result.organization.slug,
        },
        accessToken,
        refreshToken,
      },
      undefined,
      201
    )
  } catch (err) {
    return handleError(err)
  }
}
