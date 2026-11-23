import { createHash, randomBytes } from 'node:crypto';
import { hashPassword, isPassword, normalizeEmail } from './credentials.js';

const resetDurationMs = 15 * 60 * 1000;

function tokenHash(token) {
  return createHash('sha256').update(token).digest('hex');
}

export function requestPasswordReset(database, deliverReset, now) {
  const saveToken = database.prepare('UPDATE users SET reset_hash = ?, reset_expires_at = ? WHERE email = ?');

  return (req, res) => {
    const email = normalizeEmail(req.body?.email);
    if (!email) {
      return res.status(400).json({ message: 'Geçerli bir e-posta gir.' });
    }

    const token = randomBytes(32).toString('base64url');
    const result = saveToken.run(tokenHash(token), now() + resetDurationMs, email);
    if (result.changes === 1) deliverReset({ email, token });
    return res.json({ message: 'Bu e-posta kayıtlıysa sıfırlama kodu hazırlandı.' });
  };
}

export function confirmPasswordReset(database, now) {
  const findToken = database.prepare('SELECT id FROM users WHERE reset_hash = ? AND reset_expires_at > ?');
  const changePassword = database.prepare(`
    UPDATE users
    SET password_hash = ?, reset_hash = NULL, reset_expires_at = NULL
    WHERE id = ? AND reset_hash = ? AND reset_expires_at > ?
  `);
  const invalidCode = 'Sıfırlama kodu geçersiz veya süresi dolmuş.';

  return async (req, res) => {
    const { token, password } = req.body ?? {};
    if (typeof token !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(token) || !isPassword(password)) {
      return res.status(400).json({ message: 'Geçerli bir kod ve 8–128 karakterlik yeni şifre gir.' });
    }

    const digest = tokenHash(token);
    const user = findToken.get(digest, now());
    if (!user) return res.status(400).json({ message: invalidCode });

    const result = changePassword.run(await hashPassword(password), user.id, digest, now());
    if (result.changes === 0) return res.status(400).json({ message: invalidCode });
    return res.json({ message: 'Şifren değiştirildi. Yeni şifrenle giriş yapabilirsin.' });
  };
}
