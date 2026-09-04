# LeadForge AI

An AI-powered lead generation, website analysis, proposal, outreach, and CRM platform for freelancers and agencies (web dev, SEO, AI automation). Built by Chetan Saini.

> **This is the active LeadForge product** (`leadforge-ai`, MongoDB + JWT).  
> Do **not** confuse with the older scaffold in `ai lead generator saas` (Supabase + Stripe) — that folder is frozen.

> **Ethics & compliance:** LeadForge is built for *responsible* client acquisition. Lead discovery uses the official Google Places API (no grey-area scraping), and all outreach is **generate-and-review** — you approve and send messages yourself. It never fabricates reviews, testimonials, or client history.

## Features

| Module | Status |
|--------|--------|
| JWT auth + role-based access (first user = admin) | ✅ |
| Lead management + searchable dashboard + filters | ✅ |
| Website analysis engine (SEO/mobile/speed/design/conversion scores + issues) | ✅ (heuristic; PageSpeed-ready) |
| AI opportunity detector (priority, value, closing probability) | ✅ |
| Portfolio intelligence (auto-match real projects by business type) | ✅ |
| AI proposal generator (short / detailed / WhatsApp / email / LinkedIn) | ✅ |
| Outreach studio (cold / audit / redesign / automation / follow-up / closing) | ✅ |
| CRM Kanban pipeline with drag-and-drop | ✅ |
| Analytics dashboard with charts | ✅ |
| Built-in AI assistant (copilot) | ✅ |
| AI Lead Finder (Google Places), Meeting scheduler, n8n/Telegram | 🔜 interfaces stubbed |

**AI is optional.** With no `OPENAI_API_KEY`, every AI feature falls back to high-quality deterministic templates, so the app is fully usable and demoable for free.

## Tech stack

- **Next.js 15** (App Router, route handlers as the API) · React 19 · TypeScript
- **Tailwind CSS v4** · lucide-react · Framer Motion · Recharts · @dnd-kit
- **MongoDB Atlas** + Mongoose
- **Auth:** JWT (httpOnly cookie) + bcrypt · role-based access
- **AI:** OpenAI (Gemini/LangChain/CrewAI planned behind the same interface)
- **React Query** for client data

## Data models

`User`, `Business`, `Lead`, `Portfolio`, `Proposal`, `Outreach`, `Campaign`, `Meeting`, `Analytics`.

## Getting started

```bash
cp .env.example .env
# set MONGODB_URI and JWT_SECRET (OPENAI_API_KEY optional)
npm install
npm run dev
```

1. Open http://localhost:3000 → register (first account becomes admin).
2. Click **Load demo data** in the top bar to seed portfolios + sample leads.
3. Explore Leads → CRM → Proposals → Outreach → Analytics → Assistant.

Optional: `npm run seed` to insert the reference portfolios via CLI.

## Architecture notes

- One deployable Next.js app; the "backend" is `src/app/api/**` route handlers (Node runtime).
- `src/lib/ai/*` isolates all intelligence with template fallbacks so nothing breaks without keys.
- `src/lib/db.ts` caches the Mongoose connection across serverless invocations.
- Denormalized lead fields keep list/search fast without populate.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production setup.

## License

Private — all rights reserved.
