/**
 * PayWell Owner Crown Panel Component
 */

const PayWellOwner = {
  isUnlocked: false,
  pinInput: "",

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

    document.getElementById('owner-stat-users').innerText = users.length;
    document.getElementById('owner-stat-circ').innerText = `${totalCirc.toLocaleString('en-US', {minimumFractionDigits: 2})} PW`;
    document.getElementById('owner-stat-txs').innerText = (JSON.parse(localStorage.getItem(window.PayWellDB.STORAGE_TXS)) || []).length;

    const sys = window.PayWellDB.getSystemSettings();
    const tag = document.getElementById('owner-sys-mode-tag');
    if (tag) {
      if (sys.status === 'online') {
        tag.innerText = "🟢 ONLINE";
        tag.style.background = "rgba(0,230,118,0.2)";
        tag.style.color = "var(--primary-green)";
      } else if (sys.status === 'maintenance') {
        tag.innerText = "🟡 MAINTENANCE";
        tag.style.background = "rgba(255,143,0,0.2)";
        tag.style.color = "#FF8F00";
      } else {
        tag.innerText = "🔴 LOCKDOWN";
        tag.style.background = "rgba(255,82,82,0.2)";
        tag.style.color = "var(--red-alert)";
      }
    }

    const sliderFee = document.getElementById('slider-fee-rate');
    const labelFee = document.getElementById('label-fee-rate');
    if (sliderFee && labelFee) {
      sliderFee.value = sys.transferFeeRate || 2;
      labelFee.innerText = `${sys.transferFeeRate || 2}%`;
    }

    const sliderLimit = document.getElementById('slider-daily-limit');
    const labelLimit = document.getElementById('label-daily-limit');
    if (sliderLimit && labelLimit) {
      sliderLimit.value = sys.dailyLimit || 5000;
      labelLimit.innerText = `${(sys.dailyLimit || 5000).toLocaleString()} PW`;
    }

    this.loadNexoraPriceDeck();
    this.loadExchangeOrders();
    this.loadUsersList();
  },

  loadExchangeOrders() {
    const orders = window.PayWellDB.getExchangeOrders();
    const container = document.getElementById('owner-exchange-orders-list');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-muted); font-size:11px;">No exchange orders recorded yet.</div>`;
      return;
    }

    container.innerHTML = orders.map(o => `
      <div class="glass-card" style="padding:12px; border-left:4px solid ${o.type === 'deposit' ? 'var(--primary-green)' : 'var(--gold-accent)'};">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
          <div style="font-weight:700; font-size:12px; color:var(--text-primary);">${o.type.toUpperCase()} #${o.orderId}</div>
          <span style="font-size:10px; font-weight:700; color:${o.status === 'pending' ? 'var(--gold-accent)' : o.status === 'done' ? 'var(--primary-green)' : 'var(--red-alert)'};">${o.status.toUpperCase()}</span>
        </div>
        <div style="font-size:11px; color:var(--text-muted);">
          User: @${o.username} | Amount: ${o.amountPW} PW | Fee: ${o.feeKS} KS | Total: ${o.totalKS} KS
        </div>
        ${o.type === 'deposit' ? `<div style="font-size:10px; color:var(--primary-green); font-family:var(--font-mono);">Kpay TxID: ${o.userKpayTxId}</div>` : `<div style="font-size:10px; color:var(--gold-accent);">Kpay: ${o.userKpayNumber} (${o.userKpayName})</div>`}
        ${o.status === 'pending' ? `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-top:8px;">
            <button onclick="PayWellOwner.processExchangeOrder('${o.orderId}', 'approve')" class="btn btn-primary" style="padding:4px; font-size:10px;">✓ Approve Order</button>
            <button onclick="PayWellOwner.processExchangeOrder('${o.orderId}', 'reject')" class="btn btn-danger" style="padding:4px; font-size:10px;">✕ Reject Order</button>
          </div>
        ` : ''}
      </div>
    `).join('');
  },

  processExchangeOrder(orderId, action) {
    try {
      const order = window.PayWellDB.ownerApproveExchangeOrder(orderId, action);
      alert(`Order #${orderId} marked as ${order.status.toUpperCase()}!`);
      this.loadExchangeOrders();
      this.loadOwnerDashboardData();
    } catch (err) {
      alert(err.message);
    }
  },

  setSystemStatus(status) {
    window.PayWellDB.updateSystemSettings({ status });
    alert(`System status changed to: ${status.toUpperCase()}`);
    this.loadOwnerDashboardData();
  },

  updateSliders() {
    const fee = parseFloat(document.getElementById('slider-fee-rate').value || 2);
    const limit = parseFloat(document.getElementById('slider-daily-limit').value || 5000);

    document.getElementById('label-fee-rate').innerText = `${fee}%`;
    document.getElementById('label-daily-limit').innerText = `${limit.toLocaleString()} PW`;

    window.PayWellDB.updateSystemSettings({
      transferFeeRate: fee,
      dailyLimit: limit
    });
  },

  loadNexoraPriceDeck() {
    const tokens = window.PayWellDB.getNexoraTokens();
    const container = document.getElementById('owner-token-prices-list');
    if (!container) return;

    container.innerHTML = tokens.map(t => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(0,0,0,0.3); padding:8px 12px; border-radius:8px; margin-bottom:8px;">
        <span style="font-size:12px; color:var(--text-primary); font-weight:600;">${t.icon} ${t.name}</span>
        <div style="display:flex; gap:6px; align-items:center;">
          <input type="number" id="price-input-${t.id}" value="${t.price}" style="width:90px; padding:4px 8px; font-size:12px;" class="glow-input">
          <button onclick="PayWellOwner.saveTokenPrice('${t.id}')" class="btn btn-gold" style="padding:4px 8px; font-size:11px;">Save</button>
        </div>
      </div>
    `).join('');
  },

  saveTokenPrice(tokenId) {
    const val = parseFloat(document.getElementById(`price-input-${tokenId}`).value || 0);
    if (val < 0) return;
    window.PayWellDB.updateNexoraTokenPrice(tokenId, val);
    alert(`Updated NEXORA token price!`);
    this.loadOwnerDashboardData();
    window.PayWellApp.loadNexoraTokens();
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
          <button onclick="PayWellOwner.quickAdjustModal('${u.username}')" class="btn btn-gold" style="padding:6px 10px; font-size:12px;">Modify</button>
        </div>
      </div>
    `).join('');
  },

  quickAdjustModal(username) {
    document.getElementById('adjust-target-user').value = username;
    window.PayWellRouter.openModal('modal-owner-adjust');
  },

  submitCreatePet() {
    const name = document.getElementById('pet-create-name')?.value?.trim();
    const type = document.getElementById('pet-create-type')?.value;
    const rarity = document.getElementById('pet-create-rarity')?.value;
    const skill = document.getElementById('pet-create-skill')?.value;
    const price = document.getElementById('pet-create-price')?.value;
    const icon = document.getElementById('pet-create-icon')?.value?.trim();
    const desc = document.getElementById('pet-create-desc')?.value?.trim();

    if (!name || !price || !icon) {
      alert("Please fill in all pet generator fields!");
      return;
    }

    try {
      const pet = window.PayWellDB.createCustomPet(name, type, rarity, 'Playful', skill, price, icon, desc);
      alert(`✨ Custom Pet Created: ${pet.name} (${pet.rarity}) for ${pet.price} PW! Published to Pet Sanctuary.`);
      document.getElementById('form-create-pet')?.reset();
    } catch (err) {
      alert("Failed to create pet: " + err.message);
    }
  },

  submitAdjustCurrency(type) {
    const target = document.getElementById('adjust-target-user').value.trim();
    const amount = parseFloat(document.getElementById('adjust-amount').value || 0);
    const reason = document.getElementById('adjust-reason').value.trim() || 'Owner Adjustment';

    if (!target || amount <= 0) {
      alert("Please enter a valid target username and amount.");
      return;
    }

    try {
      const res = window.PayWellDB.adjustBalance(target, amount, type, reason);
      alert(`Successfully ${type === 'add' ? 'added' : 'deducted'} ${amount} PW for @${target}!`);
      window.PayWellRouter.closeModal('modal-owner-adjust');
      this.loadOwnerDashboardData();
      window.dispatchEvent(new CustomEvent('paywell_balance_updated'));
    } catch (err) {
      alert(err.message || "Adjustment failed.");
    }
  }
};

window.PayWellOwner = PayWellOwner;
