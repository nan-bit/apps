import { Article } from "@db/schema";

const DB_NAME = "rss_reader";
const STORE_NAME = "articles";

export class ArticleStorage {
  private db: IDBDatabase | null = null;

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      };
    });
  }

  async saveArticles(articles: Article[]) {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    return Promise.all(
      articles.map((article) => {
        return new Promise<void>((resolve, reject) => {
          const request = store.put(article);
          request.onerror = () => reject(request.error);
          request.onsuccess = () => resolve();
        });
      })
    );
  }

  async getArticles(): Promise<Article[]> {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }
}

export const articleStorage = new ArticleStorage();
