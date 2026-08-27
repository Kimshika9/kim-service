/**
 * PayWell Pet Companion System Component
 */

const PayWellPet = {
  PET_TYPES: ['Dragon', 'Phoenix', 'Unicorn', 'Wolf', 'Fox', 'Cat', 'Dog', 'Rabbit', 'Panda', 'Tiger', 'Lion', 'Eagle', 'Shark', 'Dinosaur', 'Custom'],
  RARITIES: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary', 'Mythic', 'Galaxy'],
  PERSONALITIES: ['Playful', 'Loyal', 'Brave', 'Clever', 'Calm', 'Energetic', 'Mysterious', 'Protective'],
  SKILLS: ['Savings Boost', 'Money Finder', 'Fee Reduction'],

  init() {
    this.renderCornerPet();
    this.bindEvents();
  },

  bindEvents() {
    //
  },

  getCurrentUser() {
    return window.PayWellAuth?.currentUser?.username || 'Guest';
  },

  renderCornerPet() {
    const user = this.getCurrentUser();
    const pet = window.PayWellDB.getUserPet(user);
    const cornerContainer = document.getElementById('floating-pet-corner');
    if (!cornerContainer) return;

    if (!pet) {
      cornerContainer.style.display = 'none';
      return;
    }

    cornerContainer.style.display = 'flex';
    cornerContainer.innerHTML = `
      <div onclick="PayWellPet.openPetModal()" style="position:relative; cursor:pointer; background:rgba(18,18,26,0.85); border:1px solid var(--border-green); border-radius:50%; width:44px; height:44px; display:flex; align-items:center; justify-content:center; box-shadow:0 0 12px rgba(0,230,118,0.3);" title="${pet.name} (Lvl ${pet.level})">
        <span style="font-size:24px;">${pet.image || '🐉'}</span>
        <span style="position:absolute; bottom:-2px; right:-2px; background:var(--primary-green); color:#000; font-size:9px; font-weight:800; border-radius:8px; padding:1px 4px; font-family:var(--font-mono);">
          L${pet.level}
        </span>
      </div>
    `;

    // Update Home Dashboard Pet widget
    const petLvlEl = document.getElementById('pet-lvl');
    if (petLvlEl) petLvlEl.innerText = pet.level;
  },

  openPetModal() {
    const user = this.getCurrentUser();
    const pet = window.PayWellDB.getUserPet(user);
    const modalContent = document.getElementById('pet-modal-dynamic-content');

    if (modalContent && pet) {
      const xpNeeded = 100 + (pet.level * 50);
      const skillEffectText = this.getSkillEffectDescription(pet.skill, pet.level);

      modalContent.innerHTML = `
        <div style="text-align:center; position:relative;">
          <div style="position:absolute; top:0; right:0; font-size:10px; font-weight:700; color:var(--gold-accent); background:rgba(255,215,0,0.15); padding:2px 8px; border-radius:10px;">
            ${pet.rarity} • ${pet.personality}
          </div>

          <div class="animate-pulse-glow" style="font-size:72px; margin:10px 0;">${pet.image || '🐉'}</div>

          <h3 style="font-size:18px; color:#fff;">${pet.name}</h3>
          <div style="font-size:11px; color:var(--text-muted); margin-bottom:12px;">Type: ${pet.type} | Skill: <b style="color:var(--primary-green);">${pet.skill}</b></div>

          <div class="glass-card" style="padding:12px; margin-bottom:12px; text-align:left;">
            <div style="display:flex; justify-content:space-between; font-size:11px; margin-bottom:4px;">
              <span>XP Level ${pet.level} Progression</span>
              <span class="font-mono" style="color:var(--primary-green); font-weight:700;">${pet.xp} / ${xpNeeded} XP</span>
            </div>
            <div style="width:100%; height:8px; background:rgba(255,255,255,0.1); border-radius:4px; overflow:hidden;">
              <div style="width:${Math.min(100, (pet.xp / xpNeeded) * 100)}%; height:100%; background:linear-gradient(90deg, var(--primary-green), var(--secondary-blue)); border-radius:4px;"></div>
            </div>

            <div style="margin-top:10px; font-size:11px; color:var(--gold-accent); display:flex; align-items:center; gap:6px;">
              <span>✨ Skill Effect:</span>
              <span style="color:#fff;">${skillEffectText}</span>
            </div>
          </div>

          <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:6px; margin-bottom:10px;">
            <button onclick="PayWellPet.performAction('feed')" class="btn btn-primary" style="padding:8px 4px; font-size:10px;">🥩 Feed (+10 XP)</button>
            <button onclick="PayWellPet.performAction('play')" class="btn btn-gold" style="padding:8px 4px; font-size:10px;">⚽ Play (+15 XP)</button>
            <button onclick="PayWellPet.performAction('clean')" class="btn btn-glass" style="padding:8px 4px; font-size:10px;">🧼 Clean (+10 XP)</button>
          </div>

          <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:6px; margin-bottom:12px;">
            <button onclick="PayWellPet.performAction('train')" class="btn btn-glass" style="padding:8px 4px; font-size:10px;">🤺 Train (+25 XP)</button>
            <button onclick="PayWellPet.performAction('sleep')" class="btn btn-glass" style="padding:8px 4px; font-size:10px;">😴 Rest (+5 Energy)</button>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px; border-top:1px dashed var(--border-glass); padding-top:10px;">
            <span style="color:var(--text-muted);">Looking for a new pet?</span>
            <button onclick="PayWellPet.openPetShop()" class="btn btn-gold" style="width:auto; padding:4px 10px; font-size:10px;">🐾 Open Pet Shop</button>
          </div>
        </div>
      `;
    }

    window.PayWellRouter.openModal('modal-pet-system');
  },

  getSkillEffectDescription(skill, level) {
    if (skill === 'Savings Boost') {
      const boost = (0.1 + (level * 0.1)).toFixed(1);
      return `+${boost}% Vault Interest Boost`;
    } else if (skill === 'Money Finder') {
      const rangeMin = 5 + (level * 20);
      const rangeMax = 20 + (level * 50);
      return `Daily Finder: ${rangeMin} - ${rangeMax} PW Tokens`;
    } else if (skill === 'Fee Reduction') {
      const feeRed = Math.min(5, 0.5 + (level * 0.25)).toFixed(2);
      return `-${feeRed}% Transaction Fee Discount`;
    }
    return `Active Companion Perks`;
  },

  performAction(actionType) {
    const user = this.getCurrentUser();
    let xpAwarded = 0;
    let msg = "";

    if (actionType === 'feed') {
      xpAwarded = 10;
      msg = "🥩 You fed your pet delicious treats!";
    } else if (actionType === 'play') {
      xpAwarded = 15;
      msg = "⚽ You played games with your pet!";
    } else if (actionType === 'clean') {
      xpAwarded = 10;
      msg = "🧼 You cleaned your pet companion!";
    } else if (actionType === 'train') {
      xpAwarded = 25;
      msg = "🤺 Intense pet training completed!";
    } else if (actionType === 'sleep') {
      xpAwarded = 5;
      msg = "😴 Your pet took a peaceful nap!";
    }

    const updatedPet = window.PayWellDB.addPetXP(user, xpAwarded, actionType);
    this.renderCornerPet();
    alert(`${msg} (+${xpAwarded} XP)\nCurrent Level: L${updatedPet.level}`);
    this.openPetModal();
  },

  openPetShop() {
    const pets = window.PayWellDB.getPets();
    const container = document.getElementById('pet-shop-grid');
    if (container) {
      container.innerHTML = pets.map(p => `
        <div class="glass-card" style="padding:12px; margin-bottom:8px; text-align:left;">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <div style="display:flex; gap:10px; align-items:center;">
              <span style="font-size:32px;">${p.image}</span>
              <div>
                <div style="font-weight:700; color:#fff; font-size:13px;">${p.name}</div>
                <div style="font-size:10px; color:var(--text-muted);">${p.type} • <span style="color:var(--gold-accent);">${p.rarity}</span> • ${p.personality}</div>
                <div style="font-size:10px; color:var(--primary-green);">Skill: ${p.skill}</div>
              </div>
            </div>
            <div style="text-align:right;">
              <div style="font-family:var(--font-mono); font-weight:800; color:var(--gold-accent); font-size:13px;">${p.price} PW</div>
              <button onclick="PayWellPet.adoptPet('${p.id}')" class="btn btn-gold" style="padding:4px 8px; font-size:10px; margin-top:4px;">Adopt Pet</button>
            </div>
          </div>
          <div style="font-size:10px; color:var(--text-muted); margin-top:6px;">${p.description}</div>
        </div>
      `).join('');
    }
    window.PayWellRouter.openModal('modal-pet-shop');
  },

  adoptPet(petId) {
    const pets = window.PayWellDB.getPets();
    const pet = pets.find(p => p.id === petId);
    if (!pet) return;

    const user = this.getCurrentUser();
    const users = window.PayWellDB.getUsers();
    const userObj = users.find(u => u.username.toLowerCase() === user.toLowerCase());

    if (!userObj || userObj.balance < pet.price) {
      alert(`Insufficient balance. You need ${pet.price} PW to adopt ${pet.name}.`);
      return;
    }

    userObj.balance -= pet.price;
    window.PayWellDB.saveUsers(users);

    const newPetState = {
      petId: pet.id,
      name: pet.name,
      type: pet.type,
      image: pet.image,
      rarity: pet.rarity,
      personality: pet.personality,
      skill: pet.skill,
      level: 0,
      xp: 0,
      energy: 100,
      lastFed: Date.now()
    };

    window.PayWellDB.saveUserPet(user, newPetState);
    this.renderCornerPet();
    window.dispatchEvent(new CustomEvent('paywell_balance_updated'));
    alert(`🎉 Congratulations! You adopted ${pet.name} (${pet.type})!`);
    window.PayWellRouter.closeModal('modal-pet-shop');
    this.openPetModal();
  },

  submitOwnerCreatePet() {
    const name = document.getElementById('owner-pet-name')?.value.trim();
    const type = document.getElementById('owner-pet-type')?.value;
    const image = document.getElementById('owner-pet-image')?.value.trim() || '🐉';
    const rarity = document.getElementById('owner-pet-rarity')?.value;
    const personality = document.getElementById('owner-pet-personality')?.value;
    const skill = document.getElementById('owner-pet-skill')?.value;
    const price = document.getElementById('owner-pet-price')?.value;
    const description = document.getElementById('owner-pet-desc')?.value.trim();

    if (!name || !price) {
      alert("Please enter a pet name and base price.");
      return;
    }

    const created = window.PayWellDB.saveOwnerPet({
      name, type, image, rarity, personality, skill, price, description
    });

    alert(`👑 Owner Pet "${created.name}" (${created.rarity} ${created.type}) created successfully!`);
    window.PayWellRouter.closeModal('modal-owner-pet-create');
  }
};

window.PayWellPet = PayWellPet;
