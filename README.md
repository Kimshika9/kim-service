# Romantic Telegram Mini App 💖

A beautiful, romantic interactive Telegram Mini Web App asking "Who is the cutest girl in the world?" with glassmorphism UI, particle effects, Burmese text, and live activity tracking via Telegram Bot.

---

## ✨ Features
- **Cute Loading Screen:** Floating pulse heart emoji 💖 with sparkle animations ✨ and soft fade loading text.
- **Interactive Glassmorphism Cards:** Glass blur, soft text-shadow glow, and touch-friendly rounded buttons.
- **Playful Wrong Answer Screen:** Card shake animation, heart particle burst effect, and Burmese message (*"အဖြေက မှားပါတယ် သဲသဲကသာ ချစ်စရာကောင်းဆုံး 😝❤️"*).
- **Final Surprise Screen:** Animated pulsing heart, heart rain/confetti animation, and dynamic user name greeting (*"Made with ❤️ for [Name]"*).
- **Telegram Bot Integration:** Sends interactive event data (`tg.sendData()`) back to `bot.py` so you can track when she opens, interacts, and completes the mini app!

---

## 📁 File Structure
- `index.html`: The complete single-file interactive web app (HTML, CSS, JS).
- `bot.py`: Telegram Bot script for launching the app & receiving read/activity events.
- `main.py`: Local HTTP server for quick testing in Pydroid 3 or desktop.

---

## 🚀 How to Test Locally
1. Run `main.py` using Python or in Pydroid 3:
   ```bash
   python main.py
   ```
2. Open your web browser at `http://localhost:8080`.

---

## 🌐 How to Host & Publish on GitHub Pages
1. Push this repository to your GitHub account (`https://github.com/Kimshika9/kim-service`).
2. Go to **Settings > Pages** in your GitHub repository.
3. Under **Build and deployment > Source**, choose **Deploy from a branch**.
4. Select `main` branch and `/ (root)` folder, then click **Save**.
5. GitHub will generate your live HTTPS URL (e.g., `https://Kimshika9.github.io/kim-service/`).

---

## 🤖 Connect to Telegram Bot
1. Open Telegram and search for **@BotFather**.
2. Create or edit your Mini App: `/newapp`.
3. Select your bot, title it, and enter your **GitHub Pages URL** from above.
4. Set `bot.py` environment variables `BOT_TOKEN` and `MINI_APP_URL`, then run `bot.py`:
   ```bash
   python bot.py
   ```
5. Anyone typing `/start` to your bot can now open and enjoy the Romantic Mini App!
