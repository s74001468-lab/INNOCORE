import React, { useState } from 'react';
import { 
  Calculator, 
  DollarSign, 
  Download, 
  Award, 
  Building, 
  UserX, 
  Sparkles
} from 'lucide-react';

export const RoiScreen: React.FC = () => {
  // Sliders state with requested defaults
  const [roomsCount, setRoomsCount] = useState<number>(20); // range 5 to 50
  const [adminSalary, setAdminSalary] = useState<number>(55000); // range 35,000 to 100,000 ₽

  // Constants per prompt specification
  const LOCK_HARDWARE_COST = 6500; // 6 500 ₽ per lock
  const MONTHLY_SOFTWARE_SUB = 350; // 350 ₽ / room / month
  const TAX_PAYROLL_MULTIPLIER = 1.3; // 1.3 for tax & social contributions
  const SHIFTS_COUNT = 2; // 2 night/day administrative shifts eliminated by Zero-Frontdesk

  // Calculations
  // Экономия на персонале в год = ЗП * 2 смены * 1.3 налоги * 12 мес
  const annualPersonnelSavings = Math.round(adminSalary * SHIFTS_COUNT * TAX_PAYROLL_MULTIPLIER * 12);
  const monthlyPersonnelSavings = Math.round(annualPersonnelSavings / 12);

  // Затраты на внедрение InnoCore = (Количество номеров * 6 500 ₽ замок) + (Количество номеров * 350 ₽ * 12 подписка)
  const hardwareInvestment = roomsCount * LOCK_HARDWARE_COST;
  const softwareAnnualCost = roomsCount * MONTHLY_SOFTWARE_SUB * 12;
  const totalInvestment = hardwareInvestment + softwareAnnualCost;

  // Срок полной окупаемости в днях = (Затраты / Экономия в год) * 365
  const paybackDays = Math.max(12, Math.round((totalInvestment / annualPersonnelSavings) * 365));

  // Commercial Proposal Download Handler
  const handleDownloadOffer = () => {
    const offerHTML = `
      <!DOCTYPE HTML>
      <html>
      <head>
        <title>Коммерческое предложение InnoCore</title>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          h1 { color: #FF4D00; font-size: 28px; }
          .header { border-bottom: 3px solid #FF4D00; padding-bottom: 20px; margin-bottom: 30px; }
          .badge { background: #FF4D00; color: white; padding: 4px 12px; border-radius: 4px; font-weight: bold; }
          .grid { display: flex; gap: 20px; margin: 30px 0; }
          .card { border: 1px solid #ddd; padding: 20px; border-radius: 8px; flex: 1; background: #f9f9f9; }
          .number { font-size: 24px; font-weight: bold; color: #000; margin-top: 10px; }
          .highlight { font-size: 32px; color: #FF4D00; font-weight: 900; }
          .footer { margin-top: 40px; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>INNOCORE — ЭКОСИСТЕМА АВТОНОМНОГО ЗАСЕЛЕНИЯ</h1>
          <p>Коммерческое предложение для отеля / глэмпинга на <strong>${roomsCount} юнитов</strong></p>
        </div>

        <h2>Финансово-экономическое обоснование (ROI)</h2>
        <p>Дата расчета: ${new Date().toLocaleDateString('ru-RU')}</p>

        <div class="grid">
          <div class="card">
            <div>Ежегодная экономия ФОТ:</div>
            <div class="number">${annualPersonnelSavings.toLocaleString('ru-RU')} ₽ / год</div>
          </div>
          <div class="card">
            <div>Стоимость внедрения (Hardware + Software):</div>
            <div class="number">${totalInvestment.toLocaleString('ru-RU')} ₽</div>
          </div>
        </div>

        <div class="card" style="background: #FFF5F0; border-color: #FF4D00;">
          <div style="font-weight: bold; color: #FF4D00;">СРОК ПОЛНОЙ ОКУПАЕМОСТИ ИНВЕСТИЦИЙ:</div>
          <div class="highlight">${paybackDays} ДНЕЙ</div>
          <p style="font-size: 13px; color: #555; margin-top: 5px;">За счет сокращения ФОТ администраторов ресепшн и полной автоматизации анкет МВД через ЕСИА.</p>
        </div>

        <h3 style="margin-top: 30px;">Спецификация комплекта:</h3>
        <ul>
          <li>Смарт-замки InnoCore IoT Mesh (AES-128 crypto hardware): ${roomsCount} шт. × 6 500 ₽ = ${hardwareInvestment.toLocaleString('ru-RU')} ₽</li>
          <li>Облачная подписка Zero-Frontdesk + Интеграция ЕСИА/ФМС: ${roomsCount} юнитов × 350 ₽/мес × 12 мес = ${softwareAnnualCost.toLocaleString('ru-RU')} ₽</li>
        </ul>

        <div class="footer">
          InnoCore Hardware Startup Ecosystem • Контакты отдела продаж: sales@innocore.io
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([offerHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `InnoCore_Commercial_Proposal_${roomsCount}_units.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-6 bg-[#09090B] text-white">
      
      {/* Header Banner */}
      <header className="bg-[#121214] border border-white/10 rounded-2xl p-5 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4D00]/10 blur-[130px] pointer-events-none rounded-full" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-3 rounded-2xl bg-[#FF4D00]/10 border border-[#FF4D00]/30 text-[#FF5500]">
                <Calculator className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  B2B ROI Калькулятор
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                  Расчет экономической эффективности внедрения системы InnoCore для инвесторов и отельеров
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-[#FF4D00]/10 text-[#FF5500] border border-[#FF4D00]/30 font-bold uppercase tracking-wider">
              Zero-Frontdesk Tech
            </span>
          </div>
        </div>
      </header>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Interactive Sliders */}
        <div className="lg:col-span-6 space-y-6 bg-[#121214] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl">
          
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-base font-extrabold text-white flex items-center space-x-2">
              <Building className="w-4 h-4 text-[#FF4D00]" />
              <span>Параметры вашего объекта</span>
            </h2>
            <span className="text-xs text-zinc-500 font-mono">Конфигуратор</span>
          </div>

          {/* Slider 1: Number of Cabins/Rooms */}
          <div className="space-y-3 bg-[#18181B] p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Количество домиков / номеров:
              </label>
              <span className="text-xl font-black text-[#FF5500] font-mono bg-[#FF4D00]/10 px-3 py-1 rounded-lg border border-[#FF4D00]/20">
                {roomsCount} юнитов
              </span>
            </div>

            <input
              type="range"
              min="5"
              max="50"
              step="1"
              value={roomsCount}
              onChange={(e) => setRoomsCount(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FF4D00]"
            />

            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>5 номеров (Мини-отель)</span>
              <span>25 (Средний глэмпинг)</span>
              <span>50 (Резорт)</span>
            </div>
          </div>

          {/* Slider 2: Monthly Salary of Night Administrator */}
          <div className="space-y-3 bg-[#18181B] p-4 rounded-xl border border-white/5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-300">
                Зарплата ночного администратора (ФОТ):
              </label>
              <span className="text-xl font-black text-[#FF5500] font-mono bg-[#FF4D00]/10 px-3 py-1 rounded-lg border border-[#FF4D00]/20">
                {adminSalary.toLocaleString('ru-RU')} ₽/мес
              </span>
            </div>

            <input
              type="range"
              min="35000"
              max="100000"
              step="2500"
              value={adminSalary}
              onChange={(e) => setAdminSalary(Number(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#FF4D00]"
            />

            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>35 000 ₽</span>
              <span>55 000 ₽ (Дефолт)</span>
              <span>100 000 ₽</span>
            </div>
          </div>

          {/* Business Assumptions breakdown */}
          <div className="space-y-2 text-xs text-zinc-400 bg-[#09090B] p-4 rounded-xl border border-white/5 font-mono">
            <div className="flex justify-between text-zinc-300 font-bold border-b border-white/5 pb-1">
              <span>МЕТРИКА</span>
              <span>ЗНАЧЕНИЕ</span>
            </div>
            <div className="flex justify-between">
              <span>Стоимость IoT-замка InnoCore:</span>
              <span className="text-white font-bold">{LOCK_HARDWARE_COST.toLocaleString('ru-RU')} ₽ / шт.</span>
            </div>
            <div className="flex justify-between">
              <span>Облачная подписка + ФМС/ЕСИА:</span>
              <span className="text-white font-bold">{MONTHLY_SOFTWARE_SUB} ₽ / номер / мес.</span>
            </div>
            <div className="flex justify-between">
              <span>Устранение смен администраторов:</span>
              <span className="text-emerald-400 font-bold">2 смены (24/7 заселение)</span>
            </div>
            <div className="flex justify-between">
              <span>Налоговая нагрузка на ФОТ:</span>
              <span className="text-zinc-300">× 1.3 (НДФЛ + взносы)</span>
            </div>
          </div>

        </div>

        {/* Right Column: Dynamic Result Cards & Big Payback Counter */}
        <div className="lg:col-span-6 space-y-6 flex flex-col justify-between">
          
          {/* Main Hero Payback Highlight Box */}
          <div className="bg-gradient-to-br from-[#1A1214] via-[#121214] to-[#09090B] border-2 border-[#FF4D00] rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-[#FF4D00]/20 blur-3xl pointer-events-none rounded-full group-hover:bg-[#FF4D00]/30 transition-all" />

            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#FF5500] flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-[#FF4D00] animate-pulse" />
                <span>ГЛАВНЫЙ ПОКАЗАТЕЛЬ ЭФФЕКТИВНОСТИ</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Гарантированный ROI
              </span>
            </div>

            <h3 className="text-sm font-semibold text-zinc-300 mb-1">Срок полной окупаемости проекта:</h3>
            <div className="flex items-baseline space-x-3 my-2">
              <span className="text-5xl sm:text-6xl font-black text-white tracking-tight font-mono drop-shadow-md">
                {paybackDays}
              </span>
              <span className="text-2xl font-bold text-[#FF5500] uppercase tracking-wider font-mono">
                ДНЕЙ
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mt-2 border-t border-white/10 pt-3">
              Уже на <strong className="text-white">{paybackDays}-й день</strong> система полностью окупает все затраты на покупку замков и софта, генерируя чистую прибыль для отеля.
            </p>
          </div>

          {/* Dynamic Result Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Card 1: Annual Personnel Savings */}
            <div className="bg-[#121214] border border-[#FF4D00]/40 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                  Экономия на персонале в год
                </span>
                <UserX className="w-4 h-4 text-[#FF5500]" />
              </div>
              <div className="text-2xl font-black text-[#FF5500] font-mono">
                {annualPersonnelSavings.toLocaleString('ru-RU')} ₽
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                ({monthlyPersonnelSavings.toLocaleString('ru-RU')} ₽ / месяц)
              </p>
            </div>

            {/* Card 2: Implementation Investment */}
            <div className="bg-[#121214] border border-white/10 rounded-2xl p-4 shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                  Затраты на внедрение InnoCore
                </span>
                <DollarSign className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl font-black text-white font-mono">
                {totalInvestment.toLocaleString('ru-RU')} ₽
              </div>
              <p className="text-[11px] text-zinc-500 mt-1 font-mono">
                Оборудование: {hardwareInvestment.toLocaleString('ru-RU')} ₽
              </p>
            </div>

          </div>

          {/* Action Button: Download Commercial Offer */}
          <button
            onClick={handleDownloadOffer}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF5500] via-[#FF4D00] to-[#E63900] hover:from-[#FF6611] hover:to-[#FF4D00] text-white font-extrabold text-sm uppercase tracking-wider shadow-xl shadow-[#FF4D00]/30 transition-all flex items-center justify-center space-x-3 cursor-pointer transform active:scale-95"
          >
            <Download className="w-5 h-5 text-white animate-bounce" />
            <span>Скачать коммерческое предложение для отеля</span>
          </button>

        </div>

      </div>

      {/* Comparison Table Section */}
      <section className="bg-[#121214] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
          <Award className="w-5 h-5 text-[#FF4D00]" />
          <span>Сравнение: Традиционный ресепшн vs Экосистема InnoCore</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400 uppercase text-[10px]">
                <th className="py-2.5 px-3">Параметр</th>
                <th className="py-2.5 px-3 text-red-400">Классический Ресепшн</th>
                <th className="py-2.5 px-3 text-emerald-400">InnoCore IoT Mesh</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-zinc-300">
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Скорость заселения гостя:</td>
                <td className="py-2.5 px-3 text-zinc-400">10–15 минут (очередь)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">30 секунд (Zero-Frontdesk)</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Передача данных в ФМС МВД:</td>
                <td className="py-2.5 px-3 text-zinc-400">Ручной ввод анкет на бумаге</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Автоматически через ЕСИА</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Ночные заезды (24/7):</td>
                <td className="py-2.5 px-3 text-zinc-400">Нужен ночной администратор</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">100% Автономно по BLE</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-white">Риск потери физических ключей:</td>
                <td className="py-2.5 px-3 text-red-400">Высокий (дубликаты)</td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">Нулевой (крипто-ключи AES-128)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
