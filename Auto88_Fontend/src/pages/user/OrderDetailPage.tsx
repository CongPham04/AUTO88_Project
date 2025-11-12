import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import orderService, { OrderResponse } from '@/services/orderService';
import carService, { CarResponse } from '@/services/carService';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton'; // [THÊM MỚI] Import Skeleton

// [THÊM MỚI] Component Skeleton cho trang chi tiết
const OrderDetailPageSkeleton = () => (
  <div className="min-h-screen bg-gray-50 py-8">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Skeleton cho nút "Quay lại" */}
      <Skeleton className="h-10 w-64 mb-6" />

      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <Skeleton className="h-7 w-48" /> {/* Đơn hàng #... */}
              <Skeleton className="h-6 w-24" /> {/* Badge Trạng thái */}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Skeleton cho "Chi tiết đơn hàng" */}
            <div>
              <Skeleton className="h-6 w-40 mb-3" /> {/* h3 */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
            {/* Skeleton cho "Thông tin giao hàng" */}
            <div>
              <Skeleton className="h-6 w-40 mb-3" /> {/* h3 */}
              <div className="text-sm space-y-2">
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-5 w-1/2" />
                <Skeleton className="h-5 w-3/4" />
              </div>
            </div>
            {/* Skeleton cho "Sản phẩm" */}
            <div>
              <Skeleton className="h-6 w-24 mb-3" /> {/* h3 */}
              <div className="space-y-4">
                {/* Skeleton cho 1 sản phẩm */}
                <div className="flex items-center space-x-4 border-b pb-4">
                  <Skeleton className="w-24 h-16 rounded-md" /> {/* Ảnh */}
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" /> {/* Tên xe */}
                    <Skeleton className="h-4 w-20" /> {/* Số lượng */}
                  </div>
                  <Skeleton className="h-5 w-24" /> {/* Giá */}
                </div>
                {/* Skeleton cho sản phẩm thứ 2 (giả lập) */}
                <div className="flex items-center space-x-4 border-b pb-4">
                  <Skeleton className="w-24 h-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);


// Component chính của bạn
export default function OrderDetailPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          setError(null);
        } catch (err) {
          setError('Không thể tải chi tiết đơn hàng.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrder();
  }, [orderId]);

  const getCarImage = (carId: number) => {
    const car = cars.find(c => c.carId === carId);
    return car?.imageUrl || '';
  };

  const statusMap: { [key: string]: string } = {
    PENDING: 'Đang xử lý',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao hàng',
    DELIVERED: 'Đã giao hàng',
    COMPLETED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };

  const paymentStatusMap: { [key: string]: string } = {
    PENDING: 'Chờ thanh toán',
    SUCCESS: 'Thành công',
    FAILED: 'Thất bại',
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PENDING': return 'secondary';
      case 'CONFIRMED': return 'default';
      case 'SHIPPING': return 'default';
      case 'DELIVERED': return 'default';
      case 'COMPLETED': return 'default';
      case 'CANCELLED': return 'destructive';
      default: return 'outline';
    }
  };

  // [THAY ĐỔI] Thay thế loading text bằng Skeleton
  if (loading) {
    return <OrderDetailPageSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!order) {
    return <div>Không tìm thấy đơn hàng.</div>;
  }

  // Giao diện khi đã tải xong (giữ nguyên)
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Button variant="ghost" onClick={() => navigate('/profile?tab=orders')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách đơn hàng
        </Button>

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>Đơn hàng #{order.orderId}</span>
                <Badge variant={getStatusVariant(order.status)}>{statusMap[order.status] || order.status}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Chi tiết đơn hàng</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <p><strong>Ngày đặt hàng:</strong> {new Date(order.orderDate).toLocaleString()}</p>
                  <p><strong>Tổng tiền:</strong> {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                  <p><strong>Phương thức thanh toán:</strong> {order.payment?.paymentMethod}</p>
                  <p><strong>Trạng thái thanh toán:</strong> <Badge variant={order.payment?.status === 'SUCCESS' ? 'default' : 'secondary'}>{paymentStatusMap[order.payment?.status || ''] || order.payment?.status}</Badge></p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Thông tin giao hàng</h3>
                <div className="text-sm">
                  <p><strong>{order.fullName}</strong></p>
                  <p>{order.phone}</p>
                  <p>{order.email}</p>
                  <p>{`${order.address}, ${order.ward}, ${order.district}, ${order.city}`}</p>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sản phẩm</h3>
                <div className="space-y-4">
                  {order.orderDetails.map(item => (
                    <div key={item.orderDetailId} className="flex items-center space-x-4 border-b pb-4">
                      <ImageWithFallback src={getCarImage(item.carId)} alt={item.carModel} className="w-24 h-16 object-cover rounded-md" />
                      <div className="flex-1">
                        <p className="font-medium">{item.carModel}</p>
                        <p className="text-sm text-gray-600">Số lượng: {item.quantity}</p>
                      </div>
                      <p>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}