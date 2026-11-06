/*
  Stimmen-Band (Oliver, 06.11.2026). Zeigt auf der Startseite die neuesten Bewertungen der Kundinnen als langsam laufendes Band.
  Quelle: Studio OS, Funktion bewertungen. Dort erscheint nur, was das Team veröffentlicht hat (Unser Tag → „Veröffentlichen“),
  was die Kundin ausdrücklich erlaubt hat und nicht widerrufen wurde. Nimmt eine Kundin ihre Einwilligung zurück, fällt die
  Bewertung aus der Liste; auf einer geöffneten Seite verschwindet sie beim nächsten Abruf (alle 5 Minuten).
  Ohne JavaScript, ohne Daten oder bei einem Fehler bleibt der Abschnitt unsichtbar. Keine Cookies, kein localStorage.
  Alle Texte kommen per textContent auf die Seite, nie als HTML.

  Element auf der Seite:
    #stimmen    <section hidden> mit .st-kopf (Überschrift, .st-pause), .st-fenster > .st-spur (<ul>)

  Bedienbarkeit: Das Band hält bei Hover und Fokus an und lässt sich mit dem Knopf „Pause“ anhalten. Bei „weniger Bewegung“ im
  System und bei weniger als 4 Bewertungen steht es still und lässt sich seitlich wischen oder mit der Tastatur scrollen.
*/
(function () {
  'use strict';
  var API = 'https://mitglieder.pilatescompany.de/.netlify/functions/bewertungen';
  var MAX = 12;          // so viele Bewertungen höchstens (die neuesten)
  var MIN_LAUF = 4;      // darunter steht das Band still
  var TEXT_MAX = 160;    // längere Kommentare werden an einer Wortgrenze gekürzt
  var TAKT = 300000;     // 5 Minuten

  var sec = document.getElementById('stimmen');
  if (!sec) return;
  var fenster = sec.querySelector('.st-fenster');
  var spur = sec.querySelector('.st-spur');
  var knopf = sec.querySelector('.st-pause');
  if (!fenster || !spur) return;

  var ruhig = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var signatur = '';
  var zuletzt = 0;

  var STIL = '.stimmen .st-kopf{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:14px}' +
    '.stimmen .st-kopf h2{font-size:23px;line-height:1.2}' +
    '.stimmen .st-pause{flex:none;min-height:44px;padding:0 16px;border-radius:999px;border:1px solid #E9DAD4;background:#fff;color:#241D1A;font:500 13px Poppins,system-ui,sans-serif}' +
    '.stimmen .st-pause:hover{background:#FBF1EE}' +
    '.stimmen .st-fenster{margin:0 calc(-1 * var(--pad,16px));overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent);mask-image:linear-gradient(90deg,transparent,#000 5%,#000 95%,transparent)}' +
    '.stimmen .st-spur{display:flex;align-items:stretch;width:max-content;margin:0;padding:4px 0 10px;list-style:none;animation:st-lauf 90s linear infinite}' +
    '@keyframes st-lauf{from{transform:translateX(0)}to{transform:translateX(-50%)}}' +
    '.stimmen .st-fenster:hover .st-spur,.stimmen .st-fenster:focus-within .st-spur,.stimmen.st-halt .st-spur{animation-play-state:paused}' +
    '.stimmen .st-karte{flex:none;width:272px;margin-right:12px;padding:16px;display:flex;flex-direction:column;gap:8px;border-radius:4px 22px 4px 22px;background:#fff;border:1px solid #F0E3DE;box-shadow:0 18px 40px -30px rgba(60,38,32,.45)}' +
    '.stimmen .st-zeile{display:flex;align-items:center;justify-content:space-between;gap:8px}' +
    '.stimmen .st-sterne{color:#A9761F;font-size:16px;line-height:1;letter-spacing:2px;white-space:nowrap}' +
    '.stimmen .st-sterne .leer{color:#E0CFC8}' +
    '.stimmen .st-datum{font-size:12px;color:#6F625D;white-space:nowrap}' +
    '.stimmen .st-text{margin:0;font-size:14px;line-height:1.55;color:#4E4541;font-weight:300;display:-webkit-box;-webkit-line-clamp:6;-webkit-box-orient:vertical;overflow:hidden}' +
    '.stimmen .st-meta{margin:auto 0 0;font-size:13.5px;line-height:1.4;color:#241D1A;font-weight:600}' +
    '.stimmen .st-meta span{display:block;margin-top:1px;font-size:12.5px;font-weight:400;color:#6F625D}' +
    '.stimmen .st-hinweis{margin-top:4px}' +
    '.stimmen.st-still .st-fenster{overflow-x:auto;-webkit-overflow-scrolling:touch;scroll-snap-type:x proximity;-webkit-mask-image:none;mask-image:none}' +
    '.stimmen.st-still .st-spur{animation:none;padding-left:var(--pad,16px)}' +
    '.stimmen.st-still .st-karte{scroll-snap-align:start}' +
    '@media (min-width:1024px){.stimmen .st-kopf h2{font-size:34px}.stimmen .st-karte{width:300px;margin-right:16px;padding:20px}.stimmen .st-text{font-size:15px}}' +
    '@media (prefers-reduced-motion:reduce){.stimmen .st-pause{display:none}}';
  function stilEinmal() {
    if (document.getElementById('st-stil')) return;
    var s = document.createElement('style');
    s.id = 'st-stil';
    s.textContent = STIL;
    document.head.appendChild(s);
  }

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function gueltig(b) {
    return b && typeof b.name === 'string' && b.name.length > 0 && typeof b.trainer === 'string' &&
      typeof b.sterne === 'number' && b.sterne >= 1 && b.sterne <= 5 && Math.floor(b.sterne) === b.sterne;
  }
  // 2026-11-03 → „03.11.“ (mit Jahr, wenn nicht das laufende); ohne Kurstag der Monat „11.2026“
  function datumText(b) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(b.datum || '');
    if (m) return m[3] + '.' + m[2] + '.' + (Number(m[1]) === new Date().getFullYear() ? '' : m[1]);
    m = /^(\d{4})-(\d{2})$/.exec(b.monat || '');
    return m ? m[2] + '.' + m[1] : '';
  }
  function kuerzen(t) {
    t = String(t || '').replace(/\s+/g, ' ').trim();
    if (t.length <= TEXT_MAX) return t;
    var schnitt = t.lastIndexOf(' ', TEXT_MAX);
    return t.slice(0, schnitt > 60 ? schnitt : TEXT_MAX).replace(/[\s,;:.\-–]+$/, '') + '…';
  }

  function karte(b, kopie) {
    var li = el('li', 'st-karte');
    if (kopie) li.setAttribute('aria-hidden', 'true');
    var zeile = el('div', 'st-zeile');
    var sterne = el('span', 'st-sterne');
    sterne.setAttribute('role', 'img');
    sterne.setAttribute('aria-label', b.sterne + ' von 5 Sternen');
    sterne.appendChild(document.createTextNode('★'.repeat(b.sterne)));
    if (b.sterne < 5) sterne.appendChild(el('span', 'leer', '★'.repeat(5 - b.sterne)));
    zeile.appendChild(sterne);
    var d = datumText(b);
    if (d) zeile.appendChild(el('span', 'st-datum', d));
    li.appendChild(zeile);
    var text = kuerzen(b.kommentar);
    if (text) li.appendChild(el('p', 'st-text', '„' + text + '“'));
    var meta = el('p', 'st-meta', b.name);
    var wer = (b.trainer || '') + (b.kurs ? (b.trainer ? ', ' : '') + b.kurs : '');
    if (wer) meta.appendChild(el('span', null, wer));
    li.appendChild(meta);
    return li;
  }

  function anhalten(an) {
    sec.classList.toggle('st-halt', an);
    if (knopf) {
      knopf.textContent = an ? 'Weiter' : 'Pause';
      knopf.setAttribute('aria-pressed', an ? 'true' : 'false');
      knopf.setAttribute('aria-label', an ? 'Band wieder laufen lassen' : 'Band anhalten');
    }
  }

  function zeige(liste) {
    var items = liste.filter(gueltig).slice(0, MAX);
    if (!items.length) { sec.hidden = true; spur.textContent = ''; signatur = ''; return; }
    var neu = JSON.stringify(items);
    if (neu === signatur && !sec.hidden) return; // nichts geändert: Band läuft ungestört weiter
    signatur = neu;
    stilEinmal();
    var still = ruhig || items.length < MIN_LAUF;
    spur.textContent = '';
    items.forEach(function (b) { spur.appendChild(karte(b, false)); });
    if (!still) {
      items.forEach(function (b) { spur.appendChild(karte(b, true)); });
      spur.style.animationDuration = Math.max(40, items.length * 9) + 's';
    } else {
      spur.style.animationDuration = '';
    }
    sec.classList.toggle('st-still', still);
    if (still) { fenster.setAttribute('tabindex', '0'); fenster.setAttribute('role', 'region'); fenster.setAttribute('aria-label', 'Bewertungen von Kundinnen, seitlich scrollbar'); }
    else { fenster.removeAttribute('tabindex'); fenster.removeAttribute('role'); fenster.removeAttribute('aria-label'); }
    if (knopf) knopf.hidden = still;
    anhalten(false);
    sec.hidden = false;
  }

  if (knopf) knopf.addEventListener('click', function () { anhalten(!sec.classList.contains('st-halt')); });

  function laden() {
    zuletzt = Date.now();
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var stopp = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : null;
    fetch(API, { credentials: 'omit', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(function (d) { if (d && Array.isArray(d.bewertungen)) zeige(d.bewertungen); })
      .catch(function () { /* Fehler: nichts ändern. Was schon steht, bleibt; ohne Daten bleibt der Abschnitt unsichtbar. */ })
      .then(function () { if (stopp) clearTimeout(stopp); });
  }

  // Erster Abruf erst nach dem Laden der Seite, damit er den Seitenaufbau nicht bremst
  if (document.readyState === 'complete') laden();
  else window.addEventListener('load', laden, { once: true });
  setInterval(function () { if (document.visibilityState === 'visible') laden(); }, TAKT);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible' && Date.now() - zuletzt >= TAKT) laden();
  });
})();
