const { formatZodError } = await import(new URL('../lib/errorFormat.mjs', import.meta.url));

export default function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      return next();
    } catch (err) {
      const out = formatZodError(err);
      return res.status(400).json({ error: out.message, details: out.issues });
    }
  };
}
