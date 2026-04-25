// ==========================================
// audio.js — מערכת אודיו: Web Audio + TTS
// ==========================================
let audioCtx = null;
let audioEnabled = true;

function initAudioCtx() {
  if (audioCtx) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) { audioCtx = new AC(); if (audioCtx.state === 'suspended') audioCtx.resume(); }
  } catch(e) {}
}

function playTone(freq, type, duration, delay = 0, vol = 0.1) {
  if (!audioEnabled || !audioCtx) return;
  try {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const t = audioCtx.currentTime + delay;
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.00001, t + duration);
    o.connect(g); g.connect(audioCtx.destination);
    o.start(t); o.stop(t + duration);
  } catch(e) {}
}

function playSuccessSound() {
  playTone(523.25,'sine',0.5,0);
  playTone(659.25,'sine',0.5,0.1);
  playTone(783.99,'sine',0.5,0.2);
  playTone(1046.5,'sine',1.0,0.3);
}
function playErrorSound() {
  playTone(300,'triangle',0.3,0);
  playTone(250,'triangle',0.4,0.15);
}
function playClickSound() {
  playTone(600,'sine',0.1,0,0.05);
}
function playWinSound() {
  [523,659,784,1046,784,1046,1318].forEach((f,i) => playTone(f,'sine',0.4,i*0.12));
}

// TTS – Google Translate
const enc = encodeURIComponent;
let currentAudio = null;

function speakText(text) {
  if (!audioEnabled) return;
  try {
    if (currentAudio) { currentAudio.pause(); currentAudio = null; }
    const a = new Audio('https://translate.google.com/translate_tts?ie=UTF-8&tl=he&client=tw-ob&q=' + enc(text));
    a.volume = 1.0;
    currentAudio = a;
    a.play().catch(() => {});
  } catch(e) {}
}

let globalSuccessCount = 0;

function speakSuccess(gender, isFinal = false) {
  if (!audioEnabled) return;
  const msgs = window.APP_SETTINGS?.successMessages || {
    boy:  { reg:['קול הכבוד, אתה אלוף','עבודה מדהימה','איזה יופי!'], kapara:['מעולה, כפארה עליך'], life:['אתה החיים שלי!'] },
    girl: { reg:['קול הכבוד, את אלופה','עבודה מדהימה','איזה יופי!'], kapara:['מעולה, כפארה עלייך'], life:['את החיים שלי!'] },
  };
  const pool = msgs[gender] || msgs.boy;
  let text;
  if (isFinal) {
    text = pool.life[Math.floor(Math.random() * pool.life.length)];
  } else {
    globalSuccessCount++;
    if (globalSuccessCount % 2 === 0) text = pool.kapara[Math.floor(Math.random() * pool.kapara.length)];
    else text = pool.reg[Math.floor(Math.random() * pool.reg.length)];
  }
  speakText(text);
}

function resetSuccessCount() { globalSuccessCount = 0; }
function setAudioEnabled(v) { audioEnabled = !!v; }
