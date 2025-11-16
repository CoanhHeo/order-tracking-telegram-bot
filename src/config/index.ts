/**
 * ====================================
 * FILE CẤU HÌNH (CONFIG)
 * ====================================
 * 
 * File này đọc và quản lý tất cả các cấu hình của ứng dụng từ biến môi trường.
 * 
 * TẠI SAO CẦN FILE NÀY?
 * - Tập trung tất cả cấu hình ở một nơi, dễ quản lý
 * - Bảo mật: Các thông tin nhạy cảm (token, key) được lưu trong file .env
 *   thay vì hardcode trong code
 * - Linh hoạt: Có thể thay đổi cấu hình mà không cần sửa code
 * - Hỗ trợ nhiều môi trường: dev, staging, production có thể dùng .env khác nhau
 */

import dotenv from 'dotenv';

// Đọc file .env và load các biến môi trường vào process.env
// Thư viện dotenv giúp đọc file .env và chuyển thành biến môi trường
dotenv.config();

/**
 * Object config chứa tất cả cấu hình của ứng dụng
 * Mỗi giá trị có giá trị mặc định (fallback) nếu không tìm thấy trong .env
 */
export const config = {
  // Cấu hình Telegram Bot
  telegram: {
    // Token dùng để bot kết nối với Telegram API
    // Lấy từ @BotFather trên Telegram
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  
  // Cấu hình MongoDB Database
  mongodb: {
    // URI kết nối đến MongoDB
    // Format: mongodb://[username:password@]host:port/database
    // Mặc định kết nối đến MongoDB local
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/order-tracking-bot',
  },
  
  // Cấu hình Lazada API
  lazada: {
    // App Key và App Secret từ Lazada Open Platform
    // Dùng để xác thực khi gọi API Lazada
    appKey: process.env.LAZADA_APP_KEY || '',
    appSecret: process.env.LAZADA_APP_SECRET || '',
    // URL endpoint của Lazada API (khác nhau giữa các quốc gia)
    apiUrl: process.env.LAZADA_API_URL || 'https://api.lazada.vn/rest',
  },
  
  // Cấu hình Shopee API
  shopee: {
    // Partner ID và Partner Key từ Shopee Open Platform
    // Dùng để xác thực khi gọi API Shopee
    partnerId: parseInt(process.env.SHOPEE_PARTNER_ID || '0'),
    partnerKey: process.env.SHOPEE_PARTNER_KEY || '',
    // URL endpoint của Shopee API
    apiUrl: process.env.SHOPEE_API_URL || 'https://partner.shopeemobile.com',
  },
  
  // Cấu hình Scheduler (Bộ lập lịch)
  scheduler: {
    // Cron expression định nghĩa tần suất kiểm tra đơn hàng
    // '*/30 * * * *' = Mỗi 30 phút
    // Format: phút giờ ngày tháng thứ
    checkOrdersSchedule: process.env.CHECK_ORDERS_SCHEDULE || '*/30 * * * *',
  },
  
  // Cấu hình chung của ứng dụng
  app: {
    // Môi trường chạy: development, production, test
    nodeEnv: process.env.NODE_ENV || 'development',
    // Port cho web server (nếu cần)
    port: parseInt(process.env.PORT || '3000'),
  },
};
