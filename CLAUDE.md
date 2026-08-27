# Glumbi — Project Context for Claude

## What is Glumbi?
An AI-powered kids learning platform. Parents create child profiles; kids access age-appropriate stories, drawing, journaling, curiosity Q&A, read-along quizzes, memory games, handwriting practice, mazes, riddles, and torch hunts. Every AI interaction is credit-gated and safety-guarded. Built by Krishna as a personal/portfolio project — currently used by his own kid.

## Stack

### Frontend
- **React 18** + **Vite** (no TypeScript — plain JSX)
- **React Router v7** for routing
- **Axios** for API calls via `src/api/client.js`
- **driver.js** for onboarding tours
- Deployed on **Vercel** (`frontend/vercel.json`)
- No CSS framework — all inline styles with occasional `<style>` blocks
- Font: **Nunito** throughout the entire app
- Design language: rounded corners (borderRadius 12–50), playful gradients, emoji-heavy UI

### Backend
- **Spring Boot 3.2.5** + **Java** + **Lombok**
- **PostgreSQL** (via JPA/Hibernate, `ddl-auto: update`)
- **Google Cloud TTS** for text-to-speech
- **Anthropic Claude API** (claude-haiku-4-5-20251001) for all AI features — raw HTTP via WebFlux, not SDK
- **ElevenLabs** (configured but secondary to Google TTS)
- Deployed on **Railway** (`railway.toml`)
- Port: `${PORT:8080}`

## Project Structure

```
glumbi/
├── frontend/
│   └── src/
│       ├── App.jsx              # Root orchestrator — layout, headers, bottom nav, SessionTimerPill (~600 lines)
│       ├── themes.js            # All theme definitions + THEME_GROUPS (12 groups, 50+ themes)
│       ├── tour.js              # Onboarding tour steps (driver.js)
│       ├── api/client.js        # Axios instance, base URL config
│       ├── hooks/
│       │   ├── useAuth.js          # Auth state, quota, feature config, logout
│       │   ├── useChildSession.js  # Child selection, offline mode, WOTD fetch, restore-from-URL
│       │   └── useLockSession.js   # PIN lock, screen time timer, snooze, session persistence
│       ├── contexts/
│       │   ├── OfflineContext.jsx  # Online/offline detection (consumed in ChildRoutes)
│       │   └── ThemeContext.jsx    # Active child theme object — useTheme() hook
│       ├── routes/
│       │   ├── PublicRoutes.jsx    # Unauthenticated routes (landing, login, legal)
│       │   └── ChildRoutes.jsx     # All child session routes with FeatureGuard
│       ├── layouts/
│       │   └── ManagementLayout.jsx  # Management header + mobile drawer (child list / profile / settings)
│       ├── pages/
│       │   ├── LandingPage.jsx  # Marketing page — hero, feature carousel (17 features, 7s auto-advance, custom SVG illustrations for Maze and TorchHunt)
│       │   ├── ChildList.jsx    # Child profile carousel (globe 3D transition, circular, touch swipe)
│       │   ├── ChildForm.jsx    # Add/edit child profile (includes delete with two-step confirm)
│       │   ├── AuthPage.jsx     # Login/signup with Google OAuth + Cloudflare Turnstile
│       │   ├── AdminPage.jsx    # Admin dashboard
│       │   ├── ProfilePage.jsx  # Parent account settings
│       │   └── HelpPage.jsx
│       ├── features/
│       │   ├── stories/Stories.jsx        # AI story generation + TTS playback + Glumbi Guide (phase state machine)
│       │   ├── draw/Draw.jsx              # Canvas drawing + AI "Bring to Life" animation overlay
│       │   ├── draw/FlipbookStudio.jsx    # Frame-by-frame flipbook animation studio (tab inside Draw); stamp tool fully removed
│       │   ├── draw/animationEngine.js    # Canvas animation engine: cutout extraction, animators, particles
│       │   ├── draw/animationLibrary.js   # Label → animation mapping (1000+ definitions)
│       │   ├── journal/Journal.jsx        # AI-assisted journaling; moods imported from constants/moods.js
│       │   ├── curiosity/Curiosity.jsx    # Ask-anything Q&A + Glumbi follow-up; selected entry inline, compact drawer rows
│       │   ├── learn/LearnPage.jsx        # Handwriting practice (canvas)
│       │   ├── readquiz/ReadQuiz.jsx      # Read-along + comprehension quiz + Glumbi intro/score reaction
│       │   ├── memory/MemoryPlay.jsx      # Memory matching game + Word of Day
│       │   ├── mywriting/MyWriting.jsx    # Writing portfolio; compact single-row history cards
│       │   ├── activities/Activities.jsx  # Activity suggestions
│       │   ├── timeline/Timeline.jsx      # Child progress timeline (tab inside ChildInsightsPage, not a standalone route)
│       │   └── torchhunt/TorchHunt.jsx   # Dark-arena object-finding game with dwell mechanic (see below)
│       ├── constants/
│       │   └── moods.js                   # Single source of truth for all 18 mood definitions (emoji, label, color, bg)
│       └── components/
│           ├── AppSidebar.jsx       # Left nav sidebar (desktop/tablet/TV)
│           ├── LockModal.jsx        # PIN lock/setup/unlock modal
│           ├── ScreenTimeModal.jsx  # Screen time alert with snooze options
│           ├── FeatureGuard.jsx     # Disabled-feature screen for feature-flagged routes
│           ├── MobileMenu.jsx       # Mobile slide-out drawer
│           ├── NotificationBell.jsx
│           ├── QuotaBadge/Banner.jsx  # AI credit usage display
│           ├── AudioPlayer.jsx
│           └── ThemeLoader.jsx
└── backend/
    └── src/main/java/com/glumbi/
        ├── agent/               # One agent class per AI feature (StoryAgent, CuriosityAgent, TorchHuntAgent, etc.)
        │   ├── AnthropicClient.java      # Raw HTTP calls to Claude API
        │   ├── SafetyGuard.java          # Pre-flight content safety check
        │   ├── RelevanceGuard.java       # Off-topic detection
        │   └── PromptLoader.java         # Loads prompts from resources
        ├── controller/          # REST endpoints, one per feature + GrpcWebBridgeController
        ├── grpc/                # gRPC server (port 9090), ProtoDecoder, GrpcAuthInterceptor
        ├── websocket/           # AnalyticsWebSocketHandler, AuthHandshakeInterceptor
        ├── service/
        │   ├── RateLimitService.java     # Bucket4j token bucket per user
        │   ├── ApiQuotaService.java      # Monthly credit tracking per parent
        │   ├── TorchHuntService.java     # Pack generate/refresh + duplicate key race handling
        │   └── FeatureConfigSeeder.java  # Feature flag defaults
        ├── entity/              # JPA entities — all timestamps use LocalDateTime.now(ZoneOffset.UTC)
        ├── repository/          # Spring Data JPA repos
        └── config/
            ├── SecurityConfig.java       # Spring Security + JWT; /ws/** is permitAll
            ├── CorsConfig.java           # Origins from CORS_ALLOWED_ORIGINS; no wildcard "*"
            ├── WebSocketConfig.java      # Registers /ws/events + AuthHandshakeInterceptor
            └── GoogleCredentialsConfig.java
```

## Key Patterns & Conventions

### Theming
- `themes.js` exports `THEMES` (object keyed by theme name) and `THEME_GROUPS` (12 groups for the theme picker)
- Each theme has: `primary`, `primaryLt`, `bg`, `headerGrad`, `cardBg`, `accent`, `avatarEmoji`
- `applyTheme(key)` sets CSS variables directly on `document.documentElement` — synchronous, no re-render needed
- Called with `useLayoutEffect` in App.jsx for the management-page reset (prevents theme flash before paint)
- Active child's theme object is published via `ThemeContext` — `AppSidebar` and `MobileMenu` read it with `useTheme()` instead of receiving it as a prop
- **Nav active-item style**: oval pill (`borderRadius: 50`) with `rgba(255,255,255,0.92)` background + `theme.primary` text — consistent across sidebar, hamburger menu, and admin sidebar
- **Both desktop and mobile headers use `theme.headerGrad`** — child name and age in white/translucent-white; buttons use `rgba(255,255,255,0.2)` frosted style with `rgba(255,255,255,0.35)` border. Do NOT revert desktop header to `background: white` — both must stay themed.

### ManagementLayout — Quota Pill & Promo Popup
- **Quota pill lives in the ManagementLayout desktop header** (not ChildList carousel). Background: `#f5f5f5` (neutral, not coral — coral made text unreadable on the themed header). Text colors are dark (`#15803d` / `#b45309` / `#cc0033`). Track color `rgba(0,0,0,0.08)`.
- `ℹ️` button in the pill fires `window.dispatchEvent(new CustomEvent('glumbi:credit-info'))` — opens the credit info modal (monthly breakdown). It does NOT show promo usage.
- **🎁 button** (separate from ℹ️) opens `PromoPopup` — a white card showing all promo grants with usage bars. Color scale matches the quota pill: exhausted/expired → `#d1d5db`, ≥100% → `#ff4444`, ≥80% → `#ffd93d`, ≥50% → `#3b82f6`, else → `#6bcb77`.
- `hasPromo = (quota?.totalPromoRemaining ?? 0) > 0 || (quota?.promoGrants?.length ?? 0) > 0` — 🎁 button shown when either condition is true
- `.quota-pill-carousel { display: none !important }` is injected globally — hides the old ChildList carousel pill on ALL screen sizes (it was moved to the header)

### Child Lock / Parental Controls (`useLockSession`)
- `childLocked` state — boolean, PIN-protected
- `lockModal` — `'setup'` | `'lock-verify'` | `'unlock'` | `null`
- `lockTimeLimit` — minutes, 0 = unlimited
- `lockMaxSnooze` — how many extensions allowed (parent sets at lock time)
- `screenTimeAlert` — shown when session timer expires; calls `document.exitFullscreen()` first to escape fullscreen top-layer
- Timer pauses when tab is hidden (visibilitychange) and corrects for device sleep (tick delta > 45s)
- Enforcement interval is **5 seconds** (down from 30s) so the lock popup fires within 5s of expiry
- All state lives in `hooks/useLockSession.js`; UI in `components/LockModal.jsx` + `components/ScreenTimeModal.jsx`

### Session Timer Pill (`SessionTimerPill` in `App.jsx`)
- Purely UI/UX — a 1-second `setInterval` in the pill drives display only; never touches lock logic
- Shows countdown (`m:ss`) with a ⏱️ stopwatch emoji (static — no rotation or flip animations)
- **Warning threshold**: `min(5 min, 20% of session)` — scales naturally across 10–45 min sessions
  - 10 min session → warns at 2 min left; 45 min session → warns at 5 min left
- **Panic threshold**: last 30 seconds
- **States**: normal (frosted `rgba(255,255,255,0.22)`) → warning (orange pulse `glm-timer-warn`) → panic (red multi-directional shake `glm-timer-panic`)
- Pill is `height: 20px, padding: 0 7px` — matches streak pill exactly; emojis use `lineHeight: 0, verticalAlign: 'middle'` to fix baseline alignment
- CSS keyframes (`glm-timer-warn`, `glm-timer-panic`) injected once into `document.head` via a module-level `timerStyleInjected` guard — never re-injected on re-renders
- **Do not add rotation/flip animations to the emoji** — they cause vertical misalignment in the pill

### AI Credits
- Per-parent monthly quota tracked in `ApiQuotaService`
- Each AI feature has a credit cost defined in `FeatureConfig`
- Frontend shows quota via `QuotaBanner` (inline on feature pages), quota pill in `ManagementLayout` header, and `CreditBreakdown` component
- `isCreditsBlocked(quota)` in `src/utils/quota.js` — returns true only when `quota.used >= quota.limit` AND `totalPromoRemaining <= 0`. Feature guards and `QuotaBanner` use this — neither blocks nor shows when active promo credits remain
- `QuotaBanner` uses `isCreditsBlocked(quota)` — returns null (hidden) when promo credits cover the exhausted monthly quota
- Quota API response (`GET /api/users/me/quota`) includes: `used`, `usedActual`, `limit`, `month`, `promoGrants[]`, `totalPromoRemaining`

### Quota Check Ordering (all controllers)
- **Always check quota BEFORE the AI call** — prevents wasting an API call when quota is exhausted
- Exception: controllers with a `SafetyGuard.SafetyException` catch (ReadQuiz, Writing) intentionally run AI first then consume quota, so a safety-blocked response still charges credits
- All 429 responses use the standard message: `"You've reached your monthly limit. It resets at the start of next month!"`

### Promo Credits System
- `PromoCampaign` entity — `Status` enum: `DRAFT`, `ACTIVE`, `MANUAL`. MANUAL campaigns are auto-created per-user for manual support grants; they are filtered out of the admin promo campaigns list
- `PromoCreditGrant` entity — `@ManyToOne(fetch=LAZY) PromoCampaign campaign` (FK on `campaign_id`). Helper `getCampaignId()` delegates to `campaign.getCampaignId()`. Fields `label`, `totalCredits`, `expiresOn` are denormalized for EEF query self-containment
- EEF (earliest-expiry-first) draw order: `findActiveForUser` orders by `expiresOn ASC`; `atomicDraw` updates `usedCredits`
- `PromoCreditService.grantToUser(userId, campaign, grantedBy)` — reads label/credits/expiresOn from the campaign object; dedup check via `existsByUserIdAndCampaignCampaignId`
- Manual grant endpoint `POST /admin/users/{id}/promo-grants` — auto-creates a `PromoCampaign(MANUAL)` with campaignId `"manual-{date}-u{id}[-N]"` (suffix increments to allow multiple grants per user per day), then calls `grantToUser`
- DRAFT campaigns are editable (label, credits, expiresOn) via `PUT /admin/promo-campaigns/{campaignId}`; campaignId is read-only once created
- **Railway SQL required when first deploying MANUAL status**:
  ```sql
  ALTER TABLE promo_campaigns DROP CONSTRAINT promo_campaigns_status_check;
  ALTER TABLE promo_campaigns ADD CONSTRAINT promo_campaigns_status_check
    CHECK (status IN ('DRAFT', 'ACTIVE', 'MANUAL'));
  ALTER TABLE promo_credit_grants ADD CONSTRAINT fk_grant_campaign
    FOREIGN KEY (campaign_id) REFERENCES promo_campaigns(campaign_id);
  ```
- `ddl-auto: update` never modifies existing DB check constraints — any enum expansion always needs a manual Railway SQL update

### Rate Limiting
- `RateLimitService` uses Bucket4j — token bucket per userId
- Applied at controller level before Claude API calls
- Buckets stored in a **Caffeine cache** (`expireAfterAccess(2h)`) — not a raw `ConcurrentHashMap` — so idle-user entries are evicted and memory stays bounded
- TTL configurable via `app.cache.rate-limit-ttl-hours` in `application.yml`

### Caching
- TTS audio (`StoryController`, `LearnController`) uses a **Caffeine cache** bounded by size + TTL: max 200 entries, 6h access TTL — configurable via `app.cache.tts-max-size` and `app.cache.tts-ttl-hours`
- Word of Day (`MemoryPlayService`) uses a **Caffeine cache** keyed by `childId:date`, 25h write TTL, max 500 entries — avoids a DB hit on every child session start for the same-day word; configurable via `app.cache.wotd-ttl-hours`; 25h default ensures it always outlives the calendar day
- Rate-limit buckets (`RateLimitService`) use a **Caffeine cache** with `expireAfterAccess(2h)` — configurable via `app.cache.rate-limit-ttl-hours`
- `PromptLoader` uses a `ConcurrentHashMap` (unbounded, but prompt files are finite and fixed at startup — no eviction needed)
- `AnalyticsWebSocketHandler.sessions` is a `ConcurrentHashMap` of live WebSocket sessions — not a cache, entries are explicitly added/removed on connect/disconnect

### Async / Concurrency
- Embedding after save (`CuriosityService`, `ActivityService`) uses `CompletableFuture.runAsync(..., embeddingExecutor)` with a **dedicated fixed thread pool** instead of the shared `ForkJoinPool`
- Pool size configurable via `app.embedding.thread-pool-size` (default 4); bean defined in `AsyncConfig` with `destroyMethod = "shutdown"`
- **No `@EnableAsync`** — it triggered CGLIB proxy startup failures; `CompletableFuture.runAsync()` at call sites is used instead

### Quota — Atomic Credit Deduction
- `ApiQuotaService.consumeCredits` previously had a TOCTOU race (read → check → write)
- Fixed with `UserRepository.atomicDeductCredits` — a single JPQL `UPDATE ... WHERE monthly_api_calls + cost <= limit`; returns 1 if deducted, 0 if quota exceeded
- Month rollover is handled before the atomic update (idempotent save), so the UPDATE always sees the current month
- **Server-side consent gate**: admins and super-admins are exempt (unlimited AI access); all other users must have `consentGiven = true` before any credit is consumed — if not, `consumeCredits` returns `false` immediately

### Timeline
- Lives at `src/features/timeline/Timeline.jsx` — rendered as the third tab of `ChildInsightsPage` (`/child/:id/insights?tab=timeline`); there is no standalone `/child/:id/timeline` route
- Accepts `child` and `t` (theme object) props; uses `t.primary` / `t.primaryLt` directly — management routes don't call `applyTheme`, so `var(--primary)` would stay coral without this
- Backend: `TimelineController` → `TimelineService.getPage(childId, Pageable, from, to, type)` returns `Page<Map<String,Object>>`
  - Uses Spring `@PageableDefault(size=15) Pageable` — frontend passes `page` and `size` query params; Spring binds them automatically
  - Server-side type filter: `type` param validated against a whitelist, then applied as `WHERE type = 'x'` on the outer query wrapper — prevents client-side pagination breaking when filtering
  - Boolean fields (`completed`, `favorite`, `feedbackReceived`) use `parseBool()` which handles PostgreSQL's `CAST(boolean AS CHAR)` returning `'t'`/`'f'` in addition to `'1'`/`'true'`
- Frontend reads `data.content`, `data.totalElements`, `data.totalPages` from the Spring `Page` response (not the old `items`/`totalItems` shape)
- Type filter and date preset both reset `page` to 0 and clear `items` on change (two separate `useEffect`s)

### Journal Moods
- 18 moods defined in `src/constants/moods.js` (single source of truth): Happy, Excited, Proud, Grateful, Loved, Curious, Calm, Bored, Tired, Nervous, Scared, Sad, Angry, Grumpy, Silly, Surprised, Confused, Sick
- Both `Journal.jsx` and `Timeline.jsx` import `MOODS` / `moodFor()` from there — never duplicate the list
- Mood pills in the Journal editor are compact: unselected shows emoji only (touch-friendly, saves space); selected expands to emoji + label with colour border/background
- Timeline journal entries render the mood as a coloured pill (same style as Journal's past-entries list)

### External API Retry Strategy
All WebClient-based external API calls use `Retry.backoff(...).filter(e -> e instanceof IOException || e instanceof SocketException)` to handle transient `Connection reset` errors. R2Service (AWS SDK) and ElevenLabsService have their own retry mechanisms and are excluded.

| Client | Retries | Backoff | Notes |
|---|---|---|---|
| `ResendClient` (`send`) | 3 | 2s | Fire-and-forget; timeout bumped to 10s |
| `ResendClient` (`sendBatch`) | 3 | 2s | Batch endpoint, 30s timeout |
| `AnthropicClient` | 2 | 2s | Synchronous `.block()` on request path |
| `VoyageEmbeddingClient` | 2 | 2s | Idempotent embedding call |
| `AuthController` (Google token verify) | 2 | 1s | Login path — faster backoff |

### Email Service (Resend)
- `ResendClient` (`backend/src/main/java/com/glumbi/service/ResendClient.java`) — WebClient-based fire-and-forget email sender. `send()` uses 10s timeout for single emails; `sendBatch()` uses Resend's `/emails/batch` endpoint (up to 100 per call) with 30s timeout for bulk sends. Env vars: `RESEND_API_KEY`, `RESEND_FROM`, `RESEND_SEND_URL`, `RESEND_BATCH_URL`, `RESEND_ENABLED` (Railway); all configurable via `application.yml`. `RESEND_ENABLED=false` is a global kill switch that silences all emails instantly.
- `EmailTemplates` (`backend/src/main/java/com/glumbi/service/EmailTemplates.java`) — Spring `@Component` using Thymeleaf `TemplateEngine`. Salutation is `"Dear Glumbi Admin,"` for `ADMIN`/`SUPER_ADMIN` roles and `"Dear Glumbi User,"` for app users.
- All templates use email-safe HTML (table layout, no gradients/border-radius/box-shadow), Nunito font via Google Fonts link, coral theme (`#ff6b6b`), Glumbi logo from `https://glumbi.com/logo.svg`.
- All transactional emails (except password reset/changed) are guarded to fire only for `USER` role — admins never receive parent-facing emails.

#### Email templates (`backend/src/main/resources/templates/email/`)

| Template | Method | Variables | Trigger |
|---|---|---|---|
| `onboarding.html` | `onboarding()` | — | New account created (password or Google) |
| `password-reset.html` | `passwordReset(resetUrl)` | `resetUrl` | Forgot password request |
| `password-changed.html` | `passwordChanged(context)` | `context` | Password changed (self / admin / reset link) |
| `weekly-recap.html` | `weeklyRecap(childName, recapText)` | `childName`, `recapHtml` | Weekly scheduler — child has activity |
| `quiet-week.html` | `quietWeek(childName)` | `childName`, `message` | Weekly scheduler — child has no activity (8 rotating messages) |
| `no-child.html` | `noChildAdded()` | `message` | Weekly scheduler — parent has no children (7 rotating messages) |
| `quota-warning.html` | `quotaWarning(usedPercent)` | `usedPercent` | 80% and 100% credit thresholds (once per month each, guarded by `quotaWarnMonth`/`quotaExhaustedMonth`) |
| `account-on-hold.html` | `accountOnHold()` | — | Admin suspends account — no reason shown in email (reason is internal only) |
| `account-released.html` | `accountReleased()` | — | Admin reinstates account |
| `account-deleted-by-admin.html` | `accountDeletedByAdmin()` | — | Admin deletes a user account |
| `account-deleted-self.html` | `accountDeletedBySelf()` | — | User deletes their own account |
| `announcement.html` | `announcement(headline, bodyHtml)` | `headline`, `bodyHtml` | Admin-triggered broadcast via Announcements panel |
| `parent-notice.html` | `parentNotice()` | — | Admin-triggered DPDP consent backfill — friendly data notice sent to all non-consented users |
| `admin-alert.html` | `adminAlert(headline, bodyHtml)` | `headline`, `bodyHtml` | Super admin alert — new user registered or user deleted (app users only) |

#### Announcements (admin broadcast)
- `POST /api/admin/announcements/send` — accepts `{ subject, headline, bodyHtml }`. Filters all app users (non-admin), collects emails, calls `resendClient.sendBatch()` in a `CompletableFuture.runAsync()` background thread. Returns `{ queued: N }` immediately.
- Frontend: `Announcements` component in `AdminPage.jsx` — rich-text editor (`contenteditable`) with a floating selection toolbar (B / I / U / H2 / H3 / link / strikethrough). Toolbar appears on text selection, is horizontal when viewport is wide enough, vertical on narrow screens. Bottom bar has Insert actions (bullet list, numbered list, divider rule) that don't require selection. Live email preview panel mirrors the exact layout of `announcement.html` (same padding, font sizes, logo, footer).

#### Compliance (admin consent backfill)
- `POST /api/admin/consent-backfill/send` — sends `parent-notice.html` email to all non-admin, non-consented, non-suspended users (`findUsersWithNoConsent()`). Covers users with and without children — consent is per-user, not per-child. Runs async via `sendBatch()`; records a run history entry in `AppSetting` key `"compliance.consent-backfill.history"` (capped JSON array). Safe to run multiple times — already-consented users are excluded automatically. Subject: `"A quick note about your child's data on Glumbi"`.
- `GET /api/admin/consent-backfill/history` — returns the capped history array of past runs (timestamp, emailsSent, skipped, result).
- Frontend: `Compliance` section in `AdminPage.jsx` — send button, refresh button, inline result message, run history table (columns: Run at UTC, Emails sent, Skipped, Result). History loads on mount and refreshes after send.
- `UserRepository.findUsersWithNoConsent()` — JPQL query: `WHERE role = 'USER' AND consentGiven = false AND onHold = false`.

#### Super Admin Alerts (`AdminAlertService`)
- Fires for **app users only** (`Role.USER`) — never for admin/super admin registrations or deletions
- **New user registered**: triggered in `AuthController` after email signup and after Google OAuth creates a new user (`isNewUser = true`). Provider string: `"Email"` or `"Google"`. Name only included if non-blank (Google users have it; email signups don't).
- **User deleted**: triggered in `UserController` (self-delete, guarded by `!u.isAdminOrAbove()`) and `AdminController.deleteUser` (guarded by `isAppUser`). Deleted-by string: `"self"` or `"admin: <maskedEmail>"`.
- Each alert sends both an **in-app notification** (`NotificationType.ADMIN_ALERT`, `child = null`) and an **email** (`admin-alert.html`) to every super admin. Failures per super admin are caught and logged — never block the main request.
- **Weekly stats alerts**: `NotificationScheduler.pushWeeklyStatsAlerts()` runs at the end of the existing Sunday scheduler — no separate cron. Persists `ADMIN_ALERT` in-app notifications (no email) for: no new signups, ≥5 new signups, users with no children, users at quota limit, users near limit (80%+).
- Template: `backend/src/main/resources/templates/email/admin-alert.html` — coral Glumbi style, "Dear Glumbi Admin", inline detail block, "Open Admin Panel" CTA.

#### Admin Notifications endpoints
- `GET /api/admin/alerts` — returns `{ alerts: [...], unread: N }` for the calling super admin; alerts are `ADMIN_ALERT` type notifications ordered newest-first.
- `POST /api/admin/alerts/mark-read` — marks all `ADMIN_ALERT` notifications read for the calling super admin.
- Frontend (`AdminPage.jsx`): bell fetches from `/admin/alerts` on mount; badge shows unread count (yellow when >0); opening the drawer marks all read and refreshes. Drawer shows message + timestamp; unread items are bold + coloured + dot indicator.

#### Email Masking (`MaskUtil`)
- Single shared utility: `com.glumbi.util.MaskUtil.maskEmail(String email)`
- Pattern: first 2 chars of local part + `***` + last 1 char (only if it doesn't overlap with the prefix) + full domain
- Examples: `krishnaswamyv89@gmail.com` → `kr***9@gmail.com`; `john@example.com` → `jo***n@example.com`; `ab@ymail.com` → `ab***@ymail.com`
- Used in `AdminController.maskEmail()` (user list display) and `AdminAlertService` (alert messages). Use this everywhere email masking is needed — never roll a separate implementation.

#### Per-user marketing email opt-out
- `AppUser.marketingEmailsEnabled` — boolean, default `true`. Controls weekly scheduler emails (quiet-week, no-child nudge, weekly-recap) and announcement broadcasts. Account/security emails (onboarding, password reset/changed, quota warning, hold/release/deleted) always fire regardless.
- `PATCH /api/users/me/marketing-emails` — body `{ enabled: boolean }`. Returns `{ marketingEmailsEnabled: boolean }`.
- `GET /api/users/me` — now includes `marketingEmailsEnabled` in response.
- `NotificationScheduler` checks `user.isMarketingEmailsEnabled()` before each weekly email send.
- `AdminController.sendAnnouncement` filters recipients to `isMarketingEmailsEnabled()` users only.
- Frontend: toggle switch in `ProfilePage.jsx` under a "Notifications" section. Toggle is local state only — only saved on explicit Save button click (not on toggle).

#### Rotating message pools
- **Quiet week** (8 variants) and **no child added** (7 variants): picked via `ThreadLocalRandom` each send — same parent won't see the same message two weeks in a row statistically.
- Reason for hold is **never** included in the suspension email — prevents tipping off bad actors and avoids legal exposure from unverified accusations.

### Password Reset Flow
- **Endpoints** in `AuthController`:
  - `POST /api/auth/forgot-password` — always returns 200 (no user enumeration). Skips Google-only accounts (no passwordHash). Invalidates all existing tokens before creating new one. Token expires 1 hour UTC.
  - `GET /api/auth/validate-reset-token?token=xxx` — validates token without consuming it (used on page load in `ResetPasswordPage`).
  - `POST /api/auth/reset-password` — validates token (expiry in UTC), enforces password policy (`^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{}|;':",./<>?]).{8,}$`), marks token used, sends password-changed email.
- **Entity**: `PasswordResetToken` — fields: token (UUID), userId, expiresAt (UTC), used, createdAt. `isExpired()` compares UTC.
- **Repository**: `PasswordResetTokenRepository` — `findByToken()`, `invalidateAllForUser()`.
- **Frontend pages** (both in `PublicRoutes.jsx`):
  - `ForgotPasswordPage.jsx` — coral gradient bg, PublicHeader+Footer, always shows "check your inbox" success state.
  - `ResetPasswordPage.jsx` — validates token on mount via `GET /api/auth/validate-reset-token`, shows "Verifying…" state, then form or error. Password strength checklist (length, uppercase, number, special). Auto-redirects to `/login` after success.
  - `AuthPage.jsx` "Forgot password?" link uses React Router `<Link>` (not `<a href>`).
  - API calls in `client.js`: `forgotPassword`, `validateResetToken`, `resetPassword`.
- **Password-changed notification** fires in 3 places:
  - `AuthController.resetPassword` → context: "via a password reset link"
  - `UserController.changePassword` → context: "by you"
  - `AdminController.resetPassword` → context: "by an administrator"

### Weekly Recap Email
- Runs inside `NotificationScheduler` when `weekly-recap-email` agent flag is enabled.
- **No children on account** → sends `no-child.html` nudge (rotating message), then `continue` to next user.
- **Children present but no activity this week** → sends `quiet-week.html` (rotating message), then `return false`.
- **Children with activity** → generates progress report via `ProgressReportAgent`, sends `weekly-recap.html`.

### Feature Flags
- `FeatureConfig` entity — per-feature enable/disable + credit cost
- `FeatureConfigSeeder` seeds defaults on startup
- Frontend receives `featureConfig` array and gates UI accordingly

### FlipbookStudio toolbar
- Stamp tool has been fully removed — no `stampMode`, `stampEmoji`, or `showStampPicker` state anywhere
- Play/pause button uses inline SVG for pixel-perfect centering across all devices: pause = two `<rect>` elements, play = `<polygon>` triangle, both with `fill="white"`
- Frame nav buttons (◀ ▶) use text characters with `color: '#444'` and `lineHeight: 1` — do NOT convert these to SVG (they render correctly as text)
- Frame/play collapsible panel removed — both strips always visible
- Fullscreen disabled on mobile (guard: `!isMobile`) to prevent canvas distortion

### Draw & FlipbookStudio — Selection Tool
Both files share the same selection tool logic pattern:
- **Lazy erase**: original pixels are NOT erased on lift (`onSelUp`). They are erased only on the first `onSelMove` while dragging (`sd.erased` flag). This means select + cancel = no change; select + drag = move; select + commit = copy in place.
- **Resize handles**: 4 corner handles (12×12 px, 18px hit radius) on the floating selection. Drag a corner to resize; image is scaled live via `drawImage(src, px, py, sd.w, sd.h)`. On mouseup, the scaled image is baked into `selTmpRef`. Resize also triggers lazy erase (erases at `sd.x, sd.y` with original `resizeOrigW × resizeOrigH`).
- **Duplicate** (`❐` button): commits floating to canvas at current position, creates new floating offset by +20px (−20px if at edge). Sets `sd.erased = true, sd.pixels = null` — copy mode means dragging the new floating erases nothing and cancel does not restore.
- **Delete**: erases original only if not already erased (`!sd.erased`).
- **Cancel**: restores original pixels only if `sd.erased && sd.pixels` (guards against copy-mode null pixels).
- **No "Place" button** — clicking outside the floating commits it via `onSelDown → commitSelection`.
- `sd` fields: `phase`, `x`, `y`, `w`, `h`, `posX`, `posY`, `pixels`, `dragging`, `erased`, `dragStartX/Y`, `dragOrigX/Y`, `resizing`, `resizeHandle`, `resizeDragStartX/Y`, `resizeOrigX/Y/W/H`

### Draw & FlipbookStudio — Shape Tool
- Pending shape (after drawing): drag inside to move, drag corners to resize, click outside to commit.
- **No panel/toolbar shown** while a shape is pending — the "Drag to move · corners to resize" panel was removed entirely. Interaction is fully implicit.
- No "Place" button.

### Fullscreen
- Stories, Draw, LearnPage, FlipbookStudio, TorchHunt support browser fullscreen API
- Known issue pattern: screen time alert must call `document.exitFullscreen()` before showing, because fullscreen creates a browser top-layer that blocks modals

### Close Buttons (all popups)
- Must always be: `width: N, height: N, minWidth: N, minHeight: N, borderRadius: '50%', padding: 0, flexShrink: 0`
- Never set width/height without minWidth/minHeight — flex containers will stretch them oval

### Carousel Pattern (ChildList)
- Circular navigation: `(idx - 1 + total) % total` and `(idx + 1) % total`
- Globe 3D transition: `perspective(700px) rotateY(±35deg)` keyframes
- Touch swipe: 48px threshold, `touchStartX` ref
- Last slide = "Add Child" slide — included in circular count

### Feature Carousel (LandingPage)
- 3-card peek layout (left dim + center large + right dim)
- Split layout: illustrated left panel + text right panel with highlight chips
- Left panel renders `f.illustration` (custom inline SVG) when present; falls back to the emoji circle for all other features
- **Maze Adventure** and **Torch Hunt** both have custom `illustration` SVGs — isometric 3D maze and torch-beam arena respectively
- Total: **17 features** in the `FEATURES` array (badge reads "17 FEATURES")
- Auto-advances every **7 seconds** (was 4s — too fast)
- Pauses on `mouseEnter`

## Torch Hunt Feature

### Overview
A dark-arena hidden-object game. The arena is pitch-black; the child picks an object pill from the HUD strip, then moves a torch (flashlight) around the canvas to find it. Hovering the torch over the target for a fixed dwell period marks it as found and reveals a fun fact.

### Frontend (`src/features/torchhunt/TorchHunt.jsx`)
- **gameConfig(age)** — returns `{ objectCount, torchRadius, dwellMs }` per age bracket: ≤4: 8/120px/1000ms, ≤6: 12/100px/800ms, ≤8: 18/80px/650ms, 9+: 25/65px/500ms
- **placeObjects** — random placement with `minDist = 0.28 × min(w,h)` to prevent clustering; 80 max attempts per object; respects `pad = max(60, 10% of shorter dim)`
- **Canvas rendering** — `destination-out` composite on a dark overlay reveals the "torch circle" around the cursor/touch point
- **Dwell mechanic** — `dwellStartRef` starts when pointer enters catch zone (`torchRadius * 0.45`); `dwellFiredRef` one-shot guard prevents double-fire; `dwellProgress` drives an SVG ring around the target
- **React anti-pattern avoided** — dwell side-effects (`setFoundCount`, `setPlacedObjects`, confetti, factCard) are fired OUTSIDE the `setPlacedObjects` functional updater; all mutable values read via refs (`placedObjectsRef`, `selectedTargetRef`, `torchOnRef`, etc.) to avoid stale closures
- **Touch UX** — after chip select, `torchPos` set to `{x:-999, y:-999}` (off-screen) to prevent instant dwell; pulsing "Tap the dark area to search!" overlay shown until first touch
- **Found objects** — rendered as `<div>` (not `<button>`) with `pointerEvents: 'none'`; dynamic `const Tag = isFound ? 'div' : 'button'` pattern prevents re-selection on touch
- **HUD buttons** — all 44×44px minimum tap targets; torch (52×44), fullscreen (44×44), exit (44×44 red-tinted)
- **Pills strip** — `flexWrap: 'wrap'` (not `overflowX: auto`) so pills wrap on narrow screens
- **Animation fix** — object float/dwell animations use individual `animationName`, `animationDuration`, etc. properties instead of the `animation` shorthand + `animationDelay` to avoid React re-render styling warnings

### Backend
- **`TorchHuntAgent`** — generates a themed pack of objects (emoji, name, fun fact) for a given theme + age group via Claude
- **`TorchHuntService`** — `getOrGenerate()` returns existing pack or generates new one; catches `DataIntegrityViolationException` for race-condition dedup; `refresh()` calls `packRepository.flush()` after delete to ensure DELETE commits before INSERT within same transaction
- **`TorchHuntController`** — `GET /api/torch-hunt/pack?themeKey=&ageGroup=` and `POST /api/torch-hunt/pack/refresh`; quota-gated on feature key `torch-hunt`
- **`TorchHuntPack` entity** — `(userId, themeKey, ageGroup)` unique constraint; `objectsJson` and `narrativesJson` stored as TEXT
- **Railway note** — if deploying to a DB that had an old schema with a `sessions_played NOT NULL` column: `DROP TABLE IF EXISTS torch_hunt_packs;` then restart to let JPA recreate it

## Workflow Notes
- **Do not start the dev server or open a browser preview to verify UI changes.** The user runs the app themselves and does all visual verification. Just make the code change and describe what was done.
- **Do not commit or push changes unless explicitly asked.** Make the code changes, explain what was done, then wait for the user to say "commit" or "push" before running any git commands.

## Dev Commands

```bash
# Frontend
cd frontend
npm run dev        # localhost:5173
npm run build      # production build

# Backend
cd backend
./mvnw spring-boot:run   # localhost:8080
```

## Deployment
- Frontend → **Vercel** (auto-deploy from main)
- Backend → **Railway** (Dockerfile)
- DB → **Railway PostgreSQL**

### Signup Kill Switch (`SignupGuardService` + `AuthController` + `AdminController`)
- `SignupGuardService` — key `"signup.enabled"` in `AppSetting`; 30s in-memory cache via `AtomicBoolean` + `AtomicLong` expiry. Cache invalidates immediately on write. Default: `true` (enabled).
- `/register` and `/google` (new user path) are gated — return `503` + `Retry-After: 86400` + `{ "code": "SIGNUP_PAUSED", "error": "<friendly message>" }` when paused. **Not** 429 (that's per-user rate limit) and **not** 403 (that implies known user denied).
- `GET /api/auth/signup-status` — public endpoint, no auth required, returns `{ enabled: boolean }`. Used by `AuthPage` on mount to show a proactive banner before the user fills the form.
- `GET/PUT /api/admin/settings/signup` — admin-only toggle.
- **Frontend**: `signupEnabled` initialises as `null` in `AdminPage` (not `true`) — the signup card is hidden until the fetch resolves to prevent a flash of the wrong state. `AuthPage` shows a warning banner only when `mode === 'register' && !signupOpen`.
- **Interceptor**: `client.js` 503 handler checks `data?.code === 'SIGNUP_PAUSED'` first — surfaces it as a normal rejected promise (inline form error) instead of redirecting to `/error/503`.

### Parent Guidance Tips
- Yellow banner (`#fffbeb` bg, `#fde68a` border, `#92400e` text) placed below `QuotaBanner` / `FeatureBanner` in 4 features: **Learn to Write**, **Journal**, **Read & Quiz**, **My Writing**.
- Not added to Stories, Curiosity, Draw, Flipbook, Memory, Maze, Riddle, TorchHunt — those are self-directed or already guided by Glumbi.

### Admin Sidebar Collapsible
- `AdminPage.jsx` has `sidebarCollapsed` state for desktop.
- Sidebar animates between 220px (expanded) and 52px (collapsed) with 0.22s ease transition.
- Collapsed: shows only icons centered, with `title` tooltips for accessibility.
- Toggle: small circular white button (`position: absolute, top: 24, right: -14`) matching AppSidebar's pattern — `‹` to collapse, `›` to expand. Mobile behaviour unchanged.

## Glumbi Guide

An interactive companion layer woven into Stories, Read & Quiz, and Curiosity. All Glumbi content is generated by the AI agent alongside the main content (no extra API calls at interaction time) and stored in dedicated entity columns.

### Stories phase state machine
`idle → intro → reading1 → mid → reading2 → post → epilogue`

- `glumbiPhase` always resets on story navigation (no localStorage persistence)
- True branching: `storyPart2A` (choice 0) + `storyPart2B` (choice 1) generated in one Claude call; `storyPart2` kept as fallback for pre-branching stories
- `glumbiMidPicked` (0 or 1) determines which branch plays in `reading2`; passed as `?branch=a|b` on the `/listen` endpoint; cache key gets `:p1` / `:p2a` / `:p2b` suffix
- TTS `onended` auto-advances `reading1→mid` and `reading2→post`; manual buttons always available
- Post/epilogue end: "Quiz time! 📚" cross-feature button navigates to Read & Quiz with story keywords pre-filled
- Analytics events: `glumbi_mid_choice` (metadata: `{ choice, choiceText, storyTitle }`), `glumbi_epilogue_requested`, `glumbi_post_response`
- `StoryResult` record has 10 fields — all fallback calls must pass all 10

### Story entity Glumbi columns
`glumbiIntro`, `glumbiMidQuestion`, `glumbiMidChoices` (JSON array of 2), `glumbiPostQuestion`, `glumbiEpilogue`, `storyPart1`, `storyPart2` (legacy), `storyPart2A`, `storyPart2B`

### ReadQuiz phase state machine
`idle → intro → reading → idle → post`

- `intro`: Glumbi opener → "Let's read! 📖"
- `reading`: compact Glumbi banner while child reads → "I'm ready! 🧠" → phase goes `idle`, quiz scrolls into view
- `post` (set by submit handler after quiz): Glumbi score comment → "Read a story! 📖" cross-feature button navigates to Stories with quiz topic pre-filled
- Analytics: `glumbi_ready` (metadata: `{ topic, title }`)

### ReadQuizEntry Glumbi columns
`glumbiIntro`, `glumbiScoreComment` — pipe-delimited string of 4 score-specific comments (indexed 0–3 by quiz score)

### Curiosity Glumbi flow
No phase machine — driven by `glumbiDone` boolean. After child picks a follow-up choice, Glumbi shows `glumbiReaction` + "Turn into a story! 📖" cross-feature button navigating to Stories with the curiosity question pre-filled as keyword.
- Analytics: `glumbi_followup_choice` (metadata: `{ choice, choiceText, question }`)

### CuriosityEntry Glumbi columns
`glumbiFollowUp`, `glumbiFollowUpChoices` (JSON array of 2), `glumbiReaction`

### Cross-feature continuity
Navigation uses React Router `navigate(path, { state: { glumbiPrefill: topic } })`. Receiving feature reads `location.state?.glumbiPrefill` on mount and pre-fills its topic/keyword input. Child always taps submit themselves — no auto-trigger.
- Curiosity → Stories: curiosity question becomes story keyword
- Stories → Read & Quiz: story keywords/category become quiz topic
- Read & Quiz → Stories: quiz topic becomes story keyword

### Glumbi memory
`GlumbiMemoryService.getMemoryContext(childId)` queries the last 5 `glumbi_mid_choice`, `glumbi_followup_choice`, and `glumbi_ready` events for the child and formats them into a compact context paragraph. Injected into `StoryAgent`, `ReadQuizAgent`, and `CuriosityAgent` prompts before every generation so Glumbi can reference past choices. Only structured event data (choice text, topic) is passed — never user-generated content (journal, writing).

### History drawer pattern (Stories, ReadQuiz, Curiosity)
All three features use `HistoryDrawer` with compact single-row items: emoji + title + tag badge + status. Selecting a row swaps the inline content card; the drawer auto-closes. Delete button lives on the history row (not inside the card) for Curiosity.

### Nav order (sidebar + hamburger)
Stories → Read & Quiz → My Writing

### Analytics
`countByChildFeatureEventType` / `countByFeatureEventTypeSince` used for per-child and admin Glumbi counts.
Admin dashboard consolidates all Glumbi events into one "total Glumbi interactions" signal.
`ChildInsightsPage` shows per-feature Glumbi chips for parent view.

### Parental Consent (DPDP / COPPA)
- `AppUser.consentGiven` — boolean, per-user (not per-child). Default `false`.
- **Frontend gate**: `ConsentModal` shown when `!consentGiven && location.pathname === '/child'` (management layout). Fires for all users — including those with no children yet — on their first landing at the child list. Freely accessible routes: Profile, Help, Privacy, Terms (modal never blocks these).
- **Google federated users**: `useAuth.js` `handleAuth` is async — fetches profile and sets `consentGiven` from server **before** `setAuthed(true)`, so the modal fires on first render at `/child` without a flash.
- **Server gate**: `ApiQuotaService.consumeCredits` checks `user.isConsentGiven()` before any AI credit is spent; returns `false` (blocks call) if consent not given.
- **Consent withdrawal**: via Profile → My Data section. Sets `consentGiven = false`, disabling all AI features immediately.
- **Backfill**: admin-triggered `POST /api/admin/consent-backfill/send` sends `parent-notice.html` to all non-consented users (see Compliance section above).
- **LandingPage / Footer**: shows `🛡️ COPPA & DPDP Act 2023 compliant` trust badge. Footer shows `🛡️ DPDP Act 2023 compliant`.
- **TermsPage**: Section 2 covers consent recording and right to withdraw; Section 12 cites DPDP Act 2023 and COPPA explicitly.
- **HelpPage**: includes Q&As for "What is the parental consent prompt?" and "What happens if I withdraw consent?".

### Account Deletion (`AccountDeletionService`)
- Triggered by admin (`AdminController.deleteUser`) or user self-delete (`UserController.deleteAccount`).
- Per-child deletion order: R2 audio cleanup → stories → activities → journal → curiosity → word-of-day → read-quiz → draw saves → flipbook saves → memory match → flashcard sets → writing → **anonymise** child activity events (set `child_id`/`user_id`/`child_name`/`parent_email` to NULL) → **anonymise** AI usage logs (set `child_id` to NULL) → notifications → child row.
- Per-user (after children): **anonymise** child activity events (`user_id` → NULL) → **anonymise** AI usage logs (`user_id` → 0) → user feature overrides → password reset tokens → ElevenLabs voice deletion + family voice rows → user row.
- `ChildActivityEvent` and `AiUsageLog` are **never hard-deleted** — they are anonymised (PII nulled) to preserve platform analytics.
- **Notification deletion order**: per-child notifications are deleted inside the child loop (`notificationRepository.deleteByChildId`); user-level notifications (`child = null`, e.g. `ADMIN_ALERT`) are deleted just before `userRepository.deleteById` via `notificationRepository.deleteByUserId`. Both must be deleted — the `notifications.user_id` FK has no cascade, so missing either causes a constraint violation.
- **`ddl-auto: update` does NOT drop NOT NULL constraints.** If entity fields are changed to nullable, run the DDL manually on Railway:
  ```sql
  ALTER TABLE child_activity_events ALTER COLUMN child_id DROP NOT NULL;
  ALTER TABLE child_activity_events ALTER COLUMN user_id DROP NOT NULL;
  ALTER TABLE child_activity_events ALTER COLUMN child_name DROP NOT NULL;
  ALTER TABLE child_activity_events ALTER COLUMN parent_email DROP NOT NULL;
  ```

### Graduate Child Profile Feature

Parents can "graduate" a child profile when the child has outgrown Glumbi (typically age 11+). This is a soft deactivation — the child remains visible and the slot is not freed.

**Backend:**
- `Child.graduated` — `boolean`, `@Column(name = "graduated", nullable = false, columnDefinition = "boolean default false")`
- `ChildService.create`: enforces `totalCount >= 3` (total children including graduated — not active only); error: "Graduate an existing profile to add a new one."
- `ChildService.update`: applies `req.getGraduated()` if non-null
- `ChildRequest.graduated` — `Boolean` (null = no change)
- `NotificationScheduler`: filters `children.stream().filter(c -> !c.isGraduated())` — no weekly reports or quiet-week emails for graduated children

**Frontend — ChildList.jsx:**
- Graduated cards: greyed out (`opacity: 0.5`), avatar blocked, 🎓 overlay, "🎓 Graduated" badge, "edit profile to re-enrol" hint — cannot be launched
- `activeCount`: `children.filter(c => !c.graduated).length` (display only)
- `AddChildSlide` slot limit: `children.length >= 3` (total, not active)
- Graduated banner (shown in management layout): "🎓 Graduate profile" CTA navigates to `/child/:id/edit`

**Frontend — ChildForm.jsx:**
- State: `graduated`, `savedGraduated` (tracks server state to show pending language)
- Graduate section card: title anchored to `savedGraduated`; description shows pending language when `graduated !== savedGraduated`
- Button toggles between "Graduate" and "Re-enrol"
- Payload: `...(isEdit ? { graduated } : {})`

**Verbiage:** "graduate" / "re-enrol" everywhere — never "hibernate" / "reactivate"

**HelpPage:** FAQ entries for "What does 'Graduate profile' mean?" and "Does graduating a child free up a profile slot?" (No — still counts toward 3-profile limit)

### ChildForm — Feature Age Gates
App supports children aged 1–10. `ALL_FEATURES` in `ChildForm.jsx` uses `minAge` / `maxAge` to determine which features are enabled by default when a child profile is created or edited.

| Feature | minAge | maxAge | Notes |
|---|---|---|---|
| Draw | 1 | — | Toddler scribbling |
| Timeline | 1 | — | Parent-facing, no age gate needed |
| Stories | 2 | — | TTS narration for toddlers with parent |
| Activities | 2 | — | Parent-guided |
| Memory Play | 2 | — | Simple card matching |
| Journal | 2 | — | Parent can write for young children |
| Curiosity | 3 | — | Requires some verbal comprehension |
| Learn to Write | 3 | 8 | Handwriting practice stays relevant beyond 6 |
| Maze | 3 | — | Spatial reasoning |
| Torch Hunt | 4 | — | Requires ability to control torch direction |
| Riddle | 5 | — | Requires cognitive development |
| Flipbook Studio | 5 | — | Multi-frame animation concept |
| Read & Quiz | 6 | — | Early readers benefit |
| My Writing | 7 | — | Creative writing with AI coaching |

## What's Deliberately Not Built (Yet)
- No native mobile app — PWA/browser only
- No real-time multiplayer or family sharing
- No child-facing account system — parent account only
- No offline AI — cached responses only when offline
- Admin page exists but is internal/hidden from public nav
- ~~No transactional email~~ — email IS now built (Resend + Thymeleaf): onboarding, password reset, password-changed, weekly recap, quiet-week, no-child nudge, quota warning (80%/100%), account on hold/released/deleted, admin announcement broadcast

## Analytics System

### Transport — WebSocket (`analyticsSocket.js`)
- Lives in `src/grpc/analyticsSocket.js` — singleton exported as `analyticsSocket`
- Persistent WebSocket to `/ws/events?token=<jwt>` — opened only when `childLocked = true`, closed on session end
- Protocol: client sends JSON array of events, server replies `{"saved": N}`, client removes that batch from localStorage queue
- Tab hidden → closes socket (frees server resources); tab visible → reconnects with backoff reset
- Reconnect: exponential backoff 1s → 32s cap; stops retrying if token is empty (post-logout guard in `_connect()`)
- `analyticsSocket.close()` is called in `handleLogout` in `App.jsx` — prevents reconnect loop after logout
- Base URL derived from `VITE_API_URL`: strip `/api` suffix, replace `http` → `ws` / `https` → `wss`

### Event tracking (`useActivityTracker` hook)
- Lives in `src/hooks/useActivityTracker.js` (also exported as `useTracker`)
- Offline-first queue in `localStorage` key `glm_activity_queue`
- `track(feature, eventType, metadata)` enqueues an event; flushes immediately if socket is open
- Events are sent via `analyticsSocket.send()` (WebSocket); HTTP batch endpoint (`POST /api/activity-events/batch`) is a legacy fallback
- Every event has: `childId`, `feature`, `eventType`, `durationSeconds`, `clientKey` (UUID for dedup), `occurredAt` (UTC ISO string)
- **ACK-based dequeue:** `sendingRef.current` records how many events were sent; `onAck` callback slices that many off the queue — events enqueued during the send are preserved. Guards against double-flush.
- 2-second interval poll drains any queued events after a socket reconnect

### Session events (`useFeatureDuration` hook)
- Lives in `src/hooks/useFeatureDuration.js`
- Fires a `session` event with `durationSeconds` on component **unmount**, excluding idle/locked/hidden time
- Works for any feature component that mounts/unmounts on navigation
- **Engagement gate**: session only fires if `markActive()` was called at least once during the mount cycle — landing on a page and immediately leaving does NOT count as a session
- API: `const { markActive } = useFeatureDuration('featureName', track)` — call `markActive()` on first genuine interaction
- `markActive()` is idempotent — multiple calls never reset the session start time

### Per-feature `markActive()` triggers
| Feature | When `markActive()` is called |
|---|---|
| Draw | First canvas stroke in `startDraw`; after `animate` event; history entry opened |
| Flipbook Studio | First canvas stroke; after `animate` event; history entry opened |
| Stories | After `generate` event; after `listen` event; history entry opened |
| Read & Quiz | Top of `openEntry()`; after both `generate` event paths |
| Curiosity | After `ask` event; history row `onClick` |
| Journal | Mood selected (only when selecting, not deselecting); after `ai_generate` event; after `save` event |
| Riddle | "Let's Go" button click (begins answering phase) |
| Maze | `onMouseDown` / `onTouchStart` (first trace); after `ai_theme` event |
| Torch Hunt | `handlePointerMove` (first touch/move on canvas) |
| Activities | After both `generate` event paths (handleGenerate + handleRefresh); after `complete` event |
| My Writing | Top of `openEntry()`; after `feedback` event; after `save` event |
| Learn to Write | First canvas stroke via `onFirstStroke` prop threaded through `LetterPanel`/`WordMode`→`DrawCanvas`; after `ai_validate` event; after `ai_word` event |
| Memory — Flashcards | After generate; history `loadSet` click; `onFirstFlip` callback |
| Memory — Word of Day | When today's word is displayed |
| Memory — Match | After generate; history `startMatch` click (custom `matchEngagedRef` pattern — see below) |

### MemoryMatchTab — always-mounted session tracking
- `MemoryMatchTab` stays mounted with `display: none` to preserve mid-game state — standard unmount-based hooks don't fire on tab switch
- Pattern: `isActive` prop + two effects:
  - Effect 1 watches `isActive` — starts/stops timer on tab switch within MemoryPlay
  - Effect 2 cleanup on unmount — fires final session event when navigating away from MemoryPlay
- **Engagement gate**: `matchEngagedRef = useRef(false)` — set to `true` after generate and on history `startMatch`; unmount guard: `if (!matchEngagedRef.current) return`
- Minimum 5-second threshold before firing a session event (avoids noise from accidental tab taps)

### Event taxonomy
- `session` — the only event type counted in `featureBreakdown` and session totals; fired with `durationSeconds`
- Feature-specific events (`correct`, `wrong`, `match`, `mismatch`, `complete`, etc.) are stored and used for per-feature insight chips in the parent popup (not session counts)

### Feature-specific insight chips (parent popup — `ChildList.jsx`)
Non-session events power extra chips shown under each feature row. Built via `extraChips` array in the feature list renderer:
- **Read & Quiz**: `correct`/`wrong` → accuracy % + completions count
- **Memory Match**: `match`/`mismatch` → games played + avg flips/game; `session.metadata.theme` → favourite theme
- **Stories**: `similar_viewed` → count of similar stories explored
- **Maze**: `gave_up` count + `complete.metadata.wallHits` avg
- **Riddle**: `hint_used` count
- **My Writing**: `feedback.metadata.wordCount` avg words per submission
- **Torch Hunt**: `found` count per session
- **Learn to Write**: `practice` count + `ai_validate`/`ai_word` metadata → hardest letter and hardest word chips
  - Backend query (`getLetterAccuracyForChild`, `getWordAccuracyForChild`) aggregates pass/fail per letter or word, sorted worst-first (lowest pass rate first)
  - Frontend takes `letterAccuracy[0]` and `wordAccuracy[0]` (worst only — showing all 26 letters would be unusable)
  - Chip is red (`#ef4444`) if pass rate < 50%, amber (`#f59e0b`) otherwise
  - Admin response does **not** include `letterAccuracy`/`wordAccuracy` — per-letter breakdown is not meaningful platform-wide

### Backend analytics queries
- `countByFeatureForChild` and `countByFeatureSince` (admin) both filter `AND event_type = 'session'` — all other events are excluded from feature counts
- `totalSessions` = `featureBreakdown.values().stream().mapToLong(Long::longValue).sum()` — computed server-side and returned in analytics response
- `totalEvents` is the raw count of all event types — different from `totalSessions`; used only for internal reporting
- **JPA `::` cast ban:** Spring Data JPA's named-parameter binder treats `:` as the start of a bind parameter — `::json`, `::boolean`, `::integer` all cause "syntax error at or near ':'". Use `CAST(x AS json)` / `CAST(x AS boolean)` / `CAST(x AS integer)` in all `@Query(nativeQuery=true)` strings instead of PostgreSQL shorthand casts.

### Timezone handling — `normalizeTimezone()`
- `ChildActivityEventService.normalizeTimezone(tz)` maps legacy IANA names before passing to PostgreSQL
- Railway's PostgreSQL doesn't recognise `Asia/Calcutta` (must be `Asia/Kolkata`), `Asia/Katmandu`, `America/Godthab`, `Pacific/Ponape`
- Always store timestamps as UTC in DB; convert at read time using user's timezone via `ZoneId.of(normalizeTimezone(tz))`

### Touch-friendly chart popups (parent popup + admin heatmap)
- No `title` attributes on chart bars or heatmap cells — `title` is hover-only and invisible on touch devices
- Click-based inline state: clicking a bar/cell sets a state var; a popup div renders inline (not `position: fixed`) immediately within its own chart section
- Parent popup has two separate states: `activeDailyBar` and `activeHourBar` — each chart manages its own popup to prevent cross-chart rendering bugs
- Admin heatmap: `activeCell` state, popup renders below gradient legend inside the heatmap container
- All popups have a close ✕ button using the standard circular button style

### Feature list — no slice cap
- `allFeatures` in `ChildList.jsx` shows all features from `featureBreakdown` — no `.slice()` limit
- Features are naturally bounded by the platform (currently ~15); slicing would silently drop newly added features

### ReadQuiz — answers persistence
- `ReadQuizEntry.answersJson` stores the child's chosen option indices (int array, JSON-serialised) — set on submit, null until then
- After submit, `handleSubmit` must copy `result.answersJson` into both `setSelected` and `setEntries` state; otherwise `openEntry` can't restore the highlighted wrong answers on revisit
- `openEntry` parses `entry.answersJson` when `entry.completed` is true and uses it as initial `answers` state — so reopening a completed story shows correct (green) and wrong (red) options exactly as answered

### Admin 502 redirect loop
- Admin `Routes` in `App.jsx` has a wildcard `path="*"` → `<Navigate to="/admin/dashboard" />`. Without an explicit error route, `/error/502` matches the wildcard and redirects back to the dashboard, which hits 502 again
- Fix: add `<Route path="/error/:code" element={<ErrorPage .../>} />` before the wildcard in the admin Routes block
- Child routes are unaffected — they use an early `if (/^\/error\//.test(location.pathname))` guard above the Routes tree

## Theme System & Hub Scene Backgrounds

### Theme definition files (touch all 4 when adding a new theme)

| File | What to add |
|---|---|
| `frontend/src/themes.js` | Add entry to `THEMES` object (primary, primaryLt, bg, headerGrad, cardBg, accent, avatarEmoji) and add key to the right group in `THEME_GROUPS` |
| `frontend/src/pages/hubWorlds.js` | Add `themeKey: 'worldKey'` to `THEME_WORLD` map. World keys: `space`, `forest`, `ocean`, `candy`, `warmsky`, `magical`, `adventure`, `cozy`, `sky`, `abstract`. Optionally add a particle override to `THEME_PARTICLE_OVERRIDES` if the theme warrants custom particles (e.g. leaf, raindrop, snowflake) |
| `frontend/src/pages/hubThemeBackgrounds.jsx` | Add `Scene_themename()` function returning an SVG and register it in `SCENE_MAP` at the top |
| `frontend/src/components/ThemeLoader.jsx` | Add `THEMES_ANIM` entry for the AI loading animation (emoji + color) |

### hubThemeBackgrounds.jsx — SVG scene rules

- **ViewBox**: always `viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" overflow="hidden"`. Keep all elements inside the 800×450 box or they clip.
- **Shared components**: `<Stars n={N}/>` for star fields, `<CloudShape x y w fill opacity style/>` for puffy clouds — never use raw ellipses for clouds.
- **Animations**: all via CSS keyframes injected in the `<style>` block at the top of the component (around line 40–70). Reuse existing keyframes where possible:

| Keyframe | Effect |
|---|---|
| `bg-float` | gentle vertical bob |
| `bg-drift-r` | slow rightward drift (clouds) |
| `bg-sway-sm` | small side-to-side sway (trees, flowers) |
| `bg-glow` | pulsing opacity/scale glow |
| `bg-fly` | horizontal fly-across (translateX only — no Y, or figure gets clipped) |
| `bg-spin` / `bg-spin-ccw` | continuous rotation |
| `bg-pulse` | scale pulse |
| `bg-twinkle` | opacity twinkle |
| `bg-cricket-delivery` | ball travels upward and disappears (3s, synced with bat swing) |
| `bg-bat-swing` | cricket bat golf-arc swing (3s, transformBox fill-box, transformOrigin top center) |
| `bg-six` | "SIX!!" text flash (3s, synced with ball) |
| `bg-fb-ball` | football arc from kicker's foot to goal |
| `bg-goal` | "GOAL!!" text flash — appears at 53% of cycle (after ball reaches post) |

- **CSS animation pivot in SVG**: never use `transformOrigin` with absolute pixel coordinates for elements inside nested SVG groups — the parent transform stack makes it wrong and elements fly off-screen. Instead use `transformBox: 'fill-box'` + `transformOrigin: 'top center'` (or another relative value) on the animated inner group. Only use absolute-px transformOrigin on top-level animated groups (no parent SVG transform).
- **SVG polygon cones on towers**: polygon base points must exactly match the `x` and `x+width` of the rect they sit on, or the cone floats/misaligns.
- **Gradient IDs**: prefix with a unique scene abbreviation (e.g. `fb-sky`, `cr-bg`) to avoid collisions across scenes rendered simultaneously.

### SCENE_MAP registration

At the top of `hubThemeBackgrounds.jsx`, `SCENE_MAP` maps theme key → Scene function:
```js
export const SCENE_MAP = {
  coral: Scene_coral,
  // ...
  football: Scene_football,
  cricket: Scene_cricket,
  // add new entry here
}
```

### Current 11 new themes (added Aug 2026)

`train` → warmsky, `butterfly` → magical, `bees` → warmsky, `sunflowerfarm` → warmsky, `cricket` → forest, `football` → forest, `camping` → forest, `aroundtheworld` → sky, `junglebook` → forest, `music` → abstract, `girlhero` → adventure

### Notable scene details / pitfalls fixed

- **Cricket**: `bg-bat-swing` uses `transformBox: 'fill-box'` + `transformOrigin: 'top center'` on an inner `<g>` whose outer `<g transform="translate(12,-22)">` positions the grip at the batsman's hand. Bat drawn from y=0 (grip) to y=56 (blade). Ball travels upward with `bg-cricket-delivery`; "SIX!!" with `bg-six` — both 3s cycles.
- **Football**: kicker faces RIGHT (toward goalkeeper on right). Ball drawn at absolute foot position (482,354); `bg-fb-ball` translates 224px right, 63px up to reach goal. "GOAL!!" appears at 53% of cycle (after ball arrives). Kicker's shoe (kicking foot circle) is white to match standing leg sock.
- **Around the world**: globe at `translate(400,305)` r=118 with no float animation — prevents top of globe being clipped.
- **Enchanted**: tower cone polygon base points must exactly match the tower rect x/x+width or cone floats off the wall.
- **Superman**: mask at y=147, eyes at cy=151 (moved higher than original y=153/157).

## Interview Notes
Full interview prep: `GLUMBI_INTERVIEW_GUIDE.html` — open in Chrome → Cmd+P → Save as PDF. Covers product, architecture, AI topics (RAG/LLM/MCP), algorithms (Bucket4j, LRU cache), design patterns (12 patterns with exact class names), behavioral questions, live coding scenarios.
