'use strict';

window.SITE_CONFIG = {
    company: {
        name: 'GUARDER',
        companyId: 'GRD-HS-4827',
        address: '1846 Westlake Security Avenue, Austin, TX 78701, USA',
        serviceArea: 'Independent home security provider comparison site',
    },

    contact: {
        phoneRaw: '+18885550148',
        phoneDisplay: '(888) 555-0148',
        phoneButtonText: 'Compare Security Providers',
        email: 'hello@guardercompare.com',
        supportHours: 'Mon–Fri, 8:00 AM–7:00 PM'
    },

    cta: {
        primary: 'Compare Providers',
        secondary: 'View Services',
        contact: 'Request Provider Options',
        phone: 'Call to Compare',
        quote: 'Request Quotes',
        services: 'Explore Security Services'
    },

    footer: {
        description:
            'GUARDER is an independent home security comparison platform that helps homeowners explore local provider options for alarm systems, cameras, smart locks, monitoring, access control, and video doorbells.',

        disclaimer:
            'Disclaimer: This site is a free service to assist homeowners in connecting with local service providers. All contractors/providers are independent and this site does not warrant or guarantee any work performed. It is the responsibility of the homeowner to verify that the hired contractor furnishes the necessary license and insurance required for the work being performed. All persons depicted in a photo or video are actors or models and not contractors listed on this site.'
    },

    links: {
        home: 'index.html',
        services: 'services.html',
        about: 'about.html',
        contact: 'contact.html',
        privacy: 'privacy-policy.html',
        cookies: 'cookie-policy.html',
        terms: 'terms-of-service.html'
    },

    services: [
        {
            title: 'Alarm Systems',
            slug: 'alarm-systems',
            url: 'alarm-systems.html',
            shortText: 'Compare alarm system packages, sensors, control panels, and alert options.',
            image: 'assets/images/alarm-system.jpg',
            icon: 'bell-ring'
        },
        {
            title: 'Security Cameras',
            slug: 'security-cameras',
            url: 'security-cameras.html',
            shortText: 'Review indoor, outdoor, night vision, storage, and camera app options.',
            image: 'assets/images/security-cameras.jpg',
            icon: 'cctv'
        },
        {
            title: 'Smart Locks',
            slug: 'smart-locks',
            url: 'smart-locks.html',
            shortText: 'Explore keyless entry, app control, guest codes, and compatibility options.',
            image: 'assets/images/smart-lock.jpg',
            icon: 'lock-keyhole'
        },
        {
            title: 'Home Monitoring',
            slug: 'home-monitoring',
            url: 'home-monitoring.html',
            shortText: 'Compare monitoring plans, emergency alerts, monthly costs, and contract terms.',
            image: 'assets/images/home-monitoring.jpg',
            icon: 'monitor-dot'
        },
        {
            title: 'Access Control',
            slug: 'access-control',
            url: 'access-control.html',
            shortText: 'Review keypad, gate, entry management, and multi-user access options.',
            image: 'assets/images/access-control.jpg',
            icon: 'panel-right-open'
        },
        {
            title: 'Video Doorbells',
            slug: 'video-doorbells',
            url: 'video-doorbells.html',
            shortText: 'Compare motion alerts, two-way audio, package monitoring, and app notifications.',
            image: 'assets/images/video-doorbell.jpg',
            icon: 'door-open'
        }
    ],

    tokens: {
        COMPANY_NAME: 'GUARDER',
        PHONE_DISPLAY: '(888) 555-0148',
        EMAIL: 'hello@guardercompare.com',
        ADDRESS: '1846 Westlake Security Avenue, Austin, TX 78701, USA',
        COMPANY_ID: 'GRD-HS-4827'
    }
};