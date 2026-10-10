/**
 * Copyright 2026 Arpit Yadav (https://arpity.me)
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */

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
   2. OPENING MINIMALIST BRAND PRELOADER
   Fast, elegant brand mark reveal with zero delay
======================================================== */
const preloader = document.getElementById('preloader');
const preloaderProgress = document.getElementById('preloader-progress');

if (preloader) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 12) + 12;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            if (preloaderProgress) preloaderProgress.style.width = '100%';
            
            setTimeout(() => {
                playCozyChime();
                preloader.classList.add('preloader-hidden');
                
                // Cascading reveal for Hero Section
                const hero = document.getElementById('home');
                if (hero) hero.classList.add('active');
            }, 240);
        } else {
            if (preloaderProgress) preloaderProgress.style.width = `${progress}%`;
        }
    }, 35);
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
   5. 3D TILT EFFECT ON CARDS
======================================================== */
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -6;
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
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
   Same cozy theme, haptic audio triggers, deep engineering proof
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
        badge: '<span class="badge progress-badge"><i class="fas fa-microchip"></i> Physical Hardware + 3D Twin</span>',
        title: 'SAFETY-FI 96X: Industrial-Grade Kitchen IoT Safety Platform',
        subtitle: 'A dual-action closed-loop hazard mitigation platform engineered to prevent catastrophic kitchen accidents from LPG gas leaks and uncontrolled cooking fires.',
        image: 'assets/smart-kitchen-prototype.jpg',
        imageCaption: 'Physical Hardware Test Bench with Arduino Uno, Sensors, Relays & Laptop 3D Twin',
        blocks: [
            {
                title: '<i class="fas fa-bullseye"></i> Problem Statement',
                content: 'Undetected LPG gas leaks and unattended cooking fires result in severe explosions and domestic damage. Typical standalone alarms beep passively without triggering physical ventilation or automated suppression.'
            },
            {
                title: '<i class="fas fa-user-cog"></i> My Contribution & Role',
                content: 'As sole builder, engineered the complete working physical model: assembled the Arduino Uno circuit with isolated 5V relays, wrote non-blocking C++ firmware (<code>smart_kitchen.ino</code>), developed the asynchronous Python serial telemetry server (<code>app.py</code>), and created the Three.js 3D digital twin dashboard.'
            },
            {
                title: '<i class="fas fa-tools"></i> Firmware & Telemetry Architecture',
                bullets: [
                    '<strong>5-Second One-Shot Flame Timer:</strong> Optical IR flame detection activates the water pump relay and acoustic alarm for exactly 5,000 ms before deterministic auto shut-off.',
                    '<strong>Anti-Loop Lockout (<code>flameMustClear</code>):</strong> Prevents infinite alarm cycling during continuous sensor exposure by requiring the flame to clear before re-arming the actuator trigger.',
                    '<strong>Calibrated Gas Threshold (300 ADC):</strong> Tuned the MQ-2 hydrocarbon trigger to 300 ADC units, eliminating ambient indoor drift while reacting instantly to butane/LPG concentrations.',
                    '<strong>Reentrant Lock Concurrency (<code>threading.RLock</code>):</strong> Eliminated server thread starvation in Python, allowing continuous 9600-Baud USB serial polling and REST API requests concurrently.',
                    '<strong>IoT Cloud Email Sentinel:</strong> Dispatches real-time emergency hazard notifications and system diagnostics directly to user\'s smartphone via Formspree API without fragile GSM hardware dependencies.',
                    '<strong>Three.js 3D Digital Twin:</strong> Client-side 3D cooktop rendering with dynamic particle fluids, electric blue (<code>#38BDF8</code>) gas alert lighting, and live hardware register telemetry.'
                ]
            }
        ],
        notice: '<strong>Deployment Note:</strong> Physical working prototype built with Arduino Uno & sensors. The web dashboard provides an interactive Three.js 3D digital twin and hybrid simulation engine.',
        actions: [
            { label: 'Live 3D Digital Twin', icon: 'fas fa-external-link-alt', href: 'https://arpityadav626.github.io/smart-kitchen/', external: true, primary: true },
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
        blocks: [
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
            { label: 'Live Interactive Preview', icon: 'fas fa-external-link-alt', href: 'https://arpityadav626.github.io/chronofact/', external: true, primary: true },
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
        badge: '<span class="badge live-badge"><i class="fas fa-cube"></i> Live on Vercel &bull; Apex Intelligence</span>',
        title: 'Monolith Villa ⬡ Bespoke 3D Architectural Walkthrough',
        subtitle: 'A cinematic, high-performance WebGL 3D virtual residence engineered for Apex Intelligence (Co-founded by Arpit Yadav) featuring scroll-driven camera interpolation, spatial HUD beacons, and ambient acoustic soundscapes.',
        image: null,
        imageCaption: null,
        blocks: [
            {
                title: '<i class="fas fa-bullseye"></i> Vision & Partnership',
                content: 'Engineered as a flagship spatial digital twin and luxury virtual showcase for <strong>Apex Intelligence</strong> (Co-founded by Arpit Yadav). Monolith Villa bridges modern brutalist-minimalist architecture with bleeding-edge web graphics, allowing prospective buyers and architects to tour a 14,200 sq.ft ultra-luxury residence with zero downloads or plug-ins.'
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
        notice: '<strong>Apex Intelligence Showcase:</strong> Sample bespoke architectural digital twin engineered for Apex Intelligence. Co-founded by Arpit Yadav.',
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

    if (data.image) {
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
   12. AMBIENT THEME PALETTE CUSTOMIZER
======================================================== */
const paletteWrap = document.getElementById('theme-palette-wrap');
const paletteBtn = document.getElementById('palette-btn');
const paletteCurrentDot = document.getElementById('palette-current-dot');
const paletteSwatches = document.querySelectorAll('.palette-swatch');

const themeColors = {
    'amber': '#f97316',
    'cyan': '#38bdf8',
    'emerald': '#10b981',
    'violet': '#a855f7'
};

function setAccentTheme(themeName) {
    if (!themeColors[themeName]) themeName = 'amber';
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('arpit-accent-theme', themeName);

    if (paletteCurrentDot) {
        paletteCurrentDot.style.background = themeColors[themeName];
        paletteCurrentDot.style.boxShadow = `0 0 8px ${themeColors[themeName]}`;
    }

    paletteSwatches.forEach(swatch => {
        if (swatch.getAttribute('data-theme') === themeName) {
            swatch.classList.add('active');
        } else {
            swatch.classList.remove('active');
        }
    });
}

// Restore saved theme on initial load
const savedTheme = localStorage.getItem('arpit-accent-theme') || 'amber';
setAccentTheme(savedTheme);

if (paletteBtn && paletteWrap) {
    paletteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        paletteWrap.classList.toggle('open');
        playButtonHover();
    });

    paletteSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            e.stopPropagation();
            const theme = swatch.getAttribute('data-theme');
            setAccentTheme(theme);
            paletteWrap.classList.remove('open');
            playButtonClick();
        });
    });

    document.addEventListener('click', (e) => {
        if (paletteWrap && !paletteWrap.contains(e.target)) {
            paletteWrap.classList.remove('open');
        }
    });
}

/* ========================================================
   13. HERO INTERACTIVE DEVELOPER STUDIO ENGINE
   Ultra-clean, zero-friction 1-click tabs & SIH live telemetry
======================================================== */
const studioTabs = document.querySelectorAll('.s-tab[data-tab]');
const studioPanels = document.querySelectorAll('.studio-panel');
const studioTitleBar = document.getElementById('studio-title-bar');

const tabTitles = {
    bio: '<i class="fas fa-code-branch"></i> arpit.config.ts',
    projects: '<i class="fas fa-rocket"></i> featured-work.json',
    skills: '<i class="fas fa-layer-group"></i> tech-stack.yaml',
    contact: '<i class="fas fa-terminal"></i> connect.sh'
};

if (studioTabs.length > 0) {
    studioTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetTab = tab.getAttribute('data-tab');
            if (!targetTab) return;

            studioTabs.forEach(t => {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            studioPanels.forEach(p => p.classList.remove('active'));

            tab.classList.add('active');
            tab.setAttribute('aria-selected', 'true');

            const activePanel = document.getElementById(`panel-${targetTab}`);
            if (activePanel) activePanel.classList.add('active');

            if (studioTitleBar && tabTitles[targetTab]) {
                studioTitleBar.innerHTML = tabTitles[targetTab];
            }

            playButtonClick();
        });
    });
}

// 1-Click Explore Work button
const studioExploreBtn = document.getElementById('btn-studio-explore');
if (studioExploreBtn) {
    studioExploreBtn.addEventListener('click', () => {
        const pSec = document.getElementById('projects');
        smoothScrollToElement(pSec, -30);
        playButtonClick();
    });
}

// 1-Click Direct Project Modal Launch from Hero Card
document.querySelectorAll('.mini-project-row[data-open-project]').forEach(row => {
    row.addEventListener('click', (e) => {
        e.stopPropagation();
        const projectId = row.getAttribute('data-open-project');
        if (projectId && typeof openProjectModal === 'function') {
            openProjectModal(projectId);
        }
    });
});

// Interactive Skill Pills inside Studio Card
document.querySelectorAll('.s-pill[data-skill]').forEach(pill => {
    pill.addEventListener('click', () => {
        const skill = pill.getAttribute('data-skill');
        if (skill && typeof highlightProjectsBySkill === 'function') {
            highlightProjectsBySkill(skill, true);
        }
    });
});

// 1-Click Copy Email button
const studioCopyBtn = document.getElementById('studio-copy-email-btn');
const studioCopyLabel = document.getElementById('copy-btn-label');
if (studioCopyBtn) {
    studioCopyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await navigator.clipboard.writeText('arpityadav6794@gmail.com');
            if (studioCopyLabel) studioCopyLabel.textContent = 'Copied! ✓';
            studioCopyBtn.style.background = 'rgba(16, 185, 129, 0.2)';
            studioCopyBtn.style.borderColor = '#10b981';
            studioCopyBtn.style.color = '#10b981';
            playKeyTick();
            setTimeout(() => {
                if (studioCopyLabel) studioCopyLabel.textContent = 'Copy';
                studioCopyBtn.style.background = '';
                studioCopyBtn.style.borderColor = '';
                studioCopyBtn.style.color = '';
            }, 2200);
        } catch (err) {
            console.error('Copy failed', err);
        }
    });
}

// 1-Click Studio Footer View All Projects button
const studioExploreFooterBtn = document.getElementById('btn-studio-explore-footer');
if (studioExploreFooterBtn) {
    studioExploreFooterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const pSec = document.getElementById('projects');
        smoothScrollToElement(pSec, -30);
        playButtonClick();
    });
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