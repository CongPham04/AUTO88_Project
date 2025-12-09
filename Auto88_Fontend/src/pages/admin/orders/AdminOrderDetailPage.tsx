import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, User, MapPin, CreditCard, Box, Truck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { toast } from 'sonner';
import orderService, { OrderResponse, OrderStatus, PaymentStatus } from '@/services/orderService';
import carService, {getColorName} from '@/services/carService';

const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
const formatDate = (date: string) => new Date(date).toLocaleString('vi-VN');

const statusConfig: Record<string, { label: string, color: string }> = {
  PENDING: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  CONFIRMED: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  SHIPPING: { label: 'Đang giao hàng', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Đã giao hàng', color: 'bg-indigo-100 text-indigo-800' },
  COMPLETED: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Cache ảnh xe để hiển thị
  const [carImages, setCarImages] = useState<Record<number, string>>({});

  useEffect(() => {
    if (orderId) {
      fetchOrderData();
    }
  }, [orderId]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrderById(orderId!);
      setOrder(data);

      // Fetch images for cars in order
      const imagesMap: Record<number, string> = {};
      await Promise.all(data.orderDetails.map(async (item) => {
         try {
             const car = await carService.getCarById(item.carId);
             imagesMap[item.carId] = car.imageUrls?.[0] || car.imageUrl || '';
         } catch (e) { console.error(e) }
      }));
      setCarImages(imagesMap);

    } catch (error) {
      toast.error('Không tìm thấy đơn hàng');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!order) return;
    try {
      setUpdating(true);
      await orderService.updateOrderStatus(order.orderId, newStatus);
      setOrder({ ...order, status: newStatus });
      toast.success(`Cập nhật trạng thái thành: ${statusConfig[newStatus]?.label}`);
    } catch (error: any) {
      toast.error(error.message || 'Lỗi cập nhật trạng thái');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentStatusChange = async (newStatus: PaymentStatus) => {
    if (!order?.payment) return;
    try {
      setUpdating(true);
      await orderService.updatePaymentStatus(order.payment.paymentId, newStatus);
      setOrder({ 
          ...order, 
          payment: { ...order.payment, status: newStatus } 
      });
      toast.success('Cập nhật trạng thái thanh toán thành công');
    } catch (error: any) {
      toast.error(error.message || 'Lỗi cập nhật thanh toán');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>;
  if (!order) return <div>Không có dữ liệu</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-10 py-4 px-4 sm:px-6 lg:px-8">
      {/* HEADER */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 cursor-pointer w-fit" onClick={() => navigate('/admin/orders')}>
          <ArrowLeft className="h-4 w-4" /> <span>Quay lại danh sách</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
              Đơn hàng #{order.orderId.substring(0, 8).toUpperCase()}
              <Badge className={`${statusConfig[order.status]?.color} border-none`}>{statusConfig[order.status]?.label}</Badge>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-1"><Calendar className="w-3.5 h-3.5"/> Ngày đặt: {formatDate(order.createdAt)}</p>
          </div>
          <Button onClick={() => navigate(`/admin/orders/edit/${order.orderId}`)} className="bg-black text-white hover:bg-gray-800">
            <Edit className="mr-2 h-4 w-4" /> Chỉnh sửa thông tin
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (2/3): Products & Payment */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b"><CardTitle className="text-base flex items-center gap-2"><Box className="w-4 h-4"/> Sản phẩm</CardTitle></CardHeader>
            <CardContent className="pt-4 space-y-4">
              {order.orderDetails.map((item) => (
                <div key={item.orderDetailId} className="flex gap-4 items-center">
                  <div className="w-20 h-16 border rounded bg-gray-50 overflow-hidden flex-shrink-0">
                    <ImageWithFallback src={carImages[item.carId]} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.carModel}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                        {/* ✅ [HIỂN THỊ MÀU TIẾNG VIỆT] */}
                        <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                            Màu: {getColorName((item as any).colorName || 'Mặc định')}
                        </span>
                        <span>x{item.quantity}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">{formatPrice(item.price)}</div>
                    <div className="text-xs text-gray-500">Tổng: {formatPrice(item.subtotal)}</div>
                  </div>
                </div>
              ))}
              
              <div className="border-t pt-4 mt-4 space-y-2 text-sm">
                <div className="flex justify-between"><span>Tạm tính</span><span>{formatPrice(order.subtotal)}</span></div>
                <div className="flex justify-between"><span>Phí vận chuyển</span><span>{formatPrice(order.shippingFee)}</span></div>
                <div className="flex justify-between"><span>Thuế</span><span>{formatPrice(order.tax)}</span></div>
                <div className="flex justify-between font-bold text-base text-red-600 pt-2 border-t mt-2">
                    <span>Tổng cộng</span><span>{formatPrice(order.totalAmount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b"><CardTitle className="text-base flex items-center gap-2"><CreditCard className="w-4 h-4"/> Thanh toán</CardTitle></CardHeader>
            <CardContent className="pt-4">
                {order.payment ? (
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-gray-500 block mb-1">Phương thức</span>
                            <span className="font-medium">{order.payment.paymentMethod}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">Trạng thái</span>
                            <div className="w-40">
                                <Select 
                                    value={order.payment.status} 
                                    onValueChange={(val) => handlePaymentStatusChange(val as PaymentStatus)}
                                    disabled={updating}
                                >
                                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                                        <SelectItem value="SUCCESS">Đã thanh toán</SelectItem>
                                        <SelectItem value="FAILED">Thất bại</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">Mã giao dịch</span>
                            <span className="font-medium">{order.payment.transactionId || '---'}</span>
                        </div>
                        <div>
                            <span className="text-gray-500 block mb-1">Ngày thanh toán</span>
                            <span className="font-medium">{order.payment.paymentDate ? formatDate(order.payment.paymentDate) : '---'}</span>
                        </div>
                    </div>
                ) : <div className="text-gray-500 italic">Chưa có thông tin thanh toán</div>}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN (1/3): Customer & Actions */}
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3 border-b"><CardTitle className="text-base flex items-center gap-2"><Truck className="w-4 h-4"/> Cập nhật trạng thái</CardTitle></CardHeader>
                <CardContent className="pt-4">
                    <Select value={order.status} onValueChange={(val) => handleStatusChange(val as OrderStatus)} disabled={updating}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Chọn trạng thái" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                            <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                            <SelectItem value="SHIPPING">Đang giao hàng</SelectItem>
                            <SelectItem value="DELIVERED">Đã giao hàng</SelectItem>
                            <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                            <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-2">Thay đổi trạng thái sẽ gửi email thông báo cho khách hàng.</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3 border-b"><CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4"/> Khách hàng</CardTitle></CardHeader>
                <CardContent className="pt-4 space-y-4 text-sm">
                    <div>
                        <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Họ tên</span>
                        <span className="font-medium">{order.fullName}</span>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs uppercase font-bold mb-1">Liên hệ</span>
                        <div className="space-y-1">
                            <p>{order.email}</p>
                            <p>{order.phone}</p>
                        </div>
                    </div>
                    <div>
                        <span className="text-gray-500 block text-xs uppercase font-bold mb-1 flex items-center gap-1"><MapPin className="w-3 h-3"/> Địa chỉ giao hàng</span>
                        <p className="leading-relaxed">{order.address}, {order.ward}, {order.district}, {order.city}</p>
                    </div>
                    {order.note && (
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-100 text-yellow-800">
                            <span className="font-bold block mb-1">Ghi chú:</span> {order.note}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>

      </div>
    </div>
  );
}