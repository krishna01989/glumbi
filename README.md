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
| 🔒 **Safe & Private** | All content passes a safety guard before being shown to kids. |
| 🌍 **Multilingual** | Stories can be read and narrated in English, Spanish, French, Hindi, Tamil, and more. |

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
| Text-to-Speech | Google Cloud TTS (WaveNet voices) |
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
    └── Google Cloud TTS      (audio narration)
```

- Authentication: email+password (JWT) or Sign in with Google (OAuth 2.0)
- All JWT tokens are stateless and stored in `localStorage` (`glm_token`, `glm_role`)
- Audio is cached in-memory on the backend so seeking doesn't re-generate TTS

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

## Security Notes

- `.env`, `.env.local`, `.env.production` are gitignored — secrets are never committed
- `GOOGLE_CREDENTIALS_JSON` and `ANTHROPIC_API_KEY` live only in Railway dashboard env vars
- `TURNSTILE_SECRET_KEY` is server-side only — never exposed to the frontend
- All AI-generated content passes a `SafetyGuard` agent before being saved or returned

---

## License

Private — all rights reserved.
