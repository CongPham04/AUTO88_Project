import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/components/sections/HeroSection';
import CategorySection from '@/components/sections/CategorySection';
import BrandSection from '@/components/sections/BrandSection';
import FeaturedCars from '@/components/sections/FeaturedCars';
import NewsSection from '@/components/sections/NewsSection';
import homeService from '@/services/homeService';
import { CarResponse } from '@/services/carService';
import newsService, { NewsResponse } from '@/services/newsService'; // ✅ Sửa import đúng Type và Service
import { toast } from 'sonner'; 

// Interface nội bộ cho NewsSection (nếu component con yêu cầu cấu trúc khác)
// Tuy nhiên tốt nhất là nên refactor NewsSection để nhận NewsResponse luôn.
// Ở đây mình sẽ map sang cấu trúc NewsSection đang dùng.
interface NewsArticle {
  id: number;
  title: string;
  summary: string;
  image: string;
  date: string;
  category: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [featuredCars, setFeaturedCars] = useState<CarResponse[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        
        // Gọi song song 2 API: Home Data (cho xe) và News Public (cho tin tức)
        const [homeData, newsData] = await Promise.all([
             homeService.getHomeSections(),
             newsService.getPublishedNews() // ✅ Gọi API Public lấy tin đã xuất bản
        ]);

        // 1. Xử lý Xe nổi bật
        const carsData = homeData.newArrivals || [];
        setFeaturedCars(carsData.slice(0, 4));

        // 2. Xử lý Tin tức mới nhất
        const mappedNews: NewsArticle[] = newsData.slice(0, 4).map((news: NewsResponse) => ({
          id: news.newsId,
          title: news.title,
          summary: news.excerpt,
          image: news.coverImageUrl || '', // Đã là full URL từ BE
          date: news.publishedAt || news.createdAt,
          category: 'Tin tức', // Mặc định
        }));

        setLatestNews(mappedNews);
      } catch (err) {
        // toast.error('Không tải được dữ liệu trang chủ.'); // Có thể bỏ qua lỗi này để không làm phiền user
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearch = (term: string, category?: string) => {
    const params = new URLSearchParams();
    if (term) params.set('q', term);
    if (category && category !== 'all') params.set('category', category);
    navigate(`/cars?${params.toString()}`);
  };

  return (
    <div>
      <HeroSection onSearch={handleSearch} />
      <CategorySection onCategoryClick={(category) => navigate(`/cars?category=${encodeURIComponent(category)}`)} />
      <BrandSection onBrandClick={(brand) => navigate(`/cars?brand=${encodeURIComponent(brand)}`)} />
      
      <FeaturedCars
        cars={featuredCars}
        isLoading={loading} 
        onViewDetails={(id) => id ? navigate(`/cars/${id}`) : navigate('/cars')}
      />
      
      <NewsSection
        news={latestNews}
        isLoading={loading} 
        onReadMore={(id) => id ? navigate(`/news/${id}`) : navigate('/news')}
      />
    </div>
  );
}