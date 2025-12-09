import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import newsService, { NewsRequest, NewsStatus } from '@/services/newsService';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

interface NewsFormPageProps {
  mode: 'create' | 'edit';
}

export default function NewsFormPage({ mode }: NewsFormPageProps) {
  const navigate = useNavigate();
  const { newsId } = useParams();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === 'edit');
  
  const [formData, setFormData] = useState<NewsRequest>({
    title: '', slug: '', excerpt: '', content: '', status: NewsStatus.DRAFT,
  });
  const [previewImage, setPreviewImage] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  useEffect(() => {
    if (mode === 'edit' && newsId) {
      newsService.getNewsById(Number(newsId))
        .then(data => {
          setFormData({
            title: data.title,
            slug: data.slug,
            excerpt: data.excerpt,
            content: data.content,
            status: data.status,
          });
          setPreviewImage(data.coverImageUrl);
        })
        .catch(() => navigate('/admin/news'))
        .finally(() => setFetching(false));
    }
  }, [mode, newsId, navigate]);

  // Auto generate slug
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ ...prev, title }));
    if (mode === 'create') {
        const slug = title.toLowerCase()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d").replace(/[^a-z0-9\s]/g, "").trim().replace(/\s+/g, "-");
        setFormData(prev => ({ ...prev, slug }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return toast.warning('Vui lòng nhập tiêu đề và nội dung');

    setLoading(true);
    try {
      const payload = { ...formData, coverImageFile: imageFile };
      if (mode === 'create') {
        await newsService.createNews(payload);
        toast.success('Tạo bài viết thành công');
      } else {
        await newsService.updateNews(Number(newsId), payload);
        toast.success('Cập nhật thành công');
      }
      navigate('/admin/news');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin text-gray-400" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 py-4 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 cursor-pointer w-fit mb-2" onClick={() => navigate('/admin/news')}>
        <ArrowLeft className="w-4 h-4" /> Quay lại danh sách tin tức
      </div>
      <h1 className="text-2xl font-bold">{mode === 'create' ? 'Viết bài mới' : 'Chỉnh sửa bài viết'}</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
            <Card>
                <CardHeader><CardTitle>Nội dung chính</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Tiêu đề bài viết <span className="text-red-500">*</span></Label>
                        <Input value={formData.title} onChange={handleTitleChange} placeholder="Nhập tiêu đề..." required />
                    </div>
                    <div className="space-y-2">
                        <Label>Slug (URL) <span className="text-red-500">*</span></Label>
                        <Input value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Tóm tắt (Excerpt)</Label>
                        <Textarea value={formData.excerpt} onChange={e => setFormData({...formData, excerpt: e.target.value})} rows={3} placeholder="Mô tả ngắn gọn..." />
                    </div>
                    <div className="space-y-2">
                        <Label>Nội dung chi tiết (HTML/Text) <span className="text-red-500">*</span></Label>
                        <Textarea value={formData.content} onChange={e => setFormData({...formData, content: e.target.value})} className="min-h-[300px] font-mono text-sm" placeholder="Nhập nội dung bài viết..." required />
                        <p className="text-xs text-gray-500">Hỗ trợ nhập HTML cơ bản.</p>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Ảnh bìa (Cover)</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative aspect-video bg-gray-100 rounded-md overflow-hidden border flex items-center justify-center">
                        {previewImage ? (
                            <ImageWithFallback src={previewImage} className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-gray-400 flex flex-col items-center">
                                <ImageIcon className="w-8 h-8 mb-2" />
                                <span className="text-xs">Chưa có ảnh</span>
                            </div>
                        )}
                    </div>
                    <Label htmlFor="cover-upload" className="cursor-pointer inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        Chọn ảnh
                        <input id="cover-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </Label>
                </CardContent>
            </Card>
            <Card>
                <CardHeader><CardTitle>Xuất bản</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Trạng thái</Label>
                        <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v as NewsStatus})}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NewsStatus.DRAFT}>Bản nháp</SelectItem>
                                <SelectItem value={NewsStatus.PUBLISHED}>Công khai</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <Button type="submit" disabled={loading} className="w-full bg-black text-white hover:bg-gray-800">
                        {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>}
                        {mode === 'create' ? 'Đăng bài' : 'Lưu thay đổi'}
                    </Button>
                </CardContent>
            </Card>
        </div>
      </form>
    </div>
  );
}