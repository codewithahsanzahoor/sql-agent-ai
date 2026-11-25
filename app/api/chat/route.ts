import { google } from '@ai-sdk/google';
import { streamText, tool, convertToModelMessages, stepCountIs } from 'ai';
import { z } from 'zod';
import { createClient } from '@libsql/client';

const client = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
});

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = streamText({
		model: google('gemini-flash-lite-latest'),
		messages: await convertToModelMessages(messages),
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
		tools: {
			querySql: tool({
				description:
					'Execute a read-only SQLite SELECT query on the Turso database',
				inputSchema: z.object({
					sql: z.string().describe('A valid SQLite SELECT query'),
				}),
				execute: async ({ sql }) => {
					const normalized = sql.trim().toLowerCase();
					if (!normalized.startsWith('select')) {
						return {
							error: 'Security restriction: Only SELECT queries are allowed.',
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
}
