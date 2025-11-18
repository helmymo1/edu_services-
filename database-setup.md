# Database Setup Guide

This guide will help you set up the Supabase database for the Academic Services Platform.

## Prerequisites

1. A Supabase account (sign up at [supabase.com](https://supabase.com))
2. A new Supabase project created

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** > **API**
3. Copy the following values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **anon public**: `eyJ...` (starts with `eyJ`)

### 2. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-actual-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key
   ```

### 3. Run Database Migrations

The database schema is located in `supabase/migrations/001_initial_schema.sql`. You can either:

**Option A: Run via Supabase Dashboard**
1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the contents of `supabase/migrations/001_initial_schema.sql`
3. Paste and run the SQL

**Option B: Use Supabase CLI**
1. Install [Supabase CLI](https://supabase.com/docs/guides/cli)
2. Run: `supabase db push`

### 4. Verify Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000` - you should see the homepage
3. Try signing up to test database connectivity

## Database Schema

The platform uses four main tables:

- **profiles**: User profiles linked to Supabase Auth
- **services**: Academic services offered by tutors
- **orders**: Service orders placed by clients
- **reviews**: Reviews for completed services

See `supabase/migrations/001_initial_schema.sql` for the complete schema.

## Security

The database uses Row Level Security (RLS) to ensure:
- Users can only access their own data
- Services are publicly readable but only editable by their creators
- Orders are visible to both clients and service providers

## Troubleshooting

**Error: "Invalid JWT"**
- Check that your environment variables are correctly set
- Verify your Supabase URL and keys are correct

**Error: "relation does not exist"**
- Ensure you've run the database migrations
- Check that tables were created successfully

**Error: "permission denied"**
- Ensure RLS policies are properly configured
- Check that you're authenticated when accessing protected data