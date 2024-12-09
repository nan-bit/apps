import type { Express } from "express";
import { db } from "../db";
import { feeds, articles, categories } from "@db/schema";
import { eq } from "drizzle-orm";
import Parser from 'rss-parser';

const parser = new Parser();

export function registerRoutes(app: Express) {
  // Feeds
  app.get("/api/feeds", async (req, res) => {
    const allFeeds = await db.query.feeds.findMany({
      with: {
        category: true,
      },
    });
    res.json(allFeeds);
  });

  app.post("/api/feeds", async (req, res) => {
    const { url, categoryId } = req.body;
    try {
      const feed = await parser.parseURL(url);
      const newFeed = await db.insert(feeds).values({
        title: feed.title || url,
        url,
        categoryId,
        lastFetched: new Date(),
      }).returning();

      // Insert articles
      const articlesToInsert = feed.items.map(item => ({
        feedId: newFeed[0].id,
        title: item.title || '',
        content: item.content || item.description || '',
        link: item.link || '',
        pubDate: new Date(item.pubDate || Date.now()),
        guid: item.guid || item.link || '',
        read: false,
      }));

      await db.insert(articles).values(articlesToInsert);

      res.json(newFeed[0]);
    } catch (error) {
      res.status(400).json({ error: "Invalid RSS feed" });
    }
  });

  app.delete("/api/feeds/:id", async (req, res) => {
    const { id } = req.params;
    await db.delete(feeds).where(eq(feeds.id, parseInt(id)));
    res.status(204).send();
  });

  // Articles
  app.get("/api/articles", async (req, res) => {
    const allArticles = await db.query.articles.findMany({
      orderBy: (articles, { desc }) => [desc(articles.pubDate)],
      limit: 50,
    });
    res.json(allArticles);
  });

  app.patch("/api/articles/:id", async (req, res) => {
    const { id } = req.params;
    const { read } = req.body;
    const updated = await db
      .update(articles)
      .set({ read })
      .where(eq(articles.id, parseInt(id)))
      .returning();
    res.json(updated[0]);
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    const allCategories = await db.query.categories.findMany();
    res.json(allCategories);
  });

  app.post("/api/categories", async (req, res) => {
    const { name, color } = req.body;
    const newCategory = await db
      .insert(categories)
      .values({ name, color })
      .returning();
    res.json(newCategory[0]);
  });
}
