# Order Creation & Payment Integration Plan

This document outlines the plan to integrate the order creation and payment functionality into the Auto88 frontend application.

## 1. Update API Service (`orderService.ts`)

- **Objective:** Add the functionality to send the new order data to the backend.
- **Steps:**
    1.  Define the TypeScript interfaces for the API request and response (`OrderRequest`, `OrderDetailRequest`, `OrderResponse`) based on the provided API specification.
    2.  Create a new public method `createOrder(orderData: OrderRequest): Promise<OrderResponse>` in the `OrderService` class.
    3.  This method will make a `POST` request to the `/api/orders` endpoint, sending the `orderData` as the request body.
    4.  It will handle the API response, returning the created order data on success or throwing an error on failure.

## 2. Update Authentication Store (`useAuthStore.ts`)

- **Objective:** Make the logged-in user's ID easily accessible for creating orders.
- **Steps:**
    1.  Add a `userId` field to the `AuthState` interface.
    2.  When a user logs in, decode the JWT token to extract the `userId`.
    3.  Store the `userId` in the Zustand store alongside the token and user role.
    4.  This makes the `userId` available to any component that needs it, such as the `CheckoutPage`.

## 3. Implement Checkout Logic (`CheckoutPage.tsx`)

- **Objective:** Create the user interface and logic for submitting a new order.
- **Steps:**
    1.  **Fetch Data:**
        -   Get the current order items from `useOrderStore`.
        -   Get the logged-in user's ID and other details from `useAuthStore`.
    2.  **Form Handling:**
        -   Create a form for the user to input their shipping information (full name, phone, address, etc.).
        -   Manage the form's state using `useState`.
    3.  **Submission Logic:**
        -   Create a `handleSubmit` function that will be called when the "Place Order" button is clicked.
        -   Inside this function, construct the `OrderRequest` object by combining:
            -   User ID from the auth store.
            -   Shipping details from the form.
            -   Order items from the order store.
            -   Selected payment method.
        -   Call the `orderService.createOrder()` method with the constructed object.
    4.  **State Management & Feedback:**
        -   Implement loading and error states for the API call.
        -   Disable the submission button while the request is in progress.
        -   On success:
            -   Display a success toast notification.
            -   Clear the items from the `useOrderStore`.
            -   Redirect the user to the homepage or an order confirmation page.
        -   On error:
            -   Display an error toast notification with a relevant message.
