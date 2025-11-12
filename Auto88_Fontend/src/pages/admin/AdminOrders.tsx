import { useState, useEffect } from 'react';
import { Eye, RefreshCcw, X, Check, Truck, PackageCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import orderService, { OrderResponse, OrderStatus, PaymentStatus } from '@/services/orderService';
import { toast } from 'sonner';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(price);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getOrderStatusText = (status: OrderStatus) => {
  const statusMap: Record<OrderStatus, string> = {
    PENDING: 'Chờ xác nhận',
    CONFIRMED: 'Đã xác nhận',
    SHIPPING: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy',
    COMPLETED: 'Hoàn thành',
  };
  return statusMap[status];
};

const getOrderStatusColor = (status: OrderStatus) => {
  const colorMap: Record<OrderStatus, string> = {
    PENDING: 'bg-yellow-600',
    CONFIRMED: 'bg-blue-600',
    SHIPPING: 'bg-purple-600',
    DELIVERED: 'bg-green-600',
    CANCELLED: 'bg-red-600',
    COMPLETED: 'bg-gray-600',
  };
  return colorMap[status];
};

const getPaymentStatusText = (status: PaymentStatus) => {
  const statusMap: Record<PaymentStatus, string> = {
    PENDING: 'Chờ thanh toán',
    SUCCESS: 'Đã thanh toán',
    FAILED: 'Thất bại',
  };
  return statusMap[status];
};

const getPaymentStatusColor = (status: PaymentStatus) => {
  const colorMap: Record<PaymentStatus, string> = {
    PENDING: 'bg-yellow-600',
    SUCCESS: 'bg-green-600',
    FAILED: 'bg-red-600',
  };
  return colorMap[status];
};

const getPaymentMethodText = (method: string) => {
  const methodMap: Record<string, string> = {
    CASH: 'Tiền mặt',
    CREDIT_CARD: 'Thẻ tín dụng',
    DEBIT_CARD: 'Thẻ ghi nợ',
    BANK_TRANSFER: 'Chuyển khoản',
    VNPAY: 'VNPay',
    MOMO: 'MoMo',
  };
  return methodMap[method] || method;
};

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(null);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      // Sort by createdAt descending (newest first)
      const sortedData = data.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setOrders(sortedData);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(error.message || 'Lỗi khi tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = async (value: string) => {
    setFilterStatus(value);
    if (value === 'all') {
      await fetchOrders();
    } else {
      try {
        setLoading(true);
        const data = await orderService.getOrdersByStatus(value as OrderStatus);
        const sortedData = data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setOrders(sortedData);
      } catch (error: any) {
        console.error('Error filtering orders:', error);
        toast.error(error.message || 'Lỗi khi lọc đơn hàng');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleViewDetails = (order: OrderResponse) => {
    setSelectedOrder(order);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedOrder(null);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success('Cập nhật trạng thái đơn hàng thành công');

      // Refresh the order in the modal if open
      if (selectedOrder && selectedOrder.orderId === orderId) {
        const updatedOrder = await orderService.getOrderById(orderId);
        setSelectedOrder(updatedOrder);
      }

      // Refresh orders list
      if (filterStatus === 'all') {
        await fetchOrders();
      } else {
        await handleFilterChange(filterStatus);
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdatePaymentStatus = async (paymentId: string, newStatus: PaymentStatus) => {
    try {
      setIsUpdating(true);
      await orderService.updatePaymentStatus(paymentId, newStatus);
      toast.success('Cập nhật trạng thái thanh toán thành công');

      // Refresh the order in the modal if open
      if (selectedOrder) {
        const updatedOrder = await orderService.getOrderById(selectedOrder.orderId);
        setSelectedOrder(updatedOrder);
      }

      // Refresh orders list
      if (filterStatus === 'all') {
        await fetchOrders();
      } else {
        await handleFilterChange(filterStatus);
      }
    } catch (error: any) {
      console.error('Error updating payment status:', error);
      toast.error(error.message || 'Lỗi khi cập nhật trạng thái thanh toán');
    } finally {
      setIsUpdating(false);
    }
  };

  // Quick action to update order status from table
  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setIsUpdating(true);
      await orderService.updateOrderStatus(orderId, newStatus);
      toast.success(`Đơn hàng đã chuyển sang "${getOrderStatusText(newStatus)}"`);

      // Refresh orders list
      if (filterStatus === 'all') {
        await fetchOrders();
      } else {
        await handleFilterChange(filterStatus);
      }
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setIsUpdating(false);
    }
  };

  // Get available quick actions based on current status
  const getQuickActions = (order: OrderResponse) => {
    const actions = [];

    switch (order.status) {
      case 'PENDING':
        actions.push({
          icon: Check,
          label: 'Xác nhận',
          newStatus: 'CONFIRMED' as OrderStatus,
          color: 'text-blue-600 hover:bg-blue-50',
        });
        actions.push({
          icon: XCircle,
          label: 'Hủy',
          newStatus: 'CANCELLED' as OrderStatus,
          color: 'text-red-600 hover:bg-red-50',
        });
        break;
      case 'CONFIRMED':
        actions.push({
          icon: Truck,
          label: 'Giao hàng',
          newStatus: 'SHIPPING' as OrderStatus,
          color: 'text-purple-600 hover:bg-purple-50',
        });
        break;
      case 'SHIPPING':
        actions.push({
          icon: PackageCheck,
          label: 'Đã giao',
          newStatus: 'DELIVERED' as OrderStatus,
          color: 'text-green-600 hover:bg-green-50',
        });
        break;
      case 'DELIVERED':
        actions.push({
          icon: Check,
          label: 'Hoàn thành',
          newStatus: 'COMPLETED' as OrderStatus,
          color: 'text-gray-600 hover:bg-gray-50',
        });
        break;
      default:
        break;
    }

    return actions;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải danh sách đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
        <div className="flex space-x-2">
          <Select value={filterStatus} onValueChange={handleFilterChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Lọc theo trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
              <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
              <SelectItem value="SHIPPING">Đang giao</SelectItem>
              <SelectItem value="DELIVERED">Đã giao</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-600">Không có đơn hàng nào</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4">Mã đơn</th>
                    <th className="text-left p-4">Khách hàng</th>
                    <th className="text-left p-4">Sản phẩm</th>
                    <th className="text-left p-4">Ngày đặt</th>
                    <th className="text-left p-4">Tổng tiền</th>
                    <th className="text-left p-4">Trạng thái</th>
                    <th className="text-left p-4">Thanh toán</th>
                    <th className="text-left p-4">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <p className="font-medium text-sm">#{order.orderId.substring(0, 8)}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium">{order.fullName}</p>
                        <p className="text-sm text-gray-600">{order.phone}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm">
                          {order.orderDetails.length} sản phẩm
                        </p>
                        {order.orderDetails.length > 0 && (
                          <p className="text-xs text-gray-600">
                            {order.orderDetails[0].carModel}
                            {order.orderDetails.length > 1 && ` +${order.orderDetails.length - 1}`}
                          </p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm">{formatDate(order.orderDate)}</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-red-600">{formatPrice(order.totalAmount)}</p>
                      </td>
                      <td className="p-4">
                        <Badge className={getOrderStatusColor(order.status)}>
                          {getOrderStatusText(order.status)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {order.payment ? (
                          <Badge className={getPaymentStatusColor(order.payment.status)}>
                            {getPaymentStatusText(order.payment.status)}
                          </Badge>
                        ) : (
                          <Badge className="bg-gray-600">Chưa có</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          {/* Quick Action Buttons */}
                          {getQuickActions(order).map((action, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleQuickStatusChange(
                                  order.orderId,
                                  action.newStatus
                                )
                              }
                              disabled={isUpdating}
                              className={`cursor-pointer transition-colors ${action.color}`}
                              title={action.label}
                            >
                              <action.icon className="w-4 h-4" />
                            </Button>
                          ))}

                          {/* View Details Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(order)}
                            className="cursor-pointer hover:bg-gray-100 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Detail Modal */}
      {isDetailModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center z-50 p-4 ">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto blur-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Chi tiết đơn hàng #{selectedOrder.orderId.substring(0, 8)}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Ngày đặt: {formatDate(selectedOrder.orderDate)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCloseDetailModal}
                  disabled={isUpdating}
                  className="cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Thông tin khách hàng</h3>
                  <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                    <div>
                      <Label className="text-gray-600">Họ tên</Label>
                      <p className="font-medium">{selectedOrder.fullName}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Email</Label>
                      <p className="font-medium">{selectedOrder.email}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Số điện thoại</Label>
                      <p className="font-medium">{selectedOrder.phone}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Địa chỉ</Label>
                      <p className="font-medium">
                        {selectedOrder.address}, {selectedOrder.ward}, {selectedOrder.district},{' '}
                        {selectedOrder.city}
                      </p>
                    </div>
                    {selectedOrder.note && (
                      <div className="col-span-2">
                        <Label className="text-gray-600">Ghi chú</Label>
                        <p className="font-medium">{selectedOrder.note}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Sản phẩm đã đặt</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left p-3">Sản phẩm</th>
                          <th className="text-right p-3">Đơn giá</th>
                          <th className="text-center p-3">Số lượng</th>
                          <th className="text-right p-3">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.orderDetails.map((detail) => (
                          <tr key={detail.orderDetailId} className="border-t">
                            <td className="p-3">{detail.carModel}</td>
                            <td className="p-3 text-right">{formatPrice(detail.price)}</td>
                            <td className="p-3 text-center">{detail.quantity}</td>
                            <td className="p-3 text-right font-medium">
                              {formatPrice(detail.subtotal)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Order Summary */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Tổng kết đơn hàng</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tạm tính</span>
                      <span className="font-medium">{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phí vận chuyển</span>
                      <span className="font-medium">{formatPrice(selectedOrder.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Thuế</span>
                      <span className="font-medium">{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2 mt-2">
                      <span className="font-semibold text-lg">Tổng cộng</span>
                      <span className="font-semibold text-lg text-red-600">
                        {formatPrice(selectedOrder.totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Thông tin thanh toán</h3>
                  {selectedOrder.payment ? (
                    <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-600">Phương thức</Label>
                          <p className="font-medium">
                            {getPaymentMethodText(selectedOrder.payment.paymentMethod)}
                          </p>
                        </div>
                        <div>
                          <Label className="text-gray-600">Trạng thái</Label>
                          <div className="mt-1">
                            <Select
                              value={selectedOrder.payment.status}
                              onValueChange={(value) =>
                                handleUpdatePaymentStatus(
                                  selectedOrder.payment!.paymentId,
                                  value as PaymentStatus
                                )
                              }
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue>
                                  <Badge className={getPaymentStatusColor(selectedOrder.payment.status)}>
                                    {getPaymentStatusText(selectedOrder.payment.status)}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
                                <SelectItem value="SUCCESS">Đã thanh toán</SelectItem>
                                <SelectItem value="FAILED">Thất bại</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label className="text-gray-600">Số tiền</Label>
                          <p className="font-medium text-red-600">
                            {formatPrice(selectedOrder.payment.amount)}
                          </p>
                        </div>
                        {selectedOrder.payment.transactionId && (
                          <div>
                            <Label className="text-gray-600">Mã giao dịch</Label>
                            <p className="font-medium">{selectedOrder.payment.transactionId}</p>
                          </div>
                        )}
                        <div>
                          <Label className="text-gray-600">Ngày thanh toán</Label>
                          <p className="font-medium">{formatDate(selectedOrder.payment.paymentDate)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-4 rounded-lg text-center text-gray-600">
                      Chưa có thông tin thanh toán
                    </div>
                  )}
                </div>

                {/* Order Status Update */}
                <div>
                  <h3 className="font-semibold text-lg mb-3">Cập nhật trạng thái đơn hàng</h3>
                  <div className="flex items-center gap-4">
                    <Select
                      value={selectedOrder.status}
                      onValueChange={(value) =>
                        handleUpdateOrderStatus(selectedOrder.orderId, value as OrderStatus)
                      }
                      disabled={isUpdating}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue>
                          <Badge className={getOrderStatusColor(selectedOrder.status)}>
                            {getOrderStatusText(selectedOrder.status)}
                          </Badge>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Chờ xác nhận</SelectItem>
                        <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                        <SelectItem value="SHIPPING">Đang giao</SelectItem>
                        <SelectItem value="DELIVERED">Đã giao</SelectItem>
                        <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                        <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <Label className="text-gray-500">Ngày tạo</Label>
                      <p>{formatDate(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Cập nhật lần cuối</Label>
                      <p>{formatDate(selectedOrder.updatedAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Close Button */}
                <div className="flex justify-end pt-4 border-t">
                  <Button
                    variant="default"
                    onClick={handleCloseDetailModal}
                    disabled={isUpdating}
                    className="cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    Đóng
                  </Button>
                </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
