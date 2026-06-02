# Caizar Store - Luxury Telegram Mini App

This is a premium "Luxury & Classic" Telegram Mini App for Boost Services. It is optimized for mobile performance and features a deep blue theme with JetBrains Mono typography.

## 📁 File Structure
- `index.html`: The main entry point.
- `css/`: Stylesheets for layout, components, and animations.
- `js/`: Application logic, routing, and security.
- `assets/`: Icons, posters, and font files.
- `main.py`: Local HTTP server for testing in Pydroid 3.
- `bot.py`: Telegram Bot script to launch the Mini App.

---

## 🚀 Step 1: Local Testing (Pydroid 3)
To see your app running on your phone before publishing:
1. Ensure all folders (`css`, `js`, `assets`) are in the same directory as `main.py`.
2. Run `main.py` in Pydroid 3.
3. Open your mobile browser to: `http://localhost:8080`

---

## 🌐 Step 2: Getting your Web Link (Hosting)
Telegram requires an **HTTPS** link. You can host this project for free:

### Option A: GitHub Pages (Recommended)
1. Create a [GitHub](https://github.com) account.
2. Create a new **Public Repository** named `caizar-store`.
3. Upload all files and folders (`index.html`, `css/`, `js/`, `assets/`).
4. Go to **Settings > Pages**.
5. Under "Build and deployment", set Source to **Deploy from a branch** and select `main`.
6. After a minute, GitHub will give you a link like: `https://yourusername.github.io/caizar-store/`

---

## 🤖 Step 3: Connect to Telegram
1. Open Telegram and search for **@BotFather**.
2. Create a new bot: `/newbot` → Name it "Caizar Store Bot" → Get your **API Token**.
3. Create the Mini App: `/newapp` → Select your bot.
4. **Title:** Caizar Store
5. **Description:** Premium Boost Service Shop.
6. **URL:** Paste your GitHub Pages link (from Step 2).
7. **Short Name:** `caizar` (this creates `t.me/yourbot/caizar`).

---

## 🐍 Step 4: Configure the Bot Launcher
1. Open `bot.py` in Pydroid 3.
2. Replace `YOUR_BOT_TOKEN` with the token from BotFather.
3. Replace `YOUR_MINI_APP_URL` with your GitHub link.
4. Run `bot.py`. Now, when users type `/start`, they will see a "Open Caizar Store" button.
