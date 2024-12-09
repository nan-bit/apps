import { Article } from "@db/schema";

const DB_NAME = "rss_reader";
const STORES = {
  ARTICLES: "articles",
  STATE: "app_state"
} as const;

export class ArticleStorage {
  private db: IDBDatabase | null = null;

  private async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORES.ARTICLES)) {
          db.createObjectStore(STORES.ARTICLES, { keyPath: "id" });
        }
        if (!db.objectStoreNames.contains(STORES.STATE)) {
          db.createObjectStore(STORES.STATE, { keyPath: "key" });
        }
      };
    });
  }

  async saveArticles(articles: Article[]): Promise<void> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(STORES.ARTICLES, "readwrite");
    const store = transaction.objectStore(STORES.ARTICLES);

    return new Promise((resolve, reject) => {
      articles.forEach(article => {
        store.put(article);
      });

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async getArticles(): Promise<Article[]> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(STORES.ARTICLES, "readonly");
    const store = transaction.objectStore(STORES.ARTICLES);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async saveState(key: string, value: any): Promise<void> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(STORES.STATE, "readwrite");
    const store = transaction.objectStore(STORES.STATE);

    return new Promise((resolve, reject) => {
      const request = store.put({ key, value });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getState<T>(key: string): Promise<T | null> {
    if (!this.db) await this.init();
    const transaction = this.db!.transaction(STORES.STATE, "readonly");
    const store = transaction.objectStore(STORES.STATE);

    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result?.value ?? null);
    });
  }
}

export const articleStorage = new ArticleStorage();
