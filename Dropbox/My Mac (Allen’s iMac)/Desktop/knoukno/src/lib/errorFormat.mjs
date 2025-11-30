export function formatZodError(err) {
  // zod v3 error format
  if (!err || !err.errors) return { message: err?.message || 'invalid', issues: [] };
  const issues = err.errors.map(e => ({ path: e.path || [], message: e.message, code: e.code }));
  return { message: 'validation_error', issues };
}
