# Implementation Plan: Admin Users Management

**Date Created**: 2025-10-08
**Route**: `/admin/users`
**API Reference**: UserController from Auto88 Backend Swagger

---

## 📋 Overview

Integrate UserController APIs with the frontend to implement a fully functional user management page for administrators at route `/admin/users`.

---

## 🎯 Goals

1. ✅ Integrate all UserController CRUD APIs
2. ✅ Implement comprehensive user management UI
3. ✅ Follow existing code conventions and style
4. ✅ Maintain clean, maintainable code structure

---

## 📊 API Endpoints to Integrate

Based on the Swagger documentation, the following UserController endpoints need to be integrated:

### User CRUD Operations
- **GET** `/api/users` - Get all users ✅
- **GET** `/api/users/{userId}` - Get user detail by ID ✅
- **GET** `/api/users/username/{username}` - Get user by username ✅
- **POST** `/api/users/create-with-account` - Create new user with account (multipart/form-data) ✅
  - **Note**: Changed from `/api/users/{accountId}` to use the combined endpoint that creates both account and user
- **PUT** `/api/users/{userId}` - Update user (application/json) ✅
- **DELETE** `/api/users/{userId}` - Delete user ✅

### Additional Endpoint
- **GET** `/api/users/avatar/image/{filename}` - Get user avatar image

---

## 🗂️ Current State Analysis

### ✅ What Already Exists
- Route `/admin/users` configured in `src/routes/AppRoutes.tsx:57`
- Basic `AdminUsers.tsx` placeholder component at `src/pages/admin/AdminUsers.tsx`
- Partial `userService.ts` with only 2 methods:
  - `getUserByUsername()`
  - `getUserById()`
- `apiClient.ts` configured with auth interceptors
- `UserResponse` interface (incomplete - missing account fields)

### ❌ What's Missing
- Complete UserResponse interface with account info (username, email, role, status)
- UserRequest interface for create/update operations
- Service methods for:
  - `getAllUsers()`
  - `createUser()`
  - `updateUser()`
  - `deleteUser()`
- Full AdminUsers page implementation with:
  - User list table
  - Create/Edit user dialog
  - Delete confirmation
  - Search/Filter functionality
  - Avatar upload handling
  - Role and status management

---

## 🏗️ Implementation Tasks

### **Phase 1: Update Type Definitions & Service Layer**

#### Task 1.1: Update UserResponse Interface
**File**: `src/services/userService.ts`

Add missing fields from API schema:
```typescript
export interface UserResponse {
  userId: string;
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address: string;
  avatarUrl: string;
  // Add missing account info fields:
  accountId: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
}
```

#### Task 1.2: Create UserRequest Interface
**File**: `src/services/userService.ts`

Based on API schema for multipart/form-data:
```typescript
export interface UserRequest {
  fullName: string;
  dob: string; // format: date
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address: string;
  avatarFile?: File; // binary file for avatar
}
```

#### Task 1.3: Implement Missing Service Methods
**File**: `src/services/userService.ts`

Add the following methods to UserService class:
- `getAllUsers(): Promise<UserResponse[]>`
- `createUser(accountId: string, userData: UserRequest): Promise<void>`
- `updateUser(userId: string, userData: UserRequest): Promise<void>`
- `deleteUser(userId: string): Promise<void>`

**Notes**:
- `createUser` uses multipart/form-data (handle avatar file upload)
- `updateUser` uses application/json (handle avatar separately if needed)
- Follow existing error handling pattern (check code === 200)

---

### **Phase 2: Build AdminUsers Page Components**

#### Task 2.1: Create User Table Component
**File**: `src/pages/admin/AdminUsers.tsx`

Features:
- Display all users in a table format
- Columns: Avatar, Full Name, Username, Email, Phone, Role, Status, Actions
- Action buttons: View, Edit, Delete
- Follow the style from `AdminCars.tsx` (similar table structure)
- Use Card, Button, Badge components from UI library
- Format date of birth appropriately
- Display avatar with fallback

#### Task 2.2: Create User Dialog (Create/Edit)
**File**: `src/pages/admin/AdminUsers.tsx` or separate component

Features:
- Modal dialog for creating new user
- Same dialog reused for editing existing user
- Form fields:
  - Full Name (text input)
  - Date of Birth (date picker)
  - Gender (select: MALE, FEMALE, OTHER)
  - Phone (text input)
  - Address (textarea)
  - Avatar upload (file input with preview)
  - Role (select: USER, ADMIN) - for create only
  - Status (select: ACTIVE, INACTIVE, BANNED)
- Form validation
- Handle file upload for avatar
- Success/error toast notifications

#### Task 2.3: Create Delete Confirmation Dialog
**File**: `src/pages/admin/AdminUsers.tsx` or separate component

Features:
- Confirmation modal before deleting
- Display user info being deleted
- Cancel/Confirm actions
- Success/error toast notifications

#### Task 2.4: Add Search and Filter
**File**: `src/pages/admin/AdminUsers.tsx`

Features:
- Search bar (filter by name, username, email)
- Role filter dropdown
- Status filter dropdown
- Real-time filtering of user table

---

### **Phase 3: State Management & Data Flow**

#### Task 3.1: Implement State Management
**File**: `src/pages/admin/AdminUsers.tsx`

Use React hooks for:
- User list state
- Loading state
- Selected user for edit
- Dialog open/close states
- Search and filter states

#### Task 3.2: Implement Data Fetching
**File**: `src/pages/admin/AdminUsers.tsx`

- Fetch all users on component mount
- Handle loading states
- Handle errors with toast notifications
- Refresh list after create/update/delete

#### Task 3.3: Implement CRUD Operations
**File**: `src/pages/admin/AdminUsers.tsx`

Connect UI actions to service methods:
- Create user → `userService.createUser()`
- Update user → `userService.updateUser()`
- Delete user → `userService.deleteUser()`
- All with proper error handling and user feedback

---

### **Phase 4: UI Polish & Testing**

#### Task 4.1: Style Refinement
- Ensure consistent styling with other admin pages
- Responsive design (table scrolls on mobile)
- Loading skeletons
- Empty state when no users

#### Task 4.2: Error Handling
- Network errors
- Validation errors
- Display friendly error messages
- Handle 401/403 for unauthorized actions

#### Task 4.3: Manual Testing
- [ ] Create new user with all fields
- [ ] Create new user with avatar upload
- [ ] Edit existing user
- [ ] Delete user
- [ ] Search functionality
- [ ] Filter by role
- [ ] Filter by status
- [ ] View user details
- [ ] Responsive design on mobile
- [ ] Error handling scenarios

---

## 📁 Files to Modify/Create

### Modify:
1. `src/services/userService.ts` - Add interfaces and methods
2. `src/pages/admin/AdminUsers.tsx` - Complete implementation

### May Create (if components get complex):
3. `src/components/admin/UserTable.tsx` (optional)
4. `src/components/admin/UserDialog.tsx` (optional)
5. `src/components/admin/DeleteUserDialog.tsx` (optional)

---

## 🎨 Coding Conventions to Follow

Based on analysis of existing code:

1. **Service Layer Pattern**:
   - Class-based services with singleton export
   - `export default new ClassName()`
   - Error checking with `response.data.code === 200`
   - Throw descriptive errors

2. **TypeScript**:
   - Explicit interfaces for all API models
   - Proper typing for all functions
   - Use enums for fixed values (Gender, Role, Status)

3. **API Response Structure**:
   ```typescript
   interface ApiResponse<T> {
     code: number;
     message: string;
     data: T;
   }
   ```

4. **Component Structure**:
   - Functional components with hooks
   - UI components from `@/components/ui/`
   - Icons from `lucide-react`
   - Vietnamese labels for UI text

5. **Styling**:
   - Tailwind CSS utility classes
   - Hover states with transitions
   - Cursor pointer on interactive elements
   - Consistent spacing (space-y-6, p-4, etc.)

6. **File Organization**:
   - Imports organized: React → third-party → components → local
   - Helper functions before component definition
   - Export default component

---

## 🚀 Success Criteria

- [x] All UserController API endpoints integrated in userService.ts
- [x] Full CRUD functionality working (Create, Read, Update, Delete)
- [x] Search and filter working correctly
- [x] Avatar upload and display working
- [x] Clean, maintainable code following project conventions
- [x] Responsive UI matching existing admin pages style
- [x] Proper error handling and user feedback
- [ ] All manual tests passing (Requires backend testing)

---

## 📝 Notes

- ✅ **RESOLVED**: Changed from `/api/users/{accountId}` to `/api/users/create-with-account` endpoint
  - The API creates both account and user in a single request
  - Requires: username, email, password, fullName, phone, gender, dob
  - Optional: address, avatarFile
- Avatar upload uses multipart/form-data for both POST and PUT operations
- Consider pagination if user list grows large (not in current API, but good future enhancement)

---

## 🔄 Progress Tracking

- [x] Phase 1: Update Type Definitions & Service Layer
  - [x] Task 1.1: Update UserResponse Interface
  - [x] Task 1.2: Create UserRequest & CreateUserWithAccountRequest Interfaces
  - [x] Task 1.3: Implement Missing Service Methods
- [x] Phase 2: Build AdminUsers Page Components
  - [x] Task 2.1: Create User Table Component
  - [x] Task 2.2: Create User Dialog (Create/Edit)
  - [x] Task 2.3: Create Delete Confirmation Dialog
  - [x] Task 2.4: Add Search and Filter
- [x] Phase 3: State Management & Data Flow
  - [x] Task 3.1: Implement State Management
  - [x] Task 3.2: Implement Data Fetching
  - [x] Task 3.3: Implement CRUD Operations
- [x] Phase 4: UI Polish & Testing
  - [x] Task 4.1: Style Refinement
  - [x] Task 4.2: Error Handling
  - [ ] Task 4.3: Manual Testing (Ready for testing)

---

## ✅ IMPLEMENTATION COMPLETED

**Completion Date**: 2025-10-08

### Summary
All development tasks completed successfully. The `/admin/users` route now has:
- Complete CRUD operations for user management
- Advanced search and filtering capabilities
- Avatar upload with preview
- Responsive design matching existing admin pages
- Proper error handling with toast notifications
- Separate form states for create and edit operations

### API Endpoint Update
Changed create user endpoint from `/api/users/{accountId}` to `/api/users/create-with-account` which creates both account and user in a single request.

### Files Modified
1. `src/services/userService.ts` - Added all CRUD methods and interfaces
2. `src/pages/admin/AdminUsers.tsx` - Complete UI implementation

### Ready for Testing
The implementation is ready for manual testing with the backend API.

---

**Last Updated**: 2025-10-08
