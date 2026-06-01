# 智霖小程序端 API 文档

## 变更记录

- 2026-06-01：调整[获取通知列表](#1-获取通知列表)返回通知状态
- 2026-05-29：调整[更新当前用户资料](#2-更新当前用户资料)的请求参数
- 2026-05-14：新增[获取通知列表](#1-获取通知列表)，用于已注册用户查看自己的通知列表

## 公共说明

| 项目           | 内容                               |
|--------------|----------------------------------|
| Base URL     | https://ssl.innoviews.com/zhilin |
| Content-Type | application/json                 |

## 公共数据定义

### 通知事件类型 event_type

| 枚举值                   | 标题     | 内容模板                       |
|-----------------------|--------|----------------------------|
| CONTRACT_PENDING_SIGN | 合同待签署  | 您的《{合同标题}》待签署，请及时完成确认。     |
| CONTRACT_SIGNED       | 合同签署完成 | 您的《{合同标题}》已签署完成，可在合同详情中查看。 |
| CLAIM_ACCEPTED        | 报案进度更新 | 您的报案已受理，客服人员将继续为您跟进。       |
| CLAIM_REPAIRING       | 报案进度更新 | 您的报案已进入维修处理阶段。             |
| CLAIM_COMPLETED       | 报案处理完成 | 您的报案已处理完成，感谢您的配合。          |

## 用户会话

### 1. 获取当前用户资料

GET /front/user/profile/

用于读取当前小程序用户资料。

#### 响应示例

```json
{
  "data": {
    "phone": "13800138000",
    "nickname": "张三",
    "avatar": "https://cdn.example.com/avatar.jpg",
    "is_registered": true,
    "has_unread_notification": true,
    "openid": "oAbCdEf123456"
  },
  "error": ""
}
```

### 2. 更新当前用户资料

PATCH /front/user/profile/

用于更新当前小程序用户昵称和头像。

#### 请求参数

| 参数       | 类型     | 必填 | 说明   |
|----------|--------|----|------|
| nickname | string | 否  | 昵称   |
| avatar   | string | 否  | 头像地址 |

#### 响应示例

```json
{
  "data": {
    "phone": "13800138000",
    "nickname": "李四",
    "avatar": "https://cdn.example.com/new-avatar.jpg",
    "is_registered": true,
    "has_unread_notification": false,
    "openid": "oAbCdEf123456"
  },
  "error": ""
}
```

## 通知模块

### 1. 获取通知列表

GET /front/notification/

用于已注册用户查看自己的通知列表。接口会在返回通知列表后，将本次查询到的未读通知自动标记为已读。

#### 字段取值

| 字段            | 枚举值    | 说明 |
|---------------|--------|----|
| data[].status | UNREAD | 未读 |
| data[].status | READ   | 已读 |

#### 响应示例

```json
{
  "data": [
    {
      "id": 1,
      "event_type": "CONTRACT_SIGNED",
      "source_type": "SERVICE_ORDER",
      "source_id": 9,
      "status": "UNREAD",
      "title": "合同签署完成",
      "content": "您的《事故管家服务合同》已签署完成，可在合同详情中查看。",
      "read_at": null,
      "created_at": "2026-05-13 10:00:00"
    },
    {
      "id": 2,
      "event_type": "CLAIM_REPAIRING",
      "source_type": "CLAIM",
      "source_id": 7,
      "status": "READ",
      "title": "报案进度更新",
      "content": "您的报案已进入维修处理阶段。",
      "read_at": "2026-05-13 10:05:00",
      "created_at": "2026-05-13 09:30:00"
    }
  ],
  "error": ""
}
```
