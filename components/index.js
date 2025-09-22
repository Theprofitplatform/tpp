import { ComponentLoader } from './component-loader.js';
import { FooterComponent } from './footer/footer.js';

const loader = new ComponentLoader();

loader.register('footer', FooterComponent);

async function initComponents() {
    const footers = document.querySelectorAll('footer:not([data-component="loaded"])');

    for (const footer of footers) {
        try {
            const component = new FooterComponent();
            await component.init('footer');
            footer.setAttribute('data-component', 'loaded');
        } catch (error) {
            console.error('Failed to initialize footer component:', error);
        }
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initComponents);
} else {
    initComponents();
}

export { loader, ComponentLoader, FooterComponent };