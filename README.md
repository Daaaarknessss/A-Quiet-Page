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

## Her page

- `/` is a landing page with two doors: **the desk** (`/studio`, the journal) and **For you** (`/for-you`).
- Run [`supabase/for_her.sql`](supabase/for_her.sql) once in the SQL editor. It adds `poems.shared`, plus the `moments` (her lines) and `replies` (her notes back) tables.
- Every poem you write appears in her book, oldest first.
- In the studio, the **For her** tab is where you write and order the lines, read her replies, preview her page and copy her link.
- Send her `/for-you` directly. She sees: a candle and one line → your lines drifting in one by one (tap to move on) → a candlelit room with your shared poems as a book, a closing note, and a box to write back.
- After she's seen the lines once, reopening the page goes straight to the room ("Begin again" replays it). `/for-you?preview` always starts from the beginning.
- Every other word on her page (threshold line, closing, signature, button labels) lives in [`src/lib/forHer.ts`](src/lib/forHer.ts).
- The song is `public/for-her.mp3`. It fades in when she taps the first screen and can be muted from the corner.

## Notes

- The app is built as a single-writer, private journal — the `poems` table is open to anyone with your anon key. If you ever expose this beyond yourself, add Supabase Auth and scope the row-level security policy in `schema.sql` to `auth.uid()`.
- Poem titles are derived automatically from the first line of each entry; there's no separate title field to keep the writing surface distraction-free.
