# Admin Orders & Payments - Implementation Plan

This document outlines the plan to integrate the OrderController and PaymentController APIs and implement the admin orders management page.

**Note:** The API specifications could not be automatically extracted. This plan is based on common REST API patterns and will be refined once the exact API details are available.

## 1. API Integration (`orderService.ts`)

- **Objective:** Create and update functions in `src/services/orderService.ts` to communicate with the `OrderController` and `PaymentController` backend APIs.
- **Assumed Endpoints:**
    - `GET /api/admin/orders`: Fetch a paginated list of all orders.
    - `GET /api/admin/orders/{id}`: Fetch details for a single order.
    - `PATCH /api/admin/orders/{id}/status`: Update an order's status.
    - `DELETE /api/admin/orders/{id}`: Delete an order.
    - `PATCH /api/admin/payments/{id}/status`: Update a payment's status.
- **Data Models:** Define or update TypeScript interfaces for `Order`, `Payment`, and `PagedApiResponse` based on the API responses.

## 2. UI Implementation (`AdminOrders.tsx`)

- **Objective:** Enhance the user interface for managing orders and payments at `/admin/orders`.
- **Key Features:**
    - **Order List View:**
        - Display orders in a data table with columns for Order ID, Customer, Date, Total, Order Status, and Payment Status.
        - Implement server-side pagination to handle large datasets efficiently.
    - **Order Details Modal/View:**
        - Show comprehensive details for a selected order, including customer information, order items, and payment details.
    - **Update Order & Payment Status:**
        - Allow admins to change the status of an order (e.g., from 'Pending' to 'Shipped').
        - Allow admins to change the status of a payment (e.g., from 'Pending' to 'Success').
    - **State Management:**
        - Handle loading, error, and empty states gracefully.

## Implementation Steps

1.  **Confirm API Details:** Obtain the exact endpoints and data structures for the `OrderController` and `PaymentController`.
2.  **Update `orderService.ts`:** Implement the API client functions with pagination and correct admin endpoints.
3.  **Refactor `AdminOrders.tsx`:**
    - Add state for pagination (`currentPage`, `totalPages`).
    - Update `fetchOrders` to handle paginated data.
    - Add a `Pagination` component to the UI.
4.  **Connect UI to Service:** Fetch and display paginated data in the `AdminOrders.tsx` component.
5.  **Add User Interactions:** Ensure update and delete functionality works with the new paginated structure and provides user feedback.
6.  **Testing:** Verify all features work as expected and the UI is responsive.
