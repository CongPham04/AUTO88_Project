import { useState, useEffect } from 'react';
import { ArrowLeft, X, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useCompareStore } from '@/store/compareStore';
import compareService from '@/services/compareService';
import { CarResponse, getColorName } from '@/services/carService'; // Dùng đúng Interface từ carService
import { Skeleton } from '@/components/ui/skeleton';

// Skeleton cho bảng so sánh
const ComparisonSkeleton = () => (
  <div className="animate-pulse">
    <div className="text-center mb-8">
      <Skeleton className="h-9 w-1/3 mx-auto mb-2" />
      <Skeleton className="h-5 w-1/4 mx-auto" />
    </div>
    <Card>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4 w-64 bg-gray-50"><Skeleton className="h-6 w-1/2" /></th>
                <th className="text-center p-4 w-80 relative"><Skeleton className="h-6 w-3/4 mx-auto" /></th>
                <th className="text-center p-4 w-80 relative"><Skeleton className="h-6 w-3/4 mx-auto" /></th>
              </tr>
            </thead>
            <tbody>
              {[...Array(8)].map((_, i) => (
                <tr key={i} className={i % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="p-4"><Skeleton className="h-5 w-3/4" /></td>
                  <td className="p-4 w-80"><Skeleton className="h-5 w-1/2 mx-auto" /></td>
                  <td className="p-4 w-80"><Skeleton className="h-5 w-1/2 mx-auto" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  </div>
);

// Định nghĩa cấu trúc hàng so sánh
interface ComparisonRow {
  label: string;
  // Key hỗ trợ truy cập lồng nhau, ví dụ: "detail.engine"
  key: string;
  type: 'image' | 'text' | 'price' | 'badge' | 'colors';
}

export default function ComparisonPage() {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useCompareStore();
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComparedCars = async () => {
      if (compareList.length < 2) {
        setCars([]);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // API compare của Backend mới (/api/cars/compare) đã trả về đầy đủ detail và colors
        // nên không cần gọi thêm API getDetail từng xe nữa.
        const data = await compareService.compareCars(compareList);
        setCars(data);
      } catch (err) {
        setError('Không thể tải dữ liệu so sánh.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparedCars();
  }, [compareList]);

  const handleRemoveFromCompare = (id: number) => {
    removeFromCompare(id);
  };

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const handleViewDetails = (carId: number) => navigate(`/cars/${carId}`);

  // --- Logic lấy giá trị từ key lồng nhau (nested key) ---
  const getValue = (obj: any, path: string) => {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  };

  // Cấu hình các hàng so sánh (Dựa trên CarResponse mới)
  const comparisonRows: ComparisonRow[] = [
    { label: 'Hình ảnh', key: 'imageUrls', type: 'image' }, // carService đã map imageUrls[0] vào imageUrl
    { label: 'Tên xe', key: 'model', type: 'text' }, // Backend trả về model riêng
    { label: 'Hãng xe', key: 'brand', type: 'text' },
    { label: 'Giá bán', key: 'price', type: 'price' },
    { label: 'Năm sản xuất', key: 'manufactureYear', type: 'text' },
    { label: 'Loại xe', key: 'category', type: 'text' },
    { label: 'Tình trạng', key: 'status', type: 'badge' },
    { label: 'Màu sắc', key: 'colors', type: 'colors' }, // Xử lý mảng màu

    // Các trường detail nằm trong object con 'detail'
    { label: 'Động cơ', key: 'detail.engine', type: 'text' },
    { label: 'Công suất (HP)', key: 'detail.horsepower', type: 'text' },
    { label: 'Mô-men xoắn (Nm)', key: 'detail.torque', type: 'text' },
    { label: 'Hộp số', key: 'detail.transmission', type: 'text' },
    { label: 'Nhiên liệu', key: 'detail.fuelType', type: 'text' },
    { label: 'Tiêu hao (L/100km)', key: 'detail.fuelConsumption', type: 'text' },
    { label: 'Số chỗ ngồi', key: 'detail.seats', type: 'text' },
    { label: 'Trọng lượng (kg)', key: 'detail.weight', type: 'text' },
    { label: 'Kích thước', key: 'detail.dimensions', type: 'text' },
  ];

  const renderValue = (car: CarResponse, row: ComparisonRow) => {
    const value = getValue(car, row.key);

    switch (row.type) {
      case 'image':
        let displayImage = '';
        if (Array.isArray(value) && value.length > 0) {
          displayImage = value[0]; // Lấy ảnh đầu tiên trong list
        } else if (car.imageUrl) {
          displayImage = car.imageUrl; // Fallback nếu có trường imageUrl cũ
        }

        return (
          <div className="flex justify-center">
            <ImageWithFallback
              src={displayImage}
              alt={car.model}
              className="w-32 h-24 object-cover rounded shadow-sm bg-white"
            />
          </div>
        );

      case 'text':
        if (row.key === 'model') return <span className="font-semibold text-lg">{car.brand} {car.model}</span>;
        return <span className="text-gray-900 break-words">{value ? String(value) : '---'}</span>;

      case 'price':
        return <span className="text-red-600 font-bold text-lg">{formatPrice(value as number)}</span>;

      case 'badge':
        const statusMap: Record<string, string> = { AVAILABLE: 'Còn hàng', SOLD: 'Hết hàng' };
        return (
          <Badge className={value === 'AVAILABLE' ? 'bg-green-600' : 'bg-gray-600'}>
            {statusMap[value as string] || value}
          </Badge>
        );

      case 'colors':
        if (Array.isArray(value) && value.length > 0) {
          return (
            <div className="flex flex-wrap gap-1 justify-center">
              {value.map((color: string) => (
                <Badge key={color} variant="outline" className="text-xs uppercase">
                    {getColorName(color)}
                </Badge>
              ))}
            </div>
          );
        }
        return <span>---</span>;

      default:
        return <span>---</span>;
    }
  };

  // --- Render UI ---

  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors mb-3" onClick={() => navigate('/cars')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách xe
          </div>
          <div className="py-16 text-center">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Chưa có xe nào để so sánh</h1>
            <p className="text-lg text-gray-600 mt-2">Chọn ít nhất 2 xe để bắt đầu so sánh.</p>
            <Button onClick={() => navigate('/cars')} className="mt-6">Xem danh sách xe</Button>
          </div>
        </div>
      </div>
    );
  }

  if (compareList.length === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors mb-3" onClick={() => navigate('/cars')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách xe
          </div>
          <div className="py-16 text-center">
            <Car className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Cần thêm xe để so sánh</h1>
            <p className="text-lg text-gray-600 mt-2">Bạn đang chọn 1 xe. Vui lòng chọn thêm ít nhất 1 xe nữa.</p>
            <div className="flex gap-4 justify-center mt-6">
              <Button onClick={() => navigate('/cars')}>Chọn thêm xe</Button>
              <Button onClick={clearCompare} variant="outline">Xóa xe đã chọn</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 text-l text-gray-500 hover:text-gray-900 cursor-pointer w-fit transition-colors mb-3" onClick={() => navigate('/cars')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách xe
          </div>

        {loading ? (
          <ComparisonSkeleton />
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">So sánh xe</h1>
              <p className="text-gray-600">So sánh chi tiết {cars.length} xe được chọn</p>
            </div>

            <Card className="shadow-lg border-none overflow-hidden">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed min-w-[800px]">
                    <thead>
                      <tr className="bg-gray-100/80 border-b">
                        <th className="text-left p-4 w-48 font-semibold text-gray-700">Thông số</th>
                        {cars.map((car) => (
                          <th key={car.carId} className="text-center p-4 w-72 relative group bg-white border-l">
                            <Button variant="ghost" size="icon" onClick={() => handleRemoveFromCompare(car.carId)}
                              className="absolute top-2 right-2 h-6 w-6 rounded-full hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-3 h-3" />
                            </Button>
                            <div className="mt-2 font-bold text-lg">{car.brand} {car.model}</div>
                            <div className="text-sm text-gray-500">{car.manufactureYear}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {comparisonRows.map((row, index) => (
                        <tr key={row.key} className={index % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}>
                          <td className="p-4 font-medium text-gray-600">{row.label}</td>
                          {cars.map((car) => (
                            <td key={car.carId} className="p-4 text-center border-l align-middle">
                              {renderValue(car, row)}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {/* Hàng nút Xem chi tiết */}
                      <tr className="bg-white">
                        <td className="p-4"></td>
                        {cars.map((car) => (
                          <td key={car.carId} className="p-4 text-center border-l">
                            <Button className="w-full bg-red-600 hover:bg-red-700 text-white" onClick={() => handleViewDetails(car.carId)}>
                              Xem chi tiết
                            </Button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}