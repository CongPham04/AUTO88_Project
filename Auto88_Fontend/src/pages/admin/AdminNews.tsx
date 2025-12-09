import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Search, Edit, Trash2, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import newsService, { NewsResponse, NewsStatus } from '@/services/newsService';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

const NewsTableSkeleton = () => (
  <>
    {[...Array(10)].map((_, i) => (
      <tr key={i} className="border-b">
        <td className="p-4"><Skeleton className="h-16 w-24 rounded" /></td>
        <td className="p-4 w-1/3"><Skeleton className="h-4 w-full mb-2" /><Skeleton className="h-3 w-2/3" /></td>
        <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
        <td className="p-4"><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
      </tr>
    ))}
  </>
);

export default function AdminNews() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialPage = parseInt(searchParams.get('page') || '1', 10); // ✅ Lấy page từ URL

  const [newsList, setNewsList] = useState<NewsResponse[]>([]);
  const [filteredNews, setFilteredNews] = useState<NewsResponse[]>([]);
  const [paginatedNews, setPaginatedNews] = useState<NewsResponse[]>([]); // ✅ Data đã phân trang
  
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 10; // ✅ Cố định 10 bài viết/trang

  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await newsService.getAllNews();
      // Sort mới nhất lên đầu
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setNewsList(sorted);
      setFilteredNews(sorted);
    } catch (error) {
      toast.error('Lỗi tải danh sách tin tức');
    } finally {
      setLoading(false);
    }
  };

  // Client-side Filtering Logic
  useEffect(() => {
    let result = newsList;
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(n => n.title.toLowerCase().includes(lowerTerm));
    }
    setFilteredNews(result);
    setCurrentPage(1); // Reset về trang 1 khi search
  }, [newsList, searchTerm]);

  // ✅ Pagination Logic: Cắt mảng filteredNews theo trang hiện tại
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedNews(filteredNews.slice(startIndex, endIndex));
  }, [filteredNews, currentPage]);

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await newsService.deleteNews(deleteId);
      toast.success('Xoá bài viết thành công');
      setNewsList(prev => prev.filter(n => n.newsId !== deleteId));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Không thể xoá bài viết');
    }
  };

  // ✅ Xử lý chuyển trang
  const totalPages = Math.ceil(filteredNews.length / itemsPerPage);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', newPage.toString());
        return newParams;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-800 shrink-0">Quản Lý Tin Tức</h2>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 min-w-[200px] border border-gray-300 rounded-md bg-white shadow-sm py-2.5">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Tìm kiếm tiêu đề..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => navigate('/admin/news/create')} className="bg-black text-white hover:bg-gray-800">
            <Plus className="w-4 h-4 mr-2" /> Viết bài mới
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Ảnh bìa</th>
                  <th className="p-4 font-semibold text-gray-600">Tiêu đề / Tóm tắt</th>
                  <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                  <th className="p-4 font-semibold text-gray-600">Ngày tạo</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <NewsTableSkeleton /> : paginatedNews.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-10 text-gray-500">Chưa có bài viết nào.</td></tr>
                ) : paginatedNews.map((news) => (
                  <tr key={news.newsId} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <ImageWithFallback 
                        src={news.coverImageUrl} 
                        alt="cover" 
                        className="w-24 h-16 object-cover rounded border bg-gray-100" 
                      />
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="font-bold text-gray-900 line-clamp-1" title={news.title}>{news.title}</div>
                      <div className="text-xs text-gray-500 mt-1 line-clamp-2">{news.excerpt || 'Không có tóm tắt'}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={news.status === NewsStatus.PUBLISHED ? 'default' : 'secondary'} className={news.status === NewsStatus.PUBLISHED ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400'}>
                        {news.status === NewsStatus.PUBLISHED ? 'Đã xuất bản' : 'Bản nháp'}
                      </Badge>
                    </td>
                    <td className="p-4 text-gray-600">
                      {new Date(news.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/news/view/${news.newsId}`)}>
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => navigate(`/admin/news/edit/${news.newsId}`)}>
                          <Edit className="h-4 w-4 text-gray-600" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => { setDeleteId(news.newsId); setIsDeleteDialogOpen(true); }}>
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ PAGINATION UI */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50">
              <div className="text-xs text-gray-500 mt-2">
                Hiển thị <strong>{paginatedNews.length}</strong> trên tổng số <strong>{filteredNews.length}</strong> bài viết
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 px-2 mt-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                     let p = i + 1;
                     if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + i;
                     if (p > totalPages) return null;
                     
                     return (
                      <Button
                        key={p}
                        variant={p === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        className={`h-8 w-8 ${p === currentPage ? "bg-black text-white pointer-events-none" : "hover:bg-gray-100"}`}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-8 px-2 mt-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bài viết?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác. Bài viết sẽ bị xoá vĩnh viễn.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Huỷ</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white">Xoá</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}