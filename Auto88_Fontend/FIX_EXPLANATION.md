# Explanation of the Authentication Fix

This document explains the cause of the authentication issue on public pages and the steps taken to resolve it.

## The Problem

Users were being incorrectly redirected to the login page when accessing public pages like the Car Details page. This happened even though the page routes themselves were not protected.

The root cause was in the `apiClient.ts` request interceptor. This interceptor is responsible for attaching the authentication token to outgoing API requests. It contained logic to bypass this for "public" API calls, but this logic was flawed in two ways:

1.  **Initial Implementation:** The first attempt used a simple `string.includes()` check. This was too broad and failed to correctly distinguish between routes like `/cars` (the list) and `/cars/1` (a detail page).
2.  **Second Implementation:** The second attempt used regular expressions for more precise matching. However, it was incomplete. The `CarDetailsPage` makes **two** API calls: one to get the main car information (`/api/cars/:id`) and a second to get the technical specifications (`/api/car-details/:id`). The regular expression list only included the first call, so the second call would fail the "public" check and trigger the login redirect.

## The Solution

The final fix addresses the incomplete regular expression list.

1.  **Comprehensive Regex:** The list of public endpoints in `apiClient.ts` was updated to include a pattern for the car details endpoint:
    ```javascript
    const publicGetEndpoints = [
      // ... other public routes
      /^\/cars\/\d+$/,         // Matches /cars/1, /cars/23, etc.
      /^\/car-details\/\d+$/, // <-- This was the missing piece
      // ... other public routes
    ];
    ```
2.  **Precise Matching:** The logic now correctly identifies all GET requests made by the public pages as not requiring a token. The `some((pattern) => pattern.test(config.url || ''))` check ensures that the request URL (e.g., `/cars/123`) is tested against each pattern in the list.

With this change, all necessary API calls for the `HomePage`, `CarListPage`, `CarDetailsPage`, and `NewsPage` are correctly identified as public, and the authentication interceptor no longer redirects users to the login page.
