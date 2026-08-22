/**
 * PayWell Authentication & Security Module
 */

const PayWellAuth = {
  currentUser: null,
  sessionToken: null,

  init() {
    // Check if Telegram WebApp auto-login available
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      this.autoLoginTelegram(tgUser);
    } else {
      // Check localStorage for active session
      const savedUser = localStorage.getItem('paywell_user');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
        } catch (e) {
          localStorage.removeItem('paywell_user');
        }
      }
    }
  },

  async autoLoginTelegram(tgUser) {
    const username = tgUser.username || `tg_${tgUser.id}`;
    const payload = {
      username: username,
      telegram_id: String(tgUser.id),
      telegram_username: tgUser.username || '',
      email: `${username}@telegram.org`
    };

    try {
      // Try login or register
      let res = await fetch('/api/user?telegram_id=' + tgUser.id);
      let data = await res.json();

      if (data.user) {
        this.setUser(data.user);
      } else {
        // Register new user from Telegram profile
        let regRes = await fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        let regData = await regRes.json();
        if (regData.user) {
          this.setUser(regData.user);
        }
      }
    } catch (err) {
      console.warn("Telegram auto-login fallback to local state:", err);
    }
  },

  async login(identifier, password) {
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      this.setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  },

  async register(username, email, password, telegram_id = null) {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, telegram_id })
      });
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      this.setUser(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  },

  async googleSignIn(googleUser) {
    // Simulated Google OAuth Flow with profile payload
    const email = googleUser.email;
    const username = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    try {
      let res = await fetch('/api/user?username=' + username);
      let data = await res.json();

      if (data.user) {
        this.setUser(data.user);
        return data.user;
      } else {
        return await this.register(username, email, "GoogleAuth123!");
      }
    } catch (err) {
      throw err;
    }
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
    try {
      const res = await fetch('/api/owner/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pin: pin,
          telegram_id: this.currentUser.telegram_id || '6399210935',
          username: this.currentUser.username || 'Yuji_luke'
        })
      });
      const data = await res.json();
      return !!data.authenticated;
    } catch (err) {
      return pin === "201171";
    }
  }
};

window.PayWellAuth = PayWellAuth;
