
// footer Component Loader
class FooterComponent {
    constructor() {
        this.componentPath = '/components/layout/footer.html';
        this.cache = null;
    }

    async load(targetSelector) {
        const target = document.querySelector(targetSelector);
        if (!target) return;

        try {
            if (!this.cache) {
                const response = await fetch(this.componentPath);
                this.cache = await response.text();
            }

            target.innerHTML = this.cache;
            this.initialize(target);
        } catch (error) {
            console.error('Failed to load footer:', error);
        }
    }

    initialize(element) {
        // Component-specific initialization
        console.log('footer component loaded');
    }
}

// Auto-load on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const component = new FooterComponent();
    const placeholders = document.querySelectorAll('[data-component="footer"]');
    placeholders.forEach(el => component.load(`[data-component="footer"]`));
});
