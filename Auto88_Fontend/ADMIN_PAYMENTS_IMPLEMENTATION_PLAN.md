### **Implementation Plan: Admin Payment Management**

**Phase 1: Project Analysis & Foundation**

1.  **Analyze Dependencies:** Review `package.json` to identify the libraries used for API calls (e.g., `axios`), state management (e.g., `redux-toolkit`), and UI components.
2.  **Understand Existing Code:**
    *   Examine the `src/services` directory to understand how API calls are currently structured.
    *   Examine the `src/features` and `src/store` directories to understand the existing Redux setup (slices, actions, store configuration).
    *   Examine the `src/routes` directory to see how routing is configured and how to add new admin routes.
    *   Review existing components in `src/components` to match the coding style and UI conventions.

**Phase 2: API Service Layer**

1.  **Create `paymentService.ts`:**
    *   Create a new file at `src/services/paymentService.ts`.
    *   Implement functions to interact with all endpoints from the `PaymentController`:
        *   `getPaymentById(paymentId)`
        *   `createPayment(paymentData)`
        *   `confirmPayment(paymentId)`
        *   `updatePaymentStatus(paymentId, status)`
        *   `getPaymentsByUserId(userId)`
        *   `deletePayment(paymentId)`
        *   `getPaymentsByStatus(status)`
        *   `getPaymentsByOrderId(orderId)`
2.  **Create `orderService.ts` (if it doesn't exist):**
    *   Create a new file at `src/services/orderService.ts`.
    *   Implement the function `getOrderById(orderId)` to fetch order details, which will be useful for displaying in the payment view.

**Phase 3: State Management (Redux)**

1.  **Create `paymentSlice.ts`:**
    *   Create a new file at `src/features/payments/paymentSlice.ts`.
    *   Define the state shape for payments (e.g., `list`, `selectedPayment`, `isLoading`, `error`).
    *   Create async thunks using `createAsyncThunk` for all relevant API calls (e.g., `fetchPayments`, `updateStatus`).
    *   Define reducers to handle state updates based on the lifecycle of the async thunks (`pending`, `fulfilled`, `rejected`).
2.  **Integrate into Store:**
    *   Import the new payment reducer into the main Redux store configuration file (likely `src/store/index.ts`) and add it to the `reducer` object.

**Phase 4: UI Components & Page**

1.  **Create Page Component:**
    *   Create a new file for the main page: `src/routes/AdminPaymentsPage.tsx`.
    *   This component will manage the overall layout, including the page title and filtering options.
2.  **Create Payment Table Component:**
    *   Create a reusable component: `src/features/payments/components/PaymentsTable.tsx`.
    *   The table will display a list of payments with columns for key information (ID, Order ID, Amount, Status, Method, Date).
    *   It will include action buttons for each row (e.g., "Update Status", "View Details").
3.  **Create Modals/Forms:**
    *   Create a modal component for updating the payment status: `src/features/payments/components/UpdateStatusModal.tsx`.
    *   This modal will be triggered from the `PaymentsTable` and will dispatch the update action.

**Phase 5: Routing**

1.  **Add New Route:**
    *   Modify the application's main router (likely in `src/routes/index.tsx` or `App.tsx`).
    *   Add a new route definition for `/admin/payments` that renders the `AdminPaymentsPage` component, ensuring it is placed within any existing admin layout or protected route structure.
