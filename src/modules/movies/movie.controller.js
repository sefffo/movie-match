import { movieService } from "./movie.service.js";

export const movieController = {
  async create(req, res, next) {
    try {
      const movie = await movieService.createMovie(req.body);
      res.status(201).json({ data: movie });
    } catch (err) { next(err); }
  },

  async getAll(req, res, next) {
    try {
      const movies = await movieService.getAllMovies(req.query.search);
      res.json({ data: movies });
    } catch (err) { next(err); }
  },

  async getOne(req, res, next) {
    try {
      const movie = await movieService.getMovieById(req.params.id);
      res.json({ data: movie });
    } catch (err) { next(err); }
  },

  async update(req, res, next) {
    try {
      const movie = await movieService.updateMovie(req.params.id, req.body);
      res.json({ data: movie });
    } catch (err) { next(err); }
  },

  async remove(req, res, next) {
    try {
      await movieService.deleteMovie(req.params.id);
      res.status(204).send();
    } catch (err) { next(err); }
  },

  async getGenres(req, res) {
    res.json({ data: movieService.getValidGenres() });
  },
};
