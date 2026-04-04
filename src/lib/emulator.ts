import { THEMES } from '@/types';
import { isStateDuplicate } from '@/lib/savestates';
import { stripExt } from '@/lib/utils';

const EMULATOR_DATA_PATH = '/emulatorjs/';
const MAX_SLOTS = 10;
const SLOT_MANIFEST_PREFIX = 'ejs_slots_';
const TS_PREFIX = 'ejs_state_ts_';

declare global {
  interface Window {
    EJS_emulator?: any;
    gameRunning: boolean;
    [key: string]: any;
    saveToBrowserStorage: () => Promise<void>;
    loadFromBrowserStorage: () => Promise<void>;
  }
}

if (typeof window !== 'undefined') window.gameRunning = false;

let autoSaveInterval: ReturnType<typeof setInterval> | null = null;
let currentAutoSaveDelay = 60000;
let eventListenersAdded = false;
let currentGameBaseName = '';

const getEmulator = () => window.EJS_emulator?.started ? window.EJS_emulator : null;
const isEmulatorPaused = () => { const e = getEmulator(); return !e || document.hidden || e.paused === true; };

function toggleMenuElements(show: boolean): void {
  const css = show ? '' : 'display:none!important;visibility:hidden!important';
  document.querySelectorAll<HTMLElement>('aside,footer,main,header,nav').forEach(el => el.style.cssText = css);
}

interface SlotManifest { slots: string[]; nextIndex: number; }

function getManifest(baseName: string): SlotManifest {
  try {
    const raw = localStorage.getItem(SLOT_MANIFEST_PREFIX + baseName);
    if (raw) return JSON.parse(raw);
  } catch { /* noop */ }
  return { slots: [], nextIndex: 0 };
}

function saveManifest(baseName: string, manifest: SlotManifest): void {
  try { localStorage.setItem(SLOT_MANIFEST_PREFIX + baseName, JSON.stringify(manifest)); } catch { /* noop */ }
}

function getNextSlotKey(baseName: string): string {
  const manifest = getManifest(baseName);
  const key = `${baseName}.state${manifest.nextIndex}`;
  const newSlots = [...manifest.slots.filter(s => s !== key), key].slice(-MAX_SLOTS);
  saveManifest(baseName, { slots: newSlots, nextIndex: (manifest.nextIndex + 1) % MAX_SLOTS });
  return key;
}

export function getSlotKeys(baseName: string): string[] {
  return getManifest(baseName).slots;
}

function cleanupGame(): void {
  const gameDiv = document.getElementById('game');
  if (gameDiv) { gameDiv.innerHTML = ''; gameDiv.style.display = 'none'; }
  if (autoSaveInterval) { clearInterval(autoSaveInterval); autoSaveInterval = null; }
  document.querySelectorAll('script[src*="loader.js"]').forEach(s => s.remove());
  toggleMenuElements(true);
  window.gameRunning = false;
  currentGameBaseName = '';
  for (const key of Object.keys(window)) {
    if (key.startsWith('EJS_')) delete window[key];
  }
}

export async function loadGame(
  file: File | string,
  core: string,
  themeName = 'default',
  autoLoad = false,
  autoSave = false,
  autoSaveDelay = 60000,
  gameBaseName?: string,
  specificStateKey?: string
): Promise<void> {
  cleanupGame();
  toggleMenuElements(false);

  let gameDiv = document.getElementById('game');
  if (!gameDiv) { gameDiv = document.createElement('div'); gameDiv.id = 'game'; document.body.appendChild(gameDiv); }
  gameDiv.innerHTML = '';
  document.body.style.overflow = document.documentElement.style.overflow = 'hidden';
  window.gameRunning = true;

  const theme = THEMES[themeName] || THEMES.default;
  gameDiv.style.setProperty('--game-bg', theme.darkBg);
  const gameName = gameBaseName ?? stripExt(file instanceof File ? file.name : (file.split('/').pop() || 'game'));
  currentGameBaseName = gameName;

  Object.assign(window, {
    EJS_color: theme.gradientTo,
    EJS_backgroundColor: theme.darkBg,
    EJS_player: '#game',
    EJS_gameName: gameName,
    EJS_gameUrl: file,
    EJS_core: core,
    EJS_pathtodata: EMULATOR_DATA_PATH,
    EJS_startOnLoaded: true,
    EJS_biosUrl: '',
    EJS_threads: true,
    EJS_language: 'en',
    EJS_defaultOptions: { desmume_advanced_timing: 'disabled', webgl2Enabled: 'enabled' },
    EJS_ready: addEventListeners,
    EJS_onGameStart: () => {
      if (autoLoad) loadState('auto', specificStateKey);
      if (autoSave) startAutoSave(autoSaveDelay);
      const emu = window.EJS_emulator;
      if (emu?.storage?.states) {
        const origPut = emu.storage.states.put.bind(emu.storage.states);
        emu.storage.states.put = async (key: string, data: unknown) => {
          if (typeof key === 'string' && key.endsWith('.state') && currentGameBaseName) {
            const bytes = data instanceof Uint8Array ? data : null;
            if (bytes && await isStateDuplicate(currentGameBaseName, bytes)) return;
            const slotKey = getNextSlotKey(currentGameBaseName);
            try { localStorage.setItem(TS_PREFIX + slotKey, new Date().toISOString()); } catch { /* noop */ }
            return origPut(slotKey, data);
          }
          return origPut(key, data);
        };
      }
    },
    EJS_Buttons: {
      exitEmulation: false, cacheManager: false,
      saveSavFiles: false, loadSavFiles: false,
      saveState: false, loadState: false
    }
  });

  const script = document.createElement('script');
  script.src = `${EMULATOR_DATA_PATH}loader.js`;
  script.onerror = () => console.error('failed to load ejs loader');
  document.body.appendChild(script);
}

function dispatchNotification(type: 'save' | 'load', source: string): void {
  window.dispatchEvent(new CustomEvent('emulator_notification', { detail: { type, source } }));
}

async function saveState(source: 'manual' | 'auto' = 'manual'): Promise<void> {
  const emu = getEmulator();
  if (!emu || isEmulatorPaused()) return;
  try {
    const state = emu.gameManager.getState();
    const slotKey = getNextSlotKey(currentGameBaseName);
    try { localStorage.setItem(TS_PREFIX + slotKey, new Date().toISOString()); } catch { /* noop */ }
    await emu.storage.states.put(slotKey, state);
    dispatchNotification('save', source);
    if (source === 'manual' && autoSaveInterval) startAutoSave();
  } catch (error: any) {
    console.error('save failed:', error);
    emu.displayMessage(`error saving: ${error.message}`);
  }
}

async function loadState(source: 'manual' | 'auto' = 'manual', specificKey?: string): Promise<void> {
  const emu = getEmulator();
  if (!emu) return;
  try {
    const slots = getSlotKeys(currentGameBaseName);
    const key = specificKey ?? (slots.length > 0 ? slots[slots.length - 1] : `${currentGameBaseName}.state`);
    const state = await emu.storage.states.get(key);
    if (!state) return;
    await emu.gameManager.loadState(state);
    dispatchNotification('load', source);
    if (source === 'manual' && autoSaveInterval) startAutoSave();
  } catch (error: any) {
    console.error('load failed:', error);
    emu.displayMessage(`error loading: ${error.message}`);
  }
}

function startAutoSave(interval?: number): void {
  if (interval) currentAutoSaveDelay = Math.max(15000, interval);
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(() => {
    if (window.gameRunning && getEmulator() && !isEmulatorPaused()) saveState('auto');
  }, currentAutoSaveDelay);
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

if (typeof window !== 'undefined') {
  window.saveToBrowserStorage = () => saveState('manual');
  window.loadFromBrowserStorage = () => loadState('manual');
}
