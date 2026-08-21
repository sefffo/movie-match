import { Router } from "express";
import { verifyConnectivity } from "../../database/cognodb.driver.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    await verifyConnectivity();
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    res.status(503).json({ status: "degraded", database: "unreachable", detail: err.message });
  }
});

export default router;
