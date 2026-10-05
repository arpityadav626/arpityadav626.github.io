/* ========================================================
   1. STUDIO-GRADE ZERO-GLITCH SOUND ENGINE (Web Audio API)
   With Dynamics Compressor, Anti-Click Envelopes & Debounce!
======================================================== */
let audioCtx = null;
let masterCompressor = null;
let masterGain = null;
let soundEnabled = true;
let lastHoverTime = 0;

function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();

        // 1. Dynamics Compressor (Limiter) - 100% eliminates distortion & crackling
        masterCompressor = audioCtx.createDynamicsCompressor();
        masterCompressor.threshold.setValueAtTime(-18, audioCtx.currentTime);
        masterCompressor.knee.setValueAtTime(30, audioCtx.currentTime);
        masterCompressor.ratio.setValueAtTime(12, audioCtx.currentTime);
        masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
        masterCompressor.release.setValueAtTime(0.15, audioCtx.currentTime);

        // 2. Master Gain
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);

        masterCompressor.connect(masterGain);
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Unlock audio seamlessly on first user interaction
['click', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => initAudio(), { once: true, passive: true });
});

// Sound 1: Soft Button Hover (Ultra-crisp micro-air tick, zero click pop)
function playButtonHover() {
    if (!soundEnabled) return;
    const now = performance.now();
    if (now - lastHoverTime < 50) return; // Anti-glitch debounce
    lastHoverTime = now;

    initAudio();
    const t = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.025);

    // Smooth zero-crossing envelope (eliminates popping glitch)
    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.02, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterCompressor);

    osc.start(t);
    osc.stop(t + 0.025);
}

// Sound 2: Deep Warm Card Hover (Acoustic marimba / soft wooden thud)
function playCardHover() {
    if (!soundEnabled) return;
    const now = performance.now();
    if (now - lastHoverTime < 70) return;
    lastHoverTime = now;

    initAudio();
    const t = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, t);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(130, t + 0.07);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterCompressor);

    osc.start(t);
    osc.stop(t + 0.07);
}

// Sound 3: Mechanical Haptic Button Click (Satisfying dual-stage switch)
function playButtonClick() {
    if (!soundEnabled) return;
    initAudio();
    const t = audioCtx.currentTime;

    // Transient click
    const oscClick = audioCtx.createOscillator();
    const gainClick = audioCtx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(950, t);
    oscClick.frequency.exponentialRampToValueAtTime(280, t + 0.04);

    gainClick.gain.setValueAtTime(0.0001, t);
    gainClick.gain.linearRampToValueAtTime(0.06, t + 0.002);
    gainClick.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    oscClick.connect(gainClick);
    gainClick.connect(masterCompressor);

    oscClick.start(t);
    oscClick.stop(t + 0.04);

    // Warm resonant body
    const oscBody = audioCtx.createOscillator();
    const gainBody = audioCtx.createGain();
    oscBody.type = 'sine';
    oscBody.frequency.setValueAtTime(190, t);
    oscBody.frequency.exponentialRampToValueAtTime(80, t + 0.06);

    gainBody.gain.setValueAtTime(0.0001, t);
    gainBody.gain.linearRampToValueAtTime(0.08, t + 0.004);
    gainBody.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);

    oscBody.connect(gainBody);
    gainBody.connect(masterCompressor);

    oscBody.start(t);
    oscBody.stop(t + 0.06);
}

// Sound 4: Liquid Bubble Tone (For Navigation links)
function playNavClick() {
    if (!soundEnabled) return;
    initAudio();
    const t = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(540, t);
    osc.frequency.exponentialRampToValueAtTime(780, t + 0.04);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.05, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);

    osc.connect(gain);
    gain.connect(masterCompressor);

    osc.start(t);
    osc.stop(t + 0.05);
}

// Sound 5: Crystalline Melodic Welcome Chime
function playCozyChime() {
    if (!soundEnabled) return;
    initAudio();
    const t = audioCtx.currentTime;

    const chords = [523.25, 659.25, 783.99]; // C5, E5, G5 Major Chord
    chords.forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(0.0001, t + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.035, t + idx * 0.08 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(masterCompressor);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.45);
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
   2. OPENING INTRO PRELOADER RUNNER
======================================================== */
const preloader = document.getElementById('preloader');
const preloaderCount = document.getElementById('preloader-count');
const preloaderProgress = document.getElementById('preloader-progress');

if (preloader) {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 8) + 5;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            if (preloaderCount) preloaderCount.textContent = '100%';
            if (preloaderProgress) preloaderProgress.style.width = '100%';
            
            setTimeout(() => {
                playCozyChime();
                preloader.classList.add('preloader-hidden');
                
                // Cascading reveal for Hero Section
                const hero = document.getElementById('home');
                if (hero) hero.classList.add('active');
            }, 300);
        } else {
            if (preloaderCount) preloaderCount.textContent = `${progress}%`;
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
   4. CUSTOM INTERACTIVE CURSOR
======================================================== */
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');

if (cursorDot && cursorOutline && window.innerWidth > 768) {
    window.addEventListener('mousemove', (e) => {
        const { clientX: x, clientY: y } = e;
        
        cursorDot.style.left = `${x}px`;
        cursorDot.style.top = `${y}px`;

        cursorOutline.animate({
            left: `${x}px`,
            top: `${y}px`
        }, { duration: 220, fill: "forwards" });
    });

    document.querySelectorAll('a, button, input, textarea, .project-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1.6)';
            cursorOutline.style.borderColor = 'var(--accent-primary)';
        });
        el.addEventListener('mouseleave', () => {
            cursorOutline.style.transform = 'translate(-50%, -50%) scale(1)';
            cursorOutline.style.borderColor = 'rgba(249, 115, 22, 0.5)';
        });
    });
}

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
    menuToggle.addEventListener('click', () => {
        navbar.classList.toggle('active');
        playButtonClick();
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
        });
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
    'chronofact': {
        index: '02 // DIGITAL FORENSIC INVESTIGATION',
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
    'smart-kitchen': {
        index: '03 // EMBEDDED & 3D DIGITAL TWIN',
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

function openProjectModal(projectId) {
    if (!projectModal) return;
    renderProjectDetails(projectId);
    projectModal.classList.add('active');
    projectModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    if (lenis) lenis.stop();
    playButtonClick();
}

function closeProjectModal() {
    if (!projectModal) return;
    projectModal.classList.remove('active');
    projectModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (lenis) lenis.start();
    playButtonClick();
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
        if (e.target === projectModal) {
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
   9. SMART AUTO-HIDE HEADER ON SCROLL
   Hides on scroll down to clear view, reveals on scroll up
======================================================== */
let lastScrollY = window.scrollY;
const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
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
   10. NEXT-LEVEL INERTIA SMOOTH SCROLL (LENIS ENGINE)
   Silky, physics-based glide with zero jitter
======================================================== */
let lenis = null;
if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
        duration: 1.15,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Smooth anchor link gliding
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId && targetId !== '#') {
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    e.preventDefault();
                    lenis.scrollTo(targetEl, { offset: -30 });
                }
            }
        });
    });
}

/* ========================================================
   11. LINEAR.APP / VERCEL HIGH-PERFORMANCE SPOTLIGHT TRACKER
   Smooth lerp physics, zero lag, direct GPU property injection
======================================================== */
(function initSpotlight() {
    const spotlight = document.getElementById('spotlight');
    if (!spotlight || !window.matchMedia('(pointer: fine)').matches) return;

    let targetX = -1000;
    let targetY = -1000;
    let currentX = -1000;
    let currentY = -1000;
    let isMoving = false;
    let rafId = null;

    function updateSpotlight() {
        // Silky smooth lerp smoothing
        currentX += (targetX - currentX) * 0.12;
        currentY += (targetY - currentY) * 0.12;

        document.documentElement.style.setProperty('--mouse-x', `${currentX}px`);
        document.documentElement.style.setProperty('--mouse-y', `${currentY}px`);

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