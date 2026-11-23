import assert from 'node:assert/strict';
import { once } from 'node:events';
import { test } from 'node:test';
import { createApp } from '../server/app.js';
import { openDatabase } from '../server/database.js';

const email = 'ogrenci@example.test';
const password = 'lab-kayit-2026';
const newPassword = 'lab-sifirla-2026';

async function startApi(t) {
  const database = openDatabase(':memory:');
  let time = Date.now();
  const deliveries = [];
  const app = createApp({
    database,
    now: () => time,
    deliverReset: (delivery) => deliveries.push(delivery),
  });
  const server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    database.close();
  });
  const url = `http://127.0.0.1:${server.address().port}/api/auth`;

  async function post(route, body) {
    const response = await fetch(`${url}/${route}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: response.status, body: await response.json() };
  }

  return { post, deliveries, database, advanceTime: (milliseconds) => { time += milliseconds; } };
}

test('kayıt ve giriş API’leri SQLite üzerinden birlikte çalışır', async (t) => {
  const { post, database } = await startApi(t);
  assert.equal((await post('register', { email: ' OGRENCI@example.test ', password })).status, 201);
  const stored = database.prepare('SELECT password_hash FROM users WHERE email = ?').get(email);
  assert.match(stored.password_hash, /^[0-9a-f]{32}:[0-9a-f]{128}$/);
  assert.deepEqual(await post('login', { email, password }), {
    status: 200,
    body: { message: 'Giriş başarılı.', user: { id: 1, email } },
  });
});

test('geçersiz e-posta, kısa şifre, çift kayıt ve yanlış giriş reddedilir', async (t) => {
  const { post } = await startApi(t);
  assert.equal((await post('register', { email: 'hatalı', password })).status, 400);
  assert.equal((await post('register', { email, password: 'kısa' })).status, 400);
  const registrations = await Promise.all([post('register', { email, password }), post('register', { email, password })]);
  assert.deepEqual(registrations.map(({ status }) => status).sort(), [201, 409]);
  assert.equal((await post('login', { email, password: 'yanlış-şifre' })).status, 401);
  assert.equal((await post('login', { email: 'bilinmeyen@example.test', password })).status, 401);
});

test('sıfırlama kodu bir kez kullanılabilir ve giriş yeni şifreyle çalışır', async (t) => {
  const { post, deliveries } = await startApi(t);
  assert.equal((await post('register', { email, password })).status, 201);
  assert.equal((await post('reset/request', { email })).status, 200);
  const [{ token }] = deliveries;
  const confirmations = await Promise.all([
    post('reset/confirm', { token, password: newPassword }),
    post('reset/confirm', { token, password: newPassword }),
  ]);
  assert.deepEqual(confirmations.map(({ status }) => status).sort(), [200, 400]);
  assert.equal((await post('login', { email, password })).status, 401);
  assert.equal((await post('login', { email, password: newPassword })).status, 200);
});

test('yeni kod eski kodu geçersiz kılar ve kod 15 dakika sonra sona erer', async (t) => {
  const { post, deliveries, advanceTime } = await startApi(t);
  await post('register', { email, password });
  await post('reset/request', { email });
  await post('reset/request', { email });
  assert.equal((await post('reset/confirm', { token: deliveries[0].token, password: newPassword })).status, 400);
  advanceTime(15 * 60 * 1000);
  assert.equal((await post('reset/confirm', { token: deliveries[1].token, password: newPassword })).status, 400);
  assert.equal((await post('login', { email, password })).status, 200);
});

test('bilinmeyen e-posta için aynı sıfırlama yanıtı döner ve kod üretilmez', async (t) => {
  const { post, deliveries } = await startApi(t);
  const unknown = await post('reset/request', { email });
  assert.equal(deliveries.length, 0);
  await post('register', { email, password });
  assert.deepEqual(await post('reset/request', { email }), unknown);
  assert.equal(deliveries.length, 1);
});
