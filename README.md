# Project Analysis Report: AUTO88

**Document Version**: 1.0  
**Date**: 2025-12-20  
**Author**: Pham Minh Cong

---

## 1. System Architecture

This section provides a detailed overview of the AUTO88 project's technical architecture, covering the frontend, backend, database, and containerization strategy. The system is designed as a modern, decoupled web application, ensuring scalability and maintainability.

### 1.1. Architectural Model

The AUTO88 project follows a **three-tier, service-oriented architecture**, containerized using Docker. The system is composed of three primary, independent services orchestrated by `docker-compose.yml`:

1.  **Frontend Service (`frontend`)**: A modern Single-Page Application (SPA) built with React and served by an Nginx web server. It is responsible for rendering the user interface and handling all user interactions.
2.  **Backend Service (`backend`)**: A monolithic REST API built with Spring Boot. It contains all the business logic, handles data processing, and manages communication with the database.
3.  **Database Service (`db`)**: A MySQL 8.0 relational database that persists all application data.

![Architecture Diagram](https://i.imgur.com/8a1f7Xf.png)

*Figure 1: High-Level System Architecture Diagram*

### 1.2. Technology Stack

| Component           | Technology / Library                                                                                                                              | Rationale                                                                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Frontend**        | **React 18, TypeScript, Vite, React Router, Zustand, Axios, Tailwind CSS, ShadCN/UI**                                                              | A modern, high-performance stack for building interactive and type-safe user interfaces with efficient state management.      |
| **Backend**         | **Java 17, Spring Boot 3, Spring Web, Spring Data JPA (Hibernate), Spring Security, MySQL Connector/J, JJWT, MapStruct, SpringDoc (Swagger)**         | A robust, enterprise-grade framework for building secure, scalable, and well-documented RESTful APIs with relational databases. |
| **Database**        | **MySQL 8.0**                                                                                                                                     | A reliable, widely-used open-source relational database system suitable for structured data.                                |
| **Orchestration**   | **Docker, Docker Compose**                                                                                                                        | Enables consistent development and deployment environments, simplifying service management and scalability.                 |
| **Web Server (FE)** | **Nginx**                                                                                                                                         | A high-performance web server used to serve the static React application files and proxy API requests to the backend.         |

### 1.3. Communication Flow

Communication between services is managed through standard network protocols within the Docker environment.

1.  **User to Frontend**: The user's browser sends an HTTP request to the Nginx server running in the `frontend` container on port 80. Nginx serves the static React application files (HTML, CSS, JS).
2.  **Frontend to Backend**:
    *   The React application, running in the user's browser, makes API calls to its own server with the path prefix `/carshop/api/...`.
    *   The `nginx.conf` file is configured with a `proxy_pass` directive. It intercepts any request to the `/carshop/api/` location and forwards it to the `backend` service at `http://backend:8080`. Docker's internal DNS resolves `backend` to the correct container IP address.
    *   The Spring Boot application, configured with `server.servlet.context-path=/carshop`, receives the request at the full path (e.g., `/carshop/api/users`).
3.  **Backend to Database**: The Spring Boot application uses Spring Data JPA and a JDBC connection pool to communicate with the `db` service on port 3306, as defined in the `docker-compose.yml` environment variables.

### 1.4. Docker Integration

The entire system is orchestrated via the `docker-compose.yml` file, which defines the three services (`db`, `backend`, `frontend`) and a volume for persistent database storage (`db_data`).

-   **`Auto88_Fontend/Dockerfile`**: Utilizes a multi-stage build.
    *   **Stage 1 (`build`)**: Uses a `node:20-alpine` image to install npm dependencies and run `npm run build`, creating an optimized static build of the React application in the `/app/build` directory.
    *   **Stage 2 (`final`)**: Uses a lightweight `nginx:stable-alpine` image. The static files from the `build` stage are copied to Nginx's web root (`/usr/share/nginx/html`). A custom `nginx.conf` is also copied to handle SPA routing and API proxying.
-   **`oto-shop/Dockerfile.be`**: Also uses a multi-stage build.
    *   **Stage 1 (`build`)**: Uses a `maven:3.9.5-eclipse-temurin-17-alpine` image to build the Spring Boot application, producing a `.jar` file in the `/app/target/` directory.
    *   **Stage 2 (runtime)**: Uses a minimal `eclipse-temurin:17-jre-alpine` image. The compiled `.jar` file is copied from the `build` stage and is executed using `java -jar app.jar`.
-   **Healthcheck**: The `db` service includes a healthcheck to ensure the `backend` service only starts after the database is fully initialized and ready to accept connections, preventing startup race conditions.

---

## 2. Detailed Functions

The application provides distinct sets of functionalities for two main roles: **User (Customer)** and **Administrator**.

### 2.1. User Functions

-   **Authentication**: Users can register for a new account, log in, and log out. The system supports a "Remember Me" feature. It also includes secure password recovery via email.
-   **Account Verification**: New accounts are initially `INACTIVE` and must be verified via an OTP code sent to their email.
-   **Car Discovery**:
    -   View a paginated list of all available cars.
    -   Search for cars by keyword (name, model, brand).
    -   Filter cars by brand, category, price range, manufacturing year, and color.
    -   Sort the car list by price, year, or newest arrivals.
-   **Car Details**: View comprehensive details for a specific car, including multiple images, technical specifications, and description.
-   **Car Comparison**: Add up to 3 cars to a comparison list to view their specifications side-by-side.
-   **Order Management**:
    -   Place an order for one or more cars, specifying color and quantity.
    -   Enter shipping and payment information during checkout.
    -   View personal order history and the status of each order.
    -   Cancel an order if it is still in the `PENDING` state.
-   **Profile Management**:
    -   View and update personal information (name, phone, address, etc.).
    -   Change account password.
-   **News**: View a list of published news articles and read their full content.

### 2.2. Administrator Functions

-   **Dashboard**: View an overview of system statistics, including:
    -   Key metrics (total cars, monthly orders, new customers, monthly revenue).
    -   A 6-month revenue bar chart.
    -   An order status pie chart.
    -   Lists of recent orders and cars with low stock.
-   **User Management**:
    -   View a list of all users.
    -   Search and filter users by keyword, role, or status.
    -   Create new user accounts (including administrators).
    -   View and edit the details of any user.
    -   "Soft delete" users by setting their status to `DELETED`.
-   **Car Management (CRUD)**:
    -   View a comprehensive list of all cars in the system.
    -   Create new car listings, including all basic info, technical specifications, multiple colors, and multiple images.
    -   Update any aspect of an existing car.
    -   Delete cars from the system.
-   **Order Management**:
    -   View all orders placed by all users.
    -   Search and filter orders by customer name, phone, or status.
    -   View the complete details of any order.
    -   Update the status of an order (e.g., from `PENDING` to `CONFIRMED`, `SHIPPING`, etc.).
    -   Update a customer's shipping information.
-   **News Management (CRUD)**:
    -   View a list of all news articles (both `DRAFT` and `PUBLISHED`).
    -   Create new articles with a title, content, and cover image.
    -   Update existing articles.
    -   Delete articles.

---

## 3. Use Case Model

### 3.1. Use Case Table

| Actor         | Use Case                                  | Description                                                                       |
| ------------- | ----------------------------------------- | --------------------------------------------------------------------------------- |
| **User**      | Register for Account                      | Creates a new, inactive account and receives a verification email.                |
|               | Verify Account                            | Activates the account using an OTP code from the email.                           |
|               | Log In / Log Out                          | Authenticates to access personal features and ends the session.                   |
|               | Recover Password                          | Resets account password via a secure link sent to their email.                    |
|               | Search and Filter Cars                    | Finds cars based on keywords, brand, category, price, and other attributes.       |
|               | View Car Details                          | Views all information about a single car.                                         |
|               | Compare Cars                              | Selects multiple cars to see a side-by-side specification comparison.             |
|               | **Create Order**                          | Selects a car, color, and quantity, provides shipping info, and places an order.  |
|               | View Order History                        | Views a list of their past and current orders and their statuses.                 |
|               | Manage Profile                            | Updates personal information and changes their password.                          |
| **Admin**     | **Manage Car Inventory**                  | Performs full CRUD operations (Create, Read, Update, Delete) on car listings.     |
|               | Manage User Accounts                      | Performs full CRUD operations on all user and admin accounts in the system.       |
|               | Process Orders                            | Views all system orders, updates their statuses, and manages shipping details.    |
|               | Manage News Content                       | Performs full CRUD operations on news articles.                                   |
|               | View System Dashboard                     | Monitors key business metrics, sales trends, and inventory levels.                |

### 3.2. Detailed Use Case Specifications

#### Use Case 1: Create Order

-   **ID**: UC-01
-   **Use Case Name**: Create an Order
-   **Actor**: User (Customer)
-   **Description**: A logged-in user selects a car, specifies quantity and color, provides shipping details, and confirms the order.
-   **Prerequisites**:
    1.  User must be authenticated (logged in).
    2.  The selected car must be `AVAILABLE` and have sufficient `quantity` in stock.
-   **Main Flow**:
    1.  User navigates to the details page of a desired car.
    2.  User selects a color and specifies the quantity to purchase.
    3.  User clicks the "Buy Now" button.
    4.  System redirects the user to the Checkout page (`/order/checkout`).
    5.  User fills in or confirms their personal and shipping information (name, phone, address).
    6.  User selects a payment method (e.g., `CASH`).
    7.  User reviews the order summary, including subtotal, tax, and total amount.
    8.  User clicks the "Complete Order" button.
    9.  The system validates the car's stock one last time.
    10. The system creates a new `Order` record with `PENDING` status, along with associated `OrderDetail` and `Payment` records.
    11. The system decrements the `quantity` of the purchased `Car` in the database.
    12. The system sends an order confirmation email to the user.
    13. The user is redirected to the home page with a success message.
-   **Postconditions (Consequences)**:
    -   An `Order` is created in the system with `PENDING` status.
    -   The stock quantity of the purchased car is reduced.
    -   The user receives a confirmation email.

#### Use Case 2: Manage Car Inventory

-   **ID**: UC-02
-   **Use Case Name**: Manage Car Inventory
-   **Actor**: Administrator
-   **Description**: An administrator performs CRUD operations on car listings. This specification details the "Create Car" flow.
-   **Prerequisites**:
    1.  User must be authenticated and have the `ADMIN` role.
-   **Main Flow (Create Car)**:
    1.  Admin navigates to the "Manage Cars" page (`/admin/cars`).
    2.  Admin clicks the "Add New Car" button.
    3.  System displays a form with fields for basic information, technical specifications, colors, and images.
    4.  Admin fills in all required fields (e.g., Brand, Model, Price, Quantity, Engine specs).
    5.  Admin selects one or more available colors.
    6.  Admin uploads one or more images for the car.
    7.  Admin clicks the "Create" button.
    8.  The system validates the input data.
    9.  The system creates a new `Car` entity, along with its associated `CarDetail`, `CarImage` entities, and color set.
    10. The system persists the new records to the database.
    11. The admin is redirected back to the car list, which now includes the new car.
-   **Postconditions (Consequences)**:
    -   A new car is available in the system for users to view and purchase.
    -   The corresponding technical details and images are stored.

#### Use Case 3: Register and Verify Account

-   **ID**: UC-03
-   **Use Case Name**: Register and Verify Account
-   **Actor**: User (Customer)
-   **Description**: A new user registers for an account and activates it via an email OTP.
-   **Prerequisites**:
    1.  The user must have a valid, unique email address.
-   **Main Flow**:
    1.  User navigates to the authentication page and selects the "Register" tab.
    2.  User provides their full name, email, and a password (with confirmation).
    3.  User clicks the "Register" button.
    4.  The system validates that the email is not already in use.
    5.  The system creates a new `Account` record with `INACTIVE` status and an associated `User` record.
    6.  The system generates a 6-digit OTP, stores it with a 5-minute expiry time in the `Account` record, and sends it to the user's email.
    7.  The user is redirected to the "Verify Account" page.
    8.  User checks their email, retrieves the OTP, and enters it into the verification form.
    9.  User clicks the "Activate" button.
    10. The system validates the OTP and checks if it has expired.
    11. Upon successful validation, the system updates the `Account` status to `ACTIVE` and clears the OTP fields.
    12. The user is redirected to the login page with a success message.
-   **Postconditions (Consequences)**:
    -   A new, active user account is created in the system.
    -   The user can now log in and access protected features.

---

## 4. Database Mapping (Entity-Relationship Diagram)

Based on the JPA entities, the following relational schema is implemented.

-   **accounts**
    -   `account_id` (PK, UUID String)
    -   `email` (UNIQUE, VARCHAR)
    -   `password` (VARCHAR, Encrypted)
    -   `role` (ENUM: 'USER', 'ADMIN')
    -   `status` (ENUM: 'ACTIVE', 'INACTIVE', 'BANNED', 'DELETED')
    -   `verification_code` (VARCHAR)
    -   `verification_code_expires_at` (DATETIME)
    -   ... (audit fields)
-   **users**
    -   `user_id` (PK, UUID String)
    -   `account_id` (FK -> `accounts.account_id`, UNIQUE, One-to-One)
    -   `full_name`, `dob`, `gender`, `phone` (UNIQUE), `address`, `avatar_url`
-   **cars**
    -   `car_id` (PK, BIGINT)
    -   `brand`, `category` (ENUMs)
    -   `model`, `manufacture_year`, `price`, `description`
    -   `quantity`, `sold_quantity` (INT)
    -   `status` (ENUM: 'AVAILABLE', 'SOLD')
-   **car_details**
    -   `car_detail_id` (PK, BIGINT)
    -   `car_id` (FK -> `cars.car_id`, UNIQUE, One-to-One)
    -   `engine`, `horsepower`, `torque`, `transmission`, etc.
-   **car_images**
    -   `id` (PK, BIGINT)
    -   `car_id` (FK -> `cars.car_id`, Many-to-One)
    -   `image_url` (VARCHAR)
-   **car_colors** (Junction Table)
    -   `car_id` (FK -> `cars.car_id`)
    -   `color` (VARCHAR)
-   **orders**
    -   `order_id` (PK, UUID String)
    -   `user_id` (FK -> `users.user_id`, Many-to-One)
    -   `full_name`, `email`, `phone`, `address`, `city`, `district`, `ward`, `note`
    -   `subtotal`, `shipping_fee`, `tax`, `total_amount` (DECIMAL)
    -   `order_date` (DATETIME)
    -   `status` (ENUM)
-   **order_details**
    -   `order_detail_id` (PK, BIGINT)
    -   `order_id` (FK -> `orders.order_id`, Many-to-One)
    -   `car_id` (FK -> `cars.car_id`, Many-to-One)
    -   `color_name` (ENUM)
    -   `quantity`, `price`
-   **payment**
    -   `payment_id` (PK, UUID String)
    -   `order_id` (FK -> `orders.order_id`, UNIQUE, One-to-One)
    -   `payment_date`, `amount`, `payment_method`, `status`, `transaction_id`
-   **news**
    -   `news_id` (PK, BIGINT)
    -   `title`, `slug` (UNIQUE), `excerpt`, `content`, `cover_image_url`
    -   `status` (ENUM: 'DRAFT', 'PUBLISHED')
    -   `published_at`, `created_at`, `updated_at`
-   **password_reset_tokens**
    -   `id` (PK, BIGINT)
    -   `token` (UNIQUE)
    -   `account_id` (FK -> `accounts.account_id`, One-to-One)
    -   `expiry_date` (DATETIME)

---

## 5. Proposed Thesis Outline

Based on the in-depth analysis of the source code, the following outlines for Chapters 2 and 3 of your thesis are proposed to ensure full alignment with the project's implementation.

### **Chapter 2: System Analysis**

1.  **Introduction**
    *   Purpose of the system (e.g., to build a modern e-commerce platform for car sales).
    *   Scope and objectives.
2.  **Functional Requirements**
    *   2.2.1. **User-Facing Features**: Detail all functions available to the customer (e.g., account management, car browsing, ordering).
    *   2.2.2. **Administrator Features**: Detail all functions available to the admin (e.g., dashboard, CRUD operations on all entities).
3.  **Non-Functional Requirements**
    *   **Usability**: The system should have a responsive, intuitive, and modern user interface.
    *   **Security**: Authentication is required for sensitive actions; roles separate user and admin privileges. Passwords must be encrypted.
    *   **Performance**: The application should load quickly, leveraging a modern frontend stack (Vite) and efficient backend queries.
    *   **Maintainability**: Code is structured into modules (services, components, controllers, entities) with a clear separation of concerns.
4.  **Use Case Analysis**
    *   4.1. **Actor Identification**: Define the User and Administrator actors.
    *   4.2. **Use Case Diagram**: (You can create a diagram based on the table in section 3.1).
    *   4.3. **Detailed Use Case Specifications**: Present the detailed specifications for key use cases (e.g., Create Order, Manage Car Inventory, Register and Verify Account, as detailed in section 3.2).

### **Chapter 3: System Design**

1.  **Architectural Design**
    *   1.1. **Chosen Architecture**: Describe the three-tier, service-oriented architecture.
    *   1.2. **System Components**: Detail the Frontend (React/Nginx), Backend (Spring Boot), and Database (MySQL) components.
    -   1.3. **Containerization Strategy**: Explain the use of Docker and Docker Compose for environment consistency and service orchestration.
    *   1.4. **Technology Stack**: Present the full technology stack as detailed in section 1.2.
2.  **Database Design**
    *   2.1. **Conceptual Model**: Briefly discuss the main entities (Users, Cars, Orders).
    *   2.2. **Logical Model (ERD)**: Present the Entity-Relationship Diagram based on the detailed mapping in section 4. Describe each table, its columns, data types, and constraints (PK, FK, UNIQUE).
    *   2.3. **Physical Model**: Explain that the schema is automatically generated and managed by Spring Data JPA (Hibernate) based on the `@Entity` classes.
3.  **Component and Class Design**
    *   3.1. **Backend Design**:
        *   **Controller Layer**: Explain the role of controllers like `CarController`, `OrderController` in handling HTTP requests.
        *   **Service Layer**: Describe how services like `CarService`, `OrderService` encapsulate business logic.
        *   **Repository Layer**: Explain the use of Spring Data JPA repositories (`CarRepository`, etc.) for database interaction.
        *   **Security Design**: Detail the Spring Security configuration (`SecurityConfig.java`), explaining JWT-based authentication, the role of `JwtAuthenticationFilter`, and how endpoint access is restricted based on roles.
    *   3.2. **Frontend Design**:
        *   **Component Structure**: Describe the organization of React components in `src/pages`, `src/components`, and `src/layouts`.
        *   **State Management**: Explain the use of Zustand for global state management (e.g., `useUserStore` for authentication, `useOrderStore` for the shopping cart).
        *   **Data Fetching**: Describe the service layer pattern (`src/services`) using a centralized Axios instance (`apiClient.ts`) for all API communication. Explain the role of interceptors in handling auth tokens and errors.
        *   **Routing**: Explain how `react-router-dom` is used to define public, private, and admin routes, including the use of `ProtectedRoute`.
4.  **User Interface (UI) Design**
    *   Briefly describe the UI/UX principles, mentioning the use of Tailwind CSS and the ShadCN/UI component library for a modern and consistent design.
    *   Reference key layout components like `MainLayout` and `AdminLayout`.

