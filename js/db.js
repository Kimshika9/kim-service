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
  STORAGE_NEXORA_PRICES: 'paywell_db_nexora_prices',
  STORAGE_KPAY_DEPOSITS: 'paywell_db_kpay_deposits',
  STORAGE_KPAY_WITHDRAWALS: 'paywell_db_kpay_withdrawals',
  STORAGE_PENALTIES: 'paywell_db_penalties',
  STORAGE_STREAKS: 'paywell_db_streaks',
  STORAGE_GLOBAL_MARKET: 'paywell_db_global_market',
  STORAGE_VISA_CARDS: 'paywell_db_visa_cards',
  STORAGE_LEVEL_PASSES: 'paywell_db_level_passes',
  STORAGE_REFERRALS: 'paywell_db_referrals',

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

    if (!localStorage.getItem(this.STORAGE_NEXORA_PRICES)) {
      const defaultNexora = {
        one_time: 500,
        monthly: 5000,
        yearly: 50000,
        permanent: 500000
      };
      localStorage.setItem(this.STORAGE_NEXORA_PRICES, JSON.stringify(defaultNexora));
    }

    if (!localStorage.getItem(this.STORAGE_PETS)) {
      const defaultPets = [
        {
          id: 'pet-1',
          name: 'Ignis Ember',
          type: 'Dragon',
          image: '🐉',
          rarity: 'Legendary',
          personality: 'Brave',
          skill: 'Savings Boost',
          price: 2500,
          description: 'A fiery dragon companion that increases your daily savings vault interest rate.'
        },
        {
          id: 'pet-2',
          name: 'Aether Fox',
          type: 'Fox',
          image: '🦊',
          rarity: 'Rare',
          personality: 'Clever',
          skill: 'Money Finder',
          price: 1200,
          description: 'A sly cosmic fox that uncovers daily PW token rewards.'
        },
        {
          id: 'pet-3',
          name: 'Shadow Wolf',
          type: 'Wolf',
          image: '🐺',
          rarity: 'Epic',
          personality: 'Protective',
          skill: 'Fee Reduction',
          price: 1800,
          description: 'A fierce wolf guardian that slashes transaction fees.'
        }
      ];
      localStorage.setItem(this.STORAGE_PETS, JSON.stringify(defaultPets));
    }
  },

  getNexoraPrices() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_NEXORA_PRICES)) || { one_time: 500, monthly: 5000, yearly: 50000, permanent: 500000 };
    } catch(e) {
      return { one_time: 500, monthly: 5000, yearly: 50000, permanent: 500000 };
    }
  },

  saveNexoraPrices(prices) {
    localStorage.setItem(this.STORAGE_NEXORA_PRICES, JSON.stringify(prices));
  },

  getPets() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_PETS)) || [];
    } catch(e) {
      return [];
    }
  },

  saveOwnerPet(petData) {
    const pets = this.getPets();
    const newPet = {
      id: `pet-${Date.now()}`,
      name: petData.name,
      type: petData.type,
      image: petData.image || '🐉',
      rarity: petData.rarity || 'Common',
      personality: petData.personality || 'Playful',
      skill: petData.skill || 'Savings Boost',
      price: parseFloat(petData.price) || 500,
      description: petData.description || 'Exclusive community pet companion.'
    };
    pets.push(newPet);
    localStorage.setItem(this.STORAGE_PETS, JSON.stringify(pets));
    return newPet;
  },

  getUserPet(username) {
    try {
      const userPets = JSON.parse(localStorage.getItem('paywell_user_active_pets')) || {};
      return userPets[username] || {
        petId: 'pet-1',
        name: 'Ignis Ember',
        type: 'Dragon',
        image: '🐉',
        rarity: 'Legendary',
        personality: 'Brave',
        skill: 'Savings Boost',
        level: 0,
        xp: 0,
        energy: 100,
        lastFed: Date.now()
      };
    } catch(e) {
      return null;
    }
  },

  saveUserPet(username, petState) {
    const userPets = JSON.parse(localStorage.getItem('paywell_user_active_pets')) || {};
    userPets[username] = petState;
    localStorage.setItem('paywell_user_active_pets', JSON.stringify(userPets));
  },

  addPetXP(username, amount, reason = '') {
    const pet = this.getUserPet(username);
    if (!pet) return;

    pet.xp += amount;
    const xpNeeded = 100 + (pet.level * 50);
    if (pet.xp >= xpNeeded) {
      pet.level += 1;
      pet.xp -= xpNeeded;
    }
    this.saveUserPet(username, pet);
    return pet;
  },

  getKpayDeposits() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KPAY_DEPOSITS)) || [];
    } catch(e) {
      return [];
    }
  },

  submitKpayDeposit(username, amountKs, proofImg) {
    const deposits = this.getKpayDeposits();
    const feeKs = Math.floor(Math.random() * 900) + 100; // 100-999 KS random fee
    const dep = {
      id: `DEP-${Date.now()}`,
      username: username,
      amount_ks: amountKs,
      fee_ks: feeKs,
      kpay_no: '09763458034 (DMTD)',
      proof: proofImg || null,
      status: 'pending',
      created_at: new Date().toLocaleString()
    };
    deposits.unshift(dep);
    localStorage.setItem(this.STORAGE_KPAY_DEPOSITS, JSON.stringify(deposits));
    return dep;
  },

  approveKpayDeposit(depositId) {
    const deposits = this.getKpayDeposits();
    const dep = deposits.find(d => d.id === depositId);
    if (!dep || dep.status === 'done') return;

    dep.status = 'done';
    localStorage.setItem(this.STORAGE_KPAY_DEPOSITS, JSON.stringify(deposits));

    // Credit user balance (1 PW per 1 KS ratio for community token)
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === dep.username.toLowerCase());
    if (user) {
      user.balance += dep.amount_ks;
      this.saveUsers(users);
    }
    return dep;
  },

  getUserPenalty(username) {
    try {
      const penalties = JSON.parse(localStorage.getItem(this.STORAGE_PENALTIES)) || {};
      return penalties[username] || { level: 0, status: 'Clean', details: [] };
    } catch(e) {
      return { level: 0, status: 'Clean', details: [] };
    }
  },

  setUserPenalty(username, level, reason) {
    const penalties = JSON.parse(localStorage.getItem(this.STORAGE_PENALTIES)) || {};
    const statuses = ['Clean', 'Level 1: Warning', 'Level 2: Trade Freeze', 'Level 3: Temp Suspension', 'Level 4: Permanent Ban'];
    penalties[username] = {
      level: level,
      status: statuses[level] || 'Clean',
      reason: reason,
      updated_at: new Date().toLocaleString()
    };
    localStorage.setItem(this.STORAGE_PENALTIES, JSON.stringify(penalties));

    // Update user status
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      if (level === 4) user.status = 'banned';
      else if (level === 2 || level === 3) user.status = 'frozen';
      else user.status = 'active';
      this.saveUsers(users);
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
      let items = JSON.parse(localStorage.getItem(this.STORAGE_STORE));
      if (!items || items.length < 100) {
        items = [];
        let idCounter = 1;

        // 1. PFT Items (30 Items)
        const pftNames = ['Gold Dragon Emoji', 'Cyber Phoenix Emblem', 'Diamond Crown Badge', 'Neon Cyber Sword', 'Galaxy Portal', 'Fire Blast Symbol', 'Ice Crystal Shield', 'Lightning Bolt', 'Space Comet', 'Mystic Rune', 'Royal Seal', 'Cyberpunk Skull', 'Rainbow Star', 'Vip Key', 'Emerald Ring', 'Golden Clover', 'Titanium Helmet', 'Laser Gun', 'Alien Artifact', 'Quantum Core', 'Golden Coin', 'Plasma Orb', 'Sol Flare', 'Lunar Eclipse', 'Nebula Dust', 'Aether Feather', 'Chrono Watch', 'Starlight Crest', 'Void Mask', 'Infinity Stone'];
        const pftIcons = ['🐉', '🦅', '👑', '⚔️', '🌀', '🔥', '🛡️', '⚡', '☄️', '🔮', '🏵️', '💀', '⭐', '🔑', '💍', '🍀', '🪖', '🔫', '🛸', '⚛️', '🪙', '🔮', '☀️', '🌙', '✨', '🪶', '⌚', '🎖️', '🎭', '💎'];
        for (let i = 0; i < 30; i++) {
          items.push({
            id: idCounter++,
            category: 'PFT',
            name: pftNames[i],
            description: `Exclusive PFT collectible collectible #${i+1}`,
            price: 100 + (i * 50),
            stock: 100,
            image_url: pftIcons[i]
          });
        }

        // 2. Pet Items (15 Items)
        const petNames = ['Cyber Dragon', 'Celestial Phoenix', 'Mystic Unicorn', 'Alpha Wolf', 'Nine-Tailed Fox', 'Shadow Cat', 'Cyber Dog', 'Golden Rabbit', 'Panda Monk', 'Bengal Tiger', 'Royal Lion', 'Eagle Sentinel', 'Mech Shark', 'T-Rex Dino', 'Galaxy Pegasus'];
        const petIcons = ['🐲', '🦅', '🦄', '🐺', '🦊', '🐱', '🐶', '🐰', '🐼', '🐯', '🦁', '🦅', '🦈', '🦖', '🎠'];
        for (let i = 0; i < 15; i++) {
          items.push({
            id: idCounter++,
            category: 'Pet',
            name: petNames[i],
            description: `High XP companion pet with unique passive boosts`,
            price: 500 + (i * 200),
            stock: 50,
            image_url: petIcons[i]
          });
        }

        // 3. Profile Items (25 Items)
        const profileNames = ['Neon City Background', 'Galaxy Stars BG', 'Ocean Wave BG', 'Cyber Frame Gold', 'Rainbow Aura Frame', 'Dragon Scale Frame', 'Fire Glow Effect', 'Ice Pulse Effect', 'VIP Crown Badge', 'Champion Crest', 'Diamond Aura', 'Gold Name Gradient', 'Neon Shimmer', 'Water Ripple', 'Crystal Name Glow', 'Shadow Phantom', 'Matrix Code BG', 'Aurora BG', 'Golden Halo', 'Phoenix Wings', 'Lightning Shield', 'Galaxy Ring', 'Cherry Blossom BG', 'Mountain Peak BG', 'Cosmic Portal BG'];
        const profileIcons = ['🌆', '🌌', '🌊', '🖼️', '🌈', '🐲', '🔥', '❄️', '👑', '🏆', '💎', '✨', '⚡', '💧', '🔮', '👻', '🟩', '🌅', '😇', '🪶', '🛡️', '🪐', '🌸', '🏔️', '🪐'];
        for (let i = 0; i < 25; i++) {
          items.push({
            id: idCounter++,
            category: 'Profile',
            name: profileNames[i],
            description: `Custom profile decoration item for account flex`,
            price: 150 + (i * 80),
            stock: 200,
            image_url: profileIcons[i]
          });
        }

        // 4. Gift Cards (10 Items)
        const gcNames = ['PW 100 Token Gift Card', 'PW 500 Token Gift Card', 'PW 1000 Token Gift Card', 'PW 5000 Token VIP Card', 'NEXORA One-Time Pass Card', 'NEXORA Monthly VIP Card', 'NEXORA Yearly Pass Card', 'Global Tournament Entry Card', 'Community Pet Gift Pass', 'VIP Gold Access Voucher'];
        const gcIcons = ['🎁', '🎁', '🎁', '🎁', '🎫', '📅', '👑', '🏆', '🐾', '💳'];
        const gcPrices = [100, 500, 1000, 5000, 500, 5000, 50000, 1000, 1500, 10000];
        for (let i = 0; i < 10; i++) {
          items.push({
            id: idCounter++,
            category: 'Gift Cards',
            name: gcNames[i],
            description: `Redeemable gift card voucher for recipient accounts`,
            price: gcPrices[i],
            stock: 999,
            image_url: gcIcons[i]
          });
        }

        // 5. Level Pass (5 Items)
        const lpNames = ['Level 2 Instant Pass', 'Level 3 VIP Pass', 'Verified Seller Pass', 'P2P Merchant Pass', 'Ultimate Master Pass'];
        const lpIcons = ['⚡', '🚀', '🏷️', '🛒', '👑'];
        const lpPrices = [500, 2000, 1000, 1500, 10000];
        for (let i = 0; i < 5; i++) {
          items.push({
            id: idCounter++,
            category: 'Level Pass',
            name: lpNames[i],
            description: `Instantly bypass requirements and upgrade account level`,
            price: lpPrices[i],
            stock: 50,
            image_url: lpIcons[i]
          });
        }

        // 6. PFT Blind Box (5 Items)
        const boxNames = ['Common PFT Box', 'Rare PFT Box', 'Epic PFT Box', 'Legendary PFT Box', 'Mythic PFT Box'];
        const boxIcons = ['📦', '🎁', '🔮', '👑', '🌈'];
        const boxPrices = [100, 500, 2000, 10000, 50000];
        for (let i = 0; i < 5; i++) {
          items.push({
            id: idCounter++,
            category: 'Blind Box',
            name: boxNames[i],
            description: `Contains guaranteed PFT collectible drop with unboxing animation`,
            price: boxPrices[i],
            stock: 999,
            image_url: boxIcons[i],
            boxType: boxNames[i].split(' ')[0].toLowerCase()
          });
        }

        // 7. Other Items (10 Items)
        const otherNames = ['Streak Freeze Shield', 'Transaction Fee Waiver', 'Global Trade Booster', 'Gold ID Card Badge', 'Double XP Pet Treat', 'P2P Escrow Insurance', 'Custom Nickname Color', 'VIP Lounge Pass', 'Priority Support Pin', 'Community Star Badge'];
        const otherIcons = ['🛡️', '🧾', '🚀', '🪪', '🍖', '🔐', '🎨', '🍸', '📌', '🌟'];
        for (let i = 0; i < 10; i++) {
          items.push({
            id: idCounter++,
            category: 'Other',
            name: otherNames[i],
            description: `Special utility perk and system enhancement item`,
            price: 200 + (i * 100),
            stock: 100,
            image_url: otherIcons[i]
          });
        }

        localStorage.setItem(this.STORAGE_STORE, JSON.stringify(items));
      }
      return items;
    } catch (e) {
      return [];
    }
  },

  openBlindBox(username, boxType) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User not found");

    const drops = {
      common: [
        { name: 'Common Gold Coin', icon: '🪙' },
        { name: 'Common Bronze Badge', icon: '🥉' },
        { name: 'Common Cyber Clover', icon: '🍀' }
      ],
      rare: [
        { name: 'Rare Cyber Sword', icon: '⚔️' },
        { name: 'Rare Silver Trophy', icon: '🥈' },
        { name: 'Rare Crystal Orb', icon: '🔮' }
      ],
      epic: [
        { name: 'Epic Phoenix Feather', icon: '🪶' },
        { name: 'Epic Lightning Crown', icon: '⚡' },
        { name: 'Epic Diamond Ring', icon: '💍' }
      ],
      legendary: [
        { name: 'Legendary Gold Dragon Emblem', icon: '🐉' },
        { name: 'Legendary VIP Crown', icon: '👑' },
        { name: 'Legendary Infinity Gem', icon: '💎' }
      ],
      mythic: [
        { name: 'Mythic Celestial Star', icon: '🌟' },
        { name: 'Mythic Galaxy Core', icon: '🌌' },
        { name: 'Mythic Rainbow Deity', icon: '🌈' }
      ]
    };

    const dropList = drops[boxType.toLowerCase()] || drops.common;
    const droppedPFT = dropList[Math.floor(Math.random() * dropList.length)];

    this.equipPFT(username, droppedPFT);
    return droppedPFT;
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

  // --- P2P ESCROW MARKETPLACE & BOT SELLERS ---
  getP2PListings() {
    try {
      let listings = JSON.parse(localStorage.getItem(this.STORAGE_P2P_LISTINGS));
      if (!listings || listings.length === 0) {
        listings = [
          {
            id: 'BOT-PW-001',
            seller: 'PayWell_Bot_PW',
            isBot: true,
            botBadge: '🤖 Official PW Bot',
            rating: 5.0,
            trades: 9999,
            currency: 'PW',
            available: 100000,
            pricePerUnit: 4000,
            paymentMethods: ['KBZPay', 'WavePay'],
            notes: '24/7 Instant Auto-Processing Bot',
            status: 'active'
          },
          {
            id: 'BOT-USD-002',
            seller: 'PayWell_Bot_USD',
            isBot: true,
            botBadge: '🤖 Official USD Bot',
            rating: 5.0,
            trades: 8500,
            currency: 'USD',
            available: 50000,
            pricePerUnit: 4000,
            paymentMethods: ['KBZPay', 'WavePay'],
            notes: '24/7 Global USD Auto-Bot',
            status: 'active'
          },
          {
            id: 'P2P-LST-003',
            seller: 'Seller_Master',
            isBot: false,
            rating: 4.9,
            trades: 142,
            currency: 'PW',
            available: 10000,
            pricePerUnit: 3950,
            paymentMethods: ['KBZPay'],
            notes: 'Fast 5 Min Manual Release',
            status: 'active'
          }
        ];
        localStorage.setItem(this.STORAGE_P2P_LISTINGS, JSON.stringify(listings));
      }
      return listings;
    } catch (e) {
      return [];
    }
  },

  saveP2PListings(listings) {
    localStorage.setItem(this.STORAGE_P2P_LISTINGS, JSON.stringify(listings));
  },

  // --- GLOBAL MARKETPLACE ---
  getGlobalMarketListings() {
    try {
      let listings = JSON.parse(localStorage.getItem(this.STORAGE_GLOBAL_MARKET));
      if (!listings || listings.length === 0) {
        listings = [
          {
            id: 'MKT-001',
            seller: 'Yuji_luke',
            category: 'PW',
            title: '100 PW Community Token Bundle',
            desc: 'Direct seller bundle for quick community transactions',
            price: 400000,
            currency: 'MMK',
            qty: 10,
            image: '🪙',
            comments: [
              { id: 'c1', user: 'Member_01', text: 'Fast response and trusted seller!', likes: 3, time: '10m ago' }
            ],
            createdAt: '2024-05-20'
          },
          {
            id: 'MKT-002',
            seller: 'CryptoKing',
            category: 'USD',
            title: '10 USD Global Trading Pool',
            desc: 'Instant trade pool for international items and tokens',
            price: 45000,
            currency: 'MMK',
            qty: 5,
            image: '💵',
            comments: [],
            createdAt: '2024-05-20'
          },
          {
            id: 'MKT-003',
            seller: 'PetMaster',
            category: 'Items',
            title: 'Rare Cyber Phoenix Egg #088',
            desc: 'Exclusive high XP pet egg with Savings Boost passive skill',
            price: 2500,
            currency: 'PW',
            qty: 1,
            image: '🥚',
            comments: [
              { id: 'c2', user: 'DragonRider', text: 'Does this have +15% XP skill?', likes: 1, time: '1h ago' }
            ],
            createdAt: '2024-05-19'
          }
        ];
        localStorage.setItem(this.STORAGE_GLOBAL_MARKET, JSON.stringify(listings));
      }
      return listings;
    } catch (e) {
      return [];
    }
  },

  saveGlobalMarketListings(listings) {
    localStorage.setItem(this.STORAGE_GLOBAL_MARKET, JSON.stringify(listings));
  },

  addGlobalListingComment(listingId, username, commentText) {
    const listings = this.getGlobalMarketListings();
    const listing = listings.find(l => l.id === listingId);
    if (!listing) throw new Error("Listing not found");
    if (!listing.comments) listing.comments = [];
    const newComment = {
      id: `CMT-${Date.now()}`,
      user: username,
      text: commentText,
      likes: 0,
      time: 'Just now'
    };
    listing.comments.push(newComment);
    this.saveGlobalMarketListings(listings);
    return newComment;
  },

  likeGlobalListingComment(listingId, commentId) {
    const listings = this.getGlobalMarketListings();
    const listing = listings.find(l => l.id === listingId);
    if (!listing || !listing.comments) return;
    const comment = listing.comments.find(c => c.id === commentId);
    if (comment) {
      comment.likes = (comment.likes || 0) + 1;
      this.saveGlobalMarketListings(listings);
    }
  },

  // --- PAYWELL VISA CARDS ---
  getVisaCard(username) {
    try {
      const cards = JSON.parse(localStorage.getItem(this.STORAGE_VISA_CARDS)) || {};
      return cards[username.toLowerCase()] || null;
    } catch (e) {
      return null;
    }
  },

  issueVisaCard(username, cardType, cardHolderName) {
    const cards = JSON.parse(localStorage.getItem(this.STORAGE_VISA_CARDS)) || {};
    const cardNum = `4556 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
    const newCard = {
      cardNumber: cardNum,
      cardHolder: cardHolderName || username,
      type: cardType, // 'Standard', 'Premium', 'Gold'
      expiry: '12/28',
      cvv: String(Math.floor(100 + Math.random() * 900)),
      status: 'Active',
      issuedAt: new Date().toLocaleDateString()
    };
    cards[username.toLowerCase()] = newCard;
    localStorage.setItem(this.STORAGE_VISA_CARDS, JSON.stringify(cards));
    return newCard;
  },

  toggleVisaCardStatus(username) {
    const cards = JSON.parse(localStorage.getItem(this.STORAGE_VISA_CARDS)) || {};
    const card = cards[username.toLowerCase()];
    if (card) {
      card.status = card.status === 'Active' ? 'Frozen' : 'Active';
      localStorage.setItem(this.STORAGE_VISA_CARDS, JSON.stringify(cards));
      return card;
    }
    return null;
  },

  // --- USER PROFILE & NICKNAME / BIO / PHOTO ---
  updateUserProfile(username, nickname, bio, profilePhoto) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User not found");

    if (nickname !== undefined) user.nickname = nickname.slice(0, 20);
    if (bio !== undefined) user.bio = bio.slice(0, 100);
    if (profilePhoto !== undefined) user.profile_photo = profilePhoto;

    this.saveUsers(users);
    return user;
  },

  getEquippedPFTs(username) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    return user ? (user.equipped_pfts || []) : [];
  },

  equipPFT(username, pft) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return [];

    if (!user.equipped_pfts) user.equipped_pfts = [];
    if (user.equipped_pfts.length >= 5) {
      user.equipped_pfts.shift(); // Max 5 PFTs equipped
    }
    user.equipped_pfts.push(pft);
    this.saveUsers(users);
    return user.equipped_pfts;
  },

  // --- ACCOUNT LEVEL & LEVEL UP PASSES ---
  getUserLevel(username) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    return user ? (user.level || 1) : 1;
  },

  setUserLevel(username, level) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      user.level = Math.min(3, Math.max(1, level));
      this.saveUsers(users);
      return user.level;
    }
    return 1;
  },

  getUserPassInventory(username) {
    try {
      const inventory = JSON.parse(localStorage.getItem(this.STORAGE_LEVEL_PASSES)) || {};
      return inventory[username.toLowerCase()] || 0;
    } catch (e) {
      return 0;
    }
  },

  addUserPassInventory(username, qty) {
    const inventory = JSON.parse(localStorage.getItem(this.STORAGE_LEVEL_PASSES)) || {};
    const curr = inventory[username.toLowerCase()] || 0;
    inventory[username.toLowerCase()] = Math.max(0, curr + qty);
    localStorage.setItem(this.STORAGE_LEVEL_PASSES, JSON.stringify(inventory));
    return inventory[username.toLowerCase()];
  },

  useLevelUpPass(username) {
    const qty = this.getUserPassInventory(username);
    if (qty <= 0) throw new Error("No Level Up Pass in inventory!");

    const currLvl = this.getUserLevel(username);
    if (currLvl >= 3) throw new Error("Already at maximum Level 3!");

    this.addUserPassInventory(username, -1);
    const newLvl = this.setUserLevel(username, currLvl + 1);
    return newLvl;
  },

  // --- REFERRAL SYSTEM & MILESTONES ---
  getReferralStats(username) {
    try {
      const data = JSON.parse(localStorage.getItem(this.STORAGE_REFERRALS)) || {};
      const userRef = data[username.toLowerCase()] || { count: 0, friends: [], totalEarned: 0, claimed: [] };
      return userRef;
    } catch (e) {
      return { count: 0, friends: [], totalEarned: 0, claimed: [] };
    }
  },

  registerReferral(referrerUsername, newUsername) {
    if (!referrerUsername || referrerUsername.toLowerCase() === newUsername.toLowerCase()) return;
    const data = JSON.parse(localStorage.getItem(this.STORAGE_REFERRALS)) || {};
    const refKey = referrerUsername.toLowerCase();
    if (!data[refKey]) {
      data[refKey] = { count: 0, friends: [], totalEarned: 0, claimed: [] };
    }
    if (!data[refKey].friends.includes(newUsername)) {
      data[refKey].friends.push(newUsername);
      data[refKey].count = data[refKey].friends.length;
      localStorage.setItem(this.STORAGE_REFERRALS, JSON.stringify(data));
    }
  },

  claimReferralMilestone(username, targetFriends, rewardPW) {
    const data = JSON.parse(localStorage.getItem(this.STORAGE_REFERRALS)) || {};
    const refKey = username.toLowerCase();
    if (!data[refKey]) throw new Error("No referral history found!");

    if (data[refKey].count < targetFriends) {
      throw new Error(`Need ${targetFriends} referred friends! Current: ${data[refKey].count}`);
    }

    if (!data[refKey].claimed) data[refKey].claimed = [];
    if (data[refKey].claimed.includes(targetFriends)) {
      throw new Error("Milestone reward already claimed!");
    }

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      user.balance += rewardPW;
      this.saveUsers(users);
    }

    data[refKey].claimed.push(targetFriends);
    data[refKey].totalEarned = (data[refKey].totalEarned || 0) + rewardPW;
    localStorage.setItem(this.STORAGE_REFERRALS, JSON.stringify(data));
    return rewardPW;
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
