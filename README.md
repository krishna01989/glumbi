# 🎈 Glumbi

**Glumbi** is an AI-powered learning companion for kids. Parents create a profile for their child, and Glumbi generates personalised stories, activities, curiosity questions, reading quizzes, writing exercises, mazes, and riddles — all tailored to the child's age, interests, and learning goals.

Live at **[glumbi.com](https://glumbi.com)**

---

## Features

| Feature | Description |
|---|---|
| 📖 **Stories** | AI-generated stories personalised to the child's interests. Listen with Google TTS narration in 12 languages. "More like this" surfaces semantically similar past stories via pgvector. Stories can be continued as a multi-chapter series — chapters are grouped in the list and cascade-delete with the root. Similar stories exclude same-series chapters to avoid duplicate suggestions. |
| 🎯 **Activities** | Age-appropriate activity suggestions. ✦ button surfaces similar completed activities ranked by semantic similarity. |
| 🔭 **Curiosity** | Daily "wonder" questions to spark curiosity and critical thinking. 🔗 button shows related questions via semantic search. |
| 📝 **Read & Quiz** | Generate comprehension quizzes from any story topic. Track scores over time. |
| ✍️ **My Writing** | Kids write their own stories and get AI writing-coach feedback. Supports multi-chapter series: chapters are linked via `parentStoryId`/`seriesId`, grouped in the list, and the previous chapter's coaching tip is carried forward as a collapsible "Last time's tip" strip in the editor. Cascade-deletes the entire series when the root is removed. Character limit (4,000 chars) with a live warning counter prevents oversized feedback requests. |
| 🎨 **Draw** | Free-draw canvas with pencil, paint bucket fill, and eraser tools. AI "Bring to Life" button identifies what was drawn and plays a matching canvas animation — bees fly, flowers wiggle, rockets launch, and multi-object scenes interact (bee pollinates flower, dog fetches ball, etc.). Supports fullscreen mode. |
| 🎬 **Flipbook Studio** | Frame-by-frame animation studio. Draw on up to 24 frames, scrub through them, play back at 2/4/8/12 fps with a loop toggle, and download the result as a .webm video. Onion skin (👁️) shows the previous frame faintly for smooth animation reference. Drag-and-drop frame reordering with full touch support. "Blend Frames" mixes two adjacent frames pixel-by-pixel. Accessible via the Flipbook tab inside the Draw page. |
| 📓 **Journal** | A private journal for kids to record their thoughts. |
| ✏️ **Learn to Write** | Guided letter and word tracing in English, Tamil, and Hindi. Canvas drawing validated by AI — any visible stroke counts as correct to encourage effort. Completed letters and words appear in the Timeline. |
| 🌀 **Maze** | Procedurally generated mazes using a DFS algorithm — a new unique maze every time, never the same layout twice. Grid complexity scales by age: 4×3 for toddlers up to 11×7 for age 11+. Dead-end branches are structural (anything off the BFS solution path); tracing into one for 3+ cells triggers a "Dead end!" warning and auto-trims the wrong portion. AI themes generate age-appropriate emoji characters and completion stories. Supports fullscreen mode and touch tracing. |
| 🧩 **Riddles** | Claude crafts 5 age-appropriate riddles per round. Kids type the answer; hints are available. Two wrong attempts reveals the answer and moves on. Score tracked across the 5-riddle set. Bundled riddles work offline; AI generates fresh sets using one credit. |
| 🧠 **Memory Play** | Card-matching memory game with AI-generated themed card sets. |
| 🔐 **Parental Lock & Session Timer** | Parents set a 4-digit PIN and optional time limit before handing the device over. Timer counts only active foreground time — it pauses when the tab is hidden, when the device sleeps, and while the screen-time popup is open. Children can extend time N configurable times (snoozes); once snoozes are exhausted, locked sessions require the PIN to continue and unlocked sessions return to the child list. "I'm done" from the screen-time popup forces the PIN screen with no Cancel escape — the child cannot bypass back to the app. |
| 🔒 **Safe & Private** | All content passes a safety guard before being shown to kids. Raw server errors, stack traces, and host details are never exposed to users. Static coral-themed error pages served by Vercel CDN for 404/500 even when the app is down. |
| 🌍 **Multilingual** | Stories can be read and narrated in English, Spanish, French, Hindi, Tamil, and more. Runtime voice picker lets kids choose accent (US, India, British, Australian) and gender (♀/♂) while listening. |
| 🎙️ **Custom Story Voices** | Parents can record their own voice (or a family member's) directly in the browser, or upload an audio file. Up to 5 named voices per family (Mom, Dad, Granny…). Stories are narrated in the selected voice across all languages. Voice selection is remembered per child. |
| 🔔 **Smart Notifications** | Weekly AI-generated notifications per child: Progress Reports, Milestones, Story Recommendations, Learning Insights, and Learn-to-Write summaries of letters and words practised that week. |
| 🔥 **Daily Streak** | A streak counter in the nav rewards kids for opening Glumbi on consecutive days. Visiting on consecutive days increments the streak; missing a day resets it to 1. Streaks are stored per child so each profile has its own counter. |
| ▶ **Story Continuation & Series** | Any AI-generated story can be continued as a new chapter. Glumbi generates a follow-on chapter using the same characters and world, links it under the root via `seriesId`/`parentStoryId`, and groups the series in the list with chapter labels (Ch.1, Ch.2…). Deleting the root warns the parent and cascades to all chapters. |
| ✨ **"What happens next?" (My Writing)** | After reading a child's own written story, tap **What happens next?** to get an AI-suggested next chapter as inspiration. The child can adopt the suggestion into the editor and keep writing, or request a fresh idea. The suggestion is not saved automatically. |
| 🔐 **Password Reset** | Forgot-password flow with expirable UUID tokens (1 hour, UTC). Email sent via Resend. Token is validated on page load before showing the reset form — invalid or expired tokens get an error screen, not a blank form. No user enumeration: the API always returns 200 regardless of whether the email exists. |
| 📧 **Transactional Emails** | Full lifecycle email coverage via Resend API and Thymeleaf templates: onboarding welcome on signup, password reset link, password-changed notification (self / admin / reset link), weekly recap, quiet-week nudge (8 rotating messages), no-child-added nudge (7 rotating messages), credit quota warnings at 80% and 100% (once per month each), account suspended / reinstated / deleted confirmations. All templates use email-safe HTML (table-based layout, no CSS gradients), coral theme, Nunito font, Glumbi logo. |

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
| Embeddings | Voyage AI `voyage-3` (1024-dim semantic embeddings) |
| Vector search | pgvector — PostgreSQL extension for nearest-neighbour similarity |
| Text-to-Speech | Google Cloud TTS (WaveNet voices) + ElevenLabs (custom voice cloning) |
| Auth | JWT + Google OAuth 2.0 |
| Email | Resend API (transactional email) + Thymeleaf (HTML templates) |
| Bot protection | Cloudflare Turnstile |
| Real-time | WebSocket (analytics streaming) + gRPC / gRPC-Web bridge (event ingest) |
| Hosting | Vercel (frontend) + Railway (backend + DB) |
| Domain & DNS | Cloudflare |

---

## Architecture

```
Browser (glumbi.com)
    │
    ▼ HTTPS / WSS
Vercel CDN — React SPA (static)
    │
    ├── REST API calls   → api.glumbi.com/api/**
    ├── WebSocket        → api.glumbi.com/ws/events  (analytics streaming)
    └── gRPC-Web bridge  → api.glumbi.com/glumbi.ActivityEventService/**
Railway — Spring Boot (port 8080)
    ├── PostgreSQL + pgvector  (content + 1024-dim embeddings)
    ├── Anthropic Claude API   (story / quiz / writing / maze / riddle generation)
    ├── Voyage AI              (semantic embeddings — called once at save, async)
    ├── Google Cloud TTS       (audio narration — default voices)
    ├── ElevenLabs API         (custom voice cloning — when parent has set a voice)
    └── gRPC server (port 9090) — native gRPC for future mobile / service-to-service use
```

- Authentication: email+password (JWT) or Sign in with Google (OAuth 2.0)
- All JWT tokens are stateless and stored in `localStorage` (`glm_token`, `glm_role`)
- Audio is cached in three layers: **Cloudflare R2** (permanent CDN — backend returns a 302 redirect, browser fetches directly from Cloudflare), **in-memory fallback** (if R2 upload fails), and a **frontend guard** that blocks first-time TTS calls in practice mode (AI off). Cache key includes language and voice name so different voice selections each get their own entry. Story deletion cleans up R2 objects automatically.
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
cd backend && ./mvnw spring-boot:run

# 3. Start frontend (in a new terminal)
cd frontend && npm install && npm run dev
```

Backend: http://localhost:8080  
Frontend: http://localhost:5173

---

## Analytics System

Glumbi tracks child engagement through an offline-first, real-time analytics pipeline:

- **Transport:** `useActivityTracker` uses a persistent **WebSocket** connection (`/ws/events`) to stream events to the backend. Events queue in `localStorage` while offline or disconnected and flush on reconnect. The connection opens only when `childLocked = true` (parent sessions never generate events).
- **Reliability:** Events survive page refresh because localStorage is written synchronously before any send. `clientKey` UUIDs deduplicate retries server-side. Server sends `{"saved": N}` ACK; client only removes from queue after ACK.
- **Resilience:** WebSocket reconnects with exponential backoff (1s → 32s cap). Tab-hide closes the connection to free server resources; tab-visible reopens it. Server closes idle connections after 10 minutes; sends pings every 30s to detect dead connections.
- **gRPC / gRPC-Web bridge:** A native gRPC server runs on port 9090 (JWT-protected via `GrpcAuthInterceptor`) for future mobile / service-to-service use. A Spring MVC gRPC-Web bridge at `/glumbi.ActivityEventService/BatchEvents` allows browser clients to send protobuf-encoded batches over HTTP if needed.
- **Backend:** `ChildActivityEventService` computes daily/hourly activity, feature breakdown (session events only), engagement duration, streaks, and a 7×24 heatmap for admin.
- **Session vs event distinction:** Only `event_type = 'session'` events are counted in feature breakdowns and totals. Other event types (`correct`, `wrong`, `match`, `mismatch`, `complete`) are stored but excluded from aggregation queries.
- **UTC timestamps:** All entity timestamps use `LocalDateTime.now(ZoneOffset.UTC)` — never bare `LocalDateTime.now()` which picks up JVM system timezone (IST locally, unpredictable on Railway).
- **Timezone safety:** `normalizeTimezone()` maps legacy IANA names (e.g. `Asia/Calcutta` → `Asia/Kolkata`) before any DB query — Railway's PostgreSQL rejects the legacy forms.
- **Touch-friendly charts:** All bars and heatmap cells use click-based inline popups (no `title` attributes, which are hover-only and invisible on touch devices).

## Admin Panel

Accessible at `/admin` by users with the `ADMIN` or `SUPER_ADMIN` role. Admin accounts are always password-based (no Google OAuth) and are created exclusively through the admin panel — users cannot self-register as admins.

### Role hierarchy

| Role | Can do |
|---|---|
| `ADMIN` | Manage app users — reset passwords, adjust quotas, set feature overrides, hold/release, delete |
| `SUPER_ADMIN` | Everything an admin can do, plus: promote admins to super admin, demote super admins, create new admin accounts |

Guards: admins cannot touch other admin or super admin accounts. Super admins cannot be held, deleted, or have their password reset by regular admins. The last super admin cannot delete their own account.

### Sections

| Section | Description |
|---|---|
| 📊 **Dashboard** | Usage metrics across users and children. Manual 🔄 refresh button + auto-refresh interval dropdown (1 min / 5 min / 15 min / 30 min). AI Credits this month sourced from `ai_usage_log` (never zeroed by quota reset). |
| 👥 **Users** | Three sections — 👑 Super Admins, 🛡️ Administrators, 👤 App Users. Reset passwords, adjust quotas, manage feature overrides, hold/release (app users only), delete. Quota bar colour reflects urgency: green → blue → amber → red. |
| 🤖 **AI Agents** | Toggle individual weekly-notification agents on/off per agent type (Progress Report, Milestone, Story Recommendation, Learning Insight, Learn to Write). |
| ⚙️ **Feature Credits** | Enable/disable features globally and set per-feature credit costs. Budget simulator shows how a usage mix maps to credits. |
| 🕒 **Schedulers** | Manually trigger background jobs. Live run history from the `scheduler_runs` table — shows RUNNING ⏳ / SUCCESS ✅ / FAILED ❌ state, children processed, agents ran/skipped, errors, and duration. |

---

## Security Notes

- `.env`, `.env.local`, `.env.production` are gitignored — secrets are never committed
- `GOOGLE_CREDENTIALS_JSON` and `ANTHROPIC_API_KEY` live only in Railway dashboard env vars
- `TURNSTILE_SECRET_KEY` is server-side only — never exposed to the frontend
- All AI-generated content passes a `SafetyGuard` agent before being saved or returned

---

## License

Private — all rights reserved.
