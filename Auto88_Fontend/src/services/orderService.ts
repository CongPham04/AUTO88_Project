import apiClient from '@/lib/apiClient';

// Enums
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'COMPLETED';

export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

export type PaymentMethod =
  | 'CASH'
  | 'CREDIT_CARD'
  | 'DEBIT_CARD'
  | 'BANK_TRANSFER'
  | 'VNPAY'
  | 'MOMO';

// OrderDetail Interfaces
export interface OrderDetailResponse {
  orderDetailId: number;
  carId: number;
  carModel: string;
  quantity: number;
  price: number;
  subtotal: number;
}

// Payment Interfaces
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

// Order Interfaces
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
  orderDate: string; // ISO date-time
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

  /**
   * Get all orders (for admin)
   */
  async getAllOrders(): Promise<OrderResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>('/orders');

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải danh sách đơn hàng');
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string): Promise<OrderResponse> {
    const response = await apiClient.get<ApiResponse<OrderResponse>>(
      `/orders/${orderId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải thông tin đơn hàng');
    }
  }

  /**
   * Get orders by user ID
   */
  async getOrdersByUserId(userId: string): Promise<OrderResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `/orders/user/${userId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải đơn hàng của người dùng');
    }
  }

  /**
   * Get orders by status (for admin)
   */
  async getOrdersByStatus(status: OrderStatus): Promise<OrderResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderResponse[]>>(
      `/orders/status/${status}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải đơn hàng theo trạng thái');
    }
  }

  /**
   * Create new order
   */
  async createOrder(orderData: OrderRequest): Promise<OrderResponse> {
    console.log('Creating order with data:', orderData);

    try {
      const response = await apiClient.post<ApiResponse<OrderResponse>>(
        '/orders',
        orderData
      );

      console.log('Create order response:', response.data);

      if (response.data.code === 200 || response.data.code === 201) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Lỗi khi tạo đơn hàng');
      }
    } catch (error: any) {
      console.error('Create order error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Update order information
   */
  async updateOrder(
    orderId: string,
    orderData: OrderUpdateRequest
  ): Promise<OrderResponse> {
    console.log('Updating order:', orderId, orderData);

    const response = await apiClient.put<ApiResponse<OrderResponse>>(
      `/orders/${orderId}`,
      orderData
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi cập nhật đơn hàng');
    }
  }

  /**
   * Update order status (for admin)
   */
  async updateOrderStatus(
    orderId: string,
    status: OrderStatus
  ): Promise<OrderResponse> {
    console.log('Updating order status:', orderId, status);

    const response = await apiClient.patch<ApiResponse<OrderResponse>>(
      `/orders/${orderId}/status`,
      null,
      { params: { status } }
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi cập nhật trạng thái đơn hàng');
    }
  }

  /**
   * Delete order (for admin)
   */
  async deleteOrder(orderId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/admin/orders/${orderId}`
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi xóa đơn hàng');
    }
  }

  // ==================== OrderDetail Operations ====================

  /**
   * Get all order details
   */
  async getAllOrderDetails(): Promise<OrderDetailResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderDetailResponse[]>>(
      '/order-details'
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải chi tiết đơn hàng');
    }
  }

  /**
   * Get order detail by ID
   */
  async getOrderDetailById(orderDetailId: number): Promise<OrderDetailResponse> {
    const response = await apiClient.get<ApiResponse<OrderDetailResponse>>(
      `/order-details/${orderDetailId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải chi tiết đơn hàng');
    }
  }

  /**
   * Get order details by order ID
   */
  async getOrderDetailsByOrderId(orderId: string): Promise<OrderDetailResponse[]> {
    const response = await apiClient.get<ApiResponse<OrderDetailResponse[]>>(
      `/order-details/order/${orderId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || 'Lỗi khi tải chi tiết đơn hàng theo mã đơn'
      );
    }
  }

  /**
   * Delete order detail
   */
  async deleteOrderDetail(orderDetailId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/order-details/${orderDetailId}`
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi xóa chi tiết đơn hàng');
    }
  }

  // ==================== Payment Operations ====================

  /**
   * Get all payments
   */
  async getAllPayments(): Promise<PaymentResponse[]> {
    const response = await apiClient.get<ApiResponse<PaymentResponse[]>>('/payments');

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải danh sách thanh toán');
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<PaymentResponse> {
    const response = await apiClient.get<ApiResponse<PaymentResponse>>(
      `/payments/${paymentId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải thông tin thanh toán');
    }
  }

  /**
   * Get payment by order ID
   */
  async getPaymentByOrderId(orderId: string): Promise<PaymentResponse> {
    const response = await apiClient.get<ApiResponse<PaymentResponse>>(
      `/payments/order/${orderId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || 'Lỗi khi tải thanh toán theo mã đơn hàng'
      );
    }
  }

  /**
   * Get payments by status
   */
  async getPaymentsByStatus(status: PaymentStatus): Promise<PaymentResponse[]> {
    const response = await apiClient.get<ApiResponse<PaymentResponse[]>>(
      `/payments/status/${status}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải thanh toán theo trạng thái');
    }
  }

  /**
   * Create payment
   */
  async createPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    console.log('Creating payment:', paymentData);

    try {
      const response = await apiClient.post<ApiResponse<PaymentResponse>>(
        '/payments',
        paymentData
      );

      console.log('Create payment response:', response.data);

      if (response.data.code === 200 || response.data.code === 201) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Lỗi khi tạo thanh toán');
      }
    } catch (error: any) {
      console.error('Create payment error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Update payment status (for admin)
   */
  async updatePaymentStatus(
    paymentId: string,
    status: PaymentStatus
  ): Promise<PaymentResponse> {
    console.log('Updating payment status:', paymentId, status);

    const response = await apiClient.patch<ApiResponse<PaymentResponse>>(
      `/payments/${paymentId}/status`,
      null,
      { params: { status } }
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi cập nhật trạng thái thanh toán');
    }
  }

  /**
   * Delete payment (for admin)
   */
  async deletePayment(paymentId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/admin/payments/${paymentId}`
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi xóa thanh toán');
    }
  }
}

export default new OrderService();
