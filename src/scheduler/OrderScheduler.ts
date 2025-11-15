import cron from 'node-cron';
import { Order } from '../models/Order';
import { UserCredentials } from '../models/UserCredentials';
import { LazadaService } from '../services/LazadaService';
import { ShopeeService } from '../services/ShopeeService';
import { TelegramBotService } from '../bot';
import { config } from '../config';

export class OrderScheduler {
  private botService: TelegramBotService;
  private lazadaService: LazadaService;
  private shopeeService: ShopeeService;

  constructor(botService: TelegramBotService) {
    this.botService = botService;
    this.lazadaService = new LazadaService();
    this.shopeeService = new ShopeeService();
  }

  /**
   * Start the scheduler
   */
  start(): void {
    // Schedule order checking based on config
    cron.schedule(config.scheduler.checkOrdersSchedule, async () => {
      console.log('🔄 Running order check...');
      await this.checkAllOrders();
    });

    console.log('✅ Order scheduler started');
    console.log(`⏰ Schedule: ${config.scheduler.checkOrdersSchedule}`);
  }

  /**
   * Check all orders and send notifications for status changes
   */
  private async checkAllOrders(): Promise<void> {
    try {
      const orders = await Order.find({ status: { $nin: ['delivered', 'cancelled'] } });

      console.log(`📦 Checking ${orders.length} orders...`);

      for (const order of orders) {
        try {
          await this.checkOrder(order);
        } catch (error) {
          console.error(`Error checking order ${order.orderId}:`, error);
        }
      }

      console.log('✅ Order check completed');
    } catch (error) {
      console.error('Error in checkAllOrders:', error);
    }
  }

  /**
   * Check a single order
   */
  private async checkOrder(order: any): Promise<void> {
    try {
      // Get user credentials
      const credentials = await UserCredentials.findOne({
        userId: order.userId,
        platform: order.platform,
      });

      if (!credentials) {
        console.log(`⚠️ No credentials found for user ${order.userId} on ${order.platform}`);
        return;
      }

      let orderInfo = null;

      // Fetch order info based on platform
      if (order.platform === 'lazada') {
        if (!this.lazadaService.isConfigured()) {
          console.log('⚠️ Lazada service not configured');
          return;
        }
        orderInfo = await this.lazadaService.getOrderDetails(order.orderId, credentials.accessToken);
      } else if (order.platform === 'shopee') {
        if (!this.shopeeService.isConfigured()) {
          console.log('⚠️ Shopee service not configured');
          return;
        }
        if (!credentials.shopId) {
          console.log(`⚠️ No shop ID found for user ${order.userId}`);
          return;
        }
        orderInfo = await this.shopeeService.getOrderDetails(
          order.orderId,
          credentials.accessToken,
          credentials.shopId
        );
      }

      if (!orderInfo) {
        console.log(`⚠️ Could not fetch order info for ${order.orderId}`);
        return;
      }

      // Check if status has changed
      if (orderInfo.status !== order.status) {
        const oldStatus = order.status;
        
        // Update order in database
        order.status = orderInfo.status;
        order.lastUpdated = new Date();
        order.items = orderInfo.items;
        order.shippingInfo = orderInfo.shippingInfo;
        await order.save();

        // Send notification
        await this.sendStatusNotification(order.userId, order, oldStatus, orderInfo.status);
      }
    } catch (error) {
      console.error(`Error checking order ${order.orderId}:`, error);
    }
  }

  /**
   * Send status change notification to user
   */
  private async sendStatusNotification(
    userId: number,
    order: any,
    oldStatus: string,
    newStatus: string
  ): Promise<void> {
    const platformEmoji = order.platform === 'lazada' ? '🛒' : '🛍️';
    const statusEmoji = this.getStatusEmoji(newStatus);

    let message = `${platformEmoji} CẬP NHẬT ĐƠN HÀNG\n\n`;
    message += `📋 Mã đơn: ${order.orderId}\n`;
    message += `🏪 Sàn: ${order.platform.toUpperCase()}\n\n`;
    message += `📊 Trạng thái cũ: ${this.getStatusText(oldStatus)}\n`;
    message += `${statusEmoji} Trạng thái mới: ${this.getStatusText(newStatus)}\n\n`;

    if (order.shippingInfo?.trackingNumber) {
      message += `🚚 Mã vận đơn: ${order.shippingInfo.trackingNumber}\n`;
    }

    if (order.shippingInfo?.carrier) {
      message += `📦 Đơn vị vận chuyển: ${order.shippingInfo.carrier}\n`;
    }

    message += `\n⏰ ${new Date().toLocaleString('vi-VN')}`;

    await this.botService.sendMessage(userId, message);
  }

  /**
   * Get emoji for order status
   */
  private getStatusEmoji(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': '⏳',
      'processing': '📦',
      'shipped': '🚚',
      'delivered': '✅',
      'cancelled': '❌',
      'returned': '↩️',
    };
    return statusMap[status.toLowerCase()] || '📋';
  }

  /**
   * Get Vietnamese text for order status
   */
  private getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang xử lý',
      'shipped': 'Đang giao hàng',
      'delivered': 'Đã giao hàng',
      'cancelled': 'Đã hủy',
      'returned': 'Đã trả hàng',
    };
    return statusMap[status.toLowerCase()] || status;
  }
}
