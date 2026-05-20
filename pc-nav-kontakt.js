(function() {
  var s = document.createElement('style');
  s.textContent = '.nav-kontakt-wrap{display:flex;align-items:center;gap:5px;margin-left:4px}.nav-kontakt-btn{display:inline-block;padding:.35rem .85rem;border-radius:100px;font-size:.72rem;font-weight:500;letter-spacing:.04em;text-decoration:none;white-space:nowrap;transition:.2s;border:1.5px solid transparent;line-height:1.3}.nav-kontakt-btn--grey{color:var(--text-mid);border-color:rgba(44,40,37,.2)}.nav-kontakt-btn--grey:hover{border-color:var(--rose);color:var(--rose-dark)}.nav-kontakt-btn--rose{background:var(--rose);color:#fff!important}.nav-kontakt-btn--rose:hover{background:var(--rose-dark)}.nav-kontakt-btn--wa{background:#25d366;color:#fff!important}.nav-kontakt-btn--wa:hover{background:#1ebe5d}';
  document.head.appendChild(s);
  function init() {
    var nav = document.querySelector('.nav-links');
    if (!nav) return;
    // nav-cta (Probetraining Buchen) ausblenden
    var cta = nav.querySelector('.nav-cta');
    if (cta && cta.parentNode) cta.parentNode.style.display = 'none';
    if (nav.querySelector('.nav-kontakt-wrap')) return;
    var dl = Array.from(nav.querySelectorAll('li')).find(function(li){var a=li.querySelector('a');return a&&(a.href||'').indexOf('downloads')>-1;});
    if (!dl) return;
    var li = document.createElement('li');
    li.innerHTML = '<div class="nav-kontakt-wrap">'+
      '<a href="kontakt.html" class="nav-kontakt-btn nav-kontakt-btn--grey">Kontakt</a>'+
      '<a href="probetraining.html" class="nav-kontakt-btn nav-kontakt-btn--rose">Probetraining</a>'+
      '<a href="https://wa.me/491751266117" target="_blank" class="nav-kontakt-btn nav-kontakt-btn--wa">WhatsApp</a>'+
    '</div>';
    dl.parentNode.insertBefore(li, dl.nextSibling);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
})();
