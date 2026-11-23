import { isPassword, normalizeEmail, verifyPassword } from './credentials.js';

export function loginUser(database) {
  const findUser = database.prepare('SELECT id, email, password_hash FROM users WHERE email = ?');

  return async (req, res) => {
    const { email, password } = req.body ?? {};
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !isPassword(password, 1)) {
      return res.status(400).json({ message: 'Geçerli bir e-posta ve şifre gir.' });
    }

    const user = findUser.get(normalizedEmail);
    const matches = await verifyPassword(password, user?.password_hash);
    if (!user || !matches) {
      return res.status(401).json({ message: 'E-posta veya şifre hatalı.' });
    }
    return res.json({ message: 'Giriş başarılı.', user: { id: user.id, email: user.email } });
  };
}
