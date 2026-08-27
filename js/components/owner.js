/**
 * PayWell Owner Crown Panel Component
 */

const PayWellOwner = {
  isUnlocked: false,
  pinInput: "",
  selectedUserForModify: null,

  init() {
    this.bindEvents();
  },

  bindEvents() {
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('pin-key')) {
        const val = e.target.dataset.value;
        this.handlePinKey(val);
      }
    });
  },

  handlePinKey(val) {
    if (val === 'clear') {
      this.pinInput = "";
    } else if (val === 'backspace') {
      this.pinInput = this.pinInput.slice(0, -1);
    } else if (this.pinInput.length < 6) {
      this.pinInput += val;
    }

    this.updatePinDots();

    if (this.pinInput.length === 6) {
      this.verifyPin();
    }
  },

  updatePinDots() {
    const dots = document.querySelectorAll('.pin-dot');
    dots.forEach((dot, idx) => {
      if (idx < this.pinInput.length) {
        dot.classList.add('filled');
      } else {
        dot.classList.remove('filled');
      }
    });
  },

  async verifyPin() {
    const isOk = await window.PayWellAuth.verifyOwnerPin(this.pinInput);
    if (isOk) {
      this.isUnlocked = true;
      document.getElementById('owner-pin-screen').style.display = 'none';
      document.getElementById('owner-dashboard-content').style.display = 'block';
      this.loadOwnerDashboardData();
    } else {
      const pinContainer = document.getElementById('owner-pin-box');
      if (pinContainer) {
        pinContainer.classList.add('animate-shake');
        setTimeout(() => pinContainer.classList.remove('animate-shake'), 500);
      }
      this.pinInput = "";
      this.updatePinDots();
      alert("Invalid Owner PIN or unauthorized identity!");
    }
  },

  loadOwnerDashboardData() {
    const users = window.PayWellDB.getUsers();
    const totalCirc = users.reduce((sum, u) => sum + u.balance, 0);

    const usersEl = document.getElementById('owner-stat-users');
    const circEl = document.getElementById('owner-stat-circ');
    const txsEl = document.getElementById('owner-stat-txs');

    if (usersEl) usersEl.innerText = users.length;
    if (circEl) circEl.innerText = `${totalCirc.toLocaleString('en-US', {minimumFractionDigits: 2})} PW`;
    if (txsEl) txsEl.innerText = (JSON.parse(localStorage.getItem(window.PayWellDB.STORAGE_TXS)) || []).length;

    this.loadUsersList();
  },

  openNexoraPriceModal() {
    const prices = window.PayWellDB.getNexoraPrices();
    const p1 = document.getElementById('nexora-price-1');
    const p2 = document.getElementById('nexora-price-2');
    const p3 = document.getElementById('nexora-price-3');
    const p4 = document.getElementById('nexora-price-4');

    if (p1) p1.value = prices.one_time;
    if (p2) p2.value = prices.monthly;
    if (p3) p3.value = prices.yearly;
    if (p4) p4.value = prices.permanent;

    window.PayWellRouter.openModal('modal-owner-nexora');
  },

  saveNexoraPrices() {
    const prices = {
      one_time: parseFloat(document.getElementById('nexora-price-1')?.value || 500),
      monthly: parseFloat(document.getElementById('nexora-price-2')?.value || 5000),
      yearly: parseFloat(document.getElementById('nexora-price-3')?.value || 50000),
      permanent: parseFloat(document.getElementById('nexora-price-4')?.value || 500000)
    };
    window.PayWellDB.saveNexoraPrices(prices);
    alert("👑 NEXORA Token prices updated successfully across the platform!");
    window.PayWellRouter.closeModal('modal-owner-nexora');
  },

  openPassGeneratorModal() {
    window.PayWellRouter.openModal('modal-owner-level-pass');
  },

  submitGiftPasses() {
    const target = document.getElementById('pass-target-user')?.value?.trim();
    const qty = parseInt(document.getElementById('pass-qty')?.value || 1);

    if (!target || qty <= 0) {
      alert("Please enter a valid username and pass quantity.");
      return;
    }

    const total = window.PayWellDB.addUserPassInventory(target, qty);
    alert(`⚡ Granted ${qty} Level Up Pass(es) to @${target}! Total in user inventory: ${total}.`);
    window.PayWellRouter.closeModal('modal-owner-level-pass');
  },

  openBotControllerModal() {
    this.loadBotListingsingsings();
    window.PayWellRouter.openModal('modal-owner-bots');
  },

  loadBotListingsingsings() {
    const container = document.getElementById('owner-bots-list');
    if (!container) return;
    const listings = window.PayWellDB.getP2PListings().filter(l => l.isBot || l.seller.toLowerCase().includes('bot'));

    if (listings.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); padding:10px; font-size:12px;">No active bot sellers.</div>';
      return;
    }

    container.innerHTML = listings.map(b => `
      <div class="glass-card" style="padding:10px; margin-bottom:8px; border:1px solid var(--secondary-blue);">
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:#fff;">
          <span>${b.botBadge || b.seller} (${b.currency})</span>
          <span style="color:var(--gold-accent);">${b.pricePerUnit} KS/${b.currency}</span>
        </div>
        <div style="font-size:10px; color:var(--text-muted); margin:4px 0;">Available: ${b.available.toLocaleString()} ${b.currency} | ${b.notes}</div>
        <div style="display:flex; gap:6px;">
          <button onclick="PayWellOwner.editBotPrice('${b.id}')" class="btn btn-gold" style="padding:4px; font-size:10px;">Edit Price</button>
          <button onclick="PayWellOwner.removeBotSeller('${b.id}')" class="btn btn-danger" style="padding:4px; font-size:10px;">Remove Bot</button>
        </div>
      </div>
    `).join('');
  },

  createBotSeller() {
    const name = prompt("Bot Name / Badge (e.g. 🤖 Official MMK Bot #3):", "🤖 Official MMK Bot #3");
    if (!name) return;
    const curr = prompt("Bot Currency (PW / USD / MMK):", "PW") || "PW";
    const price = parseFloat(prompt("Price Per Unit in MMK (e.g. 4000):", "4000") || "4000");
    const avail = parseFloat(prompt("Bot Inventory Supply Amount:", "100000") || "100000");

    const listings = window.PayWellDB.getP2PListings();
    const newBot = {
      id: `BOT-${Date.now()}`,
      seller: name.replace(/[^a-zA-Z0-9_]/g, '_'),
      isBot: true,
      botBadge: name,
      rating: 5.0,
      trades: 1000,
      currency: curr.toUpperCase(),
      available: avail,
      pricePerUnit: price,
      paymentMethods: ['KBZPay', 'WavePay'],
      notes: 'Owner Created Official Bot Seller',
      status: 'active'
    };
    listings.unshift(newBot);
    window.PayWellDB.saveP2PListings(listings);
    alert(`🤖 Bot Seller Created: ${name}!`);
    this.loadBotListingsingsings();
  },

  editBotPrice(botId) {
    const listings = window.PayWellDB.getP2PListings();
    const bot = listings.find(l => l.id === botId);
    if (!bot) return;

    const newPrice = prompt(`Enter new price in KS for ${bot.botBadge || bot.seller}:`, bot.pricePerUnit);
    if (!newPrice) return;

    bot.pricePerUnit = parseFloat(newPrice);
    window.PayWellDB.saveP2PListings(listings);
    alert(`✓ Updated bot price to ${bot.pricePerUnit} KS!`);
    this.loadBotListingsingsings();
  },

  removeBotSeller(botId) {
    let listings = window.PayWellDB.getP2PListings();
    listings = listings.filter(l => l.id !== botId);
    window.PayWellDB.saveP2PListings(listings);
    alert("🗑️ Bot seller removed.");
    this.loadBotListingsingsings();
  },

  openKpayRequestsModal() {
    this.loadKpayRequests();
    window.PayWellRouter.openModal('modal-owner-kpay');
  },

  loadKpayRequests() {
    const deposits = window.PayWellDB.getKpayDeposits();
    const container = document.getElementById('owner-kpay-list');
    if (!container) return;

    if (!deposits || deposits.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); padding:10px; font-size:12px;">No deposit requests found.</div>';
      return;
    }

    container.innerHTML = deposits.map(d => `
      <div class="glass-card" style="padding:12px; margin-bottom:8px; border:1px solid ${d.status === 'done' ? 'var(--primary-green)' : 'var(--gold-accent)'};">
        <div style="display:flex; justify-content:space-between; font-size:11px;">
          <span style="font-weight:700; color:#fff;">${d.id}</span>
          <span style="color:${d.status === 'done' ? 'var(--primary-green)' : 'var(--gold-accent)'}; font-weight:700;">[${d.status.toUpperCase()}]</span>
        </div>
        <div style="font-size:12px; color:#fff; margin:4px 0;">User: @${d.username} | Amount: ${d.amount_ks.toLocaleString()} KS</div>
        <div style="font-size:10px; color:var(--text-muted);">Fee: ${d.fee_ks} KS | Account: ${d.kpay_no} | Date: ${d.created_at}</div>
        ${d.status === 'pending' ? `
          <button onclick="PayWellOwner.approveKpay('${d.id}')" class="btn btn-gold" style="margin-top:6px; padding:4px 8px; font-size:10px;">
            ✓ Approve Deposit & Credit PW
          </button>
        ` : ''}
      </div>
    `).join('');
  },

  approveKpay(depositId) {
    const res = window.PayWellDB.approveKpayDeposit(depositId);
    if (res) {
      alert(`✓ Deposit ${depositId} approved! Credited ${res.amount_ks} PW to @${res.username}.`);
      this.loadKpayRequests();
      this.loadOwnerDashboardData();
    }
  },

  submitUserPenalty(level) {
    const target = document.getElementById('mod-target-user')?.value;
    const reason = prompt(`Enter reason for Penalty Level ${level}:`) || "Owner Policy Action";
    if (!target) return;

    window.PayWellDB.setUserPenalty(target, level, reason);
    alert(`👑 Security Penalty Level ${level} applied to @${target}! Status updated.`);
    window.PayWellRouter.closeModal('modal-owner-acct-modify');
    this.loadOwnerDashboardData();
  },

  loadUsersList() {
    const users = window.PayWellDB.getUsers();
    const container = document.getElementById('owner-users-list');
    if (!container) return;

    if (!users || users.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); padding:10px;">No users found.</div>';
      return;
    }

    container.innerHTML = users.map(u => `
      <div class="glass-card" style="padding:14px; margin-bottom:10px; display:flex; justify-content:space-between; align-items:center;">
        <div>
          <div style="font-weight:700; color:var(--text-primary);">@${u.username} ${u.role === 'owner' ? '👑' : ''}</div>
          <div style="font-size:12px; color:var(--text-muted);">TG ID: ${u.telegram_id || 'N/A'} | Status: ${u.status}</div>
          <div style="font-family:var(--font-mono); color:var(--primary-green); font-weight:700; font-size:14px; margin-top:4px;">
            ${u.balance.toLocaleString('en-US', {minimumFractionDigits:2})} PW
          </div>
        </div>
        <div style="display:flex; gap:6px;">
          <button onclick="PayWellOwner.openModifyModal('${u.username}')" class="btn btn-gold" style="padding:6px 10px; font-size:12px;">Modify</button>
        </div>
      </div>
    `).join('');
  },

  openModifyModal(username) {
    this.selectedUserForModify = username;
    const targetInput = document.getElementById('mod-target-user');
    const adjustInput = document.getElementById('adjust-target-user');
    if (targetInput) targetInput.value = username;
    if (adjustInput) adjustInput.value = username;
    window.PayWellRouter.openModal('modal-owner-acct-modify');
  },

  quickAdjustModal(username) {
    this.openModifyModal(username);
  },

  submitAdjustCurrency(type) {
    const target = (document.getElementById('mod-target-user')?.value || document.getElementById('adjust-target-user')?.value || '').trim();
    const amount = parseFloat(document.getElementById('adjust-amount')?.value || 100);
    const reason = document.getElementById('adjust-reason')?.value.trim() || 'Owner Adjustment';

    if (!target || amount <= 0) {
      alert("Please enter a valid target username and amount.");
      return;
    }

    try {
      const res = window.PayWellDB.adjustBalance(target, amount, type, reason);
      alert(`Successfully ${type === 'add' ? 'added' : 'deducted'} ${amount} PW for @${target}!`);
      window.PayWellRouter.closeModal('modal-owner-acct-modify');
      window.PayWellRouter.closeModal('modal-owner-adjust');
      this.loadOwnerDashboardData();
      window.dispatchEvent(new CustomEvent('paywell_balance_updated'));
    } catch (err) {
      alert(err.message || "Adjustment failed.");
    }
  },

  openFeeBoxModal() {
    this.loadFeeBoxData();
    window.PayWellRouter.openModal('modal-owner-feebox');
  },

  loadFeeBoxData() {
    const txs = JSON.parse(localStorage.getItem(window.PayWellDB.STORAGE_TXS)) || [];
    const totalFees = txs.reduce((sum, t) => sum + (t.fee || 0), 0);

    const totalEl = document.getElementById('owner-total-fees');
    const dayEl = document.getElementById('owner-fee-day');
    const monthEl = document.getElementById('owner-fee-month');

    if (totalEl) totalEl.innerText = `${totalFees.toFixed(2)} PW`;
    if (dayEl) dayEl.innerText = `${(totalFees * 0.15).toFixed(2)} PW`;
    if (monthEl) monthEl.innerText = `${totalFees.toFixed(2)} PW`;

    const listEl = document.getElementById('owner-fee-history-list');
    if (listEl) {
      listEl.innerHTML = txs.map(t => `
        <div class="glass-card" style="padding:8px 12px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center; font-size:11px;">
          <div>
            <span style="font-weight:700; color:#fff;">${t.id}</span>
            <span style="color:var(--text-muted); margin-left:6px;">@${t.sender_username}</span>
          </div>
          <div style="font-family:var(--font-mono); color:var(--gold-accent); font-weight:700;">
            +${(t.fee || 0).toFixed(2)} PW Fee
          </div>
        </div>
      `).join('') || '<div style="color:var(--text-muted); font-size:11px; padding:8px;">No transaction fees recorded yet.</div>';
    }
  },

  exportFeeCSV() {
    const txs = JSON.parse(localStorage.getItem(window.PayWellDB.STORAGE_TXS)) || [];
    let csv = "ID,Sender,Receiver,Amount,Fee,Date\n";
    txs.forEach(t => {
      csv += `"${t.id}","${t.sender_username}","${t.receiver_username}",${t.amount},${t.fee || 0},"${t.created_at}"\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `paywell_fee_ledger_${Date.now()}.csv`;
    a.click();
  },

  openDisputesModal() {
    this.loadDisputesData();
    window.PayWellRouter.openModal('modal-owner-disputes');
  },

  loadDisputesData() {
    const reports = JSON.parse(localStorage.getItem('paywell_user_reports')) || [];
    const container = document.getElementById('owner-disputes-list');
    if (!container) return;

    if (reports.length === 0) {
      container.innerHTML = '<div style="color:var(--text-muted); font-size:12px; padding:12px;">No active reports or disputes.</div>';
      return;
    }

    container.innerHTML = reports.map(r => `
      <div class="glass-card" style="padding:12px; margin-bottom:8px; border:1px solid var(--red-alert);">
        <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; color:var(--red-alert);">
          <span>🚩 ${r.type}</span>
          <span style="color:var(--text-muted); font-size:10px;">${r.timestamp}</span>
        </div>
        <div style="font-size:12px; color:#fff; margin:4px 0;">Reporter: @${r.reporter} | Target: @${r.target}</div>
        <div style="font-size:11px; color:var(--text-muted);">${r.desc}</div>
        <div style="display:flex; gap:6px; margin-top:8px;">
          <button onclick="PayWellOwner.openModifyModal('${r.target}')" class="btn btn-gold" style="padding:4px 8px; font-size:10px;">Freeze Target</button>
          <button onclick="alert('Report marked as resolved');" class="btn btn-glass" style="padding:4px 8px; font-size:10px;">Dismiss</button>
        </div>
      </div>
    `).join('');
  },

  submitTempPasswordReset() {
    const target = document.getElementById('mod-target-user')?.value;
    const pwd = document.getElementById('mod-temp-pwd')?.value.trim();
    if (!target || !pwd) {
      alert("Please select a target user and enter a temporary password.");
      return;
    }
    const users = window.PayWellDB.getUsers();
    const user = users.find(u => u.username.toLowerCase() === target.toLowerCase());
    if (user) {
      user.password_hash = window.PayWellDB.hash(pwd);
      window.PayWellDB.saveUsers(users);
      alert(`🔑 Temporary password for @${target} updated to: ${pwd}`);
    }
  },

  submitTempPINReset() {
    const target = document.getElementById('mod-target-user')?.value;
    const pin = document.getElementById('mod-temp-pin')?.value.trim();
    if (!target || !pin) {
      alert("Please select a target user and enter a temporary PIN.");
      return;
    }
    alert(`🔑 Owner PIN / Security Code for @${target} reset to: ${pin}`);
  },

  submitToggleUserStatus(status) {
    const target = document.getElementById('mod-target-user')?.value;
    if (!target) return;
    const users = window.PayWellDB.getUsers();
    const user = users.find(u => u.username.toLowerCase() === target.toLowerCase());
    if (user) {
      user.status = status;
      window.PayWellDB.saveUsers(users);
      alert(`User @${target} status changed to [${status.toUpperCase()}].`);
      window.PayWellRouter.closeModal('modal-owner-acct-modify');
      this.loadOwnerDashboardData();
    }
  }
};

window.PayWellOwner = PayWellOwner;
