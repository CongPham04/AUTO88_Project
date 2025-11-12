# API Integration Plan for Auto88 Frontend

This plan outlines the steps to integrate the new APIs into the Auto88 frontend, replacing the current mock data with live data from the backend.

## 1. API Service Layer Enhancement

I will start by updating the API service files in `src/services` to include functions for fetching data from the new endpoints.

-   **`src/services/homeService.ts`**:
    -   Implement `getHomeSections()` to fetch data for the home page sections (Hero, Categories, Brands, Featured Cars, News).
-   **`src/services/metaService.ts`**:
    -   Implement `getBrands()` to fetch a list of car brands.
    -   Implement `getCategories()` to fetch a list of car categories.
    -   Implement `getColors()` to fetch a list of available car colors.
-   **`src/services/carService.ts`**:
    -   Implement `getAllCars()` to fetch a list of all cars.
    -   Implement `getCar(id)` to fetch details for a single car.
    -   Implement `getCarsByCategory(category)` to fetch cars by category.
    -   Implement `getCarsByBrand(brand)` to fetch cars by brand.
-   **`src/services/newsService.ts`**:
    -   Implement `getAllNews()` to fetch a list of all news articles.
-   **`src/services/searchService.ts`**:
    -   Implement `searchCars(params)` to search for cars based on various criteria.
-   **`src/services/compareService.ts`**:
    -   Create a new service file `src/services/compareService.ts`.
    -   Implement `compareCars(ids)` to fetch car details for comparison.

## 2. Component and Page Integration

Next, I will update the page components in `src/pages` to use the new API service functions to fetch and display data.

-   **`src/pages/home/HomePage.tsx`**:
    -   Replace `mockCars` and `mockNews` with data fetched from `homeService.getHomeSections()`.
    -   Update the `HeroSection`, `CategorySection`, `BrandSection`, `FeaturedCars`, and `NewsSection` components to consume the live data.
-   **`src/pages/cars/CarListPage.tsx`**:
    -   Use `carService.getAllCars()` to display a list of all cars.
    -   Implement filtering and searching using `searchService.searchCars()`.
    -   Update the component to handle loading and error states.
-   **`src/pages/cars/CarDetailsPage.tsx`**:
    -   Use `carService.getCar(id)` to fetch and display the details of a specific car.
    -   Update the component to handle loading and error states.
-   **`src/pages/news/NewsPage.tsx`**:
    -   Use `newsService.getAllNews()` to display a list of all news articles.
    -   Update the component to handle loading and error states.
-   **`src/pages/comparison/ComparisonPage.tsx`**:
    -   Use the `useCompareStore` to get the list of car IDs to compare.
    -   Use `compareService.compareCars(ids)` to fetch the details of the cars being compared.
    -   Update the component to display the comparison data and handle loading and error states.

## 3. State Management

-   **`src/store/compareStore.ts`**:
    -   Review and ensure the `compareStore` is sufficient for the new comparison functionality. No major changes are anticipated here.

## 4. Code Quality and Conventions

-   Throughout the implementation, I will adhere to the existing coding style, conventions, and project structure.
-   I will ensure that the code is clean, readable, and maintainable.
-   I will add comments where necessary to explain complex logic.
