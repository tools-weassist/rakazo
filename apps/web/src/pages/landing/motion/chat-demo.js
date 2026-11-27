/* Wea hero chat demo. Plain JS + Web Animations API. Needs animated-bot.js and wea-motion.css.
   Usage: <div data-wea-chat aria-label="..."></div>  then  WeaChat.mount(el)
   Plays one scene per bot: typing dots, a message lands, a card waits for your yes,
   the tap, the receipt, the status chip goes Working to Done, then the next bot.
   Pauses when off screen or when the tab is hidden. Reduced motion: scene one, final state, no loop. */
import { WeaBot } from './animated-bot.js';
var root = typeof window !== 'undefined' ? window : globalThis;
  var EASE = 'cubic-bezier(.22,1,.36,1)';   // soft land, the workhorse
  var EASE_UI = 'cubic-bezier(.2,0,0,1)';
  var reduce = root.matchMedia && root.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var CHECK = '<svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  // Copy rules: sentence case, no dashes, no exclamation marks.
  var SCENES = [
    { bot: 'inbox-admin-triage', time: '8:02 AM', line: 'Sent 3 replies', steps: [
      { t: 'bot', text: 'Good morning. Three client emails came in overnight. I drafted replies in your usual tone. Want me to send them?' },
      { t: 'card', title: 'Drafts ready', meta: '3 of 3', rows: [['Juniper Row Bakery', 'Reply: rescheduling our call'], ['Fernwick Florals', 'Reply: invoice question'], ['Saltmeadow Yoga', 'Reply: welcome and next steps']], yes: 'Send all', no: 'Edit first' },
      { t: 'tap' },
      { t: 'receipt', text: 'Sent 3 replies' } ] },
    { bot: 'calendar-keeper', time: '8:04 AM', line: 'Invite sent for Thursday', steps: [
      { t: 'user', text: 'Move my call with Juniper Row Bakery to Thursday.' },
      { t: 'bot', text: 'Thursday 10:00 AM works for you both. Shall I send the new invite?' },
      { t: 'card', title: 'New time', meta: '30 min', rows: [['Thu 10:00 AM', 'Call with Juniper Row Bakery']], yes: 'Approve', no: 'Other times' },
      { t: 'tap' },
      { t: 'receipt', text: 'Invite sent for Thursday' } ] },
    { bot: 'content-calendar-planner', time: '8:10 AM', line: '2 posts scheduled', steps: [
      { t: 'bot', text: 'Two posts are ready for next week. Take a look before I schedule them.' },
      { t: 'card', title: 'Posts to review', meta: '2 of 2', rows: [['Monday', 'Quick tip: three ways to clear your inbox'], ['Wednesday', 'Client story: a calmer launch week']], yes: 'Schedule both', no: 'Edit first' },
      { t: 'tap' },
      { t: 'receipt', text: 'Scheduled for Monday and Wednesday' } ] },
    { bot: 'lead-follow-up', time: '8:15 AM', line: '4 reminders queued', steps: [
      { t: 'bot', text: 'Four leads have not replied in a week. I wrote gentle follow ups for each one.' },
      { t: 'card', title: 'Follow ups', meta: '4 leads', rows: [['Fernwick Florals', 'Checking in on the proposal'], ['Saltmeadow Yoga', 'Any questions about pricing'], ['2 more', 'Short and friendly nudges']], yes: 'Queue all', no: 'Edit first' },
      { t: 'tap' },
      { t: 'receipt', text: '4 reminders queued for tomorrow 9:00 AM' } ] },
    { bot: 'meeting-action-items', time: '8:20 AM', line: 'Notes shared', steps: [
      { t: 'user', text: 'Can you write up my call with Saltmeadow Yoga?' },
      { t: 'bot', text: 'Here are the notes and three next actions. Want me to share them?' },
      { t: 'card', title: 'Meeting notes', meta: '3 actions', rows: [['Saltmeadow Yoga', 'Call notes and next actions'], ['Next action', 'Send the new class schedule by Friday']], yes: 'Share notes', no: 'Edit first' },
      { t: 'tap' },
      { t: 'receipt', text: 'Notes shared' } ] },
    { bot: 'morning-briefing', time: '8:24 AM', line: 'Briefing done for today', steps: [
      { t: 'bot', text: 'Good morning. Here is your day before you start.' },
      { t: 'card', title: 'Your morning briefing', meta: 'Today', rows: [['Inbox', '3 replies waiting for your yes'], ['Calendar', 'Call with Juniper Row Bakery at 10:00 AM']], yes: 'Looks good', no: 'Not now' },
      { t: 'tap' },
      { t: 'receipt', text: 'Briefing done for today' } ] }
  ];

  function h(tag, cls, html) { var n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function mount(host, opts) {
    opts = opts || {};
    var BOTS = WeaBot.BOTS;
    var state = { scene: 0, running: false, onScreen: true, alive: true };
    host.classList.add('wchat');
    host.setAttribute('role', 'img');
    if (!host.getAttribute('aria-label')) host.setAttribute('aria-label', 'The Wea app. Each bot drafts its work and waits for your yes before it sends anything.');
    host.innerHTML = '';

    var bar = h('div', 'wchat-bar', '<i></i><i></i><i></i><span class="wchat-brand"><img src="' + (opts.mark || '../assets/brand/logo/wea-mark-light.svg') + '" alt="" width="22" height="22">Wea</span>');
    var body = h('div', 'wchat-body');
    var side = h('aside', 'wchat-side');
    side.appendChild(h('div', 'wchat-side-h', '<span>Your bots</span><b aria-hidden="true">+</b>'));
    var list = h('div', 'wchat-list');
    var hilite = h('div', 'wchat-hilite');
    list.appendChild(hilite);
    var rows = {};
    SCENES.forEach(function (s) {
      var r = h('div', 'wchat-row');
      var av = h('span', 'wchat-av'); av.appendChild(WeaBot.create(s.bot, { size: 40 }));
      r.appendChild(av);
      var tx = h('div', 'wchat-row-t', '<b>' + esc(BOTS[s.bot].name) + '</b><span class="wchat-line">' + esc(s.idle || 'Ready when you are') + '</span>');
      r.appendChild(tx);
      r.appendChild(h('time', null, s.time));
      list.appendChild(r);
      rows[s.bot] = r;
    });
    side.appendChild(list);
    // hint that this is one of several teams
    var more = h('div', 'wchat-more');
    var mst = h('span', 'wchat-more-s');
    ['social-post-repurposer', 'month-end-close', 'weekly-ops-report'].forEach(function (k) { if (BOTS[k]) mst.appendChild(WeaBot.create(k, { size: 26 })); });
    more.appendChild(mst);
    more.appendChild(h('span', 'wchat-more-t', '<b>28 more bots</b><span>and 10 ready teams</span>'));
    side.appendChild(more);
    side.appendChild(h('div', 'wchat-you', '<span>Y</span>You'));

    var main = h('div', 'wchat-main');
    var head = h('div', 'wchat-head');
    var headAv = h('span', 'wchat-head-av');
    var headName = h('b', 'wchat-head-name');
    var chip = h('span', 'wchat-chip', '<i></i><span>Working</span>');
    head.appendChild(headAv); head.appendChild(headName); head.appendChild(chip);
    // mobile roster strip
    var strip = h('div', 'wchat-strip');
    var stripItems = {};
    SCENES.forEach(function (s) { var it = h('span', 'wchat-strip-i'); it.appendChild(WeaBot.create(s.bot, { size: 34 })); strip.appendChild(it); stripItems[s.bot] = it; });
    strip.appendChild(h('span', 'wchat-strip-more', '+28'));
    var thread = h('div', 'wchat-thread');
    var scroller = h('div', 'wchat-scroll'); thread.appendChild(scroller);
    var composer = h('div', 'wchat-compose', '<b aria-hidden="true">+</b><span class="wchat-input"><span class="wchat-ph"></span><span class="wchat-typed"></span></span><span class="wchat-send"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" fill="none" stroke="#fff" stroke-width="1.9" stroke-linejoin="round"/></svg></span>');
    var tapDot = h('span', 'wchat-tap');
    main.appendChild(strip); main.appendChild(head); main.appendChild(thread); main.appendChild(composer);
    body.appendChild(side); body.appendChild(main);
    host.appendChild(bar); host.appendChild(body); host.appendChild(tapDot);

    var ph = composer.querySelector('.wchat-ph'), typed = composer.querySelector('.wchat-typed'), send = composer.querySelector('.wchat-send');

    // ---------- timing helpers that respect pause ----------
    function wait(ms) {
      return new Promise(function (res) {
        var left = ms, last = performance.now();
        (function loop() {
          if (!state.alive) return;
          var now = performance.now();
          if (state.onScreen && !document.hidden) left -= (now - last);
          last = now;
          if (left <= 0) res(); else root.requestAnimationFrame(loop);
        })();
      });
    }
    function anim(node, frames, o) {
      if (reduce || !node.animate) return Promise.resolve();
      var a = node.animate(frames, Object.assign({ fill: 'both' }, o));
      return a.finished.catch(function () {});
    }
    function land(node) { // message landing: 10px up + tiny scale, 360 ms
      return anim(node, [{ opacity: 0, transform: 'translateY(10px) scale(.985)' }, { opacity: 1, offset: 0.35 }, { opacity: 1, transform: 'none' }], { duration: 380, easing: EASE_UI });
    }

    // ---------- scene building ----------
    function setActive(s, instant) {
      var r = rows[s.bot];
      hilite.style.transform = 'translateY(' + r.offsetTop + 'px)';
      hilite.style.height = r.offsetHeight + 'px';
      if (instant) hilite.style.transition = 'none'; else hilite.style.transition = '';
      Object.keys(rows).forEach(function (k) { rows[k].classList.toggle('is-on', k === s.bot); stripItems[k].classList.toggle('is-on', k === s.bot); });
      headAv.innerHTML = ''; headAv.appendChild(WeaBot.create(s.bot, { size: 32 }));
      headName.textContent = BOTS[s.bot].name;
      ph.textContent = 'Message ' + BOTS[s.bot].name;
      setChip('working');
      WeaBot.mood(rows[s.bot].querySelector('.wbot'), 'working');
      WeaBot.mood(stripItems[s.bot].querySelector('.wbot'), 'working');
    }
    function setChip(st) {
      chip.classList.toggle('is-done', st === 'done');
      chip.querySelector('span').textContent = st === 'done' ? 'Done' : 'Working';
      if (st === 'done') anim(chip, [{ transform: 'scale(.92)' }, { transform: 'scale(1)' }], { duration: 300, easing: EASE });
    }
    // Keep the newest message in view: slide the stack up (transform only) when it outgrows the thread.
    function fit() {
      var cs = getComputedStyle(thread);
      var avail = thread.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      var over = scroller.offsetHeight - avail;
      scroller.style.transform = over > 0 ? 'translateY(' + (-over) + 'px)' : '';
    }
    function add(n) { scroller.appendChild(n); fit(); return n; }
    function botMsg(s, text) {
      var m = h('div', 'wchat-msg');
      var av = h('span', 'wchat-msg-av'); av.appendChild(WeaBot.create(s.bot, { size: 28 }));
      m.appendChild(av);
      m.appendChild(h('div', 'wchat-msg-b', '<div class="wchat-msg-h"><b>' + esc(BOTS[s.bot].name) + '</b><time>' + s.time + '</time></div><p>' + esc(text) + '</p>'));
      return m;
    }
    function typingRow(s) {
      var m = h('div', 'wchat-msg wchat-typing');
      var av = h('span', 'wchat-msg-av'); av.appendChild(WeaBot.create(s.bot, { size: 28 }));
      m.appendChild(av);
      m.appendChild(h('div', 'wchat-dots', '<i></i><i></i><i></i>'));
      return m;
    }
    function card(st) {
      var c = h('div', 'wchat-card');
      c.appendChild(h('div', 'wchat-card-h', '<b>' + esc(st.title) + '</b><span>' + esc(st.meta) + '</span>'));
      st.rows.forEach(function (r) { c.appendChild(h('div', 'wchat-card-r', '<span class="wchat-ck">' + CHECK + '</span><b>' + esc(r[0]) + '</b><span>' + esc(r[1]) + '</span>')); });
      var f = h('div', 'wchat-card-f');
      f.appendChild(h('span', 'wchat-yes', esc(st.yes)));
      f.appendChild(h('span', 'wchat-no', esc(st.no)));
      f.appendChild(h('span', 'wchat-wait', '<i></i>Waiting for your yes'));
      c.appendChild(f);
      return c;
    }
    function receipt(text) { return h('div', 'wchat-receipt', '<span class="wchat-rc">' + CHECK + '</span>' + esc(text)); }
    function userMsg(text) { return h('div', 'wchat-user', esc(text)); }

    async function clearThread() {
      var kids = Array.prototype.slice.call(scroller.children);
      if (!kids.length) return;
      await anim(thread, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateY(-12px)' }], { duration: 340, easing: 'cubic-bezier(.4,0,1,1)' });
      scroller.innerHTML = '';
      scroller.style.transition = 'none'; scroller.style.transform = '';
      thread.getAnimations && thread.getAnimations().forEach(function (a) { a.cancel(); });
      void scroller.offsetHeight; scroller.style.transition = '';
    }

    async function typeInComposer(text) {
      typed.textContent = ''; ph.style.opacity = '0';
      for (var i = 0; i < text.length; i++) { typed.textContent = text.slice(0, i + 1); await wait(text[i] === ' ' ? 55 : 34); }
      await wait(260);
      anim(send, [{ transform: 'scale(1)' }, { transform: 'scale(.86)' }, { transform: 'scale(1)' }], { duration: 260, easing: EASE });
      await wait(120);
      typed.textContent = ''; ph.style.opacity = '';
    }

    function moveTap(target) {
      var hb = host.getBoundingClientRect(), tb = target.getBoundingClientRect();
      var x = tb.left - hb.left + tb.width * 0.5, y = tb.top - hb.top + tb.height * 0.55;
      var sx = x + 70, sy = y + 90;
      tapDot.style.left = '0px'; tapDot.style.top = '0px';
      return anim(tapDot, [
        { opacity: 0, transform: 'translate(' + sx + 'px,' + sy + 'px) scale(1)' },
        { opacity: 1, offset: 0.2 },
        { opacity: 1, transform: 'translate(' + x + 'px,' + y + 'px) scale(1)' }
      ], { duration: 720, easing: 'cubic-bezier(.45,0,.2,1)' }).then(function () {
        return anim(tapDot, [
          { opacity: 1, transform: 'translate(' + x + 'px,' + y + 'px) scale(1)' },
          { opacity: 1, transform: 'translate(' + x + 'px,' + y + 'px) scale(.72)', offset: 0.35 },
          { opacity: 0, transform: 'translate(' + x + 'px,' + y + 'px) scale(1.5)' }
        ], { duration: 460, easing: EASE });
      });
    }

    async function play(s) {
      setActive(s);
      var lastCard = null, sideBot = rows[s.bot].querySelector('.wbot');
      rows[s.bot].querySelector('.wchat-line').textContent = 'Working on it';
      for (var i = 0; i < s.steps.length; i++) {
        var st = s.steps[i];
        if (st.t === 'user') {
          await typeInComposer(st.text);
          var u = userMsg(st.text); add(u); await land(u); await wait(420);
        } else if (st.t === 'bot') {
          var ty = typingRow(s); add(ty); land(ty);
          await wait(1100 + Math.min(st.text.length * 6, 500));
          var m = botMsg(s, st.text); scroller.replaceChild(m, ty); fit(); await land(m); await wait(500);
        } else if (st.t === 'card') {
          lastCard = card(st); add(lastCard);
          await anim(lastCard, [{ opacity: 0, transform: 'translateY(12px) scale(.97)' }, { opacity: 1, offset: 0.4 }, { opacity: 1, transform: 'none' }], { duration: 440, easing: EASE });
          var rs = lastCard.querySelectorAll('.wchat-card-r');
          for (var j = 0; j < rs.length; j++) { anim(rs[j].querySelector('.wchat-ck'), [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1)' }], { duration: 280, easing: EASE }); await wait(110); }
          lastCard.classList.add('is-waiting');
          WeaBot.mood(sideBot, 'waiting');
          await wait(1500); // the designed breath before the yes
        } else if (st.t === 'tap') {
          var yes = lastCard.querySelector('.wchat-yes');
          await moveTap(yes);
          yes.classList.add('is-pressed');
          anim(yes, [{ transform: 'scale(1)' }, { transform: 'scale(.94)' }, { transform: 'scale(1)' }], { duration: 300, easing: EASE });
          lastCard.classList.remove('is-waiting'); lastCard.classList.add('is-approved');
          await wait(360);
        } else if (st.t === 'receipt') {
          var r = receipt(st.text); add(r); land(r);
          anim(r.querySelector('.wchat-rc'), [{ opacity: 0, transform: 'scale(.4)' }, { opacity: 1, transform: 'scale(1.08)', offset: 0.72 }, { opacity: 1, transform: 'scale(1)' }], { duration: 360, easing: EASE });
          setChip('done');
          rows[s.bot].querySelector('.wchat-line').textContent = s.line;
          WeaBot.mood(sideBot, 'happy'); WeaBot.hop(sideBot);
          WeaBot.mood(stripItems[s.bot].querySelector('.wbot'), 'happy');
          await wait(2300);
          WeaBot.mood(sideBot, 'idle'); WeaBot.mood(stripItems[s.bot].querySelector('.wbot'), 'idle');
        }
      }
    }

    function staticFinal(s) { // reduced motion and first paint
      setActive(s, true);
      s.steps.forEach(function (st) {
        if (st.t === 'user') add(userMsg(st.text));
        if (st.t === 'bot') add(botMsg(s, st.text));
        if (st.t === 'card') { var c = card(st); c.classList.add('is-approved'); add(c); }
        if (st.t === 'receipt') add(receipt(st.text));
      });
      setChip('done');
      rows[s.bot].querySelector('.wchat-line').textContent = s.line;
      SCENES.forEach(function (o) { if (o !== s) rows[o.bot].querySelector('.wchat-line').textContent = o.line; });
    }

    async function loop() {
      if (state.running) return; state.running = true;
      requestAnimationFrame(function () { setActive(SCENES[0], true); });
      await wait(opts.startDelay || 900);
      while (state.alive) {
        var s = SCENES[state.scene % SCENES.length];
        await play(s);
        await clearThread();
        state.scene++;
      }
    }

    if (reduce) { staticFinal(SCENES[0]); state.stop = function () {}; return state; }
    if ('IntersectionObserver' in root) {
      new IntersectionObserver(function (es) { state.onScreen = es[0].isIntersecting; }, { threshold: 0.15 }).observe(host);
    }
    var onR = function () { var r = rows[SCENES[state.scene % SCENES.length].bot]; hilite.style.transition = 'none'; hilite.style.transform = 'translateY(' + r.offsetTop + 'px)'; hilite.style.height = r.offsetHeight + 'px'; };
    root.addEventListener('resize', onR);
    loop();
    return state;
  }

  export var WeaChat = { mount: mount, SCENES: SCENES };
