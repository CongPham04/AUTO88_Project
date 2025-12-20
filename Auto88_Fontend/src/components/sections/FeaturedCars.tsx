import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompareStore } from '@/store/compareStore';
import { toast } from 'sonner';
import { CarResponse } from '@/services/carService'; 
import { CarCard } from '@/components/CarCard'; 

interface FeaturedCarsProps {
  cars: CarResponse[]; 
  onViewDetails: (carId: number) => void;
  isLoading: boolean; 
}

const SkeletonCard = () => (
  <Card className="overflow-hidden border-none shadow-sm">
    <Skeleton className="h-64 w-full" /> 
    <CardContent className="p-6 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-5 w-1/4" />
      </div>
      <Skeleton className="h-8 w-3/4" />
      <Skeleton className="h-5 w-1/2" />
      <div className="pt-4 flex justify-between items-center border-t">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </CardContent>
  </Card>
);

export default function FeaturedCars({ cars, onViewDetails, isLoading }: FeaturedCarsProps) {
  const { addToCompare, compareList } = useCompareStore();

  const handleAddToCompare = (id: number) => {
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
      {/* 
         ✅ THAY ĐỔI 1: Nới rộng container
         - max-w-7xl (1280px) -> max-w-[1600px] (Rộng hơn nhiều)
         - Hoặc dùng container-fluid bằng cách xóa max-w và chỉ để px-8 nếu muốn full màn hình
      */}
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
        
        <div className="text-center mb-12">
          {isLoading ? (
            <>
              <Skeleton className="h-10 w-1/3 mx-auto mb-3" />
              <Skeleton className="h-6 w-3/5 mx-auto" />
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">Xe nổi bật</h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-xl">Những mẫu xe được khách hàng quan tâm và đánh giá cao nhất</p>
            </>
          )}
        </div>
        
        {isLoading ? (
          // ✅ THAY ĐỔI 2: Chỉnh lại Grid Skeleton thành 4 cột
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 min-h-96">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : cars.length > 0 ? (
          // ✅ THAY ĐỔI 3: Chỉnh lại Grid Data thành 4 cột
          // - lg:grid-cols-4: Để 4 xe nằm trên cùng 1 hàng
          // - gap-8: Khoảng cách giữa các xe rộng rãi
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 min-h-96">
            {cars.map((car) => (
              <CarCard 
                key={car.carId}
                car={car}
                onViewDetails={onViewDetails}
                onAddToCompare={handleAddToCompare}
                isInCompareList={compareList.includes(car.carId)}
                viewMode="grid"
              />
            ))}
          </div>
        ) : (
          <div className="min-h-96 flex items-center justify-center text-center py-10 text-gray-500">
            <p>Hiện không có xe nào nổi bật.</p>
          </div>
        )}

        <div className="text-center mt-8">
          <Button 
            variant="outline" 
            size="lg" 
            onClick={() => onViewDetails(0)}
          >
            Xem tất cả xe ô tô
          </Button>
        </div>
      </div>
    </section>
  );
}