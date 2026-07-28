/* ============================================================
   CYBERSAFE PROGRESS SYSTEM — progress.js
   Global XP / achievement / streak tracker (localStorage).
   Exposed as window.CyberProgress for use by all page scripts.
   Must be loaded BEFORE any page-specific JS files.
============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY     = 'cyrix_progress';
  const OLD_STORAGE_KEY = 'cybersafe_progress'; // legacy — migrate on first load

  /* ── Levels ── */
  const LEVELS = [
    { name: 'Beginner',     min: 0,    max: 999  },
    { name: 'Intermediate', min: 1000, max: 4999 },
    { name: 'Expert',       min: 5000, max: Infinity },
  ];

  /* ── Ranks ── */
  const RANKS = [
    { name: 'Novice',          min: 0    },
    { name: 'Apprentice',      min: 101  },
    { name: 'Analyst',         min: 501  },
    { name: 'Defender',        min: 1001 },
    { name: 'Security Expert', min: 2501 },
    { name: 'Elite Hacker',    min: 5001 },
  ];

  /* ── Achievement definitions ── */
  const ACHIEVEMENTS = [
    { id: 'first_quiz',      icon: '🎯', name: 'First Step',        desc: 'Complete your first quiz',                xp: 30  },
    { id: 'perfect_quiz',   icon: '⭐', name: 'Perfect Score',      desc: 'Score 100% on a quiz',                   xp: 100 },
    { id: 'quiz_x5',        icon: '🏆', name: 'Quiz Champion',      desc: 'Complete 5 quizzes',                     xp: 75  },
    { id: 'streak_3',       icon: '🔥', name: 'Streak Starter',     desc: 'Achieve a 3-day learning streak',        xp: 40  },
    { id: 'streak_7',       icon: '💫', name: 'Dedicated Learner',  desc: 'Achieve a 7-day learning streak',        xp: 100 },
    { id: 'tools_3',        icon: '🛠️', name: 'Tool Explorer',      desc: 'Use 3 different toolkit tools',          xp: 30  },
    { id: 'tools_all',      icon: '🧰', name: 'Toolkit Master',     desc: 'Use all 8 toolkit tools',               xp: 80  },
    { id: 'first_cipher',   icon: '🔐', name: 'Cipher Rookie',      desc: 'Use the Encryption tool for the first time', xp: 20 },
    { id: 'ciphers_3',      icon: '🔑', name: 'Crypto Curious',     desc: 'Try 3 different cipher algorithms',     xp: 50  },
    { id: 'lesson_password',icon: '🛡️', name: 'Password Pro',       desc: 'Visit the Password Security lesson',    xp: 20  },
    { id: 'lesson_phishing',icon: '🎣', name: 'Phish Buster',       desc: 'Visit the Phishing lesson',             xp: 20  },
    { id: 'lesson_malware', icon: '🦠', name: 'Malware Hunter',     desc: 'Visit the Malware lesson',              xp: 20  },
    { id: 'all_lessons',    icon: '📚', name: 'Well-Rounded',       desc: 'Visit all 3 cybersecurity lessons',     xp: 50  },
    { id: 'xp_100',         icon: '💯', name: 'Century',            desc: 'Earn 100 total XP',                     xp: 0   },
    { id: 'xp_1000',        icon: '🚀', name: 'Elite',              desc: 'Earn 1000 total XP',                    xp: 0   },
  ];

  /* ── Default data shape ── */
  function defaultData() {
    return {
      name: 'CYRIX Student',
      email: '',
      avatarEmoji: '🛡️',
      xp: 0,
      quizHistory:      [],    // [{date, correct, total, pct, xp}]
      toolsUsed:        {},    // {toolId: count}
      lessonsVisited:   [],    // ['password', 'phishing', 'malware']
      encryptionAlgos:  [],    // ['caesar', 'vigenere', ...]
      encryptionUses:   0,
      achievements:     [],    // array of achievement ids
      streak: { current: 0, lastDate: null, longest: 0 },
      weeklyActivity:   {},    // {'YYYY-MM-DD': {xp, actions}}
      createdAt: new Date().toISOString(),
    };
  }

  /* ── Storage helpers ── */
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function get() {
    try {
      // Migrate data from old CyberSafe key on first load
      if (!localStorage.getItem(STORAGE_KEY)) {
        const legacy = localStorage.getItem(OLD_STORAGE_KEY);
        if (legacy) { localStorage.setItem(STORAGE_KEY, legacy); localStorage.removeItem(OLD_STORAGE_KEY); }
      }
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultData();
      return Object.assign(defaultData(), JSON.parse(raw));
    } catch (e) { return defaultData(); }
  }

  function save(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  /* ── Level / rank helpers ── */
  function getLevel(xp) {
    for (let i = LEVELS.length - 1; i >= 0; i--) {
      if (xp >= LEVELS[i].min) return LEVELS[i];
    }
    return LEVELS[0];
  }

  function getRank(xp) {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].min) return RANKS[i].name;
    }
    return RANKS[0].name;
  }

  function getLevelProgress(xp) {
    const lv = getLevel(xp);
    if (lv.max === Infinity) return { name: lv.name, pct: 100, current: xp, min: lv.min, max: xp };
    const range = lv.max - lv.min + 1;
    const pct = Math.min(100, Math.round(((xp - lv.min) / range) * 100));
    return { name: lv.name, pct, current: xp, min: lv.min, max: lv.max };
  }

  /* ── Streak ── */
  function updateStreak(data) {
    const today = todayStr();
    if (data.streak.lastDate === today) return;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    data.streak.current = (data.streak.lastDate === yStr) ? data.streak.current + 1 : 1;
    data.streak.lastDate = today;
    if (data.streak.current > data.streak.longest) data.streak.longest = data.streak.current;
  }

  /* ── Weekly activity ── */
  function updateWeeklyActivity(data, xpEarned) {
    const today = todayStr();
    if (!data.weeklyActivity[today]) data.weeklyActivity[today] = { xp: 0, actions: 0 };
    data.weeklyActivity[today].xp += xpEarned;
    data.weeklyActivity[today].actions++;
    // Keep last 14 days only
    const keys = Object.keys(data.weeklyActivity).sort().reverse();
    keys.slice(14).forEach(k => delete data.weeklyActivity[k]);
  }

  /* ── Core XP adder ── */
  function addXP(amount, data) {
    data.xp += amount;
    updateStreak(data);
    if (amount > 0) updateWeeklyActivity(data, amount);
  }

  /* ── Achievement checker ── */
  function checkAchievements(data) {
    const unlocked = [];
    const has = id => data.achievements.includes(id);

    if (!has('first_quiz')       && data.quizHistory.length >= 1)                              unlocked.push('first_quiz');
    if (!has('perfect_quiz')     && data.quizHistory.some(q => q.pct === 100))                 unlocked.push('perfect_quiz');
    if (!has('quiz_x5')          && data.quizHistory.length >= 5)                              unlocked.push('quiz_x5');
    if (!has('streak_3')         && data.streak.longest >= 3)                                  unlocked.push('streak_3');
    if (!has('streak_7')         && data.streak.longest >= 7)                                  unlocked.push('streak_7');
    if (!has('tools_3')          && Object.keys(data.toolsUsed).length >= 3)                   unlocked.push('tools_3');
    if (!has('tools_all')        && Object.keys(data.toolsUsed).length >= 8)                   unlocked.push('tools_all');
    if (!has('first_cipher')     && data.encryptionUses >= 1)                                  unlocked.push('first_cipher');
    if (!has('ciphers_3')        && data.encryptionAlgos.length >= 3)                          unlocked.push('ciphers_3');
    if (!has('lesson_password')  && data.lessonsVisited.includes('password'))                   unlocked.push('lesson_password');
    if (!has('lesson_phishing')  && data.lessonsVisited.includes('phishing'))                   unlocked.push('lesson_phishing');
    if (!has('lesson_malware')   && data.lessonsVisited.includes('malware'))                    unlocked.push('lesson_malware');
    if (!has('all_lessons')      && ['password','phishing','malware'].every(l => data.lessonsVisited.includes(l))) unlocked.push('all_lessons');
    if (!has('xp_100')           && data.xp >= 100)                                            unlocked.push('xp_100');
    if (!has('xp_1000')          && data.xp >= 1000)                                           unlocked.push('xp_1000');

    unlocked.forEach(id => {
      data.achievements.push(id);
      const a = ACHIEVEMENTS.find(a => a.id === id);
      if (a && a.xp > 0) data.xp += a.xp;
    });
    return unlocked;
  }

  /* ── Toast notification ── */
  function showToast(msg, icon = '') {
    if (window.location.pathname.includes('profile')) return;
    let container = document.getElementById('cp-toast-wrap');
    if (!container) {
      container = document.createElement('div');
      container.id = 'cp-toast-wrap';
      document.body.appendChild(container);
    }
    const t = document.createElement('div');
    t.className = 'cp-toast';
    t.textContent = (icon ? icon + ' ' : '') + msg;
    container.appendChild(t);
    setTimeout(() => { t.classList.add('cp-toast-out'); setTimeout(() => t.remove(), 400); }, 3000);
  }

  /* ── Public API ── */
  window.CyberProgress = {
    get, save, getLevel, getRank, getLevelProgress,
    ACHIEVEMENTS, LEVELS, RANKS,

    /* Called when a quiz finishes */
    completeQuiz(correct, total, pct) {
      const data = get();
      const baseXP  = correct * 10;
      const bonusXP = pct >= 90 ? 50 : pct >= 70 ? 25 : 0;
      const earned  = baseXP + bonusXP;
      addXP(earned, data);
      data.quizHistory.unshift({ date: new Date().toLocaleDateString(), correct, total, pct, xp: earned });
      if (data.quizHistory.length > 20) data.quizHistory = data.quizHistory.slice(0, 20);
      const unlocked = checkAchievements(data);
      save(data);
      showToast(`+${earned} XP from quiz!`, '🎓');
      unlocked.forEach(id => {
        const a = ACHIEVEMENTS.find(a => a.id === id);
        if (a) showToast(`Achievement unlocked: ${a.name}`, '🏆');
      });
    },

    /* Called when a toolkit tool modal opens */
    useTool(toolId) {
      const data = get();
      const isNew = !data.toolsUsed[toolId];
      data.toolsUsed[toolId] = (data.toolsUsed[toolId] || 0) + 1;
      addXP(isNew ? 15 : 5, data);
      const unlocked = checkAchievements(data);
      save(data);
      if (isNew) showToast(`+15 XP — new tool discovered!`, '🛠️');
      unlocked.forEach(id => {
        const a = ACHIEVEMENTS.find(a => a.id === id);
        if (a) showToast(`Achievement: ${a.name}`, '🏆');
      });
    },

    /* Called when a lesson page is loaded */
    visitLesson(lessonId) {
      const data = get();
      updateStreak(data);
      if (!data.lessonsVisited.includes(lessonId)) {
        data.lessonsVisited.push(lessonId);
        addXP(20, data);
        const unlocked = checkAchievements(data);
        save(data);
        showToast(`+20 XP — lesson visited!`, '📖');
        unlocked.forEach(id => {
          const a = ACHIEVEMENTS.find(a => a.id === id);
          if (a) showToast(`Achievement: ${a.name}`, '🏆');
        });
      } else {
        save(data);
      }
    },

    /* Called when encryption/decryption is performed */
    useEncryption(algoId) {
      const data = get();
      if (algoId && !data.encryptionAlgos.includes(algoId)) data.encryptionAlgos.push(algoId);
      data.encryptionUses = (data.encryptionUses || 0) + 1;
      addXP(10, data);
      const unlocked = checkAchievements(data);
      save(data);
      showToast(`+10 XP — encryption used!`, '🔐');
      unlocked.forEach(id => {
        const a = ACHIEVEMENTS.find(a => a.id === id);
        if (a) showToast(`Achievement: ${a.name}`, '🏆');
      });
    },

    /* Update profile info */
    updateProfile(name, email, avatarEmoji) {
      const data = get();
      if (name          !== undefined) data.name        = name;
      if (email         !== undefined) data.email       = email;
      if (avatarEmoji   !== undefined) data.avatarEmoji = avatarEmoji;
      save(data);
    },

    /* Reset all progress (used from profile page) */
    reset() { localStorage.removeItem(STORAGE_KEY); },
  };

})();
