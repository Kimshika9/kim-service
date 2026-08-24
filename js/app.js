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

    // Audit double-entry ledger on data refresh
    window.PayWellDB.auditUserBalance(uName);

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
    this.renderDailyRewardsAndQuests(user.username);
    this.loadRecentTransactions(user.username);
    this.loadStoreItems();
  },

  renderHeader(user) {
    const headerUser = document.getElementById('header-username');
    if (headerUser) {
      headerUser.innerText = `@${user.username} ${user.role === 'owner' ? '👑' : ''}`;
    }
    this.updateProfileUI();
  },

  updateProfileUI() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const avatarImg = document.getElementById('profile-avatar-img');
    const displayName = document.getElementById('profile-display-name');
    const roleBadge = document.getElementById('profile-role-badge');
    const verEmail = document.getElementById('ver-email-label');
    const verTg = document.getElementById('ver-tg-label');

    if (avatarImg) {
      avatarImg.src = user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
    }
    const userIdEl = document.getElementById('profile-user-id');
    if (displayName) {
      displayName.textContent = `@${user.username}`;
    }
    if (userIdEl) {
      userIdEl.textContent = `ID: ${user.user_code || '#00001'}`;
    }
    if (roleBadge) {
      roleBadge.textContent = user.role === 'owner' ? '👑 SYSTEM OWNER' : 'VERIFIED COMMUNITY MEMBER';
    }
    if (verEmail) {
      verEmail.textContent = user.email || 'No Gmail Linked';
    }
    if (verTg) {
      verTg.textContent = user.telegram_id ? `Telegram ID: ${user.telegram_id}` : 'Not Linked';
    }

    this.renderSettingsDevices();
  },

  handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image size should be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Img = e.target.result;
      const user = window.PayWellAuth.currentUser;
      if (!user) return;

      try {
        const updatedUser = window.PayWellDB.updateUserProfile(user.username, { avatar_url: base64Img });
        window.PayWellAuth.setUser(updatedUser);
        this.updateProfileUI();
        alert("Profile picture updated successfully!");
      } catch (err) {
        alert("Failed to update avatar: " + err.message);
      }
    };
    reader.readAsDataURL(file);
  },

  openExchangeModal() {
    this.switchExchangeTab('dep');
    window.PayWellRouter.openModal('modal-exchange');
  },

  switchExchangeTab(tab) {
    const depBtn = document.getElementById('ex-tab-btn-dep');
    const withBtn = document.getElementById('ex-tab-btn-with');
    const ordersBtn = document.getElementById('ex-tab-btn-orders');

    const depTab = document.getElementById('ex-tab-dep');
    const withTab = document.getElementById('ex-tab-with');
    const ordersTab = document.getElementById('ex-tab-orders');

    depBtn?.classList.remove('btn-primary'); depBtn?.classList.add('btn-glass');
    withBtn?.classList.remove('btn-primary'); withBtn?.classList.add('btn-glass');
    ordersBtn?.classList.remove('btn-primary'); ordersBtn?.classList.add('btn-glass');

    if (depTab) depTab.style.display = 'none';
    if (withTab) withTab.style.display = 'none';
    if (ordersTab) ordersTab.style.display = 'none';

    if (tab === 'dep') {
      depBtn?.classList.add('btn-primary'); depBtn?.classList.remove('btn-glass');
      if (depTab) depTab.style.display = 'block';
    } else if (tab === 'with') {
      withBtn?.classList.add('btn-primary'); withBtn?.classList.remove('btn-glass');
      if (withTab) withTab.style.display = 'block';
    } else if (tab === 'orders') {
      ordersBtn?.classList.add('btn-primary'); ordersBtn?.classList.remove('btn-glass');
      if (ordersTab) ordersTab.style.display = 'block';
      this.renderUserExchangeOrders();
    }
  },

  calcExchangeDepositFee() {
    const amt = parseFloat(document.getElementById('ex-dep-amount')?.value || 0);
    const box = document.getElementById('ex-dep-fee-box');
    const feeVal = document.getElementById('ex-dep-fee-val');
    const totalVal = document.getElementById('ex-dep-total-val');

    if (amt > 0) {
      if (box) box.style.display = 'block';
      const randomFee = 289; // Preview fee
      if (feeVal) feeVal.textContent = `+${randomFee} KS (Random Fee)`;
      if (totalVal) totalVal.textContent = `${(amt + randomFee).toLocaleString()} KS`;
    } else {
      if (box) box.style.display = 'none';
    }
  },

  submitExchangeDeposit() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const amt = parseFloat(document.getElementById('ex-dep-amount')?.value || 0);
    const txid = document.getElementById('ex-dep-txid')?.value?.trim();

    if (!amt || !txid) {
      alert("Please enter amount and Kpay transaction ID.");
      return;
    }

    try {
      const order = window.PayWellDB.submitDepositOrder(user.username, amt, txid, null, '');
      alert(`📥 Deposit Order Submitted!\nOrder ID: #${order.orderId}\nPlease wait for Owner @Yuji_luke verification.`);
      document.getElementById('form-exchange-deposit')?.reset();
      this.switchExchangeTab('orders');
    } catch (err) {
      alert(err.message);
    }
  },

  submitExchangeWithdrawal() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const amt = parseFloat(document.getElementById('ex-with-amount')?.value || 0);
    const num = document.getElementById('ex-with-kpaynum')?.value?.trim();
    const name = document.getElementById('ex-with-kpayname')?.value?.trim();

    if (!amt || !num || !name) {
      alert("Please enter amount, Kpay number, and Kpay account name.");
      return;
    }

    try {
      const res = window.PayWellDB.submitWithdrawalOrder(user.username, amt, num, name);
      alert(`📤 Withdrawal Order Submitted!\nOrder ID: #${res.newOrder.orderId}\nOwner @Yuji_luke will send ${res.newOrder.totalKS} KS to ${num} (${name}).`);
      document.getElementById('form-exchange-withdraw')?.reset();
      this.fetchUserFreshData();
      this.switchExchangeTab('orders');
    } catch (err) {
      alert(err.message);
    }
  },

  renderUserExchangeOrders() {
    const user = window.PayWellAuth.currentUser;
    const container = document.getElementById('exchange-user-orders-list');
    if (!container || !user) return;

    const allOrders = window.PayWellDB.getExchangeOrders();
    const userOrders = allOrders.filter(o => o.username.toLowerCase() === user.username.toLowerCase());

    if (userOrders.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted);">No exchange orders submitted yet.</div>`;
      return;
    }

    container.innerHTML = userOrders.map(o => `
      <div class="glass-card" style="padding:12px; border-left:4px solid ${o.type === 'deposit' ? 'var(--primary-green)' : 'var(--gold-accent)'};">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <div style="font-weight:700; font-size:12px; color:var(--text-primary);">${o.type === 'deposit' ? '📥 DEPOSIT' : '📤 WITHDRAWAL'} #${o.orderId}</div>
          <span style="font-size:10px; font-weight:700; color:${o.status === 'pending' ? 'var(--gold-accent)' : o.status === 'done' ? 'var(--primary-green)' : 'var(--red-alert)'};">${o.status.toUpperCase()}</span>
        </div>
        <div style="font-size:11px; color:var(--text-muted);">
          Amount: ${o.amountPW} PW | Fee: ${o.feeKS} KS | Total: ${o.totalKS} KS
        </div>
        <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">Date: ${o.created_at}</div>
      </div>
    `).join('');
  },

  openSavingsModal() {
    this.renderSavingsUI();
    window.PayWellRouter.openModal('modal-savings');
  },

  renderSavingsUI() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const savings = window.PayWellDB.getUserSavings(user.username);
    const basicBal = savings.basic.balance || 0;
    const fixedBal = savings.fixed.balance || 0;
    const premBal = savings.premium.balance || 0;
    const total = basicBal + fixedBal + premBal;

    const totalEl = document.getElementById('savings-total-val');
    const basicEl = document.getElementById('save-bal-basic');
    const fixedEl = document.getElementById('save-bal-fixed');
    const premEl = document.getElementById('save-bal-premium');

    if (totalEl) totalEl.textContent = `${total.toFixed(2)} PW`;
    if (basicEl) basicEl.textContent = `${basicBal.toFixed(2)} PW`;
    if (fixedEl) fixedEl.textContent = `${fixedBal.toFixed(2)} PW`;
    if (premEl) premEl.textContent = `${premBal.toFixed(2)} PW`;
  },

  promptSavingsAction(planType, action) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const verb = action === 'deposit' ? 'Deposit into' : 'Withdraw from';
    const amountStr = prompt(`Enter PW amount to ${verb} ${planType.toUpperCase()} Savings Vault:`);
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid PW amount.");
      return;
    }

    try {
      if (action === 'deposit') {
        const res = window.PayWellDB.depositSavings(user.username, planType, amount);
        alert(`💰 Deposited ${amount.toFixed(2)} PW into ${planType.toUpperCase()} Savings Vault!`);
      } else {
        const res = window.PayWellDB.withdrawSavings(user.username, planType, amount);
        alert(`💰 Withdrew ${res.netWithdraw.toFixed(2)} PW from ${planType.toUpperCase()} Savings Vault!${res.fee > 0 ? ` (Early Fee: ${res.fee.toFixed(2)} PW)` : ''}`);
      }
      this.fetchUserFreshData();
      this.renderSavingsUI();
    } catch (err) {
      alert(err.message);
    }
  },

  openCustomizationModal() {
    this.loadCustomizationCatalog();
    window.PayWellRouter.openModal('modal-customization');
  },

  loadCustomizationCatalog() {
    const catalog = window.PayWellDB.getCustomizationCatalog();
    const container = document.getElementById('cust-catalog-grid');
    if (!container) return;

    container.innerHTML = catalog.map(item => `
      <div class="glass-card" style="padding:14px; display:flex; justify-content:space-between; align-items:center;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div style="font-size:32px;">${item.icon}</div>
          <div>
            <div style="font-weight:700; font-size:13px; color:var(--text-primary);">${item.name}</div>
            <div style="font-size:10px; color:var(--gold-accent); font-weight:700;">${item.rarity} • ${item.category.toUpperCase()}</div>
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:var(--font-mono); font-weight:800; font-size:13px; color:var(--primary-green); margin-bottom:4px;">${item.price.toLocaleString()} PW</div>
          <button onclick="PayWellApp.buyCustomization('${item.id}')" class="btn btn-primary" style="padding:6px 10px; font-size:11px;">Buy & Equip</button>
        </div>
      </div>
    `).join('');
  },

  buyCustomization(itemId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      const res = window.PayWellDB.buyCustomizationItem(user.username, itemId);
      alert(`🎉 Purchased ${res.item.name}! Applied to your profile.`);
      this.fetchUserFreshData();
      window.PayWellRouter.closeModal('modal-customization');
    } catch (err) {
      alert(err.message);
    }
  },

  openIDCardModal() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const avatar = document.getElementById('idcard-avatar');
    const username = document.getElementById('idcard-username');
    const usercode = document.getElementById('idcard-usercode');
    const joined = document.getElementById('idcard-joined');
    const qrCanvas = document.getElementById('idcard-qr-canvas');

    if (avatar) avatar.src = user.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`;
    if (username) username.textContent = `@${user.username}`;
    if (usercode) usercode.textContent = `ID: ${user.user_code || '#00001'}`;
    if (joined) joined.textContent = `Member Since: ${user.created_at || '2026'}`;

    if (qrCanvas && window.QRCode) {
      qrCanvas.innerHTML = "";
      new window.QRCode(qrCanvas, {
        text: `paywell:${user.user_code || user.username}`,
        width: 120,
        height: 120,
        colorDark: "#0A0A0F",
        colorLight: "#FFFFFF"
      });
    }

    window.PayWellRouter.openModal('modal-idcard');
  },

  openEditProfileModal() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const newName = prompt("Enter new username:", user.username);
    if (!newName || newName.trim() === user.username) return;

    const cleanName = newName.trim();
    try {
      const updated = window.PayWellDB.updateUserProfile(user.username, { username: cleanName });
      window.PayWellAuth.setUser(updated);
      this.updateProfileUI();
      alert(`Username successfully updated to @${cleanName}`);
    } catch (err) {
      alert(err.message);
    }
  },

  exportPersonalBackup() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const backupData = {
      paywell_version: "2.0",
      export_date: new Date().toISOString(),
      profile: {
        username: user.username,
        email: user.email,
        password_hash: user.password_hash,
        sec_pin_hash: user.sec_pin_hash,
        telegram_id: user.telegram_id,
        avatar_url: user.avatar_url
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `PayWell-Backup-${user.username}.json`);
    document.body.appendChild(dlAnchor);
    dlAnchor.click();
    dlAnchor.remove();
  },

  restorePersonalBackup(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        if (!backup.profile || !backup.profile.username) {
          throw new Error("Invalid PayWell backup file format.");
        }

        let user = window.PayWellDB.findUser(backup.profile.username);
        if (!user) {
          user = window.PayWellDB.registerUser(backup.profile.username, backup.profile.email, 'TempRestore123!', backup.profile.telegram_id);
        }

        user.password_hash = backup.profile.password_hash || user.password_hash;
        user.sec_pin_hash = backup.profile.sec_pin_hash || user.sec_pin_hash;
        user.email = backup.profile.email || user.email;
        user.avatar_url = backup.profile.avatar_url || user.avatar_url;

        window.PayWellDB.saveUsers(window.PayWellDB.getUsers());
        window.PayWellAuth.setUser(user);
        this.updateProfileUI();
        alert(`💾 Account backup for @${user.username} successfully restored!`);
      } catch (err) {
        alert("Failed to restore backup: " + err.message);
      }
    };
    reader.readAsText(file);
  },

  logoutAllOtherDevices() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    let deviceName = "Unknown Web Browser";
    if (navigator.userAgent.includes("Android")) deviceName = "Android Mobile (PayWell App)";
    else if (navigator.userAgent.includes("iPhone") || navigator.userAgent.includes("iPad")) deviceName = "iOS Device (PayWell Mini App)";
    else if (navigator.userAgent.includes("Macintosh")) deviceName = "macOS Workstation";
    else if (navigator.userAgent.includes("Windows")) deviceName = "Windows PC / Chrome";
    else if (navigator.userAgent.includes("Linux")) deviceName = "Linux Terminal Deck";

    const currentDevId = `DEV-${window.PayWellDB.hash(deviceName + navigator.userAgent).slice(0, 8)}`;

    const pin = prompt("🔐 GLOBAL SECURITY RESET:\nEnter 6-Digit Security PIN to terminate ALL OTHER active device sessions:");
    if (!pin) return;

    try {
      window.PayWellDB.removeAllOtherDevices(user.username, currentDevId, pin);
      alert("🔄 All other device sessions terminated successfully! This device is now your primary active session.");
      this.renderSettingsDevices();
    } catch (err) {
      alert(err.message);
    }
  },

  switchSettingsTab(tab) {
    const secBtn = document.getElementById('set-tab-btn-sec');
    const devBtn = document.getElementById('set-tab-btn-dev');
    const verBtn = document.getElementById('set-tab-btn-ver');

    const secTab = document.getElementById('set-tab-sec');
    const devTab = document.getElementById('set-tab-dev');
    const verTab = document.getElementById('set-tab-ver');

    secBtn?.classList.remove('btn-primary'); secBtn?.classList.add('btn-glass');
    devBtn?.classList.remove('btn-primary'); devBtn?.classList.add('btn-glass');
    verBtn?.classList.remove('btn-primary'); verBtn?.classList.add('btn-glass');

    if (secTab) secTab.style.display = 'none';
    if (devTab) devTab.style.display = 'none';
    if (verTab) verTab.style.display = 'none';

    if (tab === 'sec') {
      secBtn?.classList.add('btn-primary'); secBtn?.classList.remove('btn-glass');
      if (secTab) secTab.style.display = 'block';
    } else if (tab === 'dev') {
      devBtn?.classList.add('btn-primary'); devBtn?.classList.remove('btn-glass');
      if (devTab) devTab.style.display = 'block';
      this.renderSettingsDevices();
    } else if (tab === 'ver') {
      verBtn?.classList.add('btn-primary'); verBtn?.classList.remove('btn-glass');
      if (verTab) verTab.style.display = 'block';
    }
  },

  saveSecurityPin() {
    const pinInput = document.getElementById('set-sec-pin');
    const pin = pinInput?.value?.trim();
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      const updated = window.PayWellDB.setUserSecurityPin(user.username, pin);
      window.PayWellAuth.setUser(updated);
      alert("6-Digit Security PIN successfully set! 2FA is now active.");
      if (pinInput) pinInput.value = '';
    } catch (err) {
      alert(err.message);
    }
  },

  togglePasskey() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const newState = !user.passkey_enabled;
    try {
      const updated = window.PayWellDB.updateUserProfile(user.username, { passkey_enabled: newState });
      window.PayWellAuth.setUser(updated);
      const btn = document.getElementById('btn-toggle-passkey');
      if (btn) btn.textContent = newState ? "Enabled (Active)" : "Enable";
      alert(newState ? "Passkey biometric auth successfully registered!" : "Passkey biometric auth disabled.");
    } catch (err) {
      alert(err.message);
    }
  },

  renderSettingsDevices() {
    const user = window.PayWellAuth.currentUser;
    const container = document.getElementById('settings-devices-list');
    if (!container || !user) return;

    const devices = window.PayWellDB.getUserDevices(user.username);
    if (devices.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted);">No active device sessions.</div>`;
      return;
    }

    container.innerHTML = devices.map(d => {
      const isPrimary = d.isPrimary;
      const canManage = window.PayWellDB.canDeviceManagePermissions(user.username, d.id);

      return `
        <div class="glass-card" style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
          <div>
            <div style="font-weight:700; font-size:12px; color:var(--text-primary); display:flex; align-items:center; gap:6px;">
              📱 ${d.name} ${isPrimary ? '<span style="font-size:10px; background:rgba(0,230,118,0.2); color:var(--primary-green); padding:2px 6px; border-radius:8px;">MASTER DEVICE</span>' : ''}
            </div>
            <div style="font-size:10px; color:var(--text-muted); margin-top:2px;">
              IP: ${d.ip} | Last Active: ${d.lastActive}
            </div>
            <div style="font-size:10px; color:${canManage ? 'var(--primary-green)' : 'var(--gold-accent)'}; margin-top:2px;">
              ${canManage ? '✓ Full Permission Granted' : '⏳ Secondary Device (15 Days Tenure Required)'}
            </div>
          </div>
          <button onclick="PayWellApp.removeDeviceSession('${d.id}')" class="btn btn-danger" style="width:auto; padding:6px 10px; font-size:11px;">
            Remove
          </button>
        </div>
      `;
    }).join('');
  },

  removeDeviceSession(targetDevId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const pin = prompt("🔐 SECURITY CONFIRMATION REQUIRED:\nEnter your 6-Digit Security PIN to terminate this device session:");
    if (!pin) return;

    try {
      window.PayWellDB.removeDeviceSession(user.username, targetDevId, pin);
      alert("Device session successfully removed!");
      this.renderSettingsDevices();
    } catch (err) {
      alert(err.message);
    }
  },

  renderDailyRewardsAndQuests(username) {
    const rewardsState = window.PayWellDB.getDailyRewardState(username);
    const streakBadge = document.getElementById('daily-streak-badge');
    if (streakBadge) {
      streakBadge.innerText = `Streak: ${rewardsState.streak || 0} Days`;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const isAlreadyClaimedToday = (rewardsState.lastClaimDate === todayStr);

    const trackContainer = document.getElementById('daily-days-track');
    if (trackContainer) {
      const amounts = window.PayWellDB.REWARD_DAYS;
      const currentNextDay = isAlreadyClaimedToday ? rewardsState.streak : (rewardsState.streak % 7) + 1;

      trackContainer.innerHTML = amounts.map((amt, idx) => {
        const dayNum = idx + 1;
        let isClaimed = dayNum <= rewardsState.streak && isAlreadyClaimedToday;
        let isCurrent = dayNum === currentNextDay && !isAlreadyClaimedToday;

        let bg = 'rgba(255,255,255,0.05)';
        let border = '1px solid rgba(255,255,255,0.1)';
        let color = 'var(--text-muted)';
        let icon = `${amt}PW`;

        if (isClaimed) {
          bg = 'rgba(0, 230, 118, 0.15)';
          border = '1px solid var(--primary-green)';
          color = 'var(--primary-green)';
          icon = '✅';
        } else if (isCurrent) {
          bg = 'rgba(255, 215, 0, 0.2)';
          border = '1px solid var(--gold-accent)';
          color = 'var(--gold-accent)';
        }

        return `
          <div style="background:${bg}; border:${border}; border-radius:8px; padding:6px 2px;">
            <div style="font-size:10px; color:${color}; font-weight:700;">D${dayNum}</div>
            <div style="font-size:10px; font-weight:700; color:var(--text-primary); margin-top:2px;">${icon}</div>
          </div>
        `;
      }).join('');
    }

    const claimBtn = document.getElementById('btn-claim-daily');
    if (claimBtn) {
      if (isAlreadyClaimedToday) {
        claimBtn.disabled = true;
        claimBtn.innerText = "✅ Daily Reward Claimed Today";
        claimBtn.style.opacity = "0.6";
      } else {
        claimBtn.disabled = false;
        const nextDay = (rewardsState.streak % 7) + 1;
        const nextAmt = window.PayWellDB.REWARD_DAYS[nextDay - 1];
        claimBtn.innerText = `🎁 Claim Day ${nextDay} Reward (+${nextAmt} PW)`;
        claimBtn.style.opacity = "1";
      }
    }

    const quests = window.PayWellDB.getQuests(username);
    const questList = document.getElementById('daily-quests-list');
    if (questList) {
      questList.innerHTML = quests.map(q => {
        const isDone = q.progress >= q.req;
        return `
          <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-size:13px; font-weight:600; color:var(--text-primary);">${q.title}</div>
              <div style="font-size:11px; color:var(--primary-green); font-weight:700;">+${q.reward} PW</div>
            </div>
            <div>
              ${q.isClaimed
                ? `<span style="font-size:11px; color:var(--primary-green); font-weight:700;">✅ Claimed</span>`
                : isDone
                  ? `<button onclick="PayWellApp.claimQuest('${q.id}')" class="btn btn-primary" style="padding:4px 10px; font-size:11px;">Claim</button>`
                  : `<span style="font-size:11px; color:var(--text-muted);">${q.progress}/${q.req}</span>`
              }
            </div>
          </div>
        `;
      }).join('');
    }
  },

  claimDailyReward() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      const res = window.PayWellDB.claimDailyReward(user.username);
      alert(`🎉 Claimed ${res.rewardAmount} PW for Day ${res.streak}!${res.bonusMsg}`);
      this.fetchUserFreshData();
      this.renderDailyRewardsAndQuests(user.username);
    } catch (err) {
      alert(err.message || "Could not claim daily reward.");
    }
  },

  claimQuest(questId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      const res = window.PayWellDB.claimQuestReward(user.username, questId);
      alert(`🎉 Quest completed! Reward: +${res.reward} PW`);
      this.fetchUserFreshData();
      this.renderDailyRewardsAndQuests(user.username);
    } catch (err) {
      alert(err.message || "Could not claim quest reward.");
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

  activeTxCategoryFilter: 'all',

  filterTransactions(cat) {
    this.activeTxCategoryFilter = cat;
    ['all', 'sent', 'received', 'store', 'rewards'].forEach(c => {
      const btn = document.getElementById(`tx-filter-${c}`);
      if (btn) {
        if (c === cat) {
          btn.classList.add('btn-primary');
          btn.classList.remove('btn-glass');
        } else {
          btn.classList.remove('btn-primary');
          btn.classList.add('btn-glass');
        }
      }
    });

    const user = window.PayWellAuth.currentUser;
    if (user) {
      this.loadRecentTransactions(user.username);
    }
  },

  loadRecentTransactions(username) {
    const rawTxs = window.PayWellDB.getTransactions(username);
    const container = document.getElementById('recent-tx-list');
    const fullContainer = document.getElementById('full-tx-list');

    const filter = this.activeTxCategoryFilter || 'all';
    let filteredTxs = rawTxs;

    if (filter === 'sent') {
      filteredTxs = rawTxs.filter(t => t.sender_username.toLowerCase() === username.toLowerCase() && t.type === 'transfer');
    } else if (filter === 'received') {
      filteredTxs = rawTxs.filter(t => t.receiver_username.toLowerCase() === username.toLowerCase() && t.type === 'transfer');
    } else if (filter === 'store') {
      filteredTxs = rawTxs.filter(t => t.type === 'store_purchase' || t.type === 'token_purchase' || t.type === 'pft_purchase' || t.type === 'auction_bid');
    } else if (filter === 'rewards') {
      filteredTxs = rawTxs.filter(t => t.type === 'daily_reward' || t.type === 'quest_reward' || t.type.includes('owner'));
    }

    const renderEmptyState = () => `
      <div class="glass-card" style="text-align:center; padding:32px 20px; margin:20px 0;">
        <div style="font-size:48px; margin-bottom:12px;">💸</div>
        <div style="font-weight:800; font-size:16px; color:var(--text-primary); margin-bottom:6px;">No ${filter !== 'all' ? filter.toUpperCase() : ''} Transactions Recorded</div>
        <div style="font-size:12px; color:var(--text-muted); margin-bottom:20px;">Send community tokens to friends, buy NEXORA passes, or claim daily quests to start building your ledger!</div>
        <div style="display:flex; justify-content:center; gap:10px;">
          <button onclick="PayWellRouter.openModal('modal-send')" class="btn btn-primary" style="padding:8px 14px; font-size:12px;">📤 Send PW</button>
          <button onclick="PayWellApp.claimDailyReward()" class="btn btn-gold" style="padding:8px 14px; font-size:12px;">🎁 Claim Reward</button>
        </div>
      </div>
    `;

    if (!rawTxs || rawTxs.length === 0) {
      if (container) container.innerHTML = renderEmptyState();
      if (fullContainer) fullContainer.innerHTML = renderEmptyState();
      return;
    }

    const renderTxCard = (tx) => {
      const isIncoming = tx.receiver_username.toLowerCase() === username.toLowerCase();
      const sign = isIncoming ? '+' : '-';
      const color = isIncoming ? 'var(--primary-green)' : 'var(--red-alert)';

      let icon = isIncoming ? '📥' : '📤';
      if (tx.type === 'daily_reward' || tx.type === 'quest_reward') icon = '🎁';
      else if (tx.type === 'store_purchase' || tx.type === 'pft_purchase') icon = '🎨';
      else if (tx.type === 'token_purchase') icon = '🎮';
      else if (tx.type === 'auction_bid') icon = '🏛️';

      return `
        <div class="glass-card" style="padding:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center; cursor:pointer;" onclick="PayWellApp.openReceiptModal('${tx.id}', '${tx.sender_username}', '${tx.receiver_username}', ${tx.amount}, '${tx.created_at}')">
          <div style="display:flex; align-items:center; gap:12px;">
            <div style="width:40px; height:40px; border-radius:50%; background:rgba(255,255,255,0.05); border:1px solid var(--border-glass); display:flex; align-items:center; justify-content:center; font-size:20px;">
              ${icon}
            </div>
            <div>
              <div style="font-weight:700; font-size:13px; color:var(--text-primary);">
                ${isIncoming ? `From @${tx.sender_username}` : `To @${tx.receiver_username}`}
              </div>
              <div style="font-size:10px; color:var(--text-muted); font-family:var(--font-mono); margin-top:2px;">
                ${tx.id} • ${tx.created_at || 'Just now'}
              </div>
              ${tx.note ? `<div style="font-size:10px; color:var(--gold-accent); margin-top:2px;">📝 ${tx.note}</div>` : ''}
            </div>
          </div>
          <div style="text-align:right;">
            <div style="font-family:var(--font-mono); font-weight:800; font-size:15px; color:${color};">
              ${sign}${tx.amount.toFixed(2)} PW
            </div>
            <div style="font-size:10px; color:var(--primary-green); font-weight:700;">✓ VERIFIED</div>
          </div>
        </div>
      `;
    };

    if (container) {
      container.innerHTML = rawTxs.slice(0, 5).map(renderTxCard).join('');
    }
    if (fullContainer) {
      if (filteredTxs.length === 0) {
        fullContainer.innerHTML = renderEmptyState();
      } else {
        fullContainer.innerHTML = filteredTxs.map(renderTxCard).join('');
      }
    }
  },

  switchStoreCategory(category) {
    const secPets = document.getElementById('store-pets-section');
    const secNexora = document.getElementById('store-nexora-section');
    const secPft = document.getElementById('store-pft-section');
    const secAuc = document.getElementById('store-auction-section');
    const secItems = document.getElementById('store-items-section');
    const secInv = document.getElementById('store-inventory-section');

    const tabPets = document.getElementById('store-tab-pets');
    const tabNexora = document.getElementById('store-tab-nexora');
    const tabPft = document.getElementById('store-tab-pft');
    const tabAuc = document.getElementById('store-tab-auction');
    const tabItems = document.getElementById('store-tab-items');
    const tabInv = document.getElementById('store-tab-inventory');

    if (secPets) secPets.style.display = category === 'pets' ? 'block' : 'none';
    if (secNexora) secNexora.style.display = category === 'nexora' ? 'block' : 'none';
    if (secPft) secPft.style.display = category === 'pft' ? 'block' : 'none';
    if (secAuc) secAuc.style.display = category === 'auction' ? 'block' : 'none';
    if (secItems) secItems.style.display = category === 'items' ? 'block' : 'none';
    if (secInv) secInv.style.display = category === 'inventory' ? 'block' : 'none';

    if (tabNexora) tabNexora.className = category === 'nexora' ? 'btn btn-primary' : 'btn btn-glass';
    if (tabPft) tabPft.className = category === 'pft' ? 'btn btn-primary' : 'btn btn-glass';
    if (tabAuc) tabAuc.className = category === 'auction' ? 'btn btn-primary' : 'btn btn-glass';
    if (tabItems) tabItems.className = category === 'items' ? 'btn btn-primary' : 'btn btn-glass';
    if (tabInv) tabInv.className = category === 'inventory' ? 'btn btn-primary' : 'btn btn-glass';

    if (category === 'pft') {
      this.loadPFTShop();
    } else if (category === 'auction') {
      this.loadAuctionMarket();
    } else if (category === 'inventory') {
      this.loadUserInventory();
    }
  },

  loadAuctionMarket() {
    const auctions = window.PayWellDB.getAuctions();
    const container = document.getElementById('pft-auctions-grid');
    if (!container) return;

    if (!auctions || auctions.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No active auctions right now.</div>`;
      return;
    }

    container.innerHTML = auctions.map(a => `
      <div class="glass-card" style="padding:16px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <div style="font-weight:700; font-size:15px; color:var(--gold-accent);">${a.title}</div>
          <span style="font-size:10px; font-weight:700; background:rgba(255,215,0,0.15); color:var(--gold-accent); padding:2px 8px; border-radius:10px;">${a.rarity}</span>
        </div>

        <div style="font-size:12px; color:var(--text-muted); margin-bottom:12px;">
          Top Bidder: <strong style="color:var(--primary-green);">@${a.highestBidder}</strong> (${a.bidsCount} bids)
        </div>

        <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:10px; border-radius:8px; margin-bottom:12px;">
          <div>
            <div style="font-size:10px; color:var(--text-muted);">CURRENT HIGHEST BID</div>
            <div style="font-family:var(--font-mono); font-size:18px; font-weight:800; color:var(--primary-green);">${a.currentBid.toLocaleString()} PW</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:10px; color:var(--text-muted);">TIME REMAINING</div>
            <div style="font-size:11px; font-weight:700; color:var(--text-primary);">${a.endTime}</div>
          </div>
        </div>

        <div style="display:flex; gap:8px;">
          <input type="number" id="bid-input-${a.id}" placeholder="Min > ${a.currentBid}" class="glow-input" style="flex:1; padding:8px; font-size:12px;">
          <button onclick="PayWellApp.placeAuctionBid('${a.id}')" class="btn btn-gold" style="padding:8px 16px; font-size:12px;">Place Bid</button>
        </div>
      </div>
    `).join('');
  },

  placeAuctionBid(auctionId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const input = document.getElementById(`bid-input-${auctionId}`);
    const amount = parseFloat(input ? input.value : 0);

    try {
      const res = window.PayWellDB.placeBid(user.username, auctionId, amount);
      alert(`🎉 Bid of ${amount} PW placed successfully on ${res.auction.title}!`);
      this.fetchUserFreshData();
      this.loadAuctionMarket();
    } catch (e) {
      alert(e.message || "Bidding failed.");
    }
  },

  loadPFTShop() {
    const items = window.PayWellDB.getPFTItems();
    const container = document.getElementById('pft-items-grid');
    if (!container) return;

    container.innerHTML = items.map(p => `
      <div class="glass-card" style="padding:16px; text-align:center; position:relative;">
        <div style="font-size:36px; margin-bottom:6px;">${p.icon}</div>
        <div style="font-weight:700; font-size:13px; color:var(--text-primary); margin-bottom:2px;">${p.name}</div>
        <div style="font-size:10px; font-weight:700; color:var(--gold-accent); margin-bottom:8px;">${p.rarity} | ${p.category.toUpperCase()}</div>
        <div style="font-family:var(--font-mono); font-weight:800; color:var(--primary-green); font-size:14px; margin-bottom:10px;">
          ${p.price.toLocaleString()} PW
        </div>
        <button onclick="PayWellApp.buyPFT('${p.id}')" class="btn btn-primary" style="padding:8px; font-size:12px; width:100%;">
          Buy PFT
        </button>
      </div>
    `).join('');
  },

  buyPFT(pftId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      const res = window.PayWellDB.buyPFTItem(user.username, pftId);
      alert(`🎉 Purchased PFT Decoration: ${res.item.name}!`);
      this.fetchUserFreshData();
      this.loadPFTShop();
      this.loadUserInventory();
    } catch (e) {
      alert(e.message || "Purchase failed.");
    }
  },

  loadNexoraTokens() {
    const tokens = window.PayWellDB.getNexoraTokens();
    const container = document.getElementById('nexora-tokens-grid');
    if (!container) return;

    container.innerHTML = tokens.map(t => `
      <div class="glass-card" style="padding:16px; text-align:center; position:relative; border-top: 3px solid ${t.color};">
        <div style="font-size:36px; margin-bottom:6px;">${t.icon}</div>
        <div style="font-weight:700; font-size:13px; color:var(--text-primary); margin-bottom:4px;">${t.name}</div>
        <div style="font-size:11px; color:var(--text-muted); margin-bottom:10px;">${t.duration}</div>
        <div style="font-family:var(--font-mono); font-weight:800; color:${t.color}; font-size:15px; margin-bottom:10px;">
          ${t.price.toLocaleString()} PW
        </div>
        <button onclick="PayWellApp.buyNexoraToken('${t.id}')" class="btn btn-primary" style="padding:8px; font-size:12px; width:100%;">
          Purchase Pass
        </button>
      </div>
    `).join('');
  },

  buyNexoraToken(tokenId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      const res = window.PayWellDB.buyNexoraToken(user.username, tokenId);
      alert(`🎉 Successfully purchased ${res.token.name}! Pass added to your Inventory.`);
      this.fetchUserFreshData();
      this.loadNexoraTokens();
      this.loadUserInventory();
    } catch (e) {
      alert(e.message || "Purchase failed.");
    }
  },

  loadUserInventory() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const inv = window.PayWellDB.getUserInventory(user.username);
    const container = document.getElementById('user-inventory-tokens');
    if (!container) return;

    const hasTokens = inv.tokens && inv.tokens.length > 0;
    const hasPfts = inv.pfts && inv.pfts.length > 0;

    if (!hasTokens && !hasPfts) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted);">No active passes, tokens, or PFT decorations in your inventory.</div>`;
      return;
    }

    let html = "";
    if (hasTokens) {
      html += `
        <div style="font-weight:700; font-size:14px; margin-bottom:10px; color:var(--gold-accent);">🎟️ Purchased NEXORA Passes</div>
        <div style="display:flex; flex-direction:column; gap:10px; margin-bottom:20px;">
          ${inv.tokens.map(item => `
            <div class="glass-card" style="padding:12px 16px; display:flex; justify-content:space-between; align-items:center; border-left:4px solid ${item.color};">
              <div>
                <div style="font-weight:700; font-size:13px; color:var(--text-primary);">${item.icon} ${item.name}</div>
                <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Purchased: ${item.purchasedAt}</div>
                <div style="font-size:10px; color:${item.color}; margin-top:2px; font-weight:600;">
                  ${item.expiresAt ? `Expires: ${item.expiresAt === 'LIFETIME' ? 'Never (Lifetime)' : new Date(item.expiresAt).toLocaleDateString()}` : `Uses: ${item.usesLeft || 1}`}
                </div>
              </div>
              <div>
                <button onclick="PayWellApp.toggleTokenActive('${item.instanceId}')" class="btn ${item.active ? 'btn-primary' : 'btn-glass'}" style="padding:6px 10px; font-size:11px;">
                  ${item.active ? 'Active 🟢' : 'Inactive ⚪'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    if (hasPfts) {
      html += `
        <div style="font-weight:700; font-size:14px; margin-bottom:10px; color:var(--gold-accent);">🎨 Owned PFT Decorations</div>
        <div style="display:flex; flex-direction:column; gap:10px;">
          ${inv.pfts.map(p => `
            <div class="glass-card" style="padding:12px 16px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <div style="font-weight:700; font-size:13px; color:var(--text-primary);">${p.icon} ${p.name}</div>
                <div style="font-size:10px; color:var(--gold-accent); margin-top:2px;">${p.rarity} | ${p.category.toUpperCase()}</div>
              </div>
              <div>
                <button onclick="PayWellApp.toggleEquipPFT('${p.instanceId}')" class="btn ${p.equipped ? 'btn-gold' : 'btn-glass'}" style="padding:6px 10px; font-size:11px;">
                  ${p.equipped ? 'Equipped ✨' : 'Equip'}
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }

    container.innerHTML = html;
  },

  toggleEquipPFT(instanceId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    window.PayWellDB.equipPFTItem(user.username, instanceId);
    this.loadUserInventory();
  },

  toggleTokenActive(instanceId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    window.PayWellDB.toggleTokenStatus(user.username, instanceId);
    this.loadUserInventory();
  },

  loadStoreItems() {
    this.loadNexoraTokens();

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
    const pin = document.getElementById('send-pin').value.trim();

    if (!pin) {
      alert("Please enter your 6-Digit Security PIN to authorize transfer.");
      return;
    }

    try {
      const res = window.PayWellDB.transfer(user.username, receiver, amount, pin, note);
      window.PayWellRouter.closeModal('modal-send');
      document.getElementById('send-pin').value = '';
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

  exportQR() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const container = document.getElementById('receipt-qr-canvas');
    if (container && window.QRCode) {
      container.innerHTML = "";
      new window.QRCode(container, {
        text: `PAYWELL:USER:${user.username}`,
        width: 150,
        height: 150,
        colorDark: "#0A0A0F",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
    window.PayWellRouter.openModal('modal-receive');
  },

  downloadQRImage() {
    const container = document.getElementById('receipt-qr-canvas');
    const img = container ? container.querySelector('img') || container.querySelector('canvas') : null;
    if (!img) {
      alert("QR code image not found.");
      return;
    }
    const url = img.src || (img.toDataURL ? img.toDataURL("image/png") : null);
    if (!url) {
      alert("Unable to generate image download URL.");
      return;
    }
    const link = document.createElement('a');
    link.href = url;
    link.download = `PayWell-QR-${window.PayWellAuth.currentUser?.username || 'wallet'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  copyPayLink() {
    const username = window.PayWellAuth.currentUser?.username || '';
    const payLink = `https://t.me/PayWellBot?start=pay_${username}`;
    navigator.clipboard.writeText(payLink).then(() => {
      alert(`PayLink copied to clipboard!\n${payLink}`);
    }).catch(() => {
      alert(`PayLink: ${payLink}`);
    });
  },

  handleQRFileUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (window.jsQR) {
          const code = window.jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            this.processScannedQRData(code.data);
          } else {
            alert("No valid PayWell QR code found in the selected image.");
          }
        } else {
          alert("QR parser engine not ready. Please try again.");
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input
  },

  processScannedQRData(data) {
    // Format expected: PAYWELL:USER:username OR PAYWELL:PAY:username:amount
    if (!data.startsWith('PAYWELL:')) {
      alert(`Scanned QR is not a PayWell format:\n${data}`);
      return;
    }

    const parts = data.split(':');
    if (parts[1] === 'USER' || parts[1] === 'PAY') {
      const targetUser = parts[2];
      const amount = parts[3] ? parseFloat(parts[3]) : '';

      document.getElementById('send-receiver').value = targetUser;
      if (amount) {
        document.getElementById('send-amount').value = amount;
      }
      window.PayWellRouter.openModal('modal-send');
      alert(`✨ Imported QR for @${targetUser}!`);
    } else {
      alert(`Unrecognized PayWell QR contents: ${data}`);
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
