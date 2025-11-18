# Academic Services Platform

A modern academic services marketplace built with Next.js 16, React 19, TypeScript, and Supabase. This platform connects students with qualified tutors for various academic services including essay writing, research assistance, tutoring, and more.

*Built with v0.app and automatically synced with deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/helmymhelmy22-4862s-projects/v0-academic-services-platform)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/sHozePStOjs)

## Features

- 🎓 **Academic Services**: Essay writing, research papers, tutoring, proofreading, and more
- 🔐 **Secure Authentication**: Supabase-based authentication with email verification
- 💳 **Order Management**: Complete order tracking and status management
- ⭐ **Review System**: Client ratings and reviews for service providers
- 📱 **Responsive Design**: Mobile-first design with Tailwind CSS
- 🚀 **Modern Stack**: Next.js 16, React 19, TypeScript, and Radix UI

## Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- A Supabase account and project

### 1. Clone and Install

```bash
git clone <repository-url>
cd v0-academic-services-platform
pnpm install
```

### 2. Set Up Database

Follow the detailed setup instructions in [`database-setup.md`](./database-setup.md) to:

1. Create a Supabase project
2. Configure environment variables
3. Run database migrations

### 3. Configure Environment

```bash
# Copy the example env file to create a local, private file for development
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials (see `.env.local.example`).

### 4. Run Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` to see the application.

## Deployment

Your project is live at:

**[https://vercel.com/helmymhelmy22-4862s-projects/v0-academic-services-platform](https://vercel.com/helmymhelmy22-4862s-projects/v0-academic-services-platform)**

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication flows
│   ├── browse/            # Service browsing
│   ├── dashboard/         # User dashboard
│   ├── orders/            # Order management
│   ├── service/           # Service details
│   └── tutor/             # Tutor functionality
├── components/            # Reusable React components
│   └── ui/               # UI component library
├── lib/                  # Utility functions
│   └── supabase/         # Supabase client configuration
├── supabase/             # Database migrations and setup
└── styles/               # Global styles
```

## Technology Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 19, TypeScript, Tailwind CSS
- **Components**: Radix UI with custom variants
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Vercel

## Development

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript type checking

### Dev smoke test and tips

- A simple smoke tester was added at `scripts/smoke.js` and an npm script to run it:

```powershell
# start the dev server in one terminal
npm run dev

# in another terminal wait for the server to respond (default 30s timeout)
npm run smoke

# or run with explicit url and timeout (seconds)
node ./scripts/smoke.js http://localhost:3000 60
```

- Note: the repo contains a `.env.example` and a `.env.local` placeholder was created for local development. Replace the `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` values in `.env.local` with your Supabase project's values before attempting auth-related flows.

If you prefer pnpm (recommended for this repo since it includes a pnpm lockfile):

```powershell
npm i -g pnpm
pnpm install
pnpm dev
```

### Database Schema

The platform uses four main tables:

- **profiles**: User profiles linked to Supabase Auth
- **services**: Academic services offered by tutors
- **orders**: Service orders placed by clients
- **reviews**: Reviews for completed services

See [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) for the complete schema.

## Build your app

Continue building your app on v0.app:

**[https://v0.app/chat/sHozePStOjs](https://v0.app/chat/sHozePStOjs)**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
- Check the [database setup guide](./database-setup.md)
- Review the [project documentation](./docs/)
- Open an issue in the repository

## License

This project is licensed under the MIT License.
