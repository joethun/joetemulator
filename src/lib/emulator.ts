import { FILE_EXTENSIONS } from './constants';
import { THEMES } from '@/types';

const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
const CORES_WITH_THREADS = new Set(['psp', 'dosbox_pure']);

const EJS_CORE_TO_RETROARCH: Record<string, string> = {
  segaGG: 'genesis_plus_gx',
  nds: 'desmume'
};

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

let autoSaveInterval: NodeJS.Timeout | null = null;

function detectCore(extension: string): string {
  return FILE_EXTENSIONS[extension] || "nes";
}

function toggleMenuElements(show: boolean): void {
  if (typeof document === 'undefined') return;
  const displayVal = show ? '' : 'display: none !important; visibility: hidden !important;';
  const root = document.querySelector('div[style*="min-h-screen"]') as HTMLElement;

  if (root) root.style.zIndex = show ? 'auto' : '-1';

  // hide ui elements when game is running
  const elements = document.querySelectorAll('aside, footer, main, header, nav');
  elements.forEach(el => {
    if (el instanceof HTMLElement) el.style.cssText = displayVal;
  });
}

function setupGameDisplay(): void {
  if (typeof document === 'undefined') return;
  let gameDiv = document.getElementById("game");

  if (!gameDiv) {
    gameDiv = document.createElement("div");
    gameDiv.id = "game";
    document.body.appendChild(gameDiv);
  }

  gameDiv.innerHTML = "";
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

export function cleanupGame(): void {
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

  // cleanup global emulator variables
  for (const key in window) {
    if (key.startsWith('EJS_')) delete window[key];
  }
}

function configureEmulator(
  gameName: string,
  gameFile: File | string,
  core: string,
  themeName: string,
  autoLoad: boolean,
  autoSave: boolean,
  autoSaveDelay: number
): void {
  const retroarchCore = EJS_CORE_TO_RETROARCH[core];
  const theme = THEMES[themeName] || THEMES.default;

  // setup emulator configuration
  Object.assign(window, {
    EJS_color: theme.gradientTo,
    EJS_backgroundColor: theme.darkBg,
    EJS_player: "#game",
    EJS_gameName: gameName,
    EJS_gameUrl: gameFile,
    EJS_core: core,
    EJS_pathtodata: CDN_PATH,
    EJS_startOnLoaded: true,
    EJS_biosUrl: '',
    EJS_threads: CORES_WITH_THREADS.has(core),
    EJS_language: "en",
    EJS_defaultOptions: {
      "desmume_advanced_timing": "disabled",
      "webgl2Enabled": "enabled",
      ...(retroarchCore && { retroarch_core: retroarchCore })
    },
    EJS_ready: () => addEventListeners(),
    EJS_onGameStart: () => {
      if (autoLoad) loadState('auto');
      if (autoSave) startAutoSave(autoSaveDelay);
    },
    EJS_Buttons: {
      exitEmulation: false,
      cacheManager: false,
      saveSavFiles: { visible: false },
      loadSavFiles: { visible: false }
    }
  });
}

function loadEmulatorScript(): void {
  if (typeof document === 'undefined') return;
  const script = document.createElement("script");
  script.src = `${CDN_PATH}/loader.js`;
  script.onerror = () => console.error("failed to load ejs loader");
  document.body.appendChild(script);
}

export async function loadGame(
  file: File | string,
  coreOverride?: string,
  themeName: string = 'default',
  autoLoad: boolean = false,
  autoSave: boolean = false,
  autoSaveDelay: number = 60000
): Promise<void> {
  const fileName = file instanceof File ? file.name : (file as string).split('/').pop() || 'game';
  const lastDotIndex = fileName.lastIndexOf('.');
  const fileExtension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex + 1).toLowerCase() : '';
  const gameName = lastDotIndex !== -1 ? fileName.slice(0, lastDotIndex) : fileName;
  const core = coreOverride || detectCore(fileExtension);

  cleanupGame();
  toggleMenuElements(false);
  setupGameDisplay();
  window.gameRunning = true;

  configureEmulator(gameName, file, core, themeName, autoLoad, autoSave, autoSaveDelay);
  loadEmulatorScript();
}

function getEmulator(): any | null {
  return window.EJS_emulator?.started ? window.EJS_emulator : null;
}

async function saveState(source: 'manual' | 'auto' = 'manual'): Promise<void> {
  const emulator = getEmulator();
  if (!emulator) return;
  try {
    const state = emulator.gameManager.getState();
    await emulator.storage.states.put(`${emulator.getBaseFileName()}.state`, state);
    window.dispatchEvent(new CustomEvent('emulator_notification', { detail: { type: 'save', source } }));
  } catch (error: any) {
    console.error("save failed:", error);
    emulator.displayMessage(`error saving: ${error.message}`);
  }
}

async function loadState(source: 'manual' | 'auto' = 'manual'): Promise<void> {
  const emulator = getEmulator();
  if (!emulator) return;
  try {
    const state = await emulator.storage.states.get(`${emulator.getBaseFileName()}.state`);
    if (state) {
      await emulator.gameManager.loadState(state);
      window.dispatchEvent(new CustomEvent('emulator_notification', { detail: { type: 'load', source } }));
    }
  } catch (error: any) {
    console.error("load failed:", error);
    emulator.displayMessage(`error loading: ${error.message}`);
  }
}

function startAutoSave(interval: number): void {
  if (autoSaveInterval) clearInterval(autoSaveInterval);
  const safeInterval = Math.max(15000, interval);

  autoSaveInterval = setInterval(() => {
    if (window.gameRunning && getEmulator()) saveState('auto');
  }, safeInterval);
}

let eventListenersAdded = false;
function addEventListeners(): void {
  if (eventListenersAdded || typeof document === 'undefined') return;

  const handleKeydown = (event: KeyboardEvent) => {
    if (!window.gameRunning || !getEmulator()) return;
    if (event.key === 'F1') { event.preventDefault(); saveState('manual'); }
    else if (event.key === 'F2') { event.preventDefault(); loadState('manual'); }
  };

  document.addEventListener("keydown", handleKeydown);
  eventListenersAdded = true;
}

if (typeof window !== 'undefined') {
  window.saveToBrowserStorage = () => saveState('manual');
  window.loadFromBrowserStorage = () => loadState('manual');
}