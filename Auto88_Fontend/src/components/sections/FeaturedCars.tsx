import { Eye, GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { useCompareStore } from '@/store/compareStore';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton'; 
// [LƯU Ý] Đảm bảo đường dẫn import 'cn' là đúng, tôi sẽ dùng đường dẫn bạn cung cấp
import { cn } from "@/components/ui/utils"; 

interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  originalPrice?: number;
  image: string;
  condition: string;
  promotion?: string;
  inStock: boolean;
  stockCount: number;
}

interface FeaturedCarsProps {
  cars: Car[];
  onViewDetails: (carId: number) => void;
  isLoading: boolean; 
}

// Đơn giản hóa SkeletonCard, không cần 'className' vì chỉ dùng 4 cái
const SkeletonCard = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-8 w-1/2" />
      </div>
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);

export default function FeaturedCars({ cars, onViewDetails, isLoading }: FeaturedCarsProps) {
  const { addToCompare, compareList } = useCompareStore();

  const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleAddToCompare = (id: number) => {
    const success = addToCompare(id);
    if (success) {
      toast.success('Đã thêm xe vào danh sách so sánh');
    } else if (compareList.includes(id)) {
      toast.info('Xe này đã có trong danh sách so sánh');
    } else {
      toast.error('Chỉ có thể so sánh tối đa 3 xe');
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          {isLoading ? (
            <>
              <Skeleton className="h-9 w-1/3 mx-auto mb-2" />
              <Skeleton className="h-5 w-3/5 mx-auto" />
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Xe nổi bật</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">Những mẫu xe được khách hàng quan tâm và đánh giá cao nhất</p>
            </>
          )}
        </div>
        
        {/* [SỬA LỖI] Bắt đầu logic 3 trạng thái TỪ ĐÂY */}
        
        {isLoading ? (
          // 1. Trạng thái Loading: Hiển thị grid với skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-96">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cars.length > 0 ? (
          // 2. Trạng thái có Data: Hiển thị grid với cars
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-96">
            {cars.map((car) => (
              <Card key={car.id} className="group hover:shadow-lg transition-all duration-300">
                <CardContent className="p-0">
                  <div className="relative overflow-hidden rounded-t-lg">
                    <ImageWithFallback src={car.image} alt={`${car.make} ${car.model}`} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div className="absolute top-3 left-3 space-y-2">
                      {car.condition === 'Mới' && (<Badge className="bg-red-600">Mới</Badge>)}
                      {car.promotion && (<Badge variant="destructive">Khuyến mãi</Badge>)}
                      {!car.inStock && (<Badge variant="secondary">Hết hàng</Badge>)}
                    </div>
                    <div className="absolute top-3 right-3 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="secondary" onClick={() => handleAddToCompare(car.id)} className="w-10 h-10 p-0">
                        <GitCompare className="w-4 h-4" />
                      </Button>
                    </div>
                    {car.inStock && car.stockCount <= 3 && (
                      <div className="absolute bottom-3 left-3">
                        <Badge variant="outline" className="bg-white/90">Chỉ còn {car.stockCount} xe</Badge>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-gray-900 mb-2">{car.make} {car.model} {car.year}</h3>
                    {car.promotion && (<p className="text-sm text-red-600 mb-2">{car.promotion}</p>)}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-2xl font-bold text-red-600">{formatPrice(car.price)}</div>
                        {car.originalPrice && (<div className="text-sm text-gray-500 line-through">{formatPrice(car.originalPrice)}</div>)}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={() => onViewDetails(car.id)} className="flex-1" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // 3. Trạng thái Rỗng: Hiển thị 1 div riêng, CĂN GIỮA
          // Div này nằm ngoài Grid, sẽ chiếm 100% width của 'max-w-7xl'
          <div className="min-h-96 flex items-center justify-center text-center py-10 text-gray-500">
            <p>Hiện không có xe nào nổi bật.</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" size="lg" onClick={() => onViewDetails(0)}>
            Xem tất cả xe ô tô
          </Button>
        </div>
      </div>
    </section>
  );
}