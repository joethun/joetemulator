import { THEMES } from '@/types';

const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
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

if (typeof window !== 'undefined') window.gameRunning = false;

let autoSaveInterval: ReturnType<typeof setInterval> | null = null;
let currentAutoSaveDelay = 60000;
let eventListenersAdded = false;

const getEmulator = () => window.EJS_emulator?.started ? window.EJS_emulator : null;

function toggleMenuElements(show: boolean) {
  const css = show ? '' : 'display:none!important;visibility:hidden!important';
  document.querySelectorAll<HTMLElement>('aside,footer,main,header,nav').forEach(el => el.style.cssText = css);
  const root = document.querySelector<HTMLElement>('div[style*="min-h-screen"]');
  if (root) root.style.zIndex = show ? 'auto' : '-1';
}

export function cleanupGame() {
  const gameDiv = document.getElementById("game");
  if (gameDiv) { gameDiv.innerHTML = ""; gameDiv.style.display = "none"; }

  if (autoSaveInterval) { clearInterval(autoSaveInterval); autoSaveInterval = null; }

  document.querySelectorAll('script[src*="loader.js"]').forEach(s => s.remove());
  toggleMenuElements(true);
  window.gameRunning = false;

  Object.keys(window).filter(k => k.startsWith('EJS_')).forEach(k => delete window[k]);
}

export async function loadGame(
  file: File | string,
  core: string,
  themeName = 'default',
  autoLoad = false,
  autoSave = false,
  autoSaveDelay = 60000
) {
  cleanupGame();
  toggleMenuElements(false);

  // setup game container
  let gameDiv = document.getElementById("game");
  if (!gameDiv) {
    gameDiv = document.createElement("div");
    gameDiv.id = "game";
    document.body.appendChild(gameDiv);
  }
  gameDiv.innerHTML = "";
  document.body.style.overflow = document.documentElement.style.overflow = "hidden";
  window.gameRunning = true;

  // parse game name from file
  const fileName = file instanceof File ? file.name : (file as string).split('/').pop() || 'game';
  const gameName = fileName.includes('.') ? fileName.slice(0, fileName.lastIndexOf('.')) : fileName;

  const theme = THEMES[themeName] || THEMES.default;

  Object.assign(window, {
    EJS_color: theme.gradientTo,
    EJS_backgroundColor: theme.darkBg,
    EJS_player: "#game",
    EJS_gameName: gameName,
    EJS_gameUrl: file,
    EJS_core: core,
    EJS_pathtodata: CDN_PATH,
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
    EJS_Buttons: { exitEmulation: false, cacheManager: false, saveSavFiles: { visible: false }, loadSavFiles: { visible: false } }
  });

  // load emulator script
  const script = document.createElement("script");
  script.src = `${CDN_PATH}/loader.js`;
  script.onerror = () => console.error("failed to load ejs loader");
  document.body.appendChild(script);
}

async function saveState(source: 'manual' | 'auto' = 'manual') {
  const emu = getEmulator();
  if (!emu) return;
  try {
    const state = emu.gameManager.getState();
    await emu.storage.states.put(`${emu.getBaseFileName()}.state`, state);
    window.dispatchEvent(new CustomEvent('emulator_notification', { detail: { type: 'save', source } }));
    if (source === 'manual' && autoSaveInterval) startAutoSave();
  } catch (e: any) {
    console.error("save failed:", e);
    emu.displayMessage(`error saving: ${e.message}`);
  }
}

async function loadState(source: 'manual' | 'auto' = 'manual') {
  const emu = getEmulator();
  if (!emu) return;
  try {
    const state = await emu.storage.states.get(`${emu.getBaseFileName()}.state`);
    if (!state) return;
    await emu.gameManager.loadState(state);
    window.dispatchEvent(new CustomEvent('emulator_notification', { detail: { type: 'load', source } }));
    if (source === 'manual' && autoSaveInterval) startAutoSave();
  } catch (e: any) {
    console.error("load failed:", e);
    emu.displayMessage(`error loading: ${e.message}`);
  }
}

function startAutoSave(interval?: number) {
  if (interval) currentAutoSaveDelay = Math.max(15000, interval);
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  autoSaveInterval = setInterval(() => {
    if (window.gameRunning && getEmulator()) saveState('auto');
  }, currentAutoSaveDelay);
}

function addEventListeners() {
  if (eventListenersAdded || typeof document === 'undefined') return;
  document.addEventListener("keydown", e => {
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