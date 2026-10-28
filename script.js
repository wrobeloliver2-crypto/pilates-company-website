// Google Ads Conversion Tracking (AW-18174020065)
(function() {
  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=AW-18174020065';
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', 'AW-18174020065', { linker: { domains: ['mitglieder.pilatescompany.de'] } });
  // Klicks auf Abschluss und Probetraining (vorher nur auf /preise)
  document.addEventListener('click', function (e) {
    var a = e.target.closest ? e.target.closest('a') : null; if (!a || !a.href) return;
    if (a.href.indexOf('mitglied-werden') !== -1) window.dataLayer.push({ event: 'mitglied_werden_klick' });
    if (a.href.indexOf('/probetraining') !== -1) window.dataLayer.push({ event: 'probetraining_buchen_klick' });
  });
})();

// ══════════════════════════════════════════════════════════════════
// Pilates Conversion Tracking – zentrale Helferfunktion
// Getrennte Conversions pro Formular. Labels stammen aus Google Ads
// (Conversion-ID AW-18174020065).
//   probetraining : bestehendes Label, verifiziert
//   kontakt       : NEUES Label vom Dienstleister eintragen
//   personal      : NEUES Label vom Dienstleister eintragen
// ══════════════════════════════════════════════════════════════════
window.PC_CONV_LABELS = {
  probetraining: 'AW-18174020065/2zNACl3CzLkcEOGThtpD',
  kontakt:       'AW-18174020065/bkKSCNSU_LscEOGThtpD',
  personal:      'AW-18174020065/kbdfCPGP57scEOGThtpD'
};
function pcConversion(key) {
  try {
    var sendTo = window.PC_CONV_LABELS[key];
    if (!sendTo || sendTo.indexOf('__LABEL_') !== -1) return; // Label noch nicht gesetzt
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'conversion', { 'send_to': sendTo });
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'pilates_lead_' + key });
  } catch (e) {}
}
window.pcConversion = pcConversion;

// ══════════════════════════════════════════════════════════════════
// PILATES COMPANY LÜBECK - MULTI-PAGE WEBSITE JAVASCRIPT
// Multi-Page: Jede HTML-Datei ist eigenständig (keine showPage mehr)
// ══════════════════════════════════════════════════════════════════

// ── COUNTER ANIMATION (für Homepage Stats) ──
function animateCounters() {
  document.querySelectorAll('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const steps = 60;
    let current = 0; let step = 0;
    const ease = t => t < .5 ? 2*t*t : -1+(4-2*t)*t;
    const timer = setInterval(() => {
      step++;
      current = Math.round(ease(step/steps) * target);
      el.textContent = current.toLocaleString('de-DE') + suffix;
      if (step >= steps) { el.textContent = target.toLocaleString('de-DE') + suffix; clearInterval(timer); }
    }, duration / steps);
  });
}

// Counter beim Scrollen starten
let countersAnimated = false;
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting && !countersAnimated) { countersAnimated = true; animateCounters(); } });
}, { threshold: 0.3 });

document.addEventListener('DOMContentLoaded', () => {
  const statsBar = document.querySelector('.stats-bar');
  if (statsBar) statsObserver.observe(statsBar);
});

// ── MOBILE MENU TOGGLE ──
function toggleMenu() {
  var menu = document.getElementById('mobileMenu');
  if (!menu) return;
  var isOpen = menu.classList.toggle('open');
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

// Menü schließen beim Klick auf Link
document.addEventListener('DOMContentLoaded', () => {
  const mobileMenu = document.getElementById('mobileMenu');
  if (mobileMenu) {
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }
});


// ── MENÜ (Vollbild-Overlay, neue Kopfzeile) ──
document.addEventListener('DOMContentLoaded', function () {
  var burger = document.getElementById('burger'), menu = document.getElementById('menu'), zu = document.getElementById('menuZu');
  if (!burger || !menu) return;
  function setMenu(auf) {
    menu.classList.toggle('offen', auf);
    document.body.classList.toggle('menu-offen', auf);
    burger.setAttribute('aria-expanded', String(auf));
    (auf && zu ? zu : burger).focus({ preventScroll: true });
  }
  burger.addEventListener('click', function () { setMenu(true); });
  if (zu) zu.addEventListener('click', function () { setMenu(false); });
  menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { menu.classList.remove('offen'); document.body.classList.remove('menu-offen'); }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('offen')) setMenu(false); });
});

// ── DESKTOP-MENÜ (Aufklapp-Bereiche in der Kopfzeile) ──
document.addEventListener('DOMContentLoaded', function () {
  var nav = document.querySelector('.hauptnav');
  if (!nav) return;
  var punkte = nav.querySelectorAll('.ebene');
  function zu() { punkte.forEach(function (li) { li.querySelector('button').setAttribute('aria-expanded', 'false'); }); }
  punkte.forEach(function (li) {
    var b = li.querySelector('button');
    function auf(an) { b.setAttribute('aria-expanded', String(an)); }
    li.addEventListener('mouseenter', function () { nav.removeAttribute('data-zu'); auf(true); });
    li.addEventListener('mouseleave', function () { auf(false); });
    li.addEventListener('focusin', function () { nav.removeAttribute('data-zu'); auf(true); });
    li.addEventListener('focusout', function (e) { if (!li.contains(e.relatedTarget)) auf(false); });
    b.addEventListener('click', function (e) {
      // Maus/Touch: Hover hat schon geöffnet, der Klick lässt offen. Tastatur (Enter/Leertaste): umschalten.
      var tastatur = e.detail === 0;
      var offen = b.getAttribute('aria-expanded') === 'true' && !nav.hasAttribute('data-zu');
      if (tastatur && offen) { nav.setAttribute('data-zu', ''); auf(false); } else { nav.removeAttribute('data-zu'); auf(true); }
    });
  });
  document.addEventListener('click', function (e) { if (!nav.contains(e.target)) { nav.setAttribute('data-zu', ''); zu(); } });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    nav.setAttribute('data-zu', ''); zu();
    if (nav.contains(document.activeElement)) document.activeElement.blur();
  });
});

// ── STUDIO NEWS (Google Sheets) ──
const NEWS_CSV = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7jQ1nTLKVXPoI-ndhl35ds5YbmpI5DOWbMX1ivGTgmxeZNGLEU-Eex4BfMEg3-KJJZbTHLdbcNNRF/pub?output=csv';
let newsLoaded = false;

function loadNews() {
  if (newsLoaded) return;
  const grid = document.getElementById('news-grid');
  const loading = document.getElementById('news-loading');
  const error = document.getElementById('news-error');
  
  if (!grid) return;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  
  fetch(NEWS_CSV, { signal: controller.signal })
    .then(r => { clearTimeout(timeout); if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
    .then(csv => {
      newsLoaded = true;
      const rows = parseCSV(csv);
      if (rows.length <= 1) { showNewsError('Keine Einträge gefunden'); return; }
      const headers = rows[0].map(h => h.trim().toLowerCase());
      const items = rows.slice(1).filter(r => r.some(c => c.trim()));
      
      if (loading) loading.style.display = 'none';
      grid.style.display = 'grid';
      
      items.reverse().forEach(row => {
        const get = key => (row[headers.indexOf(key)] || '').trim();
        grid.appendChild(buildNewsCard({
          datum: get('datum'), titel: get('titel'),
          kategorie: get('kategorie'), text: get('text'),
          bild_url: get('bild_url'), video_url: get('video_url'),
          autor: get('autor')
        }));
      });
    })
    .catch(err => { clearTimeout(timeout); showNewsError('Fehler: ' + err.message); });
}

function showNewsError(msg) {
  const loading = document.getElementById('news-loading');
  const error = document.getElementById('news-error');
  if (loading) loading.style.display = 'none';
  if (error) {
    error.style.display = 'block';
    if (msg) {
      const p = error.querySelector('p');
      if (p) p.textContent = msg;
    }
  }
}

function buildNewsCard(n) {
  const div = document.createElement('div');
  div.className = 'news-card';
  const datum = n.datum ? new Date(n.datum).toLocaleDateString('de-DE', {day:'2-digit', month:'long', year:'numeric'}) : '';
  const imgHtml = n.bild_url
    ? `<div class="news-card-img"><img src="${n.bild_url}" alt="${n.titel}" onerror="this.parentNode.innerHTML='<div class=news-card-img-placeholder><img src=/assets/logo-klein.png></div>'"></div>`
    : `<div class="news-card-img"><div class="news-card-img-placeholder"><img src="/assets/logo-klein.png" alt="logo"></div></div>`;
  const videoHtml = n.video_url ? `<div class="news-card-video"><a href="${n.video_url}" target="_blank">▶ Video ansehen</a></div>` : '';
  const autorHtml = n.autor ? `<span class="news-card-autor">✍ ${n.autor}</span>` : '';
  div.innerHTML = `${imgHtml}<div class="news-card-body">
    <div class="news-card-meta">${n.kategorie ? `<span class="news-card-kat">${n.kategorie}</span>` : ''}${datum ? `<span class="news-card-datum">${datum}</span>` : ''}${autorHtml}</div>
    <p class="news-card-titel">${n.titel}</p>
    <p class="news-card-text">${n.text.replace(/\n/g,'<br>')}</p>
    ${videoHtml}</div>`;
  return div;
}

function parseCSV(text) {
  const rows = []; let row = []; let cell = ''; let inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') { inQ = !inQ; }
    else if (c === ',' && !inQ) { row.push(cell); cell = ''; }
    else if ((c === '\n' || c === '\r') && !inQ) {
      row.push(cell); cell = '';
      if (row.some(x => x)) rows.push(row);
      row = [];
      if (c === '\r' && text[i+1] === '\n') i++;
    } else { cell += c; }
  }
  if (cell || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// ── ANFRAGE-FORMULARE (Kontakt, Personal Training) ──
// Eigene Formulare statt HubSpot (seit 24.10.2026): <form data-pc-anfrage="kontakt|personal-training">.
// Absenden per fetch an /.netlify/functions/sendmail: Mail an Oliver und Lead ins Dashboard.
// Das versteckte Feld "website" fängt Bots ab.
document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('form[data-pc-anfrage]').forEach(function (form) {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = form.querySelector('button[type=submit]');
      var status = form.querySelector('.pc-anfrage-status');
      var text = btn.textContent;
      var daten = { art: form.dataset.pcAnfrage };
      new FormData(form).forEach(function (v, k) { daten[k] = String(v); });
      btn.disabled = true; btn.textContent = 'Wird gesendet …';
      status.textContent = ''; status.classList.remove('fehler');
      try {
        var res = await fetch('/.netlify/functions/sendmail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(daten)
        });
        var d = await res.json().catch(function () { return { ok: false }; });
        if (res.ok && d.ok) {
          pcConversion(form.dataset.pcAnfrage === 'kontakt' ? 'kontakt' : 'personal');
          var danke = document.createElement('p');
          danke.className = 'pc-anfrage-danke';
          danke.setAttribute('role', 'status');
          danke.textContent = 'Danke für deine Nachricht! Wir melden uns so schnell wie möglich bei dir.';
          form.replaceWith(danke);
          return;
        }
        status.textContent = d.error || 'Das hat leider nicht geklappt. Ruf uns gern an: 0451 - 160 830 19';
      } catch (err) {
        status.textContent = 'Das hat leider nicht geklappt. Ruf uns gern an: 0451 - 160 830 19';
      }
      status.classList.add('fehler');
      btn.disabled = false; btn.textContent = text;
    });
  });
});

// ── NEWS LADEN auf studio-news.html ──
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('news-grid')) {
    loadNews();
  }
});

// ── FLOATING Q&A BUTTON + MODAL (alle Seiten) ──
(function() {
  if (document.getElementById('pc-qa-overlay')) return;

  // Styles
  const style = document.createElement('style');
  style.textContent = `
    #pc-qa-overlay {
      display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);
      z-index:9000;align-items:center;justify-content:center;
      padding:1rem;backdrop-filter:blur(3px);
    }
    #pc-qa-overlay.open { display:flex; }
    #pc-qa-box {
      background:#FAF6F3;border-radius:20px;max-width:460px;width:100%;
      height:580px;overflow:hidden;position:relative;
      box-shadow:0 20px 60px rgba(0,0,0,.25);
      display:flex;flex-direction:column;font-family:'Poppins',sans-serif;
    }
    #pc-qa-header {
      background:#9C6055;color:#fff;padding:14px 18px;
      display:flex;align-items:center;gap:11px;flex-shrink:0;
    }
    #pc-qa-header-icon {
      width:36px;height:36px;background:rgba(255,255,255,.2);
      border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;
    }
    #pc-qa-close {
      margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;
      border-radius:50%;width:40px;height:40px;cursor:pointer;font-size:18px;flex-shrink:0;
      display:flex;align-items:center;justify-content:center;
    }
    #pc-qa-msgs {
      flex:1;overflow-y:auto;padding:14px 13px;
      display:flex;flex-direction:column;gap:10px;scroll-behavior:smooth;
    }
    .pc-msg {
      max-width:88%;padding:11px 13px;border-radius:14px;
      font-size:13.5px;line-height:1.6;animation:pcFade .2s ease;
    }
    @keyframes pcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1}}
    .pc-msg-bot {
      background:#fff;border:1px solid #F0E3DE;
      border-bottom-left-radius:4px;align-self:flex-start;color:#241D1A;
    }
    .pc-msg-user {
      background:#9C6055;color:#fff;
      border-bottom-right-radius:4px;align-self:flex-end;
    }
    .pc-typing {
      display:flex;gap:4px;padding:13px 15px;background:#fff;
      border:1px solid #F0E3DE;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;
    }
    .pc-typing span {
      width:7px;height:7px;border-radius:50%;background:#9C6055;
      animation:pcBounce 1.2s infinite;
    }
    .pc-typing span:nth-child(2){animation-delay:.2s}
    .pc-typing span:nth-child(3){animation-delay:.4s}
    @keyframes pcBounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
    #pc-qa-chips {display:flex;flex-wrap:wrap;gap:6px;padding:2px 13px 8px;}
    .pc-chip {
      background:#fff;border:1px solid #E9DAD4;border-radius:20px;
      padding:6px 12px;font-size:12.5px;color:#874F45;
      cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap;
    }
    .pc-chip:hover{background:#9C6055;color:#fff;border-color:#9C6055;}
    #pc-qa-input-row {
      padding:9px 13px 13px;display:flex;gap:8px;flex-shrink:0;
      background:#FAF6F3;border-top:1px solid #F0E3DE;
    }
    #pc-qa-input {
      flex:1;min-width:0;border:1.5px solid #948780;border-radius:22px;
      padding:9px 15px;font-size:16px;font-family:inherit;
      background:#fff;outline:none;color:#241D1A;height:40px;
    }
    #pc-qa-input:focus{border-color:#9C6055;}
    #pc-qa-send {
      width:40px;height:40px;background:#9C6055;border:none;
      border-radius:50%;cursor:pointer;display:flex;align-items:center;
      justify-content:center;flex-shrink:0;transition:background .15s;
    }
    #pc-qa-send:hover{background:#874F45;}
    #pc-qa-send:disabled{opacity:.4;cursor:default;}
    .pc-hint{margin-top:8px;padding-top:8px;border-top:1px solid #F0E3DE;font-size:11.5px;color:#6F625D;}
    .pc-hint a{color:#874F45;text-decoration:none;font-weight:500;}
    .pc-cta-row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
    .pc-cta-btn{background:#9C6055;color:#fff;border:none;border-radius:8px;padding:8px 13px;font-size:12.5px;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-block;}
    .pc-cta-btn.outline{background:transparent;color:#874F45;border:1px solid #9C6055;}
    #pc-float-btn {
      position:fixed;top:50%;right:0;transform:translateY(-50%);
      z-index:8000;background:#9C6055;color:#fff;border:none;
      border-radius:10px 0 0 10px;padding:14px 16px;
      font-size:14px;font-weight:600;font-family:inherit;
      cursor:pointer;display:flex;align-items:center;gap:8px;
      box-shadow:-3px 0 16px rgba(156,96,85,.4);
      transition:padding .2s,box-shadow .2s;white-space:nowrap;
    }
    #pc-float-btn:hover{padding-right:22px;box-shadow:-5px 0 22px rgba(156,96,85,.55);}
    @media(max-width:640px){
      #pc-qa-box{height:85vh;border-radius:20px 20px 0 0;}
      #pc-qa-overlay{align-items:flex-end;padding:0;}
      #pc-float-btn{display:none;}
    }
    #pc-mobile-bar{display:none;}
    @media(max-width:640px){
      #pc-mobile-bar{
        display:flex;align-items:center;gap:10px;
        position:fixed;bottom:0;left:0;right:0;z-index:8500;
        background:rgba(250,246,243,.97);backdrop-filter:blur(12px);
        border-top:1px solid #F0E3DE;
        padding:10px 16px calc(12px + env(safe-area-inset-bottom));
      }
      #pc-mobile-bar a,#pc-mobile-bar button{
        flex:1;display:flex;align-items:center;justify-content:center;gap:7px;
        font-family:inherit;font-size:14.5px;font-weight:600;
        min-height:52px;padding:0 14px;border-radius:14px;cursor:pointer;
        white-space:nowrap;border:none;text-decoration:none;line-height:1;
      }
      #pc-mobile-bar .pc-bar-member{background:#9C6055;color:#fff;}
      #pc-mobile-bar .pc-bar-chat{background:#fff;color:#241D1A;border:1px solid #E9DAD4;}
      #pc-mobile-bar .pc-bar-chat svg{width:16px;height:16px;}
      body.pc-chat-open #pc-mobile-bar{display:none!important;}
      body:not([data-ohne-leiste]) footer,body:not([data-ohne-leiste]) .fuss{padding-bottom:6.5rem!important;}
    }
  `;
  document.head.appendChild(style);

  // Modal HTML
  const overlay = document.createElement('div');
  overlay.id = 'pc-qa-overlay';
  overlay.onclick = function(e){ if(e.target===overlay) closePcQA(); };
  overlay.innerHTML = `
    <div id="pc-qa-box">
      <div id="pc-qa-header">
        <div id="pc-qa-header-icon">🌸</div>
        <div>
          <div style="font-size:14px;font-weight:600;">Pilates Company Lübeck</div>
          <div style="font-size:11px;opacity:.8;margin-top:1px;">Deine persönliche Beraterin</div>
        </div>
        <button id="pc-qa-close" onclick="closePcQA()">✕</button>
      </div>
      <div id="pc-qa-msgs"></div>
      <div id="pc-qa-chips"></div>
      <div id="pc-qa-input-row">
        <input id="pc-qa-input" type="text" placeholder="Deine Frage …" autocomplete="off">
        <button id="pc-qa-send">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // Floating Button
  const btn = document.createElement('button');
  btn.id = 'pc-float-btn';
  btn.innerHTML = '<svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>Frag mich was';
  btn.onclick = openPcQA;
  document.body.appendChild(btn);

  // Mobile Sticky-Leiste (global, alle Seiten mit script.js)
  const mbar = document.createElement('div');
  mbar.id = 'pc-mobile-bar';
  mbar.innerHTML = '<a class="pc-bar-member" href="/preise">Mitglied werden</a>'
    + '<button class="pc-bar-chat" type="button"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>Frag mich was</button>';
  mbar.querySelector('.pc-bar-chat').onclick = openPcQA;
  // Seiten mit eigenem Formular unten (z. B. /last-minute) setzen <body data-ohne-leiste>, damit die Leiste nichts verdeckt
  if (!document.body.hasAttribute('data-ohne-leiste')) document.body.appendChild(mbar);

  // Chat Logic
  const STARTER = ['Probetraining 9,90 €','Was kostet Reformer?','Welche Kurse gibt es?','Bin ich Anfängerin – was passt?','Öffnungszeiten & Kontakt','Membership-Vergleich'];
  let pcHistory = [], pcCount = 0, pcInit = false, pcCallbackShown = false;

  // Zurück-Taste/-Geste des Handys schließt den Chat (statt die Seite zu verlassen)
  function openPcQA() {
    if (!overlay.classList.contains('open')) { try { history.pushState({ pcChat: 1 }, ''); } catch (e) {} }
    overlay.classList.add('open');
    document.body.classList.add('pc-chat-open');
    document.body.style.overflow = 'hidden';
    if (!pcInit) { pcInit = true; initChat(); }
  }
  function schliessen() {
    overlay.classList.remove('open');
    document.body.classList.remove('pc-chat-open');
    document.body.style.overflow = '';
    const inp = document.getElementById('pc-qa-input'); if (inp) inp.blur();
  }
  function closePcQA() {
    if (!overlay.classList.contains('open')) return;
    schliessen();
    if (history.state && history.state.pcChat) { try { history.back(); } catch (e) {} }
  }
  window.addEventListener('popstate', () => { if (overlay.classList.contains('open')) schliessen(); });
  window.openPcQA = openPcQA;
  window.closePcQA = closePcQA;
  document.addEventListener('keydown', e => { if(e.key==='Escape') closePcQA(); });

  function initChat() {
    addBotMsg('Hallo! Ich bin deine persönliche Beraterin der Pilates Company Lübeck. Ich helfe dir bei Fragen zu Kursen, Preisen, Membership und Probetraining.');
    setChips(STARTER);
    document.getElementById('pc-qa-send').onclick = sendMsg;
    document.getElementById('pc-qa-input').addEventListener('keydown', e => { if(e.key==='Enter') sendMsg(); });
  }

  function addBotMsg(html) {
    const msgs = document.getElementById('pc-qa-msgs');
    const el = document.createElement('div');
    el.className = 'pc-msg pc-msg-bot';
    el.innerHTML = html;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function addUserMsg(text) {
    const msgs = document.getElementById('pc-qa-msgs');
    const el = document.createElement('div');
    el.className = 'pc-msg pc-msg-user';
    el.textContent = text;
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function showTyping() {
    const msgs = document.getElementById('pc-qa-msgs');
    const el = document.createElement('div');
    el.className = 'pc-typing'; el.id = 'pc-typing';
    el.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(el); msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() { const e = document.getElementById('pc-typing'); if(e) e.remove(); }
  function setChips(arr) {
    const ch = document.getElementById('pc-qa-chips');
    ch.innerHTML = '';
    arr.forEach(l => {
      const b = document.createElement('button');
      b.className = 'pc-chip'; b.textContent = l;
      b.onclick = () => {
        if (l === 'Alle Preise ansehen') { window.location.href = '/preise'; return; }
        if (l === 'Probetraining buchen' || l === 'Kostenloses Probetraining' || /^Probetraining/.test(l)) { window.location.href = '/probetraining/'; return; }
        if (l === 'Kursplan ansehen') { window.location.href = '/probetraining/?art=dropin'; return; }
        document.getElementById('pc-qa-input').value = l; sendMsg();
      };
      ch.appendChild(b);
    });
  }

  async function sendMsg() {
    const inp = document.getElementById('pc-qa-input');
    const sendBtn = document.getElementById('pc-qa-send');
    const text = inp.value.trim();
    if (!text || sendBtn.disabled) return;
    inp.value = ''; setChips([]); sendBtn.disabled = true;
    addUserMsg(text);
    pcHistory.push({ role: 'user', content: text });
    showTyping();
    try {
      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: pcHistory })
      });
      let data;
      try { data = await res.json(); } catch(jsonErr) { data = { reply: 'Fehler beim Lesen der Antwort.' }; }
      hideTyping();
      let reply = (data && data.reply) ? data.reply : 'Entschuldigung, ich konnte deine Frage nicht beantworten.';

      // Rueckruf-Signal des Assistenten erkennen und aus dem sichtbaren Text entfernen
      const wantsCallback = /\[\[\s*RUECKRUF\s*\]\]/i.test(reply);
      reply = reply.replace(/\[\[\s*RUECKRUF\s*\]\]/ig, '').replace(/\n{3,}/g, '\n\n').trim();

      pcHistory.push({ role: 'assistant', content: reply });
      pcCount++;
      const replyHtml = reply.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>'); addBotMsg(replyHtml);

      if ((wantsCallback || pcCount >= 10) && !pcCallbackShown) {
        showCallbackForm();
      } else if (!pcCallbackShown) {
        const l = text.toLowerCase();
        if (l.match(/probe|einstieg|anfänger|neu/)) setChips(['Probetraining 9,90 €','Was erwartet mich?','Probetraining buchen']);
        else if (l.match(/reformer/)) setChips(['Was kostet Reformer?','Probetraining 9,90 €','Matte vs Reformer']);
        else if (l.match(/preis|kostet|member|abo/)) setChips(['Was kostet eine Mitgliedschaft?','Alle Preise ansehen','Probetraining buchen']);
        else setChips(['Probetraining 9,90 €','Welcher Kurs passt zu mir?','Membership-Vergleich']);
      }
    } catch(e) {
      hideTyping();
      addBotMsg('Ein Fehler ist aufgetreten. Ruf uns gerne an: <strong>0451 - 160 830 19</strong>');
    }
    sendBtn.disabled = false;
    document.getElementById('pc-qa-input').focus();
  }

  function showCallbackForm() {
    pcCallbackShown = true;
    setChips([]);
    const msgs = document.getElementById('pc-qa-msgs');
    const el = document.createElement('div');
    el.className = 'pc-msg pc-msg-bot';
    el.innerHTML =
      'Du hast dir viele Gedanken gemacht – schön! 🌸 Am einfachsten klären wir deine offenen Fragen persönlich. ' +
      'Lass mir einfach deine Nummer da, dann ruft dich unser Team zurück – ganz unverbindlich.' +
      '<div id="pc-cb-form" style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">' +
        '<input id="pc-cb-name" type="text" placeholder="Dein Name" autocomplete="name" ' +
          'style="border:1px solid #e0d8d4;border-radius:12px;padding:10px 13px;font-size:13.5px;font-family:inherit;outline:none;">' +
        '<input id="pc-cb-phone" type="tel" placeholder="Deine Telefonnummer" autocomplete="tel" ' +
          'style="border:1px solid #e0d8d4;border-radius:12px;padding:10px 13px;font-size:13.5px;font-family:inherit;outline:none;">' +
        '<textarea id="pc-cb-msg" rows="2" placeholder="Deine Nachricht (optional)" ' +
          'style="border:1px solid #e0d8d4;border-radius:12px;padding:10px 13px;font-size:13.5px;font-family:inherit;outline:none;resize:vertical;"></textarea>' +
        '<button id="pc-cb-submit" ' +
          'style="background:#d9a49a;color:#fff;border:none;border-radius:22px;padding:11px;font-size:14px;font-weight:600;font-family:inherit;cursor:pointer;">' +
          'Rückruf anfordern</button>' +
        '<div id="pc-cb-status" style="font-size:12px;color:#8a847d;text-align:center;"></div>' +
      '</div>';
    msgs.appendChild(el);
    msgs.scrollTop = msgs.scrollHeight;

    document.getElementById('pc-cb-submit').onclick = submitCallback;
  }

  async function submitCallback() {
    const nameEl = document.getElementById('pc-cb-name');
    const phoneEl = document.getElementById('pc-cb-phone');
    const msgEl = document.getElementById('pc-cb-msg');
    const btn = document.getElementById('pc-cb-submit');
    const status = document.getElementById('pc-cb-status');

    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const message = msgEl.value.trim();

    if (!name || !phone) {
      status.textContent = 'Bitte Name und Telefonnummer angeben.';
      status.style.color = '#b0796e';
      return;
    }

    btn.disabled = true; btn.textContent = 'Wird gesendet …';
    status.textContent = ''; status.style.color = '#8a847d';

    try {
      const res = await fetch('/.netlify/functions/sendmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, phone: phone, message: message })
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (res.ok && data.ok) {
        document.getElementById('pc-cb-form').innerHTML =
          '<div style="text-align:center;padding:8px;color:#5c8a6b;font-size:13.5px;">' +
          '✓ Vielen Dank, ' + name.replace(/[<>&]/g, '') + '! Wir melden uns bald bei dir.</div>';
      } else {
        status.textContent = 'Das hat leider nicht geklappt. Ruf uns gern an: 0451 - 160 830 19';
        status.style.color = '#b0796e';
        btn.disabled = false; btn.textContent = 'Rückruf anfordern';
      }
    } catch (e) {
      status.textContent = 'Das hat leider nicht geklappt. Ruf uns gern an: 0451 - 160 830 19';
      status.style.color = '#b0796e';
      btn.disabled = false; btn.textContent = 'Rückruf anfordern';
    }
  }
})();
