import { useState, useEffect, useCallback, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PlusCircle, Edit, Trash2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import promotionService, {
  Promotion,
  PromotionRequest,
  DiscountType,
  AppliesTo,
} from '@/services/promotionService';
import carService, { CarResponse, Brand, Category } from '@/services/carService';

// --- Helper Functions ---
const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const convertToDateTimeLocalString = (isoString: string) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // Adjust for timezone offset to display correctly in the input
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

const initialFormData: PromotionRequest = {
  title: '',
  description: '',
  discountType: DiscountType.PERCENT,
  discountValue: 0,
  startAt: '',
  endAt: '',
  active: true,
  appliesTo: AppliesTo.GLOBAL,
  targetCategories: [],
  targetBrands: [],
  targetCarIds: [],
};

// --- Main AdminPromotions Component ---
export default function AdminPromotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);
  const [formData, setFormData] = useState<PromotionRequest>(initialFormData);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [promotionToDelete, setPromotionToDelete] = useState<Promotion | null>(null);
  // Thêm state lọc
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [promotionsData, carsData] = await Promise.all([
        promotionService.getAllPromotions(),
        carService.getAllCars(),
      ]);
      setPromotions(promotionsData.sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()));
      setCars(carsData);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi khi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (isModalOpen) {
      if (selectedPromotion) {
        setFormData({
          ...selectedPromotion,
          startAt: convertToDateTimeLocalString(selectedPromotion.startAt),
          endAt: convertToDateTimeLocalString(selectedPromotion.endAt),
        });
      } else {
        setFormData(initialFormData);
      }
    }
  }, [isModalOpen, selectedPromotion]);

  const handleOpenModal = (promotion: Promotion | null = null) => {
    setSelectedPromotion(promotion);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPromotion(null);
  };

  const handleSave = async () => {
    await fetchData();
    handleCloseModal();
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: keyof PromotionRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: 'targetCategories' | 'targetBrands' | 'targetCarIds', value: string | number) => {
    setFormData((prev) => {
      const list = (prev[name] as (string | number)[]) || [];
      const newList = list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value];
      return { ...prev, [name]: newList };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error('Tiêu đề là bắt buộc');
      return;
    }
    if (formData.discountValue <= 0) {
      toast.error('Giá trị giảm giá phải lớn hơn 0');
      return;
    }

    try {
      const payload: PromotionRequest = {
        title: formData.title.trim(),
        description: formData.description?.trim() || "",
        discountType: formData.discountType || DiscountType.PERCENT,
        discountValue: Number(formData.discountValue) || 0,
        startAt: new Date(formData.startAt).toISOString(),
        endAt: new Date(formData.endAt).toISOString(),
        active: !!formData.active,
        appliesTo: formData.appliesTo || AppliesTo.GLOBAL, // 🔥 đảm bảo luôn có giá trị

        targetCategories:
          formData.appliesTo === AppliesTo.CATEGORY && formData.targetCategories?.length
            ? formData.targetCategories
            : [],

        targetBrands:
          formData.appliesTo === AppliesTo.BRAND && formData.targetBrands?.length
            ? formData.targetBrands
            : [],

        targetCarIds:
          formData.appliesTo === AppliesTo.CAR && formData.targetCarIds?.length
            ? formData.targetCarIds
            : [],
      };

      if (selectedPromotion) {
        await promotionService.updatePromotion(selectedPromotion.promotionId, payload);
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        await promotionService.createPromotion(payload);
        toast.success('Tạo khuyến mãi thành công');
      }
      handleSave();
    } catch (error: any) {
      toast.error(error.message || 'Lưu khuyến mãi thất bại');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách khuyến mãi...</p>
        </div>
      </div>
    );
  }

  const filteredPromotions = promotions.filter((promo) => {
    if (statusFilter === 'active') return promo.active === true;
    if (statusFilter === 'inactive') return promo.active === false;
    return true; // all
  });
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Khuyến mãi</h2>

        <div className="flex items-center space-x-3">
          {/* Bộ lọc trạng thái */}
          <div className="flex items-center space-x-2 border border-gray-300 rounded-md px-3 py-1.5 bg-white shadow-sm h-10">
            <Label htmlFor="statusFilter" className="text-sm font-medium text-gray-700">
              Lọc theo trạng thái:
            </Label>
            <Select
              value={statusFilter}
              onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}
            >
              <SelectTrigger
                id="statusFilter"
                className="w-[160px] h-8 text-sm"
              >
                <SelectValue placeholder="Chọn trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={() => handleOpenModal()}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Thêm Khuyến mãi
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left p-4">Tiêu đề</th>
                  <th className="text-left p-4">Giảm giá</th>
                  <th className="text-left p-4">Ngày bắt đầu</th>
                  <th className="text-left p-4">Ngày kết thúc</th>
                  <th className="text-left p-4">Trạng thái</th>
                  <th className="text-left p-4">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((promo) => (
                  <tr key={promo.promotionId} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">{promo.title}</td>
                    <td className="p-4">
                      {promo.discountValue}
                      {promo.discountType === 'PERCENT' ? '%' : ' VND'}
                    </td>
                    <td className="p-4">{formatDate(promo.startAt)}</td>
                    <td className="p-4">{formatDate(promo.endAt)}</td>
                    <td className="p-4">
                      <Badge className={promo.active ? 'bg-green-600' : 'bg-red-600'}>
                        {promo.active ? 'Đang hoạt động' : 'Không hoạt động'}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleOpenModal(promo)} title="Chỉnh sửa">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => {setPromotionToDelete(promo); setIsDeleteDialogOpen(true);}} className="text-red-600 hover:text-red-700" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedPromotion ? 'Chỉnh sửa Khuyến mãi' : 'Thêm Khuyến mãi mới'}</DialogTitle>
              <DialogDescription>
                Điền thông tin chi tiết để tạo hoặc cập nhật khuyến mãi.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Tiêu đề</Label>
                  <Input id="title" name="title" value={formData.title} onChange={handleFormChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountType">Loại giảm giá</Label>
                  <Select onValueChange={(value) => handleSelectChange('discountType', value)} value={formData.discountType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại giảm giá" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DiscountType.PERCENT}>Phần trăm (%)</SelectItem>
                      <SelectItem value={DiscountType.FIXED}>Số tiền cố định (VND)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleFormChange} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="discountValue">Giá trị giảm giá</Label>
                  <Input id="discountValue" name="discountValue" type="number" value={formData.discountValue} onChange={handleFormChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appliesTo">Áp dụng cho</Label>
                  <Select onValueChange={(value) => handleSelectChange('appliesTo', value)} value={formData.appliesTo}>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn đối tượng áp dụng" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={AppliesTo.GLOBAL}>Tất cả sản phẩm</SelectItem>
                      <SelectItem value={AppliesTo.CATEGORY}>Theo danh mục</SelectItem>
                      <SelectItem value={AppliesTo.BRAND}>Theo thương hiệu</SelectItem>
                      <SelectItem value={AppliesTo.CAR}>Xe cụ thể</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {formData.appliesTo === AppliesTo.CATEGORY && (
                <div className="space-y-2">
                  <Label>Chọn Danh mục</Label>
                  <div className="grid grid-cols-3 gap-2 p-2 border rounded-md">
                    {Object.values(Category).map((category) => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={formData.targetCategories?.includes(category)}
                          onCheckedChange={() => handleCheckboxChange('targetCategories', category)}
                        />
                        <Label htmlFor={category}>{category}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.appliesTo === AppliesTo.BRAND && (
                <div className="space-y-2">
                  <Label>Chọn Thương hiệu</Label>
                  <div className="grid grid-cols-3 gap-2 p-2 border rounded-md">
                    {Object.values(Brand).map((brand) => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={formData.targetBrands?.includes(brand)}
                          onCheckedChange={() => handleCheckboxChange('targetBrands', brand)}
                        />
                        <Label htmlFor={brand}>{brand}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {formData.appliesTo === AppliesTo.CAR && (
                <div className="space-y-2">
                  <Label>Chọn Xe</Label>
                  <div className="grid grid-cols-3 gap-2 p-2 border rounded-md max-h-40 overflow-y-auto">
                    {cars.map((car) => (
                      <div key={car.carId} className="flex items-center space-x-2">
                        <Checkbox
                          id={car.carId.toString()}
                          checked={formData.targetCarIds?.includes(car.carId)}
                          onCheckedChange={() => handleCheckboxChange('targetCarIds', car.carId)}
                        />
                        <Label htmlFor={car.carId.toString()}>{car.model}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startAt">Ngày bắt đầu</Label>
                  <Input id="startAt" name="startAt" type="datetime-local" value={formData.startAt} onChange={handleFormChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endAt">Ngày kết thúc</Label>
                  <Input id="endAt" name="endAt" type="datetime-local" value={formData.endAt} onChange={handleFormChange} />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="active"
                  checked={formData.active}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, active: !!checked }))}
                />
                <Label htmlFor="active">Kích hoạt khuyến mãi</Label>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseModal}>
                  Hủy
                </Button>
                <Button type="submit">Lưu</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
      {/* === Modal xác nhận xóa khuyến mãi === */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bạn có chắc chắn muốn xóa khuyến mãi này?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Khuyến mãi này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (promotionToDelete) {
                  try {
                    await promotionService.deletePromotion(promotionToDelete.promotionId);
                    toast.success(`Đã xóa khuyến mãi "${promotionToDelete.title}" thành công.`);
                    await fetchData(); // load lại danh sách
                  } catch (error: any) {
                    toast.error(error.message || 'Lỗi khi xóa khuyến mãi.');
                  } finally {
                    setIsDeleteDialogOpen(false);
                    setPromotionToDelete(null);
                  }
                }
              }}
              className="bg-black hover:bg-gray-800 text-white"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}