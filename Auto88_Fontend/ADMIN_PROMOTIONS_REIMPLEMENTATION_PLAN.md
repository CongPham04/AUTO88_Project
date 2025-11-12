# Admin Promotions - Re-Implementation Plan

This document outlines the plan to cleanly re-implement the integration of the `PromotionController` and `CarController` APIs for the admin promotions management page.

## 1. API Service Layer

- **Objective:** Ensure the service layer correctly defines types and communicates with the backend APIs.
- **`promotionService.ts`:**
    - **Action:** Re-write the service from scratch.
    - **Enums:** Define `DiscountType` and `AppliesTo` as proper string enums to prevent type errors.
    - **Interfaces:** Define `Promotion` and `PromotionRequest` interfaces that precisely match the API specification.
    - **Functions:** Implement `getAllPromotions`, `createPromotion`, `updatePromotion`, and `deletePromotion` pointing to the correct API endpoints (`/api/promotions/...`).
- **`carService.ts`:**
    - **Action:** Verify the service.
    - **Function:** Ensure `getAllCars` is present and correctly fetches the list of cars for the promotion form.
    - **Enums:** Confirm that `Brand` and `Category` are defined as string enums.

## 2. UI Implementation (`AdminPromotions.tsx`)

- **Objective:** Re-build the UI component to be robust, error-free, and user-friendly, with a Vietnamese interface.
- **Action:** Re-write the `AdminPromotions.tsx` file from scratch.
- **Key Components:**
    - **Main View:**
        - A data table to display the list of promotions with columns for title, discount, dates, and status.
        - "Add Promotion" and "Refresh" buttons.
    - **Integrated Form Modal:**
        - The modal for creating and editing promotions will be implemented directly within the `AdminPromotions.tsx` file.
        - The form will be built using `react-hook-form` and will be correctly initialized and reset to prevent data entry errors.
        - All fields (text inputs, selects, checkboxes for targets) will be strongly typed and validated.
- **State Management:**
    - All state logic (`promotions`, `cars`, `isModalOpen`, `selectedPromotion`) will be self-contained within the `AdminPromotions` component.

## Implementation Steps

1.  **Re-create `promotionService.ts`:** Write a clean service file with correct enums and functions.
2.  **Re-create `AdminPromotions.tsx`:** Write a clean, single-file component that includes the modal and form logic, ensuring `react-hook-form` is implemented correctly to avoid previous state issues.
3.  **Verification:** After implementation, start the development server for final review.
