/**
 * ARCHIVUM IMPERIALIS — Master Video Scroll Engine
 * Integrates single continuous master video (assets/videos/master_journey.mp4)
 * with 3-second scroll-step playback, editorial typography (matching prompt video),
 * and synchronized spatial audio.
 */

const MASTER_BEATS = [
    {
        id: 0,
        startTime: 0.0,
        endTime: 3.2,
        position: 'right',
        sector: '00:00 - 00:03 • DHOLPUR ARCHWAY',
        title: 'THE MONUMENTAL ARCHWAY',
        subtitle: 'Baroque-Mughal Fusion Courtyard',
        text: 'Eye-level forward tracking shot moving smoothly across an open stone-paved courtyard toward a monumental Baroque-Mughal fusion triumphal archway made of intricately hand-carved beige Dholpur sandstone.',
        audioCue: 'whoosh',
        elevation: '+24.0 m'
    },
    {
        id: 1,
        startTime: 3.2,
        endTime: 5.8,
        position: 'left',
        sector: '00:03 - 00:05 • CEREMONIAL ENTRANCE',
        title: 'THE WALNUT PORTAL',
        subtitle: 'Antique Double Doors Axis',
        text: 'Heavy, open antique dark walnut double doors frame a straight visual axis into the interior. Morning sun casts soft diagonal shadows across the pale grey flagstone paving.',
        audioCue: 'whoosh',
        elevation: '+21.0 m'
    },
    {
        id: 2,
        startTime: 5.8,
        endTime: 8.8,
        position: 'right',
        sector: '00:05 - 00:08 • EMERALD COLUMNS',
        title: 'THE MALACHITE ROTUNDA',
        subtitle: 'Polished Green Marble Colonnade',
        text: 'Towering Corinthian columns carved from deep-veined emerald-green Malachite and polished marble line the perimeter. Below, a mirror-reflective checkerboard floor of Carrara marble reflects the architecture.',
        audioCue: 'hall',
        elevation: '+18.5 m'
    },
    {
        id: 3,
        startTime: 8.8,
        endTime: 11.2,
        position: 'left',
        sector: '00:08 - 00:11 • GLASS OCULUS SKYSIGHT',
        title: 'THE CELESTIAL DOME',
        subtitle: 'Hemispherical Steel-and-Glass Oculus',
        text: 'High above, a massive hemispherical steel-and-glass dome skylight floods the chamber with diffused soft white daylight. A multi-tiered sparkling crystal chandelier hangs suspended in the dead center.',
        audioCue: 'whoosh',
        elevation: '+15.0 m'
    },
    {
        id: 4,
        startTime: 11.2,
        endTime: 14.2,
        position: 'right',
        sector: '00:11 - 00:14 • GILDED BARREL VAULTS',
        title: 'THE ROYAL COLONNADE',
        subtitle: 'Gold-Leaf Filigree Moldings',
        text: 'Ribbed barrel vaults lined with subtle antique gold-leaf filigree moldings. Cast bronze wall sconces holding warm-flickering beeswax candles line the stone walls.',
        audioCue: 'door',
        elevation: '+10.5 m'
    },
    {
        id: 5,
        startTime: 14.2,
        endTime: 16.5,
        position: 'left',
        sector: '00:14 - 00:16 • VOLUMETRIC GOD RAYS',
        title: 'CORRIDOR OF LIGHT',
        subtitle: 'Limestone Inlays & Sunlight',
        text: 'Long golden shafts of volumetric dust-specked sunlight cut diagonally across the corridor, revealing micro-textures of aged limestone and polished floor inlays as the camera advances.',
        audioCue: 'vault',
        elevation: '±0.0 m'
    },
    {
        id: 6,
        startTime: 16.5,
        endTime: 19.8,
        position: 'left',
        sector: '00:16 - 00:20 • THE WINGED GODDESS',
        title: 'NIKE OF SAMOTHRACE',
        subtitle: '24K Gold Leaf Feather Tips',
        text: 'Frontal framing approaches a life-sized white marble sculpture of a winged goddess standing on a pediment. Soft top-down skylight beam illuminates delicate weathered gold-leaf gilding across the primary feather tips.',
        relicId: 0,
        audioCue: 'chime',
        elevation: '-28.0 m'
    },
    {
        id: 7,
        startTime: 19.8,
        endTime: 23.85,
        position: 'center',
        sector: '00:20 - 00:24 • IMMORTAL RELICS',
        title: 'THE IMPERIAL SANCTUARY',
        subtitle: 'Celestial Astrolabe & Roman Caesar Bust',
        text: 'Passing an antique brass celestial armillary sphere with a glowing cyan glass core, the camera glides into extreme macro focus of the Roman Emperor bust crowned with a solid gold laurel wreath.',
        relicId: 2,
        isHeroEnding: true,
        audioCue: 'emperor',
        elevation: '-42.0 m'
    }
];

class MasterJourneyEngine {
    constructor() {
        this.currentBeatIdx = 0;
        this.totalBeats = MASTER_BEATS.length;
        this.isPlaying = false;
        this.isAutoTour = false;
        this.scrollDebounce = false;

        this.init();
    }

    init() {
        this.cacheDOM();
        this.setupVideo();
        this.bindEvents();
        this.renderBeatCards();
        this.updateUI(0);
    }

    cacheDOM() {
        this.video = document.getElementById('master-video');
        this.hudLevel = document.getElementById('hud-level');
        this.hudElevation = document.getElementById('hud-elevation');
        this.hudCoords = document.getElementById('hud-coords');
        this.hudStageNum = document.getElementById('hud-stage-num');
        this.hudStageName = document.getElementById('hud-stage-name');

        this.zoomFill = document.getElementById('zoom-scrub-fill');
        this.zoomTrack = document.getElementById('zoom-scrub-track');
        this.zoomPercent = document.getElementById('zoom-percentage');
        this.tourBtn = document.getElementById('tour-btn');

        this.cardsContainer = document.getElementById('editorial-cards-container');
        this.scrollPrompt = document.getElementById('scroll-step-prompt');
        this.floorNavItems = document.querySelectorAll('.floor-nav-item');
    }

    setupVideo() {
        if (!this.video) return;
        this.video.muted = true;
        this.video.playsInline = true;
        this.video.preload = 'auto';
        this.video.pause();
        this.video.currentTime = 0;
    }

    renderBeatCards() {
        if (!this.cardsContainer) return;

        this.cardsContainer.innerHTML = MASTER_BEATS.map((beat, idx) => `
            <div class="editorial-card card-pos-${beat.position} ${idx === 0 ? 'active' : ''}" id="card-beat-${idx}">
                <div class="card-inner">
                    <span class="card-sector-tag">${beat.sector}</span>
                    <h2 class="card-title">${beat.title}</h2>
                    <p class="card-subtitle">${beat.subtitle}</p>
                    <p class="card-text">${beat.text}</p>
                    
                    ${beat.relicId !== undefined ? `
                        <div class="card-action-bar">
                            <button class="card-inspect-btn" onclick="window.sculptureViewer.openInspectorModal(SCULPTURES_DATA[${beat.relicId}])">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                                </svg>
                                <span>INSPECT 3D RELIC</span>
                            </button>
                        </div>
                    ` : ''}

                    ${beat.isHeroEnding ? `
                        <div class="card-hero-actions">
                            <button class="hero-primary-btn" onclick="window.sculptureViewer.openInspectorModal(SCULPTURES_DATA[2])">
                                <span>INSPECT CAESAR BUST</span>
                            </button>
                            <button class="hero-secondary-btn" onclick="alert('Private Viewing Dossier: Reservation confirmed.')">
                                <span>REQUEST VIEWING</span>
                            </button>
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    bindEvents() {
        // Wheel listener: 1 scroll down = plays next 3s beat!
        window.addEventListener('wheel', (e) => {
            if (this.isAutoTour) this.pauseAutoTour();
            if (this.scrollDebounce) return;

            if (e.deltaY > 20) {
                this.scrollDebounce = true;
                this.playNextBeat();
                setTimeout(() => { this.scrollDebounce = false; }, 450);
            } else if (e.deltaY < -20) {
                this.scrollDebounce = true;
                this.playPrevBeat();
                setTimeout(() => { this.scrollDebounce = false; }, 450);
            }
        }, { passive: true });

        // Touch swipe
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            const diff = touchStartY - e.changedTouches[0].clientY;
            if (Math.abs(diff) > 40) {
                if (diff > 0) this.playNextBeat();
                else this.playPrevBeat();
            }
        }, { passive: true });

        // Keyboard arrows & spacebar
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
                e.preventDefault();
                this.playNextBeat();
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                this.playPrevBeat();
            }
        });

        // Prompt banner click
        if (this.scrollPrompt) {
            this.scrollPrompt.addEventListener('click', () => {
                this.playNextBeat();
            });
        }

        // Tour Button click
        if (this.tourBtn) {
            this.tourBtn.addEventListener('click', () => {
                this.toggleAutoTour();
            });
        }

        // Scrub track click
        if (this.zoomTrack) {
            this.zoomTrack.addEventListener('click', (e) => {
                const rect = this.zoomTrack.getBoundingClientRect();
                const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const targetBeat = Math.min(this.totalBeats - 1, Math.floor(frac * this.totalBeats));
                this.jumpToBeat(targetBeat);
            });
        }

        // Floor Nav items click
        this.floorNavItems.forEach((item, idx) => {
            item.addEventListener('click', () => {
                const stageAttr = item.getAttribute('data-stage');
                if (stageAttr !== null) {
                    const beatMapping = [0, 2, 4, 6];
                    const target = beatMapping[parseInt(stageAttr)] || 0;
                    this.jumpToBeat(target);
                }
            });
        });
    }

    playNextBeat() {
        if (this.currentBeatIdx >= this.totalBeats - 1) return;
        this.playBeat(this.currentBeatIdx + 1);
    }

    playPrevBeat() {
        if (this.currentBeatIdx <= 0) return;
        this.jumpToBeat(this.currentBeatIdx - 1);
    }

    /**
     * Plays the ~3 second video segment smoothly using native video.play()!
     */
    playBeat(targetIdx) {
        if (targetIdx < 0 || targetIdx >= this.totalBeats) return;
        if (!this.video) return;

        const nextBeat = MASTER_BEATS[targetIdx];
        this.currentBeatIdx = targetIdx;
        this.isPlaying = true;

        // Trigger sound cue
        this.triggerAudioCue(nextBeat.audioCue);

        // Update UI & text cards
        this.updateUI(targetIdx);

        // Ensure start time
        if (this.video.currentTime < nextBeat.startTime - 0.2 || this.video.currentTime > nextBeat.endTime) {
            this.video.currentTime = nextBeat.startTime;
        }

        this.video.play().then(() => {
            this.monitorPlayback(nextBeat.endTime);
        }).catch(e => console.log('Video play error:', e));
    }

    monitorPlayback(targetEndTime) {
        const checkTime = () => {
            if (!this.isPlaying) return;

            if (this.video.currentTime >= targetEndTime - 0.04 || this.video.ended) {
                this.video.pause();
                this.video.currentTime = targetEndTime;
                this.isPlaying = false;

                // If in auto tour, advance after brief pause
                if (this.isAutoTour) {
                    if (this.currentBeatIdx < this.totalBeats - 1) {
                        setTimeout(() => {
                            if (this.isAutoTour) this.playNextBeat();
                        }, 600);
                    } else {
                        this.pauseAutoTour();
                    }
                }
                return;
            }

            requestAnimationFrame(checkTime);
        };
        requestAnimationFrame(checkTime);
    }

    jumpToBeat(targetIdx) {
        if (targetIdx < 0 || targetIdx >= this.totalBeats) return;
        this.isPlaying = false;
        this.currentBeatIdx = targetIdx;
        const beat = MASTER_BEATS[targetIdx];

        if (this.video) {
            this.video.pause();
            this.video.currentTime = beat.startTime;
        }

        this.triggerAudioCue(beat.audioCue);
        this.updateUI(targetIdx);
    }

    triggerAudioCue(cue) {
        if (!window.soundEngine) return;
        if (cue === 'whoosh') window.soundEngine.playTransitionWhoosh(1.0);
        else if (cue === 'hall') window.soundEngine.playTransitionWhoosh(1.3);
        else if (cue === 'door') window.soundEngine.playTransitionWhoosh(1.5);
        else if (cue === 'vault') window.soundEngine.playVaultImpact();
        else if (cue === 'chime') window.soundEngine.playRelicChime(0);
        else if (cue === 'emperor') window.soundEngine.playRelicChime(2);
    }

    updateUI(beatIdx) {
        const beat = MASTER_BEATS[beatIdx];
        if (!beat) return;

        // Telemetry
        if (this.hudLevel) this.hudLevel.textContent = beat.sector;
        if (this.hudElevation) this.hudElevation.textContent = beat.elevation;
        if (this.hudStageNum) this.hudStageNum.textContent = `BEAT 0${beatIdx + 1} / 08`;
        if (this.hudStageName) this.hudStageName.textContent = beat.title;

        // Update active floating card
        document.querySelectorAll('.editorial-card').forEach((card, idx) => {
            if (idx === beatIdx) card.classList.add('active');
            else card.classList.remove('active');
        });

        // Floor Nav Highlight
        const floorIdx = Math.min(3, Math.floor(beatIdx / 2));
        this.floorNavItems.forEach((item, i) => {
            if (i === floorIdx) item.classList.add('active');
            else item.classList.remove('active');
        });

        // Scrub Bar
        const percent = Math.round(((beatIdx + 1) / this.totalBeats) * 100);
        if (this.zoomFill) this.zoomFill.style.width = `${percent}%`;
        if (this.zoomPercent) this.zoomPercent.textContent = `${percent}%`;

        // Prompt Banner
        if (this.scrollPrompt) {
            const nextIdx = beatIdx + 1;
            if (nextIdx < this.totalBeats) {
                this.scrollPrompt.innerHTML = `
                    <span class="prompt-pulse"></span>
                    <span>SCROLL DOWN TO ADVANCE • BEAT 0${nextIdx + 1} OF 08 (${MASTER_BEATS[nextIdx].title})</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
                `;
            } else {
                this.scrollPrompt.innerHTML = `
                    <span class="prompt-pulse"></span>
                    <span>IMPERIAL SANCTUARY REACHED • ALL RELICS UNLOCKED</span>
                `;
            }
        }
    }

    toggleAutoTour() {
        if (this.isAutoTour) this.pauseAutoTour();
        else this.startAutoTour();
    }

    startAutoTour() {
        this.isAutoTour = true;
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
        this.playNextBeat();
    }

    pauseAutoTour() {
        this.isAutoTour = false;
        this.isPlaying = false;
        if (this.video) this.video.pause();
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
}

window.addEventListener('DOMContentLoaded', () => {
    window.masterEngine = new MasterJourneyEngine();
});
