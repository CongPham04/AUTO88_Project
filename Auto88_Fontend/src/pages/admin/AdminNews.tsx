import React, { useState, useEffect } from 'react';
import { useNewsStore } from '@/store/newsStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Pencil, Trash2, PlusCircle } from 'lucide-react';
import newsService, { News, NewsRequest, NewsStatus } from '@/services/newsService';
import { toast } from 'sonner';

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const AdminNews: React.FC = () => {
  const { newsItems, isLoading, error, fetchNews, addNews, editNews, removeNews } = useNewsStore();

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState<News | null>(null);
  const [formData, setFormData] = useState<NewsRequest>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    status: NewsStatus.DRAFT,
    coverImageFile: undefined,
  });

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreate = () => {
    setSelectedNews(null);
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      status: NewsStatus.DRAFT,
    });
    setIsFormModalOpen(true);
  };

  const handleEdit = (news: News) => {
    setSelectedNews(news);
    setFormData({
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt || '',
      content: news.content,
      status: news.status,
    });
    setIsFormModalOpen(true);
  };

  const handleViewDetails = (news: News) => {
    setSelectedNews(news);
    setIsDetailModalOpen(true);
  };

  const handleDelete = (news: News) => {
    setSelectedNews(news);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedNews) {
      await removeNews(selectedNews.newsId);
      toast.success('Bài viết đã được xóa thành công.');
      setIsDeleteDialogOpen(false);
      setSelectedNews(null);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, coverImageFile: e.target.files![0] }));
    }
  };

  const handleStatusChange = (status: NewsStatus) => {
    setFormData(prev => ({ ...prev, status }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (selectedNews) {
        await editNews(selectedNews.newsId, formData);
        toast.success('Bài viết đã được cập nhật thành công.');
      } else {
        await addNews(formData);
        toast.success('Bài viết đã được tạo thành công.');
      }
      setIsFormModalOpen(false);
    } catch {
      toast.error('Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  };

  const getStatusVariant = (status: NewsStatus) => {
    switch (status) {
      case 'PUBLISHED': return 'default';
      case 'DRAFT': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusText = (status: NewsStatus) => {
    switch (status) {
      case 'PUBLISHED': return 'Đã xuất bản';
      case 'DRAFT': return 'Bản nháp';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Tin tức</h2>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tạo bài viết mới
        </Button>
      </div>

      {isLoading && newsItems.length === 0 ? (
        <p>Đang tải danh sách tin tức...</p>
      ) : newsItems.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-gray-600">Chưa có bài viết nào.</CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ảnh</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead>Hành động</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {newsItems.map((news) => (
                  <TableRow key={news.newsId}>
                    <TableCell>
                      {news.coverImageUrl ? (
                        <img
                          src={newsService.getImageUrl(news.coverImageUrl)}
                          alt={news.title}
                          className="w-20 h-20 object-cover rounded"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                          Không có ảnh
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{news.title}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(news.status)}>{getStatusText(news.status)}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(news.createdAt)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleViewDetails(news)} title="Xem chi tiết">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEdit(news)} title="Chỉnh sửa">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(news)}
                          className="text-red-600 hover:text-red-700"
                          title="Xóa"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* === Modal thêm / chỉnh sửa === */}
      <Dialog open={isFormModalOpen} onOpenChange={setIsFormModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedNews ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleFormChange}
                required
                placeholder="Tiêu đề bài viết..."
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleFormChange}
                required
                placeholder="tieu-de-khong-dau"
              />
            </div>
            <div>
              <Label htmlFor="excerpt">Đoạn trích</Label>
              <Textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleFormChange}
                rows={3}
                placeholder="Tóm tắt ngắn gọn về nội dung bài viết..."
              />
            </div>
            <div>
              <Label htmlFor="content">Nội dung</Label>
              <Textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleFormChange}
                required
                rows={8}
                placeholder="Nội dung chi tiết của bài viết..."
              />
            </div>
            <div>
              <Label htmlFor="coverImageFile">Hình ảnh bìa</Label>
              <Input
                id="coverImageFile"
                name="coverImageFile"
                type="file"
                onChange={handleFileChange}
                placeholder="Chọn ảnh bìa cho bài viết"
              />
              {selectedNews?.coverImageUrl && (
                <p className="text-sm text-gray-500 mt-1">
                  Để trống nếu không muốn thay đổi hình ảnh.
                </p>
              )}
            </div>
            <div>
              <Label>Trạng thái</Label>
              <Select onValueChange={handleStatusChange} defaultValue={formData.status}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái bài viết" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NewsStatus.DRAFT}>Bản nháp</SelectItem>
                  <SelectItem value={NewsStatus.PUBLISHED}>Đã xuất bản</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormModalOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">
                {selectedNews ? 'Cập nhật' : 'Thêm tin tức'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* === Modal xác nhận xóa === */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bạn có chắc chắn muốn xóa?</AlertDialogTitle>
            <AlertDialogDescription>Hành động này không thể hoàn tác.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Xóa</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* === Modal xem chi tiết === */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Chi tiết bài viết</DialogTitle>
          </DialogHeader>
          {selectedNews && (
            <div className="space-y-4 py-4">
              {selectedNews.coverImageUrl && (
                <div className="flex justify-center mb-4">
                  <img
                    src={newsService.getImageUrl(selectedNews.coverImageUrl)}
                    alt={selectedNews.title}
                    className="max-w-[40%] h-auto object-contain rounded-lg shadow border"
                  />
                </div>
              )}
              <h2 className="text-2xl font-bold">{selectedNews.title}</h2>
              <div>
                <Label>Trạng thái</Label>
                <p><Badge variant={getStatusVariant(selectedNews.status)}>{getStatusText(selectedNews.status)}</Badge></p>
              </div>
              <div>
                <Label>Slug</Label>
                <p className="text-sm text-gray-600 italic">{selectedNews.slug}</p>
              </div>
              <div>
                <Label>Đoạn trích</Label>
                <p>{selectedNews.excerpt}</p>
              </div>
              <div>
                <Label>Nội dung</Label>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedNews.content }} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 border-t pt-4">
                <div>
                  <Label>Ngày tạo</Label>
                  <p>{formatDate(selectedNews.createdAt)}</p>
                </div>
                <div>
                  <Label>Cập nhật lần cuối</Label>
                  <p>{formatDate(selectedNews.updatedAt)}</p>
                </div>
                <div>
                  <Label>Ngày xuất bản</Label>
                  <p>{formatDate(selectedNews.publishedAt)}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminNews;
