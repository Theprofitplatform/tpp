export class ComponentLoader {
    constructor() {
        this.components = new Map();
        this.loaded = new Set();
    }

    register(name, ComponentClass) {
        this.components.set(name, ComponentClass);
    }

    async load(name, targetSelector, options = {}) {
        if (!this.components.has(name)) {
            console.error(`Component ${name} not registered`);
            return null;
        }

        const ComponentClass = this.components.get(name);
        const component = new ComponentClass(options);

        if (component.init) {
            await component.init(targetSelector);
        }

        this.loaded.add(name);
        return component;
    }

    async loadAll(componentMap) {
        const promises = [];

        for (const [name, config] of Object.entries(componentMap)) {
            const { selector, options } = typeof config === 'string'
                ? { selector: config, options: {} }
                : config;

            promises.push(this.load(name, selector, options));
        }

        return Promise.all(promises);
    }

    isLoaded(name) {
        return this.loaded.has(name);
    }

    async autoLoad() {
        const autoLoadConfigs = {
            footer: { selector: 'footer', options: {} },
            navigation: { selector: 'nav', options: {} }
        };

        const elementsFound = {};

        for (const [name, config] of Object.entries(autoLoadConfigs)) {
            const element = document.querySelector(config.selector);
            if (element && element.dataset.component !== 'loaded') {
                elementsFound[name] = config;
            }
        }

        if (Object.keys(elementsFound).length > 0) {
            await this.loadAll(elementsFound);
        }
    }
}

export async function loadComponent(componentPath, targetSelector, options = {}) {
    try {
        const module = await import(componentPath);
        const ComponentClass = module.default || Object.values(module)[0];

        const component = new ComponentClass(options);
        if (component.init) {
            await component.init(targetSelector);
        }

        return component;
    } catch (error) {
        console.error(`Failed to load component from ${componentPath}:`, error);
        return null;
    }
}

export function injectComponent(html, targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) {
        console.error(`Target element ${targetSelector} not found`);
        return false;
    }

    target.innerHTML = html;
    return true;
}

export function replaceComponent(html, targetSelector) {
    const target = document.querySelector(targetSelector);
    if (!target) {
        console.error(`Target element ${targetSelector} not found`);
        return false;
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    const newElement = tempDiv.firstElementChild;

    if (newElement) {
        target.parentNode.replaceChild(newElement, target);
        return true;
    }
    return false;
}

if (typeof window !== 'undefined') {
    window.ComponentLoader = ComponentLoader;
    window.loadComponent = loadComponent;
    window.injectComponent = injectComponent;
    window.replaceComponent = replaceComponent;
}