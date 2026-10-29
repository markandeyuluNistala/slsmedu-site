(function () {
  'use strict';
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* theme toggle */
  var tt = document.getElementById('themeToggle');
  if (tt) tt.addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
  });
  var y = document.getElementById('yr'); if (y) y.textContent = new Date().getFullYear();

  /* progress bar */
  var bar = document.querySelector('.progress span');
  function prog() { var h = root.scrollHeight - innerHeight; if (bar) bar.style.transform = 'scaleX(' + (h > 0 ? Math.min(scrollY / h, 1) : 0) + ')'; }
  addEventListener('scroll', prog, { passive: true }); prog();

  /* ---- tiny syntax highlighter (Swift + XML), no dependencies ---- */
  var KW = 'actor|any|as|associatedtype|async|await|break|case|catch|class|continue|default|defer|deinit|do|else|enum|extension|fallthrough|false|fileprivate|final|for|func|guard|if|import|in|init|inout|internal|is|lazy|let|nil|nonisolated|open|operator|override|private|protocol|public|repeat|rethrows|return|self|Self|some|static|struct|subscript|super|switch|throw|throws|true|try|typealias|var|weak|where|while|willSet|didSet|get|set';
  var KWRE = new RegExp('^(?:' + KW + ')$');
  var esc = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };
  var span = function (c, s) { return '<span class="t-' + c + '">' + esc(s) + '</span>'; };
  function swift(src) {
    var re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("""[\s\S]*?"""|"(?:\\.|[^"\\\n])*")|(@[A-Za-z_]\w*|#[A-Za-z]\w*)|(\b\d[\d_]*(?:\.\d+)?(?:e[+-]?\d+)?\b|\b0x[0-9a-fA-F_]+\b)|([A-Za-z_]\w*)(\()?|([\s\S])/g;
    var out = '', m;
    while ((m = re.exec(src))) {
      if (m[1]) out += span('com', m[1]);
      else if (m[2]) out += span('str', m[2]);
      else if (m[3]) out += span('at', m[3]);
      else if (m[4]) out += span('num', m[4]);
      else if (m[5]) {
        var w = m[5];
        if (KWRE.test(w)) out += span('kw', w) + (m[6] ? esc(m[6]) : '');
        else if (m[6]) out += span('fn', w) + esc(m[6]);
        else if (/^[A-Z]/.test(w)) out += span('ty', w);
        else out += esc(w);
      } else out += esc(m[7]);
    }
    return out;
  }
  function xml(src) {
    return esc(src)
      .replace(/(&lt;\/?)([\w:-]+)/g, '<span class="t-pn">$1</span><span class="t-tag">$2</span>')
      .replace(/(&gt;)/g, '<span class="t-pn">$1</span>');
  }
  $$('pre code[data-lang]').forEach(function (code) {
    var lang = code.getAttribute('data-lang'), src = code.textContent.replace(/\n$/, '');
    code.innerHTML = lang === 'xml' ? xml(src) : lang === 'swift' ? swift(src) : esc(src);
    var pre = code.parentNode, wrap = document.createElement('div');
    wrap.className = 'codeblock';
    var bar = document.createElement('div'); bar.className = 'bar';
    bar.innerHTML = '<b>' + (code.getAttribute('data-title') || lang) + '</b>';
    var btn = document.createElement('button'); btn.type = 'button'; btn.className = 'copy'; btn.textContent = 'Copy';
    btn.addEventListener('click', function () {
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy'; }, 1500); };
      if (navigator.clipboard) navigator.clipboard.writeText(src).then(done, function () {}); 
    });
    bar.appendChild(btn);
    pre.parentNode.insertBefore(wrap, pre); wrap.appendChild(bar); wrap.appendChild(pre);
    pre.setAttribute('tabindex', '0');
  });

  /* TOC active section */
  var tocLinks = $$('.toc:not(.toc-inline) a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var map = {}; tocLinks.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { tocLinks.forEach(function (a) { a.classList.remove('active'); }); if (map[e.target.id]) map[e.target.id].classList.add('active'); } });
    }, { rootMargin: '-90px 0px -70% 0px' });
    $$('.prose h2[id]').forEach(function (h) { io.observe(h); });
  }

  /* 3D tilt on glass cards */
  if (fine && !reduced) {
    $$('.tilt').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        el.style.transition = 'transform .08s linear, border-color .3s, box-shadow .3s';
        el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * 8).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 10).toFixed(2) + 'deg) translateZ(8px)';
        el.style.setProperty('--mx', (px * 100) + '%'); el.style.setProperty('--my', (py * 100) + '%');
      });
      el.addEventListener('pointerleave', function () { el.style.transition = ''; el.style.transform = ''; });
    });
  }
})();
