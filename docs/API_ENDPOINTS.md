# API Endpoints Documentation

## Base URL

```
http://localhost:3000/api
```

## Authentication Endpoints

### Login

**POST** `/auth/login`

Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "admin@clinic.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "admin@clinic.com",
    "role": "Admin",
    "full_name": "System Administrator"
  }
}
```

**Response (401):**
```json
{
  "message": "Invalid email or password."
}
```

### Get Profile

**GET** `/auth/profile`

Get authenticated user's profile.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "id": 1,
  "email": "admin@clinic.com",
  "role": "Admin",
  "full_name": "System Administrator"
}
```

---

## Inventory Endpoints

### List All Items

**GET** `/inventory`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Inventory fetched successfully",
  "data": [
    {
      "id": 1,
      "item_name": "Paracetamol 500mg",
      "category": "Medicines",
      "unit": "Tablet",
      "opening_stock": 500,
      "current_stock": 480,
      "reorder_level": 50,
      "unit_cost": 0.50,
      "supplier": "Clinic Pharmacy",
      "created_at": "2026-10-09 12:00:00"
    }
  ]
}
```

### Get Item Details

**GET** `/inventory/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Item fetched successfully",
  "data": {
    "id": 1,
    "item_name": "Paracetamol 500mg",
    "category": "Medicines",
    "unit": "Tablet",
    "opening_stock": 500,
    "current_stock": 480,
    "reorder_level": 50,
    "unit_cost": 0.50,
    "supplier": "Clinic Pharmacy",
    "created_at": "2026-10-09 12:00:00"
  }
}
```

### Add New Item

**POST** `/inventory`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Note:** Admin only

**Request:**
```json
{
  "item_name": "New Medicine",
  "category": "Medicines",
  "unit": "Tablet",
  "opening_stock": 100,
  "reorder_level": 20,
  "unit_cost": 1.50,
  "supplier": "Clinic Pharmacy"
}
```

**Response (201):**
```json
{
  "message": "Item added successfully",
  "data": {
    "id": 9,
    "item_name": "New Medicine",
    "category": "Medicines",
    "unit": "Tablet",
    "opening_stock": 100,
    "current_stock": 100,
    "reorder_level": 20,
    "unit_cost": 1.50,
    "supplier": "Clinic Pharmacy"
  }
}
```

### Update Item

**PUT** `/inventory/:id`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Note:** Admin only

**Request:**
```json
{
  "item_name": "Updated Medicine",
  "category": "Medicines",
  "unit": "Tablet",
  "reorder_level": 25,
  "unit_cost": 1.75,
  "supplier": "New Supplier"
}
```

**Response (200):**
```json
{
  "message": "Item updated successfully"
}
```

---

## Stock In Endpoints

### Record Stock In

**POST** `/stock-in`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Note:** Admin only

**Request:**
```json
{
  "item_id": 1,
  "quantity_in": 50,
  "unit_cost": 0.50,
  "supplier": "Clinic Pharmacy",
  "notes": "Received new stock"
}
```

**Response (201):**
```json
{
  "message": "Stock in recorded successfully",
  "data": {
    "id": 1,
    "item_id": 1,
    "quantity_in": 50,
    "unit_cost": 0.50,
    "supplier": "Clinic Pharmacy",
    "notes": "Received new stock"
  }
}
```

### Get Stock In History

**GET** `/stock-in`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Stock in history fetched successfully",
  "data": [
    {
      "id": 1,
      "item_id": 1,
      "item_name": "Paracetamol 500mg",
      "quantity_in": 50,
      "unit_cost": 0.50,
      "supplier": "Clinic Pharmacy",
      "notes": "Received new stock",
      "received_by": 1,
      "received_by_name": "System Administrator",
      "date_in": "2026-10-09 12:30:00"
    }
  ]
}
```

---

## Stock Out Endpoints

### Record Stock Out (Sales)

**POST** `/stock-out`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "item_id": 1,
  "quantity_out": 20,
  "sale_price": 1.00,
  "sold_to": "Patient Name",
  "notes": "Sold to patient"
}
```

**Response (201):**
```json
{
  "message": "Stock out recorded successfully",
  "data": {
    "id": 1,
    "item_id": 1,
    "quantity_out": 20,
    "sale_price": 1.00,
    "sold_to": "Patient Name",
    "notes": "Sold to patient"
  }
}
```

**Response (400) - Insufficient Stock:**
```json
{
  "message": "Insufficient stock. Available: 15, Requested: 20"
}
```

### Get Stock Out History

**GET** `/stock-out`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Stock out history fetched successfully",
  "data": [
    {
      "id": 1,
      "item_id": 1,
      "item_name": "Paracetamol 500mg",
      "quantity_out": 20,
      "sale_price": 1.00,
      "sold_to": "Patient Name",
      "notes": "Sold to patient",
      "recorded_by": 2,
      "recorded_by_name": "Clinic Staff Member",
      "date_out": "2026-10-09 13:00:00"
    }
  ]
}
```

---

## Report Endpoints

### Daily Report

**GET** `/reports/daily`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Daily report generated successfully",
  "data": {
    "report_date": "2026-10-09",
    "stock_in": {
      "total_transactions": 2,
      "total_quantity": 100
    },
    "stock_out": {
      "total_transactions": 5,
      "total_quantity": 45,
      "total_sales": 95.00
    }
  }
}
```

### Weekly Report

**GET** `/reports/weekly`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Weekly report generated successfully",
  "data": {
    "period": "Last 7 days",
    "daily_breakdown": [
      {
        "report_date": "2026-10-09",
        "total_quantity_out": 45,
        "total_sales": 95.00
      }
    ],
    "summary": {
      "total_quantity": 45,
      "total_sales": 95.00
    }
  }
}
```

### Monthly Report

**GET** `/reports/monthly`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Monthly report generated successfully",
  "data": {
    "period": "Last 30 days",
    "daily_breakdown": [
      {
        "report_date": "2026-10-09",
        "total_quantity_out": 45,
        "total_sales": 95.00
      }
    ],
    "summary": {
      "total_quantity": 45,
      "total_sales": 95.00
    }
  }
}
```

### Stock Levels Report

**GET** `/reports/stock-levels`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Stock levels report generated successfully",
  "data": {
    "summary": {
      "low_stock": 2,
      "moderate_stock": 1,
      "good_stock": 5,
      "total_items": 8
    },
    "items": [
      {
        "id": 1,
        "item_name": "Paracetamol 500mg",
        "category": "Medicines",
        "unit": "Tablet",
        "current_stock": 480,
        "reorder_level": 50,
        "status": "GOOD"
      }
    ]
  }
}
```

---

## Error Responses

### 400 - Bad Request
```json
{
  "message": "Required field missing or invalid format"
}
```

### 401 - Unauthorized
```json
{
  "message": "Authentication required."
}
```

### 403 - Forbidden
```json
{
  "message": "Admin access required."
}
```

### 404 - Not Found
```json
{
  "message": "Resource not found."
}
```

### 500 - Internal Server Error
```json
{
  "message": "Database error."
}
```

---

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer {token}
```

The token is obtained from the login endpoint and is valid for 8 hours.
