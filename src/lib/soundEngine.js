'use client'

let ctx = null
let muted = false

function getCtx() {
  if (typeof window === 'undefined') return null
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)()
  return ctx
}

async function resume() {
  const c = getCtx()
  if (c && c.state === 'suspended') await c.resume()
  return c
}

export function initSound() {
  if (typeof window === 'undefined') return
  muted = localStorage.getItem('cardshark_muted') === '1'
}

// Registers persistent listeners so the AudioContext resumes on ANY user interaction.
export function setupAudioUnlock() {
  if (typeof window === 'undefined') return
  const unlock = () => {
    if (ctx && ctx.state === 'suspended') ctx.resume()
    else if (!ctx) getCtx()
  }
  document.addEventListener('click',      unlock, { capture: true, passive: true })
  document.addEventListener('keydown',    unlock, { capture: true, passive: true })
  document.addEventListener('touchstart', unlock, { capture: true, passive: true })
}

export function isMuted() { return muted }

export function toggleMute() {
  muted = !muted
  if (typeof window !== 'undefined') {
    localStorage.setItem('cardshark_muted', muted ? '1' : '0')
  }
  return muted
}

async function tone(freq, type, duration, gain = 0.3, delay = 0) {
  if (muted) return
  const c = await resume()
  if (!c) return
  const t = c.currentTime + 0.01 + delay
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.connect(g)
  g.connect(c.destination)
  osc.type = type
  osc.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  osc.start(t)
  osc.stop(t + duration + 0.01)
}

async function noise(duration, gain = 0.1, delay = 0) {
  if (muted) return
  const c = await resume()
  if (!c) return
  const t = c.currentTime + 0.01 + delay
  const bufferSize = Math.ceil(c.sampleRate * duration)
  const buffer = c.createBuffer(1, bufferSize, c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
  const src = c.createBufferSource()
  const g = c.createGain()
  src.buffer = buffer
  src.connect(g)
  g.connect(c.destination)
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + duration)
  src.start(t)
}

export const sounds = {
  card_deal: () => {
    tone(800, 'sine', 0.08, 0.2)
    tone(600, 'sine', 0.06, 0.12, 0.06)
  },
  card_flip: () => {
    tone(700, 'triangle', 0.08, 0.15)
    noise(0.04, 0.08)
  },
  chip_win: () => {
    tone(523, 'sine', 0.1, 0.25)
    tone(659, 'sine', 0.1, 0.25, 0.1)
    tone(784, 'sine', 0.2, 0.3, 0.2)
  },
  chip_lose: () => {
    tone(400, 'sawtooth', 0.1, 0.2)
    tone(300, 'sawtooth', 0.15, 0.15, 0.12)
    tone(200, 'sawtooth', 0.2, 0.1, 0.28)
  },
  slot_spin: () => {
    for (let i = 0; i < 6; i++) {
      noise(0.08, 0.12, i * 0.05)
    }
  },
  slot_stop: () => {
    tone(440, 'square', 0.06, 0.2)
    noise(0.04, 0.15)
  },
  dice_roll: () => {
    noise(0.12, 0.1)
    noise(0.08, 0.08, 0.15)
    noise(0.06, 0.06, 0.28)
  },
  dice_result: () => {
    tone(350, 'triangle', 0.08, 0.2)
    tone(420, 'triangle', 0.12, 0.2, 0.1)
  },
  roulette_spin: async () => {
    if (muted) return
    const c = await resume()
    if (!c) return
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.connect(g)
    g.connect(c.destination)
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(80, c.currentTime)
    osc.frequency.linearRampToValueAtTime(350, c.currentTime + 2.0)
    g.gain.setValueAtTime(0.08, c.currentTime)
    g.gain.linearRampToValueAtTime(0.04, c.currentTime + 2.5)
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + 3.0)
    osc.start()
    osc.stop(c.currentTime + 3.1)
  },
  roulette_land: () => {
    tone(600, 'sine', 0.05, 0.3)
    tone(900, 'sine', 0.12, 0.4, 0.05)
    tone(500, 'sine', 0.3, 0.2, 0.18)
  },
  typewriter_click: () => {
    noise(0.015, 0.12)
    tone(1400, 'square', 0.01, 0.06)
  },
  bill_tick: () => {
    noise(0.025, 0.07)
    tone(1800, 'square', 0.015, 0.04)
    tone(1200, 'square', 0.02, 0.03, 0.018)
  },
  invoice_alarm: () => {
    tone(120, 'sawtooth', 0.5, 0.18)
    tone(90, 'sawtooth', 0.7, 0.14, 0.12)
    tone(180, 'sawtooth', 0.4, 0.1, 0.08)
    tone(60, 'sawtooth', 0.9, 0.09, 0.35)
  },
  boot_beep: () => {
    tone(880, 'square', 0.08, 0.15)
    tone(1100, 'square', 0.08, 0.15, 0.12)
  },
}
