/* ============================================================
   Queer Memory - Cities
   Lists cities linked to LGBTQIA+ events, places, or organizations.
   Depends on: wikidata.js (QM.wikidata)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;

    var PLACE_TYPES = [
        'Q2945640',   /* LGBT community center */
        'Q118108259', /* LGBT information point */
        'Q61710650',  /* LGBT museum */
        'Q64364539',  /* LGBT place */
        'Q61710689',  /* LGBT archive */
        'Q62128088',  /* LGBT library */
        'Q29469577'   /* LGBT historic place */
    ];

    var ORG_TYPES = [
        'Q64606659',  /* LGBTQ+ organization */
        'Q6458277'    /* LGBTQ+ rights organization */
    ];

    var EVENT_TYPES = [
        'Q64348974',  /* LGBTQ+ event */
        'Q125506609', /* LGBT+ protest */
        'Q130285134'  /* LGBT pride in a geographic region */
    ];

    function init() {
        loadCities();
    }

    function loadCities() {
        var container = document.getElementById('cities-grid');
        var countEl = document.getElementById('cities-count');
        var searchEl = document.getElementById('cities-search');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?city ?cityLabel ?country ?countryLabel (COUNT(DISTINCT ?item) AS ?count) WHERE {',
            '  VALUES ?type { ' + PLACE_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' ' +
                               EVENT_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  ?item wdt:P131 ?city .',
            '  ?city wdt:P31/wdt:P279* wd:Q515 .',
            '  OPTIONAL { ?city wdt:P17 ?country . }',
            '  ' + wd.labelService('en'),
            '}',
            'GROUP BY ?city ?cityLabel ?country ?countryLabel',
            'ORDER BY DESC(?count) ?cityLabel',
            'LIMIT 200'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                var cities = bindings.map(function (b) {
                    return {
                        qid: wd.qid(b, 'city'),
                        label: wd.val(b, 'cityLabel'),
                        country: wd.val(b, 'countryLabel'),
                        count: parseInt(wd.val(b, 'count'), 10) || 0
                    };
                });
                renderCities(container, countEl, cities);
                bindSearch(searchEl, container, cities);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load cities:', err);
                wd.showError(container, 'Could not load cities from Wikidata.');
            });
    }

    function renderCities(container, countEl, cities) {
        if (!cities.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No cities found.'));
            return;
        }

        if (countEl) {
            countEl.textContent = cities.length + ' cities';
        }

        cities.forEach(function (city) {
            var link = document.createElement('a');
            link.href = './city.html?id=' + city.qid;
            link.className = 'location-card card';

            var name = wd.el('h3', 'location-card__name', city.label);
            link.appendChild(name);

            if (city.country) {
                link.appendChild(wd.el('div', 'location-card__meta', city.country));
            }

            var tags = wd.el('div', 'location-card__tags');
            tags.appendChild(wd.el('span', 'location-tag', city.count + ' records'));
            link.appendChild(tags);

            container.appendChild(link);
        });
    }

    function bindSearch(input, container, cities) {
        if (!input) return;
        input.addEventListener('input', function () {
            var q = input.value.trim().toLowerCase();
            container.innerHTML = '';
            var filtered = cities.filter(function (c) {
                return c.label.toLowerCase().indexOf(q) >= 0 ||
                    (c.country && c.country.toLowerCase().indexOf(q) >= 0);
            });
            renderCities(container, null, filtered);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
