# HƯỚNG DẪN BẮT ĐẦU NHANH

## Bước 1: Cài đặt Dependencies

```bash
npm install
```

## Bước 2: Tạo Telegram Bot

1. Mở Telegram, tìm **@BotFather**
2. Gửi lệnh `/newbot`
3. Đặt tên bot (ví dụ: My Order Tracker)
4. Đặt username bot (ví dụ: myordertracker_bot)
5. Copy **token** nhận được

## Bước 3: Cài đặt MongoDB

### macOS (sử dụng Homebrew):
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

### Hoặc sử dụng Docker:
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Bước 4: Cấu hình môi trường

Tạo file `.env`:

```bash
cp .env.example .env
```

Chỉnh sửa file `.env` với token bot của bạn:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
MONGODB_URI=mongodb://localhost:27017/order-tracking-bot
```

**Lưu ý:** API của Lazada và Shopee cần đăng ký riêng, có thể để trống ban đầu.

## Bước 5: Chạy Bot

```bash
npm run dev
```

## Bước 6: Kiểm tra Bot

1. Mở Telegram
2. Tìm bot của bạn bằng username (ví dụ: @myordertracker_bot)
3. Gửi lệnh `/start`
4. Bot sẽ trả lời với menu hướng dẫn!

## Các lệnh có sẵn

- `/start` - Khởi động bot
- `/help` - Xem hướng dẫn
- `/addorder` - Thêm đơn hàng (cần cấu hình API)
- `/orders` - Xem danh sách đơn hàng
- `/deleteorder` - Xóa đơn hàng

## ⚠️ Lưu ý về API Lazada và Shopee

Để sử dụng đầy đủ tính năng theo dõi đơn hàng, bạn cần:

### Lazada API:
1. Đăng ký tài khoản seller: https://sellercenter.lazada.vn/
2. Đăng ký ứng dụng tại: https://open.lazada.com/
3. Lấy App Key và App Secret
4. Thêm vào file `.env`:
   ```env
   LAZADA_APP_KEY=your_app_key
   LAZADA_APP_SECRET=your_app_secret
   ```

### Shopee API:
1. Đăng ký tài khoản seller: https://banhang.shopee.vn/
2. Đăng ký ứng dụng tại: https://open.shopee.com/
3. Lấy Partner ID và Partner Key
4. Thêm vào file `.env`:
   ```env
   SHOPEE_PARTNER_ID=your_partner_id
   SHOPEE_PARTNER_KEY=your_partner_key
   ```

## 🎯 Test Bot không cần API

Bot vẫn có thể chạy và test các lệnh cơ bản như `/start`, `/help` ngay cả khi chưa có API credentials. 

Tính năng theo dõi đơn hàng thực tế sẽ cần API credentials từ Lazada và Shopee.

## Troubleshooting

### Lỗi kết nối MongoDB
```bash
# Kiểm tra MongoDB đã chạy chưa
brew services list | grep mongodb

# Hoặc với Docker
docker ps | grep mongodb
```

### Bot không phản hồi
- Kiểm tra token bot có đúng không
- Đảm bảo bot đang chạy (`npm run dev`)
- Kiểm tra console có lỗi gì không

### Lỗi dependencies
```bash
# Xóa và cài lại
rm -rf node_modules package-lock.json
npm install
```

## Cần hỗ trợ?

Tạo issue trên GitHub hoặc xem README.md để biết thêm chi tiết!
