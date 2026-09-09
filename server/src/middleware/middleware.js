// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Internal server error",
  });
}

function validate(requiredFields) {
  return (req, res, next) => {
    const body = req.body || {};
    const missing = requiredFields.filter((f) => body[f] === undefined || body[f] === "");
    if (missing.length) {
      return res.status(400).json({ error: `Missing fields: ${missing.join(", ")}` });
    }
    next();
  };
}

module.exports = { errorHandler, validate };
