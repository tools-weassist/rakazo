/* Wea page motion: hero entrance, scroll reveals, breath line draw, light parallax, bot marquee.
   Call initReveal(root) after the landing markup is in the document. */
export function initReveal(root) {
  var win = window;
  var html = document.documentElement;
  var reduce = typeof win.matchMedia === "function" && win.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    html.classList.remove("wm-js");
    html.classList.add("wm-reduced");
    return function () {};
  }

  var cleanups = [];

  root.querySelectorAll("[data-marquee]").forEach(function (track) {
    if (track.dataset.wmReady === "1") return;
    track.dataset.wmReady = "1";
    var items = Array.prototype.slice.call(track.children);
    items.forEach(function (n) {
      var c = n.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      c.classList.add("is-clone");
      track.appendChild(c);
    });
    var enter = function () { track.classList.add("is-paused"); };
    var leave = function () { track.classList.remove("is-paused"); };
    track.addEventListener("pointerenter", enter);
    track.addEventListener("pointerleave", leave);
    cleanups.push(function () {
      track.removeEventListener("pointerenter", enter);
      track.removeEventListener("pointerleave", leave);
    });
  });

  root.querySelectorAll("[data-hero-in]").forEach(function (n, i) {
    n.style.setProperty("--i", i);
  });
  var go = requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      html.classList.add("wm-hero-go");
    });
  });
  cleanups.push(function () {
    cancelAnimationFrame(go);
    html.classList.remove("wm-hero-go");
  });

  root.querySelectorAll("[data-reveal-group]").forEach(function (g) {
    g.querySelectorAll("[data-reveal]").forEach(function (n, i) {
      n.style.setProperty("--i", i);
    });
  });

  root.querySelectorAll("[data-draw] path").forEach(function (p) {
    p.setAttribute("pathLength", "1");
  });

  if ("IntersectionObserver" in win) {
    var io = new IntersectionObserver(
      function (es) {
        es.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -6% 0px" },
    );
    root.querySelectorAll("[data-reveal],[data-draw]").forEach(function (n) {
      io.observe(n);
    });
    cleanups.push(function () { io.disconnect(); });
  } else {
    root.querySelectorAll("[data-reveal],[data-draw]").forEach(function (n) {
      n.classList.add("is-in");
    });
  }

  var px = Array.prototype.slice.call(root.querySelectorAll("[data-parallax]"));
  var mq = typeof win.matchMedia === "function" ? win.matchMedia("(min-width: 761px)") : { matches: true };
  var ticking = false;
  function update() {
    ticking = false;
    var vh = win.innerHeight;
    px.forEach(function (n) {
      if (!mq.matches) {
        n.style.transform = "";
        return;
      }
      var box = n.parentElement.getBoundingClientRect();
      if (box.bottom < -100 || box.top > vh + 100) return;
      var k = parseFloat(n.getAttribute("data-parallax")) || 0.05;
      var d = (box.top + box.height / 2 - vh / 2) * k;
      d = Math.max(-24, Math.min(24, d));
      n.style.transform = "translate3d(0," + d.toFixed(1) + "px,0)";
    });
  }
  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }
  if (px.length) {
    win.addEventListener("scroll", onScroll, { passive: true });
    win.addEventListener("resize", onScroll);
    update();
    cleanups.push(function () {
      win.removeEventListener("scroll", onScroll);
      win.removeEventListener("resize", onScroll);
    });
  }

  return function () {
    cleanups.forEach(function (fn) { fn(); });
  };
}
