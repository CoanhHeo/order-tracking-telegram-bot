import TelegramBot from 'node-telegram-bot-api';
import { Order } from '../models/Order';

// Store user sessions for multi-step conversations
const userSessions = new Map<number, { platform: string; step: string }>();

export const handleCallbackQuery = (bot: TelegramBot) => async (query: TelegramBot.CallbackQuery): Promise<void> => {
  const chatId = query.message?.chat.id;
  const data = query.data;

  if (!chatId || !data) return;

  try {
    // Platform selection
    if (data.startsWith('platform_')) {
      const platform = data.replace('platform_', '');
      userSessions.set(chatId, { platform, step: 'waiting_order_id' });

      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(
        chatId,
        `📝 Nhập mã đơn hàng ${platform === 'lazada' ? 'Lazada' : 'Shopee'}:`
      );

      // Set up one-time message listener for order ID
      const orderIdListener = async (msg: TelegramBot.Message) => {
        if (msg.chat.id !== chatId) return;

        const session = userSessions.get(chatId);
        if (!session || session.step !== 'waiting_order_id') return;

        const orderId = msg.text?.trim();
        if (!orderId) {
          await bot.sendMessage(chatId, '❌ Mã đơn hàng không hợp lệ. Vui lòng thử lại với /addorder');
          userSessions.delete(chatId);
          bot.removeListener('message', orderIdListener);
          return;
        }

        // Save order to database
        try {
          const existingOrder = await Order.findOne({ userId: chatId, orderId, platform: session.platform });
          
          if (existingOrder) {
            await bot.sendMessage(chatId, '⚠️ Đơn hàng này đã được thêm trước đó!');
          } else {
            await Order.create({
              userId: chatId,
              orderId,
              platform: session.platform,
              status: 'pending',
              lastUpdated: new Date(),
              createdAt: new Date()
            });

            await bot.sendMessage(
              chatId,
              `✅ Đã thêm đơn hàng thành công!\n\n📦 Mã: ${orderId}\n🛒 Sàn: ${session.platform.toUpperCase()}\n\n🔔 Bot sẽ tự động thông báo khi có cập nhật.`
            );
          }
        } catch (error) {
          console.error('Error saving order:', error);
          await bot.sendMessage(chatId, '❌ Có lỗi xảy ra khi lưu đơn hàng. Vui lòng thử lại sau.');
        }

        userSessions.delete(chatId);
        bot.removeListener('message', orderIdListener);
      };

      bot.on('message', orderIdListener);

      // Cleanup session after 5 minutes
      setTimeout(() => {
        if (userSessions.has(chatId)) {
          userSessions.delete(chatId);
          bot.removeListener('message', orderIdListener);
        }
      }, 5 * 60 * 1000);
    }

    // Delete order
    if (data.startsWith('delete_')) {
      const orderId = data.replace('delete_', '');

      try {
        const result = await Order.findByIdAndDelete(orderId);

        if (result) {
          await bot.answerCallbackQuery(query.id, { text: 'Đã xóa đơn hàng!' });
          await bot.sendMessage(chatId, `✅ Đã xóa đơn hàng ${result.orderId} khỏi danh sách.`);
        } else {
          await bot.answerCallbackQuery(query.id, { text: 'Không tìm thấy đơn hàng!' });
        }
      } catch (error) {
        console.error('Error deleting order:', error);
        await bot.answerCallbackQuery(query.id, { text: 'Có lỗi xảy ra!' });
      }
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    await bot.answerCallbackQuery(query.id, { text: 'Có lỗi xảy ra!' });
  }
};
