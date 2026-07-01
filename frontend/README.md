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
│   ├── Stories.jsx         # AI story generation + audio player
│   ├── Activities.jsx      # Activity suggestions per story
│   ├── Curiosity.jsx       # Daily curiosity questions
│   ├── ReadQuiz.jsx        # Read & quiz with history
│   ├── MyWriting.jsx       # Kids writing + AI coach feedback
│   ├── Draw.jsx            # Free-draw canvas
│   ├── Journal.jsx         # Private kid journal
│   ├── Timeline.jsx        # Activity timeline view
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
| `/admin` | Admin panel |
| `/privacy`, `/terms`, `/contact` | Legal pages |
