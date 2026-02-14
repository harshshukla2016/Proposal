
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../hooks/useStore';
import { createProposal } from '../services/apiService';
import { MemoryUploadData } from '../types';
import MemoryUpload from './MemoryUpload';
import { CRYSTAL_COUNT_MIN } from '../constants';
import LoadingScreen from './LoadingScreen';
import { supabase } from '../services/supabaseClient';
import { MyProposals } from './MyProposals';

const CreatorPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useStore();
  const [partnerName, setPartnerName] = useState('');
  const [memories, setMemories] = useState<MemoryUploadData[]>(
    Array(CRYSTAL_COUNT_MIN).fill({ imageFile: null, caption: '' })
  );
  const [nebulaColor, setNebulaColor] = useState('#5a006c'); // Default purple
  const [starColor, setStarColor] = useState('#e0e0e0'); // Default silver
  const [musicUrl, setMusicUrl] = useState('');
  const [musicStartTime, setMusicStartTime] = useState(0);
  const [videoUrl, setVideoUrl] = useState('');
  const [proposalText, setProposalText] = useState("Will you marry me?");
  const [galleryImages, setGalleryImages] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | '' }>({ text: '', type: '' });
  const [generatedToken, setGeneratedToken] = useState<string | null>(null);
  const [showMyProposals, setShowMyProposals] = useState(false);

  const handleMemoryChange = (index: number, updatedMemory: MemoryUploadData) => {
    console.log(`[CreatorPanel] Updating memory ${index}:`, updatedMemory);
    const newMemories = [...memories];
    newMemories[index] = updatedMemory;
    setMemories(newMemories);
  };

  const addMemory = () => {
    setMemories([...memories, { imageFile: null, caption: '' }]);
  };

  const removeMemory = (index: number) => {
    if (memories.length > CRYSTAL_COUNT_MIN) {
      const newMemories = memories.filter((_, i) => i !== index);
      setMemories(newMemories);
    }
  };

  const handleGalleryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setGalleryImages(Array.from(e.target.files));
    }
  };

  // ... existing handler functions

  const handleSubmit = async (event: React.FormEvent) => {
    // ... existing validation
    event.preventDefault();
    if (!user) {
      setMessage({ text: 'You must be logged in to create a proposal.', type: 'error' });
      return;
    }
    if (memories.some(m => !m.caption)) {
      setMessage({ text: 'Please fill in all memory captions.', type: 'error' });
      return;
    }
    if (!partnerName) {
      setMessage({ text: 'Please enter your partner\'s name.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });
    setGeneratedToken(null);

    try {
      const proposal = await createProposal(user.id, partnerName, nebulaColor, starColor, memories, musicUrl, musicStartTime, videoUrl, proposalText);
      if (proposal) {
        setMessage({ text: 'Proposal created successfully!', type: 'success' });
        setGeneratedToken(proposal.token);
      } else {
        throw new Error('Failed to create proposal.');
      }
    } catch (error: any) {
      console.error('Full error object:', error);
      let errorMessage = `Error creating proposal: ${error.message}`;

      if (error.message && (error.message.includes('music_start_time') || error.message.includes('schema cache'))) {
        errorMessage = 'Database Error: The "music_start_time" column is missing. Please run the SQL script in your Supabase Dashboard to update your database table.';
      }

      setMessage({ text: errorMessage, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-purple-900 rounded-lg shadow-xl max-w-md w-full border border-purple-700">
        <p className="text-xl text-purple-200 mb-4">Please log in to create your proposal.</p>
        <button
          onClick={() => navigate('/auth')}
          className="p-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-md hover:from-pink-600 hover:to-purple-700 transition-all duration-300"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return <LoadingScreen message="Forging your galaxy..." />;
  }

  return (
    <>
      {showMyProposals && user && (
        <MyProposals userId={user.id} onClose={() => setShowMyProposals(false)} />
      )}

      <div className="container mx-auto p-4 sm:p-8 max-w-4xl bg-purple-900 rounded-lg shadow-2xl border border-purple-700 mt-8 mb-8 overflow-y-auto max-h-[90vh]">
        {/* Header with My Proposals Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">
            Create Your Galactic Proposal
          </h1>
          <button
            type="button"
            onClick={() => setShowMyProposals(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span>📜</span>
            <span>My Proposals</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-purple-800 rounded-lg border border-purple-700">
            <label htmlFor="partnerName" className="block text-xl font-medium text-pink-300 mb-2">
              Partner's Name <span className="text-red-400">*</span>
            </label>
            <input
              id="partnerName"
              type="text"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              placeholder="Enter your beloved's name"
              className="w-full p-3 bg-purple-700 border border-purple-600 rounded-md text-purple-50 placeholder-purple-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              required
            />
          </div>

          <div className="p-4 bg-purple-800 rounded-lg border border-purple-700">
            <h2 className="text-xl font-medium text-pink-300 mb-4">Lover's Theme Colors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nebulaColor" className="block text-sm font-medium text-purple-200 mb-1">
                  Nebula Color
                </label>
                <input
                  id="nebulaColor"
                  type="color"
                  value={nebulaColor}
                  onChange={(e) => setNebulaColor(e.target.value)}
                  className="w-full h-10 p-1 border-2 border-purple-600 rounded-md cursor-pointer"
                />
              </div>
              <div>
                <label htmlFor="starColor" className="block text-sm font-medium text-purple-200 mb-1">
                  Star Color
                </label>
                <input
                  id="starColor"
                  type="color"
                  value={starColor}
                  onChange={(e) => setStarColor(e.target.value)}
                  className="w-full h-10 p-1 border-2 border-purple-600 rounded-md cursor-pointer"
                />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="musicUrl" className="block text-sm font-medium text-pink-300 mb-1">
                  Song URL (YouTube or Direct MP3)
                </label>
                <input
                  id="musicUrl"
                  type="url"
                  value={musicUrl}
                  onChange={(e) => setMusicUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="w-full p-2 bg-purple-700 border border-purple-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
              <div>
                <label htmlFor="musicStartTime" className="block text-sm font-medium text-pink-300 mb-1">
                  Start Time (seconds)
                </label>
                <input
                  id="musicStartTime"
                  type="number"
                  min="0"
                  value={musicStartTime}
                  onChange={(e) => setMusicStartTime(parseInt(e.target.value) || 0)}
                  className="w-full p-2 bg-purple-700 border border-purple-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
              </div>
            </div>
            <div className="mt-4">
              <label htmlFor="videoUrl" className="block text-sm font-medium text-pink-300 mb-1">
                Proposal Video URL (Direct MP4 Link)
              </label>
              <input
                id="videoUrl"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://example.com/video.mp4"
                className="w-full p-2 bg-purple-700 border border-purple-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                Optional: Provide a direct MP4 link for the final proposal video. If using Google Photos, use a tool to generate a direct download link.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-medium text-pink-300 mb-4">Memory Crystals ({memories.length} / {CRYSTAL_COUNT_MIN} minimum)</h2>
            {memories.map((memory, index) => (
              <MemoryUpload
                key={index}
                index={index}
                memory={memory}
                onChange={handleMemoryChange}
                onRemove={removeMemory}
                canRemove={memories.length > CRYSTAL_COUNT_MIN}
              />
            ))}
            <button
              type="button"
              onClick={addMemory}
              className="w-full p-3 bg-purple-700 text-purple-100 rounded-md hover:bg-purple-600 transition-colors duration-200 flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Another Memory</span>
            </button>
          </div>

          <div className="p-4 bg-purple-800 rounded-lg border border-purple-700">
            <h2 className="text-xl font-medium text-pink-300 mb-4">The Big Question</h2>
            <div>
              <label htmlFor="proposalText" className="block text-sm font-medium text-purple-200 mb-1">
                Proposal Text (Inside the Palace)
              </label>
              <input
                id="proposalText"
                type="text"
                value={proposalText}
                onChange={(e) => setProposalText(e.target.value)}
                placeholder="Will you marry me?"
                className="w-full p-3 bg-purple-700 border border-purple-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>



          <button
            type="submit"
            className="w-full p-4 mt-8 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xl font-bold rounded-md hover:from-pink-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || memories.length < CRYSTAL_COUNT_MIN || memories.some(m => !m.caption) || !partnerName}
          >
            {loading ? 'Creating Galaxy...' : 'Launch Proposal Odyssey'}
          </button>
        </form>

        {
          message.text && (
            <p className={`mt-6 text-center text-lg ${message.type === 'error' ? 'text-red-400' : 'text-green-400'}`}>
              {message.text}
            </p>
          )
        }

        {
          generatedToken && (
            <div className="mt-8 p-6 bg-green-900 bg-opacity-30 border border-green-700 rounded-lg text-center">
              <h3 className="text-2xl font-bold text-green-300 mb-3">Your Proposal Token:</h3>
              <p className="text-4xl font-extrabold text-white tracking-widest bg-green-800 p-4 rounded-md inline-block">
                {generatedToken}
              </p>
              <p className="text-lg text-green-200 mt-4">Share this token with your partner to unlock the galaxy!</p>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedToken);
                  setMessage({ text: 'Token copied to clipboard!', type: 'success' });
                }}
                className="mt-4 px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200"
              >
                Copy Token
              </button>
            </div>
          )
        }

        <button
          onClick={async () => {
            setLoading(true);
            await supabase.auth.signOut();
            setUser(null);
            setLoading(false);
            navigate('/');
          }}
          className="mt-8 text-purple-400 hover:text-red-400 transition-colors duration-200 text-sm w-full text-center"
          disabled={loading}
        >
          Sign Out
        </button>
      </div >
    </>
  );
};

export default CreatorPanel;
