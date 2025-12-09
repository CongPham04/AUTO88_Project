import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, CreditCard, MapPin, Package, User, CheckCircle2, 
  Truck, Clock, XCircle, FileText, DollarSign, Box, AlertTriangle, 
  Phone,
  Mail,
  User2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import orderService, { OrderResponse } from '@/services/orderService';
import carService, { CarResponse, getColorName } from '@/services/carService'; // ✅ Import getColorName
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton';

// ... (Giữ nguyên các helper formatPrice, formatDate, statusConfig, paymentStatusMap, OrderDetailSkeleton) ...

// Copy lại các helpers để đảm bảo file hoạt động độc lập
const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const formatDate = (dateString: string) => new Date(dateString).toLocaleString('vi-VN');

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  PENDING: { label: 'Chờ xử lý', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
  SHIPPING: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800 border-purple-200', icon: Truck },
  DELIVERED: { label: 'Đã giao hàng', color: 'bg-indigo-100 text-indigo-800 border-indigo-200', icon: Package },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
};

const paymentStatusMap: Record<string, string> = {
  PENDING: 'Chưa thanh toán',
  SUCCESS: 'Đã thanh toán',
  FAILED: 'Thanh toán lỗi',
};

const OrderDetailSkeleton = () => (
  <div className="max-w-7xl mx-auto py-8 px-4">
    <Skeleton className="h-8 w-48 mb-6" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
      </div>
    </div>
  </div>
);

export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cancel Logic
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      if (orderId) {
        try {
          setLoading(true);
          const [orderData, allCars] = await Promise.all([
            orderService.getOrderById(orderId),
            carService.getAllCars()
          ]);
          setOrder(orderData);
          setCars(allCars);
        } catch (err) {
            // Handle error
        } finally {
          setLoading(false);
        }
      }
    };
    fetchOrder();
  }, [orderId]);

  const getCarImage = (carId: number) => {
    const car = cars.find(c => c.carId === carId);
    if (car?.imageUrls && car.imageUrls.length > 0) return car.imageUrls[0];
    return car?.imageUrl || '';
  };

  const handleConfirmCancel = async () => {
    if (!order) return;
    if (!cancelReason.trim()) {
        toast.warning("Vui lòng nhập lý do hủy đơn");
        return;
    }

    try {
      setIsCancelling(true);
      await orderService.cancelOrder(order.orderId, cancelReason);
      setOrder({ ...order, status: 'CANCELLED' as any }); 
      toast.success("Hủy đơn hàng thành công");
      setIsCancelDialogOpen(false);
    } catch (error: any) {
      toast.error(error.message || "Lỗi hủy đơn hàng");
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) return <OrderDetailSkeleton />;
  if (!order) return <div className="text-center py-20">Đơn hàng không tồn tại</div>;

  const StatusIcon = statusConfig[order.status]?.icon || Box;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div 
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 cursor-pointer w-fit mb-6 transition-colors font-medium" 
          onClick={() => navigate('/profile?tab=orders')}
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đơn hàng
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8"> 
          
          {/* LEFT COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-4 border-b">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <CardTitle className="text-xl flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Đơn hàng #{order.orderId.slice(0, 8).toUpperCase()}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <Calendar className="w-4 h-4" /> Đặt ngày: {formatDate(order.orderDate || order.createdAt)}
                    </p>
                  </div>
                  <Badge variant="outline" className={`px-3 py-1 text-sm font-normal flex items-center gap-1.5 ${statusConfig[order.status]?.color}`}>
                    <StatusIcon className="w-3.5 h-3.5" />
                    {statusConfig[order.status]?.label || order.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-4">
                {/* Danh sách sản phẩm */}
                <div className="space-y-4">
                  {order.orderDetails.map((item) => {
                    // ✅ Chuyển đổi màu sắc sang tiếng Việt
                    const rawColor = (item as any).colorName || 'BLACK';
                    const displayColor = getColorName(rawColor);

                    return (
                      <div key={item.orderDetailId} className="flex flex-col sm:flex-row gap-5 p-4 rounded-lg bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors">
                        <div className="w-24 sm:w-32 h-16 bg-white rounded-md border overflow-hidden flex-shrink-0">
                          <ImageWithFallback 
                            src={getCarImage(item.carId)} 
                            alt={item.carModel} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between ml-2 sm:ml-4">
                          <div>
                              <h4 className="font-bold text-gray-900 truncate text-lg" title={item.carModel}>{item.carModel}</h4>
                              <div className="flex items-center gap-3 mt-2 text-sm text-gray-600">
                                {/* ✅ Hiển thị màu tiếng Việt */}
                                <span className="bg-white border px-2 py-0.5 rounded text-xs font-medium">Màu: {displayColor}</span>
                                <span className="text-gray-400">|</span>
                                <span>Số lượng: x{item.quantity}</span>
                              </div>
                          </div>
                          <div className="mt-2 sm:mt-0">
                             {/* Có thể thêm thông tin khác nếu cần */}
                          </div>
                        </div>
                        <div className="text-right flex flex-col justify-center border-t sm:border-t-0 pt-2 sm:pt-0 mt-2 sm:mt-0">
                          <p className="text-sm text-gray-500 mb-1">Đơn giá: {formatPrice(item.price)}</p>
                          <p className="font-bold text-red-600 text-lg">{formatPrice(item.subtotal)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Payment Info */}
            <Card className="border-none shadow-sm">
              <CardHeader className="pb-3 border-b bg-gray-50/30">
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-600" /> Thông tin thanh toán
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-5 space-y-3 text-sm">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Phí vận chuyển</span><span>{formatPrice(order.shippingFee)}</span></div>
                <div className="flex justify-between"><span>Thuế (VAT)</span><span>{formatPrice(order.tax)}</span></div>
                <Separator className="my-2" />
                <div className="flex justify-between items-center text-base font-bold">
                  <span>Tổng cộng</span>
                  <span className="text-red-600 text-xl">{formatPrice(order.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <Card className="border-none shadow-sm h-fit sticky top-4">
              <CardHeader className="pb-3 border-b bg-gray-50/30">
                <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-gray-600" /> Thông tin nhận hàng</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                    <User2 className="w-4 h-4" />
                    <span className="text-gray-500 mr-1 ">Người nhận:
                      <span className=" text-gray-700"> {order.fullName}</span>
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    <span className="text-gray-500 mr-1 ">Số điện thoại:
                      <span className=" text-gray-700"> {order.phone}</span>
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    <span className=" text-gray-500 mr-1">Email: 
                      <span className=" text-gray-700"> {order.email}</span> 
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold mb-1 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span className=" text-gray-500 mr-1">Địa chỉ: 
                      <span className=" text-gray-700"> {order.address}, {order.ward}, {order.district}, {order.city}</span> 
                    </span>
                  </p>
                </div>
                
                <Separator />

                <div>
                      <p className="text-gray-500 text-xs uppercase font-bold mb-2 flex items-center gap-1"><CreditCard className="w-3 h-3" /> Thanh toán</p>
                      <div className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-100">
                         <span className="font-medium text-xs">{order.payment?.paymentMethod || 'Tiền mặt'}</span>
                         <Badge variant={order.payment?.status === 'SUCCESS' ? 'default' : 'secondary'} className="text-[10px] px-2 py-0.5 h-5">
                             {paymentStatusMap[order.payment?.status || 'PENDING']}
                         </Badge>
                      </div>
                </div>

                {order.note && (
                  <div className="bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-100">
                    <span className="font-bold block mb-1">Ghi chú:</span> {order.note}
                  </div>
                )}

                {/* Hủy đơn Button */}
                {order.status === 'PENDING' && (
                <Button 
                    variant="outline" 
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 border-dashed mt-2"
                    onClick={() => setIsCancelDialogOpen(true)}
                >
                    Yêu cầu hủy đơn hàng
                </Button>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* Dialog Hủy */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Hủy đơn hàng</DialogTitle>
            <DialogDescription>Vui lòng cho chúng tôi biết lý do bạn muốn hủy đơn hàng này.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
             <Label htmlFor="cancel-reason" className="mb-2 block">Lý do hủy <span className="text-red-500">*</span></Label>
             <Textarea 
                id="cancel-reason"
                placeholder="Nhập lý do..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="min-h-[100px]"
             />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)} disabled={isCancelling}>Đóng</Button>
            <Button variant="destructive" onClick={handleConfirmCancel} disabled={isCancelling}>
                {isCancelling ? "Đang xử lý..." : "Xác nhận hủy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}