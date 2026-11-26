# Fixit

**Fixed price. Fixed right.** A booking platform for home repairs in Beirut.

Customers pick a repair from a catalogue with fixed, published prices, book it with the address on a map, and follow the job live. Pros in that trade accept the job, update its status until it is done, and get rated.

Web Programming (020WBPES3) capstone project, USJ / ESIB:
**Raymond Rechdan** (240647) and **Ralph Assi** (242320).

## Live URLs

| | URL |
|---|---|
| Front end (Vercel) | https://fixit-capstone.vercel.app |
| API (Render) | https://fixit-api-2zql.onrender.com/api/health |

> The API runs on Render's free plan, which sleeps after 15 minutes without traffic. The first request after a pause can take up to a minute.

### Demo accounts

All demo accounts use the password `Fixit2026!`.

| Role | Email |
|---|---|
| Customer | `customer@fixit.test` |
| Plumber | `plumber@fixit.test` |
| Electrician | `electrician@fixit.test` |
| AC technician | `ac@fixit.test` |
| Carpenter | `carpenter@fixit.test` |
| Painter | `painter@fixit.test` |

## Features

**Must-haves (all done)**

- Sign up and log in with two roles: **customer** and **pro** (a pro picks a trade)
- Service catalogue by trade (plumbing, electrical, AC, carpentry, painting) with **fixed prices**, search and filter
- **Book a job**: service, address picked on a map, date and time, problem description
- Customer **My jobs** page with live status: requested → accepted → on the way → done (refreshes every 15 s)
- **Pro dashboard**: open jobs in their trade, accept a job (first pro to accept gets it), move it to "on the way" and "done"
- **Rate and review** the pro after the job is done; the pro's public profile shows their average rating
- **Protected routes and role checks**: customers only see their own jobs, pros only see jobs in their trade
- Responsive, mobile-first layout

**Third-party API:** OpenStreetMap **Nominatim** (address search and reverse geocoding) with a **Leaflet** map to pick and show the job location.

**Not built (nice-to-haves from the proposal):** photo upload, extra-work requests, admin page, LBP prices, email notifications, French/Arabic interface.

## Tech stack

| Layer | Technology |
|---|---|
| Front end | React 19 (Vite), React Router, plain CSS (flexbox and grid), Leaflet + react-leaflet |
| Back end | Node.js, Express 5, REST API |
| Database | PostgreSQL (Neon in production), Prisma ORM with migrations and a seed script |
| Authentication | bcrypt password hashing, JWT stored in an httpOnly cookie, Express middleware for login and role checks |
| Security | helmet (security headers), express-rate-limit on login/signup, server-side validation, CORS limited to the front end |
| Testing | Vitest + React Testing Library (front end), Jest + Supertest (back end) |
| Deployment | Vercel (front end), Render (API), Neon (database) |

## Architecture

```
 Browser (React app)
     |  fetch('/api/...')  with the login cookie
     v
 Vercel  --  serves the React build, and forwards /api/* to Render (vercel.json)
     |
     v
 Render  --  Express API:  routes -> middleware (auth, roles) -> validation -> Prisma
     |
     v
 Neon  --  PostgreSQL database (users, services, jobs, reviews)
```

Vercel forwards `/api/*` to the API, so the browser only ever talks to the front end's own domain. The login cookie is a first-party cookie (`SameSite=Lax`, `httpOnly`, `Secure`), which avoids third-party cookie problems in Safari and Chrome. In development, Vite's proxy does the same job (`client/vite.config.js`).

```
fixit/
├── client/                  React front end
│   ├── src/
│   │   ├── api.js           fetch helper (sends the cookie, turns errors into exceptions)
│   │   ├── geocode.js       Nominatim calls (third-party API)
│   │   ├── context/         AuthContext: the logged-in user for the whole app
│   │   ├── components/      Navbar, ProtectedRoute, ServiceCard, MapPicker, Stars...
│   │   ├── pages/           Home, ServiceDetail, Login, Signup, MyJobs, ProDashboard, ProProfile
│   │   └── test/            Vitest tests
│   └── vercel.json          /api proxy + single-page-app fallback
├── server/                  Express API
│   ├── prisma/              schema.prisma, migrations, seed.js
│   ├── src/
│   │   ├── app.js           builds the Express app (middleware + routers)
│   │   ├── server.js        starts the app
│   │   ├── db.js            Prisma client
│   │   ├── validation.js    input validation for every request body
│   │   ├── middleware/      auth.js (requireAuth, requireRole), errors.js
│   │   └── routes/          auth, services, jobs, pros
│   └── test/                Jest + Supertest tests
└── docs/                    wireframes and database schema
```

### Database

Four tables: `users`, `services`, `jobs`, `reviews`. See [docs/database-schema.md](docs/database-schema.md) for the diagram and [docs/wireframes.svg](docs/wireframes.svg) for the wireframes.

### API

| Method | Route | Who | What |
|---|---|---|---|
| GET | `/api/health` | anyone | test route |
| POST | `/api/auth/signup` | anyone | create an account (sets the login cookie) |
| POST | `/api/auth/login` | anyone | log in (sets the login cookie) |
| POST | `/api/auth/logout` | anyone | clear the cookie |
| GET | `/api/auth/me` | logged in | the current user |
| GET | `/api/services?category=&q=` | anyone | catalogue with filter and search |
| GET | `/api/services/:id` | anyone | one service |
| POST | `/api/jobs` | customer | book a job |
| GET | `/api/jobs/mine` | logged in | customer: jobs I booked, pro: jobs I accepted |
| GET | `/api/jobs/open` | pro | requested jobs in my trade |
| PATCH | `/api/jobs/:id/accept` | pro | accept a job (409 if someone was faster) |
| PATCH | `/api/jobs/:id/status` | assigned pro | accepted → on_the_way → done |
| PATCH | `/api/jobs/:id/cancel` | customer (owner) | cancel a job nobody accepted yet |
| POST | `/api/jobs/:id/review` | customer (owner) | rate a finished job (1 to 5) |
| GET | `/api/pros/:id` | anyone | pro profile with average rating |

Errors always have the same shape: `{ "error": { "message": "...", "details": [ { "field", "message" } ] } }` with the right status code (400, 401, 403, 404, 409, 500).

## Run it locally

You need Node.js 20+ and PostgreSQL.

```bash
# 1. API
cd server
cp .env.example .env        # then put your own DATABASE_URL and JWT_SECRET
npm install
npx prisma migrate dev      # creates the tables
npm run seed                # catalogue + demo accounts
npm run dev                 # http://localhost:4000

# 2. Front end (in a second terminal)
cd client
npm install
npm run dev                 # http://localhost:5173
```

## Tests

```bash
cd server && npm test       # Jest + Supertest: validation, 401/403 checks, error handling
cd client && npm test       # Vitest + React Testing Library: components and ProtectedRoute
```

## Deployment

- **Database:** a Neon PostgreSQL project. `DATABASE_URL` is set on Render, never committed.
- **API:** Render web service with root directory `server` (see `render.yaml`). The build runs `prisma generate` and `prisma migrate deploy`. Environment variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `NODE_ENV=production`.
- **Front end:** Vercel project with root directory `client` (Vite preset). `vercel.json` forwards `/api/*` to the Render URL and sends every other path to `index.html`, so React Router works on refresh.

## Milestones

Each milestone is a Git tag: `milestone-1` (scaffold, wireframes, schema), `milestone-2` (auth + CRUD), `milestone-3` (front end integrated), `milestone-4` (deployed).
