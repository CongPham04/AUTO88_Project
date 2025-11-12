import { create } from 'zustand';
import newsService, { News, NewsRequest } from '@/services/newsService';

interface NewsState {
  newsItems: News[];
  isLoading: boolean;
  error: string | null;
  fetchNews: () => Promise<void>;
  addNews: (newsData: NewsRequest) => Promise<void>;
  editNews: (id: number, newsData: Partial<NewsRequest>) => Promise<void>;
  removeNews: (id: number) => Promise<void>;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  newsItems: [],
  isLoading: false,
  error: null,

  /**
   * Fetches all news items and updates the state.
   */
  fetchNews: async () => {
    set({ isLoading: true, error: null });
    try {
      const newsItems = await newsService.getAllNews();
      set({ newsItems, isLoading: false });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ isLoading: false, error });
    }
  },

  /**
   * Adds a new news item.
   */
  addNews: async (newsData: NewsRequest) => {
    set({ isLoading: true, error: null });
    try {
      await newsService.createNews(newsData);
      // Refresh the list to include the new item
      await get().fetchNews();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ isLoading: false, error });
      throw err; // Re-throw to be caught in the component
    }
  },

  /**
   * Edits an existing news item.
   */
  editNews: async (id: number, newsData: Partial<NewsRequest>) => {
    set({ isLoading: true, error: null });
    try {
      await newsService.updateNews(id, newsData);
      // Refresh the list to reflect the changes
      await get().fetchNews();
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ isLoading: false, error });
      throw err; // Re-throw to be caught in the component
    }
  },

  /**
   * Removes a news item by its ID.
   */
  removeNews: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await newsService.deleteNews(id);
      // Filter out the deleted item from the current state
      set((state) => ({
        newsItems: state.newsItems.filter((item) => item.newsId !== id),
        isLoading: false,
      }));
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ isLoading: false, error });
    }
  },
}));
