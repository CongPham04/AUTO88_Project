import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from '@/components/sections/HeroSection';
import CategorySection from '@/components/sections/CategorySection';
import BrandSection from '@/components/sections/BrandSection';
import FeaturedCars from '@/components/sections/FeaturedCars';
import NewsSection from '@/components/sections/NewsSection';
import homeService from '@/services/homeService';
import { CarResponse } from '@/services/carService';
import { News as NewsResponse } from '@/services/newsService';
import { toast } from 'sonner'; 

interface FeaturedCar {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  image: string;
  condition: string;
  promotion?: string;
  inStock: boolean;
  stockCount: number;
}

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
  const [featuredCars, setFeaturedCars] = useState<FeaturedCar[]>([]);
  const [latestNews, setLatestNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const data = await homeService.getHomeSections();

        const mappedCars: FeaturedCar[] = (data.newArrivals || []).map((car: CarResponse) => ({
          id: car.carId,
          make: car.brand,
          model: car.model,
          year: car.manufactureYear,
          price: car.price,
          image: car.imageUrl,
          condition: car.status === 'AVAILABLE' ? 'Mới' : 'Đã qua sử dụng',
          inStock: car.status === 'AVAILABLE',
          stockCount: car.status === 'AVAILABLE' ? 5 : 0, 
        }));

        const mappedNews: NewsArticle[] = (data.latestNews || []).map((news: NewsResponse) => ({
          id: news.newsId,
          title: news.title,
          summary: news.excerpt,
          image: news.coverImageUrl,
          date: news.publishedAt || news.createdAt,
          category: 'Tin tức',
        }));

        setFeaturedCars(mappedCars.slice(0, 4));
        setLatestNews(mappedNews.slice(0, 2));
      } catch (err) {
        toast.error('Không tải được dữ liệu trang chủ.');
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
      {/* Component tĩnh, render ngay */}
      <HeroSection onSearch={handleSearch} />
      
      {/* Các component tự fetch, tự xử lý 3 state */}
      <CategorySection onCategoryClick={(category) => navigate(`/cars?category=${encodeURIComponent(category)}`)} />
      <BrandSection onBrandClick={(brand) => navigate(`/cars?brand=${encodeURIComponent(brand)}`)} />
      
      {/* Truyền isLoading cho component con */}
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