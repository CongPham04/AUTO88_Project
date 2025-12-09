import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit, Trash2, Search, Filter, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import carService, { CarResponse, Brand, Category } from '@/services/carService';
import searchService from '@/services/searchService';

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

const CarTableSkeleton = () => (
  <>
    {[...Array(10)].map((_, i) => (
      <tr key={i} className="border-b">
        <td className="p-4"><Skeleton className="h-10 w-14 rounded" /></td>
        <td className="p-4 space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-20" /></td>
        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
        <td className="p-4"><Skeleton className="h-4 w-16" /></td>
        <td className="p-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
        <td className="p-4"><div className="flex gap-2 justify-center"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
      </tr>
    ))}
  </>
);

export default function AdminCars() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Lấy giá trị filter từ URL
  const initialKeyword = searchParams.get('keyword') || '';
  const initialBrand = searchParams.get('brand') || 'ALL';
  const initialCategory = searchParams.get('category') || 'ALL';
  const initialYear = searchParams.get('year') || '';
  const initialPage = parseInt(searchParams.get('page') || '0', 10); // ✅ Lấy trang hiện tại từ URL

  const [cars, setCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State ✅
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10; // ✅ Cố định 10 sản phẩm/trang

  // Filter States
  const [keyword, setKeyword] = useState(initialKeyword);
  const [brand, setBrand] = useState<string>(initialBrand);
  const [category, setCategory] = useState<string>(initialCategory);
  const [year, setYear] = useState<string>(initialYear);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCar, setSelectedCar] = useState<CarResponse | null>(null);

  // --- HÀM TÌM KIẾM CHÍNH (GỌI BACKEND) ---
  const fetchCars = useCallback(async () => {
    try {
      setLoading(true);

      const params: any = {
        page: initialPage, // ✅ Thêm tham số page
        size: pageSize     // ✅ Thêm tham số size
      };

      if (initialKeyword) params.keyword = initialKeyword;
      if (initialBrand && initialBrand !== 'ALL') params.brand = initialBrand;
      if (initialCategory && initialCategory !== 'ALL') params.category = initialCategory;
      if (initialYear) params.yearFrom = Number(initialYear);

      // Gọi API Search (Backend cần hỗ trợ trả về Page<Car> hoặc wrapper có totalPages)
      // Giả sử searchService.searchCars trả về { content: [], totalPages: number, totalElements: number }
      // Nếu API hiện tại chỉ trả về List[], bạn cần update API hoặc client logic.
      // Dưới đây giả định API trả về mảng -> Client side pagination (Tạm thời) HOẶC API đã chuẩn.
      
      // ⚠️ CHÚ Ý: Nếu API backend chưa hỗ trợ phân trang server-side cho hàm search,
      // ta có thể fake phân trang client-side như sau (nếu data ít):
      
      const response: any = await searchService.searchCars(params);
      
      // *LOGIC ADAPTER*: Kiểm tra xem API trả về List hay Page Object
      if (Array.isArray(response)) {
        // Nếu API trả về mảng (chưa phân trang server), ta phân trang ở client tạm thời
        const allCars = response;
        setTotalElements(allCars.length);
        setTotalPages(Math.ceil(allCars.length / pageSize));
        const startIndex = initialPage * pageSize;
        setCars(allCars.slice(startIndex, startIndex + pageSize));
      } else if (response.content) {
         // Nếu API chuẩn trả về Page object
        setCars(response.content);
        setTotalPages(response.totalPages);
        setTotalElements(response.totalElements);
      } else {
        setCars([]); // Fallback
      }

    } catch (error) {
      toast.error('Lỗi tải danh sách xe');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [initialKeyword, initialBrand, initialCategory, initialYear, initialPage]);

  // Gọi fetch khi URL params thay đổi
  useEffect(() => { fetchCars(); }, [fetchCars]);

  // --- HANDLERS CẬP NHẬT URL PARAMS ---
  const updateSearchParams = (newParams: Record<string, string | undefined>) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      Object.entries(newParams).forEach(([key, value]) => {
        if (value && value !== 'ALL') {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
      return params;
    });
  };

  const handleSearch = () => {
    setPage(0); // Reset về trang 1 khi tìm kiếm
    updateSearchParams({ keyword: keyword.trim(), page: '0' });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') handleSearch(); };

  const handleBrandChange = (value: string) => {
    setBrand(value);
    setPage(0);
    updateSearchParams({ brand: value, page: '0' });
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setPage(0);
    updateSearchParams({ category: value, page: '0' });
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(e.target.value);
  };

  const handleYearBlur = () => {
    setPage(0);
    updateSearchParams({ year: year, page: '0' });
  };

  const clearFilters = () => {
    setKeyword(''); setBrand('ALL'); setCategory('ALL'); setYear(''); setPage(0);
    setSearchParams({}); // Xoá hết params -> Về mặc định
  };

  // ✅ Xử lý chuyển trang
  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
      updateSearchParams({ page: newPage.toString() });
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Cuộn lên đầu
    }
  };

  const handleDeleteConfirm = (car: CarResponse) => { setSelectedCar(car); setIsDeleteDialogOpen(true); };

  const handleDelete = async () => {
    if (!selectedCar) return;
    try {
      await carService.deleteCar(selectedCar.carId);
      toast.success('Xóa xe thành công');
      setIsDeleteDialogOpen(false);
      fetchCars();
    } catch (error: any) {
      toast.error(error.message || 'Lỗi xóa xe');
    }
  };

  const getStatusBadgeColor = (status: string) => status === 'AVAILABLE' ? 'bg-green-600' : 'bg-red-600';
  const getStatusText = (status: string) => status === 'AVAILABLE' ? 'Còn hàng' : 'Đã bán';

  return (
    <div className="space-y-6 py-4 px-4 sm:px-6 lg:px-8">
      {/* HEADER & TOOLBAR */}
      <div className="">
        <div className="flex flex-col gap-4">

          {/* Top Row: Title + Add Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-gray-800 shrink-0">Quản Lý Xe</h2>
            <Button onClick={() => navigate('/admin/cars/create')} className="bg-black hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" /> Nhập thêm xe mới
            </Button>
          </div>

          {/* Bottom Row: Search & Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 min-w-[200px] border border-gray-300 rounded-md bg-white shadow-sm py-2.5">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm tên xe, model..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 h-9 w-full bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            <Select value={brand} onValueChange={handleBrandChange}>
              <SelectTrigger className="h-9 w-[110px] text-sm bg-gray-50 border border-gray-300 rounded-md bg-white shadow-sm px-3">
                <div className="flex items-center truncate text-gray-600">
                  <Filter className="w-3.5 h-3.5 mr-2 opacity-70" />
                  <SelectValue placeholder="Hãng" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả hãng</SelectItem>
                {Object.values(Brand).map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="h-9 w-[110px] text-sm bg-gray-50 border border-gray-300 rounded-md bg-white shadow-sm px-3">
                <div className="flex items-center truncate text-gray-600">
                  <Filter className="w-3.5 h-3.5 mr-2 opacity-70" />
                  <SelectValue placeholder="Loại" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả loại</SelectItem>
                {Object.values(Category).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input
              placeholder="Năm SX"
              type="number"
              value={year}
              onChange={handleYearChange}
              onBlur={handleYearBlur}
              className="h-9 w-[110px] text-sm bg-gray-50 border border-gray-300 rounded-md bg-white shadow-sm px-3"
            />

            {(initialKeyword || initialBrand !== 'ALL' || initialCategory !== 'ALL' || initialYear) && (
              <Button variant="ghost" onClick={clearFilters} className="h-10 px-3 text-red-500 hover:text-red-700 hover:bg-red-50">
                <X className="w-4 h-4 mr-1" /> Xoá lọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden border-gray-100 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Hình ảnh</th>
                  <th className="p-4 font-semibold text-gray-600">Tên xe / Hãng</th>
                  <th className="p-4 font-semibold text-gray-600">Giá niêm yết</th>
                  <th className="p-4 font-semibold text-gray-600">Năm SX</th>
                  <th className="p-4 font-semibold text-gray-600">Tồn kho</th>
                  <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <CarTableSkeleton /> : cars.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <Search className="w-8 h-8 text-gray-300" />
                      <span>Không tìm thấy xe nào phù hợp với bộ lọc.</span>
                    </div>
                  </td></tr>
                ) : cars.map((car) => (
                  <tr key={car.carId} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <ImageWithFallback
                        src={car.imageUrls[0]}
                        alt={car.model}
                        className="w-16 h-12 object-cover rounded border bg-white"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{car.model}</div>
                      <div className="text-xs text-gray-500">{car.brand} - {car.category}</div>
                    </td>
                    <td className="p-4 text-red-600 font-semibold">
                      {formatPrice(car.price)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {car.manufactureYear}
                    </td>
                    <td className="p-4">
                      <span className="font-medium">{car.quantity}</span> chiếc
                    </td>
                    <td className="p-4">
                      <Badge className={`${getStatusBadgeColor(car.status)} text-white shadow-none hover:opacity-90`}>
                        {getStatusText(car.status)}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600" onClick={() => navigate(`/admin/cars/view/${car.carId}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={() => navigate(`/admin/cars/edit/${car.carId}`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteConfirm(car)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ PAGINATION UI */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-4 border-t bg-gray-50">
              <div className="text-xs text-gray-500 mt-2">
                Hiển thị <strong>{cars.length}</strong> trên tổng số <strong>{totalElements}</strong> xe
              </div>
              <div className="flex gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 0}
                  className="h-8 px-2 mt-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                {/* Logic hiển thị số trang đơn giản */}
                <div className="flex items-center gap-2 mt-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                     // Logic hiển thị trang thông minh hơn có thể implement sau
                     // Ở đây hiển thị tối đa 5 trang đầu hoặc sliding window
                     let p = i;
                     if (totalPages > 5 && page > 2) p = page - 2 + i;
                     if (p >= totalPages) return null;
                     
                     return (
                      <Button
                        key={p}
                        variant={p === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        className={`h-8 w-8 ${p === page ? "bg-black text-white pointer-events-none" : "hover:bg-gray-100"}`}
                      >
                        {p + 1}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                  className="h-8 px-2 mt-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa xe?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa xe <span className="font-bold">{selectedCar?.model}</span>?
              <br />Hành động này sẽ xóa toàn bộ dữ liệu liên quan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Xóa vĩnh viễn</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}