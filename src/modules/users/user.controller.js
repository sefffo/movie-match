import { userService } from "./user.service.js";

export const userController = {
  async create(req, res, next) {
    try {
      const user = await userService.createUser(req.body);
      res.status(201).json({ data: user });
    } catch (err) { next(err); }
  },

  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers();
      res.json({ data: users });
    } catch (err) { next(err); }
  },

  async getOne(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);
      res.json({ data: user });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const user = await userService.updateUser(req.params.id, req.body);
      res.json({ data: user });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await userService.deleteUser(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  // ── Watchlist ────────────────────────────────────────────────────────────
  async getWatchlist(req, res, next) {
    try {
      const list = await userService.getWatchlist(req.params.id);
      res.json({ data: list });
    } catch (err) { next(err); }
  },

  async addToWatchlist(req, res, next) {
    try {
      const { movieId, priority } = req.body;
      const movie = await userService.addToWatchlist(req.params.id, movieId, priority);
      res.status(201).json({ data: movie });
    } catch (err) { next(err); }
  },

  async removeFromWatchlist(req, res, next) {
    try {
      await userService.removeFromWatchlist(req.params.id, req.params.movieId);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  // ── Likes ────────────────────────────────────────────────────────────────
  async getLikes(req, res, next) {
    try {
      const list = await userService.getLikes(req.params.id);
      res.json({ data: list });
    } catch (err) { next(err); }
  },

  async addLike(req, res, next) {
    try {
      const { movieId } = req.body;
      const movie = await userService.addLike(req.params.id, movieId);
      res.status(201).json({ data: movie });
    } catch (err) { next(err); }
  },

  async removeLike(req, res, next) {
    try {
      await userService.removeLike(req.params.id, req.params.movieId);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
