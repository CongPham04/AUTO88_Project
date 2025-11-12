import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import orderService, { OrderResponse } from '@/services/orderService';
import carService, { CarResponse } from '@/services/carService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { Skeleton } from '@/components/ui/skeleton'; // [THÊM MỚI] Import Skeleton
// [THÊM MỚI] Import Alert Dialog cho việc xác nhận Hủy
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

// [THÊM MỚI] Component Skeleton cho Tab Đơn hàng
const MyOrdersTabSkeleton = () => {
  // Hàm tạo một item skeleton
  const SkeletonOrderItem = () => (
    <div className="border p-4 rounded-md flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <Skeleton className="w-24 h-16 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-48" /> {/* ID Đơn hàng */}
          <Skeleton className="h-4 w-32" /> {/* Ngày đặt */}
          <Skeleton className="h-4 w-40" /> {/* Tổng cộng */}
          <Skeleton className="h-6 w-24" /> {/* Badge */}
        </div>
      </div>
      <Skeleton className="h-9 w-24" /> {/* Button Chi tiết */}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle><Skeleton className="h-7 w-48" /></CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <SkeletonOrderItem />
          <SkeletonOrderItem />
          <SkeletonOrderItem />
        </div>
      </CardContent>
    </Card>
  );
};


export default function MyOrdersTab() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [cars, setCars] = useState<CarResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.userId) {
        try {
          setLoading(true);
          const [userOrders, allCars] = await Promise.all([
            orderService.getOrdersByUserId(user.userId),
            carService.getAllCars()
          ]);
          setOrders(userOrders);
          setCars(allCars);
          setError(null);
        } catch (err) {
          setError('Không thể tải danh sách đơn hàng.');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [user]);

  // [THAY ĐỔI] Đổi tên hàm và bỏ window.confirm
  const handleConfirmCancelOrder = async (orderId: string) => {
    // Logic hủy đơn hàng được giữ nguyên, chỉ bỏ phần 'window.confirm'
    try {
      await orderService.updateOrderStatus(orderId, 'CANCELLED');
      toast.success('Hủy đơn hàng thành công.');
      // Tải lại danh sách đơn hàng sau khi hủy
      if (user?.userId) {
        const updatedOrders = await orderService.getOrdersByUserId(user.userId);
        setOrders(updatedOrders);
      }
    } catch (error) {
      toast.error('Không thể hủy đơn hàng.');
      console.error(error);
    }
  };

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
    return <MyOrdersTabSkeleton />;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng của tôi</CardTitle>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p>Bạn chưa có đơn hàng nào.</p>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.orderId} className="border p-4 rounded-md flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <ImageWithFallback src={getCarImage(order.orderDetails[0]?.carId)} alt="Car image" className="w-24 h-16 object-cover rounded-md" />
                  <div>
                    <p className="font-semibold">Đơn hàng #{order.orderId}</p>
                    <p>Ngày đặt: {new Date(order.orderDate).toLocaleDateString()}</p>
                    <p>Tổng cộng: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.totalAmount)}</p>
                    <Badge variant={getStatusVariant(order.status)}>{statusMap[order.status] || order.status}</Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => navigate(`/profile/orders/${order.orderId}`)}>
                    Xem chi tiết
                  </Button>
                  
                  {/* [THAY ĐỔI] Sử dụng AlertDialog thay vì onClick trực tiếp */}
                  {order.status === 'PENDING' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">Hủy đơn hàng</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Bạn có chắc chắn muốn hủy?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Hành động này không thể hoàn tác. Đơn hàng #{order.orderId} sẽ bị hủy.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Không</AlertDialogCancel>
                          {/* Khi bấm "Vẫn hủy", gọi hàm đã bỏ window.confirm */}
                          <AlertDialogAction onClick={() => handleConfirmCancelOrder(order.orderId)}>
                            Vẫn hủy
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}