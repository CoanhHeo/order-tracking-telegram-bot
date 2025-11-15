import TelegramBot from 'node-telegram-bot-api';
import { config } from '../config';
import { handleStart, handleHelp, handleAddOrder, handleListOrders, handleDeleteOrder } from './commands';
import { handleCallbackQuery } from './callbacks';

export class TelegramBotService {
  private bot: TelegramBot;

  constructor() {
    this.bot = new TelegramBot(config.telegram.botToken, { polling: true });
    this.initializeHandlers();
  }

  private initializeHandlers(): void {
    // Command handlers
    this.bot.onText(/\/start/, handleStart(this.bot));
    this.bot.onText(/\/help/, handleHelp(this.bot));
    this.bot.onText(/\/addorder/, handleAddOrder(this.bot));
    this.bot.onText(/\/orders/, handleListOrders(this.bot));
    this.bot.onText(/\/deleteorder/, handleDeleteOrder(this.bot));

    // Callback query handler
    this.bot.on('callback_query', handleCallbackQuery(this.bot));

    // Error handler
    this.bot.on('polling_error', (error) => {
      console.error('Polling error:', error);
    });

    console.log('✅ Telegram bot started successfully');
  }

  public async sendMessage(chatId: number, text: string, options?: TelegramBot.SendMessageOptions): Promise<void> {
    try {
      await this.bot.sendMessage(chatId, text, options);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  public getBot(): TelegramBot {
    return this.bot;
  }
}
