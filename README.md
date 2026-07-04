# 🎈 Glumbi

**Glumbi** is an AI-powered learning companion for kids. Parents create a profile for their child, and Glumbi generates personalised stories, activities, curiosity questions, reading quizzes, and writing exercises — all tailored to the child's age, interests, and learning goals.

Live at **[glumbi.com](https://glumbi.com)**

---

## Features

| Feature | Description |
|---|---|
| 📖 **Stories** | AI-generated stories personalised to the child's interests. Listen with Google TTS narration in 12 languages. |
| 🎯 **Activities** | Age-appropriate activity suggestions tied to each story. |
| 🔭 **Curiosity** | Daily "wonder" questions to spark curiosity and critical thinking. |
| 📝 **Read & Quiz** | Generate comprehension quizzes from any story topic. Track scores over time. |
| ✍️ **My Writing** | Kids write their own stories and get AI writing-coach feedback. |
| 🎨 **Draw** | Free-draw canvas for kids to illustrate their stories. |
| 📓 **Journal** | A private journal for kids to record their thoughts. |
| ✏️ **Learn to Write** | Guided letter and word tracing in English, Tamil, and Hindi. Canvas drawing validated by AI — any visible stroke counts as correct to encourage effort. Completed letters and words appear in the Timeline. |
| 🔐 **Parental Lock & Session Timer** | Parents set a 4-digit PIN and optional time limit before handing the device over. Timer starts the moment a child profile is opened (locked or unlocked) and resets whenever the parent returns to the child list. Children can extend time N configurable times (snoozes); once snoozes are exhausted, locked sessions require the PIN to continue and unlocked sessions return to the child list. |
| 🔒 **Safe & Private** | All content passes a safety guard before being shown to kids. Raw server errors, stack traces, and host details are never exposed to users. Static coral-themed error pages served by Vercel CDN for 404/500 even when the app is down. |
| 🌍 **Multilingual** | Stories can be read and narrated in English, Spanish, French, Hindi, Tamil, and more. Runtime voice picker lets kids choose accent (US, India, British, Australian) and gender (♀/♂) while listening. |
| 🎙️ **Custom Story Voices** | Parents can record their own voice (or a family member's) directly in the browser, or upload an audio file. Up to 5 named voices per family (Mom, Dad, Granny…). Stories are narrated in the selected voice across all languages. Voice selection is remembered per child. |
| 🔔 **Smart Notifications** | Weekly AI-generated notifications per child: Progress Reports, Milestones, Story Recommendations, Learning Insights, and Learn-to-Write summaries of letters and words practised that week. |

---

## Project Structure

```
glumbi/
├── backend/          # Spring Boot REST API
├── frontend/         # React + Vite SPA
├── backend/Dockerfile
├── railway.toml      # Railway deployment config
└── README.md
```

See the individual READMEs for setup details:

- [`backend/README.md`](backend/README.md) — Spring Boot API setup, environment variables, running locally
- [`frontend/README.md`](frontend/README.md) — React app setup, environment variables, running locally

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 4, React Router v7, Axios |
| Backend | Spring Boot 3.2.5, Spring Security, JPA |
| Database | PostgreSQL |
| AI | Claude Haiku 4.5 (Anthropic) |
| Text-to-Speech | Google Cloud TTS (WaveNet voices) + ElevenLabs (custom voice cloning) |
| Auth | JWT + Google OAuth 2.0 |
| Bot protection | Cloudflare Turnstile |
| Hosting | Vercel (frontend) + Railway (backend + DB) |
| Domain & DNS | Cloudflare |

---

## Architecture

```
Browser (glumbi.com)
    │
    ▼ HTTPS
Vercel CDN — React SPA (static)
    │
    ▼ API calls → api.glumbi.com
Railway — Spring Boot
    ├── PostgreSQL (Railway managed)
    ├── Anthropic Claude API  (story / quiz / writing generation)
    ├── Google Cloud TTS      (audio narration — default voices)
    └── ElevenLabs API        (custom voice cloning — when parent has set a voice)
```

- Authentication: email+password (JWT) or Sign in with Google (OAuth 2.0)
- All JWT tokens are stateless and stored in `localStorage` (`glm_token`, `glm_role`)
- Audio is cached in-memory on the backend so seeking doesn't re-generate TTS; cache key includes language and voice name so different voice selections each get their own cached file
- Scheduled jobs run weekly (notifications) and monthly (quota reset); each run is recorded in the `scheduler_runs` DB table with a RUNNING → SUCCESS/FAILED status pattern so admins can see live job state

---

## Deployment

| Service | URL |
|---|---|
| Frontend (Vercel) | https://glumbi.com |
| Backend (Railway) | https://api.glumbi.com |
| Health check | https://api.glumbi.com/api/auth/health |

Pushing to `main` triggers automatic deploys on both Vercel and Railway.

---

## Local Development (Quick Start)

**Prerequisites:** Java 21, Maven 3.9+, Node.js 18+, PostgreSQL 14+

```bash
# 1. Clone
git clone git@github.com:YOUR_USERNAME/glumbi.git
cd glumbi

# 2. Start backend (set env vars first — see backend/README.md)
cd backend && mvn spring-boot:run

# 3. Start frontend (in a new terminal)
cd frontend && npm install && npm run dev
```

Backend: http://localhost:8080  
Frontend: http://localhost:5173

---

## Admin Panel

Accessible at `/admin` by users with the `ADMIN` role.

| Section | Description |
|---|---|
| 📊 **Dashboard** | Usage metrics across users and children. Manual 🔄 refresh button + auto-refresh interval dropdown (1 min / 5 min / 15 min / 30 min). AI Credits this month sourced from `ai_usage_log` (never zeroed by quota reset). |
| 👥 **Users** | View, hold, release, reset passwords, adjust quotas, manage feature overrides. Quota bar and text colour reflect urgency: green → blue → amber → red based on usage %. |
| 🤖 **AI Agents** | Toggle individual weekly-notification agents on/off per agent type (Progress Report, Milestone, Story Recommendation, Learning Insight, Learn to Write). All toggles use a unified green/grey colour. |
| ⚙️ **Feature Credits** | Enable/disable features and set per-feature credit costs. Changing the global default applies immediately to all users without a personal override. |
| 🕒 **Scheduler History** | Live run history from the `scheduler_runs` table — shows RUNNING ⏳ / SUCCESS ✅ / FAILED ❌ state, children processed, agents ran/skipped, errors, and duration. |

---

## Security Notes

- `.env`, `.env.local`, `.env.production` are gitignored — secrets are never committed
- `GOOGLE_CREDENTIALS_JSON` and `ANTHROPIC_API_KEY` live only in Railway dashboard env vars
- `TURNSTILE_SECRET_KEY` is server-side only — never exposed to the frontend
- All AI-generated content passes a `SafetyGuard` agent before being saved or returned

---

## License

Private — all rights reserved.
