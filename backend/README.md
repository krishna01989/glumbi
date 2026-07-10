# Glumbi — Backend

Spring Boot 3.2.5 REST API powering the Glumbi kids learning app.

---

## Tech Stack

- **Java 21** + Spring Boot 3.2.5
- **Spring Security** — stateless JWT authentication
- **Spring Data JPA** — PostgreSQL via Hibernate
- **WebFlux (WebClient)** — async calls to Anthropic Claude API and Voyage AI embeddings
- **pgvector** — PostgreSQL extension for 1024-dim vector similarity search (`<->` cosine distance)
- **Voyage AI** — `voyage-3` embedding model (1024 dimensions); called once per record at save time, async
- **Google Cloud TTS** — audio narration with WaveNet voices (default)
- **ElevenLabs API** — custom voice cloning for parent-recorded voices
- **Lombok** — boilerplate reduction
- **JJWT 0.11.5** — JWT signing and verification

---

## Project Layout

```
src/main/java/com/glumbi/
├── agent/          # Claude AI agents (story, quiz, writing coach, maze, riddle, safety guard…)
├── config/         # CORS, Security, Google credentials Spring config
├── controller/     # REST endpoints
├── dto/            # Request/response DTOs
├── entity/         # JPA entities
├── repository/     # Spring Data repositories
├── security/       # JwtFilter, JwtUtil
└── service/        # Business logic, TTS, rate limiting, quota tracking
                #   ↳ VoyageEmbeddingClient     — shared HTTP client for Voyage AI
                #   ↳ StoryEmbeddingService     — embed + store story vectors
                #   ↳ CuriosityEmbeddingService — embed + store curiosity entry vectors
                #   ↳ ActivityEmbeddingService  — embed + store activity vectors
                #   ↳ FeatureConfigSeeder       — seeds default feature configs on startup
```

### RAG / Semantic Similarity (pgvector + Voyage AI)

Glumbi implements a **two-path embedding strategy** for Stories, Curiosity, and Activities:

**Path 1 — Save time (async, once per record)**
When a record is created, `CompletableFuture.runAsync()` fires a background task that calls Voyage AI (`voyage-3`, 1024 dims) and writes the resulting vector to an `embedding` column via a native `UPDATE ... CAST(:embedding AS vector)` query. The request thread returns immediately — no blocking.

**Path 2 — Similarity fetch (zero API calls)**
`GET /{id}/similar` queries a native SQL JOIN that finds the nearest neighbours using the stored embedding:
```sql
SELECT t.* FROM table t
JOIN table ref ON ref.id = :id
WHERE t.child_id = :childId
  AND t.embedding IS NOT NULL
  AND t.id != :id
  AND ref.embedding IS NOT NULL
  AND (t.embedding <-> ref.embedding) < 0.9   -- distance threshold: filters out unrelated content
ORDER BY t.embedding <-> ref.embedding         -- pgvector L2 distance (ascending = most similar first)
LIMIT :limit
```
Voyage AI is never called at read time. All similarity lookups are pure pgvector.

**Why L2 distance `<->` with threshold `0.9`:**
Voyage AI embeddings are normalized to unit vectors, so L2 distance and cosine similarity are mathematically equivalent: `L2² = 2 × cosine_distance`. An L2 threshold of `0.9` corresponds to cosine similarity > 0.60 — close enough to surface genuinely related content (e.g. "what happens in sleep" ↔ "why do we dream", L2 ≈ 0.4–0.6) while filtering out unrelated topics (e.g. "why do fish swim" ↔ "why does the moon come at night", L2 > 1.0).

**Key design decisions:**
- `CompletableFuture.runAsync()` (not `@Async`) — `@EnableAsync` caused CGLIB proxy startup failures breaking all APIs.
- The lambda captures the Spring bean reference, so `@Transactional` on `embedAndSave` applies correctly in the background thread.
- Activities similar query includes `AND a.completed = true` — only shows activities the child has actually done.
- `VoyageEmbeddingClient.isConfigured()` guards all embedding calls — app runs normally without `VOYAGE_API_KEY`.

### Agents

| Agent | Purpose |
|---|---|
| `StoryAgent` | Generates personalised stories; also has `continueStory()` which takes the last 600 chars of a previous story as context and generates a next chapter |
| `ActivityAgent` | Generates activity suggestions from a story |
| `CuriosityAgent` | Generates daily curiosity / wonder questions |
| `ReadQuizAgent` | Generates comprehension quiz questions |
| `WritingCoachAgent` | Reviews a child's writing and gives feedback |
| `TranslationAgent` | Translates story title + content to a target language |
| `TraceAgent` | Generates a maze theme (start/end emoji, completion story, background colour) for a given child age and difficulty level. Used by the Maze feature. |
| `RiddleAgent` | Generates 5 age-appropriate riddles (question, hint, answer, emoji) for a child. Falls back to 3 safe defaults on parse failure. |
| `SafetyGuard` | Checks all AI output for child-appropriateness before saving |
| `RelevanceGuard` | Ensures writing submissions are on-topic |
| `ProgressReportAgent` | Generates weekly progress-report notifications per child |
| `MilestoneAgent` | Detects and notifies learning milestones |
| `StoryRecommendationAgent` | Recommends story topics based on past activity |
| `LearningInsightAgent` | Produces weekly learning insight summaries |
| `LearnToWriteAgent` | Summarises letters and words a child practised writing that week |

Weekly notification agents are toggled on/off individually via the admin panel. Each agent's enabled state is stored in `AppSetting`.

All agents call `AnthropicClient.callWithCachedSystem()` which sends the system prompt with `cache_control: ephemeral` for prompt caching. `PromptLoader` reads prompt templates from `src/main/resources/prompts/`.

### Key Controllers

| Controller | Base Path | Notes |
|---|---|---|
| `AuthController` | `/api/auth` | Register, login, Google OAuth, health check. Sets `quotaLimit` to current global default on new user creation. |
| `StoryController` | `/api/stories` | CRUD + `/listen` audio endpoint with HTTP Range support and optional `?voice=` param |
| `ActivityController` | `/api/activities` | Generate and list activities; `GET /{id}/similar` returns semantically similar completed activities via pgvector |
| `CuriosityController` | `/api/curiosity` | Daily curiosity questions; `GET /{id}/similar` returns semantically related questions via pgvector |
| `ReadQuizController` | `/api/readquiz` | Quiz generation and history |
| `WritingController` | `/api/writing` | Submit writing, get feedback, `POST /{id}/continue` generates a story continuation suggestion (not saved) |
| `LearnController` | `/api/learn` | Letter validation (vision AI), word identification, TTS audio for letters |
| `ChildController` | `/api/children` | Child profile management; `POST /{id}/checkin` updates the daily streak counter |
| `UserController` | `/api/users` | Parent quota (`/me/quota` reads counter), per-child credit breakdown (`/me/credit-breakdown` reads `AiUsageLog`) |
| `FamilyVoiceController` | `/api/voices` | CRUD for custom story voices — list, create (upload + clone via ElevenLabs), rename, delete. Capped at 5 voices per family. |
| `TraceController` | `/api/trace` | `POST /generate` — calls `TraceAgent` to produce a maze theme (emojis, story, bg colour) for the Maze feature. Feature key: `maze`. |
| `RiddleController` | `/api/riddle` | `POST /generate` — calls `RiddleAgent` to produce 5 age-appropriate riddles. Feature key: `riddle`. |
| `DemoController` | `/api/demo` | Unauthenticated demo (Turnstile protected) |
| `AdminController` | `/api/admin` | Admin-only: stats, users, agents, feature config, scheduler history. Dashboard AI credit total reads from `AiUsageLog`. SUPER_ADMIN endpoints: `POST /promote/{id}`, `POST /demote/{id}`, `POST /admin` (create admin). Hold/release blocked for `isAdminOrAbove()` targets — returns 403. |

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
| `ELEVENLABS_API_KEY` | ElevenLabs API key for custom voice cloning |
| `VOYAGE_API_KEY` | Voyage AI API key for semantic embeddings (`voyage-3` model). Optional — if absent, embedding is skipped but all other features work normally. |
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

## Database — pgvector Setup

pgvector must be enabled before the embedding columns are usable:

```sql
-- Enable the extension (once per database)
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding columns to the three content tables
ALTER TABLE stories           ADD COLUMN IF NOT EXISTS embedding vector(1024);
ALTER TABLE curiosity_entries ADD COLUMN IF NOT EXISTS embedding vector(1024);
ALTER TABLE activities        ADD COLUMN IF NOT EXISTS embedding vector(1024);
```

On Railway, pgvector is pre-installed. For local PostgreSQL, install the extension first (`brew install pgvector` on macOS or the official packages for Linux).

The app uses `ddl-auto: update` — it will not create these columns automatically because pgvector types are not JPA-managed. Run the DDL once manually.

---

## Running Locally

**Prerequisites:** Java 21, Maven 3.9+, PostgreSQL 14+ running on port 5432

```bash
# Create database
createdb glumbi

# From the backend/ directory
./mvnw spring-boot:run
```

API available at: http://localhost:8080/api  
Health check: http://localhost:8080/api/auth/health → returns `ok`

---

## Building

```bash
./mvnw package -DskipTests
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
- `TextToSpeechService` uses WaveNet voices; speaking rate is `0.90` (slightly slower for kids)
- Language → voice mapping lives in `TextToSpeechService.buildVoice()`; falls back to language-based defaults when no voice name is supplied

### Audio Caching (Three-layer)

| Layer | Scope | Behaviour |
|---|---|---|
| **Cloudflare R2** (`R2Service`) | Permanent — survives restarts/deploys | First listen → TTS generates → uploaded to R2 → URL stored in `story.audio_urls` (JSON map of `cacheKey → URL`). Future requests → backend returns **302 redirect** to R2; browser fetches audio directly from CDN. Cloudflare handles Range requests natively so seeking works. |
| **In-memory** (`ConcurrentHashMap`) | Server lifetime only | Used as fallback when R2 upload fails — bytes kept in memory so the same server session doesn't re-call TTS. Evicted on restart. |
| **R2 miss + offline mode** | Frontend guard | If `story.audioUrls` has no entry for the requested language/voice combo and the user is in practice mode (AI off), the frontend blocks the listen request before hitting the backend — avoids a TTS charge. |

Cache key format: `{storyId}:{language}` or `{storyId}:{language}:{voiceName}` or `{storyId}:{language}:el:{elevenLabsVoiceId}`

**On story delete**: all R2 objects for that story are deleted first (`R2Service.delete()` per cache key in `audio_urls`), then the DB row is removed. R2 cleanup failure is non-fatal.

**Env vars required** (all must be set for R2 to activate — missing any one disables R2 silently):

| Variable | Description |
|---|---|
| `R2_ACCESS_KEY_ID` | Cloudflare R2 API token access key |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 API token secret key |
| `R2_ACCOUNT_ID` | Cloudflare account ID |
| `R2_BUCKET_NAME` | R2 bucket name (e.g. `glumbi-audio-prod`) |
| `R2_PUBLIC_URL` | Public base URL for the bucket (e.g. `https://audio.glumbi.com`) |

CORS policy on the R2 bucket must expose `Content-Length`, `Content-Range`, and `Accept-Ranges` headers so the browser audio player can seek.

## Custom Voice Cloning (ElevenLabs)

- Parents can record or upload an audio sample and save it as a named voice (Mom, Dad, Granny…) — up to 5 per family
- `FamilyVoiceController.create()` sends the audio to ElevenLabs `POST /v1/voices/add` and stores the returned `voice_id` in the `family_voices` table
- Voice names in ElevenLabs are formatted as `Glumbi | {name} | User{id} | {timestamp}` to ensure uniqueness across users
- `GET /api/stories/{id}/listen?familyVoiceId=123` looks up the ElevenLabs `voice_id` for that record and calls `ElevenLabsService.synthesize()` using the `eleven_multilingual_v2` model — works for all 12 supported languages
- If ElevenLabs fails, the endpoint silently falls back to Google TTS
- `ElevenLabsService` is a no-dependency HTTP client using Java's built-in `HttpClient` — no extra libraries needed
- `ELEVENLABS_API_KEY` env var must be set; if absent, `ElevenLabsService.isConfigured()` returns false and voice cloning endpoints return 503

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

## Maze & Riddle Prompts

Prompt templates live in `src/main/resources/prompts/`:

| File | Used by | Description |
|---|---|---|
| `trace-user.txt` | `TraceAgent` | Generates a maze theme: start/end emoji, completion story, bg colour. Age-guide in prompt maps difficulty → expected vocabulary and theme complexity. |
| `riddle-user.txt` | `RiddleAgent` | Generates 5 riddles. Age-guide covers 5 brackets (3–4, 5–6, 7–8, 9–10, 11+). Returns JSON array with `question`, `hint`, `answer`, `emoji`. |

Both agents use `callWithCachedSystem()` — the system prompt block is cached via the Anthropic prompt caching API.

**Feature key note:** `TraceController` checks and deducts quota against feature key `"maze"` (not `"trace"`). The endpoint path `/api/trace/generate` is kept for backwards compatibility with the frontend `traceApi` client helper.

---

## Error Handling

- `GlobalExceptionHandler` catches `RelevanceException`, `SafetyException`, `MethodArgumentNotValidException`, `IllegalArgumentException`, `RuntimeException`, and `Exception` — all return a sanitised `{"error": "..."}` JSON body, never a stack trace or class name
- `application.yml` sets `server.error.include-message: never`, `include-stacktrace: never`, `include-exception: false`, `whitelabel.enabled: false` — Spring's default error endpoint is fully locked down
- Raw Apache/Nginx error pages, exception class names, and host details are never visible to the user

---

## Admin Role Hierarchy

Roles are stored as `AppUser.Role` enum: `USER < ADMIN < SUPER_ADMIN`.

- `AppUser.isSuperAdmin()` — returns `role == SUPER_ADMIN`
- `AppUser.isAdminOrAbove()` — returns `role == ADMIN || role == SUPER_ADMIN`
- `callerIsSuperAdmin(caller)` helper in `AdminController` — used for all privileged guards
- `SecurityConfig` uses `hasAnyRole("ADMIN", "SUPER_ADMIN")` to protect `/api/admin/**`
- `UserRepository.countByRole(AppUser.Role role)` — Spring Data JPA derived query, used by the last-super-admin self-delete guard

**DB note:** the `app_users` table has a CHECK constraint on the `role` column. Adding `SUPER_ADMIN` to the Java enum does not update the DB constraint automatically. If the constraint was created before `SUPER_ADMIN` existed, run:
```sql
ALTER TABLE app_users DROP CONSTRAINT app_users_role_check;
ALTER TABLE app_users ADD CONSTRAINT app_users_role_check
  CHECK (role IN ('USER', 'ADMIN', 'SUPER_ADMIN'));
```

**Admin accounts** are always password-only — they are created exclusively through the admin panel (`POST /api/admin/admin`) and have no Google OAuth path. `authMethod` is always `PASSWORD` for admin/super admin accounts.

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

`Child` has two streak fields: `streak_count` (integer, default 0) and `last_streak_date` (date). `ChildService.checkin()` implements the streak logic: same day → no-op; yesterday → increment; gap > 1 day → reset to 1. Called on every child profile open via `POST /api/children/{id}/checkin`.

`SchedulerRun` — one row per scheduler job execution; columns: `scheduler_id`, `started_at`, `finished_at`, `status` (`RUNNING` / `SUCCESS` / `FAILED`), `children_processed`, `agents_ran`, `agents_skipped`, `errors`

`AppSetting` — key/value store for feature flags and agent enabled states; `value` column is `TEXT` (widened from `VARCHAR(500)` to accommodate JSON history payloads)

`AiUsageLog` — permanent audit trail; one row per credit deduction with `user_id`, `child_id` (nullable), `feature_name`, `credits_used`, `used_at`. Never deleted on quota reset. Indexed on `(user_id, used_at)` and `(child_id, used_at)`. Admin dashboard and per-child breakdown read from this table so reset does not zero displayed totals.

> **Quota design:** `AppUser.monthlyApiCalls` is used for fast enforcement (incremented on every `tryConsume`). `AiUsageLog` is the source of truth for display — parent credit header reads the counter (reflects resets), admin dashboard and per-child breakdown read the log (permanent history).

> **New user quota:** `quotaLimit` is set to the current global default at registration time (not 0). Users without a personal override inherit the default stored at signup; changing the global default only affects future signups. To migrate existing users: `UPDATE app_user SET quota_limit = <new> WHERE quota_limit = <old>`.

> **Feature config seeding:** `FeatureConfigSeeder` inserts a default `FeatureConfig` row for each feature key on startup if none exists. Current keys: `story`, `activity`, `curiosity`, `read-quiz`, `writing-coach`, `learn-validate`, `learn-word`, `translation`, `draw`, `memory-flashcards`, `word-of-day`, `memory-match`, `journal-ai`, `draw-guide`, `maze`, `riddle`.

> **Note:** the `notifications.type` column has a CHECK constraint. When adding new `NotificationType` enum values, run:
> ```sql
> ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
> ALTER TABLE notifications ADD CONSTRAINT notifications_type_check
>   CHECK (type IN ('PROGRESS_REPORT','MILESTONE','STORY_RECOMMENDATION','LEARNING_INSIGHT','LEARN_TO_WRITE','QUOTA_WARNING'));
> ```
