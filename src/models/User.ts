/**
 * ====================================
 * MODEL USER - QUẢN LÝ THÔNG TIN NGƯỜI DÙNG
 * ====================================
 * 
 * Model này định nghĩa cấu trúc dữ liệu của người dùng trong hệ thống.
 * Mỗi người dùng được định danh duy nhất bởi Telegram ID.
 * 
 * TẠI SAO CẦN MODEL NÀY?
 * - Lưu trữ thông tin cơ bản của người dùng từ Telegram
 * - Theo dõi lần cuối người dùng tương tác với bot
 * - Làm reference (khóa ngoại) cho các model khác như Order
 * 
 * MONGOOSE ODM:
 * Mongoose giúp định nghĩa schema và validate dữ liệu trước khi lưu vào MongoDB
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface IUser định nghĩa kiểu dữ liệu TypeScript cho User
 * 
 * Document: Interface của Mongoose, chứa các method như save(), remove()
 * Extends Document để có đầy đủ tính năng của Mongoose model
 */
export interface IUser extends Document {
  telegramId: number;      // ID duy nhất từ Telegram
  username?: string;       // Username Telegram (@username) - có thể null
  firstName?: string;      // Tên của người dùng trên Telegram
  lastName?: string;       // Họ của người dùng trên Telegram
  createdAt: Date;         // Ngày tạo tài khoản
  lastActive: Date;        // Lần cuối tương tác với bot
}

/**
 * Schema định nghĩa cấu trúc và ràng buộc dữ liệu trong MongoDB
 * 
 * GIẢI THÍCH CÁC TRƯỜNG:
 */
const UserSchema = new Schema<IUser>({
  // Telegram ID: ID duy nhất của mỗi user trên Telegram
  // - required: Bắt buộc phải có (không được null/undefined)
  // - unique: Không được trùng lặp, đảm bảo mỗi user chỉ có 1 record
  // - index: Tạo index để tìm kiếm nhanh hơn
  telegramId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  
  // Username: @username trên Telegram (optional vì không phải ai cũng có)
  username: {
    type: String,
  },
  
  // First Name: Tên hiển thị trên Telegram (optional)
  firstName: {
    type: String,
  },
  
  // Last Name: Họ hiển thị trên Telegram (optional)
  lastName: {
    type: String,
  },
  
  // Created At: Thời điểm user đăng ký/tương tác lần đầu
  // default: Tự động set thành thời gian hiện tại nếu không được cung cấp
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  // Last Active: Thời điểm user tương tác gần nhất với bot
  // Dùng để biết user nào còn active, user nào đã không dùng nữa
  lastActive: {
    type: Date,
    default: Date.now,
  },
});

/**
 * Export model User để sử dụng trong các file khác
 * 
 * CÁCH SỬ DỤNG:
 * - User.create({...}) : Tạo user mới
 * - User.findOne({telegramId: 123}) : Tìm user theo ID
 * - User.updateOne({...}) : Cập nhật user
 * - User.deleteOne({...}) : Xóa user
 */
export const User = mongoose.model<IUser>('User', UserSchema);
