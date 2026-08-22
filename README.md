# PayWell - Premium Payment System for Telegram Mini App

PayWell is a community-exclusive digital wallet and virtual payment system built for Telegram Mini Apps. Inspired by KBZ Pay and PayPal, PayWell features a futuristic dark-mode glassmorphic design identity with neon green accents, gold Owner Crown controls, and instant digital receipts.

---

## 🌟 Key Features

1. **Authentication & Identity:**
   - Sign up / Sign in with username & password
   - Auto-authentication via Telegram Mini App SDK (`initDataUnsafe`)
   - Google Sign-In support
   - Password recovery via Owner Support (@Yuji_luke)

2. **Digital Wallet & Transactions:**
   - Balance display formatted with main and fractional precision (`100,000.00 PW`)
   - Instant token liveness transfer with sender/receiver tracking
   - Dynamic QR code generator for wallet addresses & QR scanner
   - Interactive glassmorphic digital receipts with download & share options

3. **Community Store:**
   - Purchase exclusive virtual items (VIP Gold Badges, Profile Frames, Speed Boosts)
   - Real-time stock tracking and inventory updates

4. **Bilingual Localization:**
   - English 🇺🇸 & Burmese 🇲🇲 switchable language toggle
   - Dark Mode (#0A0A0F) and Light Mode toggle options

5. **Owner Crown Control Panel (@Yuji_luke):**
   - Restricted exclusively to Owner (`@Yuji_luke` / Telegram ID `6399210935`)
   - Protected by 6-digit Owner PIN (`201171`)
   - Modify balances (Add or Deduct tokens with audit reasons)
   - Monitor system circulation, active users, and transaction logs

6. **Telegram Bot Integration (`bot.py`):**
   - Automated transaction receipt notifications
   - Command support (`/start`, `/balance`, `/receipts`, `/support`, `/owner`)

---

## 📁 Project Structure

```
paywell/
├── index.html            # Main single-page application entry point
├── css/
│   ├── main.css          # Color variables, layout, typography & glassmorphism
│   ├── components.css    # Buttons, inputs, modals, PIN pad & bottom nav bar
│   └── animations.css    # Keyframe glows, sparkles, particle bursts & pop-ins
├── js/
│   ├── config.js         # i18n English & Burmese translations
│   ├── security.js       # Auth session management, Telegram auto-login & PIN check
│   ├── router.js         # SPA navigation and modal controller
│   ├── app.js            # Main application UI bindings and REST API calls
│   └── components/
│       └── owner.js      # Owner Crown panel logic & currency adjustments
├── paywell.db            # SQLite database storing users, transactions & store items
├── main.py               # REST API server & static HTTP server (Port 8080)
└── bot.py                # Telegram Bot handler for PayWell WebApp
```

---

## 🚀 Step 1: Running Locally (Pydroid 3 / Local Python)

To run PayWell locally:

1. Ensure Python 3 is installed.
2. Run the server:
   ```bash
   python main.py
   ```
3. Open your browser or Pydroid 3 web view at:
   `http://localhost:8080`

---

## 🤖 Step 2: Running the Telegram Bot

1. Set your Bot Token from `@BotFather`:
   ```bash
   export BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN"
   export MINI_APP_URL="https://yourusername.github.io/paywell/"
   ```
2. Start the bot script:
   ```bash
   python bot.py
   ```
3. In Telegram, send `/start` to launch PayWell!

---

## 👑 Owner Credentials
- **Owner Account:** `@Yuji_luke` (Telegram ID: `6399210935`)
- **Owner Panel PIN:** `201171`
