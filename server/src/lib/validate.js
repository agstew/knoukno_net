import { badRequest } from './errors.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function str(value, field, { min = 1, max = 500, required = true } = {}) {
  if (value === undefined || value === null || value === '') {
    if (required) throw badRequest(`${field} is required`);
    return null;
  }
  if (typeof value !== 'string') throw badRequest(`${field} must be text`);
  const trimmed = value.trim();
  if (trimmed.length < min) throw badRequest(`${field} must be at least ${min} characters`);
  if (trimmed.length > max) throw badRequest(`${field} must be ${max} characters or fewer`);
  return trimmed;
}

export function email(value) {
  const v = str(value, 'Email', { max: 190 }).toLowerCase();
  if (!EMAIL_RE.test(v)) throw badRequest('Enter a valid email address');
  return v;
}

export function password(value) {
  const v = str(value, 'Password', { min: 8, max: 200 });
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) {
    throw badRequest('Password must contain at least one letter and one number');
  }
  return v;
}

export function oneOf(value, field, allowed) {
  if (!allowed.includes(value)) {
    throw badRequest(`${field} must be one of: ${allowed.join(', ')}`);
  }
  return value;
}

export function bool(value) {
  return value === true || value === 'true' || value === 1 || value === '1';
}

export function pagination(query, { defaultLimit = 5, maxLimit = 50 } = {}) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number.parseInt(query.limit, 10) || defaultLimit));
  return { page, limit, offset: (page - 1) * limit };
}

export function uuidLike(value, field) {
  const v = str(value, field, { max: 36 });
  if (!/^[0-9a-fA-F-]{36}$/.test(v)) throw badRequest(`${field} is not a valid id`);
  return v;
}

export function countWords(text) {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}
