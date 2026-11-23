import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Register } from './Register.jsx';
import { Login } from './Login.jsx';
import { ResetPassword } from './ResetPassword.jsx';
import './style.css';

const screens = {
  giris: { label: 'Giriş', Component: Login },
  kayit: { label: 'Kayıt', Component: Register },
  sifre: { label: 'Şifre sıfırlama', Component: ResetPassword },
};

function currentScreen() {
  const key = window.location.hash.slice(1);
  return Object.hasOwn(screens, key) ? key : 'giris';
}

function App() {
  const [screen, setScreen] = useState(currentScreen);
  useEffect(() => {
    const updateScreen = () => setScreen(currentScreen());
    window.addEventListener('hashchange', updateScreen);
    return () => window.removeEventListener('hashchange', updateScreen);
  }, []);

  const { Component } = screens[screen];
  return (
    <main className="auth-card">
      <p className="brand">Lab1 · Kimlik Doğrulama</p>
      <nav aria-label="Kimlik doğrulama ekranları">
        {Object.entries(screens).map(([key, { label }]) => (
          <a key={key} href={`#${key}`} aria-current={screen === key ? 'page' : undefined}>{label}</a>
        ))}
      </nav>
      <Component />
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
