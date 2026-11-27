import { google } from '@ai-sdk/google';
import {
	streamText,
	tool,
	convertToModelMessages,
	stepCountIs,
	type UIMessage,
} from 'ai';
import { z } from 'zod';
import { createClient } from '@libsql/client';
import { checkRateLimit, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit';

const client = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
});

const MAX_MESSAGE_LENGTH = 500;

const uiMessageSchema = z.looseObject({
	role: z.enum(['user', 'assistant', 'system']),
	parts: z
		.array(
			z.looseObject({
				type: z.string(),
				text: z.string().optional(),
			}),
		)
		.optional(),
});

const requestSchema = z.object({
	messages: z.array(uiMessageSchema).min(1),
});

const FORBIDDEN_SQL =
	/\b(insert|update|delete|drop|alter|attach|pragma|create|replace|truncate|grant|vacuum)\b/i;

function jsonError(message: string, status: number, headers?: HeadersInit) {
	return Response.json({ error: message }, { status, headers });
}

function getClientIp(req: Request): string {
	const forwarded = req.headers.get('x-forwarded-for');
	if (forwarded) {
		const first = forwarded.split(',')[0]?.trim();
		if (first) return first;
	}
	return req.headers.get('x-real-ip')?.trim() || 'unknown';
}

export async function POST(req: Request) {
	let body: unknown;
	try {
		body = await req.json();
	} catch {
		return jsonError('Invalid JSON body', 400);
	}

	const parsed = requestSchema.safeParse(body);
	if (!parsed.success) {
		return jsonError('Invalid request body', 400);
	}

	const { messages } = parsed.data;

	const lastUserMessage = [...messages]
		.reverse()
		.find((m) => m.role === 'user');
	const lastUserText = (lastUserMessage?.parts ?? [])
		.filter((p) => p.type === 'text')
		.map((p) => p.text ?? '')
		.join('');

	if (lastUserText.length > MAX_MESSAGE_LENGTH) {
		return jsonError(
			`Message too long. Please keep it under ${MAX_MESSAGE_LENGTH} characters.`,
			400,
		);
	}

	const rateLimit = await checkRateLimit(getClientIp(req));
	if (!rateLimit.allowed) {
		return jsonError(RATE_LIMIT_MESSAGE, 429, {
			'Retry-After': String(rateLimit.retryAfterSeconds),
		});
	}

	try {
		const result = streamText({
			model: google('gemini-flash-lite-latest'),
			messages: await convertToModelMessages(
				messages as unknown as Omit<UIMessage, 'id'>[],
			),
			system: `
      Tum ek helpful SQL data analyst AI agent ho.
      Database mein yeh tables aur columns maujood hain:
      - customers(id, name, email, city)
      - orders(id, customer_id, product_name, category, amount, status, order_date)

      Rules:
      1. Jab bhi user database se koi data, stats, total, ya list pooche, pehle querySql tool chalao.
      2. Sirf read-only SELECT queries likho. Kabhi INSERT, UPDATE, DELETE, ya DROP na likho.
      3. SQLite syntax use karo.
      4. Query ka result aane ke baad user ko saaf, mukhtasar, aur aasan zuban mein jawab do.
    `,
			stopWhen: stepCountIs(5),
			onError: ({ error }) => {
				console.error('[chat] stream error:', error);
			},
			tools: {
				querySql: tool({
					description:
						'Execute a read-only SQLite SELECT query on the Turso database',
					inputSchema: z.object({
						sql: z.string().describe('A valid SQLite SELECT query'),
					}),
					execute: async ({ sql }) => {
						const normalized = sql.trim().toLowerCase();
						if (
							!normalized.startsWith('select') ||
							normalized.includes(';') ||
							FORBIDDEN_SQL.test(sql)
						) {
							return {
								error: 'Security restriction: Only single read-only SELECT queries are allowed.',
							};
						}

						try {
							const res = await client.execute(sql);
							return {
								columns: res.columns,
								rows: res.rows,
							};
						} catch (err: unknown) {
							const message =
								err instanceof Error
									? err.message
									: 'Database query failed';
							return { error: message };
						}
					},
				}),
			},
		});

		return result.toUIMessageStreamResponse();
	} catch (err) {
		console.error('[chat] request failed:', err);
		return jsonError('Something went wrong. Please try again.', 500);
	}
}
