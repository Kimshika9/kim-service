/**
 * PayWell P2P PW Seller Marketplace, Escrow & Chat Component
 */

const PayWellP2P = {
  activeTab: 'market',
  activeChatOrderId: null,
  chatTimer: null,

  init() {
    // Initialization hooks
  },

  openMarketModal() {
    window.PayWellRouter.openModal('modal-p2p-market');
    this.switchTab('market');
  },

  switchTab(tab) {
    this.activeTab = tab;

    const btnM = document.getElementById('p2p-tab-btn-market');
    const btnL = document.getElementById('p2p-tab-btn-license');
    const btnC = document.getElementById('p2p-tab-btn-create');
    const btnO = document.getElementById('p2p-tab-btn-orders');

    if (btnM) btnM.className = tab === 'market' ? 'btn btn-primary' : 'btn btn-glass';
    if (btnL) btnL.className = tab === 'license' ? 'btn btn-primary' : 'btn btn-glass';
    if (btnC) btnC.className = tab === 'create' ? 'btn btn-primary' : 'btn btn-glass';
    if (btnO) btnO.className = tab === 'orders' ? 'btn btn-primary' : 'btn btn-glass';

    const tabM = document.getElementById('p2p-tab-market');
    const tabL = document.getElementById('p2p-tab-license');
    const tabC = document.getElementById('p2p-tab-create');
    const tabO = document.getElementById('p2p-tab-orders');

    if (tabM) tabM.style.display = tab === 'market' ? 'block' : 'none';
    if (tabL) tabL.style.display = tab === 'license' ? 'block' : 'none';
    if (tabC) tabC.style.display = tab === 'create' ? 'block' : 'none';
    if (tabO) tabO.style.display = tab === 'orders' ? 'block' : 'none';

    if (tab === 'market') this.renderMarketListings();
    if (tab === 'orders') this.renderUserP2POrders();
  },

  renderMarketListings() {
    const container = document.getElementById('p2p-listings-container');
    if (!container) return;

    const currFilter = document.getElementById('p2p-filter-curr')?.value || 'ALL';
    const listings = window.PayWellDB.getP2PListings().map(l => ({
      id: l.id,
      seller: l.seller || 'Seller',
      rating: l.rating || 5.0,
      trades: l.trades || 25,
      currency: l.currency || l.asset || 'PW',
      available: l.available || l.total_amount || 1000,
      pricePerUnit: l.pricePerUnit || l.price_mmk || 3200,
      paymentMethods: l.paymentMethods || [l.payment_method || 'KBZPay'],
      notes: l.notes || l.badge || 'Fast Trade',
      status: l.status || 'active'
    })).filter(l => (currFilter === 'ALL' || l.currency === currFilter) && l.status === 'active' && l.available > 0);

    if (listings.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:11px;">No active P2P seller listings for ${currFilter}.</div>`;
      return;
    }

    container.innerHTML = listings.map(l => `
      <div class="glass-card" style="padding:12px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
          <div>
            <span style="font-weight:700; color:#fff; font-size:13px;">👤 @${l.seller}</span>
            <span style="font-size:10px; color:var(--gold-accent); margin-left:6px;">⭐ ${(l.rating).toFixed(1)} (${l.trades} trades)</span>
          </div>
          <span style="font-size:11px; font-weight:800; color:var(--primary-green); font-family:var(--font-mono);">${l.currency}</span>
        </div>

        <div style="display:flex; justify-content:space-between; font-size:11px; color:var(--text-muted); margin-bottom:8px;">
          <span>Available: <b style="color:#fff;">${l.available.toLocaleString()} ${l.currency}</b></span>
          <span>Price: <b style="color:var(--gold-accent);">${l.pricePerUnit} KS/${l.currency}</b></span>
        </div>

        <div style="font-size:10px; color:var(--text-muted); margin-bottom:8px;">
          Payments: ${l.paymentMethods.join(', ')} | Note: ${l.notes}
        </div>

        <button onclick="PayWellP2P.initiateP2PTrade('${l.id}')" class="btn btn-gold" style="width:100%; padding:6px; font-size:11px; font-weight:700;">🛒 Buy Now (Escrow Protected)</button>
      </div>
    `).join('');
  },

  initiateP2PTrade(listingId) {
    const user = window.PayWellAuth ? window.PayWellAuth.currentUser : null;
    if (!user) {
      alert("Please log in to trade!");
      return;
    }

    const rawListing = window.PayWellDB.getP2PListings().find(l => l.id === listingId);
    if (!rawListing) return;

    const listing = {
      ...rawListing,
      currency: rawListing.currency || rawListing.asset || 'PW',
      available: rawListing.available || rawListing.total_amount || 1000,
      pricePerUnit: rawListing.pricePerUnit || rawListing.price_mmk || 3200
    };

    if (listing.seller.toLowerCase() === user.username.toLowerCase()) {
      alert("You cannot buy from your own listing!");
      return;
    }

    const amtStr = prompt(`Enter ${listing.currency} amount to buy from @${listing.seller} (Max: ${listing.available}):`, "1000");
    if (!amtStr) return;

    const amt = parseFloat(amtStr);
    if (isNaN(amt) || amt <= 0 || amt > listing.available) {
      alert("Invalid purchase amount!");
      return;
    }

    try {
      const order = window.PayWellDB.createP2POrder(user.username, listingId, amt);
      alert(`✨ P2P Trade Order Created! #${order.orderId || order.id}\n\nEscrow is active. Transfer ${(order.totalPay || order.total_mmk || 0).toLocaleString()} KS to Seller Kpay, then confirm in My Orders chat.`);
      this.switchTab('orders');
      this.openP2PChat(order.orderId || order.id);
    } catch (err) {
      alert(err.message || "Failed to create P2P order.");
    }
  },

  submitSellerLicense() {
    const user = window.PayWellAuth ? window.PayWellAuth.currentUser : null;
    if (!user) return;

    const fullName = document.getElementById('lic-fullname')?.value?.trim();
    const phone = document.getElementById('lic-phone')?.value?.trim();
    const kpayNum = document.getElementById('lic-kpay-num')?.value?.trim();
    const kpayName = document.getElementById('lic-kpay-name')?.value?.trim();

    if (!fullName || !phone || !kpayNum || !kpayName) {
      alert("Please fill in all required personal and Kpay information!");
      return;
    }

    try {
      const app = window.PayWellDB.submitSellerLicenseApplication({
        username: user.username,
        fullName,
        phone,
        kpayNum,
        kpayName
      });
      alert(`📋 License Application Submitted!\nOwner @Yuji_luke will review your details.`);
      this.switchTab('market');
    } catch (err) {
      alert(err.message || "License submission failed");
    }
  },

  submitCreateListing() {
    const user = window.PayWellAuth ? window.PayWellAuth.currentUser : null;
    if (!user) return;

    const curr = document.getElementById('p2p-create-curr')?.value || 'PW';
    const amt = parseFloat(document.getElementById('p2p-create-amt')?.value || 0);
    const price = parseFloat(document.getElementById('p2p-create-price')?.value || 0);
    const notes = document.getElementById('p2p-create-notes')?.value?.trim();

    if (amt <= 0 || price <= 0) {
      alert("Please enter a valid amount and price per unit!");
      return;
    }

    try {
      const listing = window.PayWellDB.createP2PListing({
        seller: user.username,
        type: 'sell',
        currency: curr,
        total_amount: amt,
        price_mmk: price,
        payment_method: 'KBZPay',
        notes: notes
      });
      alert(`✨ P2P Listing Published (#${listing.id})! Available on P2P Feed.`);
      this.switchTab('market');
    } catch (err) {
      alert(err.message || "Failed to create listing");
    }
  },

  renderUserP2POrders() {
    const user = window.PayWellAuth ? window.PayWellAuth.currentUser : null;
    if (!user) return;

    const orders = window.PayWellDB.getP2POrders().filter(o =>
      (o.buyer && o.buyer.toLowerCase() === user.username.toLowerCase()) ||
      (o.seller && o.seller.toLowerCase() === user.username.toLowerCase())
    );

    const container = document.getElementById('p2p-orders-container');
    if (!container) return;

    if (orders.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:11px;">No active P2P trade orders found.</div>`;
      return;
    }

    container.innerHTML = orders.map(o => {
      const isBuyer = o.buyer && o.buyer.toLowerCase() === user.username.toLowerCase();
      const orderId = o.orderId || o.id;
      const totalPay = o.totalPay || o.total_mmk || 0;
      const currency = o.currency || 'PW';

      return `
        <div class="glass-card" style="padding:12px; margin-bottom:8px; border-left:3px solid ${o.status === 'completed' ? 'var(--primary-green)' : 'var(--gold-accent)'};">
          <div style="display:flex; justify-content:space-between; font-size:12px; font-weight:700; margin-bottom:4px;">
            <span style="color:#fff; font-family:var(--font-mono);">${orderId} (${currency})</span>
            <span style="color:${o.status === 'completed' ? 'var(--primary-green)' : 'var(--gold-accent)'};">${(o.status || 'pending').toUpperCase()}</span>
          </div>
          <div style="font-size:10px; color:var(--text-muted); margin-bottom:6px;">
            ${isBuyer ? `Seller: @${o.seller}` : `Buyer: @${o.buyer}`} | Amount: ${o.amount} ${currency} | Total: ${totalPay.toLocaleString()} KS
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
            <button onclick="PayWellP2P.openP2PChat('${orderId}')" class="btn btn-gold" style="padding:4px; font-size:10px;">💬 Trade Chat</button>
            ${isBuyer && o.status !== 'completed' ? `<button onclick="PayWellP2P.markPaymentSent('${orderId}')" class="btn btn-primary" style="padding:4px; font-size:10px;">✓ Mark Paid</button>` : ''}
            ${!isBuyer && o.status !== 'completed' ? `<button onclick="PayWellP2P.releaseP2PEscrow('${orderId}')" class="btn btn-primary" style="padding:4px; font-size:10px;">🔓 Release Escrow</button>` : ''}
          </div>
        </div>
      `;
    }).join('');
  },

  markPaymentSent(orderId) {
    try {
      window.PayWellDB.confirmP2POrderPayment(orderId, 'buyer');
      alert("✓ Marked as Paid! Seller notified to verify and release Escrow.");
      this.renderUserP2POrders();
    } catch (err) {
      alert(err.message);
    }
  },

  releaseP2PEscrow(orderId) {
    try {
      window.PayWellDB.confirmP2POrderPayment(orderId, 'seller');
      alert("🔓 Escrow Released! Funds transferred to Buyer.");
      this.renderUserP2POrders();
    } catch (err) {
      alert(err.message);
    }
  },

  openP2PChat(orderId) {
    this.activeChatOrderId = orderId;
    window.PayWellRouter.openModal('modal-p2p-chat');
    const title = document.getElementById('p2p-chat-title');
    if (title) title.innerText = `💬 Trade Chat #${orderId}`;
    this.renderChatMessages();

    if (this.chatTimer) clearInterval(this.chatTimer);
    this.chatTimer = setInterval(() => this.renderChatMessages(), 3000);
  },

  renderChatMessages() {
    if (!this.activeChatOrderId) return;
    const container = document.getElementById('p2p-chat-msgs');
    if (!container) return;

    const msgs = window.PayWellDB.getP2PChatMessages(this.activeChatOrderId);
    const user = window.PayWellAuth ? window.PayWellAuth.currentUser : null;

    if (msgs.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:12px; color:var(--text-muted); font-size:10px;">No messages in order chat yet. Attach payment proof or chat below!</div>`;
      return;
    }

    container.innerHTML = msgs.map(m => {
      const isMe = user && m.sender.toLowerCase() === user.username.toLowerCase();
      return `
        <div style="display:flex; justify-content:${isMe ? 'flex-end' : 'flex-start'}; margin-bottom:6px;">
          <div style="max-width:80%; background:${isMe ? 'rgba(0,230,118,0.2)' : 'rgba(255,255,255,0.1)'}; padding:8px 10px; border-radius:10px; font-size:11px; border:1px solid ${isMe ? 'var(--primary-green)' : 'var(--border-glass)'};">
            <div style="font-size:9px; color:var(--gold-accent); font-weight:700; margin-bottom:2px;">@${m.sender} • ${m.time}</div>
            ${m.text ? `<div>${m.text}</div>` : ''}
            ${m.image ? `<img src="${m.image}" style="max-width:100%; border-radius:6px; margin-top:4px; display:block;">` : ''}
          </div>
        </div>
      `;
    }).join('');

    container.scrollTop = container.scrollHeight;
  },

  sendChatMessage() {
    const user = window.PayWellAuth ? window.PayWellAuth.currentUser : null;
    if (!user || !this.activeChatOrderId) return;

    const input = document.getElementById('p2p-chat-input');
    const text = input?.value?.trim();
    const imgFile = document.getElementById('p2p-chat-file')?.files[0];

    if (!text && !imgFile) return;

    if (imgFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        window.PayWellDB.sendP2PChatMessage(this.activeChatOrderId, user.username, text, e.target.result);
        if (input) input.value = '';
        document.getElementById('p2p-chat-file').value = '';
        this.renderChatMessages();
      };
      reader.readAsDataURL(imgFile);
    } else {
      window.PayWellDB.sendP2PChatMessage(this.activeChatOrderId, user.username, text, null);
      if (input) input.value = '';
      this.renderChatMessages();
    }
  }
};

window.PayWellP2P = PayWellP2P;
