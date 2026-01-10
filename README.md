# Hostly Platform

> The all-in-one platform for vacation rentals. Build stunning websites, manage bookings, and grow your business.

## Vision

**The Shopify of Vacation Rentals** - Every property owner gets a beautiful website, powerful booking engine, and smart tools to grow their business.

## First Tenant: Rently Luxury

Eilat's premier vacation rental brand, powered by Hostly.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Cache**: Redis (Upstash)
- **Payments**: Stripe Connect
- **Email**: Resend
- **Styling**: Tailwind CSS

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env.local

# Push database schema
pnpm db:push

# Generate Prisma client
pnpm db:generate

# Seed database
pnpm db:seed

# Start development server
pnpm dev
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Create account + organization
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/refresh` - Refresh token

### Properties
- `GET /api/v1/properties` - List properties
- `POST /api/v1/properties` - Create property
- `GET /api/v1/properties/:id` - Get property
- `PUT /api/v1/properties/:id` - Update property
- `DELETE /api/v1/properties/:id` - Delete property
- `POST /api/v1/properties/:id/publish` - Publish property

### Integrations
- `POST /api/v1/integrations/boom/sync` - Sync with Boom PMS

## Project Structure

```
hostly-platform/
├── prisma/
│   ├── schema.prisma    # Database schema (17 tables)
│   └── seed.ts          # Seed data for Rently
├── src/
│   ├── app/
│   │   ├── api/v1/      # REST API routes
│   │   └── page.tsx     # Landing page
│   ├── lib/
│   │   ├── auth/        # JWT authentication
│   │   ├── db/          # Prisma client
│   │   ├── integrations/ # Boom API client
│   │   ├── services/    # Business logic
│   │   └── utils/       # API helpers, ID generators
│   └── types/           # TypeScript definitions
└── package.json
```

## Architecture Highlights

- **Multi-tenant from Day 1**: Row-Level Security (RLS) ensures complete data isolation
- **Event-driven**: All changes logged to event store for audit trail
- **API-first**: Every feature accessible via REST API
- **Modular Monolith**: Clean service boundaries, extract when needed

## License

Proprietary - All rights reserved
