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
  app.post("/api/feeds/validate", async (req, res) => {
    const { url } = req.body;
    try {
      const feed = await parser.parseURL(url);
      if (feed && feed.items && feed.items.length > 0) {
        res.status(200).json({ valid: true });
      } else {
        res.status(400).json({ error: "Invalid RSS feed format" });
      }
    } catch (error) {
      res.status(400).json({ error: "Failed to parse RSS feed" });
    }
  });

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
    try {
      const { feedId } = req.query;
      
      const allArticles = await db.query.articles.findMany({
        where: feedId ? eq(articles.feedId, parseInt(feedId as string)) : undefined,
        orderBy: (articles, { desc }) => [desc(articles.pubDate)],
        limit: 50,
      });
      
      if (!allArticles) {
        return res.status(404).json({ error: "No articles found" });
      }
      
      res.json(allArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/articles/bookmarked", async (req, res) => {
    const bookmarkedArticles = await db.query.articles.findMany({
      where: eq(articles.bookmarked, true),
      orderBy: (articles, { desc }) => [desc(articles.pubDate)],
      limit: 50,
    });
    res.json(bookmarkedArticles);
  });

  app.get("/api/articles/:id", async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    
    if (isNaN(articleId)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    const article = await db.query.articles.findFirst({
      where: eq(articles.id, articleId)
    });
    
    if (!article) {
      return res.status(404).json({ error: "Article not found" });
    }
    res.json(article);
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
  // Bookmarking
  app.patch("/api/articles/:id/bookmark", async (req, res) => {
    const { id } = req.params;
    const articleId = parseInt(id);
    
    if (isNaN(articleId)) {
      return res.status(400).json({ error: "Invalid article ID" });
    }

    const { bookmarked } = req.body;
    
    try {
      const updated = await db
        .update(articles)
        .set({ bookmarked })
        .where(eq(articles.id, articleId))
        .returning();
        
      if (!updated.length) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      res.json(updated[0]);
    } catch (error) {
      console.error('Bookmark update error:', error);
      res.status(500).json({ error: "Failed to update bookmark" });
    }
  });

  app.get("/api/articles/bookmarked", async (req, res) => {
    const bookmarkedArticles = await db.query.articles.findMany({
      where: eq(articles.bookmarked, true),
      orderBy: (articles, { desc }) => [desc(articles.pubDate)],
      limit: 50,
    });
    res.json(bookmarkedArticles);
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
