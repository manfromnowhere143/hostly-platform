# Hostly Platform - Production Deployment Architecture

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              PRODUCTION ARCHITECTURE                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│   ┌─────────────┐     ┌─────────────────────────────────────────────────────┐  │
│   │   CDN/LB    │────▶│                 HOSTLY WEB (CPU)                    │  │
│   │ (Cloudflare)│     │  ┌─────────────────────────────────────────────┐   │  │
│   └─────────────┘     │  │  Next.js 16 (App Router)                    │   │  │
│                       │  │  • SSR/SSG Pages                            │   │  │
│                       │  │  • API Routes (/api/v1/*, /api/public/*)    │   │  │
│                       │  │  • Webhooks (/api/webhooks/*)               │   │  │
│                       │  │  • Health Checks                            │   │  │
│                       │  └─────────────────────────────────────────────┘   │  │
│                       │  Port: 3000 | User: nextjs (1001) | Non-root       │  │
│                       └─────────────────────────────────────────────────────┘  │
│                                           │                                     │
│               ┌───────────────────────────┼───────────────────────────┐        │
│               │                           │                           │        │
│               ▼                           ▼                           ▼        │
│   ┌─────────────────────┐   ┌─────────────────────┐   ┌─────────────────────┐ │
│   │  PostgreSQL 15+     │   │  Upstash Redis      │   │  Cloudflare R2      │ │
│   │  (Supabase)         │   │  (Serverless)       │   │  (Object Storage)   │ │
│   │  • 14 tables        │   │  • Caching          │   │  • Property photos  │ │
│   │  • 50+ indexes      │   │  • Rate limiting    │   │  • CDN delivery     │ │
│   │  • Multi-tenant     │   │  • Session data     │   │                     │ │
│   └─────────────────────┘   └─────────────────────┘   └─────────────────────┘ │
│                                                                                  │
│   ┌─────────────────────────────────────────────────────────────────────────┐  │
│   │                        EXTERNAL SERVICES                                 │  │
│   │  • Stripe (Payments)      • Boom PMS (OTA Sync)     • Resend (Email)   │  │
│   └─────────────────────────────────────────────────────────────────────────┘  │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### A. Core Hostly Web Container (CPU Only)

| Aspect | Value |
|--------|-------|
| **Base Image** | `node:20-alpine` (slim, ~50MB) |
| **Final Image** | ~200MB (multi-stage build) |
| **Runtime User** | `nextjs` (UID 1001, non-root) |
| **Port** | 3000 |
| **Health Check** | `GET /api/health/db` |
| **Memory** | 512MB min, 2GB recommended |
| **CPU** | 0.5 core min, 2 cores recommended |

**Responsibilities:**
- Server-Side Rendering (SSR)
- Static Site Generation (SSG)
- API route handling
- Webhook processing
- Database operations via Prisma

### B. Database (PostgreSQL 15+)

**Production:** Supabase (managed)
- Connection pooling via PgBouncer (port 6543)
- Direct connection for migrations (port 5432)
- Row-Level Security for multi-tenancy
- Automatic backups

**Development:** Local PostgreSQL in Docker
- Port 5432
- No connection pooling needed

### C. Redis (Upstash)

**Production:** Upstash Serverless Redis
- REST API (no socket required)
- Global edge caching
- Pay-per-request pricing

**Development:** Local Redis in Docker
- Standard Redis 7 Alpine
- Port 6379

### D. Object Storage (Cloudflare R2)

- Property photos and media
- CDN delivery via custom domain
- S3-compatible API

---

## Prisma Strategy

### Build Time
```bash
# Generate Prisma client during Docker build
npx prisma generate
```

### Migration (NOT in entrypoint)
```bash
# Run migrations separately before deploying new version
DATABASE_URL="${DIRECT_URL}" npx prisma migrate deploy
```

**Rationale:**
- Migrations should be explicit, not automatic on every container start
- Allows rollback strategy
- Prevents race conditions in multi-instance deployments
- Uses DIRECT_URL (not pooled) for DDL operations

### Runtime
- Uses pooled connection (DATABASE_URL with PgBouncer)
- Prisma client generated at build time
- No Prisma CLI in production image

---

## Security Model

### Container Security
- Non-root user (UID 1001)
- Read-only filesystem (where possible)
- No dev dependencies in production
- Minimal Alpine base image
- No shell access in production (optional hardening)

### Secrets Management
- All secrets via environment variables
- No secrets in Dockerfile or image layers
- Use Docker secrets or external vault in production

### Network Security
- Only port 3000 exposed
- Database accessed via private network
- Webhook endpoints verify signatures (Stripe, Boom)

### Authentication
- JWT with short-lived access tokens (15m)
- Refresh tokens for session continuity (7d)
- bcryptjs for password hashing

---

## Scaling Strategy

### Horizontal Scaling
```
Load Balancer
     │
     ├── Hostly Web #1 (stateless)
     ├── Hostly Web #2 (stateless)
     └── Hostly Web #N (stateless)
           │
           ▼
    PostgreSQL + Redis (shared state)
```

**Stateless Design:**
- No local file storage (use R2)
- No local sessions (use Redis)
- No in-memory cache that can't be shared

### Vertical Scaling
- Increase container memory for larger SSR pages
- Increase CPU for more concurrent requests

---

## Optional: AI Studio (GPU Microservice)

**NOT currently needed** - no AI generation code found in repo.

If future AI features are added (e.g., property description generation, image enhancement):

```
┌─────────────────────────────────────────────────────────────────┐
│                    OPTIONAL AI STUDIO                            │
│  (Only if AI generation is added to product)                    │
├─────────────────────────────────────────────────────────────────┤
│  Container: hostly-ai-studio                                    │
│  Base: nvidia/cuda:12.x-runtime or python:3.11                  │
│  GPU: Required for inference (NVIDIA A10, T4, etc.)             │
│  API: POST /generate/description                                │
│       POST /generate/image-enhance                              │
│  Queue: Upstash QStash for async jobs                           │
│  Storage: Results written to R2                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Contract with Core:**
- HTTP API only (no shared code)
- Async jobs via queue
- Results stored in R2 with callback

---

## Environment Variables

### Required (Critical)
```bash
# Database
DATABASE_URL=           # Pooled connection (PgBouncer)
DIRECT_URL=             # Direct connection (migrations)

# Authentication
JWT_SECRET=             # Min 32 chars, random

# Payments
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Channel Manager
BOOM_CLIENT_ID=
BOOM_CLIENT_SECRET=
```

### Required (Features)
```bash
# Redis (for caching/rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Email
RESEND_API_KEY=
EMAIL_FROM=

# Object Storage
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
R2_ENDPOINT=
R2_PUBLIC_URL=
```

### Optional
```bash
# Feature Flags
FEATURE_BOOM_SYNC=true
FEATURE_STRIPE_PAYMENTS=true
FEATURE_EMAIL_NOTIFICATIONS=false

# Observability
NODE_ENV=production
LOG_LEVEL=info
```

---

## Health Checks

### Liveness Probe
```bash
curl -f http://localhost:3000/api/health/db || exit 1
```
- Interval: 30s
- Timeout: 10s
- Failure threshold: 3

### Readiness Probe
```bash
curl -f http://localhost:3000/api/health/db || exit 1
```
- Initial delay: 10s
- Interval: 10s
- Failure threshold: 3

---

## Deployment Recommendations

### Platform Options

| Platform | Pros | Cons |
|----------|------|------|
| **Vercel** | Zero-config Next.js, edge functions | Vendor lock-in, cost at scale |
| **Railway** | Simple Docker deploys, managed Postgres | Limited regions |
| **Fly.io** | Global edge, Docker-native | More complex networking |
| **AWS ECS/Fargate** | Enterprise-grade, full control | Complex setup |
| **DigitalOcean App Platform** | Simple, affordable | Limited auto-scaling |

### Recommended: Railway or Fly.io
- Native Docker support
- Managed PostgreSQL available
- Good for $10K-$100K MRR SaaS
- Easy horizontal scaling

### For Enterprise: AWS ECS + RDS
- Full control
- VPC isolation
- Multi-region possible
- Higher operational overhead

---

## Local Development

```bash
# Start local services
docker-compose up -d postgres redis

# Run migrations
pnpm db:migrate:deploy

# Start dev server
pnpm dev
```

---

## CI/CD Pipeline (Recommended)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t hostly:${{ github.sha }} .

      - name: Run migrations
        run: |
          docker run --rm \
            -e DATABASE_URL="${{ secrets.DIRECT_URL }}" \
            hostly:${{ github.sha }} \
            npx prisma migrate deploy

      - name: Deploy
        run: # Deploy to your platform
```

---

## Production Checklist

### Pre-Deployment

- [ ] All environment variables configured (see `env.template`)
- [ ] `DATABASE_URL` uses pooled connection (port 6543 for Supabase)
- [ ] `DIRECT_URL` uses direct connection (port 5432 for migrations)
- [ ] `JWT_SECRET` is at least 32 random characters
- [ ] Stripe webhook secret matches production endpoint
- [ ] Boom PMS credentials are production (not sandbox)

### Build Verification

- [ ] `pnpm build` completes without errors
- [ ] `docker build -t hostly .` succeeds
- [ ] Container starts: `docker run -p 3000:3000 hostly`
- [ ] Health check passes: `curl http://localhost:3000/api/health/db`

### Database

- [ ] Migrations deployed: `DATABASE_URL=$DIRECT_URL npx prisma migrate deploy`
- [ ] Connection pool limits configured appropriately
- [ ] Backup strategy in place (Supabase auto-backups)

### Security

- [ ] `NODE_ENV=production`
- [ ] `poweredByHeader: false` in Next.js config
- [ ] No secrets in Docker image layers
- [ ] Webhook signature verification enabled

### Monitoring

- [ ] Health endpoint monitored
- [ ] Error alerting configured
- [ ] Log aggregation setup
- [ ] Database query logging disabled (`DB_LOG_QUERIES=false`)

### DNS & CDN

- [ ] SSL certificates valid
- [ ] CDN caching rules configured
- [ ] CORS settings appropriate for production domain

### Post-Deployment

- [ ] Smoke test all critical paths
- [ ] Verify Stripe webhook delivery
- [ ] Verify Boom PMS integration
- [ ] Test email delivery
- [ ] Monitor error rates for first 24h
