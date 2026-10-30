/* ======================================================================
   🚀 ARPIT YADAV — CREATIVE LAB & EXPERIMENTAL STUDIO (script.js)
   Standalone Web Architecture: Audio Synthesis, Canvas Physics & Studio
   ====================================================================== */

(function () {
    'use strict';

    /* ======================================================================
       1. ZERO-PAYLOAD PROCEDURAL WEB AUDIO SYNTHESIZER ENGINE
       ====================================================================== */
    let audioCtx = null;
    let masterCompressor = null;
    let masterGain = null;
    let analyserNode = null;
    let soundEnabled = true;

    try {
        const savedSound = localStorage.getItem('arpit_lab_sound');
        if (savedSound !== null) {
            soundEnabled = savedSound === 'true';
        }
    } catch (e) {}

    function initAudio() {
        if (!audioCtx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) return;
            audioCtx = new AudioContextClass();

            masterCompressor = audioCtx.createDynamicsCompressor();
            masterCompressor.threshold.setValueAtTime(-14, audioCtx.currentTime);
            masterCompressor.knee.setValueAtTime(24, audioCtx.currentTime);
            masterCompressor.ratio.setValueAtTime(8, audioCtx.currentTime);
            masterCompressor.attack.setValueAtTime(0.002, audioCtx.currentTime);
            masterCompressor.release.setValueAtTime(0.1, audioCtx.currentTime);

            analyserNode = audioCtx.createAnalyser();
            analyserNode.fftSize = 64;
            analyserNode.smoothingTimeConstant = 0.8;

            masterGain = audioCtx.createGain();
            masterGain.gain.setValueAtTime(soundEnabled ? 1.0 : 0.0, audioCtx.currentTime);

            masterCompressor.connect(analyserNode);
            analyserNode.connect(masterGain);
            masterGain.connect(audioCtx.destination);

            initAudioVisualizer();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
    }

    ['pointerdown', 'keydown', 'click', 'touchstart'].forEach(evt => {
        window.addEventListener(evt, initAudio, { once: true, passive: true });
    });

    function ensureAudio(cb) {
        if (!soundEnabled) return;
        initAudio();
        if (!audioCtx) return;
        if (audioCtx.state === 'suspended') {
            audioCtx.resume().then(() => cb && cb(audioCtx.currentTime)).catch(() => {});
        }

    // Node Lifecycle & Memory Deallocation Helper
    function autoCleanup(osc, extraNodes) {
        if (!osc) return;
        osc.onended = () => {
            try {
                osc.disconnect();
                if (Array.isArray(extraNodes)) {
                    extraNodes.forEach(node => {
                        if (node && typeof node.disconnect === 'function') {
                            node.disconnect();
                        }
                    });
                }
            } catch (e) {}
        };
    }
 else {
            cb && cb(audioCtx.currentTime);
        }
    }

    // Sound 1: Micro-tick
    window.playButtonHover = function () {
        ensureAudio(t => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            filter.type = 'highpass';
            filter.frequency.setValueAtTime(2800, t);

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(1400, t);
            osc.frequency.exponentialRampToValueAtTime(700, t + 0.022);

            gain.gain.setValueAtTime(0.04, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.022);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterCompressor);
            autoCleanup(osc, [gain, filter]);

            osc.start(t);
            osc.stop(t + 0.024);
        });
    };

    // Sound 2: Acoustic Marimba
    window.playCardHover = function () {
        ensureAudio(t => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();

            filter.type = 'bandpass';
            filter.frequency.setValueAtTime(280, t);
            filter.Q.setValueAtTime(3.0, t);

            osc.type = 'sine';
            osc.frequency.setValueAtTime(160, t);
            osc.frequency.exponentialRampToValueAtTime(80, t + 0.055);

            gain.gain.setValueAtTime(0.09, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.055);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(masterCompressor);
            autoCleanup(osc, [gain, filter]);

            osc.start(t);
            osc.stop(t + 0.06);
        });
    };

    // Sound 3: Mechanical Haptic Click
    window.playButtonClick = function () {
        ensureAudio(t => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(360, t);
            osc.frequency.exponentialRampToValueAtTime(110, t + 0.028);

            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.028);

            osc.connect(gain);
            gain.connect(masterCompressor);
            autoCleanup(osc, [gain, filter]);

            osc.start(t);
            osc.stop(t + 0.03);
        });
    };

    // Sound 4: Liquid Bubble Tone
    window.playNavClick = function () {
        ensureAudio(t => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(440, t);
            osc.frequency.exponentialRampToValueAtTime(880, t + 0.07);

            gain.gain.setValueAtTime(0.07, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.075);

            osc.connect(gain);
            gain.connect(masterCompressor);
            autoCleanup(osc, [gain, filter]);

            osc.start(t);
            osc.stop(t + 0.08);
        });
    };

    // Sound 5: Ratchet Tick
    window.playScrollTick = function () {
        ensureAudio(t => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(1800, t);
            osc.frequency.exponentialRampToValueAtTime(900, t + 0.015);

            gain.gain.setValueAtTime(0.03, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.015);

            osc.connect(gain);
            gain.connect(masterCompressor);
            autoCleanup(osc, [gain, filter]);

            osc.start(t);
            osc.stop(t + 0.016);
        });
    };

    // Sound 6: Linear Key
    window.playKeyTick = function () {
        ensureAudio(t => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(850, t);
            osc.frequency.exponentialRampToValueAtTime(250, t + 0.02);

            gain.gain.setValueAtTime(0.05, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);

            osc.connect(gain);
            gain.connect(masterCompressor);
            autoCleanup(osc, [gain, filter]);

            osc.start(t);
            osc.stop(t + 0.022);
        });
    };

    // Sound 7: Modal State Sound
    window.playModalSound = function (isOpen) {
        ensureAudio(t => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'sine';
            if (isOpen) {
                osc.frequency.setValueAtTime(220, t);
                osc.frequency.exponentialRampToValueAtTime(540, t + 0.12);
            } else {
                osc.frequency.setValueAtTime(440, t);
                osc.frequency.exponentialRampToValueAtTime(180, t + 0.1);
            }

            gain.gain.setValueAtTime(0.08, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);

            osc.connect(gain);
            gain.connect(masterCompressor);
            autoCleanup(osc, [gain, filter]);

            osc.start(t);
            osc.stop(t + 0.13);
        });
    };

    // Sound 8: Crystal Chime
    window.playCozyChime = function () {
        ensureAudio(t => {
            const freqs = [523.25, 659.25, 783.99, 1046.50];
            freqs.forEach((freq, idx) => {
                const noteTime = t + idx * 0.07;
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, noteTime);

                gain.gain.setValueAtTime(0.06, noteTime);
                gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 0.45);

                osc.connect(gain);
                gain.connect(masterCompressor);
                autoCleanup(osc, [gain]);

                osc.start(noteTime);
                osc.stop(noteTime + 0.46);
            });
        });
    };

    // Playable Musical Pentatonic Synth Note
    window.playSynthNote = function (freq) {
        ensureAudio(t => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, t);

            gain.gain.setValueAtTime(0.12, t);
            gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38);

            osc.connect(gain);
            gain.connect(masterCompressor);
            autoCleanup(osc, [gain, filter]);

            osc.start(t);
            osc.stop(t + 0.4);
        });
    };

    // Audio Visualizer Canvas Loop
    function initAudioVisualizer() {
        const canvas = document.getElementById('audio-visualizer-canvas');
        if (!canvas || !analyserNode) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const bufferLength = analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        function draw() {
            requestAnimationFrame(draw);
            analyserNode.getByteFrequencyData(dataArray);

            const width = canvas.width = canvas.clientWidth || 300;
            const height = canvas.height = canvas.clientHeight || 120;

            ctx.clearRect(0, 0, width, height);

            const isDark = document.documentElement.getAttribute('data-mode') === 'dark';
            const barWidth = (width / bufferLength) * 2.2;
            let barHeight;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                barHeight = (dataArray[i] / 255) * height * 0.85;

                if (barHeight < 3) barHeight = 2 + Math.sin(Date.now() * 0.003 + i) * 1.5;

                const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
                if (isDark) {
                    grad.addColorStop(0, '#FF5E1A');
                    grad.addColorStop(1, '#FFB238');
                } else {
                    grad.addColorStop(0, '#FF4F00');
                    grad.addColorStop(1, '#3B82F6');
                }

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.roundRect(x, height - barHeight, Math.max(2, barWidth - 2), barHeight, [2, 2, 0, 0]);
                ctx.fill();

                x += barWidth + 1;
            }
        }
        draw();
    }

    /* ======================================================================
       2. NEVER WALK ALONE — INTERACTIVE CROWD CANVAS ENGINE
       ====================================================================== */
    let crowdSpawnPeep = null;
    let crowdSetSpeed = null;

    (function initCrowdEngine() {
        const canvas = document.getElementById('crowd-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const config = {
            src: 'assets/all-peeps.png',
            rows: 15,
            cols: 7,
        };

        const randomRange = (min, max) => min + Math.random() * (max - min);
        const randomIndex = (array) => (randomRange(0, array.length) | 0);
        const removeFromArray = (array, i) => array.splice(i, 1)[0];
        const removeItemFromArray = (array, item) => removeFromArray(array, array.indexOf(item));
        const removeRandomFromArray = (array) => removeFromArray(array, randomIndex(array));

        const stage = { width: 0, height: 0 };
        const allPeeps = [];
        const availablePeeps = [];
        const crowd = [];
        let speedMultiplier = 1.0;

        const img = new Image();

        const createPeep = (rect) => {
            const p = {
                rect: rect,
                width: rect[2],
                height: rect[3],
                x: 0,
                y: 0,
                anchorY: 0,
                scaleX: 1,
                startX: 0,
                endX: 0,
                startY: 0,
                duration: 10,
                speed: 1,
                progress: 0,
                bobSpeed: 0.4,

                initWalk: function (stg, customX = null, customY = null) {
                    const direction = Math.random() > 0.5 ? 1 : -1;
                    const r = Math.random();
                    const easeIn = r * r;
                    const offsetY = 60 - 180 * easeIn;
                    const sY = customY !== null ? customY : Math.max(30, stg.height - p.height + offsetY);

                    if (direction === 1) {
                        p.startX = -p.width;
                        p.endX = stg.width + p.width;
                        p.scaleX = 1;
                    } else {
                        p.startX = stg.width + p.width;
                        p.endX = -p.width;
                        p.scaleX = -1;
                    }

                    p.startY = sY;
                    p.anchorY = sY;
                    p.x = customX !== null ? customX : p.startX;
                    p.y = sY;
                    p.speed = randomRange(0.7, 1.25) * speedMultiplier;
                    const baseDuration = stg.width > 900 ? 20 : 14;
                    p.duration = baseDuration / p.speed;
                    p.progress = customX !== null ? (p.x - p.startX) / (p.endX - p.startX) : 0;
                },

                update: function (dt) {
                    p.progress += (dt / p.duration) * speedMultiplier;
                    if (p.progress >= 1 || p.progress < 0) return false;

                    p.x = p.startX + (p.endX - p.startX) * p.progress;
                    const bounce = Math.abs(Math.sin(((p.progress * p.duration) / p.bobSpeed) * Math.PI));
                    p.y = p.startY - bounce * 5;
                    return true;
                },

                render: function (context) {
                    context.save();
                    context.translate(p.x, p.y);
                    context.scale(p.scaleX, 1);
                    context.drawImage(
                        img,
                        p.rect[0],
                        p.rect[1],
                        p.rect[2],
                        p.rect[3],
                        0,
                        0,
                        p.width,
                        p.height
                    );
                    context.restore();
                }
            };
            return p;
        };

        const createPeeps = () => {
            const { rows, cols } = config;
            const width = img.naturalWidth || 1050;
            const height = img.naturalHeight || 560;
            const total = rows * cols;
            const rectWidth = width / rows;
            const rectHeight = height / cols;

            allPeeps.length = 0;
            for (let i = 0; i < total; i++) {
                allPeeps.push(
                    createPeep([
                        (i % rows) * rectWidth,
                        ((i / rows) | 0) * rectHeight,
                        rectWidth,
                        rectHeight,
                    ])
                );
            }
        };

        const addPeepToCrowd = (randomizeProgress = false, customX = null, customY = null) => {
            if (!availablePeeps.length) {
                if (crowd.length > 0) {
                    const recycled = crowd.shift();
                    availablePeeps.push(recycled);
                }
            }
            if (!availablePeeps.length) return null;
            const peep = removeRandomFromArray(availablePeeps);
            peep.initWalk(stage, customX, customY);
            if (randomizeProgress && customX === null) {
                peep.progress = Math.random();
                peep.x = peep.startX + (peep.endX - peep.startX) * peep.progress;
            }
            crowd.push(peep);
            crowd.sort((a, b) => a.anchorY - b.anchorY);
            updateCrowdCountBadge();
            return peep;
        };

        const removePeepFromCrowd = (peep) => {
            removeItemFromArray(crowd, peep);
            availablePeeps.push(peep);
            updateCrowdCountBadge();
        };

        function updateCrowdCountBadge() {
            const badge = document.getElementById('crowd-count-val');
            if (badge) badge.innerText = crowd.length;
        }

        const initCrowd = () => {
            const targetCount = stage.width > 900 ? 28 : 16;
            while (availablePeeps.length && crowd.length < targetCount) {
                addPeepToCrowd(true);
            }
        };

        const resize = () => {
            const rect = canvas.getBoundingClientRect();
            stage.width = rect.width || canvas.clientWidth || 800;
            stage.height = rect.height || canvas.clientHeight || 350;

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = Math.floor(stage.width * dpr);
            canvas.height = Math.floor(stage.height * dpr);

            crowd.length = 0;
            availablePeeps.length = 0;
            availablePeeps.push(...allPeeps);

            initCrowd();
        };

        let isVisible = true;
        let lastTime = 0;

        const render = (time) => {
            if (isVisible) {
                requestAnimationFrame(render);
            }

            if (!lastTime) lastTime = time;
            let dt = (time - lastTime) / 1000;
            lastTime = time;
            if (dt > 0.05) dt = 0.05;

            for (let i = crowd.length - 1; i >= 0; i--) {
                const peep = crowd[i];
                const alive = peep.update(dt);
                if (!alive) {
                    removePeepFromCrowd(peep);
                    addPeepToCrowd(false);
                }
            }

            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.scale(dpr, dpr);

            for (let i = 0; i < crowd.length; i++) {
                crowd[i].render(ctx);
            }

            ctx.restore();
        };

        img.onload = () => {
            createPeeps();
            resize();
            requestAnimationFrame(render);
        };
        img.src = config.src;

        window.addEventListener('resize', () => {
            clearTimeout(window.__crowdResizeTimer);
            window.__crowdResizeTimer = setTimeout(resize, 150);
        }, { passive: true });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const clickX = e.clientX - rect.x;
            const clickY = e.clientY - rect.y;
            addPeepToCrowd(false, clickX, clickY);
            if (typeof window.playButtonClick === 'function') window.playButtonClick();
        });

        crowdSpawnPeep = function () {
            addPeepToCrowd(false);
            if (typeof window.playButtonClick === 'function') window.playButtonClick();
        };

        crowdSetSpeed = function (speed) {
            speedMultiplier = parseFloat(speed) || 1.0;
        };
    })();

    /* ======================================================================
       3. SKIPER 19 KINETIC PATH ANIMATION
       ====================================================================== */
    function initSkiper19Interactive() {
        const path = document.getElementById('skiper19-interactive-path');
        const scrubSlider = document.getElementById('skiper19-scrub');
        if (!path) return;

        const length = path.getTotalLength ? path.getTotalLength() : 2500;
        path.style.strokeDasharray = length;
        path.style.strokeDashoffset = length;

        function updatePathOffset(val) {
            const progress = val / 100;
            const offset = length * (1 - progress);
            path.style.strokeDashoffset = offset;
        }

        if (scrubSlider) {
            scrubSlider.addEventListener('input', (e) => {
                updatePathOffset(e.target.value);
            });
        }

        let cur = 0;
        const autoInterval = setInterval(() => {
            cur += 2;
            if (cur > 100) {
                clearInterval(autoInterval);
            } else {
                if (scrubSlider) scrubSlider.value = cur;
                updatePathOffset(cur);
            }
        }, 30);
    }

    /* ======================================================================
       4. MULTILINGUAL NAMASTE PRELOADER REPLAY ENGINE
       ====================================================================== */
    function initNamasteDemo() {
        const wordEl = document.getElementById('demo-preloader-word');
        const curvePath = document.getElementById('demo-curve-path');
        const replayBtn = document.getElementById('btn-replay-namaste');
        if (!wordEl) return;

        const words = [
            "Hello", "Bonjour", "Ciao", "Olá", "こんにちは",
            "Hallå", "Guten Tag", "Hallo", "Namaste 🙏"
        ];

        let isRunning = false;

        function playSequence() {
            if (isRunning) return;
            isRunning = true;
            let idx = 0;
            wordEl.innerText = words[0];

            if (curvePath) {
                curvePath.setAttribute('d', 'M0 60 Q50 60 100 60 L100 60 L0 60 Z');
            }

            const interval = setInterval(() => {
                idx++;
                if (idx < words.length) {
                    wordEl.style.opacity = '0';
                    wordEl.style.transform = 'translateY(6px)';
                    setTimeout(() => {
                        wordEl.innerText = words[idx];
                        wordEl.style.opacity = '1';
                        wordEl.style.transform = 'translateY(0)';
                        if (typeof window.playKeyTick === 'function') window.playKeyTick();
                    }, 50);
                } else {
                    clearInterval(interval);
                    if (curvePath) {
                        let step = 0;
                        const curveAnim = setInterval(() => {
                            step += 0.05;
                            const y = 60 - Math.sin(step * Math.PI) * 45;
                            curvePath.setAttribute('d', `M0 60 Q50 ${y.toFixed(1)} 100 60 L100 60 L0 60 Z`);
                            if (step >= 1) {
                                clearInterval(curveAnim);
                                isRunning = false;
                            }
                        }, 25);
                    } else {
                        isRunning = false;
                    }
                    if (typeof window.playCozyChime === 'function') window.playCozyChime();
                }
            }, 190);
        }

        if (replayBtn) {
            replayBtn.addEventListener('click', () => {
                playSequence();
                if (typeof window.playButtonClick === 'function') window.playButtonClick();
            });
        }

        setTimeout(playSequence, 1200);
    }

    /* ======================================================================
       5. COMMAND PALETTE (CTRL+K / CMD+K) SPOTLIGHT SEARCH
       ====================================================================== */
    function initCommandPalette() {
        const modal = document.getElementById('cmd-palette-modal');
        const input = document.getElementById('cmd-palette-input');
        const triggerBtns = document.querySelectorAll('.cmd-palette-trigger');
        const closeEsc = document.getElementById('cmd-close-esc');
        const resultsList = document.getElementById('cmd-palette-results');
        if (!modal || !input) return;

        let selectedIdx = 0;

        function openPalette() {
            modal.classList.add('active');
            input.value = '';
            filterResults('');
            selectedIdx = 0;
            setTimeout(() => input.focus(), 60);
            if (typeof window.playModalSound === 'function') window.playModalSound(true);
        }

        function closePalette() {
            modal.classList.remove('active');
            input.blur();
            if (typeof window.playModalSound === 'function') window.playModalSound(false);
        }

        function filterResults(query) {
            const q = query.toLowerCase().trim();
            const items = resultsList.querySelectorAll('.cmd-item-btn');
            let firstVisible = -1;

            items.forEach((item, idx) => {
                const text = item.innerText.toLowerCase();
                const match = !q || text.includes(q);
                item.style.display = match ? 'flex' : 'none';
                if (match && firstVisible === -1) firstVisible = idx;
            });

            selectedIdx = Math.max(0, firstVisible);
            updateSelection();
        }

        function updateSelection() {
            const items = Array.from(resultsList.querySelectorAll('.cmd-item-btn:not([style*="display: none"])'));
            items.forEach((item, idx) => {
                item.classList.toggle('selected', idx === selectedIdx);
            });
        }

        triggerBtns.forEach(btn => {
            btn.addEventListener('click', openPalette);
        });

        if (closeEsc) closeEsc.addEventListener('click', closePalette);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) closePalette();
        });

        window.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                modal.classList.contains('active') ? closePalette() : openPalette();
            } else if (e.key === 'Escape' && modal.classList.contains('active')) {
                closePalette();
            } else if (modal.classList.contains('active')) {
                const items = Array.from(resultsList.querySelectorAll('.cmd-item-btn:not([style*="display: none"])'));
                if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    selectedIdx = (selectedIdx + 1) % items.length;
                    updateSelection();
                } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    selectedIdx = (selectedIdx - 1 + items.length) % items.length;
                    updateSelection();
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    if (items[selectedIdx]) items[selectedIdx].click();
                }
            }
        });

        input.addEventListener('input', (e) => {
            filterResults(e.target.value);
            if (typeof window.playKeyTick === 'function') window.playKeyTick();
        });

        resultsList.addEventListener('click', (e) => {
            const btn = e.target.closest('.cmd-item-btn');
            if (!btn) return;
            const action = btn.dataset.action;
            const target = btn.dataset.target;

            closePalette();

            if (action === 'scroll' && target) {
                const el = document.querySelector(target);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            } else if (action === 'theme') {
                toggleTheme();
            } else if (action === 'sound') {
                toggleSound();
            } else if (action === 'upload') {
                openUploadModal();
            } else if (action === 'link' && target) {
                window.location.href = target;
            }
        });
    }

    /* ======================================================================
       6. CUSTOM CREATIONS CRUD & UPLOAD STUDIO (LocalStorage Engine)
       ====================================================================== */
    const STORAGE_KEY = 'arpit_studio_creations';

    function getCustomCreations() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveCustomCreations(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            updateTelemetryUploadCount();
        } catch (e) {
            alert('Storage quota exceeded or error saving to localStorage.');
        }
    }

    function updateTelemetryUploadCount() {
        const badge = document.getElementById('hud-upload-count');
        const items = getCustomCreations();
        if (badge) badge.innerText = `${items.length} Custom`;
    }

    function renderCustomCreations(filterCat = 'all', searchQuery = '') {
        const grid = document.getElementById('custom-creations-grid');
        const emptyState = document.getElementById('empty-creations-state');
        if (!grid) return;

        const allItems = getCustomCreations();
        const q = searchQuery.toLowerCase().trim();

        const filtered = allItems.filter(item => {
            const matchCat = filterCat === 'all' || item.category === filterCat;
            const matchSearch = !q ||
                item.title.toLowerCase().includes(q) ||
                item.description.toLowerCase().includes(q) ||
                (item.tags && item.tags.some(t => t.toLowerCase().includes(q)));
            return matchCat && matchSearch;
        });

        const oldCards = grid.querySelectorAll('.creation-card');
        oldCards.forEach(c => c.remove());

        if (allItems.length === 0) {
            if (emptyState) emptyState.style.display = 'flex';
            return;
        }

        if (emptyState) emptyState.style.display = filtered.length === 0 ? 'flex' : 'none';

        filtered.forEach(item => {
            const card = document.createElement('div');
            card.className = 'creation-card';
            card.dataset.id = item.id;
            card.dataset.category = item.category;

            const mediaHtml = item.image
                ? `<div class="creation-card-media">
                     <img src="${item.image}" alt="${escapeHtml(item.title)}" loading="lazy">
                     <span class="creation-card-badge">✦ USER CREATION</span>
                     <button class="creation-delete-btn" data-delete-id="${item.id}" title="Delete creation">
                         <i class="fas fa-trash"></i>
                     </button>
                   </div>`
                : `<div class="creation-card-media" style="display:flex;align-items:center;justify-content:center;background:var(--bg-subtle);">
                     <i class="fas fa-sparkles" style="font-size:32px;color:var(--accent-signal);"></i>
                     <span class="creation-card-badge">✦ USER CREATION</span>
                     <button class="creation-delete-btn" data-delete-id="${item.id}" title="Delete creation">
                         <i class="fas fa-trash"></i>
                     </button>
                   </div>`;

            const tagsHtml = item.tags && item.tags.length
                ? `<div class="tech-pills">
                     ${item.tags.map(t => `<span>${escapeHtml(t)}</span>`).join('')}
                   </div>`
                : '';

            const linksHtml = `
                ${item.demoUrl ? `<a href="${item.demoUrl}" target="_blank" class="btn-secondary" style="font-size:11px;"><i class="fas fa-play"></i> Live Demo</a>` : ''}
                ${item.githubUrl ? `<a href="${item.githubUrl}" target="_blank" class="btn-secondary" style="font-size:11px;"><i class="fab fa-github"></i> Source</a>` : ''}
            `;

            card.innerHTML = `
                ${mediaHtml}
                <div class="creation-card-body">
                    <span class="creation-category">${escapeHtml(item.category || 'Creative Code')}</span>
                    <h3 class="creation-card-title">${escapeHtml(item.title)}</h3>
                    <p class="creation-card-desc">${escapeHtml(item.description)}</p>
                    ${tagsHtml}
                    <div class="creation-card-footer">
                        <div class="card-action-links">
                            ${linksHtml}
                        </div>
                        <span style="font-family:var(--font-mono);font-size:10px;color:var(--text-muted);">${new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            `;

            grid.appendChild(card);
        });

        grid.querySelectorAll('.creation-delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const id = btn.dataset.deleteId;
                if (confirm('Are you sure you want to remove this creation?')) {
                    deleteCreation(id);
                }
            });
        });
    }

    function deleteCreation(id) {
        let items = getCustomCreations();
        items = items.filter(it => it.id !== id);
        saveCustomCreations(items);
        renderCustomCreations();
        if (typeof window.playButtonClick === 'function') window.playButtonClick();
    }

    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Upload Modal Handling
    const uploadModal = document.getElementById('upload-creation-modal');
    const uploadForm = document.getElementById('upload-creation-form');
    const uploadTriggerBtn = document.getElementById('btn-upload-trigger');
    const uploadCloseBtn = document.getElementById('upload-close-btn');
    const fileInput = document.getElementById('creation-file-input');
    const previewBox = document.getElementById('file-preview-box');
    const previewImg = document.getElementById('file-preview-img');
    let currentUploadedDataUrl = '';

    window.openUploadModal = function () {
        if (!uploadModal) return;
        uploadModal.classList.add('active');
        if (typeof window.playModalSound === 'function') window.playModalSound(true);
    };

    function closeUploadModal() {
        if (!uploadModal) return;
        uploadModal.classList.remove('active');
        if (typeof window.playModalSound === 'function') window.playModalSound(false);
    }

    if (uploadTriggerBtn) uploadTriggerBtn.addEventListener('click', window.openUploadModal);
    if (uploadCloseBtn) uploadCloseBtn.addEventListener('click', closeUploadModal);

    if (uploadModal) {
        uploadModal.addEventListener('click', (e) => {
            if (e.target === uploadModal) closeUploadModal();
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function (event) {
                currentUploadedDataUrl = event.target.result;
                if (previewImg && previewBox) {
                    previewImg.src = currentUploadedDataUrl;
                    previewBox.style.display = 'block';
                }
                if (typeof window.playButtonHover === 'function') window.playButtonHover();
            };
            reader.readAsDataURL(file);
        });
    }

    if (uploadForm) {
        uploadForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = document.getElementById('creation-title').value.trim();
            const category = document.getElementById('creation-category').value;
            const desc = document.getElementById('creation-desc').value.trim();
            const tagsRaw = document.getElementById('creation-tags').value.trim();
            const demoUrl = document.getElementById('creation-demo-url').value.trim();
            const githubUrl = document.getElementById('creation-github-url').value.trim();
            const imageUrlInput = document.getElementById('creation-img-url').value.trim();

            if (!title || !desc) {
                alert('Please provide at least a title and description.');
                return;
            }

            const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];
            const finalImage = currentUploadedDataUrl || imageUrlInput || null;

            const newCreation = {
                id: 'create_' + Date.now(),
                title,
                category,
                description: desc,
                tags,
                image: finalImage,
                demoUrl,
                githubUrl,
                createdAt: new Date().toISOString()
            };

            const list = getCustomCreations();
            list.unshift(newCreation);
            saveCustomCreations(list);

            uploadForm.reset();
            currentUploadedDataUrl = '';
            if (previewBox) previewBox.style.display = 'none';

            closeUploadModal();
            renderCustomCreations();

            const creationsSec = document.getElementById('custom-creations-section');
            if (creationsSec) creationsSec.scrollIntoView({ behavior: 'smooth' });

            if (typeof window.playCozyChime === 'function') window.playCozyChime();
        });
    }

    window.exportCreationsJSON = function () {
        const creations = getCustomCreations();
        const blob = new Blob([JSON.stringify(creations, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `arpit-creative-studio-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (typeof window.playButtonClick === 'function') window.playButtonClick();
    };

    window.importCreationsJSON = function (fileInputEl) {
        if (!fileInputEl.files || !fileInputEl.files[0]) return;
        const file = fileInputEl.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            try {
                const parsed = JSON.parse(e.target.result);
                if (Array.isArray(parsed)) {
                    saveCustomCreations(parsed);
                    renderCustomCreations();
                    alert(`Successfully imported ${parsed.length} creations!`);
                    if (typeof window.playCozyChime === 'function') window.playCozyChime();
                } else {
                    alert('Invalid JSON format: expected an array of creations.');
                }
            } catch (err) {
                alert('Error reading JSON file.');
            }
        };
        reader.readAsText(file);
    };

    /* ======================================================================
       7. THEME & SOUND TOGGLES
       ====================================================================== */
    function toggleTheme() {
        const cur = document.documentElement.getAttribute('data-mode') || 'light';
        const next = cur === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-mode', next);
        document.body.setAttribute('data-mode', next);
        document.body.className = next === 'dark' ? 'dark-theme' : 'light-theme';

        try {
            localStorage.setItem('arpit_lab_theme', next);
        } catch (e) {}

        const themeIcon = document.getElementById('theme-toggle-icon');
        if (themeIcon) {
            themeIcon.className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
        }

        if (typeof window.playButtonClick === 'function') window.playButtonClick();
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        try {
            localStorage.setItem('arpit_lab_sound', soundEnabled ? 'true' : 'false');
        } catch (e) {}

        if (masterGain && audioCtx) {
            masterGain.gain.setValueAtTime(soundEnabled ? 1.0 : 0.0, audioCtx.currentTime);
        }

        const soundIcon = document.getElementById('sound-toggle-icon');
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundIcon) {
            soundIcon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        }
        if (soundBtn) {
            soundBtn.classList.toggle('active', soundEnabled);
        }

        if (soundEnabled && typeof window.playCozyChime === 'function') {
            window.playCozyChime();
        }
    }

    /* ======================================================================
       8. INITIALIZATION & EVENT BINDINGS
       ====================================================================== */
    document.addEventListener('DOMContentLoaded', () => {
        try {
            const savedTheme = localStorage.getItem('arpit_lab_theme');
            if (savedTheme) {
                document.documentElement.setAttribute('data-mode', savedTheme);
                document.body.setAttribute('data-mode', savedTheme);
                document.body.className = savedTheme === 'dark' ? 'dark-theme' : 'light-theme';
                const themeIcon = document.getElementById('theme-toggle-icon');
                if (themeIcon) themeIcon.className = savedTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        } catch (e) {}

        const soundIcon = document.getElementById('sound-toggle-icon');
        const soundBtn = document.getElementById('sound-toggle-btn');
        if (soundIcon) soundIcon.className = soundEnabled ? 'fas fa-volume-up' : 'fas fa-volume-mute';
        if (soundBtn) soundBtn.classList.toggle('active', soundEnabled);

        const themeBtn = document.getElementById('theme-toggle-btn');
        if (themeBtn) themeBtn.addEventListener('click', toggleTheme);
        if (soundBtn) soundBtn.addEventListener('click', toggleSound);

        function updateClock() {
            const el = document.getElementById('live-utc-clock');
            if (el) {
                const now = new Date();
                el.innerText = now.toUTCString().slice(17, 25) + ' UTC';
            }
        }
        updateClock();
        setInterval(updateClock, 1000);

        const copyBtn = document.getElementById('copy-terminal-config');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const code = document.getElementById('terminal-code-block');
                if (code) {
                    navigator.clipboard.writeText(code.innerText).then(() => {
                        const originalText = copyBtn.innerHTML;
                        copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                        if (typeof window.playCozyChime === 'function') window.playCozyChime();
                        setTimeout(() => { copyBtn.innerHTML = originalText; }, 2000);
                    });
                }
            });
        }

        const spawnBtn = document.getElementById('btn-spawn-peep');
        if (spawnBtn) {
            spawnBtn.addEventListener('click', () => {
                if (typeof crowdSpawnPeep === 'function') crowdSpawnPeep();
            });
        }

        const speedSlider = document.getElementById('crowd-speed-slider');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                if (typeof crowdSetSpeed === 'function') crowdSetSpeed(e.target.value);
            });
        }

        const invertInkBtn = document.getElementById('btn-invert-ink');
        if (invertInkBtn) {
            invertInkBtn.addEventListener('click', () => {
                const box = document.getElementById('crowd-canvas-box');
                if (box) box.classList.toggle('invert-ink');
                if (typeof window.playButtonClick === 'function') window.playButtonClick();
            });
        }

        document.querySelectorAll('.sound-pad').forEach(pad => {
            const soundType = pad.dataset.sound;
            pad.addEventListener('click', () => {
                pad.classList.add('triggered');
                setTimeout(() => pad.classList.remove('triggered'), 180);

                switch (soundType) {
                    case 'hover': window.playButtonHover(); break;
                    case 'card': window.playCardHover(); break;
                    case 'click': window.playButtonClick(); break;
                    case 'nav': window.playNavClick(); break;
                    case 'scroll': window.playScrollTick(); break;
                    case 'key': window.playKeyTick(); break;
                    case 'modal': window.playModalSound(true); break;
                    case 'chime': window.playCozyChime(); break;
                    default: window.playButtonClick();
                }
            });
        });

        document.querySelectorAll('.synth-key').forEach(key => {
            const freq = parseFloat(key.dataset.freq) || 440;
            key.addEventListener('click', () => {
                key.classList.add('active-key');
                setTimeout(() => key.classList.remove('active-key'), 220);
                window.playSynthNote(freq);
            });
        });

        const searchInput = document.getElementById('lab-search-input');
        const filterBtns = document.querySelectorAll('.filter-btn');
        let currentFilter = 'all';

        function filterEverything() {
            const q = searchInput ? searchInput.value.toLowerCase().trim() : '';

            document.querySelectorAll('.bento-card').forEach(card => {
                const cat = card.dataset.category || 'all';
                const title = (card.querySelector('.bento-card-title')?.innerText || '').toLowerCase();
                const desc = (card.querySelector('.bento-card-desc')?.innerText || '').toLowerCase();

                const matchCat = currentFilter === 'all' || cat === currentFilter;
                const matchSearch = !q || title.includes(q) || desc.includes(q);

                card.style.display = matchCat && matchSearch ? 'flex' : 'none';
            });

            renderCustomCreations(currentFilter, q);
        }

        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                filterBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.filter;
                filterEverything();
                if (typeof window.playButtonClick === 'function') window.playButtonClick();
            });
        });

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                filterEverything();
                if (typeof window.playKeyTick === 'function') window.playKeyTick();
            });
        }

        const sylvaFullscreenBtn = document.getElementById('btn-sylva-fullscreen');
        if (sylvaFullscreenBtn) {
            sylvaFullscreenBtn.addEventListener('click', () => {
                const container = document.getElementById('sylva-container');
                if (!document.fullscreenElement) {
                    container.requestFullscreen().catch(() => {});
                } else {
                    document.exitFullscreen().catch(() => {});
                }
                if (typeof window.playButtonClick === 'function') window.playButtonClick();
            });
        }

        window.addEventListener('scroll', () => {
            const bar = document.getElementById('top-progress-bar');
            if (bar) {
                const totalH = document.documentElement.scrollHeight - window.innerHeight;
                const progress = totalH > 0 ? (window.scrollY / totalH) * 100 : 0;
                bar.style.width = `${progress}%`;
            }
        }, { passive: true });

        initSkiper19Interactive();
        initNamasteDemo();
        initCommandPalette();
        renderCustomCreations();
        updateTelemetryUploadCount();
    });



    // AudioContext Suspension on Tab Inactivity (Prevents CPU / Battery drain)
    document.addEventListener('visibilitychange', () => {
        if (!audioCtx) return;
        if (document.hidden) {
            audioCtx.suspend().catch(() => {});
        } else if (soundEnabled) {
            audioCtx.resume().catch(() => {});
        }
    });

    // Close AudioContext on Page Teardown
    window.addEventListener('pagehide', () => {
        if (audioCtx && audioCtx.state !== 'closed') {
            audioCtx.close().catch(() => {});
            audioCtx = null;
        }
    });

})();
