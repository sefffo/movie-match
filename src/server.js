import "./config/env.js";
import app from "./app.js";
import { env } from "./config/env.js";
import { closeDriver, verifyConnectivity } from "./database/cognodb.driver.js";

async function start() {
  try {
    await verifyConnectivity();
    console.log("✅  CognoDB connected");
  } catch (err) {
    console.warn("⚠️  CognoDB unreachable on startup — server will still start");
  }

  const server = app.listen(env.port, () => {
    console.log(`🎬  Movie Match running → http://localhost:${env.port}`);
  });

  // Graceful shutdown
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, async () => {
      console.log(`\n${signal} received — shutting down gracefully`);
      server.close(async () => {
        await closeDriver();
        console.log("Driver closed. Bye!");
        process.exit(0);
      });
    });
  }
}

start();
