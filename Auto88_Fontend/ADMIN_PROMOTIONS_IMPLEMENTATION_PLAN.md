# Admin Promotions - Re-Implementation Plan (No React-Hook-Form)

This document outlines the plan to cleanly re-implement the promotions feature from scratch, using standard React state for form management and adhering to the provided API specification.

## 1. API Service Layer

- **Objective:** Ensure the service layer correctly defines types and communicates with the backend APIs.
- **`promotionService.ts`:**
    - **Action:** Re-write the service from scratch.
    - **Enums:** Define `DiscountType` and `AppliesTo` as proper string enums.
    - **Interfaces:** Define `Promotion` and `PromotionRequest` interfaces that precisely match the API specification.
    - **Functions:** Implement `getAllPromotions` (`GET /api/promotions`), `createPromotion`, `updatePromotion`, and `deletePromotion`.
- **`carService.ts`:**
    - **Action:** Verify the `getAllCars` function exists and correctly fetches the list of cars (`GET /api/cars`).

## 2. UI Implementation (`AdminPromotions.tsx`)

- **Objective:** Re-build the UI component from the ground up using `useState` for form management, with a Vietnamese interface.
- **Action:** Re-write the `AdminPromotions.tsx` file from scratch.
- **Key Components & Logic:**
    - **Main View:**
        - A data table to display the list of all promotions.
        - "Thêm Khuyến mãi" (Add Promotion) and "Làm mới" (Refresh) buttons.
    - **Integrated Form Modal:**
        - The modal for creating and editing promotions will be a single, self-contained component within `AdminPromotions.tsx`.
        - **State Management:** All form inputs will be controlled components managed by a single `useState` object.
        - **Validation:** Basic client-side validation will be performed manually within the submission handler.
        - **Conditional Fields:** The UI will dynamically show/hide the target selection fields (Categories, Brands, Cars) based on the "Áp dụng cho" (Applies To) dropdown.
        - **Submission:** The `onSubmit` handler will construct the `PromotionRequest` payload from the state and call the appropriate service function.

## Implementation Steps

1.  **Re-create `promotionService.ts`:** Write a clean service file based on the provided API spec.
2.  **Re-create `AdminPromotions.tsx`:** Write a new, single-file component that includes the modal and all form logic using only `useState` and manual handlers.
3.  **Verification:** Start the development server for final review.