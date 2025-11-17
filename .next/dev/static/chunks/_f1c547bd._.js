(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/emulator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
if ("TURBOPACK compile-time truthy", 1) {
    window.gameRunning = false;
}
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
    "Nintendo NES": "nes",
    "Nintendo GB": "gb",
    "Nintendo SNES": "snes",
    "Nintendo VB": "vb",
    "Nintendo 64": "n64",
    "Nintendo GBC": "gbc",
    "Nintendo GBA": "gba",
    "Nintendo DS": "nds",
    "Sega MS": "segaMS",
    "Sega Gen/MD": "segaMD",
    "Sega GG": "segaGG",
    "Sega CD": "segaCD",
    "Sega 32X": "sega32x",
    "Sega Saturn": "segaSaturn",
    "Sony PS1": "psx",
    "Sony PSP": "psp",
    "Atari 2600": "atari2600",
    "Atari 5200": "atari5200",
    "Atari 7800": "atari7800",
    "Atari Lynx": "lynx",
    "Atari Jaguar": "jaguar",
    "Panasonic 3DO": "opera",
    "Arcade (FBNeo)": "arcade",
    "Arcade (M.A.M.E)": "mame2003_plus",
    "Microsoft DOS": "dosbox_pure",
    "Commodore PET": "vice_xpet",
    "Commodore VIC20": "vice_xvic",
    "Commodore Amiga": "amiga",
    "Commodore 64": "vice_x64",
    "Commodore 128": "vice_x128",
    "Commodore P/4": "vice_xplus4",
    "ColecoVision": "coleco",
    "NEC TurboGrafx-16": "pce",
    "NEC PC-FX": "pcfx",
    "SNK NGP": "ngp",
    "Bandai WS": "ws"
};
async function detectCore(extension) {
    if (FILE_EXTENSIONS[extension]) {
        return FILE_EXTENSIONS[extension];
    }
    // Fallback to NES if system picker not available
    return new Promise((resolve)=>{
        if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.showSystemPicker) {
            window.showSystemPicker(SYSTEM_PICKER, resolve);
        } else {
            resolve("nes");
        }
    });
}
function showMenu() {
    // Show all menu elements
    const sidebar = document.querySelector('aside');
    if (sidebar) {
        sidebar.style.display = "";
    }
    // Show footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.display = "";
    }
    // Show main content
    const main = document.querySelector('main');
    if (main) {
        main.style.display = "";
    }
    // Show header
    const header = document.querySelector('header');
    if (header) {
        header.style.display = "";
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
    showMenu();
    window.gameRunning = false;
}
function hideMenu() {
    if (typeof document === 'undefined') return;
    // Hide all menu elements with important styles
    const menu = document.getElementById("menu");
    if (menu) {
        menu.style.cssText = "display: none !important; visibility: hidden !important;";
    }
    // Hide sidebar
    const sidebar = document.querySelector('aside');
    if (sidebar) {
        sidebar.style.cssText = "display: none !important; visibility: hidden !important; z-index: -1 !important;";
    }
    // Hide footer
    const footer = document.querySelector('footer');
    if (footer) {
        footer.style.cssText = "display: none !important; visibility: hidden !important; z-index: -1 !important;";
    }
    // Hide main content
    const main = document.querySelector('main');
    if (main) {
        main.style.cssText = "display: none !important; visibility: hidden !important; z-index: -1 !important;";
    }
    // Hide header
    const header = document.querySelector('header');
    if (header) {
        header.style.cssText = "display: none !important; visibility: hidden !important; z-index: -1 !important;";
    }
    // Hide the root div that contains everything
    const rootDiv = document.querySelector('div[style*="min-h-screen"]');
    if (rootDiv) {
        rootDiv.style.cssText += " z-index: -1 !important;";
    }
}
function createGameDisplay() {
    if (typeof document === 'undefined') return;
    let gameContainer = document.getElementById("game");
    if (!gameContainer) {
        gameContainer = document.createElement("div");
        gameContainer.id = "game";
        gameContainer.style.cssText = `
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
        document.body.appendChild(gameContainer);
    } else {
        // Clear existing content and make sure it's visible
        gameContainer.innerHTML = "";
        gameContainer.style.cssText = `
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
    }
    // Ensure body and html don't have overflow issues
    if (document.body) {
        document.body.style.overflow = "hidden";
    }
    if (document.documentElement) {
        document.documentElement.style.overflow = "hidden";
    }
}
async function loadGame(file, coreOverride) {
    let fileName;
    let fileExtension;
    let gameName;
    let gameFile;
    if (file instanceof File) {
        fileName = file.name;
        fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
        gameName = fileName.substring(0, fileName.lastIndexOf("."));
        gameFile = file;
    } else {
        fileName = file;
        fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
        gameName = fileName.substring(0, fileName.lastIndexOf("."));
        gameFile = file;
    }
    const core = coreOverride || await detectCore(fileExtension);
    cleanupOldElements();
    hideMenu();
    createGameDisplay();
    if ("TURBOPACK compile-time truthy", 1) {
        window.gameRunning = true;
    }
    configureEmulator(gameName, gameFile, core);
    loadEmulatorScript();
}
function configureEmulator(gameName, gameFile, core) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    window.EJS_color = "#003d8c";
    window.EJS_backgroundColor = "#000000";
    window.EJS_player = "#game";
    window.EJS_gameName = gameName;
    window.EJS_gameUrl = gameFile;
    window.EJS_core = core;
    window.EJS_pathtodata = CDN_PATH;
    window.EJS_startOnLoaded = true;
    window.EJS_biosUrl = "";
    const threadsEnabled = [
        "psp",
        "dosbox_pure"
    ];
    if (threadsEnabled.includes(core)) {
        window.EJS_threads = true;
    }
    window.EJS_defaultOptions = {
        "save-save-interval": "60",
        "desmume_advanced_timing": "disabled",
        "webgl2Enabled": "enabled",
        ...core === "segaGG" && {
            retroarch_core: "genesis_plus_gx"
        },
        ...core === "nds" && {
            retroarch_core: "desmume"
        }
    };
    window.EJS_Buttons = {
        exitEmulation: false,
        cacheManager: false,
        saveSavFiles: {
            visible: false
        },
        loadSavFiles: {
            visible: false
        }
    };
}
function loadEmulatorScript() {
    if (typeof document === 'undefined') return;
    const script = document.createElement("script");
    script.src = `${CDN_PATH}/loader.js`;
    script.onload = ()=>{
        // Ensure game container is visible after script loads
        setTimeout(()=>{
            const gameContainer = document.getElementById("game");
            if (gameContainer) {
                gameContainer.style.cssText = `
          width: 100% !important;
          height: 100vh !important;
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          z-index: 999999 !important;
          background-color: #000000 !important;
          overflow: hidden !important;
          display: block !important;
          visibility: visible !important;
          opacity: 1 !important;
        `;
                // Ensure any canvas inside is visible
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
async function saveState() {
    const emulator = window.EJS_emulator;
    if (!emulator?.started) {
        return;
    }
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
    const emulator = window.EJS_emulator;
    if (!emulator?.started) {
        return;
    }
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
// Expose functions to window for global access (for EmulatorJS compatibility)
if ("TURBOPACK compile-time truthy", 1) {
    window.saveToBrowserStorage = saveState;
    window.loadFromBrowserStorage = loadState;
    window.loadGame = loadGame;
    window.exitGame = exitGame;
    window.cleanupOldElements = cleanupOldElements;
    window.hideMenu = hideMenu;
    window.createGameDisplay = createGameDisplay;
}
// Initialize event listeners when DOM is ready
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener("DOMContentLoaded", addEventListeners);
    } else {
        addEventListeners();
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
        if (("TURBOPACK compile-time value", "object") === 'undefined' || !window.indexedDB) {
            reject(new Error('IndexedDB not supported'));
            return;
        }
        if (db) {
            resolve(db);
            return;
        }
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = ()=>reject(request.error);
        request.onsuccess = ()=>{
            db = request.result;
            resolve(db);
        };
        request.onupgradeneeded = (event)=>{
            const database = event.target.result;
            if (!database.objectStoreNames.contains(STORE_NAME)) {
                database.createObjectStore(STORE_NAME);
            }
        };
    });
}
async function saveGameFile(gameId, file) {
    const database = await openDB();
    return new Promise((resolve, reject)=>{
        const transaction = database.transaction([
            STORE_NAME
        ], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(file, gameId);
        request.onerror = ()=>reject(request.error);
        request.onsuccess = ()=>resolve();
    });
}
async function getGameFile(gameId) {
    const database = await openDB();
    return new Promise((resolve, reject)=>{
        const transaction = database.transaction([
            STORE_NAME
        ], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(gameId);
        request.onerror = ()=>reject(request.error);
        request.onsuccess = ()=>{
            resolve(request.result || null);
        };
    });
}
async function deleteGameFile(gameId) {
    const database = await openDB();
    return new Promise((resolve, reject)=>{
        const transaction = database.transaction([
            STORE_NAME
        ], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(gameId);
        request.onerror = ()=>reject(request.error);
        request.onsuccess = ()=>resolve();
    });
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/app/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emulator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/emulator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/storage.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
const SYSTEM_PICKER = {
    "Nintendo NES": "nes",
    "Nintendo GB": "gb",
    "Nintendo SNES": "snes",
    "Nintendo VB": "vb",
    "Nintendo 64": "n64",
    "Nintendo GBC": "gbc",
    "Nintendo GBA": "gba",
    "Nintendo DS": "nds",
    "Sega MS": "segaMS",
    "Sega Gen/MD": "segaMD",
    "Sega GG": "segaGG",
    "Sega CD": "segaCD",
    "Sega 32X": "sega32x",
    "Sega Saturn": "segaSaturn",
    "Sony PS1": "psx",
    "Sony PSP": "psp",
    "Atari 2600": "atari2600",
    "Atari 5200": "atari5200",
    "Atari 7800": "atari7800",
    "Atari Lynx": "lynx",
    "Atari Jaguar": "jaguar",
    "Panasonic 3DO": "opera",
    "Arcade (FBNeo)": "arcade",
    "Arcade (M.A.M.E)": "mame2003_plus",
    "Microsoft DOS": "dosbox_pure",
    "Commodore PET": "vice_xpet",
    "Commodore VIC20": "vice_xvic",
    "Commodore Amiga": "amiga",
    "Commodore 64": "vice_x64",
    "Commodore 128": "vice_x128",
    "Commodore P/4": "vice_xplus4",
    "ColecoVision": "coleco",
    "NEC TurboGrafx-16": "pce",
    "NEC PC-FX": "pcfx",
    "SNK NGP": "ngp",
    "Bandai WS": "ws"
};
const BookOpenIcon = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709";
    }
    const { className } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 61,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] !== className) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: className,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: t1
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 68,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[2] = className;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    return t2;
};
_c = BookOpenIcon;
const ShoppingBagIcon = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709";
    }
    const { className } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 89,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] !== className) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: className,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: t1
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 96,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[2] = className;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    return t2;
};
_c1 = ShoppingBagIcon;
const DownloadIcon = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709";
    }
    const { className } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 117,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] !== className) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: className,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: t1
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 124,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[2] = className;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    return t2;
};
_c2 = DownloadIcon;
const MenuIcon = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709";
    }
    const { className } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M4 6h16M4 12h16M4 18h16"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 145,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] !== className) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: className,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: t1
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 152,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[2] = className;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    return t2;
};
_c3 = MenuIcon;
const XIcon = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(4);
    if ($[0] !== "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709") {
        for(let $i = 0; $i < 4; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709";
    }
    const { className } = t0;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M6 18L18 6M6 6l12 12"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 173,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] !== className) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: className,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: t1
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 180,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[2] = className;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    return t2;
};
_c4 = XIcon;
const CogIcon = (t0)=>{
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(5);
    if ($[0] !== "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709") {
        for(let $i = 0; $i < 5; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709";
    }
    const { className } = t0;
    let t1;
    let t2;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 202,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 203,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[1] = t1;
        $[2] = t2;
    } else {
        t1 = $[1];
        t2 = $[2];
    }
    let t3;
    if ($[3] !== className) {
        t3 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
            className: className,
            fill: "none",
            stroke: "currentColor",
            viewBox: "0 0 24 24",
            children: [
                t1,
                t2
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 212,
            columnNumber: 10
        }, ("TURBOPACK compile-time value", void 0));
        $[3] = className;
        $[4] = t3;
    } else {
        t3 = $[4];
    }
    return t3;
};
_c5 = CogIcon;
const COLORS = {
    highlight: '#cccccc',
    darkBg: '#0f0f0f',
    midDark: '#1e1e1e',
    softLight: '#f5f5f5',
    sidebarHover: '#333333',
    playGreen: '#00ff7f'
};
function GameCard(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(33);
    if ($[0] !== "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709") {
        for(let $i = 0; $i < 33; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "bf3204274e2095147f196a9af88b566f7b3eff667389e82c4872e8e503a21709";
    }
    const { game, onPlay, onEdit } = t0;
    const coverClass = `${game.color} h-full flex items-center justify-center text-6xl transition-all duration-300 group-hover:scale-[1.05]`;
    let t1;
    if ($[1] === Symbol.for("react.memo_cache_sentinel")) {
        t1 = {
            backgroundColor: COLORS.midDark
        };
        $[1] = t1;
    } else {
        t1 = $[1];
    }
    let t2;
    if ($[2] !== coverClass || $[3] !== game.emoji) {
        t2 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: coverClass,
            children: game.emoji
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 265,
            columnNumber: 10
        }, this);
        $[2] = coverClass;
        $[3] = game.emoji;
        $[4] = t2;
    } else {
        t2 = $[4];
    }
    let t3;
    if ($[5] === Symbol.for("react.memo_cache_sentinel")) {
        t3 = {
            color: COLORS.softLight
        };
        $[5] = t3;
    } else {
        t3 = $[5];
    }
    let t4;
    if ($[6] !== game.title) {
        t4 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
            className: "text-xl font-bold truncate mb-1",
            style: t3,
            children: game.title
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 283,
            columnNumber: 10
        }, this);
        $[6] = game.title;
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    let t5;
    if ($[8] === Symbol.for("react.memo_cache_sentinel")) {
        t5 = {
            color: COLORS.highlight
        };
        $[8] = t5;
    } else {
        t5 = $[8];
    }
    let t6;
    if ($[9] !== game.genre || $[10] !== game.hours) {
        t6 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            className: "text-sm",
            style: t5,
            children: [
                game.genre,
                " | ",
                game.hours,
                " hrs played"
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 300,
            columnNumber: 10
        }, this);
        $[9] = game.genre;
        $[10] = game.hours;
        $[11] = t6;
    } else {
        t6 = $[11];
    }
    let t7;
    if ($[12] === Symbol.for("react.memo_cache_sentinel")) {
        t7 = {
            backgroundColor: COLORS.playGreen,
            color: COLORS.darkBg
        };
        $[12] = t7;
    } else {
        t7 = $[12];
    }
    let t8;
    if ($[13] !== game || $[14] !== onPlay) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: "mt-3 w-full font-bold py-2 px-4 rounded-none transition-colors text-sm transform hover:scale-[1.02] flex-1",
            style: t7,
            onClick: {
                "GameCard[<button>.onClick]": (e)=>{
                    e.stopPropagation();
                    onPlay(game);
                }
            }["GameCard[<button>.onClick]"],
            children: "PLAY"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 319,
            columnNumber: 10
        }, this);
        $[13] = game;
        $[14] = onPlay;
        $[15] = t8;
    } else {
        t8 = $[15];
    }
    let t9;
    if ($[16] === Symbol.for("react.memo_cache_sentinel")) {
        t9 = {
            backgroundColor: COLORS.highlight,
            color: COLORS.darkBg
        };
        $[16] = t9;
    } else {
        t9 = $[16];
    }
    let t10;
    if ($[17] !== game || $[18] !== onEdit) {
        t10 = ({
            "GameCard[<button>.onClick]": (e_0)=>{
                e_0.stopPropagation();
                onEdit(game);
            }
        })["GameCard[<button>.onClick]"];
        $[17] = game;
        $[18] = onEdit;
        $[19] = t10;
    } else {
        t10 = $[19];
    }
    let t11;
    if ($[20] === Symbol.for("react.memo_cache_sentinel")) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CogIcon, {
            className: "w-5 h-5"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 357,
            columnNumber: 11
        }, this);
        $[20] = t11;
    } else {
        t11 = $[20];
    }
    let t12;
    if ($[21] !== t10) {
        t12 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
            className: "px-3 py-2 rounded-none transition-colors",
            style: t9,
            onClick: t10,
            title: "Edit System",
            children: t11
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 364,
            columnNumber: 11
        }, this);
        $[21] = t10;
        $[22] = t12;
    } else {
        t12 = $[22];
    }
    let t13;
    if ($[23] !== t12 || $[24] !== t8) {
        t13 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex gap-2 mt-3",
            children: [
                t8,
                t12
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 372,
            columnNumber: 11
        }, this);
        $[23] = t12;
        $[24] = t8;
        $[25] = t13;
    } else {
        t13 = $[25];
    }
    let t14;
    if ($[26] !== t13 || $[27] !== t4 || $[28] !== t6) {
        t14 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 bg-black/30 backdrop-brightness-75 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            children: [
                t4,
                t6,
                t13
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 381,
            columnNumber: 11
        }, this);
        $[26] = t13;
        $[27] = t4;
        $[28] = t6;
        $[29] = t14;
    } else {
        t14 = $[29];
    }
    let t15;
    if ($[30] !== t14 || $[31] !== t2) {
        t15 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "group relative overflow-hidden w-64 h-80 rounded-none transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.03] hover:ring-4 hover:ring-gray-200 hover:ring-offset-0 focus:ring-4 focus:ring-gray-200 border border-transparent",
            style: t1,
            children: [
                t2,
                t14
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 391,
            columnNumber: 11
        }, this);
        $[30] = t14;
        $[31] = t2;
        $[32] = t15;
    } else {
        t15 = $[32];
    }
    return t15;
}
_c6 = GameCard;
// Constants
const GAME_EXTENSIONS = [
    '.nes',
    '.snes',
    '.gb',
    '.gbc',
    '.gba',
    '.n64',
    '.z64',
    '.v64',
    '.nds',
    '.3ds',
    '.iso',
    '.rom',
    '.bin',
    '.smc',
    '.sfc'
];
const CARD_COLORS = [
    'bg-blue-600',
    'bg-green-600',
    'bg-indigo-600',
    'bg-yellow-600',
    'bg-red-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-cyan-600'
];
const CARD_EMOJIS = [
    '🎮',
    '🕹️',
    '👾',
    '🎯',
    '🎲',
    '🎪',
    '🎨',
    '🎭'
];
function Home() {
    _s();
    const [activeView, setActiveView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('library');
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [games, setGames] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [editingGame, setEditingGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [systemPickerOpen, setSystemPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingGame, setPendingGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const updateTime = {
                "Home.useEffect.updateTime": ()=>{
                    setCurrentTime(new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }));
                }
            }["Home.useEffect.updateTime"];
            updateTime();
            setIsMounted(true);
            const interval = setInterval(updateTime, 60000);
            // Load games from localStorage on mount
            const loadGames = {
                "Home.useEffect.loadGames": async ()=>{
                    const savedGames = localStorage.getItem('games');
                    if (savedGames) {
                        try {
                            const loadedGames = JSON.parse(savedGames);
                            // Migrate old games with fileData to IndexedDB
                            let migratedGames = loadedGames;
                            for (const game of loadedGames){
                                if (game.fileData) {
                                    migratedGames = await migrateGameToIndexedDB(game, migratedGames);
                                }
                            }
                            if (migratedGames !== loadedGames) {
                                // Update localStorage with migrated games (without fileData)
                                localStorage.setItem('games', JSON.stringify(migratedGames));
                            }
                            setGames(migratedGames);
                        } catch (e) {
                            console.error('Failed to load games from storage', e);
                        }
                    }
                }
            }["Home.useEffect.loadGames"];
            loadGames();
            return ({
                "Home.useEffect": ()=>clearInterval(interval)
            })["Home.useEffect"];
        }
    }["Home.useEffect"], []);
    // Migrate old games with fileData to IndexedDB
    const migrateGameToIndexedDB = async (game_0, allGames)=>{
        if (!game_0.fileData || !game_0.fileData.startsWith('data:')) {
            // Already migrated or invalid
            return allGames;
        }
        try {
            // Convert base64 back to File
            const response = await fetch(game_0.fileData);
            const blob = await response.blob();
            const file = new File([
                blob
            ], game_0.fileName || game_0.title, {
                type: 'application/octet-stream'
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveGameFile"])(game_0.id, file);
            // Remove fileData from game object
            const { fileData, ...gameWithoutData } = game_0;
            return allGames.map((g)=>g.id === game_0.id ? gameWithoutData : g);
        } catch (error) {
            console.error('Error migrating game to IndexedDB:', error);
            return allGames;
        }
    };
    const getSystemFromExtension = (extension)=>{
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
        return FILE_EXTENSIONS[extension.toLowerCase()] || null;
    };
    const selectSystem = (core)=>{
        if (editingGame && pendingGame) {
            // Update existing game
            const updatedGames = games.map((g_0)=>g_0.id === editingGame.id ? {
                    ...g_0,
                    core: core
                } : g_0);
            setGames(updatedGames);
            localStorage.setItem('games', JSON.stringify(updatedGames));
            setEditingGame(null);
            setPendingGame(null);
            setSystemPickerOpen(false);
        } else if (pendingGame) {
            // Add new game
            const newGame = {
                ...pendingGame,
                core: core
            };
            const updatedGames_0 = [
                ...games,
                newGame
            ];
            setGames(updatedGames_0);
            localStorage.setItem('games', JSON.stringify(updatedGames_0));
            setPendingGame(null);
            setSystemPickerOpen(false);
        }
    };
    const handleFileSelect = async ()=>{
        try {
            if ('showOpenFilePicker' in window) {
                const fileHandles = await window.showOpenFilePicker({
                    multiple: true,
                    types: [
                        {
                            description: 'Game Files',
                            accept: {
                                'application/octet-stream': GAME_EXTENSIONS
                            }
                        }
                    ]
                });
                for(let i = 0; i < fileHandles.length; i++){
                    const fileHandle = fileHandles[i];
                    const file_0 = await fileHandle.getFile();
                    const fileName = file_0.name;
                    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
                    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
                    const detectedCore = getSystemFromExtension(fileExtension);
                    const gameId = Date.now() + i;
                    // Save file to IndexedDB
                    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveGameFile"])(gameId, file_0);
                    const gameData = {
                        id: gameId,
                        title: nameWithoutExt,
                        genre: 'ROM',
                        hours: 0,
                        color: CARD_COLORS[i % CARD_COLORS.length],
                        emoji: CARD_EMOJIS[i % CARD_EMOJIS.length],
                        filePath: fileHandle.name,
                        fileName: fileName,
                        core: detectedCore || undefined
                    };
                    if (detectedCore) {
                        // Auto-detected, add directly
                        const newGame_0 = gameData;
                        const updatedGames_1 = [
                            ...games,
                            newGame_0
                        ];
                        setGames(updatedGames_1);
                        localStorage.setItem('games', JSON.stringify(updatedGames_1));
                    } else {
                        // Need to ask for system
                        setPendingGame(gameData);
                        setSystemPickerOpen(true);
                        // Wait for system selection before continuing
                        await new Promise((resolve)=>{
                            const checkInterval = setInterval(()=>{
                                if (!systemPickerOpen && !pendingGame) {
                                    clearInterval(checkInterval);
                                    resolve();
                                }
                            }, 100);
                        });
                    }
                }
            } else {
                // Fallback for browsers without File System Access API
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.accept = GAME_EXTENSIONS.join(',');
                input.onchange = async (e_0)=>{
                    const files = Array.from(e_0.target.files || []);
                    for(let i_0 = 0; i_0 < files.length; i_0++){
                        const file_1 = files[i_0];
                        const nameWithoutExt_0 = file_1.name.replace(/\.[^/.]+$/, '');
                        const fileExtension_0 = file_1.name.split(".").pop()?.toLowerCase() || "";
                        const detectedCore_0 = getSystemFromExtension(fileExtension_0);
                        const gameId_0 = Date.now() + i_0;
                        // Save file to IndexedDB
                        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveGameFile"])(gameId_0, file_1);
                        const gameData_0 = {
                            id: gameId_0,
                            title: nameWithoutExt_0,
                            genre: 'ROM',
                            hours: 0,
                            color: CARD_COLORS[i_0 % CARD_COLORS.length],
                            emoji: CARD_EMOJIS[i_0 % CARD_EMOJIS.length],
                            filePath: file_1.name,
                            fileName: file_1.name,
                            core: detectedCore_0 || undefined
                        };
                        if (detectedCore_0) {
                            const newGame_1 = gameData_0;
                            const updatedGames_2 = [
                                ...games,
                                newGame_1
                            ];
                            setGames(updatedGames_2);
                            localStorage.setItem('games', JSON.stringify(updatedGames_2));
                        } else {
                            setPendingGame(gameData_0);
                            setSystemPickerOpen(true);
                        }
                    }
                };
                input.click();
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting files:', err);
            }
        }
    };
    const handleEditGame = (game_1)=>{
        setEditingGame(game_1);
        setPendingGame({
            ...game_1
        });
        setSystemPickerOpen(true);
    };
    const handlePlayClick = async (game_2)=>{
        try {
            let file_2 = null;
            // Try to get file from IndexedDB first
            file_2 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGameFile"])(game_2.id);
            // Fallback to legacy fileData if IndexedDB doesn't have it
            if (!file_2 && game_2.fileData) {
                const response_0 = await fetch(game_2.fileData);
                const blob_0 = await response_0.blob();
                file_2 = new File([
                    blob_0
                ], game_2.fileName || game_2.title, {
                    type: 'application/octet-stream'
                });
                // Save to IndexedDB for next time
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveGameFile"])(game_2.id, file_2);
            }
            if (file_2) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emulator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadGame"])(file_2, game_2.core);
            } else {
                console.error('Game file not found');
            }
        } catch (error_0) {
            console.error('Error loading game:', error_0);
        }
    };
    const handleNavClick = (viewName)=>{
        setActiveView(viewName);
        setIsSidebarOpen(false);
    };
    const getSidebarButtonClass = (view)=>{
        const baseClass = "sidebar-item block p-3 mb-2 rounded-none transition-all flex items-center border-l-4";
        const isActive = activeView === view;
        return `${baseClass} ${isActive ? 'border-l-4' : 'border-transparent'}`;
    };
    const sidebarClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[sidebarClass]": ()=>{
            return isSidebarOpen ? "translate-x-0" : "-translate-x-full";
        }
    }["Home.useMemo[sidebarClass]"], [
        isSidebarOpen
    ]);
    const sidebarFullClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[sidebarFullClass]": ()=>{
            return `w-64 p-6 flex flex-col justify-start shadow-xl fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-in-out ${sidebarClass}`;
        }
    }["Home.useMemo[sidebarFullClass]"], [
        sidebarClass
    ]);
    const renderContent = ()=>{
        if (activeView === 'store') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg mt-10 p-6 rounded-none",
                    style: {
                        backgroundColor: COLORS.midDark,
                        color: COLORS.highlight
                    },
                    children: "Welcome to the Store! Discover new games and DLC here."
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 703,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 702,
                columnNumber: 14
            }, this);
        }
        if (activeView === 'downloads') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg mt-10 p-6 rounded-none",
                    style: {
                        backgroundColor: COLORS.midDark,
                        color: COLORS.highlight
                    },
                    children: "No active downloads. You are ready to play!"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 713,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 712,
                columnNumber: 14
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-xl font-semibold",
                            style: {
                                color: COLORS.highlight
                            },
                            children: [
                                "Installed Games (",
                                games.length,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 723,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleFileSelect,
                            className: "px-4 py-2 rounded-none font-semibold transition-colors",
                            style: {
                                backgroundColor: COLORS.playGreen,
                                color: COLORS.darkBg
                            },
                            children: "Add Games"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 728,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 722,
                    columnNumber: 9
                }, this),
                games.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-lg mb-4",
                            style: {
                                color: COLORS.highlight
                            },
                            children: "No games found"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 736,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleFileSelect,
                            className: "px-6 py-3 rounded-none font-semibold transition-colors",
                            style: {
                                backgroundColor: COLORS.playGreen,
                                color: COLORS.darkBg
                            },
                            children: "Add Your First Game"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 739,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 735,
                    columnNumber: 31
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap",
                    style: {
                        gap: '0.75rem'
                    },
                    children: games.map((game_3)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GameCard, {
                            game: game_3,
                            onPlay: handlePlayClick,
                            onEdit: handleEditGame
                        }, game_3.id, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 748,
                            columnNumber: 34
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 745,
                    columnNumber: 20
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 721,
            columnNumber: 12
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col",
        style: {
            backgroundColor: COLORS.darkBg,
            fontFamily: 'Inter, sans-serif'
        },
        children: [
            isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 z-40",
                onClick: ()=>setIsSidebarOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 756,
                columnNumber: 25
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: sidebarFullClass,
                style: {
                    backgroundColor: COLORS.midDark
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-3xl font-bold mb-10",
                        style: {
                            color: COLORS.highlight
                        },
                        children: "joe t emulator"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 760,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        children: [
                            {
                                view: 'library',
                                icon: BookOpenIcon,
                                label: 'Library'
                            },
                            {
                                view: 'store',
                                icon: ShoppingBagIcon,
                                label: 'Store'
                            },
                            {
                                view: 'downloads',
                                icon: DownloadIcon,
                                label: 'Downloads'
                            }
                        ].map(({ view: view_0, icon: Icon, label })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: getSidebarButtonClass(view_0),
                                style: {
                                    backgroundColor: activeView === view_0 ? COLORS.sidebarHover : 'transparent',
                                    borderLeftColor: activeView === view_0 ? COLORS.highlight : 'transparent',
                                    color: COLORS.softLight
                                },
                                onClick: ()=>handleNavClick(view_0),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                        className: "w-6 h-6 mr-3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 787,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold",
                                        children: label
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 788,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, view_0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 782,
                                columnNumber: 15
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 765,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 757,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "p-8 overflow-y-auto pb-20",
                    style: {
                        minHeight: 'calc(100vh - 4rem)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                            className: "mb-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-4xl font-extrabold",
                                        style: {
                                            color: COLORS.softLight
                                        },
                                        children: activeView.charAt(0).toUpperCase() + activeView.slice(1)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 798,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-3",
                                        children: [
                                            isMounted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "hidden sm:block text-xs font-normal",
                                                style: {
                                                    color: COLORS.highlight
                                                },
                                                children: currentTime
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 804,
                                                columnNumber: 31
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "hidden sm:block",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-semibold text-sm",
                                                    style: {
                                                        color: COLORS.softLight
                                                    },
                                                    children: "Player One"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 810,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 809,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-10 h-10 rounded-none flex items-center justify-center font-bold text-lg",
                                                style: {
                                                    backgroundColor: COLORS.highlight,
                                                    color: COLORS.darkBg
                                                },
                                                children: "P"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 814,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 803,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 797,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 796,
                            columnNumber: 11
                        }, this),
                        renderContent()
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 793,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 792,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-between px-6 z-50",
                style: {
                    backgroundColor: COLORS.midDark,
                    borderColor: COLORS.sidebarHover
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "p-2 rounded-none transition-colors hover:bg-gray-700",
                        onClick: ()=>setIsSidebarOpen(!isSidebarOpen),
                        style: {
                            color: COLORS.highlight,
                            backgroundColor: isSidebarOpen ? COLORS.sidebarHover : 'transparent'
                        },
                        children: isSidebarOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(XIcon, {
                            className: "w-8 h-8"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 832,
                            columnNumber: 28
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MenuIcon, {
                            className: "w-8 h-8"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 832,
                            columnNumber: 60
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 828,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 mx-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 834,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 824,
                columnNumber: 7
            }, this),
            systemPickerOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 backdrop-brightness-50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8 rounded-none max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border-2",
                    style: {
                        backgroundColor: COLORS.midDark,
                        borderColor: COLORS.highlight
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-2xl font-bold mb-4",
                            style: {
                                color: COLORS.softLight
                            },
                            children: editingGame ? 'Select System for ' + editingGame.title : 'Select System'
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 841,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6",
                            children: Object.entries(SYSTEM_PICKER).map(([name, core_0])=>{
                                const currentCore = editingGame?.core || pendingGame?.core;
                                const isSelected = currentCore === core_0;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "p-4 rounded-none text-left transition-colors border-2",
                                    style: {
                                        backgroundColor: isSelected ? COLORS.playGreen : COLORS.sidebarHover,
                                        borderColor: isSelected ? COLORS.playGreen : COLORS.highlight,
                                        color: isSelected ? COLORS.darkBg : COLORS.softLight
                                    },
                                    onClick: ()=>selectSystem(core_0),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-semibold text-sm",
                                        children: name
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 855,
                                        columnNumber: 21
                                    }, this)
                                }, core_0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 850,
                                    columnNumber: 20
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 846,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "py-2 px-4 rounded-none font-semibold transition-colors",
                                style: {
                                    backgroundColor: COLORS.highlight,
                                    color: COLORS.darkBg
                                },
                                onClick: ()=>{
                                    setSystemPickerOpen(false);
                                    setPendingGame(null);
                                    setEditingGame(null);
                                },
                                children: "Cancel"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 860,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 859,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 837,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 836,
                columnNumber: 28
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 752,
        columnNumber: 10
    }, this);
}
_s(Home, "5Govkn5320lW2zfTGcvBzGKHA+k=");
_c7 = Home;
var _c, _c1, _c2, _c3, _c4, _c5, _c6, _c7;
__turbopack_context__.k.register(_c, "BookOpenIcon");
__turbopack_context__.k.register(_c1, "ShoppingBagIcon");
__turbopack_context__.k.register(_c2, "DownloadIcon");
__turbopack_context__.k.register(_c3, "MenuIcon");
__turbopack_context__.k.register(_c4, "XIcon");
__turbopack_context__.k.register(_c5, "CogIcon");
__turbopack_context__.k.register(_c6, "GameCard");
__turbopack_context__.k.register(_c7, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
            case REACT_VIEW_TRANSITION_TYPE:
                return "ViewTransition";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return type.displayName || "Context";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, props, owner, debugStack, debugTask) {
        var refProp = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== refProp ? refProp : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, maybeKey, getOwner(), debugStack, debugTask);
    }
    function validateChildKeys(node) {
        isValidElement(node) ? node._store && (node._store.validated = 1) : "object" === typeof node && null !== node && node.$$typeof === REACT_LAZY_TYPE && ("fulfilled" === node._payload.status ? isValidElement(node._payload.value) && node._payload.value._store && (node._payload.value._store.validated = 1) : node._store && (node._store.validated = 1));
    }
    function isValidElement(object) {
        return "object" === typeof object && null !== object && object.$$typeof === REACT_ELEMENT_TYPE;
    }
    var React = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler"), REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_VIEW_TRANSITION_TYPE = Symbol.for("react.view_transition"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        react_stack_bottom_frame: function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React.react_stack_bottom_frame.bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        if (trackActualOwner) {
            var previousStackTraceLimit = Error.stackTraceLimit;
            Error.stackTraceLimit = 10;
            var debugStackDEV = Error("react-stack-top-frame");
            Error.stackTraceLimit = previousStackTraceLimit;
        } else debugStackDEV = unknownOwnerDebugStack;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, debugStackDEV, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}),
"[project]/node_modules/next/dist/compiled/react/cjs/react-compiler-runtime.development.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * @license React
 * react-compiler-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    var ReactSharedInternals = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)").__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    exports.c = function(size) {
        var dispatcher = ReactSharedInternals.H;
        null === dispatcher && console.error("Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for one of the following reasons:\n1. You might have mismatching versions of React and the renderer (such as React DOM)\n2. You might be breaking the Rules of Hooks\n3. You might have more than one copy of React in the same app\nSee https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.");
        return dispatcher.useMemoCache(size);
    };
}();
}),
"[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/compiled/react/cjs/react-compiler-runtime.development.js [app-client] (ecmascript)");
}
}),
]);

//# sourceMappingURL=_f1c547bd._.js.map