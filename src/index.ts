import { config } from './config';
import { connectDatabase } from './database';
import { TelegramBotService } from './bot';
import { OrderScheduler } from './scheduler/OrderScheduler';

async function main() {
  try {
    console.log('🚀 Starting Order Tracking Telegram Bot...');

    // Validate configuration
    if (!config.telegram.botToken) {
      throw new Error('TELEGRAM_BOT_TOKEN is not set in environment variables');
    }

    // Connect to database
    await connectDatabase();

    // Initialize Telegram bot
    const botService = new TelegramBotService();

    // Initialize and start scheduler
    const scheduler = new OrderScheduler(botService);
    scheduler.start();

    console.log('✅ Bot is running...');
    console.log('Press Ctrl+C to stop');

  } catch (error) {
    console.error('❌ Failed to start bot:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Shutting down bot...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n⏹️  Shutting down bot...');
  process.exit(0);
});

// Start the application
main();
