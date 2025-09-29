export class FooterComponent {
    constructor() {
        this.template = null;
        this.data = {
            companyName: 'The Profit Platform',
            description: 'We help Sydney businesses dominate Google and get more customers through proven digital marketing strategies. No lock-ins, just results.',
            phone: '0487 286 451',
            email: 'avi@theprofitplatform.com.au',
            location: 'Sydney, NSW, Australia',
            currentYear: new Date().getFullYear(),
            social: {
                facebook: 'https://www.facebook.com/profile.php?id=61574707582255',
                instagram: 'https://www.instagram.com/theprofitplatformau',
                linkedin: 'https://linkedin.com/company/theprofitplatform',
                twitter: 'https://twitter.com/profitplatform',
                youtube: 'https://youtube.com/theprofitplatform'
            },
            services: [
                { href: 'seo.html', icon: 'fas fa-search', text: 'SEO & Local Search' },
                { href: 'google-ads.html', icon: 'fas fa-bullhorn', text: 'Google Ads Management' },
                { href: 'google-ads.html', icon: 'fas fa-share-alt', text: 'Social Media Advertising' },
                { href: 'web-design.html', icon: 'fas fa-laptop-code', text: 'Website Design' },
                { href: 'services.html#conversion', icon: 'fas fa-chart-line', text: 'Conversion Optimization' },
                { href: 'services.html#analytics', icon: 'fas fa-analytics', text: 'Analytics & Reporting' }
            ],
            company: [
                { href: 'about.html', icon: 'fas fa-info-circle', text: 'About Us' },
                { href: 'portfolio.html', icon: 'fas fa-chart-bar', text: 'Case Studies' },
                { href: 'blog/index.html', icon: 'fas fa-blog', text: 'Blog' },
                { href: 'about.html#careers', icon: 'fas fa-briefcase', text: 'Careers' },
                { href: 'about.html#partners', icon: 'fas fa-handshake', text: 'Partners' },
                { href: 'contact.html', icon: 'fas fa-envelope', text: 'Contact' }
            ],
            resources: [
                { href: 'contact.html', icon: 'fas fa-search-plus', text: 'Free Marketing Audit' },
                { href: 'blog/seo-guide.html', icon: 'fas fa-book', text: 'Free SEO Guide' },
                { href: 'blog/google-ads-guide.html', icon: 'fas fa-graduation-cap', text: 'Google Ads Guide' },
                { href: '/local-seo-checklist', icon: 'fas fa-list-check', text: 'Local SEO Checklist' },
                { href: '/webinars', icon: 'fas fa-video', text: 'Free Webinars' },
                { href: '/tools', icon: 'fas fa-tools', text: 'Free Tools' }
            ],
            legal: [
                { href: '/privacy-policy', text: 'Privacy Policy' },
                { href: '/terms-of-service', text: 'Terms of Service' },
                { href: '/sitemap', text: 'Sitemap' }
            ]
        };
    }

    async loadTemplate() {
        try {
            const response = await fetch('/components/footer/footer.html');
            this.template = await response.text();
        } catch (error) {
            console.error('Failed to load footer template:', error);
            this.template = this.getFallbackTemplate();
        }
    }

    getFallbackTemplate() {
        return `
            <footer role="contentinfo">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-column">
                            <h3>{{companyName}}</h3>
                            <p>{{description}}</p>

                            <div class="social-links" role="list" aria-label="Social media links">
                                {{socialLinks}}
                            </div>

                            <div class="contact-info-footer">
                                <div class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <a href="tel:{{phoneRaw}}">{{phone}}</a>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <a href="mailto:{{email}}">{{email}}</a>
                                </div>
                                <div class="contact-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <span>{{location}}</span>
                                </div>
                            </div>
                        </div>

                        <div class="footer-column">
                            <h3>Services</h3>
                            <ul class="footer-links">{{serviceLinks}}</ul>
                        </div>

                        <div class="footer-column">
                            <h3>Company</h3>
                            <ul class="footer-links">{{companyLinks}}</ul>
                        </div>

                        <div class="footer-column">
                            <h3>Resources</h3>
                            <ul class="footer-links">{{resourceLinks}}</ul>
                        </div>
                    </div>

                    <div class="footer-bottom">
                        <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
                        <ul class="footer-links-bottom">{{legalLinks}}</ul>
                    </div>
                </div>
            </footer>
        `;
    }

    generateSocialLinks() {
        const socialData = [
            { key: 'facebook', icon: 'fab fa-facebook-f', label: 'Follow us on Facebook' },
            { key: 'instagram', icon: 'fab fa-instagram', label: 'Follow us on Instagram' },
            { key: 'linkedin', icon: 'fab fa-linkedin-in', label: 'Connect with us on LinkedIn' },
            { key: 'twitter', icon: 'fab fa-twitter', label: 'Follow us on Twitter' },
            { key: 'youtube', icon: 'fab fa-youtube', label: 'Subscribe to our YouTube channel' }
        ];

        return socialData.map(social => `
            <a href="${this.data.social[social.key]}"
               class="social-icon"
               target="_blank"
               rel="noopener noreferrer"
               aria-label="${social.label}"
               role="listitem">
                <i class="${social.icon}" aria-hidden="true"></i>
            </a>
        `).join('');
    }

    generateLinks(links) {
        return links.map(link => `
            <li><a href="${link.href}"><i class="${link.icon}"></i> ${link.text}</a></li>
        `).join('');
    }

    generateLegalLinks(links) {
        return links.map(link => `
            <li><a href="${link.href}">${link.text}</a></li>
        `).join('');
    }

    render() {
        if (!this.template) {
            this.template = this.getFallbackTemplate();
        }

        let html = this.template;

        html = html.replace('{{companyName}}', this.data.companyName);
        html = html.replace('{{description}}', this.data.description);
        html = html.replace('{{phone}}', this.data.phone);
        html = html.replace('{{phoneRaw}}', this.data.phone.replace(/\s/g, ''));
        html = html.replace('{{email}}', this.data.email);
        html = html.replace('{{location}}', this.data.location);
        html = html.replace('{{currentYear}}', this.data.currentYear);
        html = html.replace('{{socialLinks}}', this.generateSocialLinks());
        html = html.replace('{{serviceLinks}}', this.generateLinks(this.data.services));
        html = html.replace('{{companyLinks}}', this.generateLinks(this.data.company));
        html = html.replace('{{resourceLinks}}', this.generateLinks(this.data.resources));
        html = html.replace('{{legalLinks}}', this.generateLegalLinks(this.data.legal));

        return html;
    }

    async init(targetSelector = 'footer') {
        const existingFooter = document.querySelector(targetSelector);
        if (!existingFooter) {
            console.error('Footer element not found');
            return;
        }

        await this.loadTemplate();
        const footerHtml = this.render();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = footerHtml;
        const newFooter = tempDiv.querySelector('footer');

        existingFooter.parentNode.replaceChild(newFooter, existingFooter);
    }
}

if (typeof window !== 'undefined') {
    window.FooterComponent = FooterComponent;
}