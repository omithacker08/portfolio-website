# PostgreSQL Setup for Production

## Option A: Render PostgreSQL (FREE)
1. Render Dashboard → New → PostgreSQL
2. Copy connection string
3. Add to environment variables:
   ```
   DATABASE_URL=postgresql://user:pass@host:port/db
   ```

## Option B: Supabase (FREE)
1. Go to supabase.com → New Project
2. Copy connection string
3. Add to environment variables

## Option C: Railway PostgreSQL (FREE)
1. Railway Dashboard → Add Service → PostgreSQL
2. Copy connection string
3. Connect to your backend service