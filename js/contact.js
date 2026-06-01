'use strict';

(function () {
    const FORM_SELECTOR = '[data-contact-form]';
    const MESSAGE_SELECTOR = '[data-contact-form-message]';

    function isValidEmail(value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    function isValidZip(value) {
        return /^\d{5}(-\d{4})?$/.test(value);
    }

    function setFieldError(field, message) {
        if (!field) return;

        const wrapper = field.closest('.form-field') || field.closest('.custom-checkbox');

        field.classList.add('is-invalid');
        field.setAttribute('aria-invalid', 'true');

        if (wrapper) {
            wrapper.classList.add('has-error');
        }

        let error = wrapper ? wrapper.querySelector('.field-error') : null;

        if (!error && wrapper) {
            error = document.createElement('span');
            error.className = 'field-error';
            error.setAttribute('aria-live', 'polite');
            wrapper.appendChild(error);
        }

        if (error) {
            error.textContent = message;
        }
    }

    function clearFieldError(field) {
        if (!field) return;

        const wrapper = field.closest('.form-field') || field.closest('.custom-checkbox');

        field.classList.remove('is-invalid');
        field.removeAttribute('aria-invalid');

        if (wrapper) {
            wrapper.classList.remove('has-error');

            const error = wrapper.querySelector('.field-error');

            if (error) {
                error.remove();
            }
        }
    }

    function clearAllErrors(form) {
        form.querySelectorAll('input, select, textarea').forEach(clearFieldError);
    }

    function showFormMessage(messageElement, text, type) {
        if (!messageElement) return;

        messageElement.textContent = text;
        messageElement.classList.remove('is-error', 'is-success');

        if (type) {
            messageElement.classList.add(`is-${type}`);
        }
    }

    function validateContactForm(form) {
        const fullName = form.querySelector('[name="fullName"]');
        const email = form.querySelector('[name="email"]');
        const phone = form.querySelector('[name="phone"]');
        const zip = form.querySelector('[name="zip"]');
        const serviceInterest = form.querySelector('[name="serviceInterest"]');
        const consent = form.querySelector('[name="consent"]');

        const errors = [];

        clearAllErrors(form);

        if (!fullName.value.trim()) {
            errors.push(fullName);
            setFieldError(fullName, 'Please enter your full name.');
        }

        if (!email.value.trim()) {
            errors.push(email);
            setFieldError(email, 'Please enter your email address.');
        } else if (!isValidEmail(email.value.trim())) {
            errors.push(email);
            setFieldError(email, 'Please enter a valid email address.');
        }

        if (!phone.value.trim()) {
            errors.push(phone);
            setFieldError(phone, 'Please enter your phone number.');
        }

        if (!zip.value.trim()) {
            errors.push(zip);
            setFieldError(zip, 'Please enter your ZIP code.');
        } else if (!isValidZip(zip.value.trim())) {
            errors.push(zip);
            setFieldError(zip, 'Please enter a valid ZIP code.');
        }

        if (!serviceInterest.value.trim()) {
            errors.push(serviceInterest);
            setFieldError(serviceInterest, 'Please select a service category.');
        }

        if (!consent.checked) {
            errors.push(consent);
            setFieldError(consent, 'Please confirm consent before submitting.');
        }

        return {
            isValid: errors.length === 0,
            firstError: errors[0] || null
        };
    }

    function collectFormData(form) {
        const formData = new FormData(form);

        return {
            fullName: String(formData.get('fullName') || '').trim(),
            email: String(formData.get('email') || '').trim(),
            phone: String(formData.get('phone') || '').trim(),
            zip: String(formData.get('zip') || '').trim(),
            serviceInterest: String(formData.get('serviceInterest') || '').trim(),
            message: String(formData.get('message') || '').trim(),
            consent: Boolean(formData.get('consent'))
        };
    }

    function initLiveValidation(form) {
        form.querySelectorAll('input, select, textarea').forEach((field) => {
            field.addEventListener('input', () => {
                clearFieldError(field);
            });

            field.addEventListener('change', () => {
                clearFieldError(field);
            });
        });
    }

    function initContactForm() {
        const form = document.querySelector(FORM_SELECTOR);

        if (!form) return;

        const messageElement = form.querySelector(MESSAGE_SELECTOR);

        initLiveValidation(form);

        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const validation = validateContactForm(form);

            if (!validation.isValid) {
                showFormMessage(
                    messageElement,
                    'Please review the highlighted fields before submitting.',
                    'error'
                );

                if (validation.firstError) {
                    validation.firstError.focus();
                }

                return;
            }

            const data = collectFormData(form);

            console.info('GUARDER contact request:', data);

            showFormMessage(
                messageElement,
                'Thank you. Your request has been received. You can now compare provider options based on your selected category.',
                'success'
            );

            form.reset();
            clearAllErrors(form);
        });
    }

    function initContactOptionHover() {
        document.querySelectorAll('.contact-option').forEach((option) => {
            option.addEventListener('mouseenter', () => {
                option.classList.add('is-hovered');
            });

            option.addEventListener('mouseleave', () => {
                option.classList.remove('is-hovered');
            });
        });
    }

    function initContactPage() {
        initContactForm();
        initContactOptionHover();

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initContactPage);
    } else {
        initContactPage();
    }
})();