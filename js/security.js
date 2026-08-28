/**
 * PayWell Authentication & Security Module
 */

const PayWellAuth = {
  currentUser: null,

  init() {
    // Check localStorage for active user session
    const savedUser = localStorage.getItem('paywell_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser);
        // Refresh state from DB
        const freshUser = window.PayWellDB ? window.PayWellDB.findUser(u.username) : u;
        this.currentUser = freshUser || u;
      } catch (e) {
        localStorage.removeItem('paywell_user');
      }
    }

    // Auto-login Telegram profile if in Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      this.autoLoginTelegram(tgUser);
    }
  },

  async autoLoginTelegram(tgUser) {
    const username = tgUser.username || `tg_${tgUser.id}`;

    // Check client DB first
    let user = window.PayWellDB.findUser(username) || window.PayWellDB.findUser(String(tgUser.id));
    if (!user) {
      user = window.PayWellDB.registerUser(username, `${username}@telegram.org`, 'TgPass123!', String(tgUser.id));
    }
    this.setUser(user);
  },

  async safeFetchJson(url, options = {}) {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get("content-type");
      if (res.ok && contentType && contentType.includes("application/json")) {
        return await res.json();
      }
    } catch (e) {
      // Static server / GitHub Pages fallback
    }
    return null;
  },

  async login(identifier, password) {
    // Attempt backend API login if available
    const apiResult = await this.safeFetchJson('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    if (apiResult) {
      if (apiResult.error) throw new Error(apiResult.error);
      this.setUser(apiResult.user);
      return apiResult.user;
    }

    // Fallback to client-side database engine
    const user = window.PayWellDB.loginUser(identifier, password);
    this.setUser(user);
    return user;
  },

  async register(username, email, password, telegram_id = null) {
    // Attempt backend API registration if available
    const apiResult = await this.safeFetchJson('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, telegram_id })
    });

    if (apiResult) {
      if (apiResult.error) throw new Error(apiResult.error);
      this.setUser(apiResult.user);
      return apiResult.user;
    }

    // Fallback to client-side database engine
    const user = window.PayWellDB.registerUser(username, email, password, telegram_id);
    this.setUser(user);
    return user;
  },

  setUser(user) {
    this.currentUser = user;
    localStorage.setItem('paywell_user', JSON.stringify(user));
    window.dispatchEvent(new CustomEvent('paywell_auth_changed', { detail: user }));
  },

  logout() {
    this.currentUser = null;
    localStorage.removeItem('paywell_user');
    window.dispatchEvent(new CustomEvent('paywell_auth_changed', { detail: null }));
  },

  isOwner() {
    if (!this.currentUser) return false;
    const u = this.currentUser;
    return (
      u.role === 'owner' ||
      u.username === 'Yuji_luke' ||
      String(u.telegram_id) === '6399210935'
    );
  },

  async verifyOwnerPin(pin) {
    if (!this.isOwner()) return false;
    return pin === "201171";
  },

  checkPasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, text: 'Weak', color: '#FF5252' };
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { score: score, text: 'Weak', color: '#FF5252' };
    if (score <= 4) return { score: score, text: 'Medium', color: '#FFD700' };
    return { score: score, text: 'Strong', color: '#00E676' };
  },

  loginWithGoogle() {
    const emailInput = prompt("🌐 Google Sign-In\nPlease enter your Gmail address:", "user@gmail.com");
    if (!emailInput) return;

    const email = emailInput.trim().toLowerCase();
    if (!email.includes('@') || !email.includes('.')) {
      alert("Invalid Gmail format! Please enter a valid Google email address.");
      return;
    }

    // Try finding existing user by email or username prefix
    const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');
    let user = window.PayWellDB.findUser(email) || window.PayWellDB.findUser(emailPrefix);

    if (!user) {
      // Register new user with Google email
      const username = emailPrefix.length >= 3 ? emailPrefix : `google_${Date.now()}`;
      try {
        user = window.PayWellDB.registerUser(username, email, 'GoogleOAuth2024!', null);
      } catch (e) {
        // If username exists, find or generate unique
        user = window.PayWellDB.findUser(username) || window.PayWellDB.registerUser(`${username}_g`, email, 'GoogleOAuth2024!', null);
      }
    }

    this.setUser(user);
    alert(`🌐 Signed in with Google Account: ${email} (@${user.username})!`);
    if (window.PayWellRouter) window.PayWellRouter.closeModal('modal-auth');
  },

  loginWithTelegram() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.username) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      this.autoLoginTelegram(tgUser);
    } else {
      const tgInput = prompt("✈️ Telegram Sign-In\nPlease enter your Telegram Username (e.g. Yuji_luke):", "Yuji_luke");
      if (!tgInput) return;

      const tgUsername = tgInput.trim().replace(/^@/, '');
      if (tgUsername.length < 3) {
        alert("Invalid Telegram username! Username must be at least 3 characters.");
        return;
      }

      let user = window.PayWellDB.findUser(tgUsername);
      if (!user) {
        user = window.PayWellDB.registerUser(tgUsername, `${tgUsername}@telegram.org`, 'TgPass2024!', null);
      }

      this.setUser(user);
      alert(`✈️ Signed in with Telegram Account: @${user.username}!`);
      if (window.PayWellRouter) window.PayWellRouter.closeModal('modal-auth');
    }
  }
};

window.PayWellAuth = PayWellAuth;
