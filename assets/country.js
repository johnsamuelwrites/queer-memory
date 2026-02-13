/* ============================================================
   Queer Memory - Country Profile
   Loads a country profile by QID from the query string.
   Depends on: wikidata.js (QM.wikidata)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

    var PLACE_TYPES = [
        'Q2945640',
        'Q118108259',
        'Q61710650',
        'Q64364539',
        'Q61710689',
        'Q62128088',
        'Q29469577'
    ];

    var ORG_TYPES = [
        'Q64606659',
        'Q6458277'
    ];

    var EVENT_TYPES = [
        'Q64348974',
        'Q125506609'
    ];

    var PRIDE_TYPE = 'Q51404';

    var CULTURE_TYPES = [
        'Q1820625',
        'Q106771428',
        'Q20442589',
        'Q85133165',
        'Q18211073',
        'Q127607260',
        'Q61745175',
        'Q61851987',
        'Q62018250'
    ];

    function init() {
        var qid = getQid();
        if (!qid) {
            showMissingId();
            return;
        }

        updateTimelineMenuLink(qid);
        renderLinks('country-links', '', qid);
        loadCountryHeader(qid);
        loadRights(qid);
        loadHistory(qid);
        loadPlaces(qid);
        loadOrganizations(qid);
        loadEvents(qid);
        loadPride(qid);
        loadCulture(qid);
        loadDataNote(qid);
    }

    function getQid() {
        var params = new URLSearchParams(window.location.search);
        var id = params.get('id');
        if (!id) return '';
        return id.trim();
    }

    function showMissingId() {
        var main = document.getElementById('main-content');
        if (!main) return;
        main.innerHTML = '';
        var msg = wd.el('p', 'qm-error', 'Missing country id. Use country.html?id=Q142');
        main.appendChild(msg);
    }

    function loadCountryHeader(qid) {
        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?regionLabel ?population ?article WHERE {',
            '  VALUES ?item { wd:' + qid + ' }',
            '  OPTIONAL { ?item wdt:P30 ?region . }',
            '  OPTIONAL { ?item wdt:P1082 ?population . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                var b = bindings[0];
                if (!b) {
                    renderLinks('country-links', '', qid);
                    return;
                }

                setText('country-name', wd.val(b, 'itemLabel'));
                setText('country-breadcrumb', wd.val(b, 'itemLabel'));
                setText('country-desc', wd.val(b, 'itemDescription') || 'Queer history, rights, culture, and activism.');

                var region = wd.val(b, 'regionLabel');
                setText('country-region', region || 'Region unknown');

                var popVal = wd.val(b, 'population');
                var popText = popVal ? formatNumber(popVal) + ' population' : 'Population unknown';
                setText('country-population', popText);

                updateTimelineMenuLink(qid);
                renderLinks('country-links', wd.val(b, 'article'), qid);
            })
            .catch(function (err) {
                console.error('Failed to load country header:', err);
                renderLinks('country-links', '', qid);
            });
    }

    function loadRights(qid) {
        var container = document.getElementById('country-rights-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?article WHERE {',
            '  ?item wdt:P31 wd:Q17898 .',
            '  ?item wdt:P17 wd:' + qid + ' .',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?itemLabel',
            'LIMIT 100'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCards(container, bindings, 'item');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load rights:', err);
                wd.showError(container, 'Could not load rights data.');
            });
    }

    function loadHistory(qid) {
        var container = document.getElementById('country-history-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT DISTINCT ?item ?itemLabel ?itemDescription ?article WHERE {',
            '  VALUES ?type { wd:Q130262508 wd:Q125143610 }',
            '  ?item wdt:P31 ?type .',
            '  OPTIONAL { ?item wdt:P17 ?c1 . }',
            '  OPTIONAL { ?item wdt:P921 ?c2 . }',
            '  BIND(COALESCE(?c1, ?c2) AS ?country)',
            '  FILTER(?country = wd:' + qid + ')',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?itemLabel',
            'LIMIT 100'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCards(container, bindings, 'item');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load history:', err);
                wd.showError(container, 'Could not load history data.');
            });
    }

    function loadPlaces(qid) {
        var container = document.getElementById('country-places-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?type ?typeLabel ?article WHERE {',
            '  VALUES ?type { ' + PLACE_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  ?item wdt:P17 wd:' + qid + ' .',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?itemLabel',
            'LIMIT 200'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCards(container, bindings, 'item');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load places:', err);
                wd.showError(container, 'Could not load places.');
            });
    }

    function loadOrganizations(qid) {
        var container = document.getElementById('country-orgs-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?article WHERE {',
            '  VALUES ?type { ' + ORG_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  ?item wdt:P17 wd:' + qid + ' .',
            '  OPTIONAL { ?item wdt:P159 ?hq . }',
            '  OPTIONAL { ?item wdt:P131 ?loc . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?itemLabel',
            'LIMIT 200'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCards(container, bindings, 'item');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load organizations:', err);
                wd.showError(container, 'Could not load organizations.');
            });
    }

    function loadEvents(qid) {
        var container = document.getElementById('country-events-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?article WHERE {',
            '  VALUES ?type { ' + EVENT_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  ?item wdt:P17 wd:' + qid + ' .',
            '  OPTIONAL { ?item wdt:P585 ?date . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY DESC(?date)',
            'LIMIT 200'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCards(container, bindings, 'item', 'date');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load events:', err);
                wd.showError(container, 'Could not load events.');
            });
    }

    function loadPride(qid) {
        var container = document.getElementById('country-pride-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?article WHERE {',
            '  ?item wdt:P31 wd:' + PRIDE_TYPE + ' .',
            '  ?item wdt:P17 wd:' + qid + ' .',
            '  OPTIONAL { ?item wdt:P585 ?date . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY DESC(?date)',
            'LIMIT 200'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCards(container, bindings, 'item', 'date');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load pride:', err);
                wd.showError(container, 'Could not load pride data.');
            });
    }

    function loadCulture(qid) {
        var container = document.getElementById('country-culture-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?article WHERE {',
            '  VALUES ?type { ' + CULTURE_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  OPTIONAL { ?item wdt:P17 ?c1 . }',
            '  OPTIONAL { ?item wdt:P495 ?c2 . }',
            '  BIND(COALESCE(?c1, ?c2) AS ?country)',
            '  FILTER(?country = wd:' + qid + ')',
            '  OPTIONAL { ?item wdt:P577 ?pubDate . }',
            '  OPTIONAL { ?item wdt:P571 ?startDate . }',
            '  BIND(COALESCE(?pubDate, ?startDate) AS ?date)',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY DESC(?date)',
            'LIMIT 200'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCards(container, bindings, 'item', 'date');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load culture:', err);
                wd.showError(container, 'Could not load culture data.');
            });
    }

    function loadDataNote(qid) {
        var container = document.getElementById('country-data-note');
        if (!container) return;
        if (container.textContent && container.textContent.trim()) {
            return;
        }
        container.textContent = 'Data is loaded live from Wikidata for ' + qid +
            '. Coverage varies by topic and region.';
    }

    function renderCards(container, bindings, key, dateKey) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No records found.'));
            return;
        }

        var seen = {};
        var unique = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, key);
            if (!seen[id]) {
                seen[id] = true;
                unique.push(b);
            }
        });

        unique.forEach(function (b) {
            var card = wd.el('article', 'history-card card');
            var label = wd.val(b, key + 'Label');
            var desc = wd.val(b, key + 'Description');
            var date = dateKey ? formatYear(wd.val(b, dateKey)) : '';
            var qid = wd.qid(b, key);

            card.appendChild(wd.el('h3', 'history-card__title', label));

            if (date) {
                card.appendChild(wd.el('span', 'history-card__meta', date));
            }

            if (desc) {
                card.appendChild(wd.el('p', 'history-card__desc', desc));
            }

            var links = wd.el('div', 'history-card__links');
            var articleUrl = wd.val(b, 'article');
            if (articleUrl) {
                var wp = document.createElement('a');
                wp.href = articleUrl;
                wp.target = '_blank';
                wp.rel = 'noopener';
                wp.textContent = i18n ? i18n.t('link.wikipedia') : 'Wikipedia';
                wp.className = 'identity-card__link';
                links.appendChild(wp);
            }

            var wdLink = document.createElement('a');
            wdLink.href = wd.entityUrl(qid);
            wdLink.target = '_blank';
            wdLink.rel = 'noopener';
            wdLink.textContent = i18n ? i18n.t('link.wikidata') : 'Wikidata';
            wdLink.className = 'identity-card__link';
            links.appendChild(wdLink);

            card.appendChild(links);

            container.appendChild(card);
        });
    }

    function renderLinks(containerId, articleUrl, qid) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';

        if (articleUrl) {
            var wp = document.createElement('a');
            wp.href = articleUrl;
            wp.target = '_blank';
            wp.rel = 'noopener';
            wp.textContent = i18n ? i18n.t('link.wikipedia') : 'Wikipedia';
            wp.className = 'identity-card__link';
            container.appendChild(wp);
        }

        var wdLink = document.createElement('a');
        wdLink.href = wd.entityUrl(qid);
        wdLink.target = '_blank';
        wdLink.rel = 'noopener';
        wdLink.textContent = i18n ? i18n.t('link.wikidata') : 'Wikidata';
        wdLink.className = 'identity-card__link';
        container.appendChild(wdLink);

        var name = (document.getElementById('country-name') || {}).textContent || qid;
        var currentLang = i18n ? i18n.getLang() : '';
        var timelineLink = document.createElement('a');
        timelineLink.href = './timeline.html?country=' + encodeURIComponent(qid) +
            '&label=' + encodeURIComponent(name) +
            (currentLang ? '&lang=' + encodeURIComponent(currentLang) : '');
        timelineLink.textContent = i18n ? i18n.t('nav.timeline') : 'Timeline';
        timelineLink.className = 'identity-card__link';
        container.appendChild(timelineLink);
    }

    function updateTimelineMenuLink(qid) {
        var anchor = document.querySelector('.section-jump .section-jump__list a.section-jump__link[data-i18n="nav.timeline"]');
        if (!anchor) return;
        var currentLang = i18n ? i18n.getLang() : '';
        var name = (document.getElementById('country-name') || {}).textContent || qid;
        anchor.href = './timeline.html?country=' + encodeURIComponent(qid) +
            '&label=' + encodeURIComponent(name) +
            (currentLang ? '&lang=' + encodeURIComponent(currentLang) : '');
    }

    function setText(id, text) {
        var el = document.getElementById(id);
        if (!el) return;
        el.textContent = text;
    }

    function formatNumber(value) {
        var num = parseFloat(value);
        if (!isFinite(num)) return value;
        return Math.round(num).toLocaleString();
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

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
