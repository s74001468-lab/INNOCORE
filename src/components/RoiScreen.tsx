import React from 'react';
import { Calculator } from 'lucide-react';

export const RoiScreen: React.FC = () => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 text-center text-zinc-500 py-20 border border-dashed border-zinc-800 rounded-2xl bg-[#121214]">
      <Calculator className="w-12 h-12 text-[#FF4D00] mx-auto mb-3 opacity-60" />
      <h3 className="text-lg font-bold text-white mb-1">Этап 3: B2B ROI Калькулятор</h3>
      <p className="text-xs text-zinc-400">Ожидает вашего подтверждения для перехода к разработке Этапа 3.</p>
    </div>
  );
};
