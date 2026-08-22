/**
 * PayWell SPA Router & View Management
 */

const PayWellRouter = {
  currentView: 'home',

  init() {
    window.addEventListener('popstate', (e) => {
      if (e.state && e.state.view) {
        this.navigate(e.state.view, false);
      }
    });
  },

  navigate(viewName, pushState = true) {
    // Check if crown view requested by non-owner
    if (viewName === 'crown' && (!window.PayWellAuth || !window.PayWellAuth.isOwner())) {
      viewName = 'home';
    }

    this.currentView = viewName;

    // Hide all view panels
    document.querySelectorAll('.app-view').forEach(el => el.style.display = 'none');

    // Show target view panel
    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) {
      targetEl.style.display = 'block';
      targetEl.classList.remove('animate-float');
      void targetEl.offsetWidth; // trigger reflow
      targetEl.classList.add('animate-float');
    }

    // Update Navigation bar active items
    document.querySelectorAll('.nav-item').forEach(nav => {
      nav.classList.remove('active', 'crown-active');
      if (nav.dataset.view === viewName) {
        if (viewName === 'crown') {
          nav.classList.add('crown-active');
        } else {
          nav.classList.add('active');
        }
      }
    });

    if (pushState) {
      history.pushState({ view: viewName }, '', `#${viewName}`);
    }

    window.dispatchEvent(new CustomEvent('paywell_view_changed', { detail: viewName }));
  },

  openModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) {
      overlay.classList.add('active');
    }
  },

  closeModal(modalId) {
    const overlay = document.getElementById(modalId);
    if (overlay) {
      overlay.classList.remove('active');
    }
  }
};

window.PayWellRouter = PayWellRouter;
