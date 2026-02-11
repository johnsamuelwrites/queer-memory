/* ============================================================
   Queer Memory - Culture & Media
   Fetches and renders LGBTQIA+ culture data from Wikidata.
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

    var PERFORMING_TYPES = [
        { qid: 'Q1820625', label: 'LGBT chorus' },
        { qid: 'Q106771428', label: 'LGBT play' }
    ];

    var SCREEN_TYPES = [
        { qid: 'Q20442589', label: 'LGBT-related film' },
        { qid: 'Q85133165', label: 'LGBT-related television series' }
    ];

    var LITERATURE_TYPES = [
        { qid: 'Q18211073', label: 'LGBT literature' },
        { qid: 'Q127607260', label: 'LGBT literary work' },
        { qid: 'Q61745175', label: 'LGBT comic' }
    ];

    var MEDIA_TYPES = [
        { qid: 'Q61851987', label: 'LGBT magazine' },
        { qid: 'Q62018250', label: 'LGBT film festival' }
    ];


    /* ----------------------------------------------------------
       Page initialisation
       ---------------------------------------------------------- */

    function init() {
        loadCultureSection('culture-performing-grid', PERFORMING_TYPES, 200);
        loadCultureSection('culture-screen-grid', SCREEN_TYPES, 200);
        loadCultureSection('culture-literature-grid', LITERATURE_TYPES, 200);
        loadCultureSection('culture-media-grid', MEDIA_TYPES, 200);
    }


    /* ----------------------------------------------------------
       Shared loader
       ---------------------------------------------------------- */

    function loadCultureSection(containerId, types, limit) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var doneLoading = wd.showLoading(container);
        var typeQids = types.map(function (t) { return t.qid; });

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?type ?typeLabel ?country ?countryLabel ?date ?article WHERE {',
            '  ' + wd.valuesClause('?type', typeQids),
            '  ?item wdt:P31 ?type .',
            '  OPTIONAL { ?item wdt:P17 ?country . }',
            '  OPTIONAL { ?item wdt:P577 ?pubDate . }',
            '  OPTIONAL { ?item wdt:P571 ?startDate . }',
            '  BIND(COALESCE(?pubDate, ?startDate) AS ?date)',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?itemLabel',
            'LIMIT ' + (limit || 200)
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCultureCards(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load culture data:', err);
                wd.showError(container, 'Could not load culture data from Wikidata.');
            });
    }

    function renderCultureCards(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No items found.'));
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

            var date = formatYear(wd.val(b, 'date'));
            var meta = [countryLabel, date].filter(Boolean).join(' • ');
            if (meta) {
                card.appendChild(wd.el('span', 'history-card__meta', meta));
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

    function formatYear(isoDate) {
        if (!isoDate) return '';
        var match = isoDate.match(/^(-?\\d{1,4})/);
        if (match) {
            var year = parseInt(match[1], 10);
            if (year < 0) return Math.abs(year) + ' BCE';
            return String(year);
        }
        return isoDate.substring(0, 4);
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
