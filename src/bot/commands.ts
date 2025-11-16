/**
 * ====================================
 * BOT COMMANDS - XỬ LÝ CÁC LỆNH TỪ NGƯỜI DÙNG
 * ====================================
 * 
 * File này chứa các handler (hàm xử lý) cho các lệnh mà người dùng gửi cho bot.
 * Mỗi lệnh bắt đầu bằng dấu "/" (ví dụ: /start, /help, /addorder)
 * 
 * CÁCH HOẠT ĐỘNG:
 * 1. Người dùng gửi lệnh (ví dụ: /start)
 * 2. Telegram gửi message đến bot
 * 3. Bot router nhận diện lệnh và gọi handler tương ứng
 * 4. Handler xử lý logic và gửi phản hồi cho người dùng
 * 
 * PATTERN DESIGN: 
 * - Sử dụng Higher-Order Function: Mỗi handler là function trả về function
 * - Lý do: Để inject bot instance vào handler mà không cần global variable
 */

import TelegramBot from 'node-telegram-bot-api';
import { User } from '../models/User';
import { Order } from '../models/Order';

/**
 * LỆNH /start - Khởi động bot và đăng ký người dùng
 * 
 * Đây là lệnh đầu tiên người dùng gọi khi bắt đầu chat với bot.
 * 
 * LOGIC XỬ LÝ:
 * 1. Lấy thông tin người dùng từ message (chat ID, username, tên)
 * 2. Lưu/cập nhật vào database bằng upsert (tạo mới hoặc cập nhật)
 * 3. Gửi tin nhắn chào mừng và hướng dẫn cơ bản
 * 
 * TẠI SAO DÙNG upsert?
 * - User mới: Tự động tạo record mới
 * - User cũ: Cập nhật lastActive để theo dõi hoạt động
 */
export const handleStart = (bot: TelegramBot) => async (msg: TelegramBot.Message): Promise<void> => {
  // Lấy chat ID (ID duy nhất của conversation)
  const chatId = msg.chat.id;
  // Lấy username, fallback thành "User" nếu không có
  const username = msg.from?.username || 'User';

  // Lưu/cập nhật thông tin user vào database
  try {
    await User.findOneAndUpdate(
      { telegramId: chatId },  // Điều kiện tìm kiếm
      { 
        // Dữ liệu cần cập nhật/tạo mới
        telegramId: chatId,
        username: username,
        firstName: msg.from?.first_name,
        lastName: msg.from?.last_name,
        lastActive: new Date()  // Cập nhật thời gian active
      },
      { 
        upsert: true,  // Tạo mới nếu chưa tồn tại
        new: true      // Trả về document sau khi update
      }
    );
  } catch (error) {
    // Log lỗi nhưng vẫn tiếp tục (không muốn user thấy lỗi lúc start)
    console.error('Error saving user:', error);
  }

  // Tin nhắn chào mừng với danh sách lệnh cơ bản
  const welcomeMessage = `
🎉 Chào mừng bạn đến với Order Tracking Bot! 🎉

Bot này giúp bạn theo dõi trạng thái đơn hàng từ Lazada và Shopee.

📋 Các lệnh có sẵn:
/addorder - Thêm đơn hàng cần theo dõi
/orders - Xem danh sách đơn hàng
/deleteorder - Xóa đơn hàng khỏi danh sách
/help - Xem hướng dẫn chi tiết

🔔 Bot sẽ tự động thông báo khi đơn hàng của bạn có cập nhật!
  `;

  // Gửi tin nhắn chào mừng
  await bot.sendMessage(chatId, welcomeMessage);
};

export const handleHelp = (bot: TelegramBot) => async (msg: TelegramBot.Message): Promise<void> => {
  const chatId = msg.chat.id;

  const helpMessage = `
📖 HƯỚNG DẪN SỬ DỤNG

1️⃣ THÊM ĐƠN HÀNG:
   /addorder
   Sau đó chọn sàn (Lazada/Shopee) và nhập mã đơn hàng

2️⃣ XEM DANH SÁCH ĐƠN HÀNG:
   /orders
   Xem tất cả đơn hàng đang theo dõi

3️⃣ XÓA ĐƠN HÀNG:
   /deleteorder
   Chọn đơn hàng muốn xóa khỏi danh sách

📌 LƯU Ý:
• Bot kiểm tra đơn hàng tự động mỗi 30 phút
• Bạn sẽ nhận thông báo khi có cập nhật
• Cần có API key từ Lazada và Shopee để kết nối

🔑 CẤU HÌNH API:
Để sử dụng đầy đủ tính năng, bạn cần:
• Lazada: App Key và App Secret
• Shopee: Partner ID và Partner Key

Liên hệ admin để được hỗ trợ cấu hình!
  `;

  await bot.sendMessage(chatId, helpMessage);
};

export const handleAddOrder = (bot: TelegramBot) => async (msg: TelegramBot.Message): Promise<void> => {
  const chatId = msg.chat.id;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🛒 Lazada', callback_data: 'platform_lazada' },
        { text: '🛍️ Shopee', callback_data: 'platform_shopee' }
      ]
    ]
  };

  await bot.sendMessage(
    chatId,
    '📦 Chọn sàn thương mại điện tử:',
    { reply_markup: keyboard }
  );
};

export const handleListOrders = (bot: TelegramBot) => async (msg: TelegramBot.Message): Promise<void> => {
  const chatId = msg.chat.id;

  try {
    const orders = await Order.find({ userId: chatId }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      await bot.sendMessage(chatId, '📭 Bạn chưa có đơn hàng nào được theo dõi.\n\nSử dụng /addorder để thêm đơn hàng!');
      return;
    }

    let message = '📦 DANH SÁCH ĐƠN HÀNG:\n\n';

    orders.forEach((order, index) => {
      const platformEmoji = order.platform === 'lazada' ? '🛒' : '🛍️';
      const statusEmoji = getStatusEmoji(order.status);
      
      message += `${index + 1}. ${platformEmoji} ${order.platform.toUpperCase()}\n`;
      message += `   📋 Mã: ${order.orderId}\n`;
      message += `   ${statusEmoji} Trạng thái: ${order.status}\n`;
      message += `   📅 Cập nhật: ${order.lastUpdated.toLocaleString('vi-VN')}\n\n`;
    });

    await bot.sendMessage(chatId, message);
  } catch (error) {
    console.error('Error fetching orders:', error);
    await bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi lấy danh sách đơn hàng.');
  }
};

export const handleDeleteOrder = (bot: TelegramBot) => async (msg: TelegramBot.Message): Promise<void> => {
  const chatId = msg.chat.id;

  try {
    const orders = await Order.find({ userId: chatId });

    if (orders.length === 0) {
      await bot.sendMessage(chatId, '📭 Bạn chưa có đơn hàng nào để xóa.');
      return;
    }

    const keyboard = {
      inline_keyboard: orders.map(order => [{
        text: `${order.platform === 'lazada' ? '🛒' : '🛍️'} ${order.orderId}`,
        callback_data: `delete_${order._id}`
      }])
    };

    await bot.sendMessage(
      chatId,
      '🗑️ Chọn đơn hàng muốn xóa:',
      { reply_markup: keyboard }
    );
  } catch (error) {
    console.error('Error fetching orders:', error);
    await bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi lấy danh sách đơn hàng.');
  }
};

function getStatusEmoji(status: string): string {
  const statusMap: { [key: string]: string } = {
    'pending': '⏳',
    'processing': '📦',
    'shipped': '🚚',
    'delivered': '✅',
    'cancelled': '❌',
    'returned': '↩️'
  };
  return statusMap[status.toLowerCase()] || '📋';
}
