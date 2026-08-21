import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec }   from "./docs/swagger.js";
import healthRouter from "./modules/health/health.routes.js";
import userRouter   from "./modules/users/user.routes.js";
import movieRouter  from "./modules/movies/movie.routes.js";
import matchRouter  from "./modules/matches/match.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound }    from "./middleware/not-found.js";

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// Allowed origins: localhost for dev + the deployed Render URL.
// Add more origins to the array or set CORS_ORIGIN env var (comma-separated).
const BASE_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://movie-match-y191.onrender.com",
];

const extraOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
  : [];

const allowedOrigins = [...new Set([...BASE_ORIGINS, ...extraOrigins])];

app.use(
  cors({
    origin(origin, callback) {
      // Allow server-to-server / curl requests (no Origin header)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS: origin '${origin}' not allowed`));
    },
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static("public"));

// ── Swagger docs ────────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Movie Match API",
  customCss: ".swagger-ui .topbar { background: #1a1a2e; } .swagger-ui .topbar-wrapper img { content: none; }",
}));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/health",       healthRouter);
app.use("/api/users",    userRouter);
app.use("/api/movies",   movieRouter);
app.use("/api/matches",  matchRouter);

// ── Fallbacks ────────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
