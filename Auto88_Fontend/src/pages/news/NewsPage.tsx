import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Calendar, Search, Filter, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import newsService, { NewsResponse } from '@/services/newsService';
import { Skeleton } from '@/components/ui/skeleton';

const NEWS_PER_PAGE = 6;

// Skeleton Cards (Giữ nguyên style cũ)
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

const NewsPageSkeleton = () => (
  <div className="animate-pulse">
    <div className="text-center mb-12">
      <Skeleton className="h-9 w-1/3 mx-auto mb-4" />
      <Skeleton className="h-5 w-3/5 mx-auto" />
    </div>
    <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-10 w-48" />
    </div>
    <SkeletonFeaturedCard />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => <SkeletonNewsCard key={i} />)}
    </div>
  </div>
);

export default function NewsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [news, setNews] = useState<NewsResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const currentPage = Number(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        // Gọi API Public: Lấy danh sách tin đã xuất bản
        const newsData = await newsService.getPublishedNews();
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

  // Handlers
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
    const newParams = new URLSearchParams(searchParams);
    if (term) newParams.set('q', term);
    else newParams.delete('q');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    const newParams = new URLSearchParams(searchParams);
    if (category && category !== 'all') newParams.set('category', category);
    else newParams.delete('category');
    newParams.delete('page');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo(0, 0);
  };

  // Filtering & Pagination
  const filteredNews = useMemo(() => {
    return news.filter((article) => {
      // Vì BE chưa có category, ta giả lập logic filter category dựa trên slug/title nếu cần
      // Hoặc chỉ cần filter theo searchTerm là đủ
      const categoryMatch = selectedCategory === 'all' || 
                            article.slug.includes(selectedCategory.toLowerCase()) || // Giả lập
                            true; // Tạm thời cho qua nếu không có logic category
      
      const searchMatch = searchTerm === '' ||
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
        
      return categoryMatch && searchMatch;
    });
  }, [news, searchTerm, selectedCategory]);

  const featuredArticle = useMemo(() => filteredNews[0] || null, [filteredNews]);
  const remainingArticles = useMemo(() => filteredNews.slice(1), [filteredNews]);
  
  const totalPages = useMemo(() => Math.ceil(remainingArticles.length / NEWS_PER_PAGE), [remainingArticles]);

  const paginatedArticles = useMemo(() => {
    const startIndex = (currentPage - 1) * NEWS_PER_PAGE;
    const endIndex = startIndex + NEWS_PER_PAGE;
    return remainingArticles.slice(startIndex, endIndex);
  }, [remainingArticles, currentPage]);

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <NewsPageSkeleton />
        ) : error ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-12">
             <p className="text-lg text-red-600 mb-4">{error}</p>
             <Button onClick={() => window.location.reload()} variant="outline">Tải lại trang</Button>
          </div>
        ) : (
          <>
            <div className="text-center mb-12">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Tin tức & Khuyến mãi</h1>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Những tin tức mới nhất về thị trường ô tô và các chương trình ưu đãi hấp dẫn từ Auto 88
              </p>
            </div>

            {/* Filter Toolbar (Giữ nguyên style cũ) */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="relative flex-1 max-w-md w-full">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm tin tức..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Content Area */}
            {featuredArticle ? (
              <>
                {/* Featured Article (Style cũ: Card có viền, shadow) */}
                <Card 
                  className="mb-8 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/news/${featuredArticle.newsId}`)}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="aspect-video lg:aspect-auto overflow-hidden relative group">
                      <ImageWithFallback
                        src={featuredArticle.coverImageUrl}
                        alt={featuredArticle.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <div className="flex items-center space-x-4 mb-4">
                         <Badge variant="destructive">Nổi bật</Badge>
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
                      <Button variant="outline" className="w-fit" onClick={(e) => { e.stopPropagation(); navigate(`/news/${featuredArticle.newsId}`) }}>
                        Đọc thêm <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* News Grid (Style cũ: Card có viền, shadow) */}
                {paginatedArticles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {paginatedArticles.map((article) => (
                      <Card
                        key={article.newsId}
                        className="group hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
                        onClick={() => navigate(`/news/${article.newsId}`)}
                      >
                         <CardContent className="p-0 flex flex-col flex-1">
                            <div className="relative overflow-hidden rounded-t-lg aspect-[16/10]">
                              <ImageWithFallback
                                src={article.coverImageUrl}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute top-4 left-4">
                                <Badge variant="secondary">Tin tức</Badge>
                              </div>
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                              <div className="flex items-center text-sm text-gray-500 mb-3">
                                <Calendar className="w-4 h-4 mr-2" />
                                {formatDate(article.publishedAt || article.createdAt)}
                              </div>

                              <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors line-clamp-2">
                                {article.title}
                              </h3>

                              <p className="text-gray-600 mb-4 line-clamp-3 flex-1 text-sm">
                                {article.excerpt}
                              </p>

                              <div className="flex items-center text-red-600 font-medium mt-auto group-hover:translate-x-2 transition-transform duration-300">
                                Đọc tiếp <ArrowRight className="w-4 h-4 ml-1" />
                              </div>
                            </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                    <div className="text-center py-12 text-gray-500">Không tìm thấy bài viết nào khác.</div>
                )}
                
                {/* Pagination (Giữ nguyên logic) */}
                {totalPages > 1 && (
                  <div className="mt-16 flex justify-center" style={{ marginTop: '2rem' }} /* 6rem = 96px */>
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button variant="ghost" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                            <PaginationPrevious />
                          </Button>
                        </PaginationItem>
                        <PaginationItem>
                          <span className="px-4 py-2 border rounded-md bg-white text-sm font-medium mx-2">
                            Trang {currentPage} / {totalPages}
                          </span>
                        </PaginationItem>
                        <PaginationItem>
                          <Button variant="ghost" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                            <PaginationNext />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              // Empty State
              <div className="text-center py-20 flex flex-col items-center">
                <Search className="w-16 h-16 text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900">Không tìm thấy tin tức nào</h3>
                <p className="text-gray-500 mt-2">Vui lòng thử lại với từ khóa khác hoặc xóa bộ lọc.</p>
                <Button onClick={() => { setSearchTerm(''); setSelectedCategory('all'); }} className="mt-6" variant="outline">
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