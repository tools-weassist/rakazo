/* Connect strip in "Bring your own AI and tools". Reduced motion: first plan shown as connected, no loop. */
var root = typeof window !== "undefined" ? window : globalThis;

export function mount(link) {
  var items = Array.prototype.slice.call(link.querySelectorAll(".byo-plan-item"));
  var label = link.querySelector(".byo-state-t");
  var reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var i = 0, timers = [], running = false, visible = false, observer = null;
  function tile(key) { return document.querySelector('.byo-tile[data-tile="' + key + '"]'); }
  function show(n, done) {
    items.forEach(function (it, k) { it.classList.toggle("is-on", k === n); });
    document.querySelectorAll(".byo-tile.is-live").forEach(function (t) { t.classList.remove("is-live"); });
    if (done) {
      link.classList.remove("is-connecting");
      link.classList.add("is-connected");
      if (label) label.textContent = "Connected";
      var t = items[n] && tile(items[n].getAttribute("data-plan"));
      if (t) t.classList.add("is-live");
    } else {
      link.classList.remove("is-connected", "is-going");
      void link.offsetWidth;
      link.classList.add("is-connecting", "is-going");
      if (label) label.textContent = "Connecting";
    }
  }
  function stop() {
    running = false;
    timers.forEach(clearTimeout);
    timers = [];
    if (observer) { observer.disconnect(); observer = null; }
    document.removeEventListener("visibilitychange", onVis);
  }
  function step() {
    show(i, false);
    timers.push(setTimeout(function () { show(i, true); }, 1150));
    timers.push(setTimeout(function () { i = (i + 1) % items.length; if (running) step(); }, 3400));
  }
  function start() { if (running || !visible || document.hidden) return; running = true; step(); }
  function pause() { running = false; timers.forEach(clearTimeout); timers = []; }
  function onVis() { document.hidden ? pause() : start(); }
  if (reduce || !items.length) { show(0, true); return stop; }
  show(0, true);
  if ("IntersectionObserver" in root) {
    observer = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      visible ? start() : pause();
    }, { threshold: 0.3 });
    observer.observe(link);
  } else {
    visible = true;
    start();
  }
  document.addEventListener("visibilitychange", onVis);
  return stop;
}

export var WeaConnect = {
  mount: function (scope) {
    var stops = [];
    (scope || document).querySelectorAll("[data-connect]").forEach(function (el) {
      stops.push(mount(el));
    });
    return function () { stops.forEach(function (fn) { fn && fn(); }); };
  },
};
