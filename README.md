# 📦 Order Tracking Telegram Bot

Bot Telegram để theo dõi và thông báo trạng thái đơn hàng từ **Lazada** và **Shopee**.

## ✨ Tính năng

- 🤖 Bot Telegram tương tác dễ dàng
- 🛒 Hỗ trợ Lazada và Shopee
- 🔔 Tự động thông báo khi đơn hàng có cập nhật
- 📊 Xem danh sách đơn hàng đang theo dõi
- ⏰ Kiểm tra tự động mỗi 30 phút
- 💾 Lưu trữ lịch sử đơn hàng với MongoDB

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

## 📝 Notes quan trọng

⚠️ **Lưu ý về API Credentials:**
- Access token của Lazada và Shopee có thời hạn, cần refresh định kỳ
- Cần implement OAuth flow để người dùng tự authorize
- Hiện tại bot yêu cầu cấu hình credentials thủ công trong database

⚠️ **Bảo mật:**
- Không commit file `.env` lên git
- Lưu trữ credentials an toàn
- Sử dụng HTTPS khi deploy production

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
