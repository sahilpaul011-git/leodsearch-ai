# LeodSearch AI — Backend

Java 21 + Javalin REST API. Handles real web search (Tavily) and AI
explanations (Google Gemini), keeping both API keys server-side.

## Endpoints

| Method | Path                   | Purpose                                   |
|--------|------------------------|--------------------------------------------|
| GET    | `/api/health`          | Health check                               |
| POST   | `/api/search/web`      | Real web search results via Tavily         |
| POST   | `/api/search/knowledge`| Tavily sources + Gemini-written explanation|

Both POST endpoints expect `{"query": "..."}` as the JSON body.

## Required environment variables

| Variable               | Required | Purpose                                      |
|-------------------------|----------|-----------------------------------------------|
| `TAVILY_API_KEY`        | Yes, for search | Your Tavily Search API key              |
| `GEMINI_API_KEY`        | Yes, for AI answers | Your Google Gemini API key         |
| `PORT`                  | No (default 7070) | Port the server listens on          |
| `ALLOWED_ORIGIN`        | No (default `*`) | Your frontend's origin, for CORS     |
| `RATE_LIMIT_PER_MINUTE` | No (default 30) | Requests allowed per IP per minute   |
| `GEMINI_MODEL`          | No | Override the Gemini model name if needed      |

Without `TAVILY_API_KEY` / `GEMINI_API_KEY` set, the matching endpoint
responds with a clear `503 search_not_configured` / `503 ai_not_configured`
error instead of fabricating results.

## Running locally

```bash
export TAVILY_API_KEY=your_key
export GEMINI_API_KEY=your_key
mvn package
java -jar target/leodsearch-backend.jar
```

## Deploying to Render

This repo includes a `render.yaml` blueprint at the project root.

1. Go to [render.com](https://render.com) and sign in (GitHub login works).
2. Click **New** → **Blueprint**, and point it at this GitHub repository.
3. Render reads `render.yaml` automatically and proposes the `leodsearch-backend` service.
4. Before deploying, add your real values for `TAVILY_API_KEY` and `GEMINI_API_KEY` in the Render dashboard (they're marked `sync: false` so Render asks for them instead of expecting them in the file).
5. Deploy. Render builds the Docker image and gives you a live URL like `https://leodsearch-backend.onrender.com`.
6. Set that URL as `VITE_API_BASE_URL` in the frontend (see root README) and redeploy the frontend.
