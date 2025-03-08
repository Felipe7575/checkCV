import { pgTable, unique, text, integer, foreignKey, timestamp, uuid } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	age: integer(),
	username: text().notNull(),
	passwordHash: text("password_hash").notNull(),
}, (table) => [
	unique("user_username_key").on(table.username),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	expiresAt: timestamp("expires_at", { withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_fkey"
		}).onDelete("cascade"),
]);

export const files = pgTable("files", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: text("user_id").notNull(),
	fileUrl: text("file_url").notNull(),
	originalName: text("original_name").notNull(),
	uploadedAt: timestamp("uploaded_at", { mode: 'string' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "files_user_id_fkey"
		}).onDelete("cascade"),
]);
