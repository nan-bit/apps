import { pgTable, text, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const categories = pgTable("categories", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  color: text("color").notNull(),
});

export const feeds = pgTable("feeds", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  categoryId: integer("category_id").references(() => categories.id),
  lastFetched: timestamp("last_fetched"),
});

export const articles = pgTable("articles", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  feedId: integer("feed_id").references(() => feeds.id).notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  link: text("link").notNull(),
  pubDate: timestamp("pub_date").notNull(),
  guid: text("guid").notNull(),
  read: boolean("read").default(false),
  bookmarked: boolean("bookmarked").default(false),
});

// Define relationships
export const feedsRelations = relations(feeds, ({ one, many }) => ({
  category: one(categories, {
    fields: [feeds.categoryId],
    references: [categories.id],
  }),
  articles: many(articles),
}));

export const articlesRelations = relations(articles, ({ one }) => ({
  feed: one(feeds, {
    fields: [articles.feedId],
    references: [feeds.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  feeds: many(feeds),
}));

// Zod schemas
export const insertFeedSchema = createInsertSchema(feeds);
export const selectFeedSchema = createSelectSchema(feeds);
export type InsertFeed = z.infer<typeof insertFeedSchema>;
export type Feed = z.infer<typeof selectFeedSchema>;

export const insertCategorySchema = createInsertSchema(categories);
export const selectCategorySchema = createSelectSchema(categories);
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = z.infer<typeof selectCategorySchema>;

export const insertArticleSchema = createInsertSchema(articles);
export const selectArticleSchema = createSelectSchema(articles);
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = z.infer<typeof selectArticleSchema>;
