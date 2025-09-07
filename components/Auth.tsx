import React, { useState } from 'react';
import { api } from '../services/api';
import { Mail, LoaderCircle, Lock } from 'lucide-react';

interface AuthProps {
  onBack: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBack }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error } = await api.signInWithPassword(email, password);

    if (error) {
      setError(error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4">
      <div className="card-base !p-8 max-w-sm w-full mx-auto">
        <div className="text-center mb-8">
            <div className="flex flex-col items-center cursor-pointer no-underline group mb-4">
                <div className="flex items-center">
                    <span className="font-logo-main text-4xl tracking-wider text-white">FLAV</span>
                    <span className="text-4xl mx-[-0.15em] relative" style={{top: "-0.05em"}}>🍑</span>
                    <span className="font-logo-main text-4xl tracking-wider text-white">R</span>
                </div>
                <span className="font-logo-sub text-lg text-zinc-500 -mt-2 ml-1 tracking-wide">entertainers</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Performer & Admin Portal</h2>
            <p className="text-zinc-400 mt-2">Sign in to access your dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              id="email"
              className="input-base input-with-icon"
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-500" />
            <input
              id="password"
              className="input-base input-with-icon"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2"
            disabled={loading}
          >
            {loading ? <LoaderCircle className="animate-spin" /> : 'Sign In'}
          </button>
        </form>
        
        {error && <p className="mt-4 text-center text-red-400">{error}</p>}

        <div className="text-center text-xs text-zinc-500 mt-6 space-y-2">
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="text-orange-400 hover:text-orange-300 transition-colors underline">
                &larr; Or return to the public gallery
            </a>
            <p>
                (Demo users: <code className="bg-zinc-700/50 px-1 py-0.5 rounded">april@flavor.com</code> or <code className="bg-zinc-700/50 px-1 py-0.5 rounded">admin@flavor.com</code> with password <code className="bg-zinc-700/50 px-1 py-0.5 rounded">password123</code>)
            </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;