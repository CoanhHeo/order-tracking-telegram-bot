import dotenv from 'dotenv';

dotenv.config();

export const config = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/order-tracking-bot',
  },
  lazada: {
    appKey: process.env.LAZADA_APP_KEY || '',
    appSecret: process.env.LAZADA_APP_SECRET || '',
    apiUrl: process.env.LAZADA_API_URL || 'https://api.lazada.vn/rest',
  },
  shopee: {
    partnerId: parseInt(process.env.SHOPEE_PARTNER_ID || '0'),
    partnerKey: process.env.SHOPEE_PARTNER_KEY || '',
    apiUrl: process.env.SHOPEE_API_URL || 'https://partner.shopeemobile.com',
  },
  scheduler: {
    checkOrdersSchedule: process.env.CHECK_ORDERS_SCHEDULE || '*/30 * * * *',
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000'),
  },
};
