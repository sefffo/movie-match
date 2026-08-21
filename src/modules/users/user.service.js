import { randomUUID } from "crypto";
import { userRepository } from "./user.repository.js";
import { AppError } from "../../utils/app-error.js";

export const userService = {
  async createUser({ name, avatarColor = "#e94560" }) {
    if (!name || !name.trim()) throw new AppError("name is required", 400);
    return userRepository.create({ id: randomUUID(), name: name.trim(), avatarColor });
  },

  async getAllUsers() {
    return userRepository.findAll();
  },

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  async updateUser(id, fields) {
    await userService.getUserById(id); // ensures 404 if missing
    const updated = await userRepository.update(id, fields);
    if (!updated) throw new AppError("Nothing to update", 400);
    return updated;
  },

  async deleteUser(id) {
    await userService.getUserById(id);
    await userRepository.delete(id);
  },

  // ── Watchlist ────────────────────────────────────────────────────────────
  async getWatchlist(userId) {
    await userService.getUserById(userId);
    return userRepository.getWatchlist(userId);
  },

  async addToWatchlist(userId, movieId, priority) {
    await userService.getUserById(userId);
    if (!movieId) throw new AppError("movieId is required", 400);
    const result = await userRepository.addToWatchlist(userId, movieId, priority);
    if (!result) throw new AppError("Movie not found", 404);
    return result;
  },

  async removeFromWatchlist(userId, movieId) {
    await userService.getUserById(userId);
    await userRepository.removeFromWatchlist(userId, movieId);
  },

  // ── Likes ────────────────────────────────────────────────────────────────
  async getLikes(userId) {
    await userService.getUserById(userId);
    return userRepository.getLikes(userId);
  },

  async addLike(userId, movieId) {
    await userService.getUserById(userId);
    if (!movieId) throw new AppError("movieId is required", 400);
    const result = await userRepository.addLike(userId, movieId);
    if (!result) throw new AppError("Movie not found", 404);
    return result;
  },

  async removeLike(userId, movieId) {
    await userService.getUserById(userId);
    await userRepository.removeLike(userId, movieId);
  },
};
