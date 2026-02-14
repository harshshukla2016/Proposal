
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { getProposalByToken } from '../services/apiService';
import LoadingScreen from './LoadingScreen';
import { GamePhase } from '../types';

const PartnerEntry: React.FC = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setProposalData, setGamePhase } = useStore();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const proposal = await getProposalByToken(token.trim().toUpperCase());
      if (proposal) {
        setProposalData(proposal);
        setGamePhase(GamePhase.PLAYING); // Set game phase to playing after loading data
        navigate(`/odyssey/${token.trim().toUpperCase()}`);
      } else {
        setError('Invalid token. Please check and try again.');
      }
    } catch (err: any) {
      console.error('Error fetching proposal:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Unlocking the universe..." />;
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-br from-purple-900 to-indigo-950 rounded-lg shadow-2xl max-w-lg w-full border border-purple-700">
      <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600 mb-6 text-center">
        Welcome, Seeker.
      </h1>
      <p className="text-xl text-purple-200 mb-8 text-center">
        Enter your secret cosmic token to begin your journey through cherished memories.
      </p>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-purple-200 mb-1">
            Cosmic Token
          </label>
          <input
            id="token"
            type="text"
            placeholder="HEART-XXXX"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-4 bg-purple-800 border border-purple-600 rounded-md text-white placeholder-purple-400 text-center text-2xl tracking-wider uppercase focus:outline-none focus:ring-2 focus:ring-pink-500"
            required
          />
        </div>
        <button
          type="submit"
          className="w-full p-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold rounded-md hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading || token.trim().length === 0}
        >
          {loading ? 'Entering Nebula...' : 'Embark on Odyssey'}
        </button>
      </form>
      {error && (
        <p className="mt-6 text-red-400 text-lg text-center">{error}</p>
      )}

      <button
        onClick={() => navigate('/creator')}
        className="mt-8 text-purple-300 hover:text-pink-400 transition-colors duration-200 text-sm"
      >
        Are you the Creator? Log in here.
      </button>
    </div>
  );
};

export default PartnerEntry;
    