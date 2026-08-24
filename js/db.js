/**
 * PayWell Client-Side Local Database Engine (For GitHub Pages & Offline Persistence)
 */

const PayWellDB = {
  STORAGE_USERS: 'paywell_db_users',
  STORAGE_TXS: 'paywell_db_transactions',
  STORAGE_STORE: 'paywell_db_store',

  // DOUBLE-ENTRY LEDGER & AUDIT ENGINE
  auditUserBalance(username) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return { valid: true };

    const txs = JSON.parse(localStorage.getItem(this.STORAGE_TXS)) || [];

    // Calculate verified mathematical ledger sum
    let calculatedBalance = 0;

    // Account initial grant for owner
    if (user.role === 'owner' || user.username === 'Yuji_luke') {
      calculatedBalance += 100000.0;
    }

    txs.forEach(t => {
      const amt = parseFloat(t.amount || 0);
      const isSender = t.sender_username.toLowerCase() === username.toLowerCase();
      const isReceiver = t.receiver_username.toLowerCase() === username.toLowerCase();

      if (isReceiver) {
        calculatedBalance += amt;
      }
      if (isSender) {
        const fee = parseFloat(t.fee || 0);
        calculatedBalance -= (amt + fee);
      }
    });

    // Check consistency
    const diff = Math.abs(user.balance - calculatedBalance);
    const isValid = diff < 0.01;

    if (!isValid) {
      console.warn(`⚠️ Balance inconsistency detected for @${username}! Stored: ${user.balance}, Verified Ledger: ${calculatedBalance}`);
      user.balance = Math.max(0, calculatedBalance);
      this.saveUsers(users);
    }

    return { valid: isValid, verifiedBalance: user.balance, ledgerTotal: calculatedBalance };
  },

  init() {
    // Seed initial users if empty
    let users = this.getUsers();
    if (users.length === 0) {
      users = [
        {
          id: 1,
          user_code: '#00001',
          username: 'Yuji_luke',
          email: 'yuji_luke@paywell.app',
          password_hash: this.hash('OwnerPass123!'),
          sec_pin_hash: this.hash('201171'),
          two_factor_enabled: true,
          passkey_enabled: false,
          avatar_url: null,
          telegram_id: '6399210935',
          telegram_username: 'Yuji_luke',
          balance: 100000.0,
          status: 'active',
          role: 'owner',
          created_at: new Date().toISOString(),
          devices: []
        }
      ];
      this.saveUsers(users);
    } else {
      // Migrate users missing user_code
      let changed = false;
      users.forEach((u, idx) => {
        if (!u.user_code) {
          const num = idx + 1;
          u.user_code = `#${num.toString().padStart(5, '0')}`;
          changed = true;
        }
      });
      if (changed) this.saveUsers(users);
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
    const clean = identifier.trim().toLowerCase();
    return users.find(u =>
      u.username.toLowerCase() === clean ||
      (u.user_code && u.user_code.toLowerCase() === clean) ||
      (u.email && u.email.toLowerCase() === clean) ||
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
    const nextNum = users.length + 1;
    const userCode = `#${nextNum.toString().padStart(5, '0')}`;

    const newUser = {
      id: Date.now(),
      user_code: userCode,
      username: username,
      email: email || null,
      password_hash: this.hash(password || 'default123'),
      sec_pin_hash: null,
      two_factor_enabled: false,
      passkey_enabled: false,
      avatar_url: null,
      telegram_id: telegram_id ? String(telegram_id) : null,
      telegram_username: username,
      balance: 0.0,
      status: 'active',
      role: isOwner ? 'owner' : 'user',
      created_at: new Date().toLocaleString(),
      devices: []
    };

    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  },

  // RATE-LIMITING & ACCOUNT LOCKOUT ENGINE
  checkAccountLockout(username) {
    const user = this.findUser(username);
    if (!user) return false;

    if (user.locked_until) {
      const now = Date.now();
      const lockTime = new Date(user.locked_until).getTime();
      if (now < lockTime) {
        const remainingMins = Math.ceil((lockTime - now) / (1000 * 60));
        throw new Error(`🔒 Account is temporarily locked due to 10 failed attempts! Try again in ${remainingMins} minute(s).`);
      } else {
        // Lock expired
        user.locked_until = null;
        user.failed_login_attempts = 0;
        this.saveUsers(this.getUsers());
      }
    }
    return false;
  },

  recordFailedLoginAttempt(username) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return;

    user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
    if (user.failed_login_attempts >= 10) {
      // Lock for 15 minutes
      user.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    }
    this.saveUsers(users);
  },

  resetFailedLoginAttempts(username) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      user.failed_login_attempts = 0;
      user.locked_until = null;
      this.saveUsers(users);
    }
  },

  loginUser(identifier, password) {
    const user = this.findUser(identifier);
    if (!user) {
      throw new Error("Account not found. Please register a new account!");
    }

    if (user.status === 'frozen') {
      throw new Error("Account is frozen. Please contact support @Yuji_luke");
    }

    // Check rate limit lockout
    this.checkAccountLockout(user.username);

    const pwdHash = this.hash(password);
    if (user.password_hash && user.password_hash !== pwdHash) {
      this.recordFailedLoginAttempt(user.username);
      const attempts = (user.failed_login_attempts || 0) + 1;
      const left = 10 - attempts;
      if (left > 0) {
        throw new Error(`Invalid password! ${left} attempt(s) remaining before 15-minute account lockout.`);
      } else {
        throw new Error(`🔒 Account locked for 15 minutes due to 10 failed login attempts.`);
      }
    }

    this.resetFailedLoginAttempts(user.username);
    return user;
  },

  verifyUserPin(username, pin) {
    const user = this.findUser(username);
    if (!user) return false;
    if (!user.sec_pin_hash) {
      // Default to 201171 for owner if unset, or true if unset
      if (user.role === 'owner' || user.username === 'Yuji_luke') return pin === '201171';
      return true;
    }
    return user.sec_pin_hash === this.hash(pin);
  },

  setUserSecurityPin(username, newPin) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User not found");
    if (!/^\d{6}$/.test(newPin)) throw new Error("PIN must be exactly 6 digits");
    user.sec_pin_hash = this.hash(newPin);
    user.two_factor_enabled = true;
    this.saveUsers(users);
    return user;
  },

  // DEVICE SECURITY & PERMISSION MANAGEMENT ENGINE
  registerDeviceSession(username, userAgentStr) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) return null;

    if (!user.devices) user.devices = [];

    // Detect browser / device platform
    let deviceName = "Unknown Web Browser";
    if (userAgentStr.includes("Android")) deviceName = "Android Mobile (PayWell App)";
    else if (userAgentStr.includes("iPhone") || userAgentStr.includes("iPad")) deviceName = "iOS Device (PayWell Mini App)";
    else if (userAgentStr.includes("Macintosh")) deviceName = "macOS Workstation";
    else if (userAgentStr.includes("Windows")) deviceName = "Windows PC / Chrome";
    else if (userAgentStr.includes("Linux")) deviceName = "Linux Terminal Deck";

    // Create fingerprint hash
    const devId = `DEV-${this.hash(deviceName + userAgentStr).slice(0, 8)}`;
    const existingDev = user.devices.find(d => d.id === devId);

    const now = new Date();

    if (existingDev) {
      existingDev.lastActive = now.toLocaleString();
    } else {
      const isFirst = user.devices.length === 0;
      user.devices.push({
        id: devId,
        name: deviceName,
        ip: '192.168.1.' + Math.floor(Math.random() * 250 + 2),
        loginDate: now.toISOString(),
        lastActive: now.toLocaleString(),
        isPrimary: isFirst,
        trustedSince: now.toISOString()
      });
    }

    this.saveUsers(users);
    return user.devices;
  },

  removeAllOtherDevices(username, currentDevId, securityPin) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User account not found");

    if (!this.canDeviceManagePermissions(username, currentDevId)) {
      throw new Error("⛔ Permission Denied: Only Master devices or secondary devices active for 15+ days can terminate all sessions.");
    }

    if (!this.verifyUserPin(username, securityPin)) {
      throw new Error("⛔ Security Verification Failed: Invalid 6-Digit PIN Code!");
    }

    if (!user.devices) user.devices = [];
    user.devices = user.devices.filter(d => d.id === currentDevId);

    this.saveUsers(users);
    return user.devices;
  },

  getUserDevices(username) {
    const user = this.findUser(username);
    if (!user || !user.devices) return [];
    return user.devices;
  },

  canDeviceManagePermissions(username, currentDevId) {
    const devices = this.getUserDevices(username);
    const dev = devices.find(d => d.id === currentDevId);
    if (!dev) return false;

    if (dev.isPrimary) return true;

    // Check 15 days active tenure requirement for secondary devices
    const firstLogin = new Date(dev.trustedSince || dev.loginDate);
    const now = new Date();
    const daysActive = (now - firstLogin) / (1000 * 60 * 60 * 24);

    return daysActive >= 15;
  },

  removeDeviceSession(username, targetDevId, securityPin) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User account not found");

    // Require Security PIN verification
    if (!this.verifyUserPin(username, securityPin)) {
      throw new Error("⛔ Security Verification Failed: Invalid 6-Digit PIN Code!");
    }

    if (!user.devices) user.devices = [];
    const initialLen = user.devices.length;
    user.devices = user.devices.filter(d => d.id !== targetDevId);

    if (user.devices.length === initialLen) {
      throw new Error("Device session not found");
    }

    // If primary was removed, promote oldest remaining device
    if (user.devices.length > 0 && !user.devices.some(d => d.isPrimary)) {
      user.devices[0].isPrimary = true;
    }

    this.saveUsers(users);
    return user.devices;
  },

  updateUserProfile(username, data) {
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User not found");

    if (data.username && data.username !== user.username) {
      if (users.some(u => u.username.toLowerCase() === data.username.toLowerCase() && u.id !== user.id)) {
        throw new Error("Username already taken!");
      }
      user.username = data.username;
    }
    if (data.email !== undefined) user.email = data.email;
    if (data.avatar_url !== undefined) user.avatar_url = data.avatar_url;
    if (data.two_factor_enabled !== undefined) user.two_factor_enabled = data.two_factor_enabled;
    if (data.passkey_enabled !== undefined) user.passkey_enabled = data.passkey_enabled;

    this.saveUsers(users);
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

  // TRANSFER SECURITY & PIN RATE-LIMIT ENGINE
  checkTransferLockout(username) {
    const user = this.findUser(username);
    if (!user) return;

    if (user.transfer_locked_until) {
      const now = Date.now();
      const lockTime = new Date(user.transfer_locked_until).getTime();
      if (now < lockTime) {
        const remainingMins = Math.ceil((lockTime - now) / (1000 * 60));
        throw new Error(`🛑 Transfers are locked due to 6 failed PIN attempts! Try again in ${remainingMins} minute(s).`);
      } else {
        user.transfer_locked_until = null;
        user.failed_transfer_pin_attempts = 0;
        this.saveUsers(this.getUsers());
      }
    }
  },

  verifyTransferPin(username, pin) {
    this.checkTransferLockout(username);

    const isValid = this.verifyUserPin(username, pin);
    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user) throw new Error("User not found");

    if (!isValid) {
      user.failed_transfer_pin_attempts = (user.failed_transfer_pin_attempts || 0) + 1;
      const attempts = user.failed_transfer_pin_attempts;

      if (attempts >= 6) {
        user.transfer_locked_until = new Date(Date.now() + 10 * 60 * 1000).toISOString();
        this.saveUsers(users);
        throw new Error("🚨 SECURITY ALERT: 6 Failed PIN attempts! Transfer feature locked for 10 minutes.");
      } else if (attempts >= 3) {
        this.saveUsers(users);
        throw new Error(`⚠️ YELLOW SECURITY ALERT: 3 Failed Transfer PIN attempts! (${6 - attempts} attempts left before 10-minute transfer lockout).`);
      } else {
        this.saveUsers(users);
        throw new Error(`Incorrect 6-Digit PIN! (${6 - attempts} attempt(s) remaining).`);
      }
    }

    // Reset attempts on success
    user.failed_transfer_pin_attempts = 0;
    user.transfer_locked_until = null;
    this.saveUsers(users);
    return true;
  },

  transfer(senderName, receiverName, amount, pin, note = '') {
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

    // Verify Transfer PIN
    this.verifyTransferPin(senderName, pin);

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

  // EXCHANGE SYSTEM ENGINE (KPAY 09763458034 DMTD)
  KPAY_NUMBER: '09763458034',
  KPAY_NAME: 'DMTD',

  getExchangeOrders() {
    return JSON.parse(localStorage.getItem('paywell_exchange_orders')) || [];
  },

  saveExchangeOrders(orders) {
    localStorage.setItem('paywell_exchange_orders', JSON.stringify(orders));
  },

  submitDepositOrder(username, amountPW, kpayTxId, screenshotBase64, note) {
    if (amountPW <= 0) throw new Error("Amount must be greater than 0");
    if (!kpayTxId) throw new Error("Please enter your Kpay Transaction ID");

    // Generate random fee range 100 - 999 KS
    const randomFee = Math.floor(Math.random() * 900) + 100;
    const totalKyatToPay = amountPW + randomFee;

    const orders = this.getExchangeOrders();
    const newOrder = {
      orderId: `ORD-DEP-${Date.now()}`,
      type: 'deposit',
      username: username,
      amountPW: amountPW,
      feeKS: randomFee,
      totalKS: totalKyatToPay,
      kpayNumber: this.KPAY_NUMBER,
      kpayName: this.KPAY_NAME,
      userKpayTxId: kpayTxId,
      screenshot: screenshotBase64 || null,
      note: note || '',
      status: 'pending',
      created_at: new Date().toLocaleString()
    };

    orders.unshift(newOrder);
    this.saveExchangeOrders(orders);
    return newOrder;
  },

  submitWithdrawalOrder(username, amountPW, userKpayNum, userKpayName) {
    if (amountPW <= 0) throw new Error("Amount must be greater than 0");
    if (!userKpayNum || !userKpayName) throw new Error("Please enter your Kpay Number and Name");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.balance < amountPW) throw new Error("Insufficient PW balance for exchange withdrawal");

    // Deduct PW balance immediately on order submission
    user.balance -= amountPW;
    this.saveUsers(users);

    const randomFee = Math.floor(Math.random() * 900) + 100;
    const netKyatToSend = Math.max(0, amountPW - randomFee);

    const orders = this.getExchangeOrders();
    const newOrder = {
      orderId: `ORD-WITH-${Date.now()}`,
      type: 'withdrawal',
      username: username,
      amountPW: amountPW,
      feeKS: randomFee,
      totalKS: netKyatToSend,
      userKpayNumber: userKpayNum,
      userKpayName: userKpayName,
      status: 'pending',
      created_at: new Date().toLocaleString()
    };

    orders.unshift(newOrder);
    this.saveExchangeOrders(orders);
    return { newOrder, newBalance: user.balance };
  },

  ownerApproveExchangeOrder(orderId, action) {
    const orders = this.getExchangeOrders();
    const order = orders.find(o => o.orderId === orderId);
    if (!order) throw new Error("Exchange order not found");
    if (order.status !== 'pending') throw new Error("Order is already processed");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === order.username.toLowerCase());

    if (action === 'approve') {
      order.status = 'done';
      if (order.type === 'deposit') {
        if (user) user.balance += order.amountPW;
      }
      this.saveUsers(users);
    } else if (action === 'reject') {
      order.status = 'failed';
      if (order.type === 'withdrawal') {
        if (user) user.balance += order.amountPW; // Refund PW if rejected
      }
      this.saveUsers(users);
    }

    this.saveExchangeOrders(orders);

    const tx = {
      id: `PW-EXCHANGE-${Date.now()}`,
      sender_username: order.type === 'deposit' ? "Kpay Exchange Deposit" : user.username,
      receiver_username: order.type === 'deposit' ? user.username : "Kpay Exchange Withdrawal",
      amount: order.amountPW,
      fee: order.feeKS,
      total: order.amountPW,
      type: `exchange_${order.type}`,
      note: `Exchange Order ${order.orderId} (${order.status.toUpperCase()})`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return order;
  },

  // SAVINGS SYSTEM ENGINE
  getUserSavings(username) {
    const key = `paywell_savings_${username.toLowerCase()}`;
    const defaults = {
      basic: { balance: 0.0, rate: 0.005 },
      fixed: { balance: 0.0, rate: 0.01, lockedUntil: null },
      premium: { balance: 0.0, rate: 0.015, lockedUntil: null },
      lastInterestCalculated: new Date().toISOString().split('T')[0]
    };
    return JSON.parse(localStorage.getItem(key)) || defaults;
  },

  saveUserSavings(username, savings) {
    const key = `paywell_savings_${username.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(savings));
  },

  depositSavings(username, planType, amount) {
    if (amount <= 0) throw new Error("Amount must be greater than 0");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.balance < amount) throw new Error("Insufficient PW balance for savings deposit");

    const savings = this.getUserSavings(username);

    if (planType === 'fixed' && amount < 1000) throw new Error("Fixed Deposit requires a minimum of 1,000 PW");
    if (planType === 'premium' && amount < 5000) throw new Error("Premium Savings requires a minimum of 5,000 PW");

    user.balance -= amount;
    savings[planType].balance += amount;

    const now = new Date();
    if (planType === 'fixed') {
      savings.fixed.lockedUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
    } else if (planType === 'premium') {
      savings.premium.lockedUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    this.saveUsers(users);
    this.saveUserSavings(username, savings);

    const tx = {
      id: `PW-SAVEDEP-${Date.now()}`,
      sender_username: user.username,
      receiver_username: `Savings Vault (${planType.toUpperCase()})`,
      amount: amount,
      fee: 0,
      total: amount,
      type: 'savings_deposit',
      note: `Deposited into ${planType} savings`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { savings, newBalance: user.balance };
  },

  withdrawSavings(username, planType, amount) {
    const savings = this.getUserSavings(username);
    const plan = savings[planType];
    if (!plan || plan.balance < amount) throw new Error("Insufficient balance in savings vault");

    const now = new Date();
    let earlyFeePercent = 0;

    if (planType === 'fixed' && plan.lockedUntil) {
      if (now < new Date(plan.lockedUntil)) earlyFeePercent = 0.05; // 5% early fee
    } else if (planType === 'premium' && plan.lockedUntil) {
      if (now < new Date(plan.lockedUntil)) earlyFeePercent = 0.10; // 10% early fee
    }

    const fee = amount * earlyFeePercent;
    const netWithdraw = amount - fee;

    plan.balance -= amount;

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    user.balance += netWithdraw;

    this.saveUsers(users);
    this.saveUserSavings(username, savings);

    const tx = {
      id: `PW-SAVEWITH-${Date.now()}`,
      sender_username: `Savings Vault (${planType.toUpperCase()})`,
      receiver_username: user.username,
      amount: netWithdraw,
      fee: fee,
      total: amount,
      type: 'savings_withdrawal',
      note: `Withdrew from ${planType} savings${fee > 0 ? ` (Early Fee: ${fee.toFixed(2)} PW)` : ''}`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { netWithdraw, fee, newBalance: user.balance };
  },

  // ADVANCED PET SYSTEM ENGINE
  getPetsCatalog() {
    const defaultPets = [
      {
        id: 'pet_ember_dragon',
        name: 'Ember Dragon',
        type: 'Dragon',
        rarity: 'Legendary',
        personality: 'Brave',
        skill: 'Money Finder',
        price: 10000.0,
        icon: '🐉',
        description: 'A fierce mythical dragon that discovers daily hidden PW tokens!'
      },
      {
        id: 'pet_luna_unicorn',
        name: 'Luna Unicorn',
        type: 'Unicorn',
        rarity: 'Epic',
        personality: 'Calm',
        skill: 'Savings Boost',
        price: 5000.0,
        icon: '🦄',
        description: 'Radiates peaceful celestial energy, boosting your savings interest rates.'
      },
      {
        id: 'pet_shadow_wolf',
        name: 'Shadow Wolf',
        type: 'Wolf',
        rarity: 'Rare',
        personality: 'Loyal',
        skill: 'Fee Reduction',
        price: 2500.0,
        icon: '🐺',
        description: 'Guards your transactions and slashes payment fees.'
      }
    ];

    return JSON.parse(localStorage.getItem('paywell_pets_catalog')) || defaultPets;
  },

  savePetsCatalog(catalog) {
    localStorage.setItem('paywell_pets_catalog', JSON.stringify(catalog));
  },

  createCustomPet(name, type, rarity, personality, skill, price, icon, description) {
    const catalog = this.getPetsCatalog();
    const newPet = {
      id: `pet_${Date.now()}`,
      name,
      type: type || 'Custom Creature',
      rarity: rarity || 'Common',
      personality: personality || 'Playful',
      skill: skill || 'Money Finder',
      price: parseFloat(price || 1000),
      icon: icon || '🐾',
      description: description || 'Owner created custom pet.'
    };
    catalog.unshift(newPet);
    this.savePetsCatalog(catalog);
    return newPet;
  },

  getUserPets(username) {
    const key = `paywell_user_pets_${username.toLowerCase()}`;
    return JSON.parse(localStorage.getItem(key)) || [];
  },

  saveUserPets(username, pets) {
    const key = `paywell_user_pets_${username.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify(pets));
  },

  buyPet(username, petId) {
    const catalog = this.getPetsCatalog();
    const pet = catalog.find(p => p.id === petId);
    if (!pet) throw new Error("Pet not found in shop catalog");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.balance < pet.price) throw new Error("Insufficient PW balance to adopt pet");

    user.balance -= pet.price;
    this.saveUsers(users);

    const userPets = this.getUserPets(username);
    const instance = {
      instanceId: `PET-${Date.now()}`,
      petId: pet.id,
      name: pet.name,
      type: pet.type,
      rarity: pet.rarity,
      personality: pet.personality,
      skill: pet.skill,
      icon: pet.icon,
      level: 0,
      xp: 0,
      hunger: 100,
      happiness: 100,
      energy: 100,
      lastCareDate: new Date().toISOString().split('T')[0],
      lastDailyFindClaim: null,
      isActive: userPets.length === 0
    };

    userPets.push(instance);
    this.saveUserPets(username, userPets);

    const tx = {
      id: `PW-PET-${Date.now()}`,
      sender_username: user.username,
      receiver_username: "PayWell Pet Sanctuary",
      amount: pet.price,
      fee: 0,
      total: pet.price,
      type: 'pet_adoption',
      note: `Adopted Pet: ${pet.name}`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { instance, newBalance: user.balance };
  },

  petAction(username, instanceId, action) {
    const userPets = this.getUserPets(username);
    const pet = userPets.find(p => p.instanceId === instanceId);
    if (!pet) throw new Error("Pet instance not found");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());

    let xpGain = 0;
    if (action === 'feed') {
      if (user.balance < 10) throw new Error("Feeding costs 10 PW for organic pet food!");
      user.balance -= 10;
      pet.hunger = Math.min(100, pet.hunger + 30);
      xpGain = 10;
    } else if (action === 'play') {
      pet.happiness = Math.min(100, pet.happiness + 25);
      pet.energy = Math.max(0, pet.energy - 10);
      xpGain = 15;
    } else if (action === 'clean') {
      pet.happiness = Math.min(100, pet.happiness + 10);
      xpGain = 10;
    } else if (action === 'train') {
      if (pet.energy < 20) throw new Error("Pet is too tired! Let your pet sleep first.");
      pet.energy -= 20;
      xpGain = 25;
    } else if (action === 'sleep') {
      pet.energy = 100;
      xpGain = 5;
    }

    pet.xp += xpGain;

    // Level up calculation: Level 0->1 (100 XP), Level 1->2 (250 XP), Level 2->3 (500 XP)...
    const reqXP = 100 * Math.pow(pet.level + 1, 1.5);
    if (pet.xp >= reqXP) {
      pet.level += 1;
    }

    this.saveUsers(users);
    this.saveUserPets(username, userPets);

    return { pet, newBalance: user.balance, xpGain };
  },

  claimPetDailyMoney(username, instanceId) {
    const userPets = this.getUserPets(username);
    const pet = userPets.find(p => p.instanceId === instanceId);
    if (!pet) throw new Error("Pet instance not found");
    if (pet.skill !== 'Money Finder') throw new Error("This pet skill is not Money Finder!");

    const todayStr = new Date().toISOString().split('T')[0];
    if (pet.lastDailyFindClaim === todayStr) {
      throw new Error("Your pet has already searched for PW tokens today! Check back tomorrow.");
    }

    // Money Finder ranges: Lvl 0-10: 5-20 PW, Lvl 11-20: 20-50 PW, Lvl 21-30: 50-100 PW...
    let minAmt = 5, maxAmt = 20;
    if (pet.level > 10) { minAmt = 20; maxAmt = 50; }
    if (pet.level > 20) { minAmt = 50; maxAmt = 100; }
    if (pet.level > 30) { minAmt = 100; maxAmt = 250; }

    const reward = Math.floor(Math.random() * (maxAmt - minAmt + 1)) + minAmt;

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    user.balance += reward;

    pet.lastDailyFindClaim = todayStr;

    this.saveUsers(users);
    this.saveUserPets(username, userPets);

    const tx = {
      id: `PW-PETFIND-${Date.now()}`,
      sender_username: `Pet ${pet.name}`,
      receiver_username: user.username,
      amount: reward,
      fee: 0,
      total: reward,
      type: 'pet_reward',
      note: `Money Finder Daily Reward (${pet.name})`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { reward, newBalance: user.balance };
  },

  // PROFILE CUSTOMIZATION SHOP & DECORATION ENGINE
  getCustomizationCatalog() {
    return [
      { id: 'cust_bg_galaxy', name: 'Cosmic Galaxy Background', category: 'bg', rarity: 'Legendary', price: 1000.0, icon: '🌌', css: 'cust-bg-galaxy' },
      { id: 'cust_bg_cyberpunk', name: 'Cyberpunk Neon City', category: 'bg', rarity: 'Epic', price: 750.0, icon: '🏙️', css: 'cust-bg-cyberpunk' },
      { id: 'cust_frame_gold', name: 'Royal Gold Frame', category: 'frame', rarity: 'Epic', price: 500.0, icon: '🖼️', css: 'cust-frame-gold' },
      { id: 'cust_frame_hexagon', name: 'Futuristic Hexagon Frame', category: 'frame', rarity: 'Rare', price: 300.0, icon: '⬢', css: 'cust-frame-hexagon' },
      { id: 'cust_effect_rainbow', name: 'Rainbow Name Effect', category: 'name', rarity: 'Rare', price: 300.0, icon: '✨', css: 'cust-name-rainbow' },
      { id: 'cust_effect_aura', name: 'Golden Aura Glow', category: 'effect', rarity: 'Legendary', price: 1200.0, icon: '💫', css: 'cust-aura-gold' }
    ];
  },

  buyCustomizationItem(username, itemId) {
    const catalog = this.getCustomizationCatalog();
    const item = catalog.find(i => i.id === itemId);
    if (!item) throw new Error("Customization item not found");

    const users = this.getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (!user || user.balance < item.price) throw new Error("Insufficient PW balance");

    user.balance -= item.price;
    this.saveUsers(users);

    const inv = this.getUserInventory(username);
    if (!inv.decorations) inv.decorations = [];

    inv.decorations.push({
      instanceId: `CUST-${Date.now()}`,
      itemId: item.id,
      name: item.name,
      category: item.category,
      rarity: item.rarity,
      icon: item.icon,
      css: item.css,
      equipped: true
    });

    this.saveUserInventory(username, inv);

    const tx = {
      id: `PW-CUST-${Date.now()}`,
      sender_username: user.username,
      receiver_username: "Profile Customization Shop",
      amount: item.price,
      fee: 0,
      total: item.price,
      type: 'customization_purchase',
      note: `Purchased Decoration: ${item.name}`,
      status: 'success',
      created_at: new Date().toLocaleString()
    };
    this.addTransaction(tx);

    return { item, newBalance: user.balance };
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
