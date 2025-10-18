// Sound Manager for HabitHero
// Handles all game sound effects using Web Audio API

class SoundManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.enabled = true;
        this.volume = 0.3; // Default volume (30%)
        
        // Initialize audio context on first user interaction
        this.initialized = false;
    }

    // Initialize audio context (must be called after user interaction)
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('🔊 Sound Manager initialized');
        } catch (e) {
            console.warn('Web Audio API not supported', e);
            this.enabled = false;
        }
    }

    // Generate click sound
    playClick() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(this.volume * 0.3, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.1);
    }

    // Generate gem collection sound (happy chime)
    playGemCollect() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        
        // Create a pleasant ascending chime
        const frequencies = [523.25, 659.25, 783.99]; // C, E, G notes
        
        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = ctx.currentTime + (index * 0.08);
            gainNode.gain.setValueAtTime(this.volume * 0.4, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.3);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.3);
        });
    }

    // Generate level up sound (triumphant fanfare)
    playLevelUp() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        
        // Create an ascending triumphant sound
        const frequencies = [
            [392, 493.88], // G, B
            [523.25, 659.25], // C, E
            [783.99, 1046.50] // G, C
        ];
        
        frequencies.forEach((freqPair, index) => {
            freqPair.forEach(freq => {
                const oscillator = ctx.createOscillator();
                const gainNode = ctx.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(ctx.destination);
                
                oscillator.frequency.value = freq;
                oscillator.type = 'triangle';
                
                const startTime = ctx.currentTime + (index * 0.15);
                gainNode.gain.setValueAtTime(this.volume * 0.3, startTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.4);
            });
        });
    }

    // Generate quest complete sound
    playQuestComplete() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        
        // Create a satisfying completion sound
        const frequencies = [659.25, 783.99, 1046.50]; // E, G, C
        
        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'sine';
            
            const startTime = ctx.currentTime + (index * 0.1);
            gainNode.gain.setValueAtTime(this.volume * 0.35, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.35);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.35);
        });
    }

    // Generate hover sound (subtle)
    playHover() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(this.volume * 0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
    }

    // Generate door open sound
    playDoorOpen() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        oscillator.frequency.setValueAtTime(200, ctx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.2);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(this.volume * 0.2, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.2);
    }

    // Generate reward unlock sound
    playRewardUnlock() {
        if (!this.enabled || !this.initialized) return;
        
        const ctx = this.audioContext;
        
        // Create a magical unlock sound
        const frequencies = [523.25, 659.25, 783.99, 1046.50]; // C, E, G, C
        
        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            
            oscillator.frequency.value = freq;
            oscillator.type = 'triangle';
            
            const startTime = ctx.currentTime + (index * 0.06);
            gainNode.gain.setValueAtTime(this.volume * 0.4, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.5);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + 0.5);
        });
    }

    // Toggle sound on/off
    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Set volume (0 to 1)
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
    }
}

// Create global sound manager instance
const soundManager = new SoundManager();

// Auto-initialize on first user interaction
document.addEventListener('click', () => {
    soundManager.init();
}, { once: true });

document.addEventListener('keydown', () => {
    soundManager.init();
}, { once: true });
