### **Implementation Plan: Admin News Management**

**Phase 1: API Service Layer**

1.  **Create `newsService.ts`:**
    *   Create a new file at `src/services/newsService.ts`.
    *   Define TypeScript interfaces for `NewsResponse`, `NewsRequest`, and the `NewsStatus` enum (`DRAFT`, `PUBLISHED`).
    *   Implement functions to interact with all `NewsController` endpoints:
        *   `getAllNews()`: Fetches all news articles.
        *   `getNewsById(id)`: Fetches a single news article.
        *   `createNews(data)`: Creates a new article. This will use `FormData` to handle image uploads, similar to `carService.ts`.
        *   `updateNews(id, data)`: Updates an existing article, also using `FormData`.
        *   `deleteNews(id)`: Deletes an article.
        *   `getNewsImageUrl(filename)`: A helper function to construct the full image URL.

**Phase 2: State Management (Zustand)**

1.  **Create `newsStore.ts`:**
    *   Create a new file at `src/store/newsStore.ts`.
    *   Define the state shape, including `newsItems`, `isLoading`, and `error`.
    *   Create async actions that call the `newsService` to fetch, add, edit, and delete news items, updating the state accordingly.

**Phase 3: UI Components & Page Implementation**

1.  **Create Main Page (`AdminNews.tsx`):**
    *   Create the main page component at `src/pages/admin/AdminNews.tsx`.
    *   The layout will be consistent with the `AdminOrders` page, featuring a title, a "Create News" button, and status filters (`All`, `Draft`, `Published`).
2.  **Implement the News Table:**
    *   Display the list of news articles fetched from the `newsStore`.
    *   Columns will include: Title, Status, Creation Date, and Actions.
    *   The "Actions" column will contain a dropdown menu with "Edit" and "Delete" options.
3.  **Create the News Form Modal:**
    *   Create a reusable dialog component for creating and editing news articles.
    *   The form will include fields for:
        *   Title (`Input`)
        *   Content (`Textarea`)
        *   Image Upload (`Input type="file"`)
        *   Status (`Select` component for `Draft`/`Published`).
    *   The modal will be used for both creating a new article and editing an existing one.
4.  **Implement the Delete Confirmation:**
    *   Use the existing `AlertDialog` component to create a confirmation prompt that appears when the user clicks the "Delete" button, preventing accidental deletions.

**Phase 4: Final Integration**

1.  **Connect State and UI:**
    *   In `AdminNews.tsx`, use the `useNewsStore` hook to get data and actions.
    *   Manage the local state for opening/closing the form modal and delete confirmation.
2.  **Verify Routing:**
    *   Ensure the component is correctly rendered for the `/admin/news` route as defined in `AppRoutes.tsx`.
