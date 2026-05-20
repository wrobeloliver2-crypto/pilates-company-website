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
    ? `<div class="news-card-img"><img src="${n.bild_url}" alt="${n.titel}" onerror="this.parentNode.innerHTML='<div class=news-card-img-placeholder><img src=logo.png></div>'"></div>`
    : `<div class="news-card-img"><div class="news-card-img-placeholder"><img src="logo.png" alt="logo"></div></div>`;
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

// ── KONTAKT FORM (HubSpot) ──
var kontaktFormLoaded = false;
function loadKontaktForm() {
  if (kontaktFormLoaded) return;
  var wrapper = document.getElementById('kontakt-form-wrapper');
  if (!wrapper) return;
  if (typeof hbspt === 'undefined' || typeof hbspt.forms === 'undefined') { 
    setTimeout(loadKontaktForm, 300); 
    return; 
  }
  kontaktFormLoaded = true;
  var loading = document.getElementById('kontakt-form-loading');
  if (loading) loading.style.display = 'none';
  hbspt.forms.create({
    portalId: "147264621",
    formId: "daeb21e5-4484-433b-8169-a021b54588d8",
    region: "eu1",
    target: "#kontakt-form-wrapper",
    onFormReady: function() {
      wrapper.querySelectorAll('*').forEach(function(el) {
        el.style.setProperty('font-family', "'DM Sans', system-ui, sans-serif", 'important');
      });
      new MutationObserver(function() {
        wrapper.querySelectorAll('*').forEach(function(el) {
          el.style.setProperty('font-family', "'DM Sans', system-ui, sans-serif", 'important');
        });
      }).observe(wrapper, { childList: true, subtree: true });
    }
  });
}

// Kontakt Form laden wenn Seite geladen ist
document.addEventListener('DOMContentLoaded', loadKontaktForm);

// ── PROBETRAINING FORM (HubSpot) ──
var probeFormLoaded = false;
function loadProbeForm() {
  if (probeFormLoaded) return;
  var wrapper = document.getElementById('hubspot-form-wrapper');
  if (!wrapper) return;
  if (typeof hbspt === 'undefined' || typeof hbspt.forms === 'undefined') {
    setTimeout(loadProbeForm, 300);
    return;
  }
  probeFormLoaded = true;
  var loading = document.getElementById('hbspt-form-loading');
  if (loading) loading.style.display = 'none';
  hbspt.forms.create({
    portalId: "147264621",
    formId: "8c2d002d",
    region: "eu1",
    target: "#hubspot-form-wrapper",
    onFormReady: function() {
      wrapper.querySelectorAll('*').forEach(function(el) {
        el.style.setProperty('font-family', "'DM Sans', system-ui, sans-serif", 'important');
      });
      new MutationObserver(function() {
        wrapper.querySelectorAll('*').forEach(function(el) {
          el.style.setProperty('font-family', "'DM Sans', system-ui, sans-serif", 'important');
        });
      }).observe(wrapper, { childList: true, subtree: true });
    }
  });
}

// Probetraining Form laden
document.addEventListener('DOMContentLoaded', loadProbeForm);

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
      background:#fdf9f7;border-radius:20px;max-width:460px;width:100%;
      height:580px;overflow:hidden;position:relative;
      box-shadow:0 20px 60px rgba(0,0,0,.25);
      display:flex;flex-direction:column;font-family:'DM Sans',sans-serif;
    }
    #pc-qa-header {
      background:#d9a49a;color:#fff;padding:14px 18px;
      display:flex;align-items:center;gap:11px;flex-shrink:0;
    }
    #pc-qa-header-icon {
      width:36px;height:36px;background:rgba(255,255,255,.2);
      border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;
    }
    #pc-qa-close {
      margin-left:auto;background:rgba(255,255,255,.2);border:none;color:#fff;
      border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:16px;
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
      background:#fff;border:1px solid #ede8e4;
      border-bottom-left-radius:4px;align-self:flex-start;color:#2a2a2a;
    }
    .pc-msg-user {
      background:#d9a49a;color:#fff;
      border-bottom-right-radius:4px;align-self:flex-end;
    }
    .pc-typing {
      display:flex;gap:4px;padding:13px 15px;background:#fff;
      border:1px solid #ede8e4;border-radius:14px;border-bottom-left-radius:4px;align-self:flex-start;
    }
    .pc-typing span {
      width:7px;height:7px;border-radius:50%;background:#d9a49a;
      animation:pcBounce 1.2s infinite;
    }
    .pc-typing span:nth-child(2){animation-delay:.2s}
    .pc-typing span:nth-child(3){animation-delay:.4s}
    @keyframes pcBounce{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-6px);opacity:1}}
    #pc-qa-chips {display:flex;flex-wrap:wrap;gap:6px;padding:2px 13px 8px;}
    .pc-chip {
      background:#fff;border:1px solid #e0d8d4;border-radius:20px;
      padding:6px 12px;font-size:12.5px;color:#b07d76;
      cursor:pointer;font-family:inherit;transition:all .15s;white-space:nowrap;
    }
    .pc-chip:hover{background:#d9a49a;color:#fff;border-color:#d9a49a;}
    #pc-qa-input-row {
      padding:9px 13px 13px;display:flex;gap:8px;flex-shrink:0;
      background:#fdf9f7;border-top:1px solid #ede8e4;
    }
    #pc-qa-input {
      flex:1;border:1px solid #e0d8d4;border-radius:22px;
      padding:9px 15px;font-size:13.5px;font-family:inherit;
      background:#fff;outline:none;color:#2a2a2a;height:40px;
    }
    #pc-qa-input:focus{border-color:#d9a49a;}
    #pc-qa-send {
      width:40px;height:40px;background:#d9a49a;border:none;
      border-radius:50%;cursor:pointer;display:flex;align-items:center;
      justify-content:center;flex-shrink:0;transition:background .15s;
    }
    #pc-qa-send:hover{background:#c8857a;}
    #pc-qa-send:disabled{opacity:.4;cursor:default;}
    .pc-hint{margin-top:8px;padding-top:8px;border-top:1px solid #f5f0ed;font-size:11.5px;color:#aaa;}
    .pc-hint a{color:#b07d76;text-decoration:none;font-weight:500;}
    .pc-cta-row{display:flex;gap:8px;margin-top:10px;flex-wrap:wrap;}
    .pc-cta-btn{background:#d9a49a;color:#fff;border:none;border-radius:8px;padding:8px 13px;font-size:12.5px;cursor:pointer;font-family:inherit;text-decoration:none;display:inline-block;}
    .pc-cta-btn.outline{background:transparent;color:#b07d76;border:1px solid #d9a49a;}
    #pc-float-btn {
      position:fixed;top:50%;right:0;transform:translateY(-50%);
      z-index:8000;background:#d9a49a;color:#fff;border:none;
      border-radius:10px 0 0 10px;padding:14px 16px;
      font-size:14px;font-weight:600;font-family:inherit;
      cursor:pointer;display:flex;align-items:center;gap:8px;
      box-shadow:-3px 0 16px rgba(217,164,154,.45);
      transition:padding .2s,box-shadow .2s;white-space:nowrap;
    }
    #pc-float-btn:hover{padding-right:22px;box-shadow:-5px 0 22px rgba(217,164,154,.6);}
    @media(max-width:640px){
      #pc-qa-box{height:85vh;border-radius:20px 20px 0 0;}
      #pc-qa-overlay{align-items:flex-end;padding:0;}
      #pc-float-btn{font-size:13px;padding:12px 13px;}
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

  // Chat Logic
  const STARTER = ['Kostenloses Probetraining','Was kostet Reformer?','Welche Kurse gibt es?','Bin ich Anfängerin – was passt?','Öffnungszeiten & Kontakt','Membership-Vergleich'];
  let pcHistory = [], pcCount = 0, pcInit = false;

  function openPcQA() {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    if (!pcInit) { pcInit = true; initChat(); }
  }
  function closePcQA() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
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
        if (l === 'Alle Preise ansehen') { window.location.href = 'preise.html'; return; }
        if (l === 'Probetraining buchen') { window.location.href = 'probetraining.html'; return; }
        if (l === 'Kursplan ansehen') { window.open('https://eversports.de/s/pilates-company-luebeck', '_blank'); return; }
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
      const reply = (data && data.reply) ? data.reply : 'Entschuldigung, ich konnte deine Frage nicht beantworten.';
      pcHistory.push({ role: 'assistant', content: reply });
      pcCount++;
      const replyHtml = reply.replace(/\n/g, '<br>'); addBotMsg(replyHtml + '<div class="pc-hint"><a href="probetraining.html">Probetraining anfragen</a> · <a href="https://wa.me/491516083019" target="_blank">WhatsApp</a></div>');
      if (pcCount >= 8) {
        const el = document.createElement('div');
        el.className = 'pc-msg pc-msg-bot';
        el.innerHTML = 'Du hast viele tolle Fragen gestellt! Komm einfach zu einem kostenlosen Probetraining oder ruf uns an.<div class="pc-cta-row"><a class="pc-cta-btn" href="probetraining.html">Probetraining buchen</a><a class="pc-cta-btn outline" href="https://wa.me/491516083019" target="_blank">WhatsApp</a></div>';
        document.getElementById('pc-qa-msgs').appendChild(el);
        pcCount = 0;
      } else {
        const l = text.toLowerCase();
        if (l.match(/probe|einstieg|anfänger|neu/)) setChips(['Kostenloses Probetraining','Was erwartet mich?','Probestunde 16 €']);
        else if (l.match(/reformer/)) setChips(['Was kostet Reformer?','Summer Glow 69 €','Matte vs Reformer']);
        else if (l.match(/preis|kostet|member|abo/)) setChips(['Summer Glow 69 €/Monat','Alle Preise ansehen','Probetraining buchen']);
        else if (l.match(/aerial|yoga/)) setChips(['Wer unterrichtet Aerial?','Für Anfänger?','Kursplan ansehen']);
        else setChips(['Probetraining anfragen','Kursplan ansehen','Membership-Vergleich']);
      }
    } catch(e) {
      hideTyping();
      addBotMsg('Ein Fehler ist aufgetreten. Ruf uns gerne an: <strong>0451 - 160 830 19</strong>');
    }
    sendBtn.disabled = false;
    document.getElementById('pc-qa-input').focus();
  }

  // ── KONTAKT DROPDOWN NAV ──
  (function() {
      var s = document.createElement('style');
      s.textContent = '.nav-dropdown{position:relative}.nav-dropdown-menu{display:none;position:absolute;top:calc(100% + 6px);left:50%;transform:translateX(-50%);min-width:210px;background:rgba(250,247,244,.98);backdrop-filter:blur(12px);border:1px solid rgba(44,40,37,.1);border-radius:12px;box-shadow:0 8px 28px rgba(0,0,0,.11);padding:.35rem 0;list-style:none;z-index:200}.nav-dropdown:hover .nav-dropdown-menu{display:block}.nav-dropdown-menu a{display:block;padding:.6rem 1.2rem;font-size:.78rem;letter-spacing:.03em;color:var(--text-mid)!important;text-transform:uppercase;text-decoration:none;transition:color .2s,background .2s;white-space:nowrap}.nav-dropdown-menu a:hover{color:var(--rose-dark)!important;background:var(--rose-light)}.nav-dropdown-toggle::after{content:" \25be";font-size:.6rem}';
      document.head.appendChild(s);
      function init() {
            var nav = document.querySelector('.nav-links');
            if (!nav || nav.querySelector('.nav-dropdown')) return;
            var dl = Array.from(nav.querySelectorAll('li')).find(function(li){var a=li.querySelector('a');return a&&(a.href||'').indexOf('downloads')>-1;});
            if (!dl) return;
            var d = document.createElement('li');
            d.className = 'nav-dropdown';
            d.innerHTML = '<a href="kontakt.html" class="nav-dropdown-toggle">KONTAKT</a><ul class="nav-dropdown-menu"><li><a href="kontakt.html">✉ Kontaktformular</a></li><li><a href="probetraining.html">🧘 Probetraining</a></li><li><a href="https://wa.me/491751266117" target="_blank">💬 WhatsApp</a></li></ul>';
            dl.parentNode.insertBefore(d, dl.nextSibling);
      }
      document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init();
  })();
})();
