/**
 * ARCHIVUM IMPERIALIS — Infinite Portal Zoom Engine
 * Zero vertical page displacement • Camera dollys directly through portals into next rooms
 */

class InfinitePortalZoomEngine {
    constructor() {
        this.stages = [
            {
                id: 'facade',
                index: 0,
                name: 'THE FAÇADE IMPERIALE',
                level: 'LEVEL 00 • EXTERIOR',
                elevation: '+24.0 m',
                coords: '48°51\'38.2"N 2°20\'15.4"E',
                tag: 'ARCHITECTURAL PORTAL • EST. 1884',
                origin: '50% 77%',
                soundTone: 1.0
            },
            {
                id: 'hall',
                index: 1,
                name: 'THE GRAND COLONNADE',
                level: 'LEVEL 01 • ATRIUM',
                elevation: '+12.5 m',
                coords: 'SECTOR A • NAVE',
                tag: 'EMERALD PILLARS • GILDED CHANDELIERS',
                origin: '50% 55%',
                soundTone: 1.2
            },
            {
                id: 'rotunda',
                index: 2,
                name: 'THE CELESTIAL ROTUNDA',
                level: 'LEVEL 00 • SANCTUARY',
                elevation: '±0.0 m',
                coords: 'CENTRAL DOME • AXIS MUNDI',
                tag: 'GLASS OCULUS • MOSAIC MANDALA',
                origin: '50% 74%',
                soundTone: 1.4
            },
            {
                id: 'vault',
                index: 3,
                name: 'THE SUBTERRANEAN VAULT',
                level: 'LEVEL -04 • HIGH SECURITY',
                elevation: '-42.8 m',
                coords: 'UNDERGROUND CORRIDOR IV',
                tag: 'TITANIUM PRESSURE PORTALS',
                origin: '50% 48%',
                soundTone: 1.8
            },
            {
                id: 'reliquary',
                index: 4,
                name: 'THE MASTERPIECE RELIQUARY',
                level: 'LEVEL -05 • INNER SANCTUM',
                elevation: '-54.0 m',
                coords: 'SPECIAL COLLECTIONS 01-03',
                tag: 'CLASSIFIED CLASSICAL RELICS',
                origin: '50% 50%',
                soundTone: 2.0
            }
        ];

        this.currentProgress = 0.0;
        this.targetProgress = 0.0;
        this.maxProgress = 4.0;
        this.isAutoPlaying = false;
        this.autoPlaySpeed = 0.005;

        this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
        this.lastSoundStage = -1;

        this.init();
    }

    init() {
        this.cacheDOM();
        this.bindEvents();
        this.startRenderLoop();
    }

    cacheDOM() {
        this.layers = [
            document.getElementById('layer-facade'),
            document.getElementById('layer-hall'),
            document.getElementById('layer-rotunda'),
            document.getElementById('layer-vault'),
            document.getElementById('layer-reliquary')
        ];

        this.hudLevel = document.getElementById('hud-level');
        this.hudElevation = document.getElementById('hud-elevation');
        this.hudCoords = document.getElementById('hud-coords');
        this.hudStageNum = document.getElementById('hud-stage-num');
        this.hudStageName = document.getElementById('hud-stage-name');
        this.badgeTag = document.getElementById('badge-tag');
        this.badgeTitle = document.getElementById('badge-title');
        this.badgeWrap = document.getElementById('chamber-badge');

        this.zoomFill = document.getElementById('zoom-scrub-fill');
        this.zoomTrack = document.getElementById('zoom-scrub-track');
        this.zoomPercent = document.getElementById('zoom-percentage');
        this.tourBtn = document.getElementById('tour-btn');

        this.floorNavItems = document.querySelectorAll('.floor-nav-item');
    }

    bindEvents() {
        // Native wheel / touch / scroll sync
        window.addEventListener('scroll', () => {
            if (this.isAutoPlaying) return;
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            if (maxScroll > 0) {
                const scrollFraction = window.scrollY / maxScroll;
                this.targetProgress = scrollFraction * this.maxProgress;
            }
        }, { passive: true });

        // Wheel delta handler for silky smooth trackpad scrub
        window.addEventListener('wheel', (e) => {
            if (this.isAutoPlaying) {
                this.pauseAutoPlay();
            }
        }, { passive: true });

        // Keyboard navigation (Arrow keys / Page up / down)
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'PageDown') {
                this.jumpToStage(Math.min(4, Math.floor(this.targetProgress + 1)));
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                this.jumpToStage(Math.max(0, Math.ceil(this.targetProgress - 1)));
            }
        });

        // Floor Plan Radar clicks
        this.floorNavItems.forEach((item, idx) => {
            item.addEventListener('click', () => {
                const stageAttr = item.getAttribute('data-stage');
                const stageIdx = stageAttr !== null ? parseInt(stageAttr) : idx;
                this.jumpToStage(stageIdx);
            });
        });

        // Center scrub bar click & drag
        if (this.zoomTrack) {
            const handleScrub = (e) => {
                const rect = this.zoomTrack.getBoundingClientRect();
                const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                this.jumpToProgress(frac * this.maxProgress);
            };

            this.zoomTrack.addEventListener('click', handleScrub);
        }

        // Auto Cinematic Fly-Through Button
        if (this.tourBtn) {
            this.tourBtn.addEventListener('click', () => {
                this.toggleAutoPlay();
            });
        }

        // Mouse Parallax
        window.addEventListener('mousemove', (e) => {
            this.mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
            this.mouse.targetY = (e.clientY / window.innerHeight - 0.5) * 2;
        });
    }

    jumpToStage(stageIndex) {
        this.pauseAutoPlay();
        this.jumpToProgress(stageIndex);
        window.soundEngine?.playDialTick();
    }

    jumpToProgress(prog) {
        this.targetProgress = Math.max(0, Math.min(this.maxProgress, prog));
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
            const targetScrollY = (this.targetProgress / this.maxProgress) * maxScroll;
            window.scrollTo({ top: targetScrollY, behavior: 'smooth' });
        }
    }

    toggleAutoPlay() {
        if (this.isAutoPlaying) {
            this.pauseAutoPlay();
        } else {
            this.startAutoPlay();
        }
    }

    startAutoPlay() {
        this.isAutoPlaying = true;
        window.soundEngine?.unmute();
        if (this.tourBtn) {
            this.tourBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>
                </svg>
                <span>PAUSE TOUR</span>
            `;
            this.tourBtn.classList.add('active');
        }
    }

    pauseAutoPlay() {
        this.isAutoPlaying = false;
        if (this.tourBtn) {
            this.tourBtn.innerHTML = `
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span>CINEMATIC TOUR</span>
            `;
            this.tourBtn.classList.remove('active');
        }
    }

    startRenderLoop() {
        const render = () => {
            // Auto-play progression
            if (this.isAutoPlaying) {
                this.targetProgress += this.autoPlaySpeed;
                if (this.targetProgress >= this.maxProgress) {
                    this.targetProgress = this.maxProgress;
                    this.pauseAutoPlay();
                }
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                if (maxScroll > 0) {
                    window.scrollTo(0, (this.targetProgress / this.maxProgress) * maxScroll);
                }
            }

            // Lerp progress for physics momentum
            this.currentProgress += (this.targetProgress - this.currentProgress) * 0.085;

            // Lerp mouse gaze
            this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.06;
            this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.06;

            this.updateLayers(this.currentProgress);
            this.updateHUD(this.currentProgress);

            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
    }

    updateLayers(prog) {
        const k = Math.min(3, Math.floor(prog));
        const f = prog - k; // fraction between 0.0 and 1.0

        // Subtly apply mouse parallax to camera rig
        const rig = document.querySelector('.camera-rig');
        if (rig) {
            const rotX = -this.mouse.y * 3.5;
            const rotY = this.mouse.x * 4.5;
            rig.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        }

        // Loop over each architectural layer
        this.layers.forEach((layer, idx) => {
            if (!layer) return;

            if (idx < k) {
                // Layer already passed through
                layer.style.transform = `scale(10)`;
                layer.style.opacity = '0';
                layer.style.display = 'none';
                layer.style.pointerEvents = 'none';
            } 
            else if (idx === k) {
                // Currently active room being zoomed into
                layer.style.display = 'flex';
                layer.style.pointerEvents = 'none';

                // Scale smoothly from 1.0 up to 7.5x
                const scale = 1.0 + f * 6.5;
                // Fade out cleanly near the threshold so the next room takes over
                const opacity = f > 0.82 ? Math.max(0, 1 - (f - 0.82) * 5.5) : 1.0;

                layer.style.transform = `scale(${scale})`;
                layer.style.opacity = opacity.toString();
            } 
            else if (idx === k + 1) {
                // Incoming room emerging through the doorway
                layer.style.display = 'flex';
                
                // Starts small inside the doorway (scale 0.15), expands to full screen (scale 1.0)
                const scale = 0.15 + f * 0.85;
                const opacity = Math.min(1.0, f * 1.6);

                layer.style.transform = `scale(${scale})`;
                layer.style.opacity = opacity.toString();

                // If this is stage 4 (reliquary), enable pointer events when fully arrived
                if (idx === 4) {
                    if (f >= 0.85) {
                        layer.classList.add('active');
                        layer.style.pointerEvents = 'auto';
                    } else {
                        layer.classList.remove('active');
                        layer.style.pointerEvents = 'none';
                    }
                }
            } 
            else {
                // Subsequent rooms not yet reachable
                layer.style.transform = `scale(0.1)`;
                layer.style.opacity = '0';
                layer.style.display = 'none';
                layer.style.pointerEvents = 'none';
            }
        });
    }

    updateHUD(prog) {
        const stageIdx = Math.min(4, Math.floor(prog + 0.45));
        const stage = this.stages[stageIdx];
        if (!stage) return;

        // Audio cue on crossing stage threshold
        if (stageIdx !== this.lastSoundStage) {
            this.lastSoundStage = stageIdx;
            window.soundEngine?.playTransitionWhoosh(stage.soundTone);
            if (stageIdx === 3) window.soundEngine?.playVaultImpact();
            if (stageIdx === 4) window.soundEngine?.playRelicChime(0);
        }

        // Update Floor Plan Nav active highlight
        this.floorNavItems.forEach((item, i) => {
            if (i === stageIdx) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Update Bottom Telemetry
        if (this.hudLevel) this.hudLevel.textContent = stage.level;
        if (this.hudElevation) this.hudElevation.textContent = stage.elevation;
        if (this.hudCoords) this.hudCoords.textContent = stage.coords;
        if (this.hudStageNum) this.hudStageNum.textContent = `0${stage.index + 1} / 05`;
        if (this.hudStageName) this.hudStageName.textContent = stage.name;

        // Update Room Badge Text
        if (this.badgeTag) this.badgeTag.textContent = stage.tag;
        if (this.badgeTitle) this.badgeTitle.textContent = stage.name;
        if (this.badgeWrap) {
            // Hide badge when inside Reliquary gallery
            this.badgeWrap.style.opacity = stageIdx === 4 ? '0' : '1';
        }

        // Update Scrub Bar
        const percent = Math.min(100, Math.round((prog / this.maxProgress) * 100));
        if (this.zoomFill) this.zoomFill.style.width = `${percent}%`;
        if (this.zoomPercent) this.zoomPercent.textContent = `${percent}%`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.portalEngine = new InfinitePortalZoomEngine();
});
