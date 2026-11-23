import React, { useState } from 'react';
import { EmailField, Notice, PasswordField } from './Fields.jsx';
import { useApiForm } from './form.js';

export function ResetPassword() {
  const [requested, setRequested] = useState(false);
  const request = useApiForm('/api/auth/reset/request');
  const confirm = useApiForm('/api/auth/reset/confirm');

  async function requestCode(event) {
    if (await request.submit(event)) setRequested(true);
  }

  return (
    <>
      <h1>Şifreni sıfırla</h1>
      {requested ? (
        <form key="confirm" onSubmit={(event) => confirm.submit(event, ({ password, confirmPassword }) =>
          password === confirmPassword ? '' : 'Şifreler eşleşmiyor.'
        )}>
          <p className="hint">Lab ortamında sıfırlama kodu sunucu terminalinde gösterilir.</p>
          <label>
            Sıfırlama kodu
            <input name="token" autoComplete="off" spellCheck={false} required minLength={43} maxLength={43} />
          </label>
          <PasswordField label="Yeni şifre (en az 8 karakter)" isNew />
          <PasswordField label="Yeni şifreyi tekrar gir" name="confirmPassword" isNew />
          <button disabled={confirm.pending}>Şifreyi değiştir</button>
          <Notice value={confirm.notice} />
          <button className="link-button" type="button" onClick={() => setRequested(false)}>Yeni kod iste</button>
        </form>
      ) : (
        <form key="request" onSubmit={requestCode}>
          <EmailField />
          <button disabled={request.pending}>Kod iste</button>
          <Notice value={request.notice} />
        </form>
      )}
    </>
  );
}
