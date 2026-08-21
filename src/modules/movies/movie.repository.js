import { getDriver } from "../../database/cognodb.driver.js";

export const movieRepository = {
  async create({ id, title, genre, year, posterUrl }) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `CREATE (m:Movie {
           id: $id, title: $title, genre: $genre,
           year: $year, posterUrl: $posterUrl, createdAt: datetime()
         }) RETURN m`,
        { id, title, genre, year: parseInt(year), posterUrl: posterUrl ?? null }
      );
      return result.records[0].get("m").properties;
    } finally {
      await session.close();
    }
  },

  async findAll(search) {
    const session = getDriver().session();
    try {
      let query = `MATCH (m:Movie)`;
      const params = {};
      if (search) {
        query += ` WHERE toLower(m.title) CONTAINS toLower($search) OR toLower(m.genre) CONTAINS toLower($search)`;
        params.search = search;
      }
      query += ` RETURN m ORDER BY m.createdAt DESC`;
      const result = await session.run(query, params);
      return result.records.map((r) => r.get("m").properties);
    } finally {
      await session.close();
    }
  },

  async findById(id) {
    const session = getDriver().session();
    try {
      const result = await session.run(
        `MATCH (m:Movie {id: $id}) RETURN m`,
        { id }
      );
      if (!result.records.length) return null;
      return result.records[0].get("m").properties;
    } finally {
      await session.close();
    }
  },

  async update(id, fields) {
    const session = getDriver().session();
    try {
      const setClauses = [];
      const params = { id };
      for (const [key, val] of Object.entries(fields)) {
        if (val !== undefined) {
          setClauses.push(`m.${key} = $${key}`);
          params[key] = key === "year" ? parseInt(val) : val;
        }
      }
      if (!setClauses.length) return null;
      const result = await session.run(
        `MATCH (m:Movie {id: $id}) SET ${setClauses.join(", ")} RETURN m`,
        params
      );
      if (!result.records.length) return null;
      return result.records[0].get("m").properties;
    } finally {
      await session.close();
    }
  },

  async delete(id) {
    const session = getDriver().session();
    try {
      await session.run(`MATCH (m:Movie {id: $id}) DETACH DELETE m`, { id });
    } finally {
      await session.close();
    }
  },
};
