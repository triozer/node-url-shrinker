import { z } from "zod";

import { sql } from "drizzle-orm";
import { text, sqliteTable } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

export const links = sqliteTable("links", {
  // Base fields
  id: text("id").primaryKey(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updatedAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  // Link fields
  url: text("url").notNull(),
  slug: text("slug").notNull(),

  // Optional fields
  title: text("title"),
  expiresAt: text("expiresAt"),
})

export const insertLinkSchema = createInsertSchema(links, {
  slug: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
});
export const updateLinkSchema = insertLinkSchema.partial();
export const selectLinkSchema = createSelectSchema(links, {
  createdAt: (schema) => schema.createdAt.transform((value) => new Date(value)),
  updatedAt: (schema) => schema.updatedAt.transform((value) => new Date(value)),
  expiresAt: (schema) =>
    schema.expiresAt.transform((value) => (value ? new Date(value) : null)),
});

export type Link = z.infer<typeof selectLinkSchema>;
export type InsertLink = z.infer<typeof insertLinkSchema>;
export type UpdateLink = z.infer<typeof updateLinkSchema>;

export const tags = sqliteTable("tags", {
  // Base fields
  id: text("id").primaryKey(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updatedAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  // Tag fields
  name: text("name").notNull(),
});

export const insertTagSchema = createInsertSchema(tags).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectTagSchema = createSelectSchema(tags);

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = z.infer<typeof selectTagSchema>;

export const visits = sqliteTable("visits", {
  // Base fields
  id: text("id").primaryKey(),
  createdAt: text("createdAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  updatedAt: text("updatedAt")
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),

  // Visit fields
  linkId: text("linkId").notNull(),

  // Optional fields
  city: text("city"),
  country: text("country"),
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const selectVisitSchema = createSelectSchema(visits);

export type InsertVisit = z.infer<typeof insertVisitSchema>;
export type Visit = z.infer<typeof selectVisitSchema>;
