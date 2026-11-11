# LeodSearch AI — Supabase setup

This folder holds the database schema. It is **not connected** to the app
yet — that's a later stage, once you have a Supabase project and the
frontend/backend are updated to call it.

## Setting up a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. In the project dashboard, go to **Authentication → Providers** and make sure **Email** sign-in is enabled (Google/GitHub sign-in can be added later the same way).
3. Go to **SQL Editor → New query**, paste the full contents of `schema.sql`, and run it. This creates every table (`profiles`, `search_history`, `saved_searches`, `saved_sources`, `research_collections`, `research_items`, `quizzes`, `quiz_questions`, `quiz_attempts`, `flashcards`, `user_preferences`) with Row-Level Security already enabled, so a user can only ever read or write their own data.
4. Go to **Project Settings → API** and copy:
   - **Project URL**
   - **anon public key**

These two values are safe to use in frontend code (they're public by design — RLS is what actually protects the data), but still shouldn't be committed into the repo; they'll go into a `.env` file once Supabase is wired into the app.

## What's next

Once you're ready, the next stage wires this up for real:
- Add the Supabase JS client to the frontend, with sign-up/login forms.
- Add a `profiles` row automatically on first sign-in.
- Point "save this search," "save this source," quiz history, etc. at these tables instead of only living in the browser.

Nothing in the app will claim a save succeeded until this wiring has
actually been built and tested against a live Supabase project.
