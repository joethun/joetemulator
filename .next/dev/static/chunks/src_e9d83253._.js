(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/constants.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "FILE_EXTENSIONS",
    ()=>FILE_EXTENSIONS,
    "SYSTEM_PICKER",
    ()=>SYSTEM_PICKER,
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/emulator.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exitGame",
    ()=>exitGame,
    "loadGame",
    ()=>loadGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-client] (ecmascript)");
;
const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
const DEFAULT_EJS_COLOR = "#00ff7f";
if ("TURBOPACK compile-time truthy", 1) window.gameRunning = false;
async function detectCore(extension) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension] || "nes";
}
function toggleMenuElements(show) {
    if (typeof document === 'undefined') return;
    [
        'aside',
        'footer',
        'main',
        'header'
    ].forEach((s)=>{
        const e = document.querySelector(s);
        if (e) e.style.cssText = show ? '' : 'display: none !important; visibility: hidden !important; z-index: -1 !important;';
    });
    const r = document.querySelector('div[style*="min-h-screen"]');
    if (r && !show) r.style.cssText += " z-index: -1 !important;";
}
function cleanupOldElements() {
    const g = document.getElementById("game");
    if (g) {
        g.innerHTML = "";
        g.style.display = "none";
    }
    document.querySelectorAll('script[src*="loader.js"]').forEach((s)=>s.remove());
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
    let g = document.getElementById("game") || ((d)=>(d.id = "game", document.body.appendChild(d), d))(document.createElement("div"));
    g.innerHTML = "";
    g.style.cssText = GAME_CONTAINER_STYLES;
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
    window.EJS_color = themeColor || DEFAULT_EJS_COLOR;
    window.EJS_backgroundColor = "#000000";
    window.EJS_player = "#game";
    window.EJS_gameName = gameName;
    window.EJS_gameUrl = gameFile;
    window.EJS_core = core;
    window.EJS_pathtodata = CDN_PATH;
    window.EJS_startOnLoaded = true;
    window.EJS_biosUrl = "";
    window.EJS_threads = [
        "psp",
        "dosbox_pure"
    ].includes(core);
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
    const s = document.createElement("script");
    s.src = `${CDN_PATH}/loader.js`;
    s.onload = ()=>setTimeout(()=>{
            const g = document.getElementById("game");
            if (g) {
                g.style.cssText = GAME_CONTAINER_STYLES.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim() + ' !important';
                const c = g.querySelector('canvas');
                if (c) c.style.cssText = 'display: block !important; visibility: visible !important; opacity: 1 !important; width: 100% !important; height: 100% !important;';
            }
        }, 100);
    document.body.appendChild(s);
}
function getEmulator() {
    return ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : window.EJS_emulator?.started ? window.EJS_emulator : null;
}
function exitGame() {
    cleanupOldElements();
    const g = document.getElementById("game");
    if (g) g.style.display = "none";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/lib/storage.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

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
"[project]/src/types/index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "THEMES",
    ()=>THEMES,
    "getGradientStyle",
    ()=>getGradientStyle
]);
const THEMES = {
    default: {
        highlight: '#8899cc',
        darkBg: '#0a0a0f',
        midDark: '#151520',
        softLight: '#e8eef5',
        sidebarHover: '#1f2535',
        playGreen: '#4a90e2',
        gradientFrom: '#4a90e2',
        gradientTo: '#2563eb'
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
    indigo: {
        highlight: '#c7d2fe',
        darkBg: '#0f0f1f',
        midDark: '#1e1e2e',
        softLight: '#eef2ff',
        sidebarHover: '#2d2d3e',
        playGreen: '#818cf8',
        gradientFrom: '#818cf8',
        gradientTo: '#6366f1'
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
    }
};
const getGradientStyle = (from, to)=>({
        background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`
    });
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/GameCardComponent.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameCard",
    ()=>GameCard,
    "getSystemDisplayName",
    ()=>getSystemDisplayName
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/compiler-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-client] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/index.ts [app-client] (ecmascript)");
;
;
;
;
const getSystemDisplayName = (core)=>{
    if (!core) return 'Unknown';
    const systemMap = {
        'nes': 'NES',
        'gb': 'GB',
        'gbc': 'GBC',
        'gba': 'GBA',
        'snes': 'SNES',
        'vb': 'VB',
        'n64': 'N64',
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
    const $ = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$compiler$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["c"])(47);
    if ($[0] !== "6c74d3dc5fde99ddabc7710bffdd0f02aa6e029a34d82399b92229dc7d328aec") {
        for(let $i = 0; $i < 47; $i += 1){
            $[$i] = Symbol.for("react.memo_cache_sentinel");
        }
        $[0] = "6c74d3dc5fde99ddabc7710bffdd0f02aa6e029a34d82399b92229dc7d328aec";
    }
    const { game, onPlay, onEdit, onDelete, onSelect, isSelected, isDeleteMode, onEnterDeleteMode, onCoverArtClick, colors } = t0;
    const cardClass = `group relative overflow-hidden w-64 h-80 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg hover:z-10 border animate-border-breathe ${isDeleteMode ? "animate-shake" : "hover:scale-[1.02]"}`;
    const t1 = isDeleteMode && isSelected ? "#ef4444" : colors.midDark;
    let t2;
    if ($[1] !== colors.highlight || $[2] !== t1) {
        t2 = {
            backgroundColor: t1,
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.3)",
            borderColor: colors.highlight
        };
        $[1] = colors.highlight;
        $[2] = t1;
        $[3] = t2;
    } else {
        t2 = $[3];
    }
    let t3;
    if ($[4] !== game.id || $[5] !== isDeleteMode || $[6] !== onSelect) {
        t3 = ({
            "GameCard[<div>.onClick]": ()=>isDeleteMode && onSelect(game.id)
        })["GameCard[<div>.onClick]"];
        $[4] = game.id;
        $[5] = isDeleteMode;
        $[6] = onSelect;
        $[7] = t3;
    } else {
        t3 = $[7];
    }
    let t4;
    if ($[8] !== isDeleteMode || $[9] !== isSelected) {
        t4 = isDeleteMode && isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "absolute inset-0 bg-red-500/40 z-20 flex items-center justify-center rounded-xl",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                className: "w-16 h-16 text-white drop-shadow-lg"
            }, void 0, false, {
                fileName: "[project]/src/components/GameCardComponent.tsx",
                lineNumber: 107,
                columnNumber: 137
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/GameCardComponent.tsx",
            lineNumber: 107,
            columnNumber: 40
        }, this);
        $[8] = isDeleteMode;
        $[9] = isSelected;
        $[10] = t4;
    } else {
        t4 = $[10];
    }
    let t5;
    if ($[11] !== isDeleteMode || $[12] !== isSelected) {
        t5 = isDeleteMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        fileName: "[project]/src/components/GameCardComponent.tsx",
                        lineNumber: 118,
                        columnNumber: 103
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/GameCardComponent.tsx",
                    lineNumber: 118,
                    columnNumber: 25
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/GameCardComponent.tsx",
                lineNumber: 116,
                columnNumber: 74
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/GameCardComponent.tsx",
            lineNumber: 116,
            columnNumber: 26
        }, this);
        $[11] = isDeleteMode;
        $[12] = isSelected;
        $[13] = t5;
    } else {
        t5 = $[13];
    }
    let t6;
    if ($[14] !== colors.gradientFrom || $[15] !== colors.gradientTo || $[16] !== game.coverArt || $[17] !== game.coverArtFit) {
        t6 = game.coverArt ? {
            backgroundImage: `url(${game.coverArt})`,
            backgroundColor: "transparent",
            backgroundSize: game.coverArtFit || "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat"
        } : {
            ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGradientStyle"])(colors.gradientFrom, colors.gradientTo)
        };
        $[14] = colors.gradientFrom;
        $[15] = colors.gradientTo;
        $[16] = game.coverArt;
        $[17] = game.coverArtFit;
        $[18] = t6;
    } else {
        t6 = $[18];
    }
    let t7;
    if ($[19] !== colors.darkBg || $[20] !== game || $[21] !== isDeleteMode || $[22] !== onCoverArtClick) {
        t7 = !game.coverArt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                    fileName: "[project]/src/components/GameCardComponent.tsx",
                    lineNumber: 148,
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
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "sr-only",
                        children: "Add cover art"
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameCardComponent.tsx",
                        lineNumber: 155,
                        columnNumber: 69
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/GameCardComponent.tsx",
                    lineNumber: 150,
                    columnNumber: 87
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/GameCardComponent.tsx",
            lineNumber: 146,
            columnNumber: 28
        }, this);
        $[19] = colors.darkBg;
        $[20] = game;
        $[21] = isDeleteMode;
        $[22] = onCoverArtClick;
        $[23] = t7;
    } else {
        t7 = $[23];
    }
    let t8;
    if ($[24] !== t6 || $[25] !== t7) {
        t8 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "h-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative",
            style: t6,
            children: t7
        }, void 0, false, {
            fileName: "[project]/src/components/GameCardComponent.tsx",
            lineNumber: 166,
            columnNumber: 10
        }, this);
        $[24] = t6;
        $[25] = t7;
        $[26] = t8;
    } else {
        t8 = $[26];
    }
    let t9;
    if ($[27] !== colors.darkBg || $[28] !== colors.gradientFrom || $[29] !== colors.gradientTo || $[30] !== colors.highlight || $[31] !== colors.softLight || $[32] !== game || $[33] !== isDeleteMode || $[34] !== onDelete || $[35] !== onEdit || $[36] !== onEnterDeleteMode || $[37] !== onPlay) {
        t9 = !isDeleteMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                        fileName: "[project]/src/components/GameCardComponent.tsx",
                        lineNumber: 175,
                        columnNumber: 377
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm mb-3",
                        style: {
                            color: colors.highlight
                        },
                        children: game.genre
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameCardComponent.tsx",
                        lineNumber: 178,
                        columnNumber: 29
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2.5 items-stretch mt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "w-full font-bold py-2.5 px-4 rounded-lg transition-all text-sm hover:shadow-md active:scale-[0.98] flex-1",
                                style: {
                                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGradientStyle"])(colors.gradientFrom, colors.gradientTo),
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
                                fileName: "[project]/src/components/GameCardComponent.tsx",
                                lineNumber: 180,
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
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameCardComponent.tsx",
                                    lineNumber: 196,
                                    columnNumber: 44
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameCardComponent.tsx",
                                lineNumber: 188,
                                columnNumber: 57
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center select-none",
                                style: {
                                    backgroundColor: "#ef4444",
                                    color: "#ffffff"
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
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameCardComponent.tsx",
                                    lineNumber: 237,
                                    columnNumber: 44
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameCardComponent.tsx",
                                lineNumber: 196,
                                columnNumber: 85
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/GameCardComponent.tsx",
                        lineNumber: 180,
                        columnNumber: 28
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/GameCardComponent.tsx",
                lineNumber: 175,
                columnNumber: 239
            }, this)
        }, void 0, false, {
            fileName: "[project]/src/components/GameCardComponent.tsx",
            lineNumber: 175,
            columnNumber: 27
        }, this);
        $[27] = colors.darkBg;
        $[28] = colors.gradientFrom;
        $[29] = colors.gradientTo;
        $[30] = colors.highlight;
        $[31] = colors.softLight;
        $[32] = game;
        $[33] = isDeleteMode;
        $[34] = onDelete;
        $[35] = onEdit;
        $[36] = onEnterDeleteMode;
        $[37] = onPlay;
        $[38] = t9;
    } else {
        t9 = $[38];
    }
    let t10;
    if ($[39] !== cardClass || $[40] !== t2 || $[41] !== t3 || $[42] !== t4 || $[43] !== t5 || $[44] !== t8 || $[45] !== t9) {
        t10 = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: cardClass,
            style: t2,
            onClick: t3,
            children: [
                t4,
                t5,
                t8,
                t9
            ]
        }, void 0, true, {
            fileName: "[project]/src/components/GameCardComponent.tsx",
            lineNumber: 255,
            columnNumber: 11
        }, this);
        $[39] = cardClass;
        $[40] = t2;
        $[41] = t3;
        $[42] = t4;
        $[43] = t5;
        $[44] = t8;
        $[45] = t9;
        $[46] = t10;
    } else {
        t10 = $[46];
    }
    return t10;
}
_c = GameCard;
var _c;
__turbopack_context__.k.register(_c, "GameCard");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emulator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/emulator.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/storage.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/index.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameCardComponent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/GameCardComponent.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gamepad-2.js [app-client] (ecmascript) <export default as Gamepad2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-client] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-client] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-client] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-client] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-client] (ecmascript) <export default as ArrowUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-client] (ecmascript) <export default as ArrowDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-client] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-client] (ecmascript) <export default as Plus>");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
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
    const [selectedTheme, setSelectedTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('default');
    const [searchFocused, setSearchFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gameSearchFocused, setGameSearchFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gameSearchQuery, setGameSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [gameSearchExpanded, setGameSearchExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [coverArtFit, setCoverArtFit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('cover');
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('title');
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('asc');
    const [isHydrated, setIsHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedGameIds, setSelectedGameIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [isDeleteMode, setIsDeleteMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deletingGameIds, setDeletingGameIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const gameSearchInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Sync theme from localStorage immediately before first render to prevent flash
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"])({
        "Home.useLayoutEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            const savedTheme = localStorage.getItem('theme') || 'default';
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
    const toggleGameSearch = ()=>{
        setGameSearchExpanded((prev_1)=>{
            const next_1 = !prev_1;
            if (next_1) {
                requestAnimationFrame(()=>gameSearchInputRef.current?.focus());
            } else {
                setGameSearchQuery('');
            }
            return next_1;
        });
    };
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
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emulator$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["loadGame"])(file_6, game_4.core, currentColors.playGreen);
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
    const currentColors = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["THEMES"][selectedTheme] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["THEMES"].default;
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
    // Sort and filter games
    const sortedGames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Home.useMemo[sortedGames]": ()=>{
            let filtered = [
                ...games
            ];
            // Filter by search query
            if (gameSearchQuery.trim()) {
                const query = gameSearchQuery.toLowerCase();
                filtered = filtered.filter({
                    "Home.useMemo[sortedGames]": (game_5)=>game_5.title.toLowerCase().includes(query) || game_5.genre.toLowerCase().includes(query)
                }["Home.useMemo[sortedGames]"]);
            }
            filtered.sort({
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
            return filtered;
        }
    }["Home.useMemo[sortedGames]"], [
        games,
        sortBy,
        sortOrder,
        gameSearchQuery
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
                "Home.useMemo[groupedGames]": (game_6)=>{
                    const category_0 = getSystemCategory(game_6.core);
                    groups[category_0].push(game_6);
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
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold",
                            style: {
                                color: currentColors.softLight
                            },
                            children: "Select Theme"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 706,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 705,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                        children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["THEMES"]).map(([themeName_0, themeColors])=>{
                            const baseName = themeName_0;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleThemeChange(baseName),
                                className: "p-6 rounded-xl transition-all border-2 relative overflow-hidden",
                                style: {
                                    backgroundColor: themeColors.midDark,
                                    borderColor: selectedTheme === baseName ? themeColors.playGreen : themeColors.highlight + '40',
                                    boxShadow: selectedTheme === baseName ? `0 2px 8px ${themeColors.playGreen}30` : '0 2px 4px rgba(0, 0, 0, 0.2)'
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
                                                children: baseName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 721,
                                                columnNumber: 19
                                            }, this),
                                            selectedTheme === baseName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
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
                                                    lineNumber: 729,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 726,
                                                columnNumber: 50
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 720,
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
                                                lineNumber: 733,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.midDark
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 736,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.playGreen
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 739,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.highlight
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 742,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 732,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, themeName_0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 715,
                                columnNumber: 20
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 712,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 704,
                columnNumber: 14
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                    className: "text-2xl font-bold mb-4",
                    style: {
                        color: currentColors.softLight
                    },
                    children: [
                        "Games (",
                        sortedGames.length,
                        ")"
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 752,
                    columnNumber: 9
                }, this),
                games.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4 mb-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col lg:flex-row lg:items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-3 items-center flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center rounded-xl border-2 transition-all",
                                        style: {
                                            backgroundColor: currentColors.darkBg,
                                            borderColor: gameSearchFocused ? currentColors.playGreen : currentColors.highlight + '50',
                                            boxShadow: gameSearchFocused ? `0 0 0 2px ${currentColors.playGreen}30` : 'none',
                                            width: '340px',
                                            height: '48px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-12 h-full flex items-center justify-center flex-shrink-0",
                                                style: {
                                                    color: currentColors.softLight
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 770,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 767,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                ref: gameSearchInputRef,
                                                type: "text",
                                                placeholder: "Search games...",
                                                value: gameSearchQuery,
                                                onChange: (e_2)=>setGameSearchQuery(e_2.target.value),
                                                onFocus: ()=>setGameSearchFocused(true),
                                                onBlur: ()=>setGameSearchFocused(false),
                                                className: "bg-transparent h-full flex-1 focus:outline-none text-sm pr-4",
                                                style: {
                                                    color: currentColors.softLight
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 772,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 760,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 px-4 py-2 rounded-xl border-2",
                                        style: {
                                            backgroundColor: currentColors.darkBg,
                                            borderColor: currentColors.highlight + '40',
                                            height: '48px'
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
                                                lineNumber: 781,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-1",
                                                children: [
                                                    'title',
                                                    'system'
                                                ].map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setSortBy(option),
                                                        className: "px-3 py-1 rounded-lg text-sm font-medium transition-all active:scale-95 h-9",
                                                        style: {
                                                            backgroundColor: sortBy === option ? currentColors.highlight : currentColors.midDark,
                                                            color: sortBy === option ? currentColors.darkBg : currentColors.softLight
                                                        },
                                                        children: option === 'title' ? 'Title' : 'System'
                                                    }, option, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 785,
                                                        columnNumber: 67
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 784,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'),
                                                className: "px-2 py-1 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95 flex items-center justify-center h-9",
                                                style: {
                                                    backgroundColor: currentColors.midDark,
                                                    color: currentColors.softLight
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-4 h-4 flex items-center justify-center",
                                                    children: sortOrder === 'asc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__["ArrowUp"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 797,
                                                        columnNumber: 46
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 797,
                                                        columnNumber: 80
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 796,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 792,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 776,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 759,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-3 justify-end items-center",
                                children: isDeleteMode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
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
                                            lineNumber: 804,
                                            columnNumber: 21
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
                                            lineNumber: 811,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleFileSelect,
                                    className: "px-8 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95 flex items-center gap-2 justify-center",
                                    style: {
                                        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGradientStyle"])(currentColors.gradientFrom, currentColors.gradientTo),
                                        color: currentColors.darkBg,
                                        height: '48px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 822,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Add Game"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 823,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 817,
                                    columnNumber: 25
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 802,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 758,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 757,
                    columnNumber: 30
                }, this),
                sortBy === 'system' && groupedGames && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
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
                                            lineNumber: 831,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 h-px",
                                            style: {
                                                backgroundColor: currentColors.highlight + '30'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 836,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 830,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap",
                                    style: {
                                        gap: '1rem'
                                    },
                                    children: categoryGames.map((game_7, index_1)=>{
                                        const isGameDeleting = deletingGameIds.has(game_7.id);
                                        // Only count games that are NOT being deleted for animation purposes
                                        const visibleIndex = categoryGames.slice(0, index_1).filter((g_10)=>!deletingGameIds.has(g_10.id)).length;
                                        const reverseStaggerDelay = (categoryGames.length - 1 - index_1) * 0.03;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                animation: isGameDeleting ? `fadeOut 0.3s ease-in-out ${reverseStaggerDelay}s forwards` : `fadeIn 0.5s ease-in-out ${visibleIndex * 0.03}s both`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameCardComponent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameCard"], {
                                                game: game_7,
                                                onPlay: handlePlayClick,
                                                onEdit: handleEditGame,
                                                onDelete: handleDeleteGame,
                                                onSelect: toggleGameSelection,
                                                isSelected: selectedGameIds.has(game_7.id),
                                                isDeleteMode: isDeleteMode,
                                                onEnterDeleteMode: ()=>setIsDeleteMode(true),
                                                colors: currentColors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 851,
                                                columnNumber: 25
                                            }, this)
                                        }, game_7.id, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 848,
                                            columnNumber: 22
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 840,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, category_2, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 829,
                            columnNumber: 80
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 828,
                    columnNumber: 49
                }, this),
                (!sortBy || sortBy !== 'system') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap",
                    style: {
                        gap: '1rem'
                    },
                    children: sortedGames.map((game_8, index_2)=>{
                        const isGameDeleting_0 = deletingGameIds.has(game_8.id);
                        // Only count games that are NOT being deleted for animation purposes
                        const visibleIndex_0 = sortedGames.slice(0, index_2).filter((g_11)=>!deletingGameIds.has(g_11.id)).length;
                        const reverseStaggerDelay_0 = (sortedGames.length - 1 - index_2) * 0.03;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                animation: isGameDeleting_0 ? `fadeOut 0.3s ease-in-out ${reverseStaggerDelay_0}s forwards` : `fadeIn 0.5s ease-in-out ${visibleIndex_0 * 0.03}s both`
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameCardComponent$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["GameCard"], {
                                game: game_8,
                                onPlay: handlePlayClick,
                                onEdit: handleEditGame,
                                onDelete: handleDeleteGame,
                                onSelect: toggleGameSelection,
                                isSelected: selectedGameIds.has(game_8.id),
                                isDeleteMode: isDeleteMode,
                                onEnterDeleteMode: ()=>setIsDeleteMode(true),
                                onCoverArtClick: (game_9)=>{
                                    setEditingGame(game_9);
                                    setPendingGame(game_9);
                                    setCoverArtFit(game_9.coverArtFit || 'cover');
                                    setSystemPickerOpen(true);
                                },
                                colors: currentColors
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 868,
                                columnNumber: 19
                            }, this)
                        }, game_8.id, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 865,
                            columnNumber: 18
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 857,
                    columnNumber: 46
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 751,
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
            lineNumber: 880,
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
                    lineNumber: 887,
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
                                    lineNumber: 895,
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
                                    lineNumber: 896,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 892,
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
                                            lineNumber: 931,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold",
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 932,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, view_0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 923,
                                    columnNumber: 26
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 910,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 888,
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
                                            lineNumber: 942,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-4",
                                            children: isMounted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "hidden sm:block text-sm font-medium px-3 py-1.5 rounded-lg transition-all",
                                                style: {
                                                    color: currentColors.softLight,
                                                    backgroundColor: currentColors.midDark
                                                },
                                                children: currentTime
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 949,
                                                columnNumber: 35
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 948,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 941,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 940,
                                columnNumber: 15
                            }, this),
                            renderContent()
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 937,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 936,
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
                                    lineNumber: 970,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 969,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: duplicateMessage
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 972,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 968,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 961,
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
                                lineNumber: 984,
                                columnNumber: 32
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                className: "w-7 h-7 transition-transform"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 984,
                                columnNumber: 90
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 980,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 mx-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 986,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 975,
                    columnNumber: 11
                }, this),
                (systemPickerOpen || systemPickerClosing) && (()=>{
                    // SYSTEM_PICKER is already organized by category
                    const filteredCategories = {};
                    Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SYSTEM_PICKER"]).forEach(([category_3, systems_0])=>{
                        const filtered_0 = Object.entries(systems_0).filter(([name])=>name.toLowerCase().includes(systemSearchQuery.toLowerCase()));
                        if (filtered_0.length > 0) {
                            filteredCategories[category_3] = filtered_0;
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
                            onClick: (e_3)=>e_3.stopPropagation(),
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
                                            lineNumber: 1009,
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
                                            lineNumber: 1014,
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
                                            lineNumber: 1019,
                                            columnNumber: 49
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1008,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col xl:flex-row gap-6 flex-1 min-h-0 overflow-hidden",
                                    children: [
                                        pendingFiles.length <= 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-shrink-0 w-full xl:w-80 space-y-4 max-h-[60vh] xl:max-h-full overflow-y-auto",
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
                                                                    lineNumber: 1036,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1035,
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
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                        className: "w-5 h-5"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1046,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1042,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1041,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1034,
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
                                                                            lineNumber: 1059,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1056,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1053,
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
                                                                    lineNumber: 1062,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1052,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1049,
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
                                                            lineNumber: 1072,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1069,
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
                                                                onChange: (e_4)=>{
                                                                    const file_7 = e_4.target.files?.[0];
                                                                    if (file_7) {
                                                                        handleCoverArtFileUpload(file_7);
                                                                    }
                                                                },
                                                                className: "hidden",
                                                                id: "cover-art-file-input"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1086,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "cover-art-file-input",
                                                                className: "block w-full px-4 py-2.5 rounded-lg transition-all text-sm font-semibold text-center active:scale-95",
                                                                style: {
                                                                    ...editingGame?.coverArt || pendingGame?.coverArt ? {
                                                                        backgroundColor: currentColors.highlight
                                                                    } : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGradientStyle"])(currentColors.gradientFrom, currentColors.gradientTo),
                                                                    color: currentColors.darkBg
                                                                },
                                                                children: editingGame?.coverArt || pendingGame?.coverArt ? 'Change Image' : 'Upload Cover Art'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1092,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1083,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1030,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1029,
                                            columnNumber: 50
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `${pendingFiles.length > 1 ? 'w-full' : 'flex-1'} flex flex-col min-w-0`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-full flex items-center rounded-xl border-2 transition-all mb-4",
                                                    style: {
                                                        backgroundColor: currentColors.darkBg,
                                                        borderColor: searchFocused ? currentColors.playGreen : currentColors.highlight + '50',
                                                        boxShadow: searchFocused ? `0 0 0 2px ${currentColors.playGreen}30` : 'none'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-10 h-10 flex items-center justify-center flex-shrink-0",
                                                            style: {
                                                                color: currentColors.softLight
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                                className: "w-4 h-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1114,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1111,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            placeholder: "Search systems...",
                                                            value: systemSearchQuery,
                                                            onChange: (e_5)=>setSystemSearchQuery(e_5.target.value),
                                                            onFocus: ()=>setSearchFocused(true),
                                                            onBlur: ()=>setSearchFocused(false),
                                                            className: "bg-transparent h-10 flex-1 focus:outline-none text-sm pr-4",
                                                            style: {
                                                                color: currentColors.softLight
                                                            },
                                                            autoFocus: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1116,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 1106,
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
                                                                                lineNumber: 1124,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex-1 h-px",
                                                                                style: {
                                                                                    backgroundColor: currentColors.highlight + '30'
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                lineNumber: 1129,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1123,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5",
                                                                        children: systems_1.map(([name_0, core_1], index_4)=>{
                                                                            const isSelected = currentCore === core_1;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                className: "p-3.5 rounded-xl text-left transition-all active:scale-[0.97] border-2 relative flex items-center justify-between group",
                                                                                style: {
                                                                                    backgroundColor: isSelected ? currentColors.highlight : currentColors.sidebarHover,
                                                                                    borderColor: isSelected ? currentColors.highlight : currentColors.highlight + '30',
                                                                                    color: isSelected ? currentColors.darkBg : currentColors.softLight,
                                                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                                                                    animation: `fadeIn 0.4s ease-out ${index_4 * 0.03}s both`
                                                                                },
                                                                                onMouseEnter: (e_6)=>{
                                                                                    if (!isSelected) {
                                                                                        e_6.currentTarget.style.backgroundColor = currentColors.highlight + '20';
                                                                                        e_6.currentTarget.style.borderColor = currentColors.highlight + '50';
                                                                                    }
                                                                                },
                                                                                onMouseLeave: (e_7)=>{
                                                                                    if (!isSelected) {
                                                                                        e_7.currentTarget.style.backgroundColor = currentColors.sidebarHover;
                                                                                        e_7.currentTarget.style.borderColor = currentColors.highlight + '30';
                                                                                    }
                                                                                },
                                                                                onClick: ()=>selectSystem(core_1),
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "font-medium text-sm leading-tight truncate pr-2 flex-1",
                                                                                        children: name_0
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/page.tsx",
                                                                                        lineNumber: 1153,
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
                                                                                                lineNumber: 1158,
                                                                                                columnNumber: 43
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/page.tsx",
                                                                                            lineNumber: 1157,
                                                                                            columnNumber: 54
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/page.tsx",
                                                                                        lineNumber: 1156,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, core_1, true, {
                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                lineNumber: 1136,
                                                                                columnNumber: 32
                                                                            }, this);
                                                                        })
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1133,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, category_4, true, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1122,
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
                                                                            lineNumber: 1172,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1171,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1168,
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
                                                                    lineNumber: 1175,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm opacity-70",
                                                                    children: "Try a different search term"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1178,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1165,
                                                            columnNumber: 74
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 1121,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1105,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1027,
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
                                                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getGradientStyle"])(currentColors.gradientFrom, currentColors.gradientTo),
                                                color: currentColors.darkBg
                                            },
                                            onClick: handleSystemPickerDone,
                                            children: "Done"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1187,
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
                                            lineNumber: 1193,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1184,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1001,
                            columnNumber: 17
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 998,
                        columnNumber: 16
                    }, this);
                })()
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 883,
            columnNumber: 13
        }, this)
    }, void 0, false);
}
_s(Home, "xEqqVu4gGIbIqCFW1aWKUS2u4ps=");
_c = Home;
var _c;
__turbopack_context__.k.register(_c, "Home");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_e9d83253._.js.map