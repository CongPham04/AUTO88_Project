import { CarResponse, Color, CarStatus } from '@/services/carService'; // Import từ service chuẩn
import { Heart, RefreshCw, ShoppingCart, Eye, TrendingUp, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

// Interface Props sử dụng trực tiếp CarResponse
interface CarCardProps {
  car: CarResponse; // Sử dụng CarResponse thay vì định nghĩa lại interface Car cục bộ
  onViewDetails: (id: number) => void;
  onAddToCompare: (id: number) => void;
  isInCompareList?: boolean;
  viewMode?: 'grid' | 'list';
}

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

export function CarCard({ car, onViewDetails, onAddToCompare, isInCompareList = false, viewMode = 'grid' }: CarCardProps) {

  // Helper lấy ảnh đại diện an toàn
  const displayImage = (car.imageUrls && car.imageUrls.length > 0) ? car.imageUrls[0] : (car.imageUrl || '');

  // Helper lấy màu sắc hiển thị (chuyển Enum sang string hoặc lấy màu đầu tiên)
  const displayColor = Array.isArray(car.colors) && car.colors.length > 0
    ? car.colors.join(', ') // Hiển thị "RED, BLACK"
    : (car.color || 'N/A');

  if (viewMode === 'list') {
    return (
      <Card className="flex flex-col md:flex-row overflow-hidden hover:shadow-lg transition-shadow duration-300 border-none bg-white">
        <div className="w-full md:w-1/3 relative h-full md:h-auto">
          <ImageWithFallback
            src={displayImage}
            alt={car.model}
            className="w-full h-full object-cover"
          />
          <Badge className={`absolute top-2 right-2 ${car.status === 'AVAILABLE' ? 'bg-green-600' : 'bg-red-600'}`}>
            {car.status === 'AVAILABLE' ? 'Có sẵn' : 'Hết'}
          </Badge>
        </div>
        <CardContent className="flex-2 p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">{car.brand} • {car.manufactureYear}</p>
                <h3 className="text-xl font-bold text-gray-900 mt-1">{car.model}</h3>
              </div>
              <span className="text-lg font-bold text-red-600 bg-red-50 px-1 py-1 rounded-lg">
                {formatPrice(car.price)}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mt-3 text-sm text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded">{car.category}</span>
              <span className="bg-gray-100 px-2 py-1 rounded">Màu: {displayColor}</span>
              {/* Nếu có detail có thể hiển thị thêm */}
              {car.detail && <span className="bg-gray-100 px-2 py-1 rounded">{car.detail.transmission}</span>}
              {/* ✅ THÊM SỐ LƯỢNG ĐÃ BÁN (LIST VIEW) */}
              <span className="bg-orange-50 text-orange-700 px-2 py-1 rounded border border-orange-100 flex items-center gap-1">
                <TrendingUp size={12} /> Đã bán: {car.soldQuantity}
              </span>
            </div>

            <p className="mt-4 text-gray-600 line-clamp-2 text-sm">
              {car.description || 'Chưa có mô tả.'}
            </p>
          </div>

          <div className="flex gap-3 mt-6 pt-4 border-t">
            <Button onClick={() => onViewDetails(car.carId)} className="flex-1 bg-black text-white hover:bg-gray-800">
              Xem chi tiết
            </Button>
            <Button variant="outline" size="icon" onClick={() => onAddToCompare(car.carId)} className={isInCompareList ? "text-blue-600 border-blue-600 bg-blue-50" : ""}>
              <GitCompare className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid View (Mặc định)
  return (
    <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 border-none bg-white h-full flex flex-col">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ImageWithFallback
          src={displayImage}
          alt={car.model}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <Button size="icon" variant="secondary" className="rounded-full shadow-lg" onClick={() => onViewDetails(car.carId)} title="Xem chi tiết">
            <Eye className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="secondary" className={`rounded-full shadow-lg ${isInCompareList ? 'text-blue-600 bg-blue-50' : ''}`} onClick={() => onAddToCompare(car.carId)} title="So sánh">
            <GitCompare className="w-4 h-4" /> 
          </Button>
        </div>
        <Badge className={`absolute top-3 left-3 ${car.status === 'AVAILABLE' ? 'bg-green-600' : 'bg-red-600'}`}>
          {car.status === 'AVAILABLE' ? 'Có sẵn' : 'Hết'}
        </Badge>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="mb-2 flex justify-between items-start">
          <span className="text-xs font-bold text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">{car.brand}</span>
          <span className="text-xs text-gray-500">{car.manufactureYear}</span>
        </div>

        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate" title={car.model}>{car.model}</h3>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
            <TrendingUp size={12} className="text-orange-500" />
            <span>Đã bán: <span className="font-medium text-gray-700">{car.soldQuantity}</span></span>
        </div>

        <div className="mt-auto pt-3 flex items-center justify-between border-t border-gray-100">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-medium">Giá bán</span>
            <span className="text-red-600 font-bold text-lg">{formatPrice(car.price)}</span>
          </div>
          <Button variant="ghost" size="sm" className="text-xs hover:bg-gray-100" onClick={() => onViewDetails(car.carId)}>
            Chi tiết <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Icon ArrowRight dùng tạm nếu chưa import
function ArrowRight(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
  )
}