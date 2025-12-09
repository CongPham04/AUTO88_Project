import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, Edit, Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import orderService, { OrderResponse } from '@/services/orderService';

// Helpers
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const statusConfig: Record<string, { label: string, color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Đã giao', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

const OrderTableSkeleton = () => (
  <>
    {[...Array(10)].map((_, i) => (
      <tr key={i} className="border-b">
        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
        <td className="p-4 space-y-1"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-24" /></td>
        <td className="p-4"><Skeleton className="h-4 w-20" /></td>
        <td className="p-4"><Skeleton className="h-4 w-24" /></td>
        <td className="p-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
        <td className="p-4"><div className="flex gap-2"><Skeleton className="h-8 w-8" /><Skeleton className="h-8 w-8" /></div></td>
      </tr>
    ))}
  </>
);

export default function AdminOrders() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'ALL';
  const initialPage = parseInt(searchParams.get('page') || '1', 10); // ✅ Lấy trang từ URL (bắt đầu từ 1)

  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([]);
  const [paginatedOrders, setPaginatedOrders] = useState<OrderResponse[]>([]); // ✅ Data cho trang hiện tại
  const [loading, setLoading] = useState(true);
  
  // Filter & Pagination States
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(initialPage);
  const itemsPerPage = 10; // ✅ Cố định 10 items/trang

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      // Sắp xếp mới nhất trước
      const sorted = data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(sorted);
      // Filter logic sẽ chạy ở useEffect dưới
    } catch (error) {
      toast.error('Lỗi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // Client-side Filtering Logic
  useEffect(() => {
    let result = orders;
    
    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status === statusFilter);
    }
    
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      result = result.filter(o => 
        o.orderId.toLowerCase().includes(lowerTerm) || 
        o.fullName.toLowerCase().includes(lowerTerm) ||
        o.phone.includes(searchTerm)
      );
    }
    
    setFilteredOrders(result);
    setCurrentPage(1); // Reset về trang 1 khi filter thay đổi
  }, [orders, statusFilter, searchTerm]);

  // ✅ Pagination Logic: Cắt mảng filteredOrders theo trang hiện tại
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPaginatedOrders(filteredOrders.slice(startIndex, endIndex));
  }, [filteredOrders, currentPage]);

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setSearchParams(prev => {
      const newParams = new URLSearchParams(prev);
      value !== 'ALL' ? newParams.set('status', value) : newParams.delete('status');
      newParams.set('page', '1'); // Reset URL page
      return newParams;
    });
  };

  // ✅ Xử lý chuyển trang
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setSearchParams(prev => {
        const newParams = new URLSearchParams(prev);
        newParams.set('page', newPage.toString());
        return newParams;
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6 py-4 px-4 sm:px-6 lg:px-8">
      {/* HEADER & TOOLBAR */}
      <div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-bold text-gray-800 shrink-0">Quản Lý Đơn Hàng</h2>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-[200px] border border-gray-300 rounded-md bg-white shadow-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Tìm mã đơn, tên khách, SĐT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-9 text-sm bg-gray-50 focus:bg-white"
              />
            </div>

            {/* Filter Status */}
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-9 w-[160px] bg-gray-50 border-gray-200">
                <div className="flex items-center truncate text-gray-600">
                  <Filter className="w-3.5 h-3.5 mr-2 opacity-70" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                {Object.keys(statusConfig).map(status => (
                  <SelectItem key={status} value={status}>{statusConfig[status].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                  <th className="p-4 font-semibold text-gray-600">Mã đơn</th>
                  <th className="p-4 font-semibold text-gray-600">Khách hàng</th>
                  <th className="p-4 font-semibold text-gray-600">Tổng tiền</th>
                  <th className="p-4 font-semibold text-gray-600">Ngày đặt</th>
                  <th className="p-4 font-semibold text-gray-600">Trạng thái</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? <OrderTableSkeleton /> : paginatedOrders.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-500">Không tìm thấy đơn hàng nào.</td></tr>
                ) : paginatedOrders.map((order) => (
                  <tr key={order.orderId} className="border-b hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-medium text-blue-600">
                      #{order.orderId.substring(0, 8).toUpperCase()}
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">{order.fullName}</div>
                      <div className="text-xs text-gray-500">{order.phone}</div>
                    </td>
                    <td className="p-4 font-semibold text-gray-900">
                      {formatPrice(order.totalAmount)}
                    </td>
                    <td className="p-4 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="p-4">
                      <Badge className={`${statusConfig[order.status]?.color || 'bg-gray-100'} shadow-none font-normal`}>
                        {statusConfig[order.status]?.label || order.status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50 hover:text-blue-600" onClick={() => navigate(`/admin/orders/view/${order.orderId}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-gray-100" onClick={() => navigate(`/admin/orders/edit/${order.orderId}`)}>
                          <Edit className="h-4 w-4" />
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
                Hiển thị <strong>{paginatedOrders.length}</strong> trên tổng số <strong>{filteredOrders.length}</strong> đơn hàng
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="h-8 px-2 mt-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center gap-1 mt-2">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                     let p = i + 1;
                     if (totalPages > 5 && currentPage > 3) p = currentPage - 2 + i;
                     if (p > totalPages) return null;
                     
                     return (
                      <Button
                        key={p}
                        variant={p === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(p)}
                        className={`h-8 w-8 ${p === currentPage ? "bg-black text-white pointer-events-none" : "hover:bg-gray-100"}`}
                      >
                        {p}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="h-8 px-2 mt-2"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}