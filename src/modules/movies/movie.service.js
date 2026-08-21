import { randomUUID } from "crypto";
import { movieRepository } from "./movie.repository.js";
import { AppError } from "../../utils/app-error.js";

const VALID_GENRES = [
  "Action", "Animation", "Comedy", "Crime", "Documentary",
  "Drama", "Fantasy", "Horror", "Musical", "Mystery",
  "Romance", "Sci-Fi", "Thriller", "Western",
];

export const movieService = {
  async createMovie({ title, genre, year, posterUrl }) {
    if (!title?.trim()) throw new AppError("title is required", 400);
    if (!genre)         throw new AppError("genre is required", 400);
    if (!year)          throw new AppError("year is required", 400);
    if (!VALID_GENRES.includes(genre))
      throw new AppError(`genre must be one of: ${VALID_GENRES.join(", ")}`, 400);
    return movieRepository.create({
      id: randomUUID(), title: title.trim(), genre, year, posterUrl,
    });
  },

  async getAllMovies(search) {
    return movieRepository.findAll(search);
  },

  async getMovieById(id) {
    const movie = await movieRepository.findById(id);
    if (!movie) throw new AppError("Movie not found", 404);
    return movie;
  },

  async updateMovie(id, fields) {
    await movieService.getMovieById(id);
    if (fields.genre && !VALID_GENRES.includes(fields.genre))
      throw new AppError(`genre must be one of: ${VALID_GENRES.join(", ")}`, 400);
    const updated = await movieRepository.update(id, fields);
    if (!updated) throw new AppError("Nothing to update", 400);
    return updated;
  },

  async deleteMovie(id) {
    await movieService.getMovieById(id);
    await movieRepository.delete(id);
  },

  getValidGenres() {
    return VALID_GENRES;
  },
};
