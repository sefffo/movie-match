import { Router } from "express";
import { matchController } from "./match.controller.js";

const router = Router();

router.post("/",             matchController.create);
router.get("/",              matchController.getAll);
router.get("/:id",           matchController.getOne);
router.post("/:id/choose",   matchController.choose);
router.delete("/:id",        matchController.remove);

export default router;
