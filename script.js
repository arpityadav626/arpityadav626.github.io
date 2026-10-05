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

    // 4. Skills, Socials & New Tech Badges
    document.querySelectorAll('.skill-pill, .social-link, .git-commit-node, .curved-badge-wrapper, .cmd-item, .sound-hover:not(.nav-link):not(.btn):not(.card-btn)').forEach(item => {
        item.addEventListener('mouseenter', playButtonHover);
        item.addEventListener('click', playButtonClick);
    });
}
bindSounds();

/* ========================================================
   2. LENIS BUTTERY SMOOTH SCROLL (from noth.in)
======================================================== */
let lenis = null;
try {
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({
            duration: 1.25,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            touchMultiplier: 2,
            infinite: false,
        });

        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // Intercept anchor clicks for buttery smooth target scroll
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId && targetId !== '#') {
                    const targetEl = document.querySelector(targetId);
                    if (targetEl) {
                        e.preventDefault();
                        lenis.scrollTo(targetEl, { offset: -70, duration: 1.2 });
                    }
                }
            });
        });
    }
} catch (err) {
    console.warn('Lenis smooth scroll fallback:', err);
}

/* ========================================================
   3. ARPIT-OS TERMINAL BOOT PRELOADER RUNNER (eddy + noth.in)
======================================================== */
const preloader = document.getElementById('preloader');
const preloaderCount = document.getElementById('preloader-count');
const preloaderProgress = document.getElementById('preloader-progress');
const preloaderStatus = document.getElementById('preloader-status');
const logLines = document.querySelectorAll('.log-line');

if (preloader) {
    let progress = 0;
    let logIndex = 0;

    const interval = setInterval(() => {
        progress += Math.floor(Math.random() * 7) + 4;
        
        // Sequentially reveal terminal boot lines
        if (progress > 20 && logIndex === 0 && logLines[0]) {
            logLines[0].classList.add('visible');
            playButtonHover();
            logIndex = 1;
        } else if (progress > 45 && logIndex === 1 && logLines[1]) {
            logLines[1].classList.add('visible');
            playButtonHover();
            logIndex = 2;
        } else if (progress > 70 && logIndex === 2 && logLines[2]) {
            logLines[2].classList.add('visible');
            playButtonHover();
            logIndex = 3;
        } else if (progress > 90 && logIndex === 3 && logLines[3]) {
            logLines[3].classList.add('visible');
            playButtonHover();
            logIndex = 4;
        }

        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Format as three digit kinetic counter (e.g. 100%)
            if (preloaderCount) preloaderCount.textContent = '100%';
            if (preloaderProgress) preloaderProgress.style.width = '100%';
            if (preloaderStatus) preloaderStatus.textContent = 'ARPIT-OS ONLINE // READY';
            
            // Make all logs fully visible
            logLines.forEach(l => l.classList.add('visible'));

            setTimeout(() => {
                playCozyChime();
                preloader.classList.add('preloader-hidden');
                
                // Cascading reveal for Hero Section
                const hero = document.getElementById('home');
                if (hero) hero.classList.add('active');
            }, 350);
        } else {
            // Three digit kinetic formatting: 004%, 042%, etc.
            const formatted = String(progress).padStart(3, '0');
            if (preloaderCount) preloaderCount.textContent = `${formatted}%`;
            if (preloaderProgress) preloaderProgress.style.width = `${progress}%`;
        }
    }, 40);
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
   8. DEVELOPER COMMAND PALETTE ENGINE (Ctrl+K / ⌘K)
   (from eddy-naboulet.dev)
======================================================== */
const cmdPalette = document.getElementById('cmd-palette');
const cmdBackdrop = document.getElementById('cmd-backdrop');
const cmdInput = document.getElementById('cmd-input');
const cmdList = document.getElementById('cmd-list');
const cmdCloseBtn = document.getElementById('cmd-close-btn');
const cmdTriggerBtn = document.getElementById('cmd-btn');
const toastNotify = document.getElementById('toast-notify');

function showToast(msg) {
    if (!toastNotify) return;
    toastNotify.textContent = msg;
    toastNotify.classList.add('show');
    setTimeout(() => {
        toastNotify.classList.remove('show');
    }, 2800);
}

function openCommandPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.add('open');
    cmdPalette.setAttribute('aria-hidden', 'false');
    playButtonClick();
    if (cmdInput) {
        cmdInput.value = '';
        cmdInput.focus();
        filterCommands('');
    }
}

function closeCommandPalette() {
    if (!cmdPalette) return;
    cmdPalette.classList.remove('open');
    cmdPalette.setAttribute('aria-hidden', 'true');
    playButtonHover();
}

if (cmdTriggerBtn) {
    cmdTriggerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openCommandPalette();
    });
}

if (cmdBackdrop) {
    cmdBackdrop.addEventListener('click', closeCommandPalette);
}

if (cmdCloseBtn) {
    cmdCloseBtn.addEventListener('click', closeCommandPalette);
}

// Global Keyboard Shortcut: Ctrl + K or Cmd + K & Esc
window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (cmdPalette && cmdPalette.classList.contains('open')) {
            closeCommandPalette();
        } else {
            openCommandPalette();
        }
    } else if (e.key === 'Escape' && cmdPalette && cmdPalette.classList.contains('open')) {
        closeCommandPalette();
    }
});

// Realtime command filter
function filterCommands(query) {
    const q = query.toLowerCase().trim();
    const items = document.querySelectorAll('.cmd-item');

    items.forEach(item => {
        const title = item.querySelector('.cmd-item-title').textContent.toLowerCase();
        const shortcut = (item.querySelector('.cmd-item-shortcut')?.textContent || '').toLowerCase();
        if (!q || title.includes(q) || shortcut.includes(q)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });

    const visibleItems = document.querySelectorAll('.cmd-item:not([style*="display: none"])');
    items.forEach(i => i.classList.remove('selected'));
    if (visibleItems.length > 0) {
        visibleItems[0].classList.add('selected');
    }
}

if (cmdInput) {
    cmdInput.addEventListener('input', (e) => {
        filterCommands(e.target.value);
    });

    // Keyboard navigation (Arrow keys + Enter)
    cmdInput.addEventListener('keydown', (e) => {
        const visibleItems = Array.from(document.querySelectorAll('.cmd-item:not([style*="display: none"])'));
        if (!visibleItems.length) return;

        let currentIndex = visibleItems.findIndex(i => i.classList.contains('selected'));

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            playButtonHover();
            if (currentIndex >= 0) visibleItems[currentIndex].classList.remove('selected');
            currentIndex = (currentIndex + 1) % visibleItems.length;
            visibleItems[currentIndex].classList.add('selected');
            visibleItems[currentIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            playButtonHover();
            if (currentIndex >= 0) visibleItems[currentIndex].classList.remove('selected');
            currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
            visibleItems[currentIndex].classList.add('selected');
            visibleItems[currentIndex].scrollIntoView({ block: 'nearest' });
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (currentIndex >= 0) {
                executeCommand(visibleItems[currentIndex]);
            }
        }
    });
}

// Action executor
function executeCommand(item) {
    const action = item.getAttribute('data-action');
    const target = item.getAttribute('data-target');
    closeCommandPalette();
    playButtonClick();

    if (action === 'goto' && target) {
        const targetEl = document.querySelector(target);
        if (targetEl) {
            if (lenis) {
                lenis.scrollTo(targetEl, { offset: -70, duration: 1.2 });
            } else {
                targetEl.scrollIntoView({ behavior: 'smooth' });
            }
        }
    } else if (action === 'resume') {
        window.open('assets/Arpit_Yadav_Resume.pdf', '_blank');
        showToast('📄 Opening 1-Page Vector Resume...');
    } else if (action === 'toggle-sound') {
        soundEnabled = !soundEnabled;
        const soundIcon = document.getElementById('sound-icon');
        const soundText = document.getElementById('sound-text');
        if (soundIcon && soundText) {
            soundIcon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
            soundText.textContent = soundEnabled ? 'COZY SFX' : 'SFX MUTED';
        }
        showToast(soundEnabled ? '🔊 Sound Engine: Enabled' : '🔇 Sound Engine: Muted');
    } else if (action === 'copy-link') {
        navigator.clipboard.writeText('https://arpit-portfolio-2026.web.app').then(() => {
            showToast('📋 Copied portfolio link to clipboard!');
        }).catch(() => {
            showToast('https://arpit-portfolio-2026.web.app');
        });
    }
}

document.querySelectorAll('.cmd-item').forEach(item => {
    item.addEventListener('click', () => executeCommand(item));
    item.addEventListener('mouseenter', () => {
        document.querySelectorAll('.cmd-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
    });
});