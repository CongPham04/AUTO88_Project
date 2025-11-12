# API Reference Guide - User Management

**Last Updated**: 2025-10-08

---

## 📋 How to Check Which API to Use

### Method 1: Check Swagger UI (Visual - Recommended)

**URL**: http://localhost:8080/carshop/swagger-ui/index.html?urls.primaryName=Admin+API#/

**Steps**:
1. Open the URL in your browser
2. Select **"Admin API"** from the dropdown at the top
3. Find **"UserController"** section
4. Look for the endpoint you need (GET, POST, PUT, DELETE)
5. Click "Try it out" to see request/response examples

### Method 2: Check OpenAPI JSON

**URL**: http://localhost:8080/carshop/v3/api-docs

**Steps**:
```bash
# Get all API documentation as JSON
curl http://localhost:8080/carshop/v3/api-docs | python -m json.tool
```

### Method 3: Test with curl (Direct Testing)

```bash
# 1. Login to get token
curl -X POST http://localhost:8080/carshop/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username": "admin", "password": "admin"}'

# 2. Use the token in subsequent requests
curl -X PUT http://localhost:8080/carshop/api/users/{userId} \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H 'Content-Type: application/json' \
  -d '{"fullName": "Test", ...}'
```

---

## 🔧 User Management APIs

### 1. **Get All Users**

**Method**: `GET`
**Endpoint**: `/api/users`
**Content-Type**: N/A (GET request)
**Authorization**: Required (Bearer token)

**Response**:
```json
{
  "code": 200,
  "message": "Lấy danh sách người dùng thành công!",
  "data": [
    {
      "userId": "uuid",
      "fullName": "string",
      "dob": "1990-01-15",
      "gender": "MALE",
      "phone": "0987654321",
      "address": "string",
      "avatarUrl": "url",
      "accountId": "uuid",
      "username": "string",
      "email": "email@example.com",
      "role": "USER",
      "status": "ACTIVE"
    }
  ]
}
```

---

### 2. **Get User by ID**

**Method**: `GET`
**Endpoint**: `/api/users/{userId}`
**Content-Type**: N/A
**Authorization**: Required

**Example**:
```bash
curl -X GET http://localhost:8080/carshop/api/users/abc-123-def \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3. **Create User with Account** ✅ (Currently Used)

**Method**: `POST`
**Endpoint**: `/api/users/create-with-account`
**Content-Type**: `multipart/form-data`
**Authorization**: Required

**Request Body** (FormData):
```typescript
{
  username: string,        // required, 3-50 chars, alphanumeric + underscore
  email: string,          // required, valid email format
  password: string,       // required, 6-50 chars
  fullName: string,       // required
  phone: string,          // required, 10-20 digits
  gender: "MALE" | "FEMALE" | "OTHER",
  dob: "YYYY-MM-DD",      // date format
  role: "USER" | "ADMIN", // defaults to USER
  status: "ACTIVE" | "INACTIVE" | "BANNED", // defaults to ACTIVE
  address?: string,       // optional
  avatarFile?: File       // optional, binary file
}
```

**Success Response**:
```json
{
  "code": 200,
  "message": "Tạo tài khoản và người dùng thành công!",
  "data": {
    "userId": "generated-uuid",
    "fullName": "Test User",
    "role": "ADMIN",
    ...
  }
}
```

**Example (curl)**:
```bash
curl -X POST http://localhost:8080/carshop/api/users/create-with-account \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "username=testuser" \
  -F "email=test@example.com" \
  -F "password=TestPass123" \
  -F "fullName=Test User" \
  -F "phone=0987654321" \
  -F "gender=MALE" \
  -F "dob=1990-01-15" \
  -F "role=ADMIN"
```

---

### 4. **Update User** ⚠️ (Need to Fix)

**Method**: `PUT`
**Endpoint**: `/api/users/{userId}`
**Content-Type**: `application/json` ⚠️ **NOT multipart/form-data**
**Authorization**: Required

**Description**:
> "API to update user and account information. Supports updating: fullName, dob, gender, phone, address, email, role, status"

**Request Body** (JSON):
```json
{
  "fullName": "string",
  "dob": "2025-01-15",
  "gender": "MALE" | "FEMALE" | "OTHER",
  "phone": "0987654321",
  "address": "string",
  "email": "email@example.com",
  "role": "USER" | "ADMIN",
  "status": "ACTIVE" | "INACTIVE" | "BANNED"
}
```

**Success Response**:
```json
{
  "code": 200,
  "message": "Cập nhật người dùng thành công!",
  "data": {
    "userId": "uuid",
    "fullName": "Updated Name",
    ...
  }
}
```

**Example (curl)**:
```bash
curl -X PUT http://localhost:8080/carshop/api/users/abc-123-def \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Updated Name",
    "dob": "1990-01-15",
    "gender": "MALE",
    "phone": "0987654321",
    "address": "New Address",
    "email": "updated@example.com",
    "role": "ADMIN",
    "status": "ACTIVE"
  }'
```

**Current Issue in Code**:
- ❌ Current code uses `UserRequest` interface (missing email, role, status)
- ❌ Sends as JSON but doesn't include account fields
- ✅ Should use `UserUpdateRequest` interface with all fields

---

### 5. **Delete User**

**Method**: `DELETE`
**Endpoint**: `/api/users/{userId}`
**Content-Type**: N/A
**Authorization**: Required

**Success Response**:
```json
{
  "code": 200,
  "message": "Xóa người dùng thành công!",
  "data": null
}
```

**Example (curl)**:
```bash
curl -X DELETE http://localhost:8080/carshop/api/users/abc-123-def \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔍 Key Differences Between Create vs Update

| Aspect | Create User | Update User |
|--------|-------------|-------------|
| **Endpoint** | `/api/users/create-with-account` | `/api/users/{userId}` |
| **Method** | POST | PUT |
| **Content-Type** | `multipart/form-data` | `application/json` |
| **Requires** | username, email, password | userId in URL |
| **Can Update** | Creates new user + account | Updates existing user + account |
| **Avatar** | Via `avatarFile` (FormData) | Not supported in this endpoint ⚠️ |

---

## ⚠️ Important Notes

### Update User Limitations:
1. **Cannot update avatar via PUT endpoint** - The update endpoint uses JSON, not multipart/form-data
2. **Must include all fields** - Backend might require all fields even if not changing
3. **Email and Role are updateable** - Unlike create, update allows changing email and role

### Avatar Update Workaround:
If you need to update avatar, you may need to:
1. Check if there's a separate avatar upload endpoint
2. Or use the deprecated `/api/users/{accountId}` POST endpoint (multipart/form-data)
3. Or backend needs to add avatar support to PUT endpoint

---

## 🛠️ Testing in Swagger UI

**Steps**:
1. Go to: http://localhost:8080/carshop/swagger-ui/index.html
2. Select **"Admin API"** from dropdown
3. Click **"Authorize"** button
4. Enter token: `Bearer YOUR_TOKEN_HERE`
5. Find **UserController** → **PUT /api/users/{userId}**
6. Click **"Try it out"**
7. Fill in `userId` parameter
8. Fill in request body JSON
9. Click **"Execute"**
10. See response below

---

## 📋 Required Code Changes

### Current UserRequest Interface (Incomplete):
```typescript
export interface UserRequest {
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address: string;
  role?: 'USER' | 'ADMIN';  // Added but optional
  avatarFile?: File;        // Won't work with JSON update
}
```

### Should Be (UserUpdateRequest):
```typescript
export interface UserUpdateRequest {
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address: string;
  email: string;              // ✅ Required for update
  role: 'USER' | 'ADMIN';     // ✅ Required for update
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';  // ✅ Required for update
}
```

### Update Service Method:
```typescript
async updateUser(userId: string, userData: UserUpdateRequest): Promise<UserResponse> {
  const response = await apiClient.put<ApiResponse<UserResponse>>(
    `/users/${userId}`,
    {
      fullName: userData.fullName,
      dob: userData.dob,
      gender: userData.gender,
      phone: userData.phone,
      address: userData.address,
      email: userData.email,      // ✅ Add
      role: userData.role,        // ✅ Add
      status: userData.status,    // ✅ Add
    }
  );

  if (response.data.code === 200) {
    return response.data.data;
  } else {
    throw new Error(response.data.message || 'Failed to update user');
  }
}
```

---

**Last Updated**: 2025-10-08
