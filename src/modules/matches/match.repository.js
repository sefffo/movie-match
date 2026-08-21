import { getDriver } from "../../database/cognodb.driver.js";

export const matchRepository = {
  /**
   * Creates a Match node, links it to both users, and stores
   * all recommendations as RECOMMENDED relationships — all inside
   * a single write transaction (atomic).
   */
  async create({ id, userOneId, userTwoId, recommendations }) {
    const session = getDriver().session();
    try {
      await session.executeWrite(async (tx) => {
        // 1. Create the Match node
        await tx.run(
          `CREATE (m:Match {
             id: $id,
             createdAt: datetime(),
             status: 'pending'
           })`,
          { id }
        );

        // 2. Link Match → both users
        await tx.run(
          `MATCH (match:Match {id: $id}),
                 (u1:User {id: $userOneId}),
                 (u2:User {id: $userTwoId})
           CREATE (match)-[:BETWEEN]->(u1)
           CREATE (match)-[:BETWEEN]->(u2)`,
          { id, userOneId, userTwoId }
        );

        // 3. Link Match → each recommended movie
        for (const [i, rec] of recommendations.entries()) {
          await tx.run(
            `MATCH (match:Match {id: $matchId}), (movie:Movie {id: $movieId})
             CREATE (match)-[:RECOMMENDED {
               score: $score,
               rank:  $rank,
               reason: $reason
             }]->(movie)`,
            {
              matchId: id,
              movieId: rec.id,
              score:   rec.score,
              rank:    i + 1,
              reason:  rec.reason,
            }
          );
        }
      });

      return matchRepository.findById(id);
    } finally {
      await session.close();
    }
  },

  async findAll() {
    const session = getDriver().session();
    try {
      // Get all matches with their linked users
      const result = await session.run(
        `MATCH (match:Match)
         OPTIONAL MATCH (match)-[:BETWEEN]->(u:User)
         OPTIONAL MATCH (match)-[:CHOSEN]->(chosen:Movie)
         WITH match, collect(u) AS users, chosen
         RETURN match, users, chosen
         ORDER BY match.createdAt DESC`
      );

      return result.records.map((r) => ({
        ...r.get("match").properties,
        users: r.get("users").map((u) => u.properties),
        chosenMovie: r.get("chosen") ? r.get("chosen").properties : null,
        recommendations: [], // lightweight list view — no recs
      }));
    } finally {
      await session.close();
    }
  },

  async findById(id) {
    const session = getDriver().session();
    try {
      // Users
      const usersResult = await session.run(
        `MATCH (match:Match {id: $id})-[:BETWEEN]->(u:User)
         RETURN u`,
        { id }
      );

      // Recommendations
      const recsResult = await session.run(
        `MATCH (match:Match {id: $id})-[r:RECOMMENDED]->(movie:Movie)
         RETURN movie, r.score AS score, r.rank AS rank, r.reason AS reason
         ORDER BY r.rank ASC`,
        { id }
      );

      // Match node + chosen movie
      const matchResult = await session.run(
        `MATCH (match:Match {id: $id})
         OPTIONAL MATCH (match)-[:CHOSEN]->(chosen:Movie)
         RETURN match, chosen`,
        { id }
      );

      if (!matchResult.records.length) return null;

      const matchNode  = matchResult.records[0].get("match").properties;
      const chosenNode = matchResult.records[0].get("chosen");

      return {
        ...matchNode,
        users: usersResult.records.map((r) => r.get("u").properties),
        recommendations: recsResult.records.map((r) => ({
          ...r.get("movie").properties,
          score:  r.get("score"),
          rank:   r.get("rank"),
          reason: r.get("reason"),
        })),
        chosenMovie: chosenNode ? chosenNode.properties : null,
      };
    } finally {
      await session.close();
    }
  },

  async chooseWinner(matchId, movieId) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (match:Match {id: $matchId}), (movie:Movie {id: $movieId})
         MERGE (match)-[:CHOSEN]->(movie)
         SET match.status = 'chosen'
         RETURN match, movie`,
        { matchId, movieId }
      );
      if (!result.records.length) return null;
      return matchRepository.findById(matchId);
    } finally {
      await session.close();
    }
  },

  async delete(id) {
    const session = getDriver().session();
    try {
      await session.run(
        `MATCH (match:Match {id: $id}) DETACH DELETE match`,
        { id }
      );
    } finally {
      await session.close();
    }
  },

  // ── Graph Queries For The Matching Engine ─────────────────────────────────

  /**
   * PRIMARY: Movies both users have in their watchlist.
   * Multi-hop traversal — the core graph query.
   */
  async getSharedWatchlist(userOneId, userTwoId) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (u1:User {id: $userOneId})-[:WANTS_TO_WATCH]->(movie:Movie)
         MATCH (u2:User {id: $userTwoId})-[:WANTS_TO_WATCH]->(movie)
         RETURN movie.id    AS id,
                movie.title AS title,
                movie.genre AS genre,
                movie.year  AS year,
                100         AS score,
                "Both of you want to watch this" AS reason
         ORDER BY movie.title`,
        { userOneId, userTwoId }
      );
      return result.records.map((r) => ({
        id:     r.get("id"),
        title:  r.get("title"),
        genre:  r.get("genre"),
        year:   r.get("year"),
        score:  r.get("score"),
        reason: r.get("reason"),
      }));
    } finally {
      await session.close();
    }
  },

  /**
   * FALLBACK: Movies one person wants to watch whose genre
   * the other person has already liked — the "awkward in SQL" query.
   * Runs when the shared watchlist is empty.
   */
  async getGenreBasedFallback(userOneId, userTwoId) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (u1:User {id: $userOneId})-[:WANTS_TO_WATCH]->(movie:Movie)
         MATCH (u2:User {id: $userTwoId})-[:LIKES]->(:Movie {genre: movie.genre})
         WHERE NOT (u2)-[:WANTS_TO_WATCH]->(movie)
           AND NOT (u2)-[:LIKES]->(movie)
         WITH movie, count(*) AS genreMatches
         RETURN movie.id    AS id,
                movie.title AS title,
                movie.genre AS genre,
                movie.year  AS year,
                genreMatches * 10 AS score,
                "Matches a genre your partner enjoys" AS reason

         UNION

         MATCH (u2:User {id: $userTwoId})-[:WANTS_TO_WATCH]->(movie:Movie)
         MATCH (u1:User {id: $userOneId})-[:LIKES]->(:Movie {genre: movie.genre})
         WHERE NOT (u1)-[:WANTS_TO_WATCH]->(movie)
           AND NOT (u1)-[:LIKES]->(movie)
         WITH movie, count(*) AS genreMatches
         RETURN movie.id    AS id,
                movie.title AS title,
                movie.genre AS genre,
                movie.year  AS year,
                genreMatches * 10 AS score,
                "Matches a genre your partner enjoys" AS reason

         ORDER BY score DESC
         LIMIT 6`,
        { userOneId, userTwoId }
      );
      return result.records.map((r) => ({
        id:     r.get("id"),
        title:  r.get("title"),
        genre:  r.get("genre"),
        year:   r.get("year"),
        score:  r.get("score").toInt ? r.get("score").toInt() : r.get("score"),
        reason: r.get("reason"),
      }));
    } finally {
      await session.close();
    }
  },
};
