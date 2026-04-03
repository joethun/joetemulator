import { THEMES } from '@/types';

const EMULATOR_DATA_PATH = "/emulatorjs/";
const CORES_WITH_THREADS = new Set(['psp', 'dosbox_pure']);

declare global {
  interface Window {
    EJS_emulator?: any;
    gameRunning: boolean;
    [key: string]: any;
    saveToBrowserStorage: () => Promise<void>;
    loadFromBrowserStorage: () => Promise<void>;
  }
}

if (typeof window !== 'undefined') {
  window.gameRunning = false;
}

let autoSaveInterval: ReturnType<typeof setInterval> | null = null;
let currentAutoSaveDelay = 60000;
let eventListenersAdded = false;

const getEmulator = () => window.EJS_emulator?.started ? window.EJS_emulator : null;

const isEmulatorPaused = (): boolean => {
  const emu = getEmulator();
  return !emu || document.hidden || emu.paused === true;
};

function toggleMenuElements(show: boolean): void {
  const css = show ? '' : 'display:none!important;visibility:hidden!important';
  document.querySelectorAll<HTMLElement>('aside,footer,main,header,nav')
    .forEach(el => el.style.cssText = css);
}

function extractGameName(file: File | string): string {
  const name = file instanceof File ? file.name : file.split('/').pop() || 'game';
  return name.includes('.') ? name.slice(0, name.lastIndexOf('.')) : name;
}

function cleanupGame(): void {
  const gameDiv = document.getElementById("game");
  if (gameDiv) {
    gameDiv.innerHTML = "";
    gameDiv.style.display = "none";
  }

  if (autoSaveInterval) {
    clearInterval(autoSaveInterval);
    autoSaveInterval = null;
  }

  document.querySelectorAll('script[src*="loader.js"]').forEach(s => s.remove());
  toggleMenuElements(true);
  window.gameRunning = false;

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
  autoSaveDelay = 60000
): Promise<void> {
  cleanupGame();
  toggleMenuElements(false);

  let gameDiv = document.getElementById("game");
  if (!gameDiv) {
    gameDiv = document.createElement("div");
    gameDiv.id = "game";
    document.body.appendChild(gameDiv);
  }
  gameDiv.innerHTML = "";
  document.body.style.overflow = document.documentElement.style.overflow = "hidden";
  window.gameRunning = true;

  const theme = THEMES[themeName] || THEMES.default;

  Object.assign(window, {
    EJS_color: theme.gradientTo,
    EJS_backgroundColor: theme.darkBg,
    EJS_player: "#game",
    EJS_gameName: extractGameName(file),
    EJS_gameUrl: file,
    EJS_core: core,
    EJS_pathtodata: EMULATOR_DATA_PATH,
    EJS_startOnLoaded: true,
    EJS_biosUrl: '',
    EJS_threads: CORES_WITH_THREADS.has(core),
    EJS_language: "en",
    EJS_defaultOptions: {
      desmume_advanced_timing: "disabled",
      webgl2Enabled: "enabled"
    },
    EJS_ready: addEventListeners,
    EJS_onGameStart: () => {
      if (autoLoad) loadState('auto');
      if (autoSave) startAutoSave(autoSaveDelay);
    },
    EJS_Buttons: {
      exitEmulation: false,
      cacheManager: false,
      saveSavFiles: false,
      loadSavFiles: false
    }
  });

  const script = document.createElement("script");
  script.src = `${EMULATOR_DATA_PATH}loader.js`;
  script.onerror = () => console.error("failed to load ejs loader");
  document.body.appendChild(script);
}

function dispatchNotification(type: 'save' | 'load', source: string): void {
  window.dispatchEvent(new CustomEvent('emulator_notification', {
    detail: { type, source }
  }));
}

async function saveState(source: 'manual' | 'auto' = 'manual'): Promise<void> {
  const emu = getEmulator();
  if (!emu || isEmulatorPaused()) return;

  try {
    const state = emu.gameManager.getState();
    await emu.storage.states.put(`${emu.getBaseFileName()}.state`, state);
    dispatchNotification('save', source);
    if (source === 'manual' && autoSaveInterval) startAutoSave();
  } catch (error: any) {
    console.error("save failed:", error);
    emu.displayMessage(`error saving: ${error.message}`);
  }
}

async function loadState(source: 'manual' | 'auto' = 'manual'): Promise<void> {
  const emu = getEmulator();
  if (!emu) return;

  try {
    const state = await emu.storage.states.get(`${emu.getBaseFileName()}.state`);
    if (!state) return;

    await emu.gameManager.loadState(state);
    dispatchNotification('load', source);
    if (source === 'manual' && autoSaveInterval) startAutoSave();
  } catch (error: any) {
    console.error("load failed:", error);
    emu.displayMessage(`error loading: ${error.message}`);
  }
}

function startAutoSave(interval?: number): void {
  if (interval) currentAutoSaveDelay = Math.max(15000, interval);
  if (autoSaveInterval) clearInterval(autoSaveInterval);

  autoSaveInterval = setInterval(() => {
    if (window.gameRunning && getEmulator() && !isEmulatorPaused()) {
      saveState('auto');
    }
  }, currentAutoSaveDelay);
}

function addEventListeners(): void {
  if (eventListenersAdded) return;

  document.addEventListener("keydown", e => {
    if (!window.gameRunning || !getEmulator()) return;

    if (e.key === 'F1') {
      e.preventDefault();
      saveState('manual');
    } else if (e.key === 'F2') {
      e.preventDefault();
      loadState('manual');
    }
  });

  eventListenersAdded = true;
}

if (typeof window !== 'undefined') {
  window.saveToBrowserStorage = () => saveState('manual');
  window.loadFromBrowserStorage = () => loadState('manual');
}