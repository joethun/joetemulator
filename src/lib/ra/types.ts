export type CwrapPrimitive = 'string' | 'number' | 'null';

interface EmscriptenFS {
    writeFile(path: string, data: string | Uint8Array): void;
    readFile(path: string, opts?: { encoding?: 'utf8' | 'binary' }): Uint8Array | string;
    mkdir(path: string): void;
    unlink(path: string): void;
    mount(fs: unknown, opts: object, path: string): void;
    unmount(path: string): void;
    syncfs(populate: boolean, cb: (err?: Error) => void): void;
    filesystems: { IDBFS: unknown };
}

export interface LibretroModule {
    FS: EmscriptenFS;
    HEAPU8: Uint8Array;
    callMain(args: string[]): void;
    resumeMainLoop(): void;
    cwrap<R = unknown>(name: string, ret: CwrapPrimitive, args: CwrapPrimitive[]): (...a: unknown[]) => R;
    abort?: () => void;
    [key: string]: unknown;
}

export type ModuleFactory = (config: object) => Promise<LibretroModule>;

export interface CoreInfo {
    name: string;
    extensions: string[];
    save: string | false;
    repo?: string;
    options?: {
        file?: string;
        settings?: Record<string, string>;
    };
}

export type CoreVariant = 'default' | 'thread' | 'legacy' | 'thread-legacy';

export interface ResolvedCore {
    libretroName: string;
    coreInfo: CoreInfo;
    moduleFactory: ModuleFactory;
    wasmUrl: string;
}

export type EmulatorPhase = 'idle' | 'loading-core' | 'booting' | 'running' | 'error';
