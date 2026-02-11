/* ============================================================
   Queer Memory - Places & Memory
   Fetches and renders LGBTQIA+ place data from Wikidata.
   Depends on: wikidata.js (QM.wikidata)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

    /* ----------------------------------------------------------
       Configuration - model QIDs (WikiProject LGBT)
       ---------------------------------------------------------- */

    var CENTER_TYPES = [
        { qid: 'Q2945640', label: 'LGBT community center' },
        { qid: 'Q118108259', label: 'LGBT information point' }
    ];

    var MUSEUM_TYPES = [
        { qid: 'Q61710650', label: 'LGBT museum' },
        { qid: 'Q64364539', label: 'LGBT place' }
    ];

    var ARCHIVE_TYPES = [
        { qid: 'Q61710689', label: 'LGBT archive' },
        { qid: 'Q62128088', label: 'LGBT library' }
    ];

    var MEMORIAL_TYPES = [
        { qid: 'Q29469577', label: 'LGBT historic place' }
    ];

    var GENERAL_PLACE_EXCLUDES = [
        'Q105321449', /* LGBT bar */
        'Q1043639',   /* gay bar */
        'Q30324198',  /* lesbian bar */
        'Q2945640',   /* LGBT community center */
        'Q118108259', /* LGBT information point */
        'Q61710650',  /* LGBT museum */
        'Q61710689',  /* LGBT archive */
        'Q62128088',  /* LGBT library */
        'Q29469577'   /* LGBT historic place */
    ];


    /* ----------------------------------------------------------
       Page initialisation
       ---------------------------------------------------------- */

    function init() {
        loadCenters();
        loadMuseums();
        loadArchives();
        loadMemorials();
    }


    /* ----------------------------------------------------------
       Section 1: Centers & info points
       ---------------------------------------------------------- */

    function loadCenters() {
        var container = document.getElementById('places-centers-grid');
        if (!container) return;
        loadPlaceSection(container, CENTER_TYPES, 200);
    }


    /* ----------------------------------------------------------
       Section 2: Museums & galleries
       ---------------------------------------------------------- */

    function loadMuseums() {
        var container = document.getElementById('places-museums-grid');
        if (!container) return;
        loadPlaceSection(container, MUSEUM_TYPES, 200, GENERAL_PLACE_EXCLUDES);
    }


    /* ----------------------------------------------------------
       Section 3: Archives & libraries
       ---------------------------------------------------------- */

    function loadArchives() {
        var container = document.getElementById('places-archives-grid');
        if (!container) return;
        loadPlaceSection(container, ARCHIVE_TYPES, 200);
    }


    /* ----------------------------------------------------------
       Section 4: Monuments & memorials
       ---------------------------------------------------------- */

    function loadMemorials() {
        var container = document.getElementById('places-memorials-grid');
        if (!container) return;
        loadPlaceSection(container, MEMORIAL_TYPES, 200);
    }


    /* ----------------------------------------------------------
       Shared loader
       ---------------------------------------------------------- */

    function loadPlaceSection(container, types, limit, excludeQids) {
        var doneLoading = wd.showLoading(container);
        var typeQids = types.map(function (t) { return t.qid; });
        var exclude = excludeQids || [];

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?type ?typeLabel ?country ?countryLabel ?article WHERE {',
            '  ' + wd.valuesClause('?type', typeQids),
            '  ?item wdt:P31 ?type .',
            '  OPTIONAL { ?item wdt:P17 ?country . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }'
        ];

        exclude.forEach(function (qid) {
            sparql.push('  MINUS { ?item wdt:P31 wd:' + qid + ' . }');
        });

        sparql.push('  ' + wd.labelService());
        sparql.push('}');
        sparql.push('ORDER BY ?itemLabel');
        sparql.push('LIMIT ' + (limit || 200));

        wd.query(sparql.join('\n'))
            .then(function (bindings) {
                doneLoading();
                renderPlaceCards(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load places:', err);
                wd.showError(container, 'Could not load places from Wikidata.');
            });
    }

    function renderPlaceCards(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No places found.'));
            return;
        }

        var seen = {};
        var unique = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'item');
            if (!seen[id]) {
                seen[id] = true;
                unique.push(b);
            }
        });

        unique.forEach(function (b) {
            var card = wd.el('article', 'history-card card');
            var itemQid = wd.qid(b, 'item');
            var label = wd.val(b, 'itemLabel');
            var typeLabel = wd.val(b, 'typeLabel');
            var countryLabel = wd.val(b, 'countryLabel');
            var desc = wd.val(b, 'itemDescription');

            card.appendChild(wd.el('h3', 'history-card__title', label));

            if (countryLabel) {
                card.appendChild(wd.el('span', 'history-card__meta', countryLabel));
            }

            if (typeLabel) {
                card.appendChild(wd.el('span', 'history-card__tag', typeLabel));
            }

            if (desc) {
                card.appendChild(wd.el('p', 'history-card__desc', desc));
            }

            var links = wd.el('div', 'history-card__links');
            var articleUrl = wd.val(b, 'article');
            var link = document.createElement('a');
            link.href = articleUrl || wd.entityUrl(itemQid);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = articleUrl ? (i18n ? i18n.t('link.wikipedia') : 'Wikipedia') : (i18n ? i18n.t('link.wikidata') : 'Wikidata');
            link.className = 'identity-card__link';
            links.appendChild(link);
            card.appendChild(links);

            container.appendChild(card);
        });
    }


    /* ----------------------------------------------------------
       Bootstrap
       ---------------------------------------------------------- */

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
