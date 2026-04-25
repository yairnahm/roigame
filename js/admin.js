// ==========================================
// admin.js — פאנל ניהול מלא
// ==========================================
const _db_admin = () => window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let adminPin = '1234';
let enteredPin = '';
let currentTab = 'players';
let allProgress = [];

// ── PIN ──────────────────────────────────────
function addPinDigit(d) {
  if (enteredPin.length >= 4) return;
  enteredPin += d;
  renderPinDots();
  if (enteredPin.length === 4) setTimeout(checkPin, 200);
}
function clearPin() { enteredPin = ''; renderPinDots(); }
function renderPinDots() {
  document.querySelectorAll('.admin-pin-dot').forEach((dot, i) => {
    dot.classList.toggle('filled', i < enteredPin.length);
  });
}
async function checkPin() {
  const stored = await getAdminPin();
  if (enteredPin === stored) {
    document.getElementById('pin-overlay').style.display = 'none';
    initAdminPanel();
  } else {
    enteredPin = ''; renderPinDots();
    const box = document.querySelector('.admin-pin-box');
    box.style.animation = 'none'; box.offsetHeight;
    box.style.animation = 'pinShake 0.4s ease';
    document.getElementById('pin-error').textContent = 'PIN שגוי, נסה שוב';
    setTimeout(() => document.getElementById('pin-error').textContent = '', 2000);
  }
}
async function getAdminPin() {
  try {
    const { data } = await _db_admin().from('app_settings').select('value').eq('key','admin_pin').single();
    return data ? JSON.parse(data.value) : '1234';
  } catch { return '1234'; }
}

// ── טאבים ────────────────────────────────────
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + tab));
  if (tab === 'progress') loadProgressTab();
}

// ── אתחול ────────────────────────────────────
async function initAdminPanel() {
  showToast('טוען הגדרות...');
  await loadPlayersTab();
  await loadMessagesTab();
  loadGamesTab();
  switchTab('players');
}

// ── שחקנים ───────────────────────────────────
async function loadPlayersTab() {
  try {
    const { data } = await _db_admin().from('app_settings').select('*').in('key', ['boy_name','girl_name','audio_enabled','app_title']);
    const s = {};
    (data || []).forEach(r => { try { s[r.key] = JSON.parse(r.value); } catch { s[r.key] = r.value; } });
    document.getElementById('input-boy-name').value   = s.boy_name   || 'רועי';
    document.getElementById('input-girl-name').value  = s.girl_name  || 'מיה';
    document.getElementById('input-app-title').value  = s.app_title  || 'מרכז המשחקים';
    document.getElementById('input-audio').checked    = s.audio_enabled !== false;
  } catch(e) {}
}
async function savePlayers() {
  const boyName   = document.getElementById('input-boy-name').value.trim()  || 'רועי';
  const girlName  = document.getElementById('input-girl-name').value.trim() || 'מיה';
  const appTitle  = document.getElementById('input-app-title').value.trim() || 'מרכז המשחקים';
  const audioOn   = document.getElementById('input-audio').checked;
  const db = _db_admin();
  await Promise.all([
    db.from('app_settings').upsert({key:'boy_name',   value:JSON.stringify(boyName),  updated_at:new Date().toISOString()}, {onConflict:'key'}),
    db.from('app_settings').upsert({key:'girl_name',  value:JSON.stringify(girlName), updated_at:new Date().toISOString()}, {onConflict:'key'}),
    db.from('app_settings').upsert({key:'app_title',  value:JSON.stringify(appTitle), updated_at:new Date().toISOString()}, {onConflict:'key'}),
    db.from('app_settings').upsert({key:'audio_enabled', value:JSON.stringify(audioOn), updated_at:new Date().toISOString()}, {onConflict:'key'}),
  ]);
  showToast('✅ נשמר בהצלחה!');
}

// ── PIN שינוי ─────────────────────────────────
async function savePin() {
  const current = document.getElementById('input-pin-current').value;
  const newPin  = document.getElementById('input-pin-new').value;
  const confirm = document.getElementById('input-pin-confirm').value;
  const stored  = await getAdminPin();
  if (current !== stored)    { showToast('❌ PIN נוכחי שגוי'); return; }
  if (newPin.length < 4)     { showToast('❌ PIN חייב להיות 4 ספרות'); return; }
  if (newPin !== confirm)    { showToast('❌ ה-PIN החדש אינו תואם'); return; }
  await _db_admin().from('app_settings').upsert({key:'admin_pin', value:JSON.stringify(newPin), updated_at:new Date().toISOString()}, {onConflict:'key'});
  document.getElementById('input-pin-current').value = '';
  document.getElementById('input-pin-new').value     = '';
  document.getElementById('input-pin-confirm').value = '';
  showToast('✅ PIN עודכן!');
}

// ── הודעות הצלחה ─────────────────────────────
async function loadMessagesTab() {
  try {
    const { data } = await _db_admin().from('app_settings').select('value').eq('key','success_messages').single();
    if (data) {
      const msgs = JSON.parse(data.value);
      document.getElementById('msg-boy-reg').value    = (msgs.boy?.reg    || []).join('\n');
      document.getElementById('msg-boy-kapara').value = (msgs.boy?.kapara || []).join('\n');
      document.getElementById('msg-boy-life').value   = (msgs.boy?.life   || []).join('\n');
      document.getElementById('msg-girl-reg').value   = (msgs.girl?.reg    || []).join('\n');
      document.getElementById('msg-girl-kapara').value= (msgs.girl?.kapara || []).join('\n');
      document.getElementById('msg-girl-life').value  = (msgs.girl?.life   || []).join('\n');
    }
  } catch(e) {}
}
async function saveMessages() {
  const msgs = {
    boy: {
      reg:    document.getElementById('msg-boy-reg').value.split('\n').map(s=>s.trim()).filter(Boolean),
      kapara: document.getElementById('msg-boy-kapara').value.split('\n').map(s=>s.trim()).filter(Boolean),
      life:   document.getElementById('msg-boy-life').value.split('\n').map(s=>s.trim()).filter(Boolean),
    },
    girl: {
      reg:    document.getElementById('msg-girl-reg').value.split('\n').map(s=>s.trim()).filter(Boolean),
      kapara: document.getElementById('msg-girl-kapara').value.split('\n').map(s=>s.trim()).filter(Boolean),
      life:   document.getElementById('msg-girl-life').value.split('\n').map(s=>s.trim()).filter(Boolean),
    }
  };
  await _db_admin().from('app_settings').upsert({key:'success_messages', value:JSON.stringify(JSON.stringify(msgs)), updated_at:new Date().toISOString()}, {onConflict:'key'});
  showToast('✅ הודעות נשמרו!');
}

// ── תוכן משחקים ──────────────────────────────
const GAME_LABELS = {
  memory:'🧠 זיכרון', tracing:'✏️ ציור', counting:'🔢 ספירה', sequence:'🔄 סדר נכון',
  fly:'🪰 זבוב בפה', cop:'🚓 שוטר וגנב', diff:'🔎 השונה', oddone:'🍎 יוצא דופן',
  missing:'🔤 אות חסרה', tools:'🔨 כלים', context:'🧩 הקשרים', vparts:'🚜 חלקי רכבים',
  bigger:'⚖️ יותר גדול', emotion:'🎭 רגשות', habitat:'🏠 מי גר כאן',
  shadow:'👤 צלליות', halfhalf:'✂️ השלם חצי', chrono:'⏳ רצף כרונולוגי',
};
function loadGamesTab() {
  const list = document.getElementById('games-list');
  list.innerHTML = '';
  Object.entries(GAME_LABELS).forEach(([id, label]) => {
    const btn = document.createElement('button');
    btn.className = 'admin-game-btn';
    btn.innerHTML = `<span class="game-icon">${label.split(' ')[0]}</span>${label.split(' ').slice(1).join(' ')}`;
    btn.onclick = () => openGameEditor(id, label);
    list.appendChild(btn);
  });
}
async function openGameEditor(gameId, label) {
  document.getElementById('game-editor-title').textContent = 'עריכת: ' + label;
  document.getElementById('game-editor-area').style.display = 'block';
  document.getElementById('current-game-id').value = gameId;
  const textarea = document.getElementById('game-content-editor');
  textarea.value = 'טוען...';
  try {
    const { data } = await _db_admin().from('game_content').select('content').eq('game_id', gameId).single();
    textarea.value = JSON.stringify(data ? data.content : DEFAULT_GAME_DATA[gameId], null, 2);
  } catch {
    textarea.value = JSON.stringify(DEFAULT_GAME_DATA[gameId], null, 2);
  }
  textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
async function saveGameContent_admin() {
  const gameId = document.getElementById('current-game-id').value;
  const raw = document.getElementById('game-content-editor').value;
  try {
    const content = JSON.parse(raw);
    await _db_admin().from('game_content').upsert({game_id:gameId, content, updated_at:new Date().toISOString()}, {onConflict:'game_id'});
    showToast('✅ תוכן ' + GAME_LABELS[gameId] + ' נשמר!');
  } catch(e) {
    showToast('❌ שגיאה ב-JSON — בדוק את הפורמט');
  }
}
async function resetGameContent_admin() {
  const gameId = document.getElementById('current-game-id').value;
  if (!confirm('לאפס את תוכן המשחק לברירת המחדל?')) return;
  try {
    await _db_admin().from('game_content').delete().eq('game_id', gameId);
    document.getElementById('game-content-editor').value = JSON.stringify(DEFAULT_GAME_DATA[gameId], null, 2);
    showToast('✅ אופס לברירת מחדל!');
  } catch(e) { showToast('❌ שגיאה'); }
}

// ── התקדמות ───────────────────────────────────
async function loadProgressTab() {
  const container = document.getElementById('progress-content');
  container.innerHTML = '<p style="color:#666;">טוען...</p>';
  try {
    const { data } = await _db_admin().from('progress').select('*').order('updated_at', {ascending:false});
    allProgress = data || [];
    if (!allProgress.length) { container.innerHTML = '<p style="color:#888;">אין התקדמות שמורה עדיין</p>'; return; }

    // סטטיסטיקות כלליות
    const players = [...new Set(allProgress.map(r => r.player_key))];
    const totalStars = allProgress.reduce((s, r) => s + (r.stars_full || 0) + Math.floor((r.stars_half || 0) / 2), 0);
    container.innerHTML = `
      <div class="admin-stat-grid" style="margin-bottom:20px;">
        <div class="admin-stat-card"><div class="num">${players.length}</div><div class="lbl">שחקנים</div></div>
        <div class="admin-stat-card"><div class="num">${allProgress.length}</div><div class="lbl">רמות הושלמו</div></div>
        <div class="admin-stat-card"><div class="num">${totalStars}</div><div class="lbl">כוכבים סה"כ</div></div>
      </div>
      ${players.map(pk => renderPlayerProgress(pk)).join('')}
      <button class="admin-btn danger" onclick="resetAllProgress()" style="margin-top:20px;width:100%;">🗑️ מחק את כל ההתקדמות</button>`;
  } catch(e) { container.innerHTML = '<p style="color:red;">שגיאה בטעינה</p>'; }
}
function renderPlayerProgress(playerKey) {
  const rows = allProgress.filter(r => r.player_key === playerKey);
  const stars = rows.reduce((s,r) => s + (r.stars_full||0) + Math.floor((r.stars_half||0)/2), 0);
  return `
    <div class="admin-card" style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
        <strong style="font-size:1.1em;">👤 ${playerKey}</strong>
        <span style="color:#f5a623;font-weight:bold;">${stars} ⭐</span>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${rows.map(r => `<span style="background:#f0f4ff;border:1px solid #c5cae9;border-radius:8px;padding:4px 8px;font-size:0.85em;">${GAME_LABELS[r.game]||r.game} רמה ${r.level} — ${(r.stars_full||0)+(r.stars_half||0)*0.5}⭐</span>`).join('')}
      </div>
      <button class="admin-btn danger" onclick="resetPlayerProgress('${playerKey}')" style="margin-top:10px;">מחק התקדמות של ${playerKey}</button>
    </div>`;
}
async function resetPlayerProgress(playerKey) {
  if (!confirm('למחוק את כל ההתקדמות של ' + playerKey + '?')) return;
  await _db_admin().from('progress').delete().eq('player_key', playerKey);
  showToast('✅ נמחק');
  loadProgressTab();
}
async function resetAllProgress() {
  if (!confirm('למחוק את כל ההתקדמות של כל השחקנים? לא ניתן לשחזר!')) return;
  await _db_admin().from('progress').delete().neq('id','00000000-0000-0000-0000-000000000000');
  showToast('✅ כל ההתקדמות נמחקה');
  loadProgressTab();
}

// ── כלי עזר ──────────────────────────────────
function showToast(msg) {
  let t = document.getElementById('admin-toast');
  if (!t) { t = document.createElement('div'); t.id = 'admin-toast'; t.className = 'admin-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.style.display = 'block';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => { t.style.display = 'none'; }, 3000);
}

// ── DEFAULT_GAME_DATA (עותק לצרכי reset) ──────
// נטען מ-data.js אחרי שהדף נטען
let DEFAULT_GAME_DATA = {};
window.addEventListener('load', async () => {
  // טעינת ברירות מחדל
  DEFAULT_GAME_DATA = window.DEFAULT_DATA || {};
});
