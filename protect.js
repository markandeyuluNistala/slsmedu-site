/* Content protection (deterrent only): blocks casual copy / save / inspect shortcuts.
   Programmatic clipboard writes (navigator.clipboard.writeText from the blog "Copy" buttons)
   don't fire copy/cut events, so they keep working. Form fields stay fully usable. */
(function () {
  'use strict';
  var ok = function (t) {
    return !!(t && t.closest && t.closest('input,textarea,select,[contenteditable="true"],[data-allow-select]'));
  };
  var stop = function (e) { e.preventDefault(); return false; };
  var opts = { capture: true };

  ['contextmenu', 'copy', 'cut', 'dragstart', 'selectstart'].forEach(function (type) {
    document.addEventListener(type, function (e) { if (!ok(e.target)) return stop(e); }, opts);
  });

  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    var mod = e.ctrlKey || e.metaKey;
    var block = false;
    if (e.key === 'F12' || e.keyCode === 123) block = true;
    else if (mod && e.shiftKey && (k === 'i' || k === 'j' || k === 'c' || k === 'k')) block = true;   // devtools / inspect
    else if (e.metaKey && e.altKey && (k === 'i' || k === 'j' || k === 'c' || k === 'u')) block = true; // macOS devtools / source
    else if (e.metaKey && e.altKey && (e.code === 'KeyI' || e.code === 'KeyJ' || e.code === 'KeyC' || e.code === 'KeyU')) block = true; // mac option-key glyphs
    else if (mod && !e.shiftKey && !e.altKey && 'cxsupa'.indexOf(k) > -1 && k.length === 1) block = true; // copy cut save source print select-all
    if (block && !ok(e.target)) { e.preventDefault(); e.stopPropagation(); return false; }
  }, opts);

  // Images: never draggable
  function lock(root) {
    var imgs = (root || document).querySelectorAll('img');
    for (var i = 0; i < imgs.length; i++) { imgs[i].setAttribute('draggable', 'false'); imgs[i].setAttribute('oncontextmenu', 'return false'); }
  }
  lock();
  if ('MutationObserver' in window) {
    new MutationObserver(function (ms) {
      ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.tagName === 'IMG') lock(n.parentNode); else if (n.querySelector) lock(n); } }); });
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
