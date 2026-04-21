const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, type, duration, slideFreq = null) {
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = type;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    if (slideFreq) {
      osc.frequency.exponentialRampToValueAtTime(slideFreq, audioCtx.currentTime + duration);
    }
    
    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio blocked by browser strict mode. Skipping SFX.");
  }
}

export const sfx = {
  move: () => playTone(300, 'sine', 0.1),
  error: () => playTone(150, 'sawtooth', 0.3),
  loot: () => playTone(800, 'square', 0.2, 1200),
  attack: () => playTone(400, 'square', 0.1, 200),
  damage: () => playTone(100, 'sawtooth', 0.5, 50),
  flatline: () => playTone(80, 'sawtooth', 1.5),
  click: () => playTone(1000, 'sine', 0.05)
};