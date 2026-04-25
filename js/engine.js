// ==========================================
// engine.js — מנוע המשחק: מצב, כוכבים, פידבק
// ==========================================

// מצב המשחק
let currentGameMode = '';
let currentDifficulty = 1;
let currentStep = 0;
let totalSteps = 4;
let mistakesInLevel = 0;
let isProcessing = false;
let userGender = 'boy';
let currentPlayerKey = 'roi';

// ארנק כוכבים
let starWallet = { full: 0, halves: 0 };
let awardedStars = {};

// טעינת התקדמות מ-Supabase
async function loadPlayerProgress() {
  const rows = await loadProgress(currentPlayerKey);
  starWallet = { full: 0, halves: 0 };
  awardedStars = {};
  rows.forEach(r => {
    const key = r.game + '-' + r.level;
    awardedStars[key] = true;
    starWallet.full   += r.stars_full  || 0;
    starWallet.halves += r.stars_half  || 0;
  });
  updateWalletDisplay();
  // עדכן כרטיסי Hub עם התקדמות שמורה
  window.updateHubCardStars?.();
}

function getStarType(game) {
  if (FULL_STAR_GAMES.includes(game)) return 'full';
  if (HALF_STAR_GAMES.includes(game)) return 'half';
  return 'none';
}
function getTotalStars() { return starWallet.full + Math.floor(starWallet.halves / 2); }

function awardStar(game, level) {
  const key = game + '-' + level;
  if (awardedStars[key]) return;
  awardedStars[key] = true;
  const type = getStarType(game);
  let sf = 0, sh = 0;
  if (type === 'none') return;
  if (level === 1) { starWallet.halves++; sh = 1; }
  else             { starWallet.full++;   sf = 1; }
  saveProgress(currentPlayerKey, game, level, sf, sh);
  updateWalletDisplay();
  // עדכן כרטיס משחק ספציפי
  window.updateHubCardStars?.();
}

function updateWalletDisplay() {
  const el = document.getElementById('star-wallet-display');
  if (!el) return;
  const full = starWallet.full + Math.floor(starWallet.halves / 2);
  const hasHalf = starWallet.halves % 2 === 1;
  let visual = '';
  for (let i = 0; i < Math.min(full, 10); i++) visual += '⭐';
  if (hasHalf) visual += '✨';
  if (!visual) visual = '—';
  const numDisplay = full + (hasHalf ? '.5' : '');
  el.innerHTML = `<div class="wallet-visual">${visual}</div><div class="wallet-count">${numDisplay} ⭐</div>`;
}

// ── ניהול צעדים ──
function buildProgressDots(count) {
  const container = document.getElementById('active-progress-container');
  if (!container) return;
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const d = document.createElement('div');
    d.className = 'progress-dot';
    d.id = 'dot-' + i;
    container.appendChild(d);
  }
}
function markDot(index) {
  const d = document.getElementById('dot-' + index);
  if (d) d.classList.add('fill');
}

// ── תשובה ──
function handleAnswer(isCorrect, wrongBtn, nextFn, retryFn, playSound = true) {
  if (isProcessing) return;
  isProcessing = true;

  if (isCorrect) {
    if (playSound) { initAudioCtx(); playSuccessSound(); }
    speakSuccess(userGender);
    showFeedback(true);
    markDot(currentStep);
    setTimeout(() => {
      isProcessing = false;
      currentStep++;
      if (currentStep >= totalSteps) {
        completeLevel();
      } else {
        if (typeof nextFn === 'function') nextFn();
      }
    }, 1200);
  } else {
    mistakesInLevel++;
    if (playSound) { initAudioCtx(); playErrorSound(); }
    showFeedback(false);
    if (wrongBtn) {
      wrongBtn.classList.add('dimmed');
      setTimeout(() => wrongBtn.classList.remove('dimmed'), 1500);
    }
    setTimeout(() => {
      isProcessing = false;
      if (typeof retryFn === 'function') retryFn();
    }, 1200);
  }
}

// ── פידבק ויזואלי ──
// בנק הודעות מותאם לגיל 4-5 (עקרון חיזוק מיידי ומגוון)
const SUCCESS_MSGS_BOY  = ['כל הכבוד! 🌟','מעולה רועי! 👏','אלוף אמיתי! 🏆','וואו, כל כך טוב! ✨','יופי של תשובה! 🎉','אתה גאון! 🧠','כמה חכם אתה! 😍'];
const SUCCESS_MSGS_GIRL = ['כל הכבוד! 🌟','מעולה! 👏','אלופה אמיתית! 🏆','וואו, כל כך טוב! ✨','יופי של תשובה! 🎉','את גאונה! 🧠','כמה חכמה את! 😍'];
const RETRY_MSGS        = ['נסה שוב! 💪','כמעט! 🔄','אל תוותר! 😊','עוד פעם! 🌈','אתה יכול! ⭐'];

// מעקב רצף הצלחות (combo) לחיזוק מדורג
let successStreak = 0;

function showFeedback(isCorrect) {
  const layer = document.getElementById('feedback-layer');
  if (!layer) return;
  layer.className = 'feedback-icon';
  layer.innerHTML = '';

  if (isCorrect) {
    successStreak++;
    // עוצמת קונפטי עולה עם רצף הצלחות — חיזוק מדורג פדגוגי
    const streakBoost = Math.min(successStreak, 4);
    const msgs = userGender === 'girl' ? SUCCESS_MSGS_GIRL : SUCCESS_MSGS_BOY;
    const msg  = msgs[rand(0, msgs.length - 1)];
    const icon = successStreak >= 3 ? '🔥' : '✅';
    layer.innerHTML = `<span>${icon}</span><div class="feedback-msg">${msg}</div>`;
    if (successStreak >= 3) {
      layer.innerHTML += `<div class="streak-badge">רצף ${successStreak}!</div>`;
    }
    layer.classList.remove('hidden');
    confetti({ particleCount: 50 + streakBoost * 25, spread: 60 + streakBoost * 10, origin: { y: 0.5 }, zIndex: 9999 });
    setTimeout(() => layer.classList.add('hidden'), 1100);
  } else {
    successStreak = 0; // איפוס רצף בשגיאה
    const msg = RETRY_MSGS[rand(0, RETRY_MSGS.length - 1)];
    layer.innerHTML = `<span>🔄</span><div class="feedback-msg">${msg}</div>`;
    layer.classList.remove('hidden');
    setTimeout(() => layer.classList.add('hidden'), 1100);
  }
}

function showKisses() {
  for (let i = 0; i < 7; i++) {
    const kiss = document.createElement('div');
    kiss.className = 'kiss-icon';
    kiss.textContent = '💋';
    const edges = [[rand(5,95), rand(5,15)], [rand(85,95), rand(5,95)], [rand(5,95), rand(85,95)], [rand(5,15), rand(5,95)]];
    const [x, y] = edges[rand(0, 3)];
    kiss.style.left = x + 'vw'; kiss.style.top = y + 'vh';
    kiss.style.setProperty('--rot', rand(-45, 45) + 'deg');
    kiss.style.animationDelay = (Math.random() * 0.4) + 's';
    document.body.appendChild(kiss);
    setTimeout(() => kiss.remove(), 2500);
  }
}

// ── סיום רמה ──
function completeLevel() {
  initAudioCtx(); playWinSound();
  speakSuccess(userGender, true);
  showKisses();
  awardStar(currentGameMode, currentDifficulty);
  successStreak = 0; // איפוס רצף בסיום רמה

  // חישוב כוכבים לפי ביצועים — מקדם מוטיבציה פדגוגי
  const stars = mistakesInLevel === 0 ? 4 : mistakesInLevel <= 1 ? 3 : mistakesInLevel <= 3 ? 2 : 1;
  for (let i = 1; i <= 4; i++) {
    const el = document.getElementById('star-' + i);
    if (el) setTimeout(() => { if (i <= stars) el.classList.add('earned'); }, i * 300);
  }
  // קונפטי עוצמתי יותר לביצוע מושלם
  const perfect = mistakesInLevel === 0;
  confetti({ particleCount: perfect ? 250 : 150, spread: perfect ? 120 : 100, origin: { y: 0.4 }, zIndex: 9999 });
  if (perfect) setTimeout(() => confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 }, angle: 60, zIndex: 9999 }), 400);

  // שמור את המשחק האחרון שנשחק לצורך ה-Hub
  window._lastPlayedGame = currentGameMode;
  setTimeout(() => document.getElementById('level-complete-overlay')?.classList.remove('hidden'), 800);
}

function closeLevelComplete() {
  document.getElementById('level-complete-overlay')?.classList.add('hidden');
  quitActiveGame();
}

function quitActiveGame() {
  currentStep = 0; mistakesInLevel = 0; isProcessing = false;
  document.getElementById('level-complete-overlay')?.classList.add('hidden');
  const stars = document.querySelectorAll('.star');
  stars.forEach(s => s.classList.remove('earned'));
  window.backToHub();
}
