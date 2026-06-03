# MMall API 文档

## 变更记录

- 2026-06-03：新增[更新商品上下架](#4-更新商品上下架)，用于运营人员控制商品公开状态
- 2026-06-02：新增[创建售后申请](#1-创建售后申请)，支持用户发起退款和退货
- 2026-05-28：调整[预览订单](#1-预览订单)返回优惠金额和预计运费
- 2026-05-21：新增[搜索商品](#1-搜索商品)的品牌、价格区间和排序筛选
- 2026-05-10：新增[手机号验证码登录](#1-手机号验证码登录)，用于小程序用户快速登录

## 公共说明

| 项目 | 内容 |
|---|---|
| Base URL | https://api.demo.mmall.example |
| Content-Type | application/json |
| 认证方式 | Bearer Token |
| 时间格式 | YYYY-MM-DD HH:mm:ss |
| 金额单位 | 分 |
| 默认分页 | page=1，page_size=20 |

## 公共数据定义

### 币种 currency

| 枚举值 | 说明 |
|---|---|
| CNY | 人民币 |
| USD | 美元 |
| EUR | 欧元 |
| JPY | 日元 |

### 商品状态 product.status

| 枚举值 | 说明 |
|---|---|
| DRAFT | 草稿 |
| ON_SALE | 已上架 |
| OFF_SALE | 已下架 |
| SOLD_OUT | 已售罄 |

### 订单状态 order.status

| 枚举值 | 说明 |
|---|---|
| PENDING_PAYMENT | 待支付 |
| PAID | 已支付 |
| PACKING | 备货中 |
| SHIPPED | 已发货 |
| COMPLETED | 已完成 |
| CANCELLED | 已取消 |
| CLOSED | 已关闭 |

### 支付方式 pay_type

| 枚举值 | 说明 |
|---|---|
| WECHAT | 微信支付 |
| ALIPAY | 支付宝 |
| BALANCE | 余额支付 |
| BANK_TRANSFER | 对公转账 |

### 支付状态 pay_status

| 枚举值 | 说明 |
|---|---|
| UNPAID | 未支付 |
| PROCESSING | 支付处理中 |
| PAID | 已支付 |
| REFUNDING | 退款中 |
| REFUNDED | 已退款 |
| FAILED | 支付失败 |

### 配送方式 delivery_type

| 枚举值 | 说明 |
|---|---|
| EXPRESS | 快递配送 |
| SAME_DAY | 同城当日达 |
| STORE_PICKUP | 门店自提 |
| CROSS_BORDER | 跨境直邮 |

### 售后类型 after_sale.type

| 枚举值 | 说明 |
|---|---|
| REFUND_ONLY | 仅退款 |
| RETURN_AND_REFUND | 退货退款 |
| EXCHANGE | 换货 |

### 售后状态 after_sale.status

| 枚举值 | 说明 |
|---|---|
| SUBMITTED | 已提交 |
| REVIEWING | 审核中 |
| APPROVED | 已通过 |
| REJECTED | 已拒绝 |
| WAITING_RETURN | 待寄回 |
| REFUNDING | 退款中 |
| COMPLETED | 已完成 |
| CANCELLED | 已取消 |

### 优惠券状态 coupon.status

| 枚举值 | 说明 |
|---|---|
| AVAILABLE | 可使用 |
| USED | 已使用 |
| EXPIRED | 已过期 |
| LOCKED | 已锁定 |

### 库存变更类型 inventory.change_type

| 枚举值 | 说明 |
|---|---|
| PURCHASE_IN | 采购入库 |
| ORDER_LOCK | 下单锁定 |
| ORDER_RELEASE | 取消释放 |
| SHIP_OUT | 发货扣减 |
| MANUAL_ADJUST | 人工调整 |

### 通知事件 notification.event_type

| 枚举值 | 标题 | 内容模板 |
|---|---|---|
| ORDER_PAID | 订单支付成功 | 您的订单 {order_no} 已支付成功。 |
| ORDER_SHIPPED | 订单已发货 | 您的订单 {order_no} 已发货，可在订单详情查看物流。 |
| COUPON_RECEIVED | 优惠券到账 | 您获得了一张 {coupon_name}。 |
| AFTER_SALE_UPDATED | 售后进度更新 | 您的售后单 {after_sale_no} 状态已更新。 |
| ARRIVAL_NOTICE | 到货提醒 | 您关注的商品 {product_name} 已到货。 |

## 用户与会话

### 1. 手机号验证码登录

POST /api/auth/sms-login/

用于用户通过手机号和短信验证码登录，登录成功后返回访问令牌。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| phone | string | 是 | 手机号 |
| sms_code | string | 是 | 6 位短信验证码 |
| scene | string | 否 | 登录场景，默认 MINI_APP |

#### 字段取值

| 字段 | 枚举值 | 说明 |
|---|---|---|
| scene | MINI_APP | 小程序登录 |
| scene | WEB | Web 登录 |

#### 响应示例

```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo",
    "refresh_token": "refresh_20260603103000_8c7a",
    "expires_in": 7200,
    "user": {
      "id": 90001,
      "phone": "13800138000",
      "nickname": "陈小满",
      "avatar": "https://cdn.demo.mmall.example/avatar/u90001.png",
      "member_level": "GOLD"
    }
  },
  "error": ""
}
```

### 2. 刷新访问令牌

POST /api/auth/refresh/

用于通过刷新令牌换取新的访问令牌。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| refresh_token | string | 是 | 刷新令牌 |

#### 响应示例

```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new",
    "expires_in": 7200
  },
  "error": ""
}
```

### 3. 获取当前用户

GET /api/user/profile/

用于读取当前登录用户资料和会员信息。

#### 响应示例

```json
{
  "data": {
    "id": 90001,
    "phone": "13800138000",
    "nickname": "陈小满",
    "avatar": "https://cdn.demo.mmall.example/avatar/u90001.png",
    "member_level": "GOLD",
    "points": 1280,
    "has_unread_notification": true
  },
  "error": ""
}
```

### 4. 更新当前用户

PATCH /api/user/profile/

用于更新当前用户昵称、头像和生日信息。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| nickname | string | 否 | 昵称，最长 32 个字符 |
| avatar | string | 否 | 头像 URL |
| birthday | string | 否 | 生日，格式 YYYY-MM-DD |

#### 响应示例

```json
{
  "data": {
    "id": 90001,
    "nickname": "陈满满",
    "avatar": "https://cdn.demo.mmall.example/avatar/u90001-new.png",
    "birthday": "1996-08-18"
  },
  "error": ""
}
```

### 5. 获取收货地址列表

GET /api/user/addresses/

用于读取当前用户的收货地址列表。

#### 响应示例

```json
{
  "data": [
    {
      "id": 3101,
      "receiver_name": "陈小满",
      "receiver_phone": "13800138000",
      "province": "浙江省",
      "city": "杭州市",
      "district": "西湖区",
      "detail": "文三路 188 号 3 幢 602",
      "tag": "HOME",
      "is_default": true
    }
  ],
  "error": ""
}
```

### 6. 新增收货地址

POST /api/user/addresses/

用于新增当前用户的收货地址。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| receiver_name | string | 是 | 收货人姓名 |
| receiver_phone | string | 是 | 收货人手机号 |
| province | string | 是 | 省份 |
| city | string | 是 | 城市 |
| district | string | 是 | 区县 |
| detail | string | 是 | 详细地址 |
| tag | string | 否 | 地址标签 |
| is_default | boolean | 否 | 是否设为默认地址 |

#### 字段取值

| 字段 | 枚举值 | 说明 |
|---|---|---|
| tag | HOME | 家 |
| tag | COMPANY | 公司 |
| tag | SCHOOL | 学校 |

#### 响应示例

```json
{
  "data": {
    "id": 3102,
    "is_default": false
  },
  "error": ""
}
```

### 7. 修改收货地址

PATCH /api/user/addresses/{address_id}/

用于修改指定收货地址。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| address_id | number | 是 | 地址 ID |
| receiver_name | string | 否 | 收货人姓名 |
| receiver_phone | string | 否 | 收货人手机号 |
| detail | string | 否 | 详细地址 |
| is_default | boolean | 否 | 是否设为默认地址 |

#### 响应示例

```json
{
  "data": {
    "id": 3102,
    "updated_at": "2026-06-03 10:32:00"
  },
  "error": ""
}
```

### 8. 删除收货地址

DELETE /api/user/addresses/{address_id}/

用于删除当前用户的指定收货地址。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| address_id | number | 是 | 地址 ID |

#### 响应示例

```json
{
  "data": {},
  "error": ""
}
```

## 商品目录

### 1. 搜索商品

GET /api/products/

用于按关键词、分类、品牌、价格和状态搜索商品。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| keyword | string | 否 | 搜索关键词 |
| category_id | number | 否 | 分类 ID |
| brand_id | number | 否 | 品牌 ID |
| min_price | number | 否 | 最低价格，单位分 |
| max_price | number | 否 | 最高价格，单位分 |
| sort | string | 否 | 排序方式 |
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页数量 |

#### 字段取值

| 字段 | 枚举值 | 说明 |
|---|---|---|
| sort | RECOMMEND | 推荐排序 |
| sort | PRICE_ASC | 价格从低到高 |
| sort | PRICE_DESC | 价格从高到低 |
| sort | SALES_DESC | 销量从高到低 |

#### 响应示例

```json
{
  "data": {
    "total": 128,
    "items": [
      {
        "id": 501,
        "name": "Aurora 真无线降噪耳机",
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

### 2. 获取商品详情

GET /api/products/{product_id}/

用于读取商品详情、规格、服务承诺和图片信息。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| product_id | number | 是 | 商品 ID |

#### 响应示例

```json
{
  "data": {
    "id": 501,
    "name": "Aurora 真无线降噪耳机",
    "subtitle": "自适应主动降噪，单次续航 8 小时",
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
        "spec_text": "星空黑",
        "price": 59900,
        "stock": 56
      }
    ],
    "services": ["7 天无理由退货", "全国联保", "满 99 元包邮"]
  },
  "error": ""
}
```

### 3. 获取商品分类

GET /api/categories/

用于读取前台商品分类树。

#### 响应示例

```json
{
  "data": [
    {
      "id": 10,
      "name": "数码家电",
      "children": [
        {
          "id": 101,
          "name": "耳机音频"
        },
        {
          "id": 102,
          "name": "智能穿戴"
        }
      ]
    }
  ],
  "error": ""
}
```

### 4. 获取首页推荐

GET /api/home/recommendations/

用于读取首页轮播、活动入口和推荐商品。

#### 响应示例

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
        "title": "每日上新",
        "icon": "https://cdn.demo.mmall.example/icons/new.png",
        "target_url": "/campaigns/new-arrivals"
      }
    ],
    "products": [
      {
        "id": 501,
        "name": "Aurora 真无线降噪耳机",
        "price": 59900,
        "cover": "https://cdn.demo.mmall.example/products/501-cover.jpg"
      }
    ]
  },
  "error": ""
}
```

### 5. 查询商品库存

GET /api/products/{product_id}/stock/

用于读取商品各 SKU 的可售库存。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| product_id | number | 是 | 商品 ID |

#### 响应示例

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

### 6. 订阅到货提醒

POST /api/products/{product_id}/arrival-subscriptions/

用于用户订阅某个 SKU 的到货提醒。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| product_id | number | 是 | 商品 ID |
| sku_id | number | 是 | SKU ID |

#### 响应示例

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

## 购物车

### 1. 获取购物车

GET /api/cart/

用于读取当前用户购物车商品、勾选状态和失效商品。

#### 响应示例

```json
{
  "data": {
    "items": [
      {
        "id": 12001,
        "product_id": 501,
        "sku_id": 801,
        "product_name": "Aurora 真无线降噪耳机",
        "spec_text": "星空黑",
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

### 2. 添加购物车商品

POST /api/cart/items/

用于将指定 SKU 加入购物车。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| product_id | number | 是 | 商品 ID |
| sku_id | number | 是 | SKU ID |
| quantity | number | 是 | 数量 |

#### 响应示例

```json
{
  "data": {
    "item_id": 12001,
    "quantity": 2
  },
  "error": ""
}
```

### 3. 修改购物车商品

PATCH /api/cart/items/{item_id}/

用于修改购物车商品数量或勾选状态。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| item_id | number | 是 | 购物车项 ID |
| quantity | number | 否 | 数量 |
| selected | boolean | 否 | 是否勾选 |

#### 响应示例

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

### 4. 删除购物车商品

DELETE /api/cart/items/{item_id}/

用于删除购物车中的指定商品。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| item_id | number | 是 | 购物车项 ID |

#### 响应示例

```json
{
  "data": {},
  "error": ""
}
```

### 5. 勾选购物车商品

POST /api/cart/selection/

用于批量更新购物车商品勾选状态。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| item_ids | array | 是 | 购物车项 ID 列表 |
| selected | boolean | 是 | 是否勾选 |

#### 响应示例

```json
{
  "data": {
    "selected_count": 2,
    "selected_amount": 129800
  },
  "error": ""
}
```

## 订单模块

### 1. 预览订单

POST /api/orders/preview/

用于在创建订单前计算商品金额、优惠金额、运费和应付金额。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| cart_item_ids | array | 否 | 从购物车结算时传入 |
| sku_items | array | 否 | 立即购买时传入 |
| address_id | number | 是 | 收货地址 ID |
| coupon_id | number | 否 | 优惠券 ID |
| delivery_type | string | 否 | 配送方式，默认 EXPRESS |

#### 响应示例

```json
{
  "data": {
    "items": [
      {
        "sku_id": 801,
        "product_name": "Aurora 真无线降噪耳机",
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

### 2. 创建订单

POST /api/orders/

用于创建正式订单并锁定库存。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| cart_item_ids | array | 否 | 从购物车结算时传入 |
| sku_items | array | 否 | 立即购买时传入 |
| address_id | number | 是 | 收货地址 ID |
| coupon_id | number | 否 | 优惠券 ID |
| delivery_type | string | 是 | 配送方式 |
| buyer_message | string | 否 | 买家留言 |

#### 响应示例

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

### 3. 获取订单列表

GET /api/orders/

用于分页读取当前用户订单列表。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| status | string | 否 | 订单状态 |
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页数量 |

#### 响应示例

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
        "summary": "Aurora 真无线降噪耳机 等 1 件商品"
      }
    ]
  },
  "error": ""
}
```

### 4. 获取订单详情

GET /api/orders/{order_id}/

用于读取订单明细、收货地址、支付信息和物流信息。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| order_id | number | 是 | 订单 ID |

#### 响应示例

```json
{
  "data": {
    "id": 880001,
    "order_no": "MM202606031030008801",
    "status": "PAID",
    "pay_status": "PAID",
    "pay_amount": 54900,
    "receiver": {
      "name": "陈小满",
      "phone": "13800138000",
      "address": "浙江省杭州市西湖区文三路 188 号 3 幢 602"
    },
    "items": [
      {
        "sku_id": 801,
        "product_name": "Aurora 真无线降噪耳机",
        "spec_text": "星空黑",
        "quantity": 1,
        "price": 59900
      }
    ]
  },
  "error": ""
}
```

### 5. 取消订单

POST /api/orders/{order_id}/cancel/

用于用户取消未发货订单。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| order_id | number | 是 | 订单 ID |
| reason | string | 是 | 取消原因 |

#### 响应示例

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

### 6. 确认收货

POST /api/orders/{order_id}/confirm/

用于用户确认订单已收货并完成订单。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| order_id | number | 是 | 订单 ID |

#### 响应示例

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

## 支付与发票

### 1. 创建支付单

POST /api/payments/

用于为订单创建支付单并返回对应支付参数。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| order_id | number | 是 | 订单 ID |
| pay_type | string | 是 | 支付方式 |

#### 响应示例

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

### 2. 查询支付结果

GET /api/payments/{payment_id}/

用于查询支付单状态。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| payment_id | number | 是 | 支付单 ID |

#### 响应示例

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

### 3. 申请发票

POST /api/orders/{order_id}/invoice/

用于用户为已支付订单申请电子发票。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| order_id | number | 是 | 订单 ID |
| title | string | 是 | 发票抬头 |
| tax_no | string | 否 | 税号 |
| email | string | 是 | 接收邮箱 |

#### 响应示例

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

### 4. 获取发票详情

GET /api/invoices/{invoice_id}/

用于读取发票申请和开票结果。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| invoice_id | number | 是 | 发票 ID |

#### 响应示例

```json
{
  "data": {
    "invoice_id": 55001,
    "title": "杭州满仓科技有限公司",
    "amount": 54900,
    "status": "ISSUED",
    "download_url": "https://cdn.demo.mmall.example/invoices/55001.pdf"
  },
  "error": ""
}
```

## 优惠券与营销

### 1. 获取可用优惠券

GET /api/coupons/

用于读取当前用户可用、已使用和已过期优惠券。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| status | string | 否 | 优惠券状态 |
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页数量 |

#### 响应示例

```json
{
  "data": {
    "total": 3,
    "items": [
      {
        "id": 41001,
        "name": "新人满 99 减 10",
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

### 2. 领取优惠券

POST /api/coupons/{coupon_id}/claim/

用于用户领取指定优惠券。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| coupon_id | number | 是 | 优惠券 ID |

#### 响应示例

```json
{
  "data": {
    "user_coupon_id": 41001,
    "status": "AVAILABLE"
  },
  "error": ""
}
```

### 3. 计算优惠

POST /api/promotions/quote/

用于根据商品、地址和优惠券计算可用优惠。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| sku_items | array | 是 | 商品 SKU 和数量 |
| address_id | number | 否 | 地址 ID |
| coupon_id | number | 否 | 优惠券 ID |

#### 响应示例

```json
{
  "data": {
    "available_coupons": [
      {
        "coupon_id": 41001,
        "name": "新人满 99 减 10",
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

## 售后服务

### 1. 创建售后申请

POST /api/after-sales/

用于用户对订单商品发起退款、退货退款或换货申请。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| order_id | number | 是 | 订单 ID |
| order_item_id | number | 是 | 订单商品 ID |
| type | string | 是 | 售后类型 |
| reason | string | 是 | 售后原因 |
| quantity | number | 是 | 申请数量 |
| images | array | 否 | 凭证图片 URL 列表 |

#### 响应示例

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

### 2. 获取售后列表

GET /api/after-sales/

用于分页读取当前用户售后申请列表。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| status | string | 否 | 售后状态 |
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页数量 |

#### 响应示例

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

### 3. 获取售后详情

GET /api/after-sales/{after_sale_id}/

用于读取售后申请详情、审核结果和处理进度。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| after_sale_id | number | 是 | 售后单 ID |

#### 响应示例

```json
{
  "data": {
    "id": 730001,
    "after_sale_no": "AS202606031055007301",
    "status": "REVIEWING",
    "type": "RETURN_AND_REFUND",
    "reason": "耳机左耳无法充电",
    "refund_amount": 54900,
    "logs": [
      {
        "status": "SUBMITTED",
        "content": "用户提交售后申请",
        "created_at": "2026-06-03 10:55:00"
      }
    ]
  },
  "error": ""
}
```

### 4. 上传售后凭证

POST /api/after-sales/{after_sale_id}/attachments/

用于追加售后凭证图片。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| after_sale_id | number | 是 | 售后单 ID |
| images | array | 是 | 凭证图片 URL 列表 |

#### 响应示例

```json
{
  "data": {
    "after_sale_id": 730001,
    "attachment_count": 3
  },
  "error": ""
}
```

### 5. 取消售后申请

POST /api/after-sales/{after_sale_id}/cancel/

用于用户取消尚未完成的售后申请。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| after_sale_id | number | 是 | 售后单 ID |

#### 响应示例

```json
{
  "data": {
    "after_sale_id": 730001,
    "status": "CANCELLED"
  },
  "error": ""
}
```

## 消息通知

### 1. 获取通知列表

GET /api/notifications/

用于读取当前用户的系统通知和交易通知。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| unread_only | boolean | 否 | 是否只看未读 |
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页数量 |

#### 字段取值

| 字段 | 枚举值 | 说明 |
|---|---|---|
| data.items[].status | UNREAD | 未读 |
| data.items[].status | READ | 已读 |

#### 响应示例

```json
{
  "data": {
    "total": 8,
    "items": [
      {
        "id": 99001,
        "event_type": "ORDER_SHIPPED",
        "status": "UNREAD",
        "title": "订单已发货",
        "content": "您的订单 MM202606031030008801 已发货，可在订单详情查看物流。",
        "created_at": "2026-06-03 16:20:00"
      }
    ]
  },
  "error": ""
}
```

### 2. 标记通知已读

POST /api/notifications/read/

用于将一批通知标记为已读。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| notification_ids | array | 是 | 通知 ID 列表 |

#### 响应示例

```json
{
  "data": {
    "read_count": 3
  },
  "error": ""
}
```

## 后台运营

### 1. 获取运营概览

GET /api/admin/dashboard/

用于运营人员查看订单、销售额、售后和库存风险概览。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| date_from | string | 是 | 开始日期，格式 YYYY-MM-DD |
| date_to | string | 是 | 结束日期，格式 YYYY-MM-DD |

#### 响应示例

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
        "name": "Aurora 真无线降噪耳机",
        "sales_count": 86
      }
    ]
  },
  "error": ""
}
```

### 2. 查询库存流水

GET /api/admin/inventory/changes/

用于运营人员查询 SKU 库存变更记录。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| sku_id | number | 否 | SKU ID |
| change_type | string | 否 | 库存变更类型 |
| date_from | string | 否 | 开始日期 |
| date_to | string | 否 | 结束日期 |
| page | number | 否 | 页码 |
| page_size | number | 否 | 每页数量 |

#### 响应示例

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

### 3. 调整库存

POST /api/admin/inventory/adjustments/

用于运营人员对指定 SKU 做人工库存调整。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| sku_id | number | 是 | SKU ID |
| quantity | number | 是 | 调整数量，正数增加，负数减少 |
| reason | string | 是 | 调整原因 |

#### 响应示例

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

### 4. 更新商品上下架

PATCH /api/admin/products/{product_id}/status/

用于运营人员更新商品上下架状态。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| product_id | number | 是 | 商品 ID |
| status | string | 是 | 商品状态 |

#### 响应示例

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

### 5. 获取订单运营备注

GET /api/admin/orders/{order_id}/notes/

用于运营人员查看订单内部备注。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| order_id | number | 是 | 订单 ID |

#### 响应示例

```json
{
  "data": [
    {
      "id": 25001,
      "content": "用户要求周末配送，已同步仓库。",
      "operator_name": "运营小周",
      "created_at": "2026-06-03 11:20:00"
    }
  ],
  "error": ""
}
```

### 6. 新增订单运营备注

POST /api/admin/orders/{order_id}/notes/

用于运营人员给订单追加内部备注。

#### 请求参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| order_id | number | 是 | 订单 ID |
| content | string | 是 | 备注内容 |

#### 响应示例

```json
{
  "data": {
    "id": 25002,
    "created_at": "2026-06-03 17:20:00"
  },
  "error": ""
}
```
