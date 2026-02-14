
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate } from 'react-router-dom';
import AuthForm from './components/AuthForm';
import CreatorPanel from './components/CreatorPanel';
import PartnerEntry from './components/PartnerEntry';
import LoveCityScene from './scenes/LoveCityScene';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary'; // Import the new ErrorBoundary
import { useStore } from './hooks/useStore';
import { supabase } from './services/supabaseClient';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser, proposalData, loadingInitialData, setLoadingInitialData } = useStore();

  useEffect(() => {
    const checkUser = async () => {
      setLoadingInitialData(true);
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      setUser(supabaseUser);
      setLoadingInitialData(false);
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [setUser, setLoadingInitialData]);

  if (loadingInitialData) {
    return <LoadingScreen message="Initializing Love City..." />;
  }

  return (
    <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-purple-900 to-pink-900 text-white flex items-center justify-center">
      <Routes>
        <Route path="/" element={<PartnerEntry />} />
        <Route path="/auth" element={user ? <CreatorPanel /> : <AuthForm />} />
        <Route path="/creator" element={user ? <CreatorPanel /> : <AuthForm />} />
        <Route path="/odyssey/:token" element={proposalData ? <LoveCityScene /> : <LoadingScreen message="Preparing the journey..." />} />
        {/* Fallback for invalid paths */}
        <Route path="*" element={<PartnerEntry />} />
      </Routes>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HashRouter>
      <ErrorBoundary> {/* Wrap AppContent with ErrorBoundary */}
        <AppContent />
      </ErrorBoundary>
    </HashRouter>
  );
};

export default App;