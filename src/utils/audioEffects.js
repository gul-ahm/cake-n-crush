// Audio utility for generating and playing sound effects

export const createCardSwipeSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const now = audioContext.currentTime
  
  // Swipe sound: quick whoosh effect
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  
  osc.connect(gain)
  gain.connect(audioContext.destination)
  
  // Quick pitch sweep down (whoosh effect)
  osc.frequency.setValueAtTime(800, now)
  osc.frequency.exponentialRampToValueAtTime(200, now + 0.15)
  
  gain.gain.setValueAtTime(0.3, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
  
  osc.start(now)
  osc.stop(now + 0.15)
}

export const createScrollSound = () => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)()
  const now = audioContext.currentTime
  
  // Scroll sound: subtle tick effect
  const osc = audioContext.createOscillator()
  const gain = audioContext.createGain()
  
  osc.connect(gain)
  gain.connect(audioContext.destination)
  
  // Soft tick sound
  osc.frequency.setValueAtTime(600, now)
  osc.frequency.exponentialRampToValueAtTime(400, now + 0.08)
  
  gain.gain.setValueAtTime(0.15, now)
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08)
  
  osc.start(now)
  osc.stop(now + 0.08)
}

export const playSound = (soundGenerator) => {
  try {
    soundGenerator()
  } catch (error) {
    console.debug('Audio playback unavailable', error)
  }
}
