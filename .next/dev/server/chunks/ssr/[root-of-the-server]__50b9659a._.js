module.exports = [
"[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/favicon.ico.mjs { IMAGE => \"[project]/src/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)"));
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/src/app/layout.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/layout.tsx [app-rsc] (ecmascript)"));
}),
"[project]/src/lib/constants.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Shared constants for emulator systems and file extensions
__turbopack_context__.s([
    "FILE_EXTENSIONS",
    ()=>FILE_EXTENSIONS,
    "SYSTEM_PICKER",
    ()=>SYSTEM_PICKER,
    "SYSTEM_PICKER_FLAT",
    ()=>SYSTEM_PICKER_FLAT,
    "getSystemNameByCore",
    ()=>getSystemNameByCore
]);
const FILE_EXTENSIONS = {
    fds: "nes",
    nes: "nes",
    unif: "nes",
    unf: "nes",
    gb: "gb",
    gbc: "gbc",
    gba: "gba",
    smc: "snes",
    sfc: "snes",
    swc: "snes",
    vb: "vb",
    vboy: "vb",
    z64: "n64",
    n64: "n64",
    nds: "nds",
    sms: "segaMS",
    md: "segaMD",
    gen: "segaMD",
    smd: "segaMD",
    gg: "segaGG",
    "32x": "sega32x",
    cso: "psp",
    pbp: "psp",
    a26: "atari2600",
    a52: "atari5200",
    a78: "atari7800",
    lnx: "lynx",
    j64: "jaguar",
    jag: "jaguar",
    d64: "vice_x64",
    t64: "vice_x64",
    tap: "vice_x64",
    crt: "vice_x64",
    col: "coleco",
    cv: "coleco",
    pce: "pce",
    ngp: "ngp",
    ngc: "ngp",
    ws: "ws",
    wsc: "ws"
};
const SYSTEM_PICKER = {
    "Nintendo": {
        "NES": "nes",
        "Game Boy": "gb",
        "Game Boy Color": "gbc",
        "Game Boy Advance": "gba",
        "SNES": "snes",
        "Virtual Boy": "vb",
        "N64": "n64",
        "DS": "nds"
    },
    "Sega": {
        "Master System": "segaMS",
        "Genesis/Mega Drive": "segaMD",
        "Game Gear": "segaGG",
        "CD": "segaCD",
        "32X": "sega32x",
        "Saturn": "segaSaturn"
    },
    "Sony": {
        "PS1": "psx",
        "PSP": "psp"
    },
    "Atari": {
        "2600": "atari2600",
        "5200": "atari5200",
        "7800": "atari7800",
        "Lynx": "lynx",
        "Jaguar": "jaguar"
    },
    "Other": {
        "Panasonic 3DO": "opera",
        "Arcade (FBNeo)": "arcade",
        "Arcade (M.A.M.E)": "mame2003_plus",
        "Microsoft DOS": "dosbox_pure",
        "Commodore PET": "vice_xpet",
        "Commodore VIC-20": "vice_xvic",
        "Commodore Amiga": "amiga",
        "Commodore 64": "vice_x64",
        "Commodore 128": "vice_x128",
        "Commodore Plus/4": "vice_xplus4",
        "ColecoVision": "coleco",
        "NEC TurboGrafx-16": "pce",
        "NEC PC-FX": "pcfx",
        "SNK Neo Geo Pocket": "ngp",
        "Bandai WonderSwan": "ws"
    }
};
function getSystemNameByCore(core) {
    for (const category of Object.values(SYSTEM_PICKER)){
        for (const [name, systemCore] of Object.entries(category)){
            if (systemCore === core) {
                return name;
            }
        }
    }
    return 'Unknown System';
}
const SYSTEM_PICKER_FLAT = {};
Object.values(SYSTEM_PICKER).forEach((category)=>{
    Object.assign(SYSTEM_PICKER_FLAT, category);
});
}),
"[project]/src/lib/emulator.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "addEventListeners",
    ()=>addEventListeners,
    "exitGame",
    ()=>exitGame,
    "loadGame",
    ()=>loadGame,
    "loadState",
    ()=>loadState,
    "saveState",
    ()=>saveState
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-rsc] (ecmascript)");
;
const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
async function detectCore(extension) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension]) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$rsc$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension];
    }
    // Fallback to NES if system picker not available
    return new Promise((resolve)=>{
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            resolve("nes");
        }
    });
}
function toggleMenuElements(show) {
    if (typeof document === 'undefined') return;
    [
        'aside',
        'footer',
        'main',
        'header'
    ].forEach((selector)=>{
        const element = document.querySelector(selector);
        if (element) {
            element.style.cssText = show ? '' : `display: none !important; visibility: hidden !important; z-index: -1 !important;`;
        }
    });
    const rootDiv = document.querySelector('div[style*="min-h-screen"]');
    if (rootDiv && !show) {
        rootDiv.style.cssText += " z-index: -1 !important;";
    }
}
function cleanupOldElements() {
    const gameContainer = document.getElementById("game");
    if (gameContainer) {
        gameContainer.innerHTML = "";
        gameContainer.style.display = "none";
    }
    // Remove old emulator scripts
    const oldScripts = document.querySelectorAll('script[src*="loader.js"]');
    oldScripts.forEach((script)=>script.remove());
    // Restore menu visibility
    toggleMenuElements(true);
    window.gameRunning = false;
}
function hideMenu() {
    toggleMenuElements(false);
}
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
    let gameContainer = document.getElementById("game");
    if (!gameContainer) {
        gameContainer = document.createElement("div");
        gameContainer.id = "game";
        document.body.appendChild(gameContainer);
    }
    gameContainer.innerHTML = "";
    gameContainer.style.cssText = GAME_CONTAINER_STYLES;
    // Prevent scrolling
    if (document.body) document.body.style.overflow = "hidden";
    if (document.documentElement) document.documentElement.style.overflow = "hidden";
}
async function loadGame(file, coreOverride, themeColor) {
    const fileName = file instanceof File ? file.name : file;
    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
    const gameName = fileName.substring(0, fileName.lastIndexOf("."));
    const core = coreOverride || await detectCore(fileExtension);
    cleanupOldElements();
    hideMenu();
    createGameDisplay();
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    configureEmulator(gameName, file, core, themeColor);
    loadEmulatorScript();
}
function configureEmulator(gameName, gameFile, core, themeColor) {
    if ("TURBOPACK compile-time truthy", 1) return;
    //TURBOPACK unreachable
    ;
    const threadsEnabled = undefined;
}
function loadEmulatorScript() {
    if (typeof document === 'undefined') return;
    const script = document.createElement("script");
    script.src = `${CDN_PATH}/loader.js`;
    script.onload = ()=>{
        setTimeout(()=>{
            const gameContainer = document.getElementById("game");
            if (gameContainer) {
                gameContainer.style.cssText = GAME_CONTAINER_STYLES.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() + ' !important';
                const canvas = gameContainer.querySelector('canvas');
                if (canvas) {
                    canvas.style.cssText = `
            display: block !important;
            visibility: visible !important;
            opacity: 1 !important;
            width: 100% !important;
            height: 100% !important;
          `;
                }
            }
        }, 100);
    };
    document.body.appendChild(script);
}
function getEmulator() {
    if ("TURBOPACK compile-time truthy", 1) return null;
    //TURBOPACK unreachable
    ;
}
async function saveState() {
    const emulator = getEmulator();
    if (!emulator) return;
    try {
        const state = emulator.gameManager.getState();
        const stateFileName = `${emulator.getBaseFileName()}.state`;
        await emulator.storage.states.put(stateFileName, state);
        emulator.displayMessage("SAVED STATE TO BROWSER");
    } catch (error) {
        console.error("Save failed:", error);
        emulator.displayMessage(`Error saving: ${error.message}`);
    }
}
async function loadState() {
    const emulator = getEmulator();
    if (!emulator) return;
    try {
        const stateFileName = `${emulator.getBaseFileName()}.state`;
        const state = await emulator.storage.states.get(stateFileName);
        if (state) {
            await emulator.gameManager.loadState(state);
            emulator.displayMessage("LOADED STATE FROM BROWSER");
        } else {
            emulator.displayMessage("");
        }
    } catch (error) {
        console.error("Load failed:", error);
        emulator.displayMessage(`Error loading: ${error.message}`);
    }
}
function exitGame() {
    cleanupOldElements();
    const gameContainer = document.getElementById("game");
    if (gameContainer) {
        gameContainer.style.display = "none";
    }
}
function addEventListeners() {
    if (typeof document === 'undefined') return;
    document.addEventListener("keydown", (event)=>{
        if (event.key === "F1") {
            event.preventDefault();
            saveState();
        } else if (event.key === "F2") {
            event.preventDefault();
            loadState();
        } else if (event.key === "Escape" && window.gameRunning) {
            event.preventDefault();
            exitGame();
        }
    });
}
// Expose functions to window for global access
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
// Initialize event listeners when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", addEventListeners);
    } else {
        addEventListeners();
    }
}
}),
"[project]/src/lib/storage.ts [app-rsc] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// IndexedDB storage for large game files
__turbopack_context__.s([
    "deleteGameFile",
    ()=>deleteGameFile,
    "getGameFile",
    ()=>getGameFile,
    "saveGameFile",
    ()=>saveGameFile
]);
const DB_NAME = 'joetemulator';
const DB_VERSION = 1;
const STORE_NAME = 'gameFiles';
let db = null;
function openDB() {
    return new Promise((resolve, reject)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            reject(new Error('IndexedDB not supported'));
            return;
        }
        //TURBOPACK unreachable
        ;
        const request = undefined;
    });
}
async function executeStoreOperation(mode, operation) {
    const database = await openDB();
    return new Promise((resolve, reject)=>{
        const transaction = database.transaction([
            STORE_NAME
        ], mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = operation(store);
        request.onerror = ()=>reject(request.error);
        request.onsuccess = ()=>resolve(request.result);
    });
}
async function saveGameFile(gameId, file) {
    await executeStoreOperation('readwrite', (store)=>store.put(file, gameId));
}
async function getGameFile(gameId) {
    const result = await executeStoreOperation('readonly', (store)=>store.get(gameId));
    return result || null;
}
async function deleteGameFile(gameId) {
    await executeStoreOperation('readwrite', (store)=>store.delete(gameId));
}
}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/src/app/page.tsx'\n\nReturn statement is not allowed here");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/src/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", ((__turbopack_context__) => {

__turbopack_context__.n(__turbopack_context__.i("[project]/src/app/page.tsx [app-rsc] (ecmascript)"));
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__50b9659a._.js.map