/**
 * ARCHIVUM IMPERIALIS — 3-Second Segment Play On Scroll Engine
 * Each scroll action plays the next ~3-second cinematic video beat smoothly via video.play()!
 */

const VIDEO_SEGMENTS = [
    {
        clipIndex: 0,
        startTime: 0.0,
        endTime: 3.0,
        name: 'THE PALACE GATES',
        sector: 'SECTOR 01 • MONUMENTAL COURTYARD',
        elevation: '+24.0 m',
        coords: '48°51\'38.2"N 2°20\'15.4"E',
        audioCue: 'whoosh'
    },
    {
        clipIndex: 0,
        startTime: 3.0,
        endTime: 6.0,
        name: 'THE CELESTIAL ROTUNDA',
        sector: 'SECTOR 01 • GLASS OCULUS DOME',
        elevation: '+18.5 m',
        coords: 'ATRIUM CENTRAL AXIS',
        audioCue: 'whoosh'
    },
    {
        clipIndex: 1,
        startTime: 0.0,
        endTime: 3.0,
        name: 'THE GILDED PASSAGE',
        sector: 'SECTOR 02 • CEREMONIAL DOORS',
        elevation: '+12.5 m',
        coords: 'ROYAL COLONNADE NAVE',
        audioCue: 'door'
    },
    {
        clipIndex: 1,
        startTime: 3.0,
        endTime: 6.0,
        name: 'THE CANDLELIT GALLERY',
        sector: 'SECTOR 02 • IMPERIAL CORRIDOR',
        elevation: '+6.0 m',
        coords: 'CHANDELIER VISTA',
        audioCue: 'whoosh'
    },
    {
        clipIndex: 2,
        startTime: 0.0,
        endTime: 3.0,
        name: 'THE VAULTED PASSAGE',
        sector: 'SECTOR 03 • SUBTERRANEAN ACCESS',
        elevation: '±0.0 m',
        coords: 'DEEP STONE ARCHWAY',
        audioCue: 'vault'
    },
    {
        clipIndex: 2,
        startTime: 3.0,
        endTime: 6.0,
        name: 'THE INNER SANCTUARY',
        sector: 'SECTOR 03 • SUNBEAM REVEAL',
        elevation: '-18.0 m',
        coords: 'DIVINE ALTAR CORE',
        audioCue: 'sanctuary'
    },
    {
        clipIndex: 3,
        startTime: 0.0,
        endTime: 1.9,
        name: 'NIKE OF SAMOTHRACE',
        sector: 'RELIC 01 / 03 • WINGED VICTORY',
        elevation: '-42.0 m',
        coords: 'EAST VAULT PEDESTAL',
        relicIndex: 0,
        audioCue: 'chime'
    },
    {
        clipIndex: 3,
        startTime: 1.9,
        endTime: 3.9,
        name: 'THE CELESTIAL ASTROLABE',
        sector: 'RELIC 02 / 03 • KINETIC CORE',
        elevation: '-42.0 m',
        coords: 'CENTRAL OBSIDIAN PLINTH',
        relicIndex: 1,
        audioCue: 'astrolabe'
    },
    {
        clipIndex: 3,
        startTime: 3.9,
        endTime: 5.85,
        name: 'MARCUS AURELIUS',
        sector: 'RELIC 03 / 03 • IMPERIAL CAESAR',
        elevation: '-42.0 m',
        coords: 'WEST VAULT PEDESTAL',
        relicIndex: 2,
        audioCue: 'emperor'
    }
];

class SegmentVideoScrollEngine {
    constructor() {
        this.currentSegmentIdx = 0;
        this.totalSegments = VIDEO_SEGMENTS.length;
        this.isPlaying = false;
        this.isAutoTour = false;
        this.scrollLocked = false;

        this.init();
    }

    init() {
        this.cacheDOM();
        this.setupVideos();
        this.bindEvents();
        this.updateUI(0);
    }

    cacheDOM() {
        this.videoElements = [
            document.getElementById('video-0'),
            document.getElementById('video-1'),
            document.getElementById('video-2'),
            document.getElementById('video-3')
        ];

        this.hudLevel = document.getElementById('hud-level');
        this.hudElevation = document.getElementById('hud-elevation');
        this.hudCoords = document.getElementById('hud-coords');
        this.hudStageNum = document.getElementById('hud-stage-num');
        this.hudStageName = document.getElementById('hud-stage-name');
        
        this.badgeTag = document.getElementById('badge-tag');
        this.badgeTitle = document.getElementById('badge-title');

        this.zoomFill = document.getElementById('zoom-scrub-fill');
        this.zoomTrack = document.getElementById('zoom-scrub-track');
        this.zoomPercent = document.getElementById('zoom-percentage');
        this.tourBtn = document.getElementById('tour-btn');

        this.floorNavItems = document.querySelectorAll('.floor-nav-item');

        this.relicBadges = [
            document.getElementById('spotlight-relic-1'),
            document.getElementById('spotlight-relic-2'),
            document.getElementById('spotlight-relic-3')
        ];

        this.reliquaryDrawer = document.getElementById('reliquary-drawer');
        this.scrollPrompt = document.getElementById('scroll-step-prompt');
    }

    setupVideos() {
        this.videoElements.forEach((vid, idx) => {
            if (!vid) return;
            vid.muted = true;
            vid.playsInline = true;
            vid.preload = 'auto';
            vid.pause();
            vid.currentTime = 0;
            if (idx === 0) {
                vid.style.opacity = '1';
                vid.style.zIndex = '20';
            } else {
                vid.style.opacity = '0';
                vid.style.zIndex = '10';
            }
        });
    }

    bindEvents() {
        // Scroll / Wheel detection: Each scroll down plays the next 3-second beat!
        let wheelTimeout = null;
        window.addEventListener('wheel', (e) => {
            if (this.isAutoTour) {
                this.pauseAutoTour();
            }

            if (this.scrollLocked) return;

            if (e.deltaY > 20) {
                this.scrollLocked = true;
                this.playNextSegment();
                setTimeout(() => { this.scrollLocked = false; }, 400);
            } else if (e.deltaY < -20) {
                this.scrollLocked = true;
                this.playPrevSegment();
                setTimeout(() => { this.scrollLocked = false; }, 400);
            }
        }, { passive: true });

        // Touch swipe detection for mobile & trackpads
        let touchStartY = 0;
        window.addEventListener('touchstart', (e) => {
            touchStartY = e.touches[0].clientY;
        }, { passive: true });

        window.addEventListener('touchend', (e) => {
            const touchEndY = e.changedTouches[0].clientY;
            const diff = touchStartY - touchEndY;
            if (Math.abs(diff) > 40) {
                if (diff > 0) {
                    this.playNextSegment();
                } else {
                    this.playPrevSegment();
                }
            }
        }, { passive: true });

        // Keyboard arrows & spacebar
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 'PageDown') {
                e.preventDefault();
                this.playNextSegment();
            } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
                e.preventDefault();
                this.playPrevSegment();
            }
        });

        // Floor Nav items click
        this.floorNavItems.forEach((item) => {
            item.addEventListener('click', () => {
                const stageAttr = item.getAttribute('data-stage');
                if (stageAttr !== null) {
                    const clipIdx = parseInt(stageAttr);
                    // Find first segment of this clip
                    const segIdx = VIDEO_SEGMENTS.findIndex(s => s.clipIndex === clipIdx);
                    if (segIdx !== -1) {
                        this.jumpToSegment(segIdx);
                    }
                }
            });
        });

        // Scrub track click
        if (this.zoomTrack) {
            this.zoomTrack.addEventListener('click', (e) => {
                const rect = this.zoomTrack.getBoundingClientRect();
                const frac = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                const targetSeg = Math.min(this.totalSegments - 1, Math.floor(frac * this.totalSegments));
                this.jumpToSegment(targetSeg);
            });
        }

        // Tour Button click
        if (this.tourBtn) {
            this.tourBtn.addEventListener('click', () => {
                this.toggleAutoTour();
            });
        }

        // Click on the prompt banner to advance
        if (this.scrollPrompt) {
            this.scrollPrompt.addEventListener('click', () => {
                this.playNextSegment();
            });
        }
    }

    /**
     * Plays the next ~3 second video segment smoothly using native video.play()!
     */
    playNextSegment() {
        if (this.currentSegmentIdx >= this.totalSegments - 1) return;
        this.playSegment(this.currentSegmentIdx + 1);
    }

    /**
     * Reverses to the previous video segment
     */
    playPrevSegment() {
        if (this.currentSegmentIdx <= 0) return;
        this.jumpToSegment(this.currentSegmentIdx - 1);
    }

    /**
     * Executes smooth playback of the target segment
     */
    playSegment(targetIdx) {
        if (targetIdx < 0 || targetIdx >= this.totalSegments) return;

        const prevSeg = VIDEO_SEGMENTS[this.currentSegmentIdx];
        const nextSeg = VIDEO_SEGMENTS[targetIdx];
        this.currentSegmentIdx = targetIdx;
        this.isPlaying = true;

        const currentVid = this.videoElements[prevSeg.clipIndex];
        const targetVid = this.videoElements[nextSeg.clipIndex];

        // Trigger sound cue
        this.triggerAudioCue(nextSeg.audioCue);

        // Update HUD labels immediately
        this.updateUI(targetIdx);

        // If target segment is in the SAME video clip:
        if (prevSeg.clipIndex === nextSeg.clipIndex) {
            // Ensure start time
            if (targetVid.currentTime < nextSeg.startTime - 0.2 || targetVid.currentTime > nextSeg.endTime) {
                targetVid.currentTime = nextSeg.startTime;
            }

            targetVid.play().then(() => {
                this.monitorPlayback(targetVid, nextSeg.endTime);
            }).catch(e => console.log('Playback:', e));
        } 
        // If target segment is in a NEW video clip:
        else {
            if (currentVid) {
                currentVid.pause();
                currentVid.style.opacity = '0';
                currentVid.style.zIndex = '10';
            }

            if (targetVid) {
                targetVid.style.opacity = '1';
                targetVid.style.zIndex = '20';
                targetVid.currentTime = nextSeg.startTime;

                targetVid.play().then(() => {
                    this.monitorPlayback(targetVid, nextSeg.endTime);
                }).catch(e => console.log('Playback:', e));
            }
        }
    }

    /**
     * Monitors video.currentTime until it reaches target endTime, then pauses smoothly!
     */
    monitorPlayback(video, targetEndTime) {
        const checkTime = () => {
            if (!this.isPlaying) return;

            if (video.currentTime >= targetEndTime - 0.05 || video.ended) {
                video.pause();
                video.currentTime = targetEndTime;
                this.isPlaying = false;

                // If in Auto Tour mode, advance to next segment automatically after 0.5s pause
                if (this.isAutoTour) {
                    if (this.currentSegmentIdx < this.totalSegments - 1) {
                        setTimeout(() => {
                            if (this.isAutoTour) this.playNextSegment();
                        }, 500);
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

    /**
     * Instant jump/seek to a segment without playing
     */
    jumpToSegment(targetIdx) {
        if (targetIdx < 0 || targetIdx >= this.totalSegments) return;
        this.isPlaying = false;
        this.currentSegmentIdx = targetIdx;
        const seg = VIDEO_SEGMENTS[targetIdx];

        // Hide other videos
        this.videoElements.forEach((vid, idx) => {
            if (!vid) return;
            if (idx === seg.clipIndex) {
                vid.style.opacity = '1';
                vid.style.zIndex = '20';
                vid.pause();
                vid.currentTime = seg.startTime;
            } else {
                vid.style.opacity = '0';
                vid.style.zIndex = '10';
                vid.pause();
            }
        });

        this.triggerAudioCue(seg.audioCue);
        this.updateUI(targetIdx);
    }

    triggerAudioCue(cue) {
        if (!window.soundEngine) return;
        if (cue === 'whoosh') window.soundEngine.playTransitionWhoosh(1.0);
        else if (cue === 'door') window.soundEngine.playTransitionWhoosh(1.4);
        else if (cue === 'vault') window.soundEngine.playVaultImpact();
        else if (cue === 'sanctuary') window.soundEngine.playVaultImpact();
        else if (cue === 'chime') window.soundEngine.playRelicChime(0);
        else if (cue === 'astrolabe') window.soundEngine.playRelicChime(1);
        else if (cue === 'emperor') window.soundEngine.playRelicChime(2);
    }

    updateUI(segIdx) {
        const seg = VIDEO_SEGMENTS[segIdx];
        if (!seg) return;

        // Telemetry
        if (this.hudLevel) this.hudLevel.textContent = seg.sector;
        if (this.hudElevation) this.hudElevation.textContent = seg.elevation;
        if (this.hudCoords) this.hudCoords.textContent = seg.coords;
        if (this.hudStageNum) this.hudStageNum.textContent = `BEAT 0${segIdx + 1} / 09`;
        if (this.hudStageName) this.hudStageName.textContent = seg.name;

        // Badge
        if (this.badgeTag) this.badgeTag.textContent = seg.sector;
        if (this.badgeTitle) this.badgeTitle.textContent = seg.name;

        // Floor Nav Highlight
        this.floorNavItems.forEach((item) => {
            const stageAttr = item.getAttribute('data-stage');
            if (stageAttr !== null && parseInt(stageAttr) === seg.clipIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Scrub Bar
        const percent = Math.round(((segIdx + 1) / this.totalSegments) * 100);
        if (this.zoomFill) this.zoomFill.style.width = `${percent}%`;
        if (this.zoomPercent) this.zoomPercent.textContent = `${percent}%`;

        // Update Prompt Banner
        if (this.scrollPrompt) {
            const nextIdx = segIdx + 1;
            if (nextIdx < this.totalSegments) {
                this.scrollPrompt.innerHTML = `
                    <span class="prompt-pulse"></span>
                    <span>SCROLL DOWN TO PLAY NEXT 3s • BEAT 0${nextIdx + 1} OF 09 (${VIDEO_SEGMENTS[nextIdx].name})</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 13l5 5 5-5M7 6l5 5 5-5"/></svg>
                `;
            } else {
                this.scrollPrompt.innerHTML = `
                    <span class="prompt-pulse"></span>
                    <span>JOURNEY COMPLETE • 3D INSPECTION OPEN BELOW</span>
                `;
            }
        }

        // Relic Spotlights in Clip 3 (Segments 6, 7, 8)
        this.relicBadges.forEach((badge, idx) => {
            if (!badge) return;
            if (seg.relicIndex !== undefined && seg.relicIndex === idx) {
                badge.classList.add('visible');
            } else {
                badge.classList.remove('visible');
            }
        });

        // Reliquary Drawer at final beat (Segment 8)
        if (this.reliquaryDrawer) {
            if (segIdx === this.totalSegments - 1) {
                this.reliquaryDrawer.classList.add('visible');
            } else {
                this.reliquaryDrawer.classList.remove('visible');
            }
        }
    }

    toggleAutoTour() {
        if (this.isAutoTour) {
            this.pauseAutoTour();
        } else {
            this.startAutoTour();
        }
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
        this.playNextSegment();
    }

    pauseAutoTour() {
        this.isAutoTour = false;
        this.isPlaying = false;
        const seg = VIDEO_SEGMENTS[this.currentSegmentIdx];
        if (seg && this.videoElements[seg.clipIndex]) {
            this.videoElements[seg.clipIndex].pause();
        }
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
    window.segmentEngine = new SegmentVideoScrollEngine();
});
