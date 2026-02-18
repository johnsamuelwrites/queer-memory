/* ============================================================
   Queer Memory - City Profile
   Loads a city profile by QID from the query string.
   Depends on: wikidata.js (QM.wikidata)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';
    var HYBRID_THUMB_LIMIT = 9;

    var MEMORY_TYPES = [
        'Q2945640',
        'Q134499285',
        'Q118108259',
        'Q61710650',
        'Q64364539',
        'Q61710689',
        'Q62128088',
        'Q136703445',
        'Q29469577'
    ];

    var ORG_TYPES = [
        'Q2945640',
        'Q64606659',
        'Q6458277',
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

    var LGBT_PLACE_TYPES = [
        'Q1531507',
        'Q2945640',
        'Q6458286',
        'Q51167626',
        'Q61696039',
        'Q105321449',
        'Q116025472',
        'Q116167940',
        'Q137682531',
        'Q137682535'
    ];

    function init() {
        var qid = getQid();
        if (!qid) {
            showMissingId();
            return;
        }

        updateTimelineMenuLink(qid);
        renderLinks('city-links', '', qid);
        loadCityHeader(qid);
        loadPlaces(qid);
        loadLgbtPlaces(qid);
        loadOrganizations(qid);
        loadEvents(qid);
        loadPride(qid);
        loadCulture(qid);
        loadPeople(qid);
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
        var msg = wd.el('p', 'qm-error', 'Missing city id. Use city.html?id=Q90');
        main.appendChild(msg);
    }

    function loadCityHeader(qid) {
        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?countryLabel ?population ?article WHERE {',
            '  VALUES ?item { wd:' + qid + ' }',
            '  OPTIONAL { ?item wdt:P17 ?country . }',
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
                    renderLinks('city-links', '', qid);
                    return;
                }

                setText('city-name', wd.val(b, 'itemLabel'));
                setText('city-breadcrumb', wd.val(b, 'itemLabel'));
                setText('city-desc', wd.val(b, 'itemDescription') || 'Queer history, culture, and activism.');

                var country = wd.val(b, 'countryLabel');
                setText('city-country', country || 'Country unknown');

                var popVal = wd.val(b, 'population');
                var popText = popVal ? formatNumber(popVal) + ' population' : 'Population unknown';
                setText('city-population', popText);

                updateTimelineMenuLink(qid);
                renderLinks('city-links', wd.val(b, 'article'), qid);
            })
            .catch(function (err) {
                console.error('Failed to load city header:', err);
                renderLinks('city-links', '', qid);
            });
    }

    function loadPlaces(qid) {
        var container = document.getElementById('city-places-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?image ?article WHERE {',
            '  VALUES ?type { ' + MEMORY_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  { ?item wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P276 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P131/wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P276/wdt:P131 wd:' + qid + ' }',
            '  FILTER NOT EXISTS {',
            '    VALUES ?lgbtType { ' + LGBT_PLACE_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '    ?item wdt:P31 ?lgbtType .',
            '  }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
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
        var container = document.getElementById('city-orgs-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?image ?article WHERE {',
            '  VALUES ?type { ' + ORG_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  { ?item wdt:P159 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P159/wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P131/wdt:P131 wd:' + qid + ' }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
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

    function loadLgbtPlaces(qid) {
        var container = document.getElementById('city-lgbt-places-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?type ?typeLabel ?image ?article WHERE {',
            '  VALUES ?type { ' + LGBT_PLACE_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  { ?item wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P276 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P131/wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P276/wdt:P131 wd:' + qid + ' }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?itemLabel',
            'LIMIT 300'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderCards(container, bindings, 'item');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load LGBT places:', err);
                wd.showError(container, 'Could not load LGBT places.');
            });
    }

    function loadEvents(qid) {
        var container = document.getElementById('city-events-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?image ?article WHERE {',
            '  VALUES ?type { ' + EVENT_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  { ?item wdt:P276 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P276/wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P131/wdt:P131 wd:' + qid + ' }',
            '  OPTIONAL { ?item wdt:P585 ?date . }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
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
        var container = document.getElementById('city-pride-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?image ?article WHERE {',
            '  ?item wdt:P31/wdt:P279* wd:' + PRIDE_TYPE + ' .',
            '  { ?item wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P276 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P131/wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P276/wdt:P131 wd:' + qid + ' }',
            '  OPTIONAL { ?item wdt:P585 ?date . }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
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
        var container = document.getElementById('city-culture-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?date ?image ?article WHERE {',
            '  VALUES ?type { ' + CULTURE_TYPES.map(function (q) { return 'wd:' + q; }).join(' ') + ' }',
            '  ?item wdt:P31 ?type .',
            '  { ?item wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P276 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P131/wdt:P131 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P276/wdt:P131 wd:' + qid + ' }',
            '  OPTIONAL { ?item wdt:P577 ?pubDate . }',
            '  OPTIONAL { ?item wdt:P571 ?startDate . }',
            '  BIND(COALESCE(?pubDate, ?startDate) AS ?date)',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
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

    function loadPeople(qid) {
        var container = document.getElementById('city-people-list');
        if (!container) return;
        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?dob ?image ?article WHERE {',
            '  ?item wdt:P31 wd:Q5 ;',
            '        wdt:P91 ?orient ;',
            '        wdt:P19 ?birthplace .',
            '  FILTER(?orient != wd:Q1035954)',
            '  { ?item wdt:P19 wd:' + qid + ' }',
            '  UNION',
            '  { ?item wdt:P19/wdt:P131 wd:' + qid + ' }',
            '  OPTIONAL { ?item wdt:P569 ?dob . }',
            '  OPTIONAL { ?item wdt:P18 ?image . }',
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
                renderCards(container, bindings, 'item', 'dob');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load people:', err);
                wd.showError(container, 'Could not load people data.');
            });
    }

    function loadDataNote(qid) {
        var container = document.getElementById('city-data-note');
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
        unique.sort(function (a, b) {
            var aHasImage = wd.val(a, 'image') ? 1 : 0;
            var bHasImage = wd.val(b, 'image') ? 1 : 0;
            return bHasImage - aHasImage;
        });

        var thumbBudget = HYBRID_THUMB_LIMIT;
        unique.forEach(function (b) {
            var imgUrl = wd.val(b, 'image');
            var useThumb = !!imgUrl && thumbBudget > 0;
            if (useThumb) thumbBudget -= 1;

            var cardClass = useThumb ? 'history-card card history-card--thumb' : 'history-card card';
            var card = wd.el('article', cardClass);
            var label = wd.val(b, key + 'Label');
            var desc = wd.val(b, key + 'Description');
            var typeLabel = wd.val(b, 'typeLabel');
            var date = dateKey ? formatYear(wd.val(b, dateKey)) : '';
            var qid = wd.qid(b, key);

            if (useThumb) {
                var imgWrap = wd.el('div', 'history-card__thumb');
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 360);
                img.alt = '';
                img.loading = 'lazy';
                imgWrap.appendChild(img);
                card.appendChild(imgWrap);
            }

            card.appendChild(wd.el('h3', 'history-card__title', label));

            if (date) {
                card.appendChild(wd.el('span', 'history-card__meta', date));
            }

            if (typeLabel) {
                card.appendChild(wd.el('span', 'history-card__tag', typeLabel));
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

        var name = (document.getElementById('city-name') || {}).textContent || qid;
        var currentLang = i18n ? i18n.getLang() : '';
        var timelineLink = document.createElement('a');
        timelineLink.href = './timeline.html?city=' + encodeURIComponent(qid) +
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
        var name = (document.getElementById('city-name') || {}).textContent || qid;
        anchor.href = './timeline.html?city=' + encodeURIComponent(qid) +
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
