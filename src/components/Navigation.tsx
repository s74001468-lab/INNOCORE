import React from 'react';
import { Smartphone, LayoutDashboard, Calculator, Radio } from 'lucide-react';

interface NavigationProps {
  activeTab: 'guest' | 'admin' | 'roi';
  setActiveTab: (tab: 'guest' | 'admin' | 'roi') => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-50 bg-[#09090B]/90 backdrop-blur-md border-b border-white/10 px-4 py-3 mb-6">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand & Pitch Demo Badge */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FF5500] to-[#FF3300] flex items-center justify-center font-black text-white text-lg shadow-lg shadow-[#FF4D00]/30">
            I
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-lg tracking-wider text-white">INNO<span className="text-[#FF4D00]">CORE</span></span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 border border-white/10">
                MVP Sim v2.4
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-medium hidden sm:block">IoT-доступ & автономное заселение 24/7</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <nav className="flex items-center space-x-1 bg-[#121214] p-1.5 rounded-2xl border border-white/10 shadow-inner">
          <button
            onClick={() => setActiveTab('guest')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'guest'
                ? 'bg-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/40'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>1. Экран Гостя</span>
          </button>

          <button
            onClick={() => setActiveTab('admin')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'admin'
                ? 'bg-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/40'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>2. Дашборд Отеля</span>
          </button>

          <button
            onClick={() => setActiveTab('roi')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'roi'
                ? 'bg-[#FF4D00] text-white shadow-lg shadow-[#FF4D00]/40'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>3. ROI Калькулятор</span>
          </button>
        </nav>

        {/* Live Broadcast Mesh Status */}
        <div className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/10 text-xs font-mono">
          <Radio className="w-3.5 h-3.5 text-[#FF4D00] animate-pulse" />
          <span className="text-zinc-400">Bus:</span>
          <span className="text-emerald-400 font-bold">innocore_mesh_bus</span>
        </div>

      </div>
    </header>
  );
};
