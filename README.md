# jira-kanban-auth-lab1

Lab1 için React kayıt, giriş ve şifre sıfırlama ekranları. Express API, kullanıcı kayıtlarını ve sıfırlama kodlarının özetlerini SQLite’ta tutar.

## Yerelde çalıştırma

Node.js 24+ gerekir. Depo klasöründe şu komutları çalıştır.

```sh
npm ci
npm run build
npm start
```

Tarayıcıda `http://127.0.0.1:3000` adresini aç. Örnek bir e-posta ile kayıt ol ve giriş yap. Şifre sıfırlama ekranından kod iste, ardından sunucu terminalindeki tek kullanımlık kodu forma gir. Kod 15 dakika geçerlidir. SQLite dosyası ilk çalıştırmada `data/` altında oluşur.

## API ve test

| Yöntem | Uç nokta | Alanlar |
| --- | --- | --- |
| POST | `/api/auth/register` | `email`, `password` |
| POST | `/api/auth/login` | `email`, `password` |
| POST | `/api/auth/reset/request` | `email` |
| POST | `/api/auth/reset/confirm` | `token`, `password` |

`npm test` komutu, Express’i geçici bir yerel portta çalıştırarak API’leri bellek içi SQLite ile test eder.
