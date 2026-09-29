import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Battery, 
  Lock, 
  Unlock, 
  Flame, 
  Terminal, 
  Search,
  KeyRound,
  Trash2
} from 'lucide-react';
import { 
  getStoredLocks, 
  getStoredLogs, 
  subscribeMeshEvents, 
  publishMeshEvent, 
  type UnitLockState, 
  type MeshEvent 
} from '../lib/meshBus';
import { playLockSound } from '../lib/sound';

export const AdminScreen: React.FC = () => {
  const [locks, setLocks] = useState<UnitLockState[]>([]);
  const [logs, setLogs] = useState<MeshEvent[]>([]);
  const [highlightedUnit, setHighlightedUnit] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'unlocked' | 'occupied' | 'available'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isEmergencyActive, setIsEmergencyActive] = useState(false);

  // Initialize data and subscribe to live BLE Mesh Broadcast events
  useEffect(() => {
    setLocks(getStoredLocks());
    setLogs(getStoredLogs());

    const unsubscribe = subscribeMeshEvents((event, updatedLocks) => {
      setLocks(updatedLocks);
      setLogs(getStoredLogs());

      // Trigger visual highlight ring when a unit state changes
      if (event.unit) {
        setHighlightedUnit(event.unit);
        setTimeout(() => setHighlightedUnit(null), 4000);
      }
    });

    return () => unsubscribe();
  }, []);

  // Manager action to unlock or lock a single unit manually
  const handleToggleLock = (unit: UnitLockState) => {
    const newStatus = unit.status === 'unlocked_by_guest' ? 'occupied_locked' : 'unlocked_by_guest';
    const isUnlocking = newStatus === 'unlocked_by_guest';

    playLockSound(isUnlocking ? 'unlock' : 'lock');

    publishMeshEvent({
      type: isUnlocking ? 'DOOR_UNLOCKED' : 'DOOR_LOCKED',
      unit: unit.name,
      guest: unit.guestName || 'Администратор',
      details: isUnlocking 
        ? `Мастер-разблокировка с B2B пульта управления. Оператор: Ресепшн.`
        : `Дистанционная блокировка замка отельером.`
    });
  };

  // Emergency Fire Master Unlock ("Разблокировать все при пожаре")
  const handleEmergencyUnlock = () => {
    if (window.confirm('ВНИМАНИЕ: Разблокировать ВСЕ замки отеля по пожарной тревоге?')) {
      playLockSound('unlock');
      setIsEmergencyActive(true);

      publishMeshEvent({
        type: 'EMERGENCY_UNLOCK_ALL',
        unit: 'Все юниты (1-12)',
        guest: 'ПОЖАРНАЯ СИГНАЛИЗАЦИЯ',
        details: 'ЭКСТРЕННАЯ РАЗБЛОКИРОВКА ВСЕХ ЗАМКОВ ОТЕЛИ "ЛЕСНОЙ ВОЗДУХ". СИГНАЛ ПОЖАРНОЙ ТРЕВОГИ.'
      });
    }
  };

  const handleClearLogs = () => {
    localStorage.removeItem('innocore_audit_logs');
    setLogs([]);
  };

  // Statistics calculation
  const totalUnits = locks.length;
  const occupiedUnits = locks.filter(l => l.status === 'occupied_locked' || l.status === 'unlocked_by_guest').length;
  const availableUnits = locks.filter(l => l.status === 'available').length;
  const unlockedUnits = locks.filter(l => l.status === 'unlocked_by_guest').length;
  const meshHealth = 100; // Mesh network online

  // Filtered locks for display
  const filteredLocks = locks.filter(lock => {
    const matchesSearch = lock.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (lock.guestName && lock.guestName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (!matchesSearch) return false;

    if (statusFilter === 'unlocked') return lock.status === 'unlocked_by_guest';
    if (statusFilter === 'occupied') return lock.status === 'occupied_locked';
    if (statusFilter === 'available') return lock.status === 'available';
    return true;
  });

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 space-y-6 bg-[#09090B] text-white">
      
      {/* Top Banner / Hotel Header */}
      <header className="bg-[#121214] border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4D00]/5 blur-[120px] pointer-events-none rounded-full" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          
          <div>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-[#FF4D00]/10 border border-[#FF4D00]/30 text-[#FF5500]">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center space-x-2">
                  <span>Отель «Лесной Воздух»</span>
                  <span className="text-xs font-mono text-zinc-500 font-normal">| B2B Control Hub</span>
                </h1>
                <p className="text-xs text-zinc-400 mt-0.5">Единая экосистема управления IoT-замками InnoCore Mesh</p>
              </div>
            </div>
          </div>

          {/* Emergency Fire Master Unlock Button */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleEmergencyUnlock}
              className={`px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-xl flex items-center space-x-2.5 border ${
                isEmergencyActive
                  ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 animate-pulse shadow-red-600/50'
                  : 'bg-red-950/70 hover:bg-red-900 text-red-300 border-red-600/40 hover:border-red-500'
              }`}
            >
              <Flame className="w-4 h-4 text-red-400 animate-bounce" />
              <span>Разблокировать все при пожаре</span>
            </button>
          </div>

        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/5">
          
          <div className="bg-[#18181B] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Всего юнитов</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-white font-mono">{totalUnits}</span>
              <span className="text-xs text-zinc-400">100% фонд</span>
            </div>
          </div>

          <div className="bg-[#18181B] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Занято номеров</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-[#FF5500] font-mono">{occupiedUnits}</span>
              <span className="text-xs text-zinc-400">гостей в отеле</span>
            </div>
          </div>

          <div className="bg-[#18181B] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Доступно / Свободно</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">{availableUnits}</span>
              <span className="text-xs text-zinc-400">готово к брони</span>
            </div>
          </div>

          <div className="bg-[#18181B] p-3.5 rounded-xl border border-white/5">
            <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 block mb-1">Связь BLE Mesh</span>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">{meshHealth}%</span>
              <span className="text-xs text-emerald-500 font-medium flex items-center space-x-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>ONLINE</span>
              </span>
            </div>
          </div>

        </div>
      </header>

      {/* Main Interactive Grid Section */}
      <section className="space-y-4">
        
        {/* Controls and Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#121214] p-3 rounded-2xl border border-white/10">
          
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по номеру домика или имени гостя..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#18181B] border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#FF4D00]"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'all' ? 'bg-[#FF4D00] text-white' : 'bg-[#18181B] text-zinc-400 hover:text-white'
              }`}
            >
              Все (12)
            </button>

            <button
              onClick={() => setStatusFilter('unlocked')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center space-x-1 ${
                statusFilter === 'unlocked' ? 'bg-[#FF4D00] text-white' : 'bg-[#18181B] text-zinc-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-[#FF5500]" />
              <span>Открыто ({unlockedUnits})</span>
            </button>

            <button
              onClick={() => setStatusFilter('occupied')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'occupied' ? 'bg-[#FF4D00] text-white' : 'bg-[#18181B] text-zinc-400 hover:text-white'
              }`}
            >
              Занято ({occupiedUnits - unlockedUnits})
            </button>

            <button
              onClick={() => setStatusFilter('available')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === 'available' ? 'bg-[#FF4D00] text-white' : 'bg-[#18181B] text-zinc-400 hover:text-white'
              }`}
            >
              Свободно ({availableUnits})
            </button>
          </div>

        </div>

        {/* 12 House Lock Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLocks.map((lock) => {
            const isUnlocked = lock.status === 'unlocked_by_guest';
            const isOccupied = lock.status === 'occupied_locked';
            const isHighlighted = highlightedUnit === lock.name;

            return (
              <div
                key={lock.id}
                className={`bg-[#121214] rounded-2xl p-4 border transition-all duration-300 relative overflow-hidden group shadow-lg ${
                  isHighlighted || (isUnlocked && lock.name === 'Домик #4')
                    ? 'border-[#FF4D00] ring-4 ring-[#FF4D00]/30 shadow-2xl shadow-[#FF4D00]/20 scale-[1.02]'
                    : isUnlocked
                    ? 'border-[#FF5500]/60 bg-gradient-to-b from-[#181214] to-[#121214]'
                    : isOccupied
                    ? 'border-white/10 hover:border-white/20'
                    : 'border-emerald-500/20 bg-gradient-to-b from-emerald-950/10 to-[#121214]'
                }`}
              >
                {/* Highlight Glow Effect */}
                {(isHighlighted || isUnlocked) && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#FF4D00]/20 blur-2xl pointer-events-none rounded-full" />
                )}

                {/* Top Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div>
                    <h3 className="text-base font-extrabold text-white flex items-center space-x-2">
                      <span>{lock.name}</span>
                      {lock.name === 'Домик #4' && (
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#FF4D00] text-white font-black">
                          DEMO HERO
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-medium">{lock.type}</p>
                  </div>

                  {/* Lock Status Badge */}
                  <div className={`p-2 rounded-xl border transition-colors ${
                    isUnlocked 
                      ? 'bg-[#FF4D00]/20 border-[#FF4D00] text-[#FF5500] animate-pulse'
                      : isOccupied
                      ? 'bg-zinc-800/80 border-white/10 text-zinc-300'
                      : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  }`}>
                    {isUnlocked ? (
                      <Unlock className="w-5 h-5 text-[#FF5500]" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                </div>

                {/* Status Badge Tag */}
                <div className="my-3">
                  {isUnlocked ? (
                    <div className="flex items-center space-x-1.5 text-xs font-extrabold text-[#FF5500] bg-[#FF4D00]/10 border border-[#FF4D00]/30 px-2.5 py-1 rounded-xl">
                      <span className="w-2 h-2 rounded-full bg-[#FF4D00] animate-ping" />
                      <span>ОТКРЫТ ГОСТЕМ</span>
                    </div>
                  ) : isOccupied ? (
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-zinc-300 bg-zinc-800/50 border border-white/5 px-2.5 py-1 rounded-xl">
                      <span className="w-2 h-2 rounded-full bg-zinc-400" />
                      <span>Занят (Заперт)</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2.5 py-1 rounded-xl">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Свободен (Готов)</span>
                    </div>
                  )}
                </div>

                {/* Guest Info if Occupied */}
                {lock.guestName ? (
                  <div className="bg-[#18181B] p-2.5 rounded-xl border border-white/5 mb-3 text-xs space-y-1">
                    <div className="flex justify-between text-zinc-400">
                      <span>Проживает:</span>
                      <span className="font-semibold text-white">{lock.guestName}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                      <span>ЕСИА ФМС:</span>
                      <span className="text-emerald-400 font-bold">ОК (Верифицирован)</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#18181B]/50 p-2.5 rounded-xl border border-white/5 mb-3 text-xs text-zinc-500 text-center">
                    Нет активного заселения
                  </div>
                )}

                {/* Telemetry (Battery, Signal, Battery Life Estimation) */}
                <div className="grid grid-cols-3 gap-1.5 pt-2 border-t border-white/5 text-[10px] font-mono text-zinc-400">
                  <div className="bg-[#18181B] p-1.5 rounded-lg text-center">
                    <div className="text-zinc-500 text-[9px] uppercase">Заряд</div>
                    <div className="font-bold text-white flex items-center justify-center space-x-0.5 mt-0.5">
                      <Battery className="w-3 h-3 text-emerald-400" />
                      <span>{lock.battery}%</span>
                    </div>
                  </div>

                  <div className="bg-[#18181B] p-1.5 rounded-lg text-center">
                    <div className="text-zinc-500 text-[9px] uppercase">Сигнал</div>
                    <div className="font-bold text-white mt-0.5">
                      {lock.signal} dBm
                    </div>
                  </div>

                  <div className="bg-[#18181B] p-1.5 rounded-lg text-center">
                    <div className="text-zinc-500 text-[9px] uppercase">Ресурс</div>
                    <div className="font-bold text-emerald-400 mt-0.5">
                      ~1.4 года
                    </div>
                  </div>
                </div>

                {/* Quick Toggle Button */}
                <button
                  onClick={() => handleToggleLock(lock)}
                  className={`w-full mt-3 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 border ${
                    isUnlocked
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border-white/10'
                      : 'bg-[#FF4D00]/10 hover:bg-[#FF4D00]/20 text-[#FF5500] border-[#FF4D00]/30'
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isUnlocked ? 'Заблокировать с пульта' : 'Дистанционно открыть'}</span>
                </button>

              </div>
            );
          })}
        </div>

      </section>

      {/* Real-Time Live Audit Log Console (Terminal Style) */}
      <section className="bg-[#000000] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-2xl font-mono text-xs">
        
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#FF4D00]" />
            <span className="font-bold text-white text-sm">LIVE AUDIT LOG • MESH EVENT BUS TERMINAL</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-[10px] text-zinc-500 hidden sm:inline">Broadcasting via BroadcastChannel</span>
            <button
              onClick={handleClearLogs}
              className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Очистить логи"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Terminal Screen Container */}
        <div className="bg-[#09090B] border border-zinc-800 rounded-xl p-3 h-52 overflow-y-auto space-y-1.5 font-mono text-xs selection:bg-[#FF4D00] selection:text-white">
          {logs.length === 0 ? (
            <div className="text-zinc-600 italic">Ожидание событий в BLE Mesh сети...</div>
          ) : (
            logs.map((log) => (
              <div 
                key={log.id} 
                className={`flex flex-col sm:flex-row sm:items-baseline space-y-0.5 sm:space-y-0 sm:space-x-2 py-0.5 border-b border-white/[0.03] ${
                  log.type === 'EMERGENCY_UNLOCK_ALL'
                    ? 'text-red-400 font-bold bg-red-950/30 px-2 py-1 rounded'
                    : log.type === 'DOOR_UNLOCKED'
                    ? 'text-[#FF5500]'
                    : log.type === 'ESIA_VERIFIED'
                    ? 'text-emerald-400'
                    : 'text-zinc-400'
                }`}
              >
                <span className="text-zinc-500 font-semibold shrink-0">[{log.timeFormatted}]</span>
                <span className="font-extrabold text-white shrink-0">{log.unit}:</span>
                <span className="text-zinc-300 shrink-0">[{log.type}]</span>
                <span className="truncate">{log.details || `Гость: ${log.guest}`}</span>
              </div>
            ))
          )}
        </div>

      </section>

    </div>
  );
};
