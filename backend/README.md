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

### Key Controllers

| Controller | Base Path | Notes |
|---|---|---|
| `AuthController` | `/api/auth` | Register, login, Google OAuth, health check |
| `StoryController` | `/api/stories` | CRUD + `/listen` audio endpoint with HTTP Range support |
| `ActivityController` | `/api/activities` | Generate and list activities |
| `CuriosityController` | `/api/curiosity` | Daily curiosity questions |
| `ReadQuizController` | `/api/readquiz` | Quiz generation and history |
| `WritingController` | `/api/writing` | Submit writing, get feedback |
| `ChildController` | `/api/children` | Child profile management |
| `DemoController` | `/api/demo` | Unauthenticated demo (Turnstile protected) |
| `AdminController` | `/api/admin` | Admin-only endpoints |

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
- Generated audio is cached in-memory (`ConcurrentHashMap`) keyed by `storyId:language`
- `TextToSpeechService` uses WaveNet voices; speaking rate is `0.90` (slightly slower for kids)
- Language → voice mapping lives in `TextToSpeechService.buildVoice()`

---

## Authentication Flow

1. **Email/password** — `POST /api/auth/register` or `/api/auth/login` → returns JWT
2. **Google OAuth** — frontend gets Google ID token → `POST /api/auth/google` → backend verifies with Google, issues JWT
3. Every protected request must include `Authorization: Bearer <token>`
4. `JwtFilter` validates the token and sets `SecurityContextHolder` before the request reaches controllers

---

## Database Schema

Schema is managed by JPA `ddl-auto: update` — tables are created/altered automatically on startup. Main entities:

`AppUser` → `Child` → `Story`, `Activity`, `CuriosityEntry`, `ReadQuizEntry`, `WritingEntry`, `JournalEntry`
