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

// ===== Constants =====
const SECTIONS = [
  { id: '0001-0300', label: 'テスト 1', range: 'No.0001〜0300' },
  { id: '0301-0600', label: 'テスト 2', range: 'No.0301〜0600' },
  { id: '0601-0800', label: 'テスト 3', range: 'No.0601〜0800' },
  { id: '0801-1100', label: 'テスト 4', range: 'No.0801〜1100' },
  { id: '1101-1300', label: 'テスト 5', range: 'No.1101〜1300' },
  { id: '1301-1600', label: 'テスト 6', range: 'No.1301〜1600' },
  { id: '1601-1900', label: 'テスト 7', range: 'No.1601〜1900' },
  { id: '1901-2016', label: '追加範囲', range: 'No.1901〜2016' },
];

// ===== App State =====
let currentUser  = null;
let userRole     = 'student';
let userName     = '';
let state        = { records: {} };

let quiz = {
  section: null, pool: [], allWords: [], mode: 'normal',
  current: null, choices: [], sessionCorrect: 0, sessionWrong: 0, answered: false,
};

// ===== Screens =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

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
    userRole  = d.role  || 'student';
    userName  = d.name  || currentUser.email;
    state.records = d.records || {};
  } else {
    userRole = 'student';
    state.records = {};
  }
}

function saveState() {
  if (!currentUser) return;
  db.collection('users').doc(currentUser.uid).set(
    { records: state.records, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
    { merge: true }
  ).catch(console.error);
}

function resetState() {
  if (!confirm('全学習データをリセットしますか？\nこの操作は元に戻せません。')) return;
  state = { records: {} };
  saveState();
  renderHome();
}

// ===== Auth State Listener =====
auth.onAuthStateChanged(async (user) => {
  if (user) {
    currentUser = user;
    showScreen('screen-loading');
    await loadUserData(user.uid);

    if (userRole === 'teacher') {
      document.getElementById('admin-teacher-name').textContent = `講師: ${userName}`;
      document.getElementById('home-username').textContent = userName;
      showTabBar(true);
      setActiveTab('admin');
      renderHome();
      showScreen('screen-admin');
      loadAdminData();
    } else {
      showTabBar(false);
      document.getElementById('home-username').textContent = userName;
      renderHome();
      showScreen('screen-home');
    }
  } else {
    currentUser = null;
    showTabBar(false);
    showScreen('screen-login');
  }
});

// ===== Login =====
document.getElementById('btn-login').addEventListener('click', async () => {
  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');
  errEl.classList.add('hidden');
  if (!email || !password) { showAuthError(errEl, 'メールアドレスとパスワードを入力してください。'); return; }
  try {
    document.getElementById('btn-login').textContent = '...';
    await auth.signInWithEmailAndPassword(email, password);
  } catch (e) {
    document.getElementById('btn-login').textContent = 'ログイン';
    showAuthError(errEl, authErrorMsg(e.code));
  }
});

// ===== Signup =====
document.getElementById('btn-signup').addEventListener('click', async () => {
  const name     = document.getElementById('signup-name').value.trim();
  const email    = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const errEl    = document.getElementById('signup-error');
  errEl.classList.add('hidden');
  if (!name)     { showAuthError(errEl, 'お名前を入力してください。'); return; }
  if (!email)    { showAuthError(errEl, 'メールアドレスを入力してください。'); return; }
  if (password.length < 6) { showAuthError(errEl, 'パスワードは6文字以上で入力してください。'); return; }
  try {
    document.getElementById('btn-signup').textContent = '...';
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    await db.collection('users').doc(cred.user.uid).set({
      name, email, role: 'student', records: {},
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
document.getElementById('btn-logout').addEventListener('click', logout);
document.getElementById('btn-admin-logout').addEventListener('click', logout);

// ===== Auth helpers =====
function showAuthError(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}
function authErrorMsg(code) {
  const map = {
    'auth/user-not-found':       'メールアドレスが見つかりません。',
    'auth/wrong-password':       'パスワードが間違っています。',
    'auth/invalid-credential':   'メールアドレスまたはパスワードが正しくありません。',
    'auth/email-already-in-use': 'このメールアドレスはすでに使用されています。',
    'auth/invalid-email':        'メールアドレスの形式が正しくありません。',
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

// ===== Home =====
function wordsForSection(sectionId) {
  return WORDS.filter(w => w.section === sectionId && w.japanese);
}
function getSectionStats(sectionId) {
  const words = wordsForSection(sectionId);
  const correct    = words.filter(w => state.records[w.no]?.correct).length;
  const wrongCount = words.filter(w => (state.records[w.no]?.wrongCount || 0) > 0 && !state.records[w.no]?.correct).length;
  return { total: words.length, correct, wrongCount };
}

function renderHome() {
  const grid = document.getElementById('section-grid');
  grid.innerHTML = '';
  SECTIONS.forEach(sec => {
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
  const wrongWords = wordsForSection(sec.id).filter(w => (state.records[w.no]?.wrongCount || 0) > 0);
  document.getElementById('mode-stats').innerHTML = `
    <strong>正解済み:</strong> ${correct}/${total}<br>
    <strong>バツのある単語:</strong> ${wrongWords.length} 個<br>
    <strong>未回答:</strong> ${total - correct} 個
  `;
  const reviewBtn = document.getElementById('btn-start-review');
  reviewBtn.disabled = wrongWords.length === 0;
  reviewBtn.style.opacity = wrongWords.length === 0 ? '.4' : '1';
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
  quiz.mode = mode;
  quiz.sessionCorrect = 0;
  quiz.sessionWrong   = 0;
  quiz.answered       = false;
  const allWords = wordsForSection(quiz.section.id);
  quiz.allWords = allWords;

  if (mode === 'review') {
    quiz.pool = shuffle(allWords.filter(w => (state.records[w.no]?.wrongCount || 0) > 0));
  } else {
    quiz.pool = shuffle(allWords.filter(w => !state.records[w.no]?.correct));
    if (quiz.pool.length === 0) {
      allWords.forEach(w => { if (state.records[w.no]) state.records[w.no].correct = false; });
      saveState();
      quiz.pool = shuffle(allWords);
    }
  }
  if (quiz.pool.length === 0) { alert('出題できる単語がありません。'); return; }
  document.getElementById('quiz-section-label').textContent = quiz.section.label;
  document.getElementById('quiz-mode-label').textContent = mode === 'review' ? '⭐ バツ復習' : '通常テスト';
  showScreen('screen-quiz');
  nextQuestion();
}

function nextQuestion() {
  if (quiz.pool.length === 0) { showComplete(); return; }
  quiz.current  = quiz.pool.shift();
  quiz.answered = false;

  const total = quiz.mode === 'review'
    ? quiz.allWords.filter(w => (state.records[w.no]?.wrongCount || 0) > 0).length
    : quiz.allWords.length;
  const done = quiz.sessionCorrect + quiz.sessionWrong;
  const pct  = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${done} / ${total}`;
  document.getElementById('word-display').textContent  = quiz.current.word;
  document.getElementById('word-no').textContent       = `No.${quiz.current.no}`;

  const correctAnswer = quiz.current.japanese;
  const pool   = quiz.allWords.filter(w => w.no !== quiz.current.no && w.japanese && w.japanese !== correctAnswer);
  const wrongs = shuffle(pool).slice(0, 3).map(w => w.japanese);
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

  const resultEl = document.getElementById('quiz-result');
  resultEl.className = 'quiz-result ' + (isCorrect ? 'correct-msg' : 'wrong-msg');
  resultEl.textContent = isCorrect ? '⭕ 正解！' : `✗ 不正解 — 正解：${correct}`;

  if (!isCorrect) {
    // 不正解：即記録して「次へ」ボタンを表示
    const rec = state.records[quiz.current.no] || { correct: false, attempts: 0, wrongCount: 0, lucky: false };
    rec.attempts++;
    rec.correct   = false;
    rec.wrongCount = (rec.wrongCount || 0) + 1;
    rec.lucky     = false;
    state.records[quiz.current.no] = rec;
    quiz.sessionWrong++;
    saveState();
    showNextArea('wrong');
  } else {
    // 正解：確信度を聞いてから記録
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

function confirmAnswer(isLucky) {
  const rec = state.records[quiz.current.no] || { correct: false, attempts: 0, wrongCount: 0, lucky: false };
  rec.attempts++;
  rec.correct = true;
  rec.lucky   = isLucky;
  state.records[quiz.current.no] = rec;
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

// ===== Complete =====
function showComplete() {
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

// ===== My Page =====
function openMyPage() {
  // プロフィール表示
  document.getElementById('profile-name-text').textContent = userName;
  document.getElementById('profile-email').textContent = currentUser.email;
  document.getElementById('profile-name-display').classList.remove('hidden');
  document.getElementById('profile-name-edit').classList.add('hidden');

  // 努力量
  const records = state.records;
  let totalAttempts = 0, totalAnsweredCorrect = 0, totalWrongCount = 0, masteredCount = 0;
  WORDS.filter(w => w.japanese).forEach(w => {
    const r = records[w.no];
    if (!r) return;
    totalAttempts       += r.attempts  || 0;
    totalWrongCount     += r.wrongCount || 0;
    if (r.correct) masteredCount++;
  });
  totalAnsweredCorrect = totalAttempts - totalWrongCount;
  const accuracy = totalAttempts > 0 ? Math.round((totalAnsweredCorrect / totalAttempts) * 100) : 0;

  document.getElementById('effort-grid').innerHTML = `
    <div class="stat-item"><div class="stat-num">${masteredCount}</div><div class="stat-label">単語マスター数</div></div>
    <div class="stat-item"><div class="stat-num">${totalAttempts}</div><div class="stat-label">総回答数</div></div>
    <div class="stat-item"><div class="stat-num">${accuracy}<span style="font-size:1rem">%</span></div><div class="stat-label">正答率</div></div>
    <div class="stat-item"><div class="stat-num">${totalWrongCount}</div><div class="stat-label">バツのある単語</div></div>
  `;

  // セクション別進捗
  const list = document.getElementById('section-progress-list');
  list.innerHTML = '';
  SECTIONS.forEach(sec => {
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

  showScreen('screen-mypage');
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

// ===== Admin =====
async function loadAdminData() {
  const wrap = document.getElementById('admin-table-wrap');
  wrap.innerHTML = '<p class="loading-text">データを読み込み中...</p>';
  document.getElementById('admin-stats-bar').innerHTML = '';

  try {
    const snapshot = await db.collection('users').where('role', '==', 'student').get();
    const students = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    students.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ja'));

    // Stats bar
    const today = new Date().toLocaleDateString('ja-JP');
    document.getElementById('admin-stats-bar').innerHTML = `
      <div class="stat-item"><div class="stat-num">${students.length}</div><div class="stat-label">登録生徒数</div></div>
      <div class="stat-item"><div class="stat-num">${students.filter(s => s.updatedAt?.toDate().toLocaleDateString('ja-JP') === today).length}</div><div class="stat-label">本日学習</div></div>
      <div class="stat-item"><div class="stat-num">${students.filter(s => isCleared(s.records)).length}</div><div class="stat-label">全問制覇</div></div>
    `;

    renderAdminTable(students);
    setupAdminSearch(students);
  } catch (e) {
    wrap.innerHTML = `<p style="color:red;padding:16px">読み込みエラー: ${e.message}<br>Firestoreのルール設定を確認してください。</p>`;
  }
}

function isCleared(records) {
  if (!records) return false;
  return WORDS.filter(w => w.japanese).every(w => records[w.no]?.correct);
}

function calcSectionProgress(records, sectionId) {
  const words   = WORDS.filter(w => w.section === sectionId && w.japanese);
  const correct = words.filter(w => records?.[w.no]?.correct).length;
  return { correct, total: words.length };
}

function renderAdminTable(students) {
  const wrap = document.getElementById('admin-table-wrap');
  if (students.length === 0) {
    wrap.innerHTML = '<p class="loading-text">登録生徒がいません。</p>';
    return;
  }

  let html = `
    <div class="admin-table-scroll">
    <table class="admin-table">
      <thead>
        <tr>
          <th class="col-name">氏名</th>
          ${SECTIONS.map(s => `<th class="col-sec">${s.label.replace('テスト ', 'T')}</th>`).join('')}
          <th class="col-total">合計</th>
          <th class="col-wrong">バツ数</th>
          <th class="col-update">最終更新</th>
        </tr>
      </thead>
      <tbody>
  `;

  const totalWords = WORDS.filter(w => w.japanese).length;

  students.forEach(student => {
    const records = student.records || {};
    const totalCorrect = WORDS.filter(w => w.japanese && records[w.no]?.correct).length;
    const totalWrong   = WORDS.filter(w => w.japanese && (records[w.no]?.wrongCount || 0) > 0).length;
    const totalPct     = Math.round((totalCorrect / totalWords) * 100);
    const updatedAt    = student.updatedAt?.toDate ? student.updatedAt.toDate().toLocaleDateString('ja-JP') : '—';

    html += `<tr>
      <td class="col-name"><strong>${student.name || '—'}</strong><br><small>${student.email || ''}</small></td>
    `;

    SECTIONS.forEach(sec => {
      const { correct, total } = calcSectionProgress(records, sec.id);
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

function setupAdminSearch(students) {
  document.getElementById('admin-search').addEventListener('input', (e) => {
    const q = e.target.value.trim().toLowerCase();
    const filtered = q ? students.filter(s => (s.name || '').toLowerCase().includes(q) || (s.email || '').includes(q)) : students;
    renderAdminTable(filtered);
  });
}

document.getElementById('btn-admin-refresh').addEventListener('click', loadAdminData);

// ===== Navigation =====
document.getElementById('btn-mypage').addEventListener('click', openMyPage);
document.getElementById('btn-back-mypage').addEventListener('click', () => { renderHome(); showScreen('screen-home'); });
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
document.getElementById('btn-back-mode').addEventListener('click', () => { openMode(quiz.section); });
document.getElementById('btn-start-normal').addEventListener('click', () => startQuiz('normal'));
document.getElementById('btn-start-review').addEventListener('click', () => startQuiz('review'));
document.getElementById('btn-complete-home').addEventListener('click', () => { renderHome(); showScreen('screen-home'); });
document.getElementById('btn-complete-retry').addEventListener('click', () => startQuiz(quiz.mode));
document.getElementById('btn-reset').addEventListener('click', resetState);

// ===== Teacher Tab Bar Click =====
document.getElementById('tab-admin').addEventListener('click', () => {
  setActiveTab('admin');
  showScreen('screen-admin');
  loadAdminData();
});
document.getElementById('tab-student').addEventListener('click', () => {
  setActiveTab('student');
  renderHome();
  showScreen('screen-home');
});

document.getElementById('btn-review-all').addEventListener('click', () => {
  const allWrong = WORDS.filter(w => w.japanese && (state.records[w.no]?.wrongCount || 0) > 0);
  if (allWrong.length === 0) { alert('バツのついた単語はありません。'); return; }
  quiz.section = { id: '__all__', label: '全範囲バツ復習', range: '全セクション' };
  quiz.mode = 'review'; quiz.sessionCorrect = 0; quiz.sessionWrong = 0; quiz.answered = false;
  quiz.allWords = WORDS.filter(w => w.japanese);
  quiz.pool = shuffle(allWrong);
  document.getElementById('quiz-section-label').textContent = '全範囲';
  document.getElementById('quiz-mode-label').textContent = '⭐ バツ復習';
  showScreen('screen-quiz');
  nextQuestion();
});
