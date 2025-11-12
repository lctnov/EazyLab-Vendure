---
title: EazyLab-Vendure
description: Bundle Plugin với Reserved Stock & JWT Cookie Auth
---

# EazyLab-Vendure: Bundle & Cart Plugin

> **Tính năng chính**:
> - **Core A**: Tạo combo sản phẩm với 3 chiến lược giá: `SUM`, `FIXED`, `PERCENT`
> - **Core B**: Quản lý **tồn kho dự phòng (reserved stock)**, **atomic transaction**, chống **oversell**
> - **Xác thực**: JWT qua **Cookie**, chỉ `/auth/login` & `/auth/register` là **public**
> - **Hỗ trợ**: Giá lẻ (Decimal), metadata chi tiết, thêm/xóa item, tích hợp giỏ hàng an toàn

---

## Mục lục
1. [Yêu cầu hệ thống](#yeu-cau-he-thong)
2. [Cài đặt](#cai-dat)
3. [Chạy ứng dụng](#chay-ung-dung)
4. [Test API (Postman)](#test-api-postman)
5. [Kiểm tra kết quả](#kiem-tra-ket-qua)
6. [API Reference](#api-reference)

---

<a name="yeu-cau-he-thong"></a>
## 1. Yêu cầu hệ thống

| Yêu cầu | Phiên bản |
|--------|----------|
| Node.js | `>=18.17.0` |
| PostgreSQL | `>=14` |
| Prisma | `6.19.0` |
| NestJS | `10.x` |

---

<a name="cai-dat"></a>
## 2. Cài đặt

```bash
# 1. Clone repo
git clone https://github.com/thoisecurity/EazyLab-Vendure.git
cd EazyLab-Vendure

# 2. Cài dependencies
npm install

# 3. Cấu hình DB
cp .env.example .env
# → Sửa DATABASE_URL = postgresql://user:pass@localhost:5432/vendure

# 4. Tạo DB
createdb vendure

# 5. Migrate + Seed Prisma
npx prisma db push
npx prisma generate
npx prisma db seed

#Chạy ứng dụng
# Development : PORT 1211
npm run start:dev

# Production : PORT 1311
npm run start:prod

#################################### API - Quản lý gói sản phẩm ####################################
# GET       /api/v1/getAll                                        Lấy tất cả các gói sản phẩm
# GET       /api/v1/get/{bundleID}                                Lấy chi tiết sản phẩm theo gói
# POST      /api/v1/create                                        Tạo mới gói sản phẩm
# PATCH     /api/v1/update/{bundleID}                             Cập nhật thông tin gói sản phẩm
# POST      /api/v1/bundleItems/create                            Tạo chi tiết gói sản phẩm
# DELETE    /api/v1/bundleItems/{bundleID}                        Xóa các gói chi tiết sản phẩm
# GET       /api/v1/bundleItems/calculatorPrice/{bundleID}        Tính giá theo chi tiết sản phẩm
####################################################################################################

############################### API - Quản lý danh sách thanh toán ###############################
# GET        /api/v1/getOrderLine                                    Lấy giỏ hàng của người dùng
# POST       /api/v1/create                                          Thêm sản phẩm vào giỏ hàng
##################################################################################################

#################################### API - Quản lý gói sản phẩm ####################################
# GET       /api/v1/getAll                                        Lấy tất cả các gói sản phẩm
####################################################################################################

#################################### API - Quản lý đơn hàng ########################################
# GET       /api/v1/getAll                                        Lấy tất cả các gói sản phẩm
# GET       /api/v1/get/{bundleID}                                 Lấy chi tiết sản phẩm theo gói
####################################################################################################

## Bundle trong Cart/Order – 2 cách hiển thị

### Cách 1: **1 dòng duy nhất (khuyên dùng)**

# CÁC YÊU CẦU - TRƯỚC KHI TEST YÊU CẦU NGƯỜI DÙNG PHẢI TOKEN TRƯỚC KHI BẮT DẦU SỬ DỤNG API
# API - POST      /api/v1/login                                        Chức năng đăng nhập
# Tài khoản email và mật khẩu được tạo trong file seed.ts
# {
#  "email": "admin@example.com",
#  "password": "admin123"
# }

# Sau khi có token bạn có thể thực thi tiếp tục API 
# GET       /api/v1/getAll                                        Lấy tất cả các gói sản phẩm
# Xem kết quả finalPrice (SUM sẽ tổng giá gốc, FIXED: lấy theo fixedPrice bỏ qua giá gốc, PERCENT: lấy giá gốc * giá giảm )

# Test Bundle API: SUM, FIXED, PERCENT
# API - POST      /api/v1/create                                        Tạo mới gói sản phẩm(SUM, FIXED, PERCENT)
# {
#   "code": "BND_TEST_SUM",
#   "name": "Combo Test SUM",
#   "priceStrategy": "SUM",
#   "items": [
#     { "variantId": 1, "quantity": 1 },
#     { "variantId": 2, "quantity": 2 }
#   ]
# }

# {
#   "code": "BND_TEST_FIXED",
#   "name": "Combo Test FIXED",
#   "priceStrategy": "FIXED",
#   "fixedPrice": 399.99,
#   "items": [
#     { "variantId": 3, "quantity": 1 },
#     { "variantId": 4, "quantity": 1 }
#   ]
# }

# {
#   "code": "BND_TEST_PERCENT",
#   "name": "Combo Test 15% OFF",
#   "priceStrategy": "PERCENT",
#   "discountValue": 15,
#   "items": [
#     { "variantId": 5, "quantity": 1 },
#     { "variantId": 6, "quantity": 3 }
#   ]
# }

# THÊM ITEM VÀO CÁC GÓI SẢN PHẨM
# POST      /api/v1/bundleItems/create                            Tạo chi tiết gói sản phẩm
# {bundleId} = 1
# {
#   "variantId": 7,
#   "quantity": 2
# }

# XÓA ITEM KHỎI CÁC GÓI SẢN PHẨM
# DELETE    /api/v1/bundleItems/{bundleID}                        Xóa các gói chi tiết sản phẩm
# bundleItemId = 5

# THÊM GÓI SẢN PHẨM VÀO GIỎ HÀNG
# POST       /api/v1/create                                       Thêm sản phẩm vào giỏ hàng
# {
#  "bundleId": 1,
#  "quantity": 1
# }

# TRÙNG VARIANT TRONG BUNDLE
# POST      /api/v1/create                                        Tạo mới gói sản phẩm
# {
#  "bundleId": 1,
#  "variantId": 1,
#  "quantity": 1
# }


# [VALIDATION] QUANTITY < 1
# POST       /api/v1/create                                       Thêm sản phẩm vào giỏ hàng
# {
#  "bundleId": 1,
#  "quantity": 0
# }
