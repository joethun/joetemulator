import { FILE_EXTENSIONS } from './constants';
import { THEMES } from '@/types';

const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
const CORES_WITH_THREADS = ['psp', 'dosbox_pure'];

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

function detectCore(extension: string): string {
  return FILE_EXTENSIONS[extension] || "nes";
}

// hide/show main ui elements when emulation toggles
function toggleMenuElements(show: boolean): void {
  if (typeof document === 'undefined') return;
  const displayVal = show ? '' : 'display: none !important; visibility: hidden !important;';
  
  ['aside', 'footer', 'main', 'header', 'nav'].forEach(sel => {
    const el = document.querySelector(sel) as HTMLElement;
    if (el) el.style.cssText = displayVal;
  });

  const root = document.querySelector('div[style*="min-h-screen"]') as HTMLElement;
  if (root) root.style.zIndex = show ? 'auto' : '-1';
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
  gameDiv.style.cssText = 'width: 100%; height: 100vh; position: fixed; top: 0; left: 0; z-index: 999999; background-color: #000000; overflow: hidden; display: flex !important; align-items: center; justify-content: center;';
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

export function cleanupGame(): void {
  const gameDiv = document.getElementById("game");
  if (gameDiv) {
    gameDiv.innerHTML = "";
    gameDiv.style.display = "none";
  }

  document.querySelectorAll('script[src*="loader.js"]').forEach(s => s.remove());
  toggleMenuElements(true);
  window.gameRunning = false;

  Object.keys(window).forEach(key => {
    if (key.startsWith('EJS_')) delete window[key];
  });
}

function configureEmulator(gameName: string, gameFile: File | string, core: string, themeName: string): void {
  const retroarchCore = EJS_CORE_TO_RETROARCH[core];
  const themeKey = (themeName && THEMES[themeName]) ? themeName : 'default';
  const ejsColor = THEMES[themeKey].gradientTo;

  console.log(`[Emulator] Theme: ${themeKey}, Color: ${ejsColor}`);

  Object.assign(window, {
    EJS_color: ejsColor,
    EJS_player: "#game",
    EJS_gameName: gameName,
    EJS_gameUrl: gameFile,
    EJS_core: core,
    EJS_pathtodata: CDN_PATH,
    EJS_startOnLoaded: true,
    EJS_biosUrl: '',
    EJS_threads: CORES_WITH_THREADS.includes(core),
    EJS_language: "en",
    EJS_defaultOptions: {
      "save-save-interval": "60",
      "desmume_advanced_timing": "disabled",
      "webgl2Enabled": "enabled",
      ...(retroarchCore && { retroarch_core: retroarchCore })
    },
    EJS_ready: () => addEventListeners(),
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
  script.onerror = () => console.error("Failed to load EJS loader.");
  script.onload = () => {
    setTimeout(() => {
      const canvas = document.querySelector('#game canvas') as HTMLElement;
      if (canvas) {
        canvas.style.cssText = 'display: block !important; visibility: visible !important; width: 100% !important; height: 100% !important;';
      }
    }, 100);
  };
  document.body.appendChild(script);
}

export async function loadGame(file: File | string, coreOverride?: string, themeName: string = 'default'): Promise<void> {
  const fileName = file instanceof File ? file.name : (file as string).split('/').pop() || 'game';
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
  const gameName = fileName.replace(/\.[^/.]+$/, "");
  const core = coreOverride || detectCore(fileExtension);

  cleanupGame();
  toggleMenuElements(false);
  setupGameDisplay();
  window.gameRunning = true;

  configureEmulator(gameName, file, core, themeName);
  loadEmulatorScript();
}

// state management helpers
function getEmulator(): any | null {
  return window.EJS_emulator?.started ? window.EJS_emulator : null;
}

async function saveState(): Promise<void> {
  const emulator = getEmulator();
  if (!emulator) return;
  try {
    const state = emulator.gameManager.getState();
    await emulator.storage.states.put(`${emulator.getBaseFileName()}.state`, state);
    emulator.displayMessage("SAVED STATE TO BROWSER");
  } catch (error: any) {
    console.error("Save failed:", error);
    emulator.displayMessage(`Error saving: ${error.message}`);
  }
}

async function loadState(): Promise<void> {
  const emulator = getEmulator();
  if (!emulator) return;
  try {
    const state = await emulator.storage.states.get(`${emulator.getBaseFileName()}.state`);
    if (state) {
      await emulator.gameManager.loadState(state);
      emulator.displayMessage("LOADED STATE FROM BROWSER");
    }
  } catch (error: any) {
    console.error("Load failed:", error);
    emulator.displayMessage(`Error loading: ${error.message}`);
  }
}

let eventListenersAdded = false;
function addEventListeners(): void {
  if (eventListenersAdded || typeof document === 'undefined') return;
  eventListenersAdded = true;

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (!window.gameRunning || !getEmulator()) return;
    if (event.key === 'F1') { event.preventDefault(); saveState(); }
    else if (event.key === 'F2') { event.preventDefault(); loadState(); }
  });
}

if (typeof window !== 'undefined') {
  window.saveToBrowserStorage = saveState;
  window.loadFromBrowserStorage = loadState;
}