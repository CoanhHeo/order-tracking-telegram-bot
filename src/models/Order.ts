import mongoose, { Document, Schema } from 'mongoose';

export interface IOrder extends Document {
  userId: number;
  orderId: string;
  platform: 'lazada' | 'shopee';
  status: string;
  orderNumber?: string;
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
  lastUpdated: Date;
  createdAt: Date;
  notificationSent: boolean;
}

const OrderSchema = new Schema<IOrder>({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['lazada', 'shopee'],
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
  },
  orderNumber: {
    type: String,
  },
  items: [{
    name: String,
    sku: String,
    quantity: Number,
    price: Number,
  }],
  shippingInfo: {
    trackingNumber: String,
    carrier: String,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  notificationSent: {
    type: Boolean,
    default: false,
  },
});

// Compound index for userId + orderId + platform to prevent duplicates
OrderSchema.index({ userId: 1, orderId: 1, platform: 1 }, { unique: true });

export const Order = mongoose.model<IOrder>('Order', OrderSchema);
