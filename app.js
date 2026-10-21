// ===== Firebase Init =====
let auth, db;
let secondaryApp = null; // 管理者ログインを維持したまま新規アカウントを作るための副インスタンス
try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db   = firebase.firestore();
  db.enablePersistence().catch(() => {}); // オフライン対応
} catch (e) {
  console.error('Firebase init error:', e);
}

function getSecondaryApp() {
  if (secondaryApp) return secondaryApp;
  secondaryApp = firebase.initializeApp(firebaseConfig, 'secondary');
  return secondaryApp;
}

// ===== BOOKS定数（複数単語帳管理） =====
const BOOKS = [
  {
    id: 'ex',
    name: '単語EX',
    label: '英検準1級 単語EX',
    icon: '📘',
    words: () => (typeof WORDS_EX !== 'undefined' ? WORDS_EX : []),
    extras: () => (typeof WORD_EXTRAS_EX !== 'undefined' ? WORD_EXTRAS_EX : {}),
    phonetics: () => (typeof PHONETICS_EX !== 'undefined' ? PHONETICS_EX : {}),
    sections: [
      { id: '0001-0300', label: 'テスト 1', range: 'No.0001〜0300' },
      { id: '0301-0600', label: 'テスト 2', range: 'No.0301〜0600' },
      { id: '0601-0800', label: 'テスト 3', range: 'No.0601〜0800' },
      { id: '0801-1100', label: 'テスト 4', range: 'No.0801〜1100' },
      { id: '1101-1300', label: 'テスト 5', range: 'No.1101〜1300' },
      { id: '1301-1600', label: 'テスト 6', range: 'No.1301〜1600' },
      { id: '1601-1900', label: 'テスト 7', range: 'No.1601〜1900' },
      { id: '1901-2016', label: '追加範囲', range: 'No.1901〜2016' },
    ],
    firestoreKey: 'records_ex',
  },
  {
    id: 'pastan',
    name: '準1級パス単（5訂版）',
    label: '英検準1級 でる順パス単（5訂版）',
    icon: '📗',
    words: () => (typeof WORDS_PASTAN !== 'undefined' ? WORDS_PASTAN : []),
    extras: () => (typeof WORD_EXTRAS_PASTAN !== 'undefined' ? WORD_EXTRAS_PASTAN : {}),
    phonetics: () => (typeof PHONETICS_PASTAN !== 'undefined' ? PHONETICS_PASTAN : {}),
    sections: [
      { id: '0001-0100', label: 'パス単 1',          range: 'No.0001〜0100' },
      { id: '0101-0200', label: 'パス単 2',          range: 'No.0101〜0200' },
      { id: '0201-0300', label: 'パス単 3',          range: 'No.0201〜0300' },
      { id: '0301-0400', label: 'パス単 4',          range: 'No.0301〜0400' },
      { id: '0401-0500', label: 'パス単 5',          range: 'No.0401〜0500' },
      { id: '0501-0600', label: 'パス単 6',          range: 'No.0501〜0600' },
      { id: '0601-0700', label: 'パス単 7',          range: 'No.0601〜0700' },
      { id: '0701-0800', label: 'パス単 8',          range: 'No.0701〜0800' },
      { id: '0801-0900', label: 'パス単 9',          range: 'No.0801〜0900' },
      { id: '0901-1000', label: 'パス単 10',         range: 'No.0901〜1000' },
      { id: '1001-1100', label: 'パス単 11',         range: 'No.1001〜1100' },
      { id: '1101-1200', label: 'パス単 12',         range: 'No.1101〜1200' },
      { id: '1201-1300', label: 'パス単 13',         range: 'No.1201〜1300' },
      { id: '1301-1400', label: 'パス単 14',         range: 'No.1301〜1400' },
      { id: '1401-1500', label: 'パス単 15',         range: 'No.1401〜1500' },
      { id: '1501-1600', label: 'パス単 16',         range: 'No.1501〜1600' },
      { id: '1601-1700', label: 'パス単 17（句動詞）', range: 'No.1601〜1700' },
      { id: '1701-1800', label: 'パス単 18（句動詞）', range: 'No.1701〜1800' },
      { id: '1801-1900', label: 'パス単 19（句動詞）', range: 'No.1801〜1900' },
    ],
    firestoreKey: 'records_pastan',
  },
  {
    id: 'pastan6',
    name: '準1級パス単（6訂版）',
    label: '英検準1級 でる順パス単（6訂版）',
    icon: '📕',
    words: () => (typeof WORDS_PASTAN6 !== 'undefined' ? WORDS_PASTAN6 : []),
    extras: () => (typeof WORD_EXTRAS_PASTAN6 !== 'undefined' ? WORD_EXTRAS_PASTAN6 : {}),
    phonetics: () => (typeof PHONETICS_PASTAN6 !== 'undefined' ? PHONETICS_PASTAN6 : {}),
    sections: [
      { id: '0001-0100', label: 'パス単 1',           range: 'No.0001〜0100' },
      { id: '0101-0200', label: 'パス単 2',           range: 'No.0101〜0200' },
      { id: '0201-0300', label: 'パス単 3',           range: 'No.0201〜0300' },
      { id: '0301-0400', label: 'パス単 4',           range: 'No.0301〜0400' },
      { id: '0401-0500', label: 'パス単 5',           range: 'No.0401〜0500' },
      { id: '0501-0600', label: 'パス単 6',           range: 'No.0501〜0600' },
      { id: '0601-0700', label: 'パス単 7',           range: 'No.0601〜0700' },
      { id: '0701-0800', label: 'パス単 8',           range: 'No.0701〜0800' },
      { id: '0801-0900', label: 'パス単 9',           range: 'No.0801〜0900' },
      { id: '0901-1000', label: 'パス単 10',          range: 'No.0901〜1000' },
      { id: '1001-1100', label: 'パス単 11',          range: 'No.1001〜1100' },
      { id: '1101-1200', label: 'パス単 12',          range: 'No.1101〜1200' },
      { id: '1201-1300', label: 'パス単 13',          range: 'No.1201〜1300' },
      { id: '1301-1400', label: 'パス単 14',          range: 'No.1301〜1400' },
      { id: '1401-1500', label: 'パス単 15',          range: 'No.1401〜1500' },
      { id: '1501-1600', label: 'パス単 16',          range: 'No.1501〜1600' },
      { id: '1601-1700', label: 'パス単 17（熟語）',  range: 'No.1601〜1700' },
      { id: '1701-1800', label: 'パス単 18（熟語）',  range: 'No.1701〜1800' },
      { id: '1801-1900', label: 'パス単 19（熟語）',  range: 'No.1801〜1900' },
    ],
    firestoreKey: 'records_pastan6',
  },
  {
    id: 'pastan2',
    name: '2級パス単',
    label: '英検2級 でる順パス単',
    icon: '📙',
    words: () => (typeof WORDS_PASTAN2 !== 'undefined' ? WORDS_PASTAN2 : []),
    extras: () => (typeof WORD_EXTRAS_PASTAN2 !== 'undefined' ? WORD_EXTRAS_PASTAN2 : {}),
    phonetics: () => (typeof PHONETICS_PASTAN2 !== 'undefined' ? PHONETICS_PASTAN2 : {}),
    sections: [
      { id: '0001-0100', label: '2級パス単 1',           range: 'No.0001〜0100' },
      { id: '0101-0200', label: '2級パス単 2',           range: 'No.0101〜0200' },
      { id: '0201-0300', label: '2級パス単 3',           range: 'No.0201〜0300' },
      { id: '0301-0400', label: '2級パス単 4',           range: 'No.0301〜0400' },
      { id: '0401-0500', label: '2級パス単 5',           range: 'No.0401〜0500' },
      { id: '0501-0600', label: '2級パス単 6',           range: 'No.0501〜0600' },
      { id: '0601-0700', label: '2級パス単 7',           range: 'No.0601〜0700' },
      { id: '0701-0800', label: '2級パス単 8',           range: 'No.0701〜0800' },
      { id: '0801-0900', label: '2級パス単 9',           range: 'No.0801〜0900' },
      { id: '0901-1000', label: '2級パス単 10',          range: 'No.0901〜1000' },
      { id: '1001-1100', label: '2級パス単 11',          range: 'No.1001〜1100' },
      { id: '1101-1200', label: '2級パス単 12',          range: 'No.1101〜1200' },
      { id: '1201-1300', label: '2級パス単 13',          range: 'No.1201〜1300' },
      { id: '1301-1400', label: '2級パス単 14（熟語）',  range: 'No.1301〜1400' },
      { id: '1401-1500', label: '2級パス単 15（熟語）',  range: 'No.1401〜1500' },
      { id: '1501-1600', label: '2級パス単 16（熟語）',  range: 'No.1501〜1600' },
      { id: '1601-1700', label: '2級パス単 17（熟語）',  range: 'No.1601〜1700' },
    ],
    firestoreKey: 'records_pastan2',
  },
];

// ===== App State =====
let currentUser  = null;
let userRole     = 'student';
let userName     = '';
let userId       = '';
let currentBook  = null; // 現在選択中の単語帳
function emptyBookRecords() {
  const obj = {};
  BOOKS.forEach(b => { obj[b.id] = {}; });
  return obj;
}
let state        = {
  bookRecords: emptyBookRecords(), // 単語帳ごとの進捗（BOOKSに合わせて動的）
  sectionStats: emptyBookRecords(), // 単語帳ごと・セクションごとの { passCount, round }
  fcStats: emptyBookRecords(),      // 単語帳ごとのフラッシュカード { sessions, cards, lastDate }
  dailyLog: {}, streak: 0, bestStreak: 0, points: 0,
  lastStudyDate: null, tutorialDone: false, memos: {},
  archived: false,
  historyLog: [],   // テストの履歴（新しい順・最大300件）
  notices: {},      // 1回だけ出すお知らせを見たかどうか
};
let adminStudentsMap = {};
let adminTeachersMap = {};
let currentDetailUid = null;
let currentDetailType = 'student'; // 'student' | 'teacher'
let adminBookId = 'ex'; // 管理画面で現在表示中の単語帳ID
let adminStudentsAll = []; // 読み込んだ全生徒（アーカイブ含む）
let adminView = { archive: 'active', showInactive: false, sortKey: 'name', sortDir: 1, query: '' };
let pendingLoginError = ''; // アーカイブ済み生徒を弾いたときに、ログイン画面へ出す文
let adminTeacherBookId = 'ex'; // 教師一覧で現在表示中の単語帳ID

let quiz = {
  section: null, pool: [], allWords: [], mode: 'normal', orderMode: 'random',
  current: null, choices: [], sessionCorrect: 0, sessionWrong: 0, answered: false,
};

let fc = {
  pool: [], current: null, index: 0, total: 0,
  unknownNos: new Set(), section: null, mode: 'normal',
  tab: 'word', explainOpen: false,
};
let lastCompleteType = 'quiz';

// 現在の単語帳のrecordsへの参照を返す
function currentRecords() {
  if (!currentBook) return {};
  if (!state.bookRecords[currentBook.id]) state.bookRecords[currentBook.id] = {};
  return state.bookRecords[currentBook.id];
}

// ===== 記録の数え方（2026-10 改修） =====
// 単語1語の記録 rec[no] の項目：
//   correct     直近の本番（通しのテスト）で正解したか。本番を最後まで解き終えたときにまとめて書き換える。練習では動かさない
//   attempts    答えた回数（本番・練習とも）
//   wrongCount  間違えた回数（本番・練習とも）。1以上なら「これまでのバツ」
//   practiceOk  間違えたあと、練習（バツ復習など）で正解したか。false のままなら「残りのバツ」
//   lucky       最後の正解が「マグレ」だったか。true なら「残りのマグレ」
//   luckyCount  マグレと申告した回数。1以上なら「これまでのマグレ」
//   fcUnknown   フラッシュカードで最後に押したのが「わからない」なら true、「わかる」なら false
// 日付のキー（YYYY-MM-DD）は端末の時刻（日本時間）で作る。UTCだと朝9時より前の勉強が前の日になってしまうため
function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function todayKey() { return dateKey(new Date()); }
function wordRec(rec, no) {
  if (!rec[no]) rec[no] = { correct: false, attempts: 0, wrongCount: 0, lucky: false };
  return rec[no];
}
function isEverWrong(r)   { return (r?.wrongCount || 0) > 0; }
function isRemainWrong(r) { return isEverWrong(r) && !r.practiceOk; }
function isEverLucky(r)   { return (r?.luckyCount || 0) > 0 || r?.lucky === true; }
function isRemainLucky(r) { return r?.lucky === true; }
function isFcKnown(r)     { return r?.fcUnknown === false; }
function hasAnswered(r)   { return (r?.attempts || 0) > 0; }

// セクション1つぶんの数字をまとめて返す（生徒画面・管理画面の両方で使う）
function sectionInfo(book, records, secStats, sectionId) {
  const words = book.words().filter(w => w.section === sectionId && w.japanese);
  const st = (secStats || {})[sectionId] || {};
  const info = { total: words.length, correct: 0, answered: 0,
    everWrong: 0, remainWrong: 0, everLucky: 0, remainLucky: 0, fcKnown: 0 };
  words.forEach(w => {
    const r = (records || {})[w.no];
    if (!r) return;
    if (r.correct)          info.correct++;
    if (hasAnswered(r))     info.answered++;
    if (isEverWrong(r))     info.everWrong++;
    if (isRemainWrong(r))   info.remainWrong++;
    if (isEverLucky(r))     info.everLucky++;
    if (isRemainLucky(r))   info.remainLucky++;
    if (isFcKnown(r))       info.fcKnown++;
  });
  // 本番の点数：通しの決まり（2026-10-22〜）で1回でも解き終えていればその回の点数、まだなら前の数え方の点数
  info.hasRun  = st.lastScore != null;
  info.legacy  = !info.hasRun;
  info.score   = info.hasRun ? st.lastScore : info.correct;
  info.best    = st.bestScore != null ? st.bestScore : null;
  info.cleared = info.total > 0 && info.score === info.total;
  // 合格回数。改修前から全問正解になっているセクションは「🏆1」から数え始める
  const legacyCleared = info.total > 0 && info.correct === info.total;
  info.passCount = st.passCount != null ? st.passCount : (legacyCleared ? 1 : 0);
  info.passes      = st.passes || [];
  info.passRandom  = info.passes.filter(x => x.order === 'random').length;
  info.passSeq     = info.passes.filter(x => x.order === 'sequential').length;
  info.passLegacy  = Math.max(0, info.passCount - info.passes.length);
  info.seqFull     = st.seqFullCount || 0;
  // 色と「◯周目」は、直近の本番が何周目だったかで決める。次の本番は「合格回数＋1」周目
  info.round     = info.hasRun ? (st.lastRunRound || 1) : (st.round || 1);
  info.nextRound = info.passCount + 1;
  return info;
}

// 単語帳全体の数字（管理画面の合計列・学習データで使う）
function bookInfo(book, records) {
  const words = book.words().filter(w => w.japanese);
  const info = { total: words.length, correct: 0, answered: 0,
    everWrong: 0, remainWrong: 0, everLucky: 0, remainLucky: 0, fcKnown: 0 };
  words.forEach(w => {
    const r = (records || {})[w.no];
    if (!r) return;
    if (r.correct)          info.correct++;
    if (hasAnswered(r))     info.answered++;
    if (isEverWrong(r))     info.everWrong++;
    if (isRemainWrong(r))   info.remainWrong++;
    if (isEverLucky(r))     info.everLucky++;
    if (isRemainLucky(r))   info.remainLucky++;
    if (isFcKnown(r))       info.fcKnown++;
  });
  return info;
}

// 点数セルの色。1周目は 赤→黄→緑、2周目以降は薄紫
function sectionCellClass(info) {
  if (info.round >= 2) return info.cleared ? 'cell-r2-full' : 'cell-r2-part';
  const score = info.score != null ? info.score : info.correct;
  const pct = info.total > 0 ? (score / info.total) * 100 : 0;
  return info.cleared ? 'cell-perfect'
       : pct >= 80 ? 'cell-good'
       : pct >= 50 ? 'cell-mid'
       : pct > 0   ? 'cell-low'
       : 'cell-none';
}
// 「🏆2」「3周目」の表示
function passBadge(info, detail = true) {
  if (!(info.passCount > 0) && !(info.seqFull > 0)) return '';
  let html = info.passCount > 0 ? `<span class="pass-badge" title="合格回数">🏆${info.passCount}</span>` : '';
  if (detail) {
    const parts = [];
    if (info.passRandom) parts.push(`🔀${info.passRandom}`);
    if (info.passSeq)    parts.push(`📋${info.passSeq}`);
    if (info.passLegacy && (info.passRandom || info.passSeq)) parts.push(`記録前${info.passLegacy}`);
    if (parts.length) html += `<span class="pass-detail">（${parts.join('・')}）</span>`;
    if (info.seqFull) html += `<span class="seqfull-badge" title="2周目以降に順番通りで満点。合格回数には数えない">📋${info.total}点×${info.seqFull}</span>`;
  }
  return html;
}
// 「280/300」と、その下に小さく「最高290」または「前の数え方」
function scoreHtml(info) {
  let sub = '';
  if (info.legacy && info.answered > 0) sub = '<small class="score-sub">前の数え方</small>';
  else if (info.best != null && info.best > info.score) sub = `<small class="score-sub">最高${info.best}</small>`;
  return `${info.score}<small>/${info.total}</small>${sub ? '<br>' + sub : ''}`;
}
function orderIcon(order) { return order === 'sequential' ? '📋' : '🔀'; }
function orderName(order) { return order === 'sequential' ? '📋 順番通り' : '🔀 ランダム'; }
const MODE_NAMES = { normal: '本番テスト', review: '⭐ バツ練習', lucky: '🔺 マグレ練習', 'review-combined': '⭐🔺 バツ＋マグレ練習', flashcard: '🃏 フラッシュカード' };
function roundBadge(info) {
  return info.round >= 2 ? `<span class="round-badge">${info.round}周目</span>` : '';
}

// 日ごとの記録に数を足す（今日解いた数・フラッシュカードの枚数など）
function bumpDaily(key, bookId, n = 1) {
  const today = todayKey();
  const d = state.dailyLog[today] || (state.dailyLog[today] = {});
  d[key] = (d[key] || 0) + n;
  if (bookId) {
    if (!d.books) d.books = {};
    const b = d.books[bookId] || (d.books[bookId] = {});
    b[key] = (b[key] || 0) + n;
  }
}

// その単語帳の「前回比」：最後に記録した日と、その前の記録日との習得語数の差
function prevDiff(dailyLog, bookId) {
  const days = Object.keys(dailyLog || {}).sort();
  const vals = [];
  days.forEach(day => {
    const d = dailyLog[day];
    const v = bookId ? d?.books?.[bookId]?.mastered : d?.mastered;
    if (v !== undefined) vals.push({ day, v });
  });
  if (vals.length < 2) return null;
  const last = vals[vals.length - 1], prev = vals[vals.length - 2];
  return { diff: last.v - prev.v, day: last.day, prevDay: prev.day };
}
function diffLabel(d) {
  if (!d) return '<span class="diff-none">—</span>';
  const cls = d.diff > 0 ? 'diff-up' : d.diff < 0 ? 'diff-down' : 'diff-flat';
  return `<span class="${cls}">${d.diff > 0 ? '+' : ''}${d.diff}</span>`;
}
function fmtDay(key) {
  if (!key) return '—';
  const [y, m, d] = key.split('-');
  return `${Number(m)}/${Number(d)}`;
}

// ===== Screens =====
const SCREEN_TAB = {
  'screen-bookpicker': 'test', 'screen-home': 'test', 'screen-mode': 'test', 'screen-complete': 'test',
  'screen-stats': 'stats',
  'screen-mypage': 'mypage',
  'screen-admin': 'admin',
};

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
  updateChara(id);

  const bar = document.getElementById('tab-bar');
  if (id === 'screen-quiz' || id === 'screen-flashcard' || !currentUser) {
    bar.classList.add('hidden');
    document.body.classList.remove('has-tab-bar');
  } else {
    bar.classList.remove('hidden');
    document.body.classList.add('has-tab-bar');
    const tabId = SCREEN_TAB[id];
    if (tabId) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      const el = document.getElementById(`tab-${tabId}`);
      if (el) el.classList.add('active');
    }
  }
}

// ===== Character Coach =====
const CHARA_CONFIG = {
  'screen-bookpicker': { pose: 'hello', msgs: ['今日も頑張ろう！', 'コツコツ続けよう！', '英検合格まで一緒に！'] },
  'screen-home':     { pose: 'hello', msgs: ['今日も頑張ろう！', 'コツコツ続けよう！', '英検合格まで一緒に！'] },
  'screen-mode':     { pose: 'fight', msgs: ['さあ挑戦だ！', '全力で行こう！', 'できるよ、信じてる！'] },
  'screen-complete': { pose: 'cheer', msgs: ['よく頑張った！', '素晴らしい！', 'その調子で続けよう！'] },
  'screen-stats':    { pose: 'study', msgs: ['コツコツが大切！', '記録が力になるよ！', '続けることが大事！'] },
  'screen-mypage':   { pose: 'think', msgs: ['コツコツが大切！', '振り返りが力になるよ！', '継続は力なり！'] },
};
const CHARA_HIDDEN = new Set(['screen-quiz', 'screen-flashcard', 'screen-loading', 'screen-login', 'screen-admin']);

function updateChara(screenId) {
  const widget = document.getElementById('chara-widget');
  if (CHARA_HIDDEN.has(screenId)) {
    widget.classList.add('hidden');
    return;
  }
  const cfg = CHARA_CONFIG[screenId];
  if (!cfg) { widget.classList.add('hidden'); return; }

  let pose = cfg.pose;
  if (screenId === 'screen-complete') {
    const total = quiz.sessionCorrect + quiz.sessionWrong;
    const pct   = total > 0 ? quiz.sessionCorrect / total : 0;
    pose = pct >= 0.8 ? 'cheer' : pct >= 0.5 ? 'happy' : 'worry';
  }

  const msg = cfg.msgs[Math.floor(Math.random() * cfg.msgs.length)];
  const img = document.getElementById('chara-img');
  img.src = `images/chara_${pose}.png`;
  document.getElementById('chara-bubble').textContent = msg;
  widget.classList.remove('hidden');
}

document.getElementById('chara-widget').addEventListener('click', () => {
  const screenId = document.querySelector('.screen.active')?.id;
  const cfg = CHARA_CONFIG[screenId];
  if (!cfg) return;
  const bubble = document.getElementById('chara-bubble');
  const msgs = cfg.msgs;
  const current = bubble.textContent;
  const next = msgs[(msgs.indexOf(current) + 1) % msgs.length];
  bubble.textContent = next;
  const widget = document.getElementById('chara-widget');
  widget.classList.add('chara-bounce');
  setTimeout(() => widget.classList.remove('chara-bounce'), 400);
});

// ===== Tab Bar =====
function showTabBar(visible) {
  const bar = document.getElementById('tab-bar');
  if (visible) {
    bar.classList.remove('hidden');
    document.body.classList.add('has-tab-bar');
  } else {
    bar.classList.add('hidden');
    document.body.classList.remove('has-tab-bar');
  }
}

function setActiveTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`tab-${tab}`).classList.add('active');
}

// ===== Firestore =====
async function loadUserData(uid) {
  const doc = await db.collection('users').doc(uid).get();
  if (doc.exists) {
    const d = doc.data();
    userRole  = d.role   || 'student';
    userName  = d.name   || '';
    userId    = d.userId || '';

    // BOOKSベースで動的読込（exはマイグレーション込み）
    BOOKS.forEach(book => {
      const key = book.firestoreKey;
      if (book.id === 'ex' && d.records && !d.records_ex) {
        // マイグレーション: 旧 records → records_ex
        state.bookRecords.ex = d.records;
        db.collection('users').doc(uid).set(
          { records_ex: d.records },
          { merge: true }
        ).catch(console.error);
      } else {
        state.bookRecords[book.id] = d[key] || {};
      }
      state.sectionStats[book.id] = d[`sections_${book.id}`] || {};
      state.fcStats[book.id]      = d[`fc_${book.id}`] || {};
    });
    state.archived      = d.archived === true;
    state.historyLog    = d.history_log || [];
    state.notices       = d.notices || {};

    state.dailyLog      = d.dailyLog      || {};
    state.streak        = d.streak        || 0;
    state.bestStreak    = d.bestStreak    || 0;
    state.points        = d.points        || 0;
    state.lastStudyDate = d.lastStudyDate || null;
    state.tutorialDone  = d.tutorialDone  || false;
    state.memos         = d.memos         || {};
  } else {
    userRole = 'student';
    state.bookRecords   = emptyBookRecords();
    state.sectionStats  = emptyBookRecords();
    state.fcStats       = emptyBookRecords();
    state.archived      = false;
    state.historyLog    = [];
    state.notices       = {};
    state.dailyLog      = {};
    state.streak        = 0;
    state.bestStreak    = 0;
    state.points        = 0;
    state.lastStudyDate = null;
    state.tutorialDone  = false;
    state.memos         = {};
  }
}

function saveState() {
  if (!currentUser) return;
  const today = todayKey();
  // 日ごとの記録：全単語帳の習得語数・残りのバツ、単語帳ごとの習得語数（今日の解答数などは bumpDaily で足す）
  const day = state.dailyLog[today] || (state.dailyLog[today] = {});
  let totalMastered = 0, totalRemainWrong = 0;
  if (!day.books) day.books = {};
  BOOKS.forEach(book => {
    const info = bookInfo(book, state.bookRecords[book.id] || {});
    totalMastered    += info.correct;
    totalRemainWrong += info.remainWrong;
    const b = day.books[book.id] || (day.books[book.id] = {});
    b.mastered = info.correct;
  });
  day.mastered    = totalMastered;
  day.remainWrong = totalRemainWrong;
  const payload = {
    dailyLog:        state.dailyLog,
    streak:          state.streak,
    bestStreak:      state.bestStreak,
    points:          state.points,
    lastStudyDate:   state.lastStudyDate,
    tutorialDone:    state.tutorialDone,
    memos:           state.memos,
    history_log:     state.historyLog || [],
    notices:         state.notices || {},
    updatedAt:       firebase.firestore.FieldValue.serverTimestamp(),
  };
  BOOKS.forEach(book => {
    payload[book.firestoreKey]       = state.bookRecords[book.id] || {};
    payload[`sections_${book.id}`]   = state.sectionStats[book.id] || {};
    payload[`fc_${book.id}`]         = state.fcStats[book.id] || {};
  });
  db.collection('users').doc(currentUser.uid).set(payload, { merge: true }).catch(console.error);
}

// saveState の別名（フラッシュカード完了時などに使用）
const saveRecords = saveState;

function resetState() {
  if (!confirm('全学習データをリセットしますか？\nこの操作は元に戻せません。')) return;
  state = {
    bookRecords: emptyBookRecords(), sectionStats: emptyBookRecords(), fcStats: emptyBookRecords(),
    dailyLog: {}, streak: 0, bestStreak: 0, points: 0,
    lastStudyDate: null, tutorialDone: state.tutorialDone, memos: {},
    archived: false, historyLog: [], notices: state.notices || {},
  };
  saveState();
  renderHome();
}

// ===== Auth State Listener =====
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    showScreen('screen-loading');
    await loadUserData(user.uid);

    // 削除（アーカイブ）された生徒はログインできない
    if (userRole !== 'teacher' && state.archived) {
      pendingLoginError = 'このアカウントは今は使えません。先生に連絡してください。';
      await auth.signOut();
      return;
    }

    document.getElementById('home-username').textContent     = userName;
    document.getElementById('bookpicker-username').textContent = userName;
    if (userRole === 'teacher') {
      document.getElementById('admin-teacher-name').textContent = `講師: ${userName}`;
      document.getElementById('tab-admin').classList.remove('hidden');
      showScreen('screen-admin');
      loadAdminData();
    } else {
      document.getElementById('tab-admin').classList.add('hidden');
      renderBookPicker();
      showScreen('screen-bookpicker');
      if (!state.tutorialDone) {
        state.notices = Object.assign({}, state.notices, { [PASS_RULE_NOTICE]: true }); // 初めての生徒はチュートリアルで説明する
        setTimeout(() => openTutorial(), 600);
      } else if (!state.notices?.[PASS_RULE_NOTICE]) {
        setTimeout(() => openNotice(), 600);
      }
    }
  } else {
    currentUser = null;
    currentBook = null;
    document.getElementById('tab-bar').classList.add('hidden');
    document.body.classList.remove('has-tab-bar');
    showScreen('screen-login');
    document.getElementById('btn-login').textContent = 'ログイン';
    if (pendingLoginError) {
      showAuthError(document.getElementById('login-error'), pendingLoginError);
      pendingLoginError = '';
    }
  }
});

// ===== 1回だけ出すお知らせ =====
const PASS_RULE_NOTICE = 'pass-rule-2026-10';
function openNotice() {
  document.getElementById('notice-modal').classList.remove('hidden');
}
document.getElementById('btn-notice-ok').addEventListener('click', () => {
  document.getElementById('notice-modal').classList.add('hidden');
  state.notices = Object.assign({}, state.notices, { [PASS_RULE_NOTICE]: true });
  saveState();
});

// ===== ID → ダミーメール変換 =====
function idToEmail(id) {
  return id.toLowerCase().replace(/\s+/g, '_') + '@hapikuru.local';
}

// ログイン入力をメールアドレスとして解決する
// - `@` を含めばそのままメールとして扱う（旧Gmail直登録ユーザー救済）
// - 含まなければ idToEmail() で `<id>@hapikuru.local` に変換
function resolveLoginEmail(input) {
  const trimmed = (input || '').trim();
  if (trimmed.includes('@')) return trimmed.toLowerCase();
  return idToEmail(trimmed);
}

// ===== Login =====
document.getElementById('btn-login').addEventListener('click', async () => {
  const loginInput = document.getElementById('login-id').value.trim();
  const password   = document.getElementById('login-password').value;
  const errEl      = document.getElementById('login-error');
  errEl.classList.add('hidden');
  if (!loginInput || !password) { showAuthError(errEl, 'IDとパスワードを入力してください。'); return; }
  try {
    document.getElementById('btn-login').textContent = '...';
    await auth.signInWithEmailAndPassword(resolveLoginEmail(loginInput), password);
  } catch (e) {
    document.getElementById('btn-login').textContent = 'ログイン';
    showAuthError(errEl, authErrorMsg(e.code));
  }
});

// ===== Signup =====
document.getElementById('btn-signup').addEventListener('click', async () => {
  const name     = document.getElementById('signup-name').value.trim();
  const userId   = document.getElementById('signup-id').value.trim();
  const password = document.getElementById('signup-password').value;
  const errEl    = document.getElementById('signup-error');
  errEl.classList.add('hidden');
  if (!name)               { showAuthError(errEl, 'お名前を入力してください。'); return; }
  if (!userId)             { showAuthError(errEl, 'IDを入力してください。'); return; }
  if (password.length < 6) { showAuthError(errEl, 'パスワードは6文字以上で入力してください。'); return; }
  try {
    document.getElementById('btn-signup').textContent = '...';
    const cred = await auth.createUserWithEmailAndPassword(idToEmail(userId), password);
    await db.collection('users').doc(cred.user.uid).set({
      name, userId, password, role: 'student', records_ex: {}, records_pastan: {},
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  } catch (e) {
    document.getElementById('btn-signup').textContent = '登録する';
    showAuthError(errEl, authErrorMsg(e.code));
  }
});

// ===== Logout =====
function logout() {
  auth.signOut();
}
document.getElementById('btn-admin-logout').addEventListener('click', logout);
document.getElementById('btn-bookpicker-logout').addEventListener('click', logout);

// ===== Auth helpers =====
function showAuthError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}
function authErrorMsg(code) {
  const map = {
    'auth/user-not-found':       'IDが見つかりません。',
    'auth/wrong-password':       'パスワードが間違っています。',
    'auth/invalid-credential':   'IDまたはパスワードが正しくありません。',
    'auth/email-already-in-use': 'このIDはすでに使用されています。',
    'auth/invalid-email':        'IDの形式が正しくありません。',
    'auth/weak-password':        'パスワードは6文字以上で設定してください。',
    'auth/too-many-requests':    'ログイン試行回数が多すぎます。しばらく待ってから試してください。',
  };
  return map[code] || `エラーが発生しました（${code}）`;
}

// ===== Form Switch =====
document.getElementById('show-signup').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('form-login').classList.add('hidden');
  document.getElementById('form-signup').classList.remove('hidden');
});
document.getElementById('show-login').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('form-signup').classList.add('hidden');
  document.getElementById('form-login').classList.remove('hidden');
});

// ===== Part of Speech =====
function getPos(word, japanese) {
  const w = word.toLowerCase();
  const verbJ = ['する', 'させる', 'される', 'てる', 'でる', 'ける', 'める', 'える', 'せる', 'ねる', 'べる', 'げる'];
  if (verbJ.some(e => japanese.endsWith(e))) return '動';
  if (japanese.endsWith('い')) return '形';
  if (japanese.endsWith('な') || japanese.endsWith('の')) return '形';
  if (w.endsWith('ly') && w.length > 4) return '副';
  if (/(?:ful|less|ive|ous|ible|able|ic|ish)$/.test(w)) return '形';
  if (/(?:ize|ise|ify|ate)$/.test(w)) return '動';
  return '名';
}

// ===== 単語帳選択画面 =====
function renderBookPicker() {
  const grid = document.getElementById('book-grid');
  grid.innerHTML = '';
  BOOKS.forEach(book => {
    const allWords = book.words();
    const words = allWords.filter(w => w.japanese);
    const records = state.bookRecords[book.id] || {};
    const masteredCount = words.filter(w => records[w.no]?.correct).length;
    const totalCount = words.length;
    const pct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;
    const hasData = allWords.length > 0 && book.sections.length > 0;

    const card = document.createElement('div');
    card.className = 'book-card' + (!hasData ? ' book-card-disabled' : '');
    card.innerHTML = `
      <div class="book-card-icon">${book.icon}</div>
      <div class="book-card-body">
        <div class="book-card-name">${book.name}</div>
        <div class="book-card-label">${book.label}</div>
        ${hasData
          ? `<div class="book-card-progress">${masteredCount} / ${totalCount} 語習得（${pct}%）</div>
             <div class="book-progress-bar-wrap"><div class="book-progress-bar" style="width:${pct}%"></div></div>`
          : `<div class="book-card-coming">準備中</div>`
        }
      </div>
      <div class="book-card-arrow">${hasData ? '›' : ''}</div>
    `;
    if (hasData) {
      card.addEventListener('click', () => {
        currentBook = book;
        document.getElementById('home-book-label').textContent = book.label;
        renderHome();
        showScreen('screen-home');
      });
    }
    grid.appendChild(card);
  });
}

// ===== Home =====
function wordsForSection(sectionId) {
  return currentBook.words().filter(w => w.section === sectionId && w.japanese);
}
function getSectionStats(sectionId) {
  const info = currentSectionInfo(sectionId);
  return { total: info.total, correct: info.score, wrongCount: info.remainWrong };
}
function currentSectionInfo(sectionId) {
  return sectionInfo(currentBook, currentRecords(), state.sectionStats[currentBook.id], sectionId);
}
// セクションの記録 { passCount, lastScore, bestScore, ... } を取り出す（無ければ作る）
function ensureSecStat(sectionId) {
  if (!state.sectionStats[currentBook.id]) state.sectionStats[currentBook.id] = {};
  const map = state.sectionStats[currentBook.id];
  if (!map[sectionId]) {
    const info = currentSectionInfo(sectionId);
    map[sectionId] = { passCount: info.passCount };
  }
  if (map[sectionId].passCount == null) map[sectionId].passCount = 0;
  return map[sectionId];
}
function nextRoundOf(sectionId) { return currentSectionInfo(sectionId).nextRound; }

// テストの履歴（1回ごとの記録）。新しいものを先頭に、最大300件
const HISTORY_MAX = 300;
// 同じ本番の回（runId）の「途中でやめた」行を書き換える。見つかれば true
function updatePausedHistory(runId, status) {
  let found = false;
  (state.historyLog || []).forEach(h => {
    if (runId && h.runId === runId && h.status === 'paused') { h.status = status; found = true; }
  });
  return found;
}
function pushHistory(entry) {
  if (!state.historyLog) state.historyLog = [];
  state.historyLog.unshift(Object.assign({ at: new Date().toISOString() }, entry));
  if (state.historyLog.length > HISTORY_MAX) state.historyLog.length = HISTORY_MAX;
}
// 答えた1問を、日ごと・単語帳ごと・セクションごとに 🔀／📋 で数える
function countAnswerOrder() {
  const key = quiz.order === 'sequential' ? 'answeredSeq' : 'answeredRandom';
  bumpDaily('answered', currentBook.id);
  bumpDaily(key, currentBook.id);
  if (quiz.section && quiz.section.id !== '__all__') {
    const st = ensureSecStat(quiz.section.id);
    st[key] = (st[key] || 0) + 1;
  }
}

function renderHome() {
  if (!currentBook) return;
  const grid = document.getElementById('section-grid');
  grid.innerHTML = '';
  currentBook.sections.forEach(sec => {
    const info = currentSectionInfo(sec.id);
    const { remainWrong, cleared } = info;
    const card = document.createElement('div');
    card.className = 'section-card' + (cleared ? ' cleared' : '') + (info.round >= 2 ? ' round2' : '');
    card.innerHTML = `
      <div class="card-title">${sec.label}${cleared ? ' ✅' : ''}</div>
      <div class="card-range">${sec.range}</div>
      <div class="card-progress"><span class="card-score ${sectionCellClass(info)}">${info.score}/${info.total} 点</span></div>
      ${info.best != null && info.best > info.score ? `<div class="card-progress card-best">最高 ${info.best}点</div>` : ''}
      ${info.legacy && info.answered > 0 ? `<div class="card-progress card-best">前の数え方</div>` : ''}
      ${info.passCount > 0 || info.round >= 2 || info.seqFull > 0 ? `<div class="card-progress card-badges">${passBadge(info, false)} ${roundBadge(info)}</div>` : ''}
      ${remainWrong > 0 ? `<div class="card-progress" style="color:#E05555">残りのバツ ${remainWrong} 個</div>` : ''}
      ${remainWrong > 0 ? `<div class="card-badge">✗</div>` : ''}
    `;
    card.addEventListener('click', () => openMode(sec));
    grid.appendChild(card);
  });
}

// ===== Mode Select =====
function openMode(sec) {
  quiz.section = sec;
  document.getElementById('mode-section-title').textContent = `${sec.label}（${sec.range}）`;
  const info = currentSectionInfo(sec.id);
  const { total } = info;
  const words = wordsForSection(sec.id);
  const rec = currentRecords();
  const wrongWords  = words.filter(w => isRemainWrong(rec[w.no]));
  const luckyWords  = words.filter(w => isRemainLucky(rec[w.no]));
  const combinedLen = words.filter(w => isRemainWrong(rec[w.no]) || isRemainLucky(rec[w.no])).length;

  document.getElementById('mode-stats').innerHTML = `
    <strong>本番の点数:</strong> <span class="${sectionCellClass(info)} mode-score">${info.score}/${total}</span>
    ${info.best != null && info.best > info.score ? `<span class="mode-best">最高 ${info.best}</span>` : ''}
    ${info.legacy && info.answered > 0 ? '<span class="mode-best">前の数え方</span>' : ''}
    ${passBadge(info)} ${roundBadge(info)}<br>
    <strong>残りのバツ:</strong> ${wrongWords.length} 個（これまで ${info.everWrong} 個）／
    <strong>残りのマグレ:</strong> ${luckyWords.length} 個<br>
    <span class="mode-note">次の本番は${info.nextRound}周目。全${total}問を通しで解き、1回で全問正解すると合格${info.nextRound >= 2 ? '（2周目以降はランダムでクリアしたときだけ合格に数えます）' : ''}</span>
  `;
  document.getElementById('btn-start-normal').textContent = `▶ 本番テスト（全${total}問を通しで）`;
  updateOrderWarn();

  const reviewBtn = document.getElementById('btn-start-review');
  reviewBtn.disabled = wrongWords.length === 0;
  reviewBtn.style.opacity = wrongWords.length === 0 ? '.4' : '1';

  const luckyBtn = document.getElementById('btn-start-lucky');
  luckyBtn.disabled = luckyWords.length === 0;
  luckyBtn.style.opacity = luckyWords.length === 0 ? '.4' : '1';

  const combinedBtn = document.getElementById('btn-start-review-combined');
  combinedBtn.disabled = combinedLen === 0;
  combinedBtn.style.opacity = combinedLen === 0 ? '.4' : '1';

  const fcReviewWords = words.filter(w => isRemainWrong(rec[w.no]) || rec[w.no]?.fcUnknown === true);
  const fcReviewBtn = document.getElementById('btn-start-flashcard-review');
  fcReviewBtn.disabled = fcReviewWords.length === 0;
  fcReviewBtn.style.opacity = fcReviewWords.length === 0 ? '.4' : '1';

  const resumeBtn = document.getElementById('btn-start-resume');
  const saved = getSavedQuiz();
  // 単語帳ごとにセクションIDが重なるため、単語帳も一致したときだけ再開を出す
  // （bookId のない旧データは、bookId 導入前からある単語帳でだけ再開を出す）
  const savedBookId = saved && (saved.bookId || (currentBook.id !== 'pastan6' ? currentBook.id : null));
  if (saved && saved.sectionId === sec.id && savedBookId === currentBook.id) {
    resumeBtn.classList.remove('hidden');
    resumeBtn.textContent = saved.mode === 'normal'
      ? `⏸ 本番の続きから（あと${saved.poolNos.length}問・${orderName(saved.order || 'random')}）`
      : `⏸ 練習の続きから（${MODE_NAMES[saved.mode] || '練習'}・あと${saved.poolNos.length}問）`;
  } else {
    resumeBtn.classList.add('hidden');
  }

  showScreen('screen-mode');
}

// ===== Quiz =====
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function startQuiz(mode, opts = {}) {
  const allWords = wordsForSection(quiz.section.id);
  const rec = currentRecords();
  const saved = getSavedQuiz();
  const savedHere = saved && saved.bookId === currentBook.id && saved.sectionId === quiz.section.id;

  if (mode === 'normal' && !opts.confirmed) {
    // 途中の本番があるのに最初からやり直すときは確かめる
    if (savedHere && saved.mode === 'normal') {
      if (!confirm(`途中の本番があります（あと${saved.poolNos.length}問）。\n最初からやり直すと、途中の回は「途中でやめた回」として履歴に残り、点数は付きません。\n最初からやり直しますか？`)) return;
    }
    // 2周目以降を順番通りで始めようとしたら知らせる
    if (quiz.orderMode === 'sequential' && nextRoundOf(quiz.section.id) >= 2) {
      openOrderWarnModal();
      return;
    }
  }
  if (savedHere && saved.mode === 'normal' && mode === 'normal') {
    if (!updatePausedHistory(saved.run?.id, 'abandoned')) {
      const done = (saved.run?.correct?.length || 0) + (saved.run?.wrong?.length || 0);
      pushHistory({ book: currentBook.id, sec: quiz.section.id, mode: 'normal', round: saved.round || 1,
        order: saved.order || 'random', answered: done, correct: saved.run?.correct?.length || 0,
        total: allWords.length, status: 'abandoned', resumed: saved.run?.resumed || 0, runId: saved.run?.id || null });
    }
  }
  localStorage.removeItem('quiz_resume');
  quiz.mode = mode;
  quiz.order = quiz.orderMode;
  quiz.sessionCorrect = 0;
  quiz.sessionWrong   = 0;
  quiz.answered       = false;
  quiz.allWords = allWords;

  const applyOrder = arr => quiz.order === 'sequential'
    ? [...arr].sort((a, b) => a.no.localeCompare(b.no))
    : shuffle(arr);

  quiz.run = null;
  if (mode === 'review') {
    quiz.pool = applyOrder(allWords.filter(w => isRemainWrong(rec[w.no])));
  } else if (mode === 'lucky') {
    quiz.pool = applyOrder(allWords.filter(w => isRemainLucky(rec[w.no])));
  } else if (mode === 'review-combined') {
    quiz.pool = applyOrder(allWords.filter(w => isRemainWrong(rec[w.no]) || isRemainLucky(rec[w.no])));
  } else {
    // 本番：毎回そのセクションの全問を通しで解く
    quiz.pool  = applyOrder(allWords);
    quiz.round = nextRoundOf(quiz.section.id);
    quiz.run   = { id: Date.now(), startedAt: new Date().toISOString(), resumed: 0, correct: [], wrong: [] };
  }
  if (quiz.pool.length === 0) { alert('出題できる単語がありません。'); return; }
  quiz.totalPool = quiz.pool.length;
  document.getElementById('quiz-section-label').textContent = quiz.section.label;
  setQuizModeLabel();
  showScreen('screen-quiz');
  nextQuestion();
}

// テスト中の上の表示：「本番テスト 🔀ランダム」など
function setQuizModeLabel() {
  const el = document.getElementById('quiz-mode-label');
  if (quiz.mode === 'normal') {
    const warn = quiz.order === 'sequential' && quiz.round >= 2;
    el.innerHTML = `本番テスト ${quiz.round}周目 ${orderIcon(quiz.order)}${warn ? '<span class="quiz-warn">順番通り（合格に数えません）</span>' : ''}`;
  } else {
    el.textContent = `${MODE_NAMES[quiz.mode] || '練習'}（点数に入りません） ${orderIcon(quiz.order)}`;
  }
}

// ===== 順番通りの知らせ（2周目以降） =====
const ORDER_WARN_TEXT = '2周目以降の合格扱いになるには、ランダムでクリアする必要があります。順番通りで解いた分は、合格回数（🏆）に数えません。';
function updateOrderWarn() {
  const banner = document.getElementById('order-warn-banner');
  if (!banner || !quiz.section || !currentBook) return;
  const show = quiz.orderMode === 'sequential' && nextRoundOf(quiz.section.id) >= 2;
  banner.classList.toggle('hidden', !show);
}
function openOrderWarnModal() {
  document.getElementById('order-warn-modal').classList.remove('hidden');
}
function closeOrderWarnModal() {
  document.getElementById('order-warn-modal').classList.add('hidden');
}
function setOrderMode(order) {
  quiz.orderMode = order;
  document.querySelectorAll('.order-btn').forEach(b => b.classList.toggle('active', b.dataset.order === order));
  updateOrderWarn();
}

function nextQuestion() {
  if (quiz.pool.length === 0) { showComplete(); return; }
  quiz.current  = quiz.pool.shift();
  quiz.answered = false;
  quiz.currentRecorded = false;

  const isNormal = quiz.mode === 'normal' && quiz.run;
  const total = isNormal ? quiz.allWords.length : quiz.totalPool;
  const done  = isNormal ? quiz.run.correct.length + quiz.run.wrong.length : quiz.sessionCorrect + quiz.sessionWrong;
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent = isNormal
    ? `${done} / ${total}　点数 ${total - quiz.run.wrong.length}/${total}`
    : `${done} / ${total}`;
  document.getElementById('word-display').textContent  = quiz.current.word;
  document.getElementById('word-no').textContent       = `No.${quiz.current.no}`;

  const phonetics = currentBook ? currentBook.phonetics() : {};
  const phonetic = phonetics[quiz.current.word.toLowerCase()] || null;
  const phoneticEl = document.getElementById('word-phonetic');
  if (phoneticEl) {
    phoneticEl.textContent = phonetic || '';
    phoneticEl.style.visibility = phonetic ? 'visible' : 'hidden';
  }

  const correctAnswer = quiz.current.japanese;
  const correctPos    = getPos(quiz.current.word, quiz.current.japanese);

  const samePosCandidates = shuffle(
    quiz.allWords.filter(w =>
      w.no !== quiz.current.no && w.japanese && w.japanese !== correctAnswer &&
      getPos(w.word, w.japanese) === correctPos
    )
  );
  const otherCandidates = shuffle(
    quiz.allWords.filter(w =>
      w.no !== quiz.current.no && w.japanese && w.japanese !== correctAnswer &&
      getPos(w.word, w.japanese) !== correctPos
    )
  );
  const wrongs = [...samePosCandidates, ...otherCandidates].slice(0, 3).map(w => w.japanese);
  quiz.choices = shuffle([correctAnswer, ...wrongs]);
  renderChoices();
  hideResult();
}

function renderChoices() {
  const container = document.getElementById('choices');
  container.innerHTML = '';
  quiz.choices.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.textContent = ch;
    btn.addEventListener('click', () => onAnswer(ch, btn));
    container.appendChild(btn);
  });
}

function onAnswer(chosen, btn) {
  if (quiz.answered) return;
  quiz.answered = true;
  const correct   = quiz.current.japanese;
  const isCorrect = chosen === correct;

  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct)    b.classList.add('correct');
    else if (b === btn && !isCorrect) b.classList.add('wrong');
  });

  const pos = getPos(quiz.current.word, correct);
  const resultEl = document.getElementById('quiz-result');
  resultEl.className = 'quiz-result ' + (isCorrect ? 'correct-msg' : 'wrong-msg');
  resultEl.innerHTML = isCorrect
    ? `⭕ 正解！<div class="result-word-info">${quiz.current.word} <span class="pos-badge">${pos}</span> = ${correct}</div>`
    : `✗ 不正解 — 正解：<strong>${correct}</strong><div class="result-word-info">${quiz.current.word} <span class="pos-badge">${pos}</span></div>`;

  const extras = currentBook ? (currentBook.extras()[quiz.current.word.toLowerCase()] || null) : null;
  if (extras) {
    let extrasHtml = '<div class="word-extras">';
    if (extras.example) {
      const lines = extras.example.split('\n');
      extrasHtml += `<div class="extras-block">
        <div class="extras-label">📝 例文</div>
        <div class="extras-example-en">${lines[0] || ''}</div>
        ${lines[1] ? `<div class="extras-example-ja">${lines[1]}</div>` : ''}
      </div>`;
    }
    if (extras.etymology) {
      extrasHtml += `<div class="extras-block">
        <div class="extras-label">🔤 語源</div>
        <div class="extras-body">${extras.etymology}</div>
      </div>`;
    }
    if (extras.related && extras.related.length > 0) {
      extrasHtml += `<div class="extras-block">
        <div class="extras-label">🔗 関連語</div>
        <div class="extras-related">${extras.related.map(r => `<span class="extras-related-tag">${r}</span>`).join('')}</div>
      </div>`;
    }
    extrasHtml += '</div>';
    resultEl.innerHTML += extrasHtml;
  }

  const memoNo = quiz.current.no;
  const existingMemo = (state.memos || {})[memoNo] || '';
  resultEl.innerHTML += `
    <div class="quiz-memo-area">
      <div class="quiz-memo-display${existingMemo ? '' : ' hidden'}" id="memo-display-${memoNo}">${existingMemo}</div>
      <button class="btn-memo-toggle" id="memo-toggle-btn-${memoNo}" onclick="toggleMemoEdit('${memoNo}')">
        ${existingMemo ? '✏️ メモを編集' : '📝 メモを追加'}
      </button>
      <div class="memo-edit-area hidden" id="memo-edit-${memoNo}">
        <textarea class="memo-textarea" id="memo-text-${memoNo}" placeholder="自分なりの覚え方をメモしよう...">${existingMemo}</textarea>
        <div class="memo-edit-btns">
          <button class="btn btn-primary btn-small" onclick="saveMemo('${memoNo}')">保存</button>
          <button class="btn btn-secondary btn-small" onclick="toggleMemoEdit('${memoNo}')">キャンセル</button>
        </div>
      </div>
    </div>`;

  if (!isCorrect) {
    const rec = currentRecords();
    const r = wordRec(rec, quiz.current.no);
    r.attempts++;
    r.wrongCount = (r.wrongCount || 0) + 1;
    r.practiceOk = false;   // 間違えたので「残りのバツ」に戻る
    r.lucky      = false;
    if (quiz.mode === 'normal' && quiz.run) quiz.run.wrong.push(quiz.current.no); // 本番の点数は解き終えたときにまとめて付ける
    countAnswerOrder();
    quiz.sessionWrong++;
    quiz.currentRecorded = true;
    saveState();
    showNextArea('wrong');
  } else {
    quiz.sessionCorrect++;
    showNextArea('correct');
  }
}

function showNextArea(type) {
  const area = document.getElementById('quiz-next-area');
  area.classList.remove('hidden');
  if (type === 'correct') {
    area.innerHTML = `
      <div class="quiz-next-correct">
        <button class="btn btn-primary quiz-next-btn" id="btn-confident">⭕ 確信して正解</button>
        <button class="btn btn-lucky quiz-next-btn" id="btn-lucky">🔺 マグレの正解</button>
      </div>`;
    document.getElementById('btn-confident').addEventListener('click', () => confirmAnswer(false));
    document.getElementById('btn-lucky').addEventListener('click',     () => confirmAnswer(true));
  } else {
    area.innerHTML = `<button class="btn btn-secondary quiz-next-btn" id="btn-next-wrong">次へ →</button>`;
    document.getElementById('btn-next-wrong').addEventListener('click', nextQuestion);
  }
}

// ===== Streak / Points =====
function updateStreak() {
  const today = todayKey();
  if (state.lastStudyDate === today) return;

  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const yesterdayStr = dateKey(yest);

  if (state.lastStudyDate === yesterdayStr) {
    state.streak += 1;
  } else {
    state.streak = 1;
  }
  state.bestStreak    = Math.max(state.bestStreak, state.streak);
  state.lastStudyDate = today;

  const bonus = state.streak >= 30 ? 20 : state.streak >= 7 ? 10 : state.streak >= 3 ? 5 : 0;
  state.points += 10 + bonus;
}

function confirmAnswer(isLucky) {
  const rec = currentRecords();
  const r = wordRec(rec, quiz.current.no);
  r.attempts++;
  r.lucky = isLucky;
  if (isLucky) r.luckyCount = (r.luckyCount || 0) + 1;
  if (quiz.mode === 'normal' && quiz.run) {
    quiz.run.correct.push(quiz.current.no);   // 本番の点数は解き終えたときにまとめて付ける
  } else if (quiz.mode !== 'normal') {
    r.practiceOk = true;    // 練習で正解 → バツ克服（本番の点数は動かさない）
  }
  countAnswerOrder();
  updateStreak();
  saveState();
  nextQuestion();
}

function hideResult() {
  const el = document.getElementById('quiz-result');
  el.className = 'quiz-result hidden';
  el.textContent = '';
  const area = document.getElementById('quiz-next-area');
  area.innerHTML = '';
  area.classList.add('hidden');
}

// ===== Quiz Resume =====
function getSavedQuiz() {
  try { return JSON.parse(localStorage.getItem('quiz_resume')); } catch { return null; }
}

function saveQuizAndGoBack() {
  // 今の問題をもう答えて記録済み（不正解）なら、続きには入れない。正解のあと「確信／マグレ」を押す前なら、もう一度出す
  const remainingPool = quiz.current && !quiz.currentRecorded ? [quiz.current, ...quiz.pool] : quiz.pool;
  const isAll = quiz.section?.id === '__all__';
  if (remainingPool.length > 0 && !isAll) {
    localStorage.setItem('quiz_resume', JSON.stringify({
      bookId:       currentBook.id,
      sectionId:    quiz.section.id,
      sectionLabel: quiz.section.label,
      sectionRange: quiz.section.range,
      mode:         quiz.mode,
      order:        quiz.order || 'random',
      round:        quiz.round || 1,
      run:          quiz.run || null,
      poolNos:      remainingPool.map(w => w.no),
      totalPool:    quiz.totalPool,
      sessionCorrect: quiz.sessionCorrect,
      sessionWrong:   quiz.sessionWrong,
    }));
  }
  // 履歴：途中でやめた（本番は続きから解ける）
  const answered = quiz.mode === 'normal' && quiz.run
    ? quiz.run.correct.length + quiz.run.wrong.length
    : quiz.sessionCorrect + quiz.sessionWrong;
  if (answered > 0) {
    pushHistory({ book: currentBook.id, sec: quiz.section.id, mode: quiz.mode, round: quiz.mode === 'normal' ? quiz.round : null,
      order: quiz.order || 'random', answered,
      correct: quiz.mode === 'normal' && quiz.run ? quiz.run.correct.length : quiz.sessionCorrect,
      total: quiz.mode === 'normal' ? quiz.allWords.length : quiz.totalPool,
      status: 'paused', resumed: quiz.run?.resumed || 0, runId: quiz.run?.id || null });
    saveState();
  }
  if (isAll) { renderHome(); showScreen('screen-home'); return; }
  openMode(quiz.section);
}

function resumeQuiz() {
  const saved = getSavedQuiz();
  if (!saved) return;
  quiz.section      = { id: saved.sectionId, label: saved.sectionLabel, range: saved.sectionRange };
  quiz.mode         = saved.mode;
  quiz.order        = saved.order || 'random';
  quiz.round        = saved.round || 1;
  quiz.run          = saved.run || null;
  if (quiz.run) quiz.run.resumed = (quiz.run.resumed || 0) + 1;
  quiz.sessionCorrect = saved.sessionCorrect || 0;
  quiz.sessionWrong   = saved.sessionWrong || 0;
  quiz.answered     = false;
  quiz.allWords     = wordsForSection(quiz.section.id);
  quiz.pool         = saved.poolNos.map(no => currentBook.words().find(w => w.no === no)).filter(Boolean);
  quiz.totalPool    = saved.totalPool || (quiz.pool.length + quiz.sessionCorrect + quiz.sessionWrong);
  if (quiz.mode === 'normal' && !quiz.run) {
    // 通しの決まりより前に保存された本番の続き → 新しい回として最初からやり直してもらう
    localStorage.removeItem('quiz_resume');
    alert('本番テストは「毎回全問を通しで解く」決まりになりました。最初から始めてください。');
    openMode(quiz.section);
    return;
  }
  if (quiz.pool.length === 0) { localStorage.removeItem('quiz_resume'); return; }
  localStorage.removeItem('quiz_resume');
  document.getElementById('quiz-section-label').textContent = quiz.section.label;
  setQuizModeLabel();
  showScreen('screen-quiz');
  nextQuestion();
}

// ===== Complete =====
function showComplete() {
  lastCompleteType = 'quiz';
  localStorage.removeItem('quiz_resume');
  document.getElementById('btn-complete-retry').textContent = quiz.mode === 'normal' ? 'もう一度（最初から通しで）' : 'もう一度';
  document.getElementById('btn-fc-retry-unknown').classList.add('hidden');
  const isAll = quiz.section.id === '__all__';
  let title = '練習おわり！', body = '';

  if (quiz.mode === 'normal' && quiz.run) {
    // 本番を最後まで解き終えた → この回の点数で、単語の「正解」と点数・合格をまとめて付ける
    const rec   = currentRecords();
    const total = quiz.allWords.length;
    const okSet = new Set(quiz.run.correct);
    quiz.allWords.forEach(w => { wordRec(rec, w.no).correct = okSet.has(w.no); });
    const score = quiz.run.correct.length;
    const st = ensureSecStat(quiz.section.id);
    st.lastScore    = score;
    st.bestScore    = Math.max(st.bestScore || 0, score);
    st.lastRunRound = quiz.round;
    st.lastRunAt    = new Date().toISOString();
    st.runs         = (st.runs || 0) + 1;
    const full = score === total;
    let status = 'done';
    let passLine;
    if (full && (quiz.round === 1 || quiz.order === 'random')) {
      st.passCount = (st.passCount || 0) + 1;
      if (!st.passes) st.passes = [];
      st.passes.push({ date: todayKey(), round: quiz.round, order: quiz.order, score, resumed: quiz.run.resumed || 0 });
      status = 'pass';
      title = '🎉 合格！';
      passLine = `<strong style="color:#FF6B9D">🏆 ${st.passCount}回目の合格！（${orderName(quiz.order)}）</strong>`;
    } else if (full) {
      st.seqFullCount = (st.seqFullCount || 0) + 1;
      status = 'seqFull';
      title = '満点！';
      passLine = `<span class="complete-warn">⚠️ ${ORDER_WARN_TEXT}<br>今回の満点は記録に残りますが、合格回数は増えません。</span>`;
    } else {
      title = '本番テスト終了';
      passLine = `<span class="mode-note">あと${total - score}問で満点。1回のテストで全問正解すると合格です。<br>間違えた単語は「バツ練習」で練習しましょう。</span>`;
    }
    updatePausedHistory(quiz.run.id, 'pausedResumed');
    pushHistory({ book: currentBook.id, sec: quiz.section.id, mode: 'normal', round: quiz.round, order: quiz.order,
      answered: total, correct: score, total, status, resumed: quiz.run.resumed || 0, runId: quiz.run.id });
    saveState();
    body = `
      <strong>今回の点数:</strong> ${score}/${total}（${quiz.round}周目・${orderName(quiz.order)}）<br>
      ${st.bestScore > score ? `<strong>最高:</strong> ${st.bestScore}/${total}<br>` : ''}
      ${passLine}`;
  } else {
    const answered = quiz.sessionCorrect + quiz.sessionWrong;
    const pct = answered > 0 ? Math.round((quiz.sessionCorrect / answered) * 100) : 0;
    pushHistory({ book: currentBook.id, sec: quiz.section.id, mode: quiz.mode, round: null, order: quiz.order || 'random',
      answered, correct: quiz.sessionCorrect, total: quiz.totalPool, status: 'done', resumed: 0 });
    saveState();
    const info = isAll ? null : currentSectionInfo(quiz.section.id);
    body = `
      <strong>今回の正答率:</strong> ${quiz.sessionCorrect}/${answered}（${pct}%）<br>
      ${isAll ? '' : `<strong>本番の点数:</strong> ${info.score}/${info.total}（練習では変わりません）<br>`}
      <span class="mode-note">練習の結果は、本番の点数と合格には入りません。正解した単語は「残りのバツ」から外れます。</span>`;
  }
  document.getElementById('complete-title').textContent = title;
  document.getElementById('complete-stats').innerHTML = body;
  document.getElementById('progress-bar').style.width = '100%';
  showScreen('screen-complete');
}

// ===== Tutorial =====
const TUTORIAL_STEPS = [
  {
    icon: '👋',
    title: 'ハピクル英語塾へようこそ！',
    body: 'このアプリで英検準1級の単語を楽しく学べます。まずは基本的な使い方を説明します！',
  },
  {
    icon: '📚',
    title: '単語帳を選ぼう',
    body: '最初に学びたい単語帳を選んでください。\n単語EXやパス単など、複数の単語帳に対応しています！',
  },
  {
    icon: '📖',
    title: 'セクションを選ぼう',
    body: 'ホーム画面のカードをタップして、テストしたいセクションを選びます。\n1回300語ずつ、コツコツ進めましょう！',
  },
  {
    icon: '✅',
    title: '問題に答えよう',
    body: '4択の選択肢から正しい日本語訳を選びます。\n答えた後、例文・語源・関連語も確認できます！',
  },
  {
    icon: '⭕🔺',
    title: '確信度を教えて！',
    body: '正解した後は「確信して正解」か「まぐれ正解」を選びましょう。\nまぐれ正解は後でまとめて復習できます！',
  },
  {
    icon: '🏆',
    title: '通しで全問正解すると合格！',
    body: '「本番テスト」は、毎回そのセクションの全問を最初から最後まで解きます。1回のテストで全問正解すると合格で、🏆の横に合格した回数が出ます。\n合格したあとは2周目。2周目以降は、🔀ランダムで全問正解したときだけ合格に数えます。',
  },
  {
    icon: '⭐',
    title: '復習モードを活用しよう',
    body: '間違えた単語は「バツ練習」「マグレ練習」で集中して練習できます！\n練習は本番の点数・合格には入りません。練習で正解すると「残りのバツ」が減ります。',
  },
  {
    icon: '🔥',
    title: '毎日続けてポイントゲット！',
    body: '毎日テストを続けると連続学習日数が増えてポイントが多くもらえます。\n「学習データ」タブで確認できます！',
  },
  {
    icon: '🎉',
    title: '準備完了！',
    body: 'さあ、最初のテストを始めましょう！\nわからないことがあればマイページの「チュートリアル」ボタンでいつでも確認できます。',
  },
];

let tutorialStep = 0;

function openTutorial() {
  tutorialStep = 0;
  renderTutorialStep();
  document.getElementById('tutorial-overlay').classList.remove('hidden');
}

function renderTutorialStep() {
  const step = TUTORIAL_STEPS[tutorialStep];
  const total = TUTORIAL_STEPS.length;
  document.getElementById('tutorial-icon').textContent = step.icon;
  document.getElementById('tutorial-title').textContent = step.title;
  document.getElementById('tutorial-body').innerHTML = step.body.replace(/\n/g, '<br>');
  document.getElementById('tutorial-step-text').textContent = `${tutorialStep + 1} / ${total}`;

  const dots = document.getElementById('tutorial-dots');
  dots.innerHTML = TUTORIAL_STEPS.map((_, i) =>
    `<div class="tutorial-dot${i === tutorialStep ? ' active' : ''}"></div>`
  ).join('');

  const nextBtn = document.getElementById('btn-tutorial-next');
  nextBtn.textContent = tutorialStep === total - 1 ? '始める！' : '次へ →';
}

function nextTutorialStep() {
  if (tutorialStep < TUTORIAL_STEPS.length - 1) {
    tutorialStep++;
    renderTutorialStep();
  } else {
    closeTutorial();
  }
}

function closeTutorial() {
  document.getElementById('tutorial-overlay').classList.add('hidden');
  if (!state.tutorialDone) {
    state.tutorialDone = true;
    saveState();
  }
}

document.getElementById('tutorial-overlay').addEventListener('click', (e) => {
  if (e.target === document.getElementById('tutorial-overlay')) closeTutorial();
});
document.getElementById('btn-tutorial-next').addEventListener('click', nextTutorialStep);
document.getElementById('btn-tutorial-skip').addEventListener('click', closeTutorial);
document.getElementById('btn-tutorial-open').addEventListener('click', openTutorial);

// ===== My Page =====
// マイページで選択中の単語帳ID（currentBookと独立）
let mypageBookId = null;

function openMyPage() {
  document.getElementById('profile-name-text').textContent = userName;
  document.getElementById('profile-email').textContent = '';
  const idTextEl = document.getElementById('profile-id-text');
  if (idTextEl) idTextEl.textContent = userId || '—';
  document.getElementById('profile-name-display').classList.remove('hidden');
  document.getElementById('profile-name-edit').classList.add('hidden');

  // 初期選択: currentBook があればそれ、なければ最初のBOOK
  if (!mypageBookId) {
    mypageBookId = (currentBook || BOOKS[0]).id;
  }

  renderMypageBookTabs();
  renderMypageStats();
  renderMemoList();
  showScreen('screen-mypage');
}

function renderMypageBookTabs() {
  const tabBar = document.getElementById('mypage-book-tabs');
  tabBar.innerHTML = '';
  BOOKS.forEach(book => {
    const btn = document.createElement('button');
    btn.className = 'mypage-book-tab' + (book.id === mypageBookId ? ' active' : '');
    btn.textContent = `${book.icon} ${book.name}`;
    btn.addEventListener('click', () => {
      mypageBookId = book.id;
      renderMypageBookTabs();
      renderMypageStats();
    });
    tabBar.appendChild(btn);
  });
}

function renderMypageStats() {
  const book = BOOKS.find(b => b.id === mypageBookId) || BOOKS[0];
  const rec = state.bookRecords[book.id] || {};
  const words = book.words().filter(w => w.japanese);

  let totalAttempts = 0, totalWrongCount = 0, masteredCount = 0;
  words.forEach(w => {
    const r = rec[w.no];
    if (!r) return;
    totalAttempts   += r.attempts   || 0;
    totalWrongCount += r.wrongCount || 0;
    if (r.correct) masteredCount++;
  });
  const totalAnsweredCorrect = totalAttempts - totalWrongCount;
  const accuracy = totalAttempts > 0 ? Math.round((totalAnsweredCorrect / totalAttempts) * 100) : 0;
  const binfo = bookInfo(book, rec);

  // 全単語帳合計の習得語数
  const allMastered = BOOKS.reduce((sum, b) => {
    const br = state.bookRecords[b.id] || {};
    return sum + b.words().filter(w => w.japanese && br[w.no]?.correct).length;
  }, 0);
  const allTotal = BOOKS.reduce((sum, b) => sum + b.words().filter(w => w.japanese).length, 0);

  document.getElementById('effort-grid').innerHTML = `
    <div class="stat-item"><div class="stat-num">${masteredCount}</div><div class="stat-label">${book.name}<br>習得語数</div></div>
    <div class="stat-item"><div class="stat-num">${totalAttempts}</div><div class="stat-label">総回答数</div></div>
    <div class="stat-item"><div class="stat-num">${accuracy}<span style="font-size:1rem">%</span></div><div class="stat-label">正答率</div></div>
    <div class="stat-item" onclick="showHelp('remainWrong', this)"><div class="stat-num">${binfo.remainWrong}<span style="font-size:1rem"> / ${binfo.everWrong}</span></div><div class="stat-label">残りのバツ / これまでのバツ <span class="help-mark">?</span></div></div>
    <div class="stat-item stat-item-wide"><div class="stat-num">${allMastered}<span style="font-size:1rem"> / ${allTotal}</span></div><div class="stat-label">全単語帳 合計習得語数</div></div>
  `;

  // セクション別進捗
  const list = document.getElementById('section-progress-list');
  list.innerHTML = '';
  book.sections.forEach(sec => {
    const info = sectionInfo(book, rec, state.sectionStats[book.id], sec.id);
    const { total, cleared } = info;
    const correct = info.score;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const item = document.createElement('div');
    item.className = 'sp-item';
    item.innerHTML = `
      <div class="sp-header">
        <span class="sp-label">${sec.label}${cleared ? ' ✅' : ''} ${passBadge(info)} ${roundBadge(info)}</span>
        <span class="sp-pct">${correct} / ${total}（${pct}%）</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar${info.round >= 2 ? ' progress-bar-r2' : ''}" style="width:${pct}%"></div></div>
    `;
    list.appendChild(item);
  });
}

function renderMemoList() {
  const list = document.getElementById('memo-list');
  if (!list) return;
  const memos = state.memos || {};
  const entries = Object.entries(memos).filter(([, v]) => v && v.length > 0);
  if (entries.length === 0) {
    list.innerHTML = '<p class="empty-memo">まだメモはありません。</p>';
    return;
  }
  entries.sort(([a], [b]) => a.localeCompare(b));
  const allWords = currentBook ? currentBook.words() : [];
  list.innerHTML = entries.map(([no, memo]) => {
    const word = allWords.find(w => w.no === no);
    if (!word) return '';
    return `<div class="memo-list-item">
      <div class="memo-list-word-row">
        <span class="memo-list-word">${word.word}</span>
        <span class="memo-list-ja">${word.japanese}</span>
        <span class="memo-list-no">No.${no}</span>
      </div>
      <div class="memo-list-text">${memo}</div>
    </div>`;
  }).join('');
}

// ===== Stats (学習データ) =====
// 学習データ画面で見ている単語帳（currentBook とは別に持つ）
let statsBookId = null;

function openStats() {
  document.getElementById('stats-username').textContent = userName;
  document.getElementById('streak-num').textContent  = state.streak;
  document.getElementById('streak-best').textContent = state.bestStreak;
  document.getElementById('stats-points').textContent = state.points.toLocaleString();

  renderStreakWeek();

  if (!statsBookId || !BOOKS.find(b => b.id === statsBookId)) {
    statsBookId = (currentBook || BOOKS[0]).id;
  }
  renderStatsBookTabs();
  renderStatsBody();
  showScreen('screen-stats');
}

function renderStatsBookTabs() {
  const tabBar = document.getElementById('stats-book-tabs');
  tabBar.innerHTML = '';
  BOOKS.forEach(book => {
    const btn = document.createElement('button');
    btn.className = 'mypage-book-tab' + (book.id === statsBookId ? ' active' : '');
    btn.textContent = `${book.icon} ${book.name}`;
    btn.addEventListener('click', () => {
      statsBookId = book.id;
      renderStatsBookTabs();
      renderStatsBody();
    });
    tabBar.appendChild(btn);
  });
}

function renderStatsBody() {
  const book = BOOKS.find(b => b.id === statsBookId) || BOOKS[0];
  const rec  = state.bookRecords[book.id] || {};
  const info = bookInfo(book, rec);
  const fcs  = state.fcStats[book.id] || {};
  const todayLog = state.dailyLog[todayKey()] || {};
  const todayBook = todayLog.books?.[book.id] || {};
  const diff = prevDiff(state.dailyLog, book.id);

  // 今日の数字
  document.getElementById('stats-today').innerHTML = `
    <div class="stat-item" onclick="showHelp('today', this)"><div class="stat-num">${todayBook.answered || 0}</div><div class="stat-label">今日解いた数 <span class="help-mark">?</span>${todayBook.answered ? `<br>🔀${todayBook.answeredRandom || 0}・📋${todayBook.answeredSeq || 0}` : ''}</div></div>
    <div class="stat-item" onclick="showHelp('fc', this)"><div class="stat-num">${todayBook.fcCards || 0}</div><div class="stat-label">今日の🃏枚数 <span class="help-mark">?</span></div></div>
    <div class="stat-item" onclick="showHelp('diff', this)"><div class="stat-num">${diffLabel(diff)}</div><div class="stat-label">前回比 <span class="help-mark">?</span></div></div>
  `;

  // 学習の記録
  let totalAttempts = 0, totalWrongAnswers = 0;
  book.words().filter(w => w.japanese).forEach(w => {
    const r = rec[w.no];
    if (!r) return;
    totalAttempts     += r.attempts   || 0;
    totalWrongAnswers += r.wrongCount || 0;
  });
  const totalDays = Object.keys(state.dailyLog).filter(d => {
    const v = state.dailyLog[d];
    return (v?.answered || 0) > 0 || (v?.fcCards || 0) > 0 || (v?.mastered || 0) > 0;
  }).length;
  const allMastered = BOOKS.reduce((sum, b) => sum + bookInfo(b, state.bookRecords[b.id] || {}).correct, 0);
  const allTotal    = BOOKS.reduce((sum, b) => sum + b.words().filter(w => w.japanese).length, 0);

  document.getElementById('stats-effort-grid').innerHTML = `
    <div class="stat-item" onclick="showHelp('total', this)"><div class="stat-num">${info.correct}</div><div class="stat-label">${book.name}<br>習得語数 <span class="help-mark">?</span></div></div>
    <div class="stat-item"><div class="stat-num">${totalDays}</div><div class="stat-label">学習した日数</div></div>
    <div class="stat-item"><div class="stat-num">${totalAttempts}</div><div class="stat-label">累計解答数</div></div>
    <div class="stat-item"><div class="stat-num">${totalAttempts - totalWrongAnswers}</div><div class="stat-label">正解数</div></div>
    <div class="stat-item" onclick="showHelp('everWrong', this)"><div class="stat-num">${info.everWrong}</div><div class="stat-label">これまでのバツ <span class="help-mark">?</span></div></div>
    <div class="stat-item" onclick="showHelp('remainWrong', this)"><div class="stat-num">${info.remainWrong}</div><div class="stat-label">残りのバツ <span class="help-mark">?</span></div></div>
    <div class="stat-item" onclick="showHelp('everLucky', this)"><div class="stat-num">${info.everLucky}</div><div class="stat-label">これまでのマグレ <span class="help-mark">?</span></div></div>
    <div class="stat-item" onclick="showHelp('remainLucky', this)"><div class="stat-num">${info.remainLucky}</div><div class="stat-label">残りのマグレ <span class="help-mark">?</span></div></div>
    <div class="stat-item" onclick="showHelp('fc', this)"><div class="stat-num">${fcs.sessions || 0}<span style="font-size:1rem">回</span></div><div class="stat-label">🃏 フラッシュカード<br>${(fcs.cards || 0)}枚・最後 ${fmtDay(fcs.lastDate)} <span class="help-mark">?</span></div></div>
    <div class="stat-item" onclick="showHelp('fcKnown', this)"><div class="stat-num">${info.fcKnown}</div><div class="stat-label">🃏 わかった語数 <span class="help-mark">?</span></div></div>
    <div class="stat-item stat-item-wide"><div class="stat-num">${allMastered}<span style="font-size:1rem"> / ${allTotal}</span></div><div class="stat-label">全単語帳 合計習得語数</div></div>
  `;

  // セクション表
  document.getElementById('stats-section-table').innerHTML =
    sectionTableHtml(book, rec, state.sectionStats[book.id] || {});

  // 履歴（その単語帳の分だけ）
  renderHistory((state.historyLog || []).filter(h => h.book === book.id), document.getElementById('stats-history'), 'stats');

  // カレンダーとグラフ
  statsCalViewDate = new Date();
  renderCalendarView(state.dailyLog, document.getElementById('stats-calendar'), 'stats');
  renderLineChart(state.dailyLog, document.getElementById('stats-chart'));
}

function renderStreakWeek() {
  const today = new Date();
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];
  let html = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr  = dateKey(d);
    const isToday  = i === 0;
    const studied  = !!state.dailyLog[dateStr];
    const mastered = state.dailyLog[dateStr]?.mastered || 0;
    const dayLabel = isToday ? '今日' : DOW[d.getDay()];
    html += `
      <div class="streak-day">
        <div class="streak-day-label${isToday ? ' today-label' : ''}">${dayLabel}</div>
        <div class="streak-day-date">${d.getMonth()+1}/${d.getDate()}</div>
        <div class="streak-circle${studied ? ' studied' : ''}">${studied ? '✓' : ''}</div>
        <div class="streak-day-count">${mastered > 0 ? mastered : ''}</div>
      </div>`;
  }
  document.getElementById('streak-week').innerHTML = html;
}

async function saveName() {
  const newName = document.getElementById('edit-name-input').value.trim();
  if (!newName) return;
  const btn = document.getElementById('btn-save-name');
  btn.textContent = '保存中...';
  btn.disabled = true;
  try {
    await db.collection('users').doc(currentUser.uid).update({ name: newName });
    userName = newName;
    document.getElementById('home-username').textContent = userName;
    document.getElementById('bookpicker-username').textContent = userName;
    document.getElementById('admin-teacher-name').textContent = `講師: ${userName}`;
    document.getElementById('profile-name-text').textContent = userName;
    document.getElementById('profile-name-display').classList.remove('hidden');
    document.getElementById('profile-name-edit').classList.add('hidden');
  } catch (e) {
    alert('保存に失敗しました: ' + e.message);
  } finally {
    btn.textContent = '保存';
    btn.disabled = false;
  }
}

// ===== Report / Feedback =====
let reportContext = null;

function openReport(context) {
  reportContext = context || null;
  const isQuiz = reportContext !== null;

  document.getElementById('report-message').value = '';
  document.getElementById('report-char-count').textContent = '0文字（20文字以上必要）';
  document.getElementById('report-char-count').className = 'report-char-count';
  document.getElementById('report-error').classList.add('hidden');

  document.getElementById('report-quiz-options').classList.toggle('hidden', !isQuiz);
  document.getElementById('report-type-group').classList.toggle('hidden', isQuiz);

  if (isQuiz) {
    document.querySelectorAll('input[name="quiz-report-type"]').forEach((r, i) => { r.checked = i === 0; });
    document.getElementById('report-message').classList.add('hidden');
    document.getElementById('report-char-count').classList.add('hidden');
    document.getElementById('btn-submit-report').disabled = false;
  } else {
    document.querySelectorAll('.report-type-btn').forEach((b, i) => b.classList.toggle('active', i === 0));
    document.getElementById('report-message').classList.remove('hidden');
    document.getElementById('report-char-count').classList.remove('hidden');
    document.getElementById('btn-submit-report').disabled = true;
    document.getElementById('report-message').focus();
  }

  const ctxEl = document.getElementById('report-context');
  if (context) {
    ctxEl.textContent = `対象: No.${context.wordNo}  ${context.word} = ${context.japanese}`;
    ctxEl.classList.remove('hidden');
  } else {
    ctxEl.classList.add('hidden');
  }
  document.getElementById('report-modal').classList.remove('hidden');
}

function closeReport() {
  document.getElementById('report-modal').classList.add('hidden');
  reportContext = null;
}

async function submitReport() {
  const isQuiz = reportContext !== null;
  let type, message;

  if (isQuiz) {
    const checked = document.querySelector('input[name="quiz-report-type"]:checked');
    type = checked?.value || 'word_error';
    message = type === 'other' ? document.getElementById('report-message').value.trim() : '';
    if (type === 'other' && message.length < 20) return;
  } else {
    message = document.getElementById('report-message').value.trim();
    if (message.length < 20) return;
    const activeType = document.querySelector('.report-type-btn.active');
    type = activeType?.dataset.type || 'other';
  }

  const btn = document.getElementById('btn-submit-report');
  btn.textContent = '送信中...';
  btn.disabled = true;
  try {
    await db.collection('reports').add({
      type, message,
      wordNo:   reportContext?.wordNo   || null,
      word:     reportContext?.word     || null,
      japanese: reportContext?.japanese || null,
      bookId:   currentBook?.id        || null,
      userId:   currentUser.uid,
      userName: userName,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    closeReport();
    alert('ご報告ありがとうございます！');
  } catch (e) {
    const errEl = document.getElementById('report-error');
    errEl.textContent = '送信に失敗しました: ' + e.message;
    errEl.classList.remove('hidden');
    btn.disabled = false;
  } finally {
    btn.textContent = '送信';
  }
}

document.getElementById('report-quiz-options').addEventListener('change', (e) => {
  if (e.target.type !== 'radio') return;
  const isOther = e.target.value === 'other';
  document.getElementById('report-message').classList.toggle('hidden', !isOther);
  document.getElementById('report-char-count').classList.toggle('hidden', !isOther);
  if (isOther) {
    const len = document.getElementById('report-message').value.trim().length;
    document.getElementById('btn-submit-report').disabled = len < 20;
    document.getElementById('report-message').focus();
  } else {
    document.getElementById('btn-submit-report').disabled = false;
  }
});

document.getElementById('report-type-group').addEventListener('click', (e) => {
  const btn = e.target.closest('.report-type-btn');
  if (!btn) return;
  document.querySelectorAll('.report-type-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
});

document.getElementById('report-message').addEventListener('input', (e) => {
  const len = e.target.value.trim().length;
  const countEl = document.getElementById('report-char-count');
  countEl.textContent = len < 20 ? `${len}文字（20文字以上必要）` : `${len}文字 ✓`;
  countEl.className   = 'report-char-count' + (len >= 20 ? ' valid' : '');
  const isQuizOther = reportContext !== null &&
    document.querySelector('input[name="quiz-report-type"]:checked')?.value === 'other';
  if (reportContext === null || isQuizOther) {
    document.getElementById('btn-submit-report').disabled = len < 20;
  }
});

document.getElementById('report-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('report-modal')) closeReport();
});
document.getElementById('btn-close-report').addEventListener('click',  closeReport);
document.getElementById('btn-cancel-report').addEventListener('click', closeReport);
document.getElementById('btn-submit-report').addEventListener('click', submitReport);

document.getElementById('btn-report-quiz').addEventListener('click', () => {
  const ctx = quiz.current
    ? { wordNo: quiz.current.no, word: quiz.current.word, japanese: quiz.current.japanese }
    : null;
  openReport(ctx);
});
document.getElementById('btn-report-general').addEventListener('click', () => openReport(null));

// ===== Admin =====
async function loadAdminData() {
  const wrap = document.getElementById('admin-table-wrap');
  wrap.innerHTML = '<p class="loading-text">データを読み込み中...</p>';
  document.getElementById('admin-stats-bar').innerHTML = '';

  try {
    const snapshot = await db.collection('users').where('role', '==', 'student').get();
    const students = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    students.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'));

    adminStudentsAll = students;
    adminStudentsMap = {};
    students.forEach(s => { adminStudentsMap[s.uid] = s; });

    renderAdminBookTabs();
    renderAdminStudents();
  } catch (e) {
    wrap.innerHTML = `<p style="color:red;padding:16px">読み込みエラー: ${e.message}<br>Firestoreのルール設定を確認してください。</p>`;
  }
}

// 生徒データから指定単語帳のrecordsを取得（マイグレーション考慮）
function getStudentBookRecords(student, bookId) {
  if (bookId === 'ex') {
    // records_exがあればそれを使い、なければrecords（旧形式）にフォールバック
    return student.records_ex || student.records || {};
  }
  return student[`records_${bookId}`] || {};
}
function getStudentSecStats(student, bookId) { return student[`sections_${bookId}`] || {}; }
function getStudentFcStats(student, bookId)  { return student[`fc_${bookId}`] || {}; }

// その単語帳に記録があるか（テストを1問でも解いた、またはフラッシュカードを1枚でもめくった）
function hasBookActivity(student, bookId) {
  const rec = getStudentBookRecords(student, bookId);
  if (Object.values(rec).some(r => hasAnswered(r) || r?.fcUnknown !== undefined)) return true;
  return (getStudentFcStats(student, bookId).cards || 0) > 0;
}
// 先生が手で付けた表示の印：'show'（追加）／'hide'（外す）／''（なし）
function bookVisibility(student, bookId) { return student.bookVisibility?.[bookId] || ''; }
function isShownInBook(student, bookId) {
  const v = bookVisibility(student, bookId);
  if (v === 'hide') return false;
  if (v === 'show') return true;
  return hasBookActivity(student, bookId);
}

// 生徒一覧の1行ぶんの数字をまとめる
function buildStudentRow(student, book) {
  const records  = getStudentBookRecords(student, book.id);
  const secStats = getStudentSecStats(student, book.id);
  const fcs      = getStudentFcStats(student, book.id);
  const sections = book.sections.map(sec => sectionInfo(book, records, secStats, sec.id));
  const info     = bookInfo(book, records);
  const todayLog = student.dailyLog?.[todayKey()]?.books?.[book.id] || {};
  return {
    student, sections, info, fcs,
    todayAnswered: todayLog.answered || 0,
    diff:      prevDiff(student.dailyLog || {}, book.id),
    updatedAt: student.updatedAt?.toDate ? student.updatedAt.toDate() : null,
    active:    hasBookActivity(student, book.id),
    vis:       bookVisibility(student, book.id),
    shown:     isShownInBook(student, book.id),
    archived:  student.archived === true,
    passTotal:  sections.reduce((sum, x) => sum + x.passCount, 0),
    passRandom: sections.reduce((sum, x) => sum + x.passRandom, 0),
    passSeq:    sections.reduce((sum, x) => sum + x.passSeq, 0),
    passLegacy: sections.reduce((sum, x) => sum + x.passLegacy, 0),
    seqFull:    sections.reduce((sum, x) => sum + x.seqFull, 0),
    todayRandom: todayLog.answeredRandom || 0,
    todaySeq:    todayLog.answeredSeq || 0,
  };
}

function sortValue(row, key) {
  if (key === 'name')        return row.student.name || '';
  if (key === 'id')          return row.student.userId || '';
  if (key.startsWith('sec:')) {
    const idx = Number(key.slice(4));
    const s = row.sections[idx];
    return s ? s.score + s.passCount * 1000 : 0; // 合格回数が多いほど上
  }
  if (key === 'total')       return row.info.correct;
  if (key === 'passTotal')   return row.passTotal;
  if (key === 'passRandom')  return row.passRandom;
  if (key === 'today')       return row.todayAnswered;
  if (key === 'everWrong')   return row.info.everWrong;
  if (key === 'remainWrong') return row.info.remainWrong;
  if (key === 'everLucky')   return row.info.everLucky;
  if (key === 'remainLucky') return row.info.remainLucky;
  if (key === 'fc')          return row.fcs.cards || 0;
  if (key === 'updated')     return row.updatedAt ? row.updatedAt.getTime() : 0;
  return 0;
}

function adminSort(key, dir) {
  if (dir) {
    adminView.sortKey = key; adminView.sortDir = dir;
  } else if (adminView.sortKey === key) {
    adminView.sortDir = -adminView.sortDir;
  } else {
    adminView.sortKey = key; adminView.sortDir = (key === 'name' || key === 'id') ? 1 : -1;
  }
  closeHelp();
  renderAdminStudents();
}

function renderAdminStudents() {
  const book = BOOKS.find(b => b.id === adminBookId) || BOOKS[0];
  let rows = adminStudentsAll.map(s => buildStudentRow(s, book));

  const archivedCount = rows.filter(r => r.archived).length;
  const activeRows    = rows.filter(r => !r.archived);
  const today = new Date().toLocaleDateString('ja-JP');
  document.getElementById('admin-stats-bar').innerHTML = `
    <div class="stat-item"><div class="stat-num">${activeRows.length}</div><div class="stat-label">在籍生徒数</div></div>
    <div class="stat-item"><div class="stat-num">${activeRows.filter(r => r.updatedAt && r.updatedAt.toLocaleDateString('ja-JP') === today).length}</div><div class="stat-label">本日学習</div></div>
    <div class="stat-item"><div class="stat-num">${activeRows.filter(r => r.info.total > 0 && r.info.correct === r.info.total).length}</div><div class="stat-label">${book.name}<br>全問制覇</div></div>
    <div class="stat-item"><div class="stat-num">${archivedCount}</div><div class="stat-label">📦 アーカイブ</div></div>
  `;

  // 在籍中／アーカイブ／全員
  rows = rows.filter(r => adminView.archive === 'all' ? true : adminView.archive === 'archived' ? r.archived : !r.archived);
  // 検索
  const q = adminView.query;
  if (q) rows = rows.filter(r => (r.student.name || '').toLowerCase().includes(q) || (r.student.userId || '').toLowerCase().includes(q));
  // その単語帳をやっていない生徒は、スイッチを入れたときだけ出す
  const hiddenCount = rows.filter(r => !r.shown).length;
  if (!adminView.showInactive) rows = rows.filter(r => r.shown);
  // 並べ替え
  const key = adminView.sortKey, dir = adminView.sortDir;
  rows.sort((a, b) => {
    const va = sortValue(a, key), vb = sortValue(b, key);
    const c = typeof va === 'string' ? va.localeCompare(vb, 'ja') : va - vb;
    return c !== 0 ? c * dir : (a.student.name || '').localeCompare(b.student.name || '', 'ja');
  });

  const note = document.getElementById('admin-hidden-note');
  if (note) {
    note.textContent = adminView.showInactive
      ? `${book.name}をやっていない生徒 ${hiddenCount} 人も表示中`
      : (hiddenCount > 0 ? `${book.name}をやっていない生徒 ${hiddenCount} 人は隠しています` : '');
  }
  renderAdminTable(rows, book);
}

function isCleared(records, book) {
  if (!records || !book) return false;
  return book.words().filter(w => w.japanese).every(w => records[w.no]?.correct);
}

function calcSectionProgress(records, sectionId, book) {
  const words   = book.words().filter(w => w.section === sectionId && w.japanese);
  const correct = words.filter(w => records?.[w.no]?.correct).length;
  return { correct, total: words.length };
}

function renderAdminBookTabs() {
  const existing = document.getElementById('admin-book-tab-bar');
  if (existing) return; // 既に存在する場合はスキップ

  const toolbar = document.querySelector('#admin-panel-students .admin-toolbar');
  if (!toolbar) return;

  const tabBar = document.createElement('div');
  tabBar.id = 'admin-book-tab-bar';
  tabBar.className = 'admin-book-tab-bar';
  BOOKS.forEach(book => {
    const btn = document.createElement('button');
    btn.className = 'admin-book-tab-btn' + (book.id === adminBookId ? ' active' : '');
    btn.textContent = `${book.icon} ${book.name}`;
    btn.addEventListener('click', () => {
      adminBookId = book.id;
      document.querySelectorAll('#admin-book-tab-bar .admin-book-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAdminStudents();
    });
    tabBar.appendChild(btn);
  });
  toolbar.parentNode.insertBefore(tabBar, toolbar);
}

// 列の見出し：タップで説明（並べ替えもそこから）
function thHelp(key, label, cls) {
  const sorted = adminView.sortKey === key;
  const arrow  = sorted ? (adminView.sortDir > 0 ? ' ▲' : ' ▼') : '';
  return `<th class="${cls} th-help${sorted ? ' th-sorted' : ''}" onclick="showHelp('${key}', this, {sortKey:'${key}'})">${label}${arrow}</th>`;
}

function renderAdminTable(rows, book) {
  const wrap = document.getElementById('admin-table-wrap');
  if (rows.length === 0) {
    wrap.innerHTML = '<p class="loading-text">表示する生徒がいません。</p>';
    return;
  }
  const totalWords = book.words().filter(w => w.japanese).length;

  let html = `
    <div class="admin-table-scroll">
    <table class="admin-table">
      <thead>
        <tr>
          ${thHelp('name', '氏名', 'col-name')}
          ${thHelp('id', 'ID', 'col-id')}
          ${book.sections.map((s, i) => thHelp(`sec:${i}`, s.label.replace('テスト ', 'T').replace(/^(2級)?パス単 /, 'P'), 'col-sec')).join('')}
          ${thHelp('total', '合計', 'col-total')}
          ${thHelp('passTotal', '🏆<br>合格', 'col-pass')}
          ${thHelp('today', '今日', 'col-today')}
          ${thHelp('everWrong', 'これまでの<br>バツ', 'col-wrong')}
          ${thHelp('remainWrong', '残りの<br>バツ', 'col-wrong')}
          ${thHelp('everLucky', 'これまでの<br>マグレ', 'col-wrong')}
          ${thHelp('remainLucky', '残りの<br>マグレ', 'col-wrong')}
          ${thHelp('fc', '🃏 フラッシュ<br>カード', 'col-fc')}
          ${thHelp('updated', '最終更新', 'col-update')}
          <th class="col-action">操作</th>
        </tr>
      </thead>
      <tbody>
  `;

  rows.forEach(row => {
    const { student, info, fcs } = row;
    const totalPct  = totalWords > 0 ? Math.round((info.correct / totalWords) * 100) : 0;
    const updatedAt = row.updatedAt ? row.updatedAt.toLocaleDateString('ja-JP') : '—';
    const rowCls = (row.archived ? ' row-archived' : '') + (!row.shown ? ' row-hidden' : '');
    const tag = row.archived ? '<span class="row-tag">📦 アーカイブ</span>'
              : row.vis === 'hide' ? '<span class="row-tag">➖ 外した生徒</span>'
              : row.vis === 'show' ? '<span class="row-tag">➕ 手で追加</span>'
              : !row.active ? '<span class="row-tag">記録なし</span>' : '';

    html += `<tr class="${rowCls.trim()}">
      <td class="col-name col-name-link" onclick="openUserDetail('${student.uid}','student')"><strong>${student.name || '—'}</strong>${tag}</td>
      <td class="col-id">${student.userId || '—'}</td>
    `;

    row.sections.forEach(sec => {
      html += `<td class="col-sec ${sectionCellClass(sec)}">${scoreHtml(sec)}
        ${sec.passCount > 0 || sec.round >= 2 || sec.seqFull > 0 ? `<div class="cell-badges">${passBadge(sec)} ${roundBadge(sec)}</div>` : ''}</td>`;
    });

    const fcCell = (fcs.cards || 0) > 0
      ? `${fcs.sessions || 0}回<br><small>わかった ${info.fcKnown}語</small><br><small>${fmtDay(fcs.lastDate)}</small>`
      : (info.fcKnown > 0 ? `—<br><small>わかった ${info.fcKnown}語</small>` : '—');

    html += `
      <td class="col-total">
        <div class="total-pct">${totalPct}%</div>
        <small>${info.correct}/${totalWords}</small><br>
        <small>前回比 ${diffLabel(row.diff)}</small>
      </td>
      <td class="col-pass">${row.passTotal > 0 ? `🏆${row.passTotal}` : '—'}
        ${row.passRandom || row.passSeq ? `<br><small>🔀${row.passRandom}・📋${row.passSeq}${row.passLegacy ? `・記録前${row.passLegacy}` : ''}</small>` : ''}
        ${row.seqFull ? `<br><small class="seqfull-badge">📋満点×${row.seqFull}</small>` : ''}</td>
      <td class="col-today">${row.todayAnswered > 0 ? `${row.todayAnswered}問` : '—'}
        ${row.todayRandom || row.todaySeq ? `<br><small>🔀${row.todayRandom}・📋${row.todaySeq}</small>` : ''}</td>
      <td class="col-wrong">${info.everWrong > 0 ? `⭐${info.everWrong}` : '—'}</td>
      <td class="col-wrong ${info.remainWrong > 0 ? 'cell-low' : ''}">${info.remainWrong > 0 ? `⭐${info.remainWrong}` : '—'}</td>
      <td class="col-wrong">${info.everLucky > 0 ? `🔺${info.everLucky}` : '—'}</td>
      <td class="col-wrong ${info.remainLucky > 0 ? 'cell-mid' : ''}">${info.remainLucky > 0 ? `🔺${info.remainLucky}` : '—'}</td>
      <td class="col-fc">${fcCell}</td>
      <td class="col-update">${updatedAt}</td>
      <td class="col-action">
        ${row.archived
          ? `<button class="btn btn-restore btn-xsmall" onclick="restoreStudent('${student.uid}')">↩ 在籍中に戻す</button>`
          : `<button class="btn btn-promote btn-xsmall" onclick="promoteToTeacher('${student.uid}')">🏫 教師に昇格</button>
             ${row.vis === 'hide'
               ? `<button class="btn btn-vis btn-xsmall" onclick="setBookVisibility('${student.uid}','')">➕ この単語帳に戻す</button>`
               : row.vis === 'show'
               ? `<button class="btn btn-vis btn-xsmall" onclick="setBookVisibility('${student.uid}','')">➖ 手で追加を取り消す</button>`
               : row.active
               ? `<button class="btn btn-vis btn-xsmall" onclick="setBookVisibility('${student.uid}','hide')">➖ この単語帳から外す</button>`
               : `<button class="btn btn-vis btn-xsmall" onclick="setBookVisibility('${student.uid}','show')">➕ この単語帳に追加</button>`}
             <button class="btn btn-archive btn-xsmall" onclick="archiveStudent('${student.uid}')">🗑 削除</button>`}
      </td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  wrap.innerHTML = html;
}

// 先生が手で「この単語帳に追加／から外す」
async function setBookVisibility(uid, value) {
  const student = adminStudentsMap[uid];
  if (!student) return;
  const book = BOOKS.find(b => b.id === adminBookId) || BOOKS[0];
  const vis = { ...(student.bookVisibility || {}) };
  if (value) vis[book.id] = value; else delete vis[book.id];
  try {
    await db.collection('users').doc(uid).set({ bookVisibility: vis }, { merge: true });
    student.bookVisibility = vis;
    renderAdminStudents();
  } catch (e) {
    alert(`エラー: ${e.message}`);
  }
}

// 生徒の削除（アーカイブ）。学習データは消さない
async function archiveStudent(uid) {
  const student = adminStudentsMap[uid];
  if (!student) return;
  const ok = confirm(`「${student.name}」さんを削除（アーカイブ）しますか？\n\n・生徒一覧から外れます\n・この生徒はログインできなくなります\n・学習データは残り、「📦 アーカイブ」表示でいつでも見られます\n・間違えたときは「在籍中に戻す」で元に戻せます`);
  if (!ok) return;
  try {
    await db.collection('users').doc(uid).set({
      archived: true,
      archivedAt: firebase.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });
    student.archived = true;
    renderAdminStudents();
  } catch (e) {
    alert(`エラー: ${e.message}`);
  }
}

async function restoreStudent(uid) {
  const student = adminStudentsMap[uid];
  if (!student) return;
  if (!confirm(`「${student.name}」さんを在籍中に戻しますか？\n（生徒一覧に戻り、ログインもできるようになります）`)) return;
  try {
    await db.collection('users').doc(uid).set({ archived: false, archivedAt: null }, { merge: true });
    student.archived = false;
    renderAdminStudents();
  } catch (e) {
    alert(`エラー: ${e.message}`);
  }
}

// ===== Student Detail Modal =====
let adminCalViewDate = new Date();
let statsCalViewDate = new Date();
let detailTab = 'calendar';

function getDetailUser() {
  const map = currentDetailType === 'teacher' ? adminTeachersMap : adminStudentsMap;
  return map[currentDetailUid] || null;
}

function openUserDetail(uid, userType) {
  currentDetailType = (userType === 'teacher') ? 'teacher' : 'student';
  const map = currentDetailType === 'teacher' ? adminTeachersMap : adminStudentsMap;
  const user = map[uid];
  if (!user) return;
  currentDetailUid = uid;
  adminCalViewDate  = new Date();

  const rolePrefix = currentDetailType === 'teacher' ? '🏫 ' : (user.archived ? '📦 ' : '');
  document.getElementById('detail-student-name').textContent = rolePrefix + (user.name || '—');

  document.getElementById('detail-student-id').textContent = user.userId || '—';
  const pwEl = document.getElementById('detail-student-pw');
  pwEl.textContent = '●●●●●●';
  pwEl.dataset.pw = user.password || '（未登録）';
  pwEl.dataset.visible = 'false';
  document.getElementById('btn-pw-toggle').textContent = '表示';

  renderDetailTab('calendar');
  document.getElementById('student-detail-modal').classList.remove('hidden');
}

function renderDetailTab(tab) {
  const user = getDetailUser();
  if (!user) return;
  detailTab = tab;
  document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  const body = document.getElementById('detail-body');
  body.innerHTML = '';
  if (tab === 'calendar')      renderCalendarView(user.dailyLog || {}, body, 'detail');
  else if (tab === 'chart')    renderLineChart(user.dailyLog || {}, body);
  else if (tab === 'history')  renderHistory(user.history_log || [], body, 'detail');
  else                         renderUserProgress(user, body);
}

// 生徒の詳しい画面：単語帳ごとのセクション表
function renderUserProgress(user, container) {
  let html = '';
  BOOKS.forEach(book => {
    const records = getStudentBookRecords(user, book.id);
    if (!hasBookActivity(user, book.id)) return;
    html += `<div class="detail-book-title">${book.icon} ${book.name}</div>`;
    html += sectionTableHtml(book, records, getStudentSecStats(user, book.id), { compact: true });
  });
  container.innerHTML = html || '<p class="detail-empty">まだ学習データがありません。</p>';
}

// セクション表（生徒の学習データ画面と、管理画面の生徒の詳しい画面で共用）
function sectionTableHtml(book, records, secStats, opts = {}) {
  const rows = book.sections.map(sec => ({ sec, info: sectionInfo(book, records, secStats, sec.id) }));
  const th = (key, label) => `<th class="th-help" onclick="showHelp('${key}', this)">${label}</th>`;
  let html = `<div class="sec-table-scroll"><table class="sec-table">
    <thead><tr>
      <th>範囲</th>
      ${th('score', '本番の点数')}
      ${th('everWrong', 'これまで<br>のバツ')}
      ${th('remainWrong', '残りの<br>バツ')}
      ${th('everLucky', 'これまで<br>のマグレ')}
      ${th('remainLucky', '残りの<br>マグレ')}
      ${th('fcKnown', '🃏わかった')}
    </tr></thead><tbody>`;
  rows.forEach(({ sec, info }) => {
    html += `<tr>
      <td class="st-label">${sec.label}<br><small>${sec.range}</small></td>
      <td class="st-score ${sectionCellClass(info)}">${scoreHtml(info)}
        ${info.passCount > 0 || info.round >= 2 || info.seqFull > 0 ? `<div class="cell-badges">${passBadge(info)} ${roundBadge(info)}</div>` : ''}</td>
      <td>${info.everWrong || '—'}</td>
      <td class="${info.remainWrong > 0 ? 'cell-low' : ''}">${info.remainWrong || '—'}</td>
      <td>${info.everLucky || '—'}</td>
      <td class="${info.remainLucky > 0 ? 'cell-mid' : ''}">${info.remainLucky || '—'}</td>
      <td>${info.fcKnown || '—'}</td>
    </tr>`;
  });
  html += '</tbody></table></div>';
  return html;
}

// テストの履歴。filter: 'all' | 'random' | 'sequential'
let historyFilter = { detail: 'all', stats: 'all' };
let historyLogs   = { detail: [], stats: [] };
const HISTORY_STATUS = {
  pass:      '🏆 合格',
  seqFull:   '満点（順番通りのため合格に数えない）',
  done:      '最後まで解いた',
  paused:    '途中でやめた（続きから解ける）',
  pausedResumed: '途中でやめた（あとで続きから解いた）',
  abandoned: '途中でやめた（続きは解かずにやり直したので点数なし）',
};
function bookShortName(bookId) { return (BOOKS.find(b => b.id === bookId) || {}).name || bookId; }
function sectionLabel(bookId, secId) {
  if (secId === '__all__') return '全セクション';
  const book = BOOKS.find(b => b.id === bookId);
  return (book?.sections.find(x => x.id === secId) || {}).label || secId;
}
function renderHistory(log, container, target) {
  historyLogs[target] = log || [];
  const f = historyFilter[target];
  const list = historyLogs[target].filter(h => f === 'all' || (h.order || 'random') === f);
  const chips = ['all', 'random', 'sequential'].map(k =>
    `<button class="chip${f === k ? ' active' : ''}" onclick="setHistoryFilter('${target}','${k}')">${k === 'all' ? 'すべて' : orderName(k)}</button>`).join('');
  let html = `<div class="history-head"><div class="filter-chips">${chips}</div>
    <span class="help-mark" onclick="showHelp('history', this)">?</span></div>`;
  if (list.length === 0) {
    html += '<p class="detail-empty">履歴はまだありません。（2026年10月22日から記録しています）</p>';
  } else {
    html += '<div class="history-list">' + list.map(h => {
      const d = new Date(h.at);
      const when = `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
      const isNormal = h.mode === 'normal';
      const cls = h.status === 'pass' ? ' h-pass' : h.status === 'seqFull' ? ' h-seqfull' : ['paused', 'pausedResumed', 'abandoned'].includes(h.status) ? ' h-quit' : '';
      return `<div class="history-item${isNormal ? ' h-normal' : ''}${cls}">
        <div class="h-top"><span class="h-when">${when}</span>
          <span class="h-what">${bookShortName(h.book)}・${sectionLabel(h.book, h.sec)}</span></div>
        <div class="h-mid">${MODE_NAMES[h.mode] || h.mode}${isNormal && h.round ? ` ${h.round}周目` : ''}　${orderIcon(h.order)}
          ${isNormal ? `<strong>${h.correct}/${h.total}</strong>` : `${h.answered}問中 ${h.correct}正解`}
          ${isNormal && ['paused', 'pausedResumed', 'abandoned'].includes(h.status) ? `<span class="h-sub">（${h.answered}/${h.total}問まで。点数は途中まで）</span>` : ''}</div>
        <div class="h-status">${HISTORY_STATUS[h.status] || ''}${h.resumed ? `・続きから${h.resumed}回` : ''}</div>
      </div>`;
    }).join('') + '</div>';
  }
  container.innerHTML = html;
}
function setHistoryFilter(target, f) {
  historyFilter[target] = f;
  const el = target === 'detail' ? document.getElementById('detail-body') : document.getElementById('stats-history');
  renderHistory(historyLogs[target], el, target);
}

// 後方互換
function openStudentDetail(uid) { openUserDetail(uid, 'student'); }

function toggleDetailPw() {
  const pwEl  = document.getElementById('detail-student-pw');
  const btnEl = document.getElementById('btn-pw-toggle');
  if (pwEl.dataset.visible === 'true') {
    pwEl.textContent = '●●●●●●';
    pwEl.dataset.visible = 'false';
    btnEl.textContent = '表示';
  } else {
    pwEl.textContent = pwEl.dataset.pw;
    pwEl.dataset.visible = 'true';
    btnEl.textContent = '隠す';
  }
}

// カレンダーの月送り。target: 'detail'（管理画面）／'stats'（生徒の学習データ）
function calNavMonth(delta, target = 'detail') {
  if (target === 'stats') {
    statsCalViewDate.setMonth(statsCalViewDate.getMonth() + delta);
    renderCalendarView(state.dailyLog, document.getElementById('stats-calendar'), 'stats');
    return;
  }
  adminCalViewDate.setMonth(adminCalViewDate.getMonth() + delta);
  const user = getDetailUser();
  if (user) renderCalendarView(user.dailyLog || {}, document.getElementById('detail-body'), 'detail');
}

function renderCalendarView(dailyLog, container, target = 'detail') {
  const viewDate = target === 'stats' ? statsCalViewDate : adminCalViewDate;
  const year  = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const todayStr = todayKey();

  const firstDow = new Date(year, month, 1).getDay();
  const lastDay  = new Date(year, month + 1, 0).getDate();

  // 色の濃さ：その日の解答数があればそれ、無い日（改修前の記録）は習得語数で
  const dayValue = d => (d?.answered !== undefined ? d.answered : (d?.mastered || 0));
  const values = Object.values(dailyLog).map(dayValue);
  const maxVal = values.length > 0 ? Math.max(...values, 1) : 1;

  const DOW = ['日', '月', '火', '水', '木', '金', '土'];

  let html = '<div class="monthly-cal">';
  html += `
    <div class="monthly-cal-header">
      <button class="cal-nav-btn" onclick="calNavMonth(-1, '${target}')">‹</button>
      <span class="monthly-cal-title">${year}年${month + 1}月</span>
      <button class="cal-nav-btn" onclick="calNavMonth(1, '${target}')">›</button>
    </div>
    <div class="monthly-cal-dow">
      ${DOW.map((d, i) => `<div class="dow-cell${i===0?' dow-sun':i===6?' dow-sat':''}">${d}</div>`).join('')}
    </div>
    <div class="monthly-cal-grid">
  `;

  for (let i = 0; i < firstDow; i++) {
    html += '<div class="mday-cell mday-empty"></div>';
  }

  for (let day = 1; day <= lastDay; day++) {
    const mm  = String(month + 1).padStart(2, '0');
    const dd  = String(day).padStart(2, '0');
    const dateStr = `${year}-${mm}-${dd}`;
    const log     = dailyLog[dateStr];
    const val     = dayValue(log);
    const fcCards = log?.fcCards || 0;
    const isToday  = dateStr === todayStr;
    const dow      = new Date(year, month, day).getDay();
    const studied  = val > 0 || fcCards > 0;
    const level    = val > 0 ? Math.min(4, Math.ceil((val / maxVal) * 4)) : 1;
    const label    = log?.answered !== undefined ? `${log.answered}問` : `${val}`;

    html += `
      <div class="mday-cell${isToday ? ' mday-today' : ''}${dow===0?' mday-sun':dow===6?' mday-sat':''}${studied?' mday-studied':''}">
        <div class="mday-num">${day}</div>
        ${val > 0 ? `<div class="mday-badge cal-lv${level}">${label}</div>` : ''}
        ${fcCards > 0 ? `<div class="mday-fc">🃏${log.fcKnown || 0}</div>` : ''}
      </div>`;
  }

  html += '</div></div>';
  html += `<div class="cal-legend-text" onclick="showHelp('calendar', this)">
    <span class="mday-badge cal-lv3">◯問</span> その日にテストで答えた数（改修前の日は習得語数）
    　<span class="mday-fc">🃏◯</span> フラッシュカードで「わかる」を押した数　<span class="help-mark">?</span></div>`;
  container.innerHTML = html;
}

function renderLineChart(dailyLog, container) {
  let entries = Object.entries(dailyLog)
    .filter(([, v]) => v && v.mastered !== undefined)
    .sort(([a], [b]) => a.localeCompare(b));

  if (entries.length === 0) {
    container.innerHTML = '<p class="detail-empty">学習データがありません。</p>';
    return;
  }
  if (entries.length === 1) {
    entries = [[entries[0][0], { mastered: 0 }], ...entries];
  }

  const W = 320, H = 180;
  const PL = 44, PR = 12, PT = 12, PB = 32;

  const values = entries.map(([, v]) => v.mastered || 0);
  const hasRemain = entries.some(([, v]) => v.remainWrong !== undefined);
  const remainVals = entries.map(([, v]) => v.remainWrong);
  const maxY = Math.max(...values, ...(hasRemain ? remainVals.filter(x => x !== undefined) : []), 10);
  const n = entries.length;

  const xs = i => PL + (i / (n - 1)) * (W - PL - PR);
  const ys = v => PT + (1 - v / maxY) * (H - PT - PB);

  const linePoints = entries.map(([, v], i) => `${xs(i).toFixed(1)},${ys(v.mastered || 0).toFixed(1)}`).join(' ');

  const areaPath = [
    `M${xs(0).toFixed(1)},${ys(values[0]).toFixed(1)}`,
    ...entries.slice(1).map(([, v], i) => `L${xs(i + 1).toFixed(1)},${ys(v.mastered || 0).toFixed(1)}`),
    `L${xs(n - 1).toFixed(1)},${ys(0).toFixed(1)}`,
    `L${xs(0).toFixed(1)},${ys(0).toFixed(1)} Z`,
  ].join(' ');

  // 残りのバツの線（記録がある日だけつなぐ）
  const remainPoints = hasRemain
    ? entries.map(([, v], i) => v.remainWrong === undefined ? null : `${xs(i).toFixed(1)},${ys(v.remainWrong).toFixed(1)}`).filter(Boolean).join(' ')
    : '';
  // これまでの最高（その日までに到達した最高の習得語数。減らない）
  let runMax = 0;
  const maxPoints = entries.map(([, v], i) => { runMax = Math.max(runMax, v.mastered || 0); return `${xs(i).toFixed(1)},${ys(runMax).toFixed(1)}`; }).join(' ');

  const yTicks = [0, Math.round(maxY / 2), maxY];
  const xIdxs = [...new Set([0, Math.floor(n / 2), n - 1])];

  const svg = `<svg viewBox="0 0 ${W} ${H}" class="line-chart-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="${areaPath}" class="chart-area"/>
    <polyline points="${maxPoints}" class="chart-line-max" fill="none"/>
    <polyline points="${linePoints}" class="chart-line" fill="none"/>
    ${entries.map(([, v], i) => `<circle cx="${xs(i).toFixed(1)}" cy="${ys(v.mastered || 0).toFixed(1)}" r="3" class="chart-dot"/>`).join('')}
    ${hasRemain ? `<polyline points="${remainPoints}" class="chart-line-remain" fill="none"/>` : ''}
    <line x1="${PL}" y1="${PT}" x2="${PL}" y2="${H - PB}" class="chart-axis"/>
    <line x1="${PL}" y1="${H - PB}" x2="${W - PR}" y2="${H - PB}" class="chart-axis"/>
    ${yTicks.map(v => `
      <line x1="${PL - 4}" y1="${ys(v).toFixed(1)}" x2="${PL}" y2="${ys(v).toFixed(1)}" class="chart-tick"/>
      <text x="${PL - 6}" y="${(ys(v) + 4).toFixed(1)}" class="chart-label" text-anchor="end">${v}</text>
    `).join('')}
    ${xIdxs.map(i => `<text x="${xs(i).toFixed(1)}" y="${H - PB + 14}" class="chart-label" text-anchor="middle">${entries[i][0].slice(5)}</text>`).join('')}
  </svg>`;

  container.innerHTML = `<div class="chart-wrap">
    <p class="chart-title">習得語数の推移（全単語帳合計）</p>${svg}
    <div class="chart-legend" onclick="showHelp('chart', this)">
      <span class="legend-main">━ 習得語数（本番で今正解になっている語数）</span>
      <span class="legend-max">━ これまでの最高</span>
      ${hasRemain ? '<span class="legend-remain">┅ 残りのバツ</span>' : '<span class="legend-remain legend-nodata">┅ 残りのバツ（10/21から記録）</span>'}
      <span class="help-mark">?</span>
    </div>
  </div>`;
}

function setupAdminSearch() {
  const searchEl = document.getElementById('admin-search');
  searchEl.addEventListener('input', (e) => {
    adminView.query = e.target.value.trim().toLowerCase();
    renderAdminStudents();
  });
  document.querySelectorAll('#admin-archive-chips .chip').forEach(chip => {
    chip.addEventListener('click', () => {
      adminView.archive = chip.dataset.archive;
      document.querySelectorAll('#admin-archive-chips .chip').forEach(c => c.classList.toggle('active', c === chip));
      renderAdminStudents();
    });
  });
  document.getElementById('admin-show-inactive').addEventListener('change', (e) => {
    adminView.showInactive = e.target.checked;
    renderAdminStudents();
  });
}
setupAdminSearch();

document.getElementById('btn-admin-refresh').addEventListener('click', loadAdminData);

// ===== Admin Teachers =====
async function loadAdminTeachersData() {
  const wrap = document.getElementById('admin-teachers-table-wrap');
  wrap.innerHTML = '<p class="loading-text">データを読み込み中...</p>';
  document.getElementById('admin-teachers-stats-bar').innerHTML = '';

  try {
    const snapshot = await db.collection('users').where('role', '==', 'teacher').get();
    const teachers = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    teachers.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'));

    adminTeachersMap = {};
    teachers.forEach(t => { adminTeachersMap[t.uid] = t; });

    const today = new Date().toLocaleDateString('ja-JP');
    document.getElementById('admin-teachers-stats-bar').innerHTML = `
      <div class="stat-item"><div class="stat-num">${teachers.length}</div><div class="stat-label">登録教師数</div></div>
      <div class="stat-item"><div class="stat-num">${teachers.filter(t => t.updatedAt?.toDate && t.updatedAt.toDate().toLocaleDateString('ja-JP') === today).length}</div><div class="stat-label">本日学習</div></div>
    `;

    renderAdminTeacherBookTabs();
    renderAdminTeachersTable(teachers);
    setupAdminTeachersSearch(teachers);
  } catch (e) {
    wrap.innerHTML = `<p style="color:red;padding:16px">読み込みエラー: ${e.message}<br>Firestoreのルール設定を確認してください。</p>`;
  }
}

function renderAdminTeacherBookTabs() {
  const existing = document.getElementById('admin-teacher-book-tab-bar');
  if (existing) existing.remove();

  const toolbar = document.querySelector('#admin-panel-teachers .admin-toolbar');
  if (!toolbar) return;

  const tabBar = document.createElement('div');
  tabBar.id = 'admin-teacher-book-tab-bar';
  tabBar.className = 'admin-book-tab-bar';
  BOOKS.forEach(book => {
    const btn = document.createElement('button');
    btn.className = 'admin-book-tab-btn' + (book.id === adminTeacherBookId ? ' active' : '');
    btn.textContent = `${book.icon} ${book.name}`;
    btn.addEventListener('click', () => {
      adminTeacherBookId = book.id;
      document.querySelectorAll('#admin-teacher-book-tab-bar .admin-book-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAdminTeachersTable(Object.values(adminTeachersMap));
    });
    tabBar.appendChild(btn);
  });
  toolbar.parentNode.insertBefore(tabBar, toolbar);
}

function renderAdminTeachersTable(teachers) {
  const wrap = document.getElementById('admin-teachers-table-wrap');
  if (teachers.length === 0) {
    wrap.innerHTML = '<p class="loading-text">登録教師がいません。</p>';
    return;
  }

  const book = BOOKS.find(b => b.id === adminTeacherBookId) || BOOKS[0];
  const totalWords = book.words().filter(w => w.japanese).length;

  let html = `
    <div class="admin-table-scroll">
    <table class="admin-table">
      <thead>
        <tr>
          <th class="col-name">氏名</th>
          <th class="col-id">ID</th>
          <th class="col-pw">パスワード</th>
          ${book.sections.map(s => `<th class="col-sec">${s.label.replace('テスト ', 'T')}</th>`).join('')}
          <th class="col-total">合計</th>
          <th class="col-wrong">バツ数</th>
          <th class="col-update">最終更新</th>
          <th class="col-action">操作</th>
        </tr>
      </thead>
      <tbody>
  `;

  teachers.forEach(teacher => {
    const records = getStudentBookRecords(teacher, adminTeacherBookId);
    const totalCorrect = book.words().filter(w => w.japanese && records[w.no]?.correct).length;
    const totalWrong   = book.words().filter(w => w.japanese && (records[w.no]?.wrongCount || 0) > 0).length;
    const totalPct     = totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0;
    const updatedAt    = teacher.updatedAt?.toDate ? teacher.updatedAt.toDate().toLocaleDateString('ja-JP') : '—';
    const pwRaw        = teacher.password || '（未登録）';
    const pwEscaped    = String(pwRaw).replace(/"/g, '&quot;');

    html += `<tr>
      <td class="col-name col-name-link" onclick="openUserDetail('${teacher.uid}','teacher')"><strong>${teacher.name || '—'}</strong></td>
      <td class="col-id">${teacher.userId || '—'}</td>
      <td class="col-pw">
        <span class="pw-mask" data-pw="${pwEscaped}" data-visible="false">●●●●●●</span>
        <button class="btn-pw-toggle btn-pw-toggle-inline" onclick="toggleInlinePw(this)">表示</button>
      </td>
    `;

    book.sections.forEach(sec => {
      const { correct, total } = calcSectionProgress(records, sec.id, book);
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const cls = correct === total && total > 0 ? 'cell-perfect'
                : pct >= 80 ? 'cell-good'
                : pct >= 50 ? 'cell-mid'
                : pct > 0   ? 'cell-low'
                : 'cell-none';
      html += `<td class="col-sec ${cls}">${correct}<br><small>/${total}</small></td>`;
    });

    html += `
      <td class="col-total">
        <div class="total-pct">${totalPct}%</div>
        <small>${totalCorrect}/${totalWords}</small>
      </td>
      <td class="col-wrong ${totalWrong > 0 ? 'cell-low' : ''}">${totalWrong > 0 ? `⭐${totalWrong}` : '—'}</td>
      <td class="col-update">${updatedAt}</td>
      <td class="col-action">
        <button class="btn btn-demote btn-xsmall" onclick="demoteToStudent('${teacher.uid}')">👤 生徒に戻す</button>
      </td>
    </tr>`;
  });

  html += '</tbody></table></div>';
  wrap.innerHTML = html;
}

function toggleInlinePw(btnEl) {
  const span = btnEl.parentElement.querySelector('.pw-mask');
  if (!span) return;
  if (span.dataset.visible === 'true') {
    span.textContent = '●●●●●●';
    span.dataset.visible = 'false';
    btnEl.textContent = '表示';
  } else {
    span.textContent = span.dataset.pw || '（未登録）';
    span.dataset.visible = 'true';
    btnEl.textContent = '隠す';
  }
}

function setupAdminTeachersSearch(teachers) {
  const searchEl = document.getElementById('admin-teacher-search');
  const newSearchEl = searchEl.cloneNode(true);
  searchEl.parentNode.replaceChild(newSearchEl, searchEl);
  newSearchEl.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = q ? teachers.filter(t => (t.name || '').toLowerCase().includes(q) || (t.userId || '').toLowerCase().includes(q)) : teachers;
    renderAdminTeachersTable(filtered);
  });
}

document.getElementById('btn-admin-teachers-refresh').addEventListener('click', loadAdminTeachersData);

// 生徒 → 教師 昇格
async function promoteToTeacher(uid) {
  const student = adminStudentsMap[uid];
  if (!student) return;
  if (!confirm(`「${student.name}」さんを教師に昇格しますか？\n（管理画面へのアクセス権限が付与されます）`)) return;
  try {
    await db.collection('users').doc(uid).set({ role: 'teacher' }, { merge: true });
    alert('教師に昇格しました。');
    loadAdminData();
    if (!document.getElementById('admin-panel-teachers').classList.contains('hidden')) {
      loadAdminTeachersData();
    }
  } catch (e) {
    alert(`エラー: ${e.message}`);
  }
}

// 教師 → 生徒 降格
async function demoteToStudent(uid) {
  const teacher = adminTeachersMap[uid];
  if (!teacher) return;
  if (teacher.uid === currentUser?.uid) {
    alert('自分自身を降格させることはできません。');
    return;
  }
  if (!confirm(`「${teacher.name}」さんを生徒に戻しますか？\n（管理画面へのアクセス権限が失われます）`)) return;
  try {
    await db.collection('users').doc(uid).set({ role: 'student' }, { merge: true });
    alert('生徒に戻しました。');
    loadAdminTeachersData();
    if (!document.getElementById('admin-panel-students').classList.contains('hidden')) {
      loadAdminData();
    }
  } catch (e) {
    alert(`エラー: ${e.message}`);
  }
}

// 新規教師アカウント作成（管理者ログイン維持）
document.getElementById('btn-create-teacher').addEventListener('click', async () => {
  const nameEl = document.getElementById('create-teacher-name');
  const idEl   = document.getElementById('create-teacher-id');
  const pwEl   = document.getElementById('create-teacher-password');
  const errEl  = document.getElementById('create-teacher-error');
  const btnEl  = document.getElementById('btn-create-teacher');

  const name     = nameEl.value.trim();
  const tid      = idEl.value.trim();
  const password = pwEl.value;

  errEl.classList.add('hidden');
  if (!name)               { showAuthError(errEl, 'お名前を入力してください。'); return; }
  if (!tid)                { showAuthError(errEl, 'IDを入力してください。'); return; }
  if (password.length < 6) { showAuthError(errEl, 'パスワードは6文字以上で入力してください。'); return; }

  try {
    btnEl.disabled = true;
    btnEl.textContent = '作成中...';

    const secApp  = getSecondaryApp();
    const secAuth = secApp.auth();
    const cred = await secAuth.createUserWithEmailAndPassword(idToEmail(tid), password);
    await db.collection('users').doc(cred.user.uid).set({
      name, userId: tid, password, role: 'teacher',
      records_ex: {}, records_pastan: {},
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await secAuth.signOut();

    nameEl.value = '';
    idEl.value   = '';
    pwEl.value   = '';
    document.getElementById('admin-create-teacher-details').open = false;
    alert(`教師「${name}」を作成しました。`);
    loadAdminTeachersData();
  } catch (e) {
    showAuthError(errEl, authErrorMsg(e.code) || e.message);
  } finally {
    btnEl.disabled = false;
    btnEl.textContent = '作成する';
  }
});

// ===== Admin Tab =====
function switchAdminTab(tab) {
  const tabs = ['students', 'teachers', 'words', 'manual'];
  tabs.forEach(t => {
    document.getElementById(`admin-panel-${t}`).classList.toggle('hidden', t !== tab);
    document.getElementById(`admin-tab-${t}`).classList.toggle('active', t === tab);
  });
  if (tab === 'teachers') {
    loadAdminTeachersData();
  } else if (tab === 'words') {
    renderAdminWordBookTabs();
    updateAdminWordSectionFilter();
    renderAdminWordList();
  } else if (tab === 'manual') {
    document.getElementById('admin-panel-manual').innerHTML = manualHtml('teacher');
  }
}

// ===== Admin Word List =====
let adminWordBookId = 'ex';

function renderAdminWordBookTabs() {
  const tabBar = document.getElementById('admin-word-book-tab-bar');
  tabBar.innerHTML = '';
  BOOKS.forEach(book => {
    const btn = document.createElement('button');
    btn.className = 'admin-book-tab-btn' + (book.id === adminWordBookId ? ' active' : '');
    btn.textContent = `${book.icon} ${book.name}`;
    btn.addEventListener('click', () => {
      adminWordBookId = book.id;
      document.getElementById('admin-word-search').value = '';
      renderAdminWordBookTabs();
      updateAdminWordSectionFilter();
      renderAdminWordList();
    });
    tabBar.appendChild(btn);
  });
}

function updateAdminWordSectionFilter() {
  const book = BOOKS.find(b => b.id === adminWordBookId) || BOOKS[0];
  const sel = document.getElementById('admin-word-section-filter');
  sel.innerHTML = '<option value="">全セクション</option>';
  book.sections.forEach(sec => {
    const opt = document.createElement('option');
    opt.value = sec.id;
    opt.textContent = `${sec.label}（${sec.range}）`;
    sel.appendChild(opt);
  });
}

function renderAdminWordList() {
  const searchVal = (document.getElementById('admin-word-search').value || '').trim().toLowerCase();
  const sectionFilter = document.getElementById('admin-word-section-filter').value;

  const adminBook = BOOKS.find(b => b.id === adminWordBookId) || BOOKS[0];
  const allWords = adminBook.words();

  const filtered = allWords.filter(w => {
    if (sectionFilter && w.section !== sectionFilter) return false;
    if (searchVal) {
      return w.word.toLowerCase().includes(searchVal) || w.japanese.includes(searchVal) || w.no.includes(searchVal);
    }
    return true;
  });

  document.getElementById('admin-word-count').textContent = `${filtered.length} 語 表示中（全 ${allWords.length} 語）`;

  if (filtered.length === 0) {
    document.getElementById('admin-word-list-wrap').innerHTML = '<p class="loading-text">該当する単語がありません。</p>';
    return;
  }

  const bySection = {};
  filtered.forEach(w => {
    if (!bySection[w.section]) bySection[w.section] = [];
    bySection[w.section].push(w);
  });

  let html = '';
  adminBook.sections.forEach(sec => {
    const words = bySection[sec.id];
    if (!words || words.length === 0) return;
    html += `<div class="word-list-section">
      <div class="word-list-section-header">${sec.label} <span class="word-list-section-range">${sec.range}</span><span class="word-list-section-count">${words.length}語</span></div>
      <table class="word-list-table">
        <thead><tr><th class="wl-no">No.</th><th class="wl-en">英単語</th><th class="wl-ja">日本語訳</th></tr></thead>
        <tbody>`;
    words.forEach(w => {
      html += `<tr><td class="wl-no">${w.no}</td><td class="wl-en">${w.word}</td><td class="wl-ja${w.japanese ? '' : ' wl-ja-empty'}">${w.japanese || '—'}</td></tr>`;
    });
    html += `</tbody></table></div>`;
  });

  document.getElementById('admin-word-list-wrap').innerHTML = html;
}

document.getElementById('admin-word-search').addEventListener('input', renderAdminWordList);
document.getElementById('admin-word-section-filter').addEventListener('change', renderAdminWordList);

// Student detail modal events
document.getElementById('btn-close-detail').addEventListener('click', () => {
  document.getElementById('student-detail-modal').classList.add('hidden');
  currentDetailUid = null;
});
document.querySelectorAll('.detail-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (!currentDetailUid) return;
    renderDetailTab(btn.dataset.tab);
  });
});

// ===== Pronunciation (tap word to speak) =====
document.getElementById('word-display').addEventListener('click', () => {
  if (!quiz.current) return;
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(quiz.current.word);
  utter.lang = 'en-US';
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
  const el = document.getElementById('word-display');
  el.classList.add('word-tap-flash');
  setTimeout(() => el.classList.remove('word-tap-flash'), 300);
});

// ===== Memo functions =====
function toggleMemoEdit(no) {
  const editArea = document.getElementById(`memo-edit-${no}`);
  if (editArea) editArea.classList.toggle('hidden');
}

function saveMemo(no) {
  const textarea = document.getElementById(`memo-text-${no}`);
  if (!textarea) return;
  const text = textarea.value.trim();
  if (!state.memos) state.memos = {};
  if (text) {
    state.memos[no] = text;
  } else {
    delete state.memos[no];
  }
  saveState();

  const displayEl = document.getElementById(`memo-display-${no}`);
  const toggleBtn = document.getElementById(`memo-toggle-btn-${no}`);
  if (displayEl) {
    if (text) {
      displayEl.textContent = text;
      displayEl.classList.remove('hidden');
    } else {
      displayEl.classList.add('hidden');
    }
  }
  if (toggleBtn) {
    toggleBtn.textContent = text ? '✏️ メモを編集' : '📝 メモを追加';
  }
  const editArea = document.getElementById(`memo-edit-${no}`);
  if (editArea) editArea.classList.add('hidden');
}

// ===== Navigation =====
document.getElementById('btn-back-mypage').addEventListener('click', () => {
  if (currentBook) { renderHome(); showScreen('screen-home'); }
  else { renderBookPicker(); showScreen('screen-bookpicker'); }
});
document.getElementById('btn-edit-name').addEventListener('click', () => {
  document.getElementById('edit-name-input').value = userName;
  document.getElementById('profile-name-display').classList.add('hidden');
  document.getElementById('profile-name-edit').classList.remove('hidden');
  document.getElementById('edit-name-input').focus();
});
document.getElementById('btn-cancel-name').addEventListener('click', () => {
  document.getElementById('profile-name-display').classList.remove('hidden');
  document.getElementById('profile-name-edit').classList.add('hidden');
});
document.getElementById('btn-save-name').addEventListener('click', saveName);

// ===== Self ID Change =====
function openEditIdModal() {
  document.getElementById('edit-id-new').value = '';
  document.getElementById('edit-id-password').value = '';
  const errEl = document.getElementById('edit-id-error');
  errEl.textContent = '';
  errEl.classList.add('hidden');
  document.getElementById('edit-id-modal').classList.remove('hidden');
  setTimeout(() => document.getElementById('edit-id-new').focus(), 50);
}
function closeEditIdModal() {
  document.getElementById('edit-id-modal').classList.add('hidden');
}

document.getElementById('btn-edit-id').addEventListener('click', openEditIdModal);
document.getElementById('btn-close-edit-id').addEventListener('click', closeEditIdModal);
document.getElementById('btn-cancel-edit-id').addEventListener('click', closeEditIdModal);

document.getElementById('btn-submit-edit-id').addEventListener('click', async () => {
  const newId    = document.getElementById('edit-id-new').value.trim();
  const password = document.getElementById('edit-id-password').value;
  const errEl    = document.getElementById('edit-id-error');
  const btnEl    = document.getElementById('btn-submit-edit-id');
  errEl.classList.add('hidden');

  if (!newId)                        { showAuthError(errEl, '新しいIDを入力してください。'); return; }
  if (newId.includes('@'))           { showAuthError(errEl, 'IDに @ は使えません。'); return; }
  if (newId === userId)              { showAuthError(errEl, '現在のIDと同じです。'); return; }
  if (!password)                     { showAuthError(errEl, '現在のパスワードを入力してください。'); return; }
  if (!currentUser)                  { showAuthError(errEl, 'ログイン状態を確認できません。'); return; }

  try {
    btnEl.disabled = true;
    btnEl.textContent = '変更中...';

    // 1. 重複チェック（Firestore users/userId）
    const dup = await db.collection('users').where('userId', '==', newId).get();
    if (!dup.empty) {
      showAuthError(errEl, 'このIDはすでに使用されています。');
      return;
    }

    // 2. 再認証（現在のメール + パスワード）
    const currentEmail = currentUser.email;
    const cred = firebase.auth.EmailAuthProvider.credential(currentEmail, password);
    await currentUser.reauthenticateWithCredential(cred);

    // 3. Firebase Auth のメールアドレスを更新
    const newEmail = idToEmail(newId);
    await currentUser.updateEmail(newEmail);

    // 4. Firestore のドキュメントを更新
    await db.collection('users').doc(currentUser.uid).set(
      { userId: newId, password },
      { merge: true }
    );

    userId = newId;
    const idTextEl = document.getElementById('profile-id-text');
    if (idTextEl) idTextEl.textContent = newId;

    closeEditIdModal();
    alert('IDを変更しました。次回ログインからは新しいIDをご利用ください。');
  } catch (e) {
    const code = e.code || '';
    let msg;
    if (code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
      msg = '現在のパスワードが正しくありません。';
    } else if (code === 'auth/email-already-in-use') {
      msg = 'このIDはすでに使用されています。';
    } else if (code === 'auth/requires-recent-login') {
      msg = '再ログインが必要です。一度ログアウトしてからやり直してください。';
    } else if (code === 'auth/operation-not-allowed') {
      msg = 'IDの変更がサーバー側で許可されていません。管理者に連絡してください。';
    } else {
      msg = authErrorMsg(code) || `エラーが発生しました（${code || e.message}）`;
    }
    showAuthError(errEl, msg);
  } finally {
    btnEl.disabled = false;
    btnEl.textContent = '変更する';
  }
});

document.getElementById('btn-back-home').addEventListener('click', () => { renderHome(); showScreen('screen-home'); });
document.getElementById('btn-back-bookpicker').addEventListener('click', () => { renderBookPicker(); showScreen('screen-bookpicker'); });
document.getElementById('btn-back-mode').addEventListener('click', saveQuizAndGoBack);
document.getElementById('btn-start-resume').addEventListener('click', resumeQuiz);
document.getElementById('btn-start-normal').addEventListener('click', () => startQuiz('normal'));
document.getElementById('btn-start-review').addEventListener('click', () => startQuiz('review'));
document.getElementById('btn-start-lucky').addEventListener('click', () => startQuiz('lucky'));
document.getElementById('btn-start-review-combined').addEventListener('click', () => startQuiz('review-combined'));
document.getElementById('btn-complete-home').addEventListener('click', () => { renderHome(); showScreen('screen-home'); });
document.getElementById('btn-complete-retry').addEventListener('click', () => {
  if (lastCompleteType === 'flashcard') {
    startFlashcard(fc.mode === 'retry' ? 'normal' : fc.mode);
  } else {
    startQuiz(quiz.mode);
  }
});
document.getElementById('btn-reset').addEventListener('click', resetState);

// ===== Bottom Tab Bar =====
document.getElementById('tab-test').addEventListener('click', () => {
  if (currentBook) { renderHome(); showScreen('screen-home'); }
  else { renderBookPicker(); showScreen('screen-bookpicker'); }
});
document.getElementById('tab-stats').addEventListener('click', () => {
  openStats();
});
document.getElementById('tab-mypage').addEventListener('click', () => {
  openMyPage();
});
document.getElementById('tab-admin').addEventListener('click', () => {
  showScreen('screen-admin'); loadAdminData();
});

// ===== 項目の説明（タップで出す）と使い方ページ =====
// key → { title, text, anchor }。anchor は使い方ページの見出しの id
const HELP = {
  name:        { title: '氏名', text: 'タップすると、その生徒のカレンダー・グラフ・単語帳ごとの表・履歴が開きます。', anchor: 'm-screens' },
  id:          { title: 'ID', text: '生徒がログインに使うIDです。', anchor: 'm-screens' },
  sec:         { title: 'セクションの点数', text: '直近の本番テスト（全問を通しで解いた回）の点数です。下の小さい「最高」は、これまでの最高点。1回のテストで全問正解すると合格で、🏆の横に合格回数と、その内訳（🔀ランダム・📋順番通り）が出ます。色は直近の回が何周目だったかで変わり、2周目以降は薄紫です。「前の数え方」は、まだ新しい決まりの本番を解いていないセクションです。', anchor: 'm-pass' },
  score:       { title: '本番の点数', text: '直近の本番テスト（全問を通しで解いた回）の点数です。「最高」はこれまでの最高点。1回のテストで全問正解すると合格です。🏆の横は合格回数と内訳、「◯周目」は直近の回が何周目だったかです。', anchor: 'm-pass' },
  total:       { title: '合計（習得語数）', text: 'この単語帳で、直近の本番テストで正解した語数の合計と、その割合です。「前回比」は、最後に勉強した日と、その前の勉強日との差です。', anchor: 'm-columns' },
  passTotal:   { title: '🏆 合格', text: 'この単語帳の全セクションの合格回数の合計です。下の小さい数字は、そのうちランダムで取った合格（🔀）と、順番通りで取った合格（📋。1周目だけ）の数です。「記録前」は、ランダムか順番通りかを記録する前（2026年10月22日より前）の合格です。「📋満点」は、2周目以降に順番通りで満点を取ったが、合格に数えなかった回数です。', anchor: 'm-order' },
  today:       { title: '今日解いた数', text: '今日、この単語帳のテスト（本番・練習とも）で答えた問題の数です。下の小さい数字は、そのうち🔀ランダムで解いた数と📋順番通りで解いた数。フラッシュカードは入りません。', anchor: 'm-order' },
  diff:        { title: '前回比', text: '最後に勉強した日の習得語数と、その前の勉強日の習得語数との差です。改修（2026年10月）より前の日は比べられません。', anchor: 'm-columns' },
  everWrong:   { title: 'これまでのバツ', text: '今までに1回でも間違えたことがある単語の数です。克服しても減りません。どれだけつまずいたかが分かります。', anchor: 'm-wrong' },
  remainWrong: { title: '残りのバツ', text: '間違えた単語のうち、そのあと「バツ練習」などの練習でまだ正解できていない単語の数です。練習で正解すると減り、また間違えると増えます。', anchor: 'm-wrong' },
  everLucky:   { title: 'これまでのマグレ', text: '正解したときに生徒が「マグレの正解」と申告したことがある単語の数です。', anchor: 'm-wrong' },
  remainLucky: { title: '残りのマグレ', text: '最後の正解が「マグレ」だった単語の数です。次に「確信して正解」を選ぶと減ります。', anchor: 'm-wrong' },
  fc:          { title: 'フラッシュカード', text: 'フラッシュカードをやった回数、めくった枚数、最後にやった日です。フラッシュカードは練習なので、本番の点数には入りません。', anchor: 'm-fc' },
  fcKnown:     { title: '🃏 わかった語数', text: 'フラッシュカードで最後に「わかる」を押した単語の数です。「わからない」を押すと外れます。', anchor: 'm-fc' },
  updated:     { title: '最終更新', text: 'その生徒の記録が最後に保存された日です。', anchor: 'm-columns' },
  history:     { title: '履歴', text: 'テストやフラッシュカードを1回やるごとの記録です。日時、単語帳とセクション、本番か練習か、何周目か、🔀ランダムか📋順番通りか、点数、最後まで解いたか・途中でやめたかが出ます。新しい順に最大300回ぶん。2026年10月22日から記録しています。', anchor: 'm-history' },
  calendar:    { title: 'カレンダー', text: '色の付いた日は勉強した日です。数字は、その日にテストで答えた数。🃏の数字は、その日にフラッシュカードで「わかる」を押した数です。改修より前の日は、その日の習得語数が出ます。', anchor: 'm-graph' },
  chart:       { title: 'グラフ', text: 'ピンクの線は、全単語帳の習得語数（直近の本番テストで正解した語数）です。薄紫の線は、それまでに到達した最高の習得語数で、減りません。2本の差が、一度覚えたあとに忘れた分です。点線は残りのバツの数で、2026年10月21日から記録しています。', anchor: 'm-graph' },
};

let helpPopEl = null;
let helpJustOpened = false; // 開いたときのクリック自身で閉じないようにする印
function closeHelp() {
  if (helpPopEl) { helpPopEl.remove(); helpPopEl = null; }
}
// 説明の外をタップしたら閉じる（1回だけ登録しておく）
document.addEventListener('click', (e) => {
  if (!helpPopEl) return;
  if (helpJustOpened) { helpJustOpened = false; return; }
  if (!helpPopEl.contains(e.target)) closeHelp();
});
// key の説明を el の近くに出す。opts.sortKey があれば並べ替えボタンも付ける（管理画面の列）
function showHelp(key, el, opts = {}) {
  closeHelp();
  const baseKey = key.startsWith('sec:') ? 'sec' : key;
  const h = HELP[baseKey];
  if (!h) return;
  const pop = document.createElement('div');
  pop.className = 'help-pop';
  const sortBtns = opts.sortKey
    ? `<div class="help-sort">
         <button onclick="adminSort('${opts.sortKey}', -1)">⬇ 多い順に並べる</button>
         <button onclick="adminSort('${opts.sortKey}', 1)">⬆ 少ない順に並べる</button>
       </div>
       ${opts.sortKey === 'passTotal' ? `<div class="help-sort"><button onclick="adminSort('passRandom', -1)">🔀 ランダムでの合格が多い順</button></div>` : ''}`
    : '';
  pop.innerHTML = `
    <div class="help-title">${h.title}</div>
    <div class="help-text">${h.text}</div>
    ${sortBtns}
    <div class="help-foot">
      <button class="help-more" onclick="openManual('${h.anchor}')">詳しく →</button>
      <button class="help-close" onclick="closeHelp()">閉じる</button>
    </div>`;
  document.body.appendChild(pop);
  helpPopEl = pop;
  // 押した場所の下に出す。画面からはみ出すときは内側に寄せる
  const r = el ? el.getBoundingClientRect() : { left: 16, bottom: 80, width: 0 };
  const w = Math.min(300, window.innerWidth - 24);
  pop.style.width = w + 'px';
  let left = r.left + r.width / 2 - w / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - w - 12));
  let top = r.bottom + 6;
  const ph = pop.offsetHeight;
  if (top + ph > window.innerHeight - 12) top = Math.max(12, r.top - ph - 6);
  pop.style.left = left + 'px';
  pop.style.top  = top + 'px';
  helpJustOpened = true;
}

// 使い方ページ。先生は管理画面のタブ、生徒はモーダルで開く
function openManual(anchor) {
  closeHelp();
  if (userRole === 'teacher') {
    switchAdminTab('manual');
    showScreen('screen-admin');
  } else {
    const modal = document.getElementById('manual-modal');
    document.getElementById('manual-modal-body').innerHTML = manualHtml('student');
    modal.classList.remove('hidden');
  }
  if (anchor) {
    setTimeout(() => {
      const target = document.getElementById(anchor);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        target.classList.add('m-flash');
        setTimeout(() => target.classList.remove('m-flash'), 1500);
      }
    }, 60);
  }
}

function manualHtml(audience) {
  const teacher = audience === 'teacher';
  const T = html => (teacher ? html : ''); // 先生にだけ見せる部分
  return `
<div class="manual">
  <div class="manual-toc">
    <a href="#" onclick="openManual('m-screens');return false;">画面の説明</a>
    ${T(`<a href="#" onclick="openManual('m-columns');return false;">生徒一覧の列と記号</a>`)}
    <a href="#" onclick="openManual('m-pass');return false;">合格と周回</a>
    <a href="#" onclick="openManual('m-order');return false;">ランダムと順番通り</a>
    <a href="#" onclick="openManual('m-modes');return false;">本番と練習</a>
    <a href="#" onclick="openManual('m-history');return false;">履歴</a>
    <a href="#" onclick="openManual('m-wrong');return false;">バツ数・マグレ数</a>
    <a href="#" onclick="openManual('m-fc');return false;">フラッシュカード</a>
    ${T(`<a href="#" onclick="openManual('m-list');return false;">生徒を一覧に出す・外す</a>
    <a href="#" onclick="openManual('m-archive');return false;">削除とアーカイブ</a>`)}
    <a href="#" onclick="openManual('m-graph');return false;">カレンダーとグラフ</a>
  </div>

  <h3 id="m-screens">画面の説明</h3>
  ${teacher ? `
  <ul>
    <li><strong>生徒一覧</strong>：生徒ごとの点数・合格回数・バツ数・フラッシュカードなどを、単語帳ごとに見ます。氏名をタップすると、その生徒のカレンダー・グラフ・単語帳ごとの表・履歴が開きます。列の見出しをタップすると、その数字の説明と、並べ替えのボタンが出ます。</li>
    <li><strong>教師一覧</strong>：先生のアカウントの一覧です。新しい先生の作成、生徒への変更ができます。</li>
    <li><strong>単語一覧</strong>：単語帳ごとの単語と日本語訳の一覧です。英単語・日本語で検索できます。</li>
    <li><strong>使い方</strong>：このページです。</li>
  </ul>` : `
  <ul>
    <li><strong>PastanTest</strong>：単語帳を選び、範囲を選んでテストや練習をします。</li>
    <li><strong>学習データ</strong>：自分の点数・合格回数・バツ数・フラッシュカードの記録・履歴・カレンダー・グラフを見ます。数字の横の <span class="help-mark">?</span> をタップすると説明が出ます。</li>
    <li><strong>マイページ</strong>：名前とIDの変更、メモの一覧、チュートリアルです。</li>
  </ul>`}

  ${T(`
  <h3 id="m-columns">生徒一覧の列と記号</h3>
  <table class="manual-table">
    <tr><th>列</th><th>意味</th></tr>
    <tr><td>T1、P1 …</td><td>セクションごとの、直近の本番テストの点数（全問を通しで解いた回の正解数／全問数）。下の「最高」はこれまでの最高点、「前の数え方」はまだ新しい決まりの本番を解いていないセクション。その下に 🏆合格回数（🔀ランダム・📋順番通りの内訳）と ◯周目 が出ます。</td></tr>
    <tr><td>合計</td><td>この単語帳で、直近の本番テストで正解した語数と割合。「前回比」は、最後に勉強した日とその前の勉強日との差です。</td></tr>
    <tr><td>🏆 合格</td><td>全セクションの合格回数の合計と、その内訳（🔀ランダム・📋順番通り・記録前）。「📋満点」は、2周目以降に順番通りで満点を取ったが合格に数えなかった回数。見出しをタップすると「ランダムでの合格が多い順」にも並べ替えられます。</td></tr>
    <tr><td>今日</td><td>今日、この単語帳のテスト（本番・練習とも）で答えた問題の数と、その内訳（🔀ランダム・📋順番通り）。</td></tr>
    <tr><td>これまでのバツ ⭐</td><td>1回でも間違えたことがある単語の数。減りません。</td></tr>
    <tr><td>残りのバツ ⭐</td><td>間違えた単語のうち、練習でまだ正解できていない単語の数。練習で減ります。</td></tr>
    <tr><td>これまでのマグレ 🔺</td><td>「マグレの正解」と申告したことがある単語の数。</td></tr>
    <tr><td>残りのマグレ 🔺</td><td>最後の正解がマグレだった単語の数。</td></tr>
    <tr><td>🃏 フラッシュカード</td><td>やった回数、「わかる」を押した語数、最後にやった日。</td></tr>
    <tr><td>最終更新</td><td>記録が最後に保存された日。</td></tr>
    <tr><td>操作</td><td>教師に昇格／この単語帳に追加・から外す／削除（アーカイブ）。</td></tr>
  </table>
  <p>色の意味：1周目は 赤（50%未満）→ 黄（50〜79%）→ 薄緑（80%以上）→ 緑（全問正解）。2周目以降は薄紫です。</p>
  `)}

  <h3 id="m-pass">合格と周回</h3>
  <ul>
    <li><strong>本番テスト</strong>は、毎回そのセクションの<strong>全問を最初から最後まで</strong>解きます（300語のセクションなら300問）。1回目に正解した単語も、2回目にまた出ます。</li>
    <li><strong>1回のテストで全問正解すると合格</strong>です。1問でも間違えたら、その回は合格になりません。次の本番も、また全問を最初から解きます。</li>
    <li>点数は、その回で正解した数です。セクションの点数欄には<strong>直近の回の点数</strong>を大きく、<strong>これまでの最高点</strong>を小さく出します。</li>
    <li>合格すると 🏆 が付き、横の数字が<strong>合格した回数</strong>です（🏆2＝2回合格）。</li>
    <li>まだ一度も合格していないときの本番が<strong>1周目</strong>、1回合格したあとの本番が<strong>2周目</strong>、2回合格したあとが3周目です。</li>
    <li><strong>2周目以降は、🔀ランダムで全問正解したときだけ合格に数えます</strong>（次の「ランダムと順番通り」）。</li>
    <li>点数の色は、直近の回が何周目だったかで変わります。1周目は 赤（50%未満）→ 黄（50〜79%）→ 薄緑（80%以上）→ 緑（満点）、2周目以降は薄紫です。</li>
    <li>本番を途中でやめても、「本番の続きから」で同じ回の続きを解けます（日をまたいでもかまいません）。続きをやらずに本番を始め直すと、途中の回は点数が付かずに履歴に残ります。</li>
    <li>2026年10月22日より前は、「1回目に間違えた単語だけを解き直し、全部が一度は正解になったら合格」という決まりでした。そのころの 🏆 はそのまま残っています。新しい決まりの本番をまだ解いていないセクションは、点数の横に「前の数え方」と出ます。</li>
  </ul>

  <h3 id="m-order">ランダムと順番通り</h3>
  <ul>
    <li>テストを始める画面で、🔀 ランダム（単語がばらばらの順で出る）と 📋 順番通り（No.の順に出る）を選べます。アプリを開くたびに 🔀 ランダムに戻ります。</li>
    <li><strong>1周目</strong>は、どちらで全問正解しても合格です。</li>
    <li><strong>2周目以降</strong>は、🔀ランダムで全問正解したときだけ合格に数えます。📋順番通りで満点を取った回は「📋満点」として記録しますが、🏆は増えません。</li>
    <li>2周目以降のセクションで 📋順番通りを選ぶと、赤い帯と確認の画面で「${ORDER_WARN_TEXT}」と知らせます。</li>
    <li>答えた問題はすべて 🔀／📋 に分けて数えています。合格の内訳、今日解いた数の内訳、履歴で確かめられます。</li>
  </ul>

  <h3 id="m-modes">本番と練習</h3>
  <ul>
    <li><strong>本番＝「▶ 本番テスト」</strong>だけです。毎回全問を通しで解きます。点数と合格回数が動くのはこのモードだけです。</li>
    <li><strong>練習＝「バツ練習」「マグレ練習」「バツ＋マグレ練習」「フラッシュカード」</strong>です。間違えた単語・マグレだった単語だけが出ます。練習で正解しても間違えても、本番の点数と合格は変わりません。練習の結果は、バツ数・マグレ数・フラッシュカードの記録として残ります。</li>
    <li>練習で間違えた単語は「これまでのバツ」「残りのバツ」に数えます。</li>
  </ul>

  <h3 id="m-wrong">バツ数・マグレ数の数え方</h3>
  <ul>
    <li><strong>これまでのバツ</strong>：1回でも間違えたことがある単語の数です。本番でも練習でも、間違えれば数えます。克服しても減りません。</li>
    <li><strong>残りのバツ</strong>：間違えた単語のうち、そのあと練習（バツ練習・バツ＋マグレ練習）でまだ正解できていない単語の数です。練習で正解すると減ります。本番や練習でまた間違えると増えます。本番で正解しただけでは減りません。</li>
    <li><strong>これまでのマグレ</strong>：正解したときに「マグレの正解」を選んだことがある単語の数です。</li>
    <li><strong>残りのマグレ</strong>：最後の正解が「マグレ」だった単語の数です。本番でも練習でも、次に「確信して正解」を選ぶと減ります。間違えると、マグレではなくバツになります。</li>
    <li>例：あるセクションの本番で40語を間違えた。バツ練習で32語は正解できたが、8語はまだ間違える → これまでのバツ40、残りのバツ8。</li>
  </ul>

  <h3 id="m-fc">フラッシュカード</h3>
  <ul>
    <li>フラッシュカードは練習です。本番の点数・合格回数には入りません。</li>
    <li>記録するもの：やった回数、めくった枚数、「わかる」を押した数、「わからない」を押した数、最後にやった日。途中でやめても、そこまでの分は残ります。</li>
    <li><strong>🃏 わかった語数</strong>：最後に「わかる」を押した単語の数です。「わからない」を押すと外れます。</li>
    <li>「わからない語のみ復習」には、フラッシュカードで「わからない」を押した単語と、残りのバツの単語が出ます。</li>
  </ul>

  <h3 id="m-history">履歴</h3>
  <ul>
    <li>テストやフラッシュカードを1回やるごとに、1行ずつ記録します。新しい順に、最大300回ぶんです（2026年10月22日から）。</li>
    <li>出る内容：日時、単語帳とセクション、本番か練習か、何周目か、🔀ランダムか📋順番通りか、点数（本番）または正解数（練習）、最後まで解いたか・途中でやめたか、続きから解いた回数。</li>
    <li>「すべて／🔀 ランダム／📋 順番通り」で絞り込めます。</li>
    <li>「🏆 合格」は合格した回、「満点（順番通りのため合格に数えない）」は2周目以降に順番通りで満点を取った回です。</li>
  </ul>

  ${T(`
  <h3 id="m-list">生徒を一覧に出す・外す</h3>
  <ul>
    <li>生徒一覧には、<strong>その単語帳に記録がある生徒</strong>（テストを1問でも解いた、またはフラッシュカードを1枚でもめくった）だけが出ます。記録がない生徒は隠れています。</li>
    <li>隠れている生徒も見たいときは、「やっていない生徒も表示」にチェックを入れます。</li>
    <li>記録がなくても一覧に出したい生徒は、「やっていない生徒も表示」にして、その生徒の「➕ この単語帳に追加」を押します。</li>
    <li>記録はあるが一覧から外したい生徒（別の単語帳に移った生徒など）は、「➖ この単語帳から外す」を押します。外した生徒は、「やっていない生徒も表示」にすると「➖ 外した生徒」の印つきで出て、「この単語帳に戻す」で戻せます。</li>
    <li>追加・外すは単語帳ごとの設定です。アカウントの削除とは別です。</li>
  </ul>

  <h3 id="m-archive">削除とアーカイブ</h3>
  <ul>
    <li>卒業・退会した生徒は、操作の「🗑 削除」で<strong>アーカイブ</strong>に移します。確認の画面が出ます。</li>
    <li>削除した生徒は、生徒一覧から外れ、<strong>ログインできなくなります</strong>。学習データは消えません。</li>
    <li>一覧の上の「📦 アーカイブ」を押すと、削除した生徒だけが並びます。氏名をタップすれば、カレンダー・グラフ・単語帳ごとの表を今までどおり見られます。「全員」なら在籍中とアーカイブの両方が並びます。</li>
    <li>間違えて削除したときは、アーカイブ表示で「↩ 在籍中に戻す」を押します。ログインもできるようになります。</li>
  </ul>
  `)}

  <h3 id="m-graph">カレンダーとグラフ</h3>
  <ul>
    <li><strong>カレンダー</strong>：色の付いた日は勉強した日です。数字は、その日にテストで答えた数。🃏の数字は、その日にフラッシュカードで「わかる」を押した数です。改修（2026年10月）より前の日は、その日の習得語数が出ます。</li>
    <li><strong>グラフ</strong>：ピンクの線は全単語帳の習得語数（直近の本番テストで正解した語数）です。薄紫の線は、それまでに到達した最高の習得語数で、減りません。2本の差が、一度覚えたあとに忘れた分です。点線は残りのバツの数で、2026年10月21日から記録しています（それより前の日は出ません）。</li>
    <li>習得語数は、本番テストを最後まで解いたときに、その回の結果で書き換わります。前の回で正解した単語を今回間違えると減ります。学習データをリセットしたときも減ります。</li>
  </ul>
</div>`;
}

document.getElementById('btn-close-manual').addEventListener('click', () => {
  document.getElementById('manual-modal').classList.add('hidden');
});
document.getElementById('manual-modal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('manual-modal')) document.getElementById('manual-modal').classList.add('hidden');
});
document.getElementById('btn-manual-open').addEventListener('click', () => openManual());

// ===== Flashcard =====
function startFlashcard(mode) {
  fc.mode    = mode;
  fc.section = quiz.section;
  fc.order   = quiz.orderMode;
  fc.unknownNos = new Set();
  fc.tab     = 'word';
  fc.explainOpen = false;
  fc.index   = 0;

  const allWords = wordsForSection(fc.section.id);
  const rec = currentRecords();
  const applyOrder = arr => quiz.orderMode === 'sequential'
    ? [...arr].sort((a, b) => a.no.localeCompare(b.no))
    : shuffle(arr);

  fc.sessionCounted = false;
  fc.logged = false;
  let raw;
  if (mode === 'review')       raw = allWords.filter(w => isRemainWrong(rec[w.no]) || rec[w.no]?.fcUnknown === true);
  else if (mode === 'lucky')   raw = allWords.filter(w => rec[w.no]?.lucky === true);
  else raw = allWords;

  fc.pool  = applyOrder(raw);
  if (fc.pool.length === 0) { alert('出題できる単語がありません。'); return; }
  fc.total = fc.pool.length;

  document.getElementById('fc-section-label').textContent = fc.section.label;
  showScreen('screen-flashcard');
  renderFCCard();
}

function renderFCCard() {
  if (fc.index >= fc.pool.length) { showFCComplete(); return; }

  fc.current     = fc.pool[fc.index];
  fc.explainOpen = false;
  document.getElementById('fc-explain-panel').classList.add('hidden');
  document.getElementById('fc-btn-explain').textContent = '解説';

  const pct = Math.round((fc.index / fc.total) * 100);
  document.getElementById('fc-progress-bar').style.width = pct + '%';
  document.getElementById('fc-counter').textContent = `${fc.index + 1} / ${fc.total}`;
  document.getElementById('fc-wordno').textContent   = `No.${fc.current.no}`;

  document.querySelectorAll('.fc-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.fcTab === fc.tab);
  });
  renderFCContent();
}

function renderFCContent() {
  const mainEl     = document.getElementById('fc-main');
  const phoneticEl = document.getElementById('fc-phonetic');
  const extras   = currentBook ? (currentBook.extras()[fc.current.word.toLowerCase()]   || null) : null;
  const phonetic  = currentBook ? (currentBook.phonetics()[fc.current.word.toLowerCase()] || null) : null;

  phoneticEl.textContent = '';
  switch (fc.tab) {
    case 'word':
      mainEl.className = 'fc-word-en';
      mainEl.textContent = fc.current.word;
      if (phonetic) phoneticEl.textContent = phonetic;
      break;
    case 'word-ja':
      mainEl.className = 'fc-word-ja';
      mainEl.textContent = fc.current.japanese;
      break;
    case 'example':
      if (extras?.example) {
        mainEl.className = 'fc-example-en';
        mainEl.textContent = extras.example.split('\n')[0] || fc.current.word;
      } else {
        mainEl.className = 'fc-word-en';
        mainEl.textContent = fc.current.word;
      }
      break;
    case 'example-ja':
      if (extras?.example) {
        mainEl.className = 'fc-example-ja';
        const line = extras.example.split('\n')[1] || fc.current.japanese;
        mainEl.textContent = line.replace(/^[（(]|[）)]$/g, '');
      } else {
        mainEl.className = 'fc-word-ja';
        mainEl.textContent = fc.current.japanese;
      }
      break;
  }
}

function fcSwitchTab(tab) {
  fc.tab = tab;
  document.querySelectorAll('.fc-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.fcTab === tab);
  });
  renderFCContent();
}

function fcToggleExplain() {
  const panel = document.getElementById('fc-explain-panel');
  const btn   = document.getElementById('fc-btn-explain');
  fc.explainOpen = !fc.explainOpen;
  if (fc.explainOpen) {
    const extras = currentBook ? (currentBook.extras()[fc.current.word.toLowerCase()] || null) : null;
    const pos = getPos(fc.current.word, fc.current.japanese);
    let html = `<div class="extras-label">${fc.current.word} <span class="pos-badge">${pos}</span> = ${fc.current.japanese}</div>`;
    if (extras?.etymology) {
      html += `<div class="extras-block" style="margin-top:8px">
        <div class="extras-label">🔤 語源</div>
        <div class="extras-body">${extras.etymology}</div>
      </div>`;
    }
    if (extras?.related?.length) {
      html += `<div class="extras-block" style="margin-top:8px">
        <div class="extras-label">🔗 関連語</div>
        <div class="extras-related">${extras.related.map(r => `<span class="extras-related-tag">${r}</span>`).join('')}</div>
      </div>`;
    }
    const memo = (state.memos || {})[fc.current.no];
    if (memo) {
      html += `<div class="quiz-memo-display" style="margin-top:8px">${memo}</div>`;
    }
    panel.innerHTML = html;
    panel.classList.remove('hidden');
    btn.textContent = '解説▲';
  } else {
    panel.classList.add('hidden');
    btn.textContent = '解説';
  }
}

function fcMark(known) {
  if (!known) fc.unknownNos.add(fc.current.no);
  const rec = currentRecords();
  wordRec(rec, fc.current.no).fcUnknown = !known;
  // 途中でやめても残るよう、1枚ごとに記録する
  const fs = state.fcStats[currentBook.id] || (state.fcStats[currentBook.id] = {});
  if (!fc.sessionCounted) {
    fc.sessionCounted = true;
    fs.sessions = (fs.sessions || 0) + 1;
    bumpDaily('fcSessions', currentBook.id);
  }
  fs.cards    = (fs.cards || 0) + 1;
  fs.lastDate = todayKey();
  bumpDaily('fcCards', currentBook.id);
  if (known) bumpDaily('fcKnown', currentBook.id);
  saveState();
  fc.index++;
  renderFCCard();
}

// フラッシュカードを終えた／やめたときに履歴へ1行残す
function logFlashcard(status) {
  if (!fc.section || fc.index === 0 || fc.logged) return;
  fc.logged = true;
  pushHistory({ book: currentBook.id, sec: fc.section.id, mode: 'flashcard', round: null, order: fc.order || 'random',
    answered: fc.index, correct: fc.index - fc.unknownNos.size, total: fc.total, status, resumed: 0 });
}
function showFCComplete() {
  lastCompleteType = 'flashcard';
  logFlashcard('done');
  saveRecords();
  const unknownCount = fc.unknownNos.size;
  const knownCount   = fc.total - unknownCount;

  document.getElementById('complete-title').textContent = '🃏 フラッシュカード完了！';
  document.getElementById('complete-stats').innerHTML = `
    <strong>わかった:</strong> ${knownCount} 語<br>
    <strong>わからない:</strong> ${unknownCount} 語<br>
    <strong>合計:</strong> ${fc.total} 語
  `;
  document.getElementById('btn-complete-retry').textContent = 'もう一度（全問）';

  const unknownBtn = document.getElementById('btn-fc-retry-unknown');
  if (unknownCount > 0) {
    unknownBtn.textContent = `⭐ わからない ${unknownCount} 語を再テスト`;
    unknownBtn.classList.remove('hidden');
  } else {
    unknownBtn.classList.add('hidden');
  }
  showScreen('screen-complete');
}

function fcRetryUnknown() {
  const unknownWords = fc.pool.filter(w => fc.unknownNos.has(w.no));
  if (unknownWords.length === 0) return;

  const sorted = quiz.orderMode === 'sequential'
    ? [...unknownWords].sort((a, b) => a.no.localeCompare(b.no))
    : shuffle([...unknownWords]);

  fc.pool        = sorted;
  fc.total       = fc.pool.length;
  fc.index       = 0;
  fc.unknownNos  = new Set();
  fc.tab         = 'word';
  fc.explainOpen = false;
  fc.mode        = 'retry';
  fc.logged      = false;
  fc.sessionCounted = false;

  showScreen('screen-flashcard');
  renderFCCard();
}

// ===== Order Toggle =====
document.getElementById('order-toggle').addEventListener('click', (e) => {
  const btn = e.target.closest('.order-btn');
  if (!btn) return;
  setOrderMode(btn.dataset.order);
});
document.getElementById('btn-warn-random').addEventListener('click', () => {
  closeOrderWarnModal();
  setOrderMode('random');
  startQuiz('normal', { confirmed: true });
});
document.getElementById('btn-warn-seq').addEventListener('click', () => {
  closeOrderWarnModal();
  startQuiz('normal', { confirmed: true });
});
document.getElementById('btn-warn-close').addEventListener('click', closeOrderWarnModal);

// ===== Flashcard Events =====
document.getElementById('btn-start-flashcard').addEventListener('click', () => startFlashcard('normal'));
document.getElementById('btn-start-flashcard-review').addEventListener('click', () => startFlashcard('review'));

document.getElementById('btn-fc-retry-unknown').addEventListener('click', fcRetryUnknown);

document.getElementById('fc-tabs').addEventListener('click', (e) => {
  const tab = e.target.closest('.fc-tab');
  if (!tab) return;
  fcSwitchTab(tab.dataset.fcTab);
});

document.getElementById('fc-btn-explain').addEventListener('click', fcToggleExplain);

document.getElementById('fc-btn-play').addEventListener('click', () => {
  if (!fc.current || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(fc.current.word);
  utter.lang = 'en-US';
  utter.rate = 0.85;
  window.speechSynthesis.speak(utter);
});

document.getElementById('fc-btn-unknown').addEventListener('click', () => fcMark(false));
document.getElementById('fc-btn-known').addEventListener('click',   () => fcMark(true));

document.getElementById('btn-back-fc').addEventListener('click', () => {
  logFlashcard('paused');
  saveState();
  openMode(quiz.section);
});

document.getElementById('btn-review-all').addEventListener('click', () => {
  if (!currentBook) return;
  const rec = currentRecords();
  const allWrong = currentBook.words().filter(w => w.japanese && isRemainWrong(rec[w.no]));
  if (allWrong.length === 0) { alert('残りのバツはありません。'); return; }
  quiz.section = { id: '__all__', label: '全セクションのバツ練習', range: '全セクション' };
  quiz.mode = 'review'; quiz.order = 'random'; quiz.run = null;
  quiz.sessionCorrect = 0; quiz.sessionWrong = 0; quiz.answered = false;
  quiz.allWords = currentBook.words().filter(w => w.japanese);
  quiz.pool = shuffle(allWrong);
  quiz.totalPool = quiz.pool.length;
  document.getElementById('quiz-section-label').textContent = '全セクション';
  setQuizModeLabel();
  showScreen('screen-quiz');
  nextQuestion();
});
