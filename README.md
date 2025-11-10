# Core A: Bundle Plugin

> **Tính năng**: Tạo combo sản phẩm với 3 chiến lược giá:  
> - `SUM`: Tổng giá gốc  
> - `FIXED`: Giá cố định  
> - `PERCENT`: Giảm X% trên tổng  
>
> **Hỗ trợ**: Giá lẻ (Decimal), metadata chi tiết, thêm/xóa item, tích hợp giỏ hàng.

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

########################### API ###########################
# POST    /bundle (SUM)        Tạo combo tổng giá
# POST    /bundle (FIXED)      Tạo combo giá cố định
# POST    /bundle (PERCENT)    Tạo combo giảm %
# POST    /bundle/:id/item     Thêm sản phẩm vào bundle
# PUT     /bundle/:id          Cập nhật chiến lược
# POST    /cart/bundle         Thêm bundle vào giỏ
# DELETE  /bundle/item/:id     Xóa item
###########################################################

