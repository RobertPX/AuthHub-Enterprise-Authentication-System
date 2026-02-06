# AuthHub - Enterprise Authentication System

A modern, secure, and scalable authentication system built with Next.js 14, TypeScript, and industry best practices. Ready for production deployment on Vercel.

## Features

- **Secure Authentication**: JWT access tokens with refresh token rotation
- **Password Security**: bcrypt hashing with configurable rounds
- **Role-Based Access Control**: USER, MANAGER, and ADMIN roles
- **Session Management**: Track and revoke sessions across devices
- **Rate Limiting**: Redis-powered protection against brute force attacks
- **Audit Logging**: Track login attempts, session activities, and user actions
- **Input Validation**: Zod schemas for type-safe validation
- **Modern UI**: Clean, responsive interface with Tailwind CSS and Radix UI

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Cache/Rate Limiting | Redis (Upstash) |
| Authentication | JWT + Refresh Tokens |
| Password Hashing | bcryptjs |
| Validation | Zod |
| Styling | Tailwind CSS |
| UI Components | Radix UI |
| Testing | Jest + Testing Library |

## Architecture

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── users/          # User management
│   │   ├── sessions/       # Session management
│   │   ├── roles/          # Role information
│   │   └── health/         # Health check
│   ├── (auth)/             # Auth pages (login, register)
│   └── (dashboard)/        # Protected pages
├── components/
│   ├── ui/                 # Base UI components
│   ├── auth/               # Auth-specific components
│   └── dashboard/          # Dashboard components
├── lib/                    # Core utilities
│   ├── prisma.ts          # Database client
│   ├── redis.ts           # Redis client
│   ├── jwt.ts             # Token generation/verification
│   ├── auth.ts            # Auth helpers
│   ├── rate-limit.ts      # Rate limiting
│   ├── errors.ts          # Error handling
│   └── logger.ts          # Structured logging
├── validators/             # Zod schemas
├── types/                  # TypeScript types
├── contexts/               # React contexts
├── hooks/                  # Custom hooks
└── __tests__/             # Test files
```

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/logout` | Logout and clear session | Yes |
| POST | `/api/auth/refresh` | Refresh access token | No* |
| GET | `/api/auth/me` | Get current user | Yes |

*Uses refresh token from cookie

### Users

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/users` | List all users | Yes | ADMIN |
| GET | `/api/users/:id` | Get user by ID | Yes | ADMIN/Owner |
| PATCH | `/api/users/:id` | Update user | Yes | ADMIN/Owner |
| DELETE | `/api/users/:id` | Delete user | Yes | ADMIN |

### Sessions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/sessions` | List user sessions | Yes |
| DELETE | `/api/sessions/:id` | Revoke session | Yes |

### Roles

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/roles` | List available roles | Yes |
| GET | `/api/roles/:id` | Get role details | Yes |

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | System health check |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database (Neon recommended)
- Redis instance (Upstash recommended)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd authhub
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file:
```env
# Database (Neon)
DATABASE_URL="postgresql://user:pass@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# JWT (generate secure random strings)
JWT_SECRET="your-super-secure-jwt-secret-at-least-32-characters"
JWT_REFRESH_SECRET="another-super-secure-refresh-secret-at-least-32-chars"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

5. Generate Prisma client and push schema:
```bash
npm run db:generate
npm run db:push
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000)

### Running Tests

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Setting Up External Services

### Neon (PostgreSQL)

1. Create account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string to `DATABASE_URL`

### Upstash (Redis)

1. Create account at [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Copy REST URL and Token to environment variables

## Deployment on Vercel

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Vercel

Add the following in Vercel's Environment Variables settings:
- `DATABASE_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_EXPIRES_IN`
- `JWT_REFRESH_EXPIRES_IN`
- `NEXT_PUBLIC_APP_URL` (your Vercel deployment URL)

## Security Features

- **Password Requirements**: Minimum 8 characters, uppercase, lowercase, and number
- **JWT Tokens**: Short-lived access tokens (15min default)
- **Refresh Token Rotation**: New refresh token on each refresh
- **HTTP-Only Cookies**: Tokens stored in secure, HTTP-only cookies
- **Rate Limiting**: Protection against brute force attacks
- **Input Validation**: All inputs validated with Zod
- **CORS Protection**: Configured for production
- **Audit Logging**: Track all authentication events

## Database Schema

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      Role     @default(USER)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sessions  Session[]
  auditLogs AuditLog[]
}

model Session {
  id           String   @id @default(cuid())
  userId       String
  refreshToken String   @unique
  ip           String?
  userAgent    String?
  createdAt    DateTime @default(now())
  expiresAt    DateTime
  user         User     @relation(...)
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  metadata  Json?
  ip        String?
  createdAt DateTime @default(now())
  user      User     @relation(...)
}

enum Role {
  USER
  MANAGER
  ADMIN
}
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:studio` | Open Prisma Studio |

## License

MIT

## Author

Built for demonstration and learning purposes.
