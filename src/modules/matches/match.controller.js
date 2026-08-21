import { matchService } from "./match.service.js";

export const matchController = {
  async create(req, res, next) {
    try {
      const match = await matchService.createMatch(req.body);
      res.status(201).json({ data: match });
    } catch (err) { next(err); }
  },

  async getAll(req, res, next) {
    try {
      const matches = await matchService.getAllMatches();
      res.json({ data: matches });
    } catch (err) { next(err); }
  },

  async getOne(req, res, next) {
    try {
      const match = await matchService.getMatchById(req.params.id);
      res.json({ data: match });
    } catch (err) { next(err); }
  },

  async choose(req, res, next) {
    try {
      const match = await matchService.chooseWinner(req.params.id, req.body.movieId);
      res.json({ data: match });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await matchService.deleteMatch(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },
};
