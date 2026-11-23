import express from 'express';
import { registerUser } from './register.js';
import { loginUser } from './login.js';
import { confirmPasswordReset, requestPasswordReset } from './reset.js';

export function createApp({ database, deliverReset, now = Date.now, staticDir }) {
  const app = express();
  app.disable('x-powered-by');
  app.use('/api', express.json({ limit: '8kb' }));
  app.post('/api/auth/register', registerUser(database));
  app.post('/api/auth/login', loginUser(database));
  app.post('/api/auth/reset/request', requestPasswordReset(database, deliverReset, now));
  app.post('/api/auth/reset/confirm', confirmPasswordReset(database, now));
  app.use('/api', (req, res) => res.status(404).json({ message: 'Uç nokta bulunamadı.' }));
  if (staticDir) app.use(express.static(staticDir));

  app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);
    if (error.type === 'entity.parse.failed') {
      return res.status(400).json({ message: 'Geçerli bir JSON gönder.' });
    }
    if (error.type === 'entity.too.large') {
      return res.status(413).json({ message: 'İstek gövdesi çok büyük.' });
    }
    console.error(error);
    return res.status(500).json({ message: 'Sunucu hatası oluştu.' });
  });
  return app;
}
