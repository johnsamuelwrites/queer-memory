/* ============================================================
   Queer Memory — Memorial / In Memoriam
   Queries Wikidata for people lost to the AIDS crisis,
   victims of anti-LGBTQ+ violence, and regional persecution data.
   Depends on: wikidata.js (QM.wikidata), i18n.js (QM.i18n)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

    /* ----------------------------------------------------------
       Bootstrap
       ---------------------------------------------------------- */
    function init() {
        setupWarning();
        loadAidsCrisis();
        loadViolenceVictims();
        loadPersecutionByRegion();
    }

    /* ----------------------------------------------------------
       Content warning
       ---------------------------------------------------------- */
    function setupWarning() {
        var banner = document.getElementById('memorial-warning');
        var btn = document.getElementById('warning-dismiss');
        if (!banner || !btn) return;

        /* If already dismissed this session, hide immediately */
        if (sessionStorage.getItem('qm-memorial-warned')) {
            banner.hidden = true;
            return;
        }

        btn.addEventListener('click', function () {
            banner.hidden = true;
            sessionStorage.setItem('qm-memorial-warned', '1');
        });
    }

    /* ----------------------------------------------------------
       Section 1: Lost to the AIDS Crisis
       People with P509 (cause of death) = Q12199 (AIDS)
       who also have P91 (sexual orientation) or occupation
       P106 = Q19509201 (LGBTQ rights activist)
       ---------------------------------------------------------- */
    function loadAidsCrisis() {
        var container = document.getElementById('memorial-aids');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT DISTINCT ?person ?personLabel ?personDescription ?dob ?dod ?image ?article WHERE {',
            '  ?person wdt:P31 wd:Q5 ;',
            '          wdt:P509 wd:Q12199 .',
            '  { ?person wdt:P91 ?orient . }',
            '  UNION',
            '  { ?person wdt:P106 wd:Q19509201 . }',
            '  OPTIONAL { ?person wdt:P569 ?dob . }',
            '  OPTIONAL { ?person wdt:P570 ?dod . }',
            '  OPTIONAL { ?person wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?person ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?dod',
            'LIMIT 60'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderPersonGrid(container, bindings, 'person',
                    i18n ? i18n.t('memorial.noAids') : 'No records found.');
            })
            .catch(function () {
                doneLoading();
                wd.showError(container,
                    i18n ? i18n.t('memorial.errorAids') : 'Could not load AIDS memorial data.');
            });
    }

    /* ----------------------------------------------------------
       Section 2: Victims of Violence
       People with P91 + P1196 (manner of death) = Q149086 (homicide)
       ---------------------------------------------------------- */
    function loadViolenceVictims() {
        var container = document.getElementById('memorial-violence');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT DISTINCT ?person ?personLabel ?personDescription ?dob ?dod ?image ?article WHERE {',
            '  ?person wdt:P31 wd:Q5 ;',
            '          wdt:P91 ?orient ;',
            '          wdt:P1196 wd:Q149086 .',
            '  OPTIONAL { ?person wdt:P569 ?dob . }',
            '  OPTIONAL { ?person wdt:P570 ?dod . }',
            '  OPTIONAL { ?person wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?person ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?dod',
            'LIMIT 60'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderPersonGrid(container, bindings, 'person',
                    i18n ? i18n.t('memorial.noViolence') : 'No records found.');
            })
            .catch(function () {
                doneLoading();
                wd.showError(container,
                    i18n ? i18n.t('memorial.errorViolence') : 'Could not load violence memorial data.');
            });
    }

    /* ----------------------------------------------------------
       Section 3: Persecution by Region
       Instances of Q130297534 (violence against LGBT people
       in a geographical region)
       ---------------------------------------------------------- */
    function loadPersecutionByRegion() {
        var container = document.getElementById('memorial-persecution');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?item ?itemLabel ?itemDescription ?article WHERE {',
            '  ?item wdt:P31 wd:Q130297534 .',
            '  OPTIONAL {',
            '    ?article schema:about ?item ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?itemLabel',
            'LIMIT 80'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderRegionList(container, bindings);
            })
            .catch(function () {
                doneLoading();
                wd.showError(container,
                    i18n ? i18n.t('memorial.errorPersecution') : 'Could not load persecution data.');
            });
    }

    /* ----------------------------------------------------------
       Rendering: Person memorial grid
       ---------------------------------------------------------- */
    function renderPersonGrid(container, bindings, personVar, emptyMsg) {
        /* Deduplicate */
        var seen = {};
        var people = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, personVar);
            if (!seen[id]) { seen[id] = true; people.push(b); }
        });

        if (!people.length) {
            container.appendChild(wd.el('p', 'qm-empty', emptyMsg));
            return;
        }

        var grid = wd.el('div', 'memorial-grid');

        people.forEach(function (b) {
            var card = wd.el('a', 'memorial-person-card');
            var articleUrl = wd.val(b, 'article');
            card.href = articleUrl || wd.entityUrl(wd.qid(b, personVar));
            card.target = '_blank';
            card.rel = 'noopener';

            /* Photo */
            var imgUrl = wd.val(b, 'image');
            if (imgUrl) {
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 120);
                img.alt = '';
                img.loading = 'lazy';
                img.className = 'memorial-person-card__photo';
                card.appendChild(img);
            } else {
                card.appendChild(wd.el('div', 'memorial-person-card__photo memorial-person-card__photo--empty'));
            }

            /* Info */
            var info = wd.el('div', 'memorial-person-card__info');
            info.appendChild(wd.el('span', 'memorial-person-card__name', wd.val(b, personVar + 'Label')));

            var dob = wd.val(b, 'dob');
            var dod = wd.val(b, 'dod');
            var dates = formatYear(dob);
            if (dod) dates += '\u2013' + formatYear(dod);
            if (dates) info.appendChild(wd.el('span', 'memorial-person-card__dates', dates));

            var desc = wd.val(b, personVar + 'Description');
            if (desc) info.appendChild(wd.el('span', 'memorial-person-card__desc', desc));

            card.appendChild(info);
            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    /* ----------------------------------------------------------
       Rendering: Persecution-by-region list
       ---------------------------------------------------------- */
    function renderRegionList(container, bindings) {
        var seen = {};
        var items = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'item');
            if (!seen[id]) { seen[id] = true; items.push(b); }
        });

        if (!items.length) {
            container.appendChild(wd.el('p', 'qm-empty',
                i18n ? i18n.t('memorial.noPersecution') : 'No records found.'));
            return;
        }

        var grid = wd.el('div', 'memorial-region-grid');

        items.forEach(function (b) {
            var card = wd.el('a', 'memorial-region-card');
            var articleUrl = wd.val(b, 'article');
            card.href = articleUrl || wd.entityUrl(wd.qid(b, 'item'));
            card.target = '_blank';
            card.rel = 'noopener';

            card.appendChild(wd.el('h3', 'memorial-region-card__title', wd.val(b, 'itemLabel')));

            var desc = wd.val(b, 'itemDescription');
            if (desc) {
                card.appendChild(wd.el('p', 'memorial-region-card__desc', desc));
            }

            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    /* ----------------------------------------------------------
       Helpers
       ---------------------------------------------------------- */
    function formatYear(isoDate) {
        if (!isoDate) return '';
        var match = isoDate.match(/^(-?\d{1,4})/);
        if (match) {
            var year = parseInt(match[1], 10);
            if (year < 0) return Math.abs(year) + ' BCE';
            return String(year);
        }
        return isoDate.substring(0, 4);
    }

    /* ----------------------------------------------------------
       Start
       ---------------------------------------------------------- */
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
