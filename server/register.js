import { hashPassword, isPassword, normalizeEmail } from './credentials.js';

export function registerUser(database) {
  const insert = database.prepare(`
    INSERT INTO users (email, password_hash) VALUES (?, ?)
    ON CONFLICT(email) DO NOTHING
  `);

  return async (req, res) => {
    const { email, password } = req.body ?? {};
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !isPassword(password)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta ve 8–128 karakterlik bir şifre gir.' });
    }

    const result = insert.run(normalizedEmail, await hashPassword(password));
    if (result.changes === 0) {
      return res.status(409).json({ message: 'Bu e-posta zaten kayıtlı.' });
    }
    return res.status(201).json({ message: 'Hesap oluşturuldu. Giriş yapabilirsin.' });
  };
}
