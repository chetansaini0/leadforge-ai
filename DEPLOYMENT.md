# Deployment guide — LeadForge AI

## 1. MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com.
2. Create a database user and allow network access (0.0.0.0/0 for Vercel, or Vercel's IPs).
3. Copy the connection string → this is your `MONGODB_URI` (append `/leadforge`).

## 2. Environment variables

| Key | Required | Notes |
|-----|----------|-------|
| `MONGODB_URI` | ✅ | Atlas connection string |
| `JWT_SECRET` | ✅ | Long random string (`openssl rand -hex 32`) |
| `OPENAI_API_KEY` | optional | Enables real AI; otherwise templates are used |
| `OPENAI_MODEL` | optional | Defaults to `gpt-4o-mini` |
| `GEMINI_API_KEY` | optional | Reserved for Gemini provider |
| `GOOGLE_PLACES_API_KEY` | optional | For the AI Lead Finder module |

## 3. Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

- Framework preset: **Next.js** (auto-detected).
- Add all env vars in Vercel → Project → Settings → Environment Variables.
- Redeploy after adding env vars.

The Mongoose connection is cached per serverless instance; no extra config needed.

## 4. Post-deploy

1. Visit the deployment URL and **register** — the first account is promoted to `admin`.
2. Click **Load demo data** to seed the reference portfolios and sample leads.
3. (Optional) Run `npm run seed` locally against the production `MONGODB_URI` to insert portfolios without demo leads.

## 5. Security checklist

- [x] Passwords hashed with bcrypt; JWT in httpOnly, `secure`, `sameSite=lax` cookie
- [x] Zod validation on every mutating route
- [x] Per-user ownership checks on all lead/proposal/outreach queries
- [x] In-memory rate limiting on auth + AI routes (swap for Upstash Redis at scale)
- [x] Secrets only via environment variables
- [ ] Add Upstash rate limiting + audit logging before heavy production traffic

## 6. Roadmap integrations (interfaces ready)

- **AI Lead Finder** → Google Places API (`GOOGLE_PLACES_API_KEY`)
- **Website analysis** → swap heuristic scorer for PageSpeed Insights API
- **Meeting scheduler** → Google Calendar / Zoom OAuth
- **Automation** → n8n webhooks, Telegram bot, Resend email
- **AI providers** → Gemini, LangChain, CrewAI behind `src/lib/ai/client.ts`
