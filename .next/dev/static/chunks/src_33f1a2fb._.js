(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/ejsConfig.js [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "configureEjs",
    ()=>configureEjs
]);
const DEFAULT_EJS_COLOR = '#003d8c';
const HEX_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const THREADS_ENABLED = [
    'psp',
    'dosbox_pure'
];
const ensureHexColor = (value)=>{
    if (typeof value !== 'string') return DEFAULT_EJS_COLOR;
    const trimmed = value.trim();
    return HEX_PATTERN.test(trimmed) ? trimmed : DEFAULT_EJS_COLOR;
};
const configureEjs = (options = {})=>{
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const { gameName = '', gameFile = '', core = 'nes', themeColor, cdnPath = '' } = options;
    window.EJS_color = ensureHexColor(themeColor);
    window.EJS_backgroundColor = '#000000';
    window.EJS_player = '#game';
    window.EJS_gameName = gameName;
    window.EJS_gameUrl = gameFile;
    window.EJS_core = core;
    window.EJS_pathtodata = cdnPath;
    window.EJS_startOnLoaded = true;
    window.EJS_biosUrl = '';
    window.EJS_threads = THREADS_ENABLED.includes(core);
    window.EJS_defaultOptions = {
        'save-save-interval': '60',
        'desmume_advanced_timing': 'disabled',
        'webgl2Enabled': 'enabled',
        ...core === 'segaGG' ? {
            retroarch_core: 'genesis_plus_gx'
        } : {},
        ...core === 'nds' ? {
            retroarch_core: 'desmume'
        } : {}
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
};
if ("TURBOPACK compile-time truthy", 1) {
    window.configureEjs = configureEjs;
}
;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ejsConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/ejsConfig.js [app-client] (ecmascript)");
;
;
const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
const DEFAULT_EJS_COLOR = "#003d8c";
const ensureHexColor = (value)=>{
    if (!value) return DEFAULT_EJS_COLOR;
    const trimmed = value.trim();
    const hexPattern = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    return hexPattern.test(trimmed) ? trimmed : DEFAULT_EJS_COLOR;
};
if ("TURBOPACK compile-time truthy", 1) {
    window.gameRunning = false;
}
async function detectCore(extension) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension]) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension];
    }
    // Fallback to NES if system picker not available
    return new Promise((resolve)=>{
        if (("TURBOPACK compile-time value", "object") !== 'undefined' && window.showSystemPicker) {
            window.showSystemPicker(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYSTEM_PICKER_FLAT"], resolve);
        } else {
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
    if ("TURBOPACK compile-time truthy", 1) {
        window.gameRunning = true;
    }
    configureEmulator(gameName, file, core, themeColor);
    loadEmulatorScript();
}
function configureEmulator(gameName, gameFile, core, themeColor) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$ejsConfig$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["configureEjs"])({
        gameName,
        gameFile,
        core,
        themeColor,
        cdnPath: CDN_PATH
    });
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return window.EJS_emulator?.started ? window.EJS_emulator : null;
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
if ("TURBOPACK compile-time truthy", 1) {
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gamepad-2.js [app-client] (ecmascript) <export default as Gamepad2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/info.js [app-client] (ecmascript) <export default as Info>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-client] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
const THEMES = {
    dark: {
        highlight: '#cccccc',
        darkBg: '#0f0f0f',
        midDark: '#1e1e1e',
        softLight: '#f5f5f5',
        sidebarHover: '#333333',
        playGreen: '#00ff7f',
        gradientFrom: '#00ff7f',
        gradientTo: '#00cc66'
    },
    blue: {
        highlight: '#bfdbfe',
        darkBg: '#0c1220',
        midDark: '#1e293b',
        softLight: '#eff6ff',
        sidebarHover: '#334155',
        playGreen: '#60a5fa',
        gradientFrom: '#60a5fa',
        gradientTo: '#3b82f6'
    },
    purple: {
        highlight: '#ddd6fe',
        darkBg: '#1a0f2e',
        midDark: '#2d1b3d',
        softLight: '#faf5ff',
        sidebarHover: '#3f2d52',
        playGreen: '#c084fc',
        gradientFrom: '#c084fc',
        gradientTo: '#a855f7'
    },
    green: {
        highlight: '#bbf7d0',
        darkBg: '#0f1a0f',
        midDark: '#1e2e1e',
        softLight: '#f0fdf4',
        sidebarHover: '#2d3e2d',
        playGreen: '#4ade80',
        gradientFrom: '#4ade80',
        gradientTo: '#22c55e'
    },
    orange: {
        highlight: '#fde68a',
        darkBg: '#1f1206',
        midDark: '#2e1a0a',
        softLight: '#fffbeb',
        sidebarHover: '#3d2814',
        playGreen: '#fbbf24',
        gradientFrom: '#fbbf24',
        gradientTo: '#f59e0b'
    },
    red: {
        highlight: '#fecaca',
        darkBg: '#1f0a0a',
        midDark: '#2e1414',
        softLight: '#fef2f2',
        sidebarHover: '#3d1f1f',
        playGreen: '#f87171',
        gradientFrom: '#f87171',
        gradientTo: '#ef4444'
    },
    pink: {
        highlight: '#fbcfe8',
        darkBg: '#1f0f1a',
        midDark: '#2e1420',
        softLight: '#fdf2f8',
        sidebarHover: '#3d1f2d',
        playGreen: '#f472b6',
        gradientFrom: '#f472b6',
        gradientTo: '#ec4899'
    },
    cyan: {
        highlight: '#a7f3d0',
        darkBg: '#0a1a1f',
        midDark: '#142a2e',
        softLight: '#f0fdfa',
        sidebarHover: '#1f3d42',
        playGreen: '#22d3ee',
        gradientFrom: '#22d3ee',
        gradientTo: '#06b6d4'
    },
    yellow: {
        highlight: '#fef08a',
        darkBg: '#1f1a0a',
        midDark: '#2e2814',
        softLight: '#fefce8',
        sidebarHover: '#3d3d1f',
        playGreen: '#eab308',
        gradientFrom: '#eab308',
        gradientTo: '#ca8a04'
    },
    teal: {
        highlight: '#99f6e4',
        darkBg: '#0a1a1a',
        midDark: '#142a2a',
        softLight: '#f0fdfa',
        sidebarHover: '#1f3d3d',
        playGreen: '#2dd4bf',
        gradientFrom: '#2dd4bf',
        gradientTo: '#14b8a6'
    },
    indigo: {
        highlight: '#c7d2fe',
        darkBg: '#0f0f1f',
        midDark: '#1e1e2e',
        softLight: '#eef2ff',
        sidebarHover: '#2d2d3e',
        playGreen: '#818cf8',
        gradientFrom: '#818cf8',
        gradientTo: '#6366f1'
    }
};
// Helper function to get gradient background
const getGradientStyle = (from, to)=>({
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
    });
// Get system display name from core
const getSystemDisplayName = (core)=>{
    if (!core) return 'Unknown';
    const systemMap = {
        'nes': 'NES',
        'gb': 'GB',
        'gbc': 'GBC',
        'snes': 'SNES',
        'vb': 'VB',
        'n64': 'N64',
        'gba': 'GBA',
        'nds': 'DS',
        'segaMS': 'MS',
        'segaMD': 'MD',
        'segaGG': 'GG',
        'segaCD': 'CD',
        'sega32x': '32X',
        'segaSaturn': 'Saturn',
        'psx': 'PS1',
        'psp': 'PSP',
        'atari2600': '2600',
        'atari5200': '5200',
        'atari7800': '7800',
        'lynx': 'Lynx',
        'jaguar': 'Jaguar',
        'opera': '3DO',
        'arcade': 'Arcade',
        'mame2003_plus': 'MAME',
        'dosbox_pure': 'DOS',
        'vice_xpet': 'PET',
        'vice_xvic': 'VIC20',
        'amiga': 'Amiga',
        'vice_x64': 'C64',
        'vice_x128': 'C128',
        'vice_xplus4': 'Plus/4',
        'coleco': 'Coleco',
        'pce': 'TG16',
        'pcfx': 'PC-FX',
        'ngp': 'NGP',
        'ws': 'WS'
    };
    return systemMap[core] || core.toUpperCase();
};
function GameCard(t0) {
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(42);
    if ($[0] !== "92851bd8658b90abf5578ac3d19eae670ea232d61f0d416d71afcf136bb3d136") {
        for(let $i = 0; $i < 42; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "92851bd8658b90abf5578ac3d19eae670ea232d61f0d416d71afcf136bb3d136";
    }
    const { game, onPlay, onEdit, onDelete, onSelect, isSelected, isDeleteMode, onEnterDeleteMode, onCoverArtClick, colors } = t0;
    const cardClass = `group relative overflow-hidden w-64 h-80 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg hover:z-10 border animate-border-breathe ${isDeleteMode ? "animate-shake" : "hover:scale-[1.02]"}`;
    const t1 = isDeleteMode && isSelected ? "#ef4444" : colors.midDark;
    const t2 = isDeleteMode ? "pointer" : "default";
    let t3;
    if ($[1] !== t1 || $[2] !== t2) {
        t3 = {
            backgroundColor: t1,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
            cursor: t2
        };
        $[1] = t1;
        $[2] = t2;
        $[3] = t3;
    } else {
        t3 = $[3];
    }
    let t4;
    if ($[4] !== game.id || $[5] !== isDeleteMode || $[6] !== onSelect) {
        t4 = ({
            "GameCard[<div>.onClick]": ()=>isDeleteMode && onSelect(game.id)
        })["GameCard[<div>.onClick]"];
        $[4] = game.id;
        $[5] = isDeleteMode;
        $[6] = onSelect;
        $[7] = t4;
    } else {
        t4 = $[7];
    }
    let t5;
    if ($[8] !== isDeleteMode || $[9] !== isSelected) {
        t5 = isDeleteMode && isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 bg-red-500/40 z-20 flex items-center justify-center rounded-xl",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                className: "w-16 h-16 text-white drop-shadow-lg"
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 232,
                columnNumber: 137
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 232,
            columnNumber: 40
        }, this);
        $[8] = isDeleteMode;
        $[9] = isSelected;
        $[10] = t5;
    } else {
        t5 = $[10];
    }
    let t6;
    if ($[11] !== isDeleteMode || $[12] !== isSelected) {
        t6 = isDeleteMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute bottom-3 right-3 z-20",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all",
                style: {
                    backgroundColor: isSelected ? "white" : "transparent"
                },
                children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                    className: "w-4 h-4 text-red-500",
                    fill: "currentColor",
                    viewBox: "0 0 20 20",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                        fillRule: "evenodd",
                        d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                        clipRule: "evenodd"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 243,
                        columnNumber: 103
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 243,
                    columnNumber: 25
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 241,
                columnNumber: 74
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 241,
            columnNumber: 26
        }, this);
        $[11] = isDeleteMode;
        $[12] = isSelected;
        $[13] = t6;
    } else {
        t6 = $[13];
    }
    let t7;
    if ($[14] !== colors || $[15] !== game.coverArt || $[16] !== game.coverArtFit) {
        t7 = game.coverArt ? {
            backgroundImage: `url(${game.coverArt})`,
            backgroundColor: "transparent",
            backgroundSize: game.coverArtFit || "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        } : {
            ...getGradientStyle(colors.gradientFrom, colors.gradientTo)
        };
        $[14] = colors;
        $[15] = game.coverArt;
        $[16] = game.coverArtFit;
        $[17] = t7;
    } else {
        t7 = $[17];
    }
    let t8;
    if ($[18] !== colors || $[19] !== game || $[20] !== isDeleteMode || $[21] !== onCoverArtClick) {
        t8 = !game.coverArt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center justify-center",
            style: {
                color: colors.darkBg
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                    className: "text-4xl font-bold tracking-wide",
                    style: {
                        textShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    },
                    children: getSystemDisplayName(game.core)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 272,
                    columnNumber: 8
                }, this),
                onCoverArtClick && !isDeleteMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    onClick: {
                        "GameCard[<button>.onClick]": (e)=>{
                            e.stopPropagation();
                            onCoverArtClick(game);
                        }
                    }["GameCard[<button>.onClick]"],
                    className: "absolute inset-0",
                    "aria-label": "Add cover art",
                    title: "Add cover art",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "sr-only",
                        children: "Add cover art"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 279,
                        columnNumber: 118
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 274,
                    columnNumber: 87
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 270,
            columnNumber: 28
        }, this);
        $[18] = colors;
        $[19] = game;
        $[20] = isDeleteMode;
        $[21] = onCoverArtClick;
        $[22] = t8;
    } else {
        t8 = $[22];
    }
    let t9;
    if ($[23] !== t7 || $[24] !== t8) {
        t9 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative",
            style: t7,
            children: t8
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 290,
            columnNumber: 10
        }, this);
        $[23] = t7;
        $[24] = t8;
        $[25] = t9;
    } else {
        t9 = $[25];
    }
    let t10;
    if ($[26] !== colors || $[27] !== game || $[28] !== isDeleteMode || $[29] !== onDelete || $[30] !== onEdit || $[31] !== onEnterDeleteMode || $[32] !== onPlay) {
        t10 = !isDeleteMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-brightness-75 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold truncate mb-1.5",
                        style: {
                            color: colors.softLight,
                            textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                        },
                        children: game.title
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 299,
                        columnNumber: 378
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm mb-3",
                        style: {
                            color: colors.highlight
                        },
                        children: game.genre
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 302,
                        columnNumber: 29
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2.5 items-stretch mt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "w-full font-bold py-2.5 px-4 rounded-lg transition-all text-sm hover:shadow-md active:scale-[0.98] flex-1",
                                style: {
                                    ...getGradientStyle(colors.gradientFrom, colors.gradientTo),
                                    color: colors.darkBg
                                },
                                onClick: {
                                    "GameCard[<button>.onClick]": (e_0)=>{
                                        e_0.stopPropagation();
                                        onPlay(game);
                                    }
                                }["GameCard[<button>.onClick]"],
                                children: "PLAY"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 304,
                                columnNumber: 77
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center",
                                style: {
                                    backgroundColor: colors.highlight,
                                    color: colors.darkBg
                                },
                                onClick: {
                                    "GameCard[<button>.onClick]": (e_1)=>{
                                        e_1.stopPropagation();
                                        onEdit(game);
                                    }
                                }["GameCard[<button>.onClick]"],
                                title: "Edit System",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 320,
                                    columnNumber: 64
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 312,
                                columnNumber: 57
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center select-none",
                                style: {
                                    backgroundColor: "#ef4444",
                                    color: colors.softLight
                                },
                                onMouseDown: {
                                    "GameCard[<button>.onMouseDown]": (e_2)=>{
                                        e_2.stopPropagation();
                                        const timeout = setTimeout({
                                            "GameCard[<button>.onMouseDown > setTimeout()]": ()=>{
                                                onEnterDeleteMode();
                                            }
                                        }["GameCard[<button>.onMouseDown > setTimeout()]"], 500);
                                        const cleanup = {
                                            "GameCard[<button>.onMouseDown > cleanup]": ()=>clearTimeout(timeout)
                                        }["GameCard[<button>.onMouseDown > cleanup]"];
                                        e_2.currentTarget.addEventListener("mouseup", cleanup, {
                                            once: true
                                        });
                                        e_2.currentTarget.addEventListener("mouseleave", cleanup, {
                                            once: true
                                        });
                                    }
                                }["GameCard[<button>.onMouseDown]"],
                                onTouchStart: {
                                    "GameCard[<button>.onTouchStart]": (e_3)=>{
                                        e_3.stopPropagation();
                                        const timeout_0 = setTimeout({
                                            "GameCard[<button>.onTouchStart > setTimeout()]": ()=>{
                                                onEnterDeleteMode();
                                            }
                                        }["GameCard[<button>.onTouchStart > setTimeout()]"], 500);
                                        const cleanup_0 = {
                                            "GameCard[<button>.onTouchStart > cleanup_0]": ()=>clearTimeout(timeout_0)
                                        }["GameCard[<button>.onTouchStart > cleanup_0]"];
                                        e_3.currentTarget.addEventListener("touchend", cleanup_0, {
                                            once: true
                                        });
                                    }
                                }["GameCard[<button>.onTouchStart]"],
                                onClick: {
                                    "GameCard[<button>.onClick]": (e_4)=>{
                                        e_4.stopPropagation();
                                        onDelete(game);
                                    }
                                }["GameCard[<button>.onClick]"],
                                title: "Delete",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 361,
                                    columnNumber: 59
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 320,
                                columnNumber: 105
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 304,
                        columnNumber: 28
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 299,
                columnNumber: 240
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 299,
            columnNumber: 28
        }, this);
        $[26] = colors;
        $[27] = game;
        $[28] = isDeleteMode;
        $[29] = onDelete;
        $[30] = onEdit;
        $[31] = onEnterDeleteMode;
        $[32] = onPlay;
        $[33] = t10;
    } else {
        t10 = $[33];
    }
    let t11;
    if ($[34] !== cardClass || $[35] !== t10 || $[36] !== t3 || $[37] !== t4 || $[38] !== t5 || $[39] !== t6 || $[40] !== t9) {
        t11 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: cardClass,
            style: t3,
            onClick: t4,
            children: [
                t5,
                t6,
                t9,
                t10
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 375,
            columnNumber: 11
        }, this);
        $[34] = cardClass;
        $[35] = t10;
        $[36] = t3;
        $[37] = t4;
        $[38] = t5;
        $[39] = t6;
        $[40] = t9;
        $[41] = t11;
    } else {
        t11 = $[41];
    }
    return t11;
}
_c = GameCard;
function Home() {
    _s();
    const [activeView, setActiveView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('library');
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [games, setGames] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [editingGame, setEditingGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [systemPickerOpen, setSystemPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [systemPickerClosing, setSystemPickerClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingGame, setPendingGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pendingFiles, setPendingFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [systemSearchQuery, setSystemSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [duplicateMessage, setDuplicateMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showDuplicateMessage, setShowDuplicateMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoadingGames, setIsLoadingGames] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedTheme, setSelectedTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('dark');
    const [searchFocused, setSearchFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [coverArtFit, setCoverArtFit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('cover');
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('title');
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('asc');
    const [isHydrated, setIsHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedGameIds, setSelectedGameIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [isDeleteMode, setIsDeleteMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deletingGameIds, setDeletingGameIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [shouldAnimateEntries, setShouldAnimateEntries] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    // Sync theme from localStorage immediately before first render to prevent flash
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "Home.useLayoutEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const savedTheme = localStorage.getItem('theme') || 'dark';
            setSelectedTheme(savedTheme);
            setIsHydrated(true);
        }
    }["Home.useLayoutEffect"], []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            localStorage.setItem('theme', selectedTheme);
        }
    }["Home.useEffect"], [
        selectedTheme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            // Load sort preferences from localStorage
            const savedSortBy = localStorage.getItem('sortBy') || 'title';
            const savedSortOrder = localStorage.getItem('sortOrder') || 'asc';
            setSortBy(savedSortBy);
            setSortOrder(savedSortOrder);
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
                    setIsLoadingGames(true);
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
                            // Migrate games: update genre and coverArtFit
                            migratedGames = migratedGames.map({
                                "Home.useEffect.loadGames": (game_0)=>{
                                    let updated = {
                                        ...game_0
                                    };
                                    if (game_0.genre === 'ROM' && game_0.core) {
                                        const systemName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSystemNameByCore"])(game_0.core);
                                        updated.genre = systemName;
                                    }
                                    if (game_0.coverArt && !game_0.coverArtFit) {
                                        updated.coverArtFit = 'cover';
                                    }
                                    return updated;
                                }
                            }["Home.useEffect.loadGames"]);
                            if (migratedGames !== loadedGames) {
                                // Update localStorage with migrated games (without fileData)
                                localStorage.setItem('games', JSON.stringify(migratedGames));
                            }
                            setGames(migratedGames);
                        } catch (e) {
                            console.error('Failed to load games from storage', e);
                        }
                    }
                    setIsLoadingGames(false);
                }
            }["Home.useEffect.loadGames"];
            loadGames();
            return ({
                "Home.useEffect": ()=>clearInterval(interval)
            })["Home.useEffect"];
        }
    }["Home.useEffect"], []);
    // Save sort preferences to localStorage when they change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            localStorage.setItem('sortBy', sortBy);
        }
    }["Home.useEffect"], [
        sortBy
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Home.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            localStorage.setItem('sortOrder', sortOrder);
        }
    }["Home.useEffect"], [
        sortOrder
    ]);
    // Close system picker with fade-out animation
    const closeSystemPicker = ()=>{
        setSystemPickerClosing(true);
        setTimeout(()=>{
            setSystemPickerOpen(false);
            setSystemPickerClosing(false);
            setPendingFiles([]);
            setPendingGame(null);
            setEditingGame(null);
            setSystemSearchQuery('');
        }, 200); // Match the fade-out animation duration
    };
    const handleSystemPickerDone = async ()=>{
        if (editingGame) {
            closeSystemPicker();
            return;
        }
        if (pendingFiles.length === 1 && pendingGame?.core) {
            try {
                const { file } = pendingFiles[0];
                const gameId = pendingGame.id ?? Date.now();
                const fileName = pendingGame.fileName || file.name;
                const derivedTitle = pendingGame.title || file.name.replace(/\.[^/.]+$/, '');
                const genre = pendingGame.genre || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSystemNameByCore"])(pendingGame.core) || 'Unknown System';
                const isDuplicate = games.some((g)=>g.fileName === file.name);
                if (isDuplicate) {
                    setDuplicateMessage(`"${file.name}" is already in your library`);
                    setShowDuplicateMessage(true);
                    closeSystemPicker();
                    setTimeout(()=>setShowDuplicateMessage(false), 2500);
                    setTimeout(()=>setDuplicateMessage(null), 3000);
                    return;
                }
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveGameFile"])(gameId, file);
                const newGame = {
                    id: gameId,
                    title: derivedTitle,
                    genre,
                    filePath: pendingGame.filePath || file.name,
                    fileName,
                    core: pendingGame.core,
                    coverArt: pendingGame.coverArt,
                    coverArtFit: pendingGame.coverArt ? pendingGame.coverArtFit || coverArtFit : undefined
                };
                const updatedGames = [
                    ...games,
                    newGame
                ];
                setGames(updatedGames);
                localStorage.setItem('games', JSON.stringify(updatedGames));
            } catch (error) {
                console.error('Error finalizing game addition:', error);
            }
        }
        closeSystemPicker();
    };
    // Migrate old games with fileData to IndexedDB
    const migrateGameToIndexedDB = async (game_1, allGames)=>{
        if (!game_1.fileData || !game_1.fileData.startsWith('data:')) {
            // Already migrated or invalid
            return allGames;
        }
        try {
            // Convert base64 back to File
            const response = await fetch(game_1.fileData);
            const blob = await response.blob();
            const file_0 = new File([
                blob
            ], game_1.fileName || game_1.title, {
                type: 'application/octet-stream'
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveGameFile"])(game_1.id, file_0);
            // Remove fileData from game object
            const { fileData, ...gameWithoutData } = game_1;
            return allGames.map((g_0)=>g_0.id === game_1.id ? gameWithoutData : g_0);
        } catch (error_0) {
            console.error('Error migrating game to IndexedDB:', error_0);
            return allGames;
        }
    };
    const getSystemFromExtension = (extension)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension.toLowerCase()] || null;
    };
    const processGameFile = async (file_1, index, selectedCore, currentGamesList)=>{
        const fileName_0 = file_1.name;
        const nameWithoutExt = fileName_0.replace(/\.[^/.]+$/, '');
        const fileExtension = fileName_0.split(".").pop()?.toLowerCase() || "";
        // Check for duplicates
        const gamesListToCheck = currentGamesList || games;
        const isDuplicate_0 = gamesListToCheck.some((g_1)=>g_1.fileName === fileName_0 || g_1.filePath === file_1.name);
        if (isDuplicate_0) {
            setDuplicateMessage(`"${fileName_0}" is already in your library`);
            setShowDuplicateMessage(true);
            setTimeout(()=>setShowDuplicateMessage(false), 2500);
            setTimeout(()=>setDuplicateMessage(null), 3000);
            return gamesListToCheck;
        }
        const detectedCore = selectedCore || getSystemFromExtension(fileExtension);
        const gameId_0 = Date.now() + index;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveGameFile"])(gameId_0, file_1);
        // Get system name for genre display
        const systemName_0 = detectedCore ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSystemNameByCore"])(detectedCore) : 'Unknown System';
        const gameData = {
            id: gameId_0,
            title: nameWithoutExt,
            genre: systemName_0,
            filePath: file_1.name,
            fileName: fileName_0,
            core: detectedCore || undefined
        };
        if (detectedCore) {
            const newGame_0 = gameData;
            const updatedGames_0 = [
                ...gamesListToCheck,
                newGame_0
            ];
            setGames(updatedGames_0);
            localStorage.setItem('games', JSON.stringify(updatedGames_0));
            return updatedGames_0;
        }
        return gamesListToCheck;
    };
    const selectSystem = async (core)=>{
        const systemName_1 = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getSystemNameByCore"])(core);
        // If adding multiple files from file picker
        if (pendingFiles.length > 1) {
            let currentGames = games;
            for (const { file: file_2, index: index_0 } of pendingFiles){
                currentGames = await processGameFile(file_2, index_0, core, currentGames);
            }
            setPendingFiles([]);
            closeSystemPicker();
            return;
        }
        // If adding a single file from file picker without detected system
        if (editingGame) {
            // When editing, update the selection and keep modal open
            const updatedGames_1 = games.map((g_2)=>g_2.id === editingGame.id ? {
                    ...g_2,
                    core: core,
                    genre: systemName_1
                } : g_2);
            setGames(updatedGames_1);
            localStorage.setItem('games', JSON.stringify(updatedGames_1));
            // Update the editing game and pending game to reflect the new selection
            setEditingGame({
                ...editingGame,
                core: core,
                genre: systemName_1
            });
            if (pendingGame) {
                setPendingGame({
                    ...pendingGame,
                    core: core,
                    genre: systemName_1
                });
            }
        // Don't close the modal - let user close it manually
        } else if (pendingGame) {
            setPendingGame({
                ...pendingGame,
                core: core,
                genre: systemName_1
            });
        }
    };
    const applyCoverArt = async (coverArt)=>{
        if (!coverArt) return;
        if (editingGame) {
            const updatedGames_2 = games.map((g_3)=>g_3.id === editingGame.id ? {
                    ...g_3,
                    coverArt: coverArt,
                    coverArtFit: coverArtFit
                } : g_3);
            setGames(updatedGames_2);
            localStorage.setItem('games', JSON.stringify(updatedGames_2));
            setEditingGame({
                ...editingGame,
                coverArt: coverArt,
                coverArtFit: coverArtFit
            });
            if (pendingGame && pendingGame.id === editingGame.id) {
                setPendingGame({
                    ...pendingGame,
                    coverArt: coverArt,
                    coverArtFit: coverArtFit
                });
            }
        } else if (pendingGame) {
            setPendingGame({
                ...pendingGame,
                coverArt: coverArt,
                coverArtFit: coverArtFit
            });
        }
    };
    const updateCoverArtFit = (newFit)=>{
        if (editingGame && (editingGame.coverArt || pendingGame?.coverArt)) {
            const updatedGames_3 = games.map((g_4)=>g_4.id === editingGame.id ? {
                    ...g_4,
                    coverArtFit: newFit
                } : g_4);
            setGames(updatedGames_3);
            localStorage.setItem('games', JSON.stringify(updatedGames_3));
            setEditingGame({
                ...editingGame,
                coverArtFit: newFit
            });
            if (pendingGame && pendingGame.id === editingGame.id) {
                setPendingGame({
                    ...pendingGame,
                    coverArtFit: newFit
                });
            }
        } else if (pendingGame && pendingGame.coverArt) {
            setPendingGame({
                ...pendingGame,
                coverArtFit: newFit
            });
        }
    };
    const handleCoverArtFileUpload = async (file_3)=>{
        try {
            const reader = new FileReader();
            reader.onload = (e_0)=>{
                const dataUrl = e_0.target?.result;
                applyCoverArt(dataUrl);
            };
            reader.onerror = ()=>{
                console.error('Error reading file');
            };
            reader.readAsDataURL(file_3);
        } catch (error_1) {
            console.error('Error uploading cover art:', error_1);
        }
    };
    const removeCoverArt = ()=>{
        if (editingGame) {
            const updatedGames_4 = games.map((g_5)=>g_5.id === editingGame.id ? {
                    ...g_5,
                    coverArt: undefined
                } : g_5);
            setGames(updatedGames_4);
            localStorage.setItem('games', JSON.stringify(updatedGames_4));
            const updatedEditingGame = {
                ...editingGame,
                coverArt: undefined
            };
            setEditingGame(updatedEditingGame);
            // Also update pendingGame if it exists
            if (pendingGame && pendingGame.id === editingGame.id) {
                setPendingGame(updatedEditingGame);
            }
        } else if (pendingGame) {
            setPendingGame({
                ...pendingGame,
                coverArt: undefined
            });
        }
    };
    const handleFileSelect = async ()=>{
        try {
            let files = [];
            if ('showOpenFilePicker' in window) {
                const fileHandles = await window.showOpenFilePicker({
                    multiple: true
                });
                files = await Promise.all(fileHandles.map((fh)=>fh.getFile()));
            } else {
                // Fallback for browsers without File System Access API
                files = await new Promise((resolve)=>{
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.onchange = (e_1)=>{
                        resolve(Array.from(e_1.target.files || []));
                    };
                    input.click();
                });
            }
            // First, process files with detected systems
            const filesNeedingSystem = [];
            let currentGames_0 = games;
            for(let i = 0; i < files.length; i++){
                const file_4 = files[i];
                const fileExtension_0 = file_4.name.split(".").pop()?.toLowerCase() || "";
                const detectedCore_0 = getSystemFromExtension(fileExtension_0);
                if (detectedCore_0) {
                    // Auto-add files with detected systems
                    currentGames_0 = await processGameFile(file_4, i, detectedCore_0, currentGames_0);
                } else {
                    // Collect files that need system selection
                    filesNeedingSystem.push({
                        file: file_4,
                        index: i
                    });
                }
            }
            // Filter out duplicates
            const filteredFilesNeedingSystem = filesNeedingSystem.filter(({ file: file_5 })=>{
                const fileName_1 = file_5.name;
                return !currentGames_0.some((g_6)=>g_6.fileName === fileName_1 || g_6.filePath === file_5.name);
            });
            // If there are files without detected systems, show system picker
            if (filteredFilesNeedingSystem.length > 0) {
                setPendingFiles(filteredFilesNeedingSystem);
                // Only set pendingGame if it's a single file (for the UI to show cover art section)
                if (filteredFilesNeedingSystem.length === 1) {
                    const fileName_2 = filteredFilesNeedingSystem[0].file.name;
                    const nameWithoutExt_0 = fileName_2.replace(/\.[^/.]+$/, '');
                    setPendingGame({
                        id: Date.now(),
                        title: nameWithoutExt_0,
                        genre: 'Unknown',
                        filePath: fileName_2,
                        fileName: fileName_2
                    });
                } else {
                    setPendingGame(null);
                }
                setCoverArtFit('cover');
                setSystemPickerOpen(true);
            } else if (filesNeedingSystem.length > 0) {
                if (filesNeedingSystem.length === 1) {
                    setDuplicateMessage(`The file "${filesNeedingSystem[0].file.name}" is already in your library`);
                } else {
                    setDuplicateMessage(`All ${filesNeedingSystem.length} selected files are already in your library`);
                }
                setShowDuplicateMessage(true);
                setTimeout(()=>setShowDuplicateMessage(false), 2000);
                setTimeout(()=>setDuplicateMessage(null), 2500);
            }
        } catch (err) {
            if (err.name !== 'AbortError') {
                console.error('Error selecting files:', err);
            }
        }
    };
    const handleEditGame = (game_2)=>{
        setEditingGame(game_2);
        setPendingGame({
            ...game_2
        });
        setCoverArtFit(game_2.coverArtFit || 'cover');
        setSystemPickerOpen(true);
    };
    const handleDeleteGame = async (game_3)=>{
        if (confirm(`Are you sure you want to delete "${game_3.title}"?`)) {
            try {
                const { deleteGameFile } = await __turbopack_context__.A("[project]/src/lib/storage.ts [app-client] (ecmascript, async loader)");
                // Trigger fade-out animation for this game
                setDeletingGameIds((prev)=>{
                    const next = new Set(prev);
                    next.add(game_3.id);
                    return next;
                });
                await new Promise((resolve_0)=>setTimeout(resolve_0, 400));
                await deleteGameFile(game_3.id);
                const updatedGames_5 = games.filter((g_7)=>g_7.id !== game_3.id);
                setGames(updatedGames_5);
                localStorage.setItem('games', JSON.stringify(updatedGames_5));
                setDeletingGameIds((prev_0)=>{
                    const next_0 = new Set(prev_0);
                    next_0.delete(game_3.id);
                    return next_0;
                });
            } catch (error_2) {
                console.error('Error deleting game:', error_2);
            }
        }
    };
    const toggleGameSelection = (gameId_1)=>{
        const newSelected = new Set(selectedGameIds);
        if (newSelected.has(gameId_1)) {
            newSelected.delete(gameId_1);
        } else {
            newSelected.add(gameId_1);
        }
        setSelectedGameIds(newSelected);
    };
    const toggleSelectAll = ()=>{
        if (selectedGameIds.size === games.length) {
            setSelectedGameIds(new Set());
        } else {
            setSelectedGameIds(new Set(games.map((g_8)=>g_8.id)));
        }
    };
    const handleMassDelete = async ()=>{
        if (selectedGameIds.size === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedGameIds.size} game(s)? This action cannot be undone.`)) {
            try {
                const { deleteGameFile: deleteGameFile_0 } = await __turbopack_context__.A("[project]/src/lib/storage.ts [app-client] (ecmascript, async loader)");
                // Trigger fade-out animation
                setDeletingGameIds(new Set(selectedGameIds));
                // Wait for animation to complete
                await new Promise((resolve_1)=>setTimeout(resolve_1, 400));
                // Delete from IndexedDB
                for (const gameId_2 of selectedGameIds){
                    await deleteGameFile_0(gameId_2);
                }
                // Remove from state and localStorage
                const updatedGames_6 = games.filter((g_9)=>!selectedGameIds.has(g_9.id));
                setGames(updatedGames_6);
                localStorage.setItem('games', JSON.stringify(updatedGames_6));
                setSelectedGameIds(new Set());
                setDeletingGameIds(new Set());
                setIsDeleteMode(false);
            } catch (error_3) {
                console.error('Error deleting games:', error_3);
            }
        }
    };
    const deleteButtonRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const deleteTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isPressingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
    const handleDeleteButtonMouseDown = ()=>{
        isPressingRef.current = true;
        deleteTimeoutRef.current = setTimeout(()=>{
            if (isPressingRef.current) {
                setIsDeleteMode(true);
            }
        }, 500);
    };
    const handleDeleteButtonMouseUp = ()=>{
        isPressingRef.current = false;
        if (deleteTimeoutRef.current) {
            clearTimeout(deleteTimeoutRef.current);
            deleteTimeoutRef.current = null;
        }
    };
    const exitDeleteMode = ()=>{
        setIsDeleteMode(false);
        setSelectedGameIds(new Set());
    };
    const handlePlayClick = async (game_4)=>{
        try {
            let file_6 = null;
            // Try to get file from IndexedDB first
            file_6 = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGameFile"])(game_4.id);
            // Fallback to legacy fileData if IndexedDB doesn't have it
            if (!file_6 && game_4.fileData) {
                const response_0 = await fetch(game_4.fileData);
                const blob_0 = await response_0.blob();
                file_6 = new File([
                    blob_0
                ], game_4.fileName || game_4.title, {
                    type: 'application/octet-stream'
                });
                // Save to IndexedDB for next time
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["saveGameFile"])(game_4.id, file_6);
            }
            if (file_6) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emulator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadGame"])(file_6, game_4.core);
            } else {
                console.error('Game file not found');
            }
        } catch (error_4) {
            console.error('Error loading game:', error_4);
        }
    };
    const handleNavClick = (viewName)=>{
        setActiveView(viewName);
        setIsSidebarOpen(false);
    };
    const getSidebarButtonClass = (view)=>{
        const baseClass = "sidebar-item block p-3 mb-2 rounded-lg transition-all flex items-center border-l-4 hover:translate-x-1";
        const isActive = activeView === view;
        return `${baseClass} ${isActive ? 'border-l-4' : 'border-transparent'}`;
    };
    const sidebarClass = isSidebarOpen ? "translate-x-0" : "-translate-x-full";
    const sidebarFullClass = `w-64 p-6 flex flex-col justify-start shadow-xl fixed left-0 top-0 bottom-0 z-50 transition-all duration-300 ease-in-out ${sidebarClass}`;
    const currentColors = THEMES[selectedTheme] || THEMES.dark;
    const handleThemeChange = (themeName)=>{
        setSelectedTheme(themeName);
    };
    // Get system category for a game based on the core
    const getSystemCategory = (core_0)=>{
        if (!core_0) return 'Other';
        // Check which category the core belongs to
        for (const [category, systems] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYSTEM_PICKER"])){
            if (Object.values(systems).includes(core_0)) {
                return category;
            }
        }
        return 'Other';
    };
    // Sort games
    const sortedGames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[sortedGames]": ()=>{
            const sorted = [
                ...games
            ];
            sorted.sort({
                "Home.useMemo[sortedGames]": (a, b)=>{
                    let comparison = 0;
                    if (sortBy === 'title') {
                        comparison = a.title.localeCompare(b.title);
                    } else if (sortBy === 'system') {
                        comparison = a.genre.localeCompare(b.genre);
                    }
                    return sortOrder === 'asc' ? comparison : -comparison;
                }
            }["Home.useMemo[sortedGames]"]);
            return sorted;
        }
    }["Home.useMemo[sortedGames]"], [
        games,
        sortBy,
        sortOrder
    ]);
    // Group games by system category when sorting by system
    const groupedGames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[groupedGames]": ()=>{
            if (sortBy !== 'system') {
                return null;
            }
            const categoryOrder = [
                'Nintendo',
                'Sega',
                'Sony',
                'Atari',
                'Other'
            ];
            const groups = {
                'Nintendo': [],
                'Sega': [],
                'Sony': [],
                'Atari': [],
                'Other': []
            };
            sortedGames.forEach({
                "Home.useMemo[groupedGames]": (game_5)=>{
                    const category_0 = getSystemCategory(game_5.core);
                    groups[category_0].push(game_5);
                }
            }["Home.useMemo[groupedGames]"]);
            // Sort categories based on sort order
            if (sortOrder === 'desc') {
                categoryOrder.reverse();
            }
            // Create new object with sorted category order
            const sortedGroups = {};
            categoryOrder.forEach({
                "Home.useMemo[groupedGames]": (category_1)=>{
                    if (groups[category_1].length > 0) {
                        sortedGroups[category_1] = groups[category_1];
                    }
                }
            }["Home.useMemo[groupedGames]"]);
            return sortedGroups;
        }
    }["Home.useMemo[groupedGames]"], [
        sortedGames,
        sortBy,
        sortOrder
    ]);
    const renderContent = ()=>{
        if (activeView === 'themes') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold mb-6",
                        style: {
                            color: currentColors.softLight
                        },
                        children: "Select Theme"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1064,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                        children: Object.entries(THEMES).map(([themeName_0, themeColors])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleThemeChange(themeName_0),
                                className: "p-6 rounded-xl transition-all border-2 relative overflow-hidden",
                                style: {
                                    backgroundColor: themeColors.midDark,
                                    borderColor: selectedTheme === themeName_0 ? themeColors.playGreen : themeColors.highlight + '40',
                                    boxShadow: selectedTheme === themeName_0 ? `0 2px 8px ${themeColors.playGreen}30` : '0 2px 4px rgba(0, 0, 0, 0.2)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-bold capitalize",
                                                style: {
                                                    color: themeColors.softLight
                                                },
                                                children: themeName_0
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1076,
                                                columnNumber: 19
                                            }, this),
                                            selectedTheme === themeName_0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6",
                                                fill: "currentColor",
                                                viewBox: "0 0 20 20",
                                                style: {
                                                    color: themeColors.playGreen
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    fillRule: "evenodd",
                                                    d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                                    clipRule: "evenodd"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 1084,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1081,
                                                columnNumber: 53
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 1075,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.darkBg
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1088,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.midDark
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1091,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.playGreen
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1094,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.highlight
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1097,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 1087,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, themeName_0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 1070,
                                columnNumber: 73
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1069,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 1063,
                columnNumber: 14
            }, this);
        }
        if (activeView === 'about') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-2xl font-bold mb-4",
                        style: {
                            color: currentColors.softLight
                        },
                        children: "About Joe T Emulator"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1107,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm mb-4",
                        style: {
                            color: currentColors.highlight
                        },
                        children: "Joe T Emulator is an open-source, web-based emulator that allows you to play classic games directly in your browser. It supports a variety of systems and offers a customizable experience with themes and cover art."
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1110,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "p-4 rounded-xl",
                        style: {
                            backgroundColor: currentColors.midDark,
                            color: currentColors.softLight
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm",
                                children: "Version: local"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 1119,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm",
                                children: "Built with React + Next.js"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 1120,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1115,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 1106,
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
                                color: currentColors.highlight
                            },
                            children: [
                                "Games (",
                                games.length,
                                ")"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1126,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2 px-4 py-2 rounded-lg",
                                    style: {
                                        backgroundColor: currentColors.midDark
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            className: "text-sm font-medium",
                                            style: {
                                                color: currentColors.highlight
                                            },
                                            children: "Sort by:"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1135,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex gap-1",
                                            children: [
                                                'title',
                                                'system'
                                            ].map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: ()=>setSortBy(option),
                                                    className: "px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-95",
                                                    style: {
                                                        backgroundColor: sortBy === option ? currentColors.highlight : currentColors.darkBg,
                                                        color: sortBy === option ? currentColors.darkBg : currentColors.softLight
                                                    },
                                                    children: option === 'title' ? 'Title' : 'System'
                                                }, option, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 1139,
                                                    columnNumber: 63
                                                }, this))
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1138,
                                            columnNumber: 15
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'),
                                            className: "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:shadow-md active:scale-95 flex items-center justify-center",
                                            style: {
                                                backgroundColor: currentColors.highlight,
                                                color: currentColors.darkBg
                                            },
                                            children: sortOrder === 'asc' ? '↑' : '↓'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1146,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1132,
                                    columnNumber: 13
                                }, this),
                                isDeleteMode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleMassDelete,
                                            disabled: selectedGameIds.size === 0,
                                            className: "px-4 py-2.5 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95",
                                            style: {
                                                backgroundColor: '#ef4444',
                                                color: currentColors.softLight,
                                                opacity: selectedGameIds.size === 0 ? 0.5 : 1
                                            },
                                            children: [
                                                "Delete Selected (",
                                                selectedGameIds.size,
                                                ")"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1154,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: exitDeleteMode,
                                            className: "px-5 py-2.5 rounded-lg font-semibold transition-all active:scale-95",
                                            style: {
                                                backgroundColor: currentColors.highlight,
                                                color: currentColors.darkBg
                                            },
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1161,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1153,
                                    columnNumber: 29
                                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleFileSelect,
                                    className: "px-8 py-3.5 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95",
                                    style: {
                                        ...getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo),
                                        color: currentColors.darkBg
                                    },
                                    children: "Add Game"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1167,
                                    columnNumber: 24
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1131,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1125,
                    columnNumber: 9
                }, this),
                isLoadingGames ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-16",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-lg",
                        style: {
                            color: currentColors.highlight
                        },
                        children: "Loading games..."
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1176,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1175,
                    columnNumber: 27
                }, this) : games.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-16",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xl mb-2 font-semibold",
                            style: {
                                color: currentColors.softLight
                            },
                            children: "No games found"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1180,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mb-6",
                            style: {
                                color: currentColors.highlight
                            },
                            children: "Add your first game to get started"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1183,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleFileSelect,
                            className: "px-8 py-3.5 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95",
                            style: {
                                ...getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo),
                                color: currentColors.darkBg
                            },
                            children: "Add Your First Game"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1186,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1179,
                    columnNumber: 41
                }, this) : sortBy === 'system' && groupedGames ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: Object.entries(groupedGames).map(([category_2, categoryGames])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-8 last:mb-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-xs font-bold uppercase tracking-wider pr-3",
                                            style: {
                                                color: currentColors.highlight
                                            },
                                            children: category_2
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1195,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 h-px",
                                            style: {
                                                backgroundColor: currentColors.highlight + '30'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1200,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1194,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap",
                                    style: {
                                        gap: '1rem'
                                    },
                                    children: categoryGames.map((game_6, index_1)=>{
                                        const isGameDeleting = deletingGameIds.has(game_6.id);
                                        // Only count games that are NOT being deleted for animation purposes
                                        const visibleIndex = categoryGames.slice(0, index_1).filter((g_10)=>!deletingGameIds.has(g_10.id)).length;
                                        const reverseStaggerDelay = (categoryGames.length - 1 - index_1) * 0.03;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                animation: isGameDeleting ? `slideDown 0.4s ease-in-out ${reverseStaggerDelay}s forwards` : shouldAnimateEntries ? `fadeIn 0.5s ease-in-out ${visibleIndex * 0.03}s both` : 'none'
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GameCard, {
                                                game: game_6,
                                                onPlay: handlePlayClick,
                                                onEdit: handleEditGame,
                                                onDelete: handleDeleteGame,
                                                onSelect: toggleGameSelection,
                                                isSelected: selectedGameIds.has(game_6.id),
                                                isDeleteMode: isDeleteMode,
                                                onEnterDeleteMode: ()=>setIsDeleteMode(true),
                                                colors: currentColors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1215,
                                                columnNumber: 25
                                            }, this)
                                        }, game_6.id, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1212,
                                            columnNumber: 22
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1204,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, category_2, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1193,
                            columnNumber: 80
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1192,
                    columnNumber: 58
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap",
                    style: {
                        gap: '1rem'
                    },
                    children: sortedGames.map((game_7, index_2)=>{
                        const isGameDeleting_0 = deletingGameIds.has(game_7.id);
                        // Only count games that are NOT being deleted for animation purposes
                        const visibleIndex_0 = sortedGames.slice(0, index_2).filter((g_11)=>!deletingGameIds.has(g_11.id)).length;
                        const reverseStaggerDelay_0 = (sortedGames.length - 1 - index_2) * 0.03;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                animation: isGameDeleting_0 ? `slideDown 0.4s ease-in-out ${reverseStaggerDelay_0}s forwards` : shouldAnimateEntries ? `fadeIn 0.5s ease-in-out ${visibleIndex_0 * 0.03}s both` : 'none'
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(GameCard, {
                                game: game_7,
                                onPlay: handlePlayClick,
                                onEdit: handleEditGame,
                                onDelete: handleDeleteGame,
                                onSelect: toggleGameSelection,
                                isSelected: selectedGameIds.has(game_7.id),
                                isDeleteMode: isDeleteMode,
                                onEnterDeleteMode: ()=>setIsDeleteMode(true),
                                onCoverArtClick: (game_8)=>{
                                    setEditingGame(game_8);
                                    setPendingGame(game_8);
                                    setCoverArtFit(game_8.coverArtFit || 'cover');
                                    setSystemPickerOpen(true);
                                },
                                colors: currentColors
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 1231,
                                columnNumber: 19
                            }, this)
                        }, game_7.id, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1228,
                            columnNumber: 18
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1220,
                    columnNumber: 20
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 1124,
            columnNumber: 12
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: !isHydrated ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex flex-col",
            style: {
                backgroundColor: '#0f0f0f',
                fontFamily: 'Inter, sans-serif'
            }
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 1243,
            columnNumber: 22
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex flex-col",
            style: {
                backgroundColor: currentColors.darkBg,
                fontFamily: 'Inter, sans-serif'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `fixed inset-0 z-40 transition-all duration-300 ${isSidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'}`,
                    onClick: ()=>setIsSidebarOpen(false)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1250,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                    className: sidebarFullClass,
                    style: {
                        backgroundColor: currentColors.midDark,
                        boxShadow: '4px 0 12px rgba(0, 0, 0, 0.3)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 mb-12 animate-fade-in pb-6 border-b",
                            style: {
                                borderColor: currentColors.highlight + '30'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "/favicon.ico",
                                    alt: "Joe T Emulator",
                                    className: "w-12 h-12 flex-shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1258,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                    className: "text-2xl font-extrabold leading-tight",
                                    style: {
                                        backgroundImage: `linear-gradient(135deg, ${currentColors.softLight} 0%, ${currentColors.highlight} 100%)`,
                                        backgroundRepeat: 'no-repeat',
                                        backgroundSize: '100% 100%',
                                        WebkitBackgroundClip: 'text',
                                        backgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        color: 'transparent',
                                        fontFamily: 'Inter, sans-serif',
                                        letterSpacing: '-0.02em'
                                    },
                                    children: "Joe T Emulator"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1259,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1255,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            children: [
                                {
                                    view: 'library',
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__["Gamepad2"],
                                    label: 'Library'
                                },
                                {
                                    view: 'themes',
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"],
                                    label: 'Themes'
                                },
                                {
                                    view: 'about',
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$info$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Info$3e$__["Info"],
                                    label: 'About'
                                }
                            ].map(({ view: view_0, icon: Icon, label }, index_3)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: getSidebarButtonClass(view_0) + " hover:bg-opacity-50",
                                    style: {
                                        backgroundColor: activeView === view_0 ? currentColors.sidebarHover : 'transparent',
                                        borderLeftColor: activeView === view_0 ? currentColors.highlight : 'transparent',
                                        borderLeftWidth: activeView === view_0 ? '4px' : '0px',
                                        color: currentColors.softLight,
                                        transition: 'all 0.2s ease',
                                        animation: `fadeInSlide 0.3s ease-out ${index_3 * 0.1}s both`
                                    },
                                    onClick: ()=>handleNavClick(view_0),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            className: "w-6 h-6 mr-3 transition-transform"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1298,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold",
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1299,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, view_0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1290,
                                    columnNumber: 26
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1273,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1251,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "p-8 overflow-y-auto pb-20 scrollbar-hide",
                        style: {
                            minHeight: 'calc(100vh - 4rem)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                                className: "mb-10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-4xl font-extrabold tracking-tight",
                                            style: {
                                                color: currentColors.softLight,
                                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            },
                                            children: activeView.charAt(0).toUpperCase() + activeView.slice(1)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1309,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-4",
                                            children: isMounted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "hidden sm:block text-sm font-medium px-3 py-1.5 rounded-lg transition-all",
                                                style: {
                                                    color: currentColors.highlight,
                                                    backgroundColor: currentColors.midDark
                                                },
                                                children: currentTime
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1316,
                                                columnNumber: 35
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1315,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1308,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 1307,
                                columnNumber: 15
                            }, this),
                            renderContent()
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1304,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1303,
                    columnNumber: 11
                }, this),
                duplicateMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl z-60 animate-fade-in p-4 transition-opacity duration-300",
                    onClick: ()=>setDuplicateMessage(null),
                    style: {
                        backgroundColor: '#ef4444',
                        color: currentColors.softLight,
                        opacity: showDuplicateMessage ? 1 : 0,
                        transition: 'opacity 0.3s ease-out',
                        pointerEvents: showDuplicateMessage ? 'auto' : 'none'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-5 h-5",
                                fill: "currentColor",
                                viewBox: "0 0 20 20",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    fillRule: "evenodd",
                                    d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                                    clipRule: "evenodd"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1337,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 1336,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: duplicateMessage
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 1339,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1335,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1328,
                    columnNumber: 32
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                    className: "fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-between px-6 z-50",
                    style: {
                        backgroundColor: currentColors.midDark,
                        borderColor: currentColors.sidebarHover,
                        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "p-2.5 rounded-lg transition-all hover:bg-opacity-50 active:scale-95",
                            onClick: ()=>setIsSidebarOpen(!isSidebarOpen),
                            style: {
                                color: currentColors.softLight,
                                backgroundColor: isSidebarOpen ? currentColors.sidebarHover : 'transparent'
                            },
                            children: isSidebarOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-7 h-7 transition-transform rotate-0"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 1351,
                                columnNumber: 32
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                className: "w-7 h-7 transition-transform"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 1351,
                                columnNumber: 90
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1347,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 mx-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1353,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 1342,
                    columnNumber: 11
                }, this),
                (systemPickerOpen || systemPickerClosing) && (()=>{
                    // SYSTEM_PICKER is already organized by category
                    const filteredCategories = {};
                    Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYSTEM_PICKER"]).forEach(([category_3, systems_0])=>{
                        const filtered = Object.entries(systems_0).filter(([name])=>name.toLowerCase().includes(systemSearchQuery.toLowerCase()));
                        if (filtered.length > 0) {
                            filteredCategories[category_3] = filtered;
                        }
                    });
                    const currentCore = editingGame?.core || pendingGame?.core;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4",
                        onClick: ()=>closeSystemPicker(),
                        style: {
                            animation: systemPickerClosing ? 'fadeOut 0.2s ease-out' : 'fadeIn 0.2s ease-out'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border",
                            style: {
                                backgroundColor: currentColors.midDark,
                                borderColor: currentColors.highlight + '30',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
                                animation: systemPickerClosing ? 'slideDown 0.2s ease-out' : 'slideUp 0.3s ease-out'
                            },
                            onClick: (e_2)=>e_2.stopPropagation(),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-3xl font-bold mb-2",
                                            style: {
                                                color: currentColors.softLight
                                            },
                                            children: editingGame ? editingGame.title : pendingFiles.length > 1 ? `Add ${pendingFiles.length} Games` : 'Select System'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1376,
                                            columnNumber: 21
                                        }, this),
                                        editingGame && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm opacity-70",
                                            style: {
                                                color: currentColors.highlight
                                            },
                                            children: "Choose a system and cover art"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1381,
                                            columnNumber: 37
                                        }, this),
                                        pendingFiles.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm opacity-70",
                                            style: {
                                                color: currentColors.highlight
                                            },
                                            children: [
                                                "Choose a system for ",
                                                pendingFiles.length,
                                                " files"
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1386,
                                            columnNumber: 49
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1375,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex gap-6 flex-1 min-h-0",
                                    children: [
                                        pendingFiles.length <= 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-shrink-0 w-80 space-y-4",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-xl border overflow-hidden",
                                                style: {
                                                    borderColor: currentColors.highlight + '30',
                                                    backgroundColor: currentColors.darkBg
                                                },
                                                children: [
                                                    editingGame?.coverArt || pendingGame?.coverArt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "aspect-[4/5] w-full overflow-hidden bg-black/20 relative",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: editingGame?.coverArt || pendingGame?.coverArt,
                                                                    alt: "Cover art",
                                                                    className: "w-full h-full",
                                                                    style: {
                                                                        objectFit: coverArtFit,
                                                                        objectPosition: 'center'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1403,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1402,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: removeCoverArt,
                                                                    className: "px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center",
                                                                    style: {
                                                                        backgroundColor: '#ef4444',
                                                                        color: currentColors.softLight
                                                                    },
                                                                    title: "Remove cover art",
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                        className: "w-5 h-5"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1413,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1409,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1408,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1401,
                                                        columnNumber: 77
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "aspect-[3/4] w-full flex items-center justify-center bg-gradient-to-br",
                                                        style: {
                                                            background: `linear-gradient(135deg, ${currentColors.darkBg} 0%, ${currentColors.midDark} 100%)`
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center p-6",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center",
                                                                    style: {
                                                                        backgroundColor: currentColors.highlight + '20'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                        className: "w-8 h-8",
                                                                        style: {
                                                                            color: currentColors.highlight
                                                                        },
                                                                        fill: "none",
                                                                        stroke: "currentColor",
                                                                        viewBox: "0 0 24 24",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            strokeLinecap: "round",
                                                                            strokeLinejoin: "round",
                                                                            strokeWidth: "2",
                                                                            d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/page.tsx",
                                                                            lineNumber: 1426,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1423,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1420,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm font-medium",
                                                                    style: {
                                                                        color: currentColors.softLight
                                                                    },
                                                                    children: "No Cover Art"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1429,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1419,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1416,
                                                        columnNumber: 38
                                                    }, this),
                                                    (editingGame?.coverArt || pendingGame?.coverArt) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-4 border-t",
                                                        style: {
                                                            borderColor: currentColors.highlight + '30'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>{
                                                                const newFit_0 = coverArtFit === 'contain' ? 'cover' : 'contain';
                                                                setCoverArtFit(newFit_0);
                                                                updateCoverArtFit(newFit_0);
                                                            },
                                                            className: "w-full px-4 py-2.5 rounded-lg transition-all text-sm font-semibold text-center active:scale-95",
                                                            style: {
                                                                backgroundColor: currentColors.highlight,
                                                                color: currentColors.darkBg
                                                            },
                                                            children: coverArtFit === 'contain' ? 'Zoom to Fill' : 'Shrink to Fit'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1439,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1436,
                                                        columnNumber: 80
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-4 border-t",
                                                        style: {
                                                            borderColor: currentColors.highlight + '30'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "file",
                                                                accept: "image/*",
                                                                onChange: (e_3)=>{
                                                                    const file_7 = e_3.target.files?.[0];
                                                                    if (file_7) {
                                                                        handleCoverArtFileUpload(file_7);
                                                                    }
                                                                },
                                                                className: "hidden",
                                                                id: "cover-art-file-input"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1453,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "cover-art-file-input",
                                                                className: "block w-full px-4 py-2.5 rounded-lg transition-all text-sm font-semibold text-center active:scale-95",
                                                                style: {
                                                                    ...editingGame?.coverArt || pendingGame?.coverArt ? {
                                                                        backgroundColor: currentColors.highlight
                                                                    } : getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo),
                                                                    color: currentColors.darkBg
                                                                },
                                                                children: editingGame?.coverArt || pendingGame?.coverArt ? 'Change Image' : 'Upload Cover Art'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1459,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1450,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1397,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1396,
                                            columnNumber: 50
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: pendingFiles.length > 1 ? "w-full flex flex-col min-w-0" : "flex-1 flex flex-col min-w-0",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    placeholder: "Search systems...",
                                                    value: systemSearchQuery,
                                                    onChange: (e_4)=>setSystemSearchQuery(e_4.target.value),
                                                    onFocus: ()=>setSearchFocused(true),
                                                    onBlur: ()=>setSearchFocused(false),
                                                    className: "w-full px-4 py-3 rounded-xl border-2 transition-all focus:outline-none mb-4",
                                                    style: {
                                                        backgroundColor: currentColors.darkBg,
                                                        borderColor: searchFocused ? currentColors.playGreen : currentColors.highlight + '50',
                                                        color: currentColors.softLight,
                                                        boxShadow: searchFocused ? `0 0 0 2px ${currentColors.playGreen}30` : 'none'
                                                    },
                                                    autoFocus: true
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 1473,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 overflow-y-auto pr-2 scrollbar-hide",
                                                    children: [
                                                        Object.entries(filteredCategories).map(([category_4, systems_1])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mb-6 last:mb-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center mb-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                className: "text-xs font-bold uppercase tracking-wider pr-3",
                                                                                style: {
                                                                                    color: currentColors.highlight
                                                                                },
                                                                                children: category_4
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                lineNumber: 1483,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex-1 h-px",
                                                                                style: {
                                                                                    backgroundColor: currentColors.highlight + '30'
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                lineNumber: 1488,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1482,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5",
                                                                        children: systems_1.map(([name_0, core_1], index_4)=>{
                                                                            const isSelected = currentCore === core_1;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                className: "p-3.5 rounded-xl text-left transition-all active:scale-[0.97] border-2 relative flex items-center justify-between group",
                                                                                style: {
                                                                                    ...isSelected ? getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo) : {
                                                                                        backgroundColor: currentColors.sidebarHover
                                                                                    },
                                                                                    borderColor: isSelected ? currentColors.playGreen : currentColors.highlight + '30',
                                                                                    color: isSelected ? currentColors.darkBg : currentColors.softLight,
                                                                                    boxShadow: isSelected ? `0 2px 8px ${currentColors.playGreen}30` : '0 2px 4px rgba(0, 0, 0, 0.2)',
                                                                                    animation: `fadeIn 0.4s ease-out ${index_4 * 0.03}s both`
                                                                                },
                                                                                onMouseEnter: (e_5)=>{
                                                                                    if (!isSelected) {
                                                                                        e_5.currentTarget.style.backgroundColor = currentColors.highlight + '20';
                                                                                        e_5.currentTarget.style.borderColor = currentColors.highlight + '50';
                                                                                    }
                                                                                },
                                                                                onMouseLeave: (e_6)=>{
                                                                                    if (!isSelected) {
                                                                                        e_6.currentTarget.style.backgroundColor = currentColors.sidebarHover;
                                                                                        e_6.currentTarget.style.borderColor = currentColors.highlight + '30';
                                                                                    }
                                                                                },
                                                                                onClick: ()=>selectSystem(core_1),
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "font-medium text-sm leading-tight truncate pr-2 flex-1",
                                                                                        children: name_0
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/page.tsx",
                                                                                        lineNumber: 1514,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "w-5 h-5 flex-shrink-0 flex items-center justify-center",
                                                                                        children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                            className: "w-5 h-5",
                                                                                            fill: "currentColor",
                                                                                            viewBox: "0 0 20 20",
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                                fillRule: "evenodd",
                                                                                                d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                                                                                clipRule: "evenodd"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                                lineNumber: 1519,
                                                                                                columnNumber: 43
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/page.tsx",
                                                                                            lineNumber: 1518,
                                                                                            columnNumber: 54
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/page.tsx",
                                                                                        lineNumber: 1517,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, core_1, true, {
                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                lineNumber: 1495,
                                                                                columnNumber: 32
                                                                            }, this);
                                                                        })
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1492,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, category_4, true, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1481,
                                                                columnNumber: 94
                                                            }, this)),
                                                        Object.keys(filteredCategories).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-16",
                                                            style: {
                                                                color: currentColors.highlight
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                                                                    style: {
                                                                        backgroundColor: currentColors.highlight + '15'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                        className: "w-8 h-8",
                                                                        fill: "none",
                                                                        stroke: "currentColor",
                                                                        viewBox: "0 0 24 24",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            strokeLinecap: "round",
                                                                            strokeLinejoin: "round",
                                                                            strokeWidth: "2",
                                                                            d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/page.tsx",
                                                                            lineNumber: 1533,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1532,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1529,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-lg font-semibold mb-1",
                                                                    style: {
                                                                        color: currentColors.softLight
                                                                    },
                                                                    children: "No systems found"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1536,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm opacity-70",
                                                                    children: "Try a different search term"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1539,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1526,
                                                            columnNumber: 74
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 1480,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1472,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1394,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-end gap-3 mt-6 pt-4 border-t",
                                    style: {
                                        borderColor: currentColors.highlight + '30'
                                    },
                                    children: [
                                        (editingGame || pendingFiles.length === 1 && pendingGame) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "py-2.5 px-6 rounded-lg font-semibold transition-all active:scale-95",
                                            style: {
                                                ...getGradientStyle(currentColors.gradientFrom, currentColors.gradientTo),
                                                color: currentColors.darkBg
                                            },
                                            onClick: handleSystemPickerDone,
                                            children: "Done"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1548,
                                            columnNumber: 83
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "py-2.5 px-6 rounded-lg font-semibold transition-all active:scale-95",
                                            style: {
                                                backgroundColor: currentColors.highlight,
                                                color: currentColors.darkBg
                                            },
                                            onClick: ()=>closeSystemPicker(),
                                            children: editingGame ? 'Cancel' : 'Close'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1554,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1545,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1368,
                            columnNumber: 17
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1365,
                        columnNumber: 16
                    }, this);
                })()
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 1246,
            columnNumber: 13
        }, this)
    }, void 0, false);
}
_s(Home, "5ocbLxMUQ/av5nTgmA749htA6ts=");
_c1 = Home;
var _c, _c1;
__turbopack_context__.k.register(_c, "GameCard");
__turbopack_context__.k.register(_c1, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_33f1a2fb._.js.map