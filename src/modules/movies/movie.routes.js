import { Router } from "express";
import { movieController } from "./movie.controller.js";

const router = Router();

router.get("/genres",  movieController.getGenres); // must be before /:id
router.post("/",       movieController.create);
router.get("/",        movieController.getAll);    // supports ?search=
router.get("/:id",     movieController.getOne);
router.patch("/:id",   movieController.update);
router.delete("/:id",  movieController.remove);

export default router;
