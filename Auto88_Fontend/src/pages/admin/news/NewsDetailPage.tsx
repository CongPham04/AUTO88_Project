import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Clock, FileText, Globe, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import newsService, { NewsResponse, NewsStatus } from '@/services/newsService';

export default function NewsDetailPage() {
  const { newsId } = useParams();
  const navigate = useNavigate();
  const [news, setNews] = useState<NewsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (newsId) {
      newsService.getNewsById(Number(newsId))
        .then(setNews)
        .catch(() => navigate('/admin/news'))
        .finally(() => setLoading(false));
    }
  }, [newsId, navigate]);

  if (loading) return (
    <div className="max-w-6xl mx-auto py-8 px-6">
       <Skeleton className="h-8 w-48 mb-6" />
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
             <Skeleton className="h-64 w-full rounded-xl" />
             <Skeleton className="h-96 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
             <Skeleton className="h-48 w-full rounded-xl" />
          </div>
       </div>
    </div>
  );

  if (!news) return <div className="text-center py-20 text-gray-500">Không tìm thấy bài viết</div>;

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6 pb-10">
        
        {/* HEADER NAVIGATION */}
        <div className="flex flex-col space-y-2 mb-6">
            <div 
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors" 
              onClick={() => navigate('/admin/news')}
            >
              <ArrowLeft className="w-4 h-4" /> <span>Quay lại danh sách</span>
            </div>
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    Chi tiết bài viết #{news.newsId}
                    <Badge variant={news.status === NewsStatus.PUBLISHED ? 'default' : 'secondary'} className={`text-xs font-normal px-2 py-0.5 border-none ${news.status === NewsStatus.PUBLISHED ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-500'}`}>
                        {news.status === NewsStatus.PUBLISHED ? 'Đã xuất bản' : 'Bản nháp'}
                    </Badge>
                </h1>
                <Button onClick={() => navigate(`/admin/news/edit/${newsId}`)} className="bg-black text-white hover:bg-gray-800">
                    <Edit className="w-4 h-4 mr-2" /> Chỉnh sửa
                </Button>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- LEFT COLUMN (2/3): CONTENT --- */}
            <div className="lg:col-span-2 space-y-6">
                
                {/* Main Content Card */}
                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="pb-4 border-b bg-white">
                        <CardTitle className="text-xl leading-tight font-bold text-gray-900">
                            {news.title}
                        </CardTitle>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        {/* Cover Image (Thu nhỏ lại) */}
                        {news.coverImageUrl && (
                            <div className="relative w-full max-w-lg mx-auto aspect-video rounded-lg overflow-hidden border bg-gray-50 shadow-sm">
                                <ImageWithFallback 
                                    src={newsService.getImageUrl(news.coverImageUrl)} 
                                    alt={news.title}
                                    className="w-full h-full object-cover" 
                                />
                                <div className="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm flex items-center gap-1">
                                    <ImageIcon className="w-3 h-3" /> Ảnh bìa
                                </div>
                            </div>
                        )}

                        {/* Excerpt */}
                        {news.excerpt && (
                            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-md text-blue-900 italic text-base">
                                {news.excerpt}
                            </div>
                        )}

                        <Separator />

                        {/* HTML Content */}
                        <div className="prose prose-slate max-w-none">
                            <div dangerouslySetInnerHTML={{ __html: news.content }} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* --- RIGHT COLUMN (1/3): META INFO --- */}
            <div className="space-y-6">
                
                {/* Publication Info */}
                <Card className="border-none shadow-sm h-fit sticky top-6">
                    <CardHeader className="pb-3 border-b bg-gray-50/50">
                        <CardTitle className="text-base flex items-center gap-2 text-gray-700">
                            <FileText className="w-4 h-4"/> Thông tin xuất bản
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4 text-sm">
                        <div>
                            <p className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                                <Globe className="w-3 h-3" /> Slug (URL)
                            </p>
                            <p className="text-blue-600 font-mono bg-blue-50 p-2 rounded text-xs break-all">
                                /{news.slug}
                            </p>
                        </div>
                        
                        <Separator />

                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4"/> Ngày tạo</span>
                                <span className="font-medium text-gray-900">{new Date(news.createdAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 flex items-center gap-2"><Clock className="w-4 h-4"/> Cập nhật cuối</span>
                                <span className="font-medium text-gray-900">{new Date(news.updatedAt).toLocaleDateString('vi-VN')}</span>
                            </div>
                            {news.publishedAt && (
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-500 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600"/> Xuất bản</span>
                                    <span className="font-medium text-green-700">{new Date(news.publishedAt).toLocaleDateString('vi-VN')}</span>
                                </div>
                            )}
                        </div>

                        <Button variant="outline" className="w-full mt-2" onClick={() => window.open(`/news/${news.slug || news.newsId}`, '_blank')}>
                            <LinkIcon className="w-4 h-4 mr-2" /> Xem trên trang chủ
                        </Button>
                    </CardContent>
                </Card>
            </div>

        </div>
      </div>
    </div>
  );
}

// Icon CheckCircle dùng tạm nếu chưa import
function CheckCircle(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
}