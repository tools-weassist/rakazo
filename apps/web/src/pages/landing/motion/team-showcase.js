/* Wea bot team section. Needs animated-bot.js and wea-motion.css (section "team").
   Markup:
     <article class="tb-card" data-team-card data-steps="Working text|Waiting text|Done text"> ... <span class="tb-chip"><i></i><span></span></span></article>
     <div class="tb-lane" data-team-lane> ... </div>
   Cards: when on screen (or hovered) each card plays working, then waiting for your yes, then done, and its bot's mood follows.
   Lane: a work token travels from Inbox triage to Calendar keeper to your yes, then the whole lane cheers.
   Picker: <div data-team-picker> with role=tab buttons [data-team] and role=tabpanel [data-team-panel].
     Click or arrow keys switch teams; the new team's cards stagger in and its bots hop. While in view and
     untouched, the picker moves to the next team every 9 s (stops for good after the first click).
     The lane takes the active team's first two bots from the panel's data-handoff="kindA|captionA|kindB|captionB".
   Counter: [data-team-count] rolls its [data-count] numbers up once when it comes into view.
   Pauses off screen. Reduced motion: cards show the done line, lane is static, no auto advance, instant switch. */
import { WeaBot } from './animated-bot.js';
var root = typeof window !== 'undefined' ? window : globalThis;
  var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var MOODS = ['working', 'waiting', 'happy'], STATES = ['is-working', 'is-waiting', 'is-done'];
  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function onScreen(el, cb) {
    if (!('IntersectionObserver' in root)) { cb(true); return; }
    new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, { threshold: 0.3 }).observe(el);
  }

  function setCard(card, i) {
    var steps = card.getAttribute('data-steps').split('|');
    var chip = card.querySelector('.tb-chip');
    chip.classList.remove.apply(chip.classList, STATES);
    chip.classList.add(STATES[i]);
    var label = chip.querySelector('span');
    if (!reduce && label.animate && label.textContent) label.animate([{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'none' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
    label.textContent = steps[i];
    var bot = card.querySelector('.wbot');
    if (bot && WeaBot.BOTS[bot.getAttribute('data-kind')]) chip.style.setProperty('--dot', WeaBot.BOTS[bot.getAttribute('data-kind')].fill);
    if (bot) { WeaBot.mood(bot, MOODS[i]); if (i === 2) WeaBot.hop(bot); }
  }

  function card(card, index) {
    if (reduce) { setCard(card, 2); return; }
    var visible = false, running = false, hover = false;
    async function run() {
      if (running) return; running = true;
      await sleep(index * 380);
      while (visible || hover) {
        setCard(card, 0); await sleep(1700);
        setCard(card, 1); await sleep(hover ? 1000 : 2000);
        setCard(card, 2); await sleep(2600);
        if (!hover) await sleep(1200 + (index % 3) * 500);
      }
      running = false;
    }
    setCard(card, 1);
    onScreen(card, function (v) { visible = v; if (v) run(); });
    card.addEventListener('pointerenter', function () { hover = true; run(); });
    card.addEventListener('pointerleave', function () { hover = false; });
  }

  function lane(el) {
    var nodes = el.querySelectorAll('.tb-node');
    var tracks = el.querySelectorAll('.tb-track');
    var yes = el.querySelector('.tb-yes');
    var add = el.querySelector('.tb-add');
    if (reduce) { el.classList.add('is-static'); return; }
    var visible = false, running = false;
    function bot(n) { return nodes[n] && nodes[n].querySelector('.wbot'); }
    function travel(track) {
      var mover = track.querySelector('.tb-mover');
      var vertical = getComputedStyle(track).getPropertyValue('--tb-dir').trim() === 'y';
      var to = vertical ? 'translateY(100%)' : 'translateX(100%)';
      return mover.animate([{ transform: 'none', opacity: 0 }, { opacity: 1, offset: 0.12 }, { opacity: 1, offset: 0.88 }, { transform: to, opacity: 0 }],
        { duration: 1300, easing: 'cubic-bezier(.45,0,.2,1)' }).finished;
    }
    async function run() {
      if (running) return; running = true;
      while (visible) {
        WeaBot.mood(bot(0), 'working'); await sleep(1100);
        WeaBot.mood(bot(0), 'idle'); await travel(tracks[0]);
        WeaBot.hop(bot(1)); WeaBot.mood(bot(1), 'working'); await sleep(1000);
        WeaBot.mood(bot(1), 'waiting'); await travel(tracks[1]);
        yes.classList.add('is-asking'); await sleep(1300);
        yes.classList.remove('is-asking'); yes.classList.add('is-pressed');
        yes.animate([{ transform: 'scale(1)' }, { transform: 'scale(.92)' }, { transform: 'scale(1)' }], { duration: 320, easing: 'cubic-bezier(.22,1,.36,1)' });
        WeaBot.mood(bot(0), 'happy'); WeaBot.mood(bot(1), 'happy');
        WeaBot.hop(bot(0)); setTimeout(function () { WeaBot.hop(bot(1)); }, 120);
        add.classList.add('is-nudge'); await sleep(2400);
        add.classList.remove('is-nudge'); yes.classList.remove('is-pressed');
        WeaBot.mood(bot(0), 'idle'); WeaBot.mood(bot(1), 'idle'); await sleep(900);
      }
      running = false;
    }
    onScreen(el, function (v) { visible = v; if (v) run(); });
  }

  function picker(el) {
    var tabs = [].slice.call(el.querySelectorAll('[role="tab"]'));
    var panels = [].slice.call(el.querySelectorAll('[data-team-panel]'));
    var laneEl = document.querySelector('[data-team-lane]');
    var current = 0, touched = false, visible = false, timer = null;
    function setLane(panel) {
      if (!laneEl) return;
      var h = (panel.getAttribute('data-handoff') || '').split('|');
      var nodes = laneEl.querySelectorAll('.tb-node');
      [0, 1].forEach(function (n) {
        var node = nodes[n], kind = h[n * 2], cap = h[n * 2 + 1];
        if (!node || !kind || !WeaBot.BOTS[kind]) return;
        var host = node.querySelector('[data-wea-bot]');
        var old = host.querySelector('.wbot');
        if (!old || old.getAttribute('data-kind') !== kind) {
          host.setAttribute('data-wea-bot', kind);
          host.innerHTML = '';
          host.appendChild(WeaBot.create(kind, { size: 64, badge: false }));
          if (!reduce) WeaBot.hop(host.querySelector('.wbot'));
        }
        node.querySelector('b').textContent = WeaBot.BOTS[kind].name;
        node.querySelector('small').textContent = cap;
      });
      laneEl.setAttribute('aria-label', WeaBot.BOTS[h[0]].name + ' ' + h[1] + ' and hands it to ' + WeaBot.BOTS[h[2]].name + ', who ' + h[3] + '. Nothing goes out until you say yes. Run several teams at once.');
    }
    function show(i, focus) {
      if (i === current && !panels[i].hidden) return;
      var prev = panels[current];
      tabs.forEach(function (t, k) { t.setAttribute('aria-selected', k === i ? 'true' : 'false'); t.tabIndex = k === i ? 0 : -1; });
      if (focus) tabs[i].focus();
      var next = panels[i]; current = i;
      function enter() {
        prev.hidden = true; next.hidden = false;
        setLane(next);
        if (reduce || !next.animate) return;
        next.querySelectorAll('.tb-card').forEach(function (c, k) {
          c.animate([{ opacity: 0, transform: 'translateY(16px) scale(.97)' }, { opacity: 1, transform: 'none' }],
            { duration: 520, delay: k * 70, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
          var b = c.querySelector('.wbot'); if (b) setTimeout(function () { WeaBot.hop(b); }, 260 + k * 70);
        });
      }
      if (reduce || prev === next || !prev.animate) { enter(); return; }
      var cards = prev.querySelectorAll('.tb-card'), last = null;
      cards.forEach(function (c, k) {
        last = c.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-8px)' }],
          { duration: 200, delay: k * 25, easing: 'cubic-bezier(.4,0,1,1)', fill: 'forwards' });
      });
      (last ? last.finished : Promise.resolve()).then(function () {
        cards.forEach(function (c) { c.getAnimations().forEach(function (a) { a.cancel(); }); });
        enter();
      });
    }
    tabs.forEach(function (t, k) {
      t.addEventListener('click', function () { touched = true; show(k); });
      t.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (e.key === 'Home') { e.preventDefault(); touched = true; show(0, true); }
        else if (e.key === 'End') { e.preventDefault(); touched = true; show(tabs.length - 1, true); }
        else if (d) { e.preventDefault(); touched = true; show((current + d + tabs.length) % tabs.length, true); }
      });
    });
    el.addEventListener('pointerenter', function () { el.classList.add('is-hover'); });
    el.addEventListener('pointerleave', function () { el.classList.remove('is-hover'); });
    if (reduce) return;
    function tick() {
      clearTimeout(timer);
      timer = setTimeout(function () {
        if (touched) return;
        if (visible && !el.classList.contains('is-hover') && !document.hidden) {
          var row = tabs[0].parentNode, next = (current + 1) % tabs.length;
          show(next);
          var t = tabs[next];
          if (row.scrollWidth > row.clientWidth) row.scrollTo({ left: t.offsetLeft - (row.clientWidth - t.offsetWidth) / 2, behavior: 'smooth' });
        }
        tick();
      }, 9000);
    }
    onScreen(el, function (v) { visible = v; if (v) tick(); else clearTimeout(timer); });
  }

  function counter(el) {
    var nums = el.querySelectorAll('[data-count]');
    if (reduce) return;
    nums.forEach(function (n) { n.textContent = '0'; });
    var done = false;
    onScreen(el, function (v) {
      if (!v || done) return; done = true;
      nums.forEach(function (n, k) {
        var to = +n.getAttribute('data-count'), t0 = performance.now() + k * 150, dur = 1100;
        (function f(now) {
          var p = Math.min(1, Math.max(0, (now - t0) / dur)), e = 1 - Math.pow(1 - p, 3);
          n.textContent = String(Math.round(to * e));
          if (p < 1) requestAnimationFrame(f);
        })(t0);
      });
      el.querySelectorAll('.wbot').forEach(function (b, k) { setTimeout(function () { WeaBot.hop(b); }, 900 + k * 140); });
    });
  }

  function mount(scope) {
    scope = scope || document;
    if (WeaBot) WeaBot.mount(scope);
    scope.querySelectorAll('[data-team-card]').forEach(function (c) { card(c, [].indexOf.call(c.parentNode.children, c)); });
    scope.querySelectorAll('[data-team-lane]').forEach(lane);
    scope.querySelectorAll('[data-team-picker]').forEach(picker);
    scope.querySelectorAll('[data-team-count]').forEach(counter);
  }
  export var WeaTeam = { mount: mount };
