import json
import logging
import os
import sqlite3
import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo

logging.basicConfig(level=logging.INFO)

# --- CONFIGURATION ---
TOKEN = os.getenv('BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE')
MINI_APP_URL = os.getenv('MINI_APP_URL', 'https://yuji-luke.github.io/paywell/')
OWNER_TELEGRAM_ID = "6399210935"
OWNER_USERNAME = "Yuji_luke"
DB_FILE = "paywell.db"

bot = telebot.TeleBot(TOKEN)

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

@bot.message_handler(commands=['start', 'help'])
def send_welcome(message):
    user_id = str(message.from_user.id)
    username = message.from_user.username or message.from_user.first_name

    markup = InlineKeyboardMarkup()
    webapp = WebAppInfo(MINI_APP_URL)
    btn_app = InlineKeyboardButton("💎 Open PayWell App 💎", web_app=webapp)
    btn_support = InlineKeyboardButton("💬 Contact Owner (@Yuji_luke)", url=f"https://t.me/{OWNER_USERNAME}")
    markup.add(btn_app)
    markup.add(btn_support)

    welcome_txt = (
        f"👑 *Welcome to PayWell Mini App!*\n\n"
        f"Hello, *{username}*!\n"
        f"PayWell is your exclusive futuristic digital token payment system.\n\n"
        f"• Check balance & transaction receipts\n"
        f"• Instant QR payment transfers\n"
        f"• Exclusive community store\n\n"
        f"Click the button below to launch PayWell Web App!"
    )
    bot.send_message(message.chat.id, welcome_txt, parse_mode='Markdown', reply_markup=markup)

@bot.message_handler(commands=['balance'])
def check_balance(message):
    user_id = str(message.from_user.id)
    username = message.from_user.username

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username, balance FROM users WHERE telegram_id = ? OR username = ?", (user_id, username))
    user = cursor.fetchone()
    conn.close()

    if user:
        bal = user['balance']
        bot.send_message(
            message.chat.id,
            f"💰 *PayWell Balance*\n\nAccount: @{user['username']}\nBalance: *{bal:,.2f} PW*",
            parse_mode='Markdown'
        )
    else:
        bot.send_message(
            message.chat.id,
            "⚠️ Account not found or linked. Please launch PayWell Mini App to auto-register!",
            parse_mode='Markdown'
        )

@bot.message_handler(commands=['receipts'])
def view_recent_receipts(message):
    user_id = str(message.from_user.id)
    username = message.from_user.username

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username FROM users WHERE telegram_id = ? OR username = ?", (user_id, username))
    user = cursor.fetchone()

    if not user:
        conn.close()
        return bot.send_message(message.chat.id, "⚠️ Account not linked yet. Open PayWell Mini App to start!")

    u_name = user['username']
    cursor.execute('''
        SELECT * FROM transactions
        WHERE sender_username = ? OR receiver_username = ?
        ORDER BY created_at DESC LIMIT 5
    ''', (u_name, u_name))
    txs = cursor.fetchall()
    conn.close()

    if not txs:
        return bot.send_message(message.chat.id, "📄 No recent transactions found.")

    res = ["📄 *Recent PayWell Receipts*\n━━━━━━━━━━━━━━━━"]
    for tx in txs:
        res.append(
            f"🆔 `{tx['id']}`\n"
            f"📤 From: {tx['sender_username']}\n"
            f"📥 To: {tx['receiver_username']}\n"
            f"💰 Amount: *{tx['amount']:,.2f} PW*\n"
            f"📅 Date: {tx['created_at']}\n"
            f"━━━━━━━━━━━━━━━━"
        )
    bot.send_message(message.chat.id, "\n".join(res), parse_mode='Markdown')

@bot.message_handler(commands=['support', 'reset'])
def request_support(message):
    msg = (
        f"🔐 *Password Recovery & Support*\n\n"
        f"Need a password reset or system support?\n"
        f"Contact Owner directly on Telegram: @{OWNER_USERNAME}\n\n"
        f"State your registered username or email for identity verification."
    )
    markup = InlineKeyboardMarkup()
    btn = InlineKeyboardButton("📩 Message @Yuji_luke", url=f"https://t.me/{OWNER_USERNAME}")
    markup.add(btn)
    bot.send_message(message.chat.id, msg, parse_mode='Markdown', reply_markup=markup)

@bot.message_handler(commands=['owner'])
def owner_panel_info(message):
    user_id = str(message.from_user.id)
    username = message.from_user.username or ""

    if user_id == OWNER_TELEGRAM_ID or username.lower() == OWNER_USERNAME.lower():
        conn = get_db()
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM users")
        total_users = cursor.fetchone()[0]
        cursor.execute("SELECT SUM(balance) FROM users")
        total_bal = cursor.fetchone()[0] or 0.0
        conn.close()

        msg = (
            f"👑 *PayWell Owner Command Center*\n"
            f"Owner: @{OWNER_USERNAME} (ID: `{OWNER_TELEGRAM_ID}`)\n\n"
            f"👥 Total Registered Users: *{total_users}*\n"
            f"💎 Total Token Circulation: *{total_bal:,.2f} PW*\n\n"
            f"Access full Owner Crown Menu inside PayWell Mini App with PIN: `201171`"
        )
        bot.send_message(message.chat.id, msg, parse_mode='Markdown')
    else:
        bot.send_message(message.chat.id, "🚫 Access Denied: Crown Owner Menu is restricted to @Yuji_luke.")

@bot.message_handler(content_types=['web_app_data'])
def handle_web_app_data(message):
    try:
        data = json.loads(message.web_app_data.data)
        event_type = data.get('event', 'unknown')
        tx_id = data.get('tx_id', '')
        amount = data.get('amount', 0)
        receiver = data.get('receiver', '')

        if event_type == 'transaction_success':
            bot.send_message(
                message.chat.id,
                f"✅ *Transaction Confirmed!*\n\n"
                f"Receipt ID: `{tx_id}`\n"
                f"Sent: *{amount:,.2f} PW* to @{receiver}\n\n"
                f"Thank you for using PayWell!",
                parse_mode='Markdown'
            )
        elif event_type == 'store_purchase':
            item_name = data.get('item_name', 'Item')
            bot.send_message(
                message.chat.id,
                f"🛍️ *Store Purchase Receipt*\n\n"
                f"Item: *{item_name}*\n"
                f"Paid: *{amount:,.2f} PW*\n"
                f"Receipt ID: `{tx_id}`\n\n"
                f"Item added to your account inventory!",
                parse_mode='Markdown'
            )
    except Exception as e:
        logging.error(f"Error handling WebApp data: {e}")

if __name__ == "__main__":
    print("PayWell Telegram Bot service initialized...")
    try:
        bot.infinity_polling()
    except Exception as e:
        print(f"Bot stopped: {e}")
