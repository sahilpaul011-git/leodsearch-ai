# LeodSearch AI

A modern AI-powered search and knowledge discovery engine — combining real web search, AI-generated answers, source intelligence, and interactive learning tools.

**Live site:** https://sahilpaul011-git.github.io/leodsearch-ai/

## Tech stack

- **Frontend:** React, Vite, HTML5, CSS3
- **Backend:** Java 21, Javalin, Maven (see `backend/`)
- **Database:** PostgreSQL via Supabase (see `supabase/`)
- **AI:** Google Gemini API
- **Search:** Tavily Search API
- **Hosting:** GitHub Pages (frontend), Render (backend), Supabase (database)

## Status

🚧 In active development.

- [x] Frontend homepage with the dreamy midnight/web-network theme
- [x] Search results page (web results + AI knowledge mode), currently showing demo data
- [x] Java backend with real Tavily + Gemini integration, not yet deployed
- [x] Supabase database schema, not yet connected
- [ ] Backend deployed to Render
- [ ] Frontend connected to the live backend (`VITE_API_BASE_URL`)
- [ ] User accounts, saved searches, research collections, quizzes

## Going from demo data to a fully live site

The site works right now with clearly-labeled demo/mock search results.
To make it real:

1. **Get API keys:**
   - [Tavily](https://tavily.com) — free tier available, for real web search.
   - [Google AI Studio](https://aistudio.google.com/apikey) — free tier available, for Gemini AI answers.
2. **Deploy the backend** — see `backend/README.md` for full steps (deploys to Render using the included `render.yaml`).
3. **Connect the frontend to it:**
   - In this repo, go to **Settings → Secrets and variables → Actions → Variables**.
   - Add a variable named `VITE_API_BASE_URL` set to your backend's live URL (e.g. `https://leodsearch-backend.onrender.com`).
   - Push any small change (or re-run the "Deploy to GitHub Pages" workflow from the Actions tab) to rebuild the site with that URL baked in.
4. **Set up Supabase** — see `supabase/README.md` for the database schema; user accounts and saved data are a later stage on top of that.

## Local development

```bash
npm install
npm run dev
```
