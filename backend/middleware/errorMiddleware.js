export const notFound = (req, res) => res.status(404).json({ message: `Route not found: ${req.originalUrl}` });

export const errorHandler = (err, req, res, next) => {
  let status = res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message || "Server error";

  if (err.type === "entity.parse.failed") { status = 400; message = "Request body contains invalid JSON"; }
  else if (err.type === "entity.too.large") { status = 413; message = "Request body is too large"; }
  else if (err.code === 11000) { status = 409; message = "This record already exists"; }
  else if (err.name === "CastError") { status = 400; message = `Invalid ${err.path || "value"}`; }
  else if (err.name === "ValidationError" && err.errors) { status = 400; message = Object.values(err.errors)[0].message; }

  if (status >= 500) {
    console.error(err);
    if (process.env.NODE_ENV === "production") message = "Server error";
  }
  res.status(status).json({ message });
};
