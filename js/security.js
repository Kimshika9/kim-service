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
  }
};

window.PayWellAuth = PayWellAuth;
