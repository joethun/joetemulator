import { THEMES } from '@/types';
import { isStateDuplicate } from '@/lib/savestates';
import { stripExt } from '@/lib/utils';

const DATA_PATH = '/emulatorjs/';
const MAX_SLOTS = 10;
const SLOT_PREFIX = 'ejs_slots_';
const TS_PREFIX = 'ejs_state_ts_';

declare global {
  interface Window { EJS_emulator?: any; gameRunning: boolean; [key: string]: any; }
}

if (typeof window !== 'undefined') window.gameRunning = false;

let autoSaveInterval: ReturnType<typeof setInterval> | null = null;
let autoSaveDelay = 60000;
let eventListenersAdded = false;
let currentGame = '';

const getEmulator = () => window.EJS_emulator?.started ? window.EJS_emulator : null;
const isPaused = () => { const e = getEmulator(); return !e || document.hidden || e.paused === true; };
const toggleUI = (show: boolean) => {
  const css = show ? '' : 'display:none!important;visibility:hidden!important';
  document.querySelectorAll<HTMLElement>('aside,footer,main,header,nav').forEach(el => el.style.cssText = css);
};
const notify = (type: 'save' | 'load', source: string) =>
  window.dispatchEvent(new CustomEvent('emulator_notification', { detail: { type, source } }));
const stampSlot = (key: string) => {
  try { localStorage.setItem(TS_PREFIX + key, new Date().toISOString()); } catch { /* noop */ }
};

interface SlotManifest { slots: string[]; nextIndex: number; }

function getManifest(name: string): SlotManifest {
  try { const r = localStorage.getItem(SLOT_PREFIX + name); if (r) return JSON.parse(r); } catch { /* noop */ }
  return { slots: [], nextIndex: 0 };
}

function saveManifest(name: string, m: SlotManifest) {
  try { localStorage.setItem(SLOT_PREFIX + name, JSON.stringify(m)); } catch { /* noop */ }
}

function getNextSlotKey(name: string): string {
  const m = getManifest(name);
  const key = `${name}.state${m.nextIndex}`;
  saveManifest(name, { slots: [...m.slots.filter(s => s !== key), key].slice(-MAX_SLOTS), nextIndex: (m.nextIndex + 1) % MAX_SLOTS });
  return key;
}

export const getSlotKeys = (name: string) => getManifest(name).slots;

function cleanupGame(): void {
  const div = document.getElementById('game');
  if (div) { div.innerHTML = ''; div.style.display = 'none'; }
  if (autoSaveInterval) { clearInterval(autoSaveInterval); autoSaveInterval = null; }
  document.querySelectorAll('script[src*="loader.js"]').forEach(s => s.remove());
  toggleUI(true);
  window.gameRunning = false;
  currentGame = '';
  eventListenersAdded = false;
  Object.keys(window).filter(k => k.startsWith('EJS_')).forEach(k => delete window[k]);
}

export async function loadGame(
  file: File | string,
  core: string,
  themeName = 'blue',
  autoLoad = false,
  autoSave = false,
  autoSaveInterval_ms = 60000,
  gameBaseName?: string,
  specificStateKey?: string
): Promise<void> {
  cleanupGame();
  toggleUI(false);

  let gameDiv = document.getElementById('game');
  if (!gameDiv) { gameDiv = document.createElement('div'); gameDiv.id = 'game'; document.body.appendChild(gameDiv); }
  gameDiv.innerHTML = '';
  document.body.style.overflow = document.documentElement.style.overflow = 'hidden';
  window.gameRunning = true;

  const theme = THEMES[themeName] ?? THEMES.blue;
  gameDiv.style.setProperty('--game-bg', theme.darkBg);
  currentGame = gameBaseName ?? stripExt(file instanceof File ? file.name : (file.split('/').pop() || 'game'));

  Object.assign(window, {
    EJS_color: theme.gradientTo,
    EJS_backgroundColor: theme.darkBg,
    EJS_player: '#game',
    EJS_gameName: currentGame,
    EJS_gameUrl: file,
    EJS_core: core,
    EJS_pathtodata: DATA_PATH,
    EJS_startOnLoaded: true,
    EJS_biosUrl: '',
    EJS_threads: true,
    EJS_language: 'en',
    EJS_defaultOptions: { desmume_advanced_timing: 'disabled', webgl2Enabled: 'enabled' },
    EJS_ready: addEventListeners,
    EJS_onGameStart: () => {
      if (autoLoad) loadState('auto', specificStateKey);
      if (autoSave) startAutoSave(autoSaveInterval_ms);
      const emu = window.EJS_emulator;
      if (emu?.storage?.states) {
        const origPut = emu.storage.states.put.bind(emu.storage.states);
        emu.storage.states.put = async (key: string, data: unknown) => {
          if (typeof key === 'string' && key.endsWith('.state') && currentGame) {
            const bytes = data instanceof Uint8Array ? data : null;
            if (bytes && await isStateDuplicate(currentGame, bytes)) return;
            const slotKey = getNextSlotKey(currentGame);
            stampSlot(slotKey);
            return origPut(slotKey, data);
          }
          return origPut(key, data);
        };
      }
    },
    EJS_Buttons: { exitEmulation: false, cacheManager: false, saveSavFiles: false, loadSavFiles: false, saveState: false, loadState: false }
  });

  const script = document.createElement('script');
  script.src = `${DATA_PATH}loader.js`;
  script.onerror = () => console.error('failed to load ejs loader');
  document.body.appendChild(script);
}

async function saveState(source: 'manual' | 'auto' = 'manual'): Promise<void> {
  const emu = getEmulator();
  if (!emu || isPaused()) return;
  try {
    const slotKey = getNextSlotKey(currentGame);
    stampSlot(slotKey);
    await emu.storage.states.put(slotKey, emu.gameManager.getState());
    notify('save', source);
    if (source === 'manual' && autoSaveInterval) startAutoSave();
  } catch (e) {
    console.error('save failed:', e);
    emu.displayMessage(`error saving: ${(e as Error).message}`);
  }
}

async function loadState(source: 'manual' | 'auto' = 'manual', specificKey?: string): Promise<void> {
  const emu = getEmulator();
  if (!emu) return;
  try {
    const slots = getSlotKeys(currentGame);
    const key = specificKey ?? (slots.at(-1) ?? `${currentGame}.state`);
    const state = await emu.storage.states.get(key);
    if (!state) return;
    await emu.gameManager.loadState(state);
    notify('load', source);
    if (source === 'manual' && autoSaveInterval) startAutoSave();
  } catch (e) {
    console.error('load failed:', e);
    emu.displayMessage(`error loading: ${(e as Error).message}`);
  }
}

function startAutoSave(interval?: number): void {
  if (interval) autoSaveDelay = Math.max(15000, interval);
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(() => {
    if (window.gameRunning && !isPaused()) saveState('auto');
  }, autoSaveDelay);
}

function addEventListeners(): void {
  if (eventListenersAdded) return;
  document.addEventListener('keydown', e => {
    if (!window.gameRunning || !getEmulator()) return;
    if (e.key === 'F1') { e.preventDefault(); saveState('manual'); }
    else if (e.key === 'F2') { e.preventDefault(); loadState('manual'); }
  });
  eventListenersAdded = true;
}
