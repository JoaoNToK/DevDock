import { CloudUserData } from '@/types/auth';

const CLOUD_DB_KEY = 'pomodoro_cloud_db_v1';

interface CloudDatabase {
  [userId: string]: CloudUserData;
}

function getCloudDB(): CloudDatabase {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CLOUD_DB_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error('Failed to parse cloud DB:', e);
    return {};
  }
}

function saveCloudDB(db: CloudDatabase) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLOUD_DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error('Failed to save cloud DB:', e);
  }
}

export function fetchUserCloudData(userId: string): CloudUserData | null {
  const db = getCloudDB();
  return db[userId] || null;
}

export function saveUserCloudData(userId: string, data: Partial<CloudUserData>): CloudUserData {
  const db = getCloudDB();
  const existing = db[userId] || {
    settings: { focus: 25, shortBreak: 5, longBreak: 15 },
    sessionRecords: [],
    tasks: [],
    totalFocusMinutes: 0,
    completedSessions: 0,
    dailyGoal: 8,
    volume: 0.8,
    lastSyncedAt: Date.now(),
  };

  const updated: CloudUserData = {
    ...existing,
    ...data,
    lastSyncedAt: Date.now(),
  };

  db[userId] = updated;
  saveCloudDB(db);
  return updated;
}

export function downloadBackupJSON(data: CloudUserData, userName: string) {
  const today = new Date().toISOString().split('T')[0];
  const filename = `pomodoro-backup-${userName.toLowerCase().replace(/\s+/g, '-')}-${today}.json`;
  const jsonStr = JSON.stringify(data, null, 2);

  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackupJSON(fileContent: string): CloudUserData {
  const parsed = JSON.parse(fileContent);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Formato de arquivo JSON inválido');
  }

  return {
    settings: parsed.settings || { focus: 25, shortBreak: 5, longBreak: 15 },
    sessionRecords: Array.isArray(parsed.sessionRecords) ? parsed.sessionRecords : [],
    tasks: Array.isArray(parsed.tasks) ? parsed.tasks : [],
    totalFocusMinutes: Number(parsed.totalFocusMinutes) || 0,
    completedSessions: Number(parsed.completedSessions) || 0,
    dailyGoal: Number(parsed.dailyGoal) || 8,
    volume: Number(parsed.volume) || 0.8,
    lastSyncedAt: Date.now(),
  };
}
