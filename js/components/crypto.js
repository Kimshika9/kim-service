/**
 * PayWell 20-Coin Crypto Market & Live Wallet Component
 */

const PayWellCrypto = {
  activeTab: 'market',
  selectedCoin: null,
  activeTimeframe: '1D',
  tradeMode: 'buy', // 'buy' or 'sell'
  tickerInterval: null,

  init() {
    this.selectedCoin = window.PayWellDB.CRYPTO_COINS[0]; // Default to BTC
    this.startLiveTicker();
  },

  startLiveTicker() {
    if (this.tickerInterval) clearInterval(this.tickerInterval);
    this.tickerInterval = setInterval(() => {
      if (window.PayWellDB && window.PayWellDB.CRYPTO_COINS) {
        window.PayWellDB.CRYPTO_COINS.forEach(c => {
          const delta = (Math.random() - 0.49) * 0.004 * c.price;
          c.price = Math.max(0.000001, c.price + delta);
        });
        if (this.activeTab === 'market') this.renderMarketList();
        if (this.activeTab === 'wallet') this.renderWallet();
        if (this.activeTab === 'chart' && this.selectedCoin) this.renderChartTab();
      }
    }, 5000);
  },

  switchTab(tab) {
    this.activeTab = tab;

    const btnM = document.getElementById('btn-crypto-tab-market');
    const btnW = document.getElementById('btn-crypto-tab-wallet');
    const btnC = document.getElementById('btn-crypto-tab-chart');

    if (btnM) btnM.className = tab === 'market' ? 'btn btn-primary' : 'btn btn-glass';
    if (btnW) btnW.className = tab === 'wallet' ? 'btn btn-primary' : 'btn btn-glass';
    if (btnC) btnC.className = tab === 'chart' ? 'btn btn-primary' : 'btn btn-glass';

    const contentM = document.getElementById('crypto-tab-content-market');
    const contentW = document.getElementById('crypto-tab-content-wallet');
    const contentC = document.getElementById('crypto-tab-content-chart');

    if (contentM) contentM.style.display = tab === 'market' ? 'block' : 'none';
    if (contentW) contentW.style.display = tab === 'wallet' ? 'block' : 'none';
    if (contentC) contentC.style.display = tab === 'chart' ? 'block' : 'none';

    if (tab === 'market') this.renderMarketList();
    if (tab === 'wallet') this.renderWallet();
    if (tab === 'chart') this.renderChartTab();
  },

  renderMarketList() {
    const container = document.getElementById('crypto-market-list');
    if (!container) return;

    const query = (document.getElementById('crypto-search-input')?.value || '').toLowerCase().trim();
    const coins = window.PayWellDB.CRYPTO_COINS.filter(c =>
      !query || c.name.toLowerCase().includes(query) || c.symbol.toLowerCase().includes(query)
    );

    if (coins.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted);">No crypto coins match '${query}'</div>`;
      return;
    }

    container.innerHTML = coins.map(c => {
      const isUp = c.change24h >= 0;
      const changeColor = isUp ? 'var(--primary-green)' : 'var(--red-alert)';
      const formattedPrice = c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});

      return `
        <div class="glass-card" onclick="PayWellCrypto.openCoinChart('${c.symbol}')" style="padding:12px; cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
          <div style="display:flex; gap:10px; align-items:center;">
            <span style="font-size:22px;">${c.icon}</span>
            <div>
              <div style="font-weight:700; color:#fff; font-size:13px;">${c.name} <span style="font-size:11px; color:var(--text-muted); font-weight:400;">${c.symbol}</span></div>
              <div style="font-size:10px; color:var(--text-muted);">24h Vol: $${c.volume24h}</div>
            </div>
          </div>
          <div style="text-align:right;">
            <div class="font-mono" style="font-weight:700; color:#fff; font-size:13px;">$${formattedPrice}</div>
            <div class="font-mono" style="font-size:10px; font-weight:700; color:${changeColor};">
              ${isUp ? '+' : ''}${c.change24h.toFixed(2)}% ${isUp ? '▲' : '▼'}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  renderWallet() {
    const user = window.PayWellAuth ? window.PayWellAuth.currentUser : null;
    if (!user) return;

    const wallet = window.PayWellDB.getUserCryptoWallet(user.username);
    const container = document.getElementById('crypto-holdings-list');
    if (!container) return;

    let totalValUSD = 0;
    const itemsHtml = [];

    window.PayWellDB.CRYPTO_COINS.forEach(coin => {
      const amt = wallet.holdings[coin.symbol] || 0;
      if (amt > 0) {
        const valUSD = amt * coin.price;
        totalValUSD += valUSD;

        itemsHtml.push(`
          <div class="glass-card" style="padding:12px; display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:10px; align-items:center;">
              <span style="font-size:20px;">${coin.icon}</span>
              <div>
                <div style="font-weight:700; font-size:12px; color:#fff;">${coin.name} (${coin.symbol})</div>
                <div class="font-mono" style="font-size:11px; color:var(--primary-green); font-weight:700;">${amt.toFixed(6)} ${coin.symbol}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div class="font-mono" style="font-weight:700; color:var(--gold-accent); font-size:13px;">$${valUSD.toFixed(2)}</div>
              <button onclick="PayWellCrypto.openCoinChart('${coin.symbol}')" class="btn btn-gold" style="padding:2px 8px; font-size:9px; margin-top:2px;">Trade</button>
            </div>
          </div>
        `);
      }
    });

    const totUSD = document.getElementById('crypto-wallet-total-usd');
    if (totUSD) totUSD.innerText = `$${totalValUSD.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;

    if (itemsHtml.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:16px; color:var(--text-muted); font-size:11px;">You do not hold any crypto assets yet. Select a coin from the Market tab to buy!</div>`;
    } else {
      container.innerHTML = itemsHtml.join('');
    }
  },

  openCoinChart(symbol) {
    const coin = window.PayWellDB.CRYPTO_COINS.find(c => c.symbol.toUpperCase() === symbol.toUpperCase());
    if (coin) {
      this.selectedCoin = coin;
      this.switchTab('chart');
    }
  },

  renderChartTab() {
    if (!this.selectedCoin) this.selectedCoin = window.PayWellDB.CRYPTO_COINS[0];
    const c = this.selectedCoin;

    const iconEl = document.getElementById('chart-coin-icon');
    if (iconEl) iconEl.innerText = c.icon;
    const nameEl = document.getElementById('chart-coin-name');
    if (nameEl) nameEl.innerText = `${c.name} (${c.symbol})`;
    const priceEl = document.getElementById('chart-coin-price');
    if (priceEl) priceEl.innerText = `$${c.price < 1 ? c.price.toFixed(4) : c.price.toLocaleString('en-US', {minimumFractionDigits: 2})}`;

    const isUp = c.change24h >= 0;
    const changeEl = document.getElementById('chart-coin-change');
    if (changeEl) {
      changeEl.innerText = `${isUp ? '+' : ''}${c.change24h.toFixed(2)}% ${isUp ? '▲' : '▼'}`;
      changeEl.style.color = isUp ? 'var(--primary-green)' : 'var(--red-alert)';
    }

    const volEl = document.getElementById('chart-coin-vol');
    if (volEl) volEl.innerText = c.volume24h;
    const highEl = document.getElementById('chart-coin-high');
    if (highEl) highEl.innerText = `$${c.high24h.toLocaleString()}`;
    const lowEl = document.getElementById('chart-coin-low');
    if (lowEl) lowEl.innerText = `$${c.low24h.toLocaleString()}`;

    const sym1 = document.getElementById('trade-coin-sym1');
    if (sym1) sym1.innerText = c.symbol;
    const sym2 = document.getElementById('trade-coin-sym2');
    if (sym2) sym2.innerText = c.symbol;

    this.drawCandlestickCanvas();
    this.calcTradeEstimate();
  },

  drawCandlestickCanvas() {
    const canvas = document.getElementById('crypto-live-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let y = 30; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    const c = this.selectedCoin;
    const base = c.price;
    const candles = [];
    let cur = base * 0.96;

    for (let i = 0; i < 12; i++) {
      const open = cur;
      const change = (Math.random() - 0.48) * 0.03 * base;
      const close = open + change;
      const high = Math.max(open, close) + Math.random() * 0.015 * base;
      const low = Math.min(open, close) - Math.random() * 0.015 * base;
      candles.push({ open, close, high, low });
      cur = close;
    }

    const candleWidth = 16;
    const gap = (width - 12 * candleWidth) / 13;

    let minP = Math.min(...candles.map(k => k.low));
    let maxP = Math.max(...candles.map(k => k.high));
    const range = (maxP - minP) || 1;

    candles.forEach((k, idx) => {
      const x = gap + idx * (candleWidth + gap) + candleWidth / 2;
      const isGreen = k.close >= k.open;
      const color = isGreen ? '#00E676' : '#FF5252';

      const highY = height - 15 - ((k.high - minP) / range) * (height - 30);
      const lowY = height - 15 - ((k.low - minP) / range) * (height - 30);
      const openY = height - 15 - ((k.open - minP) / range) * (height - 30);
      const closeY = height - 15 - ((k.close - minP) / range) * (height - 30);

      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      ctx.fillStyle = color;
      const bodyY = Math.min(openY, closeY);
      const bodyH = Math.max(3, Math.abs(closeY - openY));
      ctx.fillRect(x - candleWidth / 2, bodyY, candleWidth, bodyH);
    });
  },

  setTimeframe(tf) {
    this.activeTimeframe = tf;
    const btns = document.querySelectorAll('.crypto-tf-btn');
    btns.forEach(b => {
      if (b.innerText === tf) b.className = 'btn btn-primary crypto-tf-btn';
      else b.className = 'btn btn-glass crypto-tf-btn';
    });
    this.drawCandlestickCanvas();
  },

  setTradeMode(mode) {
    this.tradeMode = mode;
    const btnBuy = document.getElementById('btn-trade-buy');
    if (btnBuy) btnBuy.className = mode === 'buy' ? 'btn btn-primary' : 'btn btn-glass';
    const btnSell = document.getElementById('btn-trade-sell');
    if (btnSell) btnSell.className = mode === 'sell' ? 'btn btn-primary' : 'btn btn-glass';
    this.calcTradeEstimate();
  },

  calcTradeEstimate() {
    const amtPW = parseFloat(document.getElementById('trade-amount-pw')?.value || 0);
    const estEl = document.getElementById('trade-est-crypto');
    if (!estEl || !this.selectedCoin) return;

    if (amtPW <= 0) {
      estEl.innerText = `0.000000 ${this.selectedCoin.symbol}`;
      return;
    }

    const cryptoAmt = amtPW / this.selectedCoin.price;
    estEl.innerText = `${cryptoAmt.toFixed(6)} ${this.selectedCoin.symbol}`;
  },

  executeTrade() {
    const user = window.PayWellAuth ? window.PayWellAuth.currentUser : null;
    if (!user) {
      alert("Please log in to trade crypto!");
      return;
    }

    const amtPW = parseFloat(document.getElementById('trade-amount-pw')?.value || 0);
    if (amtPW <= 0) {
      alert("Please enter a valid PW amount!");
      return;
    }

    try {
      const res = window.PayWellDB.tradeCrypto(user.username, this.selectedCoin.symbol, this.tradeMode, amtPW);
      alert(`✨ ${this.tradeMode.toUpperCase()} Executed Successfully!\nTraded ${amtPW} PW for ${res.cryptoAmount.toFixed(6)} ${res.coin.symbol}`);
      document.getElementById('trade-amount-pw').value = '';
      this.calcTradeEstimate();
      window.dispatchEvent(new CustomEvent('paywell_balance_updated'));
      this.renderWallet();
    } catch (err) {
      alert(err.message || "Crypto trade failed.");
    }
  }
};

window.PayWellCrypto = PayWellCrypto;
