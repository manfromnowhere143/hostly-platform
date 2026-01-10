import { NextResponse } from 'next/server'
import { ApiResponse, ApiError, ApiMeta } from '@/types'
import { ZodError } from 'zod'

// Success response helper
export function success<T>(data: T, meta?: ApiMeta, status = 200): NextResponse {
  const response: ApiResponse<T> = {
    success: true,
    data,
    ...(meta && { meta }),
  }
  return NextResponse.json(response, { status })
}

// Error response helper
export function error(
  code: string,
  message: string,
  details?: ApiError['details'],
  status = 400
): NextResponse {
  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
  }
  return NextResponse.json(response, { status })
}

// Handle common errors
export function handleError(err: unknown): NextResponse {
  console.error('API Error:', err)

  // Zod validation error
  if (err instanceof ZodError) {
    const details = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }))
    return error('VALIDATION_ERROR', 'Invalid request data', details, 422)
  }

  // Auth error
  if (err instanceof Error && err.name === 'AuthError') {
    const authErr = err as { code: string }
    const status = authErr.code === 'AUTH_REQUIRED' ? 401 : 403
    return error(authErr.code, err.message, undefined, status)
  }

  // JWT errors
  if (err instanceof Error && err.name === 'JsonWebTokenError') {
    return error('AUTH_INVALID', 'Invalid authentication token', undefined, 401)
  }

  if (err instanceof Error && err.name === 'TokenExpiredError') {
    return error('AUTH_EXPIRED', 'Authentication token expired', undefined, 401)
  }

  // Prisma errors
  if (err instanceof Error && err.message.includes('Unique constraint')) {
    return error('ALREADY_EXISTS', 'Resource already exists', undefined, 409)
  }

  if (err instanceof Error && err.message.includes('Record to update not found')) {
    return error('NOT_FOUND', 'Resource not found', undefined, 404)
  }

  // Generic error
  return error(
    'INTERNAL_ERROR',
    process.env.NODE_ENV === 'development'
      ? (err as Error).message
      : 'An unexpected error occurred',
    undefined,
    500
  )
}

// Pagination helper
export function paginate<T>(
  items: T[],
  total: number,
  page: number,
  limit: number
): { data: T[]; meta: ApiMeta } {
  return {
    data: items,
    meta: {
      page,
      limit,
      total,
      hasMore: page * limit < total,
    },
  }
}
