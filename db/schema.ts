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

export const rateLimits = sqliteTable('rate_limits', {
	key: text('key').primaryKey(), // e.g. 'minute:1.2.3.4' or 'hour:1.2.3.4'
	windowStart: integer('window_start').notNull(), // epoch ms of current window start
	count: integer('count').notNull(),
});
