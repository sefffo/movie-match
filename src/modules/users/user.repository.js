import { getDriver } from "../../database/cognodb.driver.js";

export const userRepository = {
  async create({ id, name, avatarColor }) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `CREATE (u:User {id: $id, name: $name, avatarColor: $avatarColor, createdAt: datetime()})
         RETURN u`,
        { id, name, avatarColor }
      );
      return result.records[0].get("u").properties;
    } finally {
      await session.close();
    }
  },

  async findAll() {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (u:User) RETURN u ORDER BY u.createdAt DESC`
      );
      return result.records.map((r) => r.get("u").properties);
    } finally {
      await session.close();
    }
  },

  async findById(id) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (u:User {id: $id}) RETURN u`,
        { id }
      );
      if (!result.records.length) return null;
      return result.records[0].get("u").properties;
    } finally {
      await session.close();
    }
  },

  async update(id, { name, avatarColor }) {
    const session = getDriver().session();
    try {
      const setClauses = [];
      const params = { id };
      if (name !== undefined) { setClauses.push("u.name = $name"); params.name = name; }
      if (avatarColor !== undefined) { setClauses.push("u.avatarColor = $avatarColor"); params.avatarColor = avatarColor; }
      if (!setClauses.length) return null;
      const result = await session.run(
        `MATCH (u:User {id: $id}) SET ${setClauses.join(", ")} RETURN u`,
        params
      );
      if (!result.records.length) return null;
      return result.records[0].get("u").properties;
    } finally {
      await session.close();
    }
  },

  async delete(id) {
    const session = getDriver().session();
    try {
      await session.run(
        `MATCH (u:User {id: $id}) DETACH DELETE u`,
        { id }
      );
    } finally {
      await session.close();
    }
  },

  // ── Watchlist ────────────────────────────────────────────────────────────
  async getWatchlist(userId) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})-[r:WANTS_TO_WATCH]->(m:Movie)
         RETURN m, r.addedAt AS addedAt, r.priority AS priority
         ORDER BY r.addedAt DESC`,
        { userId }
      );
      return result.records.map((r) => ({
        ...r.get("m").properties,
        addedAt: r.get("addedAt"),
        priority: r.get("priority"),
      }));
    } finally {
      await session.close();
    }
  },

  async addToWatchlist(userId, movieId, priority = 1) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId}), (m:Movie {id: $movieId})
         MERGE (u)-[r:WANTS_TO_WATCH]->(m)
         ON CREATE SET r.addedAt = datetime(), r.priority = $priority
         RETURN m`,
        { userId, movieId, priority: parseInt(priority) }
      );
      if (!result.records.length) return null;
      return result.records[0].get("m").properties;
    } finally {
      await session.close();
    }
  },

  async removeFromWatchlist(userId, movieId) {
    const session = getDriver().session();
    try {
      await session.run(
        `MATCH (u:User {id: $userId})-[r:WANTS_TO_WATCH]->(m:Movie {id: $movieId})
         DELETE r`,
        { userId, movieId }
      );
    } finally {
      await session.close();
    }
  },

  // ── Likes ────────────────────────────────────────────────────────────────
  async getLikes(userId) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId})-[r:LIKES]->(m:Movie)
         RETURN m, r.addedAt AS addedAt ORDER BY r.addedAt DESC`,
        { userId }
      );
      return result.records.map((r) => ({
        ...r.get("m").properties,
        addedAt: r.get("addedAt"),
      }));
    } finally {
      await session.close();
    }
  },

  async addLike(userId, movieId) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (u:User {id: $userId}), (m:Movie {id: $movieId})
         MERGE (u)-[r:LIKES]->(m)
         ON CREATE SET r.addedAt = datetime()
         RETURN m`,
        { userId, movieId }
      );
      if (!result.records.length) return null;
      return result.records[0].get("m").properties;
    } finally {
      await session.close();
    }
  },

  async removeLike(userId, movieId) {
    const session = getDriver().session();
    try {
      await session.run(
        `MATCH (u:User {id: $userId})-[r:LIKES]->(m:Movie {id: $movieId})
         DELETE r`,
        { userId, movieId }
      );
    } finally {
      await session.close();
    }
  },
};
