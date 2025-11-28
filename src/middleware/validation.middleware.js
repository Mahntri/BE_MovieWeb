const validationMiddleware = (schema) => async (req, res, next) => {
  try {
    const value = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    req.body = value;
    next();
  } catch (err) {
    return res.status(400).send({
      message: "Validation Error",
      errors: Array.isArray(err?.errors)
        ? err.errors.join(", ")
        : "Invalid request body",
    });
  }
};

export default validationMiddleware;