import React from 'react';

export function EmailField() {
  return (
    <label>
      E-posta
      <input name="email" type="email" autoComplete="email" maxLength={254} required />
    </label>
  );
}

export function PasswordField({ label = 'Şifre', name = 'password', isNew = false }) {
  return (
    <label>
      {label}
      <input
        name={name}
        type="password"
        autoComplete={isNew ? 'new-password' : 'current-password'}
        minLength={isNew ? 8 : undefined}
        maxLength={128}
        required
      />
    </label>
  );
}

export function Notice({ value }) {
  if (!value) return null;
  return <p role={value.error ? 'alert' : 'status'} className={value.error ? 'error' : 'success'}>{value.text}</p>;
}
