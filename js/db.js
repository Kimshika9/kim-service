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
  }
};

PayWellDB.init();
window.PayWellDB = PayWellDB;
