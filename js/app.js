// ==========================================
// app.js — ניווט, מסכים, אתחול האפליקציה
// ==========================================

window.APP_SETTINGS = {};
let pendingGameMode = '', pendingGameTitle = '', pendingGameIcon = '';
let longPressTimer = null;

// ── מסכים ──
function hideAllScreens() {
  ['start-screen','gender-screen','hub-screen','missing-lang-screen',
   'unified-diff-screen','active-game-container'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  });
}
function showScreen(id) { hideAllScreens(); document.getElementById(id)?.classList.remove('hidden'); }

// ── התחלה ──
function openGenderScreen() {
  initAudioCtx(); playClickSound(); showScreen('gender-screen');
}

function setGender(g) {
  userGender = g;
  resetSuccessCount();
  playClickSound(); initAudioCtx();
  const boyName  = window.APP_SETTINGS.boy_name  || DEFAULTS.boyName;
  const girlName = window.APP_SETTINGS.girl_name || DEFAULTS.girlName;
  const name = g === 'boy' ? boyName : girlName;
  currentPlayerKey = name.toLowerCase().replace(/\s/g, '_');
  document.getElementById('hub-header').textContent = 'המרכז של ' + name;
  document.getElementById('win-header').textContent = 'כל הכבוד ' + name + '! 🏆';
  setAppBackground('hub');
  showScreen('hub-screen');
  loadPlayerProgress();
  if (g === 'boy') {
    speakText('שמעתי שאתה ילד חכם, בוא נשחק יחד!');
  } else {
    speakText('שמעתי שאת ילדה חכמה, בואי נשחק יחד!');
  }
}

// ── רקע ──
function setAppBackground(theme) {
  document.body.className = 'bg-' + theme;
  const bg = document.getElementById('bg-animations'); bg.innerHTML = '';
  if (theme !== 'hub' && BG_ICONS[theme]) {
    BG_ICONS[theme].forEach((icon, i) => {
      const el = document.createElement('div'); el.className = 'bg-floating-icon';
      el.textContent = icon;
      el.style.left = rand(5, 90) + '%';
      el.style.top  = rand(5, 90) + '%';
      el.style.animationDuration  = rand(15, 30) + 's';
      el.style.animationDelay     = -rand(0, 15) + 's';
      bg.appendChild(el);
    });
  }
}

// ── Hub ──
function backToHub() {
  currentStep = 0; mistakesInLevel = 0; isProcessing = false;
  document.getElementById('level-complete-overlay')?.classList.add('hidden');
  document.querySelectorAll('.star').forEach(s => s.classList.remove('earned'));
  setAppBackground('hub');
  showScreen('hub-screen');
  updateWalletDisplay();
}

// ── מסך קושי ──
function openDifficultyScreen(game, icon, title) {
  playClickSound();
  pendingGameMode  = game;
  pendingGameTitle = title;
  pendingGameIcon  = icon;
  document.getElementById('unified-diff-title').textContent = icon + ' ' + title;
  document.getElementById('adaptive-msg')?.classList.add('hidden');
  // הסתר/הצג רמות 4 ו-5
  const show45 = ['sequence','memory','missing','diff','chrono','bigger'].includes(game);
  document.getElementById('lvl-4-btn').style.display = show45 ? '' : 'none';
  document.getElementById('lvl-5-btn').style.display = show45 ? '' : 'none';
  // סמן רמות שהושלמו — שקיפות פדגוגית לגבי ההתקדמות
  [1,2,3,4,5].forEach(lvl => {
    const btn = document.getElementById('lvl-' + lvl + '-btn') ||
                document.querySelector(`.level-card[onclick="startGameEngine(${lvl})"]`);
    if (!btn) return;
    btn.classList.remove('level-done', 'level-partial');
    if (typeof awardedStars !== 'undefined' && awardedStars[game + '-' + lvl]) {
      btn.classList.add('level-done');
    }
  });
  showScreen('unified-diff-screen');
}

// ── התחלת משחק ──
function startGameEngine(difficulty) {
  playClickSound();
  currentGameMode   = pendingGameMode;
  currentDifficulty = difficulty;
  currentStep       = 0;
  mistakesInLevel   = 0;
  isProcessing      = false;
  document.getElementById('game-workspace').innerHTML = '';
  document.getElementById('active-progress-container').innerHTML = '';
  showScreen('active-game-container');
  setAppBackground(currentGameMode);
  const initFn = GAME_INIT_MAP[currentGameMode];
  if (initFn) initFn();
}

// ── אות חסרה – בחירת שפה ──
function openMissingLangScreen() {
  playClickSound(); showScreen('missing-lang-screen');
}
window.startMissingGame = function(lang) {
  missingLang = lang;
  openDifficultyScreen('missing', '🔤', 'איזו אות חסרה?');
};

// ── מסך מלא ──
function toggleFullScreen() {
  const e = document.documentElement;
  const btn = document.getElementById('fullscreen-btn');
  if (!document.fullscreenElement) {
    (e.requestFullscreen || e.webkitRequestFullscreen).call(e);
    if (btn) btn.textContent = '🗗 צא ממסך מלא';
  } else {
    (document.exitFullscreen || document.webkitExitFullscreen).call(document);
    if (btn) btn.textContent = '⤢ מסך מלא';
  }
}

// ── לחיצה ממושכת על כותרת Hub → פאנל ניהול ──
function setupAdminGesture() {
  const header = document.getElementById('hub-header');
  if (!header) return;
  header.addEventListener('touchstart', () => {
    longPressTimer = setTimeout(() => window.location.href = 'admin.html', 3000);
  });
  header.addEventListener('touchend',   () => clearTimeout(longPressTimer));
  header.addEventListener('touchmove',  () => clearTimeout(longPressTimer));
  header.addEventListener('mousedown',  () => { longPressTimer = setTimeout(() => window.location.href = 'admin.html', 3000); });
  header.addEventListener('mouseup',    () => clearTimeout(longPressTimer));
}

// ── מגע נוסף: טשטוש כפול מהיר → Admin (קצבה) ──
let tapCount = 0, tapTimer = null;
function setupDoubleTapAdmin() {
  const logo = document.getElementById('star-wallet-purse');
  if (!logo) return;
  logo.addEventListener('click', () => {
    tapCount++;
    clearTimeout(tapTimer);
    tapTimer = setTimeout(() => tapCount = 0, 1000);
    if (tapCount >= 5) { tapCount = 0; window.location.href = 'admin.html'; }
  });
}

// ── אתחול האפליקציה ──
window.addEventListener('load', async () => {
  // Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // טעינת הגדרות מ-Supabase
  try {
    const settings = await getAllSettings();
    window.APP_SETTINGS = settings;
    setAudioEnabled(settings.audio_enabled !== false);
    const titleEl = document.getElementById('app-main-title');
    if (titleEl && settings.app_title) titleEl.textContent = settings.app_title;
    // הכן הודעות הצלחה
    try {
      const msgs = JSON.parse(settings.success_messages || 'null');
      if (msgs) window.APP_SETTINGS.successMessages = msgs;
    } catch(e) {}
  } catch(e) {}

  // טעינת תוכן משחקים מ-Supabase
  try { await loadGameDataFromSupabase(); } catch(e) {}

  // בניית כרטיסי Hub עם סמלי כוכב
  buildHubCards();

  // הצגת מסך התחלה
  const bar = document.getElementById('loader-bar');
  if (bar) { bar.style.width = '100%'; }
  const lt  = document.getElementById('loader-text');
  if (lt)  lt.textContent = 'הכל מוכן! ✨';
  setTimeout(() => {
    const btn = document.getElementById('start-btn');
    if (btn) { btn.classList.remove('dimmed'); btn.disabled = false; }
  }, 600);

  setupAdminGesture();
  setupDoubleTapAdmin();
});

function buildHubCards() {
  const CATEGORIES = [
    {
      id: 'lang',
      label: '🔤 מילים ואותיות',
      games: [
        { id:'missing',  icon:'🔤', title:'אות חסרה?',      star:'⭐', fn:`openMissingLangScreen()` },
        { id:'sequence', icon:'🔄', title:'סדר נכון',        star:'⭐', fn:`openDifficultyScreen('sequence','🔄','מה הסדר הנכון?')` },
        { id:'chrono',   icon:'⏳', title:'רצף כרונולוגי',   star:'⭐', fn:`openDifficultyScreen('chrono','⏳','מהתחלה לסוף')` },
      ]
    },
    {
      id: 'num',
      label: '🔢 מספרים',
      games: [
        { id:'counting', icon:'🔢', title:'ספירה',           star:'✨', fn:`openDifficultyScreen('counting','🔢','ספור את הצורות')` },
        { id:'bigger',   icon:'⚖️', title:'יותר גדול',       star:'',  fn:`openDifficultyScreen('bigger','⚖️','מה יותר גדול?')` },
      ]
    },
    {
      id: 'think',
      label: '🧠 חשיבה וגילוי',
      games: [
        { id:'memory',   icon:'🧠', title:'זיכרון',          star:'⭐', fn:`openDifficultyScreen('memory','🧠','משחק הזיכרון')` },
        { id:'diff',     icon:'🔎', title:'השונה',           star:'⭐', fn:`openDifficultyScreen('diff','🔎','זהה את השונה')` },
        { id:'oddone',   icon:'🍎', title:'יוצא דופן',       star:'✨', fn:`openDifficultyScreen('oddone','🍎','יוצא דופן')` },
        { id:'tools',    icon:'🔨', title:'כלים',            star:'',  fn:`openDifficultyScreen('tools','🔨','מה הכלי המתאים?')` },
        { id:'context',  icon:'🧩', title:'הקשרים',          star:'✨', fn:`openDifficultyScreen('context','🧩','מה שייך לכאן?')` },
        { id:'vparts',   icon:'🚜', title:'חלקי רכבים',      star:'',  fn:`openDifficultyScreen('vparts','🚜','איזה חלק חסר?')` },
        { id:'habitat',  icon:'🏠', title:'מי גר כאן?',     star:'',  fn:`openDifficultyScreen('habitat','🏠','מי גר כאן?')` },
        { id:'shadow',   icon:'👤', title:'צלליות',          star:'',  fn:`openDifficultyScreen('shadow','👤','של מי הצללית?')` },
        { id:'emotion',  icon:'🎭', title:'רגשות',           star:'',  fn:`openDifficultyScreen('emotion','🎭','איך הם מרגישים?')` },
      ]
    },
    {
      id: 'create',
      label: '🎨 יצירה ומשחק',
      games: [
        { id:'tracing',  icon:'✏️', title:'ציור',            star:'',  fn:`openDifficultyScreen('tracing','✏️','השלם את הצורה')` },
        { id:'halfhalf', icon:'✂️', title:'השלם חצי',        star:'✨', fn:`openDifficultyScreen('halfhalf','✂️','השלם את החצי')` },
        { id:'fly',      icon:'🪰', title:'זבוב בפה',        star:'',  fn:`openDifficultyScreen('fly','🪰','זבוב בפה')` },
        { id:'cop',      icon:'🚓', title:'שוטר וגנב',       star:'',  fn:`openDifficultyScreen('cop','🚓','שוטר וגנב')` },
      ]
    },
  ];

  const container = document.getElementById('hub-container');
  if (!container) return;
  container.innerHTML = '';

  CATEGORIES.forEach(cat => {
    const section = document.createElement('div');
    section.className = 'hub-category-section';

    const header = document.createElement('div');
    header.className = `hub-category-header cat-${cat.id}`;
    header.textContent = cat.label;
    section.appendChild(header);

    const row = document.createElement('div');
    row.className = 'hub-cards-row';

    cat.games.forEach(g => {
      const card = document.createElement('div');
      card.className = `hub-card cat-${cat.id}`;
      card.setAttribute('onclick', g.fn);
      card.dataset.game = g.id;
      card.innerHTML = `
        ${g.star ? `<span class="star-badge">${g.star}</span>` : ''}
        <div class="hub-icon">${g.icon}</div>
        <div class="hub-title">${g.title}</div>
        <div class="hub-card-levels" id="hub-levels-${g.id}"></div>`;
      row.appendChild(card);
    });

    section.appendChild(row);
    container.appendChild(section);
  });
}

// ── עדכון כרטיסי Hub עם התקדמות (פדגוגיה: שקיפות מסלול) ──
function updateHubCardStars() {
  if (typeof awardedStars === 'undefined') return;
  const MAX_LEVELS = { sequence:5, memory:5, missing:5, diff:5, chrono:5, bigger:5 };
  const DEFAULT_MAX = 3;

  // עדכן כל כרטיס
  document.querySelectorAll('.hub-card[data-game]').forEach(card => {
    const game = card.dataset.game;
    const maxLvl = MAX_LEVELS[game] || DEFAULT_MAX;
    const levelsEl = document.getElementById('hub-levels-' + game);
    if (!levelsEl) return;

    let dotsHTML = '';
    let completedCount = 0;
    for (let l = 1; l <= maxLvl; l++) {
      const done = !!awardedStars[game + '-' + l];
      if (done) completedCount++;
      dotsHTML += `<span class="hub-lvl-dot${done ? ' done' : ''}"></span>`;
    }
    levelsEl.innerHTML = dotsHTML;

    // סמן כרטיס שהושלם לחלוטין
    if (completedCount === maxLvl) {
      card.classList.add('hub-card-mastered');
    } else if (completedCount > 0) {
      card.classList.remove('hub-card-mastered');
    }
  });

  // עדכן מונה קטגוריות
  document.querySelectorAll('.hub-category-section').forEach(section => {
    const header = section.querySelector('.hub-category-header');
    const cards  = section.querySelectorAll('.hub-card[data-game]');
    if (!header || !cards.length) return;
    let done = 0;
    cards.forEach(c => { if (c.classList.contains('hub-card-mastered')) done++; });
    let counter = header.querySelector('.cat-counter');
    if (!counter) {
      counter = document.createElement('span');
      counter.className = 'cat-counter';
      header.appendChild(counter);
    }
    counter.textContent = done > 0 ? ` ${done}/${cards.length}` : '';
  });
}
window.updateHubCardStars = updateHubCardStars;

// ── חשיפת פונקציות גלובליות ──
window.openGenderScreen      = openGenderScreen;
window.setGender             = setGender;
window.backToHub             = backToHub;
window.openDifficultyScreen  = openDifficultyScreen;
window.startGameEngine       = startGameEngine;
window.openMissingLangScreen = openMissingLangScreen;
window.toggleFullScreen      = toggleFullScreen;
window.closeLevelComplete    = closeLevelComplete;
window.quitActiveGame        = quitActiveGame;
