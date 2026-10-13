// validate({ params, query, body }) -> Express middleware.
// Runs Zod schemas, replaces req.params/query/body with the cleaned (trimmed, typed,
// unknown-keys-removed) data, or answers 400 with a readable message + per-field errors.
export const validate = (schemas) => (req, res, next) => {
  const errors = [];
  for (const key of ["params", "query", "body"]) {
    if (!schemas[key]) continue;
    const result = schemas[key].safeParse(req[key] ?? {});
    if (result.success) {
      req[key] = result.data;
    } else {
      result.error.issues.forEach((i) => errors.push({ field: i.path.join("."), message: i.message }));
    }
  }
  if (errors.length) {
    return res.status(400).json({ message: errors[0].message, errors });
  }
  next();
};
