/**
 * ARCHIVUM IMPERIALIS - Procedural Web Audio Sound Engine
 * Generates cinematic museum soundscape, ambient vault drone, 
 * acoustic spatial transitions, and interactive relic haptics.
 */
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.masterGain = null;
        this.droneGain = null;
        this.droneOsc1 = null;
        this.droneOsc2 = null;
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
            
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);

            this.setupAmbientDrone();
            this.isInitialized = true;
        } catch (e) {
            console.warn('Web Audio API not supported or blocked:', e);
        }
    }

    setupAmbientDrone() {
        if (!this.ctx) return;
        
        // Low pass filter for cavernous subterranean resonance
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, this.ctx.currentTime);
        filter.Q.setValueAtTime(3.5, this.ctx.currentTime);

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

        // Low frequency twin oscillators for subtle binaural beat
        this.droneOsc1 = this.ctx.createOscillator();
        this.droneOsc1.type = 'sine';
        this.droneOsc1.frequency.setValueAtTime(55, this.ctx.currentTime); // A1 note

        this.droneOsc2 = this.ctx.createOscillator();
        this.droneOsc2.type = 'triangle';
        this.droneOsc2.frequency.setValueAtTime(55.6, this.ctx.currentTime); // subtle 0.6Hz binaural shimmer

        // Noise buffer for atmospheric air movement / vault echo
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = this.ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(220, this.ctx.currentTime);
        noiseFilter.Q.setValueAtTime(6.0, this.ctx.currentTime);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

        whiteNoise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(filter);

        this.droneOsc1.connect(this.droneGain);
        this.droneOsc2.connect(this.droneGain);
        this.droneGain.connect(filter);
        filter.connect(this.masterGain);

        this.droneOsc1.start();
        this.droneOsc2.start();
        whiteNoise.start();
    }

    toggleMute() {
        if (!this.isInitialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        this.isMuted = !this.isMuted;
        if (this.masterGain && this.ctx) {
            const targetGain = this.isMuted ? 0 : 0.6;
            this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
        }
        return !this.isMuted;
    }

    setMuted(muted) {
        if (!this.isInitialized) {
            this.init();
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
        this.isMuted = muted;
        if (this.masterGain && this.ctx) {
            const targetGain = this.isMuted ? 0 : 0.6;
            this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.4);
        }
        return !this.isMuted;
    }

    triggerWhoosh(factor = 1) {
        this.playTransitionWhoosh(factor);
    }

    playStoneThud() {
        this.playVaultImpact();
    }

    playChime(freq = 528) {
        this.playRelicChime(0);
    }

    playImperialFanfare() {
        if (!this.isInitialized || this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            [440, 554.37, 659.25, 880].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(freq, now + idx * 0.08);
                gain.gain.setValueAtTime(0.12, now + idx * 0.08);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.2);
                osc.connect(gain);
                gain.connect(this.masterGain);
                osc.start(now + idx * 0.08);
                osc.stop(now + 2.3);
            });
        } catch (e) {}
    }

    // Triggered when scrolling between architectural chambers
    playTransitionWhoosh(depthFactor = 1) {
        if (!this.isInitialized || this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sine';
            const startFreq = 80 * depthFactor;
            const endFreq = 40 * depthFactor;
            
            osc.frequency.setValueAtTime(startFreq, now);
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + 0.8);

            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(300, now);
            filter.frequency.exponentialRampToValueAtTime(80, now + 0.8);

            gain.gain.setValueAtTime(0.2, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.85);
        } catch (e) {}
    }

    // Heavy vault metallic thud & reverberation
    playVaultImpact() {
        if (!this.isInitialized || this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            
            // Sub-bass thud
            const sub = this.ctx.createOscillator();
            const subGain = this.ctx.createGain();
            sub.type = 'sine';
            sub.frequency.setValueAtTime(90, now);
            sub.frequency.exponentialRampToValueAtTime(28, now + 1.2);
            subGain.gain.setValueAtTime(0.4, now);
            subGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);
            sub.connect(subGain);
            subGain.connect(this.masterGain);
            sub.start(now);
            sub.stop(now + 1.25);

            // Metal ring overtone
            const metal = this.ctx.createOscillator();
            const metalGain = this.ctx.createGain();
            metal.type = 'triangle';
            metal.frequency.setValueAtTime(340, now);
            metal.frequency.exponentialRampToValueAtTime(110, now + 1.5);
            metalGain.gain.setValueAtTime(0.12, now);
            metalGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);
            metal.connect(metalGain);
            metalGain.connect(this.masterGain);
            metal.start(now);
            metal.stop(now + 1.55);
        } catch (e) {}
    }

    // Ethereal relic focus chime (528Hz Solfeggio miracle tone / golden harmony)
    playRelicChime(index = 0) {
        if (!this.isInitialized || this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            const freqs = [528, 660, 792, 1056];
            const baseFreq = freqs[index % freqs.length];

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, now);

            gain.gain.setValueAtTime(0.15, now);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 1.65);
        } catch (e) {}
    }

    // Mechanical dial tick for rotating 3D relics
    playDialTick() {
        if (!this.isInitialized || this.isMuted) return;
        try {
            const now = this.ctx.currentTime;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'highpass';
            osc.frequency.setValueAtTime(1800, now);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

            osc.connect(gain);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 0.045);
        } catch (e) {}
    }
}

window.soundEngine = new SoundEngine();
