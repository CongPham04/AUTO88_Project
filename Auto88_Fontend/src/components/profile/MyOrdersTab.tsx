import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/useUserStore';
import orderService, { OrderResponse, OrderStatus } from '@/services/orderService';
import carService, { CarResponse, getColorName } from '@/services/carService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Package, Clock, CheckCircle2, Truck, XCircle } from 'lucide-react';

// Helpers & Config
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const formatDate = (date: string) => new Date(date).toLocaleDateString('vi-VN');

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200', icon: CheckCircle2 },
  SHIPPING: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200', icon: Truck },
  DELIVERED: { label: 'Đã giao', color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200', icon: Package },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 hover:bg-green-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 hover:bg-red-200', icon: XCircle },
};

// Skeleton Loader
const MyOrdersTabSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3].map((i) => (
      <Card key={i}><CardContent className="p-4"><div className="flex gap-4"><Skeleton className="w-20 h-16 rounded-md" /><div className="flex-1 space-y-2"><Skeleton className="h-4 w-1/3" /><Skeleton className="h-3 w-1/4" /></div></div></CardContent></Card>
    ))}
  </div>
);

export default function MyOrdersTab() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Dialog Hủy đơn
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.userId) {
        try {
          setLoading(true);
          const [userOrders, allCars] = await Promise.all([
            orderService.getOrdersByUserId(user.userId),
            carService.getAllCars()
          ]);
          setOrders(userOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
          setCars(allCars);
        } catch (err) {
          toast.error('Lỗi tải đơn hàng');
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  const getCarImage = (carId: number) => {
    const car = cars.find(c => c.carId === carId);
    return (car?.imageUrls && car.imageUrls.length > 0) ? car.imageUrls[0] : (car?.imageUrl || '');
  };

  const openCancelDialog = (orderId: string) => {
    setCancelOrderId(orderId);
    setCancelReason('');
    setIsCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!cancelOrderId) return;
    if (!cancelReason.trim()) {
        toast.warning("Vui lòng nhập lý do hủy đơn");
        return;
    }

    try {
      setIsCancelling(true);
      await orderService.cancelOrder(cancelOrderId, cancelReason);
      setOrders(prev => prev.map(o => o.orderId === cancelOrderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o));
      toast.success("Hủy đơn hàng thành công");
      setIsCancelDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Lỗi hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <MyOrdersTabSkeleton />;

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-dashed">
        <Package className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 mb-4">Bạn chưa có đơn hàng nào</p>
        <Button onClick={() => navigate('/cars')} size="sm">Mua sắm ngay</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const StatusIcon = statusConfig[order.status]?.icon || AlertCircle;
        const firstItem = order.orderDetails[0];

        // Lấy màu sắc và chuyển sang Tiếng Việt
        const rawColor = (firstItem as any).colorName || 'BLACK'; // Lấy từ API (thường là tiếng Anh: RED, BLUE...)
        const displayColor = getColorName(rawColor); // Chuyển sang: Đỏ, Xanh...

        return (
          <Card key={order.orderId} className="overflow-hidden hover:shadow-sm transition-shadow border border-gray-200">
            <CardContent className="p-0">
              {/* Header Card */}
              <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50/80">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-xs text-gray-500">#{order.orderId.substring(0, 8).toUpperCase()}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-xs text-gray-500">{formatDate(order.createdAt)}</span>
                </div>
                <Badge variant="secondary" className={`${statusConfig[order.status]?.color} font-normal text-[10px] px-2 py-0.5 border-none flex items-center gap-1`}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[order.status]?.label}
                </Badge>
              </div>

              {/* Body Card */}
              <div className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                {/* Image - CỐ ĐỊNH KÍCH THƯỚC NHỎ */}
                <div className="w-24 h-16 bg-gray-100 rounded border overflow-hidden flex-shrink-0">
                  <ImageWithFallback 
                    src={getCarImage(firstItem.carId)} 
                    alt={firstItem.carModel} 
                    className="w-full h-full object-cover" 
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 self-start">
                  <h4 className="font-semibold text-sm text-gray-900 truncate" title={firstItem.carModel}>{firstItem.carModel}</h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-gray-500">
                    <div className='flex'>
                      <span className='flex'>Màu: </span>
                      <span className='font-medium ml-2'>{displayColor}</span>
                    </div>
                    <div className='flex'>
                      <span className='font-medium'>x{firstItem.quantity}</span>
                    </div>
                    {order.orderDetails.length > 1 && <span className="italic text-blue-600">+ {order.orderDetails.length - 1} sản phẩm khác</span>}
                  </div>
                  <div className="mt-1 text-sm font-medium text-red-600">
                    {formatPrice(order.totalAmount)}
                  </div>
                </div>

                {/* Actions - NÚT NHỎ GỌN */}
                <div className="flex gap-2 w-full sm:w-auto sm:flex-col md:flex-row justify-end">
                   <Button variant="outline" size="sm" className="h-8 text-xs px-3" onClick={() => navigate(`/profile/orders/${order.orderId}`)}>
                      Chi tiết
                   </Button>
                   
                   {order.status === 'PENDING' && (
                      <Button variant="ghost" size="sm" className="h-8 text-xs px-3 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => openCancelDialog(order.orderId)}>
                         Hủy đơn
                      </Button>
                   )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Dialog Hủy */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-red-600 text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Xác nhận hủy đơn
            </DialogTitle>
            <DialogDescription className="text-xs">
              Hành động này không thể hoàn tác. Vui lòng nhập lý do hủy bên dưới.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
             <Label htmlFor="reason" className="text-xs font-semibold mb-1.5 block">Lý do hủy <span className="text-red-500">*</span></Label>
             <Textarea 
                id="reason" 
                placeholder="Nhập lý do..." 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="text-sm min-h-[80px]"
             />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
             <Button variant="outline" size="sm" onClick={() => setIsCancelDialogOpen(false)} disabled={isCancelling}>Đóng</Button>
             <Button variant="destructive" size="sm" onClick={handleConfirmCancel} disabled={isCancelling}>
                {isCancelling ? "Đang xử lý..." : "Hủy đơn hàng"}
             </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}