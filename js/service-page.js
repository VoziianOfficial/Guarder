'use strict';

(function () {
    const CONFIG = window.SITE_CONFIG || {};

    function createIcon(name) {
        return `<span data-lucide="${name}" aria-hidden="true"></span>`;
    }

    function createServiceSlide(service) {
        return `
            <div class="slider__slide">
                <a class="service-card service-card--${service.slug}" href="${service.url}">
                    <span class="service-card__icon">
                        ${createIcon(service.icon)}
                    </span>

                    <span class="service-card__content">
                        <span class="service-card__title">${service.title}</span>
                        <span class="service-card__text">${service.shortText}</span>
                        <span class="service-card__link">
                            Compare Options
                            ${createIcon('arrow-right')}
                        </span>
                    </span>
                </a>
            </div>
        `;
    }

    function populateRelatedServices() {
        const tracks = document.querySelectorAll('[data-related-services-track]');

        if (!tracks.length || !Array.isArray(CONFIG.services)) return;

        tracks.forEach((track) => {
            if (track.children.length) return;

            const currentService = document.body.dataset.service || '';

            const services = CONFIG.services.filter((service) => {
                return service.slug !== currentService;
            });

            track.innerHTML = services.map(createServiceSlide).join('');
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    function initServiceTabs() {
        document.querySelectorAll('[data-service-tabs]').forEach((tabsRoot) => {
            const buttons = Array.from(tabsRoot.querySelectorAll('[data-service-tab]'));
            const panels = Array.from(tabsRoot.querySelectorAll('[data-service-panel]'));

            if (!buttons.length || !panels.length) return;

            function activateTab(tabId, focusButton = false) {
                buttons.forEach((button) => {
                    const isActive = button.dataset.serviceTab === tabId;

                    button.classList.toggle('is-active', isActive);
                    button.setAttribute('aria-selected', isActive ? 'true' : 'false');
                    button.setAttribute('tabindex', isActive ? '0' : '-1');

                    if (isActive && focusButton) {
                        button.focus();
                    }
                });

                panels.forEach((panel) => {
                    const isActive = panel.dataset.servicePanel === tabId;

                    panel.classList.toggle('is-active', isActive);
                    panel.hidden = !isActive;
                });
            }

            buttons.forEach((button, index) => {
                const tabId = button.dataset.serviceTab;
                const panel = panels.find((item) => item.dataset.servicePanel === tabId);

                button.setAttribute('role', 'tab');
                button.setAttribute('aria-selected', button.classList.contains('is-active') ? 'true' : 'false');
                button.setAttribute('tabindex', button.classList.contains('is-active') ? '0' : '-1');

                if (!button.id) {
                    button.id = `service-tab-${tabId}`;
                }

                if (panel) {
                    panel.setAttribute('role', 'tabpanel');
                    panel.setAttribute('aria-labelledby', button.id);

                    if (!panel.id) {
                        panel.id = `service-panel-${tabId}`;
                    }

                    button.setAttribute('aria-controls', panel.id);

                    if (!button.classList.contains('is-active')) {
                        panel.hidden = true;
                    }
                }

                button.addEventListener('click', () => {
                    activateTab(tabId);
                });

                button.addEventListener('keydown', (event) => {
                    let nextIndex = index;

                    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
                        event.preventDefault();
                        nextIndex = (index + 1) % buttons.length;
                        activateTab(buttons[nextIndex].dataset.serviceTab, true);
                    }

                    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
                        event.preventDefault();
                        nextIndex = (index - 1 + buttons.length) % buttons.length;
                        activateTab(buttons[nextIndex].dataset.serviceTab, true);
                    }

                    if (event.key === 'Home') {
                        event.preventDefault();
                        activateTab(buttons[0].dataset.serviceTab, true);
                    }

                    if (event.key === 'End') {
                        event.preventDefault();
                        activateTab(buttons[buttons.length - 1].dataset.serviceTab, true);
                    }
                });
            });

            const activeButton = buttons.find((button) => button.classList.contains('is-active')) || buttons[0];

            if (activeButton) {
                activateTab(activeButton.dataset.serviceTab);
            }
        });
    }

    class RelatedServicesSlider {
        constructor(root) {
            this.root = root;
            this.track = root.querySelector('[data-slider-track]');
            this.viewport = root.querySelector('[data-slider-viewport]');
            this.prevButtons = root.querySelectorAll('[data-slider-prev]');
            this.nextButtons = root.querySelectorAll('[data-slider-next]');
            this.dotsContainer = root.querySelector('[data-slider-dots]');

            if (!this.track || !this.viewport) return;

            this.originalSlides = Array.from(this.track.children).map((slide) => slide.cloneNode(true));

            if (!this.originalSlides.length) return;

            this.total = this.originalSlides.length;
            this.currentIndex = 0;
            this.realIndex = 0;
            this.cloneCount = 0;
            this.perView = 1;
            this.autoplayTimer = null;
            this.isAnimating = false;
            this.touchStartX = 0;
            this.touchCurrentX = 0;
            this.touchStartY = 0;
            this.hasTouchMoved = false;
            this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            this.init();
        }

        init() {
            this.root.setAttribute('tabindex', '0');
            this.root.setAttribute('role', 'region');
            this.root.setAttribute('aria-label', 'Related home security services slider');

            this.rebuild();
            this.bindEvents();
            this.startAutoplay();
        }

        getPerView() {
            const width = window.innerWidth;

            if (width <= 767) return 1;
            if (width <= 1024) return 2;

            return 3;
        }

        rebuild() {
            const previousRealIndex = this.getRealIndex();

            this.perView = this.getPerView();
            this.cloneCount = Math.min(this.perView, this.total);

            const beforeClones = this.originalSlides.slice(-this.cloneCount).map((slide) => {
                const clone = slide.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.dataset.sliderClone = 'true';
                return clone;
            });

            const realSlides = this.originalSlides.map((slide, index) => {
                const clone = slide.cloneNode(true);
                clone.dataset.sliderReal = String(index);
                return clone;
            });

            const afterClones = this.originalSlides.slice(0, this.cloneCount).map((slide) => {
                const clone = slide.cloneNode(true);
                clone.setAttribute('aria-hidden', 'true');
                clone.dataset.sliderClone = 'true';
                return clone;
            });

            this.track.innerHTML = '';

            [...beforeClones, ...realSlides, ...afterClones].forEach((slide) => {
                slide.style.flex = `0 0 ${100 / this.perView}%`;
                this.track.appendChild(slide);
            });

            this.currentIndex = this.cloneCount + previousRealIndex;
            this.realIndex = previousRealIndex;

            this.createDots();
            this.update(false);

            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

        createDots() {
            if (!this.dotsContainer) return;

            this.dotsContainer.innerHTML = '';

            for (let index = 0; index < this.total; index += 1) {
                const dot = document.createElement('button');

                dot.className = 'slider__dot';
                dot.type = 'button';
                dot.dataset.sliderDot = String(index);
                dot.setAttribute('aria-label', `Go to related service slide ${index + 1}`);

                if (index === this.realIndex) {
                    dot.classList.add('is-active');
                    dot.setAttribute('aria-current', 'true');
                }

                dot.addEventListener('click', () => {
                    this.goTo(index);
                });

                this.dotsContainer.appendChild(dot);
            }
        }

        update(animate = true) {
            const offset = this.currentIndex * (100 / this.perView);

            this.track.style.transition = animate ? 'transform 380ms ease' : 'none';
            this.track.style.transform = `translateX(-${offset}%)`;

            this.updateDots();

            if (!animate) {
                requestAnimationFrame(() => {
                    this.track.style.transition = 'transform 380ms ease';
                });
            }
        }

        updateDots() {
            this.realIndex = this.getRealIndex();

            if (!this.dotsContainer) return;

            this.dotsContainer.querySelectorAll('[data-slider-dot]').forEach((dot) => {
                const dotIndex = Number(dot.dataset.sliderDot);
                const isActive = dotIndex === this.realIndex;

                dot.classList.toggle('is-active', isActive);

                if (isActive) {
                    dot.setAttribute('aria-current', 'true');
                } else {
                    dot.removeAttribute('aria-current');
                }
            });
        }

        getRealIndex() {
            return (this.currentIndex - this.cloneCount + this.total) % this.total;
        }

        next() {
            if (this.isAnimating) return;

            this.isAnimating = true;
            this.currentIndex += 1;
            this.update(true);
        }

        prev() {
            if (this.isAnimating) return;

            this.isAnimating = true;
            this.currentIndex -= 1;
            this.update(true);
        }

        goTo(index) {
            if (this.isAnimating) return;

            this.isAnimating = true;
            this.currentIndex = this.cloneCount + index;
            this.update(true);
        }

        handleTransitionEnd() {
            this.isAnimating = false;

            if (this.currentIndex >= this.cloneCount + this.total) {
                this.currentIndex = this.cloneCount;
                this.update(false);
            }

            if (this.currentIndex < this.cloneCount) {
                this.currentIndex = this.cloneCount + this.total - 1;
                this.update(false);
            }

            this.updateDots();
        }

        startAutoplay() {
            if (this.prefersReducedMotion) return;

            this.stopAutoplay();

            this.autoplayTimer = window.setInterval(() => {
                this.next();
            }, 5200);
        }

        stopAutoplay() {
            if (this.autoplayTimer) {
                window.clearInterval(this.autoplayTimer);
                this.autoplayTimer = null;
            }
        }

        bindEvents() {
            this.nextButtons.forEach((button) => {
                button.addEventListener('click', () => this.next());
            });

            this.prevButtons.forEach((button) => {
                button.addEventListener('click', () => this.prev());
            });

            this.track.addEventListener('transitionend', () => this.handleTransitionEnd());

            this.root.addEventListener('mouseenter', () => this.stopAutoplay());
            this.root.addEventListener('mouseleave', () => this.startAutoplay());
            this.root.addEventListener('focusin', () => this.stopAutoplay());
            this.root.addEventListener('focusout', () => this.startAutoplay());

            this.root.addEventListener('keydown', (event) => {
                if (event.key === 'ArrowRight') {
                    event.preventDefault();
                    this.next();
                }

                if (event.key === 'ArrowLeft') {
                    event.preventDefault();
                    this.prev();
                }
            });

            this.viewport.addEventListener('touchstart', (event) => {
                if (!event.touches.length) return;

                this.stopAutoplay();

                this.touchStartX = event.touches[0].clientX;
                this.touchCurrentX = this.touchStartX;
                this.touchStartY = event.touches[0].clientY;
                this.hasTouchMoved = false;
            }, { passive: true });

            this.viewport.addEventListener('touchmove', (event) => {
                if (!event.touches.length) return;

                this.touchCurrentX = event.touches[0].clientX;

                const currentY = event.touches[0].clientY;
                const diffX = Math.abs(this.touchCurrentX - this.touchStartX);
                const diffY = Math.abs(currentY - this.touchStartY);

                if (diffX > diffY && diffX > 12) {
                    this.hasTouchMoved = true;
                }
            }, { passive: true });

            this.viewport.addEventListener('touchend', () => {
                const diff = this.touchCurrentX - this.touchStartX;

                if (this.hasTouchMoved && Math.abs(diff) > 45) {
                    if (diff < 0) {
                        this.next();
                    } else {
                        this.prev();
                    }
                }

                this.startAutoplay();
            });

            window.addEventListener('resize', this.debounce(() => {
                const newPerView = this.getPerView();

                if (newPerView !== this.perView) {
                    this.rebuild();
                }
            }, 180));
        }

        debounce(callback, delay) {
            let timer = null;

            return (...args) => {
                window.clearTimeout(timer);

                timer = window.setTimeout(() => {
                    callback.apply(this, args);
                }, delay);
            };
        }
    }

    function initRelatedSliders() {
        document.querySelectorAll('[data-related-services-slider]').forEach((slider) => {
            new RelatedServicesSlider(slider);
        });
    }

    function initServicePage() {
        populateRelatedServices();
        initServiceTabs();
        initRelatedSliders();

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initServicePage);
    } else {
        initServicePage();
    }
})();