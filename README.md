# Frontend Mentor - Audiophile e-commerce website solution

This is a solution to the [Audiophile e-commerce website challenge on Frontend Mentor](https://www.frontendmentor.io/challenges/audiophile-ecommerce-website-C8cuSd_wx). Frontend Mentor challenges help you improve your coding skills by building realistic projects.

## Table of contents

- [Overview](#overview)
  - [The challenge](#the-challenge)
  - [Screenshot](#screenshot)
  - [Links](#links)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
  - [Available Scripts](#available-scripts)
  - [Troubleshooting](#troubleshooting)
- [My process](#my-process)
  - [Built with](#built-with)
  - [What I learned](#what-i-learned)
  - [Continued development](#continued-development)
  - [Useful resources](#useful-resources)
- [Author](#author)
- [Acknowledgments](#acknowledgments)

## Overview

### The challenge

Users should be able to:

- View the optimal layout for the app depending on their device's screen size
- See hover states for all interactive elements on the page
- Add/Remove products from the cart
- Edit product quantities in the cart
- Fill in all fields in the checkout
- Receive form validations if fields are missed or incorrect during checkout
- See correct checkout totals depending on the products in the cart
  - Shipping always adds $50 to the order
  - VAT is calculated as 20% of the product total, excluding shipping
- See an order confirmation modal after checking out with an order summary
- **Bonus**: Keep track of what's in the cart, even after refreshing the browser (`localStorage` could be used for this if you're not building out a full-stack app)

### Screenshot

![](./screenshot.jpg)

### Links

- Solution URL: [Add solution URL here](https://your-solution-url.com)
- Live Site URL: [Add live site URL here](https://your-live-site-url.com)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (v1.0.0 or higher)
- [Docker](https://www.docker.com/) and Docker Compose (for local database)
- Node.js 20+ (if not using Bun)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd fm-audiophile-ecommerce-website
```

2. **Install dependencies**

```bash
bun install
```

3. **Set up environment variables**

Copy the example environment file and fill in the values:

```bash
cp .env.example .env.local
```

**Note**: This project supports both `.env` and `.env.local` files. `.env.local` is recommended for local development as it's typically ignored by git.

Edit `.env.local` and configure the following:

```env
# Database (Development)
DATABASE_URL=postgresql://audiophile:audiophile123@localhost:5432/audiophile_db

# PostgreSQL (for docker-compose)
POSTGRES_USER=audiophile
POSTGRES_PASSWORD=audiophile123
POSTGRES_DB=audiophile_db
POSTGRES_PORT=5432

# Vercel Blob Storage (optional)
BLOB_READ_WRITE_TOKEN=your_blob_token_here

# Better Auth (optional)
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
```

### Database Setup

1. **Start PostgreSQL with Docker**

```bash
docker-compose up -d
```

This will start a PostgreSQL 16 container on port 5432.

2. **Generate database migrations**

```bash
bun run db:generate
```

3. **Apply migrations to database**

```bash
bun run db:push
```

Or use migrations:

```bash
bun run db:migrate
```

4. **Seed the database with initial data**

```bash
bun run db:seed
```

This will populate the database with products from `data/data.json`.

### Running the Application

1. **Start the development server**

```bash
bun run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

2. **Access API documentation**

OpenAPI documentation is available at [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

3. **Open Drizzle Studio (optional)**

To visually manage the database:

```bash
bun run db:studio
```

### Available Scripts

- `bun run dev` - Start development server
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run lint` - Run ESLint
- `bun run db:generate` - Generate database migrations
- `bun run db:push` - Push schema changes to database (development)
- `bun run db:migrate` - Run database migrations (production)
- `bun run db:studio` - Open Drizzle Studio
- `bun run db:seed` - Seed database with initial data

### Troubleshooting

**Database connection issues:**

- Ensure Docker is running and the PostgreSQL container is up: `docker ps`
- Check if the port 5432 is available: `lsof -i :5432`
- Verify DATABASE_URL in `.env.local` (or `.env`) matches docker-compose settings
- Make sure `.env.local` exists and contains `DATABASE_URL`

**Migration issues:**

- If migrations fail, try resetting the database: `docker-compose down -v` then `docker-compose up -d`
- Regenerate migrations: `bun run db:generate`

## My process

### Built with

- [React](https://reactjs.org/) - JS library
- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - For styles
- [Elysia](https://elysiajs.com/) - For API Endpoints
- [R2](https://developers.cloudflare.com/r2/) - For storage

### What I learned

TD;LR

### Continued development

TD;LR

### Useful resources

TD;LR

## Author

- Website - [Add your name here](https://www.your-site.com)
- Frontend Mentor - [@yourusername](https://www.frontendmentor.io/profile/yourusername)
- Twitter - [@yourusername](https://www.twitter.com/yourusername)

## Acknowledgments

TD;LR
