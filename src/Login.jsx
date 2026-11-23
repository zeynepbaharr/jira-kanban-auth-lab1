import React from 'react';
import { EmailField, Notice, PasswordField } from './Fields.jsx';
import { useApiForm } from './form.js';

export function Login() {
  const { submit, pending, notice } = useApiForm('/api/auth/login');
  return (
    <>
      <h1>Giriş yap</h1>
      <form onSubmit={submitLogin}>
        <EmailField />
        <PasswordField />
        <button disabled={pending}>Giriş yap</button>
        <Notice value={notice} />
      </form>
      <a className="help-link" href="#sifre">Şifremi unuttum</a>
    </>
  );

  function submitLogin(event) {
    void submit(event);
  }
}
