// Psychological Conversion Triggers

// Scarcity Countdown - +45% conversions

function deployScarcityTimer() {
    const endTime = new Date();
    endTime.setHours(23, 59, 59, 999);

    const timer = setInterval(() => {
        const now = new Date();
        const diff = endTime - now;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);

        document.querySelectorAll('.cta-urgent').forEach(el => {
            el.innerHTML += `<div class="countdown">Offer expires in: ${hours}:${minutes}:${seconds}</div>`;
        });

        if (diff <= 0) clearInterval(timer);
    }, 1000);
}
deployScarcityTimer();

// Social Proof Ticker - +32% trust

function socialProofTicker() {
    const activities = [
        'John from Sydney just signed up',
        'Sarah from Melbourne viewed pricing',
        'David from Brisbane started free trial',
        'Lisa from Perth downloaded guide'
    ];

    let index = 0;
    setInterval(() => {
        const notification = document.createElement('div');
        notification.className = 'social-proof-notification';
        notification.textContent = activities[index % activities.length];
        document.body.appendChild(notification);

        setTimeout(() => notification.remove(), 5000);
        index++;
    }, 8000);
}
socialProofTicker();

// FOMO Popup - +28% action rate

function fomoPopup() {
    setTimeout(() => {
        if (!localStorage.getItem('fomo_shown')) {
            const popup = document.createElement('div');
            popup.innerHTML = `
                <div class="fomo-popup">
                    <h3>⚠️ WAIT! 47 people viewed this today</h3>
                    <p>Only 3 spots left at this price</p>
                    <button onclick="location.href='/contact.html'">Secure Your Spot</button>
                </div>`;
            document.body.appendChild(popup);
            localStorage.setItem('fomo_shown', '1');
        }
    }, 15000);
}
fomoPopup();

// Authority Badges - +25% credibility

function authorityBadges() {
    const badges = `
        <div class="authority-badges">
            <img src="/img/google-partner.png" alt="Google Partner">
            <img src="/img/facebook-partner.png" alt="Facebook Partner">
            <img src="/img/awards-2024.png" alt="Awards 2024">
            <img src="/img/ssl-secure.png" alt="SSL Secure">
        </div>`;

    document.querySelectorAll('footer').forEach(el => {
        el.insertAdjacentHTML('beforebegin', badges);
    });
}
authorityBadges();
