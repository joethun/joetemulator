import { writeFile } from '@/lib/ra/fs';
import type { LibretroModule } from '@/lib/ra/types';
import { loadStringRecord, saveJSON } from '@/lib/ra/storage';
import { SHADER_DATA } from '@/lib/ra/shaders-data';
import { base64ToBytes } from '@/lib/utils';

const STORAGE_KEY = 'ra_shader_pref_v1';
const SHADER_PATH = '/shader/shader.glslp';

export const SHADER_DISABLED = 'disabled';

export type ShaderCategory = 'crt' | 'scaling' | 'effects';

export interface ShaderOption {
    key: string;
    label: string;
    description: string;
    /** null for the special "Disabled" entry. */
    category: ShaderCategory | null;
}

const CATALOGUE: ShaderOption[] = [
    { key: SHADER_DISABLED,        label: 'Disabled',     description: 'Display the raw output',                          category: null      },

    { key: 'crt-aperture.glslp',   label: 'CRT Aperture', description: 'Aperture-grille CRT with scanlines',              category: 'crt'     },
    { key: 'crt-easymode.glslp',   label: 'CRT Easymode', description: 'Lightweight CRT preset',                          category: 'crt'     },
    { key: 'crt-geom.glslp',       label: 'CRT Geom',     description: 'Geometric CRT with curvature',                    category: 'crt'     },
    { key: 'crt-mattias.glslp',    label: 'CRT Mattias',  description: 'Soft CRT by Mattias',                              category: 'crt'     },
    { key: 'crt-beam',             label: 'CRT Beam',     description: 'Beam-shaped CRT scanlines',                       category: 'crt'     },
    { key: 'crt-caligari',         label: 'CRT Caligari', description: 'Composite CRT look',                               category: 'crt'     },
    { key: 'crt-lottes',           label: 'CRT Lottes',   description: 'Timothy Lottes CRT emulation',                    category: 'crt'     },
    { key: 'crt-zfast',            label: 'CRT zfast',    description: 'Fast, low-cost CRT',                               category: 'crt'     },
    { key: 'crt-yeetron',          label: 'CRT Yeetron',  description: 'Pixel-aligned CRT with sharp scanlines',          category: 'crt'     },

    { key: '2xScaleHQ.glslp',      label: '2x ScaleHQ',   description: 'High-quality 2x upscale',                          category: 'scaling' },
    { key: '4xScaleHQ.glslp',      label: '4x ScaleHQ',   description: 'High-quality 4x upscale',                          category: 'scaling' },
    { key: 'sabr',                 label: 'SABR',         description: 'Self-Adjusting Bilateral Resampling',              category: 'scaling' },
    { key: 'bicubic',              label: 'Bicubic',      description: 'Bicubic interpolation',                            category: 'scaling' },

    { key: 'mix-frames',           label: 'Mix Frames',   description: 'Blend consecutive frames for motion smoothing',    category: 'effects' },
];

export const getShaderOptions = (): ShaderOption[] => CATALOGUE;

/** Write the shader files into the core's FS. Returns true if a shader was written. */
export function writeShaderFiles(mod: LibretroModule, name: string): boolean {
    try { mod.FS.unlink(SHADER_PATH); } catch { /* not present */ }
    const entry = SHADER_DATA[name];
    if (!entry) return false;
    writeFile(mod, SHADER_PATH, entry.glslp);
    for (const r of entry.resources) writeFile(mod, `/shader/${r.name}`, base64ToBytes(r.base64));
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
