module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/lib/emulator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "exitGame",
    ()=>exitGame,
    "loadGame",
    ()=>loadGame
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-ssr] (ecmascript)");
;
const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
const DEFAULT_EJS_COLOR = "#00ff7f";
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
async function detectCore(extension) {
    return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension] || "nes";
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
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
    return ("TURBOPACK compile-time truthy", 1) ? null : "TURBOPACK unreachable";
}
function exitGame() {
    cleanupOldElements();
    const g = document.getElementById("game");
    if (g) g.style.display = "none";
}
}),
"[project]/src/lib/storage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
"[project]/src/types/index.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/components/GameCardComponent.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GameCard",
    ()=>GameCard,
    "getSystemDisplayName",
    ()=>getSystemDisplayName
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/settings.js [app-ssr] (ecmascript) <export default as Settings>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/index.ts [app-ssr] (ecmascript)");
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
function GameCard({ game, onPlay, onEdit, onDelete, onSelect, isSelected, isDeleteMode, onEnterDeleteMode, onCoverArtClick, colors }) {
    const baseCoverClass = "h-full flex items-center justify-center bg-cover bg-center bg-no-repeat relative";
    const cardClass = `group relative overflow-hidden w-64 h-80 rounded-xl transition-all duration-300 ease-in-out hover:shadow-lg hover:z-10 border animate-border-breathe ${isDeleteMode ? 'animate-shake' : 'hover:scale-[1.02]'}`;
    const overlayClass = "absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent backdrop-brightness-75 flex flex-col justify-end p-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300";
    const contentClass = "transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out";
    const buttonClass = "w-full font-bold py-2.5 px-4 rounded-lg transition-all text-sm hover:shadow-md active:scale-[0.98]";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: cardClass,
        style: {
            backgroundColor: isDeleteMode && isSelected ? '#ef4444' : colors.midDark,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            borderColor: colors.highlight
        },
        onClick: ()=>isDeleteMode && onSelect(game.id),
        children: [
            isDeleteMode && isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute inset-0 bg-red-500/40 z-20 flex items-center justify-center rounded-xl",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                    className: "w-16 h-16 text-white drop-shadow-lg"
                }, void 0, false, {
                    fileName: "[project]/src/components/GameCardComponent.tsx",
                    lineNumber: 49,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/GameCardComponent.tsx",
                lineNumber: 48,
                columnNumber: 9
            }, this),
            isDeleteMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "absolute bottom-3 right-3 z-20",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-6 h-6 rounded-full border-2 border-white flex items-center justify-center transition-all",
                    style: {
                        backgroundColor: isSelected ? 'white' : 'transparent'
                    },
                    children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                        className: "w-4 h-4 text-red-500",
                        fill: "currentColor",
                        viewBox: "0 0 20 20",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                            fillRule: "evenodd",
                            d: "M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z",
                            clipRule: "evenodd"
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameCardComponent.tsx",
                            lineNumber: 60,
                            columnNumber: 17
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/GameCardComponent.tsx",
                        lineNumber: 59,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/components/GameCardComponent.tsx",
                    lineNumber: 54,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/GameCardComponent.tsx",
                lineNumber: 53,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: baseCoverClass,
                style: game.coverArt ? {
                    backgroundImage: `url(${game.coverArt})`,
                    backgroundColor: 'transparent',
                    backgroundSize: game.coverArtFit || 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                } : {
                    ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGradientStyle"])(colors.gradientFrom, colors.gradientTo)
                },
                children: !game.coverArt && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex items-center justify-center",
                    style: {
                        color: colors.darkBg
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-4xl font-bold tracking-wide",
                            style: {
                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            },
                            children: getSystemDisplayName(game.core)
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameCardComponent.tsx",
                            lineNumber: 80,
                            columnNumber: 13
                        }, this),
                        onCoverArtClick && !isDeleteMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: (e)=>{
                                e.stopPropagation();
                                onCoverArtClick(game);
                            },
                            className: "absolute inset-0",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "sr-only",
                                children: "Add cover art"
                            }, void 0, false, {
                                fileName: "[project]/src/components/GameCardComponent.tsx",
                                lineNumber: 88,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameCardComponent.tsx",
                            lineNumber: 84,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GameCardComponent.tsx",
                    lineNumber: 79,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/GameCardComponent.tsx",
                lineNumber: 66,
                columnNumber: 7
            }, this),
            !isDeleteMode && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: overlayClass,
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: contentClass,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-xl font-bold truncate mb-1.5",
                            style: {
                                color: colors.softLight,
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                            },
                            children: game.title
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameCardComponent.tsx",
                            lineNumber: 97,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm mb-3",
                            style: {
                                color: colors.highlight
                            },
                            children: game.genre
                        }, void 0, false, {
                            fileName: "[project]/src/components/GameCardComponent.tsx",
                            lineNumber: 98,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2.5 items-stretch mt-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: buttonClass + " flex-1",
                                    style: {
                                        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGradientStyle"])(colors.gradientFrom, colors.gradientTo),
                                        color: colors.darkBg
                                    },
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        onPlay(game);
                                    },
                                    children: "PLAY"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameCardComponent.tsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center",
                                    style: {
                                        backgroundColor: colors.highlight,
                                        color: colors.darkBg
                                    },
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        onEdit(game);
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$settings$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Settings$3e$__["Settings"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameCardComponent.tsx",
                                        lineNumber: 114,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameCardComponent.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center select-none",
                                    style: {
                                        backgroundColor: '#ef4444',
                                        color: '#ffffff'
                                    },
                                    onMouseDown: (e)=>{
                                        e.stopPropagation();
                                        const timeout = setTimeout(()=>{
                                            onEnterDeleteMode();
                                        }, 500);
                                        const cleanup = ()=>clearTimeout(timeout);
                                        e.currentTarget.addEventListener('mouseup', cleanup, {
                                            once: true
                                        });
                                        e.currentTarget.addEventListener('mouseleave', cleanup, {
                                            once: true
                                        });
                                    },
                                    onTouchStart: (e)=>{
                                        e.stopPropagation();
                                        const timeout = setTimeout(()=>{
                                            onEnterDeleteMode();
                                        }, 500);
                                        const cleanup = ()=>clearTimeout(timeout);
                                        e.currentTarget.addEventListener('touchend', cleanup, {
                                            once: true
                                        });
                                    },
                                    onClick: (e)=>{
                                        e.stopPropagation();
                                        onDelete(game);
                                    },
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                        className: "w-5 h-5"
                                    }, void 0, false, {
                                        fileName: "[project]/src/components/GameCardComponent.tsx",
                                        lineNumber: 141,
                                        columnNumber: 15
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/src/components/GameCardComponent.tsx",
                                    lineNumber: 116,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/GameCardComponent.tsx",
                            lineNumber: 101,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/GameCardComponent.tsx",
                    lineNumber: 96,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/GameCardComponent.tsx",
                lineNumber: 95,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/GameCardComponent.tsx",
        lineNumber: 38,
        columnNumber: 5
    }, this);
}
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emulator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/emulator.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/storage.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/types/index.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameCardComponent$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/components/GameCardComponent.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/gamepad-2.js [app-ssr] (ecmascript) <export default as Gamepad2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/palette.js [app-ssr] (ecmascript) <export default as Palette>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/menu.js [app-ssr] (ecmascript) <export default as Menu>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/x.js [app-ssr] (ecmascript) <export default as X>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/trash-2.js [app-ssr] (ecmascript) <export default as Trash2>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-up.js [app-ssr] (ecmascript) <export default as ArrowUp>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/arrow-down.js [app-ssr] (ecmascript) <export default as ArrowDown>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/search.js [app-ssr] (ecmascript) <export default as Search>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__ = __turbopack_context__.i("[project]/node_modules/lucide-react/dist/esm/icons/plus.js [app-ssr] (ecmascript) <export default as Plus>");
"use client";
;
;
;
;
;
;
;
;
function Home() {
    const [activeView, setActiveView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('library');
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [games, setGames] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [editingGame, setEditingGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [systemPickerOpen, setSystemPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [systemPickerClosing, setSystemPickerClosing] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingGame, setPendingGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [pendingFiles, setPendingFiles] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [systemSearchQuery, setSystemSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [duplicateMessage, setDuplicateMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [showDuplicateMessage, setShowDuplicateMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [isLoadingGames, setIsLoadingGames] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(true);
    const [selectedTheme, setSelectedTheme] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('default');
    const [searchFocused, setSearchFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gameSearchFocused, setGameSearchFocused] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [gameSearchQuery, setGameSearchQuery] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [gameSearchExpanded, setGameSearchExpanded] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [coverArtFit, setCoverArtFit] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('cover');
    const [sortBy, setSortBy] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('title');
    const [sortOrder, setSortOrder] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('asc');
    const [isHydrated, setIsHydrated] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [selectedGameIds, setSelectedGameIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const [isDeleteMode, setIsDeleteMode] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [deletingGameIds, setDeletingGameIds] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(new Set());
    const gameSearchInputRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // Sync theme from localStorage immediately before first render to prevent flash
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useLayoutEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const savedTheme = undefined;
    }, []);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, [
        selectedTheme
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        // Load sort preferences from localStorage
        const savedSortBy = undefined;
        const savedSortOrder = undefined;
        const updateTime = undefined;
        const interval = undefined;
        // Load games from localStorage on mount
        const loadGames = undefined;
    }, []);
    // Save sort preferences to localStorage when they change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, [
        sortBy
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
    }, [
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
                const genre = pendingGame.genre || (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSystemNameByCore"])(pendingGame.core) || 'Unknown System';
                const isDuplicate = games.some((g)=>g.fileName === file.name);
                if (isDuplicate) {
                    setDuplicateMessage(`"${file.name}" is already in your library`);
                    setShowDuplicateMessage(true);
                    closeSystemPicker();
                    setTimeout(()=>setShowDuplicateMessage(false), 2500);
                    setTimeout(()=>setDuplicateMessage(null), 3000);
                    return;
                }
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveGameFile"])(gameId, file);
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
    const migrateGameToIndexedDB = async (game, allGames)=>{
        if (!game.fileData || !game.fileData.startsWith('data:')) {
            // Already migrated or invalid
            return allGames;
        }
        try {
            // Convert base64 back to File
            const response = await fetch(game.fileData);
            const blob = await response.blob();
            const file = new File([
                blob
            ], game.fileName || game.title, {
                type: 'application/octet-stream'
            });
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveGameFile"])(game.id, file);
            // Remove fileData from game object
            const { fileData, ...gameWithoutData } = game;
            return allGames.map((g)=>g.id === game.id ? gameWithoutData : g);
        } catch (error) {
            console.error('Error migrating game to IndexedDB:', error);
            return allGames;
        }
    };
    const getSystemFromExtension = (extension)=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension.toLowerCase()] || null;
    };
    const processGameFile = async (file, index, selectedCore, currentGamesList)=>{
        const fileName = file.name;
        const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
        const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
        // Check for duplicates
        const gamesListToCheck = currentGamesList || games;
        const isDuplicate = gamesListToCheck.some((g)=>g.fileName === fileName || g.filePath === file.name);
        if (isDuplicate) {
            setDuplicateMessage(`"${fileName}" is already in your library`);
            setShowDuplicateMessage(true);
            setTimeout(()=>setShowDuplicateMessage(false), 2500);
            setTimeout(()=>setDuplicateMessage(null), 3000);
            return gamesListToCheck;
        }
        const detectedCore = selectedCore || getSystemFromExtension(fileExtension);
        const gameId = Date.now() + index;
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveGameFile"])(gameId, file);
        // Get system name for genre display
        const systemName = detectedCore ? (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSystemNameByCore"])(detectedCore) : 'Unknown System';
        const gameData = {
            id: gameId,
            title: nameWithoutExt,
            genre: systemName,
            filePath: file.name,
            fileName: fileName,
            core: detectedCore || undefined
        };
        if (detectedCore) {
            const newGame = gameData;
            const updatedGames = [
                ...gamesListToCheck,
                newGame
            ];
            setGames(updatedGames);
            localStorage.setItem('games', JSON.stringify(updatedGames));
            return updatedGames;
        }
        return gamesListToCheck;
    };
    const selectSystem = async (core)=>{
        const systemName = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getSystemNameByCore"])(core);
        // If adding multiple files from file picker
        if (pendingFiles.length > 1) {
            let currentGames = games;
            for (const { file, index } of pendingFiles){
                currentGames = await processGameFile(file, index, core, currentGames);
            }
            setPendingFiles([]);
            closeSystemPicker();
            return;
        }
        // If adding a single file from file picker without detected system
        if (editingGame) {
            // When editing, update the selection and keep modal open
            const updatedGames = games.map((g)=>g.id === editingGame.id ? {
                    ...g,
                    core: core,
                    genre: systemName
                } : g);
            setGames(updatedGames);
            localStorage.setItem('games', JSON.stringify(updatedGames));
            // Update the editing game and pending game to reflect the new selection
            setEditingGame({
                ...editingGame,
                core: core,
                genre: systemName
            });
            if (pendingGame) {
                setPendingGame({
                    ...pendingGame,
                    core: core,
                    genre: systemName
                });
            }
        // Don't close the modal - let user close it manually
        } else if (pendingGame) {
            setPendingGame({
                ...pendingGame,
                core: core,
                genre: systemName
            });
        }
    };
    const applyCoverArt = async (coverArt)=>{
        if (!coverArt) return;
        if (editingGame) {
            const updatedGames = games.map((g)=>g.id === editingGame.id ? {
                    ...g,
                    coverArt: coverArt,
                    coverArtFit: coverArtFit
                } : g);
            setGames(updatedGames);
            localStorage.setItem('games', JSON.stringify(updatedGames));
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
            const updatedGames = games.map((g)=>g.id === editingGame.id ? {
                    ...g,
                    coverArtFit: newFit
                } : g);
            setGames(updatedGames);
            localStorage.setItem('games', JSON.stringify(updatedGames));
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
    const handleCoverArtFileUpload = async (file)=>{
        try {
            const reader = new FileReader();
            reader.onload = (e)=>{
                const dataUrl = e.target?.result;
                applyCoverArt(dataUrl);
            };
            reader.onerror = ()=>{
                console.error('Error reading file');
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error uploading cover art:', error);
        }
    };
    const removeCoverArt = ()=>{
        if (editingGame) {
            const updatedGames = games.map((g)=>g.id === editingGame.id ? {
                    ...g,
                    coverArt: undefined
                } : g);
            setGames(updatedGames);
            localStorage.setItem('games', JSON.stringify(updatedGames));
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
                    input.onchange = (e)=>{
                        resolve(Array.from(e.target.files || []));
                    };
                    input.click();
                });
            }
            // First, process files with detected systems
            const filesNeedingSystem = [];
            let currentGames = games;
            for(let i = 0; i < files.length; i++){
                const file = files[i];
                const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
                const detectedCore = getSystemFromExtension(fileExtension);
                if (detectedCore) {
                    // Auto-add files with detected systems
                    currentGames = await processGameFile(file, i, detectedCore, currentGames);
                } else {
                    // Collect files that need system selection
                    filesNeedingSystem.push({
                        file,
                        index: i
                    });
                }
            }
            // Filter out duplicates
            const filteredFilesNeedingSystem = filesNeedingSystem.filter(({ file })=>{
                const fileName = file.name;
                return !currentGames.some((g)=>g.fileName === fileName || g.filePath === file.name);
            });
            // If there are files without detected systems, show system picker
            if (filteredFilesNeedingSystem.length > 0) {
                setPendingFiles(filteredFilesNeedingSystem);
                // Only set pendingGame if it's a single file (for the UI to show cover art section)
                if (filteredFilesNeedingSystem.length === 1) {
                    const fileName = filteredFilesNeedingSystem[0].file.name;
                    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
                    setPendingGame({
                        id: Date.now(),
                        title: nameWithoutExt,
                        genre: 'Unknown',
                        filePath: fileName,
                        fileName: fileName
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
    const handleEditGame = (game)=>{
        setEditingGame(game);
        setPendingGame({
            ...game
        });
        setCoverArtFit(game.coverArtFit || 'cover');
        setSystemPickerOpen(true);
    };
    const handleDeleteGame = async (game)=>{
        if (confirm(`Are you sure you want to delete "${game.title}"?`)) {
            try {
                const { deleteGameFile } = await __turbopack_context__.A("[project]/src/lib/storage.ts [app-ssr] (ecmascript, async loader)");
                // Trigger fade-out animation for this game
                setDeletingGameIds((prev)=>{
                    const next = new Set(prev);
                    next.add(game.id);
                    return next;
                });
                await new Promise((resolve)=>setTimeout(resolve, 400));
                await deleteGameFile(game.id);
                const updatedGames = games.filter((g)=>g.id !== game.id);
                setGames(updatedGames);
                localStorage.setItem('games', JSON.stringify(updatedGames));
                setDeletingGameIds((prev)=>{
                    const next = new Set(prev);
                    next.delete(game.id);
                    return next;
                });
            } catch (error) {
                console.error('Error deleting game:', error);
            }
        }
    };
    const toggleGameSelection = (gameId)=>{
        const newSelected = new Set(selectedGameIds);
        if (newSelected.has(gameId)) {
            newSelected.delete(gameId);
        } else {
            newSelected.add(gameId);
        }
        setSelectedGameIds(newSelected);
    };
    const toggleSelectAll = ()=>{
        if (selectedGameIds.size === games.length) {
            setSelectedGameIds(new Set());
        } else {
            setSelectedGameIds(new Set(games.map((g)=>g.id)));
        }
    };
    const handleMassDelete = async ()=>{
        if (selectedGameIds.size === 0) return;
        if (confirm(`Are you sure you want to delete ${selectedGameIds.size} game(s)? This action cannot be undone.`)) {
            try {
                const { deleteGameFile } = await __turbopack_context__.A("[project]/src/lib/storage.ts [app-ssr] (ecmascript, async loader)");
                // Trigger fade-out animation
                setDeletingGameIds(new Set(selectedGameIds));
                // Wait for animation to complete
                await new Promise((resolve)=>setTimeout(resolve, 400));
                // Delete from IndexedDB
                for (const gameId of selectedGameIds){
                    await deleteGameFile(gameId);
                }
                // Remove from state and localStorage
                const updatedGames = games.filter((g)=>!selectedGameIds.has(g.id));
                setGames(updatedGames);
                localStorage.setItem('games', JSON.stringify(updatedGames));
                setSelectedGameIds(new Set());
                setDeletingGameIds(new Set());
                setIsDeleteMode(false);
            } catch (error) {
                console.error('Error deleting games:', error);
            }
        }
    };
    const deleteButtonRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const deleteTimeoutRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isPressingRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(false);
    const toggleGameSearch = ()=>{
        setGameSearchExpanded((prev)=>{
            const next = !prev;
            if (next) {
                requestAnimationFrame(()=>gameSearchInputRef.current?.focus());
            } else {
                setGameSearchQuery('');
            }
            return next;
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
    const handlePlayClick = async (game)=>{
        try {
            let file = null;
            // Try to get file from IndexedDB first
            file = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGameFile"])(game.id);
            // Fallback to legacy fileData if IndexedDB doesn't have it
            if (!file && game.fileData) {
                const response = await fetch(game.fileData);
                const blob = await response.blob();
                file = new File([
                    blob
                ], game.fileName || game.title, {
                    type: 'application/octet-stream'
                });
                // Save to IndexedDB for next time
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$storage$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["saveGameFile"])(game.id, file);
            }
            if (file) {
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emulator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadGame"])(file, game.core, currentColors.playGreen);
            } else {
                console.error('Game file not found');
            }
        } catch (error) {
            console.error('Error loading game:', error);
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
    const currentColors = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEMES"][selectedTheme] || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEMES"].default;
    const handleThemeChange = (themeName)=>{
        setSelectedTheme(themeName);
    };
    // Get system category for a game based on the core
    const getSystemCategory = (core)=>{
        if (!core) return 'Other';
        // Check which category the core belongs to
        for (const [category, systems] of Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SYSTEM_PICKER"])){
            if (Object.values(systems).includes(core)) {
                return category;
            }
        }
        return 'Other';
    };
    // Sort and filter games
    const sortedGames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        let filtered = [
            ...games
        ];
        // Filter by search query
        if (gameSearchQuery.trim()) {
            const query = gameSearchQuery.toLowerCase();
            filtered = filtered.filter((game)=>game.title.toLowerCase().includes(query) || game.genre.toLowerCase().includes(query));
        }
        filtered.sort((a, b)=>{
            let comparison = 0;
            if (sortBy === 'title') {
                comparison = a.title.localeCompare(b.title);
            } else if (sortBy === 'system') {
                comparison = a.genre.localeCompare(b.genre);
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });
        return filtered;
    }, [
        games,
        sortBy,
        sortOrder,
        gameSearchQuery
    ]);
    // Group games by system category when sorting by system
    const groupedGames = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
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
        sortedGames.forEach((game)=>{
            const category = getSystemCategory(game.core);
            groups[category].push(game);
        });
        // Sort categories based on sort order
        if (sortOrder === 'desc') {
            categoryOrder.reverse();
        }
        // Create new object with sorted category order
        const sortedGroups = {};
        categoryOrder.forEach((category)=>{
            if (groups[category].length > 0) {
                sortedGroups[category] = groups[category];
            }
        });
        return sortedGroups;
    }, [
        sortedGames,
        sortBy,
        sortOrder
    ]);
    const renderContent = ()=>{
        if (activeView === 'themes') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between mb-6",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-2xl font-bold",
                            style: {
                                color: currentColors.softLight
                            },
                            children: "Select Theme"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 697,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 696,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
                        children: Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["THEMES"]).map(([themeName, themeColors])=>{
                            const baseName = themeName;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>handleThemeChange(baseName),
                                className: "p-6 rounded-xl transition-all border-2 relative overflow-hidden",
                                style: {
                                    backgroundColor: themeColors.midDark,
                                    borderColor: selectedTheme === baseName ? themeColors.playGreen : themeColors.highlight + '40',
                                    boxShadow: selectedTheme === baseName ? `0 2px 8px ${themeColors.playGreen}30` : '0 2px 4px rgba(0, 0, 0, 0.2)'
                                },
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                className: "text-xl font-bold capitalize",
                                                style: {
                                                    color: themeColors.softLight
                                                },
                                                children: baseName
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 716,
                                                columnNumber: 19
                                            }, this),
                                            selectedTheme === baseName && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                className: "w-6 h-6",
                                                fill: "currentColor",
                                                viewBox: "0 0 20 20",
                                                style: {
                                                    color: themeColors.playGreen
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                    fillRule: "evenodd",
                                                    d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                                    clipRule: "evenodd"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 721,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 720,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 715,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.darkBg
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 726,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.midDark
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 727,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.playGreen
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 728,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex-1 h-12 rounded-lg",
                                                style: {
                                                    backgroundColor: themeColors.highlight
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 729,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 725,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, themeName, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 705,
                                columnNumber: 15
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 701,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 695,
                columnNumber: 9
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
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
                    lineNumber: 740,
                    columnNumber: 9
                }, this),
                games.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col gap-4 mb-6",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-col lg:flex-row lg:items-center gap-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-3 items-center flex-1 min-w-0",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center rounded-xl border-2 transition-all",
                                        style: {
                                            backgroundColor: currentColors.darkBg,
                                            borderColor: gameSearchFocused ? currentColors.playGreen : currentColors.highlight + '50',
                                            boxShadow: gameSearchFocused ? `0 0 0 2px ${currentColors.playGreen}30` : 'none',
                                            width: '340px',
                                            height: '48px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-12 h-full flex items-center justify-center flex-shrink-0",
                                                style: {
                                                    color: currentColors.softLight
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                    className: "w-4 h-4"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 758,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 757,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                ref: gameSearchInputRef,
                                                type: "text",
                                                placeholder: "Search games...",
                                                value: gameSearchQuery,
                                                onChange: (e)=>setGameSearchQuery(e.target.value),
                                                onFocus: ()=>setGameSearchFocused(true),
                                                onBlur: ()=>setGameSearchFocused(false),
                                                className: "bg-transparent h-full flex-1 focus:outline-none text-sm pr-4",
                                                style: {
                                                    color: currentColors.softLight
                                                }
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 760,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 747,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2 px-4 py-2 rounded-xl border-2",
                                        style: {
                                            backgroundColor: currentColors.darkBg,
                                            borderColor: currentColors.highlight + '40',
                                            height: '48px'
                                        },
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "text-sm font-medium",
                                                style: {
                                                    color: currentColors.highlight
                                                },
                                                children: "Sort by:"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 778,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex gap-1",
                                                children: [
                                                    'title',
                                                    'system'
                                                ].map((option)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: ()=>setSortBy(option),
                                                        className: "px-3 py-1 rounded-lg text-sm font-medium transition-all active:scale-95 h-9",
                                                        style: {
                                                            backgroundColor: sortBy === option ? currentColors.highlight : currentColors.midDark,
                                                            color: sortBy === option ? currentColors.darkBg : currentColors.softLight
                                                        },
                                                        children: option === 'title' ? 'Title' : 'System'
                                                    }, option, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 781,
                                                        columnNumber: 23
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 779,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                onClick: ()=>setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'),
                                                className: "px-2 py-1 rounded-lg text-sm font-medium transition-all hover:shadow-md active:scale-95 flex items-center justify-center h-9",
                                                style: {
                                                    backgroundColor: currentColors.midDark,
                                                    color: currentColors.softLight
                                                },
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-4 h-4 flex items-center justify-center",
                                                    children: sortOrder === 'asc' ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$up$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowUp$3e$__["ArrowUp"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 803,
                                                        columnNumber: 46
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$arrow$2d$down$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__ArrowDown$3e$__["ArrowDown"], {
                                                        className: "w-4 h-4"
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 803,
                                                        columnNumber: 80
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 802,
                                                    columnNumber: 21
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 794,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 774,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 746,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-3 justify-end items-center",
                                children: isDeleteMode ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                            lineNumber: 811,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: exitDeleteMode,
                                            className: "px-5 py-2.5 rounded-lg font-semibold transition-all active:scale-95",
                                            style: {
                                                backgroundColor: currentColors.highlight,
                                                color: currentColors.darkBg
                                            },
                                            children: "Cancel"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 823,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleFileSelect,
                                    className: "px-8 rounded-lg font-semibold transition-all hover:shadow-md active:scale-95 flex items-center gap-2 justify-center",
                                    style: {
                                        ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGradientStyle"])(currentColors.gradientFrom, currentColors.gradientTo),
                                        color: currentColors.darkBg,
                                        height: '48px'
                                    },
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$plus$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Plus$3e$__["Plus"], {
                                            className: "w-5 h-5"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 837,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "Add Game"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 838,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 832,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 808,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 745,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 744,
                    columnNumber: 11
                }, this),
                sortBy === 'system' && groupedGames && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: Object.entries(groupedGames).map(([category, categoryGames])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-8 last:mb-0",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center mb-4",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                            className: "text-xs font-bold uppercase tracking-wider pr-3",
                                            style: {
                                                color: currentColors.highlight
                                            },
                                            children: category
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 850,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-1 h-px",
                                            style: {
                                                backgroundColor: currentColors.highlight + '30'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 853,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 849,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap",
                                    style: {
                                        gap: '1rem'
                                    },
                                    children: categoryGames.map((game, index)=>{
                                        const isGameDeleting = deletingGameIds.has(game.id);
                                        // Only count games that are NOT being deleted for animation purposes
                                        const visibleIndex = categoryGames.slice(0, index).filter((g)=>!deletingGameIds.has(g.id)).length;
                                        const reverseStaggerDelay = (categoryGames.length - 1 - index) * 0.03;
                                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            style: {
                                                animation: isGameDeleting ? `fadeOut 0.3s ease-in-out ${reverseStaggerDelay}s forwards` : `fadeIn 0.5s ease-in-out ${visibleIndex * 0.03}s both`
                                            },
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameCardComponent$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GameCard"], {
                                                game: game,
                                                onPlay: handlePlayClick,
                                                onEdit: handleEditGame,
                                                onDelete: handleDeleteGame,
                                                onSelect: toggleGameSelection,
                                                isSelected: selectedGameIds.has(game.id),
                                                isDeleteMode: isDeleteMode,
                                                onEnterDeleteMode: ()=>setIsDeleteMode(true),
                                                colors: currentColors
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 863,
                                                columnNumber: 25
                                            }, this)
                                        }, game.id, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 862,
                                            columnNumber: 23
                                        }, this);
                                    })
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 855,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, category, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 848,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 846,
                    columnNumber: 11
                }, this),
                (!sortBy || sortBy !== 'system') && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap",
                    style: {
                        gap: '1rem'
                    },
                    children: sortedGames.map((game, index)=>{
                        const isGameDeleting = deletingGameIds.has(game.id);
                        // Only count games that are NOT being deleted for animation purposes
                        const visibleIndex = sortedGames.slice(0, index).filter((g)=>!deletingGameIds.has(g.id)).length;
                        const reverseStaggerDelay = (sortedGames.length - 1 - index) * 0.03;
                        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            style: {
                                animation: isGameDeleting ? `fadeOut 0.3s ease-in-out ${reverseStaggerDelay}s forwards` : `fadeIn 0.5s ease-in-out ${visibleIndex * 0.03}s both`
                            },
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$components$2f$GameCardComponent$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["GameCard"], {
                                game: game,
                                onPlay: handlePlayClick,
                                onEdit: handleEditGame,
                                onDelete: handleDeleteGame,
                                onSelect: toggleGameSelection,
                                isSelected: selectedGameIds.has(game.id),
                                isDeleteMode: isDeleteMode,
                                onEnterDeleteMode: ()=>setIsDeleteMode(true),
                                onCoverArtClick: (game)=>{
                                    setEditingGame(game);
                                    setPendingGame(game);
                                    setCoverArtFit(game.coverArtFit || 'cover');
                                    setSystemPickerOpen(true);
                                },
                                colors: currentColors
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 881,
                                columnNumber: 19
                            }, this)
                        }, game.id, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 880,
                            columnNumber: 17
                        }, this);
                    })
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 873,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 739,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Fragment"], {
        children: !isHydrated ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex flex-col",
            style: {
                backgroundColor: '#0f0f0f',
                fontFamily: 'Inter, sans-serif'
            }
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 899,
            columnNumber: 9
        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "min-h-screen flex flex-col",
            style: {
                backgroundColor: currentColors.darkBg,
                fontFamily: 'Inter, sans-serif'
            },
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: `fixed inset-0 z-40 transition-all duration-300 ${isSidebarOpen ? 'bg-black/60 backdrop-blur-sm' : 'bg-black/0 backdrop-blur-none pointer-events-none'}`,
                    onClick: ()=>setIsSidebarOpen(false)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 902,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                    className: sidebarFullClass,
                    style: {
                        backgroundColor: currentColors.midDark,
                        boxShadow: '4px 0 12px rgba(0, 0, 0, 0.3)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex items-center gap-3 mb-12 animate-fade-in pb-6 border-b",
                            style: {
                                borderColor: currentColors.highlight + '30'
                            },
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                    src: "/favicon.ico",
                                    alt: "Joe T Emulator",
                                    className: "w-12 h-12 flex-shrink-0"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 909,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
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
                                    lineNumber: 910,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 908,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                            children: [
                                {
                                    view: 'library',
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$gamepad$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Gamepad2$3e$__["Gamepad2"],
                                    label: 'Library'
                                },
                                {
                                    view: 'themes',
                                    icon: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$palette$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Palette$3e$__["Palette"],
                                    label: 'Themes'
                                }
                            ].map(({ view, icon: Icon, label }, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: getSidebarButtonClass(view) + " hover:bg-opacity-50",
                                    style: {
                                        backgroundColor: activeView === view ? currentColors.sidebarHover : 'transparent',
                                        borderLeftColor: activeView === view ? currentColors.highlight : 'transparent',
                                        borderLeftWidth: activeView === view ? '4px' : '0px',
                                        color: currentColors.softLight,
                                        transition: 'all 0.2s ease',
                                        animation: `fadeInSlide 0.3s ease-out ${index * 0.1}s both`
                                    },
                                    onClick: ()=>handleNavClick(view),
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(Icon, {
                                            className: "w-6 h-6 mr-3 transition-transform"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 942,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "font-semibold",
                                            children: label
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 943,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, view, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 929,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 924,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 907,
                    columnNumber: 11
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 overflow-hidden",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                        className: "p-8 overflow-y-auto pb-20 scrollbar-hide",
                        style: {
                            minHeight: 'calc(100vh - 4rem)'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                                className: "mb-10",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-between items-center",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                            className: "text-4xl font-extrabold tracking-tight",
                                            style: {
                                                color: currentColors.softLight,
                                                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            },
                                            children: activeView.charAt(0).toUpperCase() + activeView.slice(1)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 952,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex items-center space-x-4",
                                            children: isMounted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "hidden sm:block text-sm font-medium px-3 py-1.5 rounded-lg transition-all",
                                                style: {
                                                    color: currentColors.softLight,
                                                    backgroundColor: currentColors.midDark
                                                },
                                                children: currentTime
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 957,
                                                columnNumber: 23
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 955,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 951,
                                    columnNumber: 17
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 950,
                                columnNumber: 15
                            }, this),
                            renderContent()
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 949,
                        columnNumber: 13
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 948,
                    columnNumber: 11
                }, this),
                duplicateMessage && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "fixed bottom-24 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-2xl z-60 animate-fade-in p-4 transition-opacity duration-300",
                    onClick: ()=>setDuplicateMessage(null),
                    style: {
                        backgroundColor: '#ef4444',
                        color: currentColors.softLight,
                        opacity: showDuplicateMessage ? 1 : 0,
                        transition: 'opacity 0.3s ease-out',
                        pointerEvents: showDuplicateMessage ? 'auto' : 'none'
                    },
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center gap-2",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                className: "w-5 h-5",
                                fill: "currentColor",
                                viewBox: "0 0 20 20",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                    fillRule: "evenodd",
                                    d: "M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z",
                                    clipRule: "evenodd"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 981,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 980,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "font-semibold",
                                children: duplicateMessage
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 983,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 979,
                        columnNumber: 15
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 968,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                    className: "fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-between px-6 z-50",
                    style: {
                        backgroundColor: currentColors.midDark,
                        borderColor: currentColors.sidebarHover,
                        boxShadow: '0 -4px 12px rgba(0, 0, 0, 0.3)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "p-2.5 rounded-lg transition-all hover:bg-opacity-50 active:scale-95",
                            onClick: ()=>setIsSidebarOpen(!isSidebarOpen),
                            style: {
                                color: currentColors.softLight,
                                backgroundColor: isSidebarOpen ? currentColors.sidebarHover : 'transparent'
                            },
                            children: isSidebarOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$x$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__X$3e$__["X"], {
                                className: "w-7 h-7 transition-transform rotate-0"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 993,
                                columnNumber: 32
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$menu$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Menu$3e$__["Menu"], {
                                className: "w-7 h-7 transition-transform"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 993,
                                columnNumber: 90
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 988,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex-1 mx-4"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 995,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 987,
                    columnNumber: 11
                }, this),
                (systemPickerOpen || systemPickerClosing) && (()=>{
                    // SYSTEM_PICKER is already organized by category
                    const filteredCategories = {};
                    Object.entries(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["SYSTEM_PICKER"]).forEach(([category, systems])=>{
                        const filtered = Object.entries(systems).filter(([name])=>name.toLowerCase().includes(systemSearchQuery.toLowerCase()));
                        if (filtered.length > 0) {
                            filteredCategories[category] = filtered;
                        }
                    });
                    const currentCore = editingGame?.core || pendingGame?.core;
                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4",
                        onClick: ()=>closeSystemPicker(),
                        style: {
                            animation: systemPickerClosing ? 'fadeOut 0.2s ease-out' : 'fadeIn 0.2s ease-out'
                        },
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-6 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl border",
                            style: {
                                backgroundColor: currentColors.midDark,
                                borderColor: currentColors.highlight + '30',
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.7)',
                                animation: systemPickerClosing ? 'slideDown 0.2s ease-out' : 'slideUp 0.3s ease-out'
                            },
                            onClick: (e)=>e.stopPropagation(),
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mb-6",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                            className: "text-3xl font-bold mb-2",
                                            style: {
                                                color: currentColors.softLight
                                            },
                                            children: editingGame ? editingGame.title : pendingFiles.length > 1 ? `Add ${pendingFiles.length} Games` : 'Select System'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1030,
                                            columnNumber: 21
                                        }, this),
                                        editingGame && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: "text-sm opacity-70",
                                            style: {
                                                color: currentColors.highlight
                                            },
                                            children: "Choose a system and cover art"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1034,
                                            columnNumber: 23
                                        }, this),
                                        pendingFiles.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                            lineNumber: 1039,
                                            columnNumber: 23
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1029,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col xl:flex-row gap-6 flex-1 min-h-0 overflow-hidden",
                                    children: [
                                        pendingFiles.length <= 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "flex-shrink-0 w-full xl:w-80 space-y-4 max-h-[60vh] xl:max-h-full overflow-y-auto",
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "rounded-xl border overflow-hidden",
                                                style: {
                                                    borderColor: currentColors.highlight + '30',
                                                    backgroundColor: currentColors.darkBg
                                                },
                                                children: [
                                                    editingGame?.coverArt || pendingGame?.coverArt ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "relative group",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "aspect-[4/5] w-full overflow-hidden bg-black/20 relative",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                    src: editingGame?.coverArt || pendingGame?.coverArt,
                                                                    alt: "Cover art",
                                                                    className: "w-full h-full",
                                                                    style: {
                                                                        objectFit: coverArtFit,
                                                                        objectPosition: 'center'
                                                                    }
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1054,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1053,
                                                                columnNumber: 31
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity",
                                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    onClick: removeCoverArt,
                                                                    className: "px-3 py-2.5 rounded-lg transition-all hover:shadow-md active:scale-95 flex items-center justify-center",
                                                                    style: {
                                                                        backgroundColor: '#ef4444',
                                                                        color: currentColors.softLight
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$trash$2d$2$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Trash2$3e$__["Trash2"], {
                                                                        className: "w-5 h-5"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1070,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1065,
                                                                    columnNumber: 33
                                                                }, this)
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1064,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1052,
                                                        columnNumber: 29
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "aspect-[3/4] w-full flex items-center justify-center bg-gradient-to-br",
                                                        style: {
                                                            background: `linear-gradient(135deg, ${currentColors.darkBg} 0%, ${currentColors.midDark} 100%)`
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center p-6",
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center",
                                                                    style: {
                                                                        backgroundColor: currentColors.highlight + '20'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                        className: "w-8 h-8",
                                                                        style: {
                                                                            color: currentColors.highlight
                                                                        },
                                                                        fill: "none",
                                                                        stroke: "currentColor",
                                                                        viewBox: "0 0 24 24",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            strokeLinecap: "round",
                                                                            strokeLinejoin: "round",
                                                                            strokeWidth: "2",
                                                                            d: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/page.tsx",
                                                                            lineNumber: 1079,
                                                                            columnNumber: 37
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1078,
                                                                        columnNumber: 35
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1077,
                                                                    columnNumber: 33
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm font-medium",
                                                                    style: {
                                                                        color: currentColors.softLight
                                                                    },
                                                                    children: "No Cover Art"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1082,
                                                                    columnNumber: 33
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1076,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1075,
                                                        columnNumber: 29
                                                    }, this),
                                                    (editingGame?.coverArt || pendingGame?.coverArt) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-4 border-t",
                                                        style: {
                                                            borderColor: currentColors.highlight + '30'
                                                        },
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: ()=>{
                                                                const newFit = coverArtFit === 'contain' ? 'cover' : 'contain';
                                                                setCoverArtFit(newFit);
                                                                updateCoverArtFit(newFit);
                                                            },
                                                            className: "w-full px-4 py-2.5 rounded-lg transition-all text-sm font-semibold text-center active:scale-95",
                                                            style: {
                                                                backgroundColor: currentColors.highlight,
                                                                color: currentColors.darkBg
                                                            },
                                                            children: coverArtFit === 'contain' ? 'Zoom to Fill' : 'Shrink to Fit'
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1090,
                                                            columnNumber: 31
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1089,
                                                        columnNumber: 29
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "p-4 border-t",
                                                        style: {
                                                            borderColor: currentColors.highlight + '30'
                                                        },
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                type: "file",
                                                                accept: "image/*",
                                                                onChange: (e)=>{
                                                                    const file = e.target.files?.[0];
                                                                    if (file) {
                                                                        handleCoverArtFileUpload(file);
                                                                    }
                                                                },
                                                                className: "hidden",
                                                                id: "cover-art-file-input"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1107,
                                                                columnNumber: 29
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                htmlFor: "cover-art-file-input",
                                                                className: "block w-full px-4 py-2.5 rounded-lg transition-all text-sm font-semibold text-center active:scale-95",
                                                                style: {
                                                                    ...editingGame?.coverArt || pendingGame?.coverArt ? {
                                                                        backgroundColor: currentColors.highlight
                                                                    } : (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGradientStyle"])(currentColors.gradientFrom, currentColors.gradientTo),
                                                                    color: currentColors.darkBg
                                                                },
                                                                children: editingGame?.coverArt || pendingGame?.coverArt ? 'Change Image' : 'Upload Cover Art'
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1119,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/src/app/page.tsx",
                                                        lineNumber: 1106,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 1050,
                                                columnNumber: 25
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1049,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: `${pendingFiles.length > 1 ? 'w-full' : 'flex-1'} flex flex-col min-w-0`,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "w-full flex items-center rounded-xl border-2 transition-all mb-4",
                                                    style: {
                                                        backgroundColor: currentColors.darkBg,
                                                        borderColor: searchFocused ? currentColors.playGreen : currentColors.highlight + '50',
                                                        boxShadow: searchFocused ? `0 0 0 2px ${currentColors.playGreen}30` : 'none'
                                                    },
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "w-10 h-10 flex items-center justify-center flex-shrink-0",
                                                            style: {
                                                                color: currentColors.softLight
                                                            },
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lucide$2d$react$2f$dist$2f$esm$2f$icons$2f$search$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$export__default__as__Search$3e$__["Search"], {
                                                                className: "w-4 h-4"
                                                            }, void 0, false, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1145,
                                                                columnNumber: 27
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1144,
                                                            columnNumber: 25
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            placeholder: "Search systems...",
                                                            value: systemSearchQuery,
                                                            onChange: (e)=>setSystemSearchQuery(e.target.value),
                                                            onFocus: ()=>setSearchFocused(true),
                                                            onBlur: ()=>setSearchFocused(false),
                                                            className: "bg-transparent h-10 flex-1 focus:outline-none text-sm pr-4",
                                                            style: {
                                                                color: currentColors.softLight
                                                            },
                                                            autoFocus: true
                                                        }, void 0, false, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1147,
                                                            columnNumber: 25
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 1136,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex-1 overflow-y-auto pr-2 scrollbar-hide",
                                                    children: [
                                                        Object.entries(filteredCategories).map(([category, systems])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "mb-6 last:mb-0",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "flex items-center mb-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                                className: "text-xs font-bold uppercase tracking-wider pr-3",
                                                                                style: {
                                                                                    color: currentColors.highlight
                                                                                },
                                                                                children: category
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                lineNumber: 1166,
                                                                                columnNumber: 31
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                className: "flex-1 h-px",
                                                                                style: {
                                                                                    backgroundColor: currentColors.highlight + '30'
                                                                                }
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                lineNumber: 1169,
                                                                                columnNumber: 31
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1165,
                                                                        columnNumber: 29
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "grid grid-cols-2 sm:grid-cols-3 gap-2.5",
                                                                        children: systems.map(([name, core], index)=>{
                                                                            const isSelected = currentCore === core;
                                                                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                className: "p-3.5 rounded-xl text-left transition-all active:scale-[0.97] border-2 relative flex items-center justify-between group",
                                                                                style: {
                                                                                    backgroundColor: isSelected ? currentColors.highlight : currentColors.sidebarHover,
                                                                                    borderColor: isSelected ? currentColors.highlight : currentColors.highlight + '30',
                                                                                    color: isSelected ? currentColors.darkBg : currentColors.softLight,
                                                                                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                                                                                    animation: `fadeIn 0.4s ease-out ${index * 0.03}s both`
                                                                                },
                                                                                onMouseEnter: (e)=>{
                                                                                    if (!isSelected) {
                                                                                        e.currentTarget.style.backgroundColor = currentColors.highlight + '20';
                                                                                        e.currentTarget.style.borderColor = currentColors.highlight + '50';
                                                                                    }
                                                                                },
                                                                                onMouseLeave: (e)=>{
                                                                                    if (!isSelected) {
                                                                                        e.currentTarget.style.backgroundColor = currentColors.sidebarHover;
                                                                                        e.currentTarget.style.borderColor = currentColors.highlight + '30';
                                                                                    }
                                                                                },
                                                                                onClick: ()=>selectSystem(core),
                                                                                children: [
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                        className: "font-medium text-sm leading-tight truncate pr-2 flex-1",
                                                                                        children: name
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/page.tsx",
                                                                                        lineNumber: 1199,
                                                                                        columnNumber: 37
                                                                                    }, this),
                                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                                        className: "w-5 h-5 flex-shrink-0 flex items-center justify-center",
                                                                                        children: isSelected && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                                            className: "w-5 h-5",
                                                                                            fill: "currentColor",
                                                                                            viewBox: "0 0 20 20",
                                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                                                fillRule: "evenodd",
                                                                                                d: "M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z",
                                                                                                clipRule: "evenodd"
                                                                                            }, void 0, false, {
                                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                                lineNumber: 1205,
                                                                                                columnNumber: 43
                                                                                            }, this)
                                                                                        }, void 0, false, {
                                                                                            fileName: "[project]/src/app/page.tsx",
                                                                                            lineNumber: 1204,
                                                                                            columnNumber: 41
                                                                                        }, this)
                                                                                    }, void 0, false, {
                                                                                        fileName: "[project]/src/app/page.tsx",
                                                                                        lineNumber: 1202,
                                                                                        columnNumber: 37
                                                                                    }, this)
                                                                                ]
                                                                            }, core, true, {
                                                                                fileName: "[project]/src/app/page.tsx",
                                                                                lineNumber: 1175,
                                                                                columnNumber: 35
                                                                            }, this);
                                                                        })
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1171,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, category, true, {
                                                                fileName: "[project]/src/app/page.tsx",
                                                                lineNumber: 1164,
                                                                columnNumber: 27
                                                            }, this)),
                                                        Object.keys(filteredCategories).length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "text-center py-16",
                                                            style: {
                                                                color: currentColors.highlight
                                                            },
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center",
                                                                    style: {
                                                                        backgroundColor: currentColors.highlight + '15'
                                                                    },
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                                                                        className: "w-8 h-8",
                                                                        fill: "none",
                                                                        stroke: "currentColor",
                                                                        viewBox: "0 0 24 24",
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                                                                            strokeLinecap: "round",
                                                                            strokeLinejoin: "round",
                                                                            strokeWidth: "2",
                                                                            d: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/src/app/page.tsx",
                                                                            lineNumber: 1219,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/src/app/page.tsx",
                                                                        lineNumber: 1218,
                                                                        columnNumber: 31
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1217,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-lg font-semibold mb-1",
                                                                    style: {
                                                                        color: currentColors.softLight
                                                                    },
                                                                    children: "No systems found"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1222,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "text-sm opacity-70",
                                                                    children: "Try a different search term"
                                                                }, void 0, false, {
                                                                    fileName: "[project]/src/app/page.tsx",
                                                                    lineNumber: 1223,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/src/app/page.tsx",
                                                            lineNumber: 1216,
                                                            columnNumber: 27
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 1162,
                                                    columnNumber: 23
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1135,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1046,
                                    columnNumber: 19
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex justify-end gap-3 mt-6 pt-4 border-t",
                                    style: {
                                        borderColor: currentColors.highlight + '30'
                                    },
                                    children: [
                                        (editingGame || pendingFiles.length === 1 && pendingGame) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "py-2.5 px-6 rounded-lg font-semibold transition-all active:scale-95",
                                            style: {
                                                ...(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$types$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["getGradientStyle"])(currentColors.gradientFrom, currentColors.gradientTo),
                                                color: currentColors.darkBg
                                            },
                                            onClick: handleSystemPickerDone,
                                            children: "Done"
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1232,
                                            columnNumber: 23
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: "py-2.5 px-6 rounded-lg font-semibold transition-all active:scale-95",
                                            style: {
                                                backgroundColor: currentColors.highlight,
                                                color: currentColors.darkBg
                                            },
                                            onClick: ()=>closeSystemPicker(),
                                            children: editingGame ? 'Cancel' : 'Close'
                                        }, void 0, false, {
                                            fileName: "[project]/src/app/page.tsx",
                                            lineNumber: 1240,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 1230,
                                    columnNumber: 19
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 1018,
                            columnNumber: 17
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 1013,
                        columnNumber: 15
                    }, this);
                })()
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 901,
            columnNumber: 9
        }, this)
    }, void 0, false);
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__fd4526d1._.js.map