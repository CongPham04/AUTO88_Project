import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, User, Search, Filter, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// [THÊM MỚI] Import component Pagination
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import newsService, { News } from '@/services/newsService';
import { Skeleton } from '@/components/ui/skeleton';

// [THÊM MỚI] Định nghĩa số tin tức mỗi trang
const NEWS_PER_PAGE = 6;

// Skeleton cho thẻ tin tức nhỏ
const SkeletonNewsCard = () => (
  <Card>
    <CardContent className="p-0">
      <Skeleton className="w-full h-48 rounded-t-lg" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/4 mt-2" />
      </div>
    </CardContent>
  </Card>
);

// Skeleton cho bài viết nổi bật (featured)
const SkeletonFeaturedCard = () => (
  <Card className="mb-8 overflow-hidden">
    <div className="grid grid-cols-1 lg:grid-cols-2">
      <Skeleton className="aspect-video lg:aspect-auto h-full min-h-64 w-full" />
      <div className="p-8 space-y-4">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  </Card>
);

// Skeleton cho toàn bộ trang danh sách tin tức
const NewsPageSkeleton = () => (
  <div className="animate-pulse">
    {/* Tiêu đề */}
    <div className="text-center mb-12">
      <Skeleton className="h-9 w-1/3 mx-auto mb-4" />
      <Skeleton className="h-5 w-3/5 mx-auto" />
    </div>
    {/* Thanh filter */}
    <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-10 w-48" />
    </div>
    {/* Bài viết nổi bật */}
    <SkeletonFeaturedCard />
    {/* Lưới bài viết */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <SkeletonNewsCard />
      <SkeletonNewsCard />
      <SkeletonNewsCard />
      {/* [SỬA ĐỔI] Thêm 3 skeleton nữa cho đủ 6 tin */}
      <SkeletonNewsCard />
      <SkeletonNewsCard />
      <SkeletonNewsCard />
    </div>
  </div>
);


export default function NewsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams(); // [THÊM MỚI]
  const [news, setNews] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // [THAY ĐỔI] Đọc state từ URL params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  
  // [THÊM MỚI] Lấy trang hiện tại từ URL
  const currentPage = Number(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const newsData = await newsService.getAllNews();
        setNews(newsData);
        setError(null);
      } catch (err) {
        setError('Không tải được dữ liệu tin tức.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const categories = ['all', 'Ra mắt xe mới', 'Khuyến mãi', 'Đánh giá xe', 'Tin tức'];

  // [THAY ĐỔI] Cập nhật bộ lọc để reset trang
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    const newParams = new URLSearchParams(searchParams);
    if (term) {
      newParams.set('q', term);
    } else {
      newParams.delete('q');
    }
    newParams.delete('page'); // Reset trang về 1
    setSearchParams(newParams);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category && category !== 'all') {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    newParams.delete('page'); // Reset trang về 1
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo(0, 0); // Cuộn lên đầu trang
  };

  // [THÊM MỚI] Dùng useMemo để tính toán danh sách tin
  const filteredNews = useMemo(() => {
    return news.filter((article) => {
      const categoryMatch = selectedCategory === 'all' || article.slug.includes(selectedCategory.toLowerCase());
      const searchMatch = searchTerm === '' ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      return categoryMatch && searchMatch;
    });
  }, [news, searchTerm, selectedCategory]);

  const featuredArticle = useMemo(() => filteredNews[0] || null, [filteredNews]);
  const remainingArticles = useMemo(() => filteredNews.slice(1), [filteredNews]);
  
  const totalPages = useMemo(() => {
    return Math.ceil(remainingArticles.length / NEWS_PER_PAGE);
  }, [remainingArticles]);

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    return remainingArticles.slice(startIndex, endIndex);
  }, [remainingArticles, currentPage]);


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          // 1. Trạng thái Loading
          <NewsPageSkeleton />
        ) : error ? (
          // 2. Trạng thái Lỗi
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-12">
             <p className="text-lg text-red-600 mb-4">{error}</p>
             <Button onClick={() => window.location.reload()} variant="outline">
               Tải lại trang
             </Button>
          </div>
        ) : (
          // 3. Trạng thái Data / Rỗng (Đã tải xong)
          <>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Tin tức & Khuyến mãi
              </h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Cập nhật những tin tức mới nhất về ô tô và các chương trình ưu đãi hấp dẫn từ Auto 88
              </p>
            </div>

            {/* Search and filter */}
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm tin tức..."
                    value={searchTerm}
                    // [THAY ĐỔI] Dùng handler mới
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả danh mục</SelectItem>
                    {categories.slice(1).map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* [THAY ĐỔI] Kiểm tra bằng 'featuredArticle' */}
            {featuredArticle ? (
              <>
                {/* Featured article */}
                <Card 
                  className="mb-8 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/news/${featuredArticle.newsId}`)}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="aspect-video lg:aspect-auto overflow-hidden">
                      <ImageWithFallback
                        src={featuredArticle.coverImageUrl}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-8">
                      <div className="flex items-center space-x-4 mb-4">
                        <Badge
                          variant={featuredArticle.slug.includes('khuyen-mai') ? 'destructive' : 'secondary'}
                        >
                          {featuredArticle.slug.includes('khuyen-mai') ? 'Khuyến mãi' : 'Tin tức'}
                        </Badge>
                        <div className="flex items-center text-gray-600 text-sm">
                          <Calendar className="w-4 h-4 mr-2" />
                          {formatDate(featuredArticle.publishedAt || featuredArticle.createdAt)}
                        </div>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 hover:text-red-600 transition-colors">
                        {featuredArticle.title}
                      </h2>
                      <p className="text-gray-600 mb-6 line-clamp-3">
                        {featuredArticle.excerpt}
                      </p>
                      <Button variant="outline" 
                        onClick={(e) => {
                          e.stopPropagation(); // Ngăn card click
                          navigate(`/news/${featuredArticle.newsId}`)
                        }}
                      >
                        Đọc thêm →
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* [THAY ĐỔI] News grid dùng 'paginatedArticles' */}
                {paginatedArticles.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedArticles.map((article) => (
                      <Card
                        key={article.newsId}
                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/news/${article.newsId}`)}
                      >
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden rounded-t-lg">
                            <ImageWithFallback
                              src={article.coverImageUrl}
                              alt={article.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-4 left-4">
                              <Badge
                                variant={article.slug.includes('khuyen-mai') ? 'destructive' : 'secondary'}
                              >
                                {article.slug.includes('khuyen-mai') ? 'Khuyến mãi' : 'Tin tức'}
                              </Badge>
                            </div>
                          </div>

                          <div className="p-6">
                            <div className="flex items-center text-sm text-gray-500 mb-3">
                              <Calendar className="w-4 h-4 mr-2" />
                              {formatDate(article.publishedAt || article.createdAt)}
                            </div>

                            <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                              {article.title}
                            </h3>

                            <p className="text-gray-600 mb-4 line-clamp-3">
                              {article.excerpt}
                            </p>

                            <Button 
                              variant="ghost" 
                              className="p-0 h-auto text-red-600 hover:text-red-700"
                              onClick={(e) => {
                                e.stopPropagation(); // Ngăn card click
                                navigate(`/news/${article.newsId}`)
                              }}
                            >
                              Đọc thêm →
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
                
                {/* [THÊM MỚI] Dàn trang */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Trang trước"
                          >
                            <PaginationPrevious className="cursor-pointer" />
                          </Button>
                        </PaginationItem>
                        
                        <PaginationItem>
                          <span className="font-medium text-sm px-4 py-2 border rounded-md bg-white">
                            Trang {currentPage} / {totalPages}
                          </span>
                        </PaginationItem>

                        <PaginationItem>
                          <Button
                            variant="ghost"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Trang sau"
                          >
                            <PaginationNext className="cursor-pointer" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              // Trạng thái Rỗng (khi lọc không có kết quả)
              <div className="text-center py-12 min-h-96 flex flex-col items-center justify-center">
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Không tìm thấy bài viết nào
                </h3>
                <p className="text-gray-600 mb-6">
                  Thử thay đổi từ khóa tìm kiếm hoặc danh mục để có kết quả tốt hơn.
                </p>
                <Button onClick={() => {
                  handleSearchChange('');
                  handleCategoryChange('all');
                }}>
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}