
import React, { useState } from 'react';
import { api } from '../services/api';
import { Mail, LoaderCircle, Lock, UserPlus } from 'lucide-react';

interface AuthProps {
  onBack: () => void;
  onRegisterClick: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBack, onRegisterClick }) => {
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
    <div className="min-h-screen flex items-center justify-center bg-zinc-900 p-4 animate-fade-in">
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
        
        {error && <p className="mt-4 text-center text-red-400 text-sm bg-red-900/20 p-2 rounded">{error}</p>}
        
        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <p className="text-zinc-400 text-sm mb-3">Want to become a performer?</p>
            <button 
                onClick={onRegisterClick}
                className="w-full py-2 px-4 rounded-lg border border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all flex items-center justify-center gap-2 font-medium"
            >
                <UserPlus size={16} /> Join as Talent
            </button>
        </div>

        <div className="text-center text-xs text-zinc-500 mt-6 space-y-2">
            <a href="#" onClick={(e) => { e.preventDefault(); onBack(); }} className="text-orange-400 hover:text-orange-300 transition-colors underline">
                &larr; Return to the public gallery
            </a>
        </div>
      </div>
    </div>
  );
};

export default Auth;
