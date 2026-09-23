(function () {
  'use strict';

  var STORE = 'malay-practice-v1';

  // ---------- state ----------
  var state = {
    screen: 'home',
    unit: null,          // id of the unit being practised
    scope: 'both',       // words | phrases | both
    mode: 'listen',      // listen | recall | quiz
    volume: 'mid',
    currency: 'dolar',   // dolar (SG) | ringgit (MY)
    numDir: 'hear',      // hear -> type, or see -> say
    numLevel: 'priceCents',
    numSlow: false,
    stats: {},           // key -> { seen, wrong }
    custom: {},          // unitId -> [[ms, en, lit, note], ...]
    right: 0,
    total: 0,
    item: null,
    exam: null,
    locked: false
  };

  function $(id) { return document.getElementById(id); }
  function all(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function load() {
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE)); } catch (e) { saved = null; }
    if (!saved) return;
    state.stats = saved.stats || {};
    state.custom = saved.custom || {};

    // The at-home section was filed under a different id to begin with.
    // Anything added while it was follows it across rather than vanishing.
    if (state.custom.pembantu && !state.custom.rumah) {
      state.custom.rumah = state.custom.pembantu;
      delete state.custom.pembantu;
    }
    if (saved.volume) state.volume = saved.volume;
    if (saved.currency) state.currency = saved.currency;
    if (saved.scope) state.scope = saved.scope;
    if (saved.numDir) state.numDir = saved.numDir;
    if (saved.numLevel) state.numLevel = saved.numLevel;
  }

  function save() {
    try {
      localStorage.setItem(STORE, JSON.stringify({
        stats: state.stats, custom: state.custom, volume: state.volume,
        currency: state.currency, scope: state.scope,
        numDir: state.numDir, numLevel: state.numLevel
      }));
    } catch (e) { /* private browsing - just do not persist */ }
  }

  function stat(key) {
    if (!state.stats[key]) state.stats[key] = { seen: 0, wrong: 0 };
    return state.stats[key];
  }

  // ---------- the course, flattened ----------
  // Units carry compact arrays. Everything below wants objects, so the shape
  // is normalised once, here, rather than being unpacked at every use.
  function unitById(id) {
    for (var i = 0; i < UNITS.length; i++) if (UNITS[i].id === id) return UNITS[i];
    return UNITS[0];
  }

  function wordItems(u) {
    return u.words.map(function (w) {
      return { ms: w[0], en: w[1], lit: '', note: '', id: '', type: 'word',
               unit: u.id, key: u.id + '|w|' + w[0] };
    });
  }

  function phraseItems(u) {
    var out = u.phrases.map(function (p) {
      return { ms: p[0], en: p[1], lit: p[2] || '', note: p[3] || '', id: p[4] || '',
               type: 'phrase', unit: u.id, key: u.id + '|p|' + p[0] };
    });
    (state.custom[u.id] || []).forEach(function (p, i) {
      out.push({ ms: p[0], en: p[1], lit: p[2] || '', note: p[3] || '', id: '',
                 type: 'phrase', mine: true, index: i,
                 unit: u.id, key: u.id + '|c|' + p[0] });
    });
    return out;
  }

  function itemsFor(u, scope) {
    if (scope === 'words') return wordItems(u);
    if (scope === 'phrases') return phraseItems(u);
    return wordItems(u).concat(phraseItems(u));
  }

  function pool() {
    return itemsFor(unitById(state.unit), state.scope);
  }

  // ---------- picking what comes next ----------
  // Two things push an item to the front of the queue: barely having been
  // tested, and having been got wrong.
  function weightFor(key) {
    var s = stat(key);
    return 1 + Math.max(0, 4 - s.seen) * 2 + s.wrong * 4;
  }

  var recent = [];
  function remember(key) { recent.push(key); while (recent.length > 4) recent.shift(); }
  function forgetRecent() { recent = []; }

  function pickFrom(list) {
    if (!list.length) return null;
    var fresh = list.filter(function (i) { return recent.indexOf(i.key) === -1; });
    if (fresh.length >= 2) list = fresh;
    var weights = list.map(function (i) { return weightFor(i.key); });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    var roll = Math.random() * total;
    for (var i = 0; i < list.length; i++) {
      roll -= weights[i];
      if (roll <= 0) return list[i];
    }
    return list[list.length - 1];
  }

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }

  // ---------- saying it out loud ----------
  // The browser's own speech synthesis: nothing to host, nothing to license,
  // and it works offline. Malay voices are not installed everywhere, so an
  // Indonesian voice is the fallback - the two are close enough in sound that
  // a learner is not misled, and the app says which one it found.
  var speech = { ok: false, voice: null, label: '' };

  try {
    speech.ok = !!(window.speechSynthesis && typeof window.SpeechSynthesisUtterance === 'function');
  } catch (e) { speech.ok = false; }

  function chooseVoice() {
    if (!speech.ok) return;
    var voices = [];
    try { voices = window.speechSynthesis.getVoices() || []; } catch (e) { voices = []; }
    if (!voices.length) return;

    var order = [/^ms[-_]MY/i, /^ms\b/i, /^id[-_]ID/i, /^id\b/i];
    for (var r = 0; r < order.length; r++) {
      for (var i = 0; i < voices.length; i++) {
        if (order[r].test(voices[i].lang)) {
          speech.voice = voices[i];
          speech.label = /^ms/i.test(voices[i].lang)
            ? 'Reading with a Malay voice.'
            : 'No Malay voice on this device, so an Indonesian one is reading. The sounds are near enough to learn from.';
          showVoiceNote();
          return;
        }
      }
    }
    speech.voice = null;
    speech.label = 'No Malay or Indonesian voice is installed here, so your ' +
                   'device is reading with whatever it has. The words are right; ' +
                   'the accent will not be.';
    showVoiceNote();
  }

  function showVoiceNote() {
    var el = $('voiceNote');
    if (!el) return;
    el.textContent = speech.ok ? speech.label : 'This browser cannot speak, so the listening modes are hidden.';
  }

  if (speech.ok) {
    chooseVoice();
    try { window.speechSynthesis.onvoiceschanged = chooseVoice; } catch (e) {}
  }

  var VOLUMES = { off: 0, low: 0.3, mid: 0.6, high: 1 };
  function volumeLevel() {
    return typeof VOLUMES[state.volume] === 'number' ? VOLUMES[state.volume] : VOLUMES.mid;
  }
  function soundOn() { return speech.ok && volumeLevel() > 0; }

  function utter(text, volume, rate) {
    var u = new window.SpeechSynthesisUtterance(text);
    u.lang = speech.voice ? speech.voice.lang : 'ms-MY';
    if (speech.voice) u.voice = speech.voice;
    u.rate = typeof rate === 'number' ? rate : (state.numSlow ? 0.62 : 0.88);
    u.pitch = 0.95;
    u.volume = (typeof volume === 'number') ? volume : volumeLevel();
    return u;
  }

  // The first speak of a page's life is often dropped outright, which is why a
  // listen button can need tapping twice. Opening the audio session on the
  // first touch anywhere means it is already warm when audio is asked for.
  var primed = false;
  function primeSpeech() {
    if (!speech.ok || primed) return;
    primed = true;
    try { window.speechSynthesis.speak(utter(' ', 0)); } catch (e) {}
  }
  if (speech.ok) {
    try {
      document.addEventListener('pointerdown', primeSpeech, true);
      document.addEventListener('click', primeSpeech, true);
    } catch (e) {}
  }

  function say(text, rate) {
    if (!soundOn() || !text) return;
    if (!speech.voice) chooseVoice();
    primeSpeech();
    try {
      var go = function () {
        // Browsers pause the speech engine when the page has been idle, and it
        // stays paused - which looks exactly like the audio having broken.
        // Resuming costs nothing when it is not paused.
        try { window.speechSynthesis.resume(); } catch (e) {}
        window.speechSynthesis.speak(utter(' ', 0));     // warm the session
        window.speechSynthesis.speak(utter(text, undefined, rate));
      };
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
        setTimeout(go, 80);
      } else { go(); }
    } catch (e) { /* not worth interrupting practice over */ }
  }

  function setListenButton(btn) {
    if (!btn) return;
    btn.classList.toggle('hidden', !speech.ok);
    btn.classList.toggle('listen-off', !soundOn());
    btn.textContent = soundOn() ? '♪ listen' : '♪ sound is off';
  }

  // ---------- screens ----------
  var SCREENS = ['home', 'unit', 'drill', 'quiz', 'browse', 'numHome', 'num', 'exam'];
  var SECTION = { home: 'homeScreen', unit: 'unitScreen', drill: 'drillScreen',
                  quiz: 'quizScreen', browse: 'browseScreen', numHome: 'numHomeScreen',
                  num: 'numScreen', exam: 'examScreen' };

  function show(name) {
    state.screen = name;
    SCREENS.forEach(function (s) { $(SECTION[s]).classList.toggle('hidden', s !== name); });
    var body = $(SECTION[name]).querySelector('.scroll-body, .browse-scroll, .card-scroll, .exam-scroll, .num-body');
    if (body) body.scrollTop = 0;
  }

  function updateScore() {
    all('.js-right').forEach(function (e) { e.textContent = state.right; });
    all('.js-total').forEach(function (e) { e.textContent = state.total; });
  }

  // ---------- home ----------
  // A unit's progress is how many of its items have been seen at least twice.
  function unitProgress(u) {
    var items = itemsFor(u, 'both');
    var done = items.filter(function (i) { return stat(i.key).seen >= 2; }).length;
    return { done: done, total: items.length, pct: items.length ? done / items.length : 0 };
  }

  function unitButton(u, n) {
    var p = unitProgress(u);
    var b = document.createElement('button');
    b.className = 'unit-row' + (u.featured ? ' unit-row-feature' : '');
    b.dataset.unit = u.id;
    b.innerHTML =
      '<span class="unit-index">' + (n || '★') + '</span>' +
      '<span class="unit-text">' +
        '<span class="unit-name">' + u.name + '</span>' +
        '<span class="unit-malay">' + u.malay + '</span>' +
        '<span class="unit-sub">' + u.sub + '</span>' +
      '</span>' +
      '<span class="unit-prog"><span class="unit-bar"><i style="width:' +
        Math.round(p.pct * 100) + '%"></i></span>' +
        '<span class="unit-count">' + p.done + '/' + p.total + '</span></span>';
    b.addEventListener('click', function () { openUnit(u.id); });
    return b;
  }

  function renderHome() {
    var feat = $('featuredList'), list = $('unitList');
    feat.innerHTML = '';
    list.innerHTML = '';
    var n = 0;
    UNITS.forEach(function (u) {
      if (u.featured) { feat.appendChild(unitButton(u, null)); }
      else { n++; list.appendChild(unitButton(u, n)); }
    });
    all('[data-vol]').forEach(function (b) { b.classList.toggle('on', b.dataset.vol === state.volume); });
    all('[data-cur]').forEach(function (b) { b.classList.toggle('on', b.dataset.cur === state.currency); });
    $('volumeWrap').classList.toggle('hidden', !speech.ok);
    showVoiceNote();
  }

  // ---------- unit screen ----------
  function openUnit(id) {
    state.unit = id;
    var u = unitById(id);
    $('unitBarName').textContent = u.name;
    $('unitMalay').textContent = u.malay;
    $('unitEnglish').textContent = u.name;
    $('unitNote').textContent = u.note;
    renderScope();
    renderWeak();
    show('unit');
  }

  function renderScope() {
    var u = unitById(state.unit);
    all('[data-scope]').forEach(function (b) { b.classList.toggle('on', b.dataset.scope === state.scope); });
    var w = wordItems(u).length, p = phraseItems(u).length;
    $('scopeCount').textContent = w + ' words and ' + p + ' phrases in this unit — ' +
      pool().length + ' being drilled.';
    $('browseCount').textContent = 'Read all ' + (w + p) + ' of them';
    all('#goListen, #goQuiz').forEach(function (b) { b.classList.toggle('hidden', !speech.ok); });
  }

  function renderWeak() {
    var items = itemsFor(unitById(state.unit), 'both')
      .filter(function (i) { return stat(i.key).wrong > 0; })
      .sort(function (a, b) { return stat(b.key).wrong - stat(a.key).wrong; })
      .slice(0, 6);
    $('unitWeak').innerHTML = items.length
      ? '<span class="weak-label">Coming back to you</span> ' +
        items.map(function (i) { return '<span class="weak-item">' + i.ms + '</span>'; }).join('')
      : '';
  }

  // ---------- drill: listen & repeat, and english to malay ----------
  function startDrill(mode) {
    if (!pool().length) return;
    state.mode = mode;
    state.right = 0; state.total = 0;
    state.exam = null;
    forgetRecent();
    updateScore();
    $('drillTitle').textContent = mode === 'listen' ? 'Listen & repeat' : 'English → Malay';
    show('drill');
    nextDrill();
  }

  function nextDrill() {
    var item = state.exam ? state.exam.queue[state.exam.at] : pickFrom(pool());
    if (!item) return;
    state.item = item;
    state.locked = false;

    $('drillAnswer').classList.add('hidden');
    $('drillActions').classList.remove('hidden');
    $('drillGrade').classList.add('hidden');

    var listenMode = (state.exam ? state.exam.mode : state.mode) === 'listen';

    if (listenMode) {
      $('drillPrompt').textContent = item.ms;
      $('drillPromptSub').textContent = 'say it out loud, then check what it means';
      setListenButton($('drillListen'));
      say(item.ms);
    } else {
      $('drillPrompt').textContent = item.en;
      $('drillPromptSub').textContent = 'say it in Malay, then check';
      $('drillListen').classList.add('hidden');
    }
  }

  function revealDrill() {
    if (state.locked) return;
    state.locked = true;
    var item = state.item;
    var listenMode = (state.exam ? state.exam.mode : state.mode) === 'listen';

    $('drillMalay').textContent = item.ms;
    $('drillMalay').classList.toggle('hidden', listenMode);
    $('drillEnglish').textContent = item.en;
    $('drillLit').textContent = item.lit ? item.lit : '';
    $('drillLit').classList.toggle('hidden', !item.lit);

    var extra = '';
    if (item.note) extra += item.note;
    if (item.id) extra += (extra ? '  ' : '') + 'Indonesian: ' + item.id;
    $('drillNote').textContent = extra;
    $('drillNote').classList.toggle('hidden', !extra);

    $('drillAnswer').classList.remove('hidden');
    $('drillActions').classList.add('hidden');
    $('drillGrade').classList.remove('hidden');

    if (!listenMode) say(item.ms);
  }

  function gradeDrill(got) {
    if (!state.locked) return;
    var s = stat(state.item.key);
    s.seen++;
    if (!got) s.wrong++; else if (s.wrong > 0) s.wrong--;
    state.total++;
    if (got) state.right++;
    remember(state.item.key);
    updateScore();
    save();

    if (state.exam) {
      if (!got) state.exam.missed.push(state.item);
      state.exam.at++;
      if (state.exam.at >= state.exam.queue.length) return finishExam();
      return runExamStep();
    }
    nextDrill();
  }

  // ---------- listening quiz ----------
  function startQuiz() {
    var p = pool();
    if (p.length < 4) return;
    state.mode = 'quiz';
    state.right = 0; state.total = 0;
    state.exam = null;
    forgetRecent();
    updateScore();
    show('quiz');
    nextQuiz();
  }

  function nextQuiz() {
    var p = pool();
    var item = state.exam ? state.exam.queue[state.exam.at] : pickFrom(p);
    if (!item) return;
    state.item = item;
    state.locked = false;

    $('quizHeard').textContent = '';
    $('quizFeedback').textContent = '';
    $('quizFeedback').className = 'feedback';

    // Wrong answers come from the same unit, so they are plausible rather than
    // absurd - guessing from the shape of the English should not work.
    var others = shuffle(p.filter(function (i) { return i.key !== item.key; })).slice(0, 3);
    var choices = shuffle([item].concat(others));

    var box = $('quizChoices');
    box.innerHTML = '';
    choices.forEach(function (c) {
      var b = document.createElement('button');
      b.className = 'choice';
      b.textContent = c.en;
      b.addEventListener('click', function () { answerQuiz(c, b, item); });
      box.appendChild(b);
    });
    say(item.ms);
  }

  function answerQuiz(chosen, btn, item) {
    if (state.locked) return;
    state.locked = true;
    var right = chosen.key === item.key;

    var s = stat(item.key);
    s.seen++;
    if (!right) s.wrong++; else if (s.wrong > 0) s.wrong--;
    state.total++;
    if (right) state.right++;
    remember(item.key);
    updateScore();
    save();

    all('#quizChoices .choice').forEach(function (b) {
      if (b.textContent === item.en) b.classList.add('choice-right');
      else if (b === btn) b.classList.add('choice-wrong');
      b.disabled = true;
    });

    $('quizHeard').textContent = item.ms;
    var fb = $('quizFeedback');
    fb.textContent = right ? 'Yes' : 'It was: ' + item.ms;
    fb.className = 'feedback ' + (right ? 'feedback-good' : 'feedback-bad');

    if (state.exam) {
      if (!right) state.exam.missed.push(item);
      state.exam.at++;
      setTimeout(function () {
        if (state.exam.at >= state.exam.queue.length) finishExam();
        else runExamStep();
      }, right ? 700 : 1500);
      return;
    }
    setTimeout(nextQuiz, right ? 700 : 1600);
  }

  // ---------- phrasebook ----------
  function renderBrowse() {
    var u = unitById(state.unit);
    $('browseTitle').textContent = u.name;
    $('addOpen').classList.toggle('hidden', !u.custom);
    $('addForm').classList.add('hidden');

    var box = $('browseList');
    box.innerHTML = '';

    function section(title) {
      var h = document.createElement('p');
      h.className = 'section-label';
      h.textContent = title;
      box.appendChild(h);
    }

    function row(item) {
      var d = document.createElement('div');
      d.className = 'browse-row' + (item.mine ? ' browse-row-mine' : '');
      var html = '<span class="browse-ms">' + esc(item.ms) + '</span>' +
                 '<span class="browse-en">' + esc(item.en) + '</span>';
      if (item.lit) html += '<span class="browse-lit">' + esc(item.lit) + '</span>';
      if (item.id) html += '<span class="browse-id">Indonesian: ' + esc(item.id) + '</span>';
      if (item.note) html += '<span class="browse-note">' + esc(item.note) + '</span>';
      d.innerHTML = html;
      d.addEventListener('click', function () { say(item.ms); });
      if (item.mine) {
        var x = document.createElement('button');
        x.className = 'browse-del';
        x.textContent = '×';
        x.setAttribute('aria-label', 'Delete this phrase');
        x.addEventListener('click', function (e) {
          e.stopPropagation();
          state.custom[u.id].splice(item.index, 1);
          save();
          renderBrowse();
        });
        d.appendChild(x);
      }
      box.appendChild(d);
    }

    section('Words');
    wordItems(u).forEach(row);

    var ph = phraseItems(u);
    section('Phrases');
    ph.filter(function (i) { return !i.mine; }).forEach(row);

    var mine = ph.filter(function (i) { return i.mine; });
    if (mine.length || u.custom) {
      section(mine.length ? 'Yours' : 'Yours — nothing added yet');
      mine.forEach(row);
    }
    show('browse');
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // ---------- numbers and money ----------
  function renderNumHome() {
    NUM.currency = state.currency;
    all('[data-numdir]').forEach(function (b) { b.classList.toggle('on', b.dataset.numdir === state.numDir); });
    $('numDirNote').textContent = state.numDir === 'hear'
      ? 'The harder way round, and the one that matters at a counter.'
      : 'Reading a price off a label and saying it in Malay.';

    var box = $('levelList');
    box.innerHTML = '';
    NUM.levels.forEach(function (l) {
      var s = stat('num|' + l.id);
      var b = document.createElement('button');
      b.className = 'unit-row';
      b.innerHTML =
        '<span class="unit-index">' + (s.seen ? Math.max(0, s.seen - s.wrong) : '·') + '</span>' +
        '<span class="unit-text">' +
          '<span class="unit-name">' + l.name + '</span>' +
          '<span class="unit-sub">' + l.sub + '</span>' +
        '</span>' +
        '<span class="unit-prog"><span class="unit-count">' +
          (s.seen ? Math.round(100 * Math.max(0, s.seen - s.wrong) / s.seen) + '%' : '') +
        '</span></span>';
      b.addEventListener('click', function () { startNumbers(l.id); });
      box.appendChild(b);
    });
    show('numHome');
  }

  var numTyped = '';

  function startNumbers(levelId) {
    state.numLevel = levelId;
    NUM.currency = state.currency;
    state.right = 0; state.total = 0;
    updateScore();
    save();
    $('numTitle').textContent = NUM.levelById(levelId).name;
    show('num');
    nextNumber();
  }

  function nextNumber() {
    NUM.currency = state.currency;
    var q = NUM.levelById(state.numLevel).make();
    state.item = q;
    state.locked = false;
    numTyped = '';

    var hear = state.numDir === 'hear';
    $('numHearSide').classList.toggle('hidden', !hear);
    $('numSaySide').classList.toggle('hidden', hear);
    $('numPad').classList.toggle('hidden', !hear);
    $('numActions').classList.toggle('hidden', !hear);
    $('numSayActions').classList.toggle('hidden', hear);
    $('numGrade').classList.add('hidden');
    $('numNext').classList.add('hidden');
    $('numResult').classList.add('hidden');
    $('numSlow').classList.toggle('on', state.numSlow);

    if (hear) {
      $('numDisplay').textContent = '—';
      $('numDisplay').classList.remove('num-display-bad', 'num-display-good');
      $('numUnit').textContent = q.kind === 'price'
        ? 'type the price, for example 5.50'
        : (q.kind === 'decimal' ? 'type the number, for example 3.5' : 'type the number');
      say(q.spoken);
    } else {
      $('numShown').textContent = q.kind === 'price'
        ? (state.currency === 'dolar' ? '$' : 'RM') + q.answer
        : q.answer;
    }
  }

  function typeKey(k) {
    if (state.locked || state.numDir !== 'hear') return;
    if (k === 'del') numTyped = numTyped.slice(0, -1);
    else if (k === '.') { if (numTyped.indexOf('.') === -1 && numTyped.length) numTyped += '.'; }
    else if (numTyped.replace('.', '').length < 8) numTyped += k;
    $('numDisplay').textContent = numTyped || '—';
  }

  function checkNumber() {
    if (state.locked || !numTyped) return;
    var q = state.item;
    var given = parseFloat(numTyped);
    var right = !isNaN(given) &&
      (q.kind === 'int' ? Math.round(given) === q.value : Math.abs(given - q.value) < 0.005);
    state.locked = true;

    $('numDisplay').classList.add(right ? 'num-display-good' : 'num-display-bad');
    showNumberAnswer(right);
    recordNumber(right);

    $('numActions').classList.add('hidden');
    $('numNext').classList.remove('hidden');
  }

  function revealNumber() {
    if (state.locked) return;
    state.locked = true;
    say(state.item.spoken);
    showNumberAnswer(null);
    $('numSayActions').classList.add('hidden');
    $('numGrade').classList.remove('hidden');
  }

  function showNumberAnswer(right) {
    var q = state.item;
    var head = q.kind === 'price'
      ? (state.currency === 'dolar' ? '$' : 'RM') + q.answer
      : q.answer;
    $('numSpoken').innerHTML = '<b>' + head + '</b> &nbsp; ' + esc(q.spoken);
    $('numAlts').textContent = q.alts && q.alts.length ? 'also heard as: ' + q.alts.join('  ·  ') : '';
    $('numAlts').classList.toggle('hidden', !(q.alts && q.alts.length));
    $('numNote').textContent = q.note || '';
    $('numNote').classList.toggle('hidden', !q.note);
    $('numResult').classList.remove('hidden');
  }

  function recordNumber(right) {
    var s = stat('num|' + state.numLevel);
    s.seen++;
    if (!right) s.wrong++;
    state.total++;
    if (right) state.right++;
    updateScore();
    save();
  }

  // ---------- exam ----------
  // Twelve questions across all three modes, drawn from the unit, weighted the
  // same way practice is - so it leans on what has been going wrong.
  function startExam() {
    var p = pool();
    if (p.length < 4) return;
    forgetRecent();
    var queue = [];
    var used = {};
    while (queue.length < Math.min(12, p.length)) {
      var item = pickFrom(p.filter(function (i) { return !used[i.key]; }));
      if (!item) break;
      used[item.key] = true;
      queue.push(item);
      remember(item.key);
    }
    state.exam = {
      queue: queue, at: 0, missed: [],
      modes: queue.map(function () {
        return speech.ok ? ['listen', 'recall', 'quiz'][Math.floor(Math.random() * 3)] : 'recall';
      }),
      mode: 'listen'
    };
    state.right = 0; state.total = 0;
    updateScore();
    runExamStep();
  }

  function runExamStep() {
    var e = state.exam;
    e.mode = e.modes[e.at];
    if (e.mode === 'quiz') {
      show('quiz');
      nextQuiz();
    } else {
      $('drillTitle').textContent = 'Exam — ' + (e.at + 1) + ' of ' + e.queue.length;
      show('drill');
      nextDrill();
    }
  }

  function finishExam() {
    var e = state.exam;
    $('examScore').textContent = state.right;
    $('examTotal').textContent = state.total;
    $('examBreakdown').textContent = unitById(state.unit).name + ' — ' +
      (state.right === state.total ? 'all correct.'
        : Math.round(100 * state.right / Math.max(1, state.total)) + '% right.');
    $('examMissed').innerHTML = e.missed.length
      ? '<p class="section-label">Worth another look</p>' + e.missed.map(function (i) {
          return '<div class="browse-row"><span class="browse-ms">' + esc(i.ms) +
                 '</span><span class="browse-en">' + esc(i.en) + '</span></div>';
        }).join('')
      : '';
    state.exam = null;
    show('exam');
  }

  // ---------- wiring ----------
  function bind() {
    all('[data-back]').forEach(function (b) {
      b.addEventListener('click', function () {
        var to = b.dataset.back;
        state.exam = null;
        if (to === 'home') { renderHome(); show('home'); }
        else if (to === 'unit') { openUnit(state.unit); }
        else if (to === 'numHome') { renderNumHome(); }
      });
    });

    all('[data-vol]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.volume = b.dataset.vol;
        all('[data-vol]').forEach(function (x) { x.classList.toggle('on', x === b); });
        save();
        if (soundOn()) say('satu dua tiga');
      });
    });

    all('[data-cur]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.currency = b.dataset.cur;
        NUM.currency = state.currency;
        all('[data-cur]').forEach(function (x) { x.classList.toggle('on', x === b); });
        save();
      });
    });

    all('[data-scope]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.scope = b.dataset.scope;
        renderScope();
        save();
      });
    });

    all('[data-numdir]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.numDir = b.dataset.numdir;
        save();
        renderNumHome();
      });
    });

    $('goNumbers').addEventListener('click', renderNumHome);
    $('goListen').addEventListener('click', function () { startDrill('listen'); });
    $('goRecall').addEventListener('click', function () { startDrill('recall'); });
    $('goQuiz').addEventListener('click', startQuiz);
    $('goBrowse').addEventListener('click', renderBrowse);
    $('goExam').addEventListener('click', startExam);
    $('examAgain').addEventListener('click', startExam);

    $('drillReveal').addEventListener('click', revealDrill);
    $('drillGot').addEventListener('click', function () { gradeDrill(true); });
    $('drillMissed').addEventListener('click', function () { gradeDrill(false); });
    $('drillListen').addEventListener('click', function () { say(state.item && state.item.ms); });
    $('drillSkip').addEventListener('click', function () {
      if (state.exam) return;
      forgetRecent();
      nextDrill();
    });

    $('quizPlay').addEventListener('click', function () { say(state.item && state.item.ms); });

    $('numPlay').addEventListener('click', function () { say(state.item && state.item.spoken); });
    $('numSlow').addEventListener('click', function () {
      state.numSlow = !state.numSlow;
      $('numSlow').classList.toggle('on', state.numSlow);
      say(state.item && state.item.spoken);
    });
    all('#numPad .key').forEach(function (k) {
      k.addEventListener('click', function () { typeKey(k.dataset.key); });
    });
    $('numCheck').addEventListener('click', checkNumber);
    $('numNextBtn').addEventListener('click', nextNumber);
    $('numSayReveal').addEventListener('click', revealNumber);
    $('numGot').addEventListener('click', function () { recordNumber(true); nextNumber(); });
    $('numMissed').addEventListener('click', function () { recordNumber(false); nextNumber(); });

    $('addOpen').addEventListener('click', function () {
      $('addForm').classList.toggle('hidden');
      if (!$('addForm').classList.contains('hidden')) $('addMalay').focus();
    });
    $('addCancel').addEventListener('click', function () {
      $('addForm').classList.add('hidden');
      $('addMalay').value = ''; $('addEnglish').value = '';
    });
    $('addSave').addEventListener('click', function () {
      var ms = $('addMalay').value.trim(), en = $('addEnglish').value.trim();
      if (!ms || !en) return;
      var u = unitById(state.unit);
      if (!state.custom[u.id]) state.custom[u.id] = [];
      state.custom[u.id].push([ms, en, '', '']);
      save();
      $('addMalay').value = ''; $('addEnglish').value = '';
      $('addForm').classList.add('hidden');
      renderBrowse();
      say(ms);
    });

    $('resetAll').addEventListener('click', function () {
      state.stats = {};
      save();
      renderHome();
      $('resetAll').textContent = 'Progress cleared';
      setTimeout(function () { $('resetAll').textContent = 'Reset all progress'; }, 1500);
    });

    document.addEventListener('keydown', function (e) {
      if (/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
      var k = e.key;
      if (state.screen === 'drill') {
        if (k === ' ') { e.preventDefault(); if (!state.locked) revealDrill(); }
        else if (k === 'y') gradeDrill(true);
        else if (k === 'n') gradeDrill(false);
      } else if (state.screen === 'num') {
        if (k >= '0' && k <= '9') typeKey(k);
        else if (k === '.') typeKey('.');
        else if (k === 'Backspace') { e.preventDefault(); typeKey('del'); }
        else if (k === 'Enter') { state.locked ? nextNumber() : checkNumber(); }
        else if (k === ' ') {
          e.preventDefault();
          if (state.numDir === 'say' && !state.locked) revealNumber();
          else if (state.locked) nextNumber();
        } else if (k === 'y' && state.numDir === 'say' && state.locked) { recordNumber(true); nextNumber(); }
        else if (k === 'n' && state.numDir === 'say' && state.locked) { recordNumber(false); nextNumber(); }
      }
    });
  }

  // ---------- go ----------
  load();
  NUM.currency = state.currency;
  bind();
  renderHome();
  show('home');
})();
