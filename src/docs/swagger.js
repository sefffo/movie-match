export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "Movie Match API",
    version: "1.0.0",
    description:
      "Friend-powered movie matching app backed by CognoDB graph database. Pick two people, find your perfect movie night.",
    contact: { name: "Saif Lotfy", url: "https://github.com/sefffo/movie-match" },
  },
  servers: [
    { url: "http://localhost:3000", description: "Local development" },
    { url: "https://movie-match.onrender.com", description: "Production" },
  ],
  tags: [
    { name: "Health",  description: "Database connectivity check" },
    { name: "Users",   description: "User profile management" },
    { name: "Movies",  description: "Movie catalogue management" },
    { name: "Matches", description: "Match sessions and history" },
  ],
  components: {
    schemas: {
      User: {
        type: "object",
        properties: {
          id:          { type: "string", format: "uuid", example: "a1b2c3d4-..." },
          name:        { type: "string", example: "Saif" },
          avatarColor: { type: "string", example: "#e94560" },
          createdAt:   { type: "string", format: "date-time" },
        },
      },
      Movie: {
        type: "object",
        properties: {
          id:        { type: "string", format: "uuid" },
          title:     { type: "string", example: "Interstellar" },
          genre:     { type: "string", example: "Sci-Fi" },
          year:      { type: "integer", example: 2014 },
          posterUrl: { type: "string", nullable: true, example: null },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      WatchlistItem: {
        allOf: [
          { $ref: "#/components/schemas/Movie" },
          {
            type: "object",
            properties: {
              priority: { type: "integer", example: 1 },
              addedAt:  { type: "string", format: "date-time" },
            },
          },
        ],
      },
      Match: {
        type: "object",
        properties: {
          id:              { type: "string", format: "uuid" },
          createdAt:       { type: "string", format: "date-time" },
          status:          { type: "string", enum: ["pending", "chosen"], example: "pending" },
          users:           { type: "array", items: { $ref: "#/components/schemas/User" } },
          recommendations: {
            type: "array",
            items: {
              allOf: [
                { $ref: "#/components/schemas/Movie" },
                {
                  type: "object",
                  properties: {
                    score:  { type: "integer", example: 100 },
                    rank:   { type: "integer", example: 1 },
                    reason: { type: "string", example: "Both of you want to watch this" },
                  },
                },
              ],
            },
          },
          chosenMovie: { allOf: [{ $ref: "#/components/schemas/Movie" }], nullable: true },
        },
      },
      Error: {
        type: "object",
        properties: {
          error: {
            type: "object",
            properties: { message: { type: "string" } },
          },
        },
      },
    },
    responses: {
      NotFound:     { description: "Resource not found",        content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      BadRequest:   { description: "Validation error",          content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
      ServerError:  { description: "Internal / DB unreachable", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
    },
  },
  paths: {
    // ── Health ───────────────────────────────────────────────────────────────────────
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Database connectivity check",
        responses: {
          200: { description: "Connected",    content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "ok" }, database: { type: "string", example: "connected" } } } } } },
          503: { description: "Unreachable",  content: { "application/json": { schema: { type: "object", properties: { status: { type: "string", example: "degraded" }, database: { type: "string", example: "unreachable" }, detail: { type: "string" } } } } } },
        },
      },
    },

    // ── Users ─────────────────────────────────────────────────────────────────────
    "/api/users": {
      post: {
        tags: ["Users"], summary: "Create a user profile",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["name"], properties: { name: { type: "string", example: "Saif" }, avatarColor: { type: "string", example: "#e94560" } } } } } },
        responses: { 201: { description: "Created", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/User" } } } } } }, 400: { $ref: "#/components/responses/BadRequest" } },
      },
      get: {
        tags: ["Users"], summary: "List all users",
        responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/User" } } } } } } } },
      },
    },
    "/api/users/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      get:    { tags: ["Users"], summary: "Get user by ID",   responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/User" } } } } } }, 404: { $ref: "#/components/responses/NotFound" } } },
      patch:  { tags: ["Users"], summary: "Update user", requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, avatarColor: { type: "string" } } } } } }, responses: { 200: { description: "Updated", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/User" } } } } } }, 404: { $ref: "#/components/responses/NotFound" } } },
      delete: { tags: ["Users"], summary: "Delete user",   responses: { 204: { description: "Deleted" }, 404: { $ref: "#/components/responses/NotFound" } } },
    },
    "/api/users/{id}/watchlist": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      get:  { tags: ["Users"], summary: "Get user watchlist", responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/WatchlistItem" } } } } } } } } },
      post: { tags: ["Users"], summary: "Add movie to watchlist", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["movieId"], properties: { movieId: { type: "string", format: "uuid" }, priority: { type: "integer", example: 1 } } } } } }, responses: { 201: { description: "Added" }, 404: { $ref: "#/components/responses/NotFound" } } },
    },
    "/api/users/{id}/watchlist/{movieId}": {
      parameters: [
        { name: "id",      in: "path", required: true, schema: { type: "string", format: "uuid" } },
        { name: "movieId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      delete: { tags: ["Users"], summary: "Remove from watchlist", responses: { 204: { description: "Removed" } } },
    },
    "/api/users/{id}/likes": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      get:  { tags: ["Users"], summary: "Get liked movies",  responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Movie" } } } } } } } } },
      post: { tags: ["Users"], summary: "Like a movie", requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["movieId"], properties: { movieId: { type: "string", format: "uuid" } } } } } }, responses: { 201: { description: "Liked" }, 404: { $ref: "#/components/responses/NotFound" } } },
    },
    "/api/users/{id}/likes/{movieId}": {
      parameters: [
        { name: "id",      in: "path", required: true, schema: { type: "string", format: "uuid" } },
        { name: "movieId", in: "path", required: true, schema: { type: "string", format: "uuid" } },
      ],
      delete: { tags: ["Users"], summary: "Unlike a movie", responses: { 204: { description: "Removed" } } },
    },

    // ── Movies ────────────────────────────────────────────────────────────────────
    "/api/movies": {
      post: {
        tags: ["Movies"], summary: "Create a movie",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["title", "genre", "year"], properties: { title: { type: "string", example: "Interstellar" }, genre: { type: "string", example: "Sci-Fi" }, year: { type: "integer", example: 2014 }, posterUrl: { type: "string", nullable: true } } } } } },
        responses: { 201: { description: "Created", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Movie" } } } } } }, 400: { $ref: "#/components/responses/BadRequest" } },
      },
      get: {
        tags: ["Movies"], summary: "List / search movies",
        parameters: [{ name: "search", in: "query", required: false, schema: { type: "string" }, description: "Filter by title or genre" }],
        responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Movie" } } } } } } } },
      },
    },
    "/api/movies/genres": {
      get: {
        tags: ["Movies"], summary: "List valid genres",
        responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { type: "string" } } } } } } } },
      },
    },
    "/api/movies/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      get:    { tags: ["Movies"], summary: "Get movie by ID",  responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Movie" } } } } } }, 404: { $ref: "#/components/responses/NotFound" } } },
      patch:  { tags: ["Movies"], summary: "Update movie",    requestBody: { content: { "application/json": { schema: { type: "object", properties: { title: { type: "string" }, genre: { type: "string" }, year: { type: "integer" }, posterUrl: { type: "string", nullable: true } } } } } }, responses: { 200: { description: "Updated" }, 404: { $ref: "#/components/responses/NotFound" } } },
      delete: { tags: ["Movies"], summary: "Delete movie",    responses: { 204: { description: "Deleted" }, 404: { $ref: "#/components/responses/NotFound" } } },
    },

    // ── Matches (Stage 3 — documented now, implemented next) ─────────────────────
    "/api/matches": {
      post: {
        tags: ["Matches"], summary: "Generate a new match session",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["userOneId", "userTwoId"], properties: { userOneId: { type: "string", format: "uuid" }, userTwoId: { type: "string", format: "uuid" } } } } } },
        responses: { 201: { description: "Match created with recommendations", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Match" } } } } } }, 400: { $ref: "#/components/responses/BadRequest" }, 404: { $ref: "#/components/responses/NotFound" } },
      },
      get: {
        tags: ["Matches"], summary: "List match history",
        responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { type: "array", items: { $ref: "#/components/schemas/Match" } } } } } } } },
      },
    },
    "/api/matches/{id}": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      get:    { tags: ["Matches"], summary: "Get match details",  responses: { 200: { description: "OK", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Match" } } } } } }, 404: { $ref: "#/components/responses/NotFound" } } },
      delete: { tags: ["Matches"], summary: "Delete a match",     responses: { 204: { description: "Deleted" }, 404: { $ref: "#/components/responses/NotFound" } } },
    },
    "/api/matches/{id}/choose": {
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "string", format: "uuid" } }],
      post: {
        tags: ["Matches"], summary: "Pick the movie you watched",
        requestBody: { required: true, content: { "application/json": { schema: { type: "object", required: ["movieId"], properties: { movieId: { type: "string", format: "uuid" } } } } } },
        responses: { 200: { description: "Winner set", content: { "application/json": { schema: { type: "object", properties: { data: { $ref: "#/components/schemas/Match" } } } } } }, 404: { $ref: "#/components/responses/NotFound" } },
      },
    },
  },
};
