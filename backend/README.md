# Glumbi — Backend

Spring Boot 3.2.5 REST API powering the Glumbi kids learning app.

---

## Tech Stack

- **Java 21** + Spring Boot 3.2.5
- **Spring Security** — stateless JWT authentication
- **Spring Data JPA** — PostgreSQL via Hibernate
- **WebFlux (WebClient)** — async calls to Anthropic Claude API
- **Google Cloud TTS** — audio narration with WaveNet voices
- **Lombok** — boilerplate reduction
- **JJWT 0.11.5** — JWT signing and verification

---

## Project Layout

```
src/main/java/com/glumbi/
├── agent/          # Claude AI agents (story, quiz, writing coach, safety guard…)
├── config/         # CORS, Security, Google credentials Spring config
├── controller/     # REST endpoints
├── dto/            # Request/response DTOs
├── entity/         # JPA entities
├── repository/     # Spring Data repositories
├── security/       # JwtFilter, JwtUtil
└── service/        # Business logic, TTS, rate limiting, quota tracking
```

### Agents

| Agent | Purpose |
|---|---|
| `StoryAgent` | Generates personalised stories for a child |
| `ActivityAgent` | Generates activity suggestions from a story |
| `CuriosityAgent` | Generates daily curiosity / wonder questions |
| `ReadQuizAgent` | Generates comprehension quiz questions |
| `WritingCoachAgent` | Reviews a child's writing and gives feedback |
| `TranslationAgent` | Translates story title + content to a target language |
| `SafetyGuard` | Checks all AI output for child-appropriateness before saving |
| `RelevanceGuard` | Ensures writing submissions are on-topic |
| `ProgressReportAgent` | Generates weekly progress-report notifications per child |
| `MilestoneAgent` | Detects and notifies learning milestones |
| `StoryRecommendationAgent` | Recommends story topics based on past activity |
| `LearningInsightAgent` | Produces weekly learning insight summaries |
| `LearnToWriteAgent` | Summarises letters and words a child practised writing that week |

Weekly notification agents are toggled on/off individually via the admin panel. Each agent's enabled state is stored in `AppSetting`.

### Key Controllers

| Controller | Base Path | Notes |
|---|---|---|
| `AuthController` | `/api/auth` | Register, login, Google OAuth, health check. Sets `quotaLimit` to current global default on new user creation. |
| `StoryController` | `/api/stories` | CRUD + `/listen` audio endpoint with HTTP Range support and optional `?voice=` param |
| `ActivityController` | `/api/activities` | Generate and list activities |
| `CuriosityController` | `/api/curiosity` | Daily curiosity questions |
| `ReadQuizController` | `/api/readquiz` | Quiz generation and history |
| `WritingController` | `/api/writing` | Submit writing, get feedback |
| `LearnController` | `/api/learn` | Letter validation (vision AI), word identification, TTS audio for letters |
| `ChildController` | `/api/children` | Child profile management |
| `UserController` | `/api/users` | Parent quota (`/me/quota` reads counter), per-child credit breakdown (`/me/credit-breakdown` reads `AiUsageLog`) |
| `DemoController` | `/api/demo` | Unauthenticated demo (Turnstile protected) |
| `AdminController` | `/api/admin` | Admin-only: stats, users, agents, feature config, scheduler history. Dashboard AI credit total reads from `AiUsageLog`. |

---

## Environment Variables

Set these in your shell (local) or in Railway dashboard (production).

| Variable | Description |
|---|---|
| `PGHOST` | PostgreSQL host |
| `PGPORT` | PostgreSQL port (default `5432`) |
| `PGDATABASE` | Database name |
| `PGUSER` | Database user |
| `PGPASSWORD` | Database password |
| `ANTHROPIC_API_KEY` | Claude API key from [console.anthropic.com](https://console.anthropic.com) |
| `JWT_SECRET` | Random string ≥ 32 chars for signing JWTs |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (ends in `.apps.googleusercontent.com`) |
| `GOOGLE_CREDENTIALS_JSON` | Full Google service account JSON as a single line (for TTS) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile secret key (server-side verification) |
| `CORS_ALLOWED_ORIGINS` | Comma-separated allowed origins e.g. `https://glumbi.com,https://www.glumbi.com` |
| `PORT` | Auto-set by Railway — do not set manually |

### Local example (shell export)

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
export GOOGLE_CLIENT_ID=651167938020-...apps.googleusercontent.com
export JWT_SECRET=some-long-random-secret-string-here
# PGHOST/PGPORT/PGDATABASE/PGUSER/PGPASSWORD default to localhost:5432/glumbi/postgres/postgres
```

> For local dev, `GOOGLE_APPLICATION_CREDENTIALS` (file path) is used instead of `GOOGLE_CREDENTIALS_JSON` (JSON string). The `GoogleCredentialsConfig` bean handles both automatically.

---

## Running Locally

**Prerequisites:** Java 21, Maven 3.9+, PostgreSQL 14+ running on port 5432

```bash
# Create database
createdb glumbi

# From the backend/ directory
mvn spring-boot:run
```

API available at: http://localhost:8080/api  
Health check: http://localhost:8080/api/auth/health → returns `ok`

---

## Building

```bash
mvn package -DskipTests
java -jar target/glumbi-backend-0.0.1-SNAPSHOT.jar
```

---

## Docker

The `Dockerfile` lives at `backend/Dockerfile` and is a multi-stage build (Maven → JRE Alpine). Railway uses it via `railway.toml` at the repo root.

```bash
# Build from repo root
docker build -f backend/Dockerfile -t glumbi-backend .
docker run -p 8080:8080 --env-file backend/.env glumbi-backend
```

---

## Audio / TTS Notes

- `GET /api/stories/{id}/listen` returns the story as an MP3 audio stream
- Supports **HTTP Range requests** (`206 Partial Content`) so browsers can seek without re-generating audio
- Accepts optional `?voice=<voice-name>` param (e.g. `en-IN-Wavenet-B`) — when provided, the language code and gender are derived from the voice name itself
- Generated audio is cached in-memory (`ConcurrentHashMap`) keyed by `storyId:language:voice` — different voice selections each get their own cache entry
- `TextToSpeechService` uses WaveNet voices; speaking rate is `0.90` (slightly slower for kids)
- Language → voice mapping lives in `TextToSpeechService.buildVoice()`; falls back to language-based defaults when no voice name is supplied

## Schedulers

| Scheduler | Trigger | Description |
|---|---|---|
| `NotificationScheduler` | Weekly (Sunday midnight) | Runs enabled AI agents for each child and saves results as `Notification` records |
| `ApiQuotaService.resetAllMonthlyCounters` | Monthly (1st of month) | Resets per-user API quota counters |

Both schedulers follow an **insert-then-update** pattern in the `scheduler_runs` table:
1. Insert a row with `status = RUNNING` at job start
2. Update the same row to `SUCCESS` or `FAILED` with timing and error details when the job ends

This lets the admin panel show live job state rather than only completed runs.

## Learn to Write

- `POST /api/learn/validate` — accepts a base64 PNG of the child's canvas drawing and the target letter; uses Claude vision to validate it
- Validation is lenient by design: `correct = true` if **any** visible pen strokes are present; `false` only if the canvas is completely blank — this rewards effort regardless of accuracy
- AI feedback must mention the specific letter by name (not generic "great drawing" messages)
- On `correct = true`, an `Activity` record with `category = "learn"` is saved so the attempt appears in the Timeline
- `POST /api/learn/word` — same leniency rules, returns richer JSON (meaning, fun fact, emoji, translations)
- `GET /api/learn/audio` — TTS pronunciation for a letter or word

---

## Error Handling

- `GlobalExceptionHandler` catches `RelevanceException`, `SafetyException`, `MethodArgumentNotValidException`, `IllegalArgumentException`, `RuntimeException`, and `Exception` — all return a sanitised `{"error": "..."}` JSON body, never a stack trace or class name
- `application.yml` sets `server.error.include-message: never`, `include-stacktrace: never`, `include-exception: false`, `whitelabel.enabled: false` — Spring's default error endpoint is fully locked down
- Raw Apache/Nginx error pages, exception class names, and host details are never visible to the user

---

## Authentication Flow

1. **Email/password** — `POST /api/auth/register` or `/api/auth/login` → returns JWT
2. **Google OAuth** — frontend gets Google ID token → `POST /api/auth/google` → backend verifies with Google, issues JWT
3. Every protected request must include `Authorization: Bearer <token>`
4. `JwtFilter` validates the token and sets `SecurityContextHolder` before the request reaches controllers

---

## Database Schema

Schema is managed by JPA `ddl-auto: update` — tables are created/altered automatically on startup. Main entities:

`AppUser` → `Child` → `Story`, `Activity`, `CuriosityEntry`, `ReadQuizEntry`, `WritingEntry`, `JournalEntry`, `Notification`

`SchedulerRun` — one row per scheduler job execution; columns: `scheduler_id`, `started_at`, `finished_at`, `status` (`RUNNING` / `SUCCESS` / `FAILED`), `children_processed`, `agents_ran`, `agents_skipped`, `errors`

`AppSetting` — key/value store for feature flags and agent enabled states; `value` column is `TEXT` (widened from `VARCHAR(500)` to accommodate JSON history payloads)

`AiUsageLog` — permanent audit trail; one row per credit deduction with `user_id`, `child_id` (nullable), `feature_name`, `credits_used`, `used_at`. Never deleted on quota reset. Indexed on `(user_id, used_at)` and `(child_id, used_at)`. Admin dashboard and per-child breakdown read from this table so reset does not zero displayed totals.

> **Quota design:** `AppUser.monthlyApiCalls` is used for fast enforcement (incremented on every `tryConsume`). `AiUsageLog` is the source of truth for display — parent credit header reads the counter (reflects resets), admin dashboard and per-child breakdown read the log (permanent history).

> **New user quota:** `quotaLimit` is set to the current global default at registration time (not 0). Users without a personal override inherit the default stored at signup; changing the global default only affects future signups. To migrate existing users: `UPDATE app_user SET quota_limit = <new> WHERE quota_limit = <old>`.

> **Note:** the `notifications.type` column has a CHECK constraint. When adding new `NotificationType` enum values, run:
> ```sql
> ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
> ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
>   CHECK (type IN ('PROGRESS_REPORT','MILESTONE','STORY_RECOMMENDATION','LEARNING_INSIGHT','LEARN_TO_WRITE','QUOTA_WARNING'));
> ```
