/* ============================================================
   Queer Memory - Activism & Movements
   Fetches and renders LGBTQIA+ activism data from Wikidata.
   Depends on: wikidata.js (QM.wikidata)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';
    var HYBRID_THUMB_LIMIT = 9;

    /* ----------------------------------------------------------
       Configuration - model QIDs (WikiProject LGBT)
       ---------------------------------------------------------- */

    var MOVEMENT_TOPICS = [
        {
            qid: 'Q130283248',
            label: 'LGBT movement in a geographic area',
            desc: 'Regional movement histories and organizing efforts.'
        },
        {
            qid: 'Q130285134',
            label: 'LGBT pride in a geographic region',
            desc: 'Pride histories by region, including festivals and celebrations.'
        }
    ];


    /* ----------------------------------------------------------
       Page initialisation
       ---------------------------------------------------------- */

    function init() {
        loadMovements();
        loadProtests();
        loadPride();
        loadPeopleActivists();
        loadOrganizations();
    }


    /* ----------------------------------------------------------
       Section 1: Movements & pride
       ---------------------------------------------------------- */

    function loadMovements() {
        var container = document.getElementById('activism-movements-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);
        var topicQids = MOVEMENT_TOPICS.map(function (t) { return t.qid; });

        var sparql = [
            'SELECT ?topic ?topicLabel (COUNT(DISTINCT ?item) AS ?count) WHERE {',
            '  ' + wd.valuesClause('?topic', topicQids),
            '  ?item wdt:P31 ?topic .',
            '  ' + wd.labelService(),
            '}',
            'GROUP BY ?topic ?topicLabel',
            'ORDER BY DESC(?count)'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderMovementTopics(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load movement topics:', err);
                wd.showError(container, 'Could not load movement data from Wikidata.');
            });
    }

    function renderMovementTopics(container, bindings) {
        var countMap = {};
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'topic');
            countMap[id] = parseInt(wd.val(b, 'count'), 10) || 0;
        });

        MOVEMENT_TOPICS.forEach(function (topic) {
            var card = wd.el('article', 'history-card card');
            var count = countMap[topic.qid] || 0;
            var countStr = count > 0
                ? count + ' ' + (count === 1 ? 'entry' : 'entries')
                : (i18n ? i18n.t('empty.noData') : 'No data yet');

            card.appendChild(wd.el('h3', 'history-card__title', topic.label));
            card.appendChild(wd.el('p', 'history-card__desc', topic.desc));
            card.appendChild(wd.el('span', 'history-card__count', countStr));

            var links = wd.el('div', 'history-card__links');
            var link = document.createElement('a');
            link.href = wd.entityUrl(topic.qid);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = i18n ? i18n.t('link.wikidataClass') : 'Wikidata class';
            link.className = 'identity-card__link';
            links.appendChild(link);
            card.appendChild(links);

            container.appendChild(card);
        });
    }


    /* ----------------------------------------------------------
       Section 2: Protests & campaigns
       Instances of LGBT+ protest (Q125506609)
       ---------------------------------------------------------- */

    function loadProtests() {
        var container = document.getElementById('activism-protests-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?event ?eventLabel ?eventDescription ?country ?countryLabel ?date ?image ?article WHERE {',
            '  ?event wdt:P31 wd:Q125506609 .',
            '  OPTIONAL { ?event wdt:P17 ?country . }',
            '  OPTIONAL { ?event wdt:P585 ?date . }',
            '  OPTIONAL { ?event wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?event ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY DESC(?date)',
            'LIMIT 24'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderEventCards(container, bindings, 'event');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load protests:', err);
                wd.showError(container, 'Could not load protests from Wikidata.');
            });
    }

    /* ----------------------------------------------------------
       Section 3: Pride & festivals
       Instances of LGBT pride in a geographic region (Q130285134)
       ---------------------------------------------------------- */

    function loadPride() {
        var container = document.getElementById('activism-pride-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?event ?eventLabel ?eventDescription ?country ?countryLabel ?date ?image ?article WHERE {',
            '  ?event wdt:P31 wd:Q51404 .',
            '  OPTIONAL { ?event wdt:P17 ?country . }',
            '  OPTIONAL { ?event wdt:P585 ?date . }',
            '  OPTIONAL { ?event wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?event ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY DESC(?date)',
            'LIMIT 24'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderEventCards(container, bindings, 'event');
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load pride events:', err);
                wd.showError(container, 'Could not load pride events from Wikidata.');
            });
    }


    /* ----------------------------------------------------------
       Section 3: Activists & organizers
       People with occupation LGBT rights activist (Q19509201)
       ---------------------------------------------------------- */

    function loadPeopleActivists() {
        var container = document.getElementById('activism-people-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?person ?personLabel ?personDescription ?image ?article ?dob ?dod WHERE {',
            '  ?person wdt:P31 wd:Q5 ;',
            '          wdt:P106 wd:Q19509201 .',
            '  OPTIONAL { ?person wdt:P18 ?image . }',
            '  OPTIONAL { ?person wdt:P569 ?dob . }',
            '  OPTIONAL { ?person wdt:P570 ?dod . }',
            '  OPTIONAL {',
            '    ?article schema:about ?person ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?personLabel',
            'LIMIT 24'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderPeopleCards(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load activists:', err);
                wd.showError(container, 'Could not load activists from Wikidata.');
            });
    }


    /* ----------------------------------------------------------
       Section 4: Organizations & networks
     ---------------------------------------------------------- */

    function loadOrganizations() {
        var container = document.getElementById('activism-orgs-grid');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var orgTypes = ['Q64606659', 'Q6458277'];

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?type ?typeLabel ?country ?countryLabel ?image ?article WHERE {',
            '  ' + wd.valuesClause('?type', orgTypes),
            '  ?item wdt:P31 ?type .',
            '  OPTIONAL { ?item wdt:P17 ?country . }',
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
                renderOrganizationCards(container, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load organizations:', err);
                wd.showError(container, 'Could not load organizations from Wikidata.');
            });
    }


    /* ----------------------------------------------------------
       Shared render helpers
       ---------------------------------------------------------- */

    function renderEventCards(container, bindings, itemKey) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', i18n ? i18n.t('empty.noResults') : 'No events found.'));
            return;
        }

        var seen = {};
        var unique = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, itemKey);
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
            var itemQid = wd.qid(b, itemKey);
            if (useThumb) {
                var imgWrap = wd.el('div', 'history-card__thumb');
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 360);
                img.alt = '';
                img.loading = 'lazy';
                imgWrap.appendChild(img);
                card.appendChild(imgWrap);
            }
            var title = wd.el('h3', 'history-card__title', wd.val(b, itemKey + 'Label'));
            card.appendChild(title);

            var country = wd.val(b, 'countryLabel');
            var date = formatYear(wd.val(b, 'date'));
            var meta = [country, date].filter(Boolean).join(' • ');
            if (meta) {
                card.appendChild(wd.el('span', 'history-card__meta', meta));
            }

            var desc = wd.val(b, itemKey + 'Description');
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

    function renderPeopleCards(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', i18n ? i18n.t('empty.noPeople') : 'No people found.'));
            return;
        }

        var seen = {};
        var unique = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'person');
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

        unique.forEach(function (b) {
            var card = wd.el('article', 'history-person-card card');
            var personQid = wd.qid(b, 'person');

            var imgUrl = wd.val(b, 'image');
            if (imgUrl) {
                var imgWrap = wd.el('div', 'history-person-card__image');
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 320);
                img.alt = '';
                img.loading = 'lazy';
                imgWrap.appendChild(img);
                card.appendChild(imgWrap);
            }

            card.appendChild(wd.el('h3', 'history-card__title', wd.val(b, 'personLabel')));

            var dates = formatDates(wd.val(b, 'dob'), wd.val(b, 'dod'));
            if (dates) {
                card.appendChild(wd.el('span', 'history-card__meta', dates));
            }

            var desc = wd.val(b, 'personDescription');
            if (desc) {
                card.appendChild(wd.el('p', 'history-card__desc', desc));
            }

            var links = wd.el('div', 'history-card__links');
            var articleUrl = wd.val(b, 'article');
            var link = document.createElement('a');
            link.href = articleUrl || wd.entityUrl(personQid);
            link.target = '_blank';
            link.rel = 'noopener';
            link.textContent = articleUrl ? (i18n ? i18n.t('link.wikipedia') : 'Wikipedia') : (i18n ? i18n.t('link.wikidata') : 'Wikidata');
            link.className = 'identity-card__link';
            links.appendChild(link);
            card.appendChild(links);

            container.appendChild(card);
        });
    }

    function renderOrganizationCards(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', 'No organizations found.'));
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
            var itemQid = wd.qid(b, 'item');
            var label = wd.val(b, 'itemLabel');
            var typeLabel = wd.val(b, 'typeLabel');
            var countryLabel = wd.val(b, 'countryLabel');

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

            if (countryLabel) {
                card.appendChild(wd.el('span', 'history-card__meta', countryLabel));
            }

            if (typeLabel) {
                card.appendChild(wd.el('span', 'history-card__tag', typeLabel));
            }

            var desc = wd.val(b, 'itemDescription');
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

    function formatDates(dob, dod) {
        if (!dob) return '';
        var start = formatYear(dob);
        if (!start) return '';
        if (dod) return start + ' - ' + formatYear(dod);
        return start;
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
