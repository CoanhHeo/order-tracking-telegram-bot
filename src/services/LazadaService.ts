import axios from 'axios';
import crypto from 'crypto';
import { config } from '../config';

export interface LazadaOrderInfo {
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

export class LazadaService {
  private appKey: string;
  private appSecret: string;
  private apiUrl: string;

  constructor() {
    this.appKey = config.lazada.appKey;
    this.appSecret = config.lazada.appSecret;
    this.apiUrl = config.lazada.apiUrl;
  }

  /**
   * Generate signature for Lazada API request
   */
  private generateSignature(apiPath: string, params: Record<string, string>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}${params[key]}`)
      .join('');

    const signString = `${apiPath}${sortedParams}`;
    return crypto
      .createHmac('sha256', this.appSecret)
      .update(signString)
      .digest('hex')
      .toUpperCase();
  }

  /**
   * Get order details from Lazada
   */
  async getOrderDetails(orderId: string, accessToken: string): Promise<LazadaOrderInfo | null> {
    try {
      const apiPath = '/order/get';
      const timestamp = Date.now().toString();

      const params: Record<string, string> = {
        app_key: this.appKey,
        timestamp,
        sign_method: 'sha256',
        access_token: accessToken,
        order_id: orderId,
      };

      const signature = this.generateSignature(apiPath, params);
      params.sign = signature;

      const response = await axios.get(`${this.apiUrl}${apiPath}`, { params });

      if (response.data && response.data.code === '0') {
        const orderData = response.data.data;
        return this.parseOrderResponse(orderData);
      }

      return null;
    } catch (error) {
      console.error('Error fetching Lazada order:', error);
      return null;
    }
  }

  /**
   * Get multiple orders
   */
  async getOrders(accessToken: string, createdAfter?: Date): Promise<LazadaOrderInfo[]> {
    try {
      const apiPath = '/orders/get';
      const timestamp = Date.now().toString();

      const params: Record<string, string> = {
        app_key: this.appKey,
        timestamp,
        sign_method: 'sha256',
        access_token: accessToken,
        created_after: createdAfter 
          ? createdAfter.toISOString() 
          : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
      };

      const signature = this.generateSignature(apiPath, params);
      params.sign = signature;

      const response = await axios.get(`${this.apiUrl}${apiPath}`, { params });

      if (response.data && response.data.code === '0') {
        const orders = response.data.data.orders || [];
        return orders.map((order: any) => this.parseOrderResponse(order));
      }

      return [];
    } catch (error) {
      console.error('Error fetching Lazada orders:', error);
      return [];
    }
  }

  /**
   * Parse order response from Lazada API
   */
  private parseOrderResponse(orderData: any): LazadaOrderInfo {
    return {
      orderId: orderData.order_id?.toString() || '',
      status: this.mapOrderStatus(orderData.status),
      orderNumber: orderData.order_number || orderData.order_id?.toString() || '',
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at),
      items: orderData.items?.map((item: any) => ({
        name: item.name,
        sku: item.sku,
        quantity: item.quantity,
        price: item.paid_price,
      })),
      shippingInfo: {
        trackingNumber: orderData.tracking_code,
        carrier: orderData.shipping_provider,
      },
    };
  }

  /**
   * Map Lazada status to standardized status
   */
  private mapOrderStatus(status: string): string {
    const statusMap: { [key: string]: string } = {
      'pending': 'pending',
      'unpaid': 'pending',
      'paid': 'processing',
      'ready_to_ship': 'processing',
      'shipped': 'shipped',
      'delivered': 'delivered',
      'canceled': 'cancelled',
      'returned': 'returned',
      'failed': 'cancelled',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }

  /**
   * Check if API credentials are configured
   */
  isConfigured(): boolean {
    return !!(this.appKey && this.appSecret);
  }
}
