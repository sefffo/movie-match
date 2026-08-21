import { randomUUID } from "crypto";
import { matchRepository } from "./match.repository.js";
import { userRepository }  from "../users/user.repository.js";
import { AppError } from "../../utils/app-error.js";

export const matchService = {
  async createMatch({ userOneId, userTwoId }) {
    // ── Validate ───────────────────────────────────────────────────────────
    if (!userOneId || !userTwoId)
      throw new AppError("userOneId and userTwoId are required", 400);
    if (userOneId === userTwoId)
      throw new AppError("userOneId and userTwoId must be different people", 400);

    const [u1, u2] = await Promise.all([
      userRepository.findById(userOneId),
      userRepository.findById(userTwoId),
    ]);
    if (!u1) throw new AppError(`User ${userOneId} not found`, 404);
    if (!u2) throw new AppError(`User ${userTwoId} not found`, 404);

    // ── Run matching engine ──────────────────────────────────────────────────
    let recommendations = await matchRepository.getSharedWatchlist(userOneId, userTwoId);
    let matchType = "exact";

    if (!recommendations.length) {
      // Fallback: genre-based recommendations
      recommendations = await matchRepository.getGenreBasedFallback(userOneId, userTwoId);
      matchType = "genre_based";
    }

    // ── Persist match + recommendations atomically ────────────────────────────
    const match = await matchRepository.create({
      id: randomUUID(),
      userOneId,
      userTwoId,
      recommendations,
    });

    return { ...match, matchType };
  },

  async getAllMatches() {
    return matchRepository.findAll();
  },

  async getMatchById(id) {
    const match = await matchRepository.findById(id);
    if (!match) throw new AppError("Match not found", 404);
    return match;
  },

  async chooseWinner(matchId, movieId) {
    const match = await matchRepository.findById(matchId);
    if (!match) throw new AppError("Match not found", 404);
    if (match.status === "chosen")
      throw new AppError("A winner has already been chosen for this match", 400);

    const isRecommended = match.recommendations.some((r) => r.id === movieId);
    if (!isRecommended)
      throw new AppError("Movie was not in this match's recommendations", 400);

    return matchRepository.chooseWinner(matchId, movieId);
  },

  async deleteMatch(id) {
    const match = await matchRepository.findById(id);
    if (!match) throw new AppError("Match not found", 404);
    await matchRepository.delete(id);
  },
};
