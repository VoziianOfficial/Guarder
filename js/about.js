'use strict';

(function () {
    function initAboutCards() {
        const cards = document.querySelectorAll('.help-card, .value-card, .compare-row');

        if (!cards.length) return;

        cards.forEach((card) => {
            card.addEventListener('mouseenter', () => {
                card.classList.add('is-hovered');
            });

            card.addEventListener('mouseleave', () => {
                card.classList.remove('is-hovered');
            });
        });
    }

    function initAboutMarqueePause() {
        const marquee = document.querySelector('.security-marquee');

        if (!marquee) return;

        const track = marquee.querySelector('.security-marquee__track');

        if (!track) return;

        marquee.addEventListener('mouseenter', () => {
            track.style.animationPlayState = 'paused';
        });

        marquee.addEventListener('mouseleave', () => {
            track.style.animationPlayState = '';
        });

        marquee.addEventListener('focusin', () => {
            track.style.animationPlayState = 'paused';
        });

        marquee.addEventListener('focusout', () => {
            track.style.animationPlayState = '';
        });
    }

    function initAboutPage() {
        initAboutCards();
        initAboutMarqueePause();

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAboutPage);
    } else {
        initAboutPage();
    }
})();