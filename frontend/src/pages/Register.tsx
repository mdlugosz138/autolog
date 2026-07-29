import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setToken } = useAuth();
  const navigate = useNavigate();

 async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();
  setError('');
  try {
    const data = await register(email, password);
    await setToken(data.accessToken);
    navigate('/dashboard');
  } catch (err: any) {
    setError(err.response?.data?.message || 'Błąd rejestracji');
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6">Rejestracja</h1>
        {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />
        <input
          type="password"
          placeholder="Hasło (min. 8 znaków)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded px-3 py-2 mb-4"
          required
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Zarejestruj się
        </button>
        <p className="text-sm text-center mt-4">
          Masz już konto? <Link to="/login" className="text-blue-600">Zaloguj się</Link>
        </p>
      </form>
    </div>
  );
}