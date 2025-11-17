module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/emulator.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
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
    return new Promise((resolve)=>{
        if (window.showSystemPicker) {
            window.showSystemPicker(SYSTEM_PICKER, resolve);
        } else {
            // Default fallback
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
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    configureEmulator(gameName, gameFile, core);
    loadEmulatorScript();
}
function configureEmulator(gameName, gameFile, core) {
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
    const saveButton = document.getElementById("saveBrowser");
    const loadButton = document.getElementById("loadBrowser");
    if (saveButton) {
        saveButton.onclick = saveState;
    }
    if (loadButton) {
        loadButton.onclick = loadState;
    }
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
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Home
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emulator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/emulator.ts [app-ssr] (ecmascript)");
"use client";
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
const BookOpenIcon = ({ className })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5s3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18s-3.332.477-4.5 1.253"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 51,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 50,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const ShoppingBagIcon = ({ className })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 57,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 56,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const DownloadIcon = ({ className })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 63,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 62,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const MenuIcon = ({ className })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M4 6h16M4 12h16M4 18h16"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 69,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 68,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const XIcon = ({ className })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
            strokeLinecap: "round",
            strokeLinejoin: "round",
            strokeWidth: "2",
            d: "M6 18L18 6M6 6l12 12"
        }, void 0, false, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 75,
            columnNumber: 5
        }, ("TURBOPACK compile-time value", void 0))
    }, void 0, false, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 74,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const CogIcon = ({ className })=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
        className: className,
        fill: "none",
        stroke: "currentColor",
        viewBox: "0 0 24 24",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 81,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0)),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("path", {
                strokeLinecap: "round",
                strokeLinejoin: "round",
                strokeWidth: "2",
                d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 82,
                columnNumber: 5
            }, ("TURBOPACK compile-time value", void 0))
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 80,
        columnNumber: 3
    }, ("TURBOPACK compile-time value", void 0));
const COLORS = {
    highlight: '#cccccc',
    darkBg: '#0f0f0f',
    midDark: '#1e1e1e',
    softLight: '#f5f5f5',
    sidebarHover: '#333333',
    playGreen: '#00ff7f'
};
function GameCard({ game, onPlay, onEdit }) {
    const coverClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>`${game.color} h-full flex items-center justify-center text-6xl transition-all duration-300 group-hover:scale-[1.05]`, [
        game.color
    ]);
    const cardClass = "group relative overflow-hidden w-64 h-80 rounded-none transition-all duration-300 ease-in-out cursor-pointer hover:scale-[1.03] hover:ring-4 hover:ring-gray-200 hover:ring-offset-0 focus:ring-4 focus:ring-gray-200 border border-transparent";
    const overlayClass = "absolute inset-0 bg-black/30 backdrop-brightness-75 flex flex-col justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300";
    const buttonClass = "mt-3 w-full font-bold py-2 px-4 rounded-none transition-colors text-sm transform hover:scale-[1.02]";
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: cardClass,
        style: {
            backgroundColor: COLORS.midDark
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: coverClass,
                children: game.emoji
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 116,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: overlayClass,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                        className: "text-xl font-bold truncate mb-1",
                        style: {
                            color: COLORS.softLight
                        },
                        children: game.title
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 118,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-sm",
                        style: {
                            color: COLORS.highlight
                        },
                        children: [
                            game.genre,
                            " | ",
                            game.hours,
                            " hrs played"
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 119,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex gap-2 mt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: buttonClass + " flex-1",
                                style: {
                                    backgroundColor: COLORS.playGreen,
                                    color: COLORS.darkBg
                                },
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onPlay(game);
                                },
                                children: "PLAY"
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 123,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: "px-3 py-2 rounded-none transition-colors",
                                style: {
                                    backgroundColor: COLORS.highlight,
                                    color: COLORS.darkBg
                                },
                                onClick: (e)=>{
                                    e.stopPropagation();
                                    onEdit(game);
                                },
                                title: "Edit System",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(CogIcon, {
                                    className: "w-5 h-5"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 136,
                                    columnNumber: 13
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 130,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 122,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 117,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 115,
        columnNumber: 5
    }, this);
}
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
const COLORS_ARRAY = [
    'bg-blue-600',
    'bg-green-600',
    'bg-indigo-600',
    'bg-yellow-600',
    'bg-red-600',
    'bg-purple-600',
    'bg-pink-600',
    'bg-cyan-600'
];
const EMOJIS = [
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
    const [activeView, setActiveView] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('library');
    const [modalGame, setModalGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [isSidebarOpen, setIsSidebarOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentTime, setCurrentTime] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [isMounted, setIsMounted] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [games, setGames] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [editingGame, setEditingGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    const [systemPickerOpen, setSystemPickerOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [pendingGame, setPendingGame] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if ("TURBOPACK compile-time truthy", 1) return;
        //TURBOPACK unreachable
        ;
        const updateTime = undefined;
        const interval = undefined;
        // Load games from localStorage on mount
        const savedGames = undefined;
    }, []);
    const fileToBase64 = (file)=>{
        return new Promise((resolve, reject)=>{
            const reader = new FileReader();
            reader.onload = ()=>resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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
            const updatedGames = games.map((g)=>g.id === editingGame.id ? {
                    ...g,
                    core: core
                } : g);
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
            const updatedGames = [
                ...games,
                newGame
            ];
            setGames(updatedGames);
            localStorage.setItem('games', JSON.stringify(updatedGames));
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
                    const file = await fileHandle.getFile();
                    const fileName = file.name;
                    const nameWithoutExt = fileName.replace(/\.[^/.]+$/, '');
                    const fileData = await fileToBase64(file);
                    const fileExtension = fileName.split(".").pop()?.toLowerCase() || "";
                    const detectedCore = getSystemFromExtension(fileExtension);
                    const gameData = {
                        id: Date.now() + i,
                        title: nameWithoutExt,
                        genre: 'ROM',
                        hours: 0,
                        color: COLORS_ARRAY[i % COLORS_ARRAY.length],
                        emoji: EMOJIS[i % EMOJIS.length],
                        filePath: fileHandle.name,
                        fileName: fileName,
                        fileData: fileData,
                        core: detectedCore || undefined
                    };
                    if (detectedCore) {
                        // Auto-detected, add directly
                        const newGame = gameData;
                        const updatedGames = [
                            ...games,
                            newGame
                        ];
                        setGames(updatedGames);
                        localStorage.setItem('games', JSON.stringify(updatedGames));
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
                input.onchange = async (e)=>{
                    const files = Array.from(e.target.files || []);
                    for(let i = 0; i < files.length; i++){
                        const file = files[i];
                        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
                        const fileData = await fileToBase64(file);
                        const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
                        const detectedCore = getSystemFromExtension(fileExtension);
                        const gameData = {
                            id: Date.now() + i,
                            title: nameWithoutExt,
                            genre: 'ROM',
                            hours: 0,
                            color: COLORS_ARRAY[i % COLORS_ARRAY.length],
                            emoji: EMOJIS[i % EMOJIS.length],
                            filePath: file.name,
                            fileName: file.name,
                            fileData: fileData,
                            core: detectedCore || undefined
                        };
                        if (detectedCore) {
                            const newGame = gameData;
                            const updatedGames = [
                                ...games,
                                newGame
                            ];
                            setGames(updatedGames);
                            localStorage.setItem('games', JSON.stringify(updatedGames));
                        } else {
                            setPendingGame(gameData);
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
    const handleEditGame = (game)=>{
        setEditingGame(game);
        setPendingGame({
            ...game
        });
        setSystemPickerOpen(true);
    };
    const handlePlayClick = async (game)=>{
        try {
            if (game.fileData) {
                // Convert base64 data URL back to File
                const response = await fetch(game.fileData);
                const blob = await response.blob();
                const file = new File([
                    blob
                ], game.fileName || game.title, {
                    type: 'application/octet-stream'
                });
                await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$emulator$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["loadGame"])(file, game.core);
                setModalGame(null); // Close modal and start game
            } else {
                setModalGame(game.title);
            }
        } catch (error) {
            console.error('Error loading game:', error);
            setModalGame(game.title);
        }
    };
    const closeModal = ()=>{
        setModalGame(null);
    };
    const handleNavClick = (viewName)=>{
        setActiveView(viewName);
        setIsSidebarOpen(false);
    };
    const sidebarBaseClass = "sidebar-item block p-3 mb-2 rounded-none transition-all flex items-center border-l-4";
    const sidebarActiveClass = "active border-l-4";
    const sidebarInactiveClass = "border-transparent";
    const libraryButtonClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return activeView === 'library' ? `${sidebarBaseClass} ${sidebarActiveClass}` : `${sidebarBaseClass} ${sidebarInactiveClass}`;
    }, [
        activeView
    ]);
    const storeButtonClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return activeView === 'store' ? `${sidebarBaseClass} ${sidebarActiveClass}` : `${sidebarBaseClass} ${sidebarInactiveClass}`;
    }, [
        activeView
    ]);
    const downloadsButtonClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return activeView === 'downloads' ? `${sidebarBaseClass} ${sidebarActiveClass}` : `${sidebarBaseClass} ${sidebarInactiveClass}`;
    }, [
        activeView
    ]);
    const sidebarClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return isSidebarOpen ? "translate-x-0" : "-translate-x-full";
    }, [
        isSidebarOpen
    ]);
    const sidebarFullClass = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemo"])(()=>{
        return `w-64 p-6 flex flex-col justify-start shadow-xl fixed left-0 top-0 bottom-0 z-50 transition-transform duration-300 ease-in-out ${sidebarClass}`;
    }, [
        sidebarClass
    ]);
    const renderContent = ()=>{
        if (activeView === 'store') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg mt-10 p-6 rounded-none",
                    style: {
                        backgroundColor: COLORS.midDark,
                        color: COLORS.highlight
                    },
                    children: "Welcome to the Store! Discover new games and DLC here."
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 405,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 404,
                columnNumber: 9
            }, this);
        }
        if (activeView === 'downloads') {
            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "text-lg mt-10 p-6 rounded-none",
                    style: {
                        backgroundColor: COLORS.midDark,
                        color: COLORS.highlight
                    },
                    children: "No active downloads. You are ready to play!"
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 414,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 413,
                columnNumber: 9
            }, this);
        }
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex justify-between items-center mb-6",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
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
                            lineNumber: 423,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleFileSelect,
                            className: "px-4 py-2 rounded-none font-semibold transition-colors",
                            style: {
                                backgroundColor: COLORS.playGreen,
                                color: COLORS.darkBg
                            },
                            children: "Add Games"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 426,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 422,
                    columnNumber: 9
                }, this),
                games.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "text-center py-12",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-lg mb-4",
                            style: {
                                color: COLORS.highlight
                            },
                            children: "No games found"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 436,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            onClick: handleFileSelect,
                            className: "px-6 py-3 rounded-none font-semibold transition-colors",
                            style: {
                                backgroundColor: COLORS.playGreen,
                                color: COLORS.darkBg
                            },
                            children: "Add Your First Game"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 437,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 435,
                    columnNumber: 11
                }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-wrap",
                    style: {
                        gap: '0.75rem'
                    },
                    children: games.map((game)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(GameCard, {
                            game: game,
                            onPlay: handlePlayClick,
                            onEdit: handleEditGame
                        }, game.id, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 448,
                            columnNumber: 15
                        }, this))
                }, void 0, false, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 446,
                    columnNumber: 11
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/app/page.tsx",
            lineNumber: 421,
            columnNumber: 7
        }, this);
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen flex flex-col",
        style: {
            backgroundColor: COLORS.darkBg,
            fontFamily: 'Inter, sans-serif'
        },
        children: [
            isSidebarOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 z-40",
                onClick: ()=>setIsSidebarOpen(false)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 459,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("aside", {
                className: sidebarFullClass,
                style: {
                    backgroundColor: COLORS.midDark
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-3xl font-bold mb-10",
                        style: {
                            color: COLORS.highlight
                        },
                        children: "joe t emulator"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 462,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: libraryButtonClass,
                                style: {
                                    backgroundColor: activeView === 'library' ? COLORS.sidebarHover : 'transparent',
                                    borderLeftColor: activeView === 'library' ? COLORS.highlight : 'transparent',
                                    color: COLORS.softLight
                                },
                                onClick: ()=>handleNavClick('library'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(BookOpenIcon, {
                                        className: "w-6 h-6 mr-3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 475,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold",
                                        children: "Library"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 476,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 466,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: storeButtonClass,
                                style: {
                                    backgroundColor: activeView === 'store' ? COLORS.sidebarHover : 'transparent',
                                    borderLeftColor: activeView === 'store' ? COLORS.highlight : 'transparent',
                                    color: COLORS.softLight
                                },
                                onClick: ()=>handleNavClick('store'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(ShoppingBagIcon, {
                                        className: "w-6 h-6 mr-3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 487,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold",
                                        children: "Store"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 488,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 478,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: downloadsButtonClass,
                                style: {
                                    backgroundColor: activeView === 'downloads' ? COLORS.sidebarHover : 'transparent',
                                    borderLeftColor: activeView === 'downloads' ? COLORS.highlight : 'transparent',
                                    color: COLORS.softLight
                                },
                                onClick: ()=>handleNavClick('downloads'),
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(DownloadIcon, {
                                        className: "w-6 h-6 mr-3"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 499,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "font-semibold",
                                        children: "Downloads"
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 500,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 490,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 465,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 461,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-hidden",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
                    className: "p-8 overflow-y-auto pb-20",
                    style: {
                        minHeight: 'calc(100vh - 4rem)'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                            className: "mb-8",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-between items-center",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                        className: "text-4xl font-extrabold",
                                        style: {
                                            color: COLORS.softLight
                                        },
                                        children: activeView.charAt(0).toUpperCase() + activeView.slice(1)
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 508,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center space-x-3",
                                        children: [
                                            isMounted && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "hidden sm:block text-xs font-normal",
                                                style: {
                                                    color: COLORS.highlight
                                                },
                                                children: currentTime
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 513,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "hidden sm:block",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "font-semibold text-sm",
                                                    style: {
                                                        color: COLORS.softLight
                                                    },
                                                    children: "Player One"
                                                }, void 0, false, {
                                                    fileName: "[project]/src/app/page.tsx",
                                                    lineNumber: 518,
                                                    columnNumber: 19
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 517,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "w-10 h-10 rounded-none flex items-center justify-center font-bold text-lg",
                                                style: {
                                                    backgroundColor: COLORS.highlight,
                                                    color: COLORS.darkBg
                                                },
                                                children: "P"
                                            }, void 0, false, {
                                                fileName: "[project]/src/app/page.tsx",
                                                lineNumber: 520,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 511,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/src/app/page.tsx",
                                lineNumber: 507,
                                columnNumber: 13
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 506,
                            columnNumber: 11
                        }, this),
                        renderContent()
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 505,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 504,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("footer", {
                className: "fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-between px-6 z-50",
                style: {
                    backgroundColor: COLORS.midDark,
                    borderColor: COLORS.sidebarHover
                },
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: "p-2 rounded-none transition-colors hover:bg-gray-700",
                        onClick: ()=>setIsSidebarOpen(!isSidebarOpen),
                        style: {
                            color: COLORS.highlight,
                            backgroundColor: isSidebarOpen ? COLORS.sidebarHover : 'transparent'
                        },
                        children: isSidebarOpen ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(XIcon, {
                            className: "w-8 h-8"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 533,
                            columnNumber: 28
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(MenuIcon, {
                            className: "w-8 h-8"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 533,
                            columnNumber: 60
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 528,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex-1 mx-4"
                    }, void 0, false, {
                        fileName: "[project]/src/app/page.tsx",
                        lineNumber: 535,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 527,
                columnNumber: 7
            }, this),
            modalGame && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 backdrop-brightness-50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8 rounded-none max-w-sm w-full shadow-2xl border-2",
                    style: {
                        backgroundColor: COLORS.midDark,
                        borderColor: COLORS.highlight
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-2xl font-bold mb-4",
                            style: {
                                color: COLORS.softLight
                            },
                            children: "Launch Game"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 540,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "mb-6",
                            style: {
                                color: COLORS.highlight
                            },
                            children: [
                                "You are trying to launch ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: modalGame
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 541,
                                    columnNumber: 94
                                }, this),
                                "."
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 541,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm italic mb-8",
                            style: {
                                color: COLORS.highlight
                            },
                            children: "(In a real app, this would start the game process!)"
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 542,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end space-x-3",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "py-2 px-4 rounded-none font-semibold transition-colors bg-gray-700 hover:bg-gray-600",
                                    style: {
                                        color: COLORS.softLight
                                    },
                                    onClick: closeModal,
                                    children: "Cancel"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 546,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "py-2 px-4 rounded-none font-semibold transition-colors",
                                    style: {
                                        backgroundColor: COLORS.playGreen,
                                        color: COLORS.darkBg
                                    },
                                    onClick: closeModal,
                                    children: "Launch Now"
                                }, void 0, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 553,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 545,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 539,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 538,
                columnNumber: 9
            }, this),
            systemPickerOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/50 backdrop-brightness-50 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "p-8 rounded-none max-w-2xl w-full max-h-[80vh] overflow-y-auto shadow-2xl border-2",
                    style: {
                        backgroundColor: COLORS.midDark,
                        borderColor: COLORS.highlight
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-2xl font-bold mb-4",
                            style: {
                                color: COLORS.softLight
                            },
                            children: editingGame ? 'Select System for ' + editingGame.title : 'Select System'
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 567,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6",
                            children: Object.entries(SYSTEM_PICKER).map(([name, core])=>{
                                const currentCore = editingGame?.core || pendingGame?.core;
                                const isSelected = currentCore === core;
                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    className: "p-4 rounded-none text-left transition-colors border-2",
                                    style: {
                                        backgroundColor: isSelected ? COLORS.playGreen : COLORS.sidebarHover,
                                        borderColor: isSelected ? COLORS.playGreen : COLORS.highlight,
                                        color: isSelected ? COLORS.darkBg : COLORS.softLight
                                    },
                                    onClick: ()=>selectSystem(core),
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "font-semibold text-sm",
                                        children: name
                                    }, void 0, false, {
                                        fileName: "[project]/src/app/page.tsx",
                                        lineNumber: 585,
                                        columnNumber: 21
                                    }, this)
                                }, core, false, {
                                    fileName: "[project]/src/app/page.tsx",
                                    lineNumber: 575,
                                    columnNumber: 19
                                }, this);
                            })
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 570,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-end",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                lineNumber: 591,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/src/app/page.tsx",
                            lineNumber: 590,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/app/page.tsx",
                    lineNumber: 566,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/app/page.tsx",
                lineNumber: 565,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/app/page.tsx",
        lineNumber: 457,
        columnNumber: 5
    }, this);
}
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
else {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            if ("TURBOPACK compile-time truthy", 1) {
                module.exports = __turbopack_context__.r("[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)");
            } else //TURBOPACK unreachable
            ;
        } else //TURBOPACK unreachable
        ;
    }
} //# sourceMappingURL=module.compiled.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].ReactJsxDevRuntime; //# sourceMappingURL=react-jsx-dev-runtime.js.map
}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__123cbe90._.js.map