/* ============================================================
   Queer Memory — Internationalization (i18n) Module
   Supports English, French, and Spanish.
   Provides translation lookup, language detection, and
   automatic DOM text replacement via data-i18n attributes.
   ============================================================ */

var QM = window.QM || {};

QM.i18n = (function () {
    'use strict';

    var STORAGE_KEY = 'queer-memory-lang';
    var SUPPORTED = ['en', 'fr', 'es'];
    var DEFAULT = 'en';

    /* ----------------------------------------------------------
       Translation dictionary
       Key → { en, fr, es }
       ---------------------------------------------------------- */
    var S = {

        /* ---- Site-wide / Navigation ---- */
        'site.title':           { en: 'Queer Memory',           fr: 'Queer Memory',            es: 'Queer Memory' },
        'nav.countries':        { en: 'Countries',              fr: 'Pays',                    es: 'Países' },
        'nav.cities':           { en: 'Cities',                 fr: 'Villes',                  es: 'Ciudades' },
        'nav.history':          { en: 'History',                fr: 'Histoire',                es: 'Historia' },
        'nav.rights':           { en: 'Rights',                 fr: 'Droits',                  es: 'Derechos' },
        'nav.culture':          { en: 'Culture',                fr: 'Culture',                 es: 'Cultura' },
        'nav.identities':       { en: 'Identities',             fr: 'Identités',               es: 'Identidades' },
        'nav.places':           { en: 'Places',                 fr: 'Lieux',                   es: 'Lugares' },
        'nav.activism':         { en: 'Activism',               fr: 'Activisme',               es: 'Activismo' },
        'nav.data':             { en: 'Data & Methodology',     fr: 'Données & Méthodologie',  es: 'Datos y Metodología' },
        'nav.timeline':         { en: 'Timeline',               fr: 'Chronologie',             es: 'Cronología' },
        'nav.memorial':         { en: 'Memorial',               fr: 'Mémorial',                es: 'Memorial' },
        'nav.search':           { en: 'Search',                 fr: 'Recherche',               es: 'Búsqueda' },

        /* ---- Common UI ---- */
        'loading':              { en: 'Loading from Wikidata\u2026',  fr: 'Chargement depuis Wikidata\u2026',  es: 'Cargando desde Wikidata\u2026' },
        'error.load':           { en: 'Failed to load data from Wikidata.', fr: '\u00C9chec du chargement depuis Wikidata.', es: 'Error al cargar datos de Wikidata.' },
        'btn.search':           { en: 'Search',                 fr: 'Rechercher',              es: 'Buscar' },
        'btn.showRegions':      { en: 'Show regions',           fr: 'Voir les régions',        es: 'Ver regiones' },
        'btn.hideRegions':      { en: 'Hide regions',           fr: 'Masquer',                 es: 'Ocultar' },
        'btn.showEntries':      { en: 'Show entries',           fr: 'Voir les entrées',        es: 'Ver entradas' },
        'btn.notablePeople':    { en: 'Notable people',         fr: 'Personnalités',           es: 'Personas notables' },
        'link.wikipedia':       { en: 'Wikipedia',              fr: 'Wikipédia',               es: 'Wikipedia' },
        'link.wikidata':        { en: 'Wikidata',               fr: 'Wikidata',                es: 'Wikidata' },
        'link.wikidataClass':   { en: 'Wikidata class',         fr: 'Classe Wikidata',         es: 'Clase Wikidata' },
        'link.viewOnWikidata':  { en: 'View on Wikidata',       fr: 'Voir sur Wikidata',       es: 'Ver en Wikidata' },
        'empty.noData':         { en: 'No data yet',            fr: 'Pas encore de données',   es: 'Sin datos aún' },
        'empty.noResults':      { en: 'No results found.',      fr: 'Aucun résultat.',         es: 'Sin resultados.' },
        'empty.noPeople':       { en: 'No people found.',       fr: 'Aucune personne trouvée.',es: 'No se encontraron personas.' },

        /* ---- Footer ---- */
        'footer.built':         { en: 'Built on',               fr: 'Construit avec',          es: 'Construido con' },
        'footer.data':          { en: 'Data is indicative and incomplete.', fr: 'Les données sont indicatives et incomplètes.', es: 'Los datos son indicativos e incompletos.' },
        'footer.license':       { en: 'Licensed under',         fr: 'Sous licence',            es: 'Licenciado bajo' },

        /* ---- Homepage (index.html) ---- */
        'home.title':           { en: 'Queer Memory - Queer History of the World', fr: 'Queer Memory - Histoire queer du monde', es: 'Queer Memory - Historia queer del mundo' },
        'home.subtitle':        { en: 'Explore LGBTQIA+ histories across every continent, powered by open data from', fr: 'Explorez les histoires LGBTQIA+ sur chaque continent, alimentées par les données ouvertes de', es: 'Explora las historias LGBTQIA+ en todos los continentes, impulsadas por datos abiertos de' },
        'home.browse':          { en: 'Browse',                 fr: 'Parcourir',               es: 'Explorar' },
        'home.searchPlaceholder': { en: 'Search people, places, events\u2026', fr: 'Rechercher personnes, lieux, événements\u2026', es: 'Buscar personas, lugares, eventos\u2026' },
        'home.thisMonth':       { en: 'This Month in Queer History', fr: 'Ce mois-ci dans l\u2019histoire queer', es: 'Este mes en la historia queer' },
        'home.discover':        { en: 'Discover',               fr: 'Découvrir',               es: 'Descubrir' },
        'home.prideEvents':     { en: 'Recent Pride Events',    fr: 'Événements Pride récents', es: 'Eventos Pride recientes' },
        'home.prideEventsDesc': { en: 'The latest pride parades and celebrations documented on Wikidata.', fr: 'Les dernières marches des fiertés et célébrations documentées sur Wikidata.', es: 'Los últimos desfiles y celebraciones del orgullo documentados en Wikidata.' },
        'home.upcomingPrideEvents': { en: 'Upcoming Pride Events', fr: 'Événements Pride à venir', es: 'Próximos eventos Pride' },
        'home.upcomingPrideEventsDesc': { en: 'Upcoming pride parades and celebrations with scheduled dates in Wikidata.', fr: 'Marches des fiertés et célébrations à venir avec des dates planifiées dans Wikidata.', es: 'Próximos desfiles y celebraciones del orgullo con fechas programadas en Wikidata.' },
        'home.upcomingPrideEventsAria': { en: 'Upcoming pride events', fr: 'Événements Pride à venir', es: 'Próximos eventos Pride' },
        'home.seeAllActivism':  { en: 'See all activism \u2192', fr: 'Voir tout l\u2019activisme \u2192', es: 'Ver todo el activismo \u2192' },
        'home.prideFlags':      { en: 'Pride Flags',            fr: 'Drapeaux de la fierté',   es: 'Banderas del orgullo' },
        'home.prideFlagsDesc':  { en: 'Symbols of identity and solidarity, each with its own story.', fr: 'Symboles d\u2019identité et de solidarité, chacun avec sa propre histoire.', es: 'Símbolos de identidad y solidaridad, cada uno con su propia historia.' },
        'home.aboutTitle':      { en: 'Built on Open Knowledge', fr: 'Construit sur le savoir ouvert', es: 'Construido sobre conocimiento abierto' },
        'home.aboutP1':         { en: 'Queer Memory draws every fact, date, and image from the open Wikimedia ecosystem. Nothing is hard-coded: each page queries live structured data from Wikidata, labels from Wikipedia, and media from Wikimedia Commons.', fr: 'Queer Memory tire chaque fait, date et image de l\u2019écosystème ouvert Wikimédia. Rien n\u2019est codé en dur\u00a0: chaque page interroge les données structurées en direct de Wikidata, les libellés de Wikipédia et les médias de Wikimedia Commons.', es: 'Queer Memory obtiene cada hecho, fecha e imagen del ecosistema abierto de Wikimedia. Nada está codificado: cada página consulta datos estructurados en vivo de Wikidata, etiquetas de Wikipedia y medios de Wikimedia Commons.' },
        'home.aboutP2':         { en: 'The data is always growing. You can help fill gaps and tell untold stories by contributing to', fr: 'Les données ne cessent de croître. Vous pouvez aider à combler les lacunes et raconter des histoires inédites en contribuant au', es: 'Los datos siempre están creciendo. Puedes ayudar a llenar vacíos y contar historias no contadas contribuyendo a' },
        'home.btnData':         { en: 'Data & Methodology',     fr: 'Données & Méthodologie',  es: 'Datos y Metodología' },
        'home.btnContribute':   { en: 'Contribute on Wikidata', fr: 'Contribuer sur Wikidata', es: 'Contribuir en Wikidata' },

        /* Entry point labels */
        'entry.countries':      { en: 'Countries',              fr: 'Pays',                    es: 'Países' },
        'entry.cities':         { en: 'Cities',                 fr: 'Villes',                  es: 'Ciudades' },
        'entry.history':        { en: 'History & Timelines',    fr: 'Histoire & Chronologies', es: 'Historia y Cronologías' },
        'entry.rights':         { en: 'Rights & Law',           fr: 'Droits & Loi',            es: 'Derechos y Ley' },
        'entry.culture':        { en: 'Culture & Media',        fr: 'Culture & Médias',        es: 'Cultura y Medios' },
        'entry.identities':     { en: 'Identities',             fr: 'Identités',               es: 'Identidades' },
        'entry.places':         { en: 'Places & Memory',        fr: 'Lieux & Mémoire',         es: 'Lugares y Memoria' },
        'entry.activism':       { en: 'Activism & Movements',   fr: 'Activisme & Mouvements',  es: 'Activismo y Movimientos' },

        /* Home.js dynamic strings */
        'home.stat.countries':  { en: 'Countries & Territories', fr: 'Pays & Territoires',     es: 'Países y Territorios' },
        'home.stat.people':     { en: 'Notable People',         fr: 'Personnalités',           es: 'Personas Notables' },
        'home.stat.pride':      { en: 'Pride Events',           fr: 'Événements Pride',        es: 'Eventos Pride' },
        'home.stat.orgs':       { en: 'Organizations',          fr: 'Organisations',           es: 'Organizaciones' },
        'home.stat.places':     { en: 'Places & Venues',        fr: 'Lieux & Espaces',         es: 'Lugares y Espacios' },
        'home.stat.films':      { en: 'Films & TV Shows',       fr: 'Films & Séries TV',       es: 'Películas y Series' },
        'home.bornIn':          { en: 'Born in',                fr: 'Né(e)s en',               es: 'Nacidos/as en' },
        'home.noFeatured':      { en: 'No featured people found for this month.', fr: 'Aucune personnalité trouvée pour ce mois.', es: 'No se encontraron personas destacadas para este mes.' },
        'home.noDiscoveries':   { en: 'No discoveries available.', fr: 'Aucune découverte disponible.', es: 'Sin descubrimientos disponibles.' },
        'home.noPrideEvents':   { en: 'No recent pride events found.', fr: 'Aucun événement Pride récent.', es: 'No se encontraron eventos Pride recientes.' },
        'home.noUpcomingPrideEvents': { en: 'No upcoming pride events found.', fr: 'Aucun événement Pride à venir.', es: 'No se encontraron próximos eventos Pride.' },
        'home.errorTimeline':   { en: 'Could not load featured timeline.', fr: 'Impossible de charger la chronologie.', es: 'No se pudo cargar la cronología.' },
        'home.errorDiscover':   { en: 'Could not load discoveries.', fr: 'Impossible de charger les découvertes.', es: 'No se pudieron cargar los descubrimientos.' },
        'home.errorPride':      { en: 'Could not load pride events.', fr: 'Impossible de charger les événements Pride.', es: 'No se pudieron cargar los eventos Pride.' },
        'home.errorFlags':      { en: 'Could not load pride flags.', fr: 'Impossible de charger les drapeaux.', es: 'No se pudieron cargar las banderas.' },
        'home.participants':    { en: 'participants',            fr: 'participants',            es: 'participantes' },

        /* On This Day */
        'home.onThisDay':       { en: 'On This Day',             fr: 'Ce jour-l\u00e0',           es: 'Un d\u00eda como hoy' },
        'home.onThisDayDesc':   { en: 'LGBTQ+ people born or who passed away on this date.', fr: 'Personnes LGBTQ+ n\u00e9es ou d\u00e9c\u00e9d\u00e9es \u00e0 cette date.', es: 'Personas LGBTQ+ nacidas o fallecidas en esta fecha.' },
        'home.born':            { en: 'Born',                    fr: 'Naissance',                 es: 'Nacimiento' },
        'home.died':            { en: 'Died',                    fr: 'D\u00e9c\u00e8s',           es: 'Fallecimiento' },
        'home.noOnThisDay':     { en: 'No events found for today.', fr: 'Aucun \u00e9v\u00e9nement trouv\u00e9 pour aujourd\u2019hui.', es: 'No se encontraron eventos para hoy.' },
        'home.errorOnThisDay':  { en: 'Could not load On This Day data.', fr: 'Impossible de charger les donn\u00e9es du jour.', es: 'No se pudieron cargar los datos del d\u00eda.' },

        /* Month names */
        'month.0':  { en: 'January',   fr: 'janvier',   es: 'enero' },
        'month.1':  { en: 'February',  fr: 'février',   es: 'febrero' },
        'month.2':  { en: 'March',     fr: 'mars',      es: 'marzo' },
        'month.3':  { en: 'April',     fr: 'avril',     es: 'abril' },
        'month.4':  { en: 'May',       fr: 'mai',       es: 'mayo' },
        'month.5':  { en: 'June',      fr: 'juin',      es: 'junio' },
        'month.6':  { en: 'July',      fr: 'juillet',   es: 'julio' },
        'month.7':  { en: 'August',    fr: 'août',      es: 'agosto' },
        'month.8':  { en: 'September', fr: 'septembre', es: 'septiembre' },
        'month.9':  { en: 'October',   fr: 'octobre',   es: 'octubre' },
        'month.10': { en: 'November',  fr: 'novembre',  es: 'noviembre' },
        'month.11': { en: 'December',  fr: 'décembre',  es: 'diciembre' },

        /* ---- Countries page ---- */
        'countries.title':      { en: 'Countries',              fr: 'Pays',                    es: 'Países' },
        'countries.intro':      { en: 'Browse countries with documented LGBTQIA+ rights or history on Wikidata. Click any country to see a detailed profile.', fr: 'Parcourez les pays avec des droits ou une histoire LGBTQIA+ documentés sur Wikidata. Cliquez sur un pays pour voir son profil détaillé.', es: 'Explora países con derechos o historia LGBTQIA+ documentados en Wikidata. Haz clic en cualquier país para ver su perfil detallado.' },
        'countries.sectionTitle': { en: 'Countries with LGBTQIA+ Records', fr: 'Pays avec des données LGBTQIA+', es: 'Países con registros LGBTQIA+' },
        'countries.searchLabel': { en: 'Search countries',       fr: 'Rechercher des pays',     es: 'Buscar países' },
        'countries.searchPlaceholder': { en: 'Search country',   fr: 'Rechercher un pays',      es: 'Buscar país' },
        'countries.none':       { en: 'No countries found.',     fr: 'Aucun pays trouvé.',      es: 'No se encontraron países.' },

        /* ---- Cities page ---- */
        'cities.title':         { en: 'Cities',                 fr: 'Villes',                  es: 'Ciudades' },
        'cities.intro':         { en: 'Cities appear here if they host LGBTQIA+ events, places, or organizations documented on Wikidata. Click a city to see details.', fr: 'Les villes apparaissent ici si elles accueillent des événements, lieux ou organisations LGBTQIA+ documentés sur Wikidata. Cliquez pour voir les détails.', es: 'Las ciudades aparecen aquí si albergan eventos, lugares u organizaciones LGBTQIA+ documentados en Wikidata. Haz clic para ver los detalles.' },
        'cities.sectionTitle':  { en: 'Cities with LGBTQIA+ Records', fr: 'Villes avec des données LGBTQIA+', es: 'Ciudades con registros LGBTQIA+' },
        'cities.searchLabel':   { en: 'Search cities',          fr: 'Rechercher des villes',   es: 'Buscar ciudades' },
        'cities.searchPlaceholder': { en: 'Search city',         fr: 'Rechercher une ville',    es: 'Buscar ciudad' },
        'cities.none':          { en: 'No cities found.',        fr: 'Aucune ville trouvée.',   es: 'No se encontraron ciudades.' },

        /* ---- History page ---- */
        'history.title':        { en: 'History & Timelines',    fr: 'Histoire & Chronologies', es: 'Historia y Cronologías' },
        'history.intro':        { en: 'Trace LGBTQIA+ history across eras, movements, and regions. This page surfaces timelines, turning points, and notable figures using data drawn live from Wikidata.', fr: 'Retracez l\u2019histoire LGBTQIA+ à travers les époques, mouvements et régions. Cette page fait émerger chronologies, tournants et figures notables à partir de données de Wikidata.', es: 'Rastrea la historia LGBTQIA+ a través de épocas, movimientos y regiones. Esta página muestra cronologías, puntos de inflexión y figuras notables usando datos de Wikidata.' },

        /* ---- Rights page ---- */
        'rights.title':         { en: 'Rights & Law',           fr: 'Droits & Loi',            es: 'Derechos y Ley' },
        'rights.intro':         { en: 'Track the global landscape of LGBTQ+ legal rights, from marriage equality and decriminalization to anti-discrimination protections. All data is drawn live from Wikidata, following the WikiProject LGBT data models.', fr: 'Suivez le paysage mondial des droits juridiques LGBTQ+, du mariage pour tous à la dépénalisation en passant par les protections anti-discrimination. Toutes les données proviennent de Wikidata.', es: 'Sigue el panorama global de los derechos legales LGBTQ+, desde la igualdad matrimonial y la despenalización hasta las protecciones contra la discriminación. Todos los datos provienen de Wikidata.' },
        'rights.byTopic':       { en: 'Rights by Topic',        fr: 'Droits par sujet',        es: 'Derechos por tema' },
        'rights.byCountry':     { en: 'Rights by Country & Territory', fr: 'Droits par pays & territoire', es: 'Derechos por país y territorio' },
        'rights.discrimination': { en: 'Discrimination & Violence', fr: 'Discrimination & Violence', es: 'Discriminación y Violencia' },

        /* Rights topics */
        'rights.marriage':      { en: 'Same-sex marriage',      fr: 'Mariage homosexuel',      es: 'Matrimonio igualitario' },
        'rights.marriageDesc':  { en: 'Countries and territories with legal same-sex marriage.', fr: 'Pays et territoires avec mariage homosexuel légal.', es: 'Países y territorios con matrimonio igualitario legal.' },
        'rights.unions':        { en: 'Same-sex unions',        fr: 'Unions homosexuelles',    es: 'Uniones del mismo sexo' },
        'rights.unionsDesc':    { en: 'Countries with civil unions, domestic partnerships, or other same-sex union recognition.', fr: 'Pays avec unions civiles, partenariats ou autre reconnaissance.', es: 'Países con uniones civiles, parejas de hecho u otro reconocimiento.' },
        'rights.decrim':        { en: 'Decriminalization',      fr: 'Dépénalisation',          es: 'Despenalización' },
        'rights.decrimDesc':    { en: 'Countries that have decriminalized consensual same-sex relations.', fr: 'Pays ayant dépénalisé les relations homosexuelles consenties.', es: 'Países que han despenalizado las relaciones homosexuales consensuales.' },
        'rights.adoption':      { en: 'Same-sex adoption',      fr: 'Adoption homoparentale',  es: 'Adopción homoparental' },
        'rights.adoptionDesc':  { en: 'Countries allowing adoption by same-sex couples.', fr: 'Pays autorisant l\u2019adoption par des couples de même sexe.', es: 'Países que permiten la adopción por parejas del mismo sexo.' },
        'rights.conversion':    { en: 'Conversion therapy bans', fr: 'Interdiction des thérapies de conversion', es: 'Prohibición de terapias de conversión' },
        'rights.conversionDesc': { en: 'Countries or regions that have outlawed conversion therapy.', fr: 'Pays ou régions ayant interdit les thérapies de conversion.', es: 'Países o regiones que han prohibido las terapias de conversión.' },
        'rights.trans':         { en: 'Transgender rights',     fr: 'Droits des personnes transgenres', es: 'Derechos de personas transgénero' },
        'rights.transDesc':     { en: 'Transgender rights by country, including legal gender recognition.', fr: 'Droits des personnes transgenres par pays, incluant la reconnaissance juridique du genre.', es: 'Derechos de personas transgénero por país, incluyendo reconocimiento legal de género.' },
        'rights.intersex':      { en: 'Intersex rights',        fr: 'Droits des personnes intersexes', es: 'Derechos intersex' },
        'rights.intersexDesc':  { en: 'Intersex rights by country, including protections against non-consensual medical interventions.', fr: 'Droits des personnes intersexes par pays, incluant les protections contre les interventions médicales non consenties.', es: 'Derechos intersex por país, incluyendo protecciones contra intervenciones médicas no consentidas.' },

        /* ---- Culture page ---- */
        'culture.title':        { en: 'Culture & Media',        fr: 'Culture & Médias',        es: 'Cultura y Medios' },
        'culture.intro':        { en: 'Explore LGBTQIA+ culture across film, television, literature, theatre, and community arts. All data is drawn live from Wikidata.', fr: 'Explorez la culture LGBTQIA+ à travers le cinéma, la télévision, la littérature, le théâtre et les arts communautaires. Données de Wikidata.', es: 'Explora la cultura LGBTQIA+ en cine, televisión, literatura, teatro y artes comunitarias. Datos de Wikidata.' },

        /* ---- Identities page ---- */
        'identities.title':     { en: 'Identities',             fr: 'Identités',               es: 'Identidades' },
        'identities.intro':     { en: 'Explore the rich diversity of LGBTQIA+ sexual orientations and gender identities documented in Wikidata. Each card shows data drawn live from Wikidata, the free knowledge base behind Wikipedia.', fr: 'Explorez la riche diversité des orientations sexuelles et identités de genre LGBTQIA+ documentées dans Wikidata. Chaque carte affiche des données en direct de Wikidata.', es: 'Explora la rica diversidad de orientaciones sexuales e identidades de género LGBTQIA+ documentadas en Wikidata. Cada tarjeta muestra datos en vivo de Wikidata.' },

        /* ---- Places page ---- */
        'places.title':         { en: 'Places & Memory',        fr: 'Lieux & Mémoire',         es: 'Lugares y Memoria' },
        'places.intro':         { en: 'Discover LGBTQIA+ places that preserve memory and community: centers, museums, archives, galleries, and monuments. All data is drawn live from Wikidata.', fr: 'Découvrez les lieux LGBTQIA+ qui préservent la mémoire et la communauté\u00a0: centres, musées, archives, galeries et monuments. Données de Wikidata.', es: 'Descubre lugares LGBTQIA+ que preservan la memoria y la comunidad: centros, museos, archivos, galerías y monumentos. Datos de Wikidata.' },

        /* ---- Activism page ---- */
        'activism.title':       { en: 'Activism & Movements',   fr: 'Activisme & Mouvements',  es: 'Activismo y Movimientos' },
        'activism.intro':       { en: 'Explore LGBTQIA+ activism through movements, pride histories, protests, and the activists who organized them. All data is drawn live from Wikidata.', fr: 'Explorez l\u2019activisme LGBTQIA+ à travers les mouvements, les marches des fiertés, les manifestations et les militant\u00b7es. Données de Wikidata.', es: 'Explora el activismo LGBTQIA+ a través de movimientos, historias del orgullo, protestas y activistas. Datos de Wikidata.' },

        /* ---- Data & Methodology page ---- */
        'data.title':           { en: 'Data & Methodology',     fr: 'Données & Méthodologie',  es: 'Datos y Metodología' },
        'data.intro':           { en: 'Queer Memory is built from open knowledge projects. Every page queries Wikidata live, and links to Wikipedia and Wikimedia Commons when available.', fr: 'Queer Memory est construit à partir de projets de savoir ouvert. Chaque page interroge Wikidata en direct et renvoie vers Wikipédia et Wikimedia Commons.', es: 'Queer Memory está construido a partir de proyectos de conocimiento abierto. Cada página consulta Wikidata en vivo y enlaza a Wikipedia y Wikimedia Commons.' },
        'data.sources':         { en: 'Data Sources',            fr: 'Sources de données',       es: 'Fuentes de datos' },
        'data.sourcesDesc':     { en: 'We draw structured data from Wikidata and surface related articles and media from Wikipedia and Wikimedia Commons.', fr: 'Nous utilisons les données structurées de Wikidata et les articles et médias de Wikipédia et Wikimedia Commons.', es: 'Extraemos datos estructurados de Wikidata y artículos y medios de Wikipedia y Wikimedia Commons.' },
        'data.srcWikidata':     { en: 'Wikidata provides structured entities (people, events, places, rights, movements, works).', fr: 'Wikidata fournit des entités structurées (personnes, événements, lieux, droits, mouvements, œuvres).', es: 'Wikidata proporciona entidades estructuradas (personas, eventos, lugares, derechos, movimientos, obras).' },
        'data.srcWikipedia':    { en: 'Wikipedia provides narrative context and detailed articles for many items.', fr: 'Wikipédia fournit un contexte narratif et des articles détaillés pour de nombreux éléments.', es: 'Wikipedia proporciona contexto narrativo y artículos detallados para muchos elementos.' },
        'data.srcCommons':      { en: 'Wikimedia Commons provides images and media for items with linked files.', fr: 'Wikimedia Commons fournit des images et des médias pour les éléments avec des fichiers liés.', es: 'Wikimedia Commons proporciona imágenes y medios para elementos con archivos vinculados.' },
        'data.methodology':     { en: 'Methodology',             fr: 'Méthodologie',              es: 'Metodología' },
        'data.methodDesc':      { en: 'The site runs SPARQL queries against the Wikidata Query Service at page load. Results are rendered client-side and update as Wikidata evolves.', fr: 'Le site exécute des requêtes SPARQL via le Wikidata Query Service au chargement. Les résultats sont rendus côté client et se mettent à jour avec Wikidata.', es: 'El sitio ejecuta consultas SPARQL contra el servicio de consultas de Wikidata al cargar. Los resultados se renderizan en el cliente y se actualizan con Wikidata.' },
        'data.methodLive':      { en: 'All records are live and can change as community edits occur.', fr: 'Tous les enregistrements sont en direct et peuvent changer avec les modifications de la communauté.', es: 'Todos los registros son en vivo y pueden cambiar con las ediciones de la comunidad.' },
        'data.methodModels':    { en: 'We prioritize items aligned with the WikiProject LGBT data models.', fr: 'Nous priorisons les éléments alignés avec les modèles de données du WikiProject LGBT.', es: 'Priorizamos elementos alineados con los modelos de datos del WikiProject LGBT.' },
        'data.methodLinks':     { en: 'Where available, we link to Wikipedia for context.', fr: 'Lorsque disponible, nous renvoyons vers Wikipédia pour le contexte.', es: 'Cuando está disponible, enlazamos a Wikipedia para contexto.' },
        'data.models':          { en: 'WikiProject LGBT Models',  fr: 'Modèles WikiProject LGBT',  es: 'Modelos WikiProject LGBT' },
        'data.modelsDesc':      { en: 'The project follows the WikiProject LGBT modeling guidance for rights, identities, places, movements, and culture.', fr: 'Le projet suit les directives de modélisation du WikiProject LGBT pour les droits, identités, lieux, mouvements et culture.', es: 'El proyecto sigue las directrices de modelado del WikiProject LGBT para derechos, identidades, lugares, movimientos y cultura.' },
        'data.modelsP1':        { en: 'These models define the classes and properties used for LGBTQIA+ topics, such as LGBT rights by country, LGBT pride in a geographic region, and LGBT-related cultural works.', fr: 'Ces modèles définissent les classes et propriétés utilisées pour les sujets LGBTQIA+, comme les droits LGBT par pays, la fierté LGBT dans une région géographique et les œuvres culturelles liées aux LGBT.', es: 'Estos modelos definen las clases y propiedades utilizadas para temas LGBTQIA+, como derechos LGBT por país, orgullo LGBT en una región geográfica y obras culturales relacionadas con LGBT.' },
        'data.modelsP2':        { en: 'If a topic is missing, improving the underlying model or adding items in Wikidata will immediately improve this site.', fr: 'Si un sujet manque, améliorer le modèle sous-jacent ou ajouter des éléments dans Wikidata améliorera immédiatement ce site.', es: 'Si falta un tema, mejorar el modelo subyacente o agregar elementos en Wikidata mejorará inmediatamente este sitio.' },
        'data.openSource':      { en: 'Open-Source Code',         fr: 'Code open source',          es: 'Código abierto' },
        'data.openSourceDesc':  { en: 'Queer Memory is a static front end, and its queries and page loaders are maintained in the public repository. The code is licensed under the GNU AGPL v3.', fr: 'Queer Memory est un front-end statique, et ses requêtes et chargeurs de pages sont maintenus dans le dépôt public. Le code est sous licence GNU AGPL v3.', es: 'Queer Memory es un front-end estático, y sus consultas y cargadores de páginas se mantienen en el repositorio público. El código está licenciado bajo GNU AGPL v3.' },
        'data.coverage':        { en: 'Coverage & Limitations',   fr: 'Couverture & Limitations',  es: 'Cobertura y Limitaciones' },
        'data.coverageDesc':    { en: 'This project reflects what has been documented and modeled in open knowledge sources, which are incomplete by nature.', fr: 'Ce projet reflète ce qui a été documenté et modélisé dans les sources de savoir ouvert, qui sont incomplètes par nature.', es: 'Este proyecto refleja lo que ha sido documentado y modelado en fuentes de conocimiento abierto, que son incompletas por naturaleza.' },
        'data.coverageUneven':  { en: 'Coverage is uneven across regions, languages, and historical periods.', fr: 'La couverture est inégale selon les régions, langues et périodes historiques.', es: 'La cobertura es desigual entre regiones, idiomas y períodos históricos.' },
        'data.coverageUnder':   { en: 'Under-documented communities and eras may be absent or thinly represented.', fr: 'Les communautés et époques sous-documentées peuvent être absentes ou peu représentées.', es: 'Las comunidades y épocas poco documentadas pueden estar ausentes o escasamente representadas.' },
        'data.coverageMissing': { en: 'Some items lack location, dates, or links, which affects visibility.', fr: 'Certains éléments manquent de localisation, dates ou liens, ce qui affecte leur visibilité.', es: 'Algunos elementos carecen de ubicación, fechas o enlaces, lo que afecta su visibilidad.' },
        'data.contribute':      { en: 'Help Improve Wikimedia Projects', fr: 'Aidez à améliorer les projets Wikimédia', es: 'Ayuda a mejorar los proyectos Wikimedia' },
        'data.contributeDesc':  { en: 'Queer Memory is only as strong as the open data behind it. Contributions to Wikimedia projects directly improve this site.', fr: 'Queer Memory n\u2019est aussi complet que les données ouvertes qui le soutiennent. Les contributions aux projets Wikimédia améliorent directement ce site.', es: 'Queer Memory es tan completo como los datos abiertos que lo respaldan. Las contribuciones a los proyectos Wikimedia mejoran directamente este sitio.' },
        'data.contribWikidata': { en: 'Add or improve Wikidata items for people, events, places, and organizations.', fr: 'Ajoutez ou améliorez des éléments Wikidata pour les personnes, événements, lieux et organisations.', es: 'Agrega o mejora elementos de Wikidata para personas, eventos, lugares y organizaciones.' },
        'data.contribWikipedia':{ en: 'Expand Wikipedia articles for LGBTQIA+ histories and figures.', fr: 'Développez les articles Wikipédia sur les histoires et figures LGBTQIA+.', es: 'Expande artículos de Wikipedia sobre historias y figuras LGBTQIA+.' },
        'data.contribCommons':  { en: 'Upload media to Wikimedia Commons to enrich visual coverage.', fr: 'Téléversez des médias sur Wikimedia Commons pour enrichir la couverture visuelle.', es: 'Sube medios a Wikimedia Commons para enriquecer la cobertura visual.' },
        'data.contribJoin':     { en: 'Join WikiProject LGBT to help curate and model data.', fr: 'Rejoignez le WikiProject LGBT pour aider à modéliser les données.', es: 'Únete al WikiProject LGBT para ayudar a curar y modelar datos.' },
        'data.licensing':       { en: 'Licensing & Attribution',   fr: 'Licences & Attribution',    es: 'Licencias y Atribución' },
        'data.licensingText':   { en: 'Project code is licensed under the GNU AGPL v3. Wikidata content is available under CC0. Wikipedia and Wikimedia Commons content follow their respective open licenses. Links are provided for attribution and verification.', fr: 'Le code du projet est sous licence GNU AGPL v3. Le contenu de Wikidata est disponible sous CC0. Le contenu de Wikipédia et Wikimedia Commons suit leurs licences ouvertes respectives. Les liens sont fournis pour l\u2019attribution et la vérification.', es: 'El código del proyecto está licenciado bajo GNU AGPL v3. El contenido de Wikidata está disponible bajo CC0. El contenido de Wikipedia y Wikimedia Commons sigue sus respectivas licencias abiertas. Se proporcionan enlaces para atribución y verificación.' },

        /* ---- Shared: hero, about, footer, data notes ---- */
        'home.heroDesc':        { en: 'Explore LGBTQIA+ histories across every continent, powered by open data from Wikidata, Wikipedia, and Wikimedia Commons.', fr: 'Explorez les histoires LGBTQIA+ sur tous les continents, grâce aux données ouvertes de Wikidata, Wikipédia et Wikimedia Commons.', es: 'Explora las historias LGBTQIA+ en todos los continentes, impulsado por datos abiertos de Wikidata, Wikipedia y Wikimedia Commons.' },
        'home.aboutP1':         { en: 'Queer Memory draws every fact, date, and image from the open Wikimedia ecosystem. Nothing is hard-coded: each page queries live structured data from Wikidata, labels from Wikipedia, and media from Wikimedia Commons.', fr: 'Queer Memory tire chaque fait, date et image de l\u2019écosystème ouvert Wikimédia. Rien n\u2019est codé en dur\u00a0: chaque page interroge en direct les données structurées de Wikidata, les libellés de Wikipédia et les médias de Wikimedia Commons.', es: 'Queer Memory extrae cada hecho, fecha e imagen del ecosistema abierto de Wikimedia. Nada está codificado: cada página consulta en vivo datos estructurados de Wikidata, etiquetas de Wikipedia y medios de Wikimedia Commons.' },
        'home.aboutP2':         { en: 'The data is always growing. You can help fill gaps and tell untold stories by contributing to WikiProject LGBT on Wikidata.', fr: 'Les données ne cessent de croître. Vous pouvez aider à combler les lacunes en contribuant au WikiProject LGBT sur Wikidata.', es: 'Los datos siempre están creciendo. Puedes ayudar a llenar vacíos y contar historias no contadas contribuyendo al WikiProject LGBT en Wikidata.' },
        'home.btnData':         { en: 'Data & Methodology',       fr: 'Données & Méthodologie',    es: 'Datos y Metodología' },
        'home.btnContribute':   { en: 'Contribute on Wikidata',   fr: 'Contribuer sur Wikidata',   es: 'Contribuir en Wikidata' },
        'home.prideEventsDesc': { en: 'The latest pride parades and celebrations documented on Wikidata.', fr: 'Les dernières marches des fiertés et célébrations documentées sur Wikidata.', es: 'Los últimos desfiles del orgullo y celebraciones documentados en Wikidata.' },
        'home.prideEventsLink': { en: 'See all activism', fr: 'Voir tout l\u2019activisme', es: 'Ver todo el activismo' },
        'home.prideFlagsDesc':  { en: 'Symbols of identity and solidarity, each with its own story.', fr: 'Symboles d\u2019identité et de solidarité, chacun avec sa propre histoire.', es: 'Símbolos de identidad y solidaridad, cada uno con su propia historia.' },
        'footer.text':          { en: 'Built on Wikidata, Wikipedia, and Wikimedia Commons. Data is indicative and incomplete.', fr: 'Construit avec Wikidata, Wikipédia et Wikimedia Commons. Les données sont indicatives et incomplètes.', es: 'Construido con Wikidata, Wikipedia y Wikimedia Commons. Los datos son indicativos e incompletos.' },

        /* ---- Rights page section headers/descs ---- */
        'rights.byTopicDesc':   { en: 'Key legal milestones for LGBTQ+ people, modelled in Wikidata as classes under Q17898 (LGBT rights by country or territory).', fr: 'Jalons juridiques clés pour les personnes LGBTQ+, modélisés dans Wikidata comme classes sous Q17898 (droits LGBT par pays ou territoire).', es: 'Hitos legales clave para las personas LGBTQ+, modelados en Wikidata como clases bajo Q17898 (derechos LGBT por país o territorio).' },
        'rights.byCountryDesc': { en: 'Every country and territory that has an "LGBT rights by country" article on Wikidata.', fr: 'Tous les pays et territoires disposant d\u2019un article « droits LGBT par pays » sur Wikidata.', es: 'Todos los países y territorios que tienen un artículo sobre « derechos LGBT por país » en Wikidata.' },
        'rights.discrimDesc':   { en: 'Wikidata documents patterns of discrimination and violence against LGBT people by geographic region.', fr: 'Wikidata documente les schémas de discrimination et de violence contre les personnes LGBT par région géographique.', es: 'Wikidata documenta patrones de discriminación y violencia contra personas LGBT por región geográfica.' },
        'rights.dataNote':      { en: 'All data on this page is queried live from the Wikidata Query Service using SPARQL.', fr: 'Toutes les données de cette page sont interrogées en direct via le Wikidata Query Service en SPARQL.', es: 'Todos los datos de esta página se consultan en vivo desde el Wikidata Query Service usando SPARQL.' },
        'rights.dataHelp':      { en: 'Coverage varies greatly between countries. You can help improve coverage by contributing to WikiProject LGBT.', fr: 'La couverture varie considérablement entre les pays. Vous pouvez aider à l\u2019améliorer en contribuant au WikiProject LGBT.', es: 'La cobertura varía mucho entre países. Puedes ayudar a mejorarla contribuyendo al WikiProject LGBT.' },

        /* ---- Memorial / timeline data notes ---- */
        'memorial.dataP1':      { en: 'All data on this page is queried live from the Wikidata Query Service using SPARQL. Coverage is deeply incomplete: many lives are not yet documented in structured data.', fr: 'Toutes les données de cette page sont interrogées en direct via le Wikidata Query Service. La couverture est très incomplète\u00a0: de nombreuses vies ne sont pas encore documentées en données structurées.', es: 'Todos los datos de esta página se consultan en vivo desde el Wikidata Query Service. La cobertura es muy incompleta: muchas vidas aún no están documentadas en datos estructurados.' },
        'memorial.dataP2':      { en: 'These records reflect only what the Wikidata community has been able to verify and source. You can help honour more lives by contributing to WikiProject LGBT.', fr: 'Ces enregistrements reflètent uniquement ce que la communauté Wikidata a pu vérifier et sourcer. Vous pouvez aider à honorer plus de vies en contribuant au WikiProject LGBT.', es: 'Estos registros reflejan solo lo que la comunidad de Wikidata ha podido verificar y documentar. Puedes ayudar a honrar más vidas contribuyendo al WikiProject LGBT.' },
        'timeline.dataP1':      { en: 'All data on this page is queried live from the Wikidata Query Service using SPARQL. Events are placed on the timeline by their earliest known date. Some events lack precise dates and appear approximate.', fr: 'Toutes les données sont interrogées en direct depuis le Wikidata Query Service en SPARQL. Les événements sont placés sur la chronologie par leur date connue la plus ancienne.', es: 'Todos los datos se consultan en vivo desde el Wikidata Query Service usando SPARQL. Los eventos se colocan en la cronología por su fecha conocida más temprana.' },
        'timeline.dataP2':      { en: 'Coverage is uneven and reflects the current state of Wikidata. You can help by contributing to WikiProject LGBT.', fr: 'La couverture est inégale et reflète l\u2019état actuel de Wikidata. Vous pouvez aider en contribuant au WikiProject LGBT.', es: 'La cobertura es desigual y refleja el estado actual de Wikidata. Puedes ayudar contribuyendo al WikiProject LGBT.' },

        /* ---- Search page ---- */
        'search.title':         { en: 'Search',                 fr: 'Recherche',               es: 'Búsqueda' },
        'search.intro':         { en: 'Search across LGBTQIA+ people, places, events, organizations, and more \u2014 powered by live Wikidata queries.', fr: 'Recherchez parmi les personnes, lieux, événements et organisations LGBTQIA+ \u2014 alimenté par des requêtes Wikidata en direct.', es: 'Busca entre personas, lugares, eventos y organizaciones LGBTQIA+ \u2014 impulsado por consultas Wikidata en vivo.' },
        'search.placeholder':   { en: 'Search people, places, events, organizations\u2026', fr: 'Rechercher personnes, lieux, événements\u2026', es: 'Buscar personas, lugares, eventos\u2026' },
        'search.noResults':     { en: 'No results found for', fr: 'Aucun résultat pour', es: 'Sin resultados para' },
        'search.results':       { en: 'result',                 fr: 'résultat',                es: 'resultado' },
        'search.resultsPlural': { en: 'results',                fr: 'résultats',               es: 'resultados' },
        'search.for':           { en: 'for',                    fr: 'pour',                    es: 'para' },
        'search.tryAgain':      { en: 'Try a different search term, or browse using the navigation above.', fr: 'Essayez un autre terme ou parcourez la navigation ci-dessus.', es: 'Prueba otro término o navega usando el menú de arriba.' },
        'search.failed':        { en: 'Search failed. Please try again.', fr: 'La recherche a échoué. Veuillez réessayer.', es: 'La búsqueda falló. Inténtalo de nuevo.' },
        'search.catCountry':    { en: 'Country / City',         fr: 'Pays / Ville',            es: 'País / Ciudad' },
        'search.catPerson':     { en: 'Person',                 fr: 'Personne',                es: 'Persona' },
        'search.catLgbt':       { en: 'LGBT Topic',             fr: 'Sujet LGBT',              es: 'Tema LGBT' },

        /* ---- Country profile page ---- */
        'country.profile':      { en: 'Country Profile',        fr: 'Profil du pays',          es: 'Perfil del país' },
        'country.subtitle':     { en: 'Queer history, rights, culture, and activism.', fr: 'Histoire queer, droits, culture et activisme.', es: 'Historia queer, derechos, cultura y activismo.' },
        'country.world':        { en: 'World',                  fr: 'Monde',                   es: 'Mundo' },
        'country.region':       { en: 'Region',                 fr: 'Région',                  es: 'Región' },
        'country.population':   { en: 'Population',             fr: 'Population',              es: 'Población' },
        'country.jumpTo':       { en: 'Jump to',                fr: 'Aller à',                 es: 'Ir a' },
        'country.overview':     { en: 'Overview',               fr: 'Aperçu',                  es: 'Resumen' },
        'country.rights':       { en: 'Rights & Law',           fr: 'Droits & Loi',            es: 'Derechos y Ley' },
        'country.history':      { en: 'History & Timelines',    fr: 'Histoire & Chronologies', es: 'Historia y Cronologías' },
        'country.places':       { en: 'Places & Memory',        fr: 'Lieux & Mémoire',         es: 'Lugares y Memoria' },
        'country.activism':     { en: 'Activism & Organizations', fr: 'Activisme & Organisations', es: 'Activismo y Organizaciones' },
        'country.events':       { en: 'Events & Protests',      fr: 'Événements & Manifestations', es: 'Eventos y Protestas' },
        'country.pride':        { en: 'Pride & Festivals',      fr: 'Fiertés & Festivals',     es: 'Orgullo y Festivales' },
        'country.culture':      { en: 'Culture & Media',        fr: 'Culture & Médias',        es: 'Cultura y Medios' },

        /* ---- City profile page ---- */
        'city.profile':         { en: 'City Profile',           fr: 'Profil de la ville',      es: 'Perfil de la ciudad' },
        'city.subtitle':        { en: 'Queer history, culture, and activism.', fr: 'Histoire queer, culture et activisme.', es: 'Historia queer, cultura y activismo.' },
        'city.country':         { en: 'Country',                fr: 'Pays',                    es: 'País' },

        /* ---- About this data (shared) ---- */
        'aboutData.title':      { en: 'About this data',        fr: 'À propos des données',    es: 'Sobre los datos' },
        'aboutData.source':     { en: 'Data is queried live from the Wikidata Query Service.', fr: 'Les données sont interrogées en direct depuis Wikidata.', es: 'Los datos se consultan en vivo desde Wikidata.' },
        'aboutData.help':       { en: 'You can help improve coverage by contributing to WikiProject LGBT.', fr: 'Vous pouvez améliorer la couverture en contribuant au WikiProject LGBT.', es: 'Puedes ayudar a mejorar la cobertura contribuyendo al WikiProject LGBT.' },

        /* ---- Heatmap (rights page) ---- */
        'heatmap.title':        { en: 'Global Rights Overview',  fr: 'Aperçu mondial des droits', es: 'Panorama mundial de derechos' },
        'heatmap.desc':         { en: 'A visual overview of LGBTQ+ legal rights worldwide, based on Wikidata coverage. Select a topic to see which countries have documented entries.', fr: 'Un aperçu visuel des droits légaux LGBTQ+ dans le monde, basé sur la couverture Wikidata. Sélectionnez un sujet pour voir quels pays ont des entrées documentées.', es: 'Una visión general de los derechos legales LGBTQ+ en el mundo, basada en la cobertura de Wikidata. Seleccione un tema para ver qué países tienen entradas documentadas.' },
        'heatmap.all':          { en: 'All topics',              fr: 'Tous les sujets',           es: 'Todos los temas' },
        'heatmap.marriage':     { en: 'Marriage',                fr: 'Mariage',                   es: 'Matrimonio' },
        'heatmap.unions':       { en: 'Civil unions',            fr: 'Unions civiles',            es: 'Uniones civiles' },
        'heatmap.decrim':       { en: 'Decriminalization',       fr: 'Dépénalisation',            es: 'Despenalización' },
        'heatmap.adoption':     { en: 'Adoption',                fr: 'Adoption',                  es: 'Adopción' },
        'heatmap.conversion':   { en: 'Conversion therapy ban',  fr: 'Interdiction des thérapies de conversion', es: 'Prohibición de terapias de conversión' },
        'heatmap.trans':        { en: 'Trans rights',            fr: 'Droits trans',              es: 'Derechos trans' },
        'heatmap.intersex':     { en: 'Intersex rights',         fr: 'Droits intersexes',         es: 'Derechos intersex' },
        'heatmap.documented':   { en: 'Documented',              fr: 'Documenté',                 es: 'Documentado' },        'heatmap.noData':       { en: 'No data',                 fr: 'Pas de donnees',            es: 'Sin datos' },
        'heatmap.mapUnavailable': { en: 'Map unavailable in this environment. Topic data is still shown below.', fr: 'Carte indisponible dans cet environnement. Les donnees par sujet restent affichees ci-dessous.', es: 'Mapa no disponible en este entorno. Los datos por tema siguen mostrandose abajo.' },
        'heatmap.error':        { en: 'Could not load heatmap data.', fr: 'Impossible de charger les données de la carte.', es: 'No se pudieron cargar los datos del mapa.' },

        /* ---- Timeline page ---- */
        'timeline.title':       { en: 'Interactive Timeline',    fr: 'Chronologie interactive',   es: 'Cronología interactiva' },
        'timeline.intro':       { en: 'Explore key moments in LGBTQ+ history across centuries, from legal milestones to cultural breakthroughs. All data from Wikidata.', fr: 'Explorez les moments clés de l\u2019histoire LGBTQ+ à travers les siècles. Toutes les données proviennent de Wikidata.', es: 'Explore momentos clave de la historia LGBTQ+ a través de los siglos. Todos los datos provienen de Wikidata.' },
        'timeline.rights':      { en: 'Rights',                  fr: 'Droits',                    es: 'Derechos' },
        'timeline.activism':    { en: 'Activism',                fr: 'Activisme',                 es: 'Activismo' },
        'timeline.culture':     { en: 'Culture',                 fr: 'Culture',                   es: 'Cultura' },
        'timeline.people':      { en: 'People',                  fr: 'Personnes',                 es: 'Personas' },
        'timeline.expandAll':   { en: 'Expand all',              fr: 'Tout développer',           es: 'Expandir todo' },
        'timeline.collapseAll': { en: 'Collapse all',            fr: 'Tout réduire',              es: 'Contraer todo' },
        'timeline.event':       { en: 'event',                   fr: 'événement',                 es: 'evento' },
        'timeline.events':      { en: 'events',                  fr: 'événements',                es: 'eventos' },
        'timeline.scopeCityView': { en: 'City-level view for {label}', fr: 'Vue au niveau de la ville pour {label}', es: 'Vista a nivel de ciudad para {label}' },
        'timeline.scopeCountryView': { en: 'Country-level view for {label}', fr: 'Vue au niveau du pays pour {label}', es: 'Vista a nivel de pais para {label}' },
        'timeline.scopeFiltered': { en: 'This page is filtered to timeline records connected to this place.', fr: 'Cette page est filtree pour les elements de chronologie lies a ce lieu.', es: 'Esta pagina esta filtrada a registros de cronologia conectados con este lugar.' },
        'timeline.noEvents':    { en: 'No events found.',        fr: 'Aucun événement trouvé.',   es: 'No se encontraron eventos.' },
        'timeline.error':       { en: 'Could not load timeline data.', fr: 'Impossible de charger la chronologie.', es: 'No se pudieron cargar los datos de la cronología.' },

        /* ---- Theme toggle ---- */
        'theme.switchLight':    { en: 'Switch to light theme',  fr: 'Mode clair',              es: 'Modo claro' },
        'theme.switchDark':     { en: 'Switch to dark theme',   fr: 'Mode sombre',             es: 'Modo oscuro' },
        'theme.switch':         { en: 'Switch theme',           fr: 'Changer de thème',        es: 'Cambiar tema' },

        /* ---- Memorial page ---- */
        'memorial.title':       { en: 'Memorial',               fr: 'Mémorial',                es: 'Memorial' },
        'memorial.intro':       { en: 'Remembering LGBTQ+ lives lost to the AIDS crisis, hate violence, and persecution. This page honours their memory through open data.', fr: 'En mémoire des vies LGBTQ+ perdues lors de la crise du sida, des violences haineuses et des persécutions. Cette page honore leur mémoire à travers les données ouvertes.', es: 'Recordando las vidas LGBTQ+ perdidas por la crisis del sida, la violencia de odio y la persecución. Esta página honra su memoria a través de datos abiertos.' },
        'memorial.warningTitle':{ en: 'Content note',           fr: 'Avertissement',            es: 'Aviso de contenido' },
        'memorial.warningText': { en: 'This page contains references to death, violence, and persecution. Please take care.', fr: 'Cette page contient des références à la mort, à la violence et à la persécution. Prenez soin de vous.', es: 'Esta página contiene referencias a la muerte, la violencia y la persecución. Cuídese.' },
        'memorial.warningBtn':  { en: 'I understand',           fr: 'Je comprends',             es: 'Entiendo' },
        'memorial.aids':        { en: 'Lost to the AIDS Crisis',fr: 'Victimes de la crise du sida', es: 'Víctimas de la crisis del sida' },
        'memorial.aidsDesc':    { en: 'People documented on Wikidata who died of AIDS-related illness.', fr: 'Personnes documentées sur Wikidata décédées de maladies liées au sida.', es: 'Personas documentadas en Wikidata que fallecieron por enfermedades relacionadas con el sida.' },
        'memorial.violence':    { en: 'Victims of Violence',    fr: 'Victimes de violence',     es: 'Víctimas de violencia' },
        'memorial.violenceDesc':{ en: 'LGBTQ+ people documented on Wikidata who were victims of homicide.', fr: 'Personnes LGBTQ+ documentées sur Wikidata victimes d\u2019homicide.', es: 'Personas LGBTQ+ documentadas en Wikidata víctimas de homicidio.' },
        'memorial.persecution': { en: 'Persecution by Region',  fr: 'Persécution par région',   es: 'Persecución por región' },
        'memorial.persecutionDesc': { en: 'Documented instances of violence against LGBTQ+ people by geographic region.', fr: 'Instances documentées de violence contre les personnes LGBTQ+ par région géographique.', es: 'Instancias documentadas de violencia contra personas LGBTQ+ por región geográfica.' },
        'memorial.noAids':      { en: 'No records found.',      fr: 'Aucun enregistrement trouvé.', es: 'No se encontraron registros.' },
        'memorial.noViolence':  { en: 'No records found.',      fr: 'Aucun enregistrement trouvé.', es: 'No se encontraron registros.' },
        'memorial.noPersecution':{ en: 'No records found.',     fr: 'Aucun enregistrement trouvé.', es: 'No se encontraron registros.' },
        'memorial.errorAids':   { en: 'Could not load AIDS memorial data.', fr: 'Impossible de charger les données du mémorial du sida.', es: 'No se pudieron cargar los datos del memorial del sida.' },
        'memorial.errorViolence':{ en: 'Could not load violence memorial data.', fr: 'Impossible de charger les données sur les violences.', es: 'No se pudieron cargar los datos sobre violencia.' },
        'memorial.errorPersecution':{ en: 'Could not load persecution data.', fr: 'Impossible de charger les données sur les persécutions.', es: 'No se pudieron cargar los datos sobre persecuciones.' },

        /* ---- Countries page sections ---- */
        'countries.sectionTitle': { en: 'Countries with LGBTQIA+ Records', fr: 'Pays avec des données LGBTQIA+', es: 'Países con registros LGBTQIA+' },
        'countries.sectionDesc': { en: 'Countries appear here if they have an LGBT rights entry or an LGBT history/timeline entry in Wikidata.', fr: 'Les pays apparaissent ici s\u2019ils ont une entrée sur les droits LGBT ou une chronologie dans Wikidata.', es: 'Los países aparecen aquí si tienen una entrada de derechos LGBT o una cronología en Wikidata.' },
        'countries.searchPlaceholder': { en: 'Search country', fr: 'Rechercher un pays', es: 'Buscar país' },
        'countries.help':       { en: 'Counts reflect how many Wikidata items link the country via P17 or P921 for rights and history. The country profile page may show additional records across other sections.', fr: 'Les compteurs reflètent le nombre d\u2019éléments Wikidata liés au pays via P17 ou P921 pour les droits et l\u2019histoire. Le profil du pays peut afficher des données supplémentaires.', es: 'Los conteos reflejan cuántos elementos de Wikidata vinculan al país vía P17 o P921 para derechos e historia. El perfil del país puede mostrar registros adicionales.' },
        'countries.dataP1':     { en: 'Data is queried live from the Wikidata Query Service using the WikiProject LGBT models for rights and history on Wikidata.', fr: 'Les données sont interrogées en direct depuis le Wikidata Query Service, utilisant les modèles WikiProject LGBT pour les droits et l\u2019histoire.', es: 'Los datos se consultan en vivo desde el Wikidata Query Service, usando los modelos WikiProject LGBT para derechos e historia.' },
        'countries.dataP2':     { en: 'You can help improve coverage by contributing to WikiProject LGBT, expanding related Wikipedia articles, or adding media to Wikimedia Commons.', fr: 'Vous pouvez améliorer la couverture en contribuant au WikiProject LGBT, en développant les articles Wikipédia ou en ajoutant des médias sur Wikimedia Commons.', es: 'Puedes ayudar a mejorar la cobertura contribuyendo al WikiProject LGBT, expandiendo artículos de Wikipedia o subiendo medios a Wikimedia Commons.' },

        /* ---- Cities page sections ---- */
        'cities.sectionTitle':  { en: 'Cities with LGBTQIA+ Records', fr: 'Villes avec des données LGBTQIA+', es: 'Ciudades con registros LGBTQIA+' },
        'cities.sectionDesc':   { en: 'Based on cities linked to LGBTQ+ events, places, or organizations in Wikidata.', fr: 'Basé sur les villes liées à des événements, lieux ou organisations LGBTQ+ dans Wikidata.', es: 'Basado en ciudades vinculadas a eventos, lugares u organizaciones LGBTQ+ en Wikidata.' },
        'cities.searchPlaceholder': { en: 'Search city', fr: 'Rechercher une ville', es: 'Buscar ciudad' },
        'cities.help':          { en: 'Counts reflect how many Wikidata items match the city listing query (currently places and events). City profile pages may show more records across organizations and culture.', fr: 'Les compteurs reflètent le nombre d\u2019éléments Wikidata correspondant à la requête (lieux et événements). Les profils de villes peuvent afficher plus de données.', es: 'Los conteos reflejan cuántos elementos de Wikidata coinciden con la consulta (lugares y eventos). Los perfiles de ciudades pueden mostrar más registros.' },
        'cities.dataP1':        { en: 'Data is queried live from the Wikidata Query Service using LGBTQIA+ event, place, and organization models on Wikidata.', fr: 'Les données sont interrogées en direct depuis le Wikidata Query Service, utilisant les modèles d\u2019événements, lieux et organisations LGBTQIA+.', es: 'Los datos se consultan en vivo desde el Wikidata Query Service, usando modelos de eventos, lugares y organizaciones LGBTQIA+.' },
        'cities.dataP2':        { en: 'You can help improve coverage by contributing to WikiProject LGBT, expanding related Wikipedia articles, or adding media to Wikimedia Commons.', fr: 'Vous pouvez améliorer la couverture en contribuant au WikiProject LGBT, en développant les articles Wikipédia ou en ajoutant des médias sur Wikimedia Commons.', es: 'Puedes ayudar a mejorar la cobertura contribuyendo al WikiProject LGBT, expandiendo artículos de Wikipedia o subiendo medios a Wikimedia Commons.' },

        /* ---- History page sections ---- */
        'history.timelines':    { en: 'Timelines by Region',   fr: 'Chronologies par région',  es: 'Cronologías por región' },
        'history.timelinesDesc':{ en: 'Explore regional timelines and history pages that map key events, movements, and milestones across places.', fr: 'Explorez les chronologies régionales et pages d\u2019histoire qui cartographient les événements, mouvements et jalons.', es: 'Explora cronologías regionales y páginas de historia que mapean eventos, movimientos e hitos.' },
        'history.movements':    { en: 'Movements, Pride, and Protest', fr: 'Mouvements, fiertés et protestations', es: 'Movimientos, orgullo y protestas' },
        'history.movementsDesc':{ en: 'Movement histories, pride records, and protest events that reshaped visibility and rights around the world.', fr: 'Histoires des mouvements, archives des fiertés et événements de protestation qui ont transformé la visibilité et les droits dans le monde.', es: 'Historias de movimientos, registros del orgullo y eventos de protesta que transformaron la visibilidad y los derechos en el mundo.' },
        'history.people':       { en: 'People & Activists',    fr: 'Personnalités & Militant\u00b7es', es: 'Personas y Activistas' },
        'history.peopleDesc':   { en: 'Notable LGBTQ rights activists and organizers documented in Wikidata, connected to their biographies and key dates.', fr: 'Militant\u00b7es et organisateur\u00b7ices notables des droits LGBTQ documenté\u00b7es dans Wikidata, liés à leurs biographies et dates clés.', es: 'Activistas y organizadores/as notables de derechos LGBTQ documentados en Wikidata, conectados a sus biografías y fechas clave.' },
        'history.hotspots':     { en: 'Global Hotspots Over Time', fr: 'Points chauds mondiaux au fil du temps', es: 'Focos globales a lo largo del tiempo' },
        'history.hotspotsDesc': { en: 'Where documented events concentrate today, based on the number of LGBTQ+ events linked to each country.', fr: 'Où se concentrent les événements documentés aujourd\u2019hui, selon le nombre d\u2019événements LGBTQ+ liés à chaque pays.', es: 'Dónde se concentran los eventos documentados hoy, según el número de eventos LGBTQ+ vinculados a cada país.' },
        'history.dataP1':       { en: 'All data on this page is queried live from the Wikidata Query Service using SPARQL. Coverage reflects how well events, people, and movements have been modelled on Wikidata.', fr: 'Toutes les données de cette page sont interrogées en direct depuis le Wikidata Query Service en SPARQL. La couverture reflète la qualité de la modélisation des événements, personnes et mouvements sur Wikidata.', es: 'Todos los datos de esta página se consultan en vivo desde el Wikidata Query Service usando SPARQL. La cobertura refleja qué tan bien se han modelado eventos, personas y movimientos en Wikidata.' },
        'history.dataP2':       { en: 'Gaps remain, especially for pre-20th-century records and non-Western histories. You can help improve coverage by contributing to WikiProject LGBT, expanding related Wikipedia articles, or adding media to Wikimedia Commons.', fr: 'Des lacunes subsistent, surtout pour les périodes pré-20e siècle et les histoires non occidentales. Vous pouvez améliorer la couverture en contribuant au WikiProject LGBT.', es: 'Quedan vacíos, especialmente para registros anteriores al siglo XX e historias no occidentales. Puedes ayudar a mejorar la cobertura contribuyendo al WikiProject LGBT.' },

        /* ---- Culture page sections ---- */
        'culture.performing':   { en: 'Performing Arts',        fr: 'Arts du spectacle',        es: 'Artes escénicas' },
        'culture.performingDesc':{ en: 'LGBTQ+ choruses and theatre works that shape public memory, performance, and community life.', fr: 'Chœurs et œuvres théâtrales LGBTQ+ qui façonnent la mémoire collective, la performance et la vie communautaire.', es: 'Coros y obras teatrales LGBTQ+ que dan forma a la memoria colectiva, la actuación y la vida comunitaria.' },
        'culture.screen':       { en: 'Film & Television',      fr: 'Cinéma & Télévision',      es: 'Cine y Televisión' },
        'culture.screenDesc':   { en: 'LGBTQ-related films and television series documented on Wikidata.', fr: 'Films et séries télévisées liés aux LGBTQ documentés sur Wikidata.', es: 'Películas y series de televisión relacionadas con LGBTQ documentadas en Wikidata.' },
        'culture.literature':   { en: 'Literature & Comics',    fr: 'Littérature & Bandes dessinées', es: 'Literatura y Cómics' },
        'culture.literatureDesc':{ en: 'LGBTQ literature, literary works, and comics that capture queer stories and representation.', fr: 'Littérature LGBTQ, œuvres littéraires et bandes dessinées qui capturent les histoires et la représentation queer.', es: 'Literatura LGBTQ, obras literarias y cómics que capturan historias y representación queer.' },
        'culture.media':        { en: 'Media & Festivals',      fr: 'Médias & Festivals',       es: 'Medios y Festivales' },
        'culture.mediaDesc':    { en: 'LGBTQ magazines and film festivals that document cultural production and community media.', fr: 'Magazines LGBTQ et festivals de cinéma qui documentent la production culturelle et les médias communautaires.', es: 'Revistas LGBTQ y festivales de cine que documentan la producción cultural y los medios comunitarios.' },
        'culture.dataP1':       { en: 'All data on this page is queried live from the Wikidata Query Service using SPARQL. Coverage reflects how well cultural works are modelled in Wikidata.', fr: 'Toutes les données de cette page sont interrogées en direct depuis le Wikidata Query Service en SPARQL. La couverture reflète la qualité de la modélisation des œuvres culturelles dans Wikidata.', es: 'Todos los datos de esta página se consultan en vivo desde el Wikidata Query Service usando SPARQL. La cobertura refleja qué tan bien se han modelado las obras culturales en Wikidata.' },
        'culture.dataP2':       { en: 'Records are uneven across regions and eras. You can help improve coverage by contributing to WikiProject LGBT, expanding related Wikipedia articles, or adding media to Wikimedia Commons.', fr: 'Les données sont inégales selon les régions et les époques. Vous pouvez améliorer la couverture en contribuant au WikiProject LGBT.', es: 'Los registros son desiguales entre regiones y épocas. Puedes ayudar a mejorar la cobertura contribuyendo al WikiProject LGBT.' },

        /* ---- Identities page sections ---- */
        'identities.orientations':     { en: 'Sexual Orientations',    fr: 'Orientations sexuelles',    es: 'Orientaciones sexuales' },
        'identities.orientationsDesc': { en: 'Sexual orientations as catalogued in Wikidata (Q17888). Click Notable people on any card to discover individuals linked to that orientation via Wikidata property P91.', fr: 'Orientations sexuelles cataloguées dans Wikidata (Q17888). Cliquez sur Personnalités sur n\u2019importe quelle carte pour découvrir les personnes liées via la propriété P91.', es: 'Orientaciones sexuales catalogadas en Wikidata (Q17888). Haz clic en Personas notables en cualquier tarjeta para descubrir personas vinculadas a esa orientación vía la propiedad P91.' },
        'identities.genders':          { en: 'Gender Identities',      fr: 'Identités de genre',        es: 'Identidades de género' },
        'identities.gendersDesc':      { en: 'Gender identities as catalogued in Wikidata (Q48264), including culturally specific identities from around the world. Notable people are linked via property P21.', fr: 'Identités de genre cataloguées dans Wikidata (Q48264), incluant les identités culturellement spécifiques du monde entier. Les personnalités sont liées via la propriété P21.', es: 'Identidades de género catalogadas en Wikidata (Q48264), incluyendo identidades culturalmente específicas de todo el mundo. Las personas notables están vinculadas vía la propiedad P21.' },
        'identities.coverage':         { en: 'Wikidata Coverage',      fr: 'Couverture Wikidata',       es: 'Cobertura Wikidata' },
        'identities.coverageDesc':     { en: 'How many people on Wikidata are linked to each identity? These counts reflect the current state of structured data and are always growing as the community contributes.', fr: 'Combien de personnes sur Wikidata sont liées à chaque identité\u00a0? Ces compteurs reflètent l\u2019état actuel des données structurées et grandissent sans cesse.', es: '\u00bfCuántas personas en Wikidata están vinculadas a cada identidad? Estos conteos reflejan el estado actual de los datos estructurados y crecen constantemente.' },
        'identities.dataP1':           { en: 'All data on this page is queried live from the Wikidata Query Service using SPARQL. Identity categories reflect how Wikidata currently models sexual orientation (instances of Q17888) and gender identity (instances of Q48264).', fr: 'Toutes les données de cette page sont interrogées en direct via le Wikidata Query Service en SPARQL. Les catégories d\u2019identité reflètent la modélisation actuelle de Wikidata.', es: 'Todos los datos de esta página se consultan en vivo desde el Wikidata Query Service usando SPARQL. Las categorías de identidad reflejan cómo Wikidata modela actualmente la orientación sexual e identidad de género.' },
        'identities.dataP2':           { en: 'Wikidata coverage is incomplete and reflects systemic biases in available sources. Many identities, especially from non-Western cultures, are under-represented. You can help by contributing to WikiProject LGBT.', fr: 'La couverture de Wikidata est incomplète et reflète les biais systémiques des sources disponibles. De nombreuses identités, surtout des cultures non occidentales, sont sous-représentées. Contribuez au WikiProject LGBT.', es: 'La cobertura de Wikidata es incompleta y refleja sesgos sistémicos en las fuentes disponibles. Muchas identidades, especialmente de culturas no occidentales, están subrepresentadas. Puedes ayudar contribuyendo al WikiProject LGBT.' },

        /* ---- Places page sections ---- */
        'places.centers':       { en: 'Community Centers & Info Points', fr: 'Centres communautaires & Points d\u2019information', es: 'Centros comunitarios y puntos de información' },
        'places.centersDesc':   { en: 'LGBTQ+ community centers and information points that provide support services, organizing space, and local resources.', fr: 'Centres communautaires LGBTQ+ et points d\u2019information offrant des services de soutien, des espaces d\u2019organisation et des ressources locales.', es: 'Centros comunitarios LGBTQ+ y puntos de información que brindan servicios de apoyo, espacio de organización y recursos locales.' },
        'places.museums':       { en: 'Museums & Galleries',    fr: 'Musées & Galeries',        es: 'Museos y Galerías' },
        'places.museumsDesc':   { en: 'LGBTQ+ museums and dedicated galleries or exhibit spaces. This includes general LGBT places used when no more specific class exists in Wikidata.', fr: 'Musées LGBTQ+ et galeries ou espaces d\u2019exposition dédiés. Inclut les lieux LGBT généraux lorsque aucune classe plus spécifique n\u2019existe dans Wikidata.', es: 'Museos LGBTQ+ y galerías o espacios de exhibición dedicados. Incluye lugares LGBT generales cuando no existe una clase más específica en Wikidata.' },
        'places.archives':      { en: 'Archives & Libraries',   fr: 'Archives & Bibliothèques', es: 'Archivos y Bibliotecas' },
        'places.archivesDesc':  { en: 'Archives and libraries preserving LGBTQ+ history, publications, and collections.', fr: 'Archives et bibliothèques préservant l\u2019histoire, les publications et les collections LGBTQ+.', es: 'Archivos y bibliotecas que preservan la historia, publicaciones y colecciones LGBTQ+.' },
        'places.memorials':     { en: 'Monuments & Memorials',  fr: 'Monuments & Mémoriaux',    es: 'Monumentos y Memoriales' },
        'places.memorialsDesc': { en: 'Historic places, monuments, and memorials that mark LGBTQ+ history and remembrance.', fr: 'Lieux historiques, monuments et mémoriaux qui marquent l\u2019histoire et la mémoire LGBTQ+.', es: 'Lugares históricos, monumentos y memoriales que marcan la historia y la memoria LGBTQ+.' },
        'places.dataP1':        { en: 'All data on this page is queried live from the Wikidata Query Service using SPARQL. Coverage reflects how well places are modelled in Wikidata.', fr: 'Toutes les données de cette page sont interrogées en direct depuis le Wikidata Query Service en SPARQL. La couverture reflète la qualité de la modélisation des lieux dans Wikidata.', es: 'Todos los datos de esta página se consultan en vivo desde el Wikidata Query Service usando SPARQL. La cobertura refleja qué tan bien se han modelado los lugares en Wikidata.' },
        'places.dataP2':        { en: 'Records are uneven across regions and eras. You can help improve coverage by contributing to WikiProject LGBT, expanding related Wikipedia articles, or adding media to Wikimedia Commons.', fr: 'Les données sont inégales selon les régions et les époques. Vous pouvez améliorer la couverture en contribuant au WikiProject LGBT.', es: 'Los registros son desiguales entre regiones y épocas. Puedes ayudar a mejorar la cobertura contribuyendo al WikiProject LGBT.' },

        /* ---- Activism page sections ---- */
        'activism.movements':   { en: 'Movements & Pride',      fr: 'Mouvements & Fiertés',     es: 'Movimientos y Orgullo' },
        'activism.movementsDesc':{ en: 'Movement histories and pride records by region. These entries capture the organizing backbone of LGBTQ+ activism.', fr: 'Histoires des mouvements et archives des fiertés par région. Ces entrées capturent la colonne vertébrale organisationnelle de l\u2019activisme LGBTQ+.', es: 'Historias de movimientos y registros del orgullo por región. Estas entradas capturan la columna vertebral organizativa del activismo LGBTQ+.' },
        'activism.protests':    { en: 'Protests & Campaigns',   fr: 'Manifestations & Campagnes', es: 'Protestas y Campañas' },
        'activism.protestsDesc':{ en: 'Key protest events and campaigns documented in Wikidata, linked to dates and countries where available.', fr: 'Événements de protestation et campagnes clés documentés dans Wikidata, liés aux dates et pays lorsque disponible.', es: 'Eventos de protesta y campañas clave documentados en Wikidata, vinculados a fechas y países cuando están disponibles.' },
        'activism.pride':       { en: 'Pride & Festivals',      fr: 'Fiertés & Festivals',      es: 'Orgullo y Festivales' },
        'activism.prideDesc':   { en: 'LGBTQ+ pride events and regional pride histories documented in Wikidata.', fr: 'Événements de fierté LGBTQ+ et histoires régionales des fiertés documentés dans Wikidata.', es: 'Eventos del orgullo LGBTQ+ e historias regionales del orgullo documentados en Wikidata.' },
        'activism.activists':   { en: 'Activists & Organizers', fr: 'Militant\u00b7es & Organisateur\u00b7ices', es: 'Activistas y Organizadores/as' },
        'activism.activistsDesc':{ en: 'Notable LGBTQ rights activists and organizers on Wikidata, connected to biographies and key dates.', fr: 'Militant\u00b7es et organisateur\u00b7ices notables des droits LGBTQ sur Wikidata, liés aux biographies et dates clés.', es: 'Activistas y organizadores/as notables de derechos LGBTQ en Wikidata, conectados a biografías y fechas clave.' },
        'activism.orgs':        { en: 'Organizations & Networks', fr: 'Organisations & Réseaux', es: 'Organizaciones y Redes' },
        'activism.orgsDesc':    { en: 'LGBTQ+ organizations and rights organizations documented in Wikidata, linked to their pages and descriptions.', fr: 'Organisations LGBTQ+ et organisations de défense des droits documentées dans Wikidata, liées à leurs pages et descriptions.', es: 'Organizaciones LGBTQ+ y organizaciones de derechos documentadas en Wikidata, vinculadas a sus páginas y descripciones.' },
        'activism.dataP1':      { en: 'All data on this page is queried live from the Wikidata Query Service using SPARQL. Coverage reflects how well activism-related items are modelled in Wikidata.', fr: 'Toutes les données de cette page sont interrogées en direct depuis le Wikidata Query Service en SPARQL. La couverture reflète la qualité de la modélisation des éléments liés à l\u2019activisme.', es: 'Todos los datos de esta página se consultan en vivo desde el Wikidata Query Service usando SPARQL. La cobertura refleja qué tan bien se han modelado los elementos relacionados con el activismo.' },
        'activism.dataP2':      { en: 'Records are uneven across regions and eras. You can help improve coverage by contributing to WikiProject LGBT.', fr: 'Les données sont inégales selon les régions et les époques. Vous pouvez améliorer la couverture en contribuant au WikiProject LGBT.', es: 'Los registros son desiguales entre regiones y épocas. Puedes ayudar a mejorar la cobertura contribuyendo al WikiProject LGBT.' },

        /* ---- Country profile page sections ---- */
        'country.dataTitle':    { en: 'Data, sources, and gaps', fr: 'Données, sources et lacunes', es: 'Datos, fuentes y vacíos' },
        'country.dataNote':     { en: 'Data is queried live from the Wikidata Query Service and reflects current coverage on Wikidata. You can help improve this profile by contributing to WikiProject LGBT, expanding related Wikipedia articles, or adding media to Wikimedia Commons.', fr: 'Les données sont interrogées en direct depuis le Wikidata Query Service et reflètent la couverture actuelle de Wikidata. Vous pouvez améliorer ce profil en contribuant au WikiProject LGBT.', es: 'Los datos se consultan en vivo desde el Wikidata Query Service y reflejan la cobertura actual de Wikidata. Puedes mejorar este perfil contribuyendo al WikiProject LGBT.' },

        /* ---- City profile page sections ---- */
        'city.places':          { en: 'Places & Memory',        fr: 'Lieux & Mémoire',          es: 'Lugares y Memoria' },
        'city.orgs':            { en: 'Organizations',           fr: 'Organisations',             es: 'Organizaciones' },
        'city.events':          { en: 'Events & Protests',       fr: 'Événements & Manifestations', es: 'Eventos y Protestas' },
        'city.pride':           { en: 'Pride & Festivals',       fr: 'Fiertés & Festivals',      es: 'Orgullo y Festivales' },
        'city.culture':         { en: 'Culture & Media',         fr: 'Culture & Médias',          es: 'Cultura y Medios' },
        'city.people':          { en: 'Notable People (Born Here)', fr: 'Personnalités (Né\u00b7es ici)', es: 'Personas Notables (Nacidas aquí)' },
        'city.dataTitle':       { en: 'Data, sources, and gaps', fr: 'Données, sources et lacunes', es: 'Datos, fuentes y vacíos' },
        'city.dataNote':        { en: 'Data is queried live from the Wikidata Query Service and reflects current coverage on Wikidata. You can help improve this profile by contributing to WikiProject LGBT, expanding related Wikipedia articles, or adding media to Wikimedia Commons.', fr: 'Les données sont interrogées en direct depuis le Wikidata Query Service et reflètent la couverture actuelle de Wikidata. Vous pouvez améliorer ce profil en contribuant au WikiProject LGBT.', es: 'Los datos se consultan en vivo desde el Wikidata Query Service y reflejan la cobertura actual de Wikidata. Puedes mejorar este perfil contribuyendo al WikiProject LGBT.' },
        'city.jumpTo':          { en: 'Jump to',                fr: 'Aller à',                   es: 'Ir a' },
        'city.data':            { en: 'Data',                    fr: 'Données',                   es: 'Datos' },

        /* ---- Language switcher ---- */
        'lang.label':           { en: 'Language',               fr: 'Langue',                  es: 'Idioma' }
    };

    /* ----------------------------------------------------------
       Language detection & persistence
       Priority: URL param → localStorage → browser → default
       ---------------------------------------------------------- */
    var _lang = null;

    function getLang() {
        if (_lang) return _lang;

        /* 1. URL param */
        var urlLang = new URLSearchParams(window.location.search).get('lang');
        if (urlLang && SUPPORTED.indexOf(urlLang) >= 0) {
            _lang = urlLang;
            localStorage.setItem(STORAGE_KEY, urlLang);
            return _lang;
        }

        /* 2. localStorage */
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED.indexOf(stored) >= 0) {
            _lang = stored;
            return _lang;
        }

        /* 3. Browser language */
        var browserLang = (navigator.language || '').substring(0, 2);
        if (SUPPORTED.indexOf(browserLang) >= 0) {
            _lang = browserLang;
            return _lang;
        }

        /* 4. Default */
        _lang = DEFAULT;
        return _lang;
    }

    function setLang(lang) {
        if (SUPPORTED.indexOf(lang) < 0) return;
        localStorage.setItem(STORAGE_KEY, lang);

        /* Update URL param without adding history entry */
        var url = new URL(window.location);
        url.searchParams.set('lang', lang);
        window.history.replaceState({}, '', url);

        /* Reload to re-render everything with new language */
        window.location.reload();
    }

    /* ----------------------------------------------------------
       Translation lookup
       ---------------------------------------------------------- */
    function t(key, replacements) {
        var entry = S[key];
        if (!entry) return key;
        var str = entry[getLang()] || entry[DEFAULT] || key;

        /* Simple placeholder replacement: t('key', { n: 5 }) replaces {n} */
        if (replacements) {
            Object.keys(replacements).forEach(function (k) {
                str = str.replace(new RegExp('\\{' + k + '\\}', 'g'), replacements[k]);
            });
        }
        return str;
    }

    /* ----------------------------------------------------------
       Wikipedia URL for current language
       ---------------------------------------------------------- */
    function wikiUrl() {
        return 'https://' + getLang() + '.wikipedia.org/';
    }

    /* ----------------------------------------------------------
       DOM auto-translation
       Scans for [data-i18n] attributes and replaces textContent.
       Also handles [data-i18n-placeholder] for input placeholders
       and [data-i18n-aria] for aria-labels.
       Call once on DOMContentLoaded.
       ---------------------------------------------------------- */
    function translateDOM() {
        /* Set <html lang> */
        document.documentElement.lang = getLang();

        /* Text content */
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
            var key = els[i].getAttribute('data-i18n');
            els[i].textContent = t(key);
        }

        /* Placeholders */
        var placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        for (var j = 0; j < placeholders.length; j++) {
            var pKey = placeholders[j].getAttribute('data-i18n-placeholder');
            placeholders[j].placeholder = t(pKey);
        }

        /* Aria labels */
        var ariaEls = document.querySelectorAll('[data-i18n-aria]');
        for (var k = 0; k < ariaEls.length; k++) {
            var aKey = ariaEls[k].getAttribute('data-i18n-aria');
            ariaEls[k].setAttribute('aria-label', t(aKey));
        }

        /* Page title */
        var titleEl = document.querySelector('[data-i18n-title]');
        if (titleEl) {
            document.title = 'Queer Memory \u2013 ' + t(titleEl.getAttribute('data-i18n-title'));
        }
    }

    /* ----------------------------------------------------------
       Auto-run on DOM ready
       ---------------------------------------------------------- */
    function init() {
        translateDOM();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    /* ----------------------------------------------------------
       Public API
       ---------------------------------------------------------- */
    return {
        getLang:     getLang,
        setLang:     setLang,
        t:           t,
        wikiUrl:     wikiUrl,
        translateDOM: translateDOM,
        SUPPORTED:   SUPPORTED
    };

})();

window.QM = QM;


