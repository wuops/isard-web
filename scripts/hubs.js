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

module.exports = { PREFIX: PREFIX, CAL: CAL, distanceHubs: distanceHubs };
