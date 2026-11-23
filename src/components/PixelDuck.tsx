/** 16x16 pixel-art version of the staring duck from the original logo. The
 *  eyes are the shiny pixels on each side of the hood (rows 2-3).
 *  DUCK is a grid of PALETTE keys ('.' = transparent).
 *  scripts/icons/generate.py reads PALETTE and DUCK to build the favicon
 *  and app icons, so keep them as plain string literals. */
const PALETTE: Record<string, string> = {
    D: '#3b3633', // outline / deep shadow
    G: '#6f6965', // hood
    H: '#8e8782', // hood shine
    F: '#e3d391', // bill / face plate
    f: '#bfae6c', // bill shade
    M: '#7d6a45', // bill tip, nostrils
    E: '#f6efd9', // eye shine
    K: '#0a0908', // eye
    C: '#f3ecda', // chest
    c: '#d3c8ad', // chest shade
    O: '#f08a3c', // feet
};

const DUCK = [
    '.....DDDDDD.....',
    '...DDGGGGGGDD...',
    '..EGHHGGGGGGGE..',
    '..KGGGGGGGGGGK..',
    '.DGGFFFFFFFFGGD.',
    '.DGFFMFFFFMFFGD.',
    '.DGFFFFFFFFFFGD.',
    '..DGfFFFFFFfGD..',
    '..DGGffMMffGGD..',
    '...DGGCCCCGGD...',
    '...DGGCCCCGGD...',
    '..DGCCCCCCCCGD..',
    '.DGCCCCCCCCCCGD.',
    '.DCCCCCCCCCCCCD.',
    '..DccccccccccD..',
    '....OO....OO....',
];

type ColorPath = { key: string; d: string };

/** One <path> per colour: every horizontal run becomes a 1-tall subpath.
 *  `top` is the y of the first row. */
function toPaths(rows: string[], top = 0): ColorPath[] {
    const d: Record<string, string> = {};
    rows.forEach((row, i) => {
        for (const m of row.matchAll(/([^.])\1*/g)) {
            const w = m[0].length;
            d[m[1]] = (d[m[1]] ?? '') + `M${m.index} ${top + i}h${w}v1h-${w}z`;
        }
    });
    return Object.entries(d).map(([key, d]) => ({ key, d }));
}

/** Rows above this belong to the head, which nods independently. */
const NECK_ROW = 9;
const HEAD = toPaths(DUCK.slice(0, NECK_ROW));
const BODY = toPaths(DUCK.slice(NECK_ROW), NECK_ROW);

const Layer = ({ paths, className }: { paths: ColorPath[]; className?: string }) => (
    <g className={className}>
        {paths.map(p => <path key={p.key} d={p.d} fill={PALETTE[p.key]} />)}
    </g>
);

/** The mascot. Idles with a nod; on hover of the nearest `.duck-hover`
 *  ancestor it hops. Animation lives in globals.css
 *  under "Pixel duck" and stops for reduced motion.
 *  `scale` is screen pixels per duck pixel. It must be a whole number: a
 *  fractional one makes some duck pixels a pixel wider than others. */
export function PixelDuck({ scale }: { scale: number }) {
    const size = 16 * scale;
    return (
        <svg viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges" className="pixel-duck" aria-hidden="true">
            <g className="pd-hop">
                <Layer paths={BODY} />
                <Layer paths={HEAD} className="pd-head" />
            </g>
        </svg>
    );
}
