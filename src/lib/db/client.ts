// ════════════════════════════════════════════════════════════════════════════════
// HOSTLY PLATFORM - Database Client
// Production-ready with connection pooling, health checks, and slow query logging
// ════════════════════════════════════════════════════════════════════════════════

import { PrismaClient, Prisma } from '@prisma/client'

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const SLOW_QUERY_THRESHOLD_MS = parseInt(
  process.env.DB_SLOW_QUERY_THRESHOLD_MS || '1000',
  10
)
const LOG_QUERIES = process.env.DB_LOG_QUERIES === 'true'
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development'
const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// ═══════════════════════════════════════════════════════════════════════════════
// PRISMA CLIENT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════════

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  // Configure logging based on environment
  const logConfig: Prisma.LogLevel[] = IS_DEVELOPMENT
    ? ['error', 'warn']
    : ['error']

  // Add query logging if enabled or in development with explicit flag
  if (LOG_QUERIES || (IS_DEVELOPMENT && process.env.DB_LOG_QUERIES !== 'false')) {
    logConfig.push('query')
  }

  const client = new PrismaClient({
    log: logConfig.map((level) => ({
      emit: 'event' as const,
      level,
    })),
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

  // ─── Query Event Logging ─────────────────────────────────────────────────────

  // @ts-expect-error - Prisma types don't fully support event subscriptions
  client.$on('query', (e: Prisma.QueryEvent) => {
    const duration = e.duration

    // Always log slow queries
    if (duration >= SLOW_QUERY_THRESHOLD_MS) {
      console.warn(
        `[DB SLOW QUERY] ${duration}ms | ${e.query} | Params: ${e.params}`
      )
    }
    // Log all queries if explicitly enabled
    else if (LOG_QUERIES) {
      console.log(`[DB Query] ${duration}ms | ${e.query}`)
    }
  })

  // @ts-expect-error - Prisma types don't fully support event subscriptions
  client.$on('error', (e: Prisma.LogEvent) => {
    console.error('[DB Error]', e.message)
  })

  // @ts-expect-error - Prisma types don't fully support event subscriptions
  client.$on('warn', (e: Prisma.LogEvent) => {
    console.warn('[DB Warning]', e.message)
  })

  return client
}

// Create singleton instance
export const prisma = globalForPrisma.prisma ?? createPrismaClient()

// Prevent multiple instances in development (hot reload)
if (!IS_PRODUCTION) {
  globalForPrisma.prisma = prisma
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════════════════════

export interface DatabaseHealth {
  connected: boolean
  latencyMs: number
  provider: 'postgresql' | 'sqlite' | 'unknown'
  timestamp: string
}

/**
 * Check database connectivity and latency
 * Use this for health check endpoints
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealth> {
  const start = Date.now()
  const timestamp = new Date().toISOString()

  // Detect provider from DATABASE_URL
  const url = process.env.DATABASE_URL || ''
  let provider: DatabaseHealth['provider'] = 'unknown'
  if (url.startsWith('postgresql://') || url.includes('supabase')) {
    provider = 'postgresql'
  } else if (url.startsWith('file:') || url.endsWith('.db')) {
    provider = 'sqlite'
  }

  try {
    // Simple connectivity test
    await prisma.$queryRaw`SELECT 1`
    const latencyMs = Date.now() - start

    return {
      connected: true,
      latencyMs,
      provider,
      timestamp,
    }
  } catch (error) {
    console.error('[DB Health Check] Failed:', error)

    return {
      connected: false,
      latencyMs: -1,
      provider,
      timestamp,
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════════════════════

let isShuttingDown = false

/**
 * Gracefully disconnect from database
 * Call this before process exit
 */
export async function disconnectDatabase(): Promise<void> {
  if (isShuttingDown) return
  isShuttingDown = true

  try {
    await prisma.$disconnect()
    console.log('[DB] Disconnected successfully')
  } catch (error) {
    console.error('[DB] Disconnect error:', error)
  }
}

// Auto-disconnect on process signals
if (typeof process !== 'undefined') {
  const signals: NodeJS.Signals[] = ['SIGINT', 'SIGTERM', 'SIGQUIT']

  signals.forEach((signal) => {
    process.once(signal, async () => {
      console.log(`[DB] Received ${signal}, disconnecting...`)
      await disconnectDatabase()
      process.exit(0)
    })
  })

  // Handle uncaught exceptions
  process.on('uncaughtException', async (error) => {
    console.error('[DB] Uncaught exception:', error)
    await disconnectDatabase()
    process.exit(1)
  })
}

// ═══════════════════════════════════════════════════════════════════════════════
// TRANSACTION HELPER
// ═══════════════════════════════════════════════════════════════════════════════

export type TransactionClient = Prisma.TransactionClient

/**
 * Execute operations in a transaction with automatic retry
 * @param fn - Function to execute within transaction
 * @param options - Transaction options
 */
export async function withTransaction<T>(
  fn: (tx: TransactionClient) => Promise<T>,
  options?: {
    maxRetries?: number
    timeout?: number
  }
): Promise<T> {
  const maxRetries = options?.maxRetries ?? 3
  const timeout = options?.timeout ?? 10000

  let lastError: Error | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await prisma.$transaction(fn, {
        maxWait: 5000,
        timeout,
      })
    } catch (error) {
      lastError = error as Error

      // Check if error is retryable (deadlock, serialization failure)
      const isRetryable =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        ['P2034', 'P2028'].includes(error.code)

      if (!isRetryable || attempt === maxRetries) {
        console.error(
          `[DB Transaction] Failed after ${attempt} attempt(s):`,
          error
        )
        throw error
      }

      // Exponential backoff before retry
      const backoffMs = Math.min(100 * Math.pow(2, attempt), 1000)
      console.warn(
        `[DB Transaction] Retrying (${attempt}/${maxRetries}) after ${backoffMs}ms`
      )
      await new Promise((resolve) => setTimeout(resolve, backoffMs))
    }
  }

  throw lastError
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUERY HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Safely execute a raw query with proper error handling
 */
export async function executeRawQuery<T = unknown>(
  query: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  try {
    return await prisma.$queryRaw<T[]>(query, ...values)
  } catch (error) {
    console.error('[DB Raw Query] Error:', error)
    throw error
  }
}

/**
 * Execute a raw command (INSERT, UPDATE, DELETE)
 */
export async function executeRawCommand(
  query: TemplateStringsArray,
  ...values: unknown[]
): Promise<number> {
  try {
    return await prisma.$executeRaw(query, ...values)
  } catch (error) {
    console.error('[DB Raw Command] Error:', error)
    throw error
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default prisma
