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

**Fallback — Genre-Based** (the query that’s painful in SQL):
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
│   ├── app.js
│   ├── server.js
│   ├── config/env.js
│   ├── database/cognodb.driver.js
│   ├── docs/swagger.js
│   ├── middleware/
│   │   ├── error-handler.js
│   │   └── not-found.js
│   └── modules/
│       ├── health/
│       ├── movies/
│       ├── users/
│       └── matches/
├── scripts/seed.js
├── public/index.html
├── render.yaml
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
| `POST` | `/api/users/:id/watchlist` | Add to **this user's** watchlist |
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
| `POST` | `/api/matches/:id/choose` | Choose tonight’s winner |
| `DELETE` | `/api/matches/:id` | Delete match |

---

## ◼ Local Setup

```bash
git clone https://github.com/sefffo/movie-match.git
cd movie-match
npm install
cp .env.example .env
# Fill in COGNODB_URI, COGNODB_USER, COGNODB_PASSWORD
npm run seed   # Seeds Saif + Judy + 10 movies
npm run dev
```

Open:
- **App** → `http://localhost:3000`
- **Swagger** → `http://localhost:3000/api-docs`

---

## ◼ Deployment — Render (Free)

1. Go to **[render.com](https://render.com)** → Sign up with GitHub
2. **New → Web Service** → connect `sefffo/movie-match`
3. Render auto-detects `render.yaml` → click **Deploy**
4. Add env vars in Render dashboard: `COGNODB_URI`, `COGNODB_USER`, `COGNODB_PASSWORD`
5. Live at `https://movie-match.onrender.com`

> Free tier sleeps after 15 min idle. First request after sleep takes ~30s to wake up.

---

## ◼ Why Graph DB?

The matching engine query is the perfect example of why graph databases shine. In SQL, finding movies where User A has them on their watchlist AND User B has liked movies in the same genre AND User B hasn’t already seen them requires 3–4 JOINs across junction tables. In Cypher it’s a single readable traversal — **the graph makes the relationship the query**.

---

## ◼ Author

Built by **Saif** — university project exploring graph-native architecture with Express.js and CognoDB.

<div align="center">◼ ● ▲</div>
