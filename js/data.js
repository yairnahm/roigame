// ==========================================
// data.js — נתוני ברירת מחדל לכל 18 המשחקים
// ==========================================

const DEFAULT_DATA = {

  // 1. זיכרון — קטגוריות אמוג'י
  memory: {
    categories: {
      animals:  ['🐶','🐱','🐭','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵'],
      food:     ['🍎','🍊','🍋','🍇','🍓','🍔','🍕','🌮','🍩','🍪','🎂','🍦'],
      vehicles: ['🚗','✈️','🚂','🚢','🚁','🛵','🚲','🚜','🚒','🏎️'],
      sports:   ['⚽','🏀','🎾','⚾','🏐','🏈','🎱','🎿','🏊','🚴'],
      nature:   ['🌻','🌹','🌸','🌴','🌵','🍄','🌊','⛰️','🌈','⭐'],
    }
  },

  // 2. ציור — צורות לשרטוט
  tracing: {
    shapes: [
      { name:'עיגול',     points:[[150,150],[200,100],[250,150],[200,200]], type:'circle' },
      { name:'משולש',    points:[[150,200],[200,100],[250,200]],           type:'triangle' },
      { name:'ריבוע',    points:[[100,100],[200,100],[200,200],[100,200]], type:'square' },
      { name:'כוכב',     points:[[150,80],[170,140],[230,140],[180,175],[200,235],[150,200],[100,235],[120,175],[70,140],[130,140]], type:'star' },
    ]
  },

  // 3. ספירה — רמות
  counting: {
    levels: { 1: {min:1,max:5}, 2: {min:3,max:10}, 3: {min:5,max:15}, 4: {min:8,max:20}, 5: {min:10,max:30} },
    icons: ['⭐','🍎','🐾','🏀','🦋','🌸','🎈','🐟','🍕','🌟']
  },

  // 4. סדר נכון — רצפים לסידור
  sequence: [
    ['🐣','🐤','🐔'],
    ['🌱','🌿','🌳'],
    ['☀️','🌤','⛅'],
    ['🥚','🍳','🍽️'],
    ['👶','🧒','👦'],
    ['🌊','🚿','💧'],
    ['🌑','🌓','🌕'],
    ['🐛','🦋','🌸'],
  ],

  // 5. זבוב בפה — מסלולים
  fly: {
    levels: {
      1: { char:'🪰', target:'👄', obstacles:[], pathComplexity:'simple' },
      2: { char:'🪰', target:'👄', obstacles:['🧱'], pathComplexity:'medium' },
      3: { char:'🪰', target:'👄', obstacles:['🧱','🌵'], pathComplexity:'complex' },
    }
  },

  // 6. שוטר וגנב — מסלולים
  cop: {
    levels: {
      1: { cop:'🚓', thief:'🥷', pathComplexity:'simple' },
      2: { cop:'🚓', thief:'🥷', pathComplexity:'medium' },
      3: { cop:'🚓', thief:'🥷', pathComplexity:'complex' },
    }
  },

  // 7. מצא את השונה — צורות SVG
  diff: {
    levels: {
      1: { shapes:['circle','square','triangle'], colors:['#e74c3c','#3498db'] },
      2: { shapes:['circle','square','triangle','star'], colors:['#e74c3c','#3498db','#2ecc71'] },
      3: { shapes:['circle','square','triangle','star','diamond'], colors:['#e74c3c','#3498db','#2ecc71','#f39c12'] },
    }
  },

  // 8. יוצא דופן — קטגוריות
  oddone: {
    sets: [
      { items:['🐶','🐱','🐰','🚗'],  odd:3 },
      { items:['🍎','🍊','🍋','🐟'],  odd:3 },
      { items:['🚗','✈️','🚂','🍕'],  odd:3 },
      { items:['📕','📗','📘','🍔'],  odd:3 },
      { items:['⚽','🏀','🎾','🍩'],  odd:3 },
      { items:['🌹','🌸','🌻','🐮'], odd:3 },
      { items:['🔴','🟢','🟡','🐶'], odd:3 },
      { items:['🚌','🚕','🚑','⛵'],  odd:3 },
      { items:['🍕','🍔','🌮','🚀'], odd:3 },
      { items:['🐸','🦊','🐨','✈️'],  odd:3 },
    ]
  },

  // 9. אות חסרה — מילים עברית ואנגלית
  missing: {
    he: [
      {word:'כלב', missing:1}, {word:'חתול', missing:2}, {word:'בית', missing:0},
      {word:'ילד', missing:1}, {word:'ספר', missing:0}, {word:'מים', missing:2},
      {word:'שמש', missing:1}, {word:'ירח', missing:0}, {word:'כוכב', missing:2},
      {word:'אריה', missing:2}, {word:'דגה', missing:0}, {word:'פרח', missing:1},
    ],
    en: [
      {word:'CAT', missing:0}, {word:'DOG', missing:1}, {word:'SUN', missing:2},
      {word:'BALL', missing:1}, {word:'FISH', missing:2}, {word:'BIRD', missing:0},
      {word:'TREE', missing:1}, {word:'STAR', missing:2}, {word:'CAKE', missing:0},
      {word:'FROG', missing:2}, {word:'LION', missing:0}, {word:'DUCK', missing:1},
    ]
  },

  // 10. כלים — זוגות כלי-חפץ
  tools: {
    pairs: [
      {obj:'📍',tool:'🔨',wrong:['🪚','🪛','🗝️','🖌️','✂️']},
      {obj:'🪵',tool:'🪚',wrong:['🔨','🔧','🗝️','🖌️','✂️']},
      {obj:'🔩',tool:'🪛',wrong:['✂️','🖌️','⛏️','🔑','🪚']},
      {obj:'⚙️',tool:'🔧',wrong:['✂️','🖌️','⛏️','🪚','🔨']},
      {obj:'📄',tool:'✂️',wrong:['🔨','🔧','⛏️','🪛','🪚']},
      {obj:'🎨',tool:'🖌️',wrong:['🔨','🔧','🗝️','🪚','⛏️']},
      {obj:'🌱',tool:'⛏️',wrong:['✂️','🖌️','🔑','🪛','🔨']},
      {obj:'🔒',tool:'🗝️',wrong:['🪚','🪛','✂️','🖌️','⛏️']},
    ]
  },

  // 11. הקשרים — סצנות
  context: {
    scenes: [
      {bg:'☁️☀️✈️',bgC:'linear-gradient(to bottom,#87CEEB,#E0F7FA)',t:{top:'30%',left:'50%'},correct:'🦅',wrong:['🐟','🐘','🚗']},
      {bg:'🌊🐠🐡',bgC:'linear-gradient(to bottom,#0288D1,#B3E5FC)',t:{top:'60%',left:'40%'},correct:'🦈',wrong:['🐘','🚗','🦅']},
      {bg:'🌳🌿',  bgC:'linear-gradient(to bottom,#81C784,#DCEDC8)',t:{top:'40%',left:'60%'},correct:'🍎',wrong:['🐟','🐘','🚗']},
      {bg:'🛣️🚦',  bgC:'linear-gradient(to bottom,#B0BEC5,#ECEFF1)',t:{top:'50%',left:'50%'},correct:'🚗',wrong:['🖥️','⛵','🌳']},
      {bg:'🌌🌙',  bgC:'linear-gradient(to bottom,#311B92,#1A237E)',t:{top:'30%',left:'70%'},correct:'🚀',wrong:['🐟','🚲','🌳']},
      {bg:'🛏️💤',  bgC:'linear-gradient(to bottom,#D1C4E9,#F3E5F5)',t:{top:'50%',left:'50%'},correct:'🧸',wrong:['🚗','🌳','🦅']},
      {bg:'🍽️🥛',  bgC:'linear-gradient(to bottom,#FFCC80,#F1F8E9)',t:{top:'50%',left:'50%'},correct:'🍕',wrong:['👞','🔨','🚗']},
      {bg:'🚜🌾',  bgC:'linear-gradient(to bottom,#FFD54F,#FFF8E1)',t:{top:'60%',left:'30%'},correct:'🐄',wrong:['✈️','🦈','🪑']},
      {bg:'🛁🚽',  bgC:'linear-gradient(to bottom,#B2EBF2,#E1F5FE)',t:{top:'60%',left:'40%'},correct:'🪥',wrong:['🚗','🍎','🐶']},
      {bg:'🗄️✏️',  bgC:'linear-gradient(to bottom,#FFAB91,#EFEBE9)',t:{top:'50%',left:'50%'},correct:'📏',wrong:['🚗','🐘','🍕']},
    ]
  },

  // 12. חלקי רכבים — תמונות Unsplash
  vparts: {
    images: [
      {img:'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=800&q=80',cx:20,cy:75,cw:25,ch:25},
      {img:'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?w=800&q=80',cx:80,cy:60,cw:20,ch:20},
      {img:'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=800&q=80',cx:25,cy:50,cw:20,ch:20},
      {img:'https://images.unsplash.com/photo-1471506480208-91b3a4cc78be?w=800&q=80',cx:80,cy:70,cw:20,ch:20},
      {img:'https://images.unsplash.com/photo-1569263979104-865ab7cd8d13?w=800&q=80',cx:50,cy:80,cw:20,ch:20},
      {img:'https://images.unsplash.com/photo-1559293424-65ab3cbfa502?w=800&q=80',cx:50,cy:50,cw:20,ch:20},
    ]
  },

  // 13. יותר גדול — מקס לכל רמה
  bigger: {
    levels: { 1:{max:4}, 2:{max:6}, 3:{max:14}, 4:{max:20}, 5:{max:35} }
  },

  // 14. רגשות — תמונות + תוויות
  emotion: {
    labels: [
      {id:'happy',t:'שמח',  e:'😄'},
      {id:'sad',  t:'עצוב', e:'😢'},
      {id:'angry',t:'כועס', e:'😡'},
      {id:'scared',t:'מפחד',e:'😱'},
    ],
    images: [
      {q:'child big smile jumping happy photography',ans:'happy'},
      {q:'child eating ice cream smiling happy photography',ans:'happy'},
      {q:'children playing laughing park happy photography',ans:'happy'},
      {q:'child opening present happy birthday photography',ans:'happy'},
      {q:'child crying sad tears face photography',ans:'sad'},
      {q:'dropped ice cream cone sad child photography',ans:'sad'},
      {q:'child looking out window raining lonely sad photography',ans:'sad'},
      {q:'child crossing arms frowning angry mad photography',ans:'angry'},
      {q:'two children fighting over toy angry photography',ans:'angry'},
      {q:'child screaming shouting angry furious photography',ans:'angry'},
      {q:'child hiding under blanket scared afraid photography',ans:'scared'},
      {q:'child covering face hands scared fear photography',ans:'scared'},
    ]
  },

  // 15. מי גר כאן — זוגות חיה-בית
  habitat: {
    pairs: [
      {animal:'🐝',home:'🍯'}, {animal:'🐶',home:'🏠'}, {animal:'🐦',home:'🪹'},
      {animal:'🐠',home:'🌊'}, {animal:'🕷️',home:'🕸️'}, {animal:'🐴',home:'🛖'},
      {animal:'👑',home:'🏰'}, {animal:'🐸',home:'🪷'}, {animal:'🐒',home:'🌴'},
      {animal:'🐻',home:'🌲'},
    ]
  },

  // 16. צלליות — כל האמוג'י מהקטגוריות
  shadow: {
    icons: ['🐶','🐱','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐸','🐵',
            '🍎','🍊','🍋','🍇','🍓','🚗','✈️','🚂','🚁','🎾','⚽','🏀',
            '🌻','🌹','🌸','🌴','⭐','🍕','🎂','🍩','🍪']
  },

  // 17. השלם חצי — אמוג'י
  halfhalf: {
    icons: ['🍎','⚽','🦋','🚗','🌻','🐞','🕷️','🧸','🍉','🍩','🐶','🐱','🌸','🏀']
  },

  // 18. רצף כרונולוגי
  chrono: {
    sequences: [
      ['🌱','🌿','🌳'],
      ['🥚','🐣','🐔'],
      ['🐛','🪹','🦋'],
      ['👶','👦','👨'],
      ['🌅','☀️','🌇'],
      ['☁️','🌧️','🌈'],
      ['🌑','🌓','🌕'],
      ['🍼','🧒','👴'],
    ]
  },
};

// משתנה גלובלי לנתונים (מתעדכן מ-Supabase אם קיים)
let GAME_DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));

async function loadGameDataFromSupabase() {
  const gameIds = Object.keys(DEFAULT_DATA);
  for (const id of gameIds) {
    const remote = await getGameContent(id);
    if (remote) GAME_DATA[id] = remote;
  }
}

function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
