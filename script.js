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
   5. SKIPER 104: BIDIRECTIONAL PINNED SCROLL REVEAL ENGINE
   - Sticky pinned viewport on desktop (page pauses during project exploration)
   - Sequentially unlocks projects 01 -> 06 as user scrolls down
   - Seamlessly reverses as user scrolls up (bidirectional loop)
   - Page unpins and scrolls down once all 6 projects have appeared
   - Ensures page normally starts from the top on load
======================================================== */
(function initSkiper104PinnedScroll() {
    // 1. Ensure page starts from the very top on load
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    if (!window.location.hash || window.location.hash === '#home' || window.location.hash === '#projects') {
        window.scrollTo(0, 0);
    }

    const scrollSection = document.querySelector('.projects-scroll-section');
    if (!scrollSection) return;

    const cards = Array.from(scrollSection.querySelectorAll('.project-card.card-reveal-item'));
    const stage1 = document.getElementById('projects-stage-1');
    const stage2 = document.getElementById('projects-stage-2');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        cards.forEach(c => c.classList.add('is-revealed'));
        if (stage2) stage2.classList.add('active-stage');
        return;
    }

    let ticking = false;

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateScrollState);
            ticking = true;
        }
    }

    function updateScrollState() {
        ticking = false;
        const isDesktop = window.innerWidth > 900;

        if (!isDesktop) {
            // Mobile: natural viewport-based scroll reveal
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                if (rect.top < window.innerHeight * 0.85 && rect.bottom > 0) {
                    card.classList.add('is-revealed');
                } else if (rect.top > window.innerHeight * 0.95 || rect.bottom < 0) {
                    card.classList.remove('is-revealed');
                }
            });
            return;
        }

        const rect = scrollSection.getBoundingClientRect();
        const totalDist = scrollSection.offsetHeight - window.innerHeight;
        if (totalDist <= 0) return;

        // Progress strictly from 0 to 1 inside the pinned section
        const progress = Math.min(Math.max(-rect.top / totalDist, 0), 1);

        // Switch stages smoothly around progress 0.48
        const isSet2 = progress >= 0.48;
        if (isSet2) {
            if (stage1) stage1.classList.remove('active-stage');
            if (stage2) stage2.classList.add('active-stage');
        } else {
            if (stage2) stage2.classList.remove('active-stage');
            if (stage1) stage1.classList.add('active-stage');
        }

        // Two-way unlock thresholds
        // Stage 1 (Cards 01, 02, 03): 0.04, 0.18, 0.32
        // Stage 2 (Cards 04, 05, 06): 0.54, 0.68, 0.82
        const thresholds = [0.04, 0.18, 0.32, 0.54, 0.68, 0.82];

        cards.forEach((card, i) => {
            const thresh = thresholds[i] || 0;
            if (progress >= thresh) {
                card.classList.add('is-revealed');
            } else {
                card.classList.remove('is-revealed');
            }
        });
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    
    // Check state immediately
    updateScrollState();
})();

/* ========================================================
   SKIPER 90: GRADIENT HOVER CARDS (Mouse-Following Orb)
   Smooth 60/120fps mouse tracking per card via RAF
   ======================================================== */
function initGradientHoverCards() {
    const cards = document.querySelectorAll('.project-card');
    if (!cards.length) return;

    cards.forEach(card => {
        const orb = card.querySelector('.card-gradient-orb');
        if (!orb) return;

        let mouseX = 0;
        let mouseY = 0;
        let isHovered = false;
        let rafId = null;

        const updateOrb = () => {
            if (isHovered) {
                orb.style.left = `${mouseX}px`;
                orb.style.top = `${mouseY}px`;
                orb.style.opacity = '1';
                rafId = requestAnimationFrame(updateOrb);
            }
        };

        card.addEventListener('mouseenter', (e) => {
            isHovered = true;
            const rect = card.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
            orb.style.left = `${mouseX}px`;
            orb.style.top = `${mouseY}px`;
            orb.style.opacity = '1';
            cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(updateOrb);
        });

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        card.addEventListener('mouseleave', () => {
            isHovered = false;
            cancelAnimationFrame(rafId);
            orb.style.opacity = '0';
        });
    });
}
initGradientHoverCards();

/* ========================================================
   SKIPER 19: SVG FOLLOW SCROLL PATH (Smooth Scroll Stroke)
   Animates stroke-dashoffset on the organic winding path as user scrolls in Light Mode
   ======================================================== */
function initSkiper19ScrollStroke() {
    const wrapper = document.getElementById('skiper19-wrapper');
    const path = document.getElementById('skiper19-active-path');
    const projectsSection = document.getElementById('projects');
    if (!path || !wrapper) return;

    function getProjectsTop() {
        if (projectsSection) {
            const top = projectsSection.offsetTop;
            document.documentElement.style.setProperty('--stroke-start-y', `${top}px`);
            return top;
        }
        return 720;
    }

    let startY = getProjectsTop();

    let pathLength = 0;
    try {
        pathLength = path.getTotalLength();
    } catch (e) {
        return;
    }

    path.style.strokeDasharray = `${pathLength} ${pathLength}`;
    path.style.strokeDashoffset = `${pathLength}`;

    let ticking = false;

    function onScrollUpdate() {
        ticking = false;
        if (document.body.getAttribute('data-mode') !== 'light') return;

        const scrollY = window.scrollY || window.pageYOffset;
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const activeRange = maxScroll - startY;

        if (activeRange <= 0) return;

        if (scrollY < startY) {
            // Above projects: Hero section is clean, stroke is 0% drawn
            path.style.strokeDashoffset = `${pathLength}`;
            return;
        }

        // Below hero: as user scrolls from #projects to footer, progress goes 0 -> 1
        // Smoothly draws across the entire site from projects through to footer
        const progress = Math.min(Math.max((scrollY - startY) / activeRange, 0), 1);
        const currentProgress = 0.08 + (progress * 0.92);
        const drawLength = pathLength * currentProgress;
        path.style.strokeDashoffset = `${pathLength - drawLength}`;
    }

    window.updateSkiper19ScrollStroke = () => {
        startY = getProjectsTop();
        onScrollUpdate();
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScrollUpdate);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', () => {
        startY = getProjectsTop();
        try {
            pathLength = path.getTotalLength();
            path.style.strokeDasharray = `${pathLength} ${pathLength}`;
        } catch (e) {}
        onScrollUpdate();
    }, { passive: true });

    window.addEventListener('load', () => {
        startY = getProjectsTop();
        onScrollUpdate();
    });

    onScrollUpdate();
}
initSkiper19ScrollStroke();
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
            { label: 'GitHub Repository', icon: 'fab fa-github', href: 'https://github.com/arpityadav626/smart-helmet', external: true, primary: true },
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
            { label: 'Live Interactive Preview', icon: 'fas fa-external-link-alt', href: 'https://arpityadav626.github.io/smart-kitchen/', external: true },
            { label: 'GitHub Repository', icon: 'fab fa-github', href: 'https://github.com/arpityadav626/smart-kitchen', external: true }
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
                    '<strong>Developed</strong> a full-stack fact-checking and digital forensics platform using <strong>React, Node.js, and MongoDB</strong>, orchestrating multi-agent verification pipelines to cross-reference claims against trusted sources.',
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
            { label: 'Live Interactive Preview', icon: 'fas fa-external-link-alt', href: 'https://arpityadav626.github.io/chronofact/', external: true },
            { label: 'GitHub Repository', icon: 'fab fa-github', href: 'https://github.com/arpityadav626/chronofact', external: true }
        ]
    },
    'portfolio': {
        index: '04 // PERSONAL ARCHITECTURE',
        badge: '<span class="badge live-badge"><i class="fas fa-star"></i> 98+ Lighthouse &amp; Web Audio</span>',
        title: 'Interactive Developer Portfolio & Custom Web Audio Synthesizer',
        subtitle: 'High-performance zero-dependency developer portfolio achieving 98+ Google Lighthouse scores, custom procedural Web Audio synthesis (0 KB audio payload), and relational skill-to-project state mapping.',
        image: null,
        imageCaption: null,
        blocks: [
            {
                title: '<i class="fas fa-bullseye"></i> Engineering Objectives',
                content: 'Built from scratch without heavy frameworks to deliver instantaneous sub-second load times, accessible semantic structure, and immersive haptic audio micro-interactions.'
            },
            {
                title: '<i class="fas fa-project-diagram"></i> Architecture & Zero-Payload Synthesis Flow',
                diagram: `[SEMANTIC DOM ARCHITECTURE]
├── Hardware-Accelerated CSS (Zero Layout Shifts • Fluid Typography)
├── Skiper UI Micro-Enhancements (Subpixel Progress, Cmd+K Spotlight)
└── Procedural Web Audio API (0 KB External Audio Payload)
        │
        ▼ (Dual-Cloud CI/CD CDN Deployment)
[HOSTING: Firebase Edge + GitHub Pages Pipeline]`
            },
            {
                title: '<i class="fas fa-sliders-h"></i> ATS Quantifiable Engineering Bullets',
                bullets: [
                    '<strong>Engineered</strong> a responsive, zero-framework developer portfolio achieving <strong>98+</strong> Google Lighthouse performance and accessibility scores through semantic HTML5, modern CSS, and modular JavaScript.',
                    '<strong>Programmed</strong> a custom procedural <strong>Web Audio API synthesizer engine</strong> from scratch to generate real-time polyphonic UI micro-interaction sound effects with zero external audio asset overhead (<code>0 KB</code> audio payload).',
                    '<strong>Designed</strong> an interactive relational state filter that dynamically links <strong>20+ technical skills</strong> to corresponding project architectures, alongside a persistent multi-accent CSS variable theming engine.'
                ]
            }
        ],
        notice: '<strong>Stack:</strong> Semantic HTML5, CSS3 Custom Properties, Vanilla JavaScript (ES6+), Web Audio API, Firebase Hosting & GitHub Pages.',
        actions: [
            { label: 'GitHub Repository', icon: 'fab fa-github', href: 'https://github.com/arpityadav626/arpityadav626.github.io', external: true, primary: true },
            { label: 'Live Portfolio (arpity.me)', icon: 'fas fa-external-link-alt', href: 'https://arpity.me/', external: true }
        ]
    },
    'ai-hub': {
        index: '05 // FRONTIER AI & MEDIA ECOSYSTEM',
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
            { label: 'Live App (Google Cloud)', icon: 'fas fa-external-link-alt', href: 'https://arpit-fun.web.app/', external: true, primary: true },
            { label: 'GitHub Repository', icon: 'fab fa-github', href: 'https://github.com/arpityadav626/arpit.fun', external: true }
        ]
    },
    'monolith-villa': {
        index: '06 // SPATIAL COMPUTING & 3D ARCHVIZ',
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

    if (typeof window.updateSkiper19ScrollStroke === 'function') {
        window.updateSkiper19ScrollStroke();
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
    const btn = document.getElementById('copy-email-btn');
    const bubble = document.getElementById('copy-toast-bubble');
    const icon = document.getElementById('copy-email-icon');
    if (!btn || !bubble) return;

    const email = 'arpityadav6794@gmail.com';
    let timeoutId = null;

    btn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await navigator.clipboard.writeText(email);
            if (typeof playButtonClick === 'function') playButtonClick();
            bubble.classList.add('active');
            if (icon) {
                icon.className = 'fas fa-check';
                icon.style.color = '#10b981';
            }
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                bubble.classList.remove('active');
                if (icon) {
                    icon.className = 'far fa-copy';
                    icon.style.color = '';
                }
            }, 2000);
        } catch (err) {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = email;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            bubble.classList.add('active');
            setTimeout(() => bubble.classList.remove('active'), 2000);
        }
    });
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

/* ======================================================================
   🟢 23. SKIPER 31: COMMAND PALETTE (CMD+K / CTRL+K SPOTLIGHT)
   Quick navigation, project jump, theme switch & resume download
   ====================================================================== */
(function initCommandPalette() {
    const modal = document.getElementById('cmd-palette-modal');
    const input = document.getElementById('cmd-palette-input');
    const triggerBtn = document.getElementById('cmd-palette-btn');
    const closeEsc = document.getElementById('cmd-close-esc');
    const items = Array.from(document.querySelectorAll('.cmd-item'));
    if (!modal || !input) return;

    let selectedIndex = 0;

    function openPalette() {
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        input.value = '';
        filterItems('');
        selectedIndex = 0;
        highlightItem(0);
        setTimeout(() => input.focus(), 50);
        if (typeof playNavClick === 'function') playNavClick();
    }

    function closePalette() {
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        input.blur();
    }

    function filterItems(query) {
        const q = query.toLowerCase().trim();
        let firstMatch = -1;
        items.forEach((item, idx) => {
            const text = item.innerText.toLowerCase();
            const match = !q || text.includes(q);
            item.style.display = match ? 'flex' : 'none';
            if (match && firstMatch === -1) firstMatch = idx;
        });

        // Hide empty groups
        document.querySelectorAll('.cmd-group').forEach(grp => {
            const visibleItems = grp.querySelectorAll('.cmd-item:not([style*="display: none"])');
            grp.style.display = visibleItems.length ? 'flex' : 'none';
        });

        selectedIndex = Math.max(0, firstMatch);
        highlightItem(selectedIndex);
    }

    function highlightItem(index) {
        const visibleItems = items.filter(it => it.style.display !== 'none');
        if (!visibleItems.length) return;
        visibleItems.forEach((it, i) => {
            if (i === index) {
                it.classList.add('selected');
                it.scrollIntoView({ block: 'nearest' });
            } else {
                it.classList.remove('selected');
            }
        });
    }

    function executeItem(item) {
        if (!item) return;
        closePalette();
        if (typeof playButtonClick === 'function') playButtonClick();

        const action = item.getAttribute('data-action');
        if (action === 'nav') {
            const target = item.getAttribute('data-target');
            const el = document.querySelector(target);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        } else if (action === 'project') {
            const projKey = item.getAttribute('data-project');
            if (typeof openProjectModal === 'function') {
                openProjectModal(projKey);
            } else {
                const trigger = document.querySelector(`[data-project="${projKey}"] .open-modal-btn`);
                if (trigger) trigger.click();
            }
        } else if (action === 'resume') {
            window.open('assets/Arpit_Yadav_Resume_Latest.pdf?v=2026.1', '_blank');
        } else if (action === 'theme') {
            const themeBtn = document.getElementById('theme-mode-btn');
            if (themeBtn) themeBtn.click();
        } else if (action === 'copy-email') {
            const copyBtn = document.getElementById('copy-email-btn');
            if (copyBtn) copyBtn.click();
        } else if (action === 'github') {
            window.open('https://github.com/arpityadav626', '_blank');
        } else if (action === 'linkedin') {
            window.open('https://www.linkedin.com/in/arpit-yadav-944983309/', '_blank');
        }
    }

    // Trigger button in header
    if (triggerBtn) {
        triggerBtn.addEventListener('click', openPalette);
    }

    // Close button / backdrop clicks
    if (closeEsc) closeEsc.addEventListener('click', closePalette);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closePalette();
    });

    // Keyboard shortcut: Cmd + K / Ctrl + K
    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
            e.preventDefault();
            if (modal.classList.contains('active')) {
                closePalette();
            } else {
                openPalette();
            }
        } else if (e.key === 'Escape' && modal.classList.contains('active')) {
            closePalette();
        }
    });

    // Live search
    input.addEventListener('input', (e) => {
        filterItems(e.target.value);
    });

    // Arrow navigation
    input.addEventListener('keydown', (e) => {
        const visibleItems = items.filter(it => it.style.display !== 'none');
        if (!visibleItems.length) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedIndex = (selectedIndex + 1) % visibleItems.length;
            highlightItem(selectedIndex);
            if (typeof playScrollTick === 'function') playScrollTick();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedIndex = (selectedIndex - 1 + visibleItems.length) % visibleItems.length;
            highlightItem(selectedIndex);
            if (typeof playScrollTick === 'function') playScrollTick();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            executeItem(visibleItems[selectedIndex]);
        }
    });

    // Click item directly
    items.forEach(item => {
        item.addEventListener('click', () => executeItem(item));
    });
})();

/* ========================================================
   🟢 SKIPER 31: SCROLL CONVERGE ANIMATION (Black Theme)
   - Stage 1: CharacterV1 3D letters ("see more from gxuri")
   - Stage 2: CharacterV2 Mac tech stack dock convergence
   - Stage 3: CharacterV3 3D rotated & arched icon snap
   ======================================================== */
function initSkiper31() {
    const stage1 = document.getElementById('skiper31-stage-1');
    const stage2 = document.getElementById('skiper31-stage-2');
    const stage3 = document.getElementById('skiper31-stage-3');
    const charRow = document.getElementById('skiper31-char-row');
    const iconsRow1 = document.getElementById('skiper31-icons-row-1');
    const iconsRow2 = document.getElementById('skiper31-icons-row-2');

    if (!stage1 || !charRow || !iconsRow1 || !iconsRow2) return;

    const text = "see more from gxuri";
    const characters = text.split("");
    const centerIndex = Math.floor(characters.length / 2);

    const macIcons = [
        { name: 'Discord', src: 'assets/mac/Discord.svg' },
        { name: 'Figma', src: 'assets/mac/figma.svg' },
        { name: 'Framer', src: 'assets/mac/Framer.svg' },
        { name: 'GitHub', src: 'assets/mac/Github.svg' },
        { name: 'MongoDB', src: 'assets/mac/Monog.svg' },
        { name: 'Notion', src: 'assets/mac/notion.svg' },
        { name: 'Pieces', src: 'assets/mac/Pieces.svg' },
        { name: 'Postman', src: 'assets/mac/Postman.svg' },
        { name: 'VS Code', src: 'assets/mac/vsCode.svg' }
    ];
    const iconCenterIndex = Math.floor(macIcons.length / 2);

    // 1. Populate Characters
    charRow.innerHTML = '';
    const charElements = [];
    characters.forEach((char, index) => {
        const span = document.createElement('span');
        span.className = `skiper31-char ${char === ' ' ? 'is-space' : ''}`;
        span.textContent = char;
        charRow.appendChild(span);
        charElements.push({
            el: span,
            distance: index - centerIndex
        });
    });

    // 2. Populate Icons for Stage 2 (CharacterV2)
    iconsRow1.innerHTML = '';
    const iconV2Elements = [];
    macIcons.forEach((item, index) => {
        const wrap = document.createElement('div');
        wrap.className = 'skiper31-icon-item sound-hover';
        wrap.title = item.name;
        wrap.innerHTML = `<img src="${item.src}" alt="${item.name}" class="skiper31-icon-img" loading="lazy">`;
        iconsRow1.appendChild(wrap);
        iconV2Elements.push({
            el: wrap,
            distance: index - iconCenterIndex
        });
    });

    // 3. Populate Icons for Stage 3 (CharacterV3)
    iconsRow2.innerHTML = '';
    const iconV3Elements = [];
    macIcons.forEach((item, index) => {
        const wrap = document.createElement('div');
        wrap.className = 'skiper31-icon-item sound-hover';
        wrap.title = item.name;
        wrap.innerHTML = `<img src="${item.src}" alt="${item.name}" class="skiper31-icon-img" loading="lazy">`;
        iconsRow2.appendChild(wrap);
        iconV3Elements.push({
            el: wrap,
            distance: index - iconCenterIndex
        });
    });

    function getStageProgress(el) {
        const rect = el.getBoundingClientRect();
        const total = el.offsetHeight - window.innerHeight;
        if (total <= 0) return 0;
        const current = -rect.top;
        return Math.min(Math.max(current / total, 0), 1);
    }

    let ticking = false;

    function updateSkiper31() {
        ticking = false;

        // Stage 1: CharacterV1
        // [0, 0.5] -> [distanceFromCenter * 50, 0]
        const p1 = getStageProgress(stage1);
        const factor1 = 1 - Math.min(p1 / 0.5, 1);
        charElements.forEach(({ el, distance }) => {
            const x = distance * 50 * factor1;
            const rotX = distance * 50 * factor1;
            el.style.transform = `translateX(${x}px) rotateX(${rotX}deg)`;
        });

        // Stage 2: CharacterV2
        // x: [distanceFromCenter * 50, 0]
        // scale: [0.75, 1]
        // y: [|distanceFromCenter| * 50, 0]
        if (stage2) {
            const p2 = getStageProgress(stage2);
            const factor2 = 1 - Math.min(p2 / 0.5, 1);
            const scale2 = 0.75 + (0.25 * (1 - factor2));
            iconV2Elements.forEach(({ el, distance }) => {
                const x = distance * 50 * factor2;
                const y = Math.abs(distance) * 50 * factor2;
                el.style.transform = `translateX(${x}px) translateY(${y}px) scale(${scale2})`;
            });
        }

        // Stage 3: CharacterV3
        // x: [distanceFromCenter * 90, 0]
        // rotate: [distanceFromCenter * 50, 0]
        // y: [-|distanceFromCenter| * 20, 0]
        // scale: [0.75, 1]
        if (stage3) {
            const p3 = getStageProgress(stage3);
            const factor3 = 1 - Math.min(p3 / 0.5, 1);
            const scale3 = 0.75 + (0.25 * (1 - factor3));
            iconV3Elements.forEach(({ el, distance }) => {
                const x = distance * 90 * factor3;
                const rotate = distance * 50 * factor3;
                const y = -Math.abs(distance) * 20 * factor3;
                el.style.transform = `translateX(${x}px) translateY(${y}px) rotate(${rotate}deg) scale(${scale3})`;
            });
        }
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateSkiper31);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener('resize', updateSkiper31, { passive: true });
    updateSkiper31();
}

initSkiper31();