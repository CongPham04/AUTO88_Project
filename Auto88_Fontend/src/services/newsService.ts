import apiClient, {BASE_URL} from '@/lib/apiClient';

// ==================== Enums and Types ====================

export enum NewsStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
}

export interface News {
  newsId: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImageUrl: string; // chỉ lưu tên file, không chứa full URL
  status: NewsStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NewsRequest {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  status: NewsStatus;
  coverImageFile?: File;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ==================== News Service Class ====================

class NewsService {
  // private readonly BASE_URL = 'http://localhost:8080/carshop/api/news';

  /**
   * Lấy danh sách tất cả bài viết
   */
  async getAllNews(): Promise<News[]> {
    const response = await apiClient.get<ApiResponse<News[]>>('/news');
    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể lấy danh sách tin tức');
  }

  /**
   * Lấy chi tiết 1 bài viết theo ID
   */
  async getNewsById(id: number): Promise<News> {
    const response = await apiClient.get<ApiResponse<News>>(`/news/${id}`);
    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể lấy chi tiết tin tức');
  }

  /**
   * Tạo mới bài viết
   */
  async createNews(newsData: NewsRequest): Promise<News> {
    const formData = new FormData();
    formData.append('title', newsData.title);
    formData.append('slug', newsData.slug);
    formData.append('content', newsData.content);
    formData.append('status', newsData.status);

    if (newsData.excerpt) formData.append('excerpt', newsData.excerpt);
    if (newsData.coverImageFile) formData.append('coverImageFile', newsData.coverImageFile);

    const response = await apiClient.post<ApiResponse<News>>('/news', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if ([200, 201].includes(response.data.code)) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể tạo bài viết');
  }

  /**
   * Cập nhật bài viết
   */
  async updateNews(id: number, newsData: Partial<NewsRequest>): Promise<News> {
    const formData = new FormData();

    if (newsData.title) formData.append('title', newsData.title);
    if (newsData.slug) formData.append('slug', newsData.slug);
    if (newsData.content) formData.append('content', newsData.content);
    if (newsData.status) formData.append('status', newsData.status);
    if (newsData.excerpt) formData.append('excerpt', newsData.excerpt);
    if (newsData.coverImageFile) formData.append('coverImageFile', newsData.coverImageFile);

    const response = await apiClient.put<ApiResponse<News>>(`/news/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    if (response.data.code === 200) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Không thể cập nhật bài viết');
  }

  /**
   * Xóa bài viết
   */
  async deleteNews(id: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/news/${id}`);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Không thể xóa bài viết');
    }
  }

  /**
   * Tạo URL ảnh chính xác (tránh trùng lặp /image/)
   * → backend chỉ trả về tên file, ví dụ: "1739261487380_cover.jpg"
   */
  getImageUrl(filename: string | null | undefined): string {
    if (!filename) return '/default-news.jpg'; // fallback ảnh mặc định
    // Nếu backend đã trả về URL đầy đủ → giữ nguyên
    if (filename.startsWith('http')) return filename;
    // Nếu chỉ là tên file → ghép vào endpoint ảnh
    return `${BASE_URL}/image/${filename}`;
  }
}

export default new NewsService();
