import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import newsService, { News } from '@/services/newsService';
import { Skeleton } from '@/components/ui/skeleton'; // [SỬA ĐỔI] Thêm import

// [SỬA ĐỔI] Tạo Skeleton cho trang chi tiết
const NewsDetailSkeleton = () => (
  // [SỬA ĐỔI] Đặt skeleton trong max-w-4xl để khớp với nội dung
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
  const [article, setArticle] = useState<News | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null); // Reset lỗi
        const newsId = parseInt(id, 10);
        const data = await newsService.getNewsById(newsId);
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

  // [SỬA LỖI] Xóa bỏ các 'if (loading)', 'if (error)', 'if (!article)'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* [SỬA LỖI] 1. Đổi container chính thành 'max-w-7xl' */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* [SỬA LỖI] 2. Nút quay lại giờ nằm trong container 7xl, thẳng hàng với logo */}
        <Button variant="ghost" onClick={() => navigate('/news')} className="mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách tin tức
        </Button>

        {/* [SỬA LỖI] Bắt đầu logic 3 trạng thái */}
        {loading ? (
          // 1. Trạng thái Loading
          <NewsDetailSkeleton />
        ) : error || !article ? (
          // 2. Trạng thái Lỗi hoặc không tìm thấy
          // [SỬA LỖI] Bọc lỗi trong 'max-w-4xl' để nó căn giữa
          <div className="max-w-4xl mx-auto min-h-[60vh] flex flex-col items-center justify-center text-center py-20">
            <h2 className="text-xl font-semibold text-red-500 mb-4">
              {error || 'Không tìm thấy bài viết.'}
            </h2>
            <Button variant="outline" onClick={() => navigate('/news')}>
              Quay lại danh sách
            </Button>
          </div>
        ) : (
          // 3. Trạng thái có Data
          // [SỬA LỖI] 3. Bọc nội dung Card trong 'max-w-4xl' để giữ nó ở giữa
          <div className="max-w-4xl mx-auto">
            <Card className="overflow-hidden">
              <CardHeader className="p-0">
                <div className="aspect-video relative">
                  <ImageWithFallback
                    src={article.coverImageUrl}
                    alt={article.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <CardTitle className="text-3xl font-bold text-gray-900 mb-4">{article.title}</CardTitle>
                <div className="flex items-center text-sm text-gray-500 mb-6">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Đã đăng vào {formatDate(article.publishedAt || article.createdAt)}</span>
                </div>
                <div
                  className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
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