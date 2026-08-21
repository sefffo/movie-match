import { Router } from "express";
import { userController } from "./user.controller.js";

const router = Router();

// Profile CRUD
router.post("/",           userController.create);
router.get("/",            userController.getAll);
router.get("/:id",         userController.getOne);
router.patch("/:id",       userController.update);
router.delete("/:id",      userController.remove);

// Watchlist
router.get("/:id/watchlist",                      userController.getWatchlist);
router.post("/:id/watchlist",                     userController.addToWatchlist);
router.delete("/:id/watchlist/:movieId",          userController.removeFromWatchlist);

// Likes
router.get("/:id/likes",                          userController.getLikes);
router.post("/:id/likes",                         userController.addLike);
router.delete("/:id/likes/:movieId",              userController.removeLike);

export default router;
