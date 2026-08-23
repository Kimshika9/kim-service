/**
 * PayWell Client-Side Local Database Engine (For GitHub Pages & Offline Persistence)
 */

const PayWellDB = {
  STORAGE_USERS: 'paywell_db_users',
  STORAGE_TXS: 'paywell_db_transactions',
  STORAGE_STORE: 'paywell_db_store',

  init() {
    // Seed initial users if empty
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

    // Seed initial store items if empty
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

  findUserByEmail(email) {
    const users = this.getUsers();
    return users.find(u => u.email && u.email.toLowerCase() === email.toLowerCase());
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

  getSystemSettings() {
    const defaults = {
      status: 'online', // 'online', 'maintenance', 'lockdown'
      regOpen: true,
      storeOpen: true,
      transfersAllowed: true,
      transferFeeRate: 2.0, // 2%
      dailyLimit: 5000.0,
      pointsRate: 1000 // 1000 Points = 1 PW
    };
    return JSON.parse(localStorage.getItem('paywell_system_settings')) || defaults;
  },

  updateSystemSettings(newSettings) {
    const current = this.getSystemSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem('paywell_system_settings', JSON.stringify(updated));
    return updated;
  },

  transfer(senderName, receiverName, amount, note = '') {
    const sys = this.getSystemSettings();
    if (sys.status === 'maintenance') {
      throw new Error("⚠️ System is currently under maintenance by Owner @Yuji_luke.");
    }
    if (sys.status === 'lockdown' || !sys.transfersAllowed) {
      throw new Error("⛔ Transactions are currently suspended.");
    }

    if (amount <= 0) throw new Error("Amount must be greater than 0");
    if (amount > sys.dailyLimit) throw new Error(`Transfer exceeds daily limit of ${sys.dailyLimit} PW`);
    if (senderName.toLowerCase() === receiverName.toLowerCase()) throw new Error("Cannot send to yourself");

    const users = this.getUsers();
    const sender = users.find(u => u.username.toLowerCase() === senderName.toLowerCase());
    const receiver = users.find(u => u.username.toLowerCase() === receiverName.toLowerCase());

    if (!sender) throw new Error("Sender account error");
    if (!receiver) throw new Error(`Recipient @${receiverName} not found`);

    const fee = (amount * sys.transferFeeRate) / 100.0;
    const totalDeduction = amount + fee;

    if (sender.balance < totalDeduction) throw new Error(`Insufficient balance (Fee: ${fee.toFixed(2)} PW)`);

    sender.balance -= totalDeduction;
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

  // AUCTION MARKET ENGINE
  getAuctions() {
    const defaults = [
      {
        id: 'auc_1',
        title: '👑 Golden Dragon Mythic PFT',
        rarity: 'Mythic',
        seller: 'System Owner',
        currentBid: 5000.0,
        highestBidder: 'Yuji_luke',
        buyoutPrice: 20000.0,
        endTime: new Date(Date.now() + 24*60*60*1000).toLocaleString(),
        bidsCount: 8,
        status: 'active'
      },
      {
        id: 'auc_2',
        title: '🌌 Galaxy Cosmic Profile BG',
        rarity: 'Legendary',
        seller: 'System Owner',
        currentBid: 2500.0,
        highestBidder: 'System Owner',
        buyoutPrice: 10000.0,
        endTime: new Date(Date.now() + 12*60*60*1000).toLocaleString(),
        bidsCount: 3,
        status: 'active'
      }
    ];

    return JSON.parse(localStorage.getItem('paywell_auctions')) || defaults;
  },

  saveAuctions(auctions) {
    localStorage.setItem('paywell_auctions', JSON.stringify(auctions));
  },

  placeBid(username, auctionId, bidAmount) {
    const auctions = this.getAuctions();
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) throw new Error("Auction not found");
    if (auction.status !== 'active') throw new Error("Auction has already ended");
    if (bidAmount <= auction.currentBid) throw new Error(`Bid must be higher than current bid of ${auction.currentBid} PW`);

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.balance < bidAmount) throw new Error("Insufficient PW balance to place bid");

    // Refund previous bidder if any
    if (auction.highestBidder && auction.highestBidder !== 'System Owner' && auction.highestBidder !== username) {
      const prevUser = users.find(u => u.username.toLowerCase() === auction.highestBidder.toLowerCase());
      if (prevUser) {
        prevUser.balance += auction.currentBid; // Refund held bid
      }
    }

    // Deduct new bidder balance
    user.balance -= bidAmount;
    this.saveUsers(users);

    auction.currentBid = bidAmount;
    auction.highestBidder = user.username;
    auction.bidsCount += 1;

    this.saveAuctions(auctions);

    const tx = {
      id: `PW-BID-${Date.now()}`,
      sender_username: user.username,
      receiver_username: "Auction Market Hold",
      amount: bidAmount,
      fee: 0,
      total: bidAmount,
      type: 'auction_bid',
      note: `Placed bid on ${auction.title}`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { auction, newBalance: user.balance };
  },

  createAuction(title, rarity, startPrice, buyoutPrice) {
    const auctions = this.getAuctions();
    const newAuction = {
      id: `auc_${Date.now()}`,
      title,
      rarity: rarity || 'Rare',
      seller: 'System Owner',
      currentBid: parseFloat(startPrice),
      highestBidder: 'System Owner',
      buyoutPrice: buyoutPrice ? parseFloat(buyoutPrice) : null,
      endTime: new Date(Date.now() + 24*60*60*1000).toLocaleString(),
      bidsCount: 0,
      status: 'active'
    };
    auctions.unshift(newAuction);
    this.saveAuctions(auctions);
    return newAuction;
  },

  // PFT (PayWell Fashion Tokens) ENGINE
  getPFTItems() {
    return [
      { id: 'pft_glow_rainbow', name: 'Rainbow Glow Board', category: 'glow', rarity: 'Epic', price: 500.0, icon: '🌈', cssClass: 'pft-glow-rainbow' },
      { id: 'pft_frame_gold', name: 'Gold VIP Frame', category: 'frame', rarity: 'Legendary', price: 1000.0, icon: '🖼️', cssClass: 'pft-frame-gold' },
      { id: 'pft_bg_galaxy', name: 'Galaxy Cosmic Background', category: 'background', rarity: 'Epic', price: 750.0, icon: '🌌', cssClass: 'pft-bg-galaxy' },
      { id: 'pft_emoji_crown', name: 'Animated Crown Emoji', category: 'emoji', rarity: 'Mythic', price: 2000.0, icon: '👑', cssClass: 'pft-emoji-crown' }
    ];
  },

  addPFTToUserInventory(username, pftId) {
    const inv = this.getUserInventory(username);
    if (!inv.pfts) inv.pfts = [];

    const pftItems = this.getPFTItems();
    const item = pftItems.find(p => p.id === pftId);
    if (!item) return;

    inv.pfts.push({
      instanceId: `PFT-${Date.now()}-${Math.floor(Math.random()*1000)}`,
      pftId: item.id,
      name: item.name,
      rarity: item.rarity,
      category: item.category,
      icon: item.icon,
      cssClass: item.cssClass,
      equipped: false
    });
    this.saveUserInventory(username, inv);
  },

  equipPFTItem(username, instanceId) {
    const inv = this.getUserInventory(username);
    if (!inv.pfts) return;

    const target = inv.pfts.find(p => p.instanceId === instanceId);
    if (!target) return;

    // Unequip other PFTs of same category
    inv.pfts.forEach(p => {
      if (p.category === target.category) {
        p.equipped = (p.instanceId === instanceId ? !p.equipped : false);
      }
    });

    this.saveUserInventory(username, inv);
  },

  buyPFTItem(username, pftId) {
    const items = this.getPFTItems();
    const item = items.find(p => p.id === pftId);
    if (!item) throw new Error("PFT item not found");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.balance < item.price) throw new Error("Insufficient PW balance to buy PFT");

    user.balance -= item.price;
    this.saveUsers(users);

    this.addPFTToUserInventory(username, pftId);

    const tx = {
      id: `PW-PFT-${Date.now()}`,
      sender_username: user.username,
      receiver_username: "PFT Fashion Shop",
      amount: item.price,
      fee: 0,
      total: item.price,
      type: 'pft_purchase',
      note: `Purchased PFT: ${item.name}`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { item, newBalance: user.balance };
  },

  // NEXORA TOURNAMENT TOKENS & USER INVENTORY ENGINE
  getNexoraTokens() {
    const defaultTokens = [
      { id: 'token_onetime', type: 'onetime', name: 'ONE-TIME TOKEN', duration: 'Single Match Entry', icon: '🎫', color: '#00B4D8', price: 500.0, defaultPrice: 500.0 },
      { id: 'token_monthly', type: 'monthly', name: 'MONTHLY TOKEN', duration: '30-Day Pass', icon: '📅', color: '#B388FF', price: 5000.0, defaultPrice: 5000.0 },
      { id: 'token_yearly', type: 'yearly', name: 'YEARLY TOKEN', duration: '365-Day Pass', icon: '👑', color: '#FFD700', price: 50000.0, defaultPrice: 50000.0 },
      { id: 'token_permanent', type: 'permanent', name: 'PERMANENT TOKEN', duration: 'Lifetime Pass', icon: '♾️', color: '#00E676', price: 500000.0, defaultPrice: 500000.0 }
    ];

    const stored = JSON.parse(localStorage.getItem('paywell_nexora_prices')) || {};
    return defaultTokens.map(t => ({
      ...t,
      price: stored[t.id] !== undefined ? stored[t.id] : t.price
    }));
  },

  updateNexoraTokenPrice(tokenId, newPrice) {
    const stored = JSON.parse(localStorage.getItem('paywell_nexora_prices')) || {};
    stored[tokenId] = parseFloat(newPrice);
    localStorage.setItem('paywell_nexora_prices', JSON.stringify(stored));
  },

  getUserInventory(username) {
    const key = `paywell_inventory_${username.toLowerCase()}`;
    return JSON.parse(localStorage.getItem(key)) || { tokens: [], pfts: [] };
  },

  saveUserInventory(username, inv) {
    const key = `paywell_inventory_${username.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(inv));
  },

  buyNexoraToken(username, tokenId) {
    const tokens = this.getNexoraTokens();
    const token = tokens.find(t => t.id === tokenId);
    if (!token) throw new Error("Token type not found");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.balance < token.price) throw new Error("Insufficient PW balance to buy NEXORA Token");

    user.balance -= token.price;
    this.saveUsers(users);

    const inv = this.getUserInventory(username);
    const expiresAt = token.type === 'monthly'
      ? new Date(Date.now() + 30*24*60*60*1000).toISOString()
      : token.type === 'yearly'
        ? new Date(Date.now() + 365*24*60*60*1000).toISOString()
        : token.type === 'permanent' ? 'LIFETIME' : null;

    inv.tokens.push({
      instanceId: `NT-${Date.now()}`,
      tokenId: token.id,
      name: token.name,
      type: token.type,
      icon: token.icon,
      color: token.color,
      active: true,
      purchasedAt: new Date().toLocaleString(),
      expiresAt: expiresAt,
      usesLeft: token.type === 'onetime' ? 1 : null
    });

    this.saveUserInventory(username, inv);

    const tx = {
      id: `PW-NEXORA-${Date.now()}`,
      sender_username: user.username,
      receiver_username: "NEXORA Tournament System",
      amount: token.price,
      fee: 0,
      total: token.price,
      type: 'token_purchase',
      note: `Purchased ${token.name}`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { token, newBalance: user.balance };
  },

  toggleTokenStatus(username, instanceId) {
    const inv = this.getUserInventory(username);
    const item = inv.tokens.find(t => t.instanceId === instanceId);
    if (item) {
      item.active = !item.active;
      this.saveUserInventory(username, inv);
    }
  },

  // DAILY REWARDS & QUEST ENGINE
  REWARD_DAYS: [50, 100, 150, 200, 300, 500, 1000],

  getDailyRewardState(username) {
    const key = `paywell_rewards_${username.toLowerCase()}`;
    const state = JSON.parse(localStorage.getItem(key)) || {
      streak: 0,
      lastClaimDate: null,
      claimedDays: []
    };
    return state;
  },

  claimDailyReward(username) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User not found");

    const key = `paywell_rewards_${username.toLowerCase()}`;
    const state = this.getDailyRewardState(username);

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    if (state.lastClaimDate === todayStr) {
      throw new Error("You have already claimed today's reward! Come back tomorrow.");
    }

    // Check if streak broke (more than 48h since last claim)
    let newStreak = state.streak;
    if (state.lastClaimDate) {
      const last = new Date(state.lastClaimDate);
      const diffHours = (now - last) / (1000 * 60 * 60);
      if (diffHours >= 48) {
        newStreak = 0; // Streak reset!
      }
    }

    newStreak = (newStreak % 7) + 1;
    const rewardAmount = this.REWARD_DAYS[newStreak - 1];

    user.balance += rewardAmount;
    state.streak = newStreak;
    state.lastClaimDate = todayStr;
    if (!state.claimedDays) state.claimedDays = [];
    state.claimedDays.push(newStreak);

    this.saveUsers(users);
    localStorage.setItem(key, JSON.stringify(state));

    let bonusMsg = "";
    if (newStreak === 7) {
      // Award Day 7 bonus PFT item
      const pftItems = this.getPFTItems ? this.getPFTItems() : [];
      if (pftItems.length > 0) {
        const gift = pftItems[Math.floor(Math.random() * pftItems.length)];
        this.addPFTToUserInventory(username, gift.id);
        bonusMsg = ` + Bonus PFT Gift: ${gift.name}!`;
      }
    }

    // Log transaction
    const tx = {
      id: `PW-DAILY-${Date.now()}`,
      sender_username: "Daily Rewards System",
      receiver_username: user.username,
      amount: rewardAmount,
      fee: 0,
      total: rewardAmount,
      type: 'daily_reward',
      note: `Day ${newStreak} Streak Reward${bonusMsg}`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { rewardAmount, streak: newStreak, newBalance: user.balance, bonusMsg };
  },

  getQuests(username) {
    const key = `paywell_quests_${username.toLowerCase()}`;
    const todayStr = new Date().toISOString().split('T')[0];
    let questData = JSON.parse(localStorage.getItem(key)) || { date: todayStr, quests: {} };

    if (questData.date !== todayStr) {
      questData = { date: todayStr, quests: {} };
    }

    const defaultQuests = [
      { id: 'q_transfer_1', title: 'Send 1 Transfer', reward: 25, req: 1, type: 'transfer' },
      { id: 'q_receive_1', title: 'Receive 1 Payment', reward: 25, req: 1, type: 'receive' },
      { id: 'q_visit_store', title: 'Visit NEXORA Store', reward: 10, req: 1, type: 'visit_store' },
      { id: 'q_buy_token', title: 'Purchase NEXORA Token', reward: 100, req: 1, type: 'buy_token' }
    ];

    // Compute progress based on today's txs / actions
    const txs = this.getTransactions(username).filter(t => t.created_at.includes(todayStr));
    const transfersSent = txs.filter(t => t.sender_username.toLowerCase() === username.toLowerCase() && t.type === 'transfer').length;
    const paymentsRecv = txs.filter(t => t.receiver_username.toLowerCase() === username.toLowerCase() && t.type === 'transfer').length;
    const tokenBought = txs.filter(t => t.sender_username.toLowerCase() === username.toLowerCase() && (t.type === 'token_purchase' || t.type === 'store_purchase')).length;

    return defaultQuests.map(q => {
      let progress = 0;
      if (q.id === 'q_transfer_1') progress = Math.min(transfersSent, q.req);
      if (q.id === 'q_receive_1') progress = Math.min(paymentsRecv, q.req);
      if (q.id === 'q_buy_token') progress = Math.min(tokenBought, q.req);
      if (q.id === 'q_visit_store') progress = questData.quests['q_visit_store']?.progress || 0;

      const isClaimed = !!questData.quests[q.id]?.claimed;
      return { ...q, progress, isClaimed };
    });
  },

  claimQuestReward(username, questId) {
    const quests = this.getQuests(username);
    const quest = quests.find(q => q.id === questId);
    if (!quest) throw new Error("Quest not found");
    if (quest.progress < quest.req) throw new Error("Quest requirements not met yet!");
    if (quest.isClaimed) throw new Error("Quest reward already claimed today!");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User not found");

    user.balance += quest.reward;
    this.saveUsers(users);

    const key = `paywell_quests_${username.toLowerCase()}`;
    const todayStr = new Date().toISOString().split('T')[0];
    let questData = JSON.parse(localStorage.getItem(key)) || { date: todayStr, quests: {} };
    if (!questData.quests) questData.quests = {};
    questData.quests[questId] = { claimed: true, progress: quest.req };
    localStorage.setItem(key, JSON.stringify(questData));

    const tx = {
      id: `PW-QUEST-${Date.now()}`,
      sender_username: "Quest Master",
      receiver_username: user.username,
      amount: quest.reward,
      fee: 0,
      total: quest.reward,
      type: 'quest_reward',
      note: `Completed Quest: ${quest.title}`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { reward: quest.reward, newBalance: user.balance };
  }
};

PayWellDB.init();
window.PayWellDB = PayWellDB;
