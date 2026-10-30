/**

 * Copyright 2026 Arpit Yadav (https://arpity.me)

 * Licensed under the Apache License, Version 2.0 (the "License");

 * you may not use this file except in compliance with the License.

 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0

 */



/* ======================================================================

   🧠 ARPIT'S JAVASCRIPT GUIDE (WEBSITE KA BRAIN & INTERACTION)

   ======================================================================

   HTML se skeleton banta hai, CSS se look & feel, aur JavaScript website

   me interactive jaan daalti hai:

   1. Audio Engine (Web Audio API) -> Button hover & click par soothing sounds

   2. Theme Switcher              -> Luxury Monochrome Black & White with Skiper26 View Transition

   3. Interactive Skills Filter   -> Skill click karne par related project highlight

   4. Project Details Modal       -> "Details" click karne par popup window khulna

   5. 3D Tilt Card Effects        -> Mouse hover par cards ka 3D angle me move karna

   6. Contact Form Logic          -> Formspree ke through direct messages bhejna

   ====================================================================== */



/* ========================================================

   1. AUDIO ENGINE: REMOVED (Lightweight Safe Stubs)

======================================================== */

function playButtonClick() {}

function playButtonHover() {}

function playCardHover() {}

function playNavClick() {}

function playScrollTick() {}

function playKeyTick() {}

function playSmoothTypingSound() {}

function playThemeTogglePop() {}

function playCozyChime() {}



/* ========================================================

   2. PRELOADER (REMOVED - HERO IMMEDIATE ACTIVATION)

======================================================== */

document.addEventListener('DOMContentLoaded', () => {

    document.body.style.overflow = '';

    const hero = document.getElementById('home');

    if (hero) hero.classList.add('active');

});



/* ========================================================

   3. BUTTON CLICK FLUID RIPPLE WAVE EFFECT

======================================================== */

document.querySelectorAll('.ripple-btn').forEach(button => {

    button.addEventListener('click', function(e) {

        const circle = document.createElement('span');

        const diameter = Math.max(this.clientWidth, this.clientHeight);

        const radius = diameter / 2;



        const rect = this.getBoundingClientRect();

        circle.style.width = circle.style.height = `${diameter}px`;

        circle.style.left = `${e.clientX - rect.left - radius}px`;

        circle.style.top = `${e.clientY - rect.top - radius}px`;

        circle.classList.add('ripple');



        const ripple = this.querySelector('.ripple');

        if (ripple) {

            ripple.remove();

        }



        this.appendChild(circle);

    });

});



/* ========================================================

   RIGHT HEMISPHERE LUXURY MOTION & SCROLL ENGINE

   1. Lenis Butter-Smooth Scrolling (Inertia Curve: 1.5s)

   2. GSAP ScrollTrigger Precision Synchronization

   3. Right Hemisphere Masked Text Reveal (Word/Line splits)

   4. Staggered Bento & Capabilities Viewport Emergence

======================================================== */



// 1. Initialize Lenis Smooth Scroll

let lenis = null;

if (typeof Lenis !== 'undefined') {

    lenis = new Lenis({

        duration: 1.5,

        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),

        smoothTouch: false,

        touchMultiplier: 1.5

    });

    window.lenis = lenis;



    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {

        gsap.registerPlugin(ScrollTrigger);

        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {

            lenis.raf(time * 1000);

        });

        gsap.ticker.lagSmoothing(0);

    } else {

        function raf(time) {

            lenis.raf(time);

            requestAnimationFrame(raf);

        }

        requestAnimationFrame(raf);

    }

}



// 2. Lenis-Driven Butter-Smooth Anchor Link Navigation

document.querySelectorAll('a[href^="#"]').forEach(anchor => {

    anchor.addEventListener('click', function(e) {

        const targetId = this.getAttribute('href');

        if (targetId && targetId !== '#') {

            const targetEl = document.querySelector(targetId);

            if (targetEl) {

                e.preventDefault();

                // Close mobile drawer if active

                const nb = document.getElementById('navbar');

                const mt = document.getElementById('menu-toggle');

                if (nb && nb.classList.contains('active')) {

                    nb.classList.remove('active');

                    if (mt) {

                        mt.classList.remove('active');

                        mt.innerHTML = '<i class="fas fa-bars"></i>';

                    }

                }

                if (window.lenis) {

                    window.lenis.scrollTo(targetEl, { offset: -50, duration: 1.3 });

                } else {

                    targetEl.scrollIntoView({ behavior: 'smooth' });

                }

            }

        }

    });

});



// 3. Right Hemisphere & Cinematic Motion Engine



// ========================================================

// 0. SEAMLESS FLIP PRELOADER TO HERO ENGINE ("The Invisible Hand-off")

// 1. Preloader on blank screen.

// 2. "Arpit" (top-left) & "Yadav" (top-right) converge to center (2.0s).

// 3. The unified title glides directly to the exact resting position of the website's hero heading (0.95s).

// 4. Preloader background dissolves, header slides down, hero bio cascades in.

// 5. At destination, hero headline takes over, preloader disappears cleanly.

// ========================================================

function initSeamlessFlipPreloader() {

    const preloader = document.getElementById('intro-preloader');

    const heroTitle = document.querySelector('.hero-title.hero-headline-converge');

    const header = document.querySelector('.header');

    const heroItems = document.querySelectorAll('.hero-anim-item');



    if (!preloader || !heroTitle) {

        if (heroTitle) heroTitle.style.opacity = '1';

        if (header) header.style.opacity = '1';

        heroItems.forEach(el => el.classList.add('is-active'));

        document.body.style.overflow = '';

        return;

    }



    // Instant bypass for testing or direct link

    if (window.location.search.includes('skip_preloader=1')) {

        preloader.style.display = 'none';

        heroTitle.style.opacity = '1';

        if (header) {

            header.style.opacity = '1';

            header.style.transform = 'none';

        }

        heroItems.forEach(el => {

            el.style.opacity = '1';

            el.style.transform = 'none';

        });

        document.body.style.overflow = '';

        if (window.location.search.includes('menu_open=1')) {

            const nb = document.getElementById('navbar');

            const mt = document.getElementById('menu-toggle');

            if (nb) nb.classList.add('active');

            if (mt) {

                mt.classList.add('active');

                mt.innerHTML = '<i class="fas fa-times"></i>';

            }

        }

        return;

    }



    const leftPart = preloader.querySelector('.preloader-left');

    const rightPart = preloader.querySelector('.preloader-right');

    const preloaderHeadline = preloader.querySelector('.preloader-headline');

    const preloaderBackdrop = preloader.querySelector('.preloader-backdrop');



    // Prevent scrolling while preloader is active

    document.body.style.overflow = 'hidden';



    if (typeof gsap === 'undefined' || !leftPart || !rightPart || !preloaderHeadline) {

        preloader.style.display = 'none';

        heroTitle.style.opacity = '1';

        if (header) header.style.opacity = '1';

        heroItems.forEach(el => el.classList.add('is-active'));

        document.body.style.overflow = '';

        return;

    }



    // Ensure hero title is hidden while preloader title is in motion

    heroTitle.style.opacity = '0';

    if (header) {

        gsap.set(header, { y: -20, opacity: 0 });

    }

    gsap.set(heroItems, { y: 22, opacity: 0, filter: "blur(8px)" });



    const screenW = window.innerWidth;

    const isMobile = screenW <= 768;

    const margin = isMobile ? 24 : 56;



    // Reset preloader parts to measure natural centered width

    gsap.set([leftPart, rightPart], { clearProps: "all" });

    const leftRect = leftPart.getBoundingClientRect();

    const rightRect = rightPart.getBoundingClientRect();



    const targetLeftEdgeX = margin;

    const targetRightEdgeX = screenW - rightRect.width - margin;



    const leftStartX = targetLeftEdgeX - leftRect.left;

    const rightStartX = targetRightEdgeX - rightRect.left;

    const startY = isMobile ? -24 : -42;



    // 1. Initial State: Positioned at opposite corners, blurred & zero opacity

    gsap.set(leftPart, {

        x: leftStartX,

        y: startY,

        opacity: 0,

        filter: "blur(14px)",

        scale: 0.92

    });



    gsap.set(rightPart, {

        x: rightStartX,

        y: startY,

        opacity: 0,

        filter: "blur(14px)",

        scale: 0.92

    });



    if (preloaderBackdrop) {

        gsap.set(preloaderBackdrop, {

            opacity: 0,

            scale: 0.8

        });

    }



    // 2. Master FLIP Timeline

    const tl = gsap.timeline({ delay: 0.1 });



    // Ambient radial halo blooms

    if (preloaderBackdrop) {

        tl.to(preloaderBackdrop, {

            opacity: 1,

            scale: 1.15,

            duration: 2.2,

            ease: "power2.out"

        }, 0);

    }



    // "Arpit" glides in from top-left corner

    tl.to(leftPart, {

        x: 0,

        y: 0,

        opacity: 1,

        filter: "blur(0px)",

        scale: 1,

        duration: 2.0,

        ease: "power2.inOut"

    }, 0);



    // "Yadav" glides in from top-right corner

    tl.to(rightPart, {

        x: 0,

        y: 0,

        opacity: 1,

        filter: "blur(0px)",

        scale: 1,

        duration: 2.0,

        ease: "power2.inOut"

    }, 0);



    // 3. FLIP Flight from Preloader Center directly to Hero Destination:

    // Once united in center, calculate exact delta to the website's hero heading

    tl.call(() => {

        // Measure exact live destination

        const heroRect = heroTitle.getBoundingClientRect();

        const preloaderRect = preloaderHeadline.getBoundingClientRect();



        const deltaX = heroRect.left - preloaderRect.left;

        const deltaY = heroRect.top - preloaderRect.top;



        // ZERO-GAP SEAMLESS FLIGHT:

        // Preloader headline stays 100% solid black (no fade/no ghosting)

        // Hero title is unhidden at 85% progress so it's already solid underneath BEFORE handoff

        const isDark = document.body.getAttribute('data-theme') === 'black-vault';

        const transparentBg = isDark ? "rgba(10, 10, 11, 0)" : "rgba(246, 245, 242, 0)";



        gsap.to(preloaderHeadline, {

            x: deltaX,

            y: deltaY,

            duration: 0.85,

            ease: "power3.inOut",

            onUpdate: function() {

                // Ensure zero millisecond gap: hero title is active underneath before landing

                if (this.progress() >= 0.85 && heroTitle.style.opacity !== '1') {

                    heroTitle.style.opacity = '1';

                }

            },

            onComplete: () => {

                heroTitle.style.opacity = '1';

                preloader.style.display = 'none';

                document.body.style.overflow = '';

            }

        });



        // Fade ONLY the preloader background canvas (NOT the text!)

        gsap.to(preloader, {

            backgroundColor: transparentBg,

            duration: 0.75,

            delay: 0.1,

            ease: "power2.inOut"

        });



        if (preloaderBackdrop) {

            gsap.to(preloaderBackdrop, {

                opacity: 0,

                duration: 0.5,

                ease: "power2.out"

            });

        }



        // Top Header glides in as headline reaches hero destination

        if (header) {

            gsap.to(header, {

                y: 0,

                opacity: 1,

                duration: 0.7,

                delay: 0.5,

                ease: "power2.out"

            });

        }



        // Subtitle, Bio lead, CTA buttons, and direct line cascade in right below the landing spot

        if (heroItems.length) {

            gsap.to(heroItems, {

                y: 0,

                opacity: 1,

                filter: "blur(0px)",

                stagger: 0.1,

                duration: 0.7,

                delay: 0.65,

                ease: "power2.out",

                onStart: () => {

                    heroItems.forEach(el => el.classList.add('is-active'));

                }

            });

        }

    }, null, 2.1);

}



function initRightHemisphereMotion() {

    // 1. Immediate activation for project card inner slots

    const cards = document.querySelectorAll('.project-card');

    cards.forEach(card => card.classList.add('is-revealed'));



    // 2. A. CORNER-TO-CENTER HEADLINE CONVERGENCE & HERO CASCADE (GSAP POWERED)

    initSeamlessFlipPreloader();



    // 3. B. SCROLL-TRIGGERED SECTION APPEARANCE (GSAP + ScrollTrigger + Lenis)

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {

        // Section Titles (Clean upward float, no word-splitting cutoffs)

        document.querySelectorAll('.section-title, .contact-card h3').forEach(title => {

            gsap.fromTo(title,

                { y: 22, opacity: 0 },

                {

                    y: 0,

                    opacity: 1,

                    duration: 0.8,

                    ease: "power3.out",

                    scrollTrigger: {

                        trigger: title,

                        start: "top 92%",

                        toggleActions: "play none none none"

                    }

                }

            );

        });



        // Mono Tags & Descriptions

        document.querySelectorAll('.mono-tag, .section-desc, .skills-interactive-hint').forEach(el => {

            el.classList.add('rh-reveal-up');

            ScrollTrigger.create({

                trigger: el,

                start: "top 95%",

                onEnter: () => el.classList.add('is-revealed')

            });

        });



        // Featured Projects (2x2 Bento Grid Stagger)

        const projectGrid = document.querySelector('.projects-grid');

        const projectCardList = document.querySelectorAll('.project-card');

        if (projectGrid && projectCardList.length) {

            gsap.fromTo(projectCardList,

                { y: 35, opacity: 0 },

                {

                    y: 0,

                    opacity: 1,

                    duration: 0.8,

                    ease: "power3.out",

                    stagger: 0.1,

                    scrollTrigger: {

                        trigger: projectGrid,

                        start: "top 90%",

                        toggleActions: "play none none none"

                    }

                }

            );

        }



        // Technical Skills (4-column Capabilities Grid)

        const skillsGrid = document.querySelector('.skills-categories-grid');

        const skillCards = document.querySelectorAll('.skill-category-card');

        if (skillsGrid && skillCards.length) {

            gsap.fromTo(skillCards,

                { y: 30, opacity: 0 },

                {

                    y: 0,

                    opacity: 1,

                    duration: 0.75,

                    ease: "power3.out",

                    stagger: 0.08,

                    scrollTrigger: {

                        trigger: skillsGrid,

                        start: "top 90%",

                        toggleActions: "play none none none"

                    }

                }

            );

        }



        // Achievements items

        const achieveContainer = document.querySelector('.achievements-container');

        const achieveItems = document.querySelectorAll('.achievement-item');

        if (achieveContainer && achieveItems.length) {

            gsap.fromTo(achieveItems,

                { y: 25, opacity: 0 },

                {

                    y: 0,

                    opacity: 1,

                    duration: 0.75,

                    ease: "power3.out",

                    stagger: 0.08,

                    scrollTrigger: {

                        trigger: achieveContainer,

                        start: "top 90%",

                        toggleActions: "play none none none"

                    }

                }

            );

        }



        // Signal Flow Telemetry

        const signalContainer = document.querySelector('.signal-flow-container');

        if (signalContainer) {

            signalContainer.classList.add('rh-reveal-up');

            ScrollTrigger.create({

                trigger: signalContainer,

                start: "top 90%",

                onEnter: () => signalContainer.classList.add('is-revealed')

            });

        }



        // Contact Section (Direct card & form card)

        const contactGrid = document.querySelector('.contact-grid');

        const contactCards = document.querySelectorAll('.contact-card, .contact-form-card');

        if (contactGrid && contactCards.length) {

            gsap.fromTo(contactCards,

                { y: 30, opacity: 0 },

                {

                    y: 0,

                    opacity: 1,

                    duration: 0.8,

                    ease: "power3.out",

                    stagger: 0.1,

                    scrollTrigger: {

                        trigger: contactGrid,

                        start: "top 90%",

                        toggleActions: "play none none none"

                    }

                }

            );

        }



        setTimeout(() => {

            ScrollTrigger.refresh();

        }, 200);

    }



    // 4. GUARANTEED FAIL-SAFE INTERSECTION OBSERVER

    const safetyObserver = new IntersectionObserver((entries, obs) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {

                const el = entry.target;

                el.classList.add('is-revealed');

                obs.unobserve(el);

            }

        });

    }, { threshold: 0.05, rootMargin: "0px 0px 50px 0px" });



    document.querySelectorAll('.section-title, .mono-tag, .section-desc, .project-card, .skill-category-card, .achievement-item, .contact-card, .contact-form-card, .signal-flow-container').forEach(el => {

        safetyObserver.observe(el);

    });



    // 5. SAFETY TIMEOUT: Ensure all content is 100% revealed

    setTimeout(() => {

        document.querySelectorAll('.hero-anim-item:not(.is-active)').forEach(el => el.classList.add('is-active'));

        document.querySelectorAll('.rh-reveal-up:not(.is-revealed)').forEach(el => el.classList.add('is-revealed'));

    }, 3500);

}



if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', initRightHemisphereMotion);

} else {

    initRightHemisphereMotion();

}



/* Gradient hover cards removed to eliminate GPU lag */



/* Skiper 19 Scroll Stroke: Removed */

window.updateSkiper19ScrollStroke = () => {};



const menuToggle = document.getElementById('menu-toggle');

const navbar = document.getElementById('navbar');



if (menuToggle && navbar) {

    menuToggle.addEventListener('click', (e) => {

        e.stopPropagation();

        navbar.classList.toggle('active');

        menuToggle.classList.toggle('active');

        const isActive = navbar.classList.contains('active');

        menuToggle.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';

        menuToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');

        playButtonClick();

    });



    document.querySelectorAll('.nav-link').forEach(link => {

        link.addEventListener('click', () => {

            navbar.classList.remove('active');

            menuToggle.classList.remove('active');

            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';

            menuToggle.setAttribute('aria-expanded', 'false');

        });

    });



    // Close mobile menu when tapping anywhere outside

    document.addEventListener('click', (e) => {

        if (navbar.classList.contains('active') && !navbar.contains(e.target) && !menuToggle.contains(e.target)) {

            navbar.classList.remove('active');

            menuToggle.classList.remove('active');

            menuToggle.innerHTML = '<i class="fas fa-bars"></i>';

            menuToggle.setAttribute('aria-expanded', 'false');

        }

    });

}



/* ========================================================

   7. LIVE FORMSPREE EMAIL SUBMISSION (AJAX / Fetch)

======================================================== */

const contactForm = document.getElementById('contact-form');

const formMsg = document.getElementById('form-msg');

const submitBtn = document.getElementById('submit-btn');



if (contactForm) {

    contactForm.addEventListener('submit', async (e) => {

        e.preventDefault(); // Page reload hone se rokna

        playButtonClick();



        const originalBtnContent = submitBtn.innerHTML;

        submitBtn.innerHTML = '<span>Sending...</span> <i class="fas fa-spinner fa-spin"></i>';

        submitBtn.disabled = true;



        const formData = new FormData(contactForm);



        try {

            const response = await fetch("https://formspree.io/f/moevgzjw", {

                method: "POST",

                body: formData,

                headers: {

                    'Accept': 'application/json'

                }

            });



            if (response.ok) {

                formMsg.style.color = 'var(--accent-emerald)';

                formMsg.textContent = "🎉 Thank you! Your message has been sent successfully. I'll get back to you soon.";

                contactForm.reset();

            } else {

                formMsg.style.color = '#f43f5e';

                formMsg.textContent = "Oops! Something went wrong. Please reach out directly via email.";

            }

        } catch (error) {

            formMsg.style.color = '#f43f5e';

            formMsg.textContent = "Network error. Please check your internet connection.";

        } finally {

            submitBtn.innerHTML = originalBtnContent;

            submitBtn.disabled = false;

            setTimeout(() => {

                formMsg.textContent = '';

            }, 7000);

        }

    });

}



/* ========================================================

   8. PROJECT EXPANDED DETAILS MODAL ENGINE

   (Yahan har project ke popup window ka data hai:

    - title, subtitle, image, badge

    - problem statement, contribution, system flow diagrams

    - live demo links aur GitHub repositories)

======================================================== */

const projectDetailsData = {

    'smart-helmet': {

        index: '01 // CONNECTED HARDWARE ARCHITECTURE',

        badge: '<span class="badge sih-badge"><i class="fas fa-trophy"></i> SIH 2026 Problem SIH26220</span>',

        title: 'Smart Helmet Telemetry — IoT Ignition Interlock & Crash Detection',

        subtitle: 'An end-to-end IoT two-wheeler safety system featuring mandatory RF ignition interlocking, MQ-3 alcohol detection, and automated GSM/GPS SOS emergency telemetry with sub-second polling.',

        image: 'assets/smart-helmet-prototype.jpg',

        imageCaption: 'Physical Prototype Test Bench & Helmet Unit Integration',

        blocks: [

            {

                title: '<i class="fas fa-bullseye"></i> Problem Statement',

                content: 'Two-wheeler riders represent a disproportionately high percentage of fatal road accidents due to non-compliance with helmet wearing, drunken riding, and delayed emergency medical response following crashes.'

            },

            {

                title: '<i class="fas fa-user-cog"></i> My Contribution & Role',

                content: 'Active member of <strong>Team Smart Rider</strong> at the Smart India Hackathon 2026 (Internal Hackathon, Axis Institute of Technology & Management). Contributed to concept development, dual-unit system partitioning (Helmet Unit vs. Bike Controller), sensor evaluation (FSR pressure sensor, MQ-3 alcohol sensor, MPU6050 accelerometer/gyro), and local ignition interlock state logic.'

            },

            {

                title: '<i class="fas fa-project-diagram"></i> Architecture & Signal Flow',

                diagram: `[HELMET SENSING UNIT: ESP32 + 3.7V LiPo]

├── FSR Pressure Sensor (Helmet Worn Verification)

├── MQ-3 Sensor (Analog Sobriety Sampling: Alcohol < 0.05 mg/L)

└── MPU6050 6-Axis IMU (Collision High-G Impact & Tilt Detection)

        │

        ▼ (433 MHz RF Encrypted Packet Stream • <50ms Latency)

[BIKE CONTROLLER UNIT: ESP32 + Vehicle Power]

├── Ignition Interlock Relay (Engine Start Authorization)

└── Collision Event Pipeline ──► 10s Buzzer Abort Window ──► GSM/GPS Automated SOS (<3s)`

            },

            {

                title: '<i class="fas fa-sliders-h"></i> ATS Quantifiable Engineering Bullets',

                bullets: [

                    '<strong>Engineered</strong> an end-to-end IoT two-wheeler safety helmet using <strong>ESP32</strong> and <strong>Embedded C++</strong>, enforcing mandatory helmet wear and sobriety checks before vehicle ignition via an RF relay interlock.',

                    '<strong>Integrated</strong> MQ-3 alcohol gas sensors and 6-axis IMU accelerometers to detect rider intoxication and high-G impact collisions, reducing false-positive crash triggers by <strong>85%</strong> through threshold filtering.',

                    '<strong>Automated</strong> real-time emergency telemetry via <strong>GSM/GPS modules</strong>, transmitting exact crash coordinates to emergency contacts within <strong>3 seconds</strong> of impact detection.'

                ]

            }

        ],

        notice: '<strong>Status:</strong> Concept architecture and test bench evaluated at SIH 2026 Internal Hackathon. Verified certificate of participation on record.',

        actions: [

            { label: 'View SIH Certificate', icon: 'fas fa-certificate', isCert: true, href: 'assets/sih-certificate.jpg' },

            { label: 'LinkedIn Project', icon: 'fab fa-linkedin-in', href: 'https://www.linkedin.com/in/arpit-yadav-944983309/details/projects/', external: true }

        ]

    },

    'smart-kitchen': {

        index: '02 // EMBEDDED & 3D DIGITAL TWIN',

        badge: '<span class="badge live-badge"><i class="fas fa-circle"></i> Physical Hardware + 3D Twin</span>',

        title: 'SAFETY-FI 96X — Smart Kitchen IoT & 3D Digital Twin',

        subtitle: 'Real-time kitchen telemetry platform pairing microcontroller gas/thermal sensors with an interactive Three.js 3D cooktop digital twin for live spatial hazard monitoring and physical actuation.',

        image: null,

        imageCaption: null,

        videoEmbed: 'https://www.youtube.com/embed/pivb5MaotJo',

        videoCaption: 'Official Hardware Prototype Walkthrough & Hazard Mitigation Demonstration',

        blocks: [

            {

                title: '<i class="fab fa-youtube" style="color:#ef4444;"></i> Video Demonstration & Shot Breakdown',

                content: 'A comprehensive video presentation demonstrating FlameGuard\'s physical scaled kitchen model, autonomous fire sprinkler actuation, high-RPM gas extraction ventilation, and live 3D web dashboard synchronization (<a href="https://youtu.be/pivb5MaotJo" target="_blank" style="color:var(--accent-primary); font-weight:600; text-decoration:underline;">Watch on YouTube ↗</a>).',

                bullets: [

                    '<strong>[0:00 - 0:06] Hardware Architecture:</strong> Scaled physical kitchen model overview with labeled front/back sensors, isolated relays, and 16x2 I2C LCD.',

                    '<strong>[0:06 - 0:17] Fire Emergency & Sprinkler:</strong> Optical flame detection immediately triggers submersible pump sprinkler while safety interlock strictly locks exhaust fan OFF.',

                    '<strong>[0:17 - 0:38] Gas Leakage & Ventilation:</strong> MQ-2 sensor detects combustible gas/smoke breach, engaging the exhaust fan and dispatching phone push notifications.',

                    '<strong>[0:38 - 1:01] 3D Digital Twin:</strong> Three.js kinetic cooktop CAD simulation, 6 modular subsystem monitors, and microcontroller pinout webbing.'

                ]

            },

            {

                title: '<i class="fas fa-project-diagram"></i> Hardware to Software System Architecture',

                diagram: `[MQ-6 & LOAD SENSORS]

        │

        ▼ (UART / 9600-Baud Serial Bridge)

[PYTHON TELEMETRY BRIDGE: threading.RLock]

        │

        ▼ (Low-Latency WebSockets • <200ms)

[REACT & THREE.JS 3D COOKTOP TWIN]

├── Spatial Heat & Gas Dispersion Shader Lighting

├── Automated Actuation: 5V Solenoid Sprinkler Pump + Exhaust Interlock

└── Smartphone Push Sentinel Notifications via Cloud Gateway`

            },

            {

                title: '<i class="fas fa-sliders-h"></i> ATS Quantifiable Engineering Bullets',

                bullets: [

                    '<strong>Architected</strong> a full-stack IoT kitchen safety platform pairing microcontroller sensor arrays with an interactive <strong>Three.js 3D Cooktop Digital Twin</strong> for real-time spatial hazard visualization.',

                    '<strong>Built</strong> a low-latency <strong>Python Serial</strong> and WebSocket data pipeline to stream continuous LPG gas leakage, thermal, and load-cell pantry inventory telemetry at <strong>&lt;200ms</strong> latency.',

                    '<strong>Implemented</strong> automated threshold alerting and predictive inventory tracking, triggering instant web dashboard warnings when LPG concentrations exceed safe PPM limits.'

                ]

            },

            {

                title: '<i class="fas fa-shield-alt"></i> Electrical Noise & Power Isolation',

                content: 'Integrated 1000µF decoupling capacitors across the 5V bus to suppress inductive relay coil back-EMF, preventing I2C bus lockups and ensuring continuous ATmega328P stability under motor loads.'

            }

        ],

        notice: '<strong>Deployment Note:</strong> Physical working prototype built with Arduino Uno & sensors. The web dashboard provides an interactive Three.js 3D digital twin and hybrid simulation engine.',

        actions: [

            { label: 'Watch Video Walkthrough', icon: 'fab fa-youtube', href: 'https://youtu.be/pivb5MaotJo', external: true, primary: true },

            { label: 'Live Interactive Preview', icon: 'fas fa-external-link-alt', href: 'https://arpityadav626.github.io/smart-kitchen/', external: true }

        ]

    },

    'chronofact': {

        index: '03 // DIGITAL FORENSIC INVESTIGATION',

        badge: '<span class="badge live-badge"><i class="fas fa-circle"></i> Section 63(4) BSA 2023 Compliant</span>',

        title: 'ChronoFact 2.0 — Multi-Agent Fact-Checking & Forensics Engine',

        subtitle: 'Enterprise-grade judicial forensics and fact-verification platform utilizing Merkle tree cryptographic hashing for tamper-proof timeline indexing and BSA Section 63(4) evidence compliance.',

        image: null,

        imageCaption: null,

        videoEmbed: 'https://www.youtube.com/embed/J8VqyTlGd5w',

        videoCaption: 'Official 3-Minute Video Walkthrough & Spatial-Temporal Alibi Buster Demonstration',

        blocks: [

            {

                title: '<i class="fab fa-youtube" style="color:#ef4444;"></i> Video Demonstration & Shot Breakdown',

                content: 'A comprehensive 3-minute video presentation demonstrating ChronoFact\'s end-to-end statutory investigative workflow, air-gapped forensic hashing, and real-time alibi busting (<a href="https://youtu.be/J8VqyTlGd5w" target="_blank" style="color:var(--accent-primary); font-weight:600; text-decoration:underline;">Watch on YouTube ↗</a>).',

                bullets: [

                    '<strong>[0:00 - 0:40] Judicial Evidentiary Crisis:</strong> Why electronic logs get dismissed in Indian courts under strict Bharatiya Sakshya Adhiniyam standards.',

                    '<strong>[0:40 - 1:20] Sealed Evidence Ledger:</strong> Live demonstration of dual NIST FIPS (SHA-256 + SHA3-512) hashing and Lead Examiner digital attribution.',

                    '<strong>[1:20 - 2:15] Spatial-Temporal Alibi Buster:</strong> Instant multi-stream correlation uncovering a +24.8 km telecom cell-tower conflict against suspect Vikram Malhotra\'s fabricated medical claim.',

                    '<strong>[2:15 - 3:00] BSA 2023 §63(4) Statutory Certificate:</strong> 1-click court certificate generation with Merkle inclusion tree proof and sealed dossier ZIP export.'

                ]

            },

            {

                title: '<i class="fas fa-project-diagram"></i> System Flow & Cryptographic Pipeline',

                diagram: `[INGESTION & DIGITAL LOGS]

├── Server CSVs, WhatsApp Chats, MIME Emails, Telecom CDR Azimuths

        │

        ▼ (Air-Gapped Ingestion Pipeline)

[NIST DUAL-HASH MERKLE LEDGER]

├── Concurrent SHA-256 + SHA3-512 Digests (64KB Chunk Streams)

├── Allen's 13 Temporal Interval Relations (Dual-Clock NTP Drift Calibration)

└── Spatial-Temporal Alibi Buster (+24.8 km Geospatial Conflict Detection)

        │

        ▼ (REST API Caching • 40% Latency Reduction)

[STATUTORY COURT CERTIFICATE GENERATOR]

└── Section 63(4) Bharatiya Sakshya Adhiniyam (BSA) 2023 Tamper-Evident Dossier`

            },

            {

                title: '<i class="fas fa-sliders-h"></i> ATS Quantifiable Engineering Bullets',

                bullets: [

                    '<strong>Developed</strong> a full-stack fact-checking and digital forensics platform using <strong>React, Node.js, and Express</strong>, orchestrating multi-agent verification pipelines to cross-reference claims against trusted sources.',

                    '<strong>Implemented</strong> <strong>Merkle Tree cryptographic hashing</strong> to generate immutable, tamper-evident audit trails for verified timeline events, aligning digital evidence integrity with <strong>BSA (Bharatiya Sakshya Adhiniyam)</strong> legal standards.',

                    '<strong>Optimized</strong> backend <strong>REST API</strong> query indexing and caching strategies, decreasing complex timeline search and verification response times by <strong>40%</strong>.'

                ]

            },

            {

                title: '<i class="fas fa-gavel"></i> Statutory Legal Compliance',

                content: 'Generates court-ready Part A Custodian & Part B Technical Examiner statutory affidavits dynamically, fully replacing legacy Section 65B requirements under Indian Evidence law.'

            }

        ],

        notice: '<strong>Transparency Notice:</strong> Live preview is an interactive simulation preloaded with synthetic benchmark exhibits for forensic demonstration. 100% automated test coverage in Python (<code>test_forensic_integrity.py</code>).',

        actions: [

            { label: 'Watch Video Walkthrough', icon: 'fab fa-youtube', href: 'https://youtu.be/J8VqyTlGd5w', external: true, primary: true },

            { label: 'Live Interactive Preview', icon: 'fas fa-external-link-alt', href: 'https://arpityadav626.github.io/chronofact/', external: true }

        ]

    },

    'ai-hub': {

        index: '04 // FRONTIER AI & MEDIA ECOSYSTEM',

        badge: '<span class="badge live-badge"><i class="fas fa-bolt"></i> 130+ Platforms Indexed</span>',

        title: 'AI Hub — Unified AI Workspace & 3D Media Discovery Suite',

        subtitle: 'Unified React 19 and TypeScript workspace aggregating 130+ global film, music, and book sources with interactive Three.js 3D navigation, an in-app 4K media player, and ambient audio streams.',

        image: null,

        imageCaption: null,

        blocks: [

            {

                title: '<i class="fas fa-bullseye"></i> Vision & Architecture',

                content: 'Engineered as an all-in-one dark aesthetic workspace unifying curated frontier AI tools, instant media streaming, and educational literature synthesis without context-switching or intrusive ads.'

            },

            {

                title: '<i class="fas fa-project-diagram"></i> System Flow & Modules',

                diagram: `[AI HUB WEB APPLICATION: REACT 19 + VITE 8]

├── Curated Intelligence Hub (Frontier LLMs, Image Gen, Agents, Code Synthesizers)

├── 4K Cinema Theater (In-App Modal Streamer & YouTube Player)

├── Live Ambient Audio (Procedural Focus Radio for Deep Work)

└── Project Gutenberg Reader (Classic Literature & Philosophical Prompting)

        │

        ▼ (Automated CI/CD Dual-Cloud Pipeline)

[DEPLOYMENTS]

├── Google Firebase Hosting ──► https://arpit-fun.web.app/

└── GitHub Pages Pipeline   ──► https://arpityadav626.github.io/arpit.fun/`

            },

            {

                title: '<i class="fas fa-sliders-h"></i> ATS Quantifiable Engineering Bullets',

                bullets: [

                    '<strong>Built</strong> a scalable media aggregation and AI workspace application using <strong>React 19, TypeScript, and Tailwind CSS</strong>, indexing <strong>130+ global streaming, music, and literature platforms</strong> under a single unified interface.',

                    '<strong>Engineered</strong> hardware-accelerated <strong>Three.js / WebGL</strong> 3D tool discovery visuals, an embedded 4K theater playback view, and a background ambient radio engine powered by the <strong>Web Audio API</strong>.',

                    '<strong>Configured</strong> <strong>Google Firebase</strong> authentication and cloud data persistence while leveraging React 19 concurrent rendering to maintain smooth <strong>60 FPS</strong> UI transitions across heavy media views.'

                ]

            }

        ],

        notice: '<strong>Live Production:</strong> Fully deployed on Google Firebase Hosting (<code>arpit-fun.web.app</code>) and GitHub Pages with automated CI/CD workflows and SEO sitemap indexing.',

        actions: [

            { label: 'Live App (Google Cloud)', icon: 'fas fa-external-link-alt', href: 'https://arpit-fun.web.app/', external: true, primary: true }

        ]

    },

    'monolith-villa': {

        index: '05 // SPATIAL COMPUTING & 3D ARCHVIZ',

        badge: '<span class="badge live-badge"><i class="fas fa-cube"></i> Live WebGL 3D ArchViz</span>',

        title: 'Monolith Villa — 3D Spatial Digital Twin & Architectural Walkthrough',

        subtitle: 'Photorealistic 3D spatial digital twin of a 14,200 sq.ft luxury villa engineered with scroll-interpolated camera splines, spatial HUD matrix projection, and procedural ambient audio.',

        image: null,

        imageCaption: null,

        blocks: [

            {

                title: '<i class="fas fa-bullseye"></i> Vision & Partnership',

                content: 'Flagship spatial digital twin designed & built by Arpit Yadav for <strong>Apex Intelligence</strong> (Founded by Antriksh, Co-founded by Arpit Yadav). Monolith Villa bridges modern brutalist-minimalist architecture with bleeding-edge web graphics, allowing prospective buyers and architects to tour a 14,200 sq.ft ultra-luxury residence with zero downloads or plug-ins.'

            },

            {

                title: '<i class="fas fa-project-diagram"></i> System Flow & 3D Pipeline',

                diagram: `[MONOLITH VILLA: THREE.JS 0.160 + WEBGL PIPELINE]

├── 480vh Continuous Scroll Timeline (Camera Spline Interpolation & Damping)

├── Interactive Spatial Beacons (3D-to-2D Matrix Projection & Real-Time Tracking)

├── Free Drone Mode (OrbitControls with Pitch/Yaw Clamp & Live GPS HUD Coordinates)

├── Lighting Engine (ACESFilmic Tone Mapping + PCFSoftShadows + PBR Shaders)

└── Procedural Ambient Engine (Web Audio API Synthesizer with Audio Reactive Bars)

        │

        ▼ (Production Edge CI/CD Pipeline)

[DEPLOYMENTS]

└── Vercel High-Performance Edge ──► https://monolith-villa.vercel.app/`

            },

            {

                title: '<i class="fas fa-sliders-h"></i> ATS Quantifiable Engineering Bullets',

                bullets: [

                    '<strong>Engineered</strong> a photorealistic WebGL 3D architectural digital twin powered by <strong>Three.js 0.160</strong> with ACESFilmic Tone Mapping and PCF Soft Shadows calibrated to multi-tier interior and exterior lighting.',

                    '<strong>Constructed</strong> a continuous <strong>480vh scroll-driven camera spline</strong> interpolation matrix across exterior facades, living pavilions, infinity reflection pool, and cantilever suites.',

                    '<strong>Implemented</strong> real-time 3D-to-2D spatial HUD matrix projection beacons with interactive Free Drone Orbit navigation mode and acoustic Web Audio engine.'

                ]

            }

        ],

        notice: '<strong>Sample Project Built by Arpit:</strong> Bespoke architectural digital twin prototype built & engineered by Arpit Yadav for Apex Intelligence (Founded by Antriksh, Co-founded by Arpit Yadav).',

        actions: [

            { label: 'Live 3D Walkthrough', icon: 'fas fa-external-link-alt', href: 'https://monolith-villa.vercel.app/', external: true, primary: true }

        ]

    },

    'monu-egg-center': {

        index: '06 // COMMERCIAL FULL-STACK ARCHITECTURE',

        badge: '<span class="badge live-badge"><i class="fas fa-store"></i> Live Commercial Deployment</span>',

        title: 'Monu Egg Center — Cloud Kitchen, Real-Time Management & Smart QR Suite',

        subtitle: 'Production cloud kitchen digital platform featuring zero-cost serverless architecture (Google Firebase Firestore + Vercel Edge), dynamic dish & gym diet pack managers, an intelligent Google Review rating funnel, and print-ready digital table QR standees.',

        image: 'assets/monu-egg-center-preview.jpg',

        imageCaption: 'Production Storefront, Kitchen Counter & Real-Time Cloud Admin Suite',

        blocks: [

            {

                title: '<i class="fas fa-bullseye"></i> Problem Statement & Business Context',

                content: 'Local food businesses face significant operational friction: high aggregator commission fees, static printed menus that cannot reflect dynamic pricing or ingredient stock availability, difficulty catering to fitness/macro-conscious customers (gym diet packs), and a lack of authentic high-rating Google Reviews due to cumbersome review submission flows.'

            },

            {

                title: '<i class="fas fa-user-cog"></i> System Engineering & Architecture',

                content: 'Engineered an end-to-end cloud kitchen management platform for <strong>Monu Egg Center</strong> (Kanpur, India). Features an instant-loading Tailwind frontend, a password-authenticated administrative portal for live dish toggles and menu updates, and a dual-path smart QR system that automates the Google Review acquisition workflow with pre-composed authentic Hindi testimonials.'

            },

            {

                title: '<i class="fas fa-project-diagram"></i> System Flow & Cloud Architecture',

                diagram: `[PHYSICAL DINING & TAKEAWAY: SMART QR TOUCHPOINTS]

├── Table Acrylic Standee QR ──► https://monu-egg-center.vercel.app/ (Live Digital Menu)

└── Counter Review Standee QR ──► https://monu-egg-center.vercel.app/review.html (Rating Funnel)

        │

        ▼ (Client Web Application • Tailwind CSS + Vanilla ES6+)

[CLOUD KITCHEN DIGITAL ECOSYSTEM]

├── Dynamic Dish Catalog (Category A / B Sorting, Portion Sizing, Badges & Macro Specs)

├── Gym Diet Packs Engine (Egg White Power / Bulking Combos with Protein & Calorie Tracking)

├── Live Operational Controller (Real-Time Kitchen Open/Closed Today Status Interlock)

└── Google Review Smart Funnel:

    ├── 4-5 Stars ──► Auto-loads 1 of 105+ authentic Hindi reviews ──► 1-Click Clipboard Copy ──► Opens Google Maps Listing (!9m1!1b1)

    └── 1-3 Stars ──► Private feedback modal with graceful auto-close (Zero negative public push)

        │

        ▼ (Google Firebase Backend & Edge CI/CD)

[DATA & SECURITY LAYER]

├── Firebase Firestore NoSQL Database (Real-Time Synchronized State & Menu Records)

├── Firebase Authentication (RBAC Protected Admin Panel with Secure Session Tokens)

└── Production Deployment ──► Vercel Edge Network with Automated GitHub CI/CD`

            },

            {

                title: '<i class="fas fa-sliders-h"></i> ATS Quantifiable Engineering Bullets',

                bullets: [

                    '<strong>Architected & deployed</strong> a full-stack commercial cloud kitchen platform using <strong>Google Firebase Firestore, Vanilla JavaScript (ES6+), and Tailwind CSS</strong>, serving dynamic menus and nutritional macro breakdowns with <strong>sub-100ms</strong> query latency.',

                    '<strong>Engineered</strong> a secure role-based administrative dashboard utilizing <strong>Firebase Auth</strong> for instant real-time synchronization of dishes, custom pricing, dietary classifications, and kitchen open/closed operational toggles without redeploying code.',

                    '<strong>Built a smart Google Review conversion funnel</strong> supporting <strong>105+ randomized authentic Hindi testimonials</strong>, 1-click clipboard injection, and conditional rating bifurcation that filters low ratings to private channels while routing 4-5 star reviews directly to the Google Maps business page.',

                    '<strong>Developed print-ready SVG/PNG vector QR standees</strong> and optimized production SEO metadata, sitemaps, and robots.txt, achieving a <strong>100/100 Lighthouse performance and SEO score</strong> on Vercel Edge.'

                ]

            }

        ],

        notice: '<strong>Commercial Client Deployment:</strong> Engineered and deployed into active commercial operation for Monu Egg Center, Kanpur. Proprietary client deployment, live on Vercel with Google Search Console sitemap indexing.',

        actions: [

            { label: 'Live Digital Menu', icon: 'fas fa-external-link-alt', href: 'https://monu-egg-center.vercel.app/', external: true, primary: true },

            { label: 'Table QR Standee', icon: 'fas fa-qrcode', href: 'https://monu-egg-center.vercel.app/table-standee.html', external: true },

            { label: 'Review Funnel', icon: 'fas fa-star', href: 'https://monu-egg-center.vercel.app/review.html', external: true }

        ]

    }

};



const projectModal = document.getElementById('project-modal');

const modalCloseBtn = document.getElementById('modal-close-btn');

const modalDynamicContent = document.getElementById('modal-dynamic-content');



function renderProjectDetails(projectId) {

    const data = projectDetailsData[projectId];

    if (!data || !modalDynamicContent) return;



    let html = `

        <div class="modal-header-tag">

            <span class="modal-project-idx">${data.index}</span>

            ${data.badge}

        </div>

        <h3 class="modal-title">${data.title}</h3>

        <p class="modal-subtitle">${data.subtitle}</p>

    `;



    if (data.videoEmbed) {

        html += `

            <div class="modal-media-frame video-frame">

                <div class="modal-video-container">

                    <iframe src="${data.videoEmbed}" title="${data.title} Demo Video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

                </div>

            </div>

            ${data.videoCaption ? `<div class="modal-video-caption"><i class="fab fa-youtube" style="color:#ef4444;"></i> ${data.videoCaption}</div>` : ''}

        `;

    } else if (data.image) {

        html += `

            <div class="modal-media-frame">

                <img src="${data.image}" alt="${data.title}" class="modal-media-img" loading="lazy">

                ${data.imageCaption ? `<div class="modal-media-caption"><i class="fas fa-microchip"></i> ${data.imageCaption}</div>` : ''}

            </div>

        `;

    }



    html += `<div class="modal-sections-grid">`;

    data.blocks.forEach(block => {

        html += `<div class="modal-block"><h4>${block.title}</h4>`;

        if (block.content) html += `<p>${block.content}</p>`;

        if (block.diagram) html += `<div class="modal-code-diagram"><code>${block.diagram}</code></div>`;

        if (block.bullets) {

            html += `<ul class="modal-bullets">`;

            block.bullets.forEach(b => html += `<li>${b}</li>`);

            html += `</ul>`;

        }

        html += `</div>`;

    });

    html += `</div>`;



    if (data.notice) {

        html += `

            <div class="modal-notice-banner">

                <i class="fas fa-info-circle"></i>

                <div>${data.notice}</div>

            </div>

        `;

    }



    if (data.actions && data.actions.length > 0) {

        html += `<div class="modal-footer-actions">`;

        data.actions.forEach(act => {

            html += `<a href="${act.href}" ${act.external || act.isCert ? 'target="_blank"' : ''} class="card-btn ${act.primary ? 'primary' : 'outline'} sound-hover ripple-btn" style="max-width:240px;"><i class="${act.icon}"></i> ${act.label} ↗</a>`;

        });

        html += `</div>`;

    }



    modalDynamicContent.innerHTML = html;



    // Bind sounds to newly generated elements inside modal

    modalDynamicContent.querySelectorAll('.card-btn').forEach(btn => {

        btn.addEventListener('mouseenter', playButtonHover);

        btn.addEventListener('click', playButtonClick);

    });

}



const projectModalCard = document.querySelector('.project-modal-card');



function openProjectModal(projectId) {

    if (!projectModal) return;

    if (window.lenis) window.lenis.stop();

    renderProjectDetails(projectId);

    projectModal.classList.add('active');

    projectModal.setAttribute('aria-hidden', 'false');

    document.body.classList.add('modal-open');

    document.body.style.overflow = 'hidden';

    if (projectModalCard) projectModalCard.scrollTop = 0;

    const progressBar = document.getElementById('modal-scroll-bar');

    if (progressBar) progressBar.style.setProperty('--modal-scroll-pct', '0%');

    playModalSound(true);

}



function closeProjectModal() {

    if (!projectModal) return;

    if (window.lenis) window.lenis.start();

    projectModal.classList.remove('active');

    projectModal.setAttribute('aria-hidden', 'true');

    document.body.classList.remove('modal-open');

    document.body.style.overflow = '';

    playModalSound(false);

    // Pause any playing iframe

    const iframe = projectModal.querySelector('iframe');

    if (iframe) {

        iframe.src = iframe.src;

    }

}



// Ensure fluid wheel scrolling inside modal card and update reading progress bar

if (projectModalCard) {

    projectModalCard.addEventListener('wheel', (e) => {

        e.stopPropagation();

    }, { passive: true });



    projectModalCard.addEventListener('scroll', () => {

        const total = projectModalCard.scrollHeight - projectModalCard.clientHeight;

        const pct = total > 0 ? (projectModalCard.scrollTop / total) * 100 : 0;

        const progressBar = document.getElementById('modal-scroll-bar');

        if (progressBar) {

            progressBar.style.setProperty('--modal-scroll-pct', `${pct}%`);

        }

    }, { passive: true });

}



// Bind clicks on cards and Details buttons

document.querySelectorAll('.open-modal-btn').forEach(btn => {

    btn.addEventListener('click', (e) => {

        e.stopPropagation();

        const projectId = btn.getAttribute('data-project');

        if (projectId) openProjectModal(projectId);

    });

});



document.querySelectorAll('.project-card').forEach(card => {

    card.addEventListener('click', (e) => {

        if (e.target.closest('a') || e.target.closest('button')) return;

        const projectId = card.getAttribute('data-project');

        if (projectId) openProjectModal(projectId);

    });

});



if (modalCloseBtn) {

    modalCloseBtn.addEventListener('click', closeProjectModal);

}



if (projectModal) {

    projectModal.addEventListener('click', (e) => {

        if (!e.target.closest('#project-modal-card') && !e.target.closest('#modal-close-btn')) {

            closeProjectModal();

        }

    });



    window.addEventListener('keydown', (e) => {

        if (e.key === 'Escape' && projectModal.classList.contains('active')) {

            closeProjectModal();

        }

    });

}



/* ========================================================

   9. PERMANENT STICKY HEADER

   Header stays 100% visible, active, and clickable at ANY scroll position.

   Auto-hide disabled to ensure instant click responsiveness.

======================================================== */



/* ========================================================

   11. LINEAR.APP / VERCEL HIGH-PERFORMANCE SPOTLIGHT TRACKER

   Smooth lerp physics, zero lag, direct GPU property injection

======================================================== */

(function initSpotlight() {

    const spotlight = document.getElementById('spotlight');

    if (!spotlight || !window.matchMedia('(pointer: fine)').matches) return;



    let targetX = window.innerWidth / 2;

    let targetY = window.innerHeight / 2;

    let currentX = targetX;

    let currentY = targetY;

    let isMoving = false;

    let rafId = null;



    function updateSpotlight() {

        // Silky smooth lerp smoothing

        currentX += (targetX - currentX) * 0.1;

        currentY += (targetY - currentY) * 0.1;



        spotlight.style.transform = `translate3d(${currentX - 325}px, ${currentY - 325}px, 0)`;



        if (isMoving) {

            rafId = requestAnimationFrame(updateSpotlight);

        }

    }



    window.addEventListener('pointermove', (e) => {

        targetX = e.clientX;

        targetY = e.clientY;



        if (!isMoving) {

            isMoving = true;

            spotlight.style.opacity = '1';

            rafId = requestAnimationFrame(updateSpotlight);

        }

    }, { passive: true });



    document.addEventListener('mouseleave', () => {

        isMoving = false;

        if (rafId) cancelAnimationFrame(rafId);

        spotlight.style.opacity = '0';

    });



    document.addEventListener('mouseenter', () => {

        spotlight.style.opacity = '1';

    });

})();



/* ========================================================

   12. THEME MODE: PERMANENT LIGHT MODE (Black Mode Removed)

======================================================== */

document.documentElement.setAttribute('data-mode', 'light');

document.body.setAttribute('data-mode', 'light');

try {

    localStorage.removeItem('arpit-theme-mode');

    localStorage.removeItem('arpit-accent-theme');

} catch (e) {}



/* ========================================================

   14. TECH STACK ↔ PROJECT INTERACTIVE HIGHLIGHTING ENGINE

======================================================== */

const skillPills = document.querySelectorAll('.skill-pill[data-skill]');

const projectCards = document.querySelectorAll('.project-card[data-skills]');

const hintElement = document.getElementById('skills-interactive-hint');

const hintText = document.getElementById('hint-text');



let lockedSkill = null;



function formatSkillName(key) {

    const map = {

        'ai': 'Generative AI & LLMs',

        'threejs': 'Three.js / WebGL',

        'web-audio': 'Web Audio API',

        'firebase': 'Google Firebase',

        'typescript': 'TypeScript',

        'ts': 'TypeScript',

        'js': 'JavaScript',

        'html-css': 'HTML5 & CSS3',

        'tailwind': 'Tailwind CSS',

        'react': 'React 19',

        'nodejs': 'Node.js',

        'express': 'Express',

        'esp32': 'ESP32',

        'arduino': 'Arduino',

        'sensors': 'Sensors & Actuators',

        'embedded-c': 'Embedded C',

        'c': 'C',

        'cpp': 'C++',

        'python': 'Python',

        'git': 'Git',

        'github': 'GitHub',

        'vscode': 'VS Code',

        'postman': 'Postman',

        'shaders': 'GLSL Shaders & PBR',

        'vercel': 'Vercel Edge Cloud',

        'rest-api': 'REST APIs',

        'websockets': 'WebSockets',

        'linux': 'Linux',

        'docker': 'Docker',

        'jwt-auth': 'JWT / OAuth',

        'db-security': 'Database Security',

        'merkle': 'Merkle Tree Hashing',

        'iot': 'IoT Telemetry & GSM'

    };

    return map[key] || (key ? key.toUpperCase() : '');

}



function highlightProjectsBySkill(skillKey, isClick = false) {

    if (!skillKey) {

        resetSkillHighlights();

        return;

    }



    let matchCount = 0;

    const matchedTitles = [];

    const matchedCards = [];



    projectCards.forEach(card => {

        const skillsAttr = card.getAttribute('data-skills') || '';

        const isMatch = skillsAttr.split(' ').includes(skillKey);



        if (isMatch) {

            matchCount++;

            matchedCards.push(card);

            card.classList.add('skill-matched');

            card.classList.remove('skill-dimmed');

            const title = card.querySelector('.project-title');

            if (title) matchedTitles.push(title.textContent.trim());



            // Highlight specific tech pills inside matched project card

            card.querySelectorAll('.tech-stack-pills span').forEach(tag => {

                if (tag.getAttribute('data-skill') === skillKey) {

                    tag.classList.add('matched-tech-tag');

                } else {

                    tag.classList.remove('matched-tech-tag');

                }

            });

        } else {

            card.classList.remove('skill-matched');

            card.classList.add('skill-dimmed');

            card.querySelectorAll('.tech-stack-pills span').forEach(tag => tag.classList.remove('matched-tech-tag'));

        }

    });



    // Update active state on skill pill

    skillPills.forEach(pill => {

        if (pill.getAttribute('data-skill') === skillKey) {

            pill.classList.add('active');

        } else {

            pill.classList.remove('active');

        }

    });



    // Update hint feedback bar

    if (hintElement && hintText) {

        hintElement.classList.add('hint-active');

        const formattedName = formatSkillName(skillKey);

        if (matchCount > 0) {

            hintText.innerHTML = `<strong>${formattedName}</strong> is implemented in <strong>${matchCount} Project${matchCount > 1 ? 's' : ''}</strong>: ${matchedTitles.join(', ')} &mdash; ${isClick ? 'Gliding to project...' : 'Click pill to jump!'}`;

        } else {

            hintText.innerHTML = `<strong>${formattedName}</strong> is a core foundation competency.`;

        }

    }



    if (isClick && matchCount > 0) {

        lockedSkill = skillKey;

        playButtonClick();



        // Target the dedicated matched project card directly!

        const targetCard = matchedCards[0];

        if (targetCard) {

            const headerEl = document.querySelector('.header');

            const headerOffset = headerEl ? (headerEl.offsetHeight + 24) : 80;

            smoothScrollToElement(targetCard, -headerOffset);

        } else {

            const pSection = document.getElementById('projects');

            smoothScrollToElement(pSection, -30);

        }



        // Release locked highlight after 5 seconds

        setTimeout(() => {

            if (lockedSkill === skillKey) {

                resetSkillHighlights();

                lockedSkill = null;

            }

        }, 5000);

    }

}



function resetSkillHighlights() {

    if (lockedSkill) return;

    projectCards.forEach(card => {

        card.classList.remove('skill-matched');

        card.classList.remove('skill-dimmed');

        card.querySelectorAll('.tech-stack-pills span').forEach(tag => tag.classList.remove('matched-tech-tag'));

    });

    skillPills.forEach(pill => pill.classList.remove('active'));

    if (hintElement && hintText) {

        hintElement.classList.remove('hint-active');

        hintText.textContent = 'Hover or click any skill to highlight linked projects';

    }

}



skillPills.forEach(pill => {

    const skill = pill.getAttribute('data-skill');



    pill.addEventListener('mouseenter', () => {

        if (!lockedSkill) {

            highlightProjectsBySkill(skill, false);

            playButtonHover();

        }

    });



    pill.addEventListener('mouseleave', () => {

        if (!lockedSkill) {

            resetSkillHighlights();

        }

    });



    pill.addEventListener('click', (e) => {

        e.stopPropagation();

        if (lockedSkill === skill) {

            lockedSkill = null;

            resetSkillHighlights();

        } else {

            highlightProjectsBySkill(skill, true);

        }

    });

});



// Reverse Highlight: Hovering tech pill inside project card highlights corresponding skill pill in skills section!

document.querySelectorAll('.tech-stack-pills span[data-skill]').forEach(tag => {

    const sKey = tag.getAttribute('data-skill');

    tag.addEventListener('mouseenter', () => {

        skillPills.forEach(p => {

            if (p.getAttribute('data-skill') === sKey) {

                p.classList.add('skill-highlighted');

            }

        });

        playButtonHover();

    });

    tag.addEventListener('mouseleave', () => {

        skillPills.forEach(p => p.classList.remove('skill-highlighted'));

    });

    tag.addEventListener('click', (e) => {

        e.stopPropagation();

        const skillsSection = document.getElementById('skills');

        if (skillsSection) {

            smoothScrollToElement(skillsSection, -30);

            playButtonClick();

            highlightProjectsBySkill(sKey, false);

        }

    });

});



/* ======================================================================

   🟢 16. SMOOTH SPRING CARET INPUT ENGINE (Skiper106 Physics)

   Subpixel DOM glyph measurement + Framer-Motion Spring Dynamics

   (Stiffness: 500, Damping: 30, Mass: 0.5)

   ====================================================================== */

class SmoothInputController {

    constructor(inputElement, options = {}) {

        this.input = inputElement;

        this.isTextarea = inputElement.tagName.toLowerCase() === 'textarea';

        this.container = inputElement.closest('.smooth-input-container') || inputElement.parentElement;

        this.measureSpan = this.container ? this.container.querySelector('.smooth-measure-span') : null;

        this.caret = this.container ? this.container.querySelector('.smooth-caret') : null;



        // If it's an email input, ensure selectionStart works in WebKit/Blink

        if (this.input.type === 'email') {

            this.input.type = 'text';

            this.input.inputMode = 'email';

            this.input.autocomplete = 'email';

        }



        // Framer Motion spring parameters from user specification:

        this.stiffness = options.stiffness || 500;

        this.damping = options.damping || 30;

        this.mass = options.mass || 0.5;



        this.currentX = 0;

        this.targetX = 0;

        this.currentY = 0;

        this.targetY = 0;

        this.velocityX = 0;

        this.velocityY = 0;



        this.isMoving = false;

        this.isFocused = false;

        this.lastTime = 0;

        this.rafId = null;

        this.idleTimeout = null;

        this.mirrorDiv = null;



        this.passwordChar = navigator.userAgent.match(/firefox|fxios/i) ? '\u25CF' : '\u2022';



        this.init();

    }



    init() {

        if (!this.container) return;



        if (!this.measureSpan) {

            this.measureSpan = document.createElement('span');

            this.measureSpan.className = 'smooth-measure-span';

            this.measureSpan.setAttribute('aria-hidden', 'true');

            this.container.appendChild(this.measureSpan);

        }

        if (!this.caret) {

            this.caret = document.createElement('div');

            this.caret.className = 'smooth-caret';

            this.caret.setAttribute('aria-hidden', 'true');

            this.container.appendChild(this.caret);

        }



        // Hide native browser caret

        this.input.style.caretColor = 'transparent';



        // Bind events

        this.input.addEventListener('focus', () => this.handleFocus());

        this.input.addEventListener('blur', () => this.handleBlur());

        this.input.addEventListener('input', () => this.handleInput());

        this.input.addEventListener('keydown', (e) => this.handleKeyDown(e));

        this.input.addEventListener('keyup', () => this.handleCursorMove());

        this.input.addEventListener('click', () => this.handleCursorMove());

        this.input.addEventListener('scroll', () => this.handleCursorMove());



        document.addEventListener('selectionchange', () => {

            if (document.activeElement === this.input) {

                this.handleSelectionChange();

            }

        });



        if (document.fonts) {

            document.fonts.ready.then(() => this.syncMeasureStyles());

        }



        if (window.ResizeObserver) {

            const ro = new ResizeObserver(() => {

                if (this.isFocused) this.updateCaretPosition(true);

            });

            ro.observe(this.container);

        }

    }



    syncMeasureStyles() {

        if (!this.input || !this.measureSpan) return;

        const styles = window.getComputedStyle(this.input);

        const isPassword = this.input.type === 'password';

        let fontSize = styles.fontSize;

        if (this.passwordChar === '\u2022' && isPassword && !navigator.userAgent.match(/chrome|chromium|crios/i)) {

            fontSize = `${parseFloat(fontSize) + 6.25}px`;

        }



        this.measureSpan.style.font = `${styles.fontStyle} ${styles.fontWeight} ${fontSize} ${styles.fontFamily}`;

        this.measureSpan.style.letterSpacing = styles.letterSpacing;

        this.measureSpan.style.fontFeatureSettings = styles.fontFeatureSettings;

        this.measureSpan.style.fontVariationSettings = styles.fontVariationSettings;

    }



    measurePrefixWidth(text) {

        this.syncMeasureStyles();

        this.measureSpan.textContent = text;

        const styles = window.getComputedStyle(this.input);

        const paddingLeft = parseFloat(styles.paddingLeft) || 0;

        return text.length > 0 ? (this.measureSpan.offsetWidth + paddingLeft) : (paddingLeft - 1);

    }



    getTextareaCaretCoords() {

        if (!this.mirrorDiv) {

            this.mirrorDiv = document.createElement('div');

            this.mirrorDiv.className = 'smooth-textarea-mirror';

            this.mirrorDiv.style.cssText = 'position:absolute;top:0;left:0;visibility:hidden;pointer-events:none;white-space:pre-wrap;word-wrap:break-word;overflow-wrap:break-word;z-index:-10;opacity:0;';

            document.body.appendChild(this.mirrorDiv);

        }

        const styles = window.getComputedStyle(this.input);

        const mirrorProps = [

            'direction', 'boxSizing', 'width', 'height', 'overflowX', 'overflowY',

            'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',

            'borderStyle', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',

            'fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize',

            'lineHeight', 'fontFamily', 'textAlign', 'textTransform', 'textIndent',

            'letterSpacing', 'wordSpacing', 'tabSize'

        ];

        mirrorProps.forEach(p => {

            this.mirrorDiv.style[p] = styles[p];

        });



        const caretIndex = this.getCaretIndex();

        const textBeforeCaret = this.input.value.substring(0, caretIndex);

        this.mirrorDiv.textContent = textBeforeCaret;

        

        const marker = document.createElement('span');

        marker.textContent = '|';

        this.mirrorDiv.appendChild(marker);



        const caretX = marker.offsetLeft - this.input.scrollLeft;

        const caretY = marker.offsetTop - this.input.scrollTop;



        return { x: caretX, y: caretY };

    }



    scrollCaretIntoView(absoluteWidth) {

        const styles = window.getComputedStyle(this.input);

        const paddingLeft = parseFloat(styles.paddingLeft) || 0;

        const paddingRight = parseFloat(styles.paddingRight) || 0;

        const maxScroll = Math.max(0, this.input.scrollWidth - this.input.clientWidth);

        const visibleRight = this.input.scrollLeft + this.input.clientWidth - paddingRight;

        const visibleLeft = this.input.scrollLeft + paddingLeft;



        if (absoluteWidth > visibleRight) {

            this.input.scrollLeft = Math.min(absoluteWidth - this.input.clientWidth + paddingRight, maxScroll);

        } else if (absoluteWidth < visibleLeft) {

            this.input.scrollLeft = Math.max(0, absoluteWidth - paddingLeft);

        }

    }



    getCaretIndex() {

        let start = 0;

        try {

            start = this.input.selectionStart ?? 0;

            const end = this.input.selectionEnd ?? 0;

            if (start !== end && this.input.selectionDirection === 'backward') {

                return start;

            }

            return end;

        } catch (e) {

            return this.input.value ? this.input.value.length : 0;

        }

    }



    updateCaretPosition(immediate = false) {

        if (!this.isFocused || !this.caret) return;



        let hasSelection = false;

        try {

            const start = this.input.selectionStart;

            const end = this.input.selectionEnd;

            hasSelection = start !== null && end !== null && start !== end;

        } catch (e) {

            hasSelection = false;

        }



        if (hasSelection) {

            this.caret.style.opacity = '0';

            return;

        }



        if (this.isTextarea) {

            const coords = this.getTextareaCaretCoords();

            this.targetX = coords.x;

            this.targetY = coords.y;

        } else {

            const caretIndex = this.getCaretIndex();

            const isPassword = this.input.type === 'password';

            const textBeforeCaret = isPassword 

                ? this.passwordChar.repeat(caretIndex) 

                : this.input.value.slice(0, caretIndex);



            const absoluteWidth = this.measurePrefixWidth(textBeforeCaret);

            if (absoluteWidth === null) return;



            this.scrollCaretIntoView(absoluteWidth);



            const styles = window.getComputedStyle(this.input);

            const paddingLeft = parseFloat(styles.paddingLeft) || 0;

            const paddingRight = parseFloat(styles.paddingRight) || 0;

            const caretPosition = absoluteWidth - this.input.scrollLeft;

            const minX = paddingLeft - 1;

            const maxX = this.input.clientWidth - paddingRight;



            this.targetX = Math.min(Math.max(caretPosition, minX), maxX);

            this.targetY = 0;

        }



        if (immediate) {

            this.currentX = this.targetX;

            this.currentY = this.targetY;

            this.velocityX = 0;

            this.velocityY = 0;

            if (this.isTextarea) {

                this.caret.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;

            } else {

                this.caret.style.transform = `translateY(-50%) translate3d(${this.currentX}px, 0, 0)`;

            }

        }



        this.caret.classList.remove('smooth-caret-idle');

        this.caret.style.opacity = '1';



        clearTimeout(this.idleTimeout);

        this.idleTimeout = setTimeout(() => {

            if (this.isFocused && !hasSelection && this.caret) {

                this.caret.classList.add('smooth-caret-idle');

            }

        }, 500);



        this.startSpring();

    }



    startSpring() {

        if (!this.isMoving) {

            this.isMoving = true;

            this.lastTime = performance.now();

            this.rafId = requestAnimationFrame((t) => this.tick(t));

        }

    }



    tick(time) {

        if (!this.isFocused && Math.abs(this.currentX - this.targetX) < 0.2 && Math.abs(this.currentY - this.targetY) < 0.2) {

            this.isMoving = false;

            return;

        }



        let dt = (time - this.lastTime) / 1000;

        this.lastTime = time;

        if (dt > 0.033) dt = 0.033; // clamp dt to 33ms



        // Second-order differential spring mechanics (X axis)

        const springForceX = -this.stiffness * (this.currentX - this.targetX);

        const dampingForceX = -this.damping * this.velocityX;

        const accelerationX = (springForceX + dampingForceX) / this.mass;



        this.velocityX += accelerationX * dt;

        this.currentX += this.velocityX * dt;



        // Second-order differential spring mechanics (Y axis for textarea)

        if (this.isTextarea) {

            const springForceY = -this.stiffness * (this.currentY - this.targetY);

            const dampingForceY = -this.damping * this.velocityY;

            const accelerationY = (springForceY + dampingForceY) / this.mass;



            this.velocityY += accelerationY * dt;

            this.currentY += this.velocityY * dt;

        }



        if (this.caret) {

            if (this.isTextarea) {

                this.caret.style.transform = `translate3d(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px, 0)`;

            } else {

                this.caret.style.transform = `translateY(-50%) translate3d(${this.currentX.toFixed(2)}px, 0, 0)`;

            }

        }



        const settledX = Math.abs(this.currentX - this.targetX) < 0.15 && Math.abs(this.velocityX) < 0.2;

        const settledY = !this.isTextarea || (Math.abs(this.currentY - this.targetY) < 0.15 && Math.abs(this.velocityY) < 0.2);



        if (settledX && settledY) {

            this.currentX = this.targetX;

            this.currentY = this.targetY;

            this.velocityX = 0;

            this.velocityY = 0;

            if (this.caret) {

                if (this.isTextarea) {

                    this.caret.style.transform = `translate3d(${this.currentX}px, ${this.currentY}px, 0)`;

                } else {

                    this.caret.style.transform = `translateY(-50%) translate3d(${this.currentX}px, 0, 0)`;

                }

            }

            this.isMoving = false;

            return;

        }



        this.rafId = requestAnimationFrame((t) => this.tick(t));

    }



    handleFocus() {

        this.isFocused = true;

        if (this.caret) this.caret.style.opacity = '1';

        this.updateCaretPosition(true);

    }



    handleBlur() {

        this.isFocused = false;

        if (this.caret) {

            this.caret.style.opacity = '0';

            this.caret.classList.remove('smooth-caret-idle');

        }

        clearTimeout(this.idleTimeout);

    }



    handleInput() {

        this.updateCaretPosition();

        if (typeof playSmoothTypingSound === 'function') {

            playSmoothTypingSound();

        }

    }



    handleKeyDown(e) {

        requestAnimationFrame(() => this.updateCaretPosition());

    }



    handleCursorMove() {

        requestAnimationFrame(() => this.updateCaretPosition());

    }



    handleSelectionChange() {

        this.updateCaretPosition();

    }

}



// Global initialization of all Smooth Inputs

const smoothInputInstances = [];

document.querySelectorAll('.smooth-input').forEach(inp => {

    smoothInputInstances.push(new SmoothInputController(inp, { stiffness: 500, damping: 30, mass: 0.5 }));

});



/* ========================================================

   17. SKIPER40 ANIMATED HYPERLINK ENGINE (Cursor.com)

   Directional Underline + Floating Arrow Micro-interactions

======================================================== */

function initSkiperAnimatedLinks() {

    const allLinks = document.querySelectorAll('a');

    allLinks.forEach(link => {

        // Tag regular text hyperlinks with .skiper-link

        if (!link.classList.contains('btn') && 

            !link.classList.contains('card-btn') && 

            !link.classList.contains('social-link') && 

            !link.classList.contains('logo') && 

            !link.classList.contains('menu-toggle') &&

            !link.classList.contains('sound-toggle-btn') &&

            !link.classList.contains('theme-mode-btn')) {

            link.classList.add('skiper-link');

        }



        // Wrap arrow glyphs (↗, ↑, →) in .skiper-arrow for smooth directional glide

        Array.from(link.childNodes).forEach(node => {

            if (node.nodeType === Node.TEXT_NODE && /[↗↑→]/.test(node.textContent)) {

                const tempWrap = document.createElement('span');

                tempWrap.innerHTML = node.textContent.replace(/([↗↑→])/g, '<span class="skiper-arrow">$1</span>');

                node.replaceWith(...tempWrap.childNodes);

            }

        });

    });

}



if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', initSkiperAnimatedLinks);

} else {

    initSkiperAnimatedLinks();

}



/* ========================================================

   18. SKIPER58 TEXT-ROLL KINETIC TYPOGRAPHY ENGINE

   Letter-by-letter Staggered Rolling Text Animation on Hover

======================================================== */

function createTextRollMarkup(text) {

    const chars = Array.from(text);

    const primaryChars = chars.map((ch, i) => {

        const displayChar = ch === ' ' ? '&nbsp;' : ch;

        return `<span class="roll-char" style="--char-idx: ${i}">${displayChar}</span>`;

    }).join('');



    const cloneChars = chars.map((ch, i) => {

        const displayChar = ch === ' ' ? '&nbsp;' : ch;

        return `<span class="roll-char" style="--char-idx: ${i}">${displayChar}</span>`;

    }).join('');



    return `<span class="roll-text" aria-label="${text}">` +

           `<span class="roll-track" aria-hidden="true">` +

           `<span class="roll-row roll-primary">${primaryChars}</span>` +

           `<span class="roll-row roll-clone">${cloneChars}</span>` +

           `</span>` +

           `</span>`;

}



function initSkiper58TextRoll() {

    // 1. Minimal flat navbar links remain pure clean text (Awwwards standard)



    // 3. Hero CTA buttons

    const heroPrimaryBtn = document.querySelector('.hero-actions .btn-primary');

    if (heroPrimaryBtn && !heroPrimaryBtn.dataset.textRolled) {

        heroPrimaryBtn.dataset.textRolled = "true";

        heroPrimaryBtn.innerHTML = createTextRollMarkup('View Projects') + ' <i class="fas fa-arrow-down"></i>';

    }



    const heroOutlineBtn = document.querySelector('.hero-actions .btn-outline');

    if (heroOutlineBtn && !heroOutlineBtn.dataset.textRolled) {

        heroOutlineBtn.dataset.textRolled = "true";

        heroOutlineBtn.setAttribute('href', '#contact');

        heroOutlineBtn.removeAttribute('target');

        heroOutlineBtn.innerHTML = createTextRollMarkup('Get In Touch') + ' <i class="fas fa-arrow-down"></i>';

    }



    // 4. Project Card Primary CTA buttons ("Details")

    document.querySelectorAll('.card-links .card-btn.primary').forEach(btn => {

        if (btn.dataset.textRolled) return;

        btn.dataset.textRolled = "true";

        btn.innerHTML = createTextRollMarkup('Details') + ' <i class="fas fa-expand-alt"></i>';

    });



    // 5. Footer "Back to top"

    const backTop = document.querySelector('.footer-content .back-top');

    if (backTop && !backTop.dataset.textRolled) {

        backTop.dataset.textRolled = "true";

        backTop.innerHTML = createTextRollMarkup('Back to top') + ' <span class="skiper-arrow">↑</span>';

    }



    // 6. Brand Logo "Arpit"

    const logoSpan = document.querySelector('.logo > span:last-child');

    if (logoSpan && !logoSpan.dataset.textRolled) {

        logoSpan.dataset.textRolled = "true";

        logoSpan.innerHTML = createTextRollMarkup('Arpit') + '<span class="logo-accent">.dev</span>';

    }

}



if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', initSkiper58TextRoll);

} else {

    initSkiper58TextRoll();

}



/* ======================================================================

   🟢 20. SKIPER 71: SUBPIXEL SCROLL PROGRESS LINE

   Passive scroll listener updates CSS scaleX (0% GPU impact)

   ====================================================================== */

(function initScrollProgress() {

    const line = document.getElementById('scroll-progress-line');

    if (!line) return;



    let ticking = false;

    function updateProgress() {

        ticking = false;

        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

        if (maxScroll <= 0) {

            line.style.transform = 'scaleX(0)';

            return;

        }

        const current = window.scrollY || window.pageYOffset;

        const progress = Math.min(Math.max(current / maxScroll, 0), 1);

        line.style.transform = `scaleX(${progress})`;

    }



    window.addEventListener('scroll', () => {

        if (!ticking) {

            requestAnimationFrame(updateProgress);

            ticking = true;

        }

    }, { passive: true });



    updateProgress();

})();



/* ======================================================================

   🟢 21. SKIPER 83: ONE-CLICK COPY EMAIL MICRO TOAST

   Native Clipboard API + Mechanical click sound + Sleek bubble

   ====================================================================== */

(function initCopyEmail() {

    function setupCopyBtn(btnId, bubbleId, iconId) {

        const btn = document.getElementById(btnId);

        const bubble = document.getElementById(bubbleId);

        const icon = document.getElementById(iconId);

        if (!btn) return;



        const email = 'arpityadav6794@gmail.com';

        let timeoutId = null;



        btn.addEventListener('click', async (e) => {

            e.preventDefault();

            try {

                await navigator.clipboard.writeText(email);

                if (typeof playButtonClick === 'function') playButtonClick();

                if (bubble) bubble.classList.add('active');

                if (icon) {

                    icon.className = 'fas fa-check';

                    icon.style.color = '#10b981';

                }

                clearTimeout(timeoutId);

                timeoutId = setTimeout(() => {

                    if (bubble) bubble.classList.remove('active');

                    if (icon) {

                        icon.className = 'far fa-copy';

                        icon.style.color = '';

                    }

                }, 2000);

            } catch (err) {

                const input = document.createElement('input');

                input.value = email;

                document.body.appendChild(input);

                input.select();

                document.execCommand('copy');

                document.body.removeChild(input);

                if (bubble) bubble.classList.add('active');

                setTimeout(() => { if (bubble) bubble.classList.remove('active'); }, 2000);

            }

        });

    }



    setupCopyBtn('copy-email-btn', 'copy-toast-bubble', 'copy-email-icon');

    setupCopyBtn('hero-copy-email-btn', 'hero-copy-toast-bubble', 'hero-copy-email-icon');

})();



/* ======================================================================

   🟢 22. SKIPER 48: MAGNETIC SKILL PILLS

   Subtle cursor gravity pull on hover (zero layout shifts)

   ====================================================================== */

(function initMagneticSkills() {

    if (window.matchMedia('(hover: none)').matches) return; // Touch devices skip



    const pills = document.querySelectorAll('.skill-pill');

    pills.forEach(pill => {

        pill.addEventListener('mousemove', (e) => {

            const rect = pill.getBoundingClientRect();

            const x = e.clientX - rect.left - rect.width / 2;

            const y = e.clientY - rect.top - rect.height / 2;

            // Dampened pull strength (max ~4px displacement)

            pill.style.transform = `translate3d(${x * 0.18}px, ${y * 0.18}px, 0)`;

        });



        pill.addEventListener('mouseleave', () => {

            pill.style.transform = 'translate3d(0, 0, 0)';

        });

    });

})();



/* Command Palette (Ctrl+K): Removed */





