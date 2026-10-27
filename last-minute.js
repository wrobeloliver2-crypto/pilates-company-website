/*
  Last-Minute-Plätze (Oliver, 23.10.2026). Holt die freien Plätze aus Studio OS und zeigt sie nur, wenn
  Studio OS aktiv=true meldet. Ohne JavaScript, bei aktiv=false, Fehler oder 429 bleibt alles unsichtbar.
  Keine Cookies, kein localStorage. Die Quelle (?q=) wird nur aus der Adresse gelesen und weitergereicht.

  Elemente auf den Seiten:
    #lm-streifen            Streifen unter dem Hero (Startseite), <aside aria-live="polite" style="display:none">
    [data-lm-zeige]         Verweise (Preise-Karte, Kurse-Link, Footer), style="display:none", erscheinen bei aktiv=true
    #lm-liste, #lm-leer     Seite /last-minute: Liste und Leerzustand (bei abgleich.veraltet: „wird gerade aktualisiert“)
*/
(function () {
  'use strict';
  var API = 'https://mitglieder.pilatescompany.de/api/last-minute';
  var TAKT = 60000;
  var QUELLEN = ['insta', 'newsletter', 'story', 'google', 'wa'];
  var TZ = 'Europe/Berlin';

  var roh = (new URLSearchParams(location.search).get('q') || '').toLowerCase();
  var quelle = QUELLEN.indexOf(roh) !== -1 ? roh : 'andere';

  var streifen = document.getElementById('lm-streifen');
  var liste = document.getElementById('lm-liste');
  var leer = document.getElementById('lm-leer');
  var verweise = document.querySelectorAll('[data-lm-zeige]');
  if (!streifen && !liste && !verweise.length) return;

  function mitQuelle(url) {
    return url + (url.indexOf('?') === -1 ? '?' : '&') + 'q=' + encodeURIComponent(quelle);
  }
  function euro(cent) {
    return (cent / 100).toFixed(2).replace('.', ',');
  }
  function tagKey(d) {
    return d.toLocaleDateString('sv-SE', { timeZone: TZ });
  }
  function uhrzeit(d) {
    return d.toLocaleTimeString('de-DE', { timeZone: TZ, hour: '2-digit', minute: '2-digit' });
  }
  function tagText(d) {
    var heute = new Date();
    var morgen = new Date(heute.getTime() + 864e5);
    if (tagKey(d) === tagKey(heute)) return 'Heute';
    if (tagKey(d) === tagKey(morgen)) return 'Morgen';
    return d.toLocaleDateString('de-DE', { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'numeric' });
  }
  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function gueltig(t) {
    return t && typeof t.id === 'string' && typeof t.kurs === 'string' && !isNaN(new Date(t.start)) &&
      typeof t.preis_cent === 'number' && typeof t.kauf_url === 'string' &&
      t.kauf_url.indexOf('https://mitglieder.pilatescompany.de/') === 0;
  }

  var STIL = '.lm-streifen{background:#FAF6F3;border-top:1px solid #E9DAD4;border-bottom:1px solid #E9DAD4;min-height:72px}' +
    '.lm-streifen .lm-innen{max-width:1100px;margin:0 auto;padding:12px 16px;display:flex;align-items:center;gap:12px 16px;flex-wrap:wrap;justify-content:space-between;font-family:Poppins,system-ui,sans-serif}' +
    '.lm-streifen p{margin:0;font-size:15px;line-height:1.45;color:#241D1A;flex:1 1 240px}' +
    '.lm-streifen p b{font-weight:600}' +
    '.lm-streifen p span{color:#6F625D;font-weight:400;white-space:nowrap}' +
    '.lm-knopf{min-height:48px;display:inline-flex;align-items:center;justify-content:center;padding:0 22px;border-radius:14px;background:#9C6055;color:#fff;font-size:15px;font-weight:600;text-decoration:none;white-space:nowrap}' +
    '.lm-knopf:hover{background:#874F45}' +
    '.lm-knopf:focus-visible{outline:2px solid #9C6055;outline-offset:2px}' +
    '@media (max-width:480px){.lm-streifen .lm-knopf{width:100%}}';
  function stilEinmal() {
    if (document.getElementById('lm-stil')) return;
    var s = document.createElement('style');
    s.id = 'lm-stil';
    s.textContent = STIL;
    document.head.appendChild(s);
  }

  function zeigeStreifen(termine) {
    if (!streifen) return;
    if (!termine.length) { streifen.style.display = 'none'; streifen.textContent = ''; return; }
    stilEinmal();
    var t = termine[0];
    var d = new Date(t.start);
    var innen = el('div', 'lm-innen');
    var p = el('p');
    p.appendChild(document.createTextNode(tagText(d) + ' noch frei: '));
    p.appendChild(el('b', null, t.kurs + ', ' + uhrzeit(d) + ' Uhr'));
    p.appendChild(document.createTextNode(' · ' + euro(t.preis_cent) + ' €'));
    if (termine.length > 1) {
      p.appendChild(document.createTextNode(' '));
      p.appendChild(el('span', null, '+' + (termine.length - 1) + ' weitere'));
    }
    var a = el('a', 'lm-knopf', 'Platz sichern');
    // Der Streifen führt auf /last-minute; eine erkannte Quelle der Startseite (z. B. ?q=insta) geht mit
    a.href = quelle !== 'andere' ? mitQuelle('/last-minute') : '/last-minute';
    innen.appendChild(p);
    innen.appendChild(a);
    streifen.textContent = '';
    streifen.appendChild(innen);
    streifen.style.display = '';
  }

  // Der Abgleich mit Eversports ist veraltet (Studio OS meldet abgleich.veraltet): Technik, nicht „ausgebucht“.
  var TEXT_LEER = 'Gerade ist nichts frei. Schau später wieder vorbei.';
  var TEXT_VERALTET = 'Die Übersicht der freien Plätze wird gerade aktualisiert. Schau in ein paar Minuten noch einmal vorbei.';

  function zeigeListe(termine, veraltet) {
    if (!liste) return;
    liste.textContent = '';
    termine.forEach(function (t) {
      var d = new Date(t.start);
      var li = el('li', 'lm-termin');
      var txt = el('div', 'lm-txt');
      txt.appendChild(el('b', null, t.kurs));
      txt.appendChild(el('span', null, tagText(d) + ', ' + uhrzeit(d) + ' Uhr' +
        (t.freie_plaetze === 1 ? ' · 1 Platz frei' : '')));
      var preis = el('span', 'lm-preis', euro(t.preis_cent) + ' €');
      var a = el('a', 'knopf lm-kauf', 'Platz sichern');
      a.href = mitQuelle(t.kauf_url);
      a.setAttribute('aria-label', 'Platz sichern: ' + t.kurs + ', ' + tagText(d) + ' ' + uhrzeit(d) + ' Uhr');
      li.appendChild(txt);
      li.appendChild(preis);
      li.appendChild(a);
      liste.appendChild(li);
    });
    liste.style.display = termine.length ? '' : 'none';
    if (leer) {
      leer.style.display = termine.length ? 'none' : '';
      var text = leer.querySelector('p');
      if (text) text.textContent = veraltet ? TEXT_VERALTET : TEXT_LEER;
    }
  }

  function anwenden(d) {
    var aktiv = !!(d && d.aktiv === true);
    var termine = aktiv && Array.isArray(d.termine) ? d.termine.filter(gueltig) : [];
    termine.sort(function (a, b) { return new Date(a.start) - new Date(b.start); });
    for (var i = 0; i < verweise.length; i++) verweise[i].style.display = aktiv ? '' : 'none';
    zeigeStreifen(termine);
    zeigeListe(termine, aktiv && !termine.length && !!(d.abgleich && d.abgleich.veraltet === true));
  }

  var zuletzt = 0;
  function laden() {
    zuletzt = Date.now();
    var ctrl = typeof AbortController === 'function' ? new AbortController() : null;
    var stopp = ctrl ? setTimeout(function () { ctrl.abort(); }, 8000) : null;
    fetch(API, { credentials: 'omit', cache: 'default', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { if (!r.ok) throw new Error(String(r.status)); return r.json(); })
      .then(anwenden)
      .catch(function () { anwenden(null); })
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
