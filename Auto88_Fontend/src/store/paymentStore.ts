import { create } from 'zustand';
import orderService, {
  PaymentResponse,
  PaymentStatus,
} from '@/services/orderService';

interface PaymentState {
  payments: PaymentResponse[];
  isLoading: boolean;
  error: string | null;
  fetchPayments: () => Promise<void>;
  updateStatus: (paymentId: string, status: PaymentStatus) => Promise<void>;
}

export const usePaymentStore = create<PaymentState>((set) => ({
  payments: [],
  isLoading: false,
  error: null,

  /**
   * Fetches all payments from the server and updates the state.
   */
  fetchPayments: async () => {
    set({ isLoading: true, error: null });
    try {
      const payments = await orderService.getAllPayments();
      set({ payments, isLoading: false });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ isLoading: false, error });
    }
  },

  /**
   * Updates the status of a specific payment.
   * On success, it refreshes the entire payment list to ensure data consistency.
   */
  updateStatus: async (paymentId: string, status: PaymentStatus) => {
    set({ isLoading: true, error: null });
    try {
      await orderService.updatePaymentStatus(paymentId, status);
      // Refresh the list after updating
      const payments = await orderService.getAllPayments();
      set({ payments, isLoading: false });
    } catch (err) {
      const error = err instanceof Error ? err.message : 'An unknown error occurred';
      set({ isLoading: false, error });
    }
  },
}));
