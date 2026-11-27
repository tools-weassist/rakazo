/* Wea devices showcase. Needs wea-motion.css (section "devices showcase").
   Markup: [data-devices] with tabs, frames, and lazy screens. See Brandi's devices-showcase.js. */
var root = typeof window !== "undefined" ? window : globalThis;

export function mount(el) {
  var reduce = root.matchMedia && root.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var mobile = root.matchMedia("(max-width: 760px)");
  var tabs = [].slice.call(el.querySelectorAll("[role=\"tab\"]"));
  var frames = [].slice.call(el.querySelectorAll("[data-device-frame]"));
  var cap = el.querySelector("[data-dv-cap]");
  var caps = (el.getAttribute("data-caps") || "").split("|");
  var active = 0, screen = 0, touched = false, visible = false, timer = null, observer = null;
  function choose(i, focus) {
    active = i;
    tabs.forEach(function (t, k) {
      t.setAttribute("aria-selected", k === i ? "true" : "false");
      t.tabIndex = k === i ? 0 : -1;
    });
    frames.forEach(function (f, k) { f.classList.toggle("is-active", k === i); });
    if (focus) tabs[i].focus();
  }
  function show(n) {
    screen = n;
    frames.forEach(function (f, k) {
      setTimeout(function () {
        f.querySelectorAll("img[data-screen]").forEach(function (img) {
          img.classList.toggle("is-on", +img.getAttribute("data-screen") === n);
        });
      }, k * 220);
    });
    if (cap && caps[n]) {
      cap.textContent = caps[n];
      if (cap.animate) {
        cap.animate(
          [{ opacity: 0, transform: "translateY(4px)" }, { opacity: 1, transform: "none" }],
          { duration: 360, easing: "cubic-bezier(.22,1,.36,1)" },
        );
      }
    }
  }
  function onTabClick(k) { return function () { touched = true; choose(k); }; }
  function onTabKey(k) {
    return function (e) {
      var d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); touched = true; choose((active + d + tabs.length) % tabs.length, true); }
    };
  }
  var clickers = tabs.map(function (t, k) {
    var c = onTabClick(k), ke = onTabKey(k);
    t.addEventListener("click", c);
    t.addEventListener("keydown", ke);
    return { t: t, c: c, ke: ke };
  });
  function stop() {
    clearTimeout(timer);
    timer = null;
    if (observer) { observer.disconnect(); observer = null; }
    clickers.forEach(function (x) {
      x.t.removeEventListener("click", x.c);
      x.t.removeEventListener("keydown", x.ke);
    });
  }
  if (reduce) return stop;
  el.querySelectorAll('img[loading="lazy"]').forEach(function (img) { img.loading = "eager"; });
  function tick() {
    clearTimeout(timer);
    timer = setTimeout(function () {
      if (visible && !document.hidden) {
        var next = (screen + 1) % 3;
        if (next === 0 && mobile.matches && !touched) choose((active + 1) % tabs.length);
        show(next);
      }
      tick();
    }, 4200);
  }
  show(0);
  if ("IntersectionObserver" in root) {
    observer = new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) tick();
      else clearTimeout(timer);
    }, { threshold: 0.25 });
    observer.observe(el);
  } else {
    visible = true;
    tick();
  }
  return stop;
}

export var WeaDevices = {
  mount: function (scope) {
    var stops = [];
    (scope || document).querySelectorAll("[data-devices]").forEach(function (el) {
      stops.push(mount(el));
    });
    return function () { stops.forEach(function (fn) { fn && fn(); }); };
  },
};
