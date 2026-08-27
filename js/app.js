/**
 * PayWell Main Controller & UI Bindings (Supports Backend API + Static Fallback)
 */

const PayWellApp = {
  activeDecorTab: 'background',
  activeCurrencyIndex: 0, // 0: PW, 1: USD, 2: MMK
  isBalanceHidden: false,

  init() {
    window.PayWellAuth.init();
    window.PayWellRouter.init();
    window.PayWellOwner.init();
    if (window.PayWellPet) window.PayWellPet.init();

    this.checkURLReferralCoupon();
    this.bindEvents();
    this.renderCurrentState();
  },

  checkURLReferralCoupon() {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    if (refCode) {
      const regRefInput = document.getElementById('reg-ref-coupon');
      if (regRefInput) {
        regRefInput.value = refCode;
      }
      const activeCouponDisplay = document.getElementById('active-ref-coupon-display');
      if (activeCouponDisplay) {
        activeCouponDisplay.style.display = 'block';
        activeCouponDisplay.innerText = `🎫 Active Referral Coupon: ${refCode} (Bonus Unlocked on Register!)`;
      }
    }
  },

  openReferralModal() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    window.PayWellRouter.openModal('modal-referral');
    this.renderReferralDetails();
  },

  renderReferralDetails() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const stats = window.PayWellDB.getReferralStats(user.username);
    const linkInput = document.getElementById('ref-link-input');
    const countEl = document.getElementById('ref-friend-count');
    const earnedEl = document.getElementById('ref-earned-pw');

    const botLink = `https://t.me/PayWellBot?ref=${user.username}`;
    if (linkInput) linkInput.value = botLink;
    if (countEl) countEl.innerText = `${stats.count} Friends`;
    if (earnedEl) earnedEl.innerText = `${stats.totalEarned} PW`;

    const milestones = [
      { friends: 2, reward: 3 },
      { friends: 5, reward: 10 },
      { friends: 10, reward: 25 },
      { friends: 25, reward: 75 },
      { friends: 50, reward: 200 },
      { friends: 100, reward: 500 }
    ];

    const listContainer = document.getElementById('ref-milestones-list');
    if (listContainer) {
      listContainer.innerHTML = milestones.map(m => {
        const isClaimed = (stats.claimed || []).includes(m.friends);
        const canClaim = stats.count >= m.friends && !isClaimed;

        return `
          <div class="glass-card" style="padding:10px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
            <div>
              <div style="font-weight:700; color:#fff; font-size:12px;">👥 Invite ${m.friends} Friends ➔ ${m.reward} PW</div>
              <div style="font-size:10px; color:var(--text-muted);">Progress: ${Math.min(stats.count, m.friends)}/${m.friends}</div>
            </div>
            ${isClaimed
              ? `<span style="font-size:11px; color:var(--primary-green); font-weight:700;">✓ Claimed</span>`
              : `<button onclick="PayWellApp.claimReferralMilestone(${m.friends}, ${m.reward})" class="btn ${canClaim ? 'btn-gold' : 'btn-glass'}" style="width:auto; padding:4px 8px; font-size:10px;" ${canClaim ? '' : 'disabled'}>
                  ${canClaim ? 'Claim Bonus' : 'Locked'}
                </button>`
            }
          </div>
        `;
      }).join('');
    }
  },

  claimReferralMilestone(friends, reward) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      window.PayWellDB.claimReferralMilestone(user.username, friends, reward);
      alert(`🎉 Claimed +${reward} PW Referral Milestone Bonus!`);
      this.fetchUserFreshData();
      this.renderDashboardBalance(window.PayWellAuth.currentUser);
      this.renderReferralDetails();
    } catch (e) {
      alert(e.message || "Claim failed.");
    }
  },

  copyReferralLink() {
    const linkInput = document.getElementById('ref-link-input');
    if (linkInput) {
      navigator.clipboard.writeText(linkInput.value);
      alert("📋 Referral Bot Link copied to clipboard!");
    }
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
        const nickname = document.getElementById('reg-nickname')?.value?.trim();
        const email = document.getElementById('reg-email').value.trim();
        const refCoupon = document.getElementById('reg-ref-coupon')?.value?.trim();
        const pwd = document.getElementById('reg-pwd').value;
        try {
          const user = await window.PayWellAuth.register(username, email, pwd);
          if (user) {
            if (nickname) window.PayWellDB.updateUserProfile(username, nickname, undefined, undefined);
            if (refCoupon) window.PayWellDB.registerReferral(refCoupon, username);
          }
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
    const lvl = window.PayWellDB.getUserLevel(user.username);
    const displayName = user.nickname || user.username;

    if (headerUser) {
      headerUser.innerText = `${displayName} (@${user.username}) ${user.role === 'owner' ? '👑' : ''}`;
    }
    const headerId = document.getElementById('header-user-id');
    if (headerId) {
      headerId.innerText = `#PW-${String(user.id || 1).padStart(4, '0')}`;
    }

    // Render Full Profile Area
    const profileSeqId = document.getElementById('profile-seq-id');
    if (profileSeqId) {
      profileSeqId.innerText = `#PW-${String(user.id || 1).padStart(4, '0')}`;
    }
    const profileLvlEl = document.getElementById('profile-level-badge');
    if (profileLvlEl) {
      profileLvlEl.innerText = `Level ${lvl}`;
    }

    const nameDisplay = document.getElementById('profile-name-display');
    if (nameDisplay) {
      nameDisplay.innerText = user.nickname ? `${user.nickname} (@${user.username})` : `@${user.username}`;
    }

    const bioDisplay = document.getElementById('profile-bio-display');
    if (bioDisplay) {
      bioDisplay.innerText = user.bio ? `"${user.bio}"` : 'Tap to add bio/description...';
    }

    const avatarBox = document.getElementById('profile-avatar-box');
    if (avatarBox) {
      if (user.profile_photo) {
        avatarBox.style.backgroundImage = `url(${user.profile_photo})`;
        avatarBox.style.backgroundSize = 'cover';
        avatarBox.style.backgroundPosition = 'center';
        avatarBox.innerText = '';
      } else {
        avatarBox.style.backgroundImage = 'none';
        avatarBox.innerText = '👤';
      }
    }

    // Top PFT Display Area
    this.renderTopPFTDisplay(user.username);
  },

  renderTopPFTDisplay(username) {
    const container = document.getElementById('pft-top-display-area');
    if (!container) return;

    const pfts = window.PayWellDB.getEquippedPFTs(username);
    if (pfts.length === 0) {
      container.innerHTML = `<div style="font-size:10px; color:var(--text-muted); text-align:center; padding:6px;">✨ Equipped PFT collectibles show here!</div>`;
      return;
    }

    container.innerHTML = `
      <div style="display:flex; justify-content:center; gap:8px; flex-wrap:wrap; padding:6px;">
        ${pfts.map(p => `
          <div class="glass-card" style="padding:4px 8px; font-size:11px; display:flex; align-items:center; gap:4px; border:1px solid var(--gold-accent); background:rgba(255,215,0,0.1);">
            <span>${p.icon || '🪙'}</span>
            <span style="font-weight:700; color:var(--gold-accent);">${p.name || 'PFT Item'}</span>
          </div>
        `).join('')}
      </div>
    `;
  },

  handleProfilePhotoUpload(file) {
    const user = window.PayWellAuth.currentUser;
    if (!user || !file) return;

    if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      alert("Invalid image format! Only PNG and JPG photos are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Photo max size is 5MB!");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      window.PayWellDB.updateUserProfile(user.username, undefined, undefined, e.target.result);
      alert("📸 Profile photo updated successfully!");
      this.fetchUserFreshData();
      this.renderHeader(window.PayWellAuth.currentUser);
    };
    reader.readAsDataURL(file);
  },

  openEditNicknameModal() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;
    const input = document.getElementById('edit-nickname-input');
    if (input) input.value = user.nickname || '';
    window.PayWellRouter.openModal('modal-edit-nickname');
  },

  submitNicknameChange() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const nickname = document.getElementById('edit-nickname-input')?.value?.trim();
    if (!nickname) {
      alert("Please enter a nickname!");
      return;
    }

    window.PayWellDB.updateUserProfile(user.username, nickname, undefined, undefined);
    alert("✨ Nickname updated successfully!");
    window.PayWellRouter.closeModal('modal-edit-nickname');
    this.fetchUserFreshData();
    this.renderHeader(window.PayWellAuth.currentUser);
  },

  openEditBioModal() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;
    const input = document.getElementById('edit-bio-input');
    if (input) input.value = user.bio || '';
    window.PayWellRouter.openModal('modal-edit-bio');
  },

  submitBioChange() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const bio = document.getElementById('edit-bio-input')?.value?.trim();
    window.PayWellDB.updateUserProfile(user.username, undefined, bio, undefined);
    alert("📝 Bio updated successfully!");
    window.PayWellRouter.closeModal('modal-edit-bio');
    this.fetchUserFreshData();
    this.renderHeader(window.PayWellAuth.currentUser);
  },

  openLevelPassModal() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    window.PayWellRouter.openModal('modal-user-pass');
    this.renderUserLevelPassDetails();
  },

  renderUserLevelPassDetails() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const qty = window.PayWellDB.getUserPassInventory(user.username);
    const lvl = window.PayWellDB.getUserLevel(user.username);

    const qtyEl = document.getElementById('user-pass-count');
    const lvlEl = document.getElementById('user-curr-level');

    if (qtyEl) qtyEl.innerText = qty;
    if (lvlEl) lvlEl.innerText = `Level ${lvl}`;
  },

  useLevelPassSelf() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      const newLvl = window.PayWellDB.useLevelUpPass(user.username);
      alert(`🚀 Level Up Success! Account upgraded to Level ${newLvl}! All Level ${newLvl} features unlocked.`);
      this.renderHeader(user);
      this.renderUserLevelPassDetails();
    } catch (e) {
      alert(e.message || "Failed to use pass.");
    }
  },

  openGiftCardModal() {
    window.PayWellRouter.openModal('modal-gift-card');
  },

  submitGiftCardPurchase() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const pkg = document.getElementById('giftcard-package-select')?.value || '500';
    const amount = parseFloat(pkg);
    const recipient = document.getElementById('giftcard-recipient')?.value?.trim();
    const msg = document.getElementById('giftcard-message')?.value?.trim();

    if (!recipient) {
      alert("Please enter recipient email or username!");
      return;
    }

    if (user.balance < amount) {
      alert(`Insufficient balance to purchase this gift card (${amount} PW required).`);
      return;
    }

    user.balance -= amount;
    window.PayWellDB.saveUsers(window.PayWellDB.getUsers());

    alert(`🎁 Gift Card (${amount} PW) Sent Successfully to ${recipient}!\nNote: "${msg || 'Gift Card from PayWell'}"`);
    window.PayWellRouter.closeModal('modal-gift-card');
    this.fetchUserFreshData();
    this.renderDashboardBalance(window.PayWellAuth.currentUser);
  },

  giftLevelPassOther() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const qty = window.PayWellDB.getUserPassInventory(user.username);
    if (qty <= 0) {
      alert("No Level Up Pass available in inventory to gift!");
      return;
    }

    const recipient = prompt("Enter username of recipient to gift Level Up Pass:");
    if (!recipient) return;

    window.PayWellDB.addUserPassInventory(user.username, -1);
    window.PayWellDB.addUserPassInventory(recipient, 1);
    alert(`🎁 Level Up Pass gifted to @${recipient}!`);
    this.renderUserLevelPassDetails();
  },

  rotateCurrency() {
    this.activeCurrencyIndex = (this.activeCurrencyIndex + 1) % 3;
    const wrap = document.getElementById('bal-primary-wrap');
    if (wrap) {
      wrap.style.transform = 'translateY(-10px)';
      wrap.style.opacity = '0';
      setTimeout(() => {
        this.renderDashboardBalance(window.PayWellAuth.currentUser);
        wrap.style.transform = 'translateY(0)';
        wrap.style.opacity = '1';
      }, 150);
    } else {
      this.renderDashboardBalance(window.PayWellAuth.currentUser);
    }
  },

  toggleBalanceVisibility() {
    this.isBalanceHidden = !this.isBalanceHidden;
    this.renderDashboardBalance(window.PayWellAuth.currentUser);
  },

  renderDashboardBalance(user) {
    if (!user) return;
    const bal = user.balance || 0;
    const usdVal = bal * 1.0; // 1 PW = 1 USD
    const mmkVal = bal * 4000; // 1 PW = 4,000 MMK

    const primaryEl = document.getElementById('bal-primary-display');
    const secondaryEl = document.getElementById('bal-secondary-display');
    const badgeEl = document.getElementById('active-currency-badge');

    if (this.isBalanceHidden) {
      if (primaryEl) primaryEl.innerText = "••••••••";
      if (secondaryEl) secondaryEl.innerText = "•••• USD  •  •••• KS MMK";
      if (badgeEl) badgeEl.innerText = "HIDDEN";
      return;
    }

    if (this.activeCurrencyIndex === 0) { // PW Primary
      if (badgeEl) badgeEl.innerText = "PW";
      if (primaryEl) primaryEl.innerText = `PW ${bal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      if (secondaryEl) secondaryEl.innerText = `$${usdVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD  •  ${mmkVal.toLocaleString('en-US')} KS MMK`;
    } else if (this.activeCurrencyIndex === 1) { // USD Primary
      if (badgeEl) badgeEl.innerText = "USD";
      if (primaryEl) primaryEl.innerText = `$ ${usdVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
      if (secondaryEl) secondaryEl.innerText = `PW ${bal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}  •  ${mmkVal.toLocaleString('en-US')} KS MMK`;
    } else { // MMK Primary
      if (badgeEl) badgeEl.innerText = "MMK";
      if (primaryEl) primaryEl.innerText = `${mmkVal.toLocaleString('en-US')} KS`;
      if (secondaryEl) secondaryEl.innerText = `PW ${bal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}  •  $${usdVal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD`;
    }
  },

  claimDailyReward() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;
    user.balance += 50.0;
    window.PayWellDB.saveUsers(window.PayWellDB.getUsers());
    alert("🎉 Daily Login Reward Claimed! Received +50.00 PW!");
    this.renderDashboardBalance(user);
  },

  openVisaModal() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    window.PayWellRouter.openModal('modal-visa');
    this.renderVisaDetails();
  },

  renderVisaDetails() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const card = window.PayWellDB.getVisaCard(user.username);
    const applyPanel = document.getElementById('visa-apply-panel');
    const displayPanel = document.getElementById('visa-display-panel');

    if (!card) {
      if (applyPanel) applyPanel.style.display = 'block';
      if (displayPanel) displayPanel.style.display = 'none';
      return;
    }

    if (applyPanel) applyPanel.style.display = 'none';
    if (displayPanel) displayPanel.style.display = 'block';

    const cardNumEl = document.getElementById('visa-card-number');
    const cardHolderEl = document.getElementById('visa-card-holder');
    const cardExpEl = document.getElementById('visa-card-expiry');
    const cardCvvEl = document.getElementById('visa-card-cvv');
    const cardBadgeEl = document.getElementById('visa-card-badge');
    const cardBox = document.getElementById('visa-card-box');
    const freezeBtn = document.getElementById('visa-freeze-btn');

    if (cardNumEl) cardNumEl.innerText = card.cardNumber;
    if (cardHolderEl) cardHolderEl.innerText = card.cardHolder.toUpperCase();
    if (cardExpEl) cardExpEl.innerText = card.expiry;
    if (cardCvvEl) cardCvvEl.innerText = card.cvv;
    if (cardBadgeEl) cardBadgeEl.innerText = `${card.type.toUpperCase()} • ${card.status.toUpperCase()}`;

    if (cardBox) {
      if (card.type === 'Gold') {
        cardBox.style.background = 'linear-gradient(135deg, #FFD700 0%, #FFA000 100%)';
        cardBox.style.color = '#0A0A0F';
        cardBox.style.boxShadow = '0 0 25px rgba(255, 215, 0, 0.6)';
      } else if (card.type === 'Premium') {
        cardBox.style.background = 'linear-gradient(135deg, #E0E0E0 0%, #9E9E9E 100%)';
        cardBox.style.color = '#0A0A0F';
        cardBox.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.4)';
      } else {
        cardBox.style.background = 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)';
        cardBox.style.color = '#0A0A0F';
        cardBox.style.boxShadow = '0 0 20px rgba(0, 230, 118, 0.4)';
      }
    }

    if (freezeBtn) {
      freezeBtn.innerText = card.status === 'Active' ? '❄️ Freeze Card' : '🔥 Unfreeze Card';
      freezeBtn.className = card.status === 'Active' ? 'btn btn-danger' : 'btn btn-primary';
    }
  },

  submitVisaApplication() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const holderName = document.getElementById('visa-app-name')?.value?.trim() || user.username;
    const type = document.getElementById('visa-app-type')?.value || 'Standard';

    let cost = 0;
    if (type === 'Premium') cost = 100;
    if (type === 'Gold') cost = 500;

    if (cost > 0 && user.balance < cost) {
      alert(`Insufficient balance to apply for ${type} Visa Card (${cost} PW required).`);
      return;
    }

    if (cost > 0) {
      user.balance -= cost;
      window.PayWellDB.saveUsers(window.PayWellDB.getUsers());
    }

    const card = window.PayWellDB.issueVisaCard(user.username, type, holderName);
    alert(`💳 Congratulations! Your PayWell ${card.type} Visa Card has been issued!`);
    this.fetchUserFreshData();
    this.renderDashboardBalance(window.PayWellAuth.currentUser);
    this.renderVisaDetails();
  },

  toggleVisaFreeze() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const card = window.PayWellDB.toggleVisaCardStatus(user.username);
    if (card) {
      alert(`💳 Visa Card status changed to [${card.status.toUpperCase()}]`);
      this.renderVisaDetails();
    }
  },

  openConnectedCheckoutDemo() {
    window.PayWellRouter.openModal('modal-connected-checkout');
  },

  confirmConnectedPayment() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    const payMethod = document.getElementById('checkout-method-select')?.value || 'balance';
    const amount = 500.0; // NEXORA Tournament Entry

    if (payMethod === 'visa') {
      const card = window.PayWellDB.getVisaCard(user.username);
      if (!card || card.status !== 'Active') {
        alert("Active PayWell Visa Card required for Visa Checkout!");
        return;
      }
    } else {
      if (user.balance < amount) {
        alert("Insufficient PW balance for NEXORA Tournament checkout.");
        return;
      }
      user.balance -= amount;
      window.PayWellDB.saveUsers(window.PayWellDB.getUsers());
    }

    alert(`🎉 Connected Web Payment Approved!\nPaid ${amount} PW to NEXORA Platform via ${payMethod.toUpperCase()}.`);
    window.PayWellRouter.closeModal('modal-connected-checkout');
    this.fetchUserFreshData();
    this.renderDashboardBalance(window.PayWellAuth.currentUser);
  },

  openProfileIDCardModal() {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    window.PayWellRouter.openModal('modal-profile-idcard');

    const idNumEl = document.getElementById('idcard-num');
    const nameEl = document.getElementById('idcard-username');
    const lvlEl = document.getElementById('idcard-level');
    const qrCanvas = document.getElementById('idcard-qr-canvas');

    const lvl = window.PayWellDB.getUserLevel(user.username);
    const seqId = `#PW-${String(user.id || 1).padStart(4, '0')}`;

    if (idNumEl) idNumEl.innerText = seqId;
    if (nameEl) nameEl.innerText = `@${user.username}`;
    if (lvlEl) lvlEl.innerText = `Level ${lvl} Verified`;

    if (qrCanvas && window.QRCode) {
      qrCanvas.innerHTML = "";
      new window.QRCode(qrCanvas, {
        text: `PAYWELL_USER:${user.username}:${seqId}`,
        width: 100,
        height: 100,
        colorDark: "#0A0A0F",
        colorLight: "#FFFFFF",
        correctLevel: QRCode.CorrectLevel.H
      });
    }
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

  activeStoreCategory: 'ALL',

  filterStoreCategory(cat) {
    this.activeStoreCategory = cat;
    ['ALL', 'PFT', 'Pet', 'Profile', 'Gift Cards', 'Level Pass', 'Blind Box', 'Other'].forEach(c => {
      const btn = document.getElementById(`store-cat-${c.replace(/\s+/g, '')}`);
      if (btn) btn.className = c === cat ? 'btn btn-primary' : 'btn btn-glass';
    });
    this.loadStoreItems();
  },

  loadStoreItems() {
    const container = document.getElementById('store-grid');
    if (!container) return;

    const query = (document.getElementById('store-search-input')?.value || '').toLowerCase().trim();
    let items = window.PayWellDB.getStoreItems();

    if (this.activeStoreCategory !== 'ALL') {
      items = items.filter(i => i.category === this.activeStoreCategory);
    }

    if (query) {
      items = items.filter(i => i.name.toLowerCase().includes(query) || i.description.toLowerCase().includes(query));
    }

    if (items.length === 0) {
      container.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">No store items found in category "${this.activeStoreCategory}".</div>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="glass-card" style="padding:10px; text-align:center; position:relative; display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <div style="font-size:28px; margin-bottom:4px;">${item.image_url}</div>
          <div style="font-weight:700; font-size:11px; color:var(--text-primary); margin-bottom:2px; height:28px; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical;">${item.name}</div>
          <div style="font-family:var(--font-mono); font-weight:800; color:var(--gold-accent); font-size:12px; margin-bottom:6px;">
            ${item.price.toLocaleString()} PW
          </div>
        </div>
        <button onclick="PayWellApp.buyStoreItem(${item.id})" class="btn ${item.category === 'Blind Box' ? 'btn-gold' : 'btn-primary'}" style="padding:4px 6px; font-size:10px; min-height:30px; height:30px;">
          ${item.category === 'Blind Box' ? '🔮 Open Box' : 'Buy Now'}
        </button>
      </div>
    `).join('');
  },

  buyStoreItem(itemId) {
    const user = window.PayWellAuth.currentUser;
    if (!user) return;

    try {
      const res = window.PayWellDB.buyStoreItem(user.username, itemId);

      if (res.item.category === 'Blind Box') {
        const boxType = res.item.boxType || 'common';
        const droppedPFT = window.PayWellDB.openBlindBox(user.username, boxType);
        this.triggerBlindBoxAnimation(res.item.name, droppedPFT);
      } else {
        alert(`🎉 Purchased ${res.item.name} successfully!`);
      }

      this.fetchUserFreshData();
      this.renderDashboardBalance(window.PayWellAuth.currentUser);
      this.loadRecentTransactions(user.username);
    } catch (e) {
      alert(e.message || "Purchase failed.");
    }
  },

  triggerBlindBoxAnimation(boxName, droppedPFT) {
    window.PayWellRouter.openModal('modal-blindbox-unbox');
    const titleEl = document.getElementById('unbox-box-title');
    const iconEl = document.getElementById('unbox-icon-display');
    const resultBox = document.getElementById('unbox-result-box');

    if (titleEl) titleEl.innerText = `🔮 Opening ${boxName}...`;
    if (iconEl) {
      iconEl.innerText = '📦';
      iconEl.className = 'animate-shake';
    }
    if (resultBox) resultBox.style.display = 'none';

    setTimeout(() => {
      if (iconEl) {
        iconEl.innerText = droppedPFT.icon || '✨';
        iconEl.className = 'animate-pulse-glow';
      }
      if (resultBox) {
        resultBox.style.display = 'block';
        resultBox.innerHTML = `
          <div style="font-weight:800; font-size:16px; color:var(--gold-accent);">🎉 UNBOXED: ${droppedPFT.name}!</div>
          <div style="font-size:11px; color:var(--primary-green); margin-top:4px;">Equipped to your Top Profile PFT Display!</div>
        `;
      }
    }, 1500);
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

  setUIMode(mode) {
    const user = window.PayWellAuth.currentUser;
    if (mode === 'ultra' && (!user || user.role !== 'owner')) {
      const ownedUltra = localStorage.getItem('paywell_owned_ultra_ui') === 'true';
      if (!ownedUltra) {
        if (confirm("🎨 Ultra Liquid UI Mode costs 1,000 PW for Lifetime Access. Unlock now?")) {
          if (!user || user.balance < 1000) {
            alert("Insufficient PW balance to unlock Ultra UI Mode (1,000 PW required).");
            return;
          }
          user.balance -= 1000;
          localStorage.setItem('paywell_owned_ultra_ui', 'true');
          window.PayWellDB.saveUsers(window.PayWellDB.getUsers());
          alert("🎉 Ultra UI Mode Unlocked!");
        } else {
          return;
        }
      }
    }

    document.documentElement.setAttribute('data-ui-mode', mode);
    localStorage.setItem('paywell_active_ui_mode', mode);
    alert(`🎨 UI Appearance set to [${mode.toUpperCase()}] Mode!`);
    if (window.PayWellAuth.currentUser) {
      this.fetchUserFreshData();
      this.renderDashboardBalance(window.PayWellAuth.currentUser);
    }
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
