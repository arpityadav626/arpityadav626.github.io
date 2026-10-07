/**
 * ARCHIVUM IMPERIALIS - Sculpture Inspection & Interactive Reliquary System
 * Handles 3D tilt interaction, lighting switchers, macro inspection loupe,
 * audio resonance, and detailed archaeological provenance dossiers.
 */

const SCULPTURES_DATA = [
    {
        id: "nike",
        number: "RELIC 01 / 03",
        name: "NIKE OF SAMOTHRACE",
        sub: "The Winged Victory • Circa 190 BCE",
        tag: "HELLENISTIC MARBLE & GOLD LEAF",
        image: "assets/images/05_sculpture_nike.jpg",
        chamber: "Vault Chamber Alpha • East Sanctuary",
        dimensions: "244 cm × 180 cm × 120 cm",
        weight: "1,420 kg",
        provenance: "Unearthed on the Aegean island of Samothrace, this masterpiece personifies triumphant divine motion. The wind-swept chiton clings to her athletic form in hyper-realistic folds, accented by sacred gold-leaf repairs along the feather pinions.",
        quote: "“Standing upon the prow of destiny, undefeated against the tides of time.”",
        audioTone: 0,
        telemetry: {
            preservation: "94.8%",
            hardness: "3.5 Mohs (Parian)",
            spectrum: "540nm (Warm Gold)",
            clearance: "Level 4 Imperial"
        }
    },
    {
        id: "astrolabe",
        number: "RELIC 02 / 03",
        name: "THE CELESTIAL ASTROLABE",
        sub: "Kinetic Armillary Sphere • Circa 200 BCE",
        tag: "BRONZE, OBSIDIAN & CRYSTALLINE CORE",
        image: "assets/images/06_sculpture_astrolabe.jpg",
        chamber: "Vault Chamber Beta • Central Treasury Core",
        dimensions: "112 cm × 98 cm × 135 cm",
        weight: "340 kg",
        provenance: "An astronomical computational engine aligned with the legendary Antikythera lineage. Featuring 32 nested precision-geared bronze rings calculating planetary epicycles, surrounding a luminescent crystalline sphere that reacts to cosmic azimuths.",
        quote: "“As above, so below; the heavens held in the palm of mortal hands.”",
        audioTone: 1,
        telemetry: {
            preservation: "98.2%",
            gearing: "32 Harmonic Rings",
            resonance: "Luminous Pulsing Core",
            clearance: "Level 5 Prime"
        }
    },
    {
        id: "aurelius",
        number: "RELIC 03 / 03",
        name: "MARCUS AURELIUS",
        sub: "The Philosopher Emperor • Circa 161 CE",
        tag: "CARRARA MARBLE & GILDED LAUREL WREATH",
        image: "assets/images/07_sculpture_aurelius.jpg",
        chamber: "Vault Chamber Gamma • Stoic Reliquary",
        dimensions: "92 cm × 68 cm × 45 cm",
        weight: "185 kg",
        provenance: "Carved from immaculate Carrara marble, capturing the introspective soul of the philosopher-emperor who penned 'Meditations'. Deeply drilled ringlets frame an unyielding brow crowned by an imperial laurel wreath wrought from beaten gold foil.",
        quote: "“Waste no more time arguing about what a good man should be. Be one.”",
        audioTone: 2,
        telemetry: {
            preservation: "96.5%",
            origin: "Roman Imperial Forum",
            acoustics: "Dampened Vault Echo",
            clearance: "Level 4 Imperial"
        }
    }
];

class SculptureViewer {
    constructor() {
        this.currentSculpture = SCULPTURES_DATA[0];
        this.currentLighting = 'warm'; // warm, uv, gold
        this.isModalOpen = false;
        this.init();
    }

    init() {
        this.renderRelicsShowcase();
        this.setupModal();
        this.setupCardTilt();
    }

    renderRelicsShowcase() {
        const grid = document.getElementById('relics-grid');
        if (!grid) return;

        grid.innerHTML = SCULPTURES_DATA.map((relic, idx) => `
            <div class="relic-card" data-id="${relic.id}" data-index="${idx}">
                <img src="${relic.image}" alt="${relic.name}" class="relic-thumb" loading="lazy" />
                <div class="relic-info">
                    <span class="relic-tag">${relic.tag}</span>
                    <h3 class="relic-name">${relic.name}</h3>
                    <p class="relic-era">${relic.sub}</p>
                </div>
            </div>
        `).join('');

        // Attach click triggers
        grid.querySelectorAll('.relic-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const id = card.getAttribute('data-id');
                const relic = SCULPTURES_DATA.find(r => r.id === id);
                if (relic) {
                    window.soundEngine?.playRelicChime(relic.audioTone);
                    this.openInspectorModal(relic);
                }
            });

            card.addEventListener('mouseenter', () => {
                const idx = parseInt(card.getAttribute('data-index') || 0);
                window.soundEngine?.playRelicChime(idx);
            });
        });
    }

    // 3D Perspective card tilt on mouse movement
    setupCardTilt() {
        document.addEventListener('mousemove', (e) => {
            const cards = document.querySelectorAll('.relic-card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                if (
                    e.clientX >= rect.left - 50 &&
                    e.clientX <= rect.right + 50 &&
                    e.clientY >= rect.top - 50 &&
                    e.clientY <= rect.bottom + 50
                ) {
                    const x = (e.clientX - rect.left) / rect.width - 0.5;
                    const y = (e.clientY - rect.top) / rect.height - 0.5;
                    const rotateX = -y * 14;
                    const rotateY = x * 14;

                    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
                    
                    const glow = card.querySelector('.relic-card-glow');
                    if (glow) {
                        glow.style.opacity = '1';
                        glow.style.background = `radial-gradient(circle at ${(x + 0.5) * 100}% ${(y + 0.5) * 100}%, rgba(212, 175, 55, 0.25), transparent 70%)`;
                    }
                } else {
                    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
                    const glow = card.querySelector('.relic-card-glow');
                    if (glow) glow.style.opacity = '0';
                }
            });
        });
    }

    setupModal() {
        const modal = document.getElementById('inspector-modal');
        const closeBtn = document.getElementById('modal-close');
        if (!modal) return;

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeInspectorModal());
        }

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeInspectorModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) this.closeInspectorModal();
        });

        // Setup 3D rotation dragging in modal
        const stage = document.getElementById('modal-stage-frame');
        const img = document.getElementById('modal-relic-img');
        if (stage && img) {
            let isDragging = false;
            let startX = 0, startY = 0;
            let currentRotY = 0, currentRotX = 0;

            stage.addEventListener('mousedown', (e) => {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                stage.style.cursor = 'grabbing';
            });

            window.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                const deltaX = e.clientX - startX;
                const deltaY = e.clientY - startY;
                startX = e.clientX;
                startY = e.clientY;

                currentRotY += deltaX * 0.45;
                currentRotX -= deltaY * 0.3;
                currentRotX = Math.max(-25, Math.min(25, currentRotX));

                img.style.transform = `perspective(900px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) scale(1.08)`;
                window.soundEngine?.playDialTick();
            });

            window.addEventListener('mouseup', () => {
                if (isDragging) {
                    isDragging = false;
                    stage.style.cursor = 'grab';
                }
            });

            // Lighting Switchers
            document.querySelectorAll('.lighting-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelectorAll('.lighting-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    const mode = btn.getAttribute('data-mode');
                    this.setLightingMode(mode);
                });
            });

            // Reset Rotation
            const resetBtn = document.getElementById('reset-rotation');
            if (resetBtn) {
                resetBtn.addEventListener('click', () => {
                    currentRotX = 0;
                    currentRotY = 0;
                    img.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)`;
                    window.soundEngine?.playDialTick();
                });
            }
        }
    }

    setLightingMode(mode) {
        this.currentLighting = mode;
        const img = document.getElementById('modal-relic-img');
        const spotlight = document.getElementById('modal-spotlight');
        window.soundEngine?.playDialTick();

        if (img) {
            img.className = `modal-img mode-${mode}`;
        }
        if (spotlight) {
            spotlight.className = `modal-spotlight-beam mode-${mode}`;
        }
    }

    openInspectorModal(relic) {
        this.currentSculpture = relic;
        this.isModalOpen = true;
        const modal = document.getElementById('inspector-modal');
        if (!modal) return;

        // Populate modal data
        document.getElementById('modal-number').textContent = relic.number;
        document.getElementById('modal-title').textContent = relic.name;
        document.getElementById('modal-sub').textContent = relic.sub;
        document.getElementById('modal-tag').textContent = relic.tag;
        document.getElementById('modal-relic-img').src = relic.image;
        document.getElementById('modal-relic-img').alt = relic.name;
        document.getElementById('modal-provenance').textContent = relic.provenance;
        document.getElementById('modal-quote').textContent = relic.quote;
        document.getElementById('modal-dimensions').textContent = relic.dimensions;
        document.getElementById('modal-weight').textContent = relic.weight;
        document.getElementById('modal-chamber').textContent = relic.chamber;
        document.getElementById('modal-clearance').textContent = relic.telemetry.clearance;

        // Reset transform & show modal
        const img = document.getElementById('modal-relic-img');
        if (img) {
            img.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg) scale(1)`;
        }

        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    closeInspectorModal() {
        this.isModalOpen = false;
        const modal = document.getElementById('inspector-modal');
        if (modal) modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

window.sculptureViewer = new SculptureViewer();
