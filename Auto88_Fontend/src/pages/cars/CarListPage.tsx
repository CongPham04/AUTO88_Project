import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, Grid, List } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
// [THÊM MỚI] Import component Pagination
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { CarCard } from '@/components/CarCard';
import { useCompareStore } from '@/store/compareStore';
import { toast } from 'sonner';
import { CarResponse } from '@/services/carService'; // Chỉ import type
import metaService from '@/services/metaService';
import searchService from '@/services/searchService';
import { Skeleton } from '@/components/ui/skeleton';

// [THÊM MỚI] Định nghĩa số xe mỗi trang
const CARS_PER_PAGE = 9;

// Định nghĩa kiểu cho bộ lọc
type Filters = {
  brand: string;
  category: string;
  priceRange: [number, number];
  year: string;
  color: string;
};

// Tự động tạo danh sách năm
const CURRENT_YEAR = 2025;
const YEARS = Array.from({ length: 15 }, (_, i) => String(CURRENT_YEAR - i));

// Skeleton cho 1 thẻ xe
const SkeletonCard = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-48 w-full" />
    <CardContent className="p-4 space-y-3">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="h-9 w-full" />
    </CardContent>
  </Card>
);

// Skeleton cho Sidebar bộ lọc
const SkeletonSidebar = () => (
  <Card>
    <CardContent className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-5 w-16" />
      </div>
      <Separator />
      <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
      <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
      <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-8 w-full" /></div>
      <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
      <div className="space-y-2"><Skeleton className="h-4 w-16" /><Skeleton className="h-10 w-full" /></div>
    </CardContent>
  </Card>
);


export default function CarListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [cars, setCars] = useState<CarResponse[]>([]); // State này giữ TẤT CẢ xe (đã lọc)
  const [brands, setBrands] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  
  const [carsLoading, setCarsLoading] = useState(true);
  const [metaLoading, setMetaLoading] = useState(true);
  
  const [error, setError] = useState<string | null>(null);

  // State cho phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [paginatedCars, setPaginatedCars] = useState<CarResponse[]>([]); // 9 xe để hiển thị

  // State giờ đọc từ URL khi khởi tạo
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get('q') || '');
  const [filters, setFilters] = useState<Filters>({
    brand: searchParams.get('brand') || 'Tất cả hãng',
    category: searchParams.get('category') || 'Tất cả loại xe',
    priceRange: [
      Number(searchParams.get('priceMin') || 0),
      Number(searchParams.get('priceMax') || 3000000000)
    ] as [number, number],
    year: searchParams.get('year') || 'Tất cả năm',
    color: searchParams.get('color') || 'Tất cả màu sắc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'newest');
  const [showFilters, setShowFilters] = useState(true);

  const { compareList, addToCompare } = useCompareStore();

  // useEffect này CHỈ LẤY metadata (brands, colors...)
  useEffect(() => {
    const fetchMetaData = async () => {
      setMetaLoading(true);
      try {
        const [brandsData, categoriesData, colorsData] = await Promise.all([
          metaService.getBrands(),
          metaService.getCategories(),
          metaService.getColors(),
        ]);
        setBrands(brandsData);
        setCategories(categoriesData);
        setColors(colorsData);
      } catch (err) {
        toast.error('Lỗi khi tải dữ liệu bộ lọc.');
        console.error(err);
      } finally {
        setMetaLoading(false);
      }
    };

    fetchMetaData();
  }, []); // Chỉ chạy 1 lần

  // useEffect QUAN TRỌNG: Lắng nghe URL và fetch/paginate dữ liệu
  useEffect(() => {
    const fetchCars = async () => {
      try {
        setCarsLoading(true);
        setError(null);

        // 1. Đọc tất cả params từ URL, bao gồm cả 'page'
        const q = searchParams.get('q');
        const brand = searchParams.get('brand');
        const category = searchParams.get('category');
        const priceMin = searchParams.get('priceMin');
        const priceMax = searchParams.get('priceMax');
        const year = searchParams.get('year');
        const color = searchParams.get('color');
        const sort = searchParams.get('sort') || 'newest';
        const page = Number(searchParams.get('page') || '1'); // Đọc 'page'

        // 2. Cập nhật state (bao gồm cả currentPage)
        setSearchTerm(q || '');
        setSortBy(sort);
        setCurrentPage(page);
        setFilters({
          brand: brand || 'Tất cả hãng',
          category: category || 'Tất cả loại xe',
          priceRange: [
            Number(priceMin || 0),
            Number(priceMax || 3000000000)
          ] as [number, number],
          year: year || 'Tất cả năm',
          color: color || 'Tất cả màu sắc'
        });

        // 3. Chuẩn bị params cho API
        const apiParams = {
          keyword: q || undefined,
          brand: brand || undefined,
          category: category || undefined,
          priceMin: priceMin ? Number(priceMin) : undefined,
          priceMax: priceMax ? Number(priceMax) : undefined,
          yearFrom: year ? Number(year) : undefined,
          color: color || undefined,
        };

        // 4. Fetch TẤT CẢ xe phù hợp
        const carsData = await searchService.searchCars(apiParams);

        // 5. Sắp xếp kết quả (Client-side)
        let sortedCars = [...carsData];
        switch (sort) {
          case 'price-asc':
            sortedCars.sort((a, b) => a.price - b.price);
            break;
          case 'price-desc':
            sortedCars.sort((a, b) => b.price - a.price);
            break;
          case 'year-desc':
            sortedCars.sort((a, b) => b.manufactureYear - a.manufactureYear);
            break;
          case 'name':
            sortedCars.sort((a, b) => a.model.localeCompare(b.model));
            break;
          case 'newest':
          default:
            sortedCars.sort((a, b) => b.carId - a.carId);
            break;
        }

        // 6. Thực hiện phân trang
        setCars(sortedCars); // Lưu lại toàn bộ kết quả

        const total = sortedCars.length;
        setTotalPages(Math.ceil(total / CARS_PER_PAGE)); // Tính tổng số trang

        const startIndex = (page - 1) * CARS_PER_PAGE;
        const endIndex = startIndex + CARS_PER_PAGE;
        setPaginatedCars(sortedCars.slice(startIndex, endIndex)); // Cắt 9 xe cho trang hiện tại

      } catch (err) {
        setError('Không tải được danh sách xe.');
        console.error(err);
      } finally {
        setCarsLoading(false);
      }
    };

    fetchCars();
  }, [searchParams]); // Vẫn chỉ phụ thuộc vào searchParams

  
  const updateQueryParams = (newParams: Record<string, string | number | [number, number]>) => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(newParams).forEach(([key, value]) => {
      const isDefaultValue =
        value === 'Tất cả hãng' ||
        value === 'Tất cả loại xe' ||
        value === 'Tất cả năm' ||
        value === 'Tất cả màu sắc' ||
        value === '';
      
      if (isDefaultValue) {
        newSearchParams.delete(key);
      } else if (key === 'priceRange' && Array.isArray(value)) {
        const [min, max] = value;
        if (min > 0) {
          newSearchParams.set('priceMin', String(min));
        } else {
          newSearchParams.delete('priceMin');
        }
        if (max < 3000000000) {
          newSearchParams.set('priceMax', String(max));
        } else {
          newSearchParams.delete('priceMax');
        }
      } else if (key !== 'priceRange') {
        newSearchParams.set(key, String(value));
      }
    });

    // Khi lọc, luôn reset về trang 1
    newSearchParams.delete('page');

    setSearchParams(newSearchParams);
  };

  // Hàm xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('page', String(newPage));
    setSearchParams(newSearchParams);
    // Cuộn lên đầu trang khi chuyển trang
    window.scrollTo(0, 0);
  };

  const handleSearch = () => {
    updateQueryParams({ q: searchTerm });
  };

  const handleFilterChange = (key: keyof Filters, value: string | [number, number]) => {
    updateQueryParams({ [key]: value });
  };

  const handleSortChange = (value: string) => {
    updateQueryParams({ sort: value });
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams(new URLSearchParams()); // Tự động reset cả 'page'
  };

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

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // [THÊM MỚI] Kiểm tra xem có đang lọc hay không
  // Chúng ta kiểm tra tất cả các key có thể có, ngoại trừ 'sort' và 'page'
  const isFiltering = 
    searchParams.has('q') ||
    searchParams.has('brand') ||
    searchParams.has('category') ||
    searchParams.has('priceMin') ||
    searchParams.has('priceMax') ||
    searchParams.has('year') ||
    searchParams.has('color');

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - (Tĩnh, giữ nguyên) */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Danh sách xe ô tô</h1>
          
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex items-center gap-4 w-full lg:w-auto">
              <div className="relative flex-1 lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Tìm kiếm theo tên xe..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-48 cursor-pointer hover:bg-gray-100 transition-colors">
                  <SelectValue placeholder="Sắp xếp theo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest" className="cursor-pointer hover:bg-gray-100 transition-colors">Mới nhất</SelectItem>
                  <SelectItem value="price-asc" className="cursor-pointer hover:bg-gray-100 transition-colors">Giá tăng dần</SelectItem>
                  <SelectItem value="price-desc" className="cursor-pointer hover:bg-gray-100 transition-colors">Giá giảm dần</SelectItem>
                  <SelectItem value="year-desc" className="cursor-pointer hover:bg-gray-100 transition-colors">Năm mới nhất</SelectItem>
                  <SelectItem value="name" className="cursor-pointer hover:bg-gray-100 transition-colors">Tên A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="hidden md:flex items-center border rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            {metaLoading ? (
              <SkeletonSidebar />
            ) : (
              <Card>
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Bộ lọc tìm kiếm</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Xóa tất cả
                    </Button>
                  </div>
                  <Separator />
                  <div>
                    <Label>Hãng xe</Label>
                    <Select
                      value={filters.brand}
                      onValueChange={(value) => handleFilterChange('brand', value)}
                    >
                      <SelectTrigger className="cursor-pointer hover:bg-gray-100 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tất cả hãng" className="cursor-pointer hover:bg-gray-100 transition-colors">Tất cả hãng</SelectItem>
                        {brands.map(brand => <SelectItem key={brand} value={brand} className="cursor-pointer hover:bg-gray-100 transition-colors">{brand}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Loại xe</Label>
                    <Select
                      value={filters.category}
                      onValueChange={(value) => handleFilterChange('category', value)}
                    >
                      <SelectTrigger className="cursor-pointer hover:bg-gray-100 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tất cả loại xe" className="cursor-pointer hover:bg-gray-100 transition-colors">Tất cả loại xe</SelectItem>
                        {categories.map(category => <SelectItem key={category} value={category} className="cursor-pointer hover:bg-gray-100 transition-colors">{category}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Khoảng giá</Label>
                    <div className="mt-2">
                      <Slider
                        value={filters.priceRange}
                        onValueChange={(value: number[]) => {
                          setFilters(prev => ({...prev, priceRange: value as [number, number]}));
                        }}
                        onPointerUp={() => {
                          handleFilterChange('priceRange', filters.priceRange);
                        }}
                        max={3000000000}
                        step={50000000}
                        className="cursor-pointer mb-2"
                      />
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>{formatPrice(filters.priceRange[0])}</span>
                        <span>{formatPrice(filters.priceRange[1])}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label>Năm sản xuất</Label>
                    <Select
                      value={filters.year}
                      onValueChange={(value) => handleFilterChange('year', value)}
                    >
                      <SelectTrigger className="cursor-pointer hover:bg-gray-100 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tất cả năm" className="cursor-pointer hover:bg-gray-100 transition-colors">Tất cả năm</SelectItem>
                        {YEARS.map(year => (
                          <SelectItem key={year} value={year} className="cursor-pointer hover:bg-gray-100 transition-colors">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Màu sắc</Label>
                    <Select
                      value={filters.color}
                      onValueChange={(value) => handleFilterChange('color', value)}
                    >
                      <SelectTrigger className="cursor-pointer hover:bg-gray-100 transition-colors">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tất cả màu sắc" className="cursor-pointer hover:bg-gray-100 transition-colors">Tất cả màu sắc</SelectItem>
                        {colors.map(color => <SelectItem key={color} value={color} className="cursor-pointer hover:bg-gray-100 transition-colors">{color}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              {/* [THAY ĐỔI] Chỉ hiển thị text khi đang tải hoặc đang lọc */}
              {carsLoading ? (
                <p className="text-gray-600">Đang tìm kiếm...</p>
              ) : isFiltering ? (
                <p className="text-gray-600">
                  Tìm thấy {cars.length} xe phù hợp
                </p>
              ) : null} {/* Nếu không lọc, không hiển thị gì cả */}
            </div>

            {carsLoading ? (
              // 1. Trạng thái Loading: Hiển thị 9 skeletons
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {viewMode === 'grid' ? (
                  <>
                    {[...Array(9)].map((_, i) => <SkeletonCard key={i} />)}
                  </>
                ) : (
                  <>
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                  </>
                )}
              </div>
            ) : error ? (
              // 2. Trạng thái Lỗi
              <div className="text-center py-12 text-red-600">
                <p className="text-lg mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Tải lại trang
                </Button>
              </div>
            ) : cars.length > 0 ? (
              // 3. Trạng thái có Data
              <>
                <div className={viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                  : 'space-y-4'
                }>
                  {paginatedCars.map((car) => (
                    <CarCard
                      key={car.carId}
                      car={car}
                      onViewDetails={(id: number) => navigate(`/cars/${id}`)}
                      onAddToCompare={handleAddToCompare}
                      isInCompareList={compareList.includes(car.carId)}
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Dùng INLINE STYLE để ép nhận khoảng cách */}
                {totalPages > 1 && (
                  <div 
                    className="flex justify-center" 
                    style={{ marginTop: '6rem' }} /* 6rem = 96px */
                  >
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <Button
                            variant="ghost"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            aria-label="Trang trước"
                          >
                            <PaginationPrevious className="cursor-pointer" />
                          </Button>
                        </PaginationItem>
                        
                        <PaginationItem>
                          <span className="font-medium text-sm px-4 py-2 border rounded-md bg-white">
                            Trang {currentPage} / {totalPages}
                          </span>
                        </PaginationItem>

                        <PaginationItem>
                          <Button
                            variant="ghost"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            aria-label="Trang sau"
                          >
                            <PaginationNext className="cursor-pointer" />
                          </Button>
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              // 4. Trạng thái Rỗng
              <div className="text-center py-12 min-h-96 flex flex-col items-center justify-center">
                <p className="text-gray-500 text-lg mb-4">
                  Không tìm thấy xe nào phù hợp với tiêu chí của bạn
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Xóa bộ lọc
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}