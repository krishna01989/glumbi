# Glumbi — Frontend

React 18 + Vite SPA for the Glumbi kids learning app.

---

## Tech Stack

- **React 18** with hooks
- **Vite 4** — fast dev server and bundler
- **React Router v7** — client-side routing
- **Axios** — HTTP client (configured in `src/api/client.js`)
- **driver.js** — guided product tour on first login

---

## Project Layout

```
src/
├── api/
│   └── client.js              # Axios instance + all API call helpers
├── grpc/
│   ├── analyticsSocket.js     # WebSocket singleton for analytics streaming (open/close/send/onAck)
│   └── analyticsClient.js     # gRPC-Web HTTP client (legacy, kept for reference)
├── hooks/
│   ├── useAuth.js             # Auth state, quota polling, feature config, logout
│   ├── useChildSession.js     # Child selection, offline mode, WOTD fetch, restore-from-URL
│   ├── useLockSession.js      # PIN lock, screen-time timer, snooze, session persistence
│   └── useIsMobile.js         # Returns true when viewport < 640px
├── routes/
│   ├── PublicRoutes.jsx       # Unauthenticated routes (landing, login, legal)
│   └── ChildRoutes.jsx        # All child session routes (wrapped in FeatureGuard)
├── layouts/
│   └── ManagementLayout.jsx   # Sticky header + mobile drawer for management pages
├── components/
│   ├── AppSidebar.jsx          # Left nav sidebar (desktop/tablet/TV)
│   ├── LockModal.jsx           # PIN lock/setup/unlock modal
│   ├── ScreenTimeModal.jsx     # Screen time alert with snooze options
│   ├── FeatureGuard.jsx        # Disabled-feature screen for feature-flagged routes
│   ├── AudioPlayer.jsx         # Story audio player (speed, volume, seek, HTTP range)
│   ├── ConfirmDialog.jsx       # Reusable delete-confirmation modal
│   ├── FeatureBanner.jsx       # Animated header banner per feature (canvas particle effect)
│   ├── NotificationBell.jsx    # In-app notification bell with unread count badge
│   ├── QuotaBanner.jsx         # Displays monthly credit usage
│   ├── ErrorBox.jsx            # Inline error message display
│   ├── AppFooter.jsx           # Authenticated app footer
│   ├── Footer.jsx              # Public page footer
│   ├── MobileMenu.jsx          # Hamburger nav for mobile
│   ├── PublicHeader.jsx        # Landing / public page header
│   └── ThemeLoader.jsx         # Applies child theme CSS variables + loading animation
├── contexts/
│   ├── OfflineContext.jsx      # Online/offline detection context (used in ChildRoutes)
│   └── ThemeContext.jsx        # Active child theme object — consumed via useTheme()
├── pages/
│   ├── LandingPage.jsx         # Public home page with feature carousel
│   ├── AuthPage.jsx            # Login / register (email + Google OAuth)
│   ├── ForgotPasswordPage.jsx  # Forgot password — email entry, coral theme
│   ├── ResetPasswordPage.jsx   # Reset password — token validated on load, coral theme
│   ├── DemoPage.jsx            # Public demo (Cloudflare Turnstile protected)
│   ├── ChildList.jsx           # Parent dashboard — child switcher
│   ├── ChildForm.jsx           # Add / edit child profile (with two-step delete)
│   ├── AdminPage.jsx           # Admin dashboard (ADMIN / SUPER_ADMIN role)
│   ├── AdminProfilePage.jsx    # Admin profile — change password, delete account
│   ├── ProfilePage.jsx         # Parent account settings + custom story voices
│   ├── HelpPage.jsx            # Help & FAQ
│   ├── ErrorPage.jsx           # 404 / error fallback
│   └── legal/                  # Privacy, Terms, Contact pages
├── features/
│   ├── stories/Stories.jsx     # AI story generation + TTS + voice/accent picker
│   ├── draw/Draw.jsx           # Free-draw canvas + AI drawing guide + "Bring to Life" animation + fullscreen
│   ├── draw/FlipbookStudio.jsx # Frame-by-frame animation studio (tab inside Draw)
│   ├── draw/animationEngine.js # Canvas animation engine: cutout extraction, 100+ object animators, particle system
│   ├── draw/animationLibrary.js # Object → animation mapping (1000+ label definitions)
│   ├── journal/Journal.jsx     # Private kid journal
│   ├── curiosity/Curiosity.jsx # Daily curiosity questions + semantic similar
│   ├── learn/LearnPage.jsx     # Letter/word tracing with AI validation + fullscreen
│   ├── readquiz/ReadQuiz.jsx   # Read-along + comprehension quiz
│   ├── mywriting/MyWriting.jsx # Kids writing + AI coach + "What happens next?"
│   ├── memory/MemoryPlay.jsx   # Memory card-matching game + Word of Day
│   ├── activities/Activities.jsx # Activity suggestions + semantic similar
│   ├── timeline/Timeline.jsx   # Child progress timeline
│   └── trace/
│       ├── Maze.jsx            # Procedurally generated maze game (see below)
│       └── Riddle.jsx          # Age-adaptive riddles (see below)
├── themes.js                   # Theme definitions (colours per child theme)
├── tour.js                     # driver.js tour step config
├── App.jsx                     # Layout shell, headers, bottom nav, hook composition (~540 lines)
├── main.jsx                    # React entry point
└── index.css                   # Global styles + CSS variables
```

---

## Environment Variables

Create a `.env` file in the `frontend/` directory for local development.  
For production, set these in the Vercel dashboard.

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL e.g. `https://api.glumbi.com/api` (defaults to `http://localhost:8080/api`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID from Google Cloud Console |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile site key (use `1x00000000000000000000AA` for local dev) |

### Local `.env` example

```env
VITE_GOOGLE_CLIENT_ID=651167938020-xxxxx.apps.googleusercontent.com
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

> `VITE_API_URL` is intentionally omitted locally — it defaults to `http://localhost:8080/api`.  
> `.env.production` is gitignored and contains the real production values.

---

## Running Locally

**Prerequisites:** Node.js 18+, npm

```bash
# From the frontend/ directory
npm install
npm run dev
```

App available at: http://localhost:5173

---

## Building for Production

```bash
npm run build
```

Output goes to `dist/`. Vercel runs this automatically on every push to `main`.

---

## Key Patterns

### API client (`src/api/client.js`)

All API calls go through the Axios instance in `client.js`. It:
- Sets `baseURL` from `VITE_API_URL` env var (falls back to localhost)
- Attaches the JWT `Authorization: Bearer` header from `localStorage` on every request
- Exposes typed helper functions for each feature (`storyApi`, `activityApi`, `quizApi`, `mazeApi`, `riddleApi`, etc.)
- Intercepts all errors and sanitises them — raw server messages, stack traces, and host details are never surfaced to the user; 401 → `/error/401`, 403 → `/error/403`, 502/503 → `/error/502`, no-response (server down) → `/error/502`

### Error pages

- `ErrorPage.jsx` handles 401, 403, 404, 429, 500, 502, 503 with coral-themed friendly pages
- `public/404.html` and `public/500.html` are static coral-themed pages served by Vercel CDN for route-level errors or when the React app itself fails to load
- `index.html` includes an inline fallback rendered inside `#root` that stays visible if the JS bundle errors before React mounts; disappears automatically once React takes over
- `vercel.json` wires `404.html` and `500.html` as Vercel error pages
- **Admin 502 redirect loop:** The admin `Routes` block in `App.jsx` must include `<Route path="/error/:code" element={<ErrorPage .../>} />` before its wildcard `path="*"` catch-all. Without it, `/error/502` matches the wildcard and redirects back to `/admin/dashboard`, triggering another 502 — an infinite loop. Child routes avoid this via an early `if (/^\/error\//.test(location.pathname))` guard that runs before the Routes tree.

### Draw + Bring to Life (`features/draw/Draw.jsx` + `animationEngine.js`)

- Free-draw canvas with pencil, paint bucket (flood fill, tolerance 32), and eraser tools. Five brush sizes. Fullscreen mode.
- **"Bring to Life"** sends the canvas as a base64 PNG to the backend (`/api/draw/animate`), which uses Claude vision to identify objects and return a structured animation plan (object label, bounding box, animation type). The frontend `bringToLife()` function in `animationEngine.js` crops each object's region from the canvas (`extractCutout`), strips the white background (`stripWhite`, threshold 248), and runs object-specific animators.
- **Animation engine** (`animationEngine.js`): 100+ named animators (bee flies arc, flower wiggles, rocket launches, etc.), a particle system, ambient background particles, multi-object interaction scenes (pollination, dog fetch, basketball shot, rocket-moon, etc.), and a `buildAdaptiveSceneAnim` fallback that assigns roles (background/midground/foreground) to any combination of detected objects.
- **Tab strip**: Draw and Flipbook share the same route (`/child/:id/draw`) with `?tab=draw` / `?tab=flipbook` query params managed via `useSearchParams`.

### Flipbook Studio (`features/draw/FlipbookStudio.jsx`)

- Frame-by-frame animation studio accessible via the Flipbook tab inside Draw.
- Up to **24 frames**. Tools: pencil (crosshair cursor), paint bucket fill, eraser, undo, clear frame, onion skin toggle (👁️ — shows previous frame at 30% opacity).
- **Playback**: `setInterval` at selected fps (2 / 4 / 8 / 12). During playback, `setCurrentIdx` updates every tick so the frame strip highlight and counter track the playing frame. `stopPlay` syncs `currentIdxRef` to where playback stopped.
- **Frame strip**: horizontally scrollable thumbnail strip with drag-and-drop reorder. Mouse: HTML5 drag events. Touch: `onTouchMove` with 8px movement threshold spawns a fixed-position ghost thumbnail; `document.elementFromPoint` finds the drop target; `onTouchEnd` prevents the synthetic click (taps still select frames). Auto-scrolls the active frame into view via `scrollIntoView` in a `useEffect` watching `currentIdx`.
- **Download**: `MediaRecorder` + `canvas.captureStream(fps)` renders each frame to an offscreen canvas and records as `.webm` video — no external library.
- **Blend Frames**: pixel-by-pixel linear interpolation (`lerp`) between the current and next frame — inserts 2 intermediate blended frames. Honest label ("mixes this + next frame") since it creates colour blends, not motion paths.
- **Analytics**: `useFeatureDuration('flipbook', track)` session event on unmount; `track('flipbook', 'play')`, `track('flipbook', 'save')`, `track('flipbook', 'smooth')` for specific actions.

### Maze (`features/trace/Maze.jsx`)

Procedurally generated mazes using a **DFS recursive backtracker**:

- `generateMaze(cols, rows, seed)` — iterative DFS using a seeded LCG RNG; walls are removed to carve open corridors; every cell is reachable (perfect maze)
- `solveMaze(grid, rows, cols)` — BFS from `(0,0)` to `(rows-1, cols-1)`; returns the solution path as a cell list
- **Grid size by age:** 4×3 (age ≤4) → 5×4 (≤6) → 7×5 (≤8) → 9×6 (≤10) → 11×7 (11+)
- **Dead-end detection:** any cell not on the BFS solution path is a dead end; entering 3+ consecutive dead-end cells triggers a "Dead end!" flash, auto-trims the trail back to the last solution cell
- **Touch tracing:** uses imperative `addEventListener({ passive: false })` to override React's passive default and call `preventDefault()` — required for fullscreen touch tracing. Coordinates mapped via `svg.getScreenCTM().inverse()` for correct fullscreen coordinate offset
- **New Maze / AI Theme:** `New Maze` picks a new random seed and rotates the built-in theme (5 colour themes). `AI Theme` calls the backend (`POST /api/trace/generate`) for age-appropriate emojis + completion story, and also generates a new maze layout
- Backtracking is supported: dragging back over the previous cell trims the trail

### Riddles (`features/riddle/Riddle.jsx`)

- 8 bundled riddles shuffled into sets of 5 — works fully offline
- `riddleApi.generate()` uses one credit to get 5 fresh AI riddles from the backend
- Two wrong attempts reveals the answer and advances automatically (1.2 s delay)
- Score tracked across the 5-riddle round with ⭐/🏆/🎯 completion screen
- Prev/Next overlay buttons inside the riddle card for navigating back

### Daily Streak

- Every time a child profile is selected (or restored on page load), `App.jsx` calls `POST /api/children/{id}/checkin`
- Same-day visit → no change; yesterday → streak +1; gap > 1 day → reset to 1
- The returned `streakCount` is merged into local child state and shown as `🔥 N` in the nav bar
- Stored on the `Child` entity so streaks persist across devices and tab closes

### Semantic Similarity (RAG — Stories, Curiosity, Activities)

All three content features expose an on-demand **"similar content"** panel backed by pgvector. The API client helpers:

```js
storyApi.getSimilar(id)     // GET /api/stories/{id}/similar
curiosityApi.getSimilar(id) // GET /api/curiosity/{id}/similar
activityApi.getSimilar(id)  // GET /api/activities/{id}/similar
```

**UX pattern (same across all three features):**
- A toggle button on each card (`🔗 Related questions`, `✦ Similar activities`, `More like this`) is shown.
- On first open the call is made lazily; result is cached in component state so repeated toggles do not re-fetch.
- Loading state shows `…`; empty result shows a friendly message.

**How it works (no Voyage AI at read time):**
The backend uses a pgvector `<->` cosine distance JOIN on the stored embedding column — zero external API calls on navigation. Voyage AI was already called (async, fire-and-forget) when the record was first saved.

### Story Continuation

- **Stories page** — any story has a **▶ Continue** button in the action row; calls `POST /api/stories/generate` with `previousStoryId` set; the backend passes the last 600 chars of the original as context to `StoryAgent.continueStory()`. Result is saved as a new story and appears at the top of the list.
- **My Writing page** — any saved story has a **✨ What happens next?** button; calls `POST /api/writing/{id}/continue`; the backend generates a continuation via the same `StoryAgent.continueStory()` but does **not** save the result — it is shown as inspiration only. The child can adopt it into the editor via "Use this — keep writing!" or regenerate with "Try another idea".
- Both flows show the themed `ThemeLoader` animation and call `window.__glumbiRefreshQuota?.()` on success to refresh the credit counter

### Parental Lock & Session Timer (`hooks/useLockSession.js`)

- Parents set a 4-digit PIN + optional time limit on the child list page before handing the device over
- All lock state lives in `useLockSession`; UI in `LockModal.jsx` (PIN entry) and `ScreenTimeModal.jsx` (time-up alert)
- PIN inputs are wrapped in `<form>` elements (suppresses browser console warnings); the unlock form submits on Enter
- "I'm done — lock 🔒" from the screen-time popup sets `lockModalForced = true`, removing the Cancel button — the child cannot bypass back to the app without the parent entering the PIN
- Lock state persists in `localStorage`; PIN is never sent to the server
- **Timer pauses** when the tab is hidden (`visibilitychange`) and auto-corrects for device sleep (tick delta > 45 s)

**Session timer (per child, applies regardless of lock state):**
- Each child has its own independent timer, keyed by child ID in `localStorage`: `glm_session_start_<childId>`, `glm_snooze_count_<childId>`, `glm_session_limit_<childId>`, `glm_session_max_snooze_<childId>`
- `localStorage` is used (not `sessionStorage`) so the timer survives tab close — a child who closes the tab mid-session is still locked out when the tab is reopened
- Timer starts fresh at 0 every time that child's profile is opened — locked or unlocked
- **Page refresh** → timer resumes from where it left off; snooze count is also restored from localStorage
- **Back to child list** → all `glm_session_start_*` and `glm_snooze_count_*` keys are cleared from localStorage when `child` becomes `null`
- **Reselecting the same child** from the list → no stored key found → fresh timer from 0 (not the old count)
- **Switching to a different child** → same clear happens; new child always starts from 0
- While inside a child session, the child can extend time N times (configured per child via `maxSnoozeCount`)
- Once all snoozes are used up: locked session → shows PIN unlock modal (forced, no Cancel); unlocked session → navigates back to child list

### Authentication

- JWT token stored in `localStorage` as `glm_token`
- User role stored as `glm_role` (`PARENT`, `ADMIN`, or `SUPER_ADMIN`)
- `hooks/useAuth.js` reads these on mount and initialises auth state synchronously from `window.location.pathname`
- Google Sign-In uses the Google Identity Services script loaded in `index.html`
- Admin accounts are always password-only — Google OAuth is not available for `ADMIN` or `SUPER_ADMIN` roles
- **"Forgot password?" link** in `AuthPage.jsx` uses React Router `<Link>` (not `<a href>`) to avoid a full-page reload

### Password reset flow (`ForgotPasswordPage.jsx` + `ResetPasswordPage.jsx`)

1. User enters email on `/forgot-password` → `authApi.forgotPassword(email)` → always shows success (no user enumeration)
2. Email contains a one-time UUID token (1 hour TTL); clicking the link opens `/reset-password?token=xxx`
3. On mount, `ResetPasswordPage` calls `authApi.validateResetToken(token)` — a non-destructive GET that shows an error screen immediately if the token is expired/invalid/already used, before the user fills in anything
4. On submit, `authApi.resetPassword(token, password)` validates password policy server-side and marks the token used
5. Both pages use `PublicHeader` + `Footer` (SPA, no full reload) and the coral theme (`#ff6b6b` gradient background)

### Theming

Each child has a colour theme (e.g. Ocean, Forest, Sunset). `applyTheme(key)` in `themes.js` immediately sets CSS custom properties (`--primary`, `--accent`, `--primary-lt`, `--header-grad`, etc.) on `document.documentElement` — no re-render required for any component using `var(--primary)` etc. in inline styles.

For components that need the actual hex values at render time (building gradient strings, JS animations), the active theme object is published via **React Context**:

- `App.jsx` wraps the child session in `<ThemeContext.Provider value={theme}>`
- `AppSidebar` and `MobileMenu` call `const theme = useTheme()` internally — no prop drilling
- `applyTheme` is called with `useLayoutEffect` for the management-page theme reset so CSS variables are applied before the first paint (no flash)

**Nav active-item style** — sidebar and hamburger menu both use an oval pill (`borderRadius: 50`) with a near-white background (`rgba(255,255,255,0.92)`) and `theme.primary` text colour when the item is active, matching the bottom mobile nav's tab-indicator pattern.

### Responsive layout

- `useIsMobile` hook (`src/hooks/useIsMobile.js`) listens to `window.resize` and returns `true` when the viewport is below 640 px — reactive, not a one-shot snapshot
- Stories, Read & Quiz, and My Writing use a sidebar + main panel layout on desktop; they collapse to a single-panel view with a back button on mobile
- Admin panel Feature Credits grid, Budget Simulator, and Users sections switch to a card-per-row layout on mobile
- Popups (language picker, speed selector, volume, admin kebab menus) use `position: fixed` with `getBoundingClientRect()` to escape `overflow: hidden` containers; admin kebab menus flip upward when there is insufficient space below

### Audio player (`AudioPlayer.jsx`)

- Supports playback speed (0.5× – 2×) via a popup selector
- Volume control with a styled range slider
- Relies on HTTP Range request support for seeking — works against both the backend (in-memory fallback) and Cloudflare R2 (redirect path)
- Switching stories keeps audio playing in the background; player reappears when returning to the playing story
- Clicking Listen on a different story stops the current audio and starts the new one

### Voice / accent picker (`Stories.jsx`)

The listen button opens a language picker popup that includes:
- **Custom voice chips** — shown only when the family has saved custom voices; chips for Default + each named voice (Mom, Dad, Granny…). Selection saved to `localStorage` keyed by child ID (`glumbi_voice_{childId}`)
- **Voice toggle** — ♀ Female / ♂ Male — hidden when a custom voice is selected
- **English Accent** — US 🇺🇸 / India 🇮🇳 / British 🇬🇧 / Australian 🇦🇺 — hidden when a custom voice is selected
- **Language buttons** — English + 6 international + 5 Indian regional
- Selections persist in `localStorage` (`glumbi_accent`, `glumbi_gender`)
- When a custom voice is selected, `?familyVoiceId=<id>` is passed to the backend listen URL instead of a WaveNet voice name
- **Practice mode (AI off) + listen**: allowed only if the story already has a cached R2 URL (free redirect). First-time listens are blocked with a friendly message — they would cost a TTS call. The check uses `story.audioUrls` (returned in the story JSON) to decide before making any API call.

### Custom Story Voices (`ProfilePage.jsx`)

Parents manage up to 5 named voices from My Account → Story Voices:
- **Record** — uses browser `MediaRecorder` API; live timer shown during recording; playback before confirming
- **Upload** — file picker accepting any audio format
- Name field (e.g. Mom, Dad) stays visible during recording and playback — disabled to prevent accidental edits
- Voice list supports inline rename and delete
- `voiceApi` in `client.js` covers `list`, `create` (multipart upload), `rename`, `delete`

### Learn to Write (`LearnPage.jsx`)

- Canvas drawing area for letters (English, Tamil, Hindi) and words
- On submit, the canvas is base64-encoded and sent to `/api/learn/validate` or `/api/learn/word`
- AI validation is lenient: any visible strokes = correct, blank canvas = incorrect
- Correct attempts are saved to the Timeline (`category = "learn"`)
- TTS pronunciation available for each letter/word via `/api/learn/audio`

### Admin panel (`AdminPage.jsx` + `AdminProfilePage.jsx`)

- **Collapsible sidebar (desktop)**: the admin sidebar collapses to a 52px icon-only rail via a floating circular toggle button (`‹`/`›`) that pokes out of the sidebar edge. Width animates between 220px and 52px; collapsed mode shows only centred icons with `title` tooltips.
- **Role hierarchy**: `ADMIN` manages app users; `SUPER_ADMIN` additionally manages admins (promote, demote, create). Guards are enforced on both frontend (kebab menu items hidden based on `callerRole`) and backend.
- **Users** section: three groups — 👑 Super Admins / 🛡️ Administrators / 👤 App Users. Hold/release is available for app users only; admin and super admin accounts can only be deleted. Quota bar colours: green (<50%) → blue (50–79%) → amber (80–99%) → red (100%).
- **Kebab menu**: uses `position: fixed` + `getBoundingClientRect()` to escape clipping. Flips upward when there is not enough space below. Returns `null` (no popup) when the caller has no valid actions on that row.
- **Dashboard**: manual 🔄 refresh + auto-refresh interval dropdown; AI Credits total sourced from `ai_usage_log`.
- **AI Agents**: toggle individual weekly-notification agents on/off.
- **Feature Credits**: enable/disable features globally, set per-feature credit costs. `FEATURE_META` map at the bottom of `AdminPage.jsx` drives the credits tab — new features must be added here as well as `FEATURE_DISPLAY_MAP` (used by the user feature override modal).
- **Scheduler History**: live run history — RUNNING ⏳ / SUCCESS ✅ / FAILED ❌, timestamps, duration, agents ran/skipped, errors.
- **Admin profile** (`/admin/profile` → `AdminProfilePage.jsx`): separate page with dark indigo theme, no voice/theming features. Email fetched from `GET /api/users/profile` (not localStorage). Change password + two-step delete account. Super admins see a note that another super admin must exist before self-delete.

### Analytics — Activity Tracking

#### `analyticsSocket.js` (`src/grpc/analyticsSocket.js`)

Singleton WebSocket client for analytics streaming:

- `analyticsSocket.open()` — opens the WebSocket connection to `/ws/events?token=<jwt>`; attaches `visibilitychange` listener
- `analyticsSocket.close()` — closes the connection cleanly on session end (code 1000)
- `analyticsSocket.send(events)` — sends a JSON array of events; returns `false` if disconnected
- `analyticsSocket.onAck` — callback set by `useActivityTracker`; called with the `saved` count from the server's `{"saved": N}` reply
- **Tab lifecycle**: tab hidden → closes connection to free server resources; tab visible → reconnects immediately with backoff reset
- **Reconnect**: exponential backoff 1s → 2s → 4s → 32s cap. Does not retry on codes 1000 (normal), 1001 (server idle timeout), or 4001 (auth rejected)
- **Base URL**: derived from `VITE_API_URL` with `/api` suffix removed and `http` → `ws` (or `https` → `wss`) replaced

#### `useActivityTracker` hook (`src/hooks/useActivityTracker.js`)

Offline-first analytics hook using WebSocket for real-time delivery:

- Opens `analyticsSocket` when `childLocked = true` (child session active); closes on session end — parent sessions never open a socket
- `track(feature, eventType, metadata)` — enqueues an event to `localStorage` key `glm_activity_queue`; flushes if socket is open
- `flush()` — sends the pending queue via `analyticsSocket.send()`; guards against double-flush with `sendingRef.current`
- **ACK-based dequeue**: `analyticsSocket.onAck` fires when server replies; queue is sliced by `sendingRef.current` to remove only the sent events — any events enqueued during the send are preserved
- Events survive page refresh (localStorage write is synchronous); `clientKey` UUIDs ensure server-side dedup on retry
- Each event carries: `childId`, `feature`, `eventType`, `durationSeconds`, `clientKey` (UUID), `occurredAt` (UTC ISO string)
- A 2-second poll (`setInterval`) drains the queue after a reconnect — catches events that queued while disconnected

#### `useFeatureDuration` hook (`src/hooks/useFeatureDuration.js`)

Fires a `session` event with `durationSeconds` on component unmount. Excludes idle time (hidden tab, locked session). Use for any feature that mounts/unmounts on navigation:

```js
const { track } = useFeatureDuration('featureName', track)
```

#### MemoryMatchTab — always-mounted session tracking

`MemoryMatchTab` stays mounted (hidden via `display: none`) to preserve mid-game state, so `useFeatureDuration` (unmount-based) doesn't fire on tab switch within MemoryPlay. Pattern:

- `isActive` prop passed from the parent
- **Effect 1** — watches `isActive`: starts a `Date.now()` ref on `true`, fires session event on `false` (tab switch)
- **Effect 2** — unmount cleanup: fires session event if still active (navigating away from MemoryPlay)
- Minimum 5 s threshold before emitting to avoid noise from accidental taps

#### Event taxonomy

| Event type | When | Counted in sessions? |
|---|---|---|
| `session` | Feature unmount / tab deactivate, with `durationSeconds` | ✅ Yes |
| `correct`, `wrong` | Answer right/wrong in quiz features | ❌ No |
| `match`, `mismatch` | Memory match card flip | ❌ No |
| `complete` | Game/quiz completed | ❌ No |

Only `session` events appear in `featureBreakdown` (parent popup) and session totals. Other events are stored for future analysis but excluded from aggregation.

#### `ACTIVITY_FEATURES` map

Maps internal feature keys to display labels — used to label bars in the parent activity popup. All features are shown; there is no `.slice()` cap (was removed to avoid silently dropping newly added features).

#### Touch-friendly analytics charts

All chart bars and heatmap cells use **click-based inline popups**, never `title` attributes (hover-only, invisible on touch devices):

- **Parent popup (ChildList.jsx):** two separate states — `activeDailyBar` (daily sessions chart) and `activeHourBar` (hourly activity chart) — each chart renders its own popup inline, immediately below its own bars
- **Admin heatmap (AdminPage.jsx):** `activeCell` state — popup renders as an inline div below the gradient legend, inside the heatmap container (not `position: fixed`)
- All popups have a ✕ close button using the standard circular button style

---

### Notifications (`NotificationBell.jsx`)

- Bell icon in the nav with unread count badge
- Supports notification types: `PROGRESS_REPORT`, `MILESTONE`, `STORY_RECOMMENDATION`, `LEARNING_INSIGHT`, `LEARN_TO_WRITE`, `QUOTA_WARNING`
- Each type has a display label and emoji icon

### Typography

Global font rules in `index.css`:
- `h1` — Fredoka One (rounded, playful; used for page titles)
- `h2`, `h3` — Nunito 800 (clean, readable; used for section headings and content)
- Pages that intentionally use Fredoka One on `h2` (e.g. Stories story title, Read & Quiz) use explicit inline `fontFamily` overrides

---

## Routing

Routes are split across three files. `App.jsx` selects which set to render based on auth state; `vercel.json` rewrites all paths to `index.html` so React Router handles navigation on refresh.

| File | Routes |
|---|---|
| `routes/PublicRoutes.jsx` | `/`, `/about`, `/demo`, `/login`, `/forgot-password`, `/reset-password`, `/privacy`, `/terms`, `/contact` |
| `layouts/ManagementLayout.jsx` (children from `App.jsx`) | `/child`, `/child/new`, `/child/:id/edit`, `/profile`, `/help` |
| `routes/ChildRoutes.jsx` | All `/child/:childId/*` feature routes |

| Path | Page |
|---|---|
| `/` | Landing page |
| `/auth` | Login / register |
| `/forgot-password` | Forgot password (coral theme, no user enumeration) |
| `/reset-password?token=xxx` | Reset password (token validated on page load) |
| `/demo` | Public demo |
| `/children` | Child switcher (parent) |
| `/child/:id/stories` | Stories |
| `/child/:id/activities` | Activities |
| `/child/:id/curiosity` | Curiosity |
| `/child/:id/readquiz` | Read & Quiz |
| `/child/:id/mywriting` | My Writing |
| `/child/:id/draw` | Draw (✏️ Draw tab + 🎬 Flipbook tab via `?tab=flipbook`) |
| `/child/:id/journal` | Journal |
| `/child/:id/timeline` | Timeline |
| `/child/:id/learn` | Learn to Write |
| `/child/:id/memory` | Memory Play |
| `/child/:id/maze` | Maze (redirects from `/trace`) |
| `/child/:id/riddle` | Riddles |
| `/admin/profile` | Admin profile (change password, delete account) |
| `/admin/*` | Admin panel |
| `/privacy`, `/terms`, `/contact` | Legal pages |
