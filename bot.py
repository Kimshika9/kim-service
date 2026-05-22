import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

# --- CONFIGURATION ---
TOKEN = 'YOUR_BOT_TOKEN_HERE'  # Get this from @BotFather
MINI_APP_URL = 'https://yourusername.github.io/kim-service/' # Your hosted https URL

bot = telebot.TeleBot(TOKEN)

@bot.message_handler(commands=['start'])
def welcome(message):
    markup = InlineKeyboardMarkup()
    # This button will open your Mini App inside Telegram
    webapp = WebAppInfo(MINI_APP_URL)
    btn = InlineKeyboardButton("Open Kim Service Center", web_app=webapp)
    markup.add(btn)

    bot.send_message(
        message.chat.id,
        f"Hello {message.from_user.first_name}!\nWelcome to Kim Service Center. Click the button below to start.",
        reply_markup=markup
    )

print("Bot is running...")
bot.infinity_polling()
