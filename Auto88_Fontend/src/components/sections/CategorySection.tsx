import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import metaService from '@/services/metaService';
import { Skeleton } from '@/components/ui/skeleton'; 

interface CategorySectionProps {
  onCategoryClick: (category: string) => void;
}

export default function CategorySection({ onCategoryClick }: CategorySectionProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // ĐÃ SỬA: Loại bỏ dấu // dư thừa trong link
  const categoryImages: Record<string, string> = {
    SEDAN: 'https://www.toyota.com.vn/Resources/Images/BCF393FA9AFEC309E1F2A98CF5A57CEB.png',
    SUV: 'https://www.toyota.com.vn/Resources/Images/DB64D61952050267C2FFE2272E14007E.png',
    HATCHBACK: 'https://www.toyota.com.vn/Resources/Images/2B145FE80DA2EB1E130C8767B693D021.png',
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

  return (
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
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

        <div className="flex flex-wrap justify-center gap-12 min-h-16 items-center">
          {loading ? (
            <>
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
              <Skeleton className="h-12 w-32" />
            </>
          ) : categories.length > 0 ? (
            categories.map((category) => {
              const imageUrl = categoryImages[category.toUpperCase()];

              return (
                <Button
                  key={category}
                  variant="ghost"
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-all duration-300 h-auto group border border-transparent hover:border-gray-200 rounded-xl"
                  onClick={() => onCategoryClick(category)}
                >
                  {imageUrl && (
                    <div className="w-24 flex justify-center">
                      <img 
                        src={imageUrl} 
                        alt={category} 
                        className="w-full h-auto object-contain transition-transform group-hover:scale-110 drop-shadow-md" 
                      />
                    </div>
                  )}
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-gray-900 uppercase tracking-widest">
                      {category}
                    </span>
                    <span className="text-xs text-red-500 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      Khám phá ngay →
                    </span>
                  </div>
                </Button>
              );
            })
          ) : (
            <div className="text-gray-500 py-4 w-full text-center">
              <p>Không tìm thấy danh mục nào.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}