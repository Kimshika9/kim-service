// Firebase Configuration (User must replace with their own config)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
let db, storage, auth;
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    storage = firebase.storage();
    auth = firebase.auth();
} catch (e) {
    console.warn("Firebase not initialized. Using mock mode.");
}

const services = {
    "Graphics Design": {
        icon: "🎨",
        sub: [
            { name: "Monogram Logo", price: 5000 },
            { name: "Lettermark Logo", price: 5000 },
            { name: "Mascot Logo", price: 15000 },
            { name: "Emblem Logo", price: 10000 },
            { name: "Gaming Logo", price: 10000 },
            { name: "Business Card", price: 5000 },
            { name: "Brand Identity", price: 30000 },
            { name: "Brand Guideline", price: 30000 },
            { name: "Company Profile", price: 30000 },
            { name: "Brand Kit", price: 50000 },
            { name: "Facebook Post", price: 5000 },
            { name: "Facebook Cover", price: 5000 },
            { name: "Facebook Ads", price: 5000 },
            { name: "Instagram Post", price: 5000 },
            { name: "Instagram Story", price: 5000 },
            { name: "TikTok Cover", price: 5000 },
            { name: "Telegram Post", price: 5000 },
            { name: "Telegram Banner", price: 10000 },
            { name: "YouTube Thumbnail", price: 5000 },
            { name: "YouTube Banner", price: 10000 },
            { name: "YouTube Profile Picture", price: 5000 },
            { name: "Poster Design", price: 10000 },
            { name: "Flyer Design", price: 10000 },
            { name: "Brochure", price: 15000 },
            { name: "Pamphlet", price: 10000 },
            { name: "Menu Design", price: 10000 },
            { name: "Invitation Card", price: 5000 },
            { name: "Certificate Design", price: 5000 },
            { name: "ID Card", price: 5000 },
            { name: "Roll Up Banner", price: 15000 },
            { name: "Billboard Design", price: 30000 },
            { name: "Product Label", price: 10000 },
            { name: "Product Packaging", price: 20000 },
            { name: "Box Design", price: 20000 },
            { name: "Bottle Label", price: 10000 },
            { name: "Food Packaging", price: 30000 },
            { name: "Cosmetic Packaging", price: 30000 },
            { name: "TikTok Post", price: 5000 },
            { name: "Podcast Cover", price: 10000 },
            { name: "Channel Branding", price: 30000 },
            { name: "Content Kit", price: 30000 },
            { name: "Album Cover", price: 10000 },
            { name: "Song Cover", price: 10000 },
            { name: "Spotify Cover", price: 10000 },
            { name: "Music Poster", price: 10000 },
            { name: "Playlist Cover", price: 5000 }
        ]
    },
    "Editing": {
        icon: "🎬",
        sub: [
            { name: "Short Video Edit", price: 5000 },
            { name: "TikTok Edit", price: 5000 },
            { name: "Instagram Reels Edit", price: 5000 },
            { name: "Facebook Reels Edit", price: 5000 },
            { name: "Gaming Edit", price: 10000 },
            { name: "Gaming Montage", price: 15000 },
            { name: "Brazilian Funk Edit", price: 10000 },
            { name: "Montagem Edit", price: 15000 },
            { name: "AMV Editing", price: 10000 },
            { name: "Anime Edit", price: 10000 },
            { name: "Music Video Editing", price: 20000 },
            { name: "Lyrics Video", price: 10000 },
            { name: "Visualizer Video", price: 15000 },
            { name: "Podcast Editing", price: 15000 },
            { name: "Documentary Editing", price: 30000 },
            { name: "YouTube Long Form Editing", price: 20000 },
            { name: "Trailer Editing", price: 30000 },
            { name: "VFX Editing", price: 30000 },
            { name: "Motion Graphics Video", price: 30000 },
            { name: "Logo Animation", price: 20000 },
            { name: "Audio Cleanup", price: 5000 },
            { name: "Audio Mixing", price: 10000 },
            { name: "Audio Mastering", price: 15000 }
        ]
    },
    "Coding": {
        icon: "💻",
        sub: [
            { name: "Python Script", price: 10000 },
            { name: "Automation Tool", price: 30000 },
            { name: "Telegram Bot", price: 20000 },
            { name: "AI Chatbot", price: 50000 },
            { name: "AI Assistant", price: 50000 },
            { name: "AI Companion", price: 100000 },
            { name: "API Integration", price: 30000 },
            { name: "Database Setup", price: 30000 },
            { name: "Android Application", price: 100000 },
            { name: "Website Development", price: 50000 },
            { name: "Portfolio Website", price: 50000 },
            { name: "Business Website", price: 100000 },
            { name: "E-Commerce Website", price: 200000 },
            { name: "Dashboard Development", price: 100000 },
            { name: "Admin Panel", price: 100000 },
            { name: "CRM System", price: 150000 },
            { name: "Inventory System", price: 150000 },
            { name: "POS System", price: 200000 },
            { name: "Custom Software", price: 200000 },
            { name: "SaaS Development", price: 500000 },
            { name: "Marketplace Development", price: 500000 },
            { name: "Service Center Platform", price: 500000 }
        ]
    },
    "Marketing": {
        icon: "📈",
        sub: [
            { name: "Content Planning", price: 10000 },
            { name: "Content Calendar", price: 10000 },
            { name: "Marketing Audit", price: 30000 },
            { name: "Brand Strategy", price: 50000 },
            { name: "Personal Branding", price: 50000 },
            { name: "TikTok Growth Strategy", price: 30000 },
            { name: "YouTube Growth Strategy", price: 30000 },
            { name: "Lead Generation Strategy", price: 50000 },
            { name: "Sales Funnel Creation", price: 50000 },
            { name: "Product Launch Strategy", price: 50000 },
            { name: "Business Growth Strategy", price: 100000 },
            { name: "Full Marketing Plan", price: 100000 },
            { name: "Full Marketing Management", price: 150000 }
        ]
    },
    "Management": {
        icon: "🤝",
        sub: [
            { name: "Community Management", price: 50000 },
            { name: "Telegram Management", price: 50000 },
            { name: "Social Media Management", price: 50000 },
            { name: "Content Management", price: 50000 },
            { name: "Project Management", price: 50000 },
            { name: "Customer Management", price: 50000 },
            { name: "Agency Management", price: 100000 },
            { name: "Business Operations Management", price: 100000 },
            { name: "Growth Management", price: 100000 },
            { name: "Premium Consulting", price: 150000 }
        ]
    },
    "Digital Products": {
        icon: "📦",
        sub: [
            { name: "Prompt Pack", price: 5000 },
            { name: "Prompt Collection", price: 10000 },
            { name: "Bot Code", price: 10000 },
            { name: "Website Code", price: 20000 },
            { name: "Website Template", price: 30000 },
            { name: "Python Script Pack", price: 20000 },
            { name: "API Package", price: 10000 },
            { name: "UI Kit", price: 10000 },
            { name: "Digital Resource Bundle", price: 30000 }
        ]
    }
};

let currentStep = 1;
const paymentMethods = {
    local: [
        { name: "KBZ Pay", account: "09 763458034", owner: "Kim Service", icon: "🟣" },
        { name: "Wave Pay", account: "09 260889611", owner: "Kim Service", icon: "🟡" },
        { name: "AYA Pay", account: "09 763458034", owner: "Kim Service", icon: "🔴" }
    ],
    international: [
        { name: "PayPal", account: "kimservicecenter@gmail.com", owner: "Kim Service Center", icon: "🔵" },
        { name: "Visa / Mastercard", account: "Contact Support", owner: "Kim Service Center", icon: "💳" }
    ]
};

let orderData = {
    category: "",
    service: "",
    price: 0,
    mode: "manual",
    title: "",
    description: "",
    refImage: null,
    region: "",
    paymentMethod: null,
    payScreenshot: null,
    transactionId: ""
};

function init() {
    renderCategories();
    updateProgress();
    if (typeof firebase !== 'undefined') {
        checkSettings();
    }
}

function renderCategories() {
    const grid = document.getElementById('categoryGrid');
    grid.innerHTML = '';
    for (const cat in services) {
        const card = document.createElement('div');
        card.className = 'service-card fade-in';
        card.innerHTML = `
            <span class="service-icon">${services[cat].icon}</span>
            <span class="service-name">${cat}</span>
        `;
        card.onclick = () => selectCategory(cat);
        grid.appendChild(card);
    }
}

function selectCategory(cat) {
    orderData.category = cat;
    renderSubServices(cat);
    nextStep();
}

function renderSubServices(cat) {
    const grid = document.getElementById('subServiceGrid');
    document.getElementById('serviceTitle').innerText = cat;
    grid.innerHTML = '';
    services[cat].sub.forEach(s => {
        const card = document.createElement('div');
        card.className = 'service-card fade-in';
        card.innerHTML = `
            <span class="service-name">${s.name}</span>
            <span class="service-price">Starting from ${s.price.toLocaleString()} Ks</span>
        `;
        card.onclick = () => selectService(s);
        grid.appendChild(card);
    });
}

function selectService(s) {
    orderData.service = s.name;
    orderData.price = s.price;

    // Show mode toggle only for Graphics Design
    const modeToggle = document.getElementById('graphicsModeToggle');
    if (orderData.category === "Graphics Design") {
        modeToggle.classList.remove('hidden');
    } else {
        modeToggle.classList.add('hidden');
        setMode('manual');
    }

    nextStep();
}

function setMode(mode) {
    orderData.mode = mode;
    const uploadArea = document.getElementById('uploadContainer');
    if (mode === 'inspired') {
        uploadArea.classList.remove('hidden');
    } else {
        uploadArea.classList.add('hidden');
    }

    // Update button styles
    document.querySelectorAll('#graphicsModeToggle .btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.innerText.toLowerCase().includes(mode)) {
            btn.classList.add('active');
        }
    });
}

function handleFile(input, infoId, dataKey = 'refImage') {
    const file = input.files[0];
    if (file) {
        if (file.size > 10 * 1024 * 1024) {
            alert("File size must be less than 10MB");
            input.value = "";
            return;
        }
        document.getElementById(infoId).innerText = file.name;
        orderData[dataKey] = file;
    }
}

function nextStep() {
    if (currentStep === 3) {
        const title = document.getElementById('projectTitle').value;
        const desc = document.getElementById('projectDesc').value;
        if (!title) return alert("Project Title is required");
        if (!desc) return alert("Project Description is required");
        if (orderData.mode === 'inspired' && !orderData.refImage) {
            return alert("Reference image is required for Inspired Mode");
        }
        orderData.title = title;
        orderData.description = desc;
        renderSummary();
    }

    if (currentStep < 5) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep++;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateProgress();
    }
}

function renderSummary() {
    const container = document.getElementById('summaryContent');
    container.innerHTML = `
        <div class="summary-item"><span class="summary-label">Service</span><span class="summary-value">${orderData.service}</span></div>
        <div class="summary-item"><span class="summary-label">Category</span><span class="summary-value">${orderData.category}</span></div>
        <div class="summary-item"><span class="summary-label">Mode</span><span class="summary-value">${orderData.mode.toUpperCase()}</span></div>
        <div class="summary-item"><span class="summary-label">Title</span><span class="summary-value">${orderData.title}</span></div>
        <div class="summary-item" style="flex-direction:column; align-items:flex-start;">
            <span class="summary-label">Description</span>
            <p style="font-size:0.9rem; margin-top:5px;">${orderData.description}</p>
        </div>
        <div class="summary-item"><span class="summary-label">Estimated Price</span><span class="summary-value">${orderData.price.toLocaleString()} Ks</span></div>
    `;
}

function selectRegion(region) {
    orderData.region = region;
    document.getElementById('paymentRegionSection').classList.add('hidden');
    document.getElementById('paymentMethodsSection').classList.remove('hidden');

    const grid = document.getElementById('methodsGrid');
    grid.innerHTML = '';
    paymentMethods[region].forEach(method => {
        const card = document.createElement('div');
        card.className = 'service-card fade-in';
        card.innerHTML = `
            <span class="service-icon">${method.icon}</span>
            <span class="service-name">${method.name}</span>
        `;
        card.onclick = () => selectPaymentMethod(method);
        grid.appendChild(card);
    });
}

function selectPaymentMethod(method) {
    orderData.paymentMethod = method;
    document.getElementById('paymentMethodsSection').classList.add('hidden');
    document.getElementById('paymentDetailSection').classList.remove('hidden');

    document.getElementById('methodTitle').innerText = method.name + " Details";
    document.getElementById('accountName').innerText = method.owner;
    document.getElementById('accountNumber').innerText = method.account;
}

// Check for Maintenance Mode or Privacy Settings
async function checkSettings() {
    try {
        const doc = await db.collection('settings').doc('general').get();
        if (doc.exists) {
            const data = doc.data();

            // Maintenance Mode
            if (data.maintenanceMode) {
                document.body.innerHTML = `
                    <div style="height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; background: var(--white);">
                        <h1 class="gradient-text" style="font-size: 3rem;">🏗️</h1>
                        <h2 class="mt-4">Under Maintenance</h2>
                        <p class="subtitle">We're updating our systems to serve you better. Please come back later.</p>
                    </div>
                `;
                return;
            }

            // Privacy Mode (Hide prices and specific labels)
            if (data.privacyMode) {
                document.body.classList.add('privacy-mode');
                const prices = document.querySelectorAll('.service-price, .summary-value:last-child');
                prices.forEach(p => p.textContent = "Contact for Price");
            }
        }
    } catch (e) {
        console.log("Settings check skipped (mock mode)");
    }
}

async function submitOrder() {
    const txId = document.getElementById('transactionId').value;
    if (!orderData.payScreenshot) return alert("Payment screenshot is required");
    if (!txId) return alert("Transaction ID is required");

    orderData.transactionId = txId;

    const submitBtn = document.querySelector('#paymentDetailSection .btn-primary');
    submitBtn.innerText = "Submitting...";
    submitBtn.disabled = true;

    // Generate Order ID
    const random = Math.floor(10000 + Math.random() * 90000);
    const date = new Date();
    const dateStr = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    const orderId = `${random}-${dateStr}`;

    try {
        let refImageUrl = "";
        let screenshotUrl = "";

        // 1. Upload Reference Image if exists
        if (orderData.refImage) {
            const refRef = storage.ref(`orders/${orderId}/reference_${orderData.refImage.name}`);
            await refRef.put(orderData.refImage);
            refImageUrl = await refRef.getDownloadURL();
        }

        // 2. Upload Payment Screenshot
        const screenRef = storage.ref(`orders/${orderId}/screenshot_${orderData.payScreenshot.name}`);
        await screenRef.put(orderData.payScreenshot);
        screenshotUrl = await screenRef.getDownloadURL();

        // 3. Save to Firestore
        await db.collection("orders").doc(orderId).set({
            orderId: orderId,
            category: orderData.category,
            service: orderData.service,
            price: orderData.price,
            mode: orderData.mode,
            title: orderData.title,
            description: orderData.description,
            refImageUrl: refImageUrl,
            region: orderData.region,
            paymentMethod: orderData.paymentMethod.name,
            transactionId: orderData.transactionId,
            screenshotUrl: screenshotUrl,
            status: "Pending Verification",
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });

        // Show Success
        document.getElementById('step5').classList.remove('active');
        document.getElementById('successStep').classList.add('active');
        document.getElementById('finalOrderId').innerText = orderId;

        document.getElementById('progressBar').style.width = '100%';
        document.querySelectorAll('.step-node').forEach(node => {
            node.classList.add('completed');
            node.innerHTML = '✓';
        });

    } catch (error) {
        console.error("Order Submission Error:", error);
        alert("Failed to submit order. Please try again. (Make sure Firebase is configured)");
        submitBtn.innerText = "Submit Order";
        submitBtn.disabled = false;
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step${currentStep}`).classList.add('active');
        updateProgress();
    }
}

function updateProgress() {
    const nodes = document.querySelectorAll('.step-node');
    const bar = document.getElementById('progressBar');

    nodes.forEach((node, idx) => {
        const stepNum = idx + 1;
        node.classList.remove('active', 'completed');
        if (stepNum === currentStep) {
            node.classList.add('active');
        } else if (stepNum < currentStep) {
            node.classList.add('completed');
            node.innerHTML = '✓';
        } else {
            node.innerHTML = stepNum;
        }
    });

    bar.style.width = ((currentStep - 1) / (nodes.length - 1)) * 100 + '%';
}

init();
