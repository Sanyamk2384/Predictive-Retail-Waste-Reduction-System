export const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  const status =
    err.code === "LIMIT_FILE_SIZE"
      ? 413
      : err.code === 11000
        ? 409
        : err.name === "ValidationError" || err.name === "CastError"
          ? 400
          : Number.isInteger(err.status) && err.status >= 400 && err.status < 600
            ? err.status
            : 500;
  console.error("Request error:", err);
  res.status(status).json({
    success: false,
    message: status === 500 ? "Internal server error" : err.message,
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route Not Found",
  });
};
