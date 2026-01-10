// ════════════════════════════════════════════════════════════════════════════════
// HOSTLY PLATFORM - Database Health Check API
// ════════════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db/client'
import { getDatabaseFeatures, getConnectionConfig } from '@/lib/db/config'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface HealthResponse {
  status: 'healthy' | 'unhealthy' | 'degraded'
  database: {
    connected: boolean
    latencyMs: number
    provider: string
    features: {
      jsonb: boolean
      rls: boolean
      pooled: boolean
    }
  }
  timestamp: string
  version: string
}

/**
 * GET /api/health/db
 *
 * Database health check endpoint
 * Use for:
 * - Load balancer health checks
 * - Kubernetes readiness probes
 * - Monitoring dashboards
 */
export async function GET(): Promise<NextResponse<HealthResponse>> {
  const health = await checkDatabaseHealth()
  const features = getDatabaseFeatures()
  const config = getConnectionConfig()

  // Determine overall status
  let status: HealthResponse['status'] = 'healthy'
  if (!health.connected) {
    status = 'unhealthy'
  } else if (health.latencyMs > 500) {
    status = 'degraded'
  }

  const response: HealthResponse = {
    status,
    database: {
      connected: health.connected,
      latencyMs: health.latencyMs,
      provider: health.provider,
      features: {
        jsonb: features.jsonb,
        rls: features.rls,
        pooled: config.pooled,
      },
    },
    timestamp: health.timestamp,
    version: process.env.npm_package_version || '0.1.0',
  }

  // Return appropriate HTTP status code
  const httpStatus = status === 'healthy' ? 200 : status === 'degraded' ? 200 : 503

  return NextResponse.json(response, { status: httpStatus })
}
