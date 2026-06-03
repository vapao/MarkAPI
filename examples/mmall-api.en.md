# MMall API Documentation

## Changelog

- 2026-06-03: Added [Update product sale status](#4-update-product-sale-status) for marketplace operators
- 2026-06-02: Added [Create after-sales request](#1-create-after-sales-request) for refunds and returns
- 2026-05-28: Updated [Preview order](#1-preview-order) to return discount and estimated shipping amounts
- 2026-05-21: Added brand, price range, and sorting filters to [Search products](#1-search-products)
- 2026-05-10: Added [Sign in with SMS code](#1-sign-in-with-sms-code) for mobile users

## General Information

| Item | Value |
|---|---|
| Base URL | https://api.demo.mmall.example |
| Content-Type | application/json |
| Authentication | Bearer Token |
| Time format | YYYY-MM-DD HH:mm:ss |
| Money unit | cents |
| Default pagination | page=1, page_size=20 |

## Common Data Definitions

### Currency currency

| Value | Description |
|---|---|
| CNY | Chinese yuan |
| USD | US dollar |
| EUR | Euro |
| JPY | Japanese yen |

### Product status product.status

| Value | Description |
|---|---|
| DRAFT | Draft |
| ON_SALE | On sale |
| OFF_SALE | Off sale |
| SOLD_OUT | Sold out |

### Order status order.status

| Value | Description |
|---|---|
| PENDING_PAYMENT | Pending payment |
| PAID | Paid |
| PACKING | Packing |
| SHIPPED | Shipped |
| COMPLETED | Completed |
| CANCELLED | Cancelled |
| CLOSED | Closed |

### Payment type pay_type

| Value | Description |
|---|---|
| WECHAT | WeChat Pay |
| ALIPAY | Alipay |
| BALANCE | Account balance |
| BANK_TRANSFER | Bank transfer |

### Payment status pay_status

| Value | Description |
|---|---|
| UNPAID | Unpaid |
| PROCESSING | Processing |
| PAID | Paid |
| REFUNDING | Refunding |
| REFUNDED | Refunded |
| FAILED | Failed |

### Delivery type delivery_type

| Value | Description |
|---|---|
| EXPRESS | Standard express |
| SAME_DAY | Same-day delivery |
| STORE_PICKUP | Store pickup |
| CROSS_BORDER | Cross-border shipping |

### After-sales type after_sale.type

| Value | Description |
|---|---|
| REFUND_ONLY | Refund only |
| RETURN_AND_REFUND | Return and refund |
| EXCHANGE | Exchange |

### After-sales status after_sale.status

| Value | Description |
|---|---|
| SUBMITTED | Submitted |
| REVIEWING | Under review |
| APPROVED | Approved |
| REJECTED | Rejected |
| WAITING_RETURN | Waiting for return |
| REFUNDING | Refunding |
| COMPLETED | Completed |
| CANCELLED | Cancelled |

### Coupon status coupon.status

| Value | Description |
|---|---|
| AVAILABLE | Available |
| USED | Used |
| EXPIRED | Expired |
| LOCKED | Locked |

### Inventory change type inventory.change_type

| Value | Description |
|---|---|
| PURCHASE_IN | Purchase inbound |
| ORDER_LOCK | Order stock lock |
| ORDER_RELEASE | Cancelled order release |
| SHIP_OUT | Shipment deduction |
| MANUAL_ADJUST | Manual adjustment |

### Notification event notification.event_type

| Value | Title | Message template |
|---|---|---|
| ORDER_PAID | Order paid | Your order {order_no} has been paid successfully. |
| ORDER_SHIPPED | Order shipped | Your order {order_no} has been shipped. You can view tracking details on the order page. |
| COUPON_RECEIVED | Coupon received | You received a {coupon_name}. |
| AFTER_SALE_UPDATED | After-sales update | The status of after-sales request {after_sale_no} has changed. |
| ARRIVAL_NOTICE | Back-in-stock notice | The product {product_name} you followed is back in stock. |

## Users and Sessions

### 1. Sign in with SMS code

POST /api/auth/sms-login/

Signs in a user with a phone number and SMS verification code. Returns access and refresh tokens after successful verification.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| phone | string | Yes | Phone number |
| sms_code | string | Yes | 6-digit SMS verification code |
| scene | string | No | Sign-in scene. Default is MINI_APP |

#### Field Values

| Field | Value | Description |
|---|---|---|
| scene | MINI_APP | Mini app sign-in |
| scene | WEB | Web sign-in |

#### Response Example

```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo",
    "refresh_token": "refresh_20260603103000_8c7a",
    "expires_in": 7200,
    "user": {
      "id": 90001,
      "phone": "13800138000",
      "nickname": "Mia Chen",
      "avatar": "https://cdn.demo.mmall.example/avatar/u90001.png",
      "member_level": "GOLD"
    }
  },
  "error": ""
}
```

### 2. Refresh access token

POST /api/auth/refresh/

Exchanges a refresh token for a new access token.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| refresh_token | string | Yes | Refresh token |

#### Response Example

```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new",
    "expires_in": 7200
  },
  "error": ""
}
```

### 3. Get current user

GET /api/user/profile/

Returns the profile and membership information of the signed-in user.

#### Response Example

```json
{
  "data": {
    "id": 90001,
    "phone": "13800138000",
    "nickname": "Mia Chen",
    "avatar": "https://cdn.demo.mmall.example/avatar/u90001.png",
    "member_level": "GOLD",
    "points": 1280,
    "has_unread_notification": true
  },
  "error": ""
}
```

### 4. Update current user

PATCH /api/user/profile/

Updates the user's nickname, avatar, and birthday.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| nickname | string | No | Nickname, up to 32 characters |
| avatar | string | No | Avatar URL |
| birthday | string | No | Birthday in YYYY-MM-DD format |

#### Response Example

```json
{
  "data": {
    "id": 90001,
    "nickname": "Mia C.",
    "avatar": "https://cdn.demo.mmall.example/avatar/u90001-new.png",
    "birthday": "1996-08-18"
  },
  "error": ""
}
```

### 5. List shipping addresses

GET /api/user/addresses/

Returns the current user's shipping addresses.

#### Response Example

```json
{
  "data": [
    {
      "id": 3101,
      "receiver_name": "Mia Chen",
      "receiver_phone": "13800138000",
      "province": "Zhejiang",
      "city": "Hangzhou",
      "district": "Xihu",
      "detail": "Building 3, 188 Wensan Road, Room 602",
      "tag": "HOME",
      "is_default": true
    }
  ],
  "error": ""
}
```

### 6. Create shipping address

POST /api/user/addresses/

Creates a new shipping address for the current user.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| receiver_name | string | Yes | Receiver name |
| receiver_phone | string | Yes | Receiver phone number |
| province | string | Yes | Province or state |
| city | string | Yes | City |
| district | string | Yes | District |
| detail | string | Yes | Detailed address |
| tag | string | No | Address tag |
| is_default | boolean | No | Whether to set this address as default |

#### Field Values

| Field | Value | Description |
|---|---|---|
| tag | HOME | Home |
| tag | COMPANY | Company |
| tag | SCHOOL | School |

#### Response Example

```json
{
  "data": {
    "id": 3102,
    "is_default": false
  },
  "error": ""
}
```

### 7. Update shipping address

PATCH /api/user/addresses/{address_id}/

Updates a shipping address.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| address_id | number | Yes | Address ID |
| receiver_name | string | No | Receiver name |
| receiver_phone | string | No | Receiver phone number |
| detail | string | No | Detailed address |
| is_default | boolean | No | Whether to set this address as default |

#### Response Example

```json
{
  "data": {
    "id": 3102,
    "updated_at": "2026-06-03 10:32:00"
  },
  "error": ""
}
```

### 8. Delete shipping address

DELETE /api/user/addresses/{address_id}/

Deletes one of the current user's shipping addresses.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| address_id | number | Yes | Address ID |

#### Response Example

```json
{
  "data": {},
  "error": ""
}
```

## Product Catalog

### 1. Search products

GET /api/products/

Searches products by keyword, category, brand, price range, and status.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| keyword | string | No | Search keyword |
| category_id | number | No | Category ID |
| brand_id | number | No | Brand ID |
| min_price | number | No | Minimum price in cents |
| max_price | number | No | Maximum price in cents |
| sort | string | No | Sort order |
| page | number | No | Page number |
| page_size | number | No | Items per page |

#### Field Values

| Field | Value | Description |
|---|---|---|
| sort | RECOMMEND | Recommended order |
| sort | PRICE_ASC | Price low to high |
| sort | PRICE_DESC | Price high to low |
| sort | SALES_DESC | Sales high to low |

#### Response Example

```json
{
  "data": {
    "total": 128,
    "items": [
      {
        "id": 501,
        "name": "Aurora Wireless Noise-Cancelling Earbuds",
        "brand_name": "Aurora",
        "cover": "https://cdn.demo.mmall.example/products/501-cover.jpg",
        "price": 59900,
        "market_price": 79900,
        "currency": "CNY",
        "sales_count": 8321,
        "status": "ON_SALE"
      }
    ]
  },
  "error": ""
}
```

### 2. Get product details

GET /api/products/{product_id}/

Returns product details, SKUs, service promises, and images.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| product_id | number | Yes | Product ID |

#### Response Example

```json
{
  "data": {
    "id": 501,
    "name": "Aurora Wireless Noise-Cancelling Earbuds",
    "subtitle": "Adaptive active noise cancellation, 8-hour battery life",
    "brand_name": "Aurora",
    "price": 59900,
    "currency": "CNY",
    "status": "ON_SALE",
    "images": [
      "https://cdn.demo.mmall.example/products/501-1.jpg",
      "https://cdn.demo.mmall.example/products/501-2.jpg"
    ],
    "skus": [
      {
        "id": 801,
        "sku_code": "AU-EAR-SPACE-BLK",
        "spec_text": "Space Black",
        "price": 59900,
        "stock": 56
      }
    ],
    "services": ["7-day returns", "National warranty", "Free shipping over 99 CNY"]
  },
  "error": ""
}
```

### 3. List product categories

GET /api/categories/

Returns the storefront product category tree.

#### Response Example

```json
{
  "data": [
    {
      "id": 10,
      "name": "Electronics",
      "children": [
        {
          "id": 101,
          "name": "Headphones and Audio"
        },
        {
          "id": 102,
          "name": "Smart Wearables"
        }
      ]
    }
  ],
  "error": ""
}
```

### 4. Get home recommendations

GET /api/home/recommendations/

Returns home page banners, quick entries, and recommended products.

#### Response Example

```json
{
  "data": {
    "banners": [
      {
        "image": "https://cdn.demo.mmall.example/banners/summer-sale.jpg",
        "target_type": "CAMPAIGN",
        "target_id": 88
      }
    ],
    "quick_entries": [
      {
        "title": "New Arrivals",
        "icon": "https://cdn.demo.mmall.example/icons/new.png",
        "target_url": "/campaigns/new-arrivals"
      }
    ],
    "products": [
      {
        "id": 501,
        "name": "Aurora Wireless Noise-Cancelling Earbuds",
        "price": 59900,
        "cover": "https://cdn.demo.mmall.example/products/501-cover.jpg"
      }
    ]
  },
  "error": ""
}
```

### 5. Get product stock

GET /api/products/{product_id}/stock/

Returns sellable stock for each SKU of a product.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| product_id | number | Yes | Product ID |

#### Response Example

```json
{
  "data": [
    {
      "sku_id": 801,
      "sku_code": "AU-EAR-SPACE-BLK",
      "available_stock": 56,
      "locked_stock": 12
    },
    {
      "sku_id": 802,
      "sku_code": "AU-EAR-MOON-WHT",
      "available_stock": 34,
      "locked_stock": 5
    }
  ],
  "error": ""
}
```

### 6. Subscribe to back-in-stock notice

POST /api/products/{product_id}/arrival-subscriptions/

Subscribes the user to a back-in-stock notice for a SKU.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| product_id | number | Yes | Product ID |
| sku_id | number | Yes | SKU ID |

#### Response Example

```json
{
  "data": {
    "subscription_id": 7012,
    "product_id": 501,
    "sku_id": 802,
    "created_at": "2026-06-03 10:32:00"
  },
  "error": ""
}
```

## Shopping Cart

### 1. Get cart

GET /api/cart/

Returns the current user's cart items, selected state, and invalid items.

#### Response Example

```json
{
  "data": {
    "items": [
      {
        "id": 12001,
        "product_id": 501,
        "sku_id": 801,
        "product_name": "Aurora Wireless Noise-Cancelling Earbuds",
        "spec_text": "Space Black",
        "price": 59900,
        "quantity": 1,
        "selected": true,
        "valid": true
      }
    ],
    "selected_count": 1,
    "selected_amount": 59900
  },
  "error": ""
}
```

### 2. Add cart item

POST /api/cart/items/

Adds a SKU to the shopping cart.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| product_id | number | Yes | Product ID |
| sku_id | number | Yes | SKU ID |
| quantity | number | Yes | Quantity |

#### Response Example

```json
{
  "data": {
    "item_id": 12001,
    "quantity": 2
  },
  "error": ""
}
```

### 3. Update cart item

PATCH /api/cart/items/{item_id}/

Updates the quantity or selected state of a cart item.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| item_id | number | Yes | Cart item ID |
| quantity | number | No | Quantity |
| selected | boolean | No | Whether the item is selected |

#### Response Example

```json
{
  "data": {
    "item_id": 12001,
    "quantity": 1,
    "selected": true
  },
  "error": ""
}
```

### 4. Delete cart item

DELETE /api/cart/items/{item_id}/

Deletes a cart item.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| item_id | number | Yes | Cart item ID |

#### Response Example

```json
{
  "data": {},
  "error": ""
}
```

### 5. Select cart items

POST /api/cart/selection/

Updates selected state for multiple cart items.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| item_ids | array | Yes | Cart item ID list |
| selected | boolean | Yes | Whether the items are selected |

#### Response Example

```json
{
  "data": {
    "selected_count": 2,
    "selected_amount": 129800
  },
  "error": ""
}
```

## Orders

### 1. Preview order

POST /api/orders/preview/

Calculates product amount, discount amount, shipping fee, and payable amount before creating an order.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| cart_item_ids | array | No | Required when checking out from cart |
| sku_items | array | No | Required for buy-now checkout |
| address_id | number | Yes | Shipping address ID |
| coupon_id | number | No | Coupon ID |
| delivery_type | string | No | Delivery type. Default is EXPRESS |

#### Response Example

```json
{
  "data": {
    "items": [
      {
        "sku_id": 801,
        "product_name": "Aurora Wireless Noise-Cancelling Earbuds",
        "quantity": 1,
        "price": 59900,
        "subtotal": 59900
      }
    ],
    "product_amount": 59900,
    "discount_amount": 5000,
    "freight_amount": 0,
    "pay_amount": 54900,
    "currency": "CNY"
  },
  "error": ""
}
```

### 2. Create order

POST /api/orders/

Creates an order and locks inventory.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| cart_item_ids | array | No | Required when checking out from cart |
| sku_items | array | No | Required for buy-now checkout |
| address_id | number | Yes | Shipping address ID |
| coupon_id | number | No | Coupon ID |
| delivery_type | string | Yes | Delivery type |
| buyer_message | string | No | Buyer message |

#### Response Example

```json
{
  "data": {
    "order_id": 880001,
    "order_no": "MM202606031030008801",
    "status": "PENDING_PAYMENT",
    "pay_amount": 54900,
    "expire_at": "2026-06-03 11:00:00"
  },
  "error": ""
}
```

### 3. List orders

GET /api/orders/

Returns a paginated list of the current user's orders.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| status | string | No | Order status |
| page | number | No | Page number |
| page_size | number | No | Items per page |

#### Response Example

```json
{
  "data": {
    "total": 12,
    "items": [
      {
        "id": 880001,
        "order_no": "MM202606031030008801",
        "status": "PENDING_PAYMENT",
        "pay_amount": 54900,
        "created_at": "2026-06-03 10:30:00",
        "cover": "https://cdn.demo.mmall.example/products/501-cover.jpg",
        "summary": "Aurora Wireless Noise-Cancelling Earbuds and 1 more item"
      }
    ]
  },
  "error": ""
}
```

### 4. Get order details

GET /api/orders/{order_id}/

Returns order details, shipping address, payment information, and logistics information.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| order_id | number | Yes | Order ID |

#### Response Example

```json
{
  "data": {
    "id": 880001,
    "order_no": "MM202606031030008801",
    "status": "PAID",
    "pay_status": "PAID",
    "pay_amount": 54900,
    "receiver": {
      "name": "Mia Chen",
      "phone": "13800138000",
      "address": "Building 3, 188 Wensan Road, Xihu, Hangzhou"
    },
    "items": [
      {
        "sku_id": 801,
        "product_name": "Aurora Wireless Noise-Cancelling Earbuds",
        "spec_text": "Space Black",
        "quantity": 1,
        "price": 59900
      }
    ]
  },
  "error": ""
}
```

### 5. Cancel order

POST /api/orders/{order_id}/cancel/

Cancels an order that has not been shipped.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| order_id | number | Yes | Order ID |
| reason | string | Yes | Cancellation reason |

#### Response Example

```json
{
  "data": {
    "order_id": 880001,
    "status": "CANCELLED",
    "cancelled_at": "2026-06-03 10:45:00"
  },
  "error": ""
}
```

### 6. Confirm receipt

POST /api/orders/{order_id}/confirm/

Confirms that the user has received the order and completes it.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| order_id | number | Yes | Order ID |

#### Response Example

```json
{
  "data": {
    "order_id": 880001,
    "status": "COMPLETED",
    "completed_at": "2026-06-06 18:20:00"
  },
  "error": ""
}
```

## Payments and Invoices

### 1. Create payment

POST /api/payments/

Creates a payment for an order and returns payment parameters.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| order_id | number | Yes | Order ID |
| pay_type | string | Yes | Payment type |

#### Response Example

```json
{
  "data": {
    "payment_id": 660001,
    "payment_no": "PAY202606031032006601",
    "pay_type": "WECHAT",
    "pay_amount": 54900,
    "pay_params": {
      "timeStamp": "1780463520",
      "nonceStr": "n0nce20260603",
      "package": "prepay_id=wx201410272009395522657a690389285100",
      "signType": "RSA",
      "paySign": "mock-signature"
    }
  },
  "error": ""
}
```

### 2. Get payment result

GET /api/payments/{payment_id}/

Returns the current payment status.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| payment_id | number | Yes | Payment ID |

#### Response Example

```json
{
  "data": {
    "payment_id": 660001,
    "payment_no": "PAY202606031032006601",
    "pay_status": "PAID",
    "paid_at": "2026-06-03 10:33:12"
  },
  "error": ""
}
```

### 3. Request invoice

POST /api/orders/{order_id}/invoice/

Requests an electronic invoice for a paid order.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| order_id | number | Yes | Order ID |
| title | string | Yes | Invoice title |
| tax_no | string | No | Tax number |
| email | string | Yes | Recipient email address |

#### Response Example

```json
{
  "data": {
    "invoice_id": 55001,
    "status": "SUBMITTED",
    "email": "finance@example.com"
  },
  "error": ""
}
```

### 4. Get invoice details

GET /api/invoices/{invoice_id}/

Returns invoice request details and issuing result.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| invoice_id | number | Yes | Invoice ID |

#### Response Example

```json
{
  "data": {
    "invoice_id": 55001,
    "title": "Hangzhou Mancang Technology Co., Ltd.",
    "amount": 54900,
    "status": "ISSUED",
    "download_url": "https://cdn.demo.mmall.example/invoices/55001.pdf"
  },
  "error": ""
}
```

## Coupons and Promotions

### 1. List available coupons

GET /api/coupons/

Returns the current user's available, used, and expired coupons.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| status | string | No | Coupon status |
| page | number | No | Page number |
| page_size | number | No | Items per page |

#### Response Example

```json
{
  "data": {
    "total": 3,
    "items": [
      {
        "id": 41001,
        "name": "New user 10 off 99",
        "status": "AVAILABLE",
        "threshold_amount": 9900,
        "discount_amount": 1000,
        "valid_to": "2026-06-30 23:59:59"
      }
    ]
  },
  "error": ""
}
```

### 2. Claim coupon

POST /api/coupons/{coupon_id}/claim/

Claims a coupon for the current user.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| coupon_id | number | Yes | Coupon ID |

#### Response Example

```json
{
  "data": {
    "user_coupon_id": 41001,
    "status": "AVAILABLE"
  },
  "error": ""
}
```

### 3. Quote promotion

POST /api/promotions/quote/

Calculates available discounts based on SKUs, shipping address, and coupon.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| sku_items | array | Yes | SKU and quantity list |
| address_id | number | No | Address ID |
| coupon_id | number | No | Coupon ID |

#### Response Example

```json
{
  "data": {
    "available_coupons": [
      {
        "coupon_id": 41001,
        "name": "New user 10 off 99",
        "discount_amount": 1000
      }
    ],
    "best_coupon_id": 41001,
    "discount_amount": 1000,
    "freight_amount": 0
  },
  "error": ""
}
```

## After-Sales

### 1. Create after-sales request

POST /api/after-sales/

Creates a refund, return-and-refund, or exchange request for an order item.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| order_id | number | Yes | Order ID |
| order_item_id | number | Yes | Order item ID |
| type | string | Yes | After-sales type |
| reason | string | Yes | Reason |
| quantity | number | Yes | Requested quantity |
| images | array | No | Proof image URL list |

#### Response Example

```json
{
  "data": {
    "after_sale_id": 730001,
    "after_sale_no": "AS202606031055007301",
    "status": "SUBMITTED",
    "created_at": "2026-06-03 10:55:00"
  },
  "error": ""
}
```

### 2. List after-sales requests

GET /api/after-sales/

Returns a paginated list of the current user's after-sales requests.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| status | string | No | After-sales status |
| page | number | No | Page number |
| page_size | number | No | Items per page |

#### Response Example

```json
{
  "data": {
    "total": 2,
    "items": [
      {
        "id": 730001,
        "after_sale_no": "AS202606031055007301",
        "type": "RETURN_AND_REFUND",
        "status": "REVIEWING",
        "refund_amount": 54900,
        "created_at": "2026-06-03 10:55:00"
      }
    ]
  },
  "error": ""
}
```

### 3. Get after-sales details

GET /api/after-sales/{after_sale_id}/

Returns after-sales request details, review result, and processing timeline.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| after_sale_id | number | Yes | After-sales request ID |

#### Response Example

```json
{
  "data": {
    "id": 730001,
    "after_sale_no": "AS202606031055007301",
    "status": "REVIEWING",
    "type": "RETURN_AND_REFUND",
    "reason": "The left earbud cannot be charged",
    "refund_amount": 54900,
    "logs": [
      {
        "status": "SUBMITTED",
        "content": "User submitted after-sales request",
        "created_at": "2026-06-03 10:55:00"
      }
    ]
  },
  "error": ""
}
```

### 4. Upload after-sales attachments

POST /api/after-sales/{after_sale_id}/attachments/

Adds proof images to an after-sales request.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| after_sale_id | number | Yes | After-sales request ID |
| images | array | Yes | Proof image URL list |

#### Response Example

```json
{
  "data": {
    "after_sale_id": 730001,
    "attachment_count": 3
  },
  "error": ""
}
```

### 5. Cancel after-sales request

POST /api/after-sales/{after_sale_id}/cancel/

Cancels an after-sales request that has not been completed.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| after_sale_id | number | Yes | After-sales request ID |

#### Response Example

```json
{
  "data": {
    "after_sale_id": 730001,
    "status": "CANCELLED"
  },
  "error": ""
}
```

## Notifications

### 1. List notifications

GET /api/notifications/

Returns system and transaction notifications for the current user.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| unread_only | boolean | No | Whether to return unread notifications only |
| page | number | No | Page number |
| page_size | number | No | Items per page |

#### Field Values

| Field | Value | Description |
|---|---|---|
| data.items[].status | UNREAD | Unread |
| data.items[].status | READ | Read |

#### Response Example

```json
{
  "data": {
    "total": 8,
    "items": [
      {
        "id": 99001,
        "event_type": "ORDER_SHIPPED",
        "status": "UNREAD",
        "title": "Order shipped",
        "content": "Your order MM202606031030008801 has been shipped. You can view tracking details on the order page.",
        "created_at": "2026-06-03 16:20:00"
      }
    ]
  },
  "error": ""
}
```

### 2. Mark notifications as read

POST /api/notifications/read/

Marks a batch of notifications as read.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| notification_ids | array | Yes | Notification ID list |

#### Response Example

```json
{
  "data": {
    "read_count": 3
  },
  "error": ""
}
```

## Admin Operations

### 1. Get operation overview

GET /api/admin/dashboard/

Returns order count, sales amount, after-sales count, and inventory risk overview for operators.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| date_from | string | Yes | Start date in YYYY-MM-DD format |
| date_to | string | Yes | End date in YYYY-MM-DD format |

#### Response Example

```json
{
  "data": {
    "paid_order_count": 328,
    "paid_amount": 18992000,
    "after_sale_count": 12,
    "low_stock_sku_count": 7,
    "top_products": [
      {
        "product_id": 501,
        "name": "Aurora Wireless Noise-Cancelling Earbuds",
        "sales_count": 86
      }
    ]
  },
  "error": ""
}
```

### 2. List inventory changes

GET /api/admin/inventory/changes/

Returns SKU inventory change records for operators.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| sku_id | number | No | SKU ID |
| change_type | string | No | Inventory change type |
| date_from | string | No | Start date |
| date_to | string | No | End date |
| page | number | No | Page number |
| page_size | number | No | Items per page |

#### Response Example

```json
{
  "data": {
    "total": 42,
    "items": [
      {
        "id": 180001,
        "sku_id": 801,
        "change_type": "ORDER_LOCK",
        "quantity": -1,
        "before_stock": 57,
        "after_stock": 56,
        "source_no": "MM202606031030008801",
        "created_at": "2026-06-03 10:30:05"
      }
    ]
  },
  "error": ""
}
```

### 3. Adjust inventory

POST /api/admin/inventory/adjustments/

Manually adjusts available stock for a SKU.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| sku_id | number | Yes | SKU ID |
| quantity | number | Yes | Adjustment quantity. Positive values increase stock and negative values decrease stock |
| reason | string | Yes | Adjustment reason |

#### Response Example

```json
{
  "data": {
    "change_id": 180002,
    "sku_id": 801,
    "available_stock": 66
  },
  "error": ""
}
```

### 4. Update product sale status

PATCH /api/admin/products/{product_id}/status/

Updates whether a product is visible and purchasable in the storefront.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| product_id | number | Yes | Product ID |
| status | string | Yes | Product status |

#### Response Example

```json
{
  "data": {
    "product_id": 501,
    "status": "ON_SALE",
    "updated_at": "2026-06-03 17:10:00"
  },
  "error": ""
}
```

### 5. List order operation notes

GET /api/admin/orders/{order_id}/notes/

Returns internal operation notes for an order.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| order_id | number | Yes | Order ID |

#### Response Example

```json
{
  "data": [
    {
      "id": 25001,
      "content": "Customer requested weekend delivery. Warehouse has been notified.",
      "operator_name": "Operator Zoe",
      "created_at": "2026-06-03 11:20:00"
    }
  ],
  "error": ""
}
```

### 6. Create order operation note

POST /api/admin/orders/{order_id}/notes/

Adds an internal operation note to an order.

#### Request Parameters

| Parameter | Type | Required | Description |
|---|---|---|---|
| order_id | number | Yes | Order ID |
| content | string | Yes | Note content |

#### Response Example

```json
{
  "data": {
    "id": 25002,
    "created_at": "2026-06-03 17:20:00"
  },
  "error": ""
}
```
