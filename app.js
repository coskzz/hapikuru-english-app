// ===== Constants =====
const SECTIONS = [
  { id: '0001-0300', label: 'テスト 1', range: 'No.0001〜0300', count: 300 },
  { id: '0301-0600', label: 'テスト 2', range: 'No.0301〜0600', count: 300 },
  { id: '0601-0800', label: 'テスト 3', range: 'No.0601〜0800', count: 200 },
  { id: '0801-1100', label: 'テスト 4', range: 'No.0801〜1100', count: 300 },
  { id: '1101-1300', label: 'テスト 5', range: 'No.1101〜1300', count: 200 },
  { id: '1301-1600', label: 'テスト 6', range: 'No.1301〜1600', count: 300 },
  { id: '1601-1900', label: 'テスト 7', range: 'No.1601〜1900', count: 300 },
  { id: '1901-2016', label: '追加範囲', range: 'No.1901〜2016', count: 116 },
];

const STORAGE_KEY = 'hapikuru_v2';

// ===== State =====
let state = {
  // { wordNo: { correct: bool, attempts: number, wrongCount: number } }
  records: {},
};

let quiz = {
  section: null,       // SECTIONS entry
  pool: [],            // words remaining in this session
  allWords: [],        // all words for the section
  mode: 'normal',      // 'normal' | 'review'
  current: null,       // current word object
  choices: [],         // 4 choice strings
  sessionCorrect: 0,
  sessionWrong: 0,
  answered: false,
};

// ===== Storage =====
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) state = JSON.parse(raw);
  } catch (e) { state = { records: {} }; }
}
function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
function resetState() {
  if (!confirm('全データをリセットしますか？')) return;
  state = { records: {} };
  saveState();
  renderHome();
}

// ===== Helpers =====
function wordsForSection(sectionId) {
  return WORDS.filter(w => w.section === sectionId && w.japanese);
}

function getSectionStats(sectionId) {
  const words = wordsForSection(sectionId);
  const correct = words.filter(w => state.records[w.no]?.correct).length;
  const wrong   = words.filter(w => (state.records[w.no]?.wrongCount || 0) > 0 && !state.records[w.no]?.correct).length;
  return { total: words.length, correct, wrong };
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getWrongPool(sectionId) {
  const words = wordsForSection(sectionId);
  return words.filter(w => (state.records[w.no]?.wrongCount || 0) > 0);
}

// ===== Screens =====
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  el.classList.add('active');
  window.scrollTo(0, 0);
}

// ===== Home =====
function renderHome() {
  const grid = document.getElementById('section-grid');
  grid.innerHTML = '';
  SECTIONS.forEach(sec => {
    const words = wordsForSection(sec.id);
    const { correct, wrong, total } = getSectionStats(sec.id);
    const cleared = total > 0 && correct === total;
    const wrongCount = words.filter(w => (state.records[w.no]?.wrongCount || 0) > 0).length;

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

  const { correct, wrong, total } = getSectionStats(sec.id);
  const wrongWords = getWrongPool(sec.id);
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

// ===== Quiz Start =====
function startQuiz(mode) {
  quiz.mode = mode;
  quiz.sessionCorrect = 0;
  quiz.sessionWrong = 0;
  quiz.answered = false;

  const allWords = wordsForSection(quiz.section.id);
  quiz.allWords = allWords;

  if (mode === 'review') {
    quiz.pool = shuffle(getWrongPool(quiz.section.id));
  } else {
    // Normal: exclude words already correct this run. Reset per session.
    quiz.pool = shuffle(allWords.filter(w => !state.records[w.no]?.correct));
    if (quiz.pool.length === 0) {
      // All cleared — let user do full round
      quiz.pool = shuffle(allWords);
      // Reset correct flags for this section
      allWords.forEach(w => {
        if (state.records[w.no]) state.records[w.no].correct = false;
      });
      saveState();
    }
  }

  if (quiz.pool.length === 0) {
    alert('出題できる単語がありません。');
    return;
  }

  document.getElementById('quiz-section-label').textContent = quiz.section.label;
  document.getElementById('quiz-mode-label').textContent = mode === 'review' ? '⭐ バツ復習' : '通常テスト';

  showScreen('screen-quiz');
  nextQuestion();
}

// ===== Question =====
function nextQuestion() {
  if (quiz.pool.length === 0) {
    showComplete();
    return;
  }

  quiz.current = quiz.pool.shift();
  quiz.answered = false;

  // Progress
  const total = quiz.mode === 'review' ? quiz.allWords.filter(w => (state.records[w.no]?.wrongCount || 0) > 0).length : quiz.allWords.length;
  const done = quiz.sessionCorrect + quiz.sessionWrong;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('progress-text').textContent = `${done} / ${total}`;

  document.getElementById('word-display').textContent = quiz.current.word;
  document.getElementById('word-no').textContent = `No.${quiz.current.no}`;

  // Choices: 1 correct + 3 random wrong from same section
  const correctAnswer = quiz.current.japanese;
  const pool = quiz.allWords.filter(w => w.no !== quiz.current.no && w.japanese && w.japanese !== correctAnswer);
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

  const correct = quiz.current.japanese;
  const isCorrect = chosen === correct;

  // Update record
  const rec = state.records[quiz.current.no] || { correct: false, attempts: 0, wrongCount: 0 };
  rec.attempts++;
  if (isCorrect) {
    rec.correct = true;
    quiz.sessionCorrect++;
  } else {
    rec.correct = false;
    rec.wrongCount = (rec.wrongCount || 0) + 1;
    quiz.sessionWrong++;
  }
  state.records[quiz.current.no] = rec;
  saveState();

  // Highlight buttons
  document.querySelectorAll('.choice-btn').forEach(b => {
    b.disabled = true;
    if (b.textContent === correct) b.classList.add('correct');
    else if (b === btn && !isCorrect) b.classList.add('wrong');
  });

  // Result msg
  const resultEl = document.getElementById('quiz-result');
  resultEl.className = 'quiz-result ' + (isCorrect ? 'correct-msg' : 'wrong-msg');
  resultEl.textContent = isCorrect ? '⭕ 正解！' : `✗ 不正解 — 正解：${correct}`;

  // Next after delay
  setTimeout(nextQuestion, isCorrect ? 900 : 1800);
}

function hideResult() {
  const el = document.getElementById('quiz-result');
  el.className = 'quiz-result hidden';
  el.textContent = '';
}

// ===== Complete =====
function showComplete() {
  const total = quiz.sessionCorrect + quiz.sessionWrong;
  const pct = total > 0 ? Math.round((quiz.sessionCorrect / total) * 100) : 0;
  const { correct: allCorrect, total: allTotal } = getSectionStats(quiz.section.id);
  const allCleared = allCorrect === allTotal;

  document.getElementById('complete-title').textContent =
    allCleared ? '🎉 セクション完全制覇！' : 'ラウンド完了！';

  document.getElementById('complete-stats').innerHTML = `
    <strong>今回の正答率:</strong> ${quiz.sessionCorrect}/${total}（${pct}%）<br>
    <strong>セクション進捗:</strong> ${allCorrect}/${allTotal} 正解<br>
    ${allCleared ? '<strong style="color:#FF6B9D">全問正解達成！✅</strong>' : ''}
  `;

  document.getElementById('progress-bar').style.width = '100%';
  showScreen('screen-complete');
}

// ===== Event Listeners =====
document.getElementById('btn-back-home').addEventListener('click', () => {
  renderHome();
  showScreen('screen-home');
});
document.getElementById('btn-back-mode').addEventListener('click', () => {
  openMode(quiz.section);
});
document.getElementById('btn-start-normal').addEventListener('click', () => startQuiz('normal'));
document.getElementById('btn-start-review').addEventListener('click', () => startQuiz('review'));
document.getElementById('btn-complete-home').addEventListener('click', () => {
  renderHome();
  showScreen('screen-home');
});
document.getElementById('btn-complete-retry').addEventListener('click', () => startQuiz(quiz.mode));
document.getElementById('btn-reset').addEventListener('click', resetState);

document.getElementById('btn-review-all').addEventListener('click', () => {
  // All wrong words across all sections
  const allWrong = WORDS.filter(w => w.japanese && (state.records[w.no]?.wrongCount || 0) > 0);
  if (allWrong.length === 0) { alert('バツのついた単語はありません。'); return; }

  // Create a pseudo-section
  quiz.section = { id: '__all__', label: '全範囲バツ復習', range: '全セクション', count: allWrong.length };
  quiz.mode = 'review';
  quiz.sessionCorrect = 0;
  quiz.sessionWrong = 0;
  quiz.answered = false;
  quiz.allWords = WORDS.filter(w => w.japanese);
  quiz.pool = shuffle(allWrong);

  document.getElementById('quiz-section-label').textContent = '全範囲';
  document.getElementById('quiz-mode-label').textContent = '⭐ バツ復習';
  showScreen('screen-quiz');
  nextQuestion();
});

// ===== Init =====
loadState();
renderHome();
showScreen('screen-home');
