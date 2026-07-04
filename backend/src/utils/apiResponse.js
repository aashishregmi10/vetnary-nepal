function ok(res, data, message = 'OK', status = 200) {
  return res.status(status).json({ data, message });
}

function created(res, data, message = 'Created') {
  return ok(res, data, message, 201);
}

function fail(res, message, status = 500, errors = []) {
  return res.status(status).json({ message, errors });
}

class ApiError extends Error {
  constructor(message, status = 500, code, errors = []) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
  }
}

module.exports = { ok, created, fail, ApiError };
