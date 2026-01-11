#!/bin/sh
# ═══════════════════════════════════════════════════════════════════════════════
# HOSTLY PLATFORM - DOCKER ENTRYPOINT
# ═══════════════════════════════════════════════════════════════════════════════
# Validates required environment variables before starting the application
# ═══════════════════════════════════════════════════════════════════════════════

set -e

# ─── Color codes for output ────────────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# ─── Helper functions ──────────────────────────────────────────────────────────
log_info() {
    echo "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo "${RED}[ERROR]${NC} $1"
}

check_required() {
    local var_name=$1
    local var_value=$(eval echo \$$var_name)
    if [ -z "$var_value" ]; then
        log_error "Required environment variable $var_name is not set"
        return 1
    fi
    log_info "$var_name is set"
    return 0
}

check_optional() {
    local var_name=$1
    local var_value=$(eval echo \$$var_name)
    if [ -z "$var_value" ]; then
        log_warn "$var_name is not set (optional)"
    else
        log_info "$var_name is set"
    fi
}

# ─── Banner ────────────────────────────────────────────────────────────────────
echo ""
echo "╔═══════════════════════════════════════════════════════════════╗"
echo "║              HOSTLY PLATFORM - STARTING UP                    ║"
echo "╚═══════════════════════════════════════════════════════════════╝"
echo ""

# ─── Check required environment variables ──────────────────────────────────────
log_info "Validating environment variables..."
echo ""

ERRORS=0

# Database (Critical)
log_info "Checking database configuration..."
check_required "DATABASE_URL" || ERRORS=$((ERRORS + 1))

# Authentication (Critical)
log_info "Checking authentication configuration..."
check_required "JWT_SECRET" || ERRORS=$((ERRORS + 1))

# Validate JWT_SECRET length
if [ -n "$JWT_SECRET" ] && [ ${#JWT_SECRET} -lt 32 ]; then
    log_error "JWT_SECRET must be at least 32 characters"
    ERRORS=$((ERRORS + 1))
fi

# Stripe (Critical for payments)
log_info "Checking payment configuration..."
check_required "STRIPE_SECRET_KEY" || ERRORS=$((ERRORS + 1))
check_required "STRIPE_WEBHOOK_SECRET" || ERRORS=$((ERRORS + 1))

# Boom PMS (Critical for channel manager)
log_info "Checking channel manager configuration..."
check_required "BOOM_CLIENT_ID" || ERRORS=$((ERRORS + 1))
check_required "BOOM_CLIENT_SECRET" || ERRORS=$((ERRORS + 1))

echo ""

# ─── Check optional environment variables ──────────────────────────────────────
log_info "Checking optional configuration..."
echo ""

# Redis (Important for caching/rate limiting)
check_optional "UPSTASH_REDIS_REST_URL"
check_optional "UPSTASH_REDIS_REST_TOKEN"

# Email
check_optional "RESEND_API_KEY"
check_optional "EMAIL_FROM"

# Object Storage
check_optional "R2_ACCESS_KEY_ID"
check_optional "R2_BUCKET_NAME"

# App URLs
check_optional "NEXT_PUBLIC_APP_URL"
check_optional "NEXT_PUBLIC_API_URL"

echo ""

# ─── Fail if required variables are missing ────────────────────────────────────
if [ $ERRORS -gt 0 ]; then
    log_error "Missing $ERRORS required environment variable(s)"
    log_error "Please set all required environment variables before starting"
    echo ""
    echo "Required variables:"
    echo "  - DATABASE_URL       : PostgreSQL connection string"
    echo "  - JWT_SECRET         : JWT signing secret (min 32 chars)"
    echo "  - STRIPE_SECRET_KEY  : Stripe API key"
    echo "  - STRIPE_WEBHOOK_SECRET : Stripe webhook secret"
    echo "  - BOOM_CLIENT_ID     : Boom PMS client ID"
    echo "  - BOOM_CLIENT_SECRET : Boom PMS client secret"
    echo ""
    exit 1
fi

# ─── Display runtime configuration ─────────────────────────────────────────────
log_info "Environment validation complete"
echo ""
echo "Runtime Configuration:"
echo "  - NODE_ENV: ${NODE_ENV:-development}"
echo "  - PORT: ${PORT:-3000}"
echo "  - HOSTNAME: ${HOSTNAME:-0.0.0.0}"
echo ""

# ─── Start the application ─────────────────────────────────────────────────────
log_info "Starting Hostly Platform..."
echo ""

# Execute the main command
exec "$@"
