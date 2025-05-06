'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [type, setType] = useState('classe'); // 'classe' ou 'prof'
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, login, password })
    });
    if (response.ok) {
      const data = await response.json();
      console.log('Login response:', data);
      if (data.role === 'prof') {
        router.push('/admin');
      } else {
        router.push('/cours');
      }
    } else {
      const data = await response.json();
      alert(data.error || "Identifiants incorrects");
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Connexion</h1>
        <form onSubmit={handleLogin}>
          <div className="container">
            <div className="tabs">
              <input
                type="radio"
                id="radio-1"
                name="type"
                value="classe"
                checked={type === 'classe'}
                onChange={() => setType('classe')}
              />
              <label className="tab" htmlFor="radio-1">Classe</label>
              
              <input
                type="radio"
                id="radio-2"
                name="type"
                value="prof"
                checked={type === 'prof'}
                onChange={() => setType('prof')}
              />
              <label className="tab" htmlFor="radio-2">Professeur</label>
              
              <span className="glider"></span>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="login">{type === 'prof' ? 'Identifiant prof' : 'Nom de la classe'}</label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>
          <button type="submit" className="btn mt-4">Se connecter</button>
        </form>
      </div>
    </div>
  );
}
