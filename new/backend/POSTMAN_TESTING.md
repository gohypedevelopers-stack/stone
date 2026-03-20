# OMW Backend API Testing Guide

This file gives full API URLs, request JSON, and example responses for testing in Postman.

## Server URL

Backend runs on:

```text
http://localhost:5000
```

All APIs use:

```text
http://localhost:5000/api
```

## Request Header

For every `POST` and `PATCH` request, use:

```text
Content-Type: application/json
```

## Step 1. Health Check

### Request

Method:

```text
GET
```

URL:

```text
http://localhost:5000/api/health
```

### Example Response

```json
{
  "success": true,
  "message": "OMW backend is running",
  "timestamp": "2026-03-18T12:00:00.000Z"
}
```

## Step 2. Register Customer

### Request

Method:

```text
POST
```

URL:

```text
http://localhost:5000/api/auth/register
```

Body:

```json
{
  "name": "Test User",
  "mobile": "9999999999",
  "email": "testuser@example.com",
  "password": "yourpassword123"
}
```

### Example Response

```json
{
  "success": true,
  "message": "Customer registered successfully",
  "data": {
    "id": "cmabc123456789",
    "name": "Test User",
    "mobile": "9999999999",
    "email": "testuser@example.com",
    "rewardPoints": 0,
    "createdAt": "2026-03-18T12:00:00.000Z",
    "updatedAt": "2026-03-18T12:00:00.000Z"
  }
}
```

## Step 3. Login Customer

There is no password in the current backend. Login is currently done only by mobile number and returns a placeholder token.

### Request

Method:

```text
POST
```

URL:

```text
http://localhost:5000/api/auth/login
```

Body:

```json
{
  "mobile": "9876543210",
  "password": "yourpassword123"
}
```

### Example Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "mock-jwt-token",
    "customer": {
      "id": "cmseedcustomer001",
      "name": "Aarav Sharma",
      "mobile": "9876543210",
      "email": "aarav@example.com",
      "rewardPoints": 320,
      "createdAt": "2026-03-18T12:00:00.000Z",
      "updatedAt": "2026-03-18T12:00:00.000Z",
      "addresses": [
        {
          "id": "seed-home-address",
          "customerId": "cmseedcustomer001",
          "label": "Home",
          "line1": "42 Green Park",
          "line2": null,
          "city": "New Delhi",
          "state": "Delhi",
          "postalCode": "110016",
          "country": "India",
          "createdAt": "2026-03-18T12:00:00.000Z",
          "updatedAt": "2026-03-18T12:00:00.000Z"
        }
      ]
    }
  }
}
```

## Step 4. Get Customer Profile

### Request 1

Method:

```text
GET
```

URL:

```text
http://localhost:5000/api/auth/profile
```

### Request 2

```text
http://localhost:5000/api/auth/profile?mobile=9876543210
```

### Request 3

```text
http://localhost:5000/api/auth/profile?customerId=YOUR_CUSTOMER_ID
```

### Example Response

```json
{
  "success": true,
  "message": "Customer profile fetched",
  "data": {
    "id": "cmseedcustomer001",
    "name": "Aarav Sharma",
    "mobile": "9876543210",
    "email": "aarav@example.com",
    "rewardPoints": 320,
    "addresses": [
      {
        "id": "seed-home-address",
        "label": "Home",
        "line1": "42 Green Park",
        "city": "New Delhi",
        "state": "Delhi",
        "postalCode": "110016"
      }
    ],
    "orders": [],
    "offlinePurchases": []
  }
}
```

Copy from response:

- `data.id` -> customer id
- `data.addresses[0].id` -> address id

## Step 5. Get Vendors

### Request

Method:

```text
GET
```

URL:

```text
http://localhost:5000/api/vendors
```

### Example Response

```json
{
  "success": true,
  "message": "Vendors fetched",
  "data": [
    {
      "id": "cmvendor001",
      "businessName": "Glow House",
      "storeAddress": "Connaught Place, New Delhi",
      "contactNumber": "9898989898",
      "email": "hello@glowhouse.com",
      "businessCategory": "Beauty & Skincare",
      "identityDocument": null,
      "approvalStatus": "approved",
      "createdAt": "2026-03-18T12:00:00.000Z",
      "updatedAt": "2026-03-18T12:00:00.000Z",
      "analytics": {
        "totalOrders": 1,
        "totalRevenue": 999,
        "totalProducts": 1,
        "lowStockCount": 0
      }
    }
  ]
}
```

Copy:

- `data[0].id` -> vendor id

## Step 6. Create Vendor

### Request

Method:

```text
POST
```

URL:

```text
http://localhost:5000/api/vendors
```

Body:

```json
{
  "businessName": "Fresh Glow Store",
  "storeAddress": "Bandra West, Mumbai",
  "contactNumber": "9899999999",
  "email": "freshglow@example.com",
  "businessCategory": "Beauty & Skincare",
  "identityDocument": "GSTIN-12345",
  "approvalStatus": "pending"
}
```

### Example Response

```json
{
  "success": true,
  "message": "Vendor submitted for approval",
  "data": {
    "id": "cmvendor002",
    "businessName": "Fresh Glow Store",
    "storeAddress": "Bandra West, Mumbai",
    "contactNumber": "9899999999",
    "email": "freshglow@example.com",
    "businessCategory": "Beauty & Skincare",
    "identityDocument": "GSTIN-12345",
    "approvalStatus": "pending",
    "analytics": {
      "totalOrders": 0,
      "totalRevenue": 0,
      "totalProducts": 0,
      "lowStockCount": 0
    }
  }
}
```

## Step 7. Vendor Dashboard

### Request

Method:

```text
GET
```

URL:

```text
http://localhost:5000/api/vendors/dashboard
```

### Example Response

```json
{
  "success": true,
  "message": "Vendor dashboard summary fetched",
  "data": [
    {
      "id": "cmvendor001",
      "businessName": "Glow House",
      "approvalStatus": "approved",
      "analytics": {
        "totalOrders": 1,
        "totalRevenue": 999,
        "totalProducts": 1,
        "lowStockCount": 0
      }
    }
  ]
}
```

## Step 8. Get Products

### Request

Method:

```text
GET
```

URL:

```text
http://localhost:5000/api/products
```

### Example Response

```json
{
  "success": true,
  "message": "Products fetched",
  "data": [
    {
      "id": "cmproduct001",
      "vendorId": "cmvendor001",
      "categoryId": "cmcategory001",
      "name": "Centella Repair Serum",
      "slug": "centella-repair-serum",
      "brand": "Skin Relief",
      "description": "Hydrating recovery serum for barrier support.",
      "imageUrls": [],
      "tags": [
        "featured",
        "reward-eligible",
        "trending"
      ],
      "price": 1299,
      "discountPrice": 999,
      "stock": 44,
      "status": "ACTIVE",
      "featured": true,
      "discounted": true,
      "rewardEligible": true,
      "limitedOffer": false
    }
  ]
}
```

Copy:

- `data[0].id` -> product id

## Step 9. Filter Products

### Featured

```text
GET http://localhost:5000/api/products?featured=true
```

### Limited offer

```text
GET http://localhost:5000/api/products?limitedOffer=true
```

### Category

```text
GET http://localhost:5000/api/products?category=serums
```

### Brand

```text
GET http://localhost:5000/api/products?brand=Skin Relief
```

### Search

```text
GET http://localhost:5000/api/products?search=serum
```

## Step 10. Get Product By ID

### Request

Method:

```text
GET
```

URL:

```text
http://localhost:5000/api/products/YOUR_PRODUCT_ID
```

## Step 11. Create Product

### Request

Method:

```text
POST
```

URL:

```text
http://localhost:5000/api/products
```

Body:

```json
{
  "vendorId": "YOUR_VENDOR_ID",
  "categoryName": "Serums",
  "name": "Hydra Skin Serum",
  "brand": "GlowLab",
  "description": "Barrier support serum",
  "imageUrls": [
    "https://example.com/serum-1.jpg"
  ],
  "tags": [
    "featured",
    "hydration"
  ],
  "price": 1299,
  "discountPrice": 999,
  "stock": 20,
  "featured": true,
  "rewardEligible": true,
  "limitedOffer": false,
  "status": "active"
}
```

### Example Response

```json
{
  "success": true,
  "message": "Product created",
  "data": {
    "id": "cmproduct002",
    "vendorId": "YOUR_VENDOR_ID",
    "name": "Hydra Skin Serum",
    "slug": "hydra-skin-serum",
    "brand": "GlowLab",
    "price": 1299,
    "discountPrice": 999,
    "stock": 20,
    "featured": true,
    "rewardEligible": true,
    "limitedOffer": false
  }
}
```

## Step 12. Get Orders

### Request

Method:

```text
GET
```

URL:

```text
http://localhost:5000/api/orders
```

### Filter By Status

```text
http://localhost:5000/api/orders?status=placed
```

## Step 13. Create Order

Keep these values ready:

- customer id
- vendor id
- address id
- product id

### Request

Method:

```text
POST
```

URL:

```text
http://localhost:5000/api/orders
```

Body:

```json
{
  "customerId": "YOUR_CUSTOMER_ID",
  "vendorId": "YOUR_VENDOR_ID",
  "addressId": "YOUR_ADDRESS_ID",
  "discountAmount": 50,
  "rewardPointsUsed": 10,
  "items": [
    {
      "productId": "YOUR_PRODUCT_ID",
      "quantity": 1
    }
  ]
}
```

### Example Response

```json
{
  "success": true,
  "message": "Order created",
  "data": {
    "id": "cmorder001",
    "orderNumber": "OMW-1742290000000",
    "customerId": "YOUR_CUSTOMER_ID",
    "vendorId": "YOUR_VENDOR_ID",
    "status": "placed",
    "subtotal": 999,
    "discountAmount": 50,
    "totalAmount": 939,
    "rewardPointsUsed": 10,
    "rewardPointsEarned": 9,
    "items": [
      {
        "productId": "YOUR_PRODUCT_ID",
        "name": "Centella Repair Serum",
        "quantity": 1,
        "unitPrice": 999,
        "lineTotal": 999
      }
    ],
    "trackingEvents": [
      {
        "status": "placed"
      }
    ]
  }
}
```

Copy:

- `data.id` -> order id

## Step 14. Update Order Status

### Request

Method:

```text
PATCH
```

URL:

```text
http://localhost:5000/api/orders/YOUR_ORDER_ID/status
```

Body:

```json
{
  "status": "shipped",
  "note": "Packed and dispatched"
}
```

### Example Response

```json
{
  "success": true,
  "message": "Order status updated",
  "data": {
    "id": "cmorder001",
    "status": "shipped",
    "trackingEvents": [
      {
        "status": "placed"
      },
      {
        "status": "shipped",
        "note": "Packed and dispatched"
      }
    ]
  }
}
```

## Step 15. Get Offline Purchases

### Request

Method:

```text
GET
```

URL:

```text
http://localhost:5000/api/offline-purchases
```

## Step 16. Record Offline Purchase

### Request

Method:

```text
POST
```

URL:

```text
http://localhost:5000/api/offline-purchases
```

Body:

```json
{
  "vendorId": "YOUR_VENDOR_ID",
  "mobile": "9876543210",
  "amount": 1499,
  "purchaseDate": "2026-03-18T10:30:00.000Z",
  "items": [
    {
      "name": "Hydra Skin Serum",
      "quantity": 1,
      "price": 1499
    }
  ]
}
```

### Example Response

```json
{
  "success": true,
  "message": "Offline purchase recorded",
  "data": {
    "id": "cmoffline001",
    "vendorId": "YOUR_VENDOR_ID",
    "mobile": "9876543210",
    "amount": 1499,
    "linkedCustomerId": "YOUR_CUSTOMER_ID",
    "items": [
      {
        "name": "Hydra Skin Serum",
        "quantity": 1,
        "unitPrice": 1499
      }
    ]
  }
}
```

## Step 17. Get Rewards Summary

### Request 1

```text
GET http://localhost:5000/api/rewards/summary
```

### Request 2

```text
GET http://localhost:5000/api/rewards/summary?mobile=9876543210
```

### Request 3

```text
GET http://localhost:5000/api/rewards/summary?customerId=YOUR_CUSTOMER_ID
```

### Example Response

```json
{
  "success": true,
  "message": "Reward summary fetched",
  "data": {
    "customer": {
      "id": "YOUR_CUSTOMER_ID",
      "name": "Aarav Sharma",
      "mobile": "9876543210",
      "rewardPoints": 320
    },
    "ledger": [
      {
        "id": "seed-reward-earned-001",
        "customerId": "YOUR_CUSTOMER_ID",
        "type": "earned",
        "source": "online-purchase",
        "points": 20
      }
    ]
  }
}
```

## Step 18. Redeem Reward Points

### Request

Method:

```text
POST
```

URL:

```text
http://localhost:5000/api/rewards/redeem
```

Body:

```json
{
  "customerId": "YOUR_CUSTOMER_ID",
  "points": 20
}
```

### Example Response

```json
{
  "success": true,
  "message": "Reward points redeemed",
  "data": {
    "id": "cmreward002",
    "customerId": "YOUR_CUSTOMER_ID",
    "type": "redeemed",
    "source": "checkout",
    "points": 20,
    "createdAt": "2026-03-18T12:00:00.000Z"
  }
}
```

## Step 19. Homepage API

### Request

Method:

```text
GET
```

URL:

```text
http://localhost:5000/api/homepage
```

### Example Response

```json
{
  "success": true,
  "message": "Homepage content fetched",
  "data": {
    "banners": [],
    "featuredProducts": [],
    "discountProducts": [],
    "rewardProducts": [],
    "trendingProducts": [],
    "newArrivals": [],
    "limitedOffers": [],
    "campaigns": []
  }
}
```

## Step 20. Notifications API

### Request 1

```text
GET http://localhost:5000/api/notifications
```

### Request 2

```text
GET http://localhost:5000/api/notifications?audience=customer
```

### Example Response

```json
{
  "success": true,
  "message": "Notifications fetched",
  "data": [
    {
      "id": "seed-notification-001",
      "audience": "customer",
      "channel": "sms",
      "title": "Order shipped",
      "message": "Your seeded order has been shipped."
    }
  ]
}
```

## Step 21. Admin Dashboard

### Request

```text
GET http://localhost:5000/api/admin/dashboard
```

### Example Response

```json
{
  "success": true,
  "message": "Admin dashboard fetched",
  "data": {
    "totalUsers": 1,
    "totalVendors": 1,
    "totalProducts": 1,
    "totalOrders": 1,
    "pendingVendorApprovals": 0,
    "activeCampaigns": 1
  }
}
```

## Step 22. Analytics Overview

### Request

```text
GET http://localhost:5000/api/analytics/overview
```

### Example Response

```json
{
  "success": true,
  "message": "Analytics overview fetched",
  "data": {
    "totalRevenue": 999,
    "totalOrders": 1,
    "totalUsers": 1,
    "totalVendors": 1,
    "totalProducts": 1,
    "topSellingCategories": [
      {
        "category": "Serums",
        "orders": 1
      }
    ],
    "orderStatusBreakdown": [
      {
        "status": "shipped",
        "count": 1
      }
    ]
  }
}
```

## Important Note About Password

Current backend auth does not use password yet.

Current login route:

```text
POST http://localhost:5000/api/auth/login
```

Current login body:

```json
{
  "mobile": "9876543210"
}
```

There is no password field in register or login right now.

If you want password-based login like this:

```json
{
  "mobile": "9876543210",
  "password": "123456"
}
```

I can implement it next with:

- password field in database
- bcrypt password hashing
- real JWT token
- protected routes
