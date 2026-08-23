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
    if (displayName) {
      displayName.textContent = `@${user.username}`;
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
    const secNexora = document.getElementById('store-nexora-section');
    const secPft = document.getElementById('store-pft-section');
    const secAuc = document.getElementById('store-auction-section');
    const secItems = document.getElementById('store-items-section');
    const secInv = document.getElementById('store-inventory-section');

    const tabNexora = document.getElementById('store-tab-nexora');
    const tabPft = document.getElementById('store-tab-pft');
    const tabAuc = document.getElementById('store-tab-auction');
    const tabItems = document.getElementById('store-tab-items');
    const tabInv = document.getElementById('store-tab-inventory');

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
