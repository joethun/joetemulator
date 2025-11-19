import { FILE_EXTENSIONS } from './constants';

// CDN and styling
const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
const GAME_CONTAINER_STYLES = `
  width: 100%; height: 100vh; position: fixed; top: 0; left: 0;
  z-index: 999999; background-color: #000000; overflow: hidden;
  display: block !important; visibility: visible !important; opacity: 1 !important;
`;

// Config
const UI_SELECTORS = ['aside', 'footer', 'main', 'header', 'nav'];
const CORES_WITH_THREADS = ['psp', 'dosbox_pure'];
const CORE_MAP = { segaGG: 'genesis_plus_gx', nds: 'desmume' };

declare global {
  interface Window {
    EJS_emulator?: any;
    gameRunning: boolean;
    [key: string]: any;
  }
}

if (typeof window !== 'undefined') window.gameRunning = false;

// Detect which emulator core to use based on file extension
function detectCore(extension: string): string {
  return FILE_EXTENSIONS[extension] || "nes";
}

// Show or hide menu elements
function toggleMenuElements(show: boolean): void {
  if (typeof document === 'undefined') return;
  
  const style = show ? '' : 'display: none !important; visibility: hidden !important;';
  UI_SELECTORS.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) (element as HTMLElement).style.cssText = style;
  });
  
  if (!show) {
    const root = document.querySelector('div[style*="min-h-screen"]');
    if (root) (root as HTMLElement).style.cssText += " z-index: -1 !important;";
  }
}

// Setup game display container
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

// Clean up when game exits
function cleanupGame(): void {
  const gameDiv = document.getElementById("game");
  if (gameDiv) {
    gameDiv.innerHTML = "";
    gameDiv.style.display = "none";
  }
  
  document.querySelectorAll('script[src*="loader.js"]').forEach(s => s.remove());
  toggleMenuElements(true);
  window.gameRunning = false;
}

// Main function to load and start a game
export async function loadGame(
  file: File | string, 
  coreOverride?: string, 
  themeColor?: string
): Promise<void> {
  const fileName = file instanceof File ? file.name : file;
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
  const gameName = fileName.substring(0, fileName.lastIndexOf("."));
  const core = coreOverride || detectCore(fileExtension);

  cleanupGame();
  toggleMenuElements(false);
  setupGameDisplay();
  window.gameRunning = true;
  
  configureEmulator(gameName, file, core, themeColor);
  loadEmulatorScript();
}

// Configure emulator settings
function configureEmulator(
  gameName: string, 
  gameFile: File | string, 
  core: string, 
  themeColor?: string
) {
  window.EJS_color = themeColor || '#2563eb';
  window.EJS_player = "#game";
  window.EJS_gameName = gameName;
  window.EJS_gameUrl = gameFile;
  window.EJS_core = core;
  window.EJS_pathtodata = CDN_PATH;
  window.EJS_startOnLoaded = true;
  window.EJS_biosUrl = '';
  window.EJS_threads = CORES_WITH_THREADS.includes(core);
  window.EJS_language = "en";
  
  const retroarchCore = CORE_MAP[core as keyof typeof CORE_MAP];
  window.EJS_defaultOptions = {
    "save-save-interval": "60",
    "desmume_advanced_timing": "disabled",
    "webgl2Enabled": "enabled",
    ...(retroarchCore && { retroarch_core: retroarchCore })
  };
  
  window.EJS_ready = function() {
    addEventListeners();
  };
  
  window.EJS_Buttons = {
    exitEmulation: false,
    cacheManager: false,
    saveSavFiles: { visible: false },
    loadSavFiles: { visible: false }
  };
}

// Load the emulator script
function loadEmulatorScript() {
  if (typeof document === 'undefined') return;
  
  const script = document.createElement("script");
  script.src = `${CDN_PATH}/loader.js`;
  script.onload = () => {
    setTimeout(() => {
      const gameDiv = document.getElementById("game");
      if (!gameDiv) return;
      
      gameDiv.style.cssText = GAME_CONTAINER_STYLES;
      const canvas = gameDiv.querySelector('canvas');
      if (canvas) {
        (canvas as HTMLElement).style.cssText = 
          'display: block !important; visibility: visible !important; width: 100% !important; height: 100% !important;';
      }
    }, 100);
  };
  document.body.appendChild(script);
}

let eventListenersAdded = false;

// Add keyboard shortcuts and button handlers
function addEventListeners() {
  if (eventListenersAdded || typeof document === 'undefined') return;
  eventListenersAdded = true;
  
  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === 'F1') {
      event.preventDefault();
      saveState();
    } else if (event.key === 'F2') {
      event.preventDefault();
      loadState();
    }
  });

  const saveButton = document.getElementById('saveBrowser');
  const loadButton = document.getElementById('loadBrowser');
  if (saveButton) saveButton.onclick = saveState;
  if (loadButton) loadButton.onclick = loadState;
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.saveToBrowserStorage = saveState;
  window.loadFromBrowserStorage = loadState;
}

if (typeof document !== 'undefined') {
  document.addEventListener("DOMContentLoaded", addEventListeners);
}

// Exit the game
export function exitGame(): void {
  cleanupGame();
}

// Save game state
async function saveState(): Promise<void> {
  const emulator = window.EJS_emulator;
  if (!emulator?.started) return;
  
  try {
    const state = emulator.gameManager.getState();
    const stateFileName = `${emulator.getBaseFileName()}.state`;
    await emulator.storage.states.put(stateFileName, state);
    emulator.displayMessage("SAVED STATE TO BROWSER");
  } catch (error: any) {
    console.error("Save failed:", error);
    emulator.displayMessage(`Error saving: ${error.message}`);
  }
}

// Load game state
async function loadState(): Promise<void> {
  const emulator = window.EJS_emulator;
  if (!emulator?.started) return;
  
  try {
    const stateFileName = `${emulator.getBaseFileName()}.state`;
    const state = await emulator.storage.states.get(stateFileName);
    
    if (state) {
      await emulator.gameManager.loadState(state);
      emulator.displayMessage("LOADED STATE FROM BROWSER");
    } else {
      emulator.displayMessage("");
    }
  } catch (error: any) {
    console.error("Load failed:", error);
    emulator.displayMessage(`Error loading: ${error.message}`);
  }
}