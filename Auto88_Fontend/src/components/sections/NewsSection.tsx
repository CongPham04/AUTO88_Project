import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton'; 

interface News {
  id: number;
  title: string;
  summary: string;
  image: string;
  date: string;
  category: string;
}

interface NewsSectionProps {
  news: News[];
  onReadMore: (newsId: number) => void;
  isLoading: boolean; 
}

const SkeletonNewsCard = () => (
  <Card>
    <CardContent className="p-0">
      <Skeleton className="w-full h-48 rounded-t-lg" />
      <div className="p-6 space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-5 w-1/4 mt-2" />
      </div>
    </CardContent>
  </Card>
);

export default function NewsSection({ news, onReadMore, isLoading }: NewsSectionProps) {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-1/3 mx-auto mb-2" />
              <Skeleton className="h-5 w-3/5 mx-auto" />
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Tin tức & Khuyến mãi</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Cập nhật những tin tức mới nhất về ô tô và các chương trình ưu đãi hấp dẫn</p>
            </>
          )}
        </div>
        
        {/* [SỬA LỖI] Bắt đầu logic 3 trạng thái TỪ ĐÂY */}

        {isLoading ? (
          // 1. Trạng thái Loading: Hiển thị grid với skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-96">
            <SkeletonNewsCard />
            <SkeletonNewsCard />
          </div>
        ) : news.length > 0 ? (
          // 2. Trạng thái có Data: Hiển thị grid với news
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 min-h-96">
            {news.map((article) => (
              <Card key={article.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <ImageWithFallback src={article.image} alt={article.title} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-4 left-4">
                      <Badge variant={article.category === 'Khuyến mãi' ? 'destructive' : 'secondary'}>{article.category}</Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-3">
                      <Calendar className="w-4 h-4 mr-2" />
                      {formatDate(article.date)}
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">{article.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{article.summary}</p>
                    <Button variant="ghost" className="p-0 h-auto text-red-600 hover:text-red-700" onClick={() => onReadMore(article.id)}>
                      Đọc thêm
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // 3. Trạng thái Rỗng: Hiển thị 1 div riêng, CĂN GIỮA
          <div className="min-h-96 flex items-center justify-center text-center py-10 text-gray-500">
            <p>Hiện chưa có tin tức nào.</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => onReadMore(0)}>
            Xem tất cả tin tức
          </Button>
        </div>
      </div>
    </section>
  );
}