import apiClient from '@/lib/apiClient';

// ==================== Enums and Types ====================

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  MOMO = 'MOMO',
  CASH = 'CASH',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export interface Payment {
  paymentId: string;
  orderId: string;
  paymentDate: string; // ISO 8601 date string
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
  createdAt: string; // ISO 8601 date string
  updatedAt: string; // ISO 8601 date string
}

export interface PaymentRequest {
  orderId: string;
  paymentDate: string; // ISO 8601 date string
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionId?: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// ==================== Payment Service Class ====================

class PaymentService {
  /**
   * Get all payments
   */
  async getAllPayments(): Promise<Payment[]> {
    try {
      const response = await apiClient.get<ApiResponse<Payment[]>>('/payments');
      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch payments');
      }
    } catch (error) {
      console.error('Error fetching all payments:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   */
  async getPaymentById(paymentId: string): Promise<Payment> {
    try {
      const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch payment details');
      }
    } catch (error) {
      console.error(`Error fetching payment ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new payment
   */
  async createPayment(paymentData: PaymentRequest): Promise<Payment> {
    try {
      const response = await apiClient.post<ApiResponse<Payment>>('/payments', paymentData);
      if (response.data.code === 200 || response.data.code === 201) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create payment');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Confirm a payment
   */
  async confirmPayment(paymentId: string): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(`/payments/${paymentId}/confirm`);
      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to confirm payment');
      }
    } catch (error) {
      console.error(`Error confirming payment ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<void> {
    try {
      const response = await apiClient.patch<ApiResponse<void>>(
        `/payments/${paymentId}/status`,
        { status } // Send status in the request body
      );
      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to update payment status');
      }
    } catch (error) {
      console.error(`Error updating status for payment ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Get payments by user ID
   */
  async getPaymentsByUserId(userId: string): Promise<Payment[]> {
    try {
      const response = await apiClient.get<ApiResponse<Payment[]>>(`/payments/user/${userId}`);
      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch user payments');
      }
    } catch (error) {
      console.error(`Error fetching payments for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Delete a payment
   */
  async deletePayment(paymentId: string): Promise<void> {
    try {
      const response = await apiClient.delete<ApiResponse<void>>(`/payments/${paymentId}`);
      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Failed to delete payment');
      }
    } catch (error) {
      console.error(`Error deleting payment ${paymentId}:`, error);
      throw error;
    }
  }

  /**
   * Get payments by status
   */
  async getPaymentsByStatus(status: PaymentStatus): Promise<Payment[]> {
    try {
      const response = await apiClient.get<ApiResponse<Payment[]>>(`/payments/status/${status}`);
      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch payments by status');
      }
    } catch (error) {
      console.error(`Error fetching payments with status ${status}:`, error);
      throw error;
    }
  }

  /**
   * Get payments by order ID
   */
  async getPaymentsByOrderId(orderId: string): Promise<Payment[]> {
    try {
      const response = await apiClient.get<ApiResponse<Payment[]>>(`/payments/order/${orderId}`);
      if (response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to fetch payments for order');
      }
    } catch (error) {
      console.error(`Error fetching payments for order ${orderId}:`, error);
      throw error;
    }
  }
}

export default new PaymentService();
