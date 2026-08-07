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
    // Localized pages under /es|ca|en/… declare their language in the path.
    var seg = window.location.pathname.split('/')[1];
    if (menuTexts[seg]) return seg;
    var stored = localStorage.getItem('isard-lang');
    return (stored && menuTexts[stored]) ? stored : 'es';
  }

  function buildHeader() {
    var lang = getLang();
    var t = menuTexts[lang];

    // Home and the race calendar are server-rendered per locale under /es|ca|en/,
    // so link them with the current language prefix. Alerts/contact/privacy are
    // still single-URL (client-localized), so they stay unprefixed.
    var home = '/' + lang + '/';
    var calendar = '/' + lang + '/race-calendar';

    var header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML =
      '<div class="header-inner">' +
        '<a href="' + home + '" class="header-logo"><img src="/iSardLogoLime.svg" alt="iSard"></a>' +
        '<button class="hamburger" aria-label="Menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
        '<nav class="header-nav">' +
          '<a href="' + home + '" class="nav-link" data-nav="home">' + t.home + '</a>' +
          '<a href="' + calendar + '" class="nav-link" data-nav="calendar">' + t.calendar + '</a>' +
          '<a href="/race-alerts" class="nav-link" data-nav="races">' + t.races + '</a>' +
          '<a href="/contact" class="nav-link" data-nav="contact">' + t.contact + '</a>' +
          '<a href="/privacy" class="nav-link" data-nav="privacy">' + t.privacy + '</a>' +
          '<div class="header-lang"></div>' +
          '<button class="theme-toggle" onclick="themeToggle()" aria-label="Toggle theme"><span class="theme-toggle-icon"></span></button>' +
        '</nav>' +
      '</div>';

    document.body.insertBefore(header, document.body.firstChild);

    // Mark the active nav link by section, tolerating the locale prefix. Race
    // detail pages (/<lang>/races/<slug>) belong to the calendar; the alerts
    // link also covers its localized/status variants (/race-alerts-es, …).
    var path = window.location.pathname.replace(/\/+$/, '') || '/';
    var stripped = path.replace(/^\/(es|ca|en)(?=\/|$)/, '') || '/';
    var section =
      stripped === '/' ? 'home' :
      (stripped.indexOf('/race-calendar') === 0 || stripped.indexOf('/races') === 0) ? 'calendar' :
      stripped.indexOf('/race-alerts') === 0 ? 'races' :
      stripped.indexOf('/contact') === 0 ? 'contact' :
      stripped.indexOf('/privacy') === 0 ? 'privacy' : '';
    var navItems = header.querySelectorAll('.nav-link');
    for (var n = 0; n < navItems.length; n++) {
      if (navItems[n].getAttribute('data-nav') === section) {
        navItems[n].setAttribute('aria-current', 'page');
      }
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
