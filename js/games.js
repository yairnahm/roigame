// ==========================================
// games.js — כל 18 המשחקים
// ==========================================
const W = document.getElementById.bind(document);
const D = document;

// ── 1. זיכרון ──────────────────────────────
let memFlipped = [], memMatched = 0, memCards = [];
function initMemoryGame() {
  W('active-game-title').textContent = 'משחק הזיכרון 🧠';
  const pairs = currentDifficulty <= 2 ? 4 : currentDifficulty === 3 ? 6 : 8;
  totalSteps = pairs;
  buildProgressDots(pairs);

  const allIcons = Object.values(GAME_DATA.memory.categories).flat();
  const chosen = shuffle(allIcons).slice(0, pairs);
  const deck = shuffle([...chosen, ...chosen]);
  memCards = []; memFlipped = []; memMatched = 0;

  const cols = pairs <= 4 ? 4 : pairs <= 6 ? 4 : 4;
  const ws = W('game-workspace');
  ws.innerHTML = `<div class="memory-grid" style="grid-template-columns:repeat(${cols},1fr);max-width:${cols*110}px;"></div>`;
  const grid = ws.querySelector('.memory-grid');

  deck.forEach((icon, idx) => {
    const card = D.createElement('div');
    card.className = 'memory-card';
    card.dataset.icon = icon;
    card.dataset.idx = idx;
    card.textContent = '';
    card.style.fontSize = 'clamp(28px,6vmin,52px)';
    card.addEventListener('click', () => flipMemoryCard(card));
    card.addEventListener('touchend', e => { e.preventDefault(); flipMemoryCard(card); });
    grid.appendChild(card);
    memCards.push(card);
  });
}
function flipMemoryCard(card) {
  if (isProcessing || card.classList.contains('flipped') || card.classList.contains('matched') || memFlipped.length >= 2) return;
  initAudioCtx(); playClickSound();
  card.classList.add('flipped');
  card.textContent = card.dataset.icon;
  memFlipped.push(card);
  if (memFlipped.length === 2) {
    isProcessing = true;
    if (memFlipped[0].dataset.icon === memFlipped[1].dataset.icon) {
      setTimeout(() => {
        memFlipped.forEach(c => { c.classList.remove('flipped'); c.classList.add('matched'); });
        memFlipped = []; memMatched++;
        playSuccessSound();
        markDot(currentStep); currentStep++;
        isProcessing = false;
        if (memMatched === totalSteps) completeLevel();
      }, 500);
    } else {
      setTimeout(() => {
        memFlipped.forEach(c => { c.classList.remove('flipped'); c.textContent = ''; });
        memFlipped = []; isProcessing = false;
        mistakesInLevel++;
        playErrorSound();
      }, 900);
    }
  }
}

// ── 2. ציור / טרייסינג ─────────────────────
let tCtx, tCanvas, tDrawing = false, tProgress = 0, tShape = null;
function initTracingGame() {
  W('active-game-title').textContent = 'השלם את הצורה ✏️';
  totalSteps = 4; buildProgressDots(4);
  W('game-workspace').innerHTML = `
    <div id="tracing-layout">
      <div class="canvas-container">
        <canvas class="drawing-canvas" id="trace-canvas"></canvas>
      </div>
      <div id="minimap-area">
        <div style="font-weight:bold;font-size:clamp(13px,2.5vw,17px);color:#333;margin-bottom:8px;">מטרה</div>
        <canvas id="previewCanvas"></canvas>
        <div id="trace-pct" style="margin-top:8px;font-weight:bold;color:#2196F3;font-size:clamp(14px,3vw,20px);">0%</div>
      </div>
    </div>`;
  tCanvas = W('trace-canvas');
  const ratio = window.devicePixelRatio || 1;
  const size = Math.min(tCanvas.parentElement.offsetWidth, tCanvas.parentElement.offsetHeight) || 400;
  tCanvas.width = size * ratio; tCanvas.height = size * ratio;
  tCanvas.style.width = size + 'px'; tCanvas.style.height = size + 'px';
  tCtx = tCanvas.getContext('2d'); tCtx.scale(ratio, ratio);
  loadTracingRound(size);
  tCanvas.addEventListener('mousedown', e => { tDrawing = true; traceDraw(e); });
  tCanvas.addEventListener('mousemove', e => { if (tDrawing) traceDraw(e); });
  tCanvas.addEventListener('mouseup', () => tDrawing = false);
  tCanvas.addEventListener('touchstart', e => { e.preventDefault(); tDrawing = true; traceDraw(e.touches[0]); }, { passive: false });
  tCanvas.addEventListener('touchmove',  e => { e.preventDefault(); if (tDrawing) traceDraw(e.touches[0]); }, { passive: false });
  tCanvas.addEventListener('touchend',   () => tDrawing = false);
}
function loadTracingRound(size = 300) {
  tProgress = 0; W('trace-pct').textContent = '0%';
  const shapes = GAME_DATA.tracing.shapes;
  tShape = shapes[currentStep % shapes.length];
  drawShapeGuide(tCtx, tShape, size);
  drawPreview(tShape, size);
}
function drawShapeGuide(ctx, shape, size) {
  ctx.clearRect(0, 0, size, size);
  ctx.save();
  ctx.setLineDash([12, 8]);
  ctx.strokeStyle = '#bbb'; ctx.lineWidth = 5;
  ctx.beginPath();
  const pts = scalePts(shape.points, size);
  ctx.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => ctx.lineTo(p[0], p[1]));
  if (shape.type === 'circle') ctx.arc(size/2, size/2, size*0.38, 0, Math.PI * 2);
  ctx.stroke(); ctx.restore();
}
function scalePts(pts, size) { return pts.map(([x,y]) => [x/300*size, y/300*size]); }
function drawPreview(shape, size) {
  const pc = W('previewCanvas'); if (!pc) return;
  const s = 150; pc.width = s; pc.height = s;
  const ctx = pc.getContext('2d');
  ctx.strokeStyle = '#2196F3'; ctx.lineWidth = 4; ctx.setLineDash([]);
  ctx.beginPath();
  const pts = scalePts(shape.points, s);
  ctx.moveTo(pts[0][0], pts[0][1]);
  pts.forEach(p => ctx.lineTo(p[0], p[1]));
  ctx.closePath(); ctx.stroke();
}
function traceDraw(e) {
  const rect = tCanvas.getBoundingClientRect();
  const x = (e.clientX - rect.left), y = (e.clientY - rect.top);
  tCtx.save(); tCtx.strokeStyle = '#2196F3'; tCtx.lineWidth = 6;
  tCtx.lineCap = 'round'; tCtx.setLineDash([]);
  tCtx.beginPath(); tCtx.arc(x, y, 3, 0, Math.PI * 2); tCtx.fillStyle = '#2196F3'; tCtx.fill(); tCtx.restore();
  tProgress = Math.min(100, tProgress + 0.8);
  W('trace-pct').textContent = Math.floor(tProgress) + '%';
  if (tProgress >= 85 && !isProcessing) {
    handleAnswer(true, null, () => {
      const size = tCanvas.offsetWidth || 300;
      loadTracingRound(size);
    }, null);
  }
}

// ── 3. ספירה ───────────────────────────────
let countOrder = [];
function initCountingGame() {
  W('active-game-title').textContent = 'ספור את הצורות 🔢';
  totalSteps = 4; buildProgressDots(4);
  countOrder = [];
  W('game-workspace').innerHTML = `
    <div style="position:relative;width:100%;max-width:500px;aspect-ratio:4/3;background:rgba(255,255,255,0.7);border-radius:20px;overflow:hidden;border:4px solid #fff;box-shadow:0 8px 20px rgba(0,0,0,0.1);">
      <div id="count-items-area"></div>
    </div>
    <div id="count-opts" class="opts-row" style="margin-top:2vmin;"></div>`;
  loadCountingRound();
}
function loadCountingRound() {
  const lvl = GAME_DATA.counting.levels[currentDifficulty] || { min:1, max:5 };
  const count = rand(lvl.min, lvl.max);
  const icons = GAME_DATA.counting.icons;
  const icon = icons[rand(0, icons.length - 1)];
  const area = W('count-items-area'); area.innerHTML = '';
  const fz = count > 20 ? 'clamp(10px,2vw,20px)' : count > 10 ? 'clamp(16px,3.5vw,28px)' : 'clamp(26px,5vw,40px)';
  for (let i = 0; i < count; i++) {
    const sp = D.createElement('span'); sp.textContent = icon; sp.style.fontSize = fz; area.appendChild(sp);
  }
  const opts = genCountOpts(count, lvl.max);
  const oArea = W('count-opts'); oArea.innerHTML = '';
  opts.forEach(n => {
    const btn = D.createElement('button'); btn.className = 'text-option-btn'; btn.textContent = n;
    btn.onclick = () => { if (isProcessing) return; handleAnswer(n === count, btn, loadCountingRound, null); };
    oArea.appendChild(btn);
  });
}
function genCountOpts(correct, max) {
  const opts = new Set([correct]);
  while (opts.size < 4) { const v = rand(Math.max(1, correct - 3), Math.min(max, correct + 3)); if (v !== correct) opts.add(v); }
  return shuffle([...opts]);
}

// ── 4. סדר נכון ────────────────────────────
let seqOrder = [];
function initSequenceGame() {
  W('active-game-title').textContent = 'מה הסדר הנכון? 🔄';
  totalSteps = 4; buildProgressDots(4);
  seqOrder = shuffle([...Array(GAME_DATA.sequence.length).keys()]).slice(0, 4);
  W('game-workspace').innerHTML = `<div id="seq-target" class="seq-target-area"></div><div id="seq-opts" class="opts-row"></div>`;
  loadSequenceRound();
}
function loadSequenceRound() {
  const seqs = GAME_DATA.sequence;
  const correct = seqs[seqOrder[currentStep]];
  const tArea = W('seq-target'); tArea.innerHTML = '';
  correct.forEach(item => {
    const sp = D.createElement('span'); sp.className = 'seq-target-item'; sp.textContent = item; tArea.appendChild(sp);
  });
  const opts = generateSeqOptions(correct, seqs);
  const oArea = W('seq-opts'); oArea.innerHTML = '';
  opts.forEach(opt => {
    const btn = D.createElement('button'); btn.className = 'sequence-option-btn';
    opt.forEach(item => { const sp = D.createElement('span'); sp.className = 'seq-opt-item'; sp.textContent = item; btn.appendChild(sp); });
    btn.onclick = () => { if (isProcessing) return; handleAnswer(JSON.stringify(opt) === JSON.stringify(correct), btn, loadSequenceRound, null); };
    oArea.appendChild(btn);
  });
}
function generateSeqOptions(correct, seqs) {
  const shuffled = shuffle([...correct]);
  const opts = [correct];
  let tries = 0;
  while (opts.length < 3 && tries < 30) {
    tries++;
    const s = shuffle([...correct]);
    if (JSON.stringify(s) !== JSON.stringify(correct) && !opts.some(o => JSON.stringify(o) === JSON.stringify(s))) opts.push(s);
  }
  while (opts.length < 3) {
    const other = seqs[rand(0, seqs.length - 1)];
    if (!opts.some(o => JSON.stringify(o) === JSON.stringify(other))) opts.push(other);
  }
  return shuffle(opts);
}

// ── 5. זבוב בפה ────────────────────────────
let flyAnimFrame, flyX, flyY, flyTargetX, flyTargetY, flyCanvas, flyCtx;
function initFlyGame() {
  W('active-game-title').textContent = 'זבוב בפה 🪰';
  totalSteps = 3; buildProgressDots(3);
  W('game-workspace').innerHTML = `
    <div style="position:relative;width:100%;max-width:500px;aspect-ratio:1/1;border-radius:20px;background:rgba(255,255,255,0.7);border:4px solid #fff;box-shadow:0 8px 20px rgba(0,0,0,0.1);overflow:hidden;" id="fly-arena">
      <div id="fly-char" class="path-character" style="font-size:clamp(36px,8vw,60px);top:50%;left:50%;">🪰</div>
      <div id="fly-target" class="path-character" style="font-size:clamp(45px,10vw,70px);top:20%;left:50%;">👄</div>
    </div>
    <p style="color:#333;font-weight:bold;margin-top:1vmin;font-size:clamp(14px,2.5vw,18px);">הזז את הזבוב לפה בלי לגעת בקירות!</p>`;
  loadPathRound('fly');
}
function initCopGame() {
  W('active-game-title').textContent = 'שוטר וגנב 🚓';
  totalSteps = 3; buildProgressDots(3);
  W('game-workspace').innerHTML = `
    <div style="position:relative;width:100%;max-width:500px;aspect-ratio:1/1;border-radius:20px;background:rgba(255,255,255,0.7);border:4px solid #fff;box-shadow:0 8px 20px rgba(0,0,0,0.1);overflow:hidden;" id="fly-arena">
      <div id="fly-char" class="path-character" style="font-size:clamp(36px,8vw,60px);top:50%;left:50%;">🚓</div>
      <div id="fly-target" class="path-character" style="font-size:clamp(45px,10vw,70px);top:20%;left:50%;">🥷</div>
    </div>
    <p style="color:#333;font-weight:bold;margin-top:1vmin;font-size:clamp(14px,2.5vw,18px);">תפוס את הגנב!</p>`;
  loadPathRound('cop');
}
function loadPathRound(type) {
  const arena = W('fly-arena'); if (!arena) return;
  const char = W('fly-char'), target = W('fly-target');
  char.style.top = '80%'; char.style.left = '50%';
  target.style.top = rand(10,30) + '%'; target.style.left = rand(20,80) + '%';
  arena.addEventListener('mousemove', e => movePathChar(e, arena, char, target, type));
  arena.addEventListener('touchmove', e => { e.preventDefault(); movePathChar(e.touches[0], arena, char, target, type); }, { passive: false });
}
function movePathChar(e, arena, char, target, type) {
  if (isProcessing) return;
  const r = arena.getBoundingClientRect();
  const x = ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%';
  const y = ((e.clientY - r.top)  / r.height * 100).toFixed(1) + '%';
  char.style.left = x; char.style.top = y;
  const cx = parseFloat(x), cy = parseFloat(char.style.top);
  const tx = parseFloat(target.style.left), ty = parseFloat(target.style.top);
  if (Math.abs(cx - tx) < 12 && Math.abs(cy - ty) < 12) {
    handleAnswer(true, null, () => loadPathRound(type), null);
  }
}

// ── 7. מצא את השונה ─────────────────────────
const SHAPES_SVG = {
  circle:   (c, r=38) => `<circle cx="50" cy="50" r="${r}" fill="${c}"/>`,
  square:   (c) => `<rect x="12" y="12" width="76" height="76" fill="${c}" rx="10"/>`,
  triangle: (c) => `<polygon points="50,10 90,90 10,90" fill="${c}"/>`,
  star:     (c) => `<polygon points="50,5 61,35 95,35 68,57 79,91 50,70 21,91 32,57 5,35 39,35" fill="${c}"/>`,
  diamond:  (c) => `<polygon points="50,8 92,50 50,92 8,50" fill="${c}"/>`,
};
let diffOrder = [];
function initDiffGame() {
  W('active-game-title').textContent = 'זהה את השונה 🔎';
  totalSteps = 4; buildProgressDots(4);
  const levelKeys = Object.keys(GAME_DATA.diff.levels);
  const lv = GAME_DATA.diff.levels[Math.min(currentDifficulty, levelKeys.length)];
  diffOrder = shuffle(lv.shapes);
  W('game-workspace').innerHTML = `<div id="diff-grid"></div>`;
  loadDiffRound(lv);
}
function loadDiffRound(lv) {
  if (!lv) {
    const lvls = GAME_DATA.diff.levels;
    lv = lvls[Math.min(currentDifficulty, Object.keys(lvls).length)];
  }
  const grid = W('diff-grid'); grid.innerHTML = '';
  const shapes = lv.shapes; const colors = lv.colors;
  const mainShape  = shapes[rand(0, shapes.length - 1)];
  const oddShape   = shapes.filter(s => s !== mainShape)[rand(0, shapes.length - 2)] || shapes[0];
  const mainColor  = colors[rand(0, colors.length - 1)];
  const oddIdx     = rand(0, 3);
  for (let i = 0; i < 4; i++) {
    const isOdd = i === oddIdx;
    const shape = isOdd ? oddShape : mainShape;
    const color = mainColor;
    const wrap = D.createElement('div'); wrap.style.position = 'relative';
    const btn = D.createElement('div'); btn.className = 'diff-option';
    btn.innerHTML = `<svg viewBox="0 0 100 100">${SHAPES_SVG[shape]?.(color) || ''}</svg>`;
    btn.onclick = () => { if (isProcessing) return; handleAnswer(isOdd, btn, () => loadDiffRound(lv), null); };
    wrap.appendChild(btn); grid.appendChild(wrap);
  }
}

// ── 8. יוצא דופן ────────────────────────────
let oddOrder = [];
function initOddOneGame() {
  W('active-game-title').textContent = 'יוצא דופן 🍎';
  totalSteps = 4; buildProgressDots(4);
  oddOrder = shuffle([...Array(GAME_DATA.oddone.sets.length).keys()]).slice(0, 4);
  W('game-workspace').innerHTML = `<div id="oddone-opts" class="opts-row"></div>`;
  loadOddOneRound();
}
function loadOddOneRound() {
  const set = GAME_DATA.oddone.sets[oddOrder[currentStep]];
  const items = shuffle([...set.items]);
  const oddItem = set.items[set.odd];
  const oArea = W('oddone-opts'); oArea.innerHTML = '';
  items.forEach((item, i) => {
    const w = D.createElement('div'); w.className = 'option-wrapper';
    const btn = D.createElement('button'); btn.className = 'option-btn'; btn.textContent = item;
    const n = D.createElement('div'); n.className = 'option-number'; n.textContent = i + 1;
    btn.onclick = () => { if (isProcessing) return; handleAnswer(item === oddItem, btn, loadOddOneRound, null); };
    w.appendChild(btn); w.appendChild(n); oArea.appendChild(w);
  });
}

// ── 9. אות חסרה ─────────────────────────────
let missingLang = 'he', missingOrder = [];
function startMissingGame(lang) {
  missingLang = lang;
  openDifficultyScreen('missing', '🔤', 'איזו אות חסרה?');
}
function initMissingGame() {
  W('active-game-title').textContent = 'איזו אות חסרה? 🔤';
  totalSteps = 4; buildProgressDots(4);
  const words = GAME_DATA.missing[missingLang] || GAME_DATA.missing.he;
  missingOrder = shuffle([...Array(words.length).keys()]).slice(0, 4);
  W('game-workspace').innerHTML = `<div id="missing-word-display"></div><div id="missing-letters-options" class="opts-row"></div>`;
  loadMissingRound();
}
function loadMissingRound() {
  const words = GAME_DATA.missing[missingLang];
  const wd = words[missingOrder[currentStep]];
  const word = wd.word, mi = wd.missing;
  const correctLetter = word[mi];
  const display = W('missing-word-display'); display.innerHTML = '';
  for (let i = 0; i < word.length; i++) {
    if (i === mi) {
      const blank = D.createElement('span'); blank.className = 'missing-blank'; blank.id = 'missing-blank-spot'; blank.textContent = '_'; display.appendChild(blank);
    } else {
      const ch = D.createElement('span'); ch.textContent = word[i]; display.appendChild(ch);
    }
  }
  const abc = missingLang === 'en' ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : 'אבגדהוזחטיכלמנסעפצקרשת';
  const opts = new Set([correctLetter]);
  while (opts.size < 4) { opts.add(abc[rand(0, abc.length - 1)]); }
  const oArea = W('missing-letters-options'); oArea.innerHTML = '';
  shuffle([...opts]).forEach(l => {
    const btn = D.createElement('button'); btn.className = 'missing-letter-btn'; btn.textContent = l;
    btn.onclick = () => {
      if (isProcessing) return;
      if (l === correctLetter) {
        const sp = W('missing-blank-spot'); if (sp) { sp.textContent = l; sp.style.color = '#4CAF50'; sp.style.borderBottomColor = '#4CAF50'; }
        handleAnswer(true, null, loadMissingRound, null);
      } else handleAnswer(false, btn, null, null);
    };
    oArea.appendChild(btn);
  });
}

// ── 10. כלים ────────────────────────────────
let toolOrder = [];
function initToolsGame() {
  W('active-game-title').textContent = 'מה הכלי המתאים? 🔨';
  totalSteps = 4; buildProgressDots(4);
  toolOrder = shuffle([...Array(GAME_DATA.tools.pairs.length).keys()]).slice(0, 4);
  W('game-workspace').innerHTML = `<div id="tool-target-area" class="large-target"></div><div id="tool-options-area" class="opts-row"></div>`;
  loadToolsRound();
}
function loadToolsRound() {
  const pair = GAME_DATA.tools.pairs[toolOrder[currentStep]];
  W('tool-target-area').textContent = pair.obj;
  const opts = shuffle([pair.tool, ...shuffle(pair.wrong).slice(0, 3)]);
  const oArea = W('tool-options-area'); oArea.innerHTML = '';
  opts.forEach((t, i) => {
    const w = D.createElement('div'); w.className = 'option-wrapper';
    const btn = D.createElement('button'); btn.className = 'option-btn'; btn.textContent = t;
    const n = D.createElement('div'); n.className = 'option-number'; n.textContent = i + 1;
    btn.onclick = () => { if (isProcessing) return; handleAnswer(t === pair.tool, btn, loadToolsRound, null); };
    w.appendChild(btn); w.appendChild(n); oArea.appendChild(w);
  });
}

// ── 11. הקשרים ──────────────────────────────
let ctxOrder = [];
function initContextGame() {
  W('active-game-title').textContent = 'מה שייך לכאן? 🧩';
  totalSteps = 4; buildProgressDots(4);
  ctxOrder = shuffle([...Array(GAME_DATA.context.scenes.length).keys()]).slice(0, 4);
  W('game-workspace').innerHTML = `
    <div style="position:relative;width:100%;max-width:680px;height:240px;border-radius:20px;border:5px solid #fff;box-shadow:0 10px 20px rgba(0,0,0,0.18);overflow:hidden;display:flex;justify-content:center;align-items:center;font-size:clamp(75px,18vw,140px);" id="context-scene">
      <div id="context-drop-zone" style="position:absolute;width:15%;aspect-ratio:1/1;min-width:75px;min-height:75px;border:5px dashed #fff;border-radius:50%;background:rgba(255,255,255,0.4);transform:translate(-50%,-50%);display:flex;justify-content:center;align-items:center;transition:0.3s;z-index:5;font-size:clamp(48px,11vw,78px);"></div>
    </div>
    <div class="opts-row" id="context-options"></div>`;
  loadContextRound();
}
function loadContextRound() {
  const scene = GAME_DATA.context.scenes[ctxOrder[currentStep]];
  const s = W('context-scene'); s.style.background = scene.bgC;
  s.innerHTML = scene.bg + `<div id="context-drop-zone" style="top:${scene.t.top};left:${scene.t.left};position:absolute;width:15%;aspect-ratio:1/1;min-width:75px;min-height:75px;border:5px dashed #fff;border-radius:50%;background:rgba(255,255,255,0.4);transform:translate(-50%,-50%);display:flex;justify-content:center;align-items:center;z-index:5;font-size:clamp(48px,11vw,78px);"></div>`;
  const dz = W('context-drop-zone');
  const opts = shuffle([scene.correct, ...scene.wrong]);
  const oArea = W('context-options'); oArea.innerHTML = '';
  opts.forEach((item, i) => {
    const w = D.createElement('div'); w.className = 'option-wrapper';
    const btn = D.createElement('button'); btn.className = 'option-btn'; btn.style.fontSize = 'clamp(48px,11vw,80px)'; btn.textContent = item;
    const n = D.createElement('div'); n.className = 'option-number'; n.textContent = i + 1;
    btn.onclick = () => {
      if (isProcessing) return;
      if (item === scene.correct) { dz.style.border = 'none'; dz.textContent = item; dz.style.animation = 'popIn 0.5s forwards'; handleAnswer(true, null, loadContextRound, null); }
      else handleAnswer(false, btn, null, null);
    };
    w.appendChild(btn); w.appendChild(n); oArea.appendChild(w);
  });
}

// ── 12. חלקי רכבים ──────────────────────────
let vpOrder = [];
function initVPartsGame() {
  W('active-game-title').textContent = 'איזה חלק חסר? 🚜';
  totalSteps = 4; buildProgressDots(4);
  vpOrder = shuffle([...Array(GAME_DATA.vparts.images.length).keys()]).slice(0, 4);
  W('game-workspace').innerHTML = `<div id="vp-target"></div><div id="vp-opts" class="opts-row"></div>`;
  loadVPartsRound();
}
function loadVPartsRound() {
  const imgs = GAME_DATA.vparts.images;
  const p = imgs[vpOrder[currentStep]];
  W('vp-target').innerHTML = `<div style="position:relative;width:100%;height:100%;">
    <img src="${p.img}" alt="תמונת רכב" style="width:100%;height:100%;object-fit:cover;">
    <div class="vp-patch" style="width:${p.cw}%;height:${p.ch}%;left:${p.cx - p.cw/2}%;top:${p.cy - p.ch/2}%;">❓</div></div>`;
  W('vp-target').style.borderColor = '#2196F3';
  const others = imgs.filter(img => img !== p);
  const opts = shuffle([p, ...shuffle(others).slice(0, 3)]);
  const oArea = W('vp-opts'); oArea.innerHTML = '';
  opts.forEach((o, i) => {
    const w = D.createElement('div'); w.className = 'option-wrapper';
    const btn = D.createElement('button'); btn.className = 'option-btn';
    const bsx = 100 / (o.cw / 100), bsy = 100 / (o.ch / 100);
    const px = o.cw < 100 ? ((o.cx - o.cw/2) / (100 - o.cw)) * 100 : 50;
    const py = o.ch < 100 ? ((o.cy - o.ch/2) / (100 - o.ch)) * 100 : 50;
    btn.innerHTML = `<div class="vp-option-inner" style="width:100%;height:100%;background-image:url('${o.img}');background-size:${bsx}% ${bsy}%;background-position:${px}% ${py}%;"></div>`;
    btn.onclick = () => {
      if (isProcessing) return;
      if (o === p) { W('vp-target').innerHTML = `<img src="${p.img}" alt="תמונת רכב" style="width:100%;height:100%;object-fit:cover;animation:superPop 0.5s ease-out forwards;">`; W('vp-target').style.borderColor = '#4CAF50'; }
      handleAnswer(o === p, btn, loadVPartsRound, null);
    };
    const n = D.createElement('div'); n.className = 'option-number'; n.textContent = i + 1;
    w.appendChild(btn); w.appendChild(n); oArea.appendChild(w);
  });
}

// ── 13. יותר גדול ────────────────────────────
function initBiggerGame() {
  W('active-game-title').textContent = 'מה יותר גדול? ⚖️';
  totalSteps = 4; buildProgressDots(4);
  W('game-workspace').innerHTML = `<div id="bigger-opts"></div>`;
  loadBiggerRound();
}
function loadBiggerRound() {
  const lvl = GAME_DATA.bigger.levels[currentDifficulty] || { max: 5 };
  let a = rand(1, lvl.max), b = rand(1, lvl.max);
  while (a === b) b = rand(1, lvl.max);
  const isNumbers = rand(0, 1) === 0;
  const allIcons = GAME_DATA.shadow.icons;
  const icon = allIcons[rand(0, allIcons.length - 1)];
  const oArea = W('bigger-opts'); oArea.innerHTML = '';
  const correctVal = Math.max(a, b);
  shuffle([a, b]).forEach(val => {
    const w = D.createElement('div'); w.className = 'option-wrapper';
    const btn = D.createElement('button'); btn.className = 'option-btn';
    btn.style.cssText = 'width:clamp(110px,30vw,230px);height:clamp(110px,30vw,230px);display:flex;flex-wrap:wrap;justify-content:center;align-content:center;gap:clamp(2px,1vw,7px);padding:12px;';
    if (isNumbers) {
      btn.innerHTML = `<div style="font-size:clamp(55px,18vw,110px);font-weight:900;">${val}</div>`;
    } else {
      const fz = val > 15 ? 'clamp(10px,2vw,18px)' : val > 8 ? 'clamp(16px,3.5vw,26px)' : 'clamp(26px,5vw,40px)';
      btn.innerHTML = Array.from({length:val}, () => `<span style="font-size:${fz};line-height:1;">${icon}</span>`).join('');
    }
    btn.onclick = () => { if (isProcessing) return; handleAnswer(val === correctVal, btn, loadBiggerRound, null); };
    w.appendChild(btn); oArea.appendChild(w);
  });
}

// ── 14. רגשות ────────────────────────────────
let emotionOrder = [];
function initEmotionGame() {
  W('active-game-title').textContent = 'איך הם מרגישים? 🎭';
  totalSteps = 4; buildProgressDots(4);
  emotionOrder = shuffle([...Array(GAME_DATA.emotion.images.length).keys()]).slice(0, 4);
  W('game-workspace').innerHTML = `<div id="emo-img"></div><div id="emo-opts" class="opts-row" style="gap:12px;"></div>`;
  loadEmotionRound();
}
function loadEmotionRound() {
  const imgs = GAME_DATA.emotion.images;
  const p = imgs[emotionOrder[currentStep]];
  const url = `https://tse1.mm.bing.net/th?q=${encodeURIComponent(p.q)}&w=600&h=400&c=7&rs=1`;
  W('emo-img').innerHTML = `<img src="${url}" alt="תמונת ילד/ה" style="width:100%;height:100%;object-fit:cover;animation:popIn 0.5s;">`;
  const oArea = W('emo-opts'); oArea.innerHTML = '';
  GAME_DATA.emotion.labels.forEach(lbl => {
    const btn = D.createElement('button'); btn.className = 'option-btn';
    btn.style.cssText = 'width:clamp(68px,18vmin,140px);height:auto;padding:10px;display:flex;flex-direction:column;gap:5px;';
    btn.innerHTML = `<span style="font-size:clamp(28px,7vw,55px);">${lbl.e}</span><span style="font-size:clamp(14px,3.5vw,22px);line-height:1;">${lbl.t}</span>`;
    btn.onclick = () => { if (isProcessing) return; handleAnswer(lbl.id === p.ans, btn, loadEmotionRound, null); };
    oArea.appendChild(btn);
  });
}

// ── 15. מי גר כאן ────────────────────────────
let habOrder = [];
function initHabitatGame() {
  W('active-game-title').textContent = 'מי גר כאן? 🏠';
  totalSteps = 4; buildProgressDots(4);
  habOrder = shuffle([...Array(GAME_DATA.habitat.pairs.length).keys()]).slice(0, 4);
  W('game-workspace').innerHTML = `<div id="tool-target-area" class="large-target"></div><div id="tool-options-area" class="opts-row"></div>`;
  loadHabitatRound();
}
function loadHabitatRound() {
  const pair = GAME_DATA.habitat.pairs[habOrder[currentStep]];
  W('tool-target-area').textContent = pair.animal;
  const others = GAME_DATA.habitat.pairs.filter(p => p !== pair).map(p => p.home);
  const opts = shuffle([pair.home, ...shuffle(others).slice(0, 3)]);
  const oArea = W('tool-options-area'); oArea.innerHTML = '';
  opts.forEach((t, i) => {
    const w = D.createElement('div'); w.className = 'option-wrapper';
    const btn = D.createElement('button'); btn.className = 'option-btn'; btn.textContent = t;
    const n = D.createElement('div'); n.className = 'option-number'; n.textContent = i + 1;
    btn.onclick = () => { if (isProcessing) return; handleAnswer(t === pair.home, btn, loadHabitatRound, null); };
    w.appendChild(btn); w.appendChild(n); oArea.appendChild(w);
  });
}

// ── 16. צלליות ──────────────────────────────
let shadOrder = [];
function initShadowGame() {
  W('active-game-title').textContent = 'של מי הצללית? 👤';
  totalSteps = 4; buildProgressDots(4);
  shadOrder = shuffle([...GAME_DATA.shadow.icons]).slice(0, 4);
  W('game-workspace').innerHTML = `<div id="tool-target-area" class="large-target shadow-filter"></div><div id="tool-options-area" class="opts-row"></div>`;
  loadShadowRound();
}
function loadShadowRound() {
  const p = shadOrder[currentStep];
  const tgt = W('tool-target-area'); tgt.textContent = p; tgt.classList.add('shadow-filter');
  tgt.style.animation = 'none';
  const others = GAME_DATA.shadow.icons.filter(x => x !== p);
  const opts = shuffle([p, ...shuffle(others).slice(0, 3)]);
  const oArea = W('tool-options-area'); oArea.innerHTML = '';
  opts.forEach((t, i) => {
    const w = D.createElement('div'); w.className = 'option-wrapper';
    const btn = D.createElement('button'); btn.className = 'option-btn'; btn.textContent = t;
    const n = D.createElement('div'); n.className = 'option-number'; n.textContent = i + 1;
    btn.onclick = () => {
      if (isProcessing) return;
      if (t === p) { tgt.classList.remove('shadow-filter'); tgt.style.animation = 'superPop 0.5s ease-out forwards'; }
      handleAnswer(t === p, btn, () => { tgt.classList.add('shadow-filter'); loadShadowRound(); }, null);
    };
    w.appendChild(btn); w.appendChild(n); oArea.appendChild(w);
  });
}

// ── 17. השלם חצי ────────────────────────────
let halfOrder = [];
function initHalfHalfGame() {
  W('active-game-title').textContent = 'השלם את החצי ✂️';
  totalSteps = 4; buildProgressDots(4);
  halfOrder = shuffle([...GAME_DATA.halfhalf.icons]).slice(0, 4);
  W('game-workspace').innerHTML = `<div id="half-targ" class="half-target half-left" style="margin-bottom:2vmin;"></div><div id="half-opts" class="opts-row"></div>`;
  loadHalfRound();
}
function loadHalfRound() {
  const p = halfOrder[currentStep];
  const tgt = W('half-targ'); tgt.textContent = p; tgt.style.animation = 'none';
  const others = GAME_DATA.halfhalf.icons.filter(x => x !== p);
  const opts = shuffle([p, ...shuffle(others).slice(0, 3)]);
  const oArea = W('half-opts'); oArea.innerHTML = '';
  opts.forEach((t, i) => {
    const w = D.createElement('div'); w.className = 'option-wrapper';
    const btn = D.createElement('button'); btn.className = 'option-btn'; btn.style.fontSize = 'clamp(55px,13vw,90px)';
    btn.innerHTML = `<div class="half-right">${t}</div>`;
    const n = D.createElement('div'); n.className = 'option-number'; n.textContent = i + 1;
    btn.onclick = () => {
      if (isProcessing) return;
      if (t === p) { tgt.classList.remove('half-left'); tgt.style.animation = 'superPop 0.5s ease-out forwards'; }
      handleAnswer(t === p, btn, () => { tgt.classList.add('half-left'); loadHalfRound(); }, null);
    };
    w.appendChild(btn); w.appendChild(n); oArea.appendChild(w);
  });
}

// ── 18. רצף כרונולוגי ───────────────────────
let chronoOrder = [], chronoSelected = [];
function initChronoGame() {
  W('active-game-title').textContent = 'סדרו מהתחלה לסוף ⏳';
  totalSteps = 4; buildProgressDots(4);
  chronoOrder = shuffle([...Array(GAME_DATA.chrono.sequences.length).keys()]).slice(0, 4);
  W('game-workspace').innerHTML = `<div class="seq-target-area" id="c-targ"></div><div id="c-opts" class="opts-row"></div>`;
  loadChronoRound();
}
function loadChronoRound() {
  chronoSelected = [];
  const p = GAME_DATA.chrono.sequences[chronoOrder[currentStep]];
  const tArea = W('c-targ'); tArea.innerHTML = '';
  for (let i = 0; i < p.length; i++) {
    const d = D.createElement('div'); d.className = 'chrono-empty'; d.id = 'c-slot-' + i; tArea.appendChild(d);
  }
  const oArea = W('c-opts'); oArea.innerHTML = '';
  shuffle([...p]).forEach((o, i) => {
    const btn = D.createElement('button'); btn.className = 'option-btn'; btn.style.fontSize = 'clamp(48px,11vw,80px)'; btn.textContent = o;
    btn.onclick = () => {
      if (isProcessing || btn.classList.contains('hidden')) return;
      playClickSound();
      btn.classList.add('hidden');
      chronoSelected.push({ val: o, btn });
      const slot = W('c-slot-' + (chronoSelected.length - 1));
      if (slot) { slot.textContent = o; slot.style.border = 'none'; slot.style.animation = 'popIn 0.3s forwards'; }
      if (chronoSelected.length === p.length) checkChronoAnswer(p);
    };
    oArea.appendChild(btn);
  });
}
function checkChronoAnswer(p) {
  const correct = chronoSelected.map(x => x.val).join('') === p.join('');
  if (correct) {
    handleAnswer(true, null, loadChronoRound, null);
  } else {
    handleAnswer(false, null, null, () => {
      chronoSelected.forEach(x => x.btn.classList.remove('hidden'));
      loadChronoRound();
    }, false);
  }
}

// ── מפת משחק → פונקציית אתחול ──────────────
const GAME_INIT_MAP = {
  memory:   initMemoryGame,
  tracing:  initTracingGame,
  counting: initCountingGame,
  sequence: initSequenceGame,
  fly:      initFlyGame,
  cop:      initCopGame,
  diff:     initDiffGame,
  oddone:   initOddOneGame,
  missing:  initMissingGame,
  tools:    initToolsGame,
  context:  initContextGame,
  vparts:   initVPartsGame,
  bigger:   initBiggerGame,
  emotion:  initEmotionGame,
  habitat:  initHabitatGame,
  shadow:   initShadowGame,
  halfhalf: initHalfHalfGame,
  chrono:   initChronoGame,
  sharing:  initSharingGame,
};

// ── 19. לחלוק ולהצליח ──────────────────────────────
function initSharingGame() {
  const SCENES = [
    {
      question: 'רועי ונועם רוצים לשחק עם המשאית האדומה, אבל יש רק אחת. מה יעשה רועי?',
      situation: 'images/sharing/03_scene1_truck_basic.webp',
      badImg:    'images/sharing/04_scene1_truck_bad_choice.webp',
      goodImg:   'images/sharing/05_scene1_truck_good_choice.webp',
      wrongBtn:  '😤 לקחת את המשאית לבד',
      rightBtn:  '🤝 לשתף עם נועם',
      badText:   '😢 כשלא משתפים — חברים עצובים...',
      goodText:  '🌟 כשמחלקים — כולם שמחים!',
    },
    {
      question: 'רועי משחק בטאבלט. נועם רוצה גם לשחק. מה יעשה רועי?',
      situation: 'images/sharing/06_scene2_tablet_basic.webp',
      badImg:    'images/sharing/07_scene2_tablet_bad_choice.webp',
      goodImg:   'images/sharing/08_scene2_tablet_good_choice.webp',
      wrongBtn:  '😤 להגיד לנועם "לא!"',
      rightBtn:  '🔄 לשחק בתורות',
      badText:   '😢 להגיד "לא" — זה לא יפה...',
      goodText:  '🌟 תור תור — ידידות אמת!',
    },
    {
      question: 'נשארה עוגייה אחת. גם רועי וגם נועם רוצים אותה. מה יעשה רועי?',
      situation: 'images/sharing/09_scene3_cookie_basic.webp',
      badImg:    'images/sharing/10_scene3_cookie_bad_choice.webp',
      goodImg:   'images/sharing/11_scene3_cookie_good_choice.webp',
      wrongBtn:  '😤 לאכול את כל העוגייה',
      rightBtn:  '🍪 לחלק לשניים',
      badText:   '😢 לקחת הכל — נועם עצוב...',
      goodText:  '🌟 לחצות ולשתף — שניהם שמחים!',
    },
    {
      question: 'רועי רוצה לרדת בגלשן, אבל ילדים אחרים מחכים בתור. מה יעשה רועי?',
      situation: 'images/sharing/12_scene4_playground_basic.webp',
      badImg:    'images/sharing/13_scene4_playground_bad_choice.webp',
      goodImg:   'images/sharing/14_scene4_playground_good_choice.webp',
      wrongBtn:  '😤 לדחוף ולקפוץ לפני כולם',
      rightBtn:  '⏳ לחכות בסבלנות בתור',
      badText:   '😢 לדחוף — זה פוגע בחברים...',
      goodText:  '🌟 לחכות בתור — כולם שווים!',
    },
    {
      question: 'רועי ונועם בונים מגדל אבל יש מעט לבנים. מה יעשה רועי?',
      situation: 'images/sharing/15_scene5_blocks_basic.webp',
      badImg:    'images/sharing/16_scene5_blocks_bad_choice.webp',
      goodImg:   'images/sharing/17_scene5_blocks_good_choice.webp',
      wrongBtn:  '😤 לקחת את כל הלבנים',
      rightBtn:  '🏗️ לבנות יחד',
      badText:   '😢 לקחת הכל — אי אפשר לבנות יחד...',
      goodText:  '🌟 לבנות ביחד — המגדל יוצא גבוה יותר!',
    },
  ];

  const sceneCounts = { 1: 2, 2: 3, 3: 5 };
  const count = sceneCounts[currentDifficulty] || 5;
  const scenes = SCENES.slice(0, count);
  totalSteps = scenes.length;

  W('active-game-title').textContent = 'לחלוק ולהצליח 🤝';
  buildProgressDots(totalSteps);

  function showScene(idx) {
    if (idx >= scenes.length) return;
    const scene = scenes[idx];
    const ws = W('game-workspace');
    ws.innerHTML = `
      <div class="sharing-scene">
        <img id="sharing-img" class="sharing-img" src="${scene.situation}" alt="">
        <p class="sharing-question">${scene.question}</p>
        <div id="sharing-feedback-text" class="sharing-feedback hidden"></div>
        <div class="sharing-choices" id="sharing-choices">
          <button class="sharing-choice-btn btn-wrong" id="sharing-btn-wrong">
            <img src="${scene.badImg}" class="sharing-choice-thumb" alt="">
            <span class="sharing-choice-text">${scene.wrongBtn}</span>
          </button>
          <button class="sharing-choice-btn btn-right" id="sharing-btn-right">
            <img src="${scene.goodImg}" class="sharing-choice-thumb" alt="">
            <span class="sharing-choice-text">${scene.rightBtn}</span>
          </button>
        </div>
      </div>`;

    function onChoice(isCorrect) {
      if (isProcessing) return;
      const img = W('sharing-img');
      const fb  = W('sharing-feedback-text');
      const choicesDiv = W('sharing-choices');
      choicesDiv.querySelectorAll('button').forEach(b => b.disabled = true);

      if (isCorrect) {
        img.src = scene.goodImg;
        fb.textContent = scene.goodText;
        fb.className = 'sharing-feedback sharing-good';
        handleAnswer(true, null, () => showScene(currentStep), null);
      } else {
        img.src = scene.badImg;
        fb.textContent = scene.badText;
        fb.className = 'sharing-feedback sharing-bad';
        handleAnswer(false, null, null, () => {
          img.src = scene.situation;
          fb.className = 'sharing-feedback hidden';
          choicesDiv.querySelectorAll('button').forEach(b => b.disabled = false);
        });
      }
    }

    W('sharing-btn-wrong').onclick = () => onChoice(false);
    W('sharing-btn-right').onclick = () => onChoice(true);
  }

  showScene(0);
}
