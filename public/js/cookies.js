(function () {
  var COOKIE_KEY = 'isard-cookies';

  var texts = {
    es: {
      message: 'Utilizamos cookies para mejorar tu experiencia. Al aceptar, permites el uso del chat de soporte.',
      accept: 'Aceptar',
      reject: 'Rechazar',
      privacy: 'Política de Privacidad'
    },
    ca: {
      message: 'Utilitzem cookies per millorar la teva experiència. En acceptar, permets l\'ús del xat de suport.',
      accept: 'Acceptar',
      reject: 'Rebutjar',
      privacy: 'Política de Privacitat'
    },
    en: {
      message: 'We use cookies to improve your experience. By accepting, you allow the support chat widget.',
      accept: 'Accept',
      reject: 'Reject',
      privacy: 'Privacy Policy'
    }
  };

  function getLang() {
    var stored = localStorage.getItem('isard-lang');
    return (stored && texts[stored]) ? stored : 'es';
  }

  function getConsent() {
    return localStorage.getItem(COOKIE_KEY);
  }

  function setConsent(value) {
    localStorage.setItem(COOKIE_KEY, value);
  }

  function loadBrevo() {
    (function (d, w, c) {
      w.BrevoConversationsID = '69e161ed30e28454ca00bd4d';
      w[c] = w[c] || function () {
        (w[c].q = w[c].q || []).push(arguments);
      };
      var s = d.createElement('script');
      s.async = true;
      s.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';
      if (d.head) d.head.appendChild(s);
    })(document, window, 'BrevoConversations');
  }

  function showBanner() {
    var lang = getLang();
    var t = texts[lang];

    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.innerHTML =
      '<div class="cookie-content">' +
        '<p>' + t.message + ' <a href="/privacy">' + t.privacy + '</a></p>' +
        '<div class="cookie-buttons">' +
          '<button class="cookie-reject">' + t.reject + '</button>' +
          '<button class="cookie-accept">' + t.accept + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    banner.querySelector('.cookie-accept').addEventListener('click', function () {
      setConsent('accepted');
      banner.remove();
      loadBrevo();
    });

    banner.querySelector('.cookie-reject').addEventListener('click', function () {
      setConsent('rejected');
      banner.remove();
    });
  }

  var consent = getConsent();
  if (consent === 'accepted') {
    loadBrevo();
  } else if (!consent) {
    showBanner();
  }
})();
