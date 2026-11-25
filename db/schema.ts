import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const customers = sqliteTable('customers', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	city: text('city').notNull(),
});

export const orders = sqliteTable('orders', {
	id: integer('id').primaryKey({ autoIncrement: true }),
	customerId: integer('customer_id')
		.notNull()
		.references(() => customers.id, { onDelete: 'cascade' }),
	productName: text('product_name').notNull(),
	category: text('category').notNull(),
	amount: real('amount').notNull(),
	status: text('status').notNull(), // e.g. 'delivered', 'pending', 'cancelled'
	orderDate: text('order_date').notNull(), // e.g. '2026-11-10'
});
