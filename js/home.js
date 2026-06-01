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

    function populateHomeServicesSlider() {
        const track = document.querySelector('[data-home-services-track]');

        if (!track || track.children.length) return;

        const services = Array.isArray(CONFIG.services) ? CONFIG.services : [];

        track.innerHTML = services.map(createServiceSlide).join('');

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    class GuarderSlider {
        constructor(root) {
            this.root = root;
            this.track = root.querySelector('[data-slider-track]');
            this.viewport = root.querySelector('[data-slider-viewport]');
            this.scope = root.closest('section') || root;

            this.prevButtons = this.scope.querySelectorAll('[data-slider-prev]');
            this.nextButtons = this.scope.querySelectorAll('[data-slider-next]');
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
            this.root.setAttribute('aria-label', 'Security service categories slider');

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

            const beforeClones = this.originalSlides
                .slice(-this.cloneCount)
                .map((slide) => {
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

            const afterClones = this.originalSlides
                .slice(0, this.cloneCount)
                .map((slide) => {
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
                dot.setAttribute('aria-label', `Go to service slide ${index + 1}`);
                dot.dataset.sliderDot = String(index);

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
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.next();
                });
            });

            this.prevButtons.forEach((button) => {
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    this.prev();
                });
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

    function initHomeSliders() {
        document.querySelectorAll('[data-home-services-slider]').forEach((slider) => {
            new GuarderSlider(slider);
        });
    }

    function initHomeQuoteForms() {
        document.querySelectorAll('[data-zip-quote-form]').forEach((form) => {
            const input = form.querySelector('input');
            const message = form.querySelector('[data-form-message]');

            form.addEventListener('submit', (event) => {
                event.preventDefault();

                const zipValue = input ? input.value.trim() : '';

                if (!zipValue) {
                    if (message) {
                        message.textContent = 'Please enter your ZIP code to continue.';
                        message.classList.add('is-error');
                        message.classList.remove('is-success');
                    }

                    if (input) input.focus();
                    return;
                }

                if (message) {
                    message.textContent = 'Thank you. You can now compare available provider options.';
                    message.classList.add('is-success');
                    message.classList.remove('is-error');
                }

                form.reset();
            });
        });
    }

    function initHomeCounters() {
        document.querySelectorAll('[data-count-up]').forEach((counter) => {
            const target = Number(counter.dataset.countUp);

            if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
                counter.textContent = counter.dataset.countLabel || String(target);
                return;
            }

            let current = 0;
            const duration = 900;
            const start = performance.now();
            const label = counter.dataset.countLabel || '';

            const animate = (time) => {
                const progress = Math.min((time - start) / duration, 1);
                current = Math.floor(target * progress);

                counter.textContent = label.includes('{number}')
                    ? label.replace('{number}', current)
                    : String(current);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    counter.textContent = label.includes('{number}')
                        ? label.replace('{number}', target)
                        : String(target);
                }
            };

            requestAnimationFrame(animate);
        });
    }

    function initHomePage() {
        populateHomeServicesSlider();
        initHomeSliders();
        initHomeQuoteForms();
        initHomeCounters();

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomePage);
    } else {
        initHomePage();
    }
})();