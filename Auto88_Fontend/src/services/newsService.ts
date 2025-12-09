import apiClient, { BASE_URL } from '@/lib/apiClient';

// Enums
export enum NewsStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

// Interfaces
export interface NewsResponse {
  newsId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  status: NewsStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsRequest {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: NewsStatus;
  coverImageFile?: File;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class NewsService {
  
  // 1. ADMIN: Lấy tất cả tin tức (bao gồm Draft)
  async getAllNews(): Promise<NewsResponse[]> {
    const response = await apiClient.get<ApiResponse<NewsResponse[]>>('/news');
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi tải danh sách tin tức');
  }

  // 2. ADMIN: Lấy chi tiết tin tức (theo ID bất kỳ)
  async getNewsById(id: number): Promise<NewsResponse> {
    const response = await apiClient.get<ApiResponse<NewsResponse>>(`/news/${id}`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi tải chi tiết tin tức');
  }

  // 3. ADMIN: Tạo tin tức
  async createNews(newsData: NewsRequest): Promise<NewsResponse> {
    const formData = new FormData();
    formData.append('title', newsData.title);
    formData.append('slug', newsData.slug);
    formData.append('excerpt', newsData.excerpt || '');
    formData.append('content', newsData.content);
    formData.append('status', newsData.status);
    
    if (newsData.coverImageFile) {
      formData.append('coverImageFile', newsData.coverImageFile);
    }

    const response = await apiClient.post<ApiResponse<NewsResponse>>('/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi tạo tin tức');
  }

  // 4. ADMIN: Cập nhật tin tức
  async updateNews(id: number, newsData: Partial<NewsRequest>): Promise<NewsResponse> {
    const formData = new FormData();
    if (newsData.title) formData.append('title', newsData.title);
    if (newsData.slug) formData.append('slug', newsData.slug);
    if (newsData.excerpt) formData.append('excerpt', newsData.excerpt);
    if (newsData.content) formData.append('content', newsData.content);
    if (newsData.status) formData.append('status', newsData.status);
    
    if (newsData.coverImageFile) {
      formData.append('coverImageFile', newsData.coverImageFile);
    }

    const response = await apiClient.put<ApiResponse<NewsResponse>>(`/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi cập nhật tin tức');
  }

  // 5. ADMIN: Xoá tin tức
  async deleteNews(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/news/${id}`);
    if (response.data.code !== 200) throw new Error(response.data.message || 'Lỗi xoá tin tức');
  }

  // 6. PUBLIC: Lấy danh sách tin tức đã xuất bản
  async getPublishedNews(): Promise<NewsResponse[]> {
    const response = await apiClient.get<ApiResponse<NewsResponse[]>>('/news/published');
    if (response.data.code === 200) return response.data.data;
    throw new Error('Lỗi tải tin tức công khai');
  }

  // ✅ 7. PUBLIC: Lấy chi tiết tin tức đã xuất bản (Bổ sung hàm này để sửa lỗi)
  async getPublishedNewsById(id: number): Promise<NewsResponse> {
    const response = await apiClient.get<ApiResponse<NewsResponse>>(`/news/published/${id}`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi tải chi tiết tin tức');
  }

  // Helper lấy URL ảnh
  getImageUrl(url: string): string {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}/news/image/${url}`;
  }
}

export default new NewsService();