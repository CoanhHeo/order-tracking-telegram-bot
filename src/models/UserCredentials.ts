/**
 * ====================================
 * MODEL USER CREDENTIALS - QUẢN LÝ THÔNG TIN XÁC THỰC API
 * ====================================
 * 
 * Model này lưu trữ các credentials (thông tin xác thực) của người dùng
 * để có thể gọi API Lazada/Shopee thay mặt họ.
 * 
 * TẠI SAO CẦN MODEL NÀY?
 * Để lấy thông tin đơn hàng từ Lazada/Shopee, ta cần:
 * - Access Token: Token xác thực để gọi API (giống như "chìa khóa truy cập")
 * - Refresh Token: Dùng để lấy Access Token mới khi token cũ hết hạn
 * - Shop ID (Shopee): ID của shop, cần thiết cho các API call của Shopee
 * 
 * BẢO MẬT:
 * - Credentials rất nhạy cảm, cần mã hóa khi lưu trong production
 * - Access Token có thời hạn (expires), cần refresh định kỳ
 * - Mỗi user có một bộ credentials riêng cho mỗi platform
 * 
 * OAUTH FLOW:
 * 1. User authorize cho app → Nhận authorization code
 * 2. Đổi code lấy Access Token & Refresh Token
 * 3. Lưu vào UserCredentials
 * 4. Khi token hết hạn → Dùng Refresh Token để lấy token mới
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface IUserCredentials định nghĩa cấu trúc dữ liệu
 */
export interface IUserCredentials extends Document {
  userId: number;              // ID của user (liên kết với User model)
  platform: 'lazada' | 'shopee'; // Sàn TMĐT
  accessToken: string;         // Token để gọi API (có thời hạn)
  refreshToken?: string;       // Token để refresh access token
  shopId?: number;             // Shop ID (chỉ dành cho Shopee)
  expiresAt?: Date;            // Thời điểm Access Token hết hạn
  createdAt: Date;             // Ngày tạo credentials
  updatedAt: Date;             // Ngày cập nhật credentials lần cuối
}

/**
 * Schema định nghĩa cấu trúc và ràng buộc dữ liệu
 */
const UserCredentialsSchema = new Schema<IUserCredentials>({
  // User ID: Liên kết với User model
  // - index: Để tìm kiếm credentials của một user nhanh chóng
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  
  // Platform: Lazada hoặc Shopee
  // Mỗi user có thể có credentials cho cả 2 platform
  platform: {
    type: String,
    required: true,
    enum: ['lazada', 'shopee'],
  },
  
  // Access Token: Token xác thực để gọi API
  // - BẮT BUỘC phải có để gọi API
  // - Có thời hạn (thường 30 ngày - 1 năm tùy platform)
  // - Cần REFRESH khi hết hạn
  accessToken: {
    type: String,
    required: true,
  },
  
  // Refresh Token: Dùng để lấy Access Token mới
  // - Optional vì một số flow không có refresh token
  // - Thời hạn dài hơn access token (thường vài tháng - 1 năm)
  refreshToken: {
    type: String,
  },
  
  // Shop ID: ID của shop trên Shopee
  // - CHỈ cần cho Shopee API
  // - Lazada không cần trường này
  // - Dùng để xác định shop nào khi seller có nhiều shop
  shopId: {
    type: Number,
  },
  
  // Expires At: Thời điểm Access Token hết hạn
  // - Dùng để kiểm tra xem có cần refresh token không
  // - Nếu expiresAt < Date.now() → Cần refresh
  expiresAt: {
    type: Date,
  },
  
  // Created At: Ngày user authorize lần đầu
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  // Updated At: Ngày cập nhật credentials (ví dụ sau khi refresh token)
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

/**
 * COMPOUND INDEX (Index kết hợp)
 * 
 * Index cho userId + platform với unique: true
 * - Đảm bảo mỗi user chỉ có 1 bộ credentials cho mỗi platform
 * - User A có thể có 1 credentials Lazada và 1 credentials Shopee
 * - User A KHÔNG thể có 2 credentials Lazada khác nhau
 * 
 * TẠI SAO CẦN UNIQUE?
 * - Tránh lưu trùng credentials
 * - Dễ dàng tìm và update credentials: findOne({userId, platform})
 */
UserCredentialsSchema.index({ userId: 1, platform: 1 }, { unique: true });

/**
 * Export model UserCredentials để sử dụng trong các file khác
 * 
 * LƯU Ý BẢO MẬT:
 * Trong production, nên:
 * - Mã hóa accessToken và refreshToken trước khi lưu
 * - Sử dụng environment variables cho encryption key
 * - Không log credentials ra console
 * - Giới hạn quyền truy cập collection này trong MongoDB
 */
export const UserCredentials = mongoose.model<IUserCredentials>('UserCredentials', UserCredentialsSchema);
