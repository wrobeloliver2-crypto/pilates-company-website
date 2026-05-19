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
  // Modal einbinden falls noch nicht vorhanden
  if (!document.getElementById('pc-qa-overlay')) {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div id="pc-qa-overlay" style="display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:9000;align-items:center;justify-content:center;padding:1rem;backdrop-filter:blur(3px);" onclick="if(event.target===this)closePcQA()">
        <div style="background:#fff;border-radius:20px;max-width:460px;width:100%;height:580px;overflow:hidden;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.25);">
          <button onclick="closePcQA()" style="position:absolute;top:.75rem;right:.75rem;background:rgba(0,0,0,.12);border:none;border-radius:50%;width:28px;height:28px;cursor:pointer;font-size:.9rem;color:#fff;z-index:10;display:flex;align-items:center;justify-content:center;line-height:1;">✕</button>
          <iframe src="/pc-assistant.html" style="width:100%;height:100%;border:none;" frameborder="0"></iframe>
        </div>
      </div>
      <style>
        @media(max-width:640px){
          #pc-qa-overlay > div { height:85vh !important; border-radius:20px 20px 0 0 !important; }
          #pc-qa-overlay { align-items:flex-end !important; padding:0 !important; }
        }
      </style>`;
    document.body.appendChild(wrap);
  }

  function openPcQA() {
    document.getElementById('pc-qa-overlay').style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
  function closePcQA() {
    document.getElementById('pc-qa-overlay').style.display = 'none';
    document.body.style.overflow = '';
  }
  window.openPcQA = openPcQA;
  window.closePcQA = closePcQA;
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closePcQA(); });

  // Floating Button Styles
  const style = document.createElement('style');
  style.textContent = `
    #pc-float-btn {
      position: fixed; top: 50%; right: 0;
      transform: translateY(-50%);
      z-index: 8000;
      background: #d9a49a; color: #fff;
      border: none; border-radius: 10px 0 0 10px;
      padding: 14px 16px;
      font-size: 14px; font-weight: 600; font-family: inherit;
      cursor: pointer; display: flex; align-items: center; gap: 8px;
      box-shadow: -3px 0 16px rgba(217,164,154,0.45);
      transition: padding 0.2s, box-shadow 0.2s;
      white-space: nowrap;
    }
    #pc-float-btn:hover {
      padding-right: 22px;
      box-shadow: -5px 0 22px rgba(217,164,154,0.6);
    }
    #pc-float-btn svg { flex-shrink: 0; }
    @media(max-width:640px) {
      #pc-float-btn { font-size: 13px; padding: 12px 13px; }
    }
  `;
  document.head.appendChild(style);

  const btn = document.createElement('button');
  btn.id = 'pc-float-btn';
  btn.innerHTML = `<svg width="17" height="17" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>Frag mich was`;
  btn.onclick = openPcQA;
  document.body.appendChild(btn);
})();
