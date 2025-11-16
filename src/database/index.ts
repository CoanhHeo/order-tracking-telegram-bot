/**
 * ====================================
 * KẾT NỐI MONGODB DATABASE
 * ====================================
 * 
 * File này xử lý việc kết nối đến MongoDB database.
 * 
 * TẠI SAO CẦN MONGODB?
 * MongoDB là NoSQL database, rất phù hợp cho dự án này vì:
 * - Lưu trữ dữ liệu dạng document (JSON-like), linh hoạt với cấu trúc dữ liệu
 * - Dễ mở rộng và thay đổi schema khi cần
 * - Hiệu suất tốt cho việc đọc/ghi dữ liệu thường xuyên
 * - Mongoose ODM giúp dễ dàng làm việc với MongoDB từ Node.js
 * 
 * DỮ LIỆU LƯU TRỮ:
 * - Thông tin người dùng (User)
 * - Danh sách đơn hàng đang theo dõi (Order)
 * - Credentials API của người dùng (UserCredentials)
 */

import mongoose from 'mongoose';
import { config } from '../config';

/**
 * Hàm kết nối đến MongoDB
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Sử dụng mongoose.connect() để kết nối đến MongoDB URI
 * 2. Nếu kết nối thành công, in ra thông báo
 * 3. Nếu thất bại, in lỗi và thoát ứng dụng (vì không thể hoạt động mà không có database)
 * 
 * @returns Promise<void>
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    // Kết nối đến MongoDB sử dụng URI từ config
    // Mongoose sẽ tự động quản lý connection pool
    await mongoose.connect(config.mongodb.uri);
    console.log('✅ Connected to MongoDB successfully');
  } catch (error) {
    // Nếu không kết nối được, in lỗi và thoát ứng dụng
    // Ứng dụng không thể hoạt động mà không có database
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

/**
 * XỬ LÝ SỰ KIỆN MẤT KẾT NỐI
 * 
 * Lắng nghe sự kiện 'disconnected' để biết khi nào mất kết nối với MongoDB
 * Điều này có thể xảy ra do:
 * - MongoDB server bị tắt
 * - Mất kết nối mạng
 * - Timeout
 */
mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

/**
 * XỬ LÝ LỖI KẾT NỐI
 * 
 * Lắng nghe các lỗi xảy ra trong quá trình sử dụng kết nối
 * Ví dụ: query timeout, authentication error, v.v.
 */
mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB error:', error);
});
