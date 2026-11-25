import { config } from 'dotenv';
import { createClient } from '@libsql/client';

config({ path: ['.env.local', '.env'] });

const client = createClient({
	url: process.env.TURSO_DATABASE_URL!,
	authToken: process.env.TURSO_AUTH_TOKEN!,
});

async function reset() {
	console.log('Dropping all tables...');
	await client.execute('DROP TABLE IF EXISTS `orders`');
	await client.execute('DROP TABLE IF EXISTS `customers`');
	await client.execute('DROP TABLE IF EXISTS `__drizzle_migrations`');
	console.log('Database reset complete.');
}

reset()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Reset error:', err);
		process.exit(1);
	});
