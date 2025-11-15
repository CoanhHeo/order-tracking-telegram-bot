import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';

export interface ShopeeOrderInfo {
  orderId: string;
  status: string;
  orderNumber: string;
  createdAt: Date;
  updatedAt: Date;
  items?: Array<{
    name: string;
    sku: string;
    quantity: number;
    price: number;
  }>;
  shippingInfo?: {
    trackingNumber?: string;
    carrier?: string;
  };
}

export class ShopeeService {
  private partnerId: number;
  private partnerKey: string;
  private apiUrl: string;

  constructor() {
    this.partnerId = config.shopee.partnerId;
    this.partnerKey = config.shopee.partnerKey;
    this.apiUrl = config.shopee.apiUrl;
  }

  /**
   * Generate signature for Shopee API request
   */
  private generateSignature(apiPath: string, timestamp: number, accessToken: string, shopId: number): string {
    const baseString = `${this.partnerId}${apiPath}${timestamp}${accessToken}${shopId}`;
    return crypto
      .createHmac('sha256', this.partnerKey)
      .update(baseString)
      .digest('hex');
  }

  /**
   * Generate common parameters for Shopee API
   */
  private getCommonParams(apiPath: string, accessToken: string, shopId: number) {
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = this.generateSignature(apiPath, timestamp, accessToken, shopId);

    return {
      partner_id: this.partnerId,
      timestamp,
      access_token: accessToken,
      shop_id: shopId,
      sign,
    };
  }

  /**
   * Get order details from Shopee
   */
  async getOrderDetails(
    orderSn: string,
    accessToken: string,
    shopId: number
  ): Promise<ShopeeOrderInfo | null> {
    try {
      const apiPath = '/api/v2/order/get_order_detail';
      const params = this.getCommonParams(apiPath, accessToken, shopId);

      const response = await axios.get(`${this.apiUrl}${apiPath}`, {
        params: {
          ...params,
          order_sn_list: orderSn,
          response_optional_fields: 'buyer_user_id,buyer_username,item_list,recipient_address',
        },
      });

      if (response.data && !response.data.error) {
        const orderData = response.data.response?.order_list?.[0];
        if (orderData) {
          return this.parseOrderResponse(orderData);
        }
      }

      return null;
    } catch (error) {
      console.error('Error fetching Shopee order:', error);
      return null;
    }
  }

  /**
   * Get multiple orders from Shopee
   */
  async getOrders(
    accessToken: string,
    shopId: number,
    timeFrom?: Date,
    timeTo?: Date
  ): Promise<ShopeeOrderInfo[]> {
    try {
      const apiPath = '/api/v2/order/get_order_list';
      const params = this.getCommonParams(apiPath, accessToken, shopId);

      const timeRange = {
        time_from: timeFrom ? Math.floor(timeFrom.getTime() / 1000) : Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
        time_to: timeTo ? Math.floor(timeTo.getTime() / 1000) : Math.floor(Date.now() / 1000),
      };

      const response = await axios.get(`${this.apiUrl}${apiPath}`, {
        params: {
          ...params,
          ...timeRange,
          page_size: 100,
          time_range_field: 'update_time',
        },
      });

      if (response.data && !response.data.error) {
        const orderSnList = response.data.response?.order_list || [];
        
        // Get detailed info for each order
        const orders: ShopeeOrderInfo[] = [];
        for (const orderItem of orderSnList) {
          const orderDetail = await this.getOrderDetails(orderItem.order_sn, accessToken, shopId);
          if (orderDetail) {
            orders.push(orderDetail);
          }
        }

        return orders;
      }

      return [];
    } catch (error) {
      console.error('Error fetching Shopee orders:', error);
      return [];
    }
  }

  /**
   * Parse order response from Shopee API
   */
  private parseOrderResponse(orderData: any): ShopeeOrderInfo {
    return {
      orderId: orderData.order_sn || '',
      status: this.mapOrderStatus(orderData.order_status),
      orderNumber: orderData.order_sn || '',
      createdAt: new Date(orderData.create_time * 1000),
      updatedAt: new Date(orderData.update_time * 1000),
      items: orderData.item_list?.map((item: any) => ({
        name: item.item_name,
        sku: item.item_sku,
        quantity: item.model_quantity_purchased,
        price: item.model_discounted_price,
      })),
      shippingInfo: {
        trackingNumber: orderData.tracking_no,
        carrier: orderData.shipping_carrier,
      },
    };
  }

  /**
   * Map Shopee status to standardized status
   */
  private mapOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'UNPAID': 'pending',
      'READY_TO_SHIP': 'processing',
      'PROCESSED': 'processing',
      'SHIPPED': 'shipped',
      'TO_CONFIRM_RECEIVE': 'shipped',
      'IN_CANCEL': 'cancelled',
      'CANCELLED': 'cancelled',
      'TO_RETURN': 'returned',
      'COMPLETED': 'delivered',
    };

    return statusMap[status.toUpperCase()] || 'pending';
  }

  /**
   * Check if API credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.partnerId && this.partnerKey);
  }
}
