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

  switchAuthTab(tab) {
    const signinBtn = document.getElementById('tab-btn-signin');
    const signupBtn = document.getElementById('tab-btn-signup');
    const signinTab = document.getElementById('auth-tab-signin');
    const signupTab = document.getElementById('auth-tab-signup');

    if (tab === 'signin') {
      signinBtn?.classList.add('active');
      signupBtn?.classList.remove('active');
      if (signinTab) signinTab.style.display = 'block';
      if (signupTab) signupTab.style.display = 'none';
    } else {
      signupBtn?.classList.add('active');
      signinBtn?.classList.remove('active');
      if (signupTab) signupTab.style.display = 'block';
      if (signinTab) signinTab.style.display = 'none';
    }
  },

  async loginWithTelegram() {
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initDataUnsafe?.user) {
      const tgUser = window.Telegram.WebApp.initDataUnsafe.user;
      await this.autoLoginTelegram(tgUser);
      window.PayWellRouter?.closeModal('modal-auth');
      alert('Successfully logged in via Telegram!');
    } else {
      // Simulate quick Telegram account login in web environment
      const tgUsername = prompt('Enter your Telegram Username (e.g., @Yuji_luke or @User):');
      if (!tgUsername) return;
      const cleanUsername = tgUsername.replace('@', '').trim();
      if (!cleanUsername) return;

      let user = window.PayWellDB.findUser(cleanUsername);
      if (!user) {
        // Prompt for safety Gmail binding if user is registering via Telegram
        const bindEmail = prompt(`For account safety, please bind a Gmail address for ${cleanUsername}:`);
        const finalEmail = (bindEmail && bindEmail.includes('@')) ? bindEmail.trim() : `${cleanUsername}@gmail.com`;
        user = window.PayWellDB.registerUser(cleanUsername, finalEmail, 'TgSecured123!', '999999999');
      }
      this.setUser(user);
      window.PayWellRouter?.closeModal('modal-auth');
      alert(`Welcome ${user.username}! Logged in via Telegram.`);
    }
  },

  async loginWithGoogle() {
    const userEmail = prompt('Select or enter your Google / Gmail account:');
    if (!userEmail || !userEmail.includes('@')) {
      if (userEmail !== null) alert('Please enter a valid Gmail address.');
      return;
    }
    const cleanEmail = userEmail.trim().toLowerCase();
    const username = cleanEmail.split('@')[0];

    let user = window.PayWellDB.findUserByEmail ? window.PayWellDB.findUserByEmail(cleanEmail) : window.PayWellDB.findUser(username);
    if (!user) {
      user = window.PayWellDB.registerUser(username, cleanEmail, 'GooglePass123!');
    }
    this.setUser(user);
    window.PayWellRouter?.closeModal('modal-auth');
    alert(`Logged in with Google account: ${cleanEmail}`);
  },

  openForgotPassword() {
    window.PayWellRouter?.closeModal('modal-auth');
    window.PayWellRouter?.openModal('modal-forgot');
  },

  sendGmailRecoveryCode() {
    const emailInput = document.getElementById('recovery-email');
    const email = emailInput?.value?.trim();
    if (!email || !email.includes('@')) {
      alert('Please enter a valid registered Gmail address.');
      return;
    }
    alert(`A 6-digit password reset code has been sent to ${email}. Check your inbox!`);
    window.PayWellRouter?.closeModal('modal-forgot');
  },

  async autoLoginTelegram(tgUser) {
    const username = tgUser.username || `tg_${tgUser.id}`;

    // Check client DB first
    let user = window.PayWellDB.findUser(username) || window.PayWellDB.findUser(String(tgUser.id));
    if (!user) {
      user = window.PayWellDB.registerUser(username, `${username}@gmail.com`, 'TgPass123!', String(tgUser.id));
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
