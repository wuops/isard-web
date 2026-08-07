'use strict';
/**
 * Content-rich hub definitions (prototype: distance hubs).
 *
 * Each hub selects events with `filter`, is published at a localized path
 * (`PREFIX[lang] + '/' + slug[lang]`), and carries per-locale editorial content
 * (title, description, H1, lead, body HTML, FAQ). The build (scripts/build-races.js)
 * renders one server-rendered page per locale with an SSR event ItemList, the
 * editorial guide, an FAQ, breadcrumb + related-hub links, and
 * CollectionPage/ItemList/BreadcrumbList/FAQPage JSON-LD.
 *
 * Content is factual and generic — no fabricated race rankings or claims. The
 * pacing figures are arithmetic (target time → pace). `{count}` in `lead` is
 * replaced with the real number of matching upcoming events.
 */

// Localized first path segment + breadcrumb label for the calendar level.
var PREFIX = { es: 'carreras', ca: 'curses', en: 'races' };
var CAL = { es: 'Carreras', ca: 'Curses', en: 'Races' };

var PACING_ES = '<div class="h-table-wrap"><table class="h-table"><thead><tr><th>Objetivo</th><th>Ritmo</th><th>Paso por 5K</th></tr></thead><tbody>' +
  '<tr><td>40:00</td><td>4:00 min/km</td><td>20:00</td></tr>' +
  '<tr><td>45:00</td><td>4:30 min/km</td><td>22:30</td></tr>' +
  '<tr><td>50:00</td><td>5:00 min/km</td><td>25:00</td></tr>' +
  '<tr><td>55:00</td><td>5:30 min/km</td><td>27:30</td></tr>' +
  '<tr><td>60:00</td><td>6:00 min/km</td><td>30:00</td></tr>' +
  '</tbody></table></div>';
var PACING_CA = '<div class="h-table-wrap"><table class="h-table"><thead><tr><th>Objectiu</th><th>Ritme</th><th>Pas pels 5K</th></tr></thead><tbody>' +
  '<tr><td>40:00</td><td>4:00 min/km</td><td>20:00</td></tr>' +
  '<tr><td>45:00</td><td>4:30 min/km</td><td>22:30</td></tr>' +
  '<tr><td>50:00</td><td>5:00 min/km</td><td>25:00</td></tr>' +
  '<tr><td>55:00</td><td>5:30 min/km</td><td>27:30</td></tr>' +
  '<tr><td>60:00</td><td>6:00 min/km</td><td>30:00</td></tr>' +
  '</tbody></table></div>';
var PACING_EN = '<div class="h-table-wrap"><table class="h-table"><thead><tr><th>Target</th><th>Pace</th><th>5K split</th></tr></thead><tbody>' +
  '<tr><td>40:00</td><td>4:00 min/km</td><td>20:00</td></tr>' +
  '<tr><td>45:00</td><td>4:30 min/km</td><td>22:30</td></tr>' +
  '<tr><td>50:00</td><td>5:00 min/km</td><td>25:00</td></tr>' +
  '<tr><td>55:00</td><td>5:30 min/km</td><td>27:30</td></tr>' +
  '<tr><td>60:00</td><td>6:00 min/km</td><td>30:00</td></tr>' +
  '</tbody></table></div>';

var distanceHubs = [
  {
    id: '5k',
    filter: function (r) { return r.distanceFilters && r.distanceFilters.has5k; },
    slug: { es: '5k', ca: '5k', en: '5k' },
    name: { es: '5K', ca: '5K', en: '5K' },
    content: {
      es: {
        title: 'Carreras 5K en España y Andorra · calendario | iSard',
        description: 'Calendario de carreras de 5 km en España y Andorra. Filtra por territorio, mes y estado de inscripción y encuentra tu próxima 5K con iSard.',
        h1: 'Carreras de 5 km en España y Andorra',
        lead: 'La 5K es la distancia ideal para debutar en las carreras populares y para trabajar la velocidad. Aquí tienes {count} carreras de 5 km en España y Andorra que puedes seguir en iSard.',
        listTitle: 'Próximas carreras de 5K',
        body: '<h2>La 5K, la puerta de entrada</h2><p>Cinco kilómetros es la distancia perfecta para estrenarse en competición: se corre a intensidad alta, se recupera rápido y se puede repetir a menudo dentro de la temporada. También es un recurso habitual para ganar velocidad de cara a distancias más largas.</p>',
        faqTitle: 'Preguntas frecuentes sobre las carreras de 5K',
        relatedTitle: 'Otras distancias',
        faq: [
          { q: '¿Cuántos kilómetros son una 5K?', a: 'Una 5K son 5 kilómetros, unas 3,1 millas.' },
          { q: '¿Cuánto se tarda en correr una 5K?', a: 'La mayoría de corredores populares terminan una 5K entre 22 y 40 minutos, según su forma física y el recorrido.' },
          { q: '¿Cómo veo las 5K con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción, territorio y mes para encontrar tu próxima 5K.' }
        ]
      },
      ca: {
        title: 'Curses 5K a Espanya i Andorra · calendari | iSard',
        description: 'Calendari de curses de 5 km a Espanya i Andorra. Filtra per territori, mes i estat d\'inscripció i troba la teva propera 5K amb iSard.',
        h1: 'Curses de 5 km a Espanya i Andorra',
        lead: 'La 5K és la distància ideal per debutar a les curses populars i per treballar la velocitat. Aquí tens {count} curses de 5 km a Espanya i Andorra que pots seguir a iSard.',
        listTitle: 'Properes curses de 5K',
        body: '<h2>La 5K, la porta d\'entrada</h2><p>Cinc quilòmetres és la distància perfecta per estrenar-se en competició: es corre a intensitat alta, es recupera ràpid i es pot repetir sovint durant la temporada. També és un recurs habitual per guanyar velocitat de cara a distàncies més llargues.</p>',
        faqTitle: 'Preguntes freqüents sobre les curses de 5K',
        relatedTitle: 'Altres distàncies',
        faq: [
          { q: 'Quants quilòmetres són una 5K?', a: 'Una 5K són 5 quilòmetres, unes 3,1 milles.' },
          { q: 'Quant es triga a córrer una 5K?', a: 'La majoria de corredors populars acaben una 5K entre 22 i 40 minuts, segons la forma física i el recorregut.' },
          { q: 'Com veig les 5K amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció, territori i mes per trobar la teva propera 5K.' }
        ]
      },
      en: {
        title: '5K races in Spain and Andorra · calendar | iSard',
        description: 'Calendar of 5 km races in Spain and Andorra. Filter by territory, month and registration status and find your next 5K with iSard.',
        h1: '5 km races in Spain and Andorra',
        lead: 'The 5K is the ideal distance to start racing and to work on speed. Here are {count} 5 km races across Spain and Andorra you can follow on iSard.',
        listTitle: 'Upcoming 5K races',
        body: '<h2>The 5K: your way in</h2><p>Five kilometres is the perfect distance to start competing: it is run at high intensity, recovery is quick, and it can be repeated often through the season. It is also a common way to build speed for longer distances.</p>',
        faqTitle: 'Frequently asked questions about 5K races',
        relatedTitle: 'Other distances',
        faq: [
          { q: 'How far is a 5K?', a: 'A 5K is 5 kilometres, about 3.1 miles.' },
          { q: 'How long does a 5K take?', a: 'Most recreational runners finish a 5K between 22 and 40 minutes, depending on fitness and the course.' },
          { q: 'How do I find 5K races with open registration?', a: 'In the iSard calendar you can filter by registration status, territory and month to find your next 5K.' }
        ]
      }
    }
  },
  {
    id: '10k',
    filter: function (r) { return r.distanceFilters && r.distanceFilters.has10k; },
    slug: { es: '10k', ca: '10k', en: '10k' },
    name: { es: '10K', ca: '10K', en: '10K' },
    content: {
      es: {
        title: 'Carreras 10K en España y Andorra · calendario 2026 | iSard',
        description: 'Calendario de carreras de 10 km en España y Andorra. Filtra por territorio, mes y estado de inscripción y prepara tu próxima 10K con iSard.',
        h1: 'Carreras de 10 km en España y Andorra',
        lead: 'La 10K es la distancia más popular del corredor popular: exigente pero accesible, y repetible varias veces por temporada. Abajo tienes {count} carreras de 10 km en España y Andorra que puedes seguir y filtrar en iSard.',
        listTitle: 'Próximas carreras de 10K',
        body: '<h2>Qué es una carrera de 10K</h2><p>Una 10K son 10 kilómetros (6,2 millas), casi siempre en asfalto y sobre circuito urbano. Es la distancia ideal para medir tu forma sin la recuperación larga que exige un medio maratón, y por eso muchos planes de entrenamiento la usan como objetivo de temporada o como prueba de control antes de los 21K.</p>' +
          '<h2>Ritmos de referencia para 10K</h2><p>Estos son los ritmos por kilómetro y el paso por 5K para los tiempos objetivo más habituales:</p>' + PACING_ES +
          '<h2>Cómo elegir tu 10K</h2><p>Fíjate en el perfil del recorrido (llano o con cuestas), la fecha y la climatología prevista, y el estado de la inscripción. En iSard puedes filtrar por territorio y mes y comprobar si la inscripción está abierta antes de planificar tu calendario.</p>',
        faqTitle: 'Preguntas frecuentes sobre las carreras de 10K',
        relatedTitle: 'Otras distancias',
        faq: [
          { q: '¿Cuántos kilómetros son una carrera de 10K?', a: 'Una 10K son exactamente 10 kilómetros, equivalentes a 6,2 millas.' },
          { q: '¿Cuánto se tarda en correr una 10K?', a: 'La mayoría de corredores populares terminan una 10K entre 45 y 70 minutos. Los corredores entrenados bajan de 40 minutos y quienes debutan suelen situarse por encima de una hora.' },
          { q: '¿Cuánto hay que entrenar para una 10K?', a: 'Con una base de carrera previa, entre 6 y 10 semanas corriendo 3 días por semana suele ser suficiente para completar una 10K con garantías.' },
          { q: '¿Es la 10K una buena preparación para un medio maratón?', a: 'Sí. La 10K es un paso natural antes del medio maratón: mejora tu resistencia y te sirve como prueba de control del ritmo.' },
          { q: '¿Cómo veo las carreras de 10K con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción para ver solo las 10K con inscripción abierta, y por territorio y mes para acotar por zona y fecha.' },
          { q: '¿Hay carreras de 10K en Andorra?', a: 'iSard recoge carreras de España y Andorra, así que encontrarás pruebas de 10 km en ambos territorios cuando estén programadas.' }
        ]
      },
      ca: {
        title: 'Curses 10K a Espanya i Andorra · calendari 2026 | iSard',
        description: 'Calendari de curses de 10 km a Espanya i Andorra. Filtra per territori, mes i estat d\'inscripció i prepara la teva propera 10K amb iSard.',
        h1: 'Curses de 10 km a Espanya i Andorra',
        lead: 'La 10K és la distància més popular del corredor popular: exigent però accessible, i repetible diverses vegades per temporada. A sota tens {count} curses de 10 km a Espanya i Andorra que pots seguir i filtrar a iSard.',
        listTitle: 'Properes curses de 10K',
        body: '<h2>Què és una cursa de 10K</h2><p>Una 10K són 10 quilòmetres (6,2 milles), gairebé sempre en asfalt i sobre circuit urbà. És la distància ideal per mesurar la teva forma sense la recuperació llarga que exigeix una mitja marató, i per això molts plans d\'entrenament la fan servir com a objectiu de temporada o com a prova de control abans dels 21K.</p>' +
          '<h2>Ritmes de referència per a 10K</h2><p>Aquests són els ritmes per quilòmetre i el pas pels 5K per als temps objectiu més habituals:</p>' + PACING_CA +
          '<h2>Com triar la teva 10K</h2><p>Fixa\'t en el perfil del recorregut (pla o amb pujades), la data i la climatologia prevista, i l\'estat de la inscripció. A iSard pots filtrar per territori i mes i comprovar si la inscripció és oberta abans de planificar el teu calendari.</p>',
        faqTitle: 'Preguntes freqüents sobre les curses de 10K',
        relatedTitle: 'Altres distàncies',
        faq: [
          { q: 'Quants quilòmetres són una cursa de 10K?', a: 'Una 10K són exactament 10 quilòmetres, equivalents a 6,2 milles.' },
          { q: 'Quant es triga a córrer una 10K?', a: 'La majoria de corredors populars acaben una 10K entre 45 i 70 minuts. Els corredors entrenats baixen de 40 minuts i qui debuta se sol situar per sobre d\'una hora.' },
          { q: 'Quant cal entrenar per a una 10K?', a: 'Amb una base de carrera prèvia, entre 6 i 10 setmanes corrent 3 dies per setmana sol ser suficient per completar una 10K amb garanties.' },
          { q: 'És la 10K una bona preparació per a una mitja marató?', a: 'Sí. La 10K és un pas natural abans de la mitja marató: millora la teva resistència i et serveix com a prova de control del ritme.' },
          { q: 'Com veig les curses de 10K amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció per veure només les 10K amb inscripció oberta, i per territori i mes per acotar per zona i data.' },
          { q: 'Hi ha curses de 10K a Andorra?', a: 'iSard recull curses d\'Espanya i Andorra, així que hi trobaràs proves de 10 km a tots dos territoris quan estiguin programades.' }
        ]
      },
      en: {
        title: '10K races in Spain and Andorra · 2026 calendar | iSard',
        description: 'Calendar of 10 km races in Spain and Andorra. Filter by territory, month and registration status and plan your next 10K with iSard.',
        h1: '10 km races in Spain and Andorra',
        lead: 'The 10K is the most popular distance for recreational runners: demanding but accessible, and repeatable several times a season. Below are {count} 10 km races across Spain and Andorra you can follow and filter on iSard.',
        listTitle: 'Upcoming 10K races',
        body: '<h2>What is a 10K race</h2><p>A 10K is 10 kilometres (6.2 miles), almost always on road and on an urban course. It is the ideal distance to test your fitness without the long recovery a half marathon demands, which is why many training plans use it as a season goal or as a check race before the 21K.</p>' +
          '<h2>Reference paces for the 10K</h2><p>These are the per-kilometre paces and the 5K split for the most common target times:</p>' + PACING_EN +
          '<h2>How to choose your 10K</h2><p>Look at the course profile (flat or hilly), the date and expected weather, and the registration status. On iSard you can filter by territory and month and check whether registration is open before planning your calendar.</p>',
        faqTitle: 'Frequently asked questions about 10K races',
        relatedTitle: 'Other distances',
        faq: [
          { q: 'How far is a 10K race?', a: 'A 10K is exactly 10 kilometres, equivalent to 6.2 miles.' },
          { q: 'How long does a 10K take?', a: 'Most recreational runners finish a 10K between 45 and 70 minutes. Trained runners go under 40 minutes and first-timers are usually above an hour.' },
          { q: 'How much training does a 10K need?', a: 'With some running base, 6 to 10 weeks running 3 days a week is usually enough to complete a 10K comfortably.' },
          { q: 'Is a 10K good preparation for a half marathon?', a: 'Yes. The 10K is a natural step before the half marathon: it builds endurance and works as a pace check race.' },
          { q: 'How do I find 10K races with open registration?', a: 'In the iSard calendar you can filter by registration status to see only 10K races with open registration, and by territory and month to narrow by area and date.' },
          { q: 'Are there 10K races in Andorra?', a: 'iSard covers races in Spain and Andorra, so you will find 10 km races in both territories when they are scheduled.' }
        ]
      }
    }
  },
  {
    id: 'media-maraton',
    filter: function (r) { return r.distanceFilters && r.distanceFilters.hasHalfMarathon; },
    slug: { es: 'media-maraton', ca: 'mitja-marato', en: 'half-marathon' },
    name: { es: 'Media maratón', ca: 'Mitja marató', en: 'Half marathon' },
    content: {
      es: {
        title: 'Medias maratones en España y Andorra · calendario | iSard',
        description: 'Calendario de medias maratones (21K) en España y Andorra. Filtra por territorio, mes y estado de inscripción con iSard.',
        h1: 'Medias maratones en España y Andorra',
        lead: 'El medio maratón (21,097 km) es el gran objetivo del corredor popular que quiere dar el salto desde el 10K. Abajo tienes {count} medias maratones en España y Andorra.',
        listTitle: 'Próximas medias maratones',
        body: '<h2>Qué es un medio maratón</h2><p>Un medio maratón son 21,097 km, la mitad exacta de la distancia de maratón. Exige una base de resistencia sólida y una preparación de varias semanas, pero sigue siendo abordable para el corredor popular constante. Es el paso natural entre el 10K y el maratón.</p>',
        faqTitle: 'Preguntas frecuentes sobre el medio maratón',
        relatedTitle: 'Otras distancias',
        faq: [
          { q: '¿Cuántos kilómetros son un medio maratón?', a: 'Un medio maratón son 21,097 km (13,1 millas).' },
          { q: '¿Cuánto hay que entrenar para un medio maratón?', a: 'Con una base previa, entre 10 y 14 semanas corriendo 3 o 4 días por semana es un rango habitual para preparar un 21K.' },
          { q: '¿Cómo veo las medias maratones con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción, territorio y mes.' }
        ]
      },
      ca: {
        title: 'Mitges maratons a Espanya i Andorra · calendari | iSard',
        description: 'Calendari de mitges maratons (21K) a Espanya i Andorra. Filtra per territori, mes i estat d\'inscripció amb iSard.',
        h1: 'Mitges maratons a Espanya i Andorra',
        lead: 'La mitja marató (21,097 km) és el gran objectiu del corredor popular que vol fer el salt des del 10K. A sota tens {count} mitges maratons a Espanya i Andorra.',
        listTitle: 'Properes mitges maratons',
        body: '<h2>Què és una mitja marató</h2><p>Una mitja marató són 21,097 km, la meitat exacta de la distància de marató. Exigeix una base de resistència sòlida i una preparació de diverses setmanes, però continua sent assequible per al corredor popular constant. És el pas natural entre el 10K i la marató.</p>',
        faqTitle: 'Preguntes freqüents sobre la mitja marató',
        relatedTitle: 'Altres distàncies',
        faq: [
          { q: 'Quants quilòmetres són una mitja marató?', a: 'Una mitja marató són 21,097 km (13,1 milles).' },
          { q: 'Quant cal entrenar per a una mitja marató?', a: 'Amb una base prèvia, entre 10 i 14 setmanes corrent 3 o 4 dies per setmana és un rang habitual per preparar un 21K.' },
          { q: 'Com veig les mitges maratons amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció, territori i mes.' }
        ]
      },
      en: {
        title: 'Half marathons in Spain and Andorra · calendar | iSard',
        description: 'Calendar of half marathons (21K) in Spain and Andorra. Filter by territory, month and registration status with iSard.',
        h1: 'Half marathons in Spain and Andorra',
        lead: 'The half marathon (21.097 km) is the big goal for recreational runners stepping up from the 10K. Below are {count} half marathons across Spain and Andorra.',
        listTitle: 'Upcoming half marathons',
        body: '<h2>What is a half marathon</h2><p>A half marathon is 21.097 km, exactly half the marathon distance. It requires a solid endurance base and several weeks of preparation, but remains achievable for the consistent recreational runner. It is the natural step between the 10K and the marathon.</p>',
        faqTitle: 'Frequently asked questions about the half marathon',
        relatedTitle: 'Other distances',
        faq: [
          { q: 'How far is a half marathon?', a: 'A half marathon is 21.097 km (13.1 miles).' },
          { q: 'How much training does a half marathon need?', a: 'With a running base, 10 to 14 weeks running 3 or 4 days a week is a common range to prepare a 21K.' },
          { q: 'How do I find half marathons with open registration?', a: 'In the iSard calendar you can filter by registration status, territory and month.' }
        ]
      }
    }
  },
  {
    id: 'maraton',
    filter: function (r) { return r.distanceFilters && r.distanceFilters.hasMarathon; },
    slug: { es: 'maraton', ca: 'marato', en: 'marathon' },
    name: { es: 'Maratón', ca: 'Marató', en: 'Marathon' },
    content: {
      es: {
        title: 'Maratones en España y Andorra · calendario | iSard',
        description: 'Calendario de maratones (42K) en España y Andorra. Filtra por territorio, mes y estado de inscripción con iSard.',
        h1: 'Maratones en España y Andorra',
        lead: 'El maratón (42,195 km) es el gran reto de fondo en asfalto. Abajo tienes {count} maratones en España y Andorra para planificar tu temporada.',
        listTitle: 'Próximos maratones',
        body: '<h2>Qué es un maratón</h2><p>Un maratón son 42,195 km. Es una prueba de resistencia que requiere meses de preparación específica, con tiradas largas progresivas y una estrategia de ritmo y avituallamiento cuidada. Elegir bien la fecha y el perfil del recorrido marca gran parte del resultado.</p>',
        faqTitle: 'Preguntas frecuentes sobre el maratón',
        relatedTitle: 'Otras distancias',
        faq: [
          { q: '¿Cuántos kilómetros son un maratón?', a: 'Un maratón son 42,195 km (26,2 millas).' },
          { q: '¿Cuánto hay que entrenar para un maratón?', a: 'Lo habitual es preparar un maratón durante 16 a 20 semanas, sobre una base de rodaje previa.' },
          { q: '¿Cómo veo los maratones con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción, territorio y mes.' }
        ]
      },
      ca: {
        title: 'Maratons a Espanya i Andorra · calendari | iSard',
        description: 'Calendari de maratons (42K) a Espanya i Andorra. Filtra per territori, mes i estat d\'inscripció amb iSard.',
        h1: 'Maratons a Espanya i Andorra',
        lead: 'La marató (42,195 km) és el gran repte de fons en asfalt. A sota tens {count} maratons a Espanya i Andorra per planificar la teva temporada.',
        listTitle: 'Propers maratons',
        body: '<h2>Què és una marató</h2><p>Una marató són 42,195 km. És una prova de resistència que requereix mesos de preparació específica, amb tirades llargues progressives i una estratègia de ritme i avituallament acurada. Triar bé la data i el perfil del recorregut marca gran part del resultat.</p>',
        faqTitle: 'Preguntes freqüents sobre la marató',
        relatedTitle: 'Altres distàncies',
        faq: [
          { q: 'Quants quilòmetres són una marató?', a: 'Una marató són 42,195 km (26,2 milles).' },
          { q: 'Quant cal entrenar per a una marató?', a: 'És habitual preparar una marató durant 16 a 20 setmanes, sobre una base de rodatge prèvia.' },
          { q: 'Com veig els maratons amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció, territori i mes.' }
        ]
      },
      en: {
        title: 'Marathons in Spain and Andorra · calendar | iSard',
        description: 'Calendar of marathons (42K) in Spain and Andorra. Filter by territory, month and registration status with iSard.',
        h1: 'Marathons in Spain and Andorra',
        lead: 'The marathon (42.195 km) is the great road-endurance challenge. Below are {count} marathons across Spain and Andorra to plan your season.',
        listTitle: 'Upcoming marathons',
        body: '<h2>What is a marathon</h2><p>A marathon is 42.195 km. It is an endurance test that takes months of specific preparation, with progressive long runs and a careful pacing and fuelling strategy. Choosing the right date and course profile shapes much of the result.</p>',
        faqTitle: 'Frequently asked questions about the marathon',
        relatedTitle: 'Other distances',
        faq: [
          { q: 'How far is a marathon?', a: 'A marathon is 42.195 km (26.2 miles).' },
          { q: 'How much training does a marathon need?', a: 'A marathon is typically prepared over 16 to 20 weeks, on top of an existing running base.' },
          { q: 'How do I find marathons with open registration?', a: 'In the iSard calendar you can filter by registration status, territory and month.' }
        ]
      }
    }
  },
  {
    id: 'ultra',
    filter: function (r) { return r.distanceFilters && r.distanceFilters.hasUltra; },
    slug: { es: 'ultra', ca: 'ultra', en: 'ultra' },
    name: { es: 'Ultra', ca: 'Ultra', en: 'Ultra' },
    content: {
      es: {
        title: 'Ultras y ultratrails en España y Andorra · calendario | iSard',
        description: 'Calendario de ultras y ultratrails (más de 42K) en España y Andorra. Filtra por territorio, mes y estado de inscripción con iSard.',
        h1: 'Ultras y ultratrails en España y Andorra',
        lead: 'Se consideran ultras las pruebas que superan la distancia de maratón (42 km), habitualmente por montaña. Abajo tienes {count} ultras en España y Andorra.',
        listTitle: 'Próximas ultras',
        body: '<h2>Qué es una ultra</h2><p>Una ultra es cualquier carrera que supera los 42,195 km del maratón. La mayoría se disputan por montaña, con distancias que van desde los 50 km hasta más de 100, y con un desnivel acumulado que suele ser tan determinante como los kilómetros. Requieren experiencia previa en trail y una preparación específica de fondo.</p>',
        faqTitle: 'Preguntas frecuentes sobre las ultras',
        relatedTitle: 'Otras distancias',
        faq: [
          { q: '¿A partir de cuántos kilómetros es una ultra?', a: 'Se considera ultra toda prueba que supera los 42,195 km del maratón.' },
          { q: '¿Las ultras son siempre por montaña?', a: 'La mayoría se disputan por montaña (ultratrail), aunque también existen ultras en asfalto o pista.' },
          { q: '¿Cómo veo las ultras con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción, territorio y mes.' }
        ]
      },
      ca: {
        title: 'Ultres i ultratrails a Espanya i Andorra · calendari | iSard',
        description: 'Calendari d\'ultres i ultratrails (més de 42K) a Espanya i Andorra. Filtra per territori, mes i estat d\'inscripció amb iSard.',
        h1: 'Ultres i ultratrails a Espanya i Andorra',
        lead: 'Es consideren ultres les proves que superen la distància de marató (42 km), habitualment per muntanya. A sota tens {count} ultres a Espanya i Andorra.',
        listTitle: 'Properes ultres',
        body: '<h2>Què és una ultra</h2><p>Una ultra és qualsevol cursa que supera els 42,195 km de la marató. La majoria es disputen per muntanya, amb distàncies que van des dels 50 km fins a més de 100, i amb un desnivell acumulat que sol ser tan determinant com els quilòmetres. Requereixen experiència prèvia en trail i una preparació específica de fons.</p>',
        faqTitle: 'Preguntes freqüents sobre les ultres',
        relatedTitle: 'Altres distàncies',
        faq: [
          { q: 'A partir de quants quilòmetres és una ultra?', a: 'Es considera ultra tota prova que supera els 42,195 km de la marató.' },
          { q: 'Les ultres són sempre per muntanya?', a: 'La majoria es disputen per muntanya (ultratrail), tot i que també existeixen ultres en asfalt o pista.' },
          { q: 'Com veig les ultres amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció, territori i mes.' }
        ]
      },
      en: {
        title: 'Ultras and ultra-trails in Spain and Andorra · calendar | iSard',
        description: 'Calendar of ultras and ultra-trails (over 42K) in Spain and Andorra. Filter by territory, month and registration status with iSard.',
        h1: 'Ultras and ultra-trails in Spain and Andorra',
        lead: 'Ultras are races longer than the marathon distance (42 km), usually run in the mountains. Below are {count} ultras across Spain and Andorra.',
        listTitle: 'Upcoming ultras',
        body: '<h2>What is an ultra</h2><p>An ultra is any race longer than the 42.195 km of the marathon. Most are run in the mountains, with distances from 50 km to over 100, and with cumulative elevation gain that is often as decisive as the distance. They call for prior trail experience and specific endurance preparation.</p>',
        faqTitle: 'Frequently asked questions about ultras',
        relatedTitle: 'Other distances',
        faq: [
          { q: 'How long is an ultra?', a: 'An ultra is any race longer than the 42.195 km of the marathon.' },
          { q: 'Are ultras always in the mountains?', a: 'Most are run in the mountains (ultra-trail), though there are also road and track ultras.' },
          { q: 'How do I find ultras with open registration?', a: 'In the iSard calendar you can filter by registration status, territory and month.' }
        ]
      }
    }
  }
];

// ---- sport hubs -------------------------------------------------------------
// filter is by race.sport. Slug/label localized; content hand-written per locale.
var sportHubs = [
  {
    id: 'asfalto', sport: 'road_running',
    slug: { es: 'asfalto', ca: 'asfalt', en: 'road' },
    name: { es: 'Asfalto', ca: 'Asfalt', en: 'Road' },
    content: {
      es: {
        title: 'Carreras de asfalto en España y Andorra · calendario | iSard',
        description: 'Calendario de carreras populares de asfalto en España y Andorra. Filtra por territorio, distancia, mes y estado de inscripción con iSard.',
        h1: 'Carreras de asfalto en España y Andorra',
        lead: 'Las carreras populares en ruta —de la 5K al maratón— son la base del calendario del corredor. iSard reúne {count} carreras de asfalto en España y Andorra.',
        listTitle: 'Próximas carreras de asfalto', faqTitle: 'Preguntas frecuentes', relatedTitle: 'Explora más',
        body: '<h2>Correr en asfalto</h2><p>El asfalto es la superficie de las carreras populares urbanas: circuitos medidos, ritmos rápidos y distancias que van de la 5K al maratón. Es donde se busca marca y donde se concentra la mayor oferta de pruebas cada temporada.</p>',
        faq: [
          { q: '¿Qué distancias hay en las carreras de asfalto?', a: 'Lo más habitual es 5K, 10K, media maratón (21K) y maratón (42K), además de millas y pruebas populares de distancias variadas.' },
          { q: '¿Cómo veo las carreras de asfalto con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción, territorio, distancia y mes.' }
        ]
      },
      ca: {
        title: 'Curses d\'asfalt a Espanya i Andorra · calendari | iSard',
        description: 'Calendari de curses populars d\'asfalt a Espanya i Andorra. Filtra per territori, distància, mes i estat d\'inscripció amb iSard.',
        h1: 'Curses d\'asfalt a Espanya i Andorra',
        lead: 'Les curses populars en ruta —de la 5K a la marató— són la base del calendari del corredor. iSard reuneix {count} curses d\'asfalt a Espanya i Andorra.',
        listTitle: 'Properes curses d\'asfalt', faqTitle: 'Preguntes freqüents', relatedTitle: 'Explora més',
        body: '<h2>Córrer en asfalt</h2><p>L\'asfalt és la superfície de les curses populars urbanes: circuits mesurats, ritmes ràpids i distàncies que van de la 5K a la marató. És on es busca marca i on es concentra la major oferta de proves cada temporada.</p>',
        faq: [
          { q: 'Quines distàncies hi ha a les curses d\'asfalt?', a: 'El més habitual és 5K, 10K, mitja marató (21K) i marató (42K), a més de milles i proves populars de distàncies diverses.' },
          { q: 'Com veig les curses d\'asfalt amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció, territori, distància i mes.' }
        ]
      },
      en: {
        title: 'Road races in Spain and Andorra · calendar | iSard',
        description: 'Calendar of road running races in Spain and Andorra. Filter by territory, distance, month and registration status with iSard.',
        h1: 'Road races in Spain and Andorra',
        lead: 'Road races —from the 5K to the marathon— are the backbone of the running calendar. iSard gathers {count} road races across Spain and Andorra.',
        listTitle: 'Upcoming road races', faqTitle: 'Frequently asked questions', relatedTitle: 'Explore more',
        body: '<h2>Running on the road</h2><p>Road is the surface of urban races: measured courses, fast paces and distances from the 5K to the marathon. It is where runners chase times and where most races are held each season.</p>',
        faq: [
          { q: 'What distances do road races have?', a: 'Most common are 5K, 10K, half marathon (21K) and marathon (42K), plus miles and popular races of varied distances.' },
          { q: 'How do I find road races with open registration?', a: 'In the iSard calendar you can filter by registration status, territory, distance and month.' }
        ]
      }
    }
  },
  {
    id: 'trail', sport: 'trail_running',
    slug: { es: 'trail', ca: 'trail', en: 'trail' },
    name: { es: 'Trail', ca: 'Trail', en: 'Trail' },
    content: {
      es: {
        title: 'Carreras de trail y montaña en España y Andorra · calendario | iSard',
        description: 'Calendario de carreras de trail y montaña en España y Andorra. Filtra por territorio, distancia, mes y estado de inscripción con iSard.',
        h1: 'Carreras de trail y montaña en España y Andorra',
        lead: 'El trail lleva la carrera a la montaña: senderos, desnivel y paisaje. iSard reúne {count} carreras de trail en España y Andorra.',
        listTitle: 'Próximas carreras de trail', faqTitle: 'Preguntas frecuentes', relatedTitle: 'Explora más',
        body: '<h2>Correr por montaña</h2><p>El trail running se disputa por senderos y montaña, con distancias que van desde pruebas cortas hasta ultras. Aquí el desnivel acumulado es tan determinante como los kilómetros, y el terreno técnico marca el ritmo.</p>',
        faq: [
          { q: '¿Qué diferencia al trail del asfalto?', a: 'El trail se corre por montaña y terreno natural, con desnivel y superficies técnicas, mientras que el asfalto es en ruta y circuito urbano.' },
          { q: '¿Cómo veo las carreras de trail con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción, territorio, distancia y mes.' }
        ]
      },
      ca: {
        title: 'Curses de trail i muntanya a Espanya i Andorra · calendari | iSard',
        description: 'Calendari de curses de trail i muntanya a Espanya i Andorra. Filtra per territori, distància, mes i estat d\'inscripció amb iSard.',
        h1: 'Curses de trail i muntanya a Espanya i Andorra',
        lead: 'El trail porta la cursa a la muntanya: senders, desnivell i paisatge. iSard reuneix {count} curses de trail a Espanya i Andorra.',
        listTitle: 'Properes curses de trail', faqTitle: 'Preguntes freqüents', relatedTitle: 'Explora més',
        body: '<h2>Córrer per muntanya</h2><p>El trail running es disputa per senders i muntanya, amb distàncies que van des de proves curtes fins a ultres. Aquí el desnivell acumulat és tan determinant com els quilòmetres, i el terreny tècnic marca el ritme.</p>',
        faq: [
          { q: 'Què diferencia el trail de l\'asfalt?', a: 'El trail es corre per muntanya i terreny natural, amb desnivell i superfícies tècniques, mentre que l\'asfalt és en ruta i circuit urbà.' },
          { q: 'Com veig les curses de trail amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció, territori, distància i mes.' }
        ]
      },
      en: {
        title: 'Trail and mountain races in Spain and Andorra · calendar | iSard',
        description: 'Calendar of trail and mountain races in Spain and Andorra. Filter by territory, distance, month and registration status with iSard.',
        h1: 'Trail and mountain races in Spain and Andorra',
        lead: 'Trail takes racing to the mountains: paths, elevation and scenery. iSard gathers {count} trail races across Spain and Andorra.',
        listTitle: 'Upcoming trail races', faqTitle: 'Frequently asked questions', relatedTitle: 'Explore more',
        body: '<h2>Running in the mountains</h2><p>Trail running is held on paths and mountains, with distances from short races to ultras. Here cumulative elevation gain matters as much as the distance, and technical terrain sets the pace.</p>',
        faq: [
          { q: 'How is trail different from road?', a: 'Trail is run in the mountains and on natural terrain, with elevation and technical surfaces, while road is on urban courses.' },
          { q: 'How do I find trail races with open registration?', a: 'In the iSard calendar you can filter by registration status, territory, distance and month.' }
        ]
      }
    }
  },
  {
    id: 'ciclismo', sport: 'cycling',
    slug: { es: 'ciclismo', ca: 'ciclisme', en: 'cycling' },
    name: { es: 'Ciclismo', ca: 'Ciclisme', en: 'Cycling' },
    content: {
      es: {
        title: 'Marchas y pruebas de ciclismo en España y Andorra · calendario | iSard',
        description: 'Calendario de marchas cicloturistas y pruebas de ciclismo en España y Andorra. Filtra por territorio, mes y estado de inscripción con iSard.',
        h1: 'Ciclismo en España y Andorra',
        lead: 'Marchas cicloturistas, gran fondo y pruebas en carretera y montaña. iSard reúne {count} eventos de ciclismo en España y Andorra.',
        listTitle: 'Próximas pruebas de ciclismo', faqTitle: 'Preguntas frecuentes', relatedTitle: 'Explora más',
        body: '<h2>Rodar en grupo</h2><p>El calendario ciclista incluye marchas cicloturistas, pruebas de gran fondo y eventos de carretera y BTT. Son citas para rodar largo, medirse en subidas o simplemente disfrutar de una ruta señalizada y con avituallamiento.</p>',
        faq: [
          { q: '¿Qué es una marcha cicloturista?', a: 'Es una prueba participativa por carretera, con recorrido señalizado y avituallamientos, en la que se rueda por distancias largas sin ser necesariamente competitiva.' },
          { q: '¿Cómo veo las pruebas de ciclismo con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción, territorio y mes.' }
        ]
      },
      ca: {
        title: 'Marxes i proves de ciclisme a Espanya i Andorra · calendari | iSard',
        description: 'Calendari de marxes cicloturistes i proves de ciclisme a Espanya i Andorra. Filtra per territori, mes i estat d\'inscripció amb iSard.',
        h1: 'Ciclisme a Espanya i Andorra',
        lead: 'Marxes cicloturistes, gran fons i proves en carretera i muntanya. iSard reuneix {count} esdeveniments de ciclisme a Espanya i Andorra.',
        listTitle: 'Properes proves de ciclisme', faqTitle: 'Preguntes freqüents', relatedTitle: 'Explora més',
        body: '<h2>Rodar en grup</h2><p>El calendari ciclista inclou marxes cicloturistes, proves de gran fons i esdeveniments de carretera i BTT. Són cites per rodar llarg, mesurar-se a les pujades o simplement gaudir d\'una ruta senyalitzada i amb avituallament.</p>',
        faq: [
          { q: 'Què és una marxa cicloturista?', a: 'És una prova participativa per carretera, amb recorregut senyalitzat i avituallaments, en què es roda per distàncies llargues sense ser necessàriament competitiva.' },
          { q: 'Com veig les proves de ciclisme amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció, territori i mes.' }
        ]
      },
      en: {
        title: 'Cycling events in Spain and Andorra · calendar | iSard',
        description: 'Calendar of cyclosportives and cycling events in Spain and Andorra. Filter by territory, month and registration status with iSard.',
        h1: 'Cycling in Spain and Andorra',
        lead: 'Cyclosportives, gran fondo and road and mountain events. iSard gathers {count} cycling events across Spain and Andorra.',
        listTitle: 'Upcoming cycling events', faqTitle: 'Frequently asked questions', relatedTitle: 'Explore more',
        body: '<h2>Riding together</h2><p>The cycling calendar includes cyclosportives, gran fondo events and road and MTB rides. They are dates to ride long, test yourself on the climbs or simply enjoy a signposted route with feed stations.</p>',
        faq: [
          { q: 'What is a cyclosportive?', a: 'It is a participative road event with a signposted route and feed stations, ridden over long distances without necessarily being competitive.' },
          { q: 'How do I find cycling events with open registration?', a: 'In the iSard calendar you can filter by registration status, territory and month.' }
        ]
      }
    }
  },
  {
    id: 'senderismo', sport: 'hiking',
    slug: { es: 'senderismo', ca: 'senderisme', en: 'hiking' },
    name: { es: 'Senderismo', ca: 'Senderisme', en: 'Hiking' },
    content: {
      es: {
        title: 'Marchas de senderismo y caminatas en España y Andorra · calendario | iSard',
        description: 'Calendario de marchas de senderismo, caminatas y travesías en España y Andorra. Filtra por territorio, mes y estado de inscripción con iSard.',
        h1: 'Marchas de senderismo en España y Andorra',
        lead: 'Caminatas populares, marchas y travesías de montaña para todos los niveles. iSard reúne {count} marchas de senderismo en España y Andorra.',
        listTitle: 'Próximas marchas de senderismo', faqTitle: 'Preguntas frecuentes', relatedTitle: 'Explora más',
        body: '<h2>Caminar por naturaleza</h2><p>Las marchas de senderismo y caminatas populares recorren senderos, caminos y montaña a un ritmo accesible. Son una forma de disfrutar del paisaje y la actividad al aire libre sin la exigencia competitiva de una carrera.</p>',
        faq: [
          { q: '¿En qué se diferencia una marcha de senderismo de una carrera?', a: 'Una marcha se completa caminando a un ritmo accesible, sin clasificación competitiva; una carrera se corre y se cronometra.' },
          { q: '¿Cómo veo las marchas con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción, territorio y mes.' }
        ]
      },
      ca: {
        title: 'Marxes de senderisme i caminades a Espanya i Andorra · calendari | iSard',
        description: 'Calendari de marxes de senderisme, caminades i travesses a Espanya i Andorra. Filtra per territori, mes i estat d\'inscripció amb iSard.',
        h1: 'Marxes de senderisme a Espanya i Andorra',
        lead: 'Caminades populars, marxes i travesses de muntanya per a tots els nivells. iSard reuneix {count} marxes de senderisme a Espanya i Andorra.',
        listTitle: 'Properes marxes de senderisme', faqTitle: 'Preguntes freqüents', relatedTitle: 'Explora més',
        body: '<h2>Caminar per la natura</h2><p>Les marxes de senderisme i caminades populars recorren senders, camins i muntanya a un ritme accessible. Són una manera de gaudir del paisatge i l\'activitat a l\'aire lliure sense l\'exigència competitiva d\'una cursa.</p>',
        faq: [
          { q: 'En què es diferencia una marxa de senderisme d\'una cursa?', a: 'Una marxa es completa caminant a un ritme accessible, sense classificació competitiva; una cursa es corre i es cronometra.' },
          { q: 'Com veig les marxes amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció, territori i mes.' }
        ]
      },
      en: {
        title: 'Hiking marches and walks in Spain and Andorra · calendar | iSard',
        description: 'Calendar of hiking marches, walks and mountain crossings in Spain and Andorra. Filter by territory, month and registration status with iSard.',
        h1: 'Hiking marches in Spain and Andorra',
        lead: 'Popular walks, marches and mountain crossings for all levels. iSard gathers {count} hiking marches across Spain and Andorra.',
        listTitle: 'Upcoming hiking marches', faqTitle: 'Frequently asked questions', relatedTitle: 'Explore more',
        body: '<h2>Walking in nature</h2><p>Hiking marches and popular walks follow paths, tracks and mountains at an accessible pace. They are a way to enjoy the scenery and the outdoors without the competitive demand of a race.</p>',
        faq: [
          { q: 'How is a hiking march different from a race?', a: 'A march is completed at a walking, accessible pace with no competitive ranking; a race is run and timed.' },
          { q: 'How do I find marches with open registration?', a: 'In the iSard calendar you can filter by registration status, territory and month.' }
        ]
      }
    }
  }
];

// ---- location hubs (autonomous communities) ---------------------------------
// Single accent-free slug shared across locales (the /es|ca|en prefix already
// makes the URLs distinct); display name is localized. `key` matches the exact
// race.location.autonomousCommunity value.
var COMMUNITIES = [
  { key: 'Andalucía', slug: 'andalucia', name: { es: 'Andalucía', ca: 'Andalusia', en: 'Andalusia' } },
  { key: 'Andorra', slug: 'andorra', name: { es: 'Andorra', ca: 'Andorra', en: 'Andorra' } },
  { key: 'Aragón', slug: 'aragon', name: { es: 'Aragón', ca: 'Aragó', en: 'Aragon' } },
  { key: 'Canarias', slug: 'canarias', name: { es: 'Canarias', ca: 'Canàries', en: 'Canary Islands' } },
  { key: 'Cantabria', slug: 'cantabria', name: { es: 'Cantabria', ca: 'Cantàbria', en: 'Cantabria' } },
  { key: 'Castilla y León', slug: 'castilla-y-leon', name: { es: 'Castilla y León', ca: 'Castella i Lleó', en: 'Castile and León' } },
  { key: 'Castilla-La Mancha', slug: 'castilla-la-mancha', name: { es: 'Castilla-La Mancha', ca: 'Castella-la Manxa', en: 'Castile-La Mancha' } },
  { key: 'Cataluña', slug: 'cataluna', name: { es: 'Cataluña', ca: 'Catalunya', en: 'Catalonia' } },
  { key: 'Ceuta', slug: 'ceuta', name: { es: 'Ceuta', ca: 'Ceuta', en: 'Ceuta' } },
  { key: 'Comunidad Foral de Navarra', slug: 'navarra', name: { es: 'Navarra', ca: 'Navarra', en: 'Navarre' } },
  { key: 'Comunidad de Madrid', slug: 'madrid', name: { es: 'Madrid', ca: 'Madrid', en: 'Madrid' } },
  { key: 'Comunitat Valenciana', slug: 'comunidad-valenciana', name: { es: 'Comunidad Valenciana', ca: 'Comunitat Valenciana', en: 'Valencian Community' } },
  { key: 'Extremadura', slug: 'extremadura', name: { es: 'Extremadura', ca: 'Extremadura', en: 'Extremadura' } },
  { key: 'Galicia', slug: 'galicia', name: { es: 'Galicia', ca: 'Galícia', en: 'Galicia' } },
  { key: 'Illes Balears', slug: 'illes-balears', name: { es: 'Islas Baleares', ca: 'Illes Balears', en: 'Balearic Islands' } },
  { key: 'La Rioja', slug: 'la-rioja', name: { es: 'La Rioja', ca: 'La Rioja', en: 'La Rioja' } },
  { key: 'Melilla', slug: 'melilla', name: { es: 'Melilla', ca: 'Melilla', en: 'Melilla' } },
  { key: 'País Vasco', slug: 'pais-vasco', name: { es: 'País Vasco', ca: 'País Basc', en: 'Basque Country' } },
  { key: 'Principado de Asturias', slug: 'asturias', name: { es: 'Asturias', ca: 'Astúries', en: 'Asturias' } },
  { key: 'Región de Murcia', slug: 'murcia', name: { es: 'Murcia', ca: 'Múrcia', en: 'Murcia' } }
];

// Templated, per-locale content for a community hub. `ctx` = { name, count, provinces }.
function locationContent(lang, ctx) {
  var name = ctx.name[lang];
  var provs = ctx.provinces.join(', ');
  var T = {
    es: {
      title: 'Carreras en ' + name + ' · calendario 2026 | iSard',
      description: 'Calendario de carreras de asfalto, trail, ciclismo y senderismo en ' + name + '. Filtra por deporte, distancia, mes y estado de inscripción con iSard.',
      h1: 'Carreras en ' + name,
      lead: 'Encuentra tu próxima carrera en ' + name + '. iSard reúne {count} carreras de asfalto, trail, ciclismo y senderismo en ' + name + ', que puedes filtrar por deporte, distancia, mes y estado de inscripción.',
      listTitle: 'Próximas carreras en ' + name, faqTitle: 'Preguntas frecuentes', relatedTitle: 'Explora más',
      body: provs ? '<h2>Carreras por toda ' + name + '</h2><p>El calendario de ' + name + ' incluye pruebas en ' + provs + ', desde carreras populares de asfalto hasta trail de montaña, marchas cicloturistas y caminatas de senderismo.</p>' : '',
      faq: [
        { q: '¿Cuántas carreras hay en ' + name + '?', a: 'iSard recoge actualmente ' + ctx.count + ' carreras y marchas en ' + name + ' para los próximos meses. La cifra se actualiza a medida que se confirman nuevas pruebas.' },
        { q: '¿Cómo veo las carreras de ' + name + ' con inscripción abierta?', a: 'En el calendario de iSard puedes filtrar por estado de inscripción, deporte, distancia y mes dentro de ' + name + '.' }
      ]
    },
    ca: {
      title: 'Curses a ' + name + ' · calendari 2026 | iSard',
      description: 'Calendari de curses d\'asfalt, trail, ciclisme i senderisme a ' + name + '. Filtra per esport, distància, mes i estat d\'inscripció amb iSard.',
      h1: 'Curses a ' + name,
      lead: 'Troba la teva propera cursa a ' + name + '. iSard reuneix {count} curses d\'asfalt, trail, ciclisme i senderisme a ' + name + ', que pots filtrar per esport, distància, mes i estat d\'inscripció.',
      listTitle: 'Properes curses a ' + name, faqTitle: 'Preguntes freqüents', relatedTitle: 'Explora més',
      body: provs ? '<h2>Curses per tot ' + name + '</h2><p>El calendari de ' + name + ' inclou proves a ' + provs + ', des de curses populars d\'asfalt fins a trail de muntanya, marxes cicloturistes i caminades de senderisme.</p>' : '',
      faq: [
        { q: 'Quantes curses hi ha a ' + name + '?', a: 'iSard recull actualment ' + ctx.count + ' curses i marxes a ' + name + ' per als propers mesos. La xifra s\'actualitza a mesura que es confirmen noves proves.' },
        { q: 'Com veig les curses de ' + name + ' amb inscripció oberta?', a: 'Al calendari d\'iSard pots filtrar per estat d\'inscripció, esport, distància i mes dins de ' + name + '.' }
      ]
    },
    en: {
      title: 'Races in ' + name + ' · 2026 calendar | iSard',
      description: 'Calendar of road, trail, cycling and hiking races in ' + name + '. Filter by sport, distance, month and registration status with iSard.',
      h1: 'Races in ' + name,
      lead: 'Find your next race in ' + name + '. iSard gathers {count} road, trail, cycling and hiking races in ' + name + ', which you can filter by sport, distance, month and registration status.',
      listTitle: 'Upcoming races in ' + name, faqTitle: 'Frequently asked questions', relatedTitle: 'Explore more',
      body: provs ? '<h2>Races across ' + name + '</h2><p>The ' + name + ' calendar includes events in ' + provs + ', from road running races to mountain trail, cyclosportives and hiking marches.</p>' : '',
      faq: [
        { q: 'How many races are there in ' + name + '?', a: 'iSard currently lists ' + ctx.count + ' races and marches in ' + name + ' for the coming months. The number updates as new events are confirmed.' },
        { q: 'How do I find races in ' + name + ' with open registration?', a: 'In the iSard calendar you can filter by registration status, sport, distance and month within ' + name + '.' }
      ]
    }
  };
  return T[lang] || T.es;
}

module.exports = {
  PREFIX: PREFIX, CAL: CAL,
  distanceHubs: distanceHubs,
  sportHubs: sportHubs,
  COMMUNITIES: COMMUNITIES,
  locationContent: locationContent
};
