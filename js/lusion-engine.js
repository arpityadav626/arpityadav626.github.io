/**
 * ARCHIVUM IMPERIALIS — Master Lusion Engine
 * Integrates Lusion Studio DOM & Stylesheet with:
 *  - 60fps Smooth Physics Virtual Scroll Loop
 *  - Continuous Video Play-Assist & Frame-Perfect Seeking
 *  - Lusion Preloader Digit Counter (000% -> 100%)
 *  - Circular Audio Visualizer & Procedural Sound
 *  - Fullscreen Video Overlay with Scrub Bar
 *  - 3D Relic Inspection with 360° Mouse Tilt & Lighting Spectrums
 */

const RELICS_DB = [
    {
        num: "RELIC 01",
        title: "NIKE OF SAMOTHRACE",
        sub: "Circa 190 BCE • Hellenistic Period",
        image: "assets/images/05_sculpture_nike.jpg",
        desc: "Unearthed on the Aegean island of Samothrace, this masterpiece personifies triumphant divine motion. The wind-swept chiton clings to her athletic form in hyper-realistic folds, accented by sacred 24K gold-leaf gilding along the primary feather pinions."
    },
    {
        num: "RELIC 02",
        title: "CELESTIAL ASTROLABE",
        sub: "Circa 200 BCE • Astronomical Reliquary",
        image: "assets/images/06_sculpture_astrolabe.jpg",
        desc: "An astronomical computational mechanism aligned with the legendary Antikythera lineage. Featuring 32 nested precision-geared bronze rings calculating planetary epicycles, surrounding a luminescent crystalline cyan core that reacts to cosmic azimuths."
    },
    {
        num: "RELIC 03",
        title: "MARCUS AURELIUS",
        sub: "Circa 161 CE • Stoic Imperial Forum",
        image: "assets/images/07_sculpture_aurelius.jpg",
        desc: "Carved from immaculate Thassos white marble, capturing the introspective soul of the philosopher-emperor who penned 'Meditations'. Deeply drilled ringlets frame an unyielding brow crowned by an imperial laurel wreath wrought from solid gold foil."
    }
];

class LusionAppEngine {
    constructor() {
        // DOM Caches
        this.pageContainer = document.getElementById('page-container');
        this.bgVideo = document.getElementById('bg-video');
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.scrollBar = document.getElementById('scroll-indicator-bar');
        
        // Header & Menu
        this.menuBtn = document.getElementById('header-right-menu-btn');
        this.headerMenu = document.getElementById('header-menu');
        this.soundBtn = document.getElementById('header-right-sound-btn');
        this.soundCanvas = document.getElementById('sound-canvas');
        this.soundCtx = this.soundCanvas ? this.soundCanvas.getContext('2d') : null;
        
        // Video Overlay Modal
        this.videoOverlay = document.getElementById('video-overlay');
        this.overlayPlayer = document.getElementById('video-overlay-player');
        this.overlayPlayBtn = document.getElementById('video-overlay__play-btn');
        this.overlayMuteBtn = document.getElementById('video-overlay__mute-btn');
        this.overlayCloseBtn = document.getElementById('video-overlay__mobile-close-btn');
        this.overlayProgress = document.getElementById('video-overlay__progress-active');
        this.overlayProgressBar = document.getElementById('video-overlay__progress-container');
        this.reelTrigger = document.getElementById('reel-play-trigger');
        
        // 3D Relic Modal
        this.relicModal = document.getElementById('lusion-relic-modal');
        this.relicImg = document.getElementById('relic-modal-img');
        this.relicClose = document.getElementById('relic-modal-close');
        this.relicStage = document.getElementById('relic-modal-stage');
        
        // Scroll & Momentum Physics
        this.targetScroll = 0;
        this.currentScroll = 0;
        this.maxScroll = 4800; // Total vertical distance of the page
        this.scrollVelocity = 0;
        this.videoDuration = 23.85;

        // Sound & Audio Engine
        this.soundEngine = window.soundEngine || null;
        this.isSoundOn = false;
        this.audioVisualizerAngle = 0;

        // Atmospheric Dust Particles
        this.particles = [];
        this.numParticles = 60;

        this.init();
    }

    init() {
        this.setupPreloader();
        this.setupParticles();
        this.setupVideo();
        this.setupSoundCanvas();
        this.setupMenu();
        this.setupVideoOverlay();
        this.setupRelicInspector();
        this.bindScrollEvents();
        this.startRenderLoop();
    }

    // =========================================================================
    // 01. LUSION PRELOADER (DIGIT COUNTER ROLL 000 -> 100)
    // =========================================================================
    setupPreloader() {
        const preloader = document.getElementById('preloader');
        const digitH = document.getElementById('digit-hundreds');
        const digitT = document.getElementById('digit-tens');
        const digitO = document.getElementById('digit-ones');
        if (!preloader) return;

        let percent = 0;
        const interval = setInterval(() => {
            percent += Math.floor(Math.random() * 7) + 3;
            if (percent > 100) percent = 100;

            const str = String(percent).padStart(3, '0');
            if (digitH) digitH.innerHTML = `<div class="preloader-percent-digit-num">${str[0]}</div>`;
            if (digitT) digitT.innerHTML = `<div class="preloader-percent-digit-num">${str[1]}</div>`;
            if (digitO) digitO.innerHTML = `<div class="preloader-percent-digit-num">${str[2]}</div>`;

            if (percent >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    preloader.style.transition = 'opacity 0.8s cubic-bezier(0.85, 0, 0.15, 1)';
                    preloader.style.opacity = '0';
                    setTimeout(() => {
                        preloader.style.display = 'none';
                    }, 800);
                }, 300);
            }
        }, 32);
    }

    // =========================================================================
    // 02. VIDEO SETUP
    // =========================================================================
    setupVideo() {
        if (!this.bgVideo) return;
        this.bgVideo.muted = true;
        this.bgVideo.playsInline = true;
        this.bgVideo.preload = 'auto';
        this.bgVideo.currentTime = 0;
        this.bgVideo.pause();

        this.bgVideo.addEventListener('loadedmetadata', () => {
            if (this.bgVideo.duration) {
                this.videoDuration = this.bgVideo.duration;
            }
        });
    }

    // =========================================================================
    // 03. SOUND BUTTON & CANVAS VISUALIZER
    // =========================================================================
    setupSoundCanvas() {
        if (!this.soundBtn) return;

        this.soundBtn.addEventListener('click', () => {
            this.isSoundOn = !this.isSoundOn;
            if (this.soundEngine) {
                if (!this.soundEngine.isInitialized) this.soundEngine.init();
                this.soundEngine.setMuted(!this.isSoundOn);
            }
            if (this.isSoundOn) {
                this.soundBtn.style.borderColor = '#e5c46b';
            } else {
                this.soundBtn.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            }
        });

        // Animate circular waveform inside sound button
        const renderWaveform = () => {
            if (this.soundCtx && this.soundCanvas) {
                this.soundCtx.clearRect(0, 0, 60, 60);
                const cx = 30, cy = 30;
                const r = 16;
                const bars = 16;

                for (let i = 0; i < bars; i++) {
                    const angle = (i / bars) * Math.PI * 2 + this.audioVisualizerAngle;
                    const h = this.isSoundOn ? (Math.sin(angle * 3 + this.audioVisualizerAngle * 4) * 5 + 6) : 3;
                    const x1 = cx + Math.cos(angle) * r;
                    const y1 = cy + Math.sin(angle) * r;
                    const x2 = cx + Math.cos(angle) * (r + h);
                    const y2 = cy + Math.sin(angle) * (r + h);

                    this.soundCtx.beginPath();
                    this.soundCtx.moveTo(x1, y1);
                    this.soundCtx.lineTo(x2, y2);
                    this.soundCtx.strokeStyle = this.isSoundOn ? '#e5c46b' : 'rgba(255,255,255,0.4)';
                    this.soundCtx.lineWidth = 1.5;
                    this.soundCtx.stroke();
                }

                if (this.isSoundOn) this.audioVisualizerAngle += 0.04;
            }
            requestAnimationFrame(renderWaveform);
        };
        requestAnimationFrame(renderWaveform);
    }

    // =========================================================================
    // 04. MENU DRAWER
    // =========================================================================
    setupMenu() {
        if (!this.menuBtn || !this.headerMenu) return;

        let isOpen = false;
        this.menuBtn.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                this.headerMenu.style.transform = 'translate3d(0, 0, 0)';
                this.headerMenu.style.opacity = '1';
                this.headerMenu.style.pointerEvents = 'auto';
                this.menuBtn.classList.add('--active');
            } else {
                this.headerMenu.style.transform = 'translate3d(100%, 0, 0)';
                this.headerMenu.style.opacity = '0';
                this.headerMenu.style.pointerEvents = 'none';
                this.menuBtn.classList.remove('--active');
            }
        });

        // Close menu on link click
        document.querySelectorAll('.header-menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                isOpen = false;
                this.headerMenu.style.transform = 'translate3d(100%, 0, 0)';
                this.headerMenu.style.opacity = '0';
                this.headerMenu.style.pointerEvents = 'none';
                this.menuBtn.classList.remove('--active');

                const href = link.getAttribute('href');
                if (href === '#home-hero') this.targetScroll = 0;
                else if (href === '#home-reel') this.targetScroll = 1200;
                else if (href === '#home-featured') this.targetScroll = 2600;
            });
        });
    }

    // =========================================================================
    // 05. FULLSCREEN VIDEO OVERLAY
    // =========================================================================
    setupVideoOverlay() {
        if (this.reelTrigger) {
            this.reelTrigger.addEventListener('click', () => this.openVideoOverlay());
        }

        if (this.overlayCloseBtn) {
            this.overlayCloseBtn.addEventListener('click', () => this.closeVideoOverlay());
        }

        if (this.overlayPlayBtn && this.overlayPlayer) {
            this.overlayPlayBtn.addEventListener('click', () => {
                if (this.overlayPlayer.paused) {
                    this.overlayPlayer.play();
                    this.overlayPlayBtn.textContent = 'PAUSE';
                } else {
                    this.overlayPlayer.pause();
                    this.overlayPlayBtn.textContent = 'PLAY';
                }
            });
        }

        if (this.overlayMuteBtn && this.overlayPlayer) {
            this.overlayMuteBtn.addEventListener('click', () => {
                this.overlayPlayer.muted = !this.overlayPlayer.muted;
                this.overlayMuteBtn.textContent = this.overlayPlayer.muted ? 'UNMUTE' : 'MUTE';
            });
        }

        if (this.overlayPlayer) {
            this.overlayPlayer.addEventListener('timeupdate', () => {
                if (this.overlayProgress) {
                    const pct = (this.overlayPlayer.currentTime / this.overlayPlayer.duration) * 100;
                    this.overlayProgress.style.width = `${pct}%`;
                }
            });
        }

        if (this.overlayProgressBar && this.overlayPlayer) {
            this.overlayProgressBar.addEventListener('click', (e) => {
                const rect = this.overlayProgressBar.getBoundingClientRect();
                const frac = (e.clientX - rect.left) / rect.width;
                this.overlayPlayer.currentTime = frac * this.overlayPlayer.duration;
            });
        }
    }

    openVideoOverlay() {
        if (!this.videoOverlay || !this.overlayPlayer) return;
        this.videoOverlay.style.display = 'flex';
        this.videoOverlay.style.opacity = '1';
        this.overlayPlayer.currentTime = this.bgVideo.currentTime || 0;
        this.overlayPlayer.play();
        if (this.overlayPlayBtn) this.overlayPlayBtn.textContent = 'PAUSE';
    }

    closeVideoOverlay() {
        if (!this.videoOverlay || !this.overlayPlayer) return;
        this.overlayPlayer.pause();
        this.videoOverlay.style.opacity = '0';
        setTimeout(() => {
            this.videoOverlay.style.display = 'none';
        }, 300);
    }

    // =========================================================================
    // 06. 3D RELIC INSPECTOR MODAL
    // =========================================================================
    setupRelicInspector() {
        if (this.relicClose) {
            this.relicClose.addEventListener('click', () => this.closeRelicModal());
        }

        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeRelicModal();
                this.closeVideoOverlay();
            }
        });

        // 3D Tilt on mouse drag
        if (this.relicStage && this.relicImg) {
            let isDragging = false;
            let startX = 0, startY = 0;
            let rotX = 0, rotY = 0;

            this.relicStage.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const dx = e.clientX - startX;
                const dy = e.clientY - startY;
                startX = e.clientX;
                startY = e.clientY;

                rotY += dx * 0.5;
                rotX -= dy * 0.35;
                rotX = Math.max(-25, Math.min(25, rotX));

                this.relicImg.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.08)`;
            });

            window.addEventListener('mouseup', () => { isDragging = false; });

            // Reset
            const resetBtn = document.getElementById('relic-reset-btn');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    rotX = 0;
                    rotY = 0;
                    this.relicImg.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)`;
                });
            }

            // Lighting Modes
            document.querySelectorAll('.lusion-mode-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.lusion-mode-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const mode = btn.dataset.mode;
                    if (this.relicImg) {
                        this.relicImg.className = `lusion-modal-img mode-${mode}`;
                    }
                });
            });
        }
    }

    openRelicModal(index) {
        const relic = RELICS_DB[index];
        if (!relic || !this.relicModal) return;

        document.getElementById('relic-modal-num').textContent = relic.num;
        document.getElementById('relic-modal-title').textContent = relic.title;
        document.getElementById('relic-modal-sub').textContent = relic.sub;
        document.getElementById('relic-modal-desc').textContent = relic.desc;
        if (this.relicImg) {
            this.relicImg.src = relic.image;
            this.relicImg.alt = relic.title;
            this.relicImg.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)`;
        }

        this.relicModal.classList.add('open');
    }

    closeRelicModal() {
        if (this.relicModal) this.relicModal.classList.remove('open');
    }

    // =========================================================================
    // 07. PARTICLES
    // =========================================================================
    setupParticles() {
        if (!this.canvas) return;
        const resize = () => {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push({
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                size: Math.random() * 2 + 0.6,
                speedX: (Math.random() - 0.5) * 0.3,
                speedY: -Math.random() * 0.4 - 0.1,
                opacity: Math.random() * 0.5 + 0.15
            });
        }
    }

    // =========================================================================
    // 08. THE SCROLL METHOD: TRUE INERTIA MOUSE WHEEL & VIDEO PLAY-ASSIST
    // =========================================================================
    bindScrollEvents() {
        // Continuous delta accumulation on mouse wheel
        window.addEventListener('wheel', (e) => {
            const delta = e.deltaY * 1.5;
            this.targetScroll = Math.max(0, Math.min(this.maxScroll, this.targetScroll + delta));
        }, { passive: true });

        // Touch swipe support
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            const curY = e.touches[0].clientY;
            const diff = (touchStartY - curY) * 2.4;
            touchStartY = curY;
            this.targetScroll = Math.max(0, Math.min(this.maxScroll, this.targetScroll + diff));
        }, { passive: true });

        // Back to top button
        const toTopBtn = document.getElementById('footer-bottom-up');
        if (toTopBtn) {
            toTopBtn.addEventListener('click', () => {
                this.targetScroll = 0;
            });
        }
    }

    startRenderLoop() {
        const tick = () => {
            // 1. Physics Lerp (Silky Smooth)
            const delta = this.targetScroll - this.currentScroll;
            this.currentScroll += delta * 0.085;
            this.scrollVelocity = delta;

            // 2. Translate Lusion Page Container
            if (this.pageContainer) {
                this.pageContainer.style.transform = `translate3d(0px, -${this.currentScroll}px, 0px)`;
            }

            // 3. Update Lusion Scroll Indicator Bar
            const progress = Math.max(0, Math.min(1, this.currentScroll / this.maxScroll));
            if (this.scrollBar) {
                this.scrollBar.style.transform = `translate3d(0px, ${progress * 220}px, 0px)`;
            }

            // 4. Hardware Video Scrubbing Sync
            this.syncVideo(progress, delta);

            // 5. Draw Ambient Dust
            this.drawParticles();

            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    syncVideo(progress, delta) {
        if (!this.bgVideo) return;

        const targetTime = progress * this.videoDuration;
        const timeDiff = targetTime - this.bgVideo.currentTime;

        // FORWARD SCROLL WITH MOMENTUM: Play-Assist at dynamic playback rate
        if (delta > 2.0 && timeDiff > 0.08) {
            const speed = Math.min(3.2, Math.max(0.6, Math.abs(delta) * 0.04));
            this.bgVideo.playbackRate = speed;
            if (this.bgVideo.paused) {
                this.bgVideo.play().catch(() => {});
            }
        } 
        // STOPPING OR FINE-SCRUBBING
        else if (Math.abs(delta) <= 2.0 || timeDiff <= 0.02) {
            if (!this.bgVideo.paused) {
                this.bgVideo.pause();
            }

            // Precision frame alignment
            if (Math.abs(timeDiff) > 0.03 && !this.bgVideo.seeking) {
                if (this.bgVideo.fastSeek) {
                    this.bgVideo.fastSeek(targetTime);
                } else {
                    this.bgVideo.currentTime = targetTime;
                }
            }
        } 
        // REVERSE SCROLLING: Precision Backward Seek
        else if (delta < -2.0) {
            if (!this.bgVideo.paused) this.bgVideo.pause();
            if (!this.bgVideo.seeking) {
                if (this.bgVideo.fastSeek) {
                    this.bgVideo.fastSeek(targetTime);
                } else {
                    this.bgVideo.currentTime = targetTime;
                }
            }
        }
    }

    drawParticles() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let p of this.particles) {
            p.y += p.speedY;
            p.x += p.speedX;

            if (p.y < 0) p.y = this.canvas.height;
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(229, 196, 107, ${p.opacity})`;
            this.ctx.fill();
        }
    }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
    window.lusionEngine = new LusionAppEngine();
});
