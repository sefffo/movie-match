import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./docs/swagger.js";
import healthRouter from "./modules/health/health.routes.js";
import userRouter   from "./modules/users/user.routes.js";
import movieRouter  from "./modules/movies/movie.routes.js";
import { errorHandler } from "./middleware/error-handler.js";
import { notFound }    from "./middleware/not-found.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ── Swagger docs ────────────────────────────────────────────────────────────
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: "Movie Match API",
  customCss: ".swagger-ui .topbar { background: #1a1a2e; } .swagger-ui .topbar-wrapper img { content: none; }",
}));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/health",      healthRouter);
app.use("/api/users",   userRouter);
app.use("/api/movies",  movieRouter);
// Stage 3: matches router will be mounted here

// ── Fallbacks ────────────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
