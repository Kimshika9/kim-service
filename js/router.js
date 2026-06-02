import CONFIG from './config.js';

class Router {
    constructor() {
        this.routes = {
            'home': document.getElementById('homePage'),
            'boost': document.getElementById('boostPage'),
            'topup': document.getElementById('topupPage'),
            'message': document.getElementById('messagePage'),
            'account': document.getElementById('accountPage'),
            'order-history': document.getElementById('orderHistoryPage'),
            'topup-history': document.getElementById('topupHistoryPage'),
            'telegram-boost': document.getElementById('telegramBoostPage')
        };
        this.currentRoute = 'home';
        this.init();
    }

    init() {
        window.addEventListener('hashchange', () => this.handleRoute());
        this.handleRoute();
    }

    handleRoute() {
        const hash = window.location.hash.slice(1) || 'home';
        this.navigate(hash);
    }

    navigate(route) {
        Object.values(this.routes).forEach(el => {
            if (el) el.classList.add('hidden');
        });

        if (this.routes[route]) {
            this.routes[route].classList.remove('hidden');
            this.currentRoute = route;
        }

        // Update Nav UI
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('href') === `#${route}`) {
                nav.classList.add('active');
            }
        });

        window.scrollTo(0, 0);
    }
}

export default new Router();
