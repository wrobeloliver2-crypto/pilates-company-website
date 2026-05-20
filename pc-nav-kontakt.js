(function() {
  var style = document.createElement('style');
    style.textContent = '.nav-dropdown{position:relative}.nav-dropdown-menu{display:none;position:absolute;top:calc(100% + 8px);left:50%;transform:translateX(-50%);min-width:220px;background:rgba(250,247,244,.98);backdrop-filter:blur(12px);border:1px solid rgba(44,40,37,.1);border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.12);padding:.4rem 0;list-style:none;z-index:200;white-space:nowrap}.nav-dropdown:hover .nav-dropdown-menu{display:block}.nav-dropdown-menu li a{display:flex;align-items:center;gap:.6rem;padding:.65rem 1.25rem;font-size:.78rem;font-weight:400;letter-spacing:.03em;color:var(--text-mid)!important;text-transform:uppercase;text-decoration:none;transition:color .2s,background .2s}.nav-dropdown-menu li a:hover{color:var(--rose-dark)!important;background:var(--rose-light)}.nav-dropdown-toggle::after{content:" \25be";font-size:.65rem}';
      document.head.appendChild(style);
        function insert() {
            var nav = document.querySelector('.nav-links');
                if (!nav || nav.querySelector('.nav-dropdown')) return;
                    var dl = Array.from(nav.querySelectorAll('li')).find(function(li){var a=li.querySelector('a');return a&&a.href.indexOf('downloads.html')>-1;});
                        if (!dl) return;
                            var d = document.createElement('li');
                                d.className = 'nav-dropdown';
                                    d.innerHTML = '<a href="kontakt.html" class="nav-dropdown-toggle">KONTAKT</a><ul class="nav-dropdown-menu"><li><a href="kontakt.html">✉ Kontaktformular</a></li><li><a href="probetraining.html">🧘 Probetraining</a></li><li><a href="https://wa.me/491751266117" target="_blank">💬 WhatsApp</a></li></ul>';
                                        dl.parentNode.insertBefore(d, dl.nextSibling);
                                          }
                                            document.readyState==='loading'?document.addEventListener('DOMContentLoaded',insert):insert();
                                            })();
