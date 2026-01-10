// ════════════════════════════════════════════════════════════════════════════════
// HOSTLY PLATFORM - Database Configuration
// Runtime detection and feature flags for PostgreSQL/SQLite
// ════════════════════════════════════════════════════════════════════════════════

export type DatabaseProvider = 'postgresql' | 'sqlite' | 'unknown'

// ═══════════════════════════════════════════════════════════════════════════════
// PROVIDER DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Detect the database provider from DATABASE_URL
 */
export function getDatabaseProvider(): DatabaseProvider {
  const url = process.env.DATABASE_URL || ''

  if (url.startsWith('postgresql://') || url.startsWith('postgres://')) {
    return 'postgresql'
  }

  if (url.includes('supabase.co') || url.includes('pooler.supabase.com')) {
    return 'postgresql'
  }

  if (url.startsWith('file:') || url.endsWith('.db') || url.includes('sqlite')) {
    return 'sqlite'
  }

  return 'unknown'
}

/**
 * Check if using PostgreSQL (Supabase)
 */
export function isPostgreSQL(): boolean {
  return getDatabaseProvider() === 'postgresql'
}

/**
 * Check if using SQLite (local development)
 */
export function isSQLite(): boolean {
  return getDatabaseProvider() === 'sqlite'
}

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Check if running in development mode
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development'
}

/**
 * Check if running in production mode
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production'
}

/**
 * Check if running in test mode
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test'
}

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURE FLAGS
// ═══════════════════════════════════════════════════════════════════════════════

export interface DatabaseFeatures {
  // PostgreSQL-specific features
  jsonb: boolean           // JSONB type and operators
  timestamptz: boolean     // Timezone-aware timestamps
  rls: boolean             // Row-Level Security
  gin: boolean             // GIN indexes for JSONB
  fullTextSearch: boolean  // Full-text search
  partialIndexes: boolean  // Partial (filtered) indexes
  upsertReturning: boolean // UPSERT with RETURNING

  // Connection features
  pooled: boolean          // Connection pooling (PgBouncer)
  directUrl: boolean       // Direct URL for migrations

  // Provider info
  provider: DatabaseProvider
}

/**
 * Get available database features based on provider
 */
export function getDatabaseFeatures(): DatabaseFeatures {
  const provider = getDatabaseProvider()
  const isPostgres = provider === 'postgresql'

  return {
    // PostgreSQL features
    jsonb: isPostgres,
    timestamptz: isPostgres,
    rls: isPostgres,
    gin: isPostgres,
    fullTextSearch: isPostgres,
    partialIndexes: isPostgres,
    upsertReturning: isPostgres,

    // Connection features
    pooled: isPostgres && !!process.env.DATABASE_URL?.includes('pgbouncer=true'),
    directUrl: !!process.env.DIRECT_URL,

    // Provider
    provider,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONNECTION CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConnectionConfig {
  url: string
  directUrl?: string
  provider: DatabaseProvider
  pooled: boolean
  ssl: boolean
  poolMin: number
  poolMax: number
  idleTimeout: number
  connectionTimeout: number
}

/**
 * Get connection configuration from environment
 */
export function getConnectionConfig(): ConnectionConfig {
  const provider = getDatabaseProvider()
  const url = process.env.DATABASE_URL || ''
  const isPooled = url.includes('pgbouncer=true')
  const isSupabase = url.includes('supabase')

  return {
    url,
    directUrl: process.env.DIRECT_URL,
    provider,
    pooled: isPooled,
    ssl: isProduction() || isSupabase,
    poolMin: parseInt(process.env.DB_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DB_POOL_MAX || '10', 10),
    idleTimeout: parseInt(process.env.DB_POOL_IDLE_TIMEOUT_MS || '30000', 10),
    connectionTimeout: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT_MS || '10000', 10),
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUPABASE CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface SupabaseConfig {
  enabled: boolean
  url?: string
  anonKey?: string
  serviceRoleKey?: string
  projectRef?: string
}

/**
 * Get Supabase configuration from environment
 */
export function getSupabaseConfig(): SupabaseConfig {
  const url = process.env.SUPABASE_URL
  const enabled = !!url

  // Extract project ref from URL
  let projectRef: string | undefined
  if (url) {
    const match = url.match(/https:\/\/([^.]+)\.supabase\.co/)
    projectRef = match?.[1]
  }

  return {
    enabled,
    url,
    anonKey: process.env.SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    projectRef,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// LOGGING CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

export interface LoggingConfig {
  logQueries: boolean
  slowQueryThreshold: number
  logLevel: 'error' | 'warn' | 'info' | 'debug'
}

/**
 * Get database logging configuration
 */
export function getLoggingConfig(): LoggingConfig {
  return {
    logQueries: process.env.DB_LOG_QUERIES === 'true',
    slowQueryThreshold: parseInt(process.env.DB_SLOW_QUERY_THRESHOLD_MS || '1000', 10),
    logLevel: isDevelopment() ? 'debug' : 'error',
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FULL DATABASE CONFIG
// ═══════════════════════════════════════════════════════════════════════════════

export interface DatabaseConfig {
  connection: ConnectionConfig
  features: DatabaseFeatures
  supabase: SupabaseConfig
  logging: LoggingConfig
  environment: 'development' | 'production' | 'test'
}

/**
 * Get complete database configuration
 */
export function getDatabaseConfig(): DatabaseConfig {
  let environment: DatabaseConfig['environment'] = 'development'
  if (isProduction()) environment = 'production'
  if (isTest()) environment = 'test'

  return {
    connection: getConnectionConfig(),
    features: getDatabaseFeatures(),
    supabase: getSupabaseConfig(),
    logging: getLoggingConfig(),
    environment,
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VALIDATION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Validate database configuration
 * Throws if critical configuration is missing
 */
export function validateDatabaseConfig(): void {
  const config = getDatabaseConfig()

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required')
  }

  if (config.connection.provider === 'unknown') {
    console.warn('[DB Config] Unknown database provider detected')
  }

  // Warn if using PostgreSQL without direct URL (needed for migrations)
  if (config.features.provider === 'postgresql' && !config.connection.directUrl) {
    console.warn(
      '[DB Config] DIRECT_URL not set - migrations may fail with connection pooling'
    )
  }

  // Warn if using Supabase without RLS consideration
  if (config.supabase.enabled && config.features.rls) {
    console.info('[DB Config] Supabase detected - RLS policies should be configured')
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default getDatabaseConfig
