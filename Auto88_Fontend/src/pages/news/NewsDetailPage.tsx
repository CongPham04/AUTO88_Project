import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import newsService, { NewsResponse } from '@/services/newsService';
import { Skeleton } from '@/components/ui/skeleton';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

// Skeleton giữ nguyên style cũ
const NewsDetailSkeleton = () => (
  <div className="max-w-4xl mx-auto">
    <Card className="overflow-hidden animate-pulse">
      <CardHeader className="p-0">
        <Skeleton className="aspect-video w-full" />
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-5 w-1/3" />
        <div className="space-y-3">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </CardContent>
    </Card>
  </div>
);

export default function NewsDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ========================================================================
  // ✅ [THÊM MỚI] Cập nhật Title Website theo tiêu đề bài viết
  // Logic: Nếu có article -> "Tiêu đề bài viết | Auto88"
  //        Nếu chưa có -> "Chi tiết tin tức | Auto88"
  // ========================================================================
  const pageTitle = article ? article.title : 'Chi tiết tin tức';
  useDocumentTitle(pageTitle);
  // ========================================================================

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        const newsId = parseInt(id, 10);
        
        // Gọi API Public để lấy chi tiết tin tức
        const data = await newsService.getPublishedNewsById(newsId);
        setArticle(data);
      } catch (err) {
        setError('Không tải được bài viết này. Vui lòng thử lại.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Container chính rộng để chứa nút quay lại */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Nút quay lại nằm thẳng hàng bên trái */}
        <div onClick={() => navigate('/news')} className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách tin tức
        </div>

        {/* Logic 3 trạng thái */}
        {loading ? (
          // 1. Trạng thái Loading
          <NewsDetailSkeleton />
        ) : error || !article ? (
          // 2. Trạng thái Lỗi
          <div className="max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center py-20">
            <h2 className="text-xl font-semibold text-red-500 mb-4">
              {error || 'Không tìm thấy bài viết.'}
            </h2>
            <Button variant="outline" onClick={() => navigate('/news')}>
              Quay lại danh sách
            </Button>
          </div>
        ) : (
          // 3. Trạng thái có Data - Card nằm giữa màn hình (max-w-4xl)
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden shadow-md border-none">
              <CardHeader className="p-0">
                <div className="aspect-video relative bg-gray-100">
                  <ImageWithFallback
                    src={article.coverImageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-8 md:p-10">
                <CardTitle className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {article.title}
                </CardTitle>
                
                <div className="flex items-center text-sm text-gray-500 mb-8 pb-8 border-b border-gray-100">
                  <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                  <span>Đã đăng vào {formatDate(article.publishedAt || article.createdAt)}</span>
                </div>

                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed 
                             prose-headings:font-bold prose-headings:text-gray-900 
                             prose-a:text-blue-600 prose-img:rounded-lg prose-img:shadow-sm"
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}