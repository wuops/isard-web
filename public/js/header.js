(function () {
  var menuTexts = {
    es: { home: 'Inicio', contact: 'Contacto', privacy: 'Política de Privacidad' },
    ca: { home: 'Inici', contact: 'Contacte', privacy: 'Política de Privacitat' },
    en: { home: 'Home', contact: 'Contact', privacy: 'Privacy Policy' }
  };

  function getLang() {
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
        '<a href="/" class="header-logo"><img src="/iSardLogoBlack.svg" alt="iSard"></a>' +
        '<button class="hamburger" aria-label="Menu">' +
          '<span></span><span></span><span></span>' +
        '</button>' +
        '<nav class="header-nav">' +
          '<a href="/" class="nav-link" data-nav="home">' + t.home + '</a>' +
          '<a href="mailto:" class="nav-link" id="nav-contact" data-nav="contact">' + t.contact + '</a>' +
          '<a href="/privacy" class="nav-link" data-nav="privacy">' + t.privacy + '</a>' +
          '<div class="header-lang"></div>' +
        '</nav>' +
      '</div>';

    document.body.insertBefore(header, document.body.firstChild);

    // Obfuscate contact email
    var contactLink = document.getElementById('nav-contact');
    var u = 'hola', d = 'isard.app';
    contactLink.href = 'mai' + 'lto:' + u + '@' + d;

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
