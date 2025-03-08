import { relations } from "drizzle-orm/relations";
import { user, session, files } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	files: many(files),
}));

export const filesRelations = relations(files, ({one}) => ({
	user: one(user, {
		fields: [files.userId],
		references: [user.id]
	}),
}));