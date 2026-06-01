'use strict';

(function () {
    const CONFIG = window.SITE_CONFIG || {};

    const SELECTORS = {
        header: '[data-header]',
        mobileMenu: '[data-mobile-menu]',
        mobileOpen: '[data-mobile-open]',
        mobileClose: '[data-mobile-close]',
        dropdown: '[data-dropdown]',
        dropdownToggle: '[data-dropdown-toggle]',
        dropdownPanel: '[data-dropdown-panel]',
        faq: '[data-faq]',
        faqItem: '[data-faq-item]',
        faqButton: '[data-faq-button]',
        faqPanel: '[data-faq-panel]'
    };

    const COOKIE_KEY = 'guarder_cookie_consent';

    function getConfigValue(path) {
        if (!path || typeof path !== 'string') return '';

        return path.split('.').reduce((acc, key) => {
            if (acc && Object.prototype.hasOwnProperty.call(acc, key)) {
                return acc[key];
            }

            return '';
        }, CONFIG);
    }

    function createTokenMap() {
        return {
            '{{COMPANY_NAME}}': CONFIG.company?.name || '',
            '{{PHONE_DISPLAY}}': CONFIG.contact?.phoneDisplay || '',
            '{{EMAIL}}': CONFIG.contact?.email || '',
            '{{ADDRESS}}': CONFIG.company?.address || '',
            '{{COMPANY_ID}}': CONFIG.company?.companyId || ''
        };
    }

    function replaceTokensInString(value) {
        if (!value || typeof value !== 'string') return value;

        const tokenMap = createTokenMap();
        let result = value;

        Object.entries(tokenMap).forEach(([token, replacement]) => {
            result = result.split(token).join(replacement);
        });

        return result;
    }

    function replaceTextTokens(root = document.body) {
        if (!root) return;

        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode(node) {
                    const text = node.nodeValue || '';

                    if (
                        text.includes('{{COMPANY_NAME}}') ||
                        text.includes('{{PHONE_DISPLAY}}') ||
                        text.includes('{{EMAIL}}') ||
                        text.includes('{{ADDRESS}}') ||
                        text.includes('{{COMPANY_ID}}')
                    ) {
                        return NodeFilter.FILTER_ACCEPT;
                    }

                    return NodeFilter.FILTER_REJECT;
                }
            }
        );

        const textNodes = [];

        while (walker.nextNode()) {
            textNodes.push(walker.currentNode);
        }

        textNodes.forEach((node) => {
            node.nodeValue = replaceTokensInString(node.nodeValue);
        });
    }

    function applyConfigText() {
        document.querySelectorAll('[data-config]').forEach((element) => {
            const path = element.getAttribute('data-config');
            const value = getConfigValue(path);

            if (typeof value === 'string') {
                element.textContent = value;
            }
        });
    }

    function applyConfigAttributes() {
        document.querySelectorAll('[data-config-href]').forEach((element) => {
            const type = element.getAttribute('data-config-href');

            if (type === 'phone') {
                const phoneRaw = CONFIG.contact?.phoneRaw || '';
                element.setAttribute('href', `tel:${phoneRaw}`);
            }

            if (type === 'email') {
                const email = CONFIG.contact?.email || '';
                element.setAttribute('href', `mailto:${email}`);
            }
        });

        document.querySelectorAll('[data-config-placeholder]').forEach((element) => {
            const path = element.getAttribute('data-config-placeholder');
            const value = getConfigValue(path);

            if (value) {
                element.setAttribute('placeholder', value);
            }
        });

        document.querySelectorAll('[data-config-aria]').forEach((element) => {
            const path = element.getAttribute('data-config-aria');
            const value = getConfigValue(path);

            if (value) {
                element.setAttribute('aria-label', value);
            }
        });
    }

    function applyCtaText() {
        document.querySelectorAll('[data-cta]').forEach((element) => {
            const key = element.getAttribute('data-cta');
            const value = CONFIG.cta?.[key];

            if (value) {
                element.textContent = value;
            }
        });
    }

    function applyServiceLinks() {
        if (!Array.isArray(CONFIG.services)) return;

        document.querySelectorAll('[data-service-list]').forEach((list) => {
            const listType = list.getAttribute('data-service-list');

            list.innerHTML = CONFIG.services.map((service) => {
                if (listType === 'footer') {
                    return `
                        <li>
                            <a href="${service.url}">${service.title}</a>
                        </li>
                    `;
                }

                if (listType === 'dropdown') {
                    return `
                        <a class="dropdown-link" href="${service.url}">
                            <span class="dropdown-link__icon" data-lucide="${service.icon}" aria-hidden="true"></span>
                            <span>${service.title}</span>
                        </a>
                    `;
                }

                if (listType === 'mobile') {
                    return `
                        <a class="mobile-menu__service" href="${service.url}">
                            <span data-lucide="${service.icon}" aria-hidden="true"></span>
                            <span>${service.title}</span>
                        </a>
                    `;
                }

                return `
                    <a href="${service.url}">${service.title}</a>
                `;
            }).join('');
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function applySiteConfig() {
        applyConfigText();
        applyConfigAttributes();
        applyCtaText();
        applyServiceLinks();
        replaceTextTokens(document.body);
    }

    function initHeaderScrollState() {
        const header = document.querySelector(SELECTORS.header);

        if (!header) return;

        const updateHeader = () => {
            if (window.scrollY > 12) {
                header.classList.add('is-scrolled');
            } else {
                header.classList.remove('is-scrolled');
            }
        };

        updateHeader();
        window.addEventListener('scroll', updateHeader, { passive: true });
    }

    function initDropdowns() {
        const dropdowns = document.querySelectorAll(SELECTORS.dropdown);

        dropdowns.forEach((dropdown) => {
            const toggle = dropdown.querySelector(SELECTORS.dropdownToggle);
            const panel = dropdown.querySelector(SELECTORS.dropdownPanel);

            if (!toggle || !panel) return;

            let closeTimer = null;

            const openDropdown = () => {
                clearTimeout(closeTimer);
                dropdown.classList.add('is-open');
                toggle.setAttribute('aria-expanded', 'true');
            };

            const closeDropdown = () => {
                closeTimer = setTimeout(() => {
                    dropdown.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                }, 180);
            };

            dropdown.addEventListener('mouseenter', openDropdown);
            dropdown.addEventListener('mouseleave', closeDropdown);

            toggle.addEventListener('focus', openDropdown);

            dropdown.addEventListener('focusout', (event) => {
                if (!dropdown.contains(event.relatedTarget)) {
                    dropdown.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });

            toggle.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowDown') {
                    event.preventDefault();
                    openDropdown();

                    const firstLink = panel.querySelector('a');
                    if (firstLink) firstLink.focus();
                }

                if (event.key === 'Escape') {
                    dropdown.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                }
            });

            panel.addEventListener('keydown', (event) => {
                if (event.key === 'Escape') {
                    dropdown.classList.remove('is-open');
                    toggle.setAttribute('aria-expanded', 'false');
                    toggle.focus();
                }
            });
        });
    }

    function initMobileMenu() {
        const menu = document.querySelector(SELECTORS.mobileMenu);
        const openButton = document.querySelector(SELECTORS.mobileOpen);
        const closeButton = document.querySelector(SELECTORS.mobileClose);

        if (!menu || !openButton || !closeButton) return;

        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            'textarea:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(',');

        let lastFocusedElement = null;

        const openMenu = () => {
            lastFocusedElement = document.activeElement;

            menu.classList.add('is-open');
            document.body.classList.add('menu-open');
            openButton.setAttribute('aria-expanded', 'true');
            menu.setAttribute('aria-hidden', 'false');

            const firstFocusable = menu.querySelector(focusableSelectors);
            if (firstFocusable) {
                setTimeout(() => firstFocusable.focus(), 80);
            }
        };

        const closeMenu = () => {
            menu.classList.remove('is-open');
            document.body.classList.remove('menu-open');
            openButton.setAttribute('aria-expanded', 'false');
            menu.setAttribute('aria-hidden', 'true');

            if (lastFocusedElement) {
                lastFocusedElement.focus();
            }
        };

        openButton.addEventListener('click', openMenu);
        closeButton.addEventListener('click', closeMenu);

        menu.addEventListener('click', (event) => {
            const link = event.target.closest('a');

            if (link) {
                closeMenu();
            }

            if (event.target.matches('[data-mobile-menu]')) {
                closeMenu();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && menu.classList.contains('is-open')) {
                closeMenu();
            }
        });

        menu.addEventListener('keydown', (event) => {
            if (event.key !== 'Tab') return;

            const focusableElements = Array.from(menu.querySelectorAll(focusableSelectors));

            if (!focusableElements.length) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (event.shiftKey && document.activeElement === firstElement) {
                event.preventDefault();
                lastElement.focus();
            }

            if (!event.shiftKey && document.activeElement === lastElement) {
                event.preventDefault();
                firstElement.focus();
            }
        });
    }

    function createCookieBanner() {
        const savedChoice = localStorage.getItem(COOKIE_KEY);

        if (savedChoice) return;

        const banner = document.createElement('section');

        banner.className = 'cookie-banner';
        banner.setAttribute('data-cookie-banner', '');
        banner.setAttribute('aria-label', 'Cookie consent');

        banner.innerHTML = `
            <div class="cookie-banner__content">
                <div class="cookie-banner__text">
                    <strong>Cookie preferences</strong>
                    <p>
                        We use cookies to improve browsing, measure site activity, and support policy preferences.
                        Review our
                        <a href="privacy-policy.html">Privacy Policy</a>,
                        <a href="cookie-policy.html">Cookie Policy</a>, and
                        <a href="terms-of-service.html">Terms of Service</a>.
                    </p>
                </div>

                <div class="cookie-banner__actions">
                    <button class="button button--secondary-light cookie-banner__button" type="button" data-cookie-decline>
                        Decline
                    </button>
                    <button class="button button--primary cookie-banner__button" type="button" data-cookie-accept>
                        Accept
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(banner);

        const acceptButton = banner.querySelector('[data-cookie-accept]');
        const declineButton = banner.querySelector('[data-cookie-decline]');

        const saveChoice = (choice) => {
            localStorage.setItem(COOKIE_KEY, choice);
            banner.classList.add('is-hidden');

            setTimeout(() => {
                banner.remove();
            }, 250);
        };

        acceptButton.addEventListener('click', () => saveChoice('accepted'));
        declineButton.addEventListener('click', () => saveChoice('declined'));
    }

    function initFaqAccordions() {
        document.querySelectorAll(SELECTORS.faq).forEach((faq) => {
            const items = faq.querySelectorAll(SELECTORS.faqItem);

            items.forEach((item) => {
                const button = item.querySelector(SELECTORS.faqButton);
                const panel = item.querySelector(SELECTORS.faqPanel);

                if (!button || !panel) return;

                const isOpen = item.classList.contains('is-open');

                button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');

                if (!panel.id) {
                    panel.id = `faq-panel-${Math.random().toString(36).slice(2, 9)}`;
                }

                button.setAttribute('aria-controls', panel.id);

                if (!isOpen) {
                    panel.hidden = true;
                }

                button.addEventListener('click', () => {
                    const currentlyOpen = item.classList.contains('is-open');

                    items.forEach((otherItem) => {
                        const otherButton = otherItem.querySelector(SELECTORS.faqButton);
                        const otherPanel = otherItem.querySelector(SELECTORS.faqPanel);

                        otherItem.classList.remove('is-open');

                        if (otherButton) {
                            otherButton.setAttribute('aria-expanded', 'false');
                        }

                        if (otherPanel) {
                            otherPanel.hidden = true;
                        }
                    });

                    if (!currentlyOpen) {
                        item.classList.add('is-open');
                        button.setAttribute('aria-expanded', 'true');
                        panel.hidden = false;
                    }
                });
            });
        });
    }

    function initSmoothAnchors() {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const targetId = link.getAttribute('href');

                if (!targetId || targetId === '#') return;

                const target = document.querySelector(targetId);

                if (!target) return;

                event.preventDefault();

                const header = document.querySelector(SELECTORS.header);
                const headerHeight = header ? header.offsetHeight : 0;
                const targetTop = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });
            });
        });
    }

    function initActiveNavigation() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';

        document.querySelectorAll('[data-nav-link]').forEach((link) => {
            const href = link.getAttribute('href');

            if (!href) return;

            const linkPage = href.split('/').pop();

            if (linkPage === currentPage) {
                link.classList.add('is-active');
                link.setAttribute('aria-current', 'page');
            }
        });
    }

    function preventHorizontalOverflow() {
        const html = document.documentElement;
        const body = document.body;

        html.style.overflowX = 'hidden';
        body.style.overflowX = 'hidden';
    }

    function initLucideIcons() {
        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function initSkipLink() {
        const skipLink = document.querySelector('.skip-link');

        if (!skipLink) return;

        skipLink.addEventListener('click', () => {
            const main = document.querySelector('main');

            if (main) {
                main.setAttribute('tabindex', '-1');
                main.focus();
            }
        });
    }
    function initCurrentYear() {
        const yearElement = document.getElementById('current-year');

        if (yearElement) {
            yearElement.textContent = String(new Date().getFullYear());
        }
    }

    const PROJECT_IMAGES = [
        'assets/images/home-hero-bg.jpg',
        'assets/images/home-why-compare.jpg',
        'assets/images/home-ecosystem.jpg',
        'assets/images/home-trust.jpg',
        'assets/images/home-cta-bg.jpg',

        'assets/images/services-hero-bg.jpg',
        'assets/images/services-ecosystem.jpg',
        'assets/images/services-hero-bg.jpg',

        'assets/images/service-card-alarm-system.jpg',
        'assets/images/service-card-security-cameras.jpg',
        'assets/images/service-card-smart-locks.jpg',
        'assets/images/service-card-home-monitoring.jpg',
        'assets/images/service-card-access-control.jpg',
        'assets/images/service-card-video-doorbell.jpg',

        'assets/images/service-card-home-monitoring.jpg',
        'assets/images/alarm-systems-intro.jpg',
        'assets/images/security-cameras-intro.jpg',
        'assets/images/security-cameras-intro.jpg',
        'assets/images/smart-locks-intro.jpg',
        'assets/images/smart-locks-intro.jpg',
        'assets/images/card-1.jpg',
        'assets/images/card-2.jpg',
        'assets/images/card-1.jpg',
        'assets/images/card-1.jpg',
        'assets/images/video-doorbells-hero.jpg',
        'assets/images/video-doorbells-intro.jpg',
        'assets/images/video-doorbells-setup.jpg',

        'assets/images/about-hero-bg.jpg',
        'assets/images/about-model.jpg',
        'assets/images/card-1.jpg',
        'assets/images/card-2.jpg',

        'assets/images/contact-hero-bg.jpg',
        'assets/images/contact-form-side.jpg',
        'assets/images/card-1.jpg',

        'assets/images/card-1.jpg',
    ];

    function checkProjectImages() {
        PROJECT_IMAGES.forEach((path) => {
            const image = new Image();

            image.onload = () => {
                console.log(`✅ Image found: ${path}`);
            };

            image.onerror = () => {
                console.error(`❌ Missing image: ${path}`);
            };

            image.src = path;
        });
    }

    /* =========================
   ZIP QUOTE FORM
========================= */

    (function () {
        function isValidZip(value) {
            return /^\d{5}(-\d{4})?$/.test(value);
        }

        function initZipQuoteForm() {
            const forms = document.querySelectorAll('[data-zip-quote-form]');

            if (!forms.length) return;

            forms.forEach((form) => {
                const input = form.querySelector('[name="zip"]');
                const message = form.parentElement.querySelector('[data-form-message]');

                if (!input) return;

                form.addEventListener('submit', (event) => {
                    event.preventDefault();

                    const zip = input.value.trim();

                    if (!isValidZip(zip)) {
                        input.classList.add('is-invalid');

                        if (message) {
                            message.textContent = 'Please enter a valid ZIP code.';
                            message.classList.remove('is-success');
                            message.classList.add('is-error');
                        }

                        input.focus();
                        return;
                    }

                    input.classList.remove('is-invalid');

                    if (message) {
                        message.textContent = 'Great. Redirecting you to the request form...';
                        message.classList.remove('is-error');
                        message.classList.add('is-success');
                    }

                    localStorage.setItem('guarderZipCode', zip);

                    window.setTimeout(() => {
                        window.location.href = `contact.html?zip=${encodeURIComponent(zip)}#contact-form`;
                    }, 450);
                });

                input.addEventListener('input', () => {
                    input.classList.remove('is-invalid');

                    if (message) {
                        message.textContent = '';
                        message.classList.remove('is-error', 'is-success');
                    }
                });
            });
        }

        function initContactZipPrefill() {
            const params = new URLSearchParams(window.location.search);
            const zipFromUrl = params.get('zip');
            const zipFromStorage = localStorage.getItem('guarderZipCode');
            const zip = zipFromUrl || zipFromStorage;

            if (!zip) return;

            const zipInput = document.querySelector('#zip, [name="zip"]');

            if (zipInput && !zipInput.value) {
                zipInput.value = zip;
            }
        }

        function initZipFlow() {
            initZipQuoteForm();
            initContactZipPrefill();
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initZipFlow);
        } else {
            initZipFlow();
        }
    })();

    function initGlobalSite() {
        applySiteConfig();
        initHeaderScrollState();
        initDropdowns();
        initMobileMenu();
        createCookieBanner();
        initFaqAccordions();
        initSmoothAnchors();
        initActiveNavigation();
        preventHorizontalOverflow();
        initLucideIcons();
        initSkipLink();
        initCurrentYear();
        checkProjectImages();

        document.documentElement.classList.add('site-ready');
    }

    window.GUARDER = window.GUARDER || {};
    window.GUARDER.applySiteConfig = applySiteConfig;
    window.GUARDER.replaceTokensInString = replaceTokensInString;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initGlobalSite);
    } else {
        initGlobalSite();
    }
})();
