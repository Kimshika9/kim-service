# Kim Service Center - Telegram Mini App

This project is a Telegram Mini App designed to run on **Pydroid 3** and be integrated into a Telegram Bot.

## 📋 Requirements
- **Pydroid 3** (Android App)
- **Telegram Account**
- **Hosting** (Telegram requires an `https://` link. You can use **GitHub Pages** for free).
- **Library:** `pyTelegramBotAPI` (Only if you want to run the bot script).

---

## 🚀 Step 1: Run Locally on Pydroid 3
To test the design on your phone before putting it on Telegram:
1. Copy `index.html` and `main.py` into the same folder in Pydroid 3.
2. Run `main.py`.
3. Open your mobile browser and go to: `http://localhost:8080`

---

## 🌐 Step 2: Host Your App (Mandatory for Telegram)
Telegram cannot see your `localhost`. You must host the `index.html` file online.
1. Create a free account on **GitHub**.
2. Create a new repository named `kim-service`.
3. Upload **only** the `index.html` file.
4. Go to **Settings > Pages** and set the branch to `main`.
5. You will get a link like: `https://yourusername.github.io/kim-service/`

---

## 🤖 Step 3: Create the Telegram Mini App
1. Message **@BotFather** on Telegram.
2. Send `/newbot` and follow instructions to get your **Bot Token**.
3. Send `/newapp`, select your bot.
4. For the **URL**, paste your GitHub Pages link from Step 2.
5. Send `/mybots`, select your bot, go to **Bot Settings > Menu Button**.
6. Set the type to **Web App** and paste your URL again.

---

## 🐍 Step 4: Run the Bot (Optional)
If you want your bot to send a "Welcome" message with a button to open the app:
1. In Pydroid 3, go to **Pip** and install `pyTelegramBotAPI`.
2. Open `bot.py`.
3. Replace `'YOUR_BOT_TOKEN_HERE'` with the token from BotFather.
4. Replace `'YOUR_MINI_APP_URL_HERE'` with your GitHub Pages link.
5. Run `bot.py`.

---

## 📁 File Structure
- `index.html`: The main app code (UI/Logic).
- `main.py`: Local server for testing in Pydroid 3.
- `bot.py`: Simple Python bot to launch the app.
