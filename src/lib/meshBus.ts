// InnoCore BLE Mesh BroadcastChannel & LocalStorage Synchronizer

export interface MeshEvent {
  id: string;
  type: 'DOOR_UNLOCKED' | 'DOOR_LOCKED' | 'EMERGENCY_UNLOCK_ALL' | 'ESIA_VERIFIED';
  unit: string;
  guest: string;
  timestamp: string;
  timeFormatted: string;
  details?: string;
}

export interface UnitLockState {
  id: string;
  name: string;
  type: string;
  status: 'available' | 'occupied_locked' | 'unlocked_by_guest';
  battery: number; // percentage
  signal: number; // dBm
  lastActivity?: string;
  guestName?: string;
}

const BUS_NAME = 'innocore_mesh_bus';
const LOGS_STORAGE_KEY = 'innocore_audit_logs';
const LOCKS_STORAGE_KEY = 'innocore_locks_state_v1';

// Initial default locks state (12 units for Glamping "Красная Поляна Resort" / Hotel "Лесной Воздух")
export const INITIAL_LOCKS: UnitLockState[] = [
  { id: '1', name: 'Домик #1', type: 'A-Frame Standard', status: 'occupied_locked', battery: 96, signal: -45, guestName: 'Алексей М.' },
  { id: '2', name: 'Домик #2', type: 'A-Frame Standard', status: 'available', battery: 88, signal: -52 },
  { id: '3', name: 'Домик #3', type: 'A-Frame Premium', status: 'occupied_locked', battery: 92, signal: -39, guestName: 'Елена П.' },
  { id: '4', name: 'Домик #4', type: 'A-Frame Premium', status: 'occupied_locked', battery: 94, signal: -42, guestName: 'Сергей К.' },
  { id: '5', name: 'Домик #5', type: 'Sphere Suite', status: 'occupied_locked', battery: 89, signal: -58, guestName: 'Дмитрий В.' },
  { id: '6', name: 'Домик #6', type: 'Sphere Suite', status: 'available', battery: 97, signal: -35 },
  { id: '7', name: 'Домик #7', type: 'Cabin Villa', status: 'occupied_locked', battery: 91, signal: -48, guestName: 'Ольга Т.' },
  { id: '8', name: 'Домик #8', type: 'Cabin Villa', status: 'occupied_locked', battery: 85, signal: -61, guestName: 'Игорь С.' },
  { id: '9', name: 'Домик #9', type: 'Treehouse Luxe', status: 'occupied_locked', battery: 93, signal: -40, guestName: 'Анна К.' },
  { id: '10', name: 'Домик #10', type: 'Treehouse Luxe', status: 'occupied_locked', battery: 90, signal: -44, guestName: 'Максим Р.' },
  { id: '11', name: 'Домик #11', type: 'Panorama Lodge', status: 'occupied_locked', battery: 95, signal: -38, guestName: 'Виктор Н.' },
  { id: '12', name: 'Домик #12', type: 'Panorama Lodge', status: 'available', battery: 99, signal: -32 },
];

let channel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    channel = new BroadcastChannel(BUS_NAME);
  } catch (e) {
    console.warn('BroadcastChannel not available:', e);
  }
}

// Initial logs seed
const INITIAL_LOGS: MeshEvent[] = [
  {
    id: 'init-1',
    type: 'ESIA_VERIFIED',
    unit: 'Домик #4',
    guest: 'Сергей К.',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    timeFormatted: new Date(Date.now() - 120000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    details: 'Синхронизация ключа ЕСИА подтверждена. Данные переданы в систему ФМС.'
  },
  {
    id: 'init-2',
    type: 'DOOR_LOCKED',
    unit: 'Домик #4',
    guest: 'Система',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    timeFormatted: new Date(Date.now() - 3600000).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    details: 'Автоблокировка ригелей замка. BLE Mesh статус: ONLINE'
  }
];

export function getStoredLogs(): MeshEvent[] {
  if (typeof window === 'undefined') return INITIAL_LOGS;
  try {
    const data = localStorage.getItem(LOGS_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_LOGS;
  } catch (e) {
    return INITIAL_LOGS;
  }
}

export function getStoredLocks(): UnitLockState[] {
  if (typeof window === 'undefined') return INITIAL_LOCKS;
  try {
    const data = localStorage.getItem(LOCKS_STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_LOCKS;
  } catch (e) {
    return INITIAL_LOCKS;
  }
}

export function saveLocksState(locks: UnitLockState[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCKS_STORAGE_KEY, JSON.stringify(locks));
  } catch (e) {
    console.error(e);
  }
}

export function publishMeshEvent(eventData: Omit<MeshEvent, 'id' | 'timestamp' | 'timeFormatted'>): MeshEvent {
  const now = new Date();
  const fullEvent: MeshEvent = {
    ...eventData,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: now.toISOString(),
    timeFormatted: now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };

  // 1. Update stored logs
  const logs = getStoredLogs();
  const updatedLogs = [fullEvent, ...logs].slice(0, 100);
  try {
    localStorage.setItem(LOGS_STORAGE_KEY, JSON.stringify(updatedLogs));
  } catch (e) {
    console.error(e);
  }

  // 2. Update stored lock states if DOOR_UNLOCKED or DOOR_LOCKED or EMERGENCY
  const locks = getStoredLocks();
  const updatedLocks = locks.map(lock => {
    if (eventData.type === 'EMERGENCY_UNLOCK_ALL') {
      return { ...lock, status: 'unlocked_by_guest' as const, lastActivity: fullEvent.timeFormatted };
    }
    if (lock.name === eventData.unit) {
      if (eventData.type === 'DOOR_UNLOCKED') {
        return { ...lock, status: 'unlocked_by_guest' as const, lastActivity: fullEvent.timeFormatted };
      }
      if (eventData.type === 'DOOR_LOCKED') {
        return { ...lock, status: 'occupied_locked' as const, lastActivity: fullEvent.timeFormatted };
      }
    }
    return lock;
  });
  saveLocksState(updatedLocks);

  // 3. Post to BroadcastChannel
  if (channel) {
    channel.postMessage({ type: 'MESH_EVENT', event: fullEvent, locks: updatedLocks });
  }

  // 4. Dispatch local DOM event for instant single-window state updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('innocore_local_event', { detail: { event: fullEvent, locks: updatedLocks } }));
  }

  return fullEvent;
}

export function subscribeMeshEvents(callback: (event: MeshEvent, locks: UnitLockState[]) => void) {
  if (typeof window === 'undefined') return () => {};

  const handleMessage = (e: MessageEvent) => {
    if (e.data && e.data.type === 'MESH_EVENT') {
      callback(e.data.event, e.data.locks);
    }
  };

  const handleLocal = (e: Event) => {
    const customEv = e as CustomEvent;
    if (customEv.detail) {
      callback(customEv.detail.event, customEv.detail.locks);
    }
  };

  const handleStorage = (e: StorageEvent) => {
    if (e.key === LOGS_STORAGE_KEY || e.key === LOCKS_STORAGE_KEY) {
      const logs = getStoredLogs();
      const locks = getStoredLocks();
      if (logs.length > 0) {
        callback(logs[0], locks);
      }
    }
  };

  if (channel) {
    channel.addEventListener('message', handleMessage);
  }
  window.addEventListener('innocore_local_event', handleLocal);
  window.addEventListener('storage', handleStorage);

  return () => {
    if (channel) {
      channel.removeEventListener('message', handleMessage);
    }
    window.removeEventListener('innocore_local_event', handleLocal);
    window.removeEventListener('storage', handleStorage);
  };
}
