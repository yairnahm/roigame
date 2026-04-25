// ==========================================
// supabase-api.js — כל קריאות Supabase
// ==========================================
let _db = null;
function getDB() {
  if (!_db) _db = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _db;
}

// ── הגדרות ──
async function getAllSettings() {
  try {
    const { data } = await getDB().from('app_settings').select('*');
    const result = {};
    (data || []).forEach(r => { try { result[r.key] = JSON.parse(r.value); } catch { result[r.key] = r.value; } });
    return result;
  } catch(e) { return {}; }
}
async function saveSetting(key, value) {
  try {
    await getDB().from('app_settings').upsert({ key, value: JSON.stringify(value), updated_at: new Date().toISOString() }, { onConflict: 'key' });
  } catch(e) {}
}

// ── התקדמות ──
async function saveProgress(playerKey, game, level, starsFull, starsHalf) {
  try {
    await getDB().from('progress').upsert({
      player_key: playerKey, game, level,
      stars_full: starsFull, stars_half: starsHalf,
      updated_at: new Date().toISOString()
    }, { onConflict: 'player_key,game,level' });
  } catch(e) {}
}
async function loadProgress(playerKey) {
  try {
    const { data } = await getDB().from('progress').select('*').eq('player_key', playerKey);
    return data || [];
  } catch(e) { return []; }
}
async function resetProgress(playerKey) {
  try {
    await getDB().from('progress').delete().eq('player_key', playerKey);
  } catch(e) {}
}
async function getAllProgress() {
  try {
    const { data } = await getDB().from('progress').select('*').order('updated_at', { ascending: false });
    return data || [];
  } catch(e) { return []; }
}

// ── תוכן משחקים ──
async function getGameContent(gameId) {
  try {
    const { data } = await getDB().from('game_content').select('content').eq('game_id', gameId).single();
    return data ? data.content : null;
  } catch(e) { return null; }
}
async function saveGameContent(gameId, content) {
  try {
    await getDB().from('game_content').upsert({
      game_id: gameId, content,
      updated_at: new Date().toISOString()
    }, { onConflict: 'game_id' });
  } catch(e) {}
}
