import apiClient from '@/lib/apiClient';

// ... (Giữ nguyên các Enum và Interface) ...
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPING' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type PaymentMethod = 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'VNPAY' | 'MOMO';

export interface OrderDetailResponse {
  orderDetailId: number;
  carId: number;
  carModel: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface PaymentResponse {
  paymentId: string;
  orderId: string;
  paymentDate: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentRequest {
  orderId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionId?: string;
}

export interface OrderResponse {
  orderId: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note: string;
  subtotal: number;
  shippingFee: number;
  tax: number;
  totalAmount: number;
  orderDate: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  orderDetails: OrderDetailResponse[];
  payment: PaymentResponse | null;
}

export interface OrderUpdateRequest {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
  shippingFee: number;
  tax: number;
}

export interface OrderDetailRequest {
  carId: number;
  quantity: number;
  colorName: string;
}

export interface OrderRequest {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note?: string;
  shippingFee: number;
  tax: number;
  paymentMethod: PaymentMethod;
  orderDetails: OrderDetailRequest[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class OrderService {
  // ==================== Order CRUD Operations ====================

  async getAllOrders(): Promise<OrderResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>('/orders');
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải danh sách đơn hàng');
  }

  async getOrderById(orderId: string): Promise<OrderResponse> {
    const response = await apiClient.get<ApiResponse<OrderResponse>>(`/orders/${orderId}`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải thông tin đơn hàng');
  }

  async getOrdersByUserId(userId: string): Promise<OrderResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(`/orders/user/${userId}`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải đơn hàng của người dùng');
  }

  async getOrdersByStatus(status: OrderStatus): Promise<OrderResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(`/orders/status/${status}`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải đơn hàng theo trạng thái');
  }

  async createOrder(orderData: OrderRequest): Promise<OrderResponse> {
    try {
      const response = await apiClient.post<ApiResponse<OrderResponse>>('/orders', orderData);
      if (response.data.code === 200 || response.data.code === 201) return response.data.data;
      throw new Error(response.data.message || 'Lỗi khi tạo đơn hàng');
    } catch (error: any) {
      throw error;
    }
  }

  async updateOrder(orderId: string, orderData: OrderUpdateRequest): Promise<OrderResponse> {
    const response = await apiClient.put<ApiResponse<OrderResponse>>(`/orders/${orderId}`, orderData);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi cập nhật đơn hàng');
  }

  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<OrderResponse> {
    const response = await apiClient.patch<ApiResponse<OrderResponse>>(
      `/orders/${orderId}/status`, null, { params: { status } }
    );
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
  }

  async deleteOrder(orderId: string): Promise<void> {
    // Lưu ý: Backend controller định nghĩa là DELETE /api/orders/{orderId}, 
    // không phải /admin/orders/... (trừ khi Security config chặn)
    const response = await apiClient.delete<ApiResponse<void>>(`/orders/${orderId}`);
    if (response.data.code !== 200) throw new Error(response.data.message || 'Lỗi khi xóa đơn hàng');
  }

  // [THÊM MỚI] Hàm hủy đơn hàng kèm lý do
  async cancelOrder(orderId: string, cancelReason: string): Promise<OrderResponse> {
    // API backend: POST /api/orders/{orderId}/cancel
    // Body: cancelReason (string)
    const response = await apiClient.post<ApiResponse<OrderResponse>>(
      `/orders/${orderId}/cancel`, 
      cancelReason, // Gửi text trực tiếp nếu backend nhận @RequestBody String
      { headers: { 'Content-Type': 'text/plain' } } // Đảm bảo content type là text
    );
    
    // Nếu backend nhận JSON { "cancelReason": "..." } thì sửa lại:
    // const response = await apiClient.post(`/orders/${orderId}/cancel`, { cancelReason });

    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi hủy đơn hàng');
  }

  // ==================== OrderDetail Operations (Đã cập nhật URL) ====================

  /**
   * Get order detail by ID
   * URL cũ: /order-details/${orderDetailId}
   * URL mới: /orders/details/${orderDetailId}
   */
  async getOrderDetailById(orderDetailId: number): Promise<OrderDetailResponse> {
    const response = await apiClient.get<ApiResponse<OrderDetailResponse>>(
      `/orders/details/${orderDetailId}`
    );
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải chi tiết đơn hàng');
  }

  /**
   * Get order details by order ID
   * URL cũ: /order-details/order/${orderId}
   * URL mới: /orders/${orderId}/details
   */
  async getOrderDetailsByOrderId(orderId: string): Promise<OrderDetailResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderDetailResponse[]>>(
      `/orders/${orderId}/details`
    );
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải chi tiết đơn hàng theo mã đơn');
  }

  /**
   * Delete order detail
   * URL cũ: /order-details/${orderDetailId}
   * URL mới: /orders/details/${orderDetailId}
   */
  async deleteOrderDetail(orderDetailId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/orders/details/${orderDetailId}`
    );
    if (response.data.code !== 200) throw new Error(response.data.message || 'Lỗi khi xóa chi tiết đơn hàng');
  }

  // ==================== Payment Operations (Giữ nguyên URL) ====================

  async getAllPayments(): Promise<PaymentResponse[]> {
    const response = await apiClient.get<ApiResponse<PaymentResponse[]>>('/payments');
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải danh sách thanh toán');
  }

  async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    const response = await apiClient.get<ApiResponse<PaymentResponse>>(`/payments/${paymentId}`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải thông tin thanh toán');
  }

  async getPaymentByOrderId(orderId: string): Promise<PaymentResponse> {
    const response = await apiClient.get<ApiResponse<PaymentResponse>>(`/payments/order/${orderId}`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải thanh toán theo mã đơn hàng');
  }

  async getPaymentsByStatus(status: PaymentStatus): Promise<PaymentResponse[]> {
    const response = await apiClient.get<ApiResponse<PaymentResponse[]>>(`/payments/status/${status}`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi tải thanh toán theo trạng thái');
  }

  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await apiClient.post<ApiResponse<PaymentResponse>>('/payments', paymentData);
      if (response.data.code === 200 || response.data.code === 201) return response.data.data;
      throw new Error(response.data.message || 'Lỗi khi tạo thanh toán');
    } catch (error: any) {
      throw error;
    }
  }

  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<PaymentResponse> {
    const response = await apiClient.patch<ApiResponse<PaymentResponse>>(
      `/payments/${paymentId}/status`, null, { params: { status } }
    );
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Lỗi khi cập nhật trạng thái thanh toán');
  }

  async deletePayment(paymentId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/payments/${paymentId}`);
    if (response.data.code !== 200) throw new Error(response.data.message || 'Lỗi khi xóa thanh toán');
  }
}

export default new OrderService();