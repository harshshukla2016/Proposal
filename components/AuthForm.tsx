
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const AuthForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage('Sign-up successful! Check your email for a confirmation link.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate('/creator');
      }
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-purple-900 rounded-lg shadow-xl max-w-md w-full border border-purple-700">
      <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 mb-6">
        {isSignUp ? 'Sign Up' : 'Log In'} for Your Odyssey
      </h2>
      <form onSubmit={handleAuth} className="w-full space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-purple-200 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-purple-800 border border-purple-600 rounded-md text-purple-50 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-purple-200 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-purple-800 border border-purple-600 rounded-md text-purple-50 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-3 mt-6 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-md hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
        </button>
      </form>
      {message && (
        <p className={`mt-4 text-sm ${message.includes('Error') ? 'text-red-400' : 'text-green-400'}`}>
          {message}
        </p>
      )}
      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-6 text-purple-300 hover:text-pink-400 transition-colors duration-200 text-sm"
      >
        {isSignUp ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </button>
      <button
        onClick={async () => {
          setLoading(true);
          await supabase.auth.signOut();
          setLoading(false);
          navigate('/'); // Redirect to home/entry
        }}
        className="mt-4 text-purple-400 hover:text-red-400 transition-colors duration-200 text-xs"
        disabled={loading}
      >
        Sign Out
      </button>
    </div>
  );
};

export default AuthForm;
    