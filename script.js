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
   1. STUDIO-GRADE ZERO-GLITCH AUDIO ENGINE (Web Audio API)
   Ultra-Crisp Tactile Feedback, Zero Latency & Dynamic Limiting
======================================================== */
let audioCtx = null;
let masterCompressor = null;
let masterGain = null;
let soundEnabled = true;
let lastHoverTime = 0;
let lastScrollTickTime = 0;

function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();

        // 1. Dynamics Compressor (Limiter) - 100% eliminates distortion & crackling
        masterCompressor = audioCtx.createDynamicsCompressor();
        masterCompressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
        masterCompressor.knee.setValueAtTime(24, audioCtx.currentTime);
        masterCompressor.ratio.setValueAtTime(8, audioCtx.currentTime);
        masterCompressor.attack.setValueAtTime(0.002, audioCtx.currentTime);
        masterCompressor.release.setValueAtTime(0.1, audioCtx.currentTime);

        // 2. Master Gain
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);

        masterCompressor.connect(masterGain);
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Proactively unlock AudioContext on ANY user gesture
function unlockAudio() {
    initAudio();
}
['pointerdown', 'pointermove', 'mousedown', 'wheel', 'touchstart', 'keydown', 'click', 'scroll'].forEach(evt => {
    window.addEventListener(evt, unlockAudio, { once: true, passive: true });
});

// Resilient sound execution helper
function ensureAudio(callback) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
        audioCtx.resume().then(() => {
            if (callback) callback(audioCtx.currentTime);
        }).catch(() => {});
    } else {
        if (callback) callback(audioCtx.currentTime);
    }
}

// Sound 1: Soft Button Hover (Ultra-crisp tactile micro-tick)
function playButtonHover() {
    const now = performance.now();
    if (now - lastHoverTime < 45) return;
    lastHoverTime = now;

    ensureAudio(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1600, t);
        filter.Q.setValueAtTime(2.5, t);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1400, t);
        osc.frequency.exponentialRampToValueAtTime(450, t + 0.02);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.09, t + 0.002);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterCompressor);

        osc.start(t);
        osc.stop(t + 0.02);
    });
}

// Sound 2: Deep Warm Card Hover (Acoustic marimba / soft wooden thud)
function playCardHover() {
    const now = performance.now();
    if (now - lastHoverTime < 60) return;
    lastHoverTime = now;

    ensureAudio(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(700, t);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, t);
        osc.frequency.exponentialRampToValueAtTime(140, t + 0.045);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.11, t + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterCompressor);

        osc.start(t);
        osc.stop(t + 0.045);
    });
}

// Sound 3: Mechanical Haptic Button Click (Satisfying tactile dual-stage switch)
function playButtonClick() {
    ensureAudio(t => {
        // High click transient
        const oscClick = audioCtx.createOscillator();
        const gainClick = audioCtx.createGain();
        oscClick.type = 'triangle';
        oscClick.frequency.setValueAtTime(1050, t);
        oscClick.frequency.exponentialRampToValueAtTime(280, t + 0.035);

        gainClick.gain.setValueAtTime(0.0001, t);
        gainClick.gain.linearRampToValueAtTime(0.15, t + 0.002);
        gainClick.gain.exponentialRampToValueAtTime(0.0001, t + 0.035);

        oscClick.connect(gainClick);
        gainClick.connect(masterCompressor);
        oscClick.start(t);
        oscClick.stop(t + 0.035);

        // Warm resonant body
        const oscBody = audioCtx.createOscillator();
        const gainBody = audioCtx.createGain();
        oscBody.type = 'sine';
        oscBody.frequency.setValueAtTime(210, t);
        oscBody.frequency.exponentialRampToValueAtTime(80, t + 0.05);

        gainBody.gain.setValueAtTime(0.0001, t);
        gainBody.gain.linearRampToValueAtTime(0.12, t + 0.003);
        gainBody.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

        oscBody.connect(gainBody);
        gainBody.connect(masterCompressor);
        oscBody.start(t);
        oscBody.stop(t + 0.05);
    });
}

// Sound 4: Liquid Bubble Tone (For Navigation links)
function playNavClick() {
    ensureAudio(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(520, t);
        osc.frequency.exponentialRampToValueAtTime(820, t + 0.045);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);

        osc.connect(gain);
        gain.connect(masterCompressor);

        osc.start(t);
        osc.stop(t + 0.045);
    });
}

// Sound 5: Minimal Precision Scroll Ratchet Tick
function playScrollTick() {
    const now = performance.now();
    if (now - lastScrollTickTime < 130) return;
    lastScrollTickTime = now;

    ensureAudio(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'highpass';
        filter.frequency.setValueAtTime(1200, t);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500, t);
        osc.frequency.exponentialRampToValueAtTime(550, t + 0.014);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.05, t + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.014);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterCompressor);

        osc.start(t);
        osc.stop(t + 0.014);
    });
}

// Sound 5b: Subtle Mechanical Keyclick Tick
function playKeyTick() {
    ensureAudio(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1600, t);
        osc.frequency.exponentialRampToValueAtTime(750, t + 0.012);
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.04, t + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.012);
        osc.connect(gain);
        gain.connect(masterCompressor);
        osc.start(t);
        osc.stop(t + 0.012);
    });
}

// Sound 5c: Studio-Grade Mechanical Linear Switch Click (For Smooth Input Typing)
let lastTypingTime = 0;
function playSmoothTypingSound() {
    const now = performance.now();
    if (now - lastTypingTime < 30) return;
    lastTypingTime = now;
    ensureAudio(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1300 + (Math.random() * 350), t);
        filter.Q.setValueAtTime(3.2, t);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(900 + (Math.random() * 200), t);
        osc.frequency.exponentialRampToValueAtTime(180, t + 0.016);

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.065, t + 0.001);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.016);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(masterCompressor);

        osc.start(t);
        osc.stop(t + 0.016);
    });
}

// Sound 6: Modal State Transition Sound
function playModalSound(isOpen) {
    ensureAudio(t => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        if (isOpen) {
            osc.frequency.setValueAtTime(320, t);
            osc.frequency.exponentialRampToValueAtTime(680, t + 0.08);
        } else {
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(260, t + 0.07);
        }

        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.linearRampToValueAtTime(0.11, t + 0.003);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + (isOpen ? 0.08 : 0.07));

        osc.connect(gain);
        gain.connect(masterCompressor);

        osc.start(t);
        osc.stop(t + (isOpen ? 0.08 : 0.07));
    });
}

// Sound 7: Crystalline Melodic Welcome Chime
function playCozyChime() {
    ensureAudio(t => {
        const chords = [523.25, 659.25, 783.99]; // C5, E5, G5 Major Chord
        chords.forEach((freq, idx) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, t + idx * 0.07);

            gain.gain.setValueAtTime(0.0001, t + idx * 0.07);
            gain.gain.linearRampToValueAtTime(0.08, t + idx * 0.07 + 0.008);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.07 + 0.45);

            osc.connect(gain);
            gain.connect(masterCompressor);

            osc.start(t + idx * 0.07);
            osc.stop(t + idx * 0.07 + 0.45);
        });
    });
}

// Sound Toggle Handler
const soundBtn = document.getElementById('sound-btn');
const soundIcon = document.getElementById('sound-icon');
const soundText = document.getElementById('sound-text');

if (soundBtn) {
    soundBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        soundEnabled = !soundEnabled;
        if (soundEnabled) {
            soundIcon.className = 'fas fa-volume-up';
            soundText.textContent = 'COZY SFX';
            playButtonClick();
        } else {
            soundIcon.className = 'fas fa-volume-mute';
            soundText.textContent = 'SFX MUTED';
        }
    });
}

// Smart Glitch-Free Event Bindings
function bindSounds() {
    // 1. Project Cards
    document.querySelectorAll('.project-card').forEach(card => {
        card.addEventListener('mouseenter', playCardHover);
    });

    // 2. Buttons & Actions
    document.querySelectorAll('.btn, .card-btn, .btn-pill').forEach(btn => {
        btn.addEventListener('mouseenter', playButtonHover);
        btn.addEventListener('click', playButtonClick);
    });

    // 3. Navigation Links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('mouseenter', playButtonHover);
        link.addEventListener('click', playNavClick);
    });

    // 4. Skills & Socials
    document.querySelectorAll('.skill-pill, .social-link, .sound-hover:not(.nav-link):not(.btn):not(.card-btn)').forEach(item => {
        item.addEventListener('mouseenter', playButtonHover);
        item.addEventListener('click', playButtonClick);
    });
}
bindSounds();

/* ========================================================
   2. SKIPER8 WORDS PRELOADER (Dennis Snellenberg Inspired)
   Multilingual Greetings Cycle with Organic Liquid SVG Curtain
======================================================== */
function initWordsPreloader() {
    const preloader = document.getElementById('preloader');
    const wordEl = document.getElementById('preloader-word');
    const curvePath = document.getElementById('preloader-curve-path');
    if (!preloader || !wordEl) return;

    const words = [
        "Hello",          // English
        "Bonjour",        // French
        "Ciao",           // Italian
        "Olà",            // Portuguese
        "やあ",           // Japanese
        "Hallå",          // Swedish
        "Guten Tag",      // German
        "Hallo",          // Dutch
        "Namaste"         // Hindi
    ];

    let currentIndex = 0;
    const wordIntervalTime = 180; // ms per word

    // Prevent background scrolling while preloader is active
    document.body.style.overflow = 'hidden';

    function showNextWord() {
        if (currentIndex < words.length - 1) {
            currentIndex++;
            wordEl.classList.add('word-switching');

            setTimeout(() => {
                wordEl.innerHTML = words[currentIndex];
                wordEl.classList.remove('word-switching');
            }, 65);

            // If we reached the final word, hold briefly then smoothly peel up the curtain!
            if (currentIndex === words.length - 1) {
                setTimeout(startExitAnimation, 380);
            } else {
                setTimeout(showNextWord, wordIntervalTime);
            }
        }
    }

    function startExitAnimation() {
        if (!curvePath) {
            preloader.classList.add('preloader-exiting');
            setTimeout(finishPreloader, 850);
            return;
        }

        const startTime = performance.now();
        const duration = 850; // matches CSS transition duration

        function stepCurve(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Dennis Snellenberg curve morphing:
            // First 35%: curve pulls down into an organic liquid arch
            // Next 65%: curve flattens seamlessly to 0 as preloader slides off
            let curveY;
            if (progress < 0.35) {
                curveY = 100 + (progress / 0.35) * 25;
            } else {
                const t = (progress - 0.35) / 0.65;
                curveY = 125 * Math.pow(1 - t, 2.2);
            }

            curvePath.setAttribute('d', `M0 0 L100 0 Q50 ${curveY.toFixed(1)} 0 0 Z`);

            if (progress < 1) {
                requestAnimationFrame(stepCurve);
            } else {
                finishPreloader();
            }
        }

        preloader.classList.add('preloader-exiting');
        requestAnimationFrame(stepCurve);

        // Play chime audio as curtain begins to lift
        setTimeout(() => {
            if (typeof playCozyChime === 'function') {
                playCozyChime();
            }
        }, 220);
    }

    function finishPreloader() {
        document.body.style.overflow = '';
        preloader.style.display = 'none';

        // Trigger Hero Section active cascade
        const hero = document.getElementById('home');
        if (hero) hero.classList.add('active');
    }

    // Start words flipping after initial short pause
    setTimeout(showNextWord, wordIntervalTime);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWordsPreloader);
} else {
    initWordsPreloader();
}

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
   3. SCROLL REVEAL ANIMATIONS (Intersection Observer)
======================================================== */
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.15
});

revealElements.forEach(el => revealObserver.observe(el));


/* ========================================================
   5. 3D TILT EFFECT & SKIPER 90 GRADIENT HOVER ON CARDS
======================================================== */
document.querySelectorAll('.project-card').forEach(card => {
    // Bulletproof: ensure gradient and inner backdrop elements exist
    if (!card.querySelector('.card-gradient-glow')) {
        const glow = document.createElement('div');
        glow.className = 'card-gradient-glow';
        glow.setAttribute('aria-hidden', 'true');
        card.prepend(glow);
    }
    if (!card.querySelector('.card-inner-backdrop')) {
        const backdrop = document.createElement('div');
        backdrop.className = 'card-inner-backdrop';
        backdrop.setAttribute('aria-hidden', 'true');
        card.insertBefore(backdrop, card.children[1] || null);
    }

    const updateGlowAndTilt = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Update mouse-following gradient coordinates
        card.style.setProperty('--gx', `${x.toFixed(1)}px`);
        card.style.setProperty('--gy', `${y.toFixed(1)}px`);

        if (card.classList.contains('tilt-card')) {
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -5;
            const rotateY = ((x - centerX) / centerX) * 5;
            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px)`;
        }
    };

    card.addEventListener('mouseenter', (e) => {
        updateGlowAndTilt(e);
    });

    card.addEventListener('mousemove', (e) => {
        updateGlowAndTilt(e);
    });

    card.addEventListener('mouseleave', () => {
        if (card.classList.contains('tilt-card')) {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        }
    });
});

/* ========================================================
   6. MOBILE NAVIGATION
======================================================== */
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
        title: 'Smart Rider: Smart Safety Helmet & Ignition Interlock',
        subtitle: 'An IoT dual-unit accident prevention system designed to enforce pre-ride helmet use, detect alcohol impairment, and dispatch automated cellular emergency alerts upon crash impact.',
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
                diagram: `[HELMET SENSING UNIT: ESP32]
├── FSR (Force Sensitive Resistor - Helmet Worn Detection)
├── MQ-3 (Analog Alcohol Concentration Sampling)
└── MPU6050 (6-Axis Inertial Impact & Tilt Detection)
        │
        ▼ (433 MHz RF Wireless Packet)
[BIKE CONTROLLER UNIT: ESP32]
├── Pre-Ride Verification ──► Ignition Interlock Relay (Engine Start Enable)
└── Impact Event Detected ──► Buzzer Alert Window ──► GPS Coordinates + Cellular Emergency SMS`
            },
            {
                title: '<i class="fas fa-sliders-h"></i> Key Engineering Decisions',
                bullets: [
                    '<strong>Edge-First Processing:</strong> Core start interlock decisions run entirely on local ESP32 microcontrollers—zero dependency on internet connectivity for fundamental rider safety.',
                    '<strong>False-Alert Reset Window:</strong> Dropped helmets or rough road potholes trigger a staged audible buzzer countdown, allowing the rider to manually cancel false emergency calls before cellular SMS dispatch.',
                    '<strong>Participation Certificate:</strong> Evaluated and verified at SIH 2026 Internal Hackathon on 25/08/2026.'
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
        title: 'FLAMEGUARD (SAFETY-FI 96X): Autonomous Kitchen IoT Safety Platform',
        subtitle: 'An industrial-grade embedded hazard mitigation platform engineered to prevent catastrophic kitchen accidents from LPG gas leaks and combustion fires via autonomous physical actuation.',
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
                title: '<i class="fas fa-bullseye"></i> Problem Statement',
                content: 'Undetected LPG gas leaks and unattended cooking fires result in severe explosions and domestic damage. Typical standalone alarms beep passively without triggering physical ventilation or automated suppression.'
            },
            {
                title: '<i class="fas fa-user-cog"></i> My Contribution & Role',
                content: 'Served as <strong>Lead Embedded Hardware & Systems Engineer</strong>. Engineered the complete working physical model: assembled the Arduino Uno circuit with isolated 5V relays, wrote deterministic C++ firmware (<code>smart_kitchen.ino</code>), developed the asynchronous Python serial telemetry server (<code>app.py</code>), and created the Three.js 3D digital twin dashboard.'
            },
            {
                title: '<i class="fas fa-cogs"></i> Firmware & Telemetry Architecture',
                bullets: [
                    '<strong>5-Second One-Shot Flame Timer:</strong> Optical IR flame detection activates the water pump relay and acoustic alarm for exactly 5,000 ms before deterministic auto shut-off.',
                    '<strong>Safety Interlock Engine:</strong> During a fire emergency, exhaust ventilation is strictly forced OFF to avoid pulling fresh oxygen into the fire and feeding combustion.',
                    '<strong>Calibrated Gas Threshold (600 ADC):</strong> Tuned the MQ-2 hydrocarbon trigger to 600 ADC units, eliminating ambient indoor drift while reacting instantly to butane/LPG concentrations.',
                    '<strong>Reentrant Lock Concurrency (<code>threading.RLock</code>):</strong> Eliminated server thread starvation in Python, allowing continuous 9600-Baud USB serial polling and REST API requests concurrently.',
                    '<strong>IoT Cloud Email Sentinel:</strong> Dispatches real-time emergency hazard notifications and system diagnostics directly to user\'s smartphone via Formspree API without fragile GSM hardware dependencies.',
                    '<strong>Three.js 3D Digital Twin:</strong> Client-side 3D cooktop rendering with dynamic particle fluids, electric blue (<code>#38BDF8</code>) gas alert lighting, and live hardware register telemetry.'
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
            { label: 'Live Interactive Preview', icon: 'fas fa-external-link-alt', href: 'https://arpityadav626.github.io/smart-kitchen/', external: true },
            { label: 'GitHub Repository', icon: 'fab fa-github', href: 'https://github.com/arpityadav626/smart-kitchen', external: true }
        ]
    },
    'chronofact': {
        index: '03 // DIGITAL FORENSIC INVESTIGATION',
        badge: '<span class="badge live-badge"><i class="fas fa-circle"></i> Section 63(4) BSA 2023 Compliant</span>',
        title: 'CHRONOFACT 2.0: Digital Forensic Investigation Workbench',
        subtitle: 'An enterprise-grade forensic investigation platform engineered for cybercrime units, forensic examiners, and judicial officers under Section 63(4) of Bharatiya Sakshya Adhiniyam, 2023.',
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
                title: '<i class="fas fa-bullseye"></i> Problem Statement',
                content: 'Modern cybercrime investigations handle disparate non-standardized digital logs (server CSVs, WhatsApp chats, MIME emails, cellular tower CDR azimuths). In court trials, standard Large Language Models hallucinate timestamps and invent citations, breaching statutory evidentiary admissibility rules.'
            },
            {
                title: '<i class="fas fa-user-cog"></i> My Contribution & Role',
                content: 'Served as <strong>Hackathon Project Lead and System Architect</strong>. Architected the cryptographic dual-hash Merkle tree engine, Allen\'s temporal interval algebra, zero-hallucination mechanical citation verifier, and Section 63(4) BSA statutory certificate generator.'
            },
            {
                title: '<i class="fas fa-cogs"></i> Core Algorithmic Engines',
                bullets: [
                    '<strong>Dual-Hash & Merkle Engine:</strong> Computes concurrent NIST FIPS 180-4 SHA-256 and FIPS 202 SHA3-256 digests over 64KB streams with 1-bit tamper interception via <code>ForensicIntegrityViolationError</code>.',
                    '<strong>Allen\'s Temporal Interval Algebra:</strong> Implements James Allen\'s 13 interval relations with dual-clock NTP drift calibration (<code>[t_min, t_max]</code>).',
                    '<strong>Inconsistency Radar:</strong> Automatically detects geospatial velocity impossibilities (e.g. 496 km/h Noida-to-Delhi movement in 3 minutes) while generating 4 benign alternative hypotheses to prevent confirmation bias.',
                    '<strong>Mechanical Citation Gate:</strong> Grounds every finding in exact byte spans <code>(byte_start, byte_end)</code>. Unsubstantiated prompts are rejected with a strict 0.0% Grounding Score.'
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
            { label: 'Live Interactive Preview', icon: 'fas fa-external-link-alt', href: 'https://arpityadav626.github.io/chronofact/', external: true },
            { label: 'GitHub Repository', icon: 'fab fa-github', href: 'https://github.com/arpityadav626/chronofact', external: true }
        ]
    },
    'portfolio': {
        index: '04 // PERSONAL ARCHITECTURE',
        badge: '<span class="badge live-badge"><i class="fas fa-star"></i> Semantic Web & Audio Synthesis</span>',
        title: 'Developer Portfolio: Semantic Architecture & Web Audio',
        subtitle: 'A high-performance personal developer portfolio crafted with pure semantic HTML5, modern CSS3, and procedural Web Audio API frequency synthesis.',
        image: null,
        imageCaption: null,
        blocks: [
            {
                title: '<i class="fas fa-bullseye"></i> Engineering Objectives',
                content: 'Built from scratch without heavy frameworks to deliver instantaneous sub-second load times, accessible semantic structure, and immersive haptic audio micro-interactions.'
            },
            {
                title: '<i class="fas fa-volume-up"></i> Studio-Grade Procedural Audio Engine',
                bullets: [
                    '<strong>Zero External Audio Files:</strong> 100% procedurally synthesized in JavaScript using the Web Audio API (<code>AudioContext</code>).',
                    '<strong>Dynamics Compressor Limiter:</strong> Eliminates audio clipping, distortion, and loud pops with a custom brickwall compressor envelope.',
                    '<strong>Non-Blocking Envelopes:</strong> Micro-air clicks, acoustic marimba card thuds, and crystalline chime chords synthesized with zero main-thread lag.',
                    '<strong>Accessible SFX Toggle:</strong> Opt-in cozy sound with a persistent mute button in the header.'
                ]
            },
            {
                title: '<i class="fas fa-mobile-alt"></i> Performance & Interaction',
                bullets: [
                    '<strong>Zero-Dependency Modal Engine:</strong> Lightweight dialog popup with fluid scaling and keyboard escape support.',
                    '<strong>Physics-Based 3D Tilt:</strong> Smooth perspective transform tracking cursor movement across cards.',
                    '<strong>Formspree AJAX Delivery:</strong> Seamless async contact form dispatch with inline visual feedback.'
                ]
            }
        ],
        notice: '<strong>Stack:</strong> Semantic HTML5, CSS3 Custom Properties, Vanilla JavaScript (ES6+), Web Audio API, Firebase Hosting & GitHub Pages.',
        actions: [
            { label: 'GitHub Repository', icon: 'fab fa-github', href: 'https://github.com/arpityadav626/arpityadav626.github.io', external: true, primary: true }
        ]
    },
    'ai-hub': {
        index: '05 // FRONTIER AI & MEDIA ECOSYSTEM',
        badge: '<span class="badge live-badge"><i class="fas fa-bolt"></i> Live on Google Cloud &amp; GitHub</span>',
        title: 'AI Hub ✲ Minimalist AI Intelligence & Media Suite',
        subtitle: 'A high-speed, dark obsidian AI tools ecosystem with 3D discovery cards, in-app 4K cinema theater, ambient lofi radio, and Project Gutenberg literature intelligence.',
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
                title: '<i class="fas fa-laptop-code"></i> Engineering Highlights',
                bullets: [
                    '<strong>React 19 & Vite 8 Core:</strong> Built on modern React with zero build latency, sub-second HMR, and ultra-optimized chunk compression.',
                    '<strong>Dark Obsidian Motion Design:</strong> Tailwind CSS styling with cyan/violet atmospheric glows, dynamic search filtering, and zero-flicker glassmorphic surfaces.',
                    '<strong>Global Streaming Omniverse (54+ Platforms):</strong> Comprehensive film & video directory indexing Free/FAST, Global Premium, Arthouse, Anime, Indian Cinema, and Public Archives with 1-click deep search dispatch.',
                    '<strong>Global Audio Omniverse (38+ Networks):</strong> Multi-platform audio discovery across Hi-Res FLAC, Indie hubs, 3D interactive radio (Radio Garden), and 24/7 in-app ambient live streams.',
                    '<strong>Global Books Omniverse (42+ Platforms):</strong> Federated literature search indexing Free Public Domain, Kindle, Google Books, Library networks (Libby/Hoopla), DOAB, and Goodreads with in-app reader.',
                    '<strong>Cloud CDN Deployment:</strong> Multi-target automated CI/CD pipeline deploying to Google Firebase Hosting and GitHub Pages simultaneously.'
                ]
            }
        ],
        notice: '<strong>Live Production:</strong> Fully deployed on Google Firebase Hosting (<code>arpit-fun.web.app</code>) and GitHub Pages with automated CI/CD workflows and SEO sitemap indexing.',
        actions: [
            { label: 'Live App (Google Cloud)', icon: 'fas fa-external-link-alt', href: 'https://arpit-fun.web.app/', external: true, primary: true },
            { label: 'GitHub Repository', icon: 'fab fa-github', href: 'https://github.com/arpityadav626/arpit.fun', external: true }
        ]
    },
    'monolith-villa': {
        index: '06 // SPATIAL COMPUTING & 3D ARCHVIZ',
        badge: '<span class="badge live-badge"><i class="fas fa-cube"></i> Live Sample Project &bull; Built by Arpit</span>',
        title: 'Monolith Villa ⬡ Bespoke 3D Architectural Walkthrough',
        subtitle: 'A sample photorealistic WebGL 3D architectural virtual residence built & engineered by Arpit Yadav for Apex Intelligence (Founded by Antriksh, Co-founded by Arpit Yadav) featuring scroll-driven camera interpolation, spatial HUD beacons, and ambient acoustic soundscapes.',
        image: null,
        imageCaption: null,
        blocks: [
            {
                title: '<i class="fas fa-bullseye"></i> Vision & Partnership',
                content: 'Sample showcase project designed & built by Arpit Yadav as a flagship spatial digital twin and luxury virtual showcase for <strong>Apex Intelligence</strong> (Founded by Antriksh, Co-founded by Arpit Yadav). Monolith Villa bridges modern brutalist-minimalist architecture with bleeding-edge web graphics, allowing prospective buyers and architects to tour a 14,200 sq.ft ultra-luxury residence with zero downloads or plug-ins.'
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
                title: '<i class="fas fa-laptop-code"></i> Engineering Highlights',
                bullets: [
                    '<strong>Photorealistic WebGL Rendering:</strong> Powered by Three.js 0.160 with ACESFilmic Tone Mapping (1.6 exposure) and PCF Soft Shadows calibrated to multi-tier interior and exterior lighting.',
                    '<strong>480vh Scroll-Driven Cinematic Camera:</strong> Continuous scroll timeline driving smooth camera coordinates across exterior facades, living pavilions, infinity reflection pool, and upper cantilever suites.',
                    '<strong>Interactive Spatial HUD & Drone Mode:</strong> Custom 3D vector-projected beacons tracking real-time architectural details, complete with a toggleable Free Drone Orbit mode and live coordinate telemetry.',
                    '<strong>Atmospheric Ambient Soundscape:</strong> Custom Web Audio API ambient engine with responsive audio visualizer bars, creating an acoustic sensory experience.',
                    '<strong>Lusion Spotlight & Glassmorphism:</strong> Dynamic mouse-tracked spotlight shader effects, ambient glow orbs, and bespoke luxury typography.'
                ]
            }
        ],
        notice: '<strong>Sample Project Built by Arpit:</strong> Bespoke architectural digital twin prototype built & engineered by Arpit Yadav for Apex Intelligence (Founded by Antriksh, Co-founded by Arpit Yadav).',
        actions: [
            { label: 'Live 3D Walkthrough', icon: 'fas fa-external-link-alt', href: 'https://monolith-villa.vercel.app/', external: true, primary: true }
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
   9. SMART AUTO-HIDE HEADER & SCROLL HAPTIC TICK
   Hides on scroll down to clear view, reveals on scroll up
======================================================== */
let lastScrollY = window.scrollY;
let scrollTickAccumulator = 0;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    const delta = Math.abs(currentScrollY - lastScrollY);
    scrollTickAccumulator += delta;

    if (scrollTickAccumulator > 240) {
        playScrollTick();
        scrollTickAccumulator = 0;
    }

    if (header) {
        if (currentScrollY > 120) {
            if (currentScrollY > lastScrollY + 8) {
                // Scrolling down -> hide navbar
                header.classList.add('header-hidden');
            } else if (currentScrollY < lastScrollY - 8) {
                // Scrolling up -> reveal navbar
                header.classList.remove('header-hidden');
            }
        } else {
            // Near top -> always visible
            header.classList.remove('header-hidden');
        }
    }
    lastScrollY = currentScrollY;
}, { passive: true });

/* ========================================================
   10. RELIABLE NATIVE SMOOTH SCROLL & ANCHOR GLIDE
   Uses native browser scrolling with zero lockups on any device
======================================================== */
function smoothScrollToElement(targetEl, offset = -30) {
    if (!targetEl) return;
    const scrollY = window.pageYOffset !== undefined ? window.pageYOffset : (document.documentElement || document.body.parentNode || document.body).scrollTop;
    const top = targetEl.getBoundingClientRect().top + scrollY + offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
}

// Smooth anchor link gliding
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const targetId = this.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                smoothScrollToElement(targetEl, -30);
            }
        }
    });
});

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
   12. LUXURY MONOCHROME (DARK / LIGHT) & SKIPER26 VIEW TRANSITIONS
   Ultra-clean Black & White aesthetic with circular ripple transition
======================================================== */
const themeModeBtn = document.getElementById('theme-mode-btn');
const themeModeIcon = document.getElementById('theme-mode-icon');

function executeViewTransition(changeFn, clickEvent) {
    if (!document.startViewTransition || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        changeFn();
        return;
    }

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (clickEvent) {
        if (clickEvent.clientX !== undefined && clickEvent.clientY !== undefined) {
            x = clickEvent.clientX;
            y = clickEvent.clientY;
        } else if (clickEvent.target) {
            const rect = clickEvent.target.getBoundingClientRect();
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
        }
    }

    const maxRadius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
    );

    const transition = document.startViewTransition(() => {
        changeFn();
    });

    transition.ready.then(() => {
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`
                ]
            },
            {
                duration: 650,
                easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );
    });
}

function setDisplayMode(mode) {
    const isLight = mode === 'light';
    const modeVal = isLight ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', modeVal);
    document.body.setAttribute('data-mode', modeVal);
    localStorage.setItem('arpit-theme-mode', modeVal);

    if (themeModeIcon) {
        themeModeIcon.className = isLight ? 'fas fa-moon' : 'fas fa-sun';
    }

    if (typeof window.updateHeroLiquidTheme === 'function') {
        window.updateHeroLiquidTheme();
    }
}

// Clean up legacy multi-color accent keys and enforce luxury monochrome
try {
    localStorage.removeItem('arpit-accent-theme');
    document.body.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-theme');
} catch (e) {}

// Restore saved mode on initial load (default: dark)
const savedMode = localStorage.getItem('arpit-theme-mode') || 'dark';
setDisplayMode(savedMode);

// Event Listener for Theme Mode Toggle
if (themeModeBtn) {
    themeModeBtn.addEventListener('click', (e) => {
        const currentMode = document.body.getAttribute('data-mode') || 'dark';
        const nextMode = currentMode === 'light' ? 'dark' : 'light';
        playButtonClick();
        executeViewTransition(() => setDisplayMode(nextMode), e);
    });
}

/* ========================================================
   13. HERO LIQUID SIMULATION ENGINE (Skiper12 WebGL Fluid Dynamics)
   Crystal-Clear Water Refraction & Specular Highlights
   Strictly runs in Black (Dark) Mode; 100% disabled in Light Mode
   Idle state: Completely calm and still ("still pe still rehta hai")
======================================================== */
function initHeroLiquidSimulation() {
    const container = document.getElementById('hero-liquid-backdrop');
    const canvas = document.getElementById('hero-liquid-canvas');
    if (!container || !canvas || !window.THREE) return;

    // Check WebGL availability
    try {
        const testCanvas = document.createElement('canvas');
        const testGl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
        if (!testGl) return;
    } catch (e) {
        return;
    }

    const scene = new THREE.Scene();
    const simScene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true,
        alpha: true,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance"
    });

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let rect = container.getBoundingClientRect();
    let width = Math.max(Math.floor(rect.width), 300);
    let height = Math.max(Math.floor(rect.height), 280);

    renderer.setPixelRatio(dpr);
    renderer.setSize(width, height);

    let W = Math.floor(width * dpr);
    let H = Math.floor(height * dpr);

    let targetType = THREE.FloatType;
    const gl = renderer.getContext();
    if (!gl.getExtension('OES_texture_float') && !gl.getExtension('EXT_color_buffer_float')) {
        targetType = THREE.HalfFloatType;
    }

    const renderTargetParams = {
        format: THREE.RGBAFormat,
        type: targetType,
        minFilter: THREE.NearestFilter,
        magFilter: THREE.NearestFilter,
        stencilBuffer: false,
        depthBuffer: false
    };

    let targetA = new THREE.WebGLRenderTarget(W, H, renderTargetParams);
    let targetB = new THREE.WebGLRenderTarget(W, H, renderTargetParams);

    const mouse = new THREE.Vector2(-10, -10);
    const prevMouse = new THREE.Vector2(-10, -10);
    let frame = 0;
    let animId = null;
    let isRunning = false;

    // Fluid Simulation Shader (Pure physical wave equation with smooth line interpolation)
    const simMaterial = new THREE.ShaderMaterial({
        uniforms: {
            textureA: { value: null },
            mouse: { value: mouse },
            prevMouse: { value: prevMouse },
            resolution: { value: new THREE.Vector2(W, H) },
            time: { value: 0 },
            frame: { value: 0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D textureA;
            uniform vec2 mouse;
            uniform vec2 prevMouse;
            uniform vec2 resolution;
            uniform float time;
            uniform int frame;
            varying vec2 vUv;

            const float delta = 1.4;

            void main() {
                vec2 uv = vUv;
                if (frame == 0) {
                    gl_FragColor = vec4(0.0);
                    return;
                }

                vec4 data = texture2D(textureA, uv);
                float pressure = data.x;
                float pVel = data.y;

                vec2 texelSize = 1.0 / resolution;
                float p_right = texture2D(textureA, uv + vec2(texelSize.x, 0.0)).x;
                float p_left  = texture2D(textureA, uv + vec2(-texelSize.x, 0.0)).x;
                float p_up    = texture2D(textureA, uv + vec2(0.0, texelSize.y)).x;
                float p_down  = texture2D(textureA, uv + vec2(0.0, -texelSize.y)).x;

                if (uv.x <= texelSize.x) p_left = p_right;
                if (uv.x >= 1.0 - texelSize.x) p_right = p_left;
                if (uv.y <= texelSize.y) p_down = p_up;
                if (uv.y >= 1.0 - texelSize.y) p_up = p_down;

                // 2D Wave propagation
                pVel += delta * (-2.0 * pressure + p_right + p_left) / 4.0;
                pVel += delta * (-2.0 * pressure + p_up + p_down) / 4.0;

                pressure += delta * pVel;

                // Precise damping: ripples propagate smoothly and settle to absolute stillness when idle
                pVel -= 0.007 * delta * pressure;
                pVel *= (1.0 - 0.008 * delta);
                pressure *= 0.986;

                // Interactive cursor stroke interpolation (unbroken fluid ribbon)
                if (mouse.x > 0.0) {
                    vec2 mouseUV = mouse / resolution;
                    vec2 prevUV = (prevMouse.x > 0.0) ? (prevMouse / resolution) : mouseUV;
                    
                    vec2 pa = uv - prevUV;
                    vec2 ba = mouseUV - prevUV;
                    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
                    float dist = length(pa - ba * h);
                    
                    // Fine radius for razor-sharp crystal ripples
                    if (dist <= 0.022) {
                        pressure += 2.2 * (1.0 - dist / 0.022);
                    }
                }

                // Strictly NO ambient drops - surface stays 100% still when mouse is idle!

                gl_FragColor = vec4(pressure, pVel, (p_right - p_left) / 2.0, (p_up - p_down) / 2.0);
            }
        `
    });

    // Background Canvas Texture (Black base with obsidian liquid glass sculpture)
    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = W;
    bgCanvas.height = H;
    const bgCtx = bgCanvas.getContext('2d', { alpha: false });
    const bgTexture = new THREE.CanvasTexture(bgCanvas);
    bgTexture.minFilter = THREE.LinearFilter;
    bgTexture.magFilter = THREE.LinearFilter;

    const sculptureImg = new Image();
    sculptureImg.crossOrigin = 'anonymous';
    let imgLoaded = false;

    sculptureImg.onload = () => {
        imgLoaded = true;
        renderBackgroundPattern();
    };
    // Use WebP with PNG fallback
    sculptureImg.onerror = () => {
        if (!sculptureImg.src.endsWith('.png')) {
            sculptureImg.src = 'assets/liquid_sculpture.png';
        }
    };
    sculptureImg.src = 'assets/liquid_sculpture.webp';

    function renderBackgroundPattern() {
        // Pure black base
        bgCtx.fillStyle = '#000000';
        bgCtx.fillRect(0, 0, W, H);

        if (imgLoaded && sculptureImg.naturalWidth > 0) {
            const imgRatio = sculptureImg.naturalWidth / sculptureImg.naturalHeight;
            let targetW, targetH, targetX, targetY;

            if (W > 768 * dpr) {
                // Desktop: Position on right side of the hero section
                targetH = Math.min(H * 0.95, (W * 0.58) / imgRatio);
                targetW = targetH * imgRatio;
                targetX = W * 0.70 - targetW * 0.5;
                targetY = (H - targetH) * 0.5;
            } else {
                // Mobile/Tablet: Centered hero placement
                targetW = Math.min(W * 0.88, H * 0.65 * imgRatio);
                targetH = targetW / imgRatio;
                targetX = (W - targetW) * 0.5;
                targetY = (H - targetH) * 0.5;
            }

            bgCtx.drawImage(sculptureImg, targetX, targetY, targetW, targetH);
        }
        bgTexture.needsUpdate = true;
    }
    renderBackgroundPattern();

    // High-Clarity Water Optics Render Shader (Matching Skiper12 Vercel liquid simulation)
    const renderMaterial = new THREE.ShaderMaterial({
        uniforms: {
            textureA: { value: null },
            textureB: { value: bgTexture }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D textureA;
            uniform sampler2D textureB;
            varying vec2 vUv;

            void main() {
                vec4 data = texture2D(textureA, vUv);

                // Motion modulation: when surface is still, motion drops to 0.0
                float motion = smoothstep(0.0006, 0.006, length(data.zw) + abs(data.x) * 0.03);

                // Fluid refraction distortion modulated by active motion
                vec2 distortion = 0.3 * data.zw * motion;
                vec4 color = texture2D(textureB, vUv + distortion);

                // High-precision surface normal
                vec3 normal = normalize(vec3(-data.z * 2.2, 0.5, -data.w * 2.2));
                vec3 lightDir = normalize(vec3(-3.0, 10.0, 3.0));

                // High-exponent specular reflection (Skiper12 exact formula)
                float specAngle = max(0.0, dot(normal, lightDir));
                float specular = pow(specAngle, 60.0) * 1.6;

                // Subtle edge refraction highlight
                float caustic = smoothstep(0.01, 0.08, length(data.zw)) * 0.35;

                vec3 finalColor = color.rgb + vec3(specular * motion) + vec3(caustic * motion);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `,
        transparent: false
    });

    const plane = new THREE.PlaneGeometry(2, 2);
    const simMesh = new THREE.Mesh(plane, simMaterial);
    const renderMesh = new THREE.Mesh(plane, renderMaterial);

    simScene.add(simMesh);
    scene.add(renderMesh);

    // Mouse & Touch Tracking with previous position tracking
    let mouseTimeout = null;
    function updateMouse(clientX, clientY) {
        if (!isRunning) return;
        const r = canvas.getBoundingClientRect();
        const px = clientX - r.left;
        const py = clientY - r.top;
        if (px >= 0 && px <= r.width && py >= 0 && py <= r.height) {
            if (mouse.x > 0.0) {
                prevMouse.copy(mouse);
            } else {
                prevMouse.set(px * dpr, (r.height - py) * dpr);
            }
            mouse.x = px * dpr;
            mouse.y = (r.height - py) * dpr;

            // Clear previous mouse when motion stops
            clearTimeout(mouseTimeout);
            mouseTimeout = setTimeout(() => {
                prevMouse.copy(mouse);
            }, 60);
        } else {
            mouse.set(-10, -10);
            prevMouse.set(-10, -10);
        }
    }

    const heroSection = document.getElementById('home');
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            updateMouse(e.clientX, e.clientY);
        });
        heroSection.addEventListener('mouseleave', () => {
            mouse.set(-10, -10);
            prevMouse.set(-10, -10);
        });
        heroSection.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                updateMouse(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
        heroSection.addEventListener('touchend', () => {
            mouse.set(-10, -10);
            prevMouse.set(-10, -10);
        });
    }

    window.addEventListener('mousemove', (e) => {
        if (!isRunning || !heroSection) return;
        const hr = heroSection.getBoundingClientRect();
        if (e.clientY >= hr.top - 50 && e.clientY <= hr.bottom + 50) {
            updateMouse(e.clientX, e.clientY);
        }
    });

    // Resize handler
    function handleResize() {
        const newRect = container.getBoundingClientRect();
        if (newRect.width === 0 || newRect.height === 0) return;
        const newW = Math.max(Math.floor(newRect.width), window.innerWidth || 300);
        const newH = Math.max(Math.floor(newRect.height), 350);
        if (newW === width && newH === height) return;

        width = newW;
        height = newH;
        W = Math.floor(width * dpr);
        H = Math.floor(height * dpr);

        renderer.setSize(width, height);
        targetA.setSize(W, H);
        targetB.setSize(W, H);
        simMaterial.uniforms.resolution.value.set(W, H);

        bgCanvas.width = W;
        bgCanvas.height = H;
        renderBackgroundPattern();
    }

    if (window.ResizeObserver) {
        let resizeTimer;
        const ro = new ResizeObserver(() => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(handleResize, 100);
        });
        ro.observe(container);
    } else {
        window.addEventListener('resize', handleResize);
    }

    // Animation Loop
    function animate() {
        if (!isRunning) return;
        animId = requestAnimationFrame(animate);

        simMaterial.uniforms.frame.value = frame++;
        simMaterial.uniforms.time.value = performance.now() / 1000;
        simMaterial.uniforms.textureA.value = targetA.texture;

        renderer.setRenderTarget(targetB);
        renderer.render(simScene, camera);

        renderMaterial.uniforms.textureA.value = targetB.texture;
        renderer.setRenderTarget(null);
        renderer.render(scene, camera);

        let temp = targetA;
        targetA = targetB;
        targetB = temp;
    }

    function startSimulation() {
        const isLight = document.body.getAttribute('data-mode') === 'light';
        if (isLight) {
            stopSimulation();
            return;
        }
        if (isRunning) return;
        isRunning = true;
        handleResize();
        animate();
    }

    function stopSimulation() {
        isRunning = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
        if (renderer) {
            renderer.clear();
        }
    }

    // Hook to Dark/Light Theme Switching (Strict Dark-Only policy)
    window.updateHeroLiquidTheme = function() {
        const isLight = document.body.getAttribute('data-mode') === 'light';
        if (isLight) {
            stopSimulation();
        } else {
            startSimulation();
        }
    };

    // Initial Start if in Dark Mode
    const isCurrentLight = document.body.getAttribute('data-mode') === 'light';
    if (!isCurrentLight) {
        startSimulation();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initHeroLiquidSimulation);
} else {
    initHeroLiquidSimulation();
}

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
        'mongodb': 'MongoDB',
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
        'vercel': 'Vercel Edge Cloud'
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
        this.container = inputElement.closest('.smooth-input-container') || inputElement.parentElement;
        this.measureSpan = this.container ? this.container.querySelector('.smooth-measure-span') : null;
        this.caret = this.container ? this.container.querySelector('.smooth-caret') : null;

        // Framer Motion spring parameters from user specification:
        this.stiffness = options.stiffness || 500;
        this.damping = options.damping || 30;
        this.mass = options.mass || 0.5;

        this.currentX = 0;
        this.targetX = 0;
        this.velocity = 0;
        this.isMoving = false;
        this.isFocused = false;
        this.lastTime = 0;
        this.rafId = null;
        this.idleTimeout = null;

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
        const start = this.input.selectionStart ?? 0;
        const end = this.input.selectionEnd ?? 0;
        if (start === end) return start;
        return this.input.selectionDirection === 'backward' ? start : end;
    }

    updateCaretPosition(immediate = false) {
        if (!this.isFocused || !this.caret) return;

        const selectionStart = this.input.selectionStart ?? 0;
        const selectionEnd = this.input.selectionEnd ?? 0;
        const hasSelection = selectionStart !== selectionEnd;

        if (hasSelection) {
            this.caret.style.opacity = '0';
            return;
        }

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

        if (immediate) {
            this.currentX = this.targetX;
            this.velocity = 0;
            this.caret.style.transform = `translateY(-50%) translate3d(${this.currentX}px, 0, 0)`;
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
        if (!this.isFocused && Math.abs(this.currentX - this.targetX) < 0.2) {
            this.isMoving = false;
            return;
        }

        let dt = (time - this.lastTime) / 1000;
        this.lastTime = time;
        if (dt > 0.033) dt = 0.033; // clamp dt to 33ms

        // Second-order differential spring mechanics
        const springForce = -this.stiffness * (this.currentX - this.targetX);
        const dampingForce = -this.damping * this.velocity;
        const acceleration = (springForce + dampingForce) / this.mass;

        this.velocity += acceleration * dt;
        this.currentX += this.velocity * dt;

        if (this.caret) {
            this.caret.style.transform = `translateY(-50%) translate3d(${this.currentX.toFixed(2)}px, 0, 0)`;
        }

        if (Math.abs(this.currentX - this.targetX) < 0.15 && Math.abs(this.velocity) < 0.2) {
            this.currentX = this.targetX;
            this.velocity = 0;
            if (this.caret) {
                this.caret.style.transform = `translateY(-50%) translate3d(${this.currentX}px, 0, 0)`;
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
    // 1. Navbar Links
    document.querySelectorAll('.navbar .nav-link').forEach(link => {
        if (link.dataset.textRolled) return;
        if (link.classList.contains('mobile-nav-resume')) {
            link.dataset.textRolled = "true";
            link.innerHTML = createTextRollMarkup('Resume') + ' <span class="skiper-arrow">↗</span>';
            return;
        }
        const rawText = link.textContent.trim();
        if (!rawText) return;
        link.dataset.textRolled = "true";
        link.innerHTML = createTextRollMarkup(rawText);
    });

    // 2. Resume button in header
    const resumeBtn = document.querySelector('.header-right .btn-pill');
    if (resumeBtn && !resumeBtn.dataset.textRolled) {
        resumeBtn.dataset.textRolled = "true";
        resumeBtn.innerHTML = createTextRollMarkup('Resume') + ' <span class="skiper-arrow">↗</span>';
    }

    // 3. Hero CTA buttons
    const heroPrimaryBtn = document.querySelector('.hero-actions .btn-primary');
    if (heroPrimaryBtn && !heroPrimaryBtn.dataset.textRolled) {
        heroPrimaryBtn.dataset.textRolled = "true";
        heroPrimaryBtn.innerHTML = createTextRollMarkup('View Projects') + ' <i class="fas fa-arrow-down"></i>';
    }

    const heroOutlineBtn = document.querySelector('.hero-actions .btn-outline');
    if (heroOutlineBtn && !heroOutlineBtn.dataset.textRolled) {
        heroOutlineBtn.dataset.textRolled = "true";
        heroOutlineBtn.innerHTML = createTextRollMarkup('Get In Touch');
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

/* ========================================================
   19. CROWD CANVAS ANIMATION ENGINE (SKIPER 39)
   High-Performance Pure HTML5 Canvas Crowd Walking Engine
======================================================== */
(function initCrowdCanvas() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = document.getElementById('crowd-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const config = {
        src: 'assets/all-peeps.png',
        rows: 15,
        cols: 7,
    };

    const randomRange = (min, max) => min + Math.random() * (max - min);
    const randomIndex = (array) => (randomRange(0, array.length) | 0);
    const removeFromArray = (array, i) => array.splice(i, 1)[0];
    const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item));
    const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array));

    const stage = { width: 0, height: 0 };
    const allPeeps = [];
    const availablePeeps = [];
    const crowd = [];

    const img = new Image();

    const createPeep = (rect) => {
        const p = {
            rect: rect,
            width: rect[2],
            height: rect[3],
            x: 0,
            y: 0,
            anchorY: 0,
            scaleX: 1,
            // Custom walk parameters (native RAF, zero GSAP dependency)
            startX: 0,
            endX: 0,
            startY: 0,
            duration: 10,
            speed: 1,
            progress: 0,
            bobSpeed: 0.4,
            
            initWalk: function(stg) {
                const direction = Math.random() > 0.5 ? 1 : -1;
                // Power2.in distribution for natural perspective layering
                const r = Math.random();
                const easeIn = r * r;
                const offsetY = 70 - 210 * easeIn;
                const sY = Math.max(30, stg.height - p.height + offsetY);
                
                if (direction === 1) {
                    p.startX = -p.width;
                    p.endX = stg.width + p.width;
                    p.scaleX = 1;
                } else {
                    p.startX = stg.width + p.width;
                    p.endX = -p.width;
                    p.scaleX = -1;
                }
                
                p.startY = sY;
                p.anchorY = sY;
                p.x = p.startX;
                p.y = sY;
                p.speed = randomRange(0.65, 1.15);
                // Calmer, slower walking speed across the section
                const baseDuration = stg.width > 900 ? 22 : 16;
                p.duration = baseDuration / p.speed;
                p.progress = 0;
            },

            update: function(dt) {
                p.progress += dt / p.duration;
                if (p.progress >= 1) return false; // completed

                // Linear horizontal motion
                p.x = p.startX + (p.endX - p.startX) * p.progress;
                // Natural gentle bounce step cycle
                const bounce = Math.abs(Math.sin((p.progress * p.duration) / p.bobSpeed * Math.PI));
                p.y = p.startY - bounce * 6;
                return true;
            },

            render: function(context) {
                context.save();
                context.translate(p.x, p.y);
                context.scale(p.scaleX, 1);
                context.drawImage(
                    img,
                    p.rect[0],
                    p.rect[1],
                    p.rect[2],
                    p.rect[3],
                    0,
                    0,
                    p.width,
                    p.height
                );
                context.restore();
            }
        };
        return p;
    };

    const createPeeps = () => {
        const { rows, cols } = config;
        const width = img.naturalWidth || 1050;
        const height = img.naturalHeight || 560;
        const total = rows * cols;
        const rectWidth = width / rows;
        const rectHeight = height / cols;

        allPeeps.length = 0;
        for (let i = 0; i < total; i++) {
            allPeeps.push(
                createPeep([
                    (i % rows) * rectWidth,
                    ((i / rows) | 0) * rectHeight,
                    rectWidth,
                    rectHeight,
                ])
            );
        }
    };

    const addPeepToCrowd = (randomizeProgress = false) => {
        if (!availablePeeps.length) return null;
        const peep = removeRandomFromArray(availablePeeps);
        peep.initWalk(stage);
        if (randomizeProgress) {
            peep.progress = Math.random();
            peep.x = peep.startX + (peep.endX - peep.startX) * peep.progress;
        }
        crowd.push(peep);
        // Sort by anchorY for true perspective depth (closer people render in front)
        crowd.sort((a, b) => a.anchorY - b.anchorY);
        return peep;
    };

    const removePeepFromCrowd = (peep) => {
        removeItemFromArray(crowd, peep);
        availablePeeps.push(peep);
    };

    const initCrowd = () => {
        // Rich crowd density with smooth 60fps performance
        const targetCount = stage.width > 900 ? 38 : 20;
        while (availablePeeps.length && crowd.length < targetCount) {
            addPeepToCrowd(true);
        }
    };

    const resize = () => {
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        stage.width = rect.width || canvas.clientWidth || 800;
        stage.height = rect.height || canvas.clientHeight || 350;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(stage.width * dpr);
        canvas.height = Math.floor(stage.height * dpr);

        crowd.length = 0;
        availablePeeps.length = 0;
        availablePeeps.push(...allPeeps);

        initCrowd();
    };

    let isVisible = false;
    let animId = null;
    let lastTime = 0;

    const render = (time) => {
        if (!isVisible) return;
        animId = requestAnimationFrame(render);

        if (!lastTime) lastTime = time;
        let dt = (time - lastTime) / 1000;
        lastTime = time;
        if (dt > 0.05) dt = 0.05; // clamp

        // Update crowd
        for (let i = crowd.length - 1; i >= 0; i--) {
            const peep = crowd[i];
            const alive = peep.update(dt);
            if (!alive) {
                removePeepFromCrowd(peep);
                addPeepToCrowd(false);
            }
        }

        // Render frame
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.scale(dpr, dpr);

        for (let i = 0; i < crowd.length; i++) {
            crowd[i].render(ctx);
        }

        ctx.restore();
    };

    const start = () => {
        if (isVisible) return;
        isVisible = true;
        lastTime = 0;
        animId = requestAnimationFrame(render);
    };

    const stop = () => {
        isVisible = false;
        if (animId) {
            cancelAnimationFrame(animId);
            animId = null;
        }
    };

    // Smart IntersectionObserver: only consumes CPU/GPU when user scrolls to bottom!
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    start();
                } else {
                    stop();
                }
            });
        }, { threshold: 0.05 });
        observer.observe(canvas);
    } else {
        start();
    }

    img.onload = () => {
        createPeeps();
        resize();
    };
    img.src = config.src;

    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(resize, 150);
    }, { passive: true });
})();