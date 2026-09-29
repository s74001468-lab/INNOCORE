import { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { GuestScreen } from './components/GuestScreen';
import { AdminScreen } from './components/AdminScreen';
import { RoiScreen } from './components/RoiScreen';

export function App() {
  const [activeTab, setActiveTab] = useState<'guest' | 'admin' | 'roi'>('guest');

  // Handle URL hash or path sync if desired
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'admin') setActiveTab('admin');
      else if (hash === 'roi') setActiveTab('roi');
      else if (hash === 'guest') setActiveTab('guest');
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const changeTab = (tab: 'guest' | 'admin' | 'roi') => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  return (
    <div className="min-h-screen bg-[#09090B] text-white flex flex-col font-sans selection:bg-[#FF4D00] selection:text-white">
      {/* Top Demo Navigation Bar */}
      <Navigation activeTab={activeTab} setActiveTab={changeTab} />

      {/* Main View Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4">
        {activeTab === 'guest' && <GuestScreen />}
        {activeTab === 'admin' && <AdminScreen />}
        {activeTab === 'roi' && <RoiScreen />}
      </main>

      {/* Footer */}
      <footer className="py-4 border-t border-white/5 text-center text-xs text-zinc-600 font-mono">
        InnoCore Hardware Ecosystem © 2026 • Real-Time Mesh Broadcast Demo
      </footer>
    </div>
  );
}

export default App;
