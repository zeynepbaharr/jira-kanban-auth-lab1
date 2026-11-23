import { useState } from 'react';

export function useApiForm(endpoint) {
  const [pending, setPending] = useState(false);
  const [notice, setNotice] = useState(null);

  async function submit(event, validate = () => '') {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    const error = validate(fields);
    if (error) {
      setNotice({ error: true, text: error });
      return false;
    }

    setPending(true);
    setNotice(null);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fields),
      });
      const result = await response.json();
      setNotice({ error: !response.ok, text: result.message });
      if (response.ok) form.reset();
      return response.ok;
    } catch {
      setNotice({ error: true, text: 'Sunucuya ulaşılamadı. Tekrar dene.' });
      return false;
    } finally {
      setPending(false);
    }
  }

  return { submit, pending, notice };
}
