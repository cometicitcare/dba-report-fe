# Buddhist Affairs MIS Dashboard — Frontend

React + Vite + Tailwind CSS frontend for the Buddhist Affairs Department MIS Dashboard.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build tool | Vite 5 |
| Styling | Tailwind CSS 3 |
| HTTP client | Axios |
| State/queries | TanStack Query v5 |
| Charts | Recharts |
| Icons | Lucide React |

---

## Quick Start (Local Development)

### 1. Prerequisites

- Node.js 18+
- npm 9+
- Backend running at `http://localhost:8000` (see `backend/README.md`)

### 2. Install dependencies

```bash
cd frontend
npm install
```

### 3. Configure environment

```bash
cp .env.example .env
# .env is pre-configured for local dev — no changes needed by default
```

Default `.env` for local development:
```
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

### 4. Start dev server

```bash
npm run dev
```

App is available at: `http://localhost:3000`

---

## Authentication

The app shows a **Login page** on first load. All dashboard routes are protected — they only render after a valid login.

**Default credentials** (configured via the [backend](../backend/README.md) `.env`):

| Field | Value |
|-------|-------|
| Username | `report_admin` |
| Password | `Report@Admin2024` |

**Session behaviour:**
- Token is stored in `sessionStorage` — it clears automatically when the browser tab is closed.
- Token lifetime: **8 hours** (configurable on the backend).
- On token expiry or 401, the user is automatically returned to the login page.

---

## Environment Variables

All `VITE_` prefixed variables are **baked in at build time** by Vite.

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `http://localhost:8000/api/v1` | Backend API base URL (include `/api/v1`) |
| `VITE_APP_NAME` | `Buddhist Affairs MIS Dashboard` | App display name |

> **Important for Railway:** Set `VITE_API_BASE_URL` in Railway environment variables  
> **before** the build runs. Vite bakes the value into the static bundle at compile time.

---

## Deploy to Railway

### Steps

1. **Create a new Railway project** and connect your Git repo  
   (set the root directory to `frontend/`).

2. **Set environment variables** in Railway → Variables tab:

   | Variable | Value |
   |----------|-------|
   | `VITE_API_BASE_URL` | `https://YOUR-BACKEND.up.railway.app/api/v1` |
   | `VITE_APP_NAME` | `Buddhist Affairs MIS Dashboard` |

   > Set these **before** triggering a deployment so Vite can bake them into the build.

3. Railway uses Nixpacks and `railway.json` for build/start:
   - **Build:** `npm install && npm run build`
   - **Start:** `npm run start` → `vite preview --host 0.0.0.0 --port $PORT`

4. The backend must have your Railway frontend URL in its `CORS_ORIGINS` env var:
   ```
   CORS_ORIGINS=https://YOUR-FRONTEND.up.railway.app
   ```

5. After deploy, visit your Railway frontend URL — you should see the login page.

---

## Project Structure

```
frontend/
├── src/
│   ├── App.jsx                    # Root: AuthProvider + AuthGate → dashboard
│   ├── main.jsx                   # React entry point
│   ├── components/
│   │   ├── auth/
│   │   │   └── LoginPage.jsx      # Login form UI
│   │   ├── charts/                # Recharts wrappers
│   │   ├── common/                # Shared UI components
│   │   ├── layout/
│   │   │   └── Header.jsx         # App header + logout button
│   │   └── sections/              # Dashboard section components
│   ├── context/
│   │   ├── AuthContext.jsx        # Auth state + login/logout
│   │   └── DashboardContext.jsx   # Dashboard filter/selection state
│   ├── hooks/
│   │   └── useApi.js              # TanStack Query hooks
│   ├── services/
│   │   └── api.js                 # Axios instance + all API calls
│   └── styles/
│       └── index.css              # Tailwind + global styles
├── .env                           # Local secrets (git-ignored)
├── .env.example                   # Template — safe to commit
├── railway.json                   # Railway build/start config
├── vite.config.js                 # Vite config (proxy, build)
├── tailwind.config.js
└── package.json
```

---

## Security Notes

- The JWT token is stored in `sessionStorage` (not `localStorage`) — cleared when the tab closes.
- All API requests include the Bearer token via an Axios request interceptor.
- A 401 response from the backend automatically clears the token and shows the login page.
- Never commit `.env` to version control.
