/* ========================================================
   ARPIT YADAV PORTFOLIO ENGINE — ZERO-CRASH ARCHITECTURE
   Progressive Enhancement, Web Audio Synthesis & Modal Lightbox
======================================================== */

// 1. Enable Progressive Enhancement for CSS Reveals
document.documentElement.classList.add('js-enabled');

/* ========================================================
   2. STUDIO-GRADE ZERO-GLITCH SOUND ENGINE (Web Audio API)
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
        if (!AudioContextClass) return;
        audioCtx = new AudioContextClass();

        // Dynamics Compressor (Limiter) - eliminates distortion & popping
        masterCompressor = audioCtx.createDynamicsCompressor();
        masterCompressor.threshold.setValueAtTime(-18, audioCtx.currentTime);
        masterCompressor.knee.setValueAtTime(30, audioCtx.currentTime);
        masterCompressor.ratio.setValueAtTime(12, audioCtx.currentTime);
        masterCompressor.attack.setValueAtTime(0.003, audioCtx.currentTime);
        masterCompressor.release.setValueAtTime(0.15, audioCtx.currentTime);

        // Master Gain
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0.7, audioCtx.currentTime);

        masterCompressor.connect(masterGain);
        masterGain.connect(audioCtx.destination);
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Unlock audio on first interaction
['click', 'touchstart', 'keydown'].forEach(evt => {
    window.addEventListener(evt, () => initAudio(), { once: true, passive: true });
});

// Sound: Soft Button Hover (Micro-air tick)
function playButtonHover() {
    if (!soundEnabled) return;
    const now = performance.now();
    if (now - lastHoverTime < 50) return;
    lastHoverTime = now;

    initAudio();
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const filter = audioCtx.createBiquadFilter();

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.025);

    gain.gain.setValueAtTime(0.0001, t);
    gain.gain.linearRampToValueAtTime(0.02, t + 0.003);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.025);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterCompressor);

    osc.start(t);
    osc.stop(t + 0.025);
}

// Sound: Deep Acoustic Card Hover
function playCardHover() {
    if (!soundEnabled) return;
    const now = performance.now();
    if (now - lastHoverTime < 70) return;
    lastHoverTime = now;

    initAudio();
    if (!audioCtx) return;
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
    gain.gain.linearRampToValueAtTime(0.04, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.07);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(masterCompressor);

    osc.start(t);
    osc.stop(t + 0.07);
}

// Sound: Crisp Switch Click
function playButtonClick() {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;
    const t = audioCtx.currentTime;

    const oscClick = audioCtx.createOscillator();
    const gainClick = audioCtx.createGain();
    oscClick.type = 'triangle';
    oscClick.frequency.setValueAtTime(950, t);
    oscClick.frequency.exponentialRampToValueAtTime(280, t + 0.04);

    gainClick.gain.setValueAtTime(0.0001, t);
    gainClick.gain.linearRampToValueAtTime(0.05, t + 0.002);
    gainClick.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);

    oscClick.connect(gainClick);
    gainClick.connect(masterCompressor);

    oscClick.start(t);
    oscClick.stop(t + 0.04);
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

// Event Bindings for Sounds
function bindAudioTriggers() {
    document.querySelectorAll('.case-study-card, .hero-visual-card, .skill-category-card').forEach(card => {
        card.addEventListener('mouseenter', playCardHover);
    });

    document.querySelectorAll('.btn, .card-btn, .btn-pill, .open-cert-btn, .btn-cert-link').forEach(btn => {
        btn.addEventListener('mouseenter', playButtonHover);
        btn.addEventListener('click', playButtonClick);
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('mouseenter', playButtonHover);
        link.addEventListener('click', playButtonClick);
    });

    document.querySelectorAll('.skill-pill, .social-link').forEach(item => {
        item.addEventListener('mouseenter', playButtonHover);
    });
}
bindAudioTriggers();

/* ========================================================
   3. SCROLL REVEAL ANIMATIONS (Intersection Observer)
======================================================== */
const revealElements = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
} else {
    // Fallback for older browsers
    revealElements.forEach(el => el.classList.add('active'));
}

/* ========================================================
   4. 3D TILT EFFECT ON CARDS (Respects Reduced Motion)
======================================================== */
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion && window.innerWidth > 992) {
    document.querySelectorAll('.tilt-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = ((y - centerY) / centerY) * -4;
            const rotateY = ((x - centerX) / centerX) * 4;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)`;
        });
    });
}

/* ========================================================
   5. MOBILE NAVIGATION (Accessible ARIA Toggle)
======================================================== */
const menuToggle = document.getElementById('menu-toggle');
const navbar = document.getElementById('navbar');

if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
        menuToggle.setAttribute('aria-expanded', !isExpanded);
        navbar.classList.toggle('active');
        playButtonClick();
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navbar.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        });
    });
}

/* ========================================================
   6. OFFICIAL CERTIFICATE LIGHTBOX MODAL
======================================================== */
const certModal = document.getElementById('cert-modal');
const modalClose = document.getElementById('modal-close');
const openCertButtons = document.querySelectorAll('.open-cert-btn');

function openCertificateModal() {
    if (certModal) {
        certModal.classList.add('active');
        certModal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
        playButtonClick();
    }
}

function closeCertificateModal() {
    if (certModal) {
        certModal.classList.remove('active');
        certModal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        playButtonClick();
    }
}

openCertButtons.forEach(btn => {
    btn.addEventListener('click', openCertificateModal);
});

if (modalClose) {
    modalClose.addEventListener('click', closeCertificateModal);
}

if (certModal) {
    // Close on backdrop click
    certModal.addEventListener('click', (e) => {
        if (e.target === certModal) {
            closeCertificateModal();
        }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && certModal.classList.contains('active')) {
            closeCertificateModal();
        }
    });
}

/* ========================================================
   7. LIVE FORMSPREE EMAIL SUBMISSION (AJAX / Fetch)
======================================================== */
const contactForm = document.getElementById('contact-form');
const formMsg = document.getElementById('form-msg');
const submitBtn = document.getElementById('submit-btn');

if (contactForm && formMsg && submitBtn) {
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
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
                formMsg.textContent = "🎉 Thank you! Your message has been sent successfully. I will get back to you within 24 hours.";
                contactForm.reset();
            } else {
                formMsg.style.color = '#f43f5e';
                formMsg.textContent = "Oops! Something went wrong. Please reach out directly to arpityadav6794@gmail.com";
            }
        } catch (error) {
            formMsg.style.color = '#f43f5e';
            formMsg.textContent = "Network error. Please check your internet connection or email directly.";
        } finally {
            submitBtn.innerHTML = originalBtnContent;
            submitBtn.disabled = false;
            setTimeout(() => {
                formMsg.textContent = '';
            }, 8000);
        }
    });
}