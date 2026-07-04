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
│   └── client.js          # Axios instance + all API call helpers
├── components/
│   ├── AudioPlayer.jsx     # Story audio player (speed, volume, seek, HTTP range)
│   ├── ConfirmDialog.jsx   # Reusable delete-confirmation modal
│   ├── NotificationBell.jsx # In-app notification bell with unread count badge
│   ├── QuotaBanner.jsx     # Displays monthly credit usage
│   ├── ErrorBox.jsx        # Inline error message display
│   ├── AppFooter.jsx       # Authenticated app footer
│   ├── Footer.jsx          # Public page footer
│   ├── MobileMenu.jsx      # Hamburger nav for mobile
│   ├── PublicHeader.jsx    # Landing / public page header
│   └── ThemeLoader.jsx     # Applies child theme CSS variables
├── hooks/
│   └── useIsMobile.js      # Returns true when viewport < 640px
├── pages/
│   ├── LandingPage.jsx     # Public home page
│   ├── AuthPage.jsx        # Login / register (email + Google OAuth)
│   ├── DemoPage.jsx        # Public demo (Cloudflare Turnstile protected)
│   ├── ChildList.jsx       # Parent dashboard — child switcher
│   ├── ChildForm.jsx       # Add / edit child profile
│   ├── ChildSetup.jsx      # Onboarding wizard for new child
│   ├── Stories.jsx         # AI story generation + audio player + runtime voice/accent/gender picker
│   ├── Activities.jsx      # Activity suggestions per story
│   ├── Curiosity.jsx       # Daily curiosity questions
│   ├── ReadQuiz.jsx        # Read & quiz with history
│   ├── MyWriting.jsx       # Kids writing + AI coach feedback
│   ├── Draw.jsx            # Free-draw canvas
│   ├── Journal.jsx         # Private kid journal
│   ├── LearnPage.jsx       # Learn to Write — letter/word tracing with AI validation
│   ├── Timeline.jsx        # Activity timeline view
│   ├── ProfilePage.jsx     # Child profile view
│   ├── AdminPage.jsx       # Admin dashboard (admin role only)
│   ├── ErrorPage.jsx       # 404 / error fallback
│   └── legal/              # Privacy, Terms, Contact pages
├── themes.js               # Theme definitions (colours per child theme)
├── tour.js                 # driver.js tour step config
├── App.jsx                 # Router, auth state, layout shell
├── main.jsx                # React entry point
└── index.css               # Global styles + CSS variables
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
- Exposes typed helper functions for each feature (`storyApi`, `activityApi`, `quizApi`, etc.)
- Intercepts all errors and sanitises them — raw server messages, stack traces, and host details are never surfaced to the user; 401 → `/error/401`, 403 → `/error/403`, 502/503 → `/error/502`, no-response (server down) → `/error/502`

### Error pages

- `ErrorPage.jsx` handles 401, 403, 404, 429, 500, 502, 503 with coral-themed friendly pages
- `public/404.html` and `public/500.html` are static coral-themed pages served by Vercel CDN for route-level errors or when the React app itself fails to load
- `index.html` includes an inline fallback rendered inside `#root` that stays visible if the JS bundle errors before React mounts; disappears automatically once React takes over
- `vercel.json` wires `404.html` and `500.html` as Vercel error pages

### Daily Streak

- Every time a child profile is selected (or restored on page load), `App.jsx` calls `POST /api/children/{id}/checkin`
- Same-day visit → no change; yesterday → streak +1; gap > 1 day → reset to 1
- The returned `streakCount` is merged into local child state and shown as `🔥 N` in the nav bar
- Stored on the `Child` entity so streaks persist across devices and tab closes

### Story Continuation

- **Stories page** — any story has a **▶ Continue** button in the action row; calls `POST /api/stories/generate` with `previousStoryId` set; the backend passes the last 600 chars of the original as context to `StoryAgent.continueStory()`. Result is saved as a new story and appears at the top of the list.
- **My Writing page** — any saved story has a **✨ What happens next?** button; calls `POST /api/writing/{id}/continue`; the backend generates a continuation via the same `StoryAgent.continueStory()` but does **not** save the result — it is shown as inspiration only. The child can adopt it into the editor via "Use this — keep writing!" or regenerate with "Try another idea".
- Both flows show the themed `ThemeLoader` animation and call `window.__glumbiRefreshQuota?.()` on success to refresh the credit counter

### Parental Lock & Session Timer

- Parents set a 4-digit PIN + optional time limit on the child list page before handing the device over
- Lock state is session-based (`sessionStorage`); PIN is never sent to the server
- Unlock access modal follows the child's colour theme (`THEMES[child.theme]`)

**Session timer (per child, applies regardless of lock state):**
- Each child has its own independent timer, keyed by child ID in `localStorage`: `glm_session_start_<childId>`, `glm_snooze_count_<childId>`, `glm_session_limit_<childId>`, `glm_session_max_snooze_<childId>`
- `localStorage` is used (not `sessionStorage`) so the timer survives tab close — a child who closes the tab mid-session is still locked out when the tab is reopened
- Timer starts fresh at 0 every time that child's profile is opened — locked or unlocked
- **Page refresh** → timer resumes from where it left off; snooze count is also restored from localStorage
- **Back to child list** → all `glm_session_start_*` and `glm_snooze_count_*` keys are cleared from localStorage when `child` becomes `null`
- **Reselecting the same child** from the list → no stored key found → fresh timer from 0 (not the old count)
- **Switching to a different child** → same clear happens; new child always starts from 0
- While inside a child session, the child can extend time N times (configured per child via `maxSnoozeCount`)
- Once all snoozes are used up: locked session → shows PIN unlock modal; unlocked session → navigates back to child list (no forced logout)

### Authentication

- JWT token stored in `localStorage` as `glm_token`
- User role stored as `glm_role` (`PARENT` or `ADMIN`)
- `App.jsx` reads these on mount and initialises auth state synchronously from `window.location.pathname`
- Google Sign-In uses the Google Identity Services script loaded in `index.html`

### Theming

Each child has a colour theme (e.g. Ocean, Forest, Sunset). `ThemeLoader.jsx` reads the active child's theme and injects CSS custom properties (`--primary`, `--accent`, etc.) onto `:root`. All components use these variables so the entire UI re-skins per child.

### Responsive layout

- `useIsMobile` hook (`window.innerWidth < 640`) drives show/hide of panels on mobile
- Stories, Read & Quiz, and My Writing use a sidebar + main panel layout on desktop; they collapse to a single-panel view with a back button on mobile
- Popups (language picker, speed selector, volume) use `position: fixed` with `getBoundingClientRect()` to escape `overflow: hidden` containers

### Audio player (`AudioPlayer.jsx`)

- Supports playback speed (0.5× – 2×) via a popup selector
- Volume control with a styled range slider
- Relies on HTTP Range request support in the backend for seeking

### Voice / accent picker (`Stories.jsx`)

The listen button opens a language picker popup that includes:
- **Custom voice chips** — shown only when the family has saved custom voices; chips for Default + each named voice (Mom, Dad, Granny…). Selection saved to `localStorage` keyed by child ID (`glumbi_voice_{childId}`)
- **Voice toggle** — ♀ Female / ♂ Male — hidden when a custom voice is selected
- **English Accent** — US 🇺🇸 / India 🇮🇳 / British 🇬🇧 / Australian 🇦🇺 — hidden when a custom voice is selected
- **Language buttons** — English + 6 international + 5 Indian regional
- Selections persist in `localStorage` (`glumbi_accent`, `glumbi_gender`)
- When a custom voice is selected, `?familyVoiceId=<id>` is passed to the backend listen URL instead of a WaveNet voice name

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

### Admin panel (`AdminPage.jsx`)

- **Dashboard**: manual 🔄 refresh + auto-refresh interval dropdown (Off / 1 min / 5 min / 15 min / 30 min); AI Credits total sourced from `ai_usage_log`, not the resettable counter
- **Users**: quota bar and label colour reflect urgency — green (<50%) → blue (50–79%) → amber (80–99%) → red (100%); same palette as the parent-facing `QuotaBadge`
- **AI Agents** section: toggle individual weekly-notification agents on/off; all toggles use unified green (enabled) / grey (disabled) colours
- **Scheduler History** modal: live run history from the DB — shows RUNNING ⏳ / SUCCESS ✅ / FAILED ❌ status, started/finished timestamps, duration, children processed, agents ran/skipped, and errors

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

All routes are defined in `App.jsx`. The `vercel.json` at the root of `frontend/` rewrites all paths to `index.html` so React Router handles navigation on refresh.

| Path | Page |
|---|---|
| `/` | Landing page |
| `/auth` | Login / register |
| `/demo` | Public demo |
| `/children` | Child switcher (parent) |
| `/child` | Child dashboard |
| `/stories` | Stories |
| `/activities` | Activities |
| `/curiosity` | Curiosity |
| `/readquiz` | Read & Quiz |
| `/writing` | My Writing |
| `/draw` | Draw |
| `/journal` | Journal |
| `/timeline` | Timeline |
| `/learn` | Learn to Write |
| `/profile` | Child profile |
| `/admin` | Admin panel |
| `/privacy`, `/terms`, `/contact` | Legal pages |
