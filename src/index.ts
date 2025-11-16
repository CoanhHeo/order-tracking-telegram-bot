/**
 * ====================================
 * FILE INDEX.TS CHÍNH - ĐIỂM KHỞI ĐỘNG ỨNG DỤNG
 * ====================================
 * 
 * File này là điểm vào (entry point) của toàn bộ ứng dụng.
 * Nó có nhiệm vụ khởi tạo và kết nối tất cả các thành phần chính:
 * 1. Đọc và validate cấu hình từ biến môi trường
 * 2. Kết nối đến cơ sở dữ liệu MongoDB
 * 3. Khởi động bot Telegram
 * 4. Khởi động scheduler (bộ lập lịch kiểm tra đơn hàng tự động)
 */

import { config } from './config';
import { connectDatabase } from './database';
import { TelegramBotService } from './bot';
import { OrderScheduler } from './scheduler/OrderScheduler';

/**
 * Hàm main - Hàm chính khởi động ứng dụng
 * 
 * Luồng hoạt động:
 * 1. Kiểm tra Bot Token có tồn tại không (bắt buộc để bot hoạt động)
 * 2. Kết nối database để lưu trữ dữ liệu user và đơn hàng
 * 3. Khởi tạo bot service để xử lý tin nhắn Telegram
 * 4. Khởi động scheduler để tự động kiểm tra đơn hàng định kỳ
 * 
 * Nếu có lỗi ở bất kỳ bước nào, ứng dụng sẽ dừng lại và in ra thông báo lỗi
 */
async function main() {
  try {
    console.log('🚀 Starting Order Tracking Telegram Bot...');

    // BƯỚC 1: Kiểm tra cấu hình
    // Bot token là bắt buộc để bot có thể kết nối với Telegram API
    // Nếu không có token, ứng dụng không thể hoạt động
    if (!config.telegram.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
    }

    // BƯỚC 2: Kết nối đến MongoDB
    // MongoDB lưu trữ thông tin người dùng, đơn hàng và trạng thái
    // Nếu không kết nối được, ứng dụng sẽ dừng lại
    await connectDatabase();

    // BƯỚC 3: Khởi tạo bot Telegram
    // Bot service sẽ lắng nghe các tin nhắn từ người dùng
    // và xử lý các lệnh như /start, /addorder, /orders, v.v.
    const botService = new TelegramBotService();

    // BƯỚC 4: Khởi động scheduler (bộ lập lịch)
    // Scheduler sẽ tự động kiểm tra trạng thái đơn hàng theo định kỳ
    // (mặc định là mỗi 30 phút) và gửi thông báo khi có thay đổi
    const scheduler = new OrderScheduler(botService);
    scheduler.start();

    console.log('✅ Bot is running...');
    console.log('Press Ctrl+C to stop');

  } catch (error) {
    // Nếu có lỗi trong quá trình khởi động, in ra lỗi và thoát ứng dụng
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

/**
 * XỬ LÝ THOÁT ỨNG DỤNG MỘT CÁCH AN TOÀN (Graceful Shutdown)
 * 
 * SIGINT: Signal được gửi khi người dùng nhấn Ctrl+C
 * SIGTERM: Signal được gửi khi hệ thống muốn dừng process (ví dụ từ PM2, Docker)
 * 
 * Mục đích: Đảm bảo ứng dụng đóng các kết nối (database, bot) một cách 
 * an toàn trước khi thoát, tránh mất dữ liệu hoặc treo kết nối
 */
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down bot...');
  process.exit(0);
});

// Khởi động ứng dụng
main();
