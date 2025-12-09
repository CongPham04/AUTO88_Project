import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompareStore } from '@/store/compareStore';
import { toast } from 'sonner';
import { CarResponse } from '@/services/carService'; // Import type chuẩn
import { CarCard } from '@/components/CarCard'; // Import component CarCard đã chuẩn hóa

interface FeaturedCarsProps {
  cars: CarResponse[]; // Sử dụng đúng kiểu dữ liệu từ Service
  onViewDetails: (carId: number) => void;
  isLoading: boolean; 
}

// SkeletonCard giữ nguyên hoặc có thể tách ra component riêng nếu muốn tái sử dụng
const SkeletonCard = () => (
  <Card className="overflow-hidden border-none shadow-sm">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-4 w-1/4" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-6 w-1/3" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </CardContent>
  </Card>
);

export default function FeaturedCars({ cars, onViewDetails, isLoading }: FeaturedCarsProps) {
  const { addToCompare, compareList } = useCompareStore();

  const handleAddToCompare = (id: number) => {
    // Kiểm tra trùng lặp
    if (compareList.includes(id)) {
      toast.info('Xe này đã có trong danh sách so sánh');
      return;
    }
    
    const success = addToCompare(id);
    if (success) {
      toast.success('Đã thêm xe vào danh sách so sánh');
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
        
        {isLoading ? (
          // 1. Trạng thái Loading
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-96">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cars.length > 0 ? (
          // 2. Trạng thái có Data: Sử dụng CarCard component
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 min-h-96">
            {cars.map((car) => (
              <CarCard 
                key={car.carId}
                car={car}
                onViewDetails={onViewDetails}
                onAddToCompare={handleAddToCompare}
                isInCompareList={compareList.includes(car.carId)}
                viewMode="grid" // Ép buộc hiển thị dạng Grid cho phần nổi bật
              />
            ))}
          </div>
        ) : (
          // 3. Trạng thái Rỗng
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