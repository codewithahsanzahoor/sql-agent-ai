import { config } from 'dotenv';
// config({ path: '.env.local' });
import { db } from './index';
import { customers, orders } from './schema';

async function seed() {
	console.log('Seeding database...');

	const insertedCustomers = await db
		.insert(customers)
		.values([
			{ name: 'Ali Raza', email: 'ali@example.com', city: 'Lahore' },
			{ name: 'Sara Khan', email: 'sara@example.com', city: 'Karachi' },
			{
				name: 'Usman Tariq',
				email: 'usman@example.com',
				city: 'Islamabad',
			},
			{ name: 'Hina Malik', email: 'hina@example.com', city: 'Lahore' },
		])
		.onConflictDoNothing()
		.returning();

	const allCustomers =
		insertedCustomers.length > 0
			? insertedCustomers
			: await db.select().from(customers);

	if (allCustomers.length === 0) {
		console.log('No customers found to attach orders.');
		return;
	}

	const firstId = allCustomers[0].id;
	const secondId = allCustomers[1]?.id ?? firstId;
	const thirdId = allCustomers[2]?.id ?? firstId;
	const fourthId = allCustomers[3]?.id ?? firstId;

	await db.insert(orders).values([
		{
			customerId: firstId,
			productName: 'Mechanical Keyboard',
			category: 'Electronics',
			amount: 14500,
			status: 'delivered',
			orderDate: '2026-10-12',
		},
		{
			customerId: firstId,
			productName: 'USB-C Hub',
			category: 'Electronics',
			amount: 5200,
			status: 'delivered',
			orderDate: '2026-11-03',
		},
		{
			customerId: secondId,
			productName: 'Ergonomic Chair',
			category: 'Furniture',
			amount: 38000,
			status: 'delivered',
			orderDate: '2026-10-20',
		},
		{
			customerId: thirdId,
			productName: 'Desk Lamp',
			category: 'Furniture',
			amount: 6500,
			status: 'pending',
			orderDate: '2026-11-15',
		},
		{
			customerId: fourthId,
			productName: 'Wireless Mouse',
			category: 'Electronics',
			amount: 4800,
			status: 'delivered',
			orderDate: '2026-11-18',
		},
		{
			customerId: secondId,
			productName: 'Monitor Stand',
			category: 'Furniture',
			amount: 9000,
			status: 'cancelled',
			orderDate: '2026-11-20',
		},
	]);

	console.log('Seed completed successfully.');
}

seed()
	.then(() => process.exit(0))
	.catch((err) => {
		console.error('Seed error:', err);
		process.exit(1);
	});
