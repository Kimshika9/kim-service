import json
import logging
import os
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

# Configure logging
logging.basicConfig(level=logging.INFO)

# --- CONFIGURATION ---
TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')  # Get this from @BotFather
MINI_APP_URL = os.getenv('MINI_APP_URL', 'https://yourusername.github.io/romantic-app/')  # Your hosted https URL

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    markup = InlineKeyboardMarkup()
    webapp = WebAppInfo(MINI_APP_URL)
    btn = InlineKeyboardButton("💖 Open Romantic App 💖", web_app=webapp)
    markup.add(btn)

    user_name = message.from_user.first_name or "သဲသဲ"
    bot.send_message(
        message.chat.id,
        f"မင်္ဂလာပါ {user_name} ❤️\n\nသင့်အတွက် အထူးပြုလုပ်ထားသော Romantic Mini Web App လေးကို ဖွင့်ရန် အောက်ပါ ခလုတ်ကို နှိပ်ပါ။",
        reply_markup=markup
    )

# Handle status events sent back from WebApp via tg.sendData()
@bot.message_handler(content_types=['web_app_data'])
def handle_web_app_data(message):
    try:
        data = json.loads(message.web_app_data.data)
        event_type = data.get('event', 'unknown')
        detail = data.get('detail', '')
        timestamp = data.get('timestamp', '')

        user_info = f"{message.from_user.first_name} (@{message.from_user.username or 'N/A'})"

        if event_type == 'app_opened':
            log_msg = f"🔔 [Activity Tracker] {user_info} opened the Romantic Mini App!"
        elif event_type == 'clicked_option':
            log_msg = f"🙈 [Activity Tracker] {user_info} selected option: '{detail}'"
        elif event_type == 'viewed_wrong_answer':
            log_msg = f"😝 [Activity Tracker] {user_info} saw the cute wrong answer message!"
        elif event_type == 'clicked_continue':
            log_msg = f"➡️ [Activity Tracker] {user_info} clicked Continue button!"
        elif event_type == 'completed_app':
            log_msg = f"💖 [Activity Tracker] {user_info} finished the app and reached the Final Surprise screen!"
        else:
            log_msg = f"ℹ️ [Activity Tracker] Received web_app_data: {data}"

        logging.info(log_msg)

        # Notify admin or reply feedback
        bot.send_message(
            message.chat.id,
            f"❤️ သဲသဲလေး App ကို ကြည့်ရှုပြီးပါပြီ! ({event_type})"
        )
    except Exception as e:
        logging.error(f"Error processing web_app_data: {e}")

if __name__ == "__main__":
    print("Romantic App Telegram Bot is running...")
    try:
        bot.infinity_polling()
    except Exception as e:
        print(f"Bot stopped: {e}")
