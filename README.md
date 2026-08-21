# 🎬 Movie Match

> Pick two people. Let Movie Match end the scrolling.

A graph-database-powered movie recommendation app. Two users each build their watchlist and mark movies they've already enjoyed. The app finds the perfect shared pick for tonight — and keeps a history of every match.

Backed by [CognoDB](https://cognodb.com) — a managed graph database that speaks Cypher over the Bolt protocol and works with official Neo4j drivers.

---

## Why a graph database?

Recommendations here are fundamentally about **paths through a network**: two people, their watchlists, and how genre preferences overlap. Expressing "find movies both users want to watch, then boost by shared genre taste" is a natural 1-2 hop Cypher traversal. In SQL the same logic requires a self-join on watchlists plus a correlated subquery on genre likes — awkward to write and slow as the dataset grows. A graph stores relationships as first-class traversable pointers, making this kind of connection-centric question both simpler and faster.

---

## Graph data model

```
(:User {id, name, avatarColor, createdAt})
(:Movie {id, title, genre, year, posterUrl, createdAt})
(:Match {id, createdAt, status})

(:User)-[:LIKES {addedAt}]->(:Movie)
(:User)-[:WANTS_TO_WATCH {addedAt, priority}]->(:Movie)
(:Match)-[:BETWEEN]->(:User)          — links match to both users
(:Match)-[:RECOMMENDED {score, rank, reason}]->(:Movie)
(:Match)-[:CHOSEN]->(:Movie)          — set when a winner is picked
```

---

## Project structure

```
movie-match/
├── src/
│   ├── config/env.js                  # env validation
│   ├── database/cognodb.driver.js     # singleton Neo4j driver
│   ├── modules/
│   │   ├── health/health.routes.js
│   │   ├── users/   (routes · controller · service · repository)
│   │   ├── movies/  (routes · controller · service · repository)
│   │   └── matches/ (routes · controller · service · repository)
│   ├── middleware/
│   │   ├── error-handler.js
│   │   └── not-found.js
│   ├── utils/app-error.js
│   ├── app.js
│   └── server.js
├── scripts/seed.js
├── public/index.html
├── .env.example
└── package.json
```

---

## Setup

### 1 — CognoDB Cloud

1. Sign up at <https://console.cognodb.com/signup> (free tier, no credit card).
2. Create a free `c0` instance and choose a region.
3. **Copy the generated password immediately** — it is shown only once.
4. Note the connection URI: `bolt+s://<instance-id>.databases.cognodb.cloud`

### 2 — Local setup

```bash
git clone https://github.com/sefffo/movie-match
cd movie-match
npm install
cp .env.example .env   # fill in your CognoDB URI, user, and password
```

### 3 — Seed demo data

```bash
npm run seed
```

### 4 — Run

```bash
npm run dev       # development (auto-restarts on file change)
npm start         # production
```

Open <http://localhost:3000>

---

## API

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | DB connectivity check |
| POST | `/api/users` | Create a user profile |
| GET | `/api/users` | List all users |
| GET | `/api/users/:id` | Get user details |
| POST | `/api/users/:id/watchlist` | Add movie to watchlist |
| DELETE | `/api/users/:id/watchlist/:movieId` | Remove from watchlist |
| POST | `/api/users/:id/likes` | Mark movie as liked |
| POST | `/api/movies` | Create a movie |
| GET | `/api/movies` | List / search movies |
| POST | `/api/matches` | Generate a new match |
| GET | `/api/matches` | Match history |
| POST | `/api/matches/:id/choose` | Pick the winner |

---

## Deployment

Deploy to [Render](https://render.com) or [Railway](https://railway.app) free tier.
Set `COGNODB_URI`, `COGNODB_USER`, `COGNODB_PASSWORD`, and `PORT` as environment variables in your hosting dashboard.
**Never commit your `.env` file.**

---

## Screenshots

_Add screenshots after running locally._
