(function () {
  var menuTexts = {
    es: { home: 'Inicio', calendar: 'Carreras', races: 'Alertas de Carreras', contact: 'Contacto', privacy: 'Privacidad' },
    ca: { home: 'Inici', calendar: 'Curses', races: 'Alertes de Curses', contact: 'Contacte', privacy: 'Privacitat' },
    en: { home: 'Home', calendar: 'Races', races: 'Race Alerts', contact: 'Contact', privacy: 'Privacy' }
  };

  function getLang() {
    try {
      var param = new URLSearchParams(window.location.search).get('lang');
      if (param && menuTexts[param]) return param;
    } catch (e) {}
    var stored = localStorage.getItem('isard-lang');
    return (stored && menuTexts[stored]) ? stored : 'es';
  }

  function buildHeader() {
    var lang = getLang();
    var t = menuTexts[lang];

    var header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML =
      '<div class="header-inner">' +
        '<a href="/" class="header-logo"><img src="/iSardLogoLime.svg" alt="iSard"></a>' +
        '<button class="hamburger" aria-label="Menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
        '<nav class="header-nav">' +
          '<a href="/" class="nav-link" data-nav="home">' + t.home + '</a>' +
          '<a href="/race-calendar" class="nav-link" data-nav="calendar">' + t.calendar + '</a>' +
          '<a href="/race-alerts" class="nav-link" data-nav="races">' + t.races + '</a>' +
          '<a href="/contact" class="nav-link" data-nav="contact">' + t.contact + '</a>' +
          '<a href="/privacy" class="nav-link" data-nav="privacy">' + t.privacy + '</a>' +
          '<div class="header-lang"></div>' +
          '<button class="theme-toggle" onclick="themeToggle()" aria-label="Toggle theme"><span class="theme-toggle-icon"></span></button>' +
        '</nav>' +
      '</div>';

    document.body.insertBefore(header, document.body.firstChild);

    // Mark the active nav link for the current route. Sections span several
    // paths: race detail pages (/races/<slug>) belong to the calendar, and the
    // alerts link (/race-alerts) also covers its localized/status variants
    // (/race-alerts-es, /race-alerts-confirmed, …).
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    var navItems = header.querySelectorAll('.nav-link');
    for (var n = 0; n < navItems.length; n++) {
      var href = (navItems[n].getAttribute('href') || '').replace(/\/+$/, '') || '/';
      var active;
      if (href === '/') {
        active = path === '/';
      } else if (href === '/race-calendar') {
        active = path === href || path.indexOf('/races') === 0;
      } else {
        active = path === href || path.indexOf(href + '-') === 0 || path.indexOf(href + '/') === 0;
      }
      if (active) navItems[n].setAttribute('aria-current', 'page');
    }

    // Hamburger toggle
    var hamburger = header.querySelector('.hamburger');
    var nav = header.querySelector('.header-nav');
    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
    });

    // Close menu on link click (mobile)
    var links = nav.querySelectorAll('.nav-link');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function () {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      });
    }
  }

  function updateHeaderTexts(lang) {
    var t = menuTexts[lang] || menuTexts['es'];
    var links = document.querySelectorAll('[data-nav]');
    for (var i = 0; i < links.length; i++) {
      var key = links[i].getAttribute('data-nav');
      if (t[key]) links[i].textContent = t[key];
    }
  }

  window.headerUpdateLang = updateHeaderTexts;

  buildHeader();
})();
