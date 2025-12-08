# Audiophile E-commerce Website

> A full-stack e-commerce platform for premium audio equipment, built as a [Frontend Mentor](https://www.frontendmentor.io/challenges/audiophile-ecommerce-website-C8cuSd_wx) challenge solution.

## Live Demo

- **Website**: [fm-audiophile-ecommerce-website.zeabur.app](https://fm-audiophile-ecommerce-website.zeabur.app)
- **Admin Panel**: [/admin](https://fm-audiophile-ecommerce-website.zeabur.app/admin)
- **API Docs**: [/api/docs](https://fm-audiophile-ecommerce-website.zeabur.app/api/docs)
- **GitHub**: [View Source](https://github.com/Chious/fm-audiophile-ecommerce-website)

---

## Features

Users can:

- View responsive layouts optimized for any device
- See hover states for all interactive elements
- Add/remove products and edit quantities in cart
- Complete checkout with full form validation
- See accurate totals (shipping: $50, VAT: 20% of product total)
- View order confirmation with summary after checkout
- Persistent cart (survives page refresh)

**Bonus features** (beyond the challenge):

- Authentication system
- Admin panel for product management
- RESTful API with OpenAPI documentation
- Image storage with Vercel Blob

---

## Tech Stack

### Frontend

- **React** + **Next.js** - UI and server-side rendering
- **Tailwind CSS** - Styling
- **Vercel Blob** - Image storage

### Backend

- **Next.js API Routes** - RESTful endpoints
- **Elysia** - API framework with OpenAPI support
- **Drizzle ORM** - Type-safe database queries
- **Better Auth** - Authentication
- **PostgreSQL** (Neon) - Database

### Infrastructure

- **Zeabur** - Hosting and deployment
- **Docker** - Local development environment

---

## Quick Start

```bash
# 1. Install dependencies
git clone <repository-url>
cd fm-audiophile-ecommerce-website
bun install

# 2. Set up environment
cp .env.example .env.local

# 3. Start database
docker compose up postgres -d

# 4. Initialize database (migrations + seed)
bun run setup

# 5. Run development server
bun run dev
```

Visit [http://localhost:8000](http://localhost:8000)

---

## Prerequisites

Before you begin, ensure you have:

- **Bun** (v1.0.0+) - [Install here](https://bun.sh/)
- **Docker** + Docker Compose - [Install here](https://www.docker.com/)
- **Node.js** 20+ (if not using Bun)

### Installing Bun

```bash
# macOS/Linux
curl -fsSL https://bun.com/install | bash

# Windows PowerShell
powershell -c "irm bun.sh/install.ps1|iex"
```

---

## Detailed Setup

### 1. Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env.local
```

The defaults work for local development. Only modify if you have custom requirements.

### 2. Database Setup

**Start PostgreSQL container:**

```bash
docker compose up postgres -d
```

This starts PostgreSQL 16 on port `5432`.

**Initialize database:**

```bash
bun run setup
```

This command:

- Waits for database readiness
- Runs migrations (`db:push`)
- Seeds data automatically (skips if data already exists)

**Force re-seed:**

```bash
bun run db:seed --force
```

**Manual database management:**

```bash
bun run db:generate   # Generate new migrations (if schema changes)
bun run db:push       # Apply migrations
bun run db:seed       # Seed data
bun run db:studio     # Open Drizzle Studio (visual database manager)
```

### 3. Asset Storage (Optional)

To simulate Headless CMS asset storage:

1. Set up Vercel Blob credentials in `.env.local`:

   - `BLOB_READ_WRITE_TOKEN`
   - `BLOB_STORE_ID`

2. Upload assets:
   ```bash
   node upload-assets-to-vercel-blob.mjs
   ```

---

## Available Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `bun run dev`         | Start development server                 |
| `bun run build`       | Build for production                     |
| `bun run start`       | Start production server                  |
| `bun run setup`       | Complete database setup (migrate + seed) |
| `bun run db:push`     | Apply database migrations                |
| `bun run db:seed`     | Seed database with initial data          |
| `bun run db:studio`   | Open Drizzle Studio                      |
| `bun run db:generate` | Generate new migrations                  |

---

## Troubleshooting

### Database Connection Issues

**Problem:** Can't connect to database

**Solutions:**

1. Ensure Docker is running:

   ```bash
   docker ps
   ```

2. Check if port 5432 is available:

   ```bash
   lsof -i :5432
   ```

3. Verify `DATABASE_URL` in `.env.local` matches docker-compose settings

4. Ensure `.env.local` exists with correct `DATABASE_URL`

### Migration Issues

**Problem:** Migrations fail to apply

**Solutions:**

1. Reset database:

   ```bash
   docker-compose down -v
   docker-compose up -d
   ```

2. Regenerate migrations:
   ```bash
   bun run db:generate
   ```

---

## Documentation

- [Product Requirements Document](./.taskmaster/templates/prd.txt)
- [Database Design](./docs/DATABASE_DESIGN.md)

---

## My Process

### What I Learned

TL;DR

### Continued Development

TL;DR

### Useful Resources

- [Frontend Mentor Challenge](https://www.frontendmentor.io/challenges/audiophile-ecommerce-website-C8cuSd_wx)
- [Next.js Documentation](https://nextjs.org/docs)
- [Elysia Documentation](https://elysiajs.com/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)

---

## Author

- Website - [Add your name here](https://www.your-site.com)
- Frontend Mentor - [@yourusername](https://www.frontendmentor.io/profile/yourusername)
- Twitter - [@yourusername](https://www.twitter.com/yourusername)

---

## Acknowledgments

TL;DR
