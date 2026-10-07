/**
 * LUSION VIRTUAL SCROLL & INTERACTIVE RUNTIME
 * Powers Lusion Studio's smooth inertia virtual scroll,
 * video reel playback & scrub, sound visualizer, menu, and preloader.
 */

(function () {
    // 1. DOM Elements
    const pageContainer = document.getElementById('page-container');
    const scrollIndicator = document.getElementById('scroll-indicator');
    const scrollBar = document.getElementById('scroll-indicator-bar');
    const menuBtn = document.getElementById('header-right-menu-btn');
    const headerMenu = document.getElementById('header-menu');
    const soundBtn = document.getElementById('header-right-sound-btn');
    const footerUp = document.getElementById('footer-bottom-up');
    const videoOverlay = document.getElementById('video-overlay');
    const videoContainer = document.getElementById('home-reel-video-container');

    if (!pageContainer) return;

    // Reset initial transforms
    pageContainer.style.transform = 'translate3d(0px, 0px, 0px)';
    pageContainer.style.opacity = '1';

    // 2. Virtual Scroll State
    let targetScroll = 0;
    let currentScroll = 0;
    let maxScroll = 4500;
    let isMenuOpen = false;

    function updateMaxScroll() {
        const inner = document.getElementById('page-container-inner');
        if (inner) {
            maxScroll = Math.max(0, inner.scrollHeight - window.innerHeight);
        } else {
            maxScroll = Math.max(0, pageContainer.scrollHeight - window.innerHeight);
        }
        if (maxScroll < 2000) maxScroll = 4200; // Fallback safe travel
    }
    window.addEventListener('resize', updateMaxScroll);
    updateMaxScroll();

    // 3. Wheel Event (Continuous Momentum)
    window.addEventListener('wheel', (e) => {
        if (isMenuOpen) return;
        const delta = e.deltaY * 1.5;
        targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + delta));
    }, { passive: true });

    // Touch Event
    let touchStartY = 0;
    window.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
        if (isMenuOpen) return;
        const curY = e.touches[0].clientY;
        const diff = (touchStartY - curY) * 2.4;
        touchStartY = curY;
        targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + diff));
    }, { passive: true });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown' || e.key === 'PageDown') {
            targetScroll = Math.min(maxScroll, targetScroll + 350);
        } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
            targetScroll = Math.max(0, targetScroll - 350);
        }
    });

    // 4. Back to Top
    if (footerUp) {
        footerUp.addEventListener('click', () => {
            targetScroll = 0;
        });
    }

    // 5. Scroll Indicator Bar
    if (scrollIndicator) {
        scrollIndicator.style.opacity = '1';
    }

    // 6. Video Integration into Home Reel
    let reelVideo = null;
    if (videoContainer) {
        // Embed video if not present
        videoContainer.style.position = 'relative';
        videoContainer.style.cursor = 'pointer';

        reelVideo = document.createElement('video');
        reelVideo.src = 'assets/videos/master_journey.mp4';
        reelVideo.muted = true;
        reelVideo.loop = true;
        reelVideo.playsInline = true;
        reelVideo.autoplay = true;
        reelVideo.style.width = '100%';
        reelVideo.style.height = '100%';
        reelVideo.style.objectFit = 'cover';
        reelVideo.style.position = 'absolute';
        reelVideo.style.top = '0';
        reelVideo.style.left = '0';
        reelVideo.style.zIndex = '0';
        videoContainer.insertBefore(reelVideo, videoContainer.firstChild);

        // Click opens full video overlay
        videoContainer.addEventListener('click', () => {
            if (videoOverlay) {
                videoOverlay.style.display = 'flex';
                videoOverlay.style.opacity = '1';

                const player = document.getElementById('video-overlay-player') || document.querySelector('#video-overlay video');
                if (player) {
                    player.currentTime = reelVideo.currentTime || 0;
                    player.play();
                }
            }
        });
    }

    // 7. Video Overlay Controls
    if (videoOverlay) {
        const closeBtn = document.getElementById('video-overlay__mobile-close-btn') || videoOverlay.querySelector('svg');
        if (closeBtn) {
            closeBtn.parentElement.style.cursor = 'pointer';
            closeBtn.parentElement.addEventListener('click', () => {
                videoOverlay.style.opacity = '0';
                setTimeout(() => { videoOverlay.style.display = 'none'; }, 300);
                const player = videoOverlay.querySelector('video');
                if (player) player.pause();
            });
        }

        const playBtn = document.getElementById('video-overlay__play-btn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                const player = videoOverlay.querySelector('video');
                if (player) {
                    if (player.paused) {
                        player.play();
                        playBtn.textContent = 'PAUSE';
                    } else {
                        player.pause();
                        playBtn.textContent = 'PLAY';
                    }
                }
            });
        }

        const muteBtn = document.getElementById('video-overlay__mute-btn');
        if (muteBtn) {
            muteBtn.addEventListener('click', () => {
                const player = videoOverlay.querySelector('video');
                if (player) {
                    player.muted = !player.muted;
                    muteBtn.textContent = player.muted ? 'UNMUTE' : 'MUTE';
                }
            });
        }
    }

    // 8. Menu Toggle
    if (menuBtn && headerMenu) {
        menuBtn.addEventListener('click', () => {
            isMenuOpen = !isMenuOpen;
            if (isMenuOpen) {
                headerMenu.style.transform = 'translate3d(0, 0, 0)';
                headerMenu.style.opacity = '1';
                headerMenu.style.pointerEvents = 'auto';
                menuBtn.classList.add('--active');
            } else {
                headerMenu.style.transform = 'translate3d(100%, 0, 0)';
                headerMenu.style.opacity = '0';
                headerMenu.style.pointerEvents = 'none';
                menuBtn.classList.remove('--active');
            }
        });

        // Menu Links click navigation
        document.querySelectorAll('.header-menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.startsWith('#')) {
                    e.preventDefault();
                    isMenuOpen = false;
                    headerMenu.style.transform = 'translate3d(100%, 0, 0)';
                    headerMenu.style.opacity = '0';
                    headerMenu.style.pointerEvents = 'none';
                    menuBtn.classList.remove('--active');

                    if (href === '#home-hero' || href === '/') targetScroll = 0;
                    else if (href === '#home-reel') targetScroll = 1200;
                    else if (href === '#home-featured' || href === '#projects') targetScroll = 2600;
                }
            });
        });
    }

    // 9. Sound Canvas Visualizer
    if (soundBtn) {
        const soundCanvas = soundBtn.querySelector('canvas');
        if (soundCanvas) {
            const ctx = soundCanvas.getContext('2d');
            let angle = 0;
            let isMuted = true;

            soundBtn.addEventListener('click', () => {
                isMuted = !isMuted;
                if (window.soundEngine) {
                    if (!window.soundEngine.isInitialized) window.soundEngine.init();
                    window.soundEngine.setMuted(isMuted);
                }
            });

            function drawSoundIcon() {
                if (ctx) {
                    ctx.clearRect(0, 0, soundCanvas.width, soundCanvas.height);
                    const cx = soundCanvas.width / 2;
                    const cy = soundCanvas.height / 2;
                    const count = 16;
                    const r = 18;

                    for (let i = 0; i < count; i++) {
                        const a = (i / count) * Math.PI * 2 + angle;
                        const len = !isMuted ? (Math.sin(a * 4 + angle * 3) * 6 + 8) : 4;
                        const x1 = cx + Math.cos(a) * r;
                        const y1 = cy + Math.sin(a) * r;
                        const x2 = cx + Math.cos(a) * (r + len);
                        const y2 = cy + Math.sin(a) * (r + len);

                        ctx.beginPath();
                        ctx.moveTo(x1, y1);
                        ctx.lineTo(x2, y2);
                        ctx.strokeStyle = !isMuted ? '#ffffff' : 'rgba(255,255,255,0.4)';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }

                    if (!isMuted) angle += 0.035;
                }
                requestAnimationFrame(drawSoundIcon);
            }
            requestAnimationFrame(drawSoundIcon);
        }
    }

    // 10. 60FPS Inertia Render Loop
    function render() {
        const delta = targetScroll - currentScroll;
        currentScroll += delta * 0.085;

        // Apply smooth translate to page
        pageContainer.style.transform = `translate3d(0px, -${currentScroll}px, 0px)`;

        // Update scroll indicator bar
        const progress = Math.max(0, Math.min(1, currentScroll / (maxScroll || 1)));
        if (scrollBar) {
            scrollBar.style.transform = `translate3d(0px, ${progress * 220}px, 0px)`;
        }

        // Scrub video smoothly if video exists
        if (reelVideo && reelVideo.duration) {
            const desiredTime = progress * reelVideo.duration;
            const diff = desiredTime - reelVideo.currentTime;
            if (Math.abs(diff) > 0.1 && !reelVideo.seeking) {
                reelVideo.currentTime = desiredTime;
            }
        }

        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);

    console.log("Lusion Virtual Scroll Engine initialized. Max scroll:", maxScroll);
})();
