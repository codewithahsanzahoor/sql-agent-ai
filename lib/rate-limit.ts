import { createClient } from '@libsql/client';

const client = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
});

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;

const WINDOWS = [
	{ name: 'minute', windowMs: MINUTE_MS, limit: 2 },
	{ name: 'hour', windowMs: HOUR_MS, limit: 5 },
] as const;

export const RATE_LIMIT_MESSAGE =
	'Demo usage limit reached. Please try again later.';

export type RateLimitResult =
	| { allowed: true }
	| { allowed: false; retryAfterSeconds: number };

async function bumpWindow(
	key: string,
	windowMs: number,
): Promise<{ count: number; windowStart: number }> {
	const now = Date.now();
	const windowStart = Math.floor(now / windowMs) * windowMs;

	const res = await client.execute({
		sql: `INSERT INTO rate_limits (key, window_start, count)
		      VALUES (?, ?, 1)
		      ON CONFLICT(key) DO UPDATE SET
		        count = CASE
		          WHEN rate_limits.window_start = excluded.window_start
		          THEN rate_limits.count + 1
		          ELSE 1
		        END,
		        window_start = excluded.window_start
		      RETURNING count, window_start`,
		args: [key, windowStart],
	});

	const row = res.rows[0];
	return {
		count: Number(row.count),
		windowStart: Number(row.window_start),
	};
}

/**
 * Fixed-window rate limiter backed by Turso.
 * Allows 2 requests/minute and 5 requests/hour per IP.
 * Fails open (allows the request) if the DB check errors, so a
 * Turso hiccup never takes down the chat; errors are logged.
 */
export async function checkRateLimit(ip: string): Promise<RateLimitResult> {
	try {
		for (const { name, windowMs, limit } of WINDOWS) {
			const { count, windowStart } = await bumpWindow(
				`${name}:${ip}`,
				windowMs,
			);
			if (count > limit) {
				const retryAfterSeconds = Math.max(
					1,
					Math.ceil((windowStart + windowMs - Date.now()) / 1000),
				);
				return { allowed: false, retryAfterSeconds };
			}
		}
		return { allowed: true };
	} catch (err) {
		console.error('[rate-limit] check failed, allowing request:', err);
		return { allowed: true };
	}
}
