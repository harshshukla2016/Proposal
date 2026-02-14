
import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-70 text-white z-50">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500 mb-4"></div>
      <p className="text-xl md:text-2xl font-semibold text-center text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-400">
        {message}
      </p>
      <p className="mt-2 text-sm text-purple-200">Please wait while the cosmos aligns...</p>
    </div>
  );
};

export default LoadingScreen;
    