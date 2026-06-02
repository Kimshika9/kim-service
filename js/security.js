const SECURITY = {
    orderCooldown: 60000, // 60 seconds
    lastOrderTime: 0,
    isBanned: false,

    checkSpam() {
        const now = Date.now();
        if (now - this.lastOrderTime < this.orderCooldown) {
            const remaining = Math.ceil((this.orderCooldown - (now - this.lastOrderTime)) / 1000);
            alert(`Anti-Spam: Please wait ${remaining}s before next order.`);
            return false;
        }
        this.lastOrderTime = now;
        return true;
    },

    checkBan() {
        if (this.isBanned) {
            alert("Account Blocked: Access restricted due to suspicious activity.");
            return true;
        }
        return false;
    }
};

export default SECURITY;
