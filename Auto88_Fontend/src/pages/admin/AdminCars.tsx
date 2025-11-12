import { useState, useEffect } from 'react';
import { Plus, Eye, Edit, Trash2, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import carService, { CarResponse, CarRequest, CarDetailResponse, CarDetailRequest, Brand, Category, CarStatus, Color } from '@/services/carService';
import { toast } from 'sonner';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const getBrandText = (brand: Brand) => {
  const brandNames: Record<Brand, string> = {
    TOYOTA: 'Toyota',
    HYUNDAI: 'Hyundai',
    MERCEDES: 'Mercedes',
    VINFAST: 'VinFast',
  };
  return brandNames[brand];
};

const getCategoryText = (category: Category) => {
  const categoryNames: Record<Category, string> = {
    SUV: 'SUV',
    SEDAN: 'Sedan',
    HATCHBACK: 'Hatchback',
  };
  return categoryNames[category];
};

const getStatusText = (status: CarStatus) => {
  return status === 'AVAILABLE' ? 'Còn hàng' : 'Đã bán';
};

export default function AdminCars() {
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [selectedCar, setSelectedCar] = useState<CarResponse | null>(null);
  const [selectedFileName, setSelectedFileName] = useState('Chưa chọn ảnh');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  // Car Detail states
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isDetailEditing, setIsDetailEditing] = useState<boolean>(false);
  const [currentCarDetail, setCurrentCarDetail] = useState<CarDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState<boolean>(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [formData, setFormData] = useState<CarRequest>({
    brand: Brand.TOYOTA,
    category: Category.SUV,
    model: '',
    manufactureYear: new Date().getFullYear(),
    price: 0,
    color: Color.BLACK,
    description: '',
    status: 'AVAILABLE',
  });

  const [detailFormData, setDetailFormData] = useState<CarDetailRequest>({
    engine: '',
    horsepower: 0,
    torque: 0,
    transmission: '',
    fuelType: '',
    fuelConsumption: 0,
    seats: 0,
    weight: 0,
    dimensions: '',
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const data = await carService.getAllCars();
      setCars(data);
    } catch (error: any) {
      console.error('Error fetching cars:', error);
      toast.error(error.message || 'Lỗi khi tải danh sách xe');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedCar(null);
    setFormData({
      brand: Brand.TOYOTA,
      category: Category.SUV,
      model: '',
      manufactureYear: new Date().getFullYear(),
      price: 0,
      color: Color.BLACK,
      description: '',
      status: 'AVAILABLE',
    });
    setImageFile(null);
    setImagePreview('');
    setSelectedFileName('Chưa chọn ảnh');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (car: CarResponse) => {
    setIsEditing(true);
    setSelectedCar(car);
    setFormData({
      brand: car.brand,
      category: car.category,
      model: car.model,
      manufactureYear: car.manufactureYear,
      price: car.price,
      color: car.color,
      description: car.description,
      status: car.status,
    });
    setImageFile(null);
    setImagePreview(car.imageUrl || '');
    setSelectedFileName('Chưa chọn ảnh mới');
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCar(null);
    setImageFile(null);
    setImagePreview('');
    setSelectedFileName('Chưa chọn ảnh');
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
      const fullName = file.name;
      const truncatedName = fullName.length > 20 ? '...' + fullName.substring(fullName.length - 20) : fullName;
      setSelectedFileName(truncatedName);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.model.trim()) {
      toast.error('Vui lòng nhập tên mẫu xe');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Vui lòng nhập giá xe hợp lệ');
      return;
    }

    if (!isEditing && !imageFile) {
      toast.error('Vui lòng chọn ảnh cho xe');
      return;
    }

    try {
      setIsSaving(true);

      const carData: CarRequest = {
        ...formData,
        imageFile: imageFile || undefined,
      };

      if (isEditing && selectedCar) {
        await carService.updateCar(selectedCar.carId, carData);
        toast.success('Cập nhật xe thành công');
      } else {
        await carService.createCar(carData);
        toast.success('Thêm xe mới thành công');
      }

      handleCloseModal();
      await fetchCars();
    } catch (error: any) {
      console.error('Error saving car:', error);
      toast.error(error.message || 'Lỗi khi lưu thông tin xe');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (carId: number, carModel: string) => {
    toast.custom((t) => (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 w-[340px]">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          Xác nhận xóa xe
        </h3>
        <p className="text-gray-600 text-sm mb-5">
          Bạn có chắc chắn muốn xóa xe <span className="font-medium text-red-600">"{carModel}"</span> không?<br />
          Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast.dismiss(t)}
            className="cursor-pointer hover:bg-gray-100 transition-colors"
          >
            Hủy
          </Button>
          <Button
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white cursor-pointer transition-colors"
            onClick={async () => {
              try {
                await carService.deleteCar(carId);
                toast.dismiss(t);
                toast.success(`Đã xóa xe "${carModel}" thành công`);
                await fetchCars();
              } catch (error: any) {
                console.error('Error deleting car:', error);
                toast.dismiss(t);
                toast.error(error.message || 'Lỗi khi xóa xe');
              }
            }}
          >
            Xác nhận
          </Button>
        </div>
      </div>
    ));
  };

  // Car Detail handlers
  const handleOpenDetailModal = async (car: CarResponse) => {
    setSelectedCar(car);
    setLoadingDetail(true);
    setIsDetailModalOpen(true);

    try {
      // Try to fetch existing car details
      const allDetails = await carService.getAllCarDetails();
      const existingDetail = allDetails.find((detail) => detail.carId === car.carId);

      if (existingDetail) {
        // Car detail exists - edit mode
        setIsDetailEditing(true);
        setCurrentCarDetail(existingDetail);
        setDetailFormData({
          engine: existingDetail.engine,
          horsepower: existingDetail.horsepower,
          torque: existingDetail.torque,
          transmission: existingDetail.transmission,
          fuelType: existingDetail.fuelType,
          fuelConsumption: existingDetail.fuelConsumption,
          seats: existingDetail.seats,
          weight: existingDetail.weight,
          dimensions: existingDetail.dimensions,
        });
      } else {
        // No car detail - create mode
        setIsDetailEditing(false);
        setCurrentCarDetail(null);
        setDetailFormData({
          engine: '',
          horsepower: 0,
          torque: 0,
          transmission: '',
          fuelType: '',
          fuelConsumption: 0,
          seats: 0,
          weight: 0,
          dimensions: '',
        });
      }
    } catch (error: any) {
      console.error('Error fetching car details:', error);
      // If error, assume no detail exists and allow creation
      setIsDetailEditing(false);
      setCurrentCarDetail(null);
      setDetailFormData({
        engine: '',
        horsepower: 0,
        torque: 0,
        transmission: '',
        fuelType: '',
        fuelConsumption: 0,
        seats: 0,
        weight: 0,
        dimensions: '',
      });
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedCar(null);
    setCurrentCarDetail(null);
    setIsDetailEditing(false);
  };

  const handleSubmitCarDetail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCar) {
      toast.error('Không tìm thấy thông tin xe');
      return;
    }

    // Validation
    if (!detailFormData.engine.trim()) {
      toast.error('Vui lòng nhập thông tin động cơ');
      return;
    }
    if (!detailFormData.transmission.trim()) {
      toast.error('Vui lòng nhập thông tin hộp số');
      return;
    }
    if (!detailFormData.fuelType.trim()) {
      toast.error('Vui lòng nhập loại nhiên liệu');
      return;
    }

    try {
      setIsSaving(true);

      if (isDetailEditing && currentCarDetail) {
        // Update existing car detail
        await carService.updateCarDetail(currentCarDetail.carDetailId, detailFormData);
        toast.success('Cập nhật thông số kỹ thuật thành công');
      } else {
        // Create new car detail
        await carService.createCarDetail(selectedCar.carId, detailFormData);
        toast.success('Thêm thông số kỹ thuật thành công');
      }

      handleCloseDetailModal();
    } catch (error: any) {
      console.error('Error saving car detail:', error);
      toast.error(error.message || 'Lỗi khi lưu thông số kỹ thuật');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách xe...</p>
        </div>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản Lý Xe</h2>
        <Button
          onClick={handleOpenCreateModal}
          className="cursor-pointer hover:bg-red-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Thêm xe mới
        </Button>
      </div>

      {cars.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Chưa có xe nào trong hệ thống</p>
            <Button
              onClick={handleOpenCreateModal}
              className="mt-4 cursor-pointer hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm xe đầu tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Hình ảnh</th>
                    <th className="text-left p-4">Tên xe</th>
                    <th className="text-left p-4">Giá</th>
                    <th className="text-left p-4">Năm sản xuất</th>
                    <th className="text-left p-4">Màu sắc</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {cars.map((car) => (
                    <tr key={car.carId} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <ImageWithFallback
                          src={car.imageUrl}
                          alt={`${getBrandText(car.brand)} ${car.model}`}
                          className="w-16 h-12 object-cover rounded"
                        />
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium">
                            {getBrandText(car.brand)} {car.model}
                          </p>
                          <p className="text-sm text-gray-600">{getCategoryText(car.category)}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-red-600">{formatPrice(car.price)}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-700">{car.manufactureYear}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-gray-700">{car.color}</p>
                      </td>
                      <td className="p-4">
                        <Badge
                          className={
                            car.status === 'AVAILABLE' ? 'bg-green-600' : 'bg-red-600'
                          }
                        >
                          {getStatusText(car.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenDetailModal(car)}
                            className="cursor-pointer hover:bg-blue-50 transition-colors"
                            title="Quản lý thông số kỹ thuật"
                          >
                            <Settings className="w-4 h-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenEditModal(car)}
                            className="cursor-pointer hover:bg-gray-100 transition-colors"
                            title="Chỉnh sửa thông tin xe"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedCar(car);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600 hover:text-red-700"
                            title="Xóa"
                          >
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
      )}

      {/* Car Detail Modal */}
      {isDetailModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-2xl shadow-2xl border border-gray-100">
            <CardHeader className="border-b pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    {isDetailEditing ? 'Chỉnh sửa thông số kỹ thuật' : 'Thêm thông số kỹ thuật'}
                  </CardTitle>
                  {selectedCar && (
                    <div className="flex items-center gap-3 mt-2">
                      <img
                        src={selectedCar.imageUrl}
                        alt={selectedCar.model}
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <div>
                        <p className="font-medium text-gray-800">
                          {getBrandText(selectedCar.brand)} {selectedCar.model}
                        </p>
                        <p className="text-sm text-gray-500">{getCategoryText(selectedCar.category)}</p>
                      </div>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDetailModal}
                  disabled={isSaving}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>

            <CardContent className="py-6">
              {loadingDetail ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmitCarDetail} className="space-y-5">
                  <div className="space-y-3">
                    <Label htmlFor="engine">Động cơ *</Label>
                    <Input
                      id="engine"
                      value={detailFormData.engine}
                      onChange={(e) => setDetailFormData({ ...detailFormData, engine: e.target.value })}
                      disabled={isSaving}
                      placeholder="VD: 2.5L I4 DOHC"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="horsepower">Công suất (HP)</Label>
                      <Input
                        id="horsepower"
                        type="number"
                        value={detailFormData.horsepower}
                        onChange={(e) =>
                          setDetailFormData({
                            ...detailFormData,
                            horsepower: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isSaving}
                        placeholder="VD: 200"
                      />
                    </div>

                    <div>
                      <Label htmlFor="torque">Mô-men xoắn (Nm)</Label>
                      <Input
                        id="torque"
                        type="number"
                        value={detailFormData.torque}
                        onChange={(e) =>
                          setDetailFormData({
                            ...detailFormData,
                            torque: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isSaving}
                        placeholder="VD: 250"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="transmission">Hộp số *</Label>
                    <Input
                      id="transmission"
                      value={detailFormData.transmission}
                      onChange={(e) =>
                        setDetailFormData({ ...detailFormData, transmission: e.target.value })
                      }
                      disabled={isSaving}
                      placeholder="VD: Tự động 8 cấp"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="fuelType">Loại nhiên liệu *</Label>
                    <Input
                      id="fuelType"
                      value={detailFormData.fuelType}
                      onChange={(e) =>
                        setDetailFormData({ ...detailFormData, fuelType: e.target.value })
                      }
                      disabled={isSaving}
                      placeholder="VD: Xăng, Dầu, Hybrid"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fuelConsumption">Mức tiêu thụ (L/100km)</Label>
                      <Input
                        id="fuelConsumption"
                        type="number"
                        step="0.1"
                        value={detailFormData.fuelConsumption}
                        onChange={(e) =>
                          setDetailFormData({
                            ...detailFormData,
                            fuelConsumption: parseFloat(e.target.value) || 0,
                          })
                        }
                        disabled={isSaving}
                        placeholder="VD: 7.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="seats">Số chỗ ngồi</Label>
                      <Input
                        id="seats"
                        type="number"
                        value={detailFormData.seats}
                        onChange={(e) =>
                          setDetailFormData({
                            ...detailFormData,
                            seats: parseInt(e.target.value) || 0,
                          })
                        }
                        disabled={isSaving}
                        placeholder="VD: 5, 7"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="weight">Trọng lượng (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={detailFormData.weight}
                        onChange={(e) =>
                          setDetailFormData({
                            ...detailFormData,
                            weight: parseFloat(e.target.value) || 0,
                          })
                        }
                        disabled={isSaving}
                        placeholder="VD: 1500"
                      />
                    </div>

                    <div>
                      <Label htmlFor="dimensions">Kích thước (DxRxC mm)</Label>
                      <Input
                        id="dimensions"
                        value={detailFormData.dimensions}
                        onChange={(e) =>
                          setDetailFormData({ ...detailFormData, dimensions: e.target.value })
                        }
                        disabled={isSaving}
                        placeholder="VD: 4650 x 1825 x 1665"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCloseDetailModal}
                      disabled={isSaving}
                      className="cursor-pointer hover:bg-gray-100 transition-colors"
                    >
                      Hủy
                    </Button>
                    <Button
                      type="submit"
                      variant={'default'}
                      disabled={isSaving}
                    >
                      {isSaving ? 'Đang lưu...' : isDetailEditing ? 'Cập nhật' : 'Thêm thông số'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-white">
            <CardHeader className="border-b pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>{isEditing ? 'Chỉnh sửa xe' : 'Thêm xe mới'}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseModal}
                  disabled={isSaving}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="brand" className="mb-2">
                      Hãng xe *
                    </Label>
                    <Select
                      value={formData.brand}
                      onValueChange={(value: Brand) =>
                        setFormData({ ...formData, brand: value })
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue>{getBrandText(formData.brand)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TOYOTA">Toyota</SelectItem>
                        <SelectItem value="HYUNDAI">Hyundai</SelectItem>
                        <SelectItem value="MERCEDES">Mercedes</SelectItem>
                        <SelectItem value="VINFAST">VinFast</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category" className="mb-2">
                      Loại xe *
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: Category) =>
                        setFormData({ ...formData, category: value })
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue>{getCategoryText(formData.category)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SUV">SUV</SelectItem>
                        <SelectItem value="SEDAN">Sedan</SelectItem>
                        <SelectItem value="HATCHBACK">Hatchback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="model" className="mb-2">
                      Tên mẫu xe *
                    </Label>
                    <Input
                      id="model"
                      value={formData.model}
                      onChange={(e) =>
                        setFormData({ ...formData, model: e.target.value })
                      }
                      disabled={isSaving}
                      placeholder="Ví dụ: Camry, Tucson, C300"
                    />
                  </div>

                  <div>
                    <Label htmlFor="manufactureYear" className="mb-2">
                      Năm sản xuất *
                    </Label>
                    <Input
                      id="manufactureYear"
                      type="number"
                      value={formData.manufactureYear}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          manufactureYear: parseInt(e.target.value) || 0,
                        })
                      }
                      disabled={isSaving}
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>

                  <div>
                    <Label htmlFor="price" className="mb-2">
                      Giá (VND) *
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      disabled={isSaving}
                      min="0"
                      placeholder="Ví dụ: 850000000"
                    />
                  </div>

                  <div>
                    <Label htmlFor="color" className="mb-2">
                      Màu sắc *
                    </Label>
                    <Select
                      value={formData.color}
                      onValueChange={(value: Color) =>
                        setFormData({ ...formData, color: value })
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn màu sắc" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(Color).map((colorValue) => (
                          <SelectItem key={colorValue} value={colorValue}>
                            {colorValue}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status" className="mb-2">
                      Trạng thái *
                    </Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: CarStatus) =>
                        setFormData({ ...formData, status: value })
                      }
                      disabled={isSaving}
                    >
                      <SelectTrigger>
                        <SelectValue>{getStatusText(formData.status)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AVAILABLE">Còn hàng</SelectItem>
                        <SelectItem value="SOLD">Đã bán</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="imageFile" className="mb-2">
                      Hình ảnh {!isEditing && '*'}
                    </Label>
                    <div className="space-y-2">
                      <Input
                        id="imageFile"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isSaving}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-600">{selectedFileName}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="mb-2">
                    Mô tả
                  </Label>
                  <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    disabled={isSaving}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Mô tả chi tiết về xe..."
                  />
                </div>

                {imagePreview && (
                  <div>
                    <Label className="mb-2">Xem trước hình ảnh</Label>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full max-h-64 object-contain rounded border"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={isSaving}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="cursor-pointer hover:bg-red-700 transition-colors"
                  >
                    {isSaving ? 'Đang lưu...' : isEditing ? 'Cập nhật' : 'Thêm xe'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
      {/* === Modal xác nhận xóa xe === */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Bạn có chắc chắn muốn xóa xe?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Xe này sẽ bị xóa vĩnh viễn khỏi hệ thống.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (selectedCar) {
                  try {
                    await carService.deleteCar(selectedCar.carId);
                    toast.success(`Đã xóa xe "${selectedCar.model}" thành công.`);
                    await fetchCars(); // load lại danh sách
                  } catch (error: any) {
                    toast.error(error.message || 'Lỗi khi xóa xe.');
                  } finally {
                    setIsDeleteDialogOpen(false);
                    setSelectedCar(null);
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
