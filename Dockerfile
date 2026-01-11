# ═══════════════════════════════════════════════════════════════════════════════
# HOSTLY PLATFORM - PRODUCTION DOCKERFILE
# ═══════════════════════════════════════════════════════════════════════════════
# Multi-stage build for minimal production image (~200MB)
# Base: Node.js 20 Alpine | Runtime: Non-root user | Health checks included
# ═══════════════════════════════════════════════════════════════════════════════

# ───────────────────────────────────────────────────────────────────────────────
# Stage 1: Base - Install dependencies
# ───────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS base

# Install essential packages
RUN apk add --no-cache libc6-compat openssl

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# ───────────────────────────────────────────────────────────────────────────────
# Stage 2: Dependencies - Install all dependencies
# ───────────────────────────────────────────────────────────────────────────────
FROM base AS deps

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml* ./

# Copy Prisma schema (needed for postinstall)
COPY prisma ./prisma/

# Install all dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# ───────────────────────────────────────────────────────────────────────────────
# Stage 3: Builder - Build the application
# ───────────────────────────────────────────────────────────────────────────────
FROM base AS builder

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma client
RUN pnpm exec prisma generate

# Build arguments for public env vars (baked into client bundle)
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# Disable telemetry during build
ENV NEXT_TELEMETRY_DISABLED=1

# Build Next.js application
RUN pnpm build

# ───────────────────────────────────────────────────────────────────────────────
# Stage 4: Runner - Production runtime
# ───────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

# Install runtime dependencies only
RUN apk add --no-cache libc6-compat openssl curl

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build (includes minimal node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma client (generated during build)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma ./node_modules/@prisma

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set port environment variable
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health/db || exit 1

# Start application
ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["node", "server.js"]
