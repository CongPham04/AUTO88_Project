import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import metaService from '@/services/metaService';
import { Car, Truck, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; 

interface CategorySectionProps {
  onCategoryClick: (category: string) => void;
}

export default function CategorySection({ onCategoryClick }: CategorySectionProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const categoryIcons: Record<string, { icon: any; color: string }> = {
    SEDAN: { icon: Car, color: 'from-blue-500 to-blue-600' },
    SUV: { icon: Truck, color: 'from-green-500 to-green-600' },
    HATCHBACK: { icon: Users, color: 'from-purple-500 to-purple-600' },
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const cats = await metaService.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // [SỬA LỖI] Xóa 'if (loading)' và chỉ return một bố cục
  return (
    <section className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          {/* Skeleton cho tiêu đề */}
          {loading ? (
            <>
              <Skeleton className="h-9 w-1/3 mx-auto mb-2" />
              <Skeleton className="h-5 w-3/5 mx-auto" />
            </>
          ) : (
            <>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Danh mục xe ô tô</h2>
              <p className="text-gray-600 mb-4">
                Khám phá bộ sưu tập xe đa dạng từ các thương hiệu hàng đầu thế giới
              </p>
            </>
          )}
        </div>

        {/* [SỬA LỖI] Thêm 'min-h-16' (64px) và 'items-center' để giữ bố cục */}
        <div className="flex flex-wrap justify-center gap-4 min-h-16 items-center">
          {loading ? (
            // Skeleton cho các nút
            <>
              <Skeleton className="h-[60px] w-40 rounded-lg" />
              <Skeleton className="h-[60px] w-36 rounded-lg" />
              <Skeleton className="h-[60px] w-44 rounded-lg" />
            </>
          ) : categories.length > 0 ? (
            // Dữ liệu
            categories.map((category) => {
              const Icon = categoryIcons[category]?.icon || Car;
              const gradient = categoryIcons[category]?.color || 'from-gray-400 to-gray-500';

              return (
                <Button
                  key={category}
                  variant="ghost"
                  size="lg"
                  className={`flex items-center gap-2 bg-gradient-to-r ${gradient} text-white hover:opacity-90 transition-all duration-300`}
                  onClick={() => onCategoryClick(category)}
                >
                  <Icon className="w-10 h-10" />
                  <span className="font-semibold">{category}</span>
                </Button>
              );
            })
          ) : (
            // Trạng thái rỗng
            <div className="text-gray-500 py-4 w-full text-center">
              <p>Không tìm thấy danh mục nào.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}