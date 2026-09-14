import { scrypt, randomBytes, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
const parameters = Object.freeze({ N: 16384, r: 8, p: 5, maxmem: 64 * 1024 * 1024 });
export const DUMMY_HASH = `scrypt:16384:8:5:${'0'.repeat(32)}:${'0'.repeat(128)}`;
export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(password, salt, 64, parameters);
  return `scrypt:16384:8:5:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password, stored) {
  const current = typeof stored === 'string' && /^scrypt:16384:8:5:([a-f0-9]{32}):([a-f0-9]{128})$/.exec(stored);
  const parsed = current;
  if (!parsed) { await derive(password, '0'.repeat(32), 64, parameters); return false; }
  const [, salt, expected] = parsed;
  const key = await derive(password, salt, 64, legacy ? { ...parameters, p: 1 } : parameters);
  return timingSafeEqual(key, Buffer.from(expected, 'hex'));
}
