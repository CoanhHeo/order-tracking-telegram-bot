import mongoose, { Document, Schema } from 'mongoose';

export interface IUserCredentials extends Document {
  userId: number;
  platform: 'lazada' | 'shopee';
  accessToken: string;
  refreshToken?: string;
  shopId?: number; // For Shopee
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserCredentialsSchema = new Schema<IUserCredentials>({
  userId: {
    type: Number,
    required: true,
    index: true,
  },
  platform: {
    type: String,
    required: true,
    enum: ['lazada', 'shopee'],
  },
  accessToken: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  shopId: {
    type: Number,
  },
  expiresAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for userId + platform
UserCredentialsSchema.index({ userId: 1, platform: 1 }, { unique: true });

export const UserCredentials = mongoose.model<IUserCredentials>('UserCredentials', UserCredentialsSchema);
