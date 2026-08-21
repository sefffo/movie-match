<!-- Bauhaus-inspired README -->

<div align="center">

# ◼ ● ▲ MOVIE MATCH

**"What are we watching tonight?"** — ended, forever.

[![Node.js](https://img.shields.io/badge/Node.js-18+-black?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-black?style=flat-square&logo=express)](https://expressjs.com)
[![CognoDB](https://img.shields.io/badge/CognoDB-Graph_DB-D02020?style=flat-square)](https://cognodb.com)
[![Neo4j Driver](https://img.shields.io/badge/neo4j--driver-Compatible-1040C0?style=flat-square)](https://neo4j.com/docs/javascript-manual/current/)
[![Swagger](https://img.shields.io/badge/Swagger-Documented-F0C020?style=flat-square&logo=swagger&logoColor=black)]()

</div>

---

## ◼ What Is This?

Movie Match is a **graph-powered movie recommendation engine** built with Express.js and CognoDB (openCypher / Bolt-compatible). Two people each build a watchlist. Movie Match runs a multi-hop graph traversal to find movies they **both** want to watch — and falls back to genre-based matching when there's no exact overlap. They pick a winner. The night is decided.

> Built as a university project exploring graph databases, layered Express architecture, and graph-native queries that would be painful in SQL.

---

## ◼ Screenshots

<!-- Add your screenshots here after testing -->
<!-- Format: -->

### Tonight Page
![Tonight Page](screenshots/tonight.png)

### Recommendations
![Recommendations](screenshots/recommendations.png)

### My Movies
![My Movies](screenshots/my-movies.png)

### Match History
![Match History](screenshots/history.png)

### Swagger API Docs
![Swagger](screenshots/swagger.png)

---

## ◼ Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express.js 5 |
| Database | CognoDB (openCypher + Bolt protocol) |
| DB Driver | `neo4j-driver` (official, drop-in compatible) |
| API Docs | Swagger UI (`swagger-jsdoc` + `swagger-ui-express`) |
| Frontend | Vanilla HTML/CSS/JS + Motion (animations) |
| Architecture | Layered MVC (routes → controller → service → repository) |
| Deployment | Render (free tier) |

---

## ◼ Graph Data Model

```
(:User)-[:WANTS_TO_WATCH]->(:Movie)   ← watchlist
(:User)-[:LIKES]->(:Movie)            ← liked movies
(:Match)-[:BETWEEN]->(:User)          ← links match to both people
(:Match)-[:RECOMMENDED]->(:Movie)     ← scored recommendations
(:Match)-[:CHOSEN]->(:Movie)          ← tonight's winner
```

### The Core Graph Queries

**Primary — Exact Match** (multi-hop traversal):
```cypher
MATCH (u1:User {id: $userOneId})-[:WANTS_TO_WATCH]->(movie:Movie)
MATCH (u2:User {id: $userTwoId})-[:WANTS_TO_WATCH]->(movie)
RETURN movie, 100 AS score
```

**Fallback — Genre-Based** (the query that's painful in SQL):
```cypher
MATCH (u1)-[:WANTS_TO_WATCH]->(movie:Movie)
MATCH (u2)-[:LIKES]->(:Movie {genre: movie.genre})
WHERE NOT (u2)-[:WANTS_TO_WATCH]->(movie)
WITH movie, count(*) AS genreMatches
RETURN movie, genreMatches * 10 AS score
```

---

## ◼ Project Structure

```
movie-match/
├── src/
│   ├── app.js                          # Express app + middleware
│   ├── server.js                       # Entry point
│   ├── config/
│   │   └── env.js                      # Env validation
│   ├── database/
│   │   └── cognodb.driver.js           # Neo4j driver singleton
│   ├── docs/
│   │   └── swagger.js                  # Swagger spec
│   ├── middleware/
│   │   ├── error-handler.js
│   │   └── not-found.js
│   ├── modules/
│   │   ├── health/
│   │   ├── movies/                     # movie CRUD + genres + search
│   │   ├── users/                      # profiles + watchlist + likes
│   │   └── matches/                    # matching engine + history
│   └── utils/
│       └── app-error.js
├── scripts/
│   └── seed.js                         # Demo data seeder
├── public/
│   └── index.html                      # Full frontend (Bauhaus UI)
├── render.yaml                         # One-click Render deploy
├── .env.example
└── package.json
```

---

## ◼ API Endpoints

| Method | Route | Description |
|---|---|---|
| `GET` | `/health` | Server health check |
| `GET` | `/api-docs` | Swagger UI |
| `POST` | `/api/users` | Create user |
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get user |
| `PATCH` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |
| `GET` | `/api/users/:id/watchlist` | Get watchlist |
| `POST` | `/api/users/:id/watchlist` | Add to watchlist |
| `DELETE` | `/api/users/:id/watchlist/:movieId` | Remove from watchlist |
| `GET` | `/api/users/:id/likes` | Get liked movies |
| `POST` | `/api/users/:id/likes` | Like a movie |
| `DELETE` | `/api/users/:id/likes/:movieId` | Unlike a movie |
| `GET` | `/api/movies/genres` | List all genres |
| `POST` | `/api/movies` | Create movie |
| `GET` | `/api/movies` | List / search movies |
| `GET` | `/api/movies/:id` | Get movie |
| `PATCH` | `/api/movies/:id` | Update movie |
| `DELETE` | `/api/movies/:id` | Delete movie |
| `POST` | `/api/matches` | **Create match** (runs engine) |
| `GET` | `/api/matches` | List match history |
| `GET` | `/api/matches/:id` | Get match detail |
| `POST` | `/api/matches/:id/choose` | Choose tonight's winner |
| `DELETE` | `/api/matches/:id` | Delete match |

---

## ◼ Local Setup

### 1. Clone
```bash
git clone https://github.com/sefffo/movie-match.git
cd movie-match
```

### 2. Install
```bash
npm install
```

### 3. Environment
```bash
cp .env.example .env
# Fill in your CognoDB credentials:
# COGNODB_URI=bolt+s://your-db.cognodb.com
# COGNODB_USER=neo4j
# COGNODB_PASSWORD=yourpassword
```

### 4. Seed demo data
```bash
npm run seed
```
Creates 2 users (Saif & Maya) + 10 movies across multiple genres.

### 5. Run
```bash
npm run dev      # development (nodemon)
npm start        # production
```

Open:
- **App** → `http://localhost:3000`
- **Swagger** → `http://localhost:3000/api-docs`

---

## ◼ Deployment — Render (Free)

Render is the best free option for Express apps. Zero config required — `render.yaml` is already in the repo.

### Steps

1. Go to **[render.com](https://render.com)** → Sign up with GitHub
2. Click **New → Web Service**
3. Connect your **`sefffo/movie-match`** repository
4. Render auto-detects `render.yaml` — click **Deploy**
5. Add environment variables in the Render dashboard:
   ```
   COGNODB_URI       = bolt+s://your-db.cognodb.com
   COGNODB_USER      = neo4j
   COGNODB_PASSWORD  = yourpassword
   NODE_ENV          = production
   ```
6. Done — your app is live at `https://movie-match.onrender.com`

> **Note**: Free tier sleeps after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up. This is fine for a demo.

---

## ◼ Test Flow (Step-by-Step)

Follow this exact sequence to get all screenshots:

### Step 1 — Seed & Open
```bash
npm run seed
npm run dev
```
Open `http://localhost:3000`

### Step 2 — My Movies page
- Select **Saif** as "Viewing as"
- Click 📌 on **3 movies** to add to Saif's watchlist
- Click ❤️ on **2 other movies** as liked
- Switch to **Maya** → add **2 of the same movies** + **1 different one** to her watchlist

### Step 3 — Tonight page
- Select **Saif** and **Maya** in the dropdowns
- Click **▶ Find Our Movie**
- Screenshot the recommendations grid
- Click **🏆 We watched this!** on one card
- Screenshot the winner announcement

### Step 4 — History page
- Click **History** in the nav
- See the match with the ✓ Chosen badge and yellow winner card
- Screenshot it

### Step 5 — Swagger
- Open `http://localhost:3000/api-docs`
- Expand the **Matches** section
- Screenshot the full Swagger UI

### Step 6 — Add screenshots to repo
```bash
mkdir screenshots
# drop your .png files in:
# screenshots/tonight.png
# screenshots/recommendations.png
# screenshots/my-movies.png
# screenshots/history.png
# screenshots/swagger.png
git add screenshots/
git commit -m "docs: add screenshots"
git push
```

---

## ◼ Why Graph DB?

The matching engine query is the perfect example of why graph databases shine:

```
Find movies where:
  User A has them on their watchlist
  AND User B has liked other movies in the same genre
  AND User B hasn't already seen them
```

In SQL this requires 3-4 JOINs across junction tables with self-referential conditions. In Cypher it's a single readable traversal — **the graph makes the relationship the query**, not the schema.

---

## ◼ Author

Built by **Saif** — university project exploring graph-native architecture with Express.js and CognoDB.

<div align="center">

◼ ● ▲

</div>
