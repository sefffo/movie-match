export function errorHandler(err, req, res, _next) {
  const statusCode = err.statusCode ?? 500;
  const message = err.message ?? "Internal server error";

  console.error(`[${new Date().toISOString()}] ${statusCode} — ${message}`);

  res.status(statusCode).json({
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
}
