(function () {
  var COOKIE_KEY = 'isard-cookies';

  var texts = {
    es: {
      message: 'Usamos cookies. Si te parece bien, haz clic en "Aceptar todas". También puedes elegir qué cookies quieres en "Ajustes".',
      policyLink: 'Leer política de cookies',
      accept: 'Aceptar todas',
      settings: 'Ajustes',
      settingsTitle: 'Ajustes de cookies',
      essential: 'Esenciales',
      essentialDesc: 'Necesarias para el funcionamiento del sitio. No se pueden desactivar.',
      chat: 'Chat de soporte',
      chatDesc: 'Permite el widget de chat de Brevo para soporte en tiempo real.',
      save: 'Guardar preferencias'
    },
    ca: {
      message: 'Utilitzem cookies. Si et sembla bé, fes clic a "Acceptar totes". També pots triar quines cookies vols a "Ajustos".',
      policyLink: 'Llegir política de cookies',
      accept: 'Acceptar totes',
      settings: 'Ajustos',
      settingsTitle: 'Ajustos de cookies',
      essential: 'Essencials',
      essentialDesc: 'Necessàries per al funcionament del lloc. No es poden desactivar.',
      chat: 'Xat de suport',
      chatDesc: 'Permet el widget de xat de Brevo per a suport en temps real.',
      save: 'Guardar preferències'
    },
    en: {
      message: 'We use cookies. If that\'s okay, click "Accept all". You can also choose which cookies you want in "Settings".',
      policyLink: 'Read cookie policy',
      accept: 'Accept all',
      settings: 'Settings',
      settingsTitle: 'Cookie settings',
      essential: 'Essential',
      essentialDesc: 'Required for the site to function. Cannot be disabled.',
      chat: 'Support chat',
      chatDesc: 'Enables the Brevo chat widget for real-time support.',
      save: 'Save preferences'
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
      '<div class="cookie-main">' +
        '<div class="cookie-content">' +
          '<p>' + t.message + ' <a href="/privacy">' + t.policyLink + '</a></p>' +
          '<div class="cookie-buttons">' +
            '<button class="cookie-settings-btn">' + t.settings + '</button>' +
            '<button class="cookie-accept">' + t.accept + '</button>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="cookie-settings" style="display:none">' +
        '<div class="cookie-settings-content">' +
          '<p class="cookie-settings-title">' + t.settingsTitle + '</p>' +
          '<div class="cookie-option">' +
            '<div class="cookie-option-text">' +
              '<span class="cookie-option-name">' + t.essential + '</span>' +
              '<span class="cookie-option-desc">' + t.essentialDesc + '</span>' +
            '</div>' +
            '<label class="cookie-toggle disabled"><input type="checkbox" checked disabled><span class="cookie-slider"></span></label>' +
          '</div>' +
          '<div class="cookie-option">' +
            '<div class="cookie-option-text">' +
              '<span class="cookie-option-name">' + t.chat + '</span>' +
              '<span class="cookie-option-desc">' + t.chatDesc + '</span>' +
            '</div>' +
            '<label class="cookie-toggle"><input type="checkbox" id="cookie-chat-toggle" checked><span class="cookie-slider"></span></label>' +
          '</div>' +
          '<button class="cookie-save">' + t.save + '</button>' +
        '</div>' +
      '</div>';

    document.body.appendChild(banner);

    banner.querySelector('.cookie-accept').addEventListener('click', function () {
      setConsent('accepted');
      banner.remove();
      loadBrevo();
    });

    banner.querySelector('.cookie-settings-btn').addEventListener('click', function () {
      var main = banner.querySelector('.cookie-main');
      var settings = banner.querySelector('.cookie-settings');
      main.style.display = 'none';
      settings.style.display = 'block';
    });

    banner.querySelector('.cookie-save').addEventListener('click', function () {
      var chatEnabled = document.getElementById('cookie-chat-toggle').checked;
      setConsent(chatEnabled ? 'accepted' : 'rejected');
      banner.remove();
      if (chatEnabled) loadBrevo();
    });
  }

  var consent = getConsent();
  if (consent === 'accepted') {
    loadBrevo();
  } else if (!consent) {
    showBanner();
  }
})();
