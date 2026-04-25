// ==========================================
// config.js — פרטי Supabase והגדרות גלובליות
// ==========================================
const SUPABASE_URL = 'https://qfspvmbggzjfmprommsx.supabase.co';
const SUPABASE_KEY = 'sb_publishable_7O58H_ojb8c9OQ8qeEtbqA_kmDRq8Kn';

const DEFAULTS = {
  boyName:   'רועי',
  girlName:  'מיה',
  adminPin:  '1234',
  audioEnabled: true,
  appTitle:  'מרכז המשחקים',
};

// אייקוני רקע לכל משחק
const BG_ICONS = {
  memory:   ['🧠','💭','💡'], tracing:  ['✏️','🎨','📐'],
  counting: ['🔢','🧮','➕'], sequence: ['🔄','✨','🎯'],
  fly:      ['🪰','💨'],       cop:      ['🚓','🚨'],
  diff:     ['🔎','👀'],       oddone:   ['🍎','🐶','🚗'],
  missing:  ['A','B','C'],    tools:    ['🔨','🔧','🔩'],
  context:  ['🧩','🖼️','🎨'],  vparts:   ['🚗','✈️','🚂'],
  bigger:   ['⚖️','🐘','🐭'],  emotion:  ['😄','😢','😡','😱'],
  habitat:  ['🏠','🌳','🌊'],  shadow:   ['👤','🌑','👀'],
  halfhalf: ['✂️','🎨','🧩'],  chrono:   ['⏳','📅','🔄'],
};

// משחקים שנותנים כוכב מלא / חצי כוכב
const FULL_STAR_GAMES = ['sequence','memory','missing','diff','chrono'];
const HALF_STAR_GAMES = ['context','oddone','halfhalf','counting'];
