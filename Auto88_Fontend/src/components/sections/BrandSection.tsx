import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import metaService from '@/services/metaService';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton'; 

interface BrandSectionProps {
  onBrandClick: (brand: string) => void;
}

export default function BrandSection({ onBrandClick }: BrandSectionProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const brandLogos: Record<string, string> = {
    TOYOTA: 'https://upload.wikimedia.org/wikipedia/commons/e/ee/Toyota_logo_%28Red%29.svg',
    MERCEDES: 'https://upload.wikimedia.org/wikipedia/commons/9/90/Mercedes-Logo.svg',
    HYUNDAI: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Hyundai_Motor_Company_logo.svg',
    VINFAST: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Logo_of_VinFast_%283D%29.svg',
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const fetchedBrands = await metaService.getBrands();
        setBrands(fetchedBrands);
      } catch (error) {
        console.error("Failed to fetch brands", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // [SỬA LỖI] Xóa 'if (loading)' và chỉ return một bố cục
  return (
    <section className="py-12 bg-white">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Thương hiệu nổi bật</h2>
              <p className="text-gray-600 mb-4">
                Xe chính hãng từ các thương hiệu uy tín được ưa chuộng nhất
              </p>
            </>
          )}
        </div>

        {/* [SỬA LỖI] Thêm 'min-h-16' (64px) và 'items-center' để giữ bố cục */}
        <div className="flex flex-wrap justify-center gap-3 min-h-16 items-center">
          {loading ? (
            // Skeleton cho các nút
            <>
              <Skeleton className="h-16 w-36 rounded-lg" />
              <Skeleton className="h-16 w-40 rounded-lg" />
              <Skeleton className="h-16 w-36 rounded-lg" />
              <Skeleton className="h-16 w-40 rounded-lg" />
            </>
          ) : brands.length > 0 ? (
            // Dữ liệu
            brands.map((brand) => {
              const logo = brandLogos[brand.toUpperCase()];
              return (
                <Button
                  key={brand}
                  variant="ghost"
                  size="lg"
                  className="flex items-center gap-2 px-6 py-4 transition-all duration-300 hover:bg-red-600 hover:text-red-600"
                  onClick={() => onBrandClick(brand)}
                >
                  {logo && (
                    <ImageWithFallback
                      src={logo}
                      alt={brand}
                      className="w-10 h-10 object-contain bg-white rounded"
                    />
                  )}
                  <span className="font-semibold">{brand}</span>
                </Button>
              );
            })
          ) : (
            // Trạng thái rỗng
            <div className="text-gray-500 py-4 w-full text-center">
              <p>Không tìm thấy thương hiệu nào.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}