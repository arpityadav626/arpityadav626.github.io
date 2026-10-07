/**
 * ARCHIVUM IMPERIALIS - Main Coordination & UI Controller
 */

document.addEventListener('DOMContentLoaded', () => {
    // 1. Luxury Custom Cursor
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorRing = document.querySelector('.cursor-ring');

    if (cursorDot && cursorRing) {
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
        let ringX = mouseX;
        let ringY = mouseY;

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
        });

        const animateRing = () => {
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;
            cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
            requestAnimationFrame(animateRing);
        };
        requestAnimationFrame(animateRing);

        // Hover enlargements
        document.querySelectorAll('a, button, .relic-card, .floor-nav-item').forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorRing.classList.add('cursor-hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorRing.classList.remove('cursor-hover');
            });
        });
    }

    // 2. Preloader & Sound Initializer
    const preloader = document.getElementById('preloader');
    const enterBtn = document.getElementById('enter-btn');
    const soundToggle = document.getElementById('sound-toggle');
    const soundStatus = document.getElementById('sound-status');

    if (enterBtn) {
        enterBtn.addEventListener('click', () => {
            // Unlock audio on interaction
            window.soundEngine?.unmute();
            if (soundStatus) soundStatus.textContent = 'SOUND : ON';
            if (soundToggle) soundToggle.classList.add('active');

            if (preloader) {
                preloader.style.opacity = '0';
                preloader.style.pointerEvents = 'none';
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 800);
            }
        });
    }

    // Sound Toggle Button
    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            const isUnmuted = window.soundEngine?.toggleMute();
            if (isUnmuted) {
                soundToggle.classList.add('active');
                if (soundStatus) soundStatus.textContent = 'SOUND : ON';
            } else {
                soundToggle.classList.remove('active');
                if (soundStatus) soundStatus.textContent = 'SOUND : OFF';
            }
        });
    }

    // 3. Scroll Down Arrow
    const scrollDownBtn = document.querySelector('.scroll-indicator');
    if (scrollDownBtn) {
        scrollDownBtn.addEventListener('click', () => {
            const stage2 = document.getElementById('stage-hall');
            if (stage2) {
                window.spatialJourney?.lenis?.scrollTo(stage2) || stage2.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    // 4. Acquisition / Private Viewing Modal
    const dossierBtn = document.getElementById('modal-dossier-btn');
    if (dossierBtn) {
        dossierBtn.addEventListener('click', () => {
            const relicName = document.getElementById('modal-title')?.textContent || 'Relic';
            window.soundEngine?.playDialTick();
            alert(`[RESERVATION RECORDED]\n\nPrivate sanctuary viewing request submitted for: ${relicName}.\nOur archivist curator will contact you at your registered imperial transmission.`);
        });
    }
});
