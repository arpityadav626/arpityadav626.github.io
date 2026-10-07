/**
 * ARCHIVUM IMPERIALIS — Unified Spatial Scroll & Video Engine
 * Synthesizing Lusion, Active Theory, Makemepulse, and The Boat
 * Features:
 *  - True Inertia Physics-Based Mouse Wheel Video Scrubbing
 *  - Hardware Play-Assist for 60fps forward glide & precision backward seek
 *  - Makemepulse Atmospheric Volumetric Dust Particle Canvas
 *  - The Boat Chapter Rail & Settings Bar (Sound, Auto-Cruise, Fullscreen)
 *  - Lusion Rolling Digit Counter & Scroll Track Thumb
 *  - Floating Editorial Typography matching prompt video
 */

const CHAPTERS_DATA = [
    {
        id: 0,
        startTime: 0.0,
        endTime: 4.5,
        title: "THE MONUMENTAL ARCHWAY",
        subtitle: "Baroque-Mughal Fusion Courtyard",
        sector: "CHAMBER 01 • MONUMENTAL ENTRANCE",
        position: "right",
        text: "Eye-level forward tracking shot moving smoothly across an open stone-paved courtyard toward a monumental Baroque-Mughal fusion triumphal archway made of intricately hand-carved beige Dholpur sandstone. Weathered textures and ornate bas-relief floral motifs flank the entrance.",
        audioCue: "whoosh",
        elevation: "+24.0 m"
    },
    {
        id: 1,
        startTime: 4.5,
        endTime: 9.0,
        title: "THE MALACHITE ROTUNDA",
        subtitle: "Emerald Columns & Glass Oculus",
        sector: "CHAMBER 02 • THE GREAT ROTUNDA",
        position: "left",
        text: "The camera glides effortlessly through the portal into an expansive neoclassical circular rotunda. Towering Corinthian columns carved from deep-veined emerald-green Malachite line the perimeter. Below, a mirror-reflective checkerboard floor of white Carrara marble reflects the architecture.",
        audioCue: "hall",
        elevation: "+18.5 m"
    },
    {
        id: 2,
        startTime: 9.0,
        endTime: 15.0,
        title: "THE ROYAL COLONNADE",
        subtitle: "Gilded Barrel Vaults & Volumetric Light",
        sector: "CHAMBER 03 • THE GILDED COLONNADE",
        position: "right",
        text: "Ribbed barrel vaults lined with subtle antique gold-leaf filigree moldings. Cast bronze wall sconces holding warm-flickering beeswax candles line the stone walls. Long golden shafts of volumetric dust-specked sunlight (god rays) cut diagonally across the corridor.",
        audioCue: "door",
        elevation: "+8.0 m"
    },
    {
        id: 3,
        startTime: 15.0,
        endTime: 19.5,
        title: "NIKE OF SAMOTHRACE",
        subtitle: "The Winged Victory • 24K Gold Leaf",
        sector: "CHAMBER 04 • SANCTUARY OF VICTORY",
        position: "left",
        text: "The camera glides into a high-contrast neoclassical sanctuary approaching a life-sized white marble sculpture of a winged goddess. The wings feature delicate, weathered gold-leaf gilding across the primary feather tips under soft top-down skylight beams.",
        audioCue: "chime",
        relicId: 0,
        elevation: "-14.0 m"
    },
    {
        id: 4,
        startTime: 19.5,
        endTime: 22.0,
        title: "THE CELESTIAL ASTROLABE",
        subtitle: "Kinetic Armillary Sphere with Cyan Core",
        sector: "CHAMBER 05 • CELESTIAL RELIQUARY",
        position: "right",
        text: "The camera pans smoothly past an intricate antique brass celestial armillary sphere sitting on a marble plinth, housing a glowing ethereal cyan glass core inside concentric rotating precision-geared metal rings.",
        audioCue: "chime",
        relicId: 1,
        elevation: "-28.0 m"
    },
    {
        id: 5,
        startTime: 22.0,
        endTime: 23.85,
        title: "MARCUS AURELIUS",
        subtitle: "The Philosopher Emperor in Pure Marble",
        sector: "CHAMBER 06 • IMPERIAL SANCTUM",
        position: "center",
        text: "The camera glides directly to an extreme detailed close-up of a classical Roman Emperor bust carved from pure Thassos white marble. The bust wears a highly polished, reflective solid gold laurel wreath crown under dramatic directional museum spotlighting.",
        audioCue: "emperor",
        relicId: 2,
        isHeroEnding: true,
        elevation: "-42.0 m"
    }
];

class MasterSpatialEngine {
    constructor() {
        // DOM Elements
        this.video = document.getElementById('master-video');
        this.canvas = document.getElementById('ambient-canvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        // UI
        this.preloader = document.getElementById('preloader');
        this.preloaderDigits = document.getElementById('preloader-digits');
        this.loaderSpineProgress = document.getElementById('loader-spine-progress');
        this.enterBtn = document.getElementById('enter-btn');
        this.headerSector = document.getElementById('header-sector');
        this.tourBtn = document.getElementById('tour-toggle-btn');
        this.tourBtnText = document.getElementById('tour-btn-text');
        this.soundBtn = document.getElementById('sound-toggle-btn');
        this.soundStatusText = document.getElementById('sound-status-text');
        this.headerEqualizer = document.getElementById('header-equalizer');
        
        // Chapter & Indicator
        this.chapterNodes = document.querySelectorAll('.chapter-node');
        this.scrollTrackThumb = document.getElementById('scroll-track-thumb');
        this.editorialContainer = document.getElementById('editorial-cards-container');
        
        // Timeline & Dock
        this.timelineTrack = document.getElementById('timeline-track');
        this.timelineProgress = document.getElementById('timeline-progress');
        this.timelineScrubber = document.getElementById('timeline-scrubber');
        this.timelineTimecode = document.getElementById('timeline-timecode');
        this.timelinePercent = document.getElementById('timeline-percent');
        this.nextChapterName = document.getElementById('next-chapter-name');
        this.nextChapterBar = document.getElementById('next-chapter-bar-inner');
        
        // Settings LEDs
        this.dockSoundBtn = document.getElementById('dock-sound-btn');
        this.dockSoundLed = document.getElementById('dock-sound-led');
        this.dockAutoBtn = document.getElementById('dock-auto-btn');
        this.dockAutoLed = document.getElementById('dock-auto-led');
        this.dockFsBtn = document.getElementById('dock-fs-btn');
        
        // Cursor
        this.cursorDot = document.getElementById('cursor-dot');
        this.cursorRing = document.getElementById('cursor-ring');
        this.cursorLabel = document.getElementById('cursor-label');

        // Scroll & Physics State
        this.virtualScrollTarget = 0;
        this.virtualScrollCurrent = 0;
        this.maxScroll = 8000; // tactile resolution
        this.scrollVelocity = 0;
        this.isAutoCruising = false;
        this.autoCruiseSpeed = 3.2; // pixels per frame
        this.isDraggingTimeline = false;
        this.currentChapterIdx = 0;
        this.totalDuration = 23.85; // master video duration
        
        // Sound & Ambient Engine
        this.soundEngine = window.soundEngine || null;
        this.isSoundActive = false;
        this.lastAudioCueChapter = -1;

        // Particle System (Makemepulse Volumetric Dust)
        this.particles = [];
        this.numParticles = 75;

        this.init();
    }

    init() {
        this.setupCursor();
        this.setupParticles();
        this.renderEditorialCards();
        this.setupVideo();
        this.bindEvents();
        this.runPreloader();
        this.startRenderLoop();
    }

    // =========================================================================
    // 01. PRELOADER & GATEWAY (Lusion Counter + Spine)
    // =========================================================================
    runPreloader() {
        let count = 0;
        const interval = setInterval(() => {
            count += Math.floor(Math.random() * 6) + 3;
            if (count > 100) count = 100;

            if (this.preloaderDigits) {
                this.preloaderDigits.textContent = String(count).padStart(3, '0');
            }
            if (this.loaderSpineProgress) {
                this.loaderSpineProgress.style.height = `${count}%`;
            }

            if (count >= 100) {
                clearInterval(interval);
                if (this.enterBtn) {
                    this.enterBtn.style.opacity = '1';
                    this.enterBtn.style.transform = 'translateY(0)';
                }
            }
        }, 35);

        if (this.enterBtn) {
            this.enterBtn.addEventListener('click', () => {
                this.unlockSanctuary();
            });
        }
    }

    unlockSanctuary() {
        if (this.preloader) {
            this.preloader.classList.add('fade-out');
        }
        // Initialize sound on user gesture
        if (this.soundEngine) {
            this.soundEngine.init();
            this.toggleSound(true);
        }
        if (this.video) {
            this.video.currentTime = 0;
        }
    }

    // =========================================================================
    // 02. VIDEO SETUP & PLAY-ASSIST
    // =========================================================================
    setupVideo() {
        if (!this.video) return;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.preload = 'auto';
        this.video.currentTime = 0;
        this.video.pause();

        // Extract accurate duration when metadata loads
        this.video.addEventListener('loadedmetadata', () => {
            if (this.video.duration && !isNaN(this.video.duration)) {
                this.totalDuration = this.video.duration;
            }
        });
    }

    // =========================================================================
    // 03. CUSTOM CURSOR
    // =========================================================================
    setupCursor() {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            if (this.cursorDot) {
                this.cursorDot.style.left = `${mouseX}px`;
                this.cursorDot.style.top = `${mouseY}px`;
            }
        });

        // Hover states on interactive elements
        const hoverTargets = document.querySelectorAll('button, .chapter-node, .timeline-track, .relic-card');
        hoverTargets.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (this.cursorRing) this.cursorRing.classList.add('hover-active');
            });
            el.addEventListener('mouseleave', () => {
                if (this.cursorRing) this.cursorRing.classList.remove('hover-active');
            });
        });

        // Smooth cursor ring trailing loop
        const loopRing = () => {
            ringX += (mouseX - ringX) * 0.18;
            ringY += (mouseY - ringY) * 0.18;
            if (this.cursorRing) {
                this.cursorRing.style.left = `${ringX}px`;
                this.cursorRing.style.top = `${ringY}px`;
            }
            requestAnimationFrame(loopRing);
        };
        requestAnimationFrame(loopRing);
    }

    // =========================================================================
    // 04. MAKEMEPULSE VOLUMETRIC DUST CANVAS
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
                size: Math.random() * 2.2 + 0.8,
                speedX: (Math.random() - 0.5) * 0.35,
                speedY: -Math.random() * 0.45 - 0.1,
                opacity: Math.random() * 0.6 + 0.2,
                depth: Math.random() * 2 + 0.5
            });
        }
    }

    renderParticles() {
        if (!this.ctx || !this.canvas) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const velocityBoost = Math.abs(this.scrollVelocity) * 0.05;

        for (let p of this.particles) {
            // Apply drift and velocity streak
            p.x += p.speedX;
            p.y += (p.speedY - velocityBoost * 0.8) * p.depth;

            // Screen wrap
            if (p.y < 0) p.y = this.canvas.height;
            if (p.y > this.canvas.height) p.y = 0;
            if (p.x < 0) p.x = this.canvas.width;
            if (p.x > this.canvas.width) p.x = 0;

            // Draw glowing golden dust mote
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(247, 228, 158, ${p.opacity})`;
            this.ctx.shadowBlur = 8;
            this.ctx.shadowColor = 'rgba(212, 175, 55, 0.6)';
            this.ctx.fill();
        }
    }

    // =========================================================================
    // 05. EDITORIAL CARDS INJECTION
    // =========================================================================
    renderEditorialCards() {
        if (!this.editorialContainer) return;
        this.editorialContainer.innerHTML = CHAPTERS_DATA.map((ch, idx) => `
            <div class="editorial-card card-pos-${ch.position} ${idx === 0 ? 'active' : ''}" id="card-chapter-${idx}">
                <span class="card-sector-tag">${ch.sector}</span>
                <h2 class="card-title">${ch.title}</h2>
                <p class="card-subtitle">${ch.subtitle}</p>
                <p class="card-text">${ch.text}</p>
                ${ch.relicId !== undefined ? `
                    <button class="card-inspect-btn" onclick="window.sculptureViewer.openInspectorModal(SCULPTURES_DATA[${ch.relicId}])">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                        </svg>
                        <span>INSPECT 3D RELIC</span>
                    </button>
                ` : ''}
            </div>
        `).join('');
    }

    // =========================================================================
    // 06. EVENT BINDINGS (TRUE INERTIA MOUSE WHEEL & CONTROLS)
    // =========================================================================
    bindEvents() {
        // True Wheel Scrubbing: continuous delta accumulator
        window.addEventListener('wheel', (e) => {
            // Cancel auto-cruise if user manually scrolls
            if (this.isAutoCruising) this.toggleAutoCruise(false);

            // Normalize delta
            const delta = e.deltaY * 1.6;
            this.virtualScrollTarget = Math.max(0, Math.min(this.maxScroll, this.virtualScrollTarget + delta));
        }, { passive: true });

        // Touch swipe support for mobile/tablets
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchmove', (e) => {
            const currentY = e.touches[0].clientY;
            const diff = (touchStartY - currentY) * 2.8;
            touchStartY = currentY;
            this.virtualScrollTarget = Math.max(0, Math.min(this.maxScroll, this.virtualScrollTarget + diff));
        }, { passive: true });

        // Keyboard navigation (Arrow keys & Space)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'ArrowDown' || e.code === 'ArrowRight' || e.code === 'PageDown') {
                this.virtualScrollTarget = Math.min(this.maxScroll, this.virtualScrollTarget + 300);
            } else if (e.code === 'ArrowUp' || e.code === 'ArrowLeft' || e.code === 'PageUp') {
                this.virtualScrollTarget = Math.max(0, this.virtualScrollTarget - 300);
            } else if (e.code === 'Space') {
                e.preventDefault();
                this.toggleAutoCruise();
            }
        });

        // Chapter Rail clicks (The Boat SBS)
        this.chapterNodes.forEach(node => {
            node.addEventListener('click', () => {
                const chapterIdx = parseInt(node.dataset.chapter, 10);
                this.jumpToChapter(chapterIdx);
            });
        });

        // Timeline Scrub Track Interaction
        if (this.timelineTrack) {
            const scrubToMouse = (e) => {
                const rect = this.timelineTrack.getBoundingClientRect();
                const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                this.virtualScrollTarget = frac * this.maxScroll;
            };

            this.timelineTrack.addEventListener('mousedown', (e) => {
                this.isDraggingTimeline = true;
                scrubToMouse(e);
            });

            window.addEventListener('mousemove', (e) => {
                if (this.isDraggingTimeline) scrubToMouse(e);
            });

            window.addEventListener('mouseup', () => {
                this.isDraggingTimeline = false;
            });
        }

        // Header & Dock Auto-Cruise Buttons
        if (this.tourBtn) this.tourBtn.addEventListener('click', () => this.toggleAutoCruise());
        if (this.dockAutoBtn) this.dockAutoBtn.addEventListener('click', () => this.toggleAutoCruise());

        // Header & Dock Sound Buttons
        if (this.soundBtn) this.soundBtn.addEventListener('click', () => this.toggleSound());
        if (this.dockSoundBtn) this.dockSoundBtn.addEventListener('click', () => this.toggleSound());

        // Fullscreen Toggle
        if (this.dockFsBtn) {
            this.dockFsBtn.addEventListener('click', () => {
                if (!document.fullscreenElement) {
                    document.documentElement.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
            });
        }

        // Reliquary Drawer Toggle
        const reliquaryBtn = document.getElementById('reliquary-trigger-btn');
        const reliquaryDrawer = document.getElementById('reliquary-drawer');
        const drawerClose = document.getElementById('drawer-close-btn');

        if (reliquaryBtn && reliquaryDrawer) {
            reliquaryBtn.addEventListener('click', () => {
                reliquaryDrawer.classList.toggle('open');
            });
        }
        if (drawerClose && reliquaryDrawer) {
            drawerClose.addEventListener('click', () => {
                reliquaryDrawer.classList.remove('open');
            });
        }
    }

    // =========================================================================
    // 07. CHAPTER JUMP & AUTO-CRUISE LOGIC
    // =========================================================================
    jumpToChapter(idx) {
        if (idx < 0 || idx >= CHAPTERS_DATA.length) return;
        const targetTime = CHAPTERS_DATA[idx].startTime;
        const frac = targetTime / this.totalDuration;
        this.virtualScrollTarget = frac * this.maxScroll;
    }

    toggleAutoCruise(forceState) {
        this.isAutoCruising = (forceState !== undefined) ? forceState : !this.isAutoCruising;

        if (this.dockAutoLed) {
            this.dockAutoLed.classList.toggle('active', this.isAutoCruising);
        }
        if (this.tourBtnText) {
            this.tourBtnText.textContent = this.isAutoCruising ? 'PAUSE CRUISE' : 'AUTO CRUISE';
        }
    }

    toggleSound(forceState) {
        this.isSoundActive = (forceState !== undefined) ? forceState : !this.isSoundActive;

        if (this.soundEngine) {
            this.soundEngine.setMuted(!this.isSoundActive);
        }

        if (this.dockSoundLed) {
            this.dockSoundLed.classList.toggle('active', this.isSoundActive);
        }
        if (this.soundStatusText) {
            this.soundStatusText.textContent = this.isSoundActive ? 'SOUND : ON' : 'SOUND : OFF';
        }
        if (this.headerEqualizer) {
            this.headerEqualizer.classList.toggle('playing', this.isSoundActive);
        }
    }

    // =========================================================================
    // 08. THE MASTER RENDER LOOP (60FPS INERTIA & HARDWARE VIDEO SYNC)
    // =========================================================================
    startRenderLoop() {
        const tick = () => {
            // 1. Auto-Cruise advancement
            if (this.isAutoCruising) {
                this.virtualScrollTarget += this.autoCruiseSpeed;
                if (this.virtualScrollTarget >= this.maxScroll) {
                    this.virtualScrollTarget = 0; // loop seamlessly
                }
            }

            // 2. Physics Lerp (Silky Smooth Inertia)
            const delta = this.virtualScrollTarget - this.virtualScrollCurrent;
            this.virtualScrollCurrent += delta * 0.085;
            this.scrollVelocity = delta;

            const progress = Math.max(0, Math.min(1, this.virtualScrollCurrent / this.maxScroll));
            const targetTime = progress * this.totalDuration;

            // 3. Hardware Video Synchronization
            this.syncVideoPlayback(targetTime, delta);

            // 4. Update UI Telemetry & Active Chapter
            this.updateUI(progress, targetTime);

            // 5. Render Volumetric Dust Particles
            this.renderParticles();

            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }

    syncVideoPlayback(targetTime, delta) {
        if (!this.video) return;

        const timeDiff = targetTime - this.video.currentTime;

        // FORWARD SCROLL WITH MOMENTUM: Hardware Play-Assist
        // When rolling the wheel forward, engage video.play() with dynamic playbackRate
        if (delta > 2.0 && timeDiff > 0.08) {
            const speed = Math.min(3.2, Math.max(0.6, Math.abs(delta) * 0.04));
            this.video.playbackRate = speed;
            if (this.video.paused) {
                this.video.play().catch(() => {});
            }
        } 
        // STOPPING OR FINE-SCRUBBING
        else if (Math.abs(delta) <= 2.0 || timeDiff <= 0.02) {
            if (!this.video.paused && !this.isAutoCruising) {
                this.video.pause();
            }

            // Precision seek to target frame if offset > 0.03s
            if (Math.abs(timeDiff) > 0.03 && !this.video.seeking) {
                if (this.video.fastSeek) {
                    this.video.fastSeek(targetTime);
                } else {
                    this.video.currentTime = targetTime;
                }
            }
        }
        // REVERSE SCROLLING: Precision Step Backward
        else if (delta < -2.0) {
            if (!this.video.paused) this.video.pause();
            if (!this.video.seeking) {
                if (this.video.fastSeek) {
                    this.video.fastSeek(targetTime);
                } else {
                    this.video.currentTime = targetTime;
                }
            }
        }
    }

    // =========================================================================
    // 09. REAL-TIME UI & CHAPTER SYNCHRONIZATION
    // =========================================================================
    updateUI(progress, currentTime) {
        // Timeline Scrub Elements
        const pctString = `${Math.round(progress * 100)}%`;
        if (this.timelineProgress) this.timelineProgress.style.width = `${progress * 100}%`;
        if (this.timelineScrubber) this.timelineScrubber.style.left = `${progress * 100}%`;
        if (this.timelinePercent) this.timelinePercent.textContent = pctString;

        // Timecode
        if (this.timelineTimecode) {
            const curSec = Math.floor(currentTime);
            const curMs = Math.floor((currentTime % 1) * 100);
            this.timelineTimecode.textContent = `00:${String(curSec).padStart(2, '0')}.${String(curMs).padStart(2, '0')} / 00:23.85`;
        }

        // Lusion Right-Side Indicator Thumb
        if (this.scrollTrackThumb) {
            const trackTravel = 156; // track height - thumb height
            this.scrollTrackThumb.style.transform = `translateY(${progress * trackTravel}px)`;
        }

        // Active Chapter Calculation
        let activeIdx = 0;
        for (let i = 0; i < CHAPTERS_DATA.length; i++) {
            if (currentTime >= CHAPTERS_DATA[i].startTime && currentTime <= CHAPTERS_DATA[i].endTime) {
                activeIdx = i;
                break;
            }
            if (i === CHAPTERS_DATA.length - 1 && currentTime > CHAPTERS_DATA[i].endTime) {
                activeIdx = i;
            }
        }

        if (activeIdx !== this.currentChapterIdx) {
            this.onChapterChange(activeIdx);
            this.currentChapterIdx = activeIdx;
        }

        // Next Chapter Progress Bar (Lusion Style)
        const curChap = CHAPTERS_DATA[activeIdx];
        const nextChap = CHAPTERS_DATA[Math.min(CHAPTERS_DATA.length - 1, activeIdx + 1)];
        if (this.nextChapterName) {
            this.nextChapterName.textContent = nextChap.title;
        }
        if (this.nextChapterBar) {
            const chapterProgress = Math.max(0, Math.min(1, (currentTime - curChap.startTime) / (curChap.endTime - curChap.startTime)));
            this.nextChapterBar.style.width = `${chapterProgress * 100}%`;
        }
    }

    onChapterChange(newIdx) {
        const chapter = CHAPTERS_DATA[newIdx];

        // Update Header Sector
        if (this.headerSector) {
            this.headerSector.textContent = chapter.sector;
        }

        // Update The Boat Chapter Rail
        this.chapterNodes.forEach((node, idx) => {
            node.classList.toggle('active', idx === newIdx);
        });

        // Cross-fade Editorial Text Cards
        document.querySelectorAll('.editorial-card').forEach((card, idx) => {
            card.classList.toggle('active', idx === newIdx);
        });

        // Trigger Audio Cue
        if (this.soundEngine && this.isSoundActive && newIdx !== this.lastAudioCueChapter) {
            this.lastAudioCueChapter = newIdx;
            if (chapter.audioCue === 'chime') {
                this.soundEngine.playChime(528); // 528Hz Solfeggio Miraculous Tone
            } else if (chapter.audioCue === 'door') {
                this.soundEngine.playStoneThud();
            } else if (chapter.audioCue === 'emperor') {
                this.soundEngine.playImperialFanfare();
            } else {
                this.soundEngine.triggerWhoosh();
            }
        }
    }
}

// Instantiate engine when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
    window.masterEngine = new MasterSpatialEngine();
});
