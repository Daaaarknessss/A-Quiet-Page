# The Quiet Page

A private place to write one poem a day.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project at [supabase.com](https://supabase.com), then open the SQL editor and run [`supabase/schema.sql`](supabase/schema.sql) to create the `poems` table.

3. Copy `.env.example` to `.env` and fill in your project's URL and anon key (Project Settings → API):

   ```bash
   cp .env.example .env
   ```

4. Start the dev server:

   ```bash
   npm run dev
   ```

## Notes

- The app is built as a single-writer, private journal — the `poems` table is open to anyone with your anon key. If you ever expose this beyond yourself, add Supabase Auth and scope the row-level security policy in `schema.sql` to `auth.uid()`.
- Poem titles are derived automatically from the first line of each entry; there's no separate title field to keep the writing surface distraction-free.
