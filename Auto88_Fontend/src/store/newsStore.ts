import { create } from 'zustand';
import newsService, { NewsResponse } from '@/services/newsService';

interface NewsState {
  news: NewsResponse[];
  loading: boolean;
  fetchNews: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set) => ({
  news: [],
  loading: false,
  fetchNews: async () => {
    set({ loading: true });
    try {
      const data = await newsService.getAllNews();
      set({ news: data, loading: false });
    } catch (error) {
      set({ loading: false });
      console.error(error);
    }
  }
}));