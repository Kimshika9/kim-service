/**
 * PayWell Main Controller & UI Bindings (Supports Backend API + Static Fallback)
 */

const PayWellApp = {
  activeDecorTab: 'background',

  init() {
    window.PayWellAuth.init();
    window.PayWellRouter.init();
    window.PayWellOwner.init();
    if (window.PayWellPet) window.PayWellPet.init();

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
    const headerId = document.getElementById('header-user-id');
    if (headerId) {
      headerId.innerText = `#PW-${String(user.id || 1).padStart(4, '0')}`;
    }
    const profileSeqId = document.getElementById('profile-seq-id');
    if (profileSeqId) {
      profileSeqId.innerText = `#PW-${String(user.id || 1).padStart(4, '0')}`;
    }
  },

  renderDashboardBalance(user) {
    const mainEl = document.getElementById('bal-main');
    const sideEl = document.getElementById('bal-side');
    const usdEl = document.getElementById('bal-usd');
    const mmkEl = document.getElementById('bal-mmk');

    const bal = user.balance || 0;
    const parts = bal.toFixed(2).split('.');
    if (mainEl) mainEl.innerText = parseInt(parts[0]).toLocaleString('en-US');
    if (sideEl) sideEl.innerText = `.${parts[1]} PW`;

    if (usdEl) usdEl.innerText = `$${bal.toFixed(2)}`;
    if (mmkEl) mmkEl.innerText = `${(bal * 3500).toLocaleString('en-US')} KS`;
  },

  claimDailyReward() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;
    user.balance += 50.0;
    window.PayWellDB.saveUsers(window.PayWellDB.getUsers());
    alert("🎉 Daily Login Reward Claimed! Received +50.00 PW!");
    this.renderDashboardBalance(user);
  },

  openProfileCustomizerModal() {
    window.PayWellRouter.openModal('modal-profile-decor');
    this.switchDecorTab('background');
  },

  switchDecorTab(category) {
    this.activeDecorTab = category;
    const items = window.PayWellDB.DECORATIONS.filter(d => d.category === category);
    const container = document.getElementById('decor-items-grid');
    if (!container) return;

    container.innerHTML = items.map(item => `
      <div class="glass-card" style="padding:10px; text-align:center;">
        <div style="font-size:12px; font-weight:700; color:#fff; margin-bottom:4px;">${item.name}</div>
        <button onclick="PayWellApp.equipDecorItem('${item.id}', '${item.category}')" class="btn btn-gold" style="padding:4px; font-size:10px;">Equip Item</button>
      </div>
    `).join('');
  },

  equipDecorItem(itemId, category) {
    const item = window.PayWellDB.DECORATIONS.find(d => d.id === itemId);
    if (!item) return;

    const profileCard = document.getElementById('user-profile-card');
    if (category === 'background' && profileCard) {
      profileCard.style.background = item.style;
    }

    alert(`✨ Equipped ${item.name} on Profile!`);
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

  switchExchangeTab(tab) {
    const pNew = document.getElementById('ex-panel-new');
    const pOrders = document.getElementById('ex-panel-orders');
    const btnNew = document.getElementById('ex-tab-new');
    const btnOrders = document.getElementById('ex-tab-orders');

    if (tab === 'new') {
      if (pNew) pNew.style.display = 'block';
      if (pOrders) pOrders.style.display = 'none';
      if (btnNew) { btnNew.className = 'btn btn-gold'; }
      if (btnOrders) { btnOrders.className = 'btn btn-glass'; }
    } else {
      if (pNew) pNew.style.display = 'none';
      if (pOrders) pOrders.style.display = 'block';
      if (btnNew) { btnNew.className = 'btn btn-glass'; }
      if (btnOrders) { btnOrders.className = 'btn btn-gold'; }
      this.loadExchangeOrders();
    }
  },

  calcExchangeFee() {
    const amt = parseFloat(document.getElementById('ex-amt-input')?.value || 0);
    const feeEl = document.getElementById('ex-calculated-fee');
    if (!feeEl) return;

    if (amt <= 0) {
      feeEl.innerText = "100 KS";
      return;
    }

    const randomFee = Math.floor(Math.random() * 900) + 100; // 100-999 KS fee
    feeEl.innerText = `${randomFee} KS`;
  },

  submitExchangeRequest() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const type = document.getElementById('ex-type-select').value;
    const amount = parseFloat(document.getElementById('ex-amt-input').value || 0);
    const acct = document.getElementById('ex-acct-input').value.trim();

    if (amount <= 0 || !acct) {
      alert("Please enter a valid exchange amount and account details.");
      return;
    }

    if (type === 'deposit') {
      const dep = window.PayWellDB.submitKpayDeposit(user.username, amount, 'simulated_proof.jpg');
      alert(`✓ Kpay Deposit Request #${dep.id} submitted!\nSend ${amount.toLocaleString()} KS to Official Account 09763458034 (DMTD).\nOwner will approve and credit PW balance.`);
    } else {
      if (user.balance < amount) {
        alert("Insufficient PW balance for withdrawal.");
        return;
      }
      user.balance -= amount;
      window.PayWellDB.saveUsers(window.PayWellDB.getUsers());
      alert(`✓ Kpay Withdrawal Request submitted!\n${amount} PW deducted. Owner will send ${amount.toLocaleString()} KS to ${acct}.`);
      this.fetchUserFreshData();
      this.renderDashboardBalance(window.PayWellAuth.currentUser);
    }

    this.switchExchangeTab('orders');
  },

  loadExchangeOrders() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const deposits = window.PayWellDB.getKpayDeposits().filter(d => d.username.toLowerCase() === user.username.toLowerCase());
    const container = document.getElementById('ex-orders-list');
    if (!container) return;

    if (!deposits || deposits.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); padding:12px; font-size:12px;">No active or past exchange orders.</div>';
      return;
    }

    container.innerHTML = deposits.map(d => `
      <div class="glass-card" style="padding:10px; margin-bottom:6px; border:1px solid ${d.status === 'done' ? 'var(--primary-green)' : 'var(--gold-accent)'};">
        <div style="display:flex; justify-content:space-between; font-size:11px;">
          <span style="font-weight:700; color:#fff;">${d.id}</span>
          <span style="color:${d.status === 'done' ? 'var(--primary-green)' : 'var(--gold-accent)'}; font-weight:700;">${d.status.toUpperCase()}</span>
        </div>
        <div style="font-size:12px; color:#fff; margin:2px 0;">Amount: ${d.amount_ks.toLocaleString()} KS / PW</div>
        <div style="font-size:9px; color:var(--text-muted);">Fee: ${d.fee_ks} KS | ${d.created_at}</div>
      </div>
    `).join('');
  },

  executeEmergencyFill() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const pair = document.getElementById('emg-fill-pair').value;
    const amount = parseFloat(document.getElementById('emg-fill-amount').value || 0);

    if (amount <= 0) {
      alert("Please enter a valid amount for emergency fill.");
      return;
    }

    try {
      if (pair === 'PW_USD') {
        if (user.balance < amount) throw new Error("Insufficient PW balance for emergency fill.");
        user.balance -= amount;
        alert(`⚡ Emergency Fill Executed! Converted ${amount} PW to $${amount.toFixed(2)} USD.`);
      } else {
        user.balance += amount;
        alert(`⚡ Emergency Fill Executed! Received ${amount.toFixed(2)} PW.`);
      }

      window.PayWellDB.saveUsers(window.PayWellDB.getUsers());
      window.PayWellRouter.closeModal('modal-emergency-fill');
      this.fetchUserFreshData();
      this.renderDashboardBalance(window.PayWellAuth.currentUser);
    } catch (e) {
      alert(e.message || "Emergency fill failed.");
    }
  },

  submitUserReport() {
    const target = document.getElementById('report-target').value.trim();
    const type = document.getElementById('report-type').value;
    const desc = document.getElementById('report-desc').value.trim();

    if (!target || !desc) {
      alert("Please enter target username and explanation.");
      return;
    }

    const reports = JSON.parse(localStorage.getItem('paywell_user_reports')) || [];
    reports.unshift({
      id: `REP-${Date.now()}`,
      reporter: window.PayWellAuth.currentUser?.username || 'Anonymous',
      target,
      type,
      desc,
      timestamp: new Date().toLocaleString()
    });
    localStorage.setItem('paywell_user_reports', JSON.stringify(reports));

    alert("🚩 Compliance report submitted successfully to system Owner.");
    window.PayWellRouter.closeModal('modal-user-report');
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
