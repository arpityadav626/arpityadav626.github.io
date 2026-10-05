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