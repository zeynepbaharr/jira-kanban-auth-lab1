import React from 'react';
import { EmailField, Notice, PasswordField } from './Fields.jsx';
import { useApiForm } from './form.js';

export function Register() {
  const { submit, pending, notice } = useApiForm('/api/auth/register');
  return (
    <>
      <h1>Kayıt ol</h1>
      <form onSubmit={(event) => submit(event, ({ password, confirmPassword }) =>
        password === confirmPassword ? '' : 'Şifreler eşleşmiyor.'
      )}>
        <EmailField />
        <PasswordField label="Şifre (en az 8 karakter)" isNew />
        <PasswordField label="Şifreyi tekrar gir" name="confirmPassword" isNew />
        <button disabled={pending}>Hesap oluştur</button>
        <Notice value={notice} />
      </form>
    </>
  );
}
