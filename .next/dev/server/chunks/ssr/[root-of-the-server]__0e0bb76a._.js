module.exports = [
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[project]/src/lib/constants.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Shared constants for emulator systems and file extensions
__turbopack_context__.s([
    "FILE_EXTENSIONS",
    ()=>FILE_EXTENSIONS,
    "SYSTEM_PICKER",
    ()=>SYSTEM_PICKER
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
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/constants.ts [app-ssr] (ecmascript)");
;
const CDN_PATH = "https://cdn.jsdelivr.net/gh/joethun/EmulatorJS-With-Cores/";
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
async function detectCore(extension) {
    if (__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension]) {
        return __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$constants$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["FILE_EXTENSIONS"][extension];
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
    const selectors = [
        'aside',
        'footer',
        'main',
        'header'
    ];
    const style = show ? '' : 'none !important';
    const visibility = show ? 'visible' : 'hidden';
    const zIndex = show ? '' : '-1 !important';
    selectors.forEach((selector)=>{
        const element = document.querySelector(selector);
        if (element) {
            element.style.cssText = show ? '' : `display: ${style}; visibility: ${visibility} !important; z-index: ${zIndex}`;
        }
    });
    const rootDiv = document.querySelector('div[style*="min-h-screen"]');
    if (rootDiv && !show) {
        rootDiv.style.cssText += " z-index: -1 !important;";
    }
}
function showMenu() {
    toggleMenuElements(true);
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
    toggleMenuElements(false);
    const menu = document.getElementById("menu");
    if (menu) {
        menu.style.cssText = "display: none !important; visibility: hidden !important;";
    }
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
// Expose functions to window for global access (for EmulatorJS compatibility)
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
"[project]/src/lib/storage.ts [app-ssr] (ecmascript)", ((__turbopack_context__) => {
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
}),
"[project]/src/app/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

const e = new Error("Could not parse module '[project]/src/app/page.tsx'\n\nUnterminated regexp literal");
e.code = 'MODULE_UNPARSABLE';
throw e;
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
"[project]/node_modules/next/dist/compiled/client-only/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {
"use strict";

module.exports = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/module.compiled.js [app-ssr] (ecmascript)").vendored['react-ssr'].React; //# sourceMappingURL=react.js.map
}),
"[project]/node_modules/styled-jsx/dist/index/index.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

__turbopack_context__.r("[project]/node_modules/next/dist/compiled/client-only/index.js [app-ssr] (ecmascript)");
var React = __turbopack_context__.r("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
function _interopDefaultLegacy(e) {
    return e && typeof e === 'object' && 'default' in e ? e : {
        'default': e
    };
}
var React__default = /*#__PURE__*/ _interopDefaultLegacy(React);
/*
Based on Glamor's sheet
https://github.com/threepointone/glamor/blob/667b480d31b3721a905021b26e1290ce92ca2879/src/sheet.js
*/ function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
var isProd = typeof process !== "undefined" && process.env && ("TURBOPACK compile-time value", "development") === "production";
var isString = function(o) {
    return Object.prototype.toString.call(o) === "[object String]";
};
var StyleSheet = /*#__PURE__*/ function() {
    function StyleSheet(param) {
        var ref = param === void 0 ? {} : param, _name = ref.name, name = _name === void 0 ? "stylesheet" : _name, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? isProd : _optimizeForSpeed;
        invariant$1(isString(name), "`name` must be a string");
        this._name = name;
        this._deletedRulePlaceholder = "#" + name + "-deleted-rule____{}";
        invariant$1(typeof optimizeForSpeed === "boolean", "`optimizeForSpeed` must be a boolean");
        this._optimizeForSpeed = optimizeForSpeed;
        this._serverSheet = undefined;
        this._tags = [];
        this._injected = false;
        this._rulesCount = 0;
        var node = ("TURBOPACK compile-time value", "undefined") !== "undefined" && document.querySelector('meta[property="csp-nonce"]');
        this._nonce = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : null;
    }
    var _proto = StyleSheet.prototype;
    _proto.setOptimizeForSpeed = function setOptimizeForSpeed(bool) {
        invariant$1(typeof bool === "boolean", "`setOptimizeForSpeed` accepts a boolean");
        invariant$1(this._rulesCount === 0, "optimizeForSpeed cannot be when rules have already been inserted");
        this.flush();
        this._optimizeForSpeed = bool;
        this.inject();
    };
    _proto.isOptimizeForSpeed = function isOptimizeForSpeed() {
        return this._optimizeForSpeed;
    };
    _proto.inject = function inject() {
        var _this = this;
        invariant$1(!this._injected, "sheet already injected");
        this._injected = true;
        if (("TURBOPACK compile-time value", "undefined") !== "undefined" && this._optimizeForSpeed) //TURBOPACK unreachable
        ;
        this._serverSheet = {
            cssRules: [],
            insertRule: function(rule, index) {
                if (typeof index === "number") {
                    _this._serverSheet.cssRules[index] = {
                        cssText: rule
                    };
                } else {
                    _this._serverSheet.cssRules.push({
                        cssText: rule
                    });
                }
                return index;
            },
            deleteRule: function(index) {
                _this._serverSheet.cssRules[index] = null;
            }
        };
    };
    _proto.getSheetForTag = function getSheetForTag(tag) {
        if (tag.sheet) {
            return tag.sheet;
        }
        // this weirdness brought to you by firefox
        for(var i = 0; i < document.styleSheets.length; i++){
            if (document.styleSheets[i].ownerNode === tag) {
                return document.styleSheets[i];
            }
        }
    };
    _proto.getSheet = function getSheet() {
        return this.getSheetForTag(this._tags[this._tags.length - 1]);
    };
    _proto.insertRule = function insertRule(rule, index) {
        invariant$1(isString(rule), "`insertRule` accepts only strings");
        if ("TURBOPACK compile-time truthy", 1) {
            if (typeof index !== "number") {
                index = this._serverSheet.cssRules.length;
            }
            this._serverSheet.insertRule(rule, index);
            return this._rulesCount++;
        }
        //TURBOPACK unreachable
        ;
        var sheet;
        var insertionPoint;
    };
    _proto.replaceRule = function replaceRule(index, rule) {
        if (this._optimizeForSpeed || ("TURBOPACK compile-time value", "undefined") === "undefined") {
            var sheet = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : this._serverSheet;
            if (!rule.trim()) {
                rule = this._deletedRulePlaceholder;
            }
            if (!sheet.cssRules[index]) {
                // @TBD Should we throw an error?
                return index;
            }
            sheet.deleteRule(index);
            try {
                sheet.insertRule(rule, index);
            } catch (error) {
                if ("TURBOPACK compile-time truthy", 1) {
                    console.warn("StyleSheet: illegal rule: \n\n" + rule + "\n\nSee https://stackoverflow.com/q/20007992 for more info");
                }
                // In order to preserve the indices we insert a deleteRulePlaceholder
                sheet.insertRule(this._deletedRulePlaceholder, index);
            }
        } else //TURBOPACK unreachable
        {
            var tag;
        }
        return index;
    };
    _proto.deleteRule = function deleteRule(index) {
        if ("TURBOPACK compile-time truthy", 1) {
            this._serverSheet.deleteRule(index);
            return;
        }
        //TURBOPACK unreachable
        ;
        var tag;
    };
    _proto.flush = function flush() {
        this._injected = false;
        this._rulesCount = 0;
        if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
        ;
        else {
            // simpler on server
            this._serverSheet.cssRules = [];
        }
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        if ("TURBOPACK compile-time truthy", 1) {
            return this._serverSheet.cssRules;
        }
        //TURBOPACK unreachable
        ;
    };
    _proto.makeStyleTag = function makeStyleTag(name, cssString, relativeToTag) {
        if (cssString) {
            invariant$1(isString(cssString), "makeStyleTag accepts only strings as second parameter");
        }
        var tag = document.createElement("style");
        if (this._nonce) tag.setAttribute("nonce", this._nonce);
        tag.type = "text/css";
        tag.setAttribute("data-" + name, "");
        if (cssString) {
            tag.appendChild(document.createTextNode(cssString));
        }
        var head = document.head || document.getElementsByTagName("head")[0];
        if (relativeToTag) {
            head.insertBefore(tag, relativeToTag);
        } else {
            head.appendChild(tag);
        }
        return tag;
    };
    _createClass(StyleSheet, [
        {
            key: "length",
            get: function get() {
                return this._rulesCount;
            }
        }
    ]);
    return StyleSheet;
}();
function invariant$1(condition, message) {
    if (!condition) {
        throw new Error("StyleSheet: " + message + ".");
    }
}
function hash(str) {
    var _$hash = 5381, i = str.length;
    while(i){
        _$hash = _$hash * 33 ^ str.charCodeAt(--i);
    }
    /* JavaScript does bitwise operations (like XOR, above) on 32-bit signed
   * integers. Since we want the results to be always positive, convert the
   * signed int to an unsigned by doing an unsigned bitshift. */ return _$hash >>> 0;
}
var stringHash = hash;
var sanitize = function(rule) {
    return rule.replace(/\/style/gi, "\\/style");
};
var cache = {};
/**
 * computeId
 *
 * Compute and memoize a jsx id from a basedId and optionally props.
 */ function computeId(baseId, props) {
    if (!props) {
        return "jsx-" + baseId;
    }
    var propsToString = String(props);
    var key = baseId + propsToString;
    if (!cache[key]) {
        cache[key] = "jsx-" + stringHash(baseId + "-" + propsToString);
    }
    return cache[key];
}
/**
 * computeSelector
 *
 * Compute and memoize dynamic selectors.
 */ function computeSelector(id, css) {
    var selectoPlaceholderRegexp = /__jsx-style-dynamic-selector/g;
    // Sanitize SSR-ed CSS.
    // Client side code doesn't need to be sanitized since we use
    // document.createTextNode (dev) and the CSSOM api sheet.insertRule (prod).
    if ("TURBOPACK compile-time truthy", 1) {
        css = sanitize(css);
    }
    var idcss = id + css;
    if (!cache[idcss]) {
        cache[idcss] = css.replace(selectoPlaceholderRegexp, id);
    }
    return cache[idcss];
}
function mapRulesToStyle(cssRules, options) {
    if (options === void 0) options = {};
    return cssRules.map(function(args) {
        var id = args[0];
        var css = args[1];
        return /*#__PURE__*/ React__default["default"].createElement("style", {
            id: "__" + id,
            // Avoid warnings upon render with a key
            key: "__" + id,
            nonce: options.nonce ? options.nonce : undefined,
            dangerouslySetInnerHTML: {
                __html: css
            }
        });
    });
}
var StyleSheetRegistry = /*#__PURE__*/ function() {
    function StyleSheetRegistry(param) {
        var ref = param === void 0 ? {} : param, _styleSheet = ref.styleSheet, styleSheet = _styleSheet === void 0 ? null : _styleSheet, _optimizeForSpeed = ref.optimizeForSpeed, optimizeForSpeed = _optimizeForSpeed === void 0 ? false : _optimizeForSpeed;
        this._sheet = styleSheet || new StyleSheet({
            name: "styled-jsx",
            optimizeForSpeed: optimizeForSpeed
        });
        this._sheet.inject();
        if (styleSheet && typeof optimizeForSpeed === "boolean") {
            this._sheet.setOptimizeForSpeed(optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    }
    var _proto = StyleSheetRegistry.prototype;
    _proto.add = function add(props) {
        var _this = this;
        if (undefined === this._optimizeForSpeed) {
            this._optimizeForSpeed = Array.isArray(props.children);
            this._sheet.setOptimizeForSpeed(this._optimizeForSpeed);
            this._optimizeForSpeed = this._sheet.isOptimizeForSpeed();
        }
        if (("TURBOPACK compile-time value", "undefined") !== "undefined" && !this._fromServer) //TURBOPACK unreachable
        ;
        var ref = this.getIdAndRules(props), styleId = ref.styleId, rules = ref.rules;
        // Deduping: just increase the instances count.
        if (styleId in this._instancesCounts) {
            this._instancesCounts[styleId] += 1;
            return;
        }
        var indices = rules.map(function(rule) {
            return _this._sheet.insertRule(rule);
        }) // Filter out invalid rules
        .filter(function(index) {
            return index !== -1;
        });
        this._indices[styleId] = indices;
        this._instancesCounts[styleId] = 1;
    };
    _proto.remove = function remove(props) {
        var _this = this;
        var styleId = this.getIdAndRules(props).styleId;
        invariant(styleId in this._instancesCounts, "styleId: `" + styleId + "` not found");
        this._instancesCounts[styleId] -= 1;
        if (this._instancesCounts[styleId] < 1) {
            var tagFromServer = this._fromServer && this._fromServer[styleId];
            if (tagFromServer) {
                tagFromServer.parentNode.removeChild(tagFromServer);
                delete this._fromServer[styleId];
            } else {
                this._indices[styleId].forEach(function(index) {
                    return _this._sheet.deleteRule(index);
                });
                delete this._indices[styleId];
            }
            delete this._instancesCounts[styleId];
        }
    };
    _proto.update = function update(props, nextProps) {
        this.add(nextProps);
        this.remove(props);
    };
    _proto.flush = function flush() {
        this._sheet.flush();
        this._sheet.inject();
        this._fromServer = undefined;
        this._indices = {};
        this._instancesCounts = {};
    };
    _proto.cssRules = function cssRules() {
        var _this = this;
        var fromServer = this._fromServer ? Object.keys(this._fromServer).map(function(styleId) {
            return [
                styleId,
                _this._fromServer[styleId]
            ];
        }) : [];
        var cssRules = this._sheet.cssRules();
        return fromServer.concat(Object.keys(this._indices).map(function(styleId) {
            return [
                styleId,
                _this._indices[styleId].map(function(index) {
                    return cssRules[index].cssText;
                }).join(_this._optimizeForSpeed ? "" : "\n")
            ];
        }) // filter out empty rules
        .filter(function(rule) {
            return Boolean(rule[1]);
        }));
    };
    _proto.styles = function styles(options) {
        return mapRulesToStyle(this.cssRules(), options);
    };
    _proto.getIdAndRules = function getIdAndRules(props) {
        var css = props.children, dynamic = props.dynamic, id = props.id;
        if (dynamic) {
            var styleId = computeId(id, dynamic);
            return {
                styleId: styleId,
                rules: Array.isArray(css) ? css.map(function(rule) {
                    return computeSelector(styleId, rule);
                }) : [
                    computeSelector(styleId, css)
                ]
            };
        }
        return {
            styleId: computeId(id),
            rules: Array.isArray(css) ? css : [
                css
            ]
        };
    };
    /**
   * selectFromServer
   *
   * Collects style tags from the document with id __jsx-XXX
   */ _proto.selectFromServer = function selectFromServer() {
        var elements = Array.prototype.slice.call(document.querySelectorAll('[id^="__jsx-"]'));
        return elements.reduce(function(acc, element) {
            var id = element.id.slice(2);
            acc[id] = element;
            return acc;
        }, {});
    };
    return StyleSheetRegistry;
}();
function invariant(condition, message) {
    if (!condition) {
        throw new Error("StyleSheetRegistry: " + message + ".");
    }
}
var StyleSheetContext = /*#__PURE__*/ React.createContext(null);
StyleSheetContext.displayName = "StyleSheetContext";
function createStyleRegistry() {
    return new StyleSheetRegistry();
}
function StyleRegistry(param) {
    var configuredRegistry = param.registry, children = param.children;
    var rootRegistry = React.useContext(StyleSheetContext);
    var ref = React.useState(function() {
        return rootRegistry || configuredRegistry || createStyleRegistry();
    }), registry = ref[0];
    return /*#__PURE__*/ React__default["default"].createElement(StyleSheetContext.Provider, {
        value: registry
    }, children);
}
function useStyleRegistry() {
    return React.useContext(StyleSheetContext);
}
// Opt-into the new `useInsertionEffect` API in React 18, fallback to `useLayoutEffect`.
// https://github.com/reactwg/react-18/discussions/110
var useInsertionEffect = React__default["default"].useInsertionEffect || React__default["default"].useLayoutEffect;
var defaultRegistry = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : undefined;
function JSXStyle(props) {
    var registry = ("TURBOPACK compile-time falsy", 0) ? "TURBOPACK unreachable" : useStyleRegistry();
    // If `registry` does not exist, we do nothing here.
    if (!registry) {
        return null;
    }
    if ("TURBOPACK compile-time truthy", 1) {
        registry.add(props);
        return null;
    }
    //TURBOPACK unreachable
    ;
}
JSXStyle.dynamic = function(info) {
    return info.map(function(tagInfo) {
        var baseId = tagInfo[0];
        var props = tagInfo[1];
        return computeId(baseId, props);
    }).join(" ");
};
exports.StyleRegistry = StyleRegistry;
exports.createStyleRegistry = createStyleRegistry;
exports.style = JSXStyle;
exports.useStyleRegistry = useStyleRegistry;
}),
"[project]/node_modules/styled-jsx/style.js [app-ssr] (ecmascript)", ((__turbopack_context__, module, exports) => {

module.exports = __turbopack_context__.r("[project]/node_modules/styled-jsx/dist/index/index.js [app-ssr] (ecmascript)").style;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0e0bb76a._.js.map