/**
 * ====================================
 * MODEL ORDER - QUẢN LÝ ĐỌN HÀNG
 * ====================================
 * 
 * Model này lưu trữ thông tin về các đơn hàng mà người dùng muốn theo dõi.
 * Mỗi đơn hàng được liên kết với một người dùng (userId) và một sàn (platform).
 * 
 * TẠI SAO CẦN MODEL NÀY?
 * - Lưu trữ danh sách đơn hàng mà user đang theo dõi
 * - Lưu trạng thái hiện tại của đơn hàng để so sánh khi có cập nhật
 * - Lưu thông tin chi tiết (sản phẩm, vận chuyển) để hiển thị cho user
 * - Tránh gửi thông báo trùng lặp bằng cách tracking notificationSent
 * 
 * LUỒNG HOẠT ĐỘNG:
 * 1. User thêm đơn hàng qua bot → Tạo record Order mới
 * 2. Scheduler kiểm tra định kỳ → Lấy thông tin từ API → So sánh status
 * 3. Nếu status thay đổi → Cập nhật Order → Gửi thông báo cho user
 */

import mongoose, { Document, Schema } from 'mongoose';

/**
 * Interface IOrder định nghĩa cấu trúc dữ liệu TypeScript cho Order
 */
export interface IOrder extends Document {
  userId: number;              // ID của user sở hữu đơn hàng (liên kết với User model)
  orderId: string;             // Mã đơn hàng từ Lazada/Shopee
  platform: 'lazada' | 'shopee'; // Sàn thương mại điện tử
  status: string;              // Trạng thái: pending, processing, shipped, delivered, cancelled
  orderNumber?: string;        // Mã đơn hàng hiển thị (có thể khác với orderId)
  items?: Array<{              // Danh sách sản phẩm trong đơn hàng
    name: string;              // Tên sản phẩm
    sku: string;               // Mã SKU
    quantity: number;          // Số lượng
    price: number;             // Giá
  }>;
  shippingInfo?: {             // Thông tin vận chuyển
    trackingNumber?: string;   // Mã vận đơn
    carrier?: string;          // Đơn vị vận chuyển (GHTK, GHN, v.v.)
  };
  lastUpdated: Date;           // Lần cuối cập nhật trạng thái
  createdAt: Date;             // Ngày thêm đơn hàng vào hệ thống
  notificationSent: boolean;   // Đã gửi thông báo cho user chưa (tránh spam)
}

/**
 * Schema định nghĩa cấu trúc và ràng buộc dữ liệu cho Order
 */
const OrderSchema = new Schema<IOrder>({
  // User ID: Liên kết với User model
  // - index: Tạo index để tìm kiếm nhanh tất cả đơn hàng của một user
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  
  // Order ID: Mã đơn hàng từ sàn TMĐT
  // Đây là ID nội bộ của Lazada/Shopee
  orderId: {
    type: String,
    required: true,
  },
  
  // Platform: Sàn thương mại điện tử
  // - enum: Chỉ chấp nhận 'lazada' hoặc 'shopee', giá trị khác sẽ bị reject
  platform: {
    type: String,
    required: true,
    enum: ['lazada', 'shopee'],
  },
  
  // Status: Trạng thái đơn hàng
  // Được cập nhật mỗi khi scheduler kiểm tra
  // Khi status thay đổi → gửi thông báo cho user
  status: {
    type: String,
    required: true,
    default: 'pending',
  },
  
  // Order Number: Mã đơn hàng hiển thị cho khách (có thể khác orderId)
  orderNumber: {
    type: String,
  },
  
  // Items: Danh sách sản phẩm trong đơn hàng
  // Array of objects, mỗi object chứa thông tin 1 sản phẩm
  items: [{
    name: String,
    sku: String,
    quantity: Number,
    price: Number,
  }],
  
  // Shipping Info: Thông tin vận chuyển
  // Nested object chứa mã vận đơn và đơn vị vận chuyển
  shippingInfo: {
    trackingNumber: String,
    carrier: String,
  },
  
  // Last Updated: Lần cuối cập nhật trạng thái
  // Được set mỗi khi scheduler kiểm tra và thấy có thay đổi
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  
  // Created At: Ngày user thêm đơn hàng vào hệ thống
  createdAt: {
    type: Date,
    default: Date.now,
  },
  
  // Notification Sent: Flag đánh dấu đã gửi thông báo chưa
  // Dùng để tránh gửi thông báo trùng lặp cho cùng một thay đổi
  notificationSent: {
    type: Boolean,
    default: false,
  },
});

/**
 * COMPOUND INDEX (Index kết hợp)
 * 
 * Tạo index cho 3 trường: userId + orderId + platform
 * - unique: true → Đảm bảo không có đơn hàng trùng lặp
 * - Một user không thể thêm cùng 1 đơn hàng từ cùng 1 sàn 2 lần
 * 
 * VÍ DỤ:
 * User A có thể thêm đơn hàng "123" từ Lazada
 * User A KHÔNG thể thêm lại đơn hàng "123" từ Lazada (trùng)
 * User A CÓ THỂ thêm đơn hàng "123" từ Shopee (khác platform)
 * User B CÓ THỂ thêm đơn hàng "123" từ Lazada (khác user)
 */
OrderSchema.index({ userId: 1, orderId: 1, platform: 1 }, { unique: true });

/**
 * Export model Order để sử dụng trong các file khác
 */
export const Order = mongoose.model<IOrder>('Order', OrderSchema);
