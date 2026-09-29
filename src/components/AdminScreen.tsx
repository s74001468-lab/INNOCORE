import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const AdminScreen: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 text-center text-zinc-500 py-20 border border-dashed border-zinc-800 rounded-2xl bg-[#121214]">
      <ShieldAlert className="w-12 h-12 text-[#FF4D00] mx-auto mb-3 opacity-60" />
      <h3 className="text-lg font-bold text-white mb-1">Этап 2: B2B-Дашборд Управляющего</h3>
      <p className="text-xs text-zinc-400">Ожидает вашего подтверждения «Продолжай» для перехода к разработке Этапа 2.</p>
    </div>
  );
};
