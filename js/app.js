import CONFIG from './config.js';
import router from './router.js';
import Stepper from './components/stepper.js';
import SECURITY from './security.js';

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Set warning text from config
    const warningEl = document.getElementById('warningText');
    if (warningEl) {
        warningEl.innerText = "✨ Welcome to Caizar Store - Best Boost Service for Telegram! | ⚡ Fast Delivery | 🛡️ 100% Safe | 💎 High Quality Members Available Now!";
    }

    // Detect Device
    const platformEl = document.getElementById('devicePlatform');
    if (platformEl) {
        const ua = navigator.userAgent;
        let platform = "Unknown";
        if (/android/i.test(ua)) platform = "Android";
        if (/iPad|iPhone|iPod/.test(ua)) platform = "iOS";
        platformEl.innerText = platform;

        document.getElementById('deviceInfo').onclick = () => {
            alert(`Device Details:\nPlatform: ${platform}\nUser Agent: ${ua}\nJoin Date: 2023-10-12`);
        };
    }

    initTelegramBoost();
    initTopup();
}

function initTelegramBoost() {
    const boostGrid = document.getElementById('telegramBoostGrid');
    if (!boostGrid) return;

    const categories = [
        { id: 'members', name: 'Members', icon: '👥' },
        { id: 'views', name: 'Views', icon: '👁️' },
        { id: 'reactions', name: 'Reactions', icon: '❤️' },
        { id: 'premium', name: 'Premium', icon: '🌟' }
    ];

    // Create Category Selector
    const categoryContainer = document.createElement('div');
    categoryContainer.style.display = 'flex';
    categoryContainer.style.gap = '10px';
    categoryContainer.style.overflowX = 'auto';
    categoryContainer.style.paddingBottom = '15px';
    categoryContainer.style.marginBottom = '20px';
    categoryContainer.className = 'no-scrollbar';

    categories.forEach((cat, index) => {
        const btn = document.createElement('div');
        btn.innerHTML = `${cat.icon} ${cat.name}`;
        btn.style.padding = '8px 16px';
        btn.style.borderRadius = '20px';
        btn.style.background = index === 0 ? '#05122B' : 'white';
        btn.style.color = index === 0 ? 'white' : '#64748B';
        btn.style.fontSize = '12px';
        btn.style.fontWeight = '700';
        btn.style.whiteSpace = 'nowrap';
        btn.style.border = '1px solid #E2E8F0';
        btn.style.cursor = 'pointer';

        btn.onclick = () => {
            categoryContainer.querySelectorAll('div').forEach(d => {
                d.style.background = 'white';
                d.style.color = '#64748B';
            });
            btn.style.background = '#05122B';
            btn.style.color = 'white';
            renderBoostGrid(cat.id);
        };
        categoryContainer.appendChild(btn);
    });

    boostGrid.parentNode.insertBefore(categoryContainer, boostGrid);

    function renderBoostGrid(categoryId) {
        boostGrid.innerHTML = '';
        // "9 box in member 50" - Implementing 9 options
        for (let i = 1; i <= 9; i++) {
            const count = 50 * i;
            const price = 1000 * i;
            const box = document.createElement('div');
            box.className = 'luxury-box';
            box.style.padding = '15px';
            box.style.display = 'flex';
            box.style.flexDirection = 'column';
            box.style.alignItems = 'center';
            box.style.justifyContent = 'center';

            box.innerHTML = `
                <div style="font-size: 20px; margin-bottom: 8px;">${getIcon(categoryId)}</div>
                <div style="font-weight: 700; font-size: 11px; color: #0F172A; margin-bottom: 4px;">${count} ${getUnit(categoryId)}</div>
                <div style="font-size: 10px; color: #3B82F6; font-weight: 700;">${price} Ks</div>
            `;
            box.onclick = () => openOrderModal(`${count} ${getUnit(categoryId)}`, price);
            boostGrid.appendChild(box);
        }
    }

    function getIcon(cat) {
        if (cat === 'views') return '👁️';
        if (cat === 'reactions') return '🔥';
        if (cat === 'premium') return '💎';
        return '👤';
    }

    function getUnit(cat) {
        if (cat === 'views') return 'Views';
        if (cat === 'reactions') return 'Reacts';
        if (cat === 'premium') return 'Subs';
        return 'Members';
    }

    renderBoostGrid('members');
}

function initTopup() {
    const methodsContainer = document.getElementById('paymentMethods');
    if (methodsContainer) {
        methodsContainer.innerHTML = '';
        CONFIG.paymentAccounts.forEach((acc, index) => {
            const method = document.createElement('div');
            method.className = 'glass-card payment-method-card';
            method.style.display = 'flex';
            method.style.alignItems = 'center';
            method.style.gap = '15px';
            method.style.padding = '15px';
            method.style.cursor = 'pointer';
            if (index === 0) method.style.border = '2px solid #3B82F6';

            method.innerHTML = `
                <img src="assets/icons/${acc.icon}" onerror="this.src='https://via.placeholder.com/40'" style="width: 40px; height: 40px; border-radius: 8px;">
                <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 14px;">${acc.name}</div>
                    <div style="font-size: 12px; color: #666;">${acc.holder}</div>
                </div>
                <div style="font-size: 12px; color: #3B82F6; font-weight: 700;">${acc.account}</div>
            `;

            method.onclick = () => {
                document.querySelectorAll('.payment-method-card').forEach(c => c.style.border = '1px solid rgba(0,0,0,0.05)');
                method.style.border = '2px solid #3B82F6';
            };

            methodsContainer.appendChild(method);
        });
    }

    const stepper = new Stepper('topupStepperContainer', {
        initialValue: 0,
        min: 0,
        step: 1000,
        onChange: (val) => console.log('Topup amount:', val)
    });

    document.querySelectorAll('.quick-amount').forEach(btn => {
        btn.onclick = () => {
            const amount = parseInt(btn.getAttribute('data-amount'));
            stepper.setValue(amount);
        };
    });

    document.getElementById('confirmTopup').onclick = () => {
        if (SECURITY.checkBan()) return;

        const amount = stepper.value;
        if (amount < 1000) {
            alert('Minimum topup amount is 1,000 Ks');
            return;
        }

        if (confirm(`Confirm Top Up:\nAmount: ${amount.toLocaleString()} Ks\n\nDo you want to proceed?`)) {
            addTopupToHistory(amount);
            alert('Top up request submitted! It will be verified shortly.');
            window.location.hash = '#account';
        }
    };
}

function addTopupToHistory(amount) {
    const historyList = document.getElementById('topupHistoryPage').querySelector('div div:last-child');
    if (historyList && historyList.innerText.includes('No topup history')) {
        historyList.innerHTML = '';
    }

    const item = document.createElement('div');
    item.className = 'luxury-box';
    item.style.padding = '15px';
    item.style.marginBottom = '15px';
    item.style.textAlign = 'left';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.alignItems = 'center';

    const date = new Date().toLocaleDateString();

    item.innerHTML = `
        <div>
            <div style="font-weight: 700; font-size: 14px; color: #0F172A;">Top Up Wallet</div>
            <div style="font-size: 11px; color: #64748B;">${date} • Ref: ${Math.random().toString(36).substring(7).toUpperCase()}</div>
        </div>
        <div style="text-align: right;">
            <div style="font-weight: 700; color: #10B981;">+${amount.toLocaleString()} Ks</div>
            <div style="font-size: 10px; color: #64748B;">Pending...</div>
        </div>
    `;

    if (historyList) historyList.prepend(item);
}

function openOrderModal(serviceName, price) {
    const modal = document.getElementById('orderModal');
    const nameEl = document.getElementById('modalServiceName');
    const priceEl = document.getElementById('modalPrice');
    const totalEl = document.getElementById('modalTotal');

    nameEl.innerText = serviceName;
    priceEl.innerText = `${price.toLocaleString()} Ks`;
    totalEl.innerText = `${price.toLocaleString()} Ks`;

    modal.classList.remove('hidden');

    document.getElementById('cancelOrder').onclick = () => {
        modal.classList.add('hidden');
    };

    document.getElementById('confirmOrder').onclick = () => {
        if (SECURITY.checkBan()) return;
        if (!SECURITY.checkSpam()) return;

        modal.classList.add('hidden');
        addOrderToHistory(serviceName, price);
        alert('Order placed successfully! Check your history.');
    };
}

function addOrderToHistory(name, price) {
    const historyList = document.getElementById('orderHistoryList');
    if (historyList.innerText.includes('No orders yet')) {
        historyList.innerHTML = '';
    }

    const order = document.createElement('div');
    order.className = 'luxury-box';
    order.style.padding = '15px';
    order.style.marginBottom = '15px';
    order.style.textAlign = 'left';
    order.style.display = 'flex';
    order.style.justifyContent = 'space-between';
    order.style.alignItems = 'center';

    const date = new Date().toLocaleDateString();

    order.innerHTML = `
        <div>
            <div style="font-weight: 700; font-size: 14px; color: #0F172A;">${name}</div>
            <div style="font-size: 11px; color: #64748B;">${date} • ID: KS-${Math.floor(10000 + Math.random() * 90000)}</div>
        </div>
        <div style="text-align: right;">
            <div style="font-weight: 700; color: #3B82F6;">${price.toLocaleString()} Ks</div>
            <div style="font-size: 10px; color: #10B981;">Completed ✓</div>
        </div>
    `;

    historyList.prepend(order);
}
