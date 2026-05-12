import { writeFile } from '@/lib/ra/fs';
import type { LibretroModule } from '@/lib/ra/types';
import { loadStringRecord, saveJSON } from '@/lib/ra/storage';

const STORAGE_KEY = 'ra_shader_pref_v1';
const SCRIPT_MARK = 'data-ra-shaders';
const SHADERS_URL = '/emulatorjs/src/shaders.js';
const SHADER_PATH = '/shader/shader.glslp';

export const SHADER_DISABLED = 'disabled';

interface ShaderResource { name: string; type: 'text' | 'base64'; value: string }
interface ShaderEntry {
    shader: { type: 'text' | 'base64'; value: string };
    resources?: ShaderResource[];
}
type ShaderConfig = string | ShaderEntry;
type ShaderMap = Record<string, ShaderConfig>;

declare global {
    interface Window { EJS_SHADERS?: ShaderMap }
}

// ─── Inline extras ──────────────────────────────────────────────────────────
// Lightweight shaders bundled in addition to EmulatorJS's stock set.

const HEADER = `
#if defined(VERTEX)
#if __VERSION__ >= 130
#define COMPAT_VARYING out
#define COMPAT_ATTRIBUTE in
#else
#define COMPAT_VARYING varying
#define COMPAT_ATTRIBUTE attribute
#endif
#ifdef GL_ES
precision mediump float;
#endif
COMPAT_ATTRIBUTE vec4 VertexCoord;
COMPAT_ATTRIBUTE vec4 TexCoord;
COMPAT_VARYING vec4 TEX0;
uniform mat4 MVPMatrix;
void main() {
    gl_Position = MVPMatrix * VertexCoord;
    TEX0 = TexCoord;
}
#elif defined(FRAGMENT)
#if __VERSION__ >= 130
#define COMPAT_VARYING in
#define COMPAT_TEXTURE texture
out vec4 FragColor;
#else
#define COMPAT_VARYING varying
#define COMPAT_TEXTURE texture2D
#define FragColor gl_FragColor
#endif
#ifdef GL_ES
precision mediump float;
#endif
uniform sampler2D Texture;
uniform vec2 TextureSize;
uniform vec2 OutputSize;
uniform vec2 InputSize;
COMPAT_VARYING vec4 TEX0;
`;

function buildExtra(name: string, body: string, linear = true): ShaderEntry {
    const glsl = `${HEADER}\nvoid main() {\n${body}\n}\n#endif\n`;
    const glslp = `shaders = 1\nshader0 = ${name}.glsl\nfilter_linear0 = ${linear}\n`;
    return {
        shader: { type: 'text', value: glslp },
        resources: [{ name: `${name}.glsl`, type: 'text', value: glsl }],
    };
}

const EXTRA_SHADERS: Record<string, ShaderEntry> = {
    'scanlines': buildExtra('scanlines', `
        vec3 c = COMPAT_TEXTURE(Texture, TEX0.xy).rgb;
        float s = mod(floor(TEX0.y * TextureSize.y), 2.0);
        c *= mix(0.6, 1.0, s);
        FragColor = vec4(c, 1.0);
    `, false),

    'grayscale': buildExtra('grayscale', `
        vec3 c = COMPAT_TEXTURE(Texture, TEX0.xy).rgb;
        float l = dot(c, vec3(0.299, 0.587, 0.114));
        FragColor = vec4(vec3(l), 1.0);
    `),

    'gameboy': buildExtra('gameboy', `
        vec3 c = COMPAT_TEXTURE(Texture, TEX0.xy).rgb;
        float l = dot(c, vec3(0.299, 0.587, 0.114));
        vec3 p0 = vec3(0.059, 0.220, 0.059);
        vec3 p1 = vec3(0.188, 0.384, 0.188);
        vec3 p2 = vec3(0.545, 0.675, 0.059);
        vec3 p3 = vec3(0.608, 0.737, 0.059);
        vec3 col = (l < 0.25) ? p0 : (l < 0.5) ? p1 : (l < 0.75) ? p2 : p3;
        FragColor = vec4(col, 1.0);
    `),

    'sepia': buildExtra('sepia', `
        vec3 c = COMPAT_TEXTURE(Texture, TEX0.xy).rgb;
        float r = dot(c, vec3(0.393, 0.769, 0.189));
        float g = dot(c, vec3(0.349, 0.686, 0.168));
        float b = dot(c, vec3(0.272, 0.534, 0.131));
        FragColor = vec4(r, g, b, 1.0);
    `),

    'vignette': buildExtra('vignette', `
        vec3 c = COMPAT_TEXTURE(Texture, TEX0.xy).rgb;
        vec2 v = TEX0.xy - 0.5;
        float d = dot(v, v);
        c *= smoothstep(0.7, 0.15, d * 1.6);
        FragColor = vec4(c, 1.0);
    `),

    'sharpen': buildExtra('sharpen', `
        vec2 px = 1.0 / TextureSize;
        vec3 c = COMPAT_TEXTURE(Texture, TEX0.xy).rgb;
        vec3 n = COMPAT_TEXTURE(Texture, TEX0.xy + vec2(0.0, -px.y)).rgb;
        vec3 s = COMPAT_TEXTURE(Texture, TEX0.xy + vec2(0.0,  px.y)).rgb;
        vec3 e = COMPAT_TEXTURE(Texture, TEX0.xy + vec2( px.x, 0.0)).rgb;
        vec3 w = COMPAT_TEXTURE(Texture, TEX0.xy + vec2(-px.x, 0.0)).rgb;
        FragColor = vec4(clamp(c * 5.0 - n - s - e - w, 0.0, 1.0), 1.0);
    `, false),

    'invert': buildExtra('invert', `
        vec3 c = COMPAT_TEXTURE(Texture, TEX0.xy).rgb;
        FragColor = vec4(1.0 - c, 1.0);
    `),

    'dot-mask': buildExtra('dot-mask', `
        vec3 c = COMPAT_TEXTURE(Texture, TEX0.xy).rgb;
        vec2 px = floor(TEX0.xy * TextureSize);
        float col = mod(px.x, 3.0);
        vec3 mask = vec3(col < 1.0 ? 1.0 : 0.5,
                         (col >= 1.0 && col < 2.0) ? 1.0 : 0.5,
                         col >= 2.0 ? 1.0 : 0.5);
        float scan = mix(0.7, 1.0, mod(px.y, 2.0));
        FragColor = vec4(c * mask * scan, 1.0);
    `, false),
};

// ─── Catalogue ──────────────────────────────────────────────────────────────

export type ShaderCategory = 'crt' | 'scaling' | 'effects';

interface ShaderMeta { label: string; category: ShaderCategory; description: string }

const META: Record<string, ShaderMeta> = {
    // Stock EmulatorJS bundle
    '4xScaleHQ.glslp':    { label: '4x Scale HQ', category: 'scaling', description: 'Pixel-art-aware 4× upscale' },
    'sabr':               { label: 'SABR',        category: 'scaling', description: 'Smooth anti-aliased upscale' },
    'bicubic':            { label: 'Bicubic',     category: 'scaling', description: 'Soft cubic interpolation' },
    'crt-geom.glslp':     { label: 'CRT Geom',    category: 'crt',     description: 'Curved CRT geometry' },
    'crt-lottes':         { label: 'CRT Lottes',  category: 'crt',     description: 'Timothy Lottes CRT' },
    'crt-mattias.glslp':  { label: 'CRT Mattias', category: 'crt',     description: 'Subtle scanlines, mild glow' },
    // Inline extras
    'scanlines':          { label: 'Scanlines',   category: 'crt',     description: 'Plain horizontal scanlines' },
};

// ─── Stock-shader script loader ─────────────────────────────────────────────

let loadPromise: Promise<ShaderMap> | null = null;

export function loadShaderMap(): Promise<ShaderMap> {
    if (typeof window === 'undefined') return Promise.resolve({});
    if (window.EJS_SHADERS) return Promise.resolve(window.EJS_SHADERS);
    if (loadPromise) return loadPromise;

    loadPromise = new Promise<ShaderMap>((resolve, reject) => {
        const onLoad  = () => resolve(window.EJS_SHADERS ?? {});
        const onError = () => { loadPromise = null; reject(new Error('Failed to load shaders.js')); };

        const existing = document.querySelector(`script[${SCRIPT_MARK}]`);
        if (existing) {
            existing.addEventListener('load', onLoad);
            existing.addEventListener('error', onError);
            return;
        }
        const script = document.createElement('script');
        script.src = SHADERS_URL;
        script.setAttribute(SCRIPT_MARK, '1');
        script.onload = onLoad;
        script.onerror = onError;
        document.head.appendChild(script);
    });

    return loadPromise;
}

export interface ShaderOption {
    key: string;
    label: string;
    description: string;
    /** null for the special "Disabled" entry. */
    category: ShaderCategory | null;
}

export async function getShaderOptions(): Promise<ShaderOption[]> {
    const map = await loadShaderMap();
    const known = new Set<string>([...Object.keys(map), ...Object.keys(EXTRA_SHADERS)]);

    const out: ShaderOption[] = [
        { key: SHADER_DISABLED, label: 'Disabled', description: 'Display the raw output', category: null },
    ];
    for (const [k, meta] of Object.entries(META)) {
        if (known.has(k)) out.push({ key: k, ...meta });
    }
    return out;
}

/** Write the shader files into the core's FS. Returns true if a shader was written. */
export function writeShaderFiles(mod: LibretroModule, name: string): boolean {
    try { mod.FS.unlink(SHADER_PATH); } catch { /* not present */ }
    if (name === SHADER_DISABLED) return false;

    const cfg: ShaderConfig | undefined = EXTRA_SHADERS[name] ?? window.EJS_SHADERS?.[name];
    if (!cfg) return false;

    if (typeof cfg === 'string') {
        writeFile(mod, SHADER_PATH, cfg);
        return true;
    }

    const decode = (r: { type: 'text' | 'base64'; value: string }) =>
        r.type === 'base64' ? atob(r.value) : r.value;
    writeFile(mod, SHADER_PATH, decode(cfg.shader));
    for (const res of cfg.resources ?? []) {
        writeFile(mod, `/shader/${res.name}`, decode(res));
    }
    return true;
}

// ─── Persistence (per libretro core) ────────────────────────────────────────

export const getStoredShader = (libretroName: string): string =>
    loadStringRecord(STORAGE_KEY)[libretroName] ?? SHADER_DISABLED;

export function setStoredShader(libretroName: string, key: string): void {
    const prefs = loadStringRecord(STORAGE_KEY);
    if (key === SHADER_DISABLED) delete prefs[libretroName];
    else prefs[libretroName] = key;
    saveJSON(STORAGE_KEY, prefs);
}
