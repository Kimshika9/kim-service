/**
 * PayWell Main Controller & UI Bindings (Supports Backend API + Static Fallback)
 */

const PayWellApp = {
  init() {
    window.PayWellAuth.init();
    window.PayWellRouter.init();
    window.PayWellOwner.init();

    this.bindEvents();
    this.renderCurrentState();
  },

  bindEvents() {
    window.addEventListener('paywell_auth_changed', () => {
      this.renderCurrentState();
    });

    window.addEventListener('paywell_lang_changed', () => {
      this.renderI18nText();
      this.renderCurrentState();
    });

    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        window.PayWellRouter.navigate(view);
      });
    });

    const loginForm = document.getElementById('form-login');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ident = document.getElementById('login-ident').value.trim();
        const pwd = document.getElementById('login-pwd').value;
        try {
          await window.PayWellAuth.login(ident, pwd);
          window.PayWellRouter.closeModal('modal-auth');
        } catch (err) {
          alert(err.message || "Login failed");
        }
      });
    }

    const regForm = document.getElementById('form-register');
    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('reg-username').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const pwd = document.getElementById('reg-pwd').value;
        try {
          await window.PayWellAuth.register(username, email, pwd);
          window.PayWellRouter.closeModal('modal-auth');
        } catch (err) {
          alert(err.message || "Registration failed");
        }
      });
    }

    window.addEventListener('paywell_balance_updated', () => {
      this.fetchUserFreshData();
    });
  },

  fetchUserFreshData() {
    if (!window.PayWellAuth.currentUser) return;
    const uName = window.PayWellAuth.currentUser.username;
    const fresh = window.PayWellDB.findUser(uName);
    if (fresh) {
      window.PayWellAuth.setUser(fresh);
    }
  },

  renderCurrentState() {
    const user = window.PayWellAuth.currentUser;

    const crownNav = document.getElementById('nav-crown-item');
    if (crownNav) {
      if (window.PayWellAuth.isOwner()) {
        crownNav.style.display = 'flex';
      } else {
        crownNav.style.display = 'none';
      }
    }

    if (!user) {
      window.PayWellRouter.openModal('modal-auth');
      return;
    }

    this.renderHeader(user);
    this.renderDashboardBalance(user);
    this.loadRecentTransactions(user.username);
    this.loadStoreItems();
  },

  renderHeader(user) {
    const headerUser = document.getElementById('header-username');
    if (headerUser) {
      headerUser.innerText = `@${user.username} ${user.role === 'owner' ? '👑' : ''}`;
    }
  },

  renderDashboardBalance(user) {
    const mainEl = document.getElementById('bal-main');
    const sideEl = document.getElementById('bal-side');
    if (!mainEl || !sideEl) return;

    const parts = (user.balance || 0).toFixed(2).split('.');
    mainEl.innerText = parseInt(parts[0]).toLocaleString('en-US');
    sideEl.innerText = `.${parts[1]} PW`;
  },

  loadRecentTransactions(username) {
    const txs = window.PayWellDB.getTransactions(username);
    const container = document.getElementById('recent-tx-list');
    const fullContainer = document.getElementById('full-tx-list');

    if (!txs || txs.length === 0) {
      const noDataHtml = `<div style="text-align:center; padding:20px; color:var(--text-muted);">${window.PayWellI18n.t('noTransactions')}</div>`;
      if (container) container.innerHTML = noDataHtml;
      if (fullContainer) fullContainer.innerHTML = noDataHtml;
      return;
    }

    const renderTxCard = (tx) => {
      const isIncoming = tx.receiver_username === username;
      const sign = isIncoming ? '+' : '-';
      const color = isIncoming ? 'var(--primary-green)' : 'var(--red-alert)';

      return `
        <div class="glass-card" style="padding:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;" onclick="PayWellApp.openReceiptModal('${tx.id}', '${tx.sender_username}', '${tx.receiver_username}', ${tx.amount}, '${tx.created_at}')">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:38px; height:38px; border-radius:50%; background:rgba(255,255,255,0.05); display:flex; align-items:center; justify-content:center; font-size:18px;">
              ${isIncoming ? '📥' : '📤'}
            </div>
            <div>
              <div style="font-weight:600; font-size:14px; color:var(--text-primary);">${isIncoming ? `@${tx.sender_username}` : `@${tx.receiver_username}`}</div>
              <div style="font-size:11px; color:var(--text-muted); font-family:var(--font-mono);">${tx.created_at}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-weight:700; color:${color}; font-size:15px;">
              ${sign}${tx.amount.toFixed(2)} PW
            </div>
            <div style="font-size:10px; color:var(--primary-green); text-transform:uppercase;">${tx.status}</div>
          </div>
        </div>
      `;
    };

    if (container) container.innerHTML = txs.slice(0, 5).map(renderTxCard).join('');
    if (fullContainer) fullContainer.innerHTML = txs.map(renderTxCard).join('');
  },

  loadStoreItems() {
    const items = window.PayWellDB.getStoreItems();
    const container = document.getElementById('store-grid');
    if (!container) return;

    container.innerHTML = items.map(item => `
      <div class="glass-card" style="padding:16px; text-align:center; position:relative;">
        <div style="font-size:36px; margin-bottom:8px;">${item.image_url}</div>
        <div style="font-weight:700; font-size:15px; color:var(--text-primary); margin-bottom:4px;">${item.name}</div>
        <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px; height:36px; overflow:hidden;">${item.description}</div>
        <div style="font-family:var(--font-mono); font-weight:800; color:var(--gold-accent); font-size:16px; margin-bottom:12px;">
          ${item.price.toFixed(2)} PW
        </div>
        <button onclick="PayWellApp.buyStoreItem(${item.id})" class="btn btn-primary" style="padding:10px; font-size:13px;">
          ${window.PayWellI18n.t('buyNow')}
        </button>
      </div>
    `).join('');
  },

  buyStoreItem(itemId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      const res = window.PayWellDB.buyStoreItem(user.username, itemId);
      alert(`🎉 Purchased ${res.item.name} successfully!`);
      this.fetchUserFreshData();
      this.loadRecentTransactions(user.username);
    } catch (e) {
      alert(e.message || "Purchase failed.");
    }
  },

  submitSendMoney() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const receiver = document.getElementById('send-receiver').value.trim();
    const amount = parseFloat(document.getElementById('send-amount').value || 0);
    const note = document.getElementById('send-note').value.trim();

    try {
      const res = window.PayWellDB.transfer(user.username, receiver, amount, note);
      window.PayWellRouter.closeModal('modal-send');
      this.fetchUserFreshData();
      this.openReceiptModal(res.tx_id, user.username, receiver, amount, res.timestamp);

      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.sendData(JSON.stringify({
          event: 'transaction_success',
          tx_id: res.tx_id,
          amount: amount,
          receiver: receiver
        }));
      }
    } catch (err) {
      alert(err.message || "Transfer failed.");
    }
  },

  openReceiptModal(txId, sender, receiver, amount, timestamp) {
    document.getElementById('receipt-id').innerText = txId;
    document.getElementById('receipt-sender').innerText = `@${sender}`;
    document.getElementById('receipt-receiver').innerText = `@${receiver}`;
    document.getElementById('receipt-amount').innerText = `${amount.toFixed(2)} PW`;
    document.getElementById('receipt-date').innerText = timestamp || new Date().toLocaleString();

    const qrCanvas = document.getElementById('receipt-qr-canvas');
    if (qrCanvas && window.QRCode) {
      qrCanvas.innerHTML = "";
      new window.QRCode(qrCanvas, {
        text: `PAYWELL:${txId}:${amount}`,
        width: 120,
        height: 120,
        colorDark: "#0A0A0F",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H
      });
    }

    window.PayWellRouter.openModal('modal-receipt');
  },

  renderI18nText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      el.innerText = window.PayWellI18n.t(key);
    });
  },

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const target = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', target);
  },

  toggleLanguage(lang) {
    window.PayWellI18n.setLanguage(lang);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  PayWellApp.init();
});

window.PayWellApp = PayWellApp;
