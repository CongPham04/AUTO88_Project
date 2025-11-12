import { useState, useEffect } from 'react';
import { ArrowLeft, X, Car } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useCompareStore } from '@/store/compareStore';
import compareService from '@/services/compareService';
import carService, { CarResponse, CarDetailResponse } from '@/services/carService';
import { Skeleton } from '@/components/ui/skeleton'; // Thêm import Skeleton

type CombinedCar = CarResponse & Partial<CarDetailResponse>;

// Skeleton cho thẻ xe
const SkeletonCarCard = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/g-4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);

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
              {[...Array(8)].map((_, i) => ( // Tạo 8 hàng skeleton
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

export default function ComparisonPage() {
  const navigate = useNavigate();
  const { compareList, removeFromCompare, clearCompare } = useCompareStore();
  const [cars, setCars] = useState<CombinedCar[]>([]);
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
        const baseCars = await compareService.compareCars(compareList);
        
        const detailedCars = await Promise.all(
          baseCars.map(async (car) => {
            try {
              const details = await carService.getCarDetailByCarId(car.carId);
              return { ...car, ...details };
            } catch (detailError) {
              console.error(`Failed to fetch details for car ${car.carId}`, detailError);
              return car; // Return base car info if details fail
            }
          })
        );

        setCars(detailedCars);
      } catch (err) {
        setError('Failed to load comparison data.');
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

  // Trang "Chưa có xe"
  if (compareList.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* [SỬA LỖI BỐ CỤC] Nút "Quay lại" nằm ngoài 'text-center' */}
          <Button variant="ghost" onClick={() => navigate('/cars')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách xe
          </Button>
          <div className="py-16 text-center">
            <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Chưa có xe nào để so sánh</h1>
            <p className="text-lg text-gray-600 mt-2">Chọn ít nhất 2 xe để bắt đầu so sánh.</p>
            <Button onClick={() => navigate('/cars')} className="mt-6">
              Xem danh sách xe
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  // Trang "Cần thêm xe"
  if (compareList.length === 1) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* [SỬA LỖI BỐ CỤC] Nút "Quay lại" nằm ngoài 'text-center' */}
          <Button variant="ghost" onClick={() => navigate('/cars')} className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại danh sách xe
          </Button>
          <div className="py-16 text-center">
            <Car className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold">Cần thêm xe để so sánh</h1>
            <p className="text-lg text-gray-600 mt-2">Bạn cần chọn thêm ít nhất 1 xe nữa.</p>
            <div className="flex gap-4 justify-center mt-6">
              <Button onClick={() => navigate('/cars')}>Chọn thêm xe</Button>
              <Button onClick={clearCompare} variant="outline">Xóa xe đã chọn</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  const handleViewDetails = (carId: number) => navigate(`/cars/${carId}`);

  // ... (comparisonRows và renderValue giữ nguyên) ...
  const comparisonRows = [
    { label: 'Hình ảnh', key: 'imageUrl', type: 'image' },
    { label: 'Tên xe', key: 'name', type: 'text' },
    { label: 'Giá bán', key: 'price', type: 'price' },
    { label: 'Năm sản xuất', key: 'manufactureYear', type: 'text' },
    { label: 'Loại xe', key: 'category', type: 'text' },
    { label: 'Hộp số', key: 'transmission', type: 'text' },
    { label: 'Loại nhiên liệu', key: 'fuelType', type: 'text' },
    { label: 'Tình trạng', key: 'status', type: 'badge' },
    { label: 'Động cơ', key: 'engine', type: 'text' },
    { label: 'Công suất (HP)', key: 'horsepower', type: 'text' },
    { label: 'Mô-men xoắn (Nm)', key: 'torque', type: 'text' },
    { label: 'Tiêu hao nhiên liệu', key: 'fuelConsumption', type: 'text' },
    { label: 'Số chỗ ngồi', key: 'seats', type: 'text' },
    { label: 'Trọng lượng (kg)', key: 'weight', type: 'text' },
    { label: 'Kích thước', key: 'dimensions', type: 'text' },
    { label: 'Màu sắc', key: 'color', type: 'text' },
  ];

  const renderValue = (car: CombinedCar, row: typeof comparisonRows[0]) => {
    const value = car[row.key as keyof CombinedCar];
    switch (row.type) {
      case 'image':
        return (
          <div className="flex justify-center">
            <ImageWithFallback src={value as string} alt={`${car.brand} ${car.model}`} className="w-32 h-24 object-cover rounded" />
          </div>
        );
      case 'text':
        if (row.key === 'name') return `${car.brand} ${car.model} ${car.manufactureYear}`;
        return <span className="text-gray-900 break-words">{value || 'N/A'}</span>;
      case 'price':
        return <span className="text-red-600 font-bold text-lg">{formatPrice(value as number)}</span>;
      case 'badge':
        const statusMap: { [key: string]: string } = {
          AVAILABLE: 'Còn hàng',
          SOLD: 'Đã bán',
        };
        const vietnameseStatus = statusMap[value as string] || (value as string);
        return <Badge className={value === 'AVAILABLE' ? 'bg-green-600' : 'bg-gray-600'}>{vietnameseStatus}</Badge>;
      default:
        return <span className="text-gray-900 break-words">{value as string || 'N/A'}</span>;
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Button variant="ghost" onClick={() => navigate('/cars')} className="mb-6">
          <ArrowLeft className="w-5 h-5 mr-2" /> Quay lại danh sách
        </Button>

        {/* [SỬA LỖI] Logic 3 trạng thái cho nội dung chính */}
        {loading ? (
          <ComparisonSkeleton />
        ) : error ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center py-10">
            <p className="text-lg text-red-500">{error}</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold">So sánh xe</h1>
              <p className="text-gray-600">So sánh chi tiết {cars.length} xe được chọn</p>
            </div>
            
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 w-64 bg-gray-50">Thông số</th>
                        {cars.map((car) => (
                          <th key={car.carId} className="text-center p-4 w-80 relative">
                            <Button variant="ghost" size="sm" onClick={() => handleRemoveFromCompare(car.carId)} className="absolute top-2 right-2 p-1 h-auto">
                              <X className="w-4 h-4" />
                            </Button>
                            <div className="mt-4">{car.brand} {car.model} {car.manufactureYear}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonRows.map((row, index) => (
                        <tr key={row.key} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                          <td className="p-4 font-medium text-gray-900">{row.label}</td>
                          {cars.map((car) => (
                            <td key={car.carId} className="p-4 text-center w-80">
                              {renderValue(car, row)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-8">
              <CardHeader><CardTitle>Tóm tắt so sánh</CardTitle></CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full table-fixed">
                    <tbody>
                      <tr>
                        {/* [SỬA LỖI BỐ CỤC] Thêm ô đệm rỗng w-64 */}
                        <td className="p-4 w-64"></td>
                        
                        {cars.map((car) => (
                          <td key={car.carId} className="p-4 w-80 text-center">
                            <div className="space-y-3">
                              <h3 className="font-semibold text-lg">{car.brand} {car.model} {car.manufactureYear}</h3>
                              <div className="text-2xl font-bold text-red-600">{formatPrice(car.price)}</div>
                              <div className="space-y-2 text-sm text-gray-600">
                                <div>Động cơ: {car.engine || 'N/A'}</div>
                                <div>Công suất: {car.horsepower ? `${car.horsepower} HP` : 'N/A'}</div>
                                <div>Tiêu hao: {car.fuelConsumption ? `${car.fuelConsumption} L/100km` : 'N/A'}</div>
                              </div>
                              <Button className="mt-4 w-full" size="sm" onClick={() => handleViewDetails(car.carId)}>
                                Xem chi tiết
                              </Button>
                            </div>
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