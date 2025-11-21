import { FILE_EXTENSIONS } from './constants';
import { THEMES } from '../types'; // Correctly pointing to the sibling folder

// --- CONFIGURATION CONSTANTS ---
const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
const GAME_CONTAINER_STYLES = `
  width: 100%; height: 100vh; position: fixed; top: 0; left: 0;
  z-index: 999999; background-color: #000000; overflow: hidden;
  display: flex !important; align-items: center; justify-content: center;
`;
const UI_SELECTORS = ['aside', 'footer', 'main', 'header', 'nav'];
const CORES_WITH_THREADS = ['psp', 'dosbox_pure'];
const EJS_CORE_TO_RETROARCH: Record<string, string> = { 
  segaGG: 'genesis_plus_gx', 
  nds: 'desmume' 
};

// --- GLOBAL DECLARATIONS ---
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

function toggleMenuElements(show: boolean): void {
  if (typeof document === 'undefined') return;
  const style = show ? '' : 'display: none !important; visibility: hidden !important;';
  UI_SELECTORS.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) (element as HTMLElement).style.cssText = style;
  });
  const root = document.querySelector('div[style*="min-h-screen"]');
  if (root) (root as HTMLElement).style.zIndex = show ? 'auto' : '-1';
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
  gameDiv.style.cssText = GAME_CONTAINER_STYLES; 
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
  const EJS_VARS = Object.keys(window).filter(key => key.startsWith('EJS_'));
  EJS_VARS.forEach(key => delete window[key]);
}

function configureEmulator(
  gameName: string, 
  gameFile: File | string, 
  core: string, 
  themeName: string
) {
  const retroarchCore = EJS_CORE_TO_RETROARCH[core];
  
  // 1. Look for the theme in the imported THEMES object
  // 2. Fallback to 'default' if the key doesn't exist
  const themeKey = (themeName && THEMES[themeName]) ? themeName : 'default';
  const currentTheme = THEMES[themeKey];
  
  // 3. Extract the color
  const ejsColor = currentTheme.gradientTo;

  console.log(`[Emulator] Loading Theme: ${themeKey}, Color: ${ejsColor}`);

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
  script.onerror = () => console.error("Failed to load EJS loader script.");
  script.onload = () => {
    setTimeout(() => {
      const gameDiv = document.getElementById("game");
      const canvas = gameDiv?.querySelector('canvas');
      if (canvas) {
        (canvas as HTMLElement).style.cssText = 
          'display: block !important; visibility: visible !important; width: 100% !important; height: 100% !important;';
      }
    }, 100);
  };
  document.body.appendChild(script);
}

// --- PUBLIC API ---

/**
 * Main entry point.
 * IMPORTANT: You MUST pass the 3rd argument (themeName) for colors to work.
 */
export async function loadGame(
  file: File | string, 
  coreOverride?: string, 
  themeName: string = 'default' // Default is set here if argument is missing
): Promise<void> {
  const fileName = file instanceof File 
    ? file.name 
    : (file as string).split('/').pop() || 'game';
    
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
  const gameName = fileName.substring(0, fileName.lastIndexOf(".")) || fileName;
  const core = coreOverride || detectCore(fileExtension);

  cleanupGame();
  toggleMenuElements(false);
  setupGameDisplay(); 
  window.gameRunning = true;
  
  // Pass the themeName down to configuration
  configureEmulator(gameName, file, core, themeName); 
  loadEmulatorScript();
}

// --- STATE MANAGEMENT ---

function getEmulator(): any | null {
  const emulator = window.EJS_emulator;
  if (!emulator?.started) return null;
  return emulator;
}

async function saveState(): Promise<void> {
  const emulator = getEmulator();
  if (!emulator) return;
  try {
    const state = emulator.gameManager.getState();
    const stateFileName = `${emulator.getBaseFileName()}.state`;
    await emulator.storage.states.put(stateFileName, state); 
    emulator.displayMessage("SAVED STATE TO BROWSER (F1)");
  } catch (error: any) {
    console.error("Save failed:", error);
    emulator.displayMessage(`Error saving: ${error.message}`);
  }
}

async function loadState(): Promise<void> {
  const emulator = getEmulator();
  if (!emulator) return;
  try {
    const stateFileName = `${emulator.getBaseFileName()}.state`;
    const state = await emulator.storage.states.get(stateFileName); 
    if (state) {
      await emulator.gameManager.loadState(state);
      emulator.displayMessage("LOADED STATE FROM BROWSER (F2)");
    } else {
      emulator.displayMessage("No saved state found");
    }
  } catch (error: any) {
    console.error("Load failed:", error);
    emulator.displayMessage(`Error loading: ${error.message}`);
  }
}

// --- EVENT HANDLERS ---
let eventListenersAdded = false;

function addEventListeners(): void {
  if (eventListenersAdded || typeof document === 'undefined') return;
  eventListenersAdded = true;
  
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (!window.gameRunning || !getEmulator()) return;
    if (event.key === 'F1') {
      event.preventDefault();
      saveState();
    } else if (event.key === 'F2') {
      event.preventDefault();
      loadState();
    }
  });
}

if (typeof window !== 'undefined') {
  window.saveToBrowserStorage = saveState;
  window.loadFromBrowserStorage = loadState;
}