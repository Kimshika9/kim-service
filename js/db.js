/**
 * PayWell Client-Side Local Database Engine (For GitHub Pages & Offline Persistence)
 */

const PayWellDB = {
  STORAGE_USERS: 'paywell_db_users',
  STORAGE_TXS: 'paywell_db_transactions',
  STORAGE_STORE: 'paywell_db_store',
  STORAGE_CRYPTO: 'paywell_db_crypto',
  STORAGE_P2P_LISTINGS: 'paywell_db_p2p_listings',
  STORAGE_P2P_ORDERS: 'paywell_db_p2p_orders',
  STORAGE_P2P_CHAT: 'paywell_db_p2p_chat',
  STORAGE_PETS: 'paywell_db_pets',
  STORAGE_SAVINGS: 'paywell_db_savings',
  STORAGE_PFT: 'paywell_db_pft',
  STORAGE_AUCTIONS: 'paywell_db_auctions',
  STORAGE_QUESTS: 'paywell_db_quests',

  // All 20 Requested Cryptocurrencies
  CRYPTO_COINS: [
    { symbol: 'BTC', name: 'Bitcoin', price: 65000.0, icon: '₿', change24h: 2.5, volume24h: '1.2B', high24h: 66200, low24h: 64100 },
    { symbol: 'ETH', name: 'Ethereum', price: 3500.0, icon: 'Ξ', change24h: -1.2, volume24h: '850M', high24h: 3580, low24h: 3420 },
    { symbol: 'BNB', name: 'Binance Coin', price: 580.0, icon: '🟡', change24h: 1.8, volume24h: '320M', high24h: 595, low24h: 570 },
    { symbol: 'SOL', name: 'Solana', price: 145.0, icon: '◎', change24h: -2.4, volume24h: '410M', high24h: 152, low24h: 140 },
    { symbol: 'XRP', name: 'Ripple', price: 0.55, icon: '✕', change24h: -0.8, volume24h: '290M', high24h: 0.58, low24h: 0.53 },
    { symbol: 'ADA', name: 'Cardano', price: 0.38, icon: '₳', change24h: 1.1, volume24h: '95M', high24h: 0.40, low24h: 0.36 },
    { symbol: 'DOGE', name: 'Dogecoin', price: 0.12, icon: '🐕', change24h: 5.6, volume24h: '180M', high24h: 0.13, low24h: 0.11 },
    { symbol: 'DOT', name: 'Polkadot', price: 6.20, icon: '🟣', change24h: 0.9, volume24h: '75M', high24h: 6.50, low24h: 6.00 },
    { symbol: 'AVAX', name: 'Avalanche', price: 28.0, icon: '🔺', change24h: 3.2, volume24h: '110M', high24h: 29.5, low24h: 26.8 },
    { symbol: 'LINK', name: 'Chainlink', price: 14.50, icon: '🔗', change24h: 1.5, volume24h: '88M', high24h: 15.20, low24h: 14.00 },
    { symbol: 'MATIC', name: 'Polygon', price: 0.42, icon: '🟣', change24h: -0.5, volume24h: '65M', high24h: 0.45, low24h: 0.40 },
    { symbol: 'LTC', name: 'Litecoin', price: 68.0, icon: 'Ł', change24h: 0.4, volume24h: '120M', high24h: 71.0, low24h: 66.5 },
    { symbol: 'TRX', name: 'TRON', price: 0.15, icon: '🔴', change24h: 0.8, volume24h: '140M', high24h: 0.16, low24h: 0.14 },
    { symbol: 'SHIB', name: 'Shiba Inu', price: 0.000018, icon: '🐕', change24h: 4.2, volume24h: '210M', high24h: 0.000019, low24h: 0.000017 },
    { symbol: 'UNI', name: 'Uniswap', price: 6.80, icon: '🦄', change24h: -1.1, volume24h: '90M', high24h: 7.10, low24h: 6.60 },
    { symbol: 'ATOM', name: 'Cosmos', price: 4.80, icon: '⚛️', change24h: 2.1, volume24h: '55M', high24h: 5.00, low24h: 4.60 },
    { symbol: 'XLM', name: 'Stellar', price: 0.095, icon: '🚀', change24h: 0.3, volume24h: '40M', high24h: 0.10, low24h: 0.09 },
    { symbol: 'XMR', name: 'Monero', price: 155.0, icon: '🔒', change24h: 1.7, volume24h: '80M', high24h: 160.0, low24h: 150.0 },
    { symbol: 'FIL', name: 'Filecoin', price: 3.80, icon: '📁', change24h: -0.9, volume24h: '45M', high24h: 4.00, low24h: 3.70 },
    { symbol: 'AAVE', name: 'Aave', price: 135.0, icon: '👻', change24h: 3.8, volume24h: '130M', high24h: 142.0, low24h: 128.0 }
  ],

  // 50 Full Profile Decoration Items
  DECORATIONS: [
    // 15 Backgrounds
    { id: 'bg1', category: 'background', name: 'Neon City Night', style: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
    { id: 'bg2', category: 'background', name: 'Galaxy Stars', style: 'radial-gradient(circle, #1a0033, #000000)' },
    { id: 'bg3', category: 'background', name: 'Ocean Waves', style: 'linear-gradient(135deg, #000428, #004e92)' },
    { id: 'bg4', category: 'background', name: 'Fire Flames', style: 'linear-gradient(135deg, #3a0007, #8a0000)' },
    { id: 'bg5', category: 'background', name: 'Cyber Grid', style: 'linear-gradient(135deg, #002b1f, #000f0a)' },
    { id: 'bg6', category: 'background', name: 'Aurora Borealis', style: 'linear-gradient(135deg, #003973, #E5E5BE)' },
    { id: 'bg7', category: 'background', name: 'Matrix Rain', style: 'linear-gradient(135deg, #001100, #003300)' },
    { id: 'bg8', category: 'background', name: 'Sunset Gradient', style: 'linear-gradient(135deg, #4568DC, #B06AB3)' },
    { id: 'bg9', category: 'background', name: 'Mountain Peak', style: 'linear-gradient(135deg, #2c3e50, #000000)' },
    { id: 'bg10', category: 'background', name: 'Underwater World', style: 'linear-gradient(135deg, #001e3d, #000a14)' },
    { id: 'bg11', category: 'background', name: 'Space Nebula', style: 'linear-gradient(135deg, #20002c, #cbb4d4)' },
    { id: 'bg12', category: 'background', name: 'Golden Particles', style: 'linear-gradient(135deg, #3a2e00, #141000)' },
    { id: 'bg13', category: 'background', name: 'Electric Storm', style: 'linear-gradient(135deg, #1f1c2c, #928DAB)' },
    { id: 'bg14', category: 'background', name: 'Cherry Blossom', style: 'linear-gradient(135deg, #3d0c2e, #10020c)' },
    { id: 'bg15', category: 'background', name: 'Dragon Scales', style: 'linear-gradient(135deg, #002613, #000804)' },

    // 10 Frames
    { id: 'fr1', category: 'frame', name: 'Royal Gold Frame', class: 'frame-gold' },
    { id: 'fr2', category: 'frame', name: 'Neon Green Frame', class: 'frame-neon' },
    { id: 'fr3', category: 'frame', name: 'Rainbow Animated Frame', class: 'frame-rainbow' },
    { id: 'fr4', category: 'frame', name: 'Dragon Frame', class: 'frame-dragon' },
    { id: 'fr5', category: 'frame', name: 'Diamond Frame', class: 'frame-diamond' },
    { id: 'fr6', category: 'frame', name: 'Fire Frame', class: 'frame-fire' },
    { id: 'fr7', category: 'frame', name: 'Ice Frame', class: 'frame-ice' },
    { id: 'fr8', category: 'frame', name: 'Lightning Frame', class: 'frame-lightning' },
    { id: 'fr9', category: 'frame', name: 'Crown Frame', class: 'frame-crown' },
    { id: 'fr10', category: 'frame', name: 'Galaxy Frame', class: 'frame-galaxy' },

    // 10 Name Effects
    { id: 'ne1', category: 'name_effect', name: 'Rainbow Gradient', style: 'background:linear-gradient(90deg,red,orange,yellow,green,blue,indigo,violet);-webkit-background-clip:text;-webkit-text-fill-color:transparent;' },
    { id: 'ne2', category: 'name_effect', name: 'Neon Glow', style: 'color:#00E676;text-shadow:0 0 8px #00E676;' },
    { id: 'ne3', category: 'name_effect', name: 'Gold Shine', style: 'color:#FFD700;text-shadow:0 0 8px #FFD700;' },
    { id: 'ne4', category: 'name_effect', name: 'Fire Effect', style: 'color:#FF5252;text-shadow:0 0 8px #FF5252;' },
    { id: 'ne5', category: 'name_effect', name: 'Ice Effect', style: 'color:#00B4D8;text-shadow:0 0 8px #00B4D8;' },
    { id: 'ne6', category: 'name_effect', name: 'Lightning Pulse', style: 'color:#B388FF;text-shadow:0 0 8px #B388FF;' },
    { id: 'ne7', category: 'name_effect', name: 'Galaxy Sparkle', style: 'color:#E040FB;text-shadow:0 0 8px #E040FB;' },
    { id: 'ne8', category: 'name_effect', name: 'Water Ripple', style: 'color:#18FFFF;text-shadow:0 0 8px #18FFFF;' },
    { id: 'ne9', category: 'name_effect', name: 'Shadow Phantom', style: 'color:#FFFFFF;text-shadow:0 0 10px #000000;' },
    { id: 'ne10', category: 'name_effect', name: 'Crystal Glow', style: 'color:#EA80FC;text-shadow:0 0 8px #EA80FC;' },

    // 10 Badges
    { id: 'bd1', category: 'badge', name: 'VIP Crown', icon: '👑' },
    { id: 'bd2', category: 'badge', name: 'Diamond Member', icon: '💎' },
    { id: 'bd3', category: 'badge', name: 'Gold Trader', icon: '🥇' },
    { id: 'bd4', category: 'badge', name: 'Early Adopter', icon: '🚀' },
    { id: 'bd5', category: 'badge', name: 'Community Leader', icon: '⭐' },
    { id: 'bd6', category: 'badge', name: 'Top Spender', icon: '💰' },
    { id: 'bd7', category: 'badge', name: 'Tournament Champion', icon: '🏆' },
    { id: 'bd8', category: 'badge', name: 'Pet Master', icon: '🐾' },
    { id: 'bd9', category: 'badge', name: 'Crypto Expert', icon: '📈' },
    { id: 'bd10', category: 'badge', name: 'Legendary User', icon: '⚡' },

    // 5 Avatar Effects
    { id: 'ae1', category: 'avatar_effect', name: 'Golden Halo', icon: '✨' },
    { id: 'ae2', category: 'avatar_effect', name: 'Dragon Aura', icon: '🐉' },
    { id: 'ae3', category: 'avatar_effect', name: 'Phoenix Wings', icon: '🦅' },
    { id: 'ae4', category: 'avatar_effect', name: 'Lightning Shield', icon: '🛡️' },
    { id: 'ae5', category: 'avatar_effect', name: 'Galaxy Ring', icon: '🪐' }
  ],

  init() {
    let users = this.getUsers();
    if (users.length === 0) {
      users = [
        {
          id: 1,
          username: 'Yuji_luke',
          email: 'yuji_luke@paywell.app',
          password_hash: this.hash('OwnerPass123!'),
          telegram_id: '6399210935',
          telegram_username: 'Yuji_luke',
          balance: 100000.0,
          status: 'active',
          role: 'owner',
          created_at: new Date().toISOString()
        }
      ];
      this.saveUsers(users);
    }

    let store = this.getStoreItems();
    if (store.length === 0) {
      store = [
        { id: 1, name: "VIP Gold Badge", description: "Exclusive glowing Gold Badge on your PayWell profile", price: 500.0, image_url: "👑", stock: 50, category: "badges", featured: 1 },
        { id: 2, name: "Custom Profile Frame", description: "Futuristic neon green particle frame for Mini App", price: 250.0, image_url: "🖼️", stock: 100, category: "frames", featured: 1 },
        { id: 3, name: "Community Speed Boost", description: "Priority order processing in community events", price: 150.0, image_url: "⚡", stock: 200, category: "boosts", featured: 0 },
        { id: 4, name: "Crown Mystery Box", description: "Contains random PW rewards ranging from 50 to 1000 PW", price: 100.0, image_url: "🎁", stock: 500, category: "mystery", featured: 1 }
      ];
      this.saveStoreItems(store);
    }

    let listings = this.getP2PListings();
    if (listings.length === 0) {
      listings = [
        { id: 'p2p-1', seller: 'KBZ_Merchant', type: 'sell', asset: 'PW', price_mmk: 3200, total_amount: 1000, min_limit: 10, payment_method: 'KBZPay', status: 'active', badge: 'Verified Seller' },
        { id: 'p2p-2', seller: 'Aung_Exchange', type: 'sell', asset: 'PW', price_mmk: 3180, total_amount: 500, min_limit: 5, payment_method: 'CBPay / KBZPay', status: 'active', badge: 'Pro Trader' }
      ];
      localStorage.setItem(this.STORAGE_P2P_LISTINGS, JSON.stringify(listings));
    }
  },

  hash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  },

  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_USERS)) || [];
    } catch (e) {
      return [];
    }
  },

  saveUsers(users) {
    localStorage.setItem(this.STORAGE_USERS, JSON.stringify(users));
  },

  findUser(identifier) {
    const users = this.getUsers();
    return users.find(u =>
      u.username.toLowerCase() === identifier.toLowerCase() ||
      (u.email && u.email.toLowerCase() === identifier.toLowerCase()) ||
      (u.telegram_id && String(u.telegram_id) === String(identifier))
    );
  },

  registerUser(username, email, password, telegram_id = null) {
    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("Username is already taken");
    }

    const isOwner = (username === 'Yuji_luke' || String(telegram_id) === '6399210935');
    const newUser = {
      id: Date.now(),
      username: username,
      email: email || null,
      password_hash: this.hash(password || 'default123'),
      telegram_id: telegram_id ? String(telegram_id) : null,
      telegram_username: username,
      balance: 0.0,
      status: 'active',
      role: isOwner ? 'owner' : 'user',
      created_at: new Date().toLocaleString()
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  loginUser(identifier, password) {
    const user = this.findUser(identifier);
    if (!user) {
      throw new Error("Account not found. Please register a new account!");
    }
    const pwdHash = this.hash(password);
    if (user.password_hash && user.password_hash !== pwdHash) {
      throw new Error("Invalid username or password");
    }
    if (user.status === 'frozen') {
      throw new Error("Account is frozen. Please contact support @Yuji_luke");
    }
    return user;
  },

  getTransactions(username) {
    try {
      const txs = JSON.parse(localStorage.getItem(this.STORAGE_TXS)) || [];
      return txs.filter(t => t.sender_username === username || t.receiver_username === username);
    } catch (e) {
      return [];
    }
  },

  addTransaction(tx) {
    const txs = JSON.parse(localStorage.getItem(this.STORAGE_TXS)) || [];
    txs.unshift(tx);
    localStorage.setItem(this.STORAGE_TXS, JSON.stringify(txs));
  },

  transfer(senderName, receiverName, amount, note = '') {
    if (amount <= 0) throw new Error("Amount must be greater than 0");
    if (senderName.toLowerCase() === receiverName.toLowerCase()) throw new Error("Cannot send to yourself");

    const users = this.getUsers();
    const sender = users.find(u => u.username.toLowerCase() === senderName.toLowerCase());
    const receiver = users.find(u => u.username.toLowerCase() === receiverName.toLowerCase());

    if (!sender) throw new Error("Sender account error");
    if (!receiver) throw new Error(`Recipient @${receiverName} not found`);
    if (sender.balance < amount) throw new Error("Insufficient balance");

    sender.balance -= amount;
    receiver.balance += amount;
    this.saveUsers(users);

    const txId = `PW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const tx = {
      id: txId,
      sender_username: sender.username,
      receiver_username: receiver.username,
      amount: amount,
      fee: 0.0,
      total: amount,
      type: 'transfer',
      note: note,
      status: 'success',
      created_at: new Date().toLocaleString()
    };

    this.addTransaction(tx);
    return { tx_id: txId, new_balance: sender.balance, timestamp: tx.created_at };
  },

  getStoreItems() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_STORE)) || [];
    } catch (e) {
      return [];
    }
  },

  saveStoreItems(items) {
    localStorage.setItem(this.STORAGE_STORE, JSON.stringify(items));
  },

  buyStoreItem(username, itemId) {
    const items = this.getStoreItems();
    const item = items.find(i => i.id === itemId);
    if (!item) throw new Error("Item not found");
    if (item.stock === 0) throw new Error("Item out of stock");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.balance < item.price) throw new Error("Insufficient PW balance");

    user.balance -= item.price;
    if (item.stock > 0) item.stock -= 1;

    this.saveUsers(users);
    this.saveStoreItems(items);

    const txId = `PW-STORE-${Date.now()}`;
    const tx = {
      id: txId,
      sender_username: user.username,
      receiver_username: "PayWell Store",
      amount: item.price,
      fee: 0.0,
      total: item.price,
      type: 'store_purchase',
      note: `Purchased ${item.name}`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };

    this.addTransaction(tx);
    return { tx_id: txId, item: item, new_balance: user.balance };
  },

  adjustBalance(targetUsername, amount, type, reason) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === targetUsername.toLowerCase());
    if (!user) throw new Error("Target user not found");

    if (type === 'deduct' && user.balance < amount) {
      throw new Error("Cannot deduct more than user current balance");
    }

    if (type === 'add') {
      user.balance += amount;
    } else {
      user.balance -= amount;
    }

    this.saveUsers(users);

    const txId = `PW-OWNER-${Date.now()}`;
    const tx = {
      id: txId,
      sender_username: type === 'add' ? "System Owner" : user.username,
      receiver_username: type === 'add' ? user.username : "System Deduction",
      amount: amount,
      fee: 0.0,
      total: amount,
      type: `owner_${type}`,
      note: reason,
      status: 'success',
      created_at: new Date().toLocaleString()
    };

    this.addTransaction(tx);
    return { tx_id: txId, new_balance: user.balance };
  },

  // --- CRYPTO WALLET & TRADING ---
  getUserCryptoWallet(username) {
    try {
      const data = JSON.parse(localStorage.getItem(this.STORAGE_CRYPTO)) || {};
      return data[username] || { holdings: {} };
    } catch (e) {
      return { holdings: {} };
    }
  },

  tradeCrypto(username, coinSymbol, type, amountPW) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User error");

    const coin = this.CRYPTO_COINS.find(c => c.symbol === coinSymbol);
    if (!coin) throw new Error("Invalid crypto coin");

    const walletData = JSON.parse(localStorage.getItem(this.STORAGE_CRYPTO)) || {};
    if (!walletData[username]) walletData[username] = { holdings: {} };
    const wallet = walletData[username];

    const cryptoAmount = amountPW / coin.price;

    if (type === 'buy') {
      if (user.balance < amountPW) throw new Error(`Insufficient PW balance. Need ${amountPW.toFixed(2)} PW.`);
      user.balance -= amountPW;
      wallet.holdings[coinSymbol] = (wallet.holdings[coinSymbol] || 0) + cryptoAmount;
    } else {
      if ((wallet.holdings[coinSymbol] || 0) < cryptoAmount) throw new Error(`Insufficient ${coinSymbol} balance.`);
      wallet.holdings[coinSymbol] -= cryptoAmount;
      user.balance += amountPW;
    }

    this.saveUsers(users);
    localStorage.setItem(this.STORAGE_CRYPTO, JSON.stringify(walletData));

    return { new_balance: user.balance, cryptoAmount: cryptoAmount, coin: coin };
  },

  // --- P2P ESCROW MARKETPLACE ---
  getP2PListings() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_P2P_LISTINGS)) || [];
    } catch (e) {
      return [];
    }
  },

  createP2POrder(buyerUsername, listingId, amount) {
    const listings = this.getP2PListings();
    const listing = listings.find(l => l.id === listingId);
    if (!listing) throw new Error("P2P listing not found");

    const orders = JSON.parse(localStorage.getItem(this.STORAGE_P2P_ORDERS)) || [];
    const orderId = `P2P-ORD-${Date.now()}`;
    const newOrder = {
      id: orderId,
      orderId: orderId,
      listing_id: listingId,
      seller: listing.seller,
      buyer: buyerUsername,
      amount: amount,
      currency: listing.currency || listing.asset || 'PW',
      totalPay: amount * (listing.pricePerUnit || listing.price_mmk || 3200),
      total_mmk: amount * (listing.pricePerUnit || listing.price_mmk || 3200),
      payment_method: listing.payment_method || 'KBZPay',
      status: 'escrow_locked',
      created_at: new Date().toLocaleString()
    };

    orders.unshift(newOrder);
    localStorage.setItem(this.STORAGE_P2P_ORDERS, JSON.stringify(orders));
    return newOrder;
  },

  submitSellerLicenseApplication(data) {
    return { success: true, appId: `LIC-${Date.now()}`, message: "License application submitted for Owner review." };
  },

  createP2PListing(data) {
    const listings = this.getP2PListings();
    const newListing = {
      id: `p2p-${Date.now()}`,
      seller: data.seller,
      type: data.type || 'sell',
      asset: data.currency || 'PW',
      currency: data.currency || 'PW',
      price_mmk: parseFloat(data.price_mmk),
      pricePerUnit: parseFloat(data.price_mmk),
      total_amount: parseFloat(data.total_amount),
      available: parseFloat(data.total_amount),
      min_limit: parseFloat(data.min_limit) || 5,
      payment_method: data.payment_method || 'KBZPay',
      paymentMethods: [data.payment_method || 'KBZPay'],
      status: 'active',
      badge: 'Merchant',
      rating: 5.0,
      trades: 1
    };
    listings.unshift(newListing);
    localStorage.setItem(this.STORAGE_P2P_LISTINGS, JSON.stringify(listings));
    return newListing;
  },

  getP2POrders() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_P2P_ORDERS)) || [];
    } catch (e) {
      return [];
    }
  },

  confirmP2POrderPayment(orderId, role) {
    const orders = JSON.parse(localStorage.getItem(this.STORAGE_P2P_ORDERS)) || [];
    const order = orders.find(o => o.id === orderId || o.orderId === orderId);
    if (!order) throw new Error("Order not found");
    if (role === 'buyer') {
      order.status = 'payment_sent';
    } else {
      order.status = 'completed';
    }
    localStorage.setItem(this.STORAGE_P2P_ORDERS, JSON.stringify(orders));
    return order;
  },

  getP2PChatMessages(orderId) {
    try {
      const chats = JSON.parse(localStorage.getItem(this.STORAGE_P2P_CHAT)) || {};
      return chats[orderId] || [
        { sender: 'System', text: 'Escrow initialized. Please complete payment within 15 minutes.', time: new Date().toLocaleTimeString() }
      ];
    } catch (e) {
      return [];
    }
  },

  sendP2PChatMessage(orderId, sender, text, image = null) {
    const chats = JSON.parse(localStorage.getItem(this.STORAGE_P2P_CHAT)) || {};
    if (!chats[orderId]) chats[orderId] = [];
    const msg = { sender, text, image, time: new Date().toLocaleTimeString() };
    chats[orderId].push(msg);
    localStorage.setItem(this.STORAGE_P2P_CHAT, JSON.stringify(chats));
    return msg;
  }
};

PayWellDB.init();
window.PayWellDB = PayWellDB;
