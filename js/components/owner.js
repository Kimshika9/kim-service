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
    // PIN pad button clicks
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

  async loadOwnerDashboardData() {
    try {
      const res = await fetch('/api/owner/stats');
      const stats = await res.json();

      document.getElementById('owner-stat-users').innerText = stats.total_users || 0;
      document.getElementById('owner-stat-circ').innerText = `${(stats.total_circulation || 0).toLocaleString('en-US', {minimumFractionDigits: 2})} PW`;
      document.getElementById('owner-stat-txs').innerText = stats.total_transactions || 0;

      this.loadUsersList();
    } catch (err) {
      console.error("Error loading owner stats:", err);
    }
  },

  async loadUsersList() {
    try {
      const res = await fetch('/api/owner/users');
      const data = await res.json();
      const container = document.getElementById('owner-users-list');
      if (!container) return;

      if (!data.users || data.users.length === 0) {
        container.innerHTML = '<div style="color:var(--text-muted); padding:10px;">No users found.</div>';
        return;
      }

      container.innerHTML = data.users.map(u => `
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
    } catch (err) {
      console.error("Error loading owner users:", err);
    }
  },

  quickAdjustModal(username) {
    document.getElementById('adjust-target-user').value = username;
    window.PayWellRouter.openModal('modal-owner-adjust');
  },

  async submitAdjustCurrency(type) {
    const target = document.getElementById('adjust-target-user').value.trim();
    const amount = parseFloat(document.getElementById('adjust-amount').value || 0);
    const reason = document.getElementById('adjust-reason').value.trim() || 'Owner Adjustment';

    if (!target || amount <= 0) {
      alert("Please enter a valid target username and amount.");
      return;
    }

    try {
      const res = await fetch('/api/owner/adjust-balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actor: window.PayWellAuth.currentUser?.username || 'Yuji_luke',
          target_username: target,
          amount: amount,
          type: type, // 'add' or 'deduct'
          reason: reason
        })
      });
      const data = await res.json();

      if (data.error) {
        alert("Error: " + data.error);
      } else {
        alert(`Successfully ${type === 'add' ? 'added' : 'deducted'} ${amount} PW for @${target}!`);
        window.PayWellRouter.closeModal('modal-owner-adjust');
        this.loadOwnerDashboardData();
        window.dispatchEvent(new CustomEvent('paywell_balance_updated'));
      }
    } catch (err) {
      alert("Server connection failed.");
    }
  }
};

window.PayWellOwner = PayWellOwner;
