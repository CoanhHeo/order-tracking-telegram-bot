# 📚 GIẢI THÍCH DỰ ÁN CHO NGƯỜI MỚI

## 🎯 Dự án này làm gì?

Đây là một **bot Telegram** giúp bạn **tự động theo dõi đơn hàng** từ Lazada và Shopee.

### Ví dụ thực tế:
1. Bạn mua hàng trên Lazada, mã đơn hàng: `123456`
2. Bạn nói với bot: `/addorder` → Chọn Lazada → Nhập `123456`
3. **Bot tự động kiểm tra** mỗi 30 phút
4. Khi đơn hàng **chuyển từ "đang xử lý" → "đang giao"**, bot gửi tin nhắn cho bạn ngay lập tức!

**Lợi ích:**
- ✅ Không cần mở app Lazada/Shopee nhiều lần
- ✅ Không bỏ lỡ cập nhật quan trọng
- ✅ Quản lý nhiều đơn hàng từ nhiều sàn ở 1 chỗ

---

## 🏗️ Kiến trúc hệ thống (Đơn giản hóa)

```
┌──────────────┐
│   BẠN        │  Gửi lệnh /orders
│  (Telegram)  │
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────┐
│         TELEGRAM BOT                 │
│  "Bộ não" xử lý lệnh của bạn        │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│         MONGODB                      │
│  "Bộ nhớ" lưu thông tin đơn hàng    │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│         SCHEDULER                    │
│  "Đồng hồ báo thức" kiểm tra         │
│  đơn hàng mỗi 30 phút               │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│    LAZADA/SHOPEE API                 │
│  "Nguồn dữ liệu" về đơn hàng        │
└──────────────────────────────────────┘
```

---

## 📂 Cấu trúc thư mục (Giải thích đơn giản)

```
src/
├── index.ts              → "Cửa chính" - Khởi động toàn bộ ứng dụng
├── config/
│   └── index.ts          → "Tủ đồ" - Lưu các cấu hình (token, API key)
├── database/
│   └── index.ts          → "Ổ khóa" - Kết nối đến MongoDB
├── models/
│   ├── User.ts           → "Mẫu giấy tờ User" - Cấu trúc dữ liệu người dùng
│   ├── Order.ts          → "Mẫu giấy tờ Order" - Cấu trúc dữ liệu đơn hàng
│   └── UserCredentials.ts → "Két sắt" - Lưu token API của user
├── bot/
│   ├── index.ts          → "Tổng đài viên" - Điều phối bot
│   ├── commands.ts       → "Sổ tay lệnh" - Xử lý /start, /orders, v.v.
│   └── callbacks.ts      → "Bộ xử lý nút bấm" - Xử lý khi user click nút
├── services/
│   ├── LazadaService.ts  → "Cầu nối Lazada" - Gọi API Lazada
│   └── ShopeeService.ts  → "Cầu nối Shopee" - Gọi API Shopee
└── scheduler/
    └── OrderScheduler.ts → "Đồng hồ báo thức" - Kiểm tra tự động
```

---

## 🔄 Luồng hoạt động chính

### 1️⃣ User thêm đơn hàng

```
Bạn: /addorder
Bot: "Chọn sàn: [Lazada] [Shopee]"
Bạn: *Click Lazada*
Bot: "Nhập mã đơn hàng:"
Bạn: "123456"
Bot: "✅ Đã thêm thành công!"

→ Lưu vào MongoDB: { userId, orderId: "123456", platform: "lazada" }
```

### 2️⃣ Scheduler kiểm tra tự động

```
⏰ Mỗi 30 phút:
1. Lấy tất cả đơn hàng chưa hoàn thành từ MongoDB
2. Với mỗi đơn hàng:
   - Gọi API Lazada/Shopee để lấy trạng thái mới
   - So sánh với trạng thái cũ trong DB
   - Nếu khác nhau → Gửi thông báo cho user
```

### 3️⃣ Gửi thông báo

```
Trạng thái cũ: "Đang xử lý"
Trạng thái mới: "Đang giao"

Bot gửi: 
"🛒 CẬP NHẬT ĐƠN HÀNG
 📋 Mã: 123456
 🏪 Sàn: LAZADA
 📊 Cũ: Đang xử lý
 🚚 Mới: Đang giao"
```

---

## 🛠️ Các công nghệ & Tại sao chọn?

### 1. **Node.js** (Nền tảng chạy JavaScript)
- **So sánh**: Giống như "động cơ" của xe
- **Tại sao?** Phù hợp để xử lý nhiều kết nối cùng lúc (bot, database, API)

### 2. **TypeScript** (JavaScript có kiểu dữ liệu)
- **So sánh**: JavaScript mặc áo giáp
- **Tại sao?** Bắt lỗi sớm hơn, code dễ đọc hơn
- **Ví dụ**:
  ```typescript
  // JavaScript - Dễ lỗi
  function add(a, b) { return a + b; }
  add("2", 3);  // "23" (bug!)
  
  // TypeScript - Bắt lỗi ngay
  function add(a: number, b: number): number { return a + b; }
  add("2", 3);  // ❌ Lỗi compile!
  ```

### 3. **MongoDB** (Database lưu dữ liệu)
- **So sánh**: Giống như "tủ hồ sơ"
- **Tại sao dùng MongoDB thay vì MySQL?**
  - MongoDB: Lưu dạng JSON → Dễ làm việc với Node.js
  - MySQL: Lưu dạng bảng → Cứng nhắc hơn
  
  ```javascript
  // MongoDB document (linh hoạt)
  {
    userId: 123,
    orderId: "456",
    items: [
      { name: "Áo", price: 100 },
      { name: "Quần", price: 200 }
    ]
  }
  
  // MySQL table (cần nhiều bảng)
  Table: orders (userId, orderId)
  Table: order_items (orderId, name, price)
  ```

### 4. **Mongoose** (ODM cho MongoDB)
- **So sánh**: "Thư ký" giúp làm việc với MongoDB dễ hơn
- **Tại sao?**
  - Validate dữ liệu tự động
  - Định nghĩa cấu trúc rõ ràng
  - Tích hợp TypeScript tốt

### 5. **node-telegram-bot-api** (Thư viện bot Telegram)
- **So sánh**: "Điện thoại" để nói chuyện với Telegram
- **Tại sao?** Không phải tự viết logic kết nối Telegram

### 6. **node-cron** (Scheduler)
- **So sánh**: "Đồng hồ báo thức"
- **Tại sao?** Tự động chạy code theo lịch định sẵn
  ```javascript
  cron.schedule('*/30 * * * *', () => {
    // Chạy mỗi 30 phút
    checkOrders();
  });
  ```

### 7. **Axios** (HTTP client)
- **So sánh**: "Bưu tá" gửi/nhận request API
- **Tại sao dùng Axios thay vì fetch?**
  - Tự động parse JSON
  - Xử lý lỗi tốt hơn
  - Timeout dễ dàng

### 8. **crypto-js** (Mã hóa)
- **So sánh**: "Máy tạo chữ ký số"
- **Tại sao?** API Lazada/Shopee yêu cầu "chữ ký" để bảo mật
  ```typescript
  // Tạo chữ ký (signature)
  const signature = HMAC_SHA256(secret, data);
  // API verify chữ ký → Đảm bảo request hợp lệ
  ```

### 9. **dotenv** (Quản lý biến môi trường)
- **So sánh**: "Két sắt" chứa thông tin bí mật
- **Tại sao?** Không hardcode token/key trong code
  ```javascript
  // ❌ Nguy hiểm - Ai cũng thấy nếu code bị leak
  const TOKEN = "123456:ABCdef...";
  
  // ✅ An toàn - Token ở file .env (không commit lên Git)
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  ```

---

## 🔐 Bảo mật - Quan trọng!

### 1. File `.env` chứa secrets
```env
# File .env - KHÔNG BAO GIỜ commit lên Git!
TELEGRAM_BOT_TOKEN=123456:ABCdefGHI...
MONGODB_URI=mongodb://localhost:27017/...
LAZADA_APP_KEY=1234567890
LAZADA_APP_SECRET=abcdefghijklmnop
```

### 2. File `.gitignore` ngăn không cho commit
```
.env          ← PHẢI có dòng này!
node_modules/
dist/
```

### 3. File `.env.example` làm template
```env
# .env.example - Commit được, không chứa giá trị thật
TELEGRAM_BOT_TOKEN=your_token_here
MONGODB_URI=your_mongodb_uri_here
```

---

## 🚀 Cách chạy dự án (Step by step)

### Bước 1: Cài đặt
```bash
# Clone dự án
git clone <repo-url>
cd order-tracking-telegram-bot

# Cài dependencies
npm install
```

### Bước 2: Cấu hình
```bash
# Copy file mẫu
cp .env.example .env

# Sửa file .env, điền các giá trị thật
nano .env
```

### Bước 3: Chạy
```bash
# Development (tự động reload khi sửa code)
npm run dev

# Production
npm run build
npm start
```

---

## 🐛 Debug khi có lỗi

### Lỗi: "Cannot connect to MongoDB"
```bash
# Check MongoDB có chạy không?
sudo systemctl status mongod

# Nếu không chạy:
sudo systemctl start mongod
```

### Lỗi: "Bot không phản hồi"
```bash
# Check token có đúng không?
echo $TELEGRAM_BOT_TOKEN

# Test bot token:
curl https://api.telegram.org/bot<TOKEN>/getMe
```

### Lỗi: "API signature invalid"
```bash
# Check trong code:
console.log('Signature string:', signString);
console.log('Generated signature:', signature);

# Common issue: Params không sort đúng thứ tự
```

---

## 📖 Học thêm

### Tài liệu chính thức:
- [Node.js Docs](https://nodejs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [MongoDB Manual](https://docs.mongodb.com/)
- [Telegram Bot API](https://core.telegram.org/bots/api)

### Khóa học gợi ý:
- Node.js: "Node.js - The Complete Guide" (Udemy)
- TypeScript: "Understanding TypeScript" (Udemy)
- MongoDB: "MongoDB - The Complete Developer's Guide" (Udemy)

---

## ❓ Câu hỏi thường gặp (FAQ)

### Q1: Tại sao dùng Telegram thay vì web app?
**A:** 
- Không cần build frontend phức tạp
- Telegram có sẵn notification
- User không cần cài thêm app

### Q2: Có thể thêm sàn khác (Tiki, Sendo) không?
**A:** Có! Tạo file `TikiService.ts` tương tự `LazadaService.ts`

### Q3: Scheduler có tốn tài nguyên không?
**A:** Không nhiều. Chỉ chạy mỗi 30 phút, query có index nên nhanh.

### Q4: Làm sao để deploy lên server?
**A:** 
1. Thuê VPS (DigitalOcean, AWS EC2)
2. Cài Node.js, MongoDB
3. Clone code, `npm install`, chạy với PM2

### Q5: Bot có thể handle được bao nhiêu user?
**A:** 
- Single server: ~1000-5000 users
- Với load balancer + MongoDB cluster: Hàng triệu users

---

**🎉 Chúc bạn học tốt và code vui vẻ!**
