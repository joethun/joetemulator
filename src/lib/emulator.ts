import { FILE_EXTENSIONS } from './constants';

const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
const DEFAULT_EJS_COLOR = "#2563eb";

declare global {
  interface Window {
    [key: string]: any;
  }
}

if (typeof window !== 'undefined') window.gameRunning = false;
async function detectCore(extension: string): Promise<string> {
  return FILE_EXTENSIONS[extension] || "nes";
}

function toggleMenuElements(show: boolean) {
  if (typeof document === 'undefined') return;
  ['aside', 'footer', 'main', 'header'].forEach(s => {
    const e = document.querySelector(s);
    if (e) (e as HTMLElement).style.cssText = show ? '' : 'display: none !important; visibility: hidden !important; z-index: -1 !important;';
  });
  const r = document.querySelector('div[style*="min-h-screen"]');
  if (r && !show) (r as HTMLElement).style.cssText += " z-index: -1 !important;";
}
function cleanupOldElements() {
  const g = document.getElementById("game");
  if (g) { g.innerHTML = ""; g.style.display = "none"; }
  document.querySelectorAll('script[src*="loader.js"]').forEach(s => s.remove());
  toggleMenuElements(true);
  window.gameRunning = false;
}
function hideMenu() { toggleMenuElements(false); }

const GAME_CONTAINER_STYLES = `
  width: 100%;
  height: 100vh;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 999999;
  background-color: #000000;
  overflow: hidden;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
`;

function createGameDisplay() {
  if (typeof document === 'undefined') return;
  let g = document.getElementById("game") || (d => (d.id = "game", document.body.appendChild(d), d))(document.createElement("div"));
  g.innerHTML = "";
  (g as HTMLElement).style.cssText = GAME_CONTAINER_STYLES;
  if (document.body) document.body.style.overflow = "hidden";
  if (document.documentElement) document.documentElement.style.overflow = "hidden";
}

export async function loadGame(file: File | string, coreOverride?: string, themeColor?: string): Promise<void> {
  const fileName = file instanceof File ? file.name : file;
  const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
  const gameName = fileName.substring(0, fileName.lastIndexOf("."));

  const core = coreOverride || await detectCore(fileExtension);

  cleanupOldElements();
  hideMenu();
  createGameDisplay();
  if (typeof window !== 'undefined') {
    window.gameRunning = true;
  }

  configureEmulator(gameName, file, core, themeColor);
  loadEmulatorScript();
}

function configureEmulator(gameName: string, gameFile: File | string, core: string, themeColor?: string) {
  window.EJS_color = themeColor || DEFAULT_EJS_COLOR;
  window.EJS_backgroundColor = "#000000";
  window.EJS_player = "#game";
  window.EJS_gameName = gameName;
  window.EJS_gameUrl = gameFile;
  window.EJS_core = core;
  window.EJS_pathtodata = CDN_PATH;
  window.EJS_startOnLoaded = true;
  window.EJS_biosUrl = "";
  window.EJS_threads = ["psp", "dosbox_pure"].includes(core);
  window.EJS_defaultOptions = { "save-save-interval": "60", "desmume_advanced_timing": "disabled", "webgl2Enabled": "enabled", ...(core === "segaGG" && { retroarch_core: "genesis_plus_gx" }), ...(core === "nds" && { retroarch_core: "desmume" }) };
  window.EJS_Buttons = { exitEmulation: false, cacheManager: false, saveSavFiles: { visible: false }, loadSavFiles: { visible: false } };
}

function loadEmulatorScript() {
  if (typeof document === 'undefined') return;
  const s = document.createElement("script");
  s.src = `${CDN_PATH}/loader.js`;
  s.onload = () => setTimeout(() => {
    const g = document.getElementById("game");
    if (g) {
      (g as HTMLElement).style.cssText = GAME_CONTAINER_STYLES.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() + ' !important';
      const c = g.querySelector('canvas');
      if (c) (c as HTMLElement).style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; width: 100% !important; height: 100% !important;';
    }
  }, 100);
  document.body.appendChild(s);
}

function getEmulator() { return typeof window === 'undefined' ? null : window.EJS_emulator?.started ? window.EJS_emulator : null; }
export function exitGame() { cleanupOldElements(); const g = document.getElementById("game"); if (g) g.style.display = "none"; }
