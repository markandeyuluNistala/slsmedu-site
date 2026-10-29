(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  $('#yr').textContent = new Date().getFullYear();

  /* theme toggle */
  $('#themeToggle').addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
  });

  /* scroll progress bar */
  var bar = $('.progress span');
  function prog() {
    var h = root.scrollHeight - innerHeight;
    bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ')';
  }
  addEventListener('scroll', prog, { passive: true }); prog();

  /* active nav link */
  var links = $$('.nav nav a');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) links.forEach(function (a) { a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach(function (s) { io.observe(s); });
  }


  /* tech stack: marquee clones + hover tilt */
  $$('.logo-marquee').forEach(function (m) {
    var track = $('.logo-track', m);
    if (!reduced) {
      $$('li', track).slice().forEach(function (li) {
        var c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); track.appendChild(c);
      });
      m.classList.add('run');
    }
    if (fine && !reduced) {
      m.addEventListener('pointermove', function (e) {
        var p = e.target.closest ? e.target.closest('.logo-pill') : null;
        if (!p) return;
        var r = p.getBoundingClientRect();
        p.style.setProperty('--ry', (((e.clientX - r.left) / r.width - 0.5) * 22).toFixed(1) + 'deg');
        p.style.setProperty('--rx', ((0.5 - (e.clientY - r.top) / r.height) * 22).toFixed(1) + 'deg');
      });
      m.addEventListener('pointerout', function (e) {
        var p = e.target.closest ? e.target.closest('.logo-pill') : null;
        if (p) { p.style.setProperty('--rx', '0deg'); p.style.setProperty('--ry', '0deg'); }
      });
    }
  });

  /* 3D tilt + glare on cards */
  if (fine && !reduced) {
    $$('.tilt').forEach(function (el) {
      var raf = null;
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transition = 'transform .08s linear, border-color .3s, box-shadow .3s';
          el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 9).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 11).toFixed(2) + 'deg) translateZ(8px)';
          el.style.setProperty('--mx', (px * 100) + '%'); el.style.setProperty('--my', (py * 100) + '%');
        });
      });
      el.addEventListener('pointerleave', function () {
        el.style.transition = ''; el.style.transform = '';
      });
    });
    /* magnetic buttons */
    $$('.btn').forEach(function (b) {
      b.addEventListener('pointermove', function (e) {
        var r = b.getBoundingClientRect();
        b.style.transform = 'translate(' + ((e.clientX - r.left - r.width / 2) * 0.18).toFixed(1) + 'px,' + ((e.clientY - r.top - r.height / 2) * 0.25 - 2).toFixed(1) + 'px)';
      });
      b.addEventListener('pointerleave', function () { b.style.transform = ''; });
    });
  }

  /* GSAP animations */
  var g = window.gsap;
  if (!g || reduced) { root.classList.remove('anim'); return; }
  if (window.ScrollTrigger) g.registerPlugin(window.ScrollTrigger);
  var failsafe = setTimeout(function () { root.classList.remove('anim'); }, 5000);

  // hero entrance
  var heroEls = $$('[data-hero]');
  var words = $$('.word');
  g.set(heroEls, { autoAlpha: 0, y: 30 });
  g.set(words, { yPercent: 110, y: 0 });
  var tl = g.timeline({ defaults: { ease: 'power4.out' }, onComplete: function () { clearTimeout(failsafe); } });
  tl.to($('.eyebrow'), { autoAlpha: 1, y: 0, duration: 0.8 }, 0.1)
    .to(words, { autoAlpha: 1, yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.2)
        .fromTo('.portrait', { autoAlpha: 0, y: 0 }, { autoAlpha: 1, duration: 1, ease: 'power2.out' }, 0.4)
    .to($$('.hero-sub, .cta, .stats'), { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.12 }, 0.7);
  g.from('.nav', { y: -70, autoAlpha: 0, duration: 1, ease: 'power3.out', delay: 0.2 });

  // count-up stats
  $$('[data-count]').forEach(function (el) {
    var end = parseFloat(el.dataset.count), dec = parseInt(el.dataset.dec || '0', 10), o = { v: 0 };
    g.to(o, { v: end, duration: 1.8, delay: 1, ease: 'power2.out', onUpdate: function () { el.textContent = o.v.toFixed(dec); } });
  });

  if (window.ScrollTrigger) {
    // reveals — staggered batches with a subtle 3D rotate-in
    g.set('[data-reveal]', { y: 50, rotationX: -8, transformPerspective: 900, transformOrigin: '50% 100%' });
    window.ScrollTrigger.batch('[data-reveal]', {
      start: 'top 90%', once: true,
      onEnter: function (b) { g.to(b, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.95, stagger: 0.09, ease: 'power3.out', overwrite: true, clearProps: 'rotationX,transformPerspective,transformOrigin,y' }); }
    });
    // timeline line draws with scroll
    var tlEl = $('.timeline');
    g.fromTo(tlEl, { '--tl': 0 }, { '--tl': 1, ease: 'none', scrollTrigger: { trigger: tlEl, start: 'top 70%', end: 'bottom 70%', scrub: true } });
    // parallax on floating hero content & marquee speed-up on scroll
    g.to('.hero-inner', { yPercent: -12, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true } });
    g.to('.scroll-cue', { autoAlpha: 0, scrollTrigger: { trigger: '.hero', start: '12% top', end: '30% top', scrub: true } });
    g.fromTo('.marquee-track', { x: 0 }, { x: -120, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    window.addEventListener('load', function () { window.ScrollTrigger.refresh(); });
  } else {
    g.to('[data-reveal]', { autoAlpha: 1, duration: 0.6 });
  }
})();
