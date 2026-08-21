/**
 * seed.js — loads demo users, movies, and relationships into CognoDB.
 * Run once: node scripts/seed.js
 * Safe to re-run: uses MERGE so nothing is duplicated.
 */
import neo4j from "neo4j-driver";
import dotenv from "dotenv";
import { randomUUID } from "crypto";
dotenv.config();

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(process.env.COGNODB_USER, process.env.COGNODB_PASSWORD)
);

const USERS = [
  { id: randomUUID(), name: "Saif", avatarColor: "#D02020" },
  { id: randomUUID(), name: "Judy", avatarColor: "#1040C0" },
];

const MOVIES = [
  { id: randomUUID(), title: "Inception",                         genre: "Sci-Fi",    year: 2010 },
  { id: randomUUID(), title: "Interstellar",                      genre: "Sci-Fi",    year: 2014 },
  { id: randomUUID(), title: "Parasite",                          genre: "Thriller",  year: 2019 },
  { id: randomUUID(), title: "Knives Out",                        genre: "Mystery",   year: 2019 },
  { id: randomUUID(), title: "La La Land",                        genre: "Musical",   year: 2016 },
  { id: randomUUID(), title: "Get Out",                           genre: "Horror",    year: 2017 },
  { id: randomUUID(), title: "Spirited Away",                     genre: "Animation", year: 2001 },
  { id: randomUUID(), title: "The Grand Budapest Hotel",          genre: "Comedy",    year: 2014 },
  { id: randomUUID(), title: "Everything Everywhere All at Once", genre: "Sci-Fi",    year: 2022 },
  { id: randomUUID(), title: "Arrival",                          genre: "Sci-Fi",    year: 2016 },
];

// [userIndex, [movieIndices]]
const LIKES = [
  [0, [0, 1, 2]],   // Saif liked: Inception, Interstellar, Parasite
  [1, [3, 4, 6]],   // Judy liked: Knives Out, La La Land, Spirited Away
];

const WATCHLIST = [
  [0, [1, 3, 8, 9]],  // Saif wants: Interstellar, Knives Out, EEAAO, Arrival
  [1, [1, 3, 7, 9]],  // Judy wants: Interstellar, Knives Out, Grand Budapest, Arrival
];

async function seed() {
  const session = driver.session();
  try {
    await session.run("CREATE CONSTRAINT user_id  IF NOT EXISTS FOR (u:User)  REQUIRE u.id IS UNIQUE");
    await session.run("CREATE CONSTRAINT movie_id IF NOT EXISTS FOR (m:Movie) REQUIRE m.id IS UNIQUE");
    console.log("✅  Constraints OK");

    for (const u of USERS) {
      await session.run(
        `MERGE (u:User {id: $id})
         SET u.name = $name, u.avatarColor = $avatarColor,
             u.createdAt = coalesce(u.createdAt, datetime())`,
        u
      );
    }
    console.log(`✅  ${USERS.length} users seeded (Saif, Judy)`);

    for (const m of MOVIES) {
      await session.run(
        `MERGE (m:Movie {id: $id})
         SET m.title = $title, m.genre = $genre, m.year = $year,
             m.createdAt = coalesce(m.createdAt, datetime())`,
        m
      );
    }
    console.log(`✅  ${MOVIES.length} movies seeded`);

    for (const [uIdx, mIdxList] of LIKES) {
      for (const mIdx of mIdxList) {
        await session.run(
          `MATCH (u:User {id: $uid}), (m:Movie {id: $mid})
           MERGE (u)-[:LIKES {addedAt: datetime()}]->(m)`,
          { uid: USERS[uIdx].id, mid: MOVIES[mIdx].id }
        );
      }
    }
    console.log("✅  LIKES edges seeded");

    for (const [uIdx, mIdxList] of WATCHLIST) {
      for (const mIdx of mIdxList) {
        await session.run(
          `MATCH (u:User {id: $uid}), (m:Movie {id: $mid})
           MERGE (u)-[:WANTS_TO_WATCH {addedAt: datetime(), priority: 1}]->(m)`,
          { uid: USERS[uIdx].id, mid: MOVIES[mIdx].id }
        );
      }
    }
    console.log("✅  WANTS_TO_WATCH edges seeded");
    console.log("\n🎬  Seed complete! Saif & Judy share Interstellar + Knives Out + Arrival on their watchlists.");
    console.log("    Run: npm run dev");
  } finally {
    await session.close();
    await driver.close();
  }
}

seed().catch((err) => {
  console.error("Seed failed:", err.message);
  process.exit(1);
});
