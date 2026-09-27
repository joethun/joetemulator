// Pass-through to the RetroAchievements Connect API used by rcheevos.
//
// The browser can't call dorequest.php directly: it sends no CORS headers,
// and it rejects browser User-Agents (which fetch() can't override). This
// route forwards the player's own request unchanged — their credentials,
// their token — and adds an identifying User-Agent as RA's integration
// guidelines require. Nothing is cached or stored.

import packageJson from '../../../../package.json';

const RA_ENDPOINT = 'https://retroachievements.org/dorequest.php';
const MAX_BODY_BYTES = 64 * 1024;

// The dorequest actions this app issues (rc_client's, plus `unlocks` for the
// library view). Anything else is refused so the route can't be used as a
// general-purpose relay.
const ALLOWED_REQUESTS = new Set([
    'login2', 'gameid', 'achievementsets', 'startsession', 'ping',
    'awardachievement', 'submitlbentry', 'unlocks',
]);

const USER_AGENT_BASE = `JoeTEmulator/${packageJson.version} (Web)`;

export const dynamic = 'force-dynamic';

/** Keep only the "rcheevos/x.y core_libretro" clause the client supplies. */
function clientClause(raw: string | null): string {
    if (!raw) return '';
    return raw.replace(/[^A-Za-z0-9._/ -]/g, '').slice(0, 96).trim();
}

export async function POST(req: Request): Promise<Response> {
    const body = await req.text();
    if (body.length > MAX_BODY_BYTES) return json({ Success: false, Error: 'Request too large' }, 413);

    // rc_client posts every parameter; tolerate `r` in the query too.
    const url = new URL(req.url);
    const action = new URLSearchParams(body).get('r') ?? url.searchParams.get('r');
    if (!action || !ALLOWED_REQUESTS.has(action)) {
        return json({ Success: false, Error: 'Unsupported request' }, 400);
    }

    const clause = clientClause(req.headers.get('x-ra-client'));

    try {
        const upstream = await fetch(RA_ENDPOINT + url.search, {
            method: 'POST',
            body,
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'user-agent': clause ? `${USER_AGENT_BASE} ${clause}` : USER_AGENT_BASE,
            },
            cache: 'no-store',
        });
        return new Response(upstream.body, {
            status: upstream.status,
            headers: {
                'content-type': upstream.headers.get('content-type') ?? 'application/json',
                'cache-control': 'no-store',
            },
        });
    } catch {
        // 502 is one of the statuses rc_client retries.
        return json({ Success: false, Error: 'RetroAchievements is unreachable' }, 502);
    }
}

const json = (value: unknown, status: number) =>
    new Response(JSON.stringify(value), {
        status,
        headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
