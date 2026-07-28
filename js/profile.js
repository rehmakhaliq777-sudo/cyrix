/* ============================================================
   PROFILE DASHBOARD — profile.js
   Reads from CyberProgress (localStorage) and renders the
   full dashboard: hero, stats, charts, achievements, history.
============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const P = window.CyberProgress;
  if (!P) return;

  /* ── Avatar picker ── */
  const avatarEl   = document.getElementById('prof-avatar');
  const avatarBtn  = document.getElementById('prof-avatar-btn');
  const emojiPicker = document.getElementById('prof-emoji-picker');

  avatarBtn && avatarBtn.addEventListener('click', () => {
    emojiPicker.style.display = emojiPicker.style.display === 'none' ? 'grid' : 'none';
  });

  emojiPicker && emojiPicker.querySelectorAll('.pe-emoji').forEach(span => {
    span.addEventListener('click', () => {
      const emoji = span.dataset.emoji;
      P.updateProfile(undefined, undefined, emoji);
      avatarEl.textContent = emoji;
      emojiPicker.style.display = 'none';
    });
  });

  document.addEventListener('click', (e) => {
    if (emojiPicker && !emojiPicker.contains(e.target) && e.target !== avatarBtn) {
      emojiPicker.style.display = 'none';
    }
  });

  /* ── Inline name / email editing ── */
  function makeEditable(spanId, btnId, field) {
    const span = document.getElementById(spanId);
    const btn  = document.getElementById(btnId);
    if (!span || !btn) return;
    btn.addEventListener('click', () => {
      const current = span.textContent;
      const input = document.createElement('input');
      input.type = 'text';
      input.value = current;
      input.className = 'prof-inline-input';
      span.replaceWith(input);
      input.focus();
      input.select();
      function commit() {
        const val = input.value.trim() || current;
        const newSpan = document.createElement('span');
        newSpan.id = spanId;
        newSpan.className = span.className;
        newSpan.textContent = val;
        input.replaceWith(newSpan);
        P.updateProfile(
          field === 'name'  ? val : undefined,
          field === 'email' ? val : undefined
        );
        makeEditable(spanId, btnId, field);
      }
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); });
    });
  }
  makeEditable('prof-name',  'prof-edit-name',  'name');
  makeEditable('prof-email', 'prof-edit-email', 'email');

  /* ── Reset button ── */
  const resetBtn = document.getElementById('prof-reset-btn');
  resetBtn && resetBtn.addEventListener('click', () => {
    if (confirm('This will delete all your XP, history, and achievements. Are you sure?')) {
      P.reset();
      render();
    }
  });

  /* ══════════════════════════════════════════════════════════
     RENDER
  ══════════════════════════════════════════════════════════ */
  function render() {
    const data = P.get();
    renderHero(data);
    renderStats(data);
    renderLevelProgress(data);
    renderWeeklyChart(data);
    renderQuizRing(data);
    renderAchievements(data);
    renderQuizHistory(data);
  }

  /* ── Hero ── */
  function renderHero(data) {
    const avatar = document.getElementById('prof-avatar');
    if (avatar) avatar.textContent = data.avatarEmoji || '🛡️';

    setText('prof-name',         data.name  || 'CYRIX Student');
    setText('prof-email',        data.email || 'Click ✎ to add email');
    setText('prof-xp-total',     data.xp.toLocaleString());

    const lv = P.getLevel(data.xp);
    const levelEl = document.getElementById('prof-level-badge');
    if (levelEl) {
      levelEl.textContent = lv.name;
      levelEl.className = 'prof-level-badge lv-' + lv.name.toLowerCase();
    }
    setText('prof-rank-badge',   P.getRank(data.xp));
    setText('prof-streak-badge', `🔥 ${data.streak.current}-day streak`);
  }

  /* ── Stats grid ── */
  function renderStats(data) {
    const quizCount = data.quizHistory.length;
    const avgPct    = quizCount
      ? Math.round(data.quizHistory.reduce((a, q) => a + q.pct, 0) / quizCount)
      : 0;
    const toolCount = Object.keys(data.toolsUsed).length;

    const stats = [
      { icon: '⚡', label: 'Total XP',          value: data.xp.toLocaleString(),          colour: '#06B6D4' },
      { icon: '📝', label: 'Quizzes Taken',      value: quizCount,                          colour: '#8B5CF6' },
      { icon: '🎯', label: 'Quiz Average',        value: avgPct + '%',                       colour: '#22C55E' },
      { icon: '🛠️', label: 'Tools Used',          value: `${toolCount} / 8`,                 colour: '#F59E0B' },
      { icon: '📖', label: 'Lessons Visited',     value: `${data.lessonsVisited.length} / 3`,colour: '#EC4899' },
      { icon: '🔐', label: 'Encryptions',         value: data.encryptionUses || 0,            colour: '#10B981' },
      { icon: '🔥', label: 'Longest Streak',      value: `${data.streak.longest} days`,      colour: '#EF4444' },
      { icon: '🏆', label: 'Achievements',        value: `${data.achievements.length} / ${P.ACHIEVEMENTS.length}`, colour: '#F59E0B' },
    ];

    const grid = document.getElementById('prof-stats-grid');
    if (!grid) return;
    grid.innerHTML = stats.map(s => `
      <div class="prof-stat-card" style="--stat-colour:${s.colour};">
        <div class="prof-stat-icon">${s.icon}</div>
        <div class="prof-stat-value">${s.value}</div>
        <div class="prof-stat-label">${s.label}</div>
        <div class="prof-stat-glow"></div>
      </div>
    `).join('');
  }

  /* ── Level progress card ── */
  function renderLevelProgress(data) {
    const wrap = document.getElementById('prof-level-wrap');
    if (!wrap) return;
    const lp = P.getLevelProgress(data.xp);
    const nextLevel = P.LEVELS.find(l => l.min > data.xp);
    const xpToNext  = nextLevel ? (nextLevel.min - data.xp) : 0;

    wrap.innerHTML = `
      <div class="prof-lv-ring-wrap">
        <div class="prof-lv-ring" style="background:conic-gradient(var(--accent) ${lp.pct}%, rgba(6,182,212,0.1) ${lp.pct}%);">
          <div class="prof-lv-ring-inner">
            <span class="prof-lv-pct">${lp.pct}%</span>
          </div>
        </div>
      </div>
      <div class="prof-lv-info">
        <div class="prof-lv-current">
          <span class="prof-lv-badge lv-${lp.name.toLowerCase()}">${lp.name}</span>
        </div>
        ${nextLevel
          ? `<p class="prof-lv-next"><strong>${xpToNext.toLocaleString()} XP</strong> to ${nextLevel.name}</p>`
          : `<p class="prof-lv-next">🎉 Maximum level reached!</p>`}
        <div class="prof-lv-bar-wrap">
          <div class="prof-lv-bar"><div class="prof-lv-bar-fill" style="width:${lp.pct}%;"></div></div>
          <div class="prof-lv-bar-labels">
            <span>${lp.min.toLocaleString()} XP</span>
            <span>${lp.max === data.xp ? '∞' : (lp.max + 1).toLocaleString()} XP</span>
          </div>
        </div>
        <div class="prof-rank-display">Rank: <strong>${P.getRank(data.xp)}</strong></div>
      </div>
    `;
  }

  /* ── Weekly activity bar chart ── */
  function renderWeeklyChart(data) {
    const wrap = document.getElementById('prof-weekly-chart');
    if (!wrap) return;

    // Build last 7 days
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key   = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString('en-US', { weekday: 'short' });
      const act   = data.weeklyActivity[key] || { xp: 0, actions: 0 };
      days.push({ label, xp: act.xp, actions: act.actions });
    }

    const maxXP = Math.max(...days.map(d => d.xp), 1);

    wrap.innerHTML = `
      <div class="wk-bars">
        ${days.map(d => `
          <div class="wk-bar-wrap" title="${d.xp} XP on ${d.label}">
            <div class="wk-bar-col">
              <div class="wk-bar-fill" style="height:${Math.round((d.xp / maxXP) * 100)}%;" data-xp="${d.xp}"></div>
            </div>
            <div class="wk-label">${d.label}</div>
          </div>
        `).join('')}
      </div>
      <div class="wk-legend">XP earned per day (last 7 days)</div>
    `;

    // Animate bars in
    setTimeout(() => {
      wrap.querySelectorAll('.wk-bar-fill').forEach((bar, i) => {
        bar.style.transition = `height 0.5s ease ${i * 0.07}s`;
      });
    }, 50);
  }

  /* ── Quiz average ring ── */
  function renderQuizRing(data) {
    const wrap = document.getElementById('prof-ring-wrap');
    if (!wrap) return;
    const quizCount = data.quizHistory.length;
    const avgPct    = quizCount
      ? Math.round(data.quizHistory.reduce((a, q) => a + q.pct, 0) / quizCount)
      : 0;
    const colour = avgPct >= 90 ? '#22C55E' : avgPct >= 70 ? '#06B6D4' : avgPct >= 50 ? '#F59E0B' : '#EF4444';

    wrap.innerHTML = `
      <div class="prof-quiz-ring" style="background:conic-gradient(${colour} ${avgPct}%, rgba(255,255,255,0.06) ${avgPct}%);">
        <div class="prof-quiz-ring-inner">
          <span class="prof-quiz-pct" style="color:${colour};">${avgPct}%</span>
          <span class="prof-quiz-sub">${quizCount} quiz${quizCount !== 1 ? 'zes' : ''}</span>
        </div>
      </div>
      <p class="prof-quiz-label">${
        quizCount === 0 ? 'Take a quiz to see your average!' :
        avgPct >= 90 ? 'Outstanding performance!' :
        avgPct >= 70 ? 'Great cybersecurity knowledge!' :
        avgPct >= 50 ? 'Keep learning and improving!' :
        'Review the lessons and try again!'
      }</p>
    `;
  }

  /* ── Achievements grid ── */
  function renderAchievements(data) {
    const grid = document.getElementById('prof-badges-grid');
    const countEl = document.getElementById('prof-badge-count');
    if (!grid) return;

    const unlocked = data.achievements.length;
    if (countEl) countEl.textContent = `${unlocked} / ${P.ACHIEVEMENTS.length}`;

    grid.innerHTML = P.ACHIEVEMENTS.map(a => {
      const isUnlocked = data.achievements.includes(a.id);
      return `
        <div class="prof-badge ${isUnlocked ? 'unlocked' : 'locked'}" title="${a.desc}${a.xp ? ' (+' + a.xp + ' XP)' : ''}">
          <div class="prof-badge-icon">${isUnlocked ? a.icon : '🔒'}</div>
          <div class="prof-badge-name">${a.name}</div>
          <div class="prof-badge-desc">${a.desc}</div>
          ${a.xp ? `<div class="prof-badge-xp">+${a.xp} XP</div>` : ''}
        </div>
      `;
    }).join('');
  }

  /* ── Quiz history table ── */
  function renderQuizHistory(data) {
    const wrap = document.getElementById('prof-quiz-history');
    if (!wrap) return;

    if (!data.quizHistory.length) {
      wrap.innerHTML = '<p class="prof-empty">No quizzes taken yet. <a href="/quiz.html">Take your first quiz!</a></p>';
      return;
    }

    wrap.innerHTML = `
      <div class="prof-table-wrap">
        <table class="prof-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Date</th>
              <th>Score</th>
              <th>Percentage</th>
              <th>XP Earned</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            ${data.quizHistory.map((q, i) => {
              const colour = q.pct >= 90 ? '#22C55E' : q.pct >= 70 ? '#06B6D4' : q.pct >= 50 ? '#F59E0B' : '#EF4444';
              const label  = q.pct >= 90 ? 'Excellent' : q.pct >= 70 ? 'Good' : q.pct >= 50 ? 'Fair' : 'Keep Learning';
              return `<tr>
                <td>${i + 1}</td>
                <td>${q.date}</td>
                <td>${q.correct} / ${q.total}</td>
                <td><span class="prof-pct-badge" style="background:${colour}20;color:${colour};border:1px solid ${colour}40;">${q.pct}%</span></td>
                <td class="prof-xp-cell">+${q.xp} XP</td>
                <td><span style="color:${colour};">${label}</span></td>
              </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  /* ── Utility ── */
  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ── Initial render ── */
  render();
});
