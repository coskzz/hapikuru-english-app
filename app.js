// ===== Firebase Init =====
let auth, db;
try {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  db   = firebase.firestore();
  db.enablePersistence().catch(() => {}); // オフライン対応
} catch (e) {
  console.error('Firebase init error:', e);
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
    name: 'パス単',
    label: '英検準1級 パス単',
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
];

// ===== App State =====
let currentUser  = null;
let userRole     = 'student';
let userName     = '';
let userId       = '';
let currentBook  = null; // 現在選択中の単語帳
let state        = {
  bookRecords: { ex: {}, pastan: {} }, // 単語帳ごとの進捗
  dailyLog: {}, streak: 0, bestStreak: 0, points: 0,
  lastStudyDate: null, tutorialDone: false, memos: {},
};
let adminStudentsMap = {};
let currentDetailUid = null;
let adminBookId = 'ex'; // 管理画面で現在表示中の単語帳ID

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

    // マイグレーション: 旧 records → records_ex
    if (d.records && !d.records_ex) {
      state.bookRecords.ex = d.records;
      await db.collection('users').doc(uid).set(
        { records_ex: d.records },
        { merge: true }
      ).catch(console.error);
    } else {
      state.bookRecords.ex = d.records_ex || {};
    }
    state.bookRecords.pastan = d.records_pastan || {};

    state.dailyLog      = d.dailyLog      || {};
    state.streak        = d.streak        || 0;
    state.bestStreak    = d.bestStreak    || 0;
    state.points        = d.points        || 0;
    state.lastStudyDate = d.lastStudyDate || null;
    state.tutorialDone  = d.tutorialDone  || false;
    state.memos         = d.memos         || {};
  } else {
    userRole = 'student';
    state.bookRecords   = { ex: {}, pastan: {} };
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
  const today = new Date().toISOString().slice(0, 10);
  // 全単語帳の合計 mastered を dailyLog に記録
  const totalMastered = BOOKS.reduce((sum, book) => {
    return sum + book.words().filter(w => w.japanese && state.bookRecords[book.id]?.[w.no]?.correct).length;
  }, 0);
  state.dailyLog[today] = { mastered: totalMastered };
  db.collection('users').doc(currentUser.uid).set(
    {
      records_ex:      state.bookRecords.ex,
      records_pastan:  state.bookRecords.pastan,
      dailyLog:        state.dailyLog,
      streak:          state.streak,
      bestStreak:      state.bestStreak,
      points:          state.points,
      lastStudyDate:   state.lastStudyDate,
      tutorialDone:    state.tutorialDone,
      memos:           state.memos,
      updatedAt:       firebase.firestore.FieldValue.serverTimestamp(),
    },
    { merge: true }
  ).catch(console.error);
}

// saveState の別名（フラッシュカード完了時などに使用）
const saveRecords = saveState;

function resetState() {
  if (!confirm('全学習データをリセットしますか？\nこの操作は元に戻せません。')) return;
  state = {
    bookRecords: { ex: {}, pastan: {} },
    dailyLog: {}, streak: 0, bestStreak: 0, points: 0,
    lastStudyDate: null, tutorialDone: state.tutorialDone, memos: {},
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
        setTimeout(() => openTutorial(), 600);
      }
    }
  } else {
    currentUser = null;
    currentBook = null;
    document.getElementById('tab-bar').classList.add('hidden');
    document.body.classList.remove('has-tab-bar');
    showScreen('screen-login');
  }
});

// ===== ID → ダミーメール変換 =====
function idToEmail(id) {
  return id.toLowerCase().replace(/\s+/g, '_') + '@hapikuru.local';
}

// ===== Login =====
document.getElementById('btn-login').addEventListener('click', async () => {
  const userId   = document.getElementById('login-id').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.classList.add('hidden');
  if (!userId || !password) { showAuthError(errEl, 'IDとパスワードを入力してください。'); return; }
  try {
    document.getElementById('btn-login').textContent = '...';
    await auth.signInWithEmailAndPassword(idToEmail(userId), password);
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
  const words = wordsForSection(sectionId);
  const allSectionWords = currentBook.words().filter(w => w.section === sectionId);
  const rec = currentRecords();
  const correct    = words.filter(w => rec[w.no]?.correct).length;
  const wrongCount = words.filter(w => (rec[w.no]?.wrongCount || 0) > 0 && !rec[w.no]?.correct).length;
  return { total: allSectionWords.length, correct, wrongCount };
}

function renderHome() {
  if (!currentBook) return;
  const grid = document.getElementById('section-grid');
  grid.innerHTML = '';
  currentBook.sections.forEach(sec => {
    const { correct, wrongCount, total } = getSectionStats(sec.id);
    const cleared = total > 0 && correct === total;
    const card = document.createElement('div');
    card.className = 'section-card' + (cleared ? ' cleared' : '');
    card.innerHTML = `
      <div class="card-title">${sec.label}${cleared ? ' ✅' : ''}</div>
      <div class="card-range">${sec.range}</div>
      <div class="card-progress">${correct}/${total} 正解</div>
      ${wrongCount > 0 ? `<div class="card-progress" style="color:#E05555">バツ ${wrongCount} 個</div>` : ''}
      ${wrongCount > 0 ? `<div class="card-badge">✗</div>` : ''}
    `;
    card.addEventListener('click', () => openMode(sec));
    grid.appendChild(card);
  });
}

// ===== Mode Select =====
function openMode(sec) {
  quiz.section = sec;
  document.getElementById('mode-section-title').textContent = `${sec.label}（${sec.range}）`;
  const { correct, total } = getSectionStats(sec.id);
  const words = wordsForSection(sec.id);
  const rec = currentRecords();
  const wrongWords  = words.filter(w => (rec[w.no]?.wrongCount || 0) > 0);
  const luckyWords  = words.filter(w => rec[w.no]?.lucky === true);
  const combinedLen = words.filter(w =>
    (rec[w.no]?.wrongCount || 0) > 0 || rec[w.no]?.lucky === true
  ).length;

  document.getElementById('mode-stats').innerHTML = `
    <strong>正解済み:</strong> ${correct}/${total}<br>
    <strong>バツのある単語:</strong> ${wrongWords.length} 個 ／ <strong>まぐれ正解:</strong> ${luckyWords.length} 個<br>
    <strong>未回答:</strong> ${total - correct} 個
  `;

  const reviewBtn = document.getElementById('btn-start-review');
  reviewBtn.disabled = wrongWords.length === 0;
  reviewBtn.style.opacity = wrongWords.length === 0 ? '.4' : '1';

  const luckyBtn = document.getElementById('btn-start-lucky');
  luckyBtn.disabled = luckyWords.length === 0;
  luckyBtn.style.opacity = luckyWords.length === 0 ? '.4' : '1';

  const combinedBtn = document.getElementById('btn-start-review-combined');
  combinedBtn.disabled = combinedLen === 0;
  combinedBtn.style.opacity = combinedLen === 0 ? '.4' : '1';

  const fcReviewWords = words.filter(w =>
    (rec[w.no]?.wrongCount || 0) > 0 || rec[w.no]?.fcUnknown === true
  );
  const fcReviewBtn = document.getElementById('btn-start-flashcard-review');
  fcReviewBtn.disabled = fcReviewWords.length === 0;
  fcReviewBtn.style.opacity = fcReviewWords.length === 0 ? '.4' : '1';

  const resumeBtn = document.getElementById('btn-start-resume');
  const saved = getSavedQuiz();
  if (saved && saved.sectionId === sec.id) {
    resumeBtn.classList.remove('hidden');
    resumeBtn.textContent = `⏸ 続きから再開（残り ${saved.poolNos.length} 問）`;
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

function startQuiz(mode) {
  localStorage.removeItem('quiz_resume');
  quiz.mode = mode;
  quiz.sessionCorrect = 0;
  quiz.sessionWrong   = 0;
  quiz.answered       = false;
  const allWords = wordsForSection(quiz.section.id);
  quiz.allWords = allWords;
  const rec = currentRecords();

  const applyOrder = arr => quiz.orderMode === 'sequential'
    ? [...arr].sort((a, b) => a.no.localeCompare(b.no))
    : shuffle(arr);

  if (mode === 'review') {
    quiz.pool = applyOrder(allWords.filter(w => (rec[w.no]?.wrongCount || 0) > 0));
  } else if (mode === 'lucky') {
    quiz.pool = applyOrder(allWords.filter(w => rec[w.no]?.lucky === true));
  } else if (mode === 'review-combined') {
    quiz.pool = applyOrder(allWords.filter(w =>
      (rec[w.no]?.wrongCount || 0) > 0 || rec[w.no]?.lucky === true
    ));
  } else {
    quiz.pool = applyOrder(allWords.filter(w => !rec[w.no]?.correct));
    if (quiz.pool.length === 0) {
      allWords.forEach(w => { if (rec[w.no]) rec[w.no].correct = false; });
      saveState();
      quiz.pool = applyOrder(allWords);
    }
  }
  if (quiz.pool.length === 0) { alert('出題できる単語がありません。'); return; }
  quiz.totalPool = quiz.pool.length;
  document.getElementById('quiz-section-label').textContent = quiz.section.label;
  const modeLabels = { review: '⭐ バツ復習', lucky: '🔺 まぐれ復習', 'review-combined': '⭐🔺 バツ+まぐれ復習' };
  document.getElementById('quiz-mode-label').textContent = modeLabels[mode] || '通常テスト';
  showScreen('screen-quiz');
  nextQuestion();
}

function nextQuestion() {
  if (quiz.pool.length === 0) { showComplete(); return; }
  quiz.current  = quiz.pool.shift();
  quiz.answered = false;

  const total = (quiz.mode === 'review' || quiz.mode === 'lucky' || quiz.mode === 'review-combined')
    ? quiz.totalPool
    : quiz.allWords.length;
  const done = quiz.sessionCorrect + quiz.sessionWrong;
  const pct  = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${done} / ${total}`;
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
    const r = rec[quiz.current.no] || { correct: false, attempts: 0, wrongCount: 0, lucky: false };
    r.attempts++;
    r.correct   = false;
    r.wrongCount = (r.wrongCount || 0) + 1;
    r.lucky     = false;
    rec[quiz.current.no] = r;
    quiz.sessionWrong++;
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
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastStudyDate === today) return;

  const yest = new Date(); yest.setDate(yest.getDate() - 1);
  const yesterdayStr = yest.toISOString().slice(0, 10);

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
  const r = rec[quiz.current.no] || { correct: false, attempts: 0, wrongCount: 0, lucky: false };
  r.attempts++;
  r.correct = true;
  r.lucky   = isLucky;
  rec[quiz.current.no] = r;
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
  const remainingPool = quiz.current ? [quiz.current, ...quiz.pool] : quiz.pool;
  if (remainingPool.length > 0) {
    localStorage.setItem('quiz_resume', JSON.stringify({
      sectionId:    quiz.section.id,
      sectionLabel: quiz.section.label,
      sectionRange: quiz.section.range,
      mode:         quiz.mode,
      poolNos:      remainingPool.map(w => w.no),
      sessionCorrect: quiz.sessionCorrect,
      sessionWrong:   quiz.sessionWrong,
    }));
  }
  openMode(quiz.section);
}

function resumeQuiz() {
  const saved = getSavedQuiz();
  if (!saved) return;
  quiz.section      = { id: saved.sectionId, label: saved.sectionLabel, range: saved.sectionRange };
  quiz.mode         = saved.mode;
  quiz.sessionCorrect = saved.sessionCorrect;
  quiz.sessionWrong   = saved.sessionWrong;
  quiz.answered     = false;
  quiz.allWords     = wordsForSection(quiz.section.id);
  quiz.pool         = saved.poolNos.map(no => currentBook.words().find(w => w.no === no)).filter(Boolean);
  if (quiz.pool.length === 0) { localStorage.removeItem('quiz_resume'); return; }
  document.getElementById('quiz-section-label').textContent = quiz.section.label;
  document.getElementById('quiz-mode-label').textContent = quiz.mode === 'review' ? '⭐ バツ復習' : '通常テスト';
  showScreen('screen-quiz');
  nextQuestion();
}

// ===== Complete =====
function showComplete() {
  lastCompleteType = 'quiz';
  localStorage.removeItem('quiz_resume');
  document.getElementById('btn-complete-retry').textContent = 'もう一度';
  document.getElementById('btn-fc-retry-unknown').classList.add('hidden');
  const total = quiz.sessionCorrect + quiz.sessionWrong;
  const pct   = total > 0 ? Math.round((quiz.sessionCorrect / total) * 100) : 0;
  const { correct: allCorrect, total: allTotal } = getSectionStats(quiz.section.id);
  const allCleared = allCorrect === allTotal;
  document.getElementById('complete-title').textContent = allCleared ? '🎉 セクション完全制覇！' : 'ラウンド完了！';
  document.getElementById('complete-stats').innerHTML = `
    <strong>今回の正答率:</strong> ${quiz.sessionCorrect}/${total}（${pct}%）<br>
    <strong>セクション進捗:</strong> ${allCorrect}/${allTotal} 正解<br>
    ${allCleared ? '<strong style="color:#FF6B9D">全問正解達成！✅</strong>' : ''}
  `;
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
    icon: '⭐',
    title: '復習モードを活用しよう',
    body: 'セクション画面では、バツのみ・まぐれのみ・バツ+まぐれの3パターンで集中復習できます！',
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
function openMyPage() {
  document.getElementById('profile-name-text').textContent = userName;
  document.getElementById('profile-email').textContent = userId ? `ID: ${userId}` : '';
  document.getElementById('profile-name-display').classList.remove('hidden');
  document.getElementById('profile-name-edit').classList.add('hidden');

  if (!currentBook) { showScreen('screen-mypage'); return; }

  const rec = currentRecords();
  const words = currentBook.words().filter(w => w.japanese);

  // 現在の単語帳の努力量
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

  // 全単語帳合計の習得語数
  const allMastered = BOOKS.reduce((sum, book) => {
    const br = state.bookRecords[book.id] || {};
    return sum + book.words().filter(w => w.japanese && br[w.no]?.correct).length;
  }, 0);
  const allTotal = BOOKS.reduce((sum, book) => sum + book.words().filter(w => w.japanese).length, 0);

  document.getElementById('effort-grid').innerHTML = `
    <div class="stat-item"><div class="stat-num">${masteredCount}</div><div class="stat-label">${currentBook.name}<br>習得語数</div></div>
    <div class="stat-item"><div class="stat-num">${totalAttempts}</div><div class="stat-label">総回答数</div></div>
    <div class="stat-item"><div class="stat-num">${accuracy}<span style="font-size:1rem">%</span></div><div class="stat-label">正答率</div></div>
    <div class="stat-item"><div class="stat-num">${totalWrongCount}</div><div class="stat-label">バツのある単語</div></div>
    <div class="stat-item stat-item-wide"><div class="stat-num">${allMastered}<span style="font-size:1rem"> / ${allTotal}</span></div><div class="stat-label">全単語帳 合計習得語数</div></div>
  `;

  // セクション別進捗（現在の単語帳）
  const list = document.getElementById('section-progress-list');
  list.innerHTML = '';
  currentBook.sections.forEach(sec => {
    const { correct, total } = getSectionStats(sec.id);
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const cleared = correct === total && total > 0;
    const item = document.createElement('div');
    item.className = 'sp-item';
    item.innerHTML = `
      <div class="sp-header">
        <span class="sp-label">${sec.label}${cleared ? ' ✅' : ''}</span>
        <span class="sp-pct">${correct} / ${total}（${pct}%）</span>
      </div>
      <div class="progress-bar-wrap"><div class="progress-bar" style="width:${pct}%"></div></div>
    `;
    list.appendChild(item);
  });

  renderMemoList();
  showScreen('screen-mypage');
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
function openStats() {
  document.getElementById('stats-username').textContent = userName;
  document.getElementById('streak-num').textContent  = state.streak;
  document.getElementById('streak-best').textContent = state.bestStreak;
  document.getElementById('stats-points').textContent = state.points.toLocaleString();

  renderStreakWeek();

  if (!currentBook) { showScreen('screen-stats'); return; }

  const rec = currentRecords();
  const words = currentBook.words().filter(w => w.japanese);

  // 現在の単語帳の統計
  let totalAttempts = 0, totalWrongCount = 0, masteredCount = 0;
  words.forEach(w => {
    const r = rec[w.no];
    if (!r) return;
    totalAttempts   += r.attempts   || 0;
    totalWrongCount += r.wrongCount || 0;
    if (r.correct) masteredCount++;
  });
  const totalDays = Object.keys(state.dailyLog).length;

  // 全単語帳合計の習得語数
  const allMastered = BOOKS.reduce((sum, book) => {
    const br = state.bookRecords[book.id] || {};
    return sum + book.words().filter(w => w.japanese && br[w.no]?.correct).length;
  }, 0);
  const allTotal = BOOKS.reduce((sum, book) => sum + book.words().filter(w => w.japanese).length, 0);

  document.getElementById('stats-effort-grid').innerHTML = `
    <div class="stat-item"><div class="stat-num">${masteredCount}</div><div class="stat-label">${currentBook.name}<br>習得語数</div></div>
    <div class="stat-item"><div class="stat-num">${totalDays}</div><div class="stat-label">学習した日数</div></div>
    <div class="stat-item"><div class="stat-num">${totalAttempts}</div><div class="stat-label">累計解答数</div></div>
    <div class="stat-item"><div class="stat-num">${totalAttempts - totalWrongCount}</div><div class="stat-label">正解数</div></div>
    <div class="stat-item stat-item-wide"><div class="stat-num">${allMastered}<span style="font-size:1rem"> / ${allTotal}</span></div><div class="stat-label">全単語帳 合計習得語数</div></div>
  `;

  renderLineChart(state.dailyLog, document.getElementById('stats-chart'));
  showScreen('screen-stats');
}

function renderStreakWeek() {
  const today = new Date();
  const DOW = ['日', '月', '火', '水', '木', '金', '土'];
  let html = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr  = d.toISOString().slice(0, 10);
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

    const today = new Date().toLocaleDateString('ja-JP');
    const adminBook = BOOKS.find(b => b.id === adminBookId) || BOOKS[0];
    document.getElementById('admin-stats-bar').innerHTML = `
      <div class="stat-item"><div class="stat-num">${students.length}</div><div class="stat-label">登録生徒数</div></div>
      <div class="stat-item"><div class="stat-num">${students.filter(s => s.updatedAt?.toDate().toLocaleDateString('ja-JP') === today).length}</div><div class="stat-label">本日学習</div></div>
      <div class="stat-item"><div class="stat-num">${students.filter(s => isCleared(getStudentBookRecords(s, adminBookId), adminBook)).length}</div><div class="stat-label">全問制覇</div></div>
    `;

    adminStudentsMap = {};
    students.forEach(s => { adminStudentsMap[s.uid] = s; });

    renderAdminBookTabs();
    renderAdminTable(students);
    setupAdminSearch(students);
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
      document.querySelectorAll('.admin-book-tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const students = Object.values(adminStudentsMap);
      renderAdminTable(students);
    });
    tabBar.appendChild(btn);
  });
  toolbar.parentNode.insertBefore(tabBar, toolbar);
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

function renderAdminTable(students) {
  const wrap = document.getElementById('admin-table-wrap');
  if (students.length === 0) {
    wrap.innerHTML = '<p class="loading-text">登録生徒がいません。</p>';
    return;
  }

  const adminBook = BOOKS.find(b => b.id === adminBookId) || BOOKS[0];
  const totalWords = adminBook.words().filter(w => w.japanese).length;

  let html = `
    <div class="admin-table-scroll">
    <table class="admin-table">
      <thead>
        <tr>
          <th class="col-name">氏名</th>
          <th class="col-id">ID</th>
          ${adminBook.sections.map(s => `<th class="col-sec">${s.label.replace('テスト ', 'T')}</th>`).join('')}
          <th class="col-total">合計</th>
          <th class="col-wrong">バツ数</th>
          <th class="col-update">最終更新</th>
        </tr>
      </thead>
      <tbody>
  `;

  students.forEach(student => {
    const records = getStudentBookRecords(student, adminBookId);
    const totalCorrect = adminBook.words().filter(w => w.japanese && records[w.no]?.correct).length;
    const totalWrong   = adminBook.words().filter(w => w.japanese && (records[w.no]?.wrongCount || 0) > 0).length;
    const totalPct     = totalWords > 0 ? Math.round((totalCorrect / totalWords) * 100) : 0;
    const updatedAt    = student.updatedAt?.toDate ? student.updatedAt.toDate().toLocaleDateString('ja-JP') : '—';

    html += `<tr>
      <td class="col-name col-name-link" onclick="openStudentDetail('${student.uid}')"><strong>${student.name || '—'}</strong></td>
      <td class="col-id">${student.userId || '—'}</td>
    `;

    adminBook.sections.forEach(sec => {
      const { correct, total } = calcSectionProgress(records, sec.id, adminBook);
      const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
      const cls = correct === total ? 'cell-perfect'
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
    </tr>`;
  });

  html += '</tbody></table></div>';
  wrap.innerHTML = html;
}

// ===== Student Detail Modal =====
let adminCalViewDate = new Date();

function openStudentDetail(uid) {
  const student = adminStudentsMap[uid];
  if (!student) return;
  currentDetailUid = uid;
  adminCalViewDate  = new Date();

  document.getElementById('detail-student-name').textContent = student.name || '—';

  document.getElementById('detail-student-id').textContent = student.userId || '—';
  const pwEl = document.getElementById('detail-student-pw');
  pwEl.textContent = '●●●●●●';
  pwEl.dataset.pw = student.password || '（未登録）';
  pwEl.dataset.visible = 'false';
  document.getElementById('btn-pw-toggle').textContent = '表示';

  document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('detail-tab-calendar').classList.add('active');

  renderCalendarView(student.dailyLog || {}, document.getElementById('detail-body'));
  document.getElementById('student-detail-modal').classList.remove('hidden');
}

function toggleDetailPw() {
  const pwEl  = document.getElementById('detail-student-pw');
  const btnEl = document.getElementById('btn-pw-toggle');
  if (pwEl.dataset.visible === 'true') {
    pwEl.textContent    = '●●●●●●';
    pwEl.dataset.visible = 'false';
    btnEl.textContent   = '表示';
  } else {
    pwEl.textContent    = pwEl.dataset.pw;
    pwEl.dataset.visible = 'true';
    btnEl.textContent   = '隠す';
  }
}

function calNavMonth(delta) {
  adminCalViewDate.setMonth(adminCalViewDate.getMonth() + delta);
  const student = adminStudentsMap[currentDetailUid];
  if (student) renderCalendarView(student.dailyLog || {}, document.getElementById('detail-body'));
}

function renderCalendarView(dailyLog, container) {
  const year  = adminCalViewDate.getFullYear();
  const month = adminCalViewDate.getMonth();
  const todayStr = new Date().toISOString().slice(0, 10);

  const firstDow = new Date(year, month, 1).getDay();
  const lastDay  = new Date(year, month + 1, 0).getDate();

  const values = Object.values(dailyLog).map(d => d.mastered || 0);
  const maxVal = values.length > 0 ? Math.max(...values) : 1;

  const DOW = ['日', '月', '火', '水', '木', '金', '土'];

  let html = '<div class="monthly-cal">';
  html += `
    <div class="monthly-cal-header">
      <button class="cal-nav-btn" onclick="calNavMonth(-1)">‹</button>
      <span class="monthly-cal-title">${year}年${month + 1}月</span>
      <button class="cal-nav-btn" onclick="calNavMonth(1)">›</button>
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
    const mastered = log?.mastered || 0;
    const isToday  = dateStr === todayStr;
    const dow      = new Date(year, month, day).getDay();
    const studied  = mastered > 0;
    const level    = studied ? Math.min(4, Math.ceil((mastered / maxVal) * 4)) : 0;

    html += `
      <div class="mday-cell${isToday ? ' mday-today' : ''}${dow===0?' mday-sun':dow===6?' mday-sat':''}${studied?' mday-studied':''}">
        <div class="mday-num">${day}</div>
        ${studied ? `<div class="mday-badge cal-lv${level}">${mastered}</div>` : ''}
      </div>`;
  }

  html += '</div></div>';
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
  const maxY = Math.max(...values, 10);
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

  const yTicks = [0, Math.round(maxY / 2), maxY];
  const xIdxs = [...new Set([0, Math.floor(n / 2), n - 1])];

  const svg = `<svg viewBox="0 0 ${W} ${H}" class="line-chart-svg" xmlns="http://www.w3.org/2000/svg">
    <path d="${areaPath}" class="chart-area"/>
    <polyline points="${linePoints}" class="chart-line" fill="none"/>
    ${entries.map(([, v], i) => `<circle cx="${xs(i).toFixed(1)}" cy="${ys(v.mastered || 0).toFixed(1)}" r="3" class="chart-dot"/>`).join('')}
    <line x1="${PL}" y1="${PT}" x2="${PL}" y2="${H - PB}" class="chart-axis"/>
    <line x1="${PL}" y1="${H - PB}" x2="${W - PR}" y2="${H - PB}" class="chart-axis"/>
    ${yTicks.map(v => `
      <line x1="${PL - 4}" y1="${ys(v).toFixed(1)}" x2="${PL}" y2="${ys(v).toFixed(1)}" class="chart-tick"/>
      <text x="${PL - 6}" y="${(ys(v) + 4).toFixed(1)}" class="chart-label" text-anchor="end">${v}</text>
    `).join('')}
    ${xIdxs.map(i => `<text x="${xs(i).toFixed(1)}" y="${H - PB + 14}" class="chart-label" text-anchor="middle">${entries[i][0].slice(5)}</text>`).join('')}
  </svg>`;

  container.innerHTML = `<div class="chart-wrap"><p class="chart-title">習得語数の推移（全単語帳合計）</p>${svg}</div>`;
}

function setupAdminSearch(students) {
  const searchEl = document.getElementById('admin-search');
  // 既存のリスナーを除去してから追加
  const newSearchEl = searchEl.cloneNode(true);
  searchEl.parentNode.replaceChild(newSearchEl, searchEl);
  newSearchEl.addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = q ? students.filter(s => (s.name || '').toLowerCase().includes(q) || (s.userId || '').toLowerCase().includes(q)) : students;
    renderAdminTable(filtered);
  });
}

document.getElementById('btn-admin-refresh').addEventListener('click', loadAdminData);

// ===== Admin Tab =====
function switchAdminTab(tab) {
  const isStudents = tab === 'students';
  document.getElementById('admin-panel-students').classList.toggle('hidden', !isStudents);
  document.getElementById('admin-panel-words').classList.toggle('hidden', isStudents);
  document.getElementById('admin-tab-students').classList.toggle('active', isStudents);
  document.getElementById('admin-tab-words').classList.toggle('active', !isStudents);
  if (!isStudents) renderAdminWordList();
}

// ===== Admin Word List =====
function renderAdminWordList() {
  const searchVal = (document.getElementById('admin-word-search').value || '').trim().toLowerCase();
  const sectionFilter = document.getElementById('admin-word-section-filter').value;

  // 管理画面の単語一覧は単語EX固定（将来的に拡張可能）
  const adminBook = BOOKS.find(b => b.id === 'ex') || BOOKS[0];
  const allWords = adminBook.words();

  const filtered = allWords.filter(w => {
    if (!w.japanese) return false;
    if (sectionFilter && w.section !== sectionFilter) return false;
    if (searchVal) {
      return w.word.toLowerCase().includes(searchVal) || w.japanese.includes(searchVal) || w.no.includes(searchVal);
    }
    return true;
  });

  document.getElementById('admin-word-count').textContent = `${filtered.length} 語 表示中（全 ${allWords.filter(w => w.japanese).length} 語）`;

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
      html += `<tr><td class="wl-no">${w.no}</td><td class="wl-en">${w.word}</td><td class="wl-ja">${w.japanese}</td></tr>`;
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
    const student = adminStudentsMap[currentDetailUid];
    if (!student) return;
    document.querySelectorAll('.detail-tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const body = document.getElementById('detail-body');
    body.innerHTML = '';
    if (btn.dataset.tab === 'calendar') {
      renderCalendarView(student.dailyLog || {}, body);
    } else {
      renderLineChart(student.dailyLog || {}, body);
    }
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

// ===== Flashcard =====
function startFlashcard(mode) {
  fc.mode    = mode;
  fc.section = quiz.section;
  fc.unknownNos = new Set();
  fc.tab     = 'word';
  fc.explainOpen = false;
  fc.index   = 0;

  const allWords = wordsForSection(fc.section.id);
  const rec = currentRecords();
  const applyOrder = arr => quiz.orderMode === 'sequential'
    ? [...arr].sort((a, b) => a.no.localeCompare(b.no))
    : shuffle(arr);

  let raw;
  if (mode === 'review')       raw = allWords.filter(w => (rec[w.no]?.wrongCount || 0) > 0 || rec[w.no]?.fcUnknown === true);
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
  if (!rec[fc.current.no]) {
    rec[fc.current.no] = { correct: false, attempts: 0, wrongCount: 0, lucky: false };
  }
  rec[fc.current.no].fcUnknown = !known;
  fc.index++;
  renderFCCard();
}

function showFCComplete() {
  lastCompleteType = 'flashcard';
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

  showScreen('screen-flashcard');
  renderFCCard();
}

// ===== Order Toggle =====
document.getElementById('order-toggle').addEventListener('click', (e) => {
  const btn = e.target.closest('.order-btn');
  if (!btn) return;
  document.querySelectorAll('.order-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  quiz.orderMode = btn.dataset.order;
});

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

document.getElementById('btn-back-fc').addEventListener('click', () => openMode(quiz.section));

document.getElementById('btn-review-all').addEventListener('click', () => {
  if (!currentBook) return;
  const rec = currentRecords();
  const allWrong = currentBook.words().filter(w => w.japanese && (rec[w.no]?.wrongCount || 0) > 0);
  if (allWrong.length === 0) { alert('バツのついた単語はありません。'); return; }
  quiz.section = { id: '__all__', label: '全範囲バツ復習', range: '全セクション' };
  quiz.mode = 'review'; quiz.sessionCorrect = 0; quiz.sessionWrong = 0; quiz.answered = false;
  quiz.allWords = currentBook.words().filter(w => w.japanese);
  quiz.pool = shuffle(allWrong);
  quiz.totalPool = quiz.pool.length;
  document.getElementById('quiz-section-label').textContent = '全範囲';
  document.getElementById('quiz-mode-label').textContent = '⭐ バツ復習';
  showScreen('screen-quiz');
  nextQuestion();
});
