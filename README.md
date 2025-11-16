# 📦 Order Tracking Telegram Bot

Bot Telegram để theo dõi và thông báo trạng thái đơn hàng từ **Lazada** và **Shopee**.

## 🎯 Vấn đề cần giải quyết

### Bối cảnh
Khi mua hàng trên các sàn thương mại điện tử như Lazada và Shopee, khách hàng thường gặp những vấn đề sau:

**❌ Vấn đề:**
1. **Phải check thủ công nhiều lần**: Phải mở app Lazada/Shopee thường xuyên để xem đơn hàng đã cập nhật chưa
2. **Dễ bỏ lỡ thông báo quan trọng**: Thông báo từ app có thể bị miss hoặc tắt do spam
3. **Quản lý nhiều đơn hàng khó khăn**: Nếu mua nhiều đơn từ nhiều sàn, việc theo dõi rất mất thời gian
4. **Không có tổng quan tập trung**: Phải vào từng app riêng để xem trạng thái

### Giải pháp

**✅ Bot này giải quyết vấn đề bằng cách:**

1. **Tự động hóa việc kiểm tra**: 
   - Scheduler kiểm tra định kỳ mỗi 30 phút (có thể tùy chỉnh)
   - So sánh trạng thái mới với trạng thái cũ trong database
   
2. **Thông báo thời gian thực qua Telegram**:
   - Gửi tin nhắn ngay khi có thay đổi (shipped, delivered, v.v.)
   - Telegram phổ biến, ít bị miss notification hơn
   
3. **Quản lý tập trung**:
   - Xem tất cả đơn hàng (cả Lazada và Shopee) ở một nơi
   - Lệnh đơn giản: `/orders` để xem toàn bộ
   
4. **Lưu trữ lịch sử**:
   - MongoDB lưu trữ tất cả thông tin đơn hàng
   - Có thể xem lại lịch sử thay đổi trạng thái

### Kiến trúc giải pháp

```
┌─────────────────┐
│   Người dùng    │
│   (Telegram)    │
└────────┬────────┘
         │ Gửi lệnh /addorder, /orders
         ↓
┌─────────────────────────────────────────┐
│          Telegram Bot Service           │
│  - Nhận lệnh từ user                    │
│  - Xử lý logic commands                 │
│  - Gửi thông báo                        │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│           MongoDB Database              │
│  - Lưu User, Order, Credentials         │
│  - Query và update data                 │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│          Order Scheduler                │
│  - Chạy mỗi 30 phút (cron job)         │
│  - Lấy danh sách đơn hàng từ DB        │
│  - Gọi API Lazada/Shopee               │
│  - So sánh status cũ vs mới            │
│  - Gửi thông báo nếu có thay đổi       │
└────────┬────────────────────────────────┘
         │
         ↓
┌─────────────────────────────────────────┐
│    Lazada API    │    Shopee API        │
│  - Xác thực      │    - Xác thực        │
│  - Lấy order     │    - Lấy order       │
│  - Get status    │    - Get status      │
└─────────────────────────────────────────┘
```

## ✨ Tính năng

- 🤖 Bot Telegram tương tác dễ dàng
- 🛒 Hỗ trợ Lazada và Shopee
- 🔔 Tự động thông báo khi đơn hàng có cập nhật
- 📊 Xem danh sách đơn hàng đang theo dõi
- ⏰ Kiểm tra tự động mỗi 30 phút
- 💾 Lưu trữ lịch sử đơn hàng với MongoDB

## 📚 Công nghệ sử dụng & Giải thích

### Tại sao chọn các công nghệ này?

#### 1. **Node.js + TypeScript**
- **Node.js**: JavaScript runtime cho server-side
  - **Lý do chọn**: Phù hợp cho I/O intensive (nhiều API calls, database queries)
  - Async/await giúp code dễ đọc, không bị callback hell
  - Ecosystem phong phú (npm packages)
  
- **TypeScript**: Superset của JavaScript với static typing
  - **Lý do chọn**: Type safety giúp tránh lỗi runtime
  - IntelliSense tốt hơn khi code
  - Dễ maintain code với interface, type checking

#### 2. **Telegram Bot API** (`node-telegram-bot-api`)
```json
"node-telegram-bot-api": "^0.64.0"
```
- **Tại sao dùng Telegram thay vì web app?**
  - ✅ Không cần build UI/UX phức tạp
  - ✅ Notification realtime, ít bị miss
  - ✅ Cross-platform (mobile, desktop, web)
  - ✅ Dễ tương tác với lệnh đơn giản (/start, /orders)

#### 3. **MongoDB + Mongoose** (`mongoose`)
```json
"mongoose": "^8.0.0"
```
- **Tại sao chọn MongoDB?**
  - ✅ NoSQL - Schema linh hoạt, dễ thay đổi cấu trúc
  - ✅ Document-based (JSON-like) phù hợp với Node.js
  - ✅ Không cần join phức tạp như SQL
  - ✅ Mongoose ODM: Validation, middleware, query builder tích hợp

- **Mongoose giúp gì?**
  - Schema definition với validation
  - Middleware (pre/post hooks)
  - Populate (tương tự JOIN trong SQL)
  - Type safety khi dùng với TypeScript

#### 4. **Cron Job** (`node-cron`)
```json
"node-cron": "^3.0.3"
```
- **Tại sao cần scheduler?**
  - ✅ Tự động kiểm tra đơn hàng định kỳ mà không cần user trigger
  - ✅ Cron expression linh hoạt (*/30 * * * * = mỗi 30 phút)
  - ✅ Nhẹ, không cần tool ngoài như Kubernetes CronJob

- **Alternative và lý do không chọn:**
  - ❌ setTimeout/setInterval: Không reliable khi restart
  - ❌ External scheduler (Airflow, etc): Quá phức tạp cho use case này

#### 5. **Axios** (`axios`)
```json
"axios": "^1.6.0"
```
- **Tại sao dùng Axios thay vì fetch?**
  - ✅ Tự động parse JSON response
  - ✅ Interceptors cho request/response
  - ✅ Timeout configuration dễ dàng
  - ✅ Handling errors tốt hơn
  - ✅ Support older Node.js versions (fetch là built-in từ Node 18)

#### 6. **Crypto-JS** (`crypto-js`)
```json
"crypto-js": "^4.2.0"
```
- **Tại sao cần?**
  - ✅ Tạo signature cho Lazada/Shopee API (HMAC-SHA256)
  - ✅ Bảo mật: API yêu cầu sign request để verify
  - ✅ Lightweight, chỉ cần mã hóa cơ bản

- **API Signature là gì?**
  ```
  Signature = HMAC-SHA256(AppSecret, RequestParams)
  ```
  - Đảm bảo request không bị giả mạo
  - Server verify signature để xác thực request hợp lệ

#### 7. **Dotenv** (`dotenv`)
```json
"dotenv": "^16.3.1"
```
- **Tại sao cần?**
  - ✅ Tách biệt config khỏi code (secrets không hardcode)
  - ✅ Dễ thay đổi config giữa môi trường (dev/prod)
  - ✅ Best practice trong Node.js development
  - ✅ File .env không commit lên Git → Bảo mật

#### 8. **Development Tools**

**ts-node-dev**: Hot reload cho TypeScript
```json
"ts-node-dev": "^2.0.0"
```
- Tự động restart khi code thay đổi
- Không cần build mỗi lần sửa code

**ESLint**: Code linting
```json
"eslint": "^8.54.0"
```
- Tìm lỗi và enforce coding standards
- Tích hợp với TypeScript

## 📋 Yêu cầu

- Node.js >= 18.x
- MongoDB >= 5.x
- Telegram Bot Token (tạo qua [@BotFather](https://t.me/botfather))
- Lazada API credentials (App Key, App Secret)
- Shopee API credentials (Partner ID, Partner Key)

## 🚀 Cài đặt

### 1. Clone dự án

```bash
cd bot-telegram
```

### 2. Cài đặt dependencies

```bash
npm install
```

### 3. Cấu hình môi trường

Tạo file `.env` từ file mẫu:

```bash
cp .env.example .env
```

Cập nhật các thông tin trong file `.env`:

```env
# Telegram Bot Token
TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here

# MongoDB URI
MONGODB_URI=mongodb://localhost:27017/order-tracking-bot

# Lazada API
LAZADA_APP_KEY=your_lazada_app_key
LAZADA_APP_SECRET=your_lazada_app_secret
LAZADA_API_URL=https://api.lazada.vn/rest

# Shopee API
SHOPEE_PARTNER_ID=your_shopee_partner_id
SHOPEE_PARTNER_KEY=your_shopee_partner_key
SHOPEE_API_URL=https://partner.shopeemobile.com

# Cron schedule (mặc định: mỗi 30 phút)
CHECK_ORDERS_SCHEDULE=*/30 * * * *
```

### 4. Build dự án

```bash
npm run build
```

### 5. Chạy bot

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

## 🔍 Luồng xử lý chi tiết

### 1. Luồng thêm đơn hàng mới

```
User gửi /addorder
    │
    ↓
┌─────────────────────────────────────────────┐
│  Bot hiển thị inline keyboard:             │
│  [🛒 Lazada] [🛍️ Shopee]                   │
└─────────────────┬───────────────────────────┘
                  │
                  ↓ User click chọn platform
┌─────────────────────────────────────────────┐
│  Callback Query: "platform_lazada"          │
│  - Lưu session: {platform: "lazada"}       │
│  - Bot yêu cầu: "Nhập mã đơn hàng"         │
└─────────────────┬───────────────────────────┘
                  │
                  ↓ User nhập mã (VD: "123456")
┌─────────────────────────────────────────────┐
│  Message Handler:                           │
│  1. Validate orderId                        │
│  2. Check trùng lặp trong DB               │
│  3. Tạo Order document mới                 │
│     - userId: chatId                        │
│     - orderId: "123456"                     │
│     - platform: "lazada"                    │
│     - status: "pending"                     │
│  4. Save vào MongoDB                        │
│  5. Gửi thông báo thành công              │
└─────────────────────────────────────────────┘
```

**Code snippet tương ứng:**
```typescript
// callbacks.ts
if (data.startsWith('platform_')) {
  const platform = data.replace('platform_', '');
  userSessions.set(chatId, { platform, step: 'waiting_order_id' });
  // Đợi user nhập mã đơn hàng...
}
```

### 2. Luồng kiểm tra tự động (Scheduler)

```
Cron job chạy (mỗi 30 phút)
    │
    ↓
┌─────────────────────────────────────────────┐
│  OrderScheduler.checkAllOrders()            │
│  1. Query DB: Tất cả orders chưa hoàn thành│
│     WHERE status NOT IN ('delivered',       │
│                          'cancelled')       │
└─────────────────┬───────────────────────────┘
                  │
                  ↓ Duyệt từng đơn hàng
┌─────────────────────────────────────────────┐
│  Với mỗi order:                             │
│  1. Lấy UserCredentials (access_token)     │
│  2. Gọi API Lazada/Shopee                  │
│     → GET order details                     │
│  3. So sánh status mới vs cũ               │
└─────────────────┬───────────────────────────┘
                  │
                  ↓ Nếu status thay đổi
┌─────────────────────────────────────────────┐
│  Status changed!                            │
│  1. Update Order trong DB:                 │
│     - order.status = newStatus              │
│     - order.lastUpdated = Date.now()       │
│  2. Format thông báo:                      │
│     "🛒 CẬP NHẬT ĐƠN HÀNG                  │
│      📋 Mã: 123456                         │
│      📊 Cũ: pending → 🚚 Mới: shipped"     │
│  3. bot.sendMessage(userId, message)       │
└─────────────────────────────────────────────┘
```

**Code snippet:**
```typescript
// OrderScheduler.ts
private async checkOrder(order: any) {
  const orderInfo = await lazadaService.getOrderDetails(...);
  
  if (orderInfo.status !== order.status) {
    order.status = orderInfo.status;
    await order.save();
    await this.sendStatusNotification(...);
  }
}
```

### 3. Luồng xác thực API (API Signature)

**Vấn đề:** API Lazada/Shopee yêu cầu sign request để bảo mật

**Giải pháp:**
```
Chuẩn bị request params
    │
    ↓
┌─────────────────────────────────────────────┐
│  1. Collect params:                         │
│     {                                        │
│       app_key: "12345",                     │
│       timestamp: "1234567890",              │
│       order_id: "123456"                    │
│     }                                        │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  2. Sort params alphabetically:             │
│     app_key=12345                           │
│     order_id=123456                         │
│     timestamp=1234567890                    │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  3. Create signature string:                │
│     "/order/get" +                          │
│     "app_key12345order_id123456..."        │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  4. Hash với HMAC-SHA256:                   │
│     signature = HMAC_SHA256(                │
│         key: APP_SECRET,                    │
│         data: signatureString               │
│     )                                        │
└─────────────────┬───────────────────────────┘
                  │
                  ↓
┌─────────────────────────────────────────────┐
│  5. Add signature vào params:              │
│     params.sign = signature                 │
│  6. Gọi API với params đã sign             │
└─────────────────────────────────────────────┘
```

**Code snippet:**
```typescript
// LazadaService.ts
private generateSignature(apiPath: string, params: Record<string, string>) {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}${params[key]}`)
    .join('');
  
  const signString = `${apiPath}${sortedParams}`;
  return crypto.createHmac('sha256', this.appSecret)
    .update(signString)
    .digest('hex')
    .toUpperCase();
}
```

## 🎯 Hướng dẫn sử dụng

### Các lệnh cơ bản

| Lệnh | Mô tả |
|------|-------|
| `/start` | Khởi động bot và đăng ký tài khoản |
| `/help` | Xem hướng dẫn chi tiết |
| `/addorder` | Thêm đơn hàng cần theo dõi |
| `/orders` | Xem danh sách đơn hàng |
| `/deleteorder` | Xóa đơn hàng khỏi danh sách |

### Quy trình theo dõi đơn hàng

1. **Khởi động bot**: Gửi lệnh `/start` cho bot
2. **Thêm đơn hàng**: 
   - Gửi lệnh `/addorder`
   - Chọn sàn (Lazada hoặc Shopee)
   - Nhập mã đơn hàng
3. **Theo dõi**: Bot sẽ tự động kiểm tra và thông báo khi có cập nhật
4. **Xem đơn hàng**: Gửi `/orders` để xem danh sách
5. **Xóa đơn hàng**: Gửi `/deleteorder` và chọn đơn hàng muốn xóa

## 🔑 Lấy API Credentials

### Lazada API

1. Đăng ký tài khoản seller tại [Lazada Seller Center](https://sellercenter.lazada.vn/)
2. Truy cập [Lazada Open Platform](https://open.lazada.com/)
3. Tạo ứng dụng mới và lấy **App Key** và **App Secret**
4. Cấu hình Authorization để lấy **Access Token**

### Shopee API

1. Đăng ký tài khoản seller tại [Shopee Seller Center](https://banhang.shopee.vn/)
2. Truy cập [Shopee Open Platform](https://open.shopee.com/)
3. Tạo ứng dụng mới và lấy **Partner ID** và **Partner Key**
4. Thực hiện OAuth flow để lấy **Access Token** và **Shop ID**

### Telegram Bot Token

1. Mở Telegram và tìm [@BotFather](https://t.me/botfather)
2. Gửi lệnh `/newbot`
3. Đặt tên cho bot của bạn
4. Copy **Bot Token** được cung cấp

## 📁 Cấu trúc dự án

```
bot-telegram/
├── src/
│   ├── bot/
│   │   ├── index.ts           # Bot service chính
│   │   ├── commands.ts        # Xử lý các lệnh
│   │   └── callbacks.ts       # Xử lý callback queries
│   ├── config/
│   │   └── index.ts           # Cấu hình ứng dụng
│   ├── database/
│   │   └── index.ts           # Kết nối MongoDB
│   ├── models/
│   │   ├── User.ts            # Model người dùng
│   │   ├── Order.ts           # Model đơn hàng
│   │   └── UserCredentials.ts # Model credentials
│   ├── services/
│   │   ├── LazadaService.ts   # Tích hợp Lazada API
│   │   └── ShopeeService.ts   # Tích hợp Shopee API
│   ├── scheduler/
│   │   └── OrderScheduler.ts  # Cron job kiểm tra đơn hàng
│   └── index.ts               # Entry point
├── .env.example               # Mẫu cấu hình
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Cấu hình nâng cao

### Thay đổi tần suất kiểm tra

Chỉnh sửa biến `CHECK_ORDERS_SCHEDULE` trong file `.env` (sử dụng cron format):

```env
# Kiểm tra mỗi 15 phút
CHECK_ORDERS_SCHEDULE=*/15 * * * *

# Kiểm tra mỗi giờ
CHECK_ORDERS_SCHEDULE=0 * * * *

# Kiểm tra mỗi 6 giờ
CHECK_ORDERS_SCHEDULE=0 */6 * * *
```

### MongoDB Production

Sử dụng MongoDB Atlas hoặc server riêng:

```env
MONGODB_URI=mongodb+srv://<YOUR_USERNAME>:<YOUR_PASSWORD>@<YOUR_CLUSTER>.mongodb.net/order-tracking-bot
```

## 🐛 Xử lý lỗi

### Bot không nhận tin nhắn

- Kiểm tra `TELEGRAM_BOT_TOKEN` có đúng không
- Đảm bảo bot không bị block bởi user

### Không kết nối được MongoDB

- Kiểm tra MongoDB đã chạy chưa: `systemctl status mongod`
- Kiểm tra `MONGODB_URI` có đúng không

### Không lấy được thông tin đơn hàng

- Kiểm tra API credentials (App Key, Partner ID, etc.)
- Đảm bảo Access Token còn hiệu lực
- Kiểm tra quyền truy cập API

## 📝 Notes quan trọng & Best Practices

### ⚠️ Lưu ý về API Credentials

**Access Token Expiration:**
- Access token của Lazada và Shopee có thời hạn (thường 30 ngày - 1 năm)
- Cần implement refresh token flow để tự động gia hạn
- Hiện tại: Cấu hình credentials thủ công trong database

**OAuth Flow (Recommended for Production):**
```typescript
// Future implementation
1. User click "Authorize Lazada"
2. Redirect to Lazada OAuth page
3. User approve → Get authorization code
4. Exchange code for access_token + refresh_token
5. Save to UserCredentials collection
```

### 🔒 Bảo mật

**Environment Variables:**
```bash
# ❌ KHÔNG BAO GIỜ làm thế này
const BOT_TOKEN = "123456:ABCdef...";

# ✅ Luôn dùng env variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
```

**Best Practices:**
- ✅ File `.env` KHÔNG bao giờ commit lên Git
- ✅ Thêm `.env` vào `.gitignore`
- ✅ Dùng `.env.example` làm template (không chứa giá trị thật)
- ✅ Mã hóa credentials trong database (production)
- ✅ Use HTTPS khi deploy production
- ✅ Giới hạn rate limit cho API calls
- ✅ Validate input từ user (tránh injection)

### 🚀 Tối ưu hiệu suất

**Database Indexing:**
```typescript
// Order.ts - Đã có compound index
OrderSchema.index({ userId: 1, orderId: 1, platform: 1 }, { unique: true });

// Tại sao? → Tìm kiếm nhanh hơn 10-100 lần
// Query: Order.find({ userId: chatId })
// Với index: O(log n) thay vì O(n)
```

**Cron Job Optimization:**
```typescript
// ❌ Không tốt: Kiểm tra TẤT CẢ đơn hàng
const orders = await Order.find();

// ✅ Tốt hơn: Chỉ kiểm tra đơn chưa hoàn thành
const orders = await Order.find({ 
  status: { $nin: ['delivered', 'cancelled'] } 
});
```

**Connection Pooling:**
```typescript
// Mongoose tự động quản lý connection pool
// Default: 5 connections
// Có thể tùy chỉnh trong config:
mongoose.connect(uri, {
  maxPoolSize: 10,  // Max 10 connections
  minPoolSize: 2    // Min 2 connections
});
```

### 🐛 Xử lý lỗi thường gặp

**1. Bot không nhận tin nhắn**
```bash
# Check: Bot token có đúng không?
echo $TELEGRAM_BOT_TOKEN

# Check: Bot có bị block bởi user không?
# → User phải unblock và /start lại

# Check: Firewall có chặn không?
curl https://api.telegram.org/bot<TOKEN>/getMe
```

**2. MongoDB connection error**
```bash
# Check: MongoDB có đang chạy không?
sudo systemctl status mongod

# Check: URI có đúng không?
echo $MONGODB_URI

# Test connection:
mongosh "$MONGODB_URI"
```

**3. API calls fail**
```bash
# Check credentials:
echo $LAZADA_APP_KEY
echo $SHOPEE_PARTNER_ID

# Check signature generation (debug):
console.log('Sign string:', signString);
console.log('Signature:', signature);

# Common issues:
# - Params không sort đúng thứ tự
# - Timestamp sai format
# - Secret key sai
```

### 📊 Monitoring & Logging

**Logging Best Practices:**
```typescript
// ❌ Không tốt
console.log('error');

// ✅ Tốt hơn
console.error('[ERROR] Failed to fetch order:', {
  orderId: order.orderId,
  platform: order.platform,
  error: error.message,
  timestamp: new Date().toISOString()
});
```

**Metrics cần track:**
- Số lượng users active
- Số đơn hàng đang theo dõi
- Số lần kiểm tra thành công/thất bại
- Response time của API calls
- Memory/CPU usage

**Tools gợi ý:**
- **Production**: Winston + ELK Stack (Elasticsearch, Logstash, Kibana)
- **Simple**: PM2 logs + MongoDB logs
- **Monitoring**: Prometheus + Grafana

## 🚀 Deploy Production

### Sử dụng PM2

```bash
# Install PM2
npm install -g pm2

# Build project
npm run build

# Start with PM2
pm2 start dist/index.js --name order-tracking-bot

# Auto restart on system reboot
pm2 startup
pm2 save
```

### Sử dụng Docker

Tạo file `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .
RUN npm run build

CMD ["node", "dist/index.js"]
```

Build và chạy:

```bash
docker build -t order-tracking-bot .
docker run -d --env-file .env order-tracking-bot
```

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:

1. Fork dự án
2. Tạo branch mới (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết

## 📞 Liên hệ

Nếu có thắc mắc hoặc cần hỗ trợ, vui lòng tạo issue trên GitHub.

---

Made with ❤️ by Sanh Nguyen
