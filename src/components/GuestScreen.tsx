import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  Wifi, 
  Battery, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  Smartphone, 
  KeyRound, 
  Calendar, 
  MapPin, 
  ChevronDown, 
  ChevronUp, 
  RefreshCw,
  Server,
  QrCode,
  X,
  Camera
} from 'lucide-react';
import { playLockSound } from '../lib/sound';
import { publishMeshEvent, getStoredLocks } from '../lib/meshBus';

export const GuestScreen: React.FC = () => {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState('Нажмите для открывания');
  const [countdown, setCountdown] = useState(30);
  const [esiaExpanded, setEsiaExpanded] = useState(false);
  const [lockBattery, setLockBattery] = useState(94);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrScanningState, setQrScanningState] = useState<'scanning' | 'success'>('scanning');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Sync state with lock #4 if modified remotely
  useEffect(() => {
    const locks = getStoredLocks();
    const unit4 = locks.find(l => l.name === 'Домик #4');
    if (unit4) {
      setLockBattery(unit4.battery);
      if (unit4.status === 'unlocked_by_guest' && !isUnlocked) {
        setIsUnlocked(true);
      } else if (unit4.status === 'occupied_locked' && isUnlocked) {
        setIsUnlocked(false);
      }
    }
  }, []);

  // Handle autolock timer
  useEffect(() => {
    if (isUnlocked) {
      setCountdown(30);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            handleRelock(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isUnlocked]);

  const handleUnlockTap = () => {
    if (isProcessing) return;

    if (isUnlocked) {
      handleRelock(false);
      return;
    }

    setIsProcessing(true);
    setStatusText('Поиск BLE-метки... Проверка крипто-ключа AES-128...');

    setTimeout(() => {
      playLockSound('unlock');

      setIsUnlocked(true);
      setIsProcessing(false);
      setStatusText('ЗАМОК ОТКРЫТ • ДОБРО ПОЖАЛОВАТЬ');

      publishMeshEvent({
        type: 'DOOR_UNLOCKED',
        unit: 'Домик #4',
        guest: 'Сергей К.',
        details: 'УСПЕШНОЕ ОТКРЫТИЕ ПО BLE. Гость: С. Котухов. Пакет ФМС передан.'
      });
    }, 450);
  };

  const handleRelock = (isAuto = false) => {
    playLockSound('lock');
    setIsUnlocked(false);
    setIsProcessing(false);
    setStatusText('Нажмите для открывания');

    publishMeshEvent({
      type: 'DOOR_LOCKED',
      unit: 'Домик #4',
      guest: isAuto ? 'Автосистема' : 'Сергей К.',
      details: isAuto ? 'Автоблокировка по таймеру (30 сек)' : 'Ручная защелка замка гостем'
    });
  };

  // QR Code Scanner Simulation trigger
  const handleOpenQrScanner = () => {
    setIsQrScannerOpen(true);
    setQrScanningState('scanning');

    setTimeout(() => {
      setQrScanningState('success');
      playLockSound('unlock');
    }, 1800);
  };

  const handleConfirmQrUnlock = () => {
    setIsQrScannerOpen(false);
    handleUnlockTap();
  };

  return (
    <div className="w-full max-w-[430px] mx-auto min-h-[90vh] bg-[#09090B] text-white flex flex-col justify-between p-4 pb-8 shadow-2xl relative border border-white/10 rounded-3xl select-none my-2">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-36 bg-[#FF4D00]/10 blur-[90px] pointer-events-none rounded-full" />

      {/* Header */}
      <header className="flex items-center justify-between pt-2 pb-4 border-b border-white/10 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-xl tracking-wider text-white">INNO<span className="text-[#FF4D00]">CORE</span></span>
            <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-[#FF4D00]/20 text-[#FF5500] border border-[#FF4D00]/30">
              IoT Mesh
            </span>
          </div>
          <p className="text-xs text-zinc-500 font-medium mt-0.5">Бесконтактный доступ v2.4</p>
        </div>

        <div className="flex flex-col items-end space-y-1">
          {/* BLE Mesh Status Badge */}
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            <span>BLE Mesh: В сети</span>
          </div>

          {/* Batteries Telemetry */}
          <div className="flex items-center space-x-3 text-[11px] text-zinc-400 font-mono">
            <span className="flex items-center space-x-1">
              <Smartphone className="w-3 h-3 text-zinc-400" />
              <span>98%</span>
            </span>
            <span className="flex items-center space-x-1">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>Замок: {lockBattery}%</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="flex-1 my-4 space-y-4 relative z-10">
        
        {/* Active Booking Card */}
        <section className="bg-[#121214] border border-white/10 rounded-2xl p-4 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-[#FF4D00]/10 border border-[#FF4D00]/20 text-[#FF5500]">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-tight">Глэмпинг «Красная Поляна Resort»</h2>
                <p className="text-xs text-zinc-400">Сочи, ул. Заповедная 44</p>
              </div>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Подтверждено
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3 pt-1">
            <div className="bg-[#18181B] p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Локация</span>
              <div className="flex items-center space-x-1.5 text-white font-semibold text-sm">
                <span className="text-[#FF4D00]">Домик #4</span>
                <span className="text-xs text-zinc-400 font-normal">(A-Frame)</span>
              </div>
            </div>

            <div className="bg-[#18181B] p-2.5 rounded-xl border border-white/5">
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">Даты проживания</span>
              <div className="flex items-center space-x-1.5 text-white font-medium text-xs">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>29–30 сентября</span>
              </div>
            </div>
          </div>
        </section>

        {/* QR Code Quick Scan Button */}
        <button
          onClick={handleOpenQrScanner}
          className="w-full bg-[#121214] hover:bg-[#18181B] border border-white/10 hover:border-[#FF4D00]/50 py-3 px-4 rounded-2xl flex items-center justify-between text-xs font-bold transition-all shadow-md group cursor-pointer"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-[#FF4D00]/10 border border-[#FF4D00]/30 text-[#FF5500] group-hover:scale-110 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-white font-extrabold flex items-center space-x-1.5">
                <span>Сканировать QR-код на замке</span>
                <span className="text-[9px] bg-[#FF4D00] text-white px-1.5 py-0.2 rounded font-mono uppercase">быстрый вход</span>
              </div>
              <p className="text-[11px] text-zinc-400 font-normal">Приложите камеру к шильду домика</p>
            </div>
          </div>
          <Camera className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
        </button>

        {/* Zero-Frontdesk Verification Module */}
        <section className="bg-[#121214] border border-white/10 rounded-2xl p-3.5 transition-all">
          <div 
            onClick={() => setEsiaExpanded(!esiaExpanded)}
            className="flex items-center justify-between cursor-pointer group select-none"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
                <ShieldCheck className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xs font-bold text-white">Верификация через Госуслуги (ЕСИА)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-emerald-400 font-medium flex items-center space-x-1 mt-0.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 inline shrink-0" />
                  <span>Личность подтверждена. Анкета МВД отправлена.</span>
                </p>
              </div>
            </div>
            <button className="text-zinc-500 group-hover:text-zinc-300 p-1">
              {esiaExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {esiaExpanded && (
            <div className="mt-3 pt-3 border-t border-white/10 space-y-2 text-xs text-zinc-300 bg-[#09090B] p-3 rounded-xl border border-white/5 font-mono">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500">ГОСТЬ:</span>
                <span className="font-semibold text-white">Котухов Сергей Сергеевич</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500">ПАСПОРТ РФ:</span>
                <span className="text-zinc-300">4518 ••••••</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500">СТАТУС ФМС МВД:</span>
                <span className="text-emerald-400 font-bold">ОТПРАВЛЕНО (ПАКЕТ #9842)</span>
              </div>
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-500">КРИПТО-ТОКЕН:</span>
                <span className="text-zinc-400 text-[10px] truncate max-w-[150px]">AES128-e4b98c7d</span>
              </div>
            </div>
          )}
        </section>

        {/* HERO ACTION BUTTON & SMART LOCK CONTROL */}
        <section className="flex flex-col items-center justify-center pt-2">
          
          {/* Status Subtitle */}
          <div className="mb-4 text-center">
            <p className={`text-xs font-semibold uppercase tracking-widest transition-colors ${
              isUnlocked ? 'text-emerald-400' : isProcessing ? 'text-[#FF4D00] animate-pulse' : 'text-zinc-400'
            }`}>
              {statusText}
            </p>
            {isUnlocked && (
              <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                Крипто-ключ валидирован • Датчик ригеля: ОТКРЫТО
              </p>
            )}
          </div>

          {/* Massive Orange High-Contrast Button (#FF4D00) */}
          <div className="relative group">
            
            {/* Outer Glow Ring */}
            <div className={`absolute -inset-4 rounded-full transition-all duration-500 blur-xl ${
              isUnlocked 
                ? 'bg-emerald-500/30' 
                : isProcessing 
                ? 'bg-[#FF4D00]/60 animate-ping opacity-75' 
                : 'bg-[#FF4D00]/30 group-hover:bg-[#FF4D00]/50'
            }`} />

            <button
              onClick={handleUnlockTap}
              disabled={isProcessing}
              className={`relative w-56 h-56 rounded-full flex flex-col items-center justify-center transition-all duration-300 transform active:scale-95 shadow-2xl border-4 ${
                isUnlocked
                  ? 'bg-gradient-to-b from-emerald-600 to-emerald-800 border-emerald-400 text-white shadow-emerald-500/40'
                  : isProcessing
                  ? 'bg-gradient-to-b from-[#FF5500] to-[#CC3D00] border-[#FF4D00] text-white animate-pulse'
                  : 'bg-gradient-to-b from-[#FF5500] via-[#FF4D00] to-[#D93D00] hover:from-[#FF6611] hover:to-[#E64400] border-[#FF8844] text-white shadow-[#FF4D00]/50 cursor-pointer'
              }`}
            >
              {/* Button Inner Content */}
              <div className="flex flex-col items-center justify-center p-4 text-center">
                {isProcessing ? (
                  <RefreshCw className="w-16 h-16 animate-spin mb-3 text-white" />
                ) : isUnlocked ? (
                  <Unlock className="w-16 h-16 mb-2 text-white animate-bounce" />
                ) : (
                  <KeyRound className="w-16 h-16 mb-2 text-white group-hover:rotate-12 transition-transform duration-300" />
                )}

                <span className="text-base font-black tracking-wider uppercase leading-tight max-w-[140px] drop-shadow-md">
                  {isProcessing ? 'ШИФРОВАНИЕ...' : isUnlocked ? 'ЗАМОК ОТКРЫТ' : 'ОТКРЫТЬ ДОМИК #4'}
                </span>

                <span className="text-[10px] opacity-80 uppercase tracking-widest mt-1 font-mono">
                  {isUnlocked ? 'ТАПНИТЕ ЧТОБЫ ЗАКРЫТЬ' : 'BLE MESH SENSORS'}
                </span>
              </div>
            </button>
          </div>

          {/* Autolock Countdown Bar & Override Button */}
          {isUnlocked && (
            <div className="w-full mt-6 bg-[#121214] border border-emerald-500/30 rounded-2xl p-4 animate-fade-in shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-zinc-300 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Автоблокировка через:</span>
                </span>
                <span className="text-sm font-extrabold text-emerald-400 font-mono">
                  {countdown} сек
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear rounded-full"
                  style={{ width: `${(countdown / 30) * 100}%` }}
                />
              </div>

              <button
                onClick={() => handleRelock(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-bold text-zinc-200 transition-colors flex items-center justify-center space-x-2"
              >
                <Lock className="w-3.5 h-3.5 text-[#FF4D00]" />
                <span>Запереть замок вручную</span>
              </button>
            </div>
          )}

        </section>

      </main>

      {/* QR Code Scanner Camera Viewfinder Overlay Modal */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-6 animate-fade-in">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-[#FF4D00]" />
              <span className="font-bold text-white text-sm">Сканер QR-кода InnoCore</span>
            </div>
            <button 
              onClick={() => setIsQrScannerOpen(false)}
              className="p-2 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Camera Viewfinder View */}
          <div className="flex-1 flex flex-col items-center justify-center relative my-8">
            <div className="w-64 h-64 border-2 border-[#FF4D00] rounded-3xl relative overflow-hidden bg-zinc-900/80 flex items-center justify-center shadow-2xl shadow-[#FF4D00]/40">
              
              {/* Corner Targets */}
              <div className="absolute top-2 left-2 w-6 h-6 border-t-4 border-l-4 border-[#FF4D00]" />
              <div className="absolute top-2 right-2 w-6 h-6 border-t-4 border-r-4 border-[#FF4D00]" />
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b-4 border-l-4 border-[#FF4D00]" />
              <div className="absolute bottom-2 right-2 w-6 h-6 border-b-4 border-r-4 border-[#FF4D00]" />

              {qrScanningState === 'scanning' ? (
                <>
                  {/* Laser Line */}
                  <div className="w-full h-1 bg-[#FF4D00] shadow-[0_0_15px_#FF4D00] animate-bounce" />
                  <p className="absolute bottom-4 text-[11px] text-zinc-400 font-mono animate-pulse">
                    Наведите на QR замка...
                  </p>
                </>
              ) : (
                <div className="flex flex-col items-center text-center p-4">
                  <CheckCircle2 className="w-14 h-14 text-emerald-400 animate-bounce mb-2" />
                  <span className="text-sm font-extrabold text-white">ДОМИК #4 НАЙДЕН</span>
                  <span className="text-[10px] text-zinc-400 font-mono mt-1">ID: INNOCORE-UNIT-04-BLE</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer controls in scanner modal */}
          <div>
            {qrScanningState === 'success' ? (
              <button
                onClick={handleConfirmQrUnlock}
                className="w-full py-3.5 rounded-2xl bg-[#FF4D00] hover:bg-[#FF6611] text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-[#FF4D00]/50"
              >
                Открыть Домик #4
              </button>
            ) : (
              <p className="text-center text-xs text-zinc-500 font-mono">
                Сканирование дверной накладки / QR шильда
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <footer className="pt-3 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500 font-mono relative z-10">
        <div className="flex items-center space-x-1">
          <Server className="w-3 h-3 text-zinc-600" />
          <span>Nodes: 12 Active</span>
        </div>
        <div>AES-128 Crypto Hardware</div>
        <div className="text-emerald-500">Mesh Sync: OK</div>
      </footer>
    </div>
  );
};
