/* ============================================================
   Queer Memory — Homepage
   Live Wikidata-powered stats, featured content, and discovery.
   Depends on: wikidata.js (QM.wikidata)
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
        loadLiveStats();
        loadOnThisDay();
        loadFeaturedTimeline();
        loadDiscoverPeople();
        loadRecentPrideEvents();
        loadFlagStrip();
    }

    /* ----------------------------------------------------------
       Section: Live statistics from Wikidata
       Six counters showing the breadth of data available.
       ---------------------------------------------------------- */
    function loadLiveStats() {
        var container = document.getElementById('home-stats');
        if (!container) return;

        /* Each stat: a SPARQL count query + display info */
        var stats = [
            {
                id: 'stat-countries',
                label: i18n ? i18n.t('home.stat.countries') : 'Countries & Territories',
                icon: '\uD83C\uDF0D',
                sparql: 'SELECT (COUNT(DISTINCT ?item) AS ?count) WHERE { ?item wdt:P31 wd:Q17898 . }'
            },
            {
                id: 'stat-people',
                label: i18n ? i18n.t('home.stat.people') : 'Notable People',
                icon: '\uD83D\uDC65',
                sparql: 'SELECT (COUNT(DISTINCT ?p) AS ?count) WHERE { ?p wdt:P31 wd:Q5 ; wdt:P91 ?o . }'
            },
            {
                id: 'stat-pride',
                label: i18n ? i18n.t('home.stat.pride') : 'Pride Events',
                icon: '\uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08',
                sparql: 'SELECT (COUNT(DISTINCT ?item) AS ?count) WHERE { ?item wdt:P31 wd:Q51404 . }'
            },
            {
                id: 'stat-orgs',
                label: i18n ? i18n.t('home.stat.orgs') : 'Organizations',
                icon: '\uD83C\uDFE2',
                sparql: 'SELECT (COUNT(DISTINCT ?item) AS ?count) WHERE { VALUES ?type { wd:Q64606659 wd:Q6458277 } ?item wdt:P31 ?type . }'
            },
            {
                id: 'stat-places',
                label: i18n ? i18n.t('home.stat.places') : 'Places & Venues',
                icon: '\uD83D\uDCCD',
                sparql: 'SELECT (COUNT(DISTINCT ?item) AS ?count) WHERE { VALUES ?type { wd:Q2945640 wd:Q61710650 wd:Q105321449 wd:Q1043639 wd:Q29469577 wd:Q62128088 wd:Q61710689 } ?item wdt:P31 ?type . }'
            },
            {
                id: 'stat-films',
                label: i18n ? i18n.t('home.stat.films') : 'Films & TV Shows',
                icon: '\uD83C\uDFAC',
                sparql: 'SELECT (COUNT(DISTINCT ?item) AS ?count) WHERE { VALUES ?type { wd:Q20442589 wd:Q85133165 } ?item wdt:P136 ?type . }'
            }
        ];

        /* Render skeleton stat cards immediately */
        stats.forEach(function (s) {
            var card = wd.el('div', 'home-stat-card');
            card.id = s.id;

            var icon = wd.el('span', 'home-stat-card__icon', s.icon);
            icon.setAttribute('aria-hidden', 'true');
            card.appendChild(icon);

            var number = wd.el('span', 'home-stat-card__number', '\u2014');
            number.id = s.id + '-num';
            card.appendChild(number);

            card.appendChild(wd.el('span', 'home-stat-card__label', s.label));
            container.appendChild(card);
        });

        /* Fire all count queries in parallel */
        stats.forEach(function (s) {
            wd.query(s.sparql)
                .then(function (bindings) {
                    var count = bindings.length > 0 ? parseInt(wd.val(bindings[0], 'count'), 10) : 0;
                    var el = document.getElementById(s.id + '-num');
                    if (el) {
                        animateCount(el, count);
                    }
                })
                .catch(function () {
                    var el = document.getElementById(s.id + '-num');
                    if (el) el.textContent = '?';
                });
        });
    }

    /** Simple count-up animation */
    function animateCount(el, target) {
        if (target === 0) { el.textContent = '0'; return; }
        var duration = 1200;
        var start = performance.now();
        function step(now) {
            var progress = Math.min((now - start) / duration, 1);
            /* ease-out cubic */
            var eased = 1 - Math.pow(1 - progress, 3);
            var current = Math.round(eased * target);
            el.textContent = current.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    /* ----------------------------------------------------------
       Section: On This Day
       People born or who died on today's date.
       ---------------------------------------------------------- */
    function loadOnThisDay() {
        var container = document.getElementById('on-this-day');
        if (!container) return;

        var doneLoading = wd.showLoading(container);
        var now = new Date();
        var month = now.getMonth() + 1;
        var day = now.getDate();

        var sparql = [
            'SELECT ?person ?personLabel ?personDescription ?dob ?dod ?image ?article WHERE {',
            '  ?person wdt:P31 wd:Q5 ;',
            '          wdt:P91 ?orient .',
            '  { ?person wdt:P569 ?dob . FILTER(MONTH(?dob) = ' + month + ' && DAY(?dob) = ' + day + ') }',
            '  UNION',
            '  { ?person wdt:P570 ?dod . FILTER(MONTH(?dod) = ' + month + ' && DAY(?dod) = ' + day + ') }',
            '  OPTIONAL { ?person wdt:P569 ?dob . }',
            '  OPTIONAL { ?person wdt:P570 ?dod . }',
            '  OPTIONAL { ?person wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?person ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'LIMIT 30'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderOnThisDay(container, bindings, month, day);
            })
            .catch(function () {
                doneLoading();
                wd.showError(container, i18n ? i18n.t('home.errorOnThisDay') : 'Could not load On This Day data.');
            });
    }

    function renderOnThisDay(container, bindings, month, day) {
        /* Deduplicate */
        var seen = {};
        var people = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'person');
            if (!seen[id]) { seen[id] = true; people.push(b); }
        });

        if (!people.length) {
            container.appendChild(wd.el('p', 'qm-empty', i18n ? i18n.t('home.noOnThisDay') : 'No events found for today.'));
            return;
        }

        /* Classify: born today vs died today */
        var bornToday = [];
        var diedToday = [];
        people.forEach(function (b) {
            var dob = wd.val(b, 'dob');
            var dod = wd.val(b, 'dod');
            var dobMatch = dob && matchesDate(dob, month, day);
            var dodMatch = dod && matchesDate(dod, month, day);
            if (dobMatch) bornToday.push(b);
            if (dodMatch) diedToday.push(b);
        });

        var list = wd.el('div', 'otd-list');

        /* Born today */
        bornToday.slice(0, 8).forEach(function (b) {
            list.appendChild(renderOtdCard(b, 'born'));
        });

        /* Died today */
        diedToday.slice(0, 8).forEach(function (b) {
            list.appendChild(renderOtdCard(b, 'died'));
        });

        container.appendChild(list);
    }

    function renderOtdCard(b, type) {
        var card = wd.el('a', 'otd-card');
        var articleUrl = wd.val(b, 'article');
        card.href = articleUrl || wd.entityUrl(wd.qid(b, 'person'));
        card.target = '_blank';
        card.rel = 'noopener';

        var imgUrl = wd.val(b, 'image');
        if (imgUrl) {
            var img = document.createElement('img');
            img.src = wd.thumb(imgUrl, 120);
            img.alt = '';
            img.loading = 'lazy';
            img.className = 'otd-card__photo';
            card.appendChild(img);
        } else {
            card.appendChild(wd.el('div', 'otd-card__photo otd-card__photo--empty'));
        }

        var info = wd.el('div', 'otd-card__info');
        info.appendChild(wd.el('span', 'otd-card__name', wd.val(b, 'personLabel')));

        var dob = wd.val(b, 'dob');
        var dod = wd.val(b, 'dod');
        var dateStr = formatYear(dob);
        if (dod) dateStr += '\u2013' + formatYear(dod);
        if (dateStr) info.appendChild(wd.el('span', 'otd-card__dates', dateStr));

        var badgeLabel = type === 'born'
            ? (i18n ? i18n.t('home.born') : 'Born')
            : (i18n ? i18n.t('home.died') : 'Died');
        var badge = wd.el('span', 'otd-card__badge otd-card__badge--' + type, badgeLabel);
        info.appendChild(badge);

        var desc = wd.val(b, 'personDescription');
        if (desc) info.appendChild(wd.el('span', 'otd-card__desc', desc));

        card.appendChild(info);
        return card;
    }

    function matchesDate(isoDate, month, day) {
        var d = new Date(isoDate);
        return (d.getMonth() + 1) === month && d.getDate() === day;
    }

    /* ----------------------------------------------------------
       Section: Featured — This month in queer history
       Fetch notable people born/died in the current month.
       ---------------------------------------------------------- */
    function loadFeaturedTimeline() {
        var container = document.getElementById('featured-timeline');
        if (!container) return;

        var doneLoading = wd.showLoading(container);
        var now = new Date();
        var month = String(now.getMonth() + 1).padStart(2, '0');

        var sparql = [
            'SELECT ?person ?personLabel ?personDescription ?dob ?dod ?image ?article WHERE {',
            '  ?person wdt:P31 wd:Q5 ;',
            '          wdt:P91 ?orient ;',
            '          wdt:P569 ?dob .',
            '  FILTER(MONTH(?dob) = ' + parseInt(month, 10) + ')',
            '  OPTIONAL { ?person wdt:P570 ?dod . }',
            '  OPTIONAL { ?person wdt:P18 ?image . }',
            '  OPTIONAL {',
            '    ?article schema:about ?person ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY ?dob',
            'LIMIT 30'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderFeaturedTimeline(container, bindings, now);
            })
            .catch(function () {
                doneLoading();
                wd.showError(container, i18n ? i18n.t('home.errorTimeline') : 'Could not load featured timeline.');
            });
    }

    function renderFeaturedTimeline(container, bindings, now) {
        /* Deduplicate */
        var seen = {};
        var people = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'person');
            if (!seen[id]) { seen[id] = true; people.push(b); }
        });

        if (!people.length) {
            container.appendChild(wd.el('p', 'qm-empty', i18n ? i18n.t('home.noFeatured') : 'No featured people found for this month.'));
            return;
        }

        /* Pick up to 6 with images, or pad without */
        var withImg = people.filter(function (b) { return wd.val(b, 'image'); });
        var show = withImg.length >= 6 ? withImg.slice(0, 6) : people.slice(0, 6);

        var monthName = i18n ? i18n.t('month.' + now.getMonth()) : ['January','February','March','April','May','June','July','August','September','October','November','December'][now.getMonth()];

        var heading = wd.el('p', 'featured-month-label',
            (i18n ? i18n.t('home.bornIn') : 'Born in') + ' ' + monthName);
        container.appendChild(heading);

        var grid = wd.el('div', 'featured-people-grid');

        show.forEach(function (b) {
            var card = wd.el('a', 'featured-person-card');
            var articleUrl = wd.val(b, 'article');
            card.href = articleUrl || wd.entityUrl(wd.qid(b, 'person'));
            card.target = '_blank';
            card.rel = 'noopener';

            var imgUrl = wd.val(b, 'image');
            if (imgUrl) {
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 200);
                img.alt = '';
                img.loading = 'lazy';
                img.className = 'featured-person-card__photo';
                card.appendChild(img);
            } else {
                var placeholder = wd.el('div', 'featured-person-card__photo featured-person-card__photo--empty');
                card.appendChild(placeholder);
            }

            card.appendChild(wd.el('span', 'featured-person-card__name', wd.val(b, 'personLabel')));

            var dob = wd.val(b, 'dob');
            var dod = wd.val(b, 'dod');
            var dateStr = formatYear(dob);
            if (dod) dateStr += '\u2013' + formatYear(dod);
            card.appendChild(wd.el('span', 'featured-person-card__dates', dateStr));

            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    /* ----------------------------------------------------------
       Section: Discover — random notable LGBT people
       ---------------------------------------------------------- */
    function loadDiscoverPeople() {
        var container = document.getElementById('discovery-strip');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        /* Fetch a set of notable people with images, using a hash-based pseudo-random
           sort that changes daily so the strip feels fresh */
        var dayHash = Math.floor(Date.now() / 86400000);
        var sparql = [
            'SELECT ?person ?personLabel ?personDescription ?image ?article WHERE {',
            '  ?person wdt:P31 wd:Q5 ;',
            '          wdt:P91 ?orient ;',
            '          wdt:P18 ?image .',
            '  OPTIONAL {',
            '    ?article schema:about ?person ;',
            '            schema:isPartOf <' + wikiUrl + '> .',
            '  }',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY MD5(CONCAT(STR(?person), "' + dayHash + '"))',
            'LIMIT 12'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderDiscoverStrip(container, bindings);
            })
            .catch(function () {
                doneLoading();
                wd.showError(container, i18n ? i18n.t('home.errorDiscover') : 'Could not load discoveries.');
            });
    }

    function renderDiscoverStrip(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', i18n ? i18n.t('home.noDiscoveries') : 'No discoveries available.'));
            return;
        }

        /* Deduplicate */
        var seen = {};
        var items = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'person');
            if (!seen[id]) { seen[id] = true; items.push(b); }
        });

        /* Show up to 6 people in a grid (same layout as featured timeline) */
        var show = items.slice(0, 6);

        var grid = wd.el('div', 'discover-grid');

        show.forEach(function (b) {
            var card = wd.el('a', 'discover-card');
            var articleUrl = wd.val(b, 'article');
            card.href = articleUrl || wd.entityUrl(wd.qid(b, 'person'));
            card.target = '_blank';
            card.rel = 'noopener';

            var imgUrl = wd.val(b, 'image');
            if (imgUrl) {
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 200);
                img.alt = '';
                img.loading = 'lazy';
                img.className = 'discover-card__photo';
                card.appendChild(img);
            } else {
                var placeholder = wd.el('div', 'discover-card__photo discover-card__photo--empty');
                card.appendChild(placeholder);
            }

            card.appendChild(wd.el('span', 'discover-card__name', wd.val(b, 'personLabel')));

            var desc = wd.val(b, 'personDescription');
            if (desc) {
                card.appendChild(wd.el('span', 'discover-card__desc', desc));
            }

            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    /* ----------------------------------------------------------
       Section: Recent Pride events worldwide
       ---------------------------------------------------------- */
    function loadRecentPrideEvents() {
        var container = document.getElementById('home-pride');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?event ?eventLabel ?date ?country ?countryLabel ?image ?participants WHERE {',
            '  ?event wdt:P31/wdt:P279* wd:Q51404 ;',
            '         wdt:P585 ?date .',
            '  OPTIONAL { ?event wdt:P17 ?country . }',
            '  OPTIONAL { ?event wdt:P18 ?image . }',
            '  OPTIONAL { ?event wdt:P1132 ?participants . }',
            '  FILTER(YEAR(?date) >= 2020)',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY DESC(?date)',
            'LIMIT 10'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderPrideEvents(container, bindings);
            })
            .catch(function () {
                doneLoading();
                wd.showError(container, i18n ? i18n.t('home.errorPride') : 'Could not load pride events.');
            });
    }

    function renderPrideEvents(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', i18n ? i18n.t('home.noPrideEvents') : 'No recent pride events found.'));
            return;
        }

        var seen = {};
        var events = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'event');
            if (!seen[id]) { seen[id] = true; events.push(b); }
        });

        var grid = wd.el('div', 'pride-events-grid');

        events.forEach(function (b) {
            var card = wd.el('a', 'pride-event-card card');
            card.href = wd.entityUrl(wd.qid(b, 'event'));
            card.target = '_blank';
            card.rel = 'noopener';

            var imgUrl = wd.val(b, 'image');
            if (imgUrl) {
                var imgWrap = wd.el('div', 'pride-event-card__image');
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 400);
                img.alt = '';
                img.loading = 'lazy';
                imgWrap.appendChild(img);
                card.appendChild(imgWrap);
            }

            card.appendChild(wd.el('h3', 'pride-event-card__title', wd.val(b, 'eventLabel')));

            var date = wd.val(b, 'date');
            var country = wd.val(b, 'countryLabel');
            var meta = [];
            if (date) meta.push(formatYear(date));
            if (country) meta.push(country);
            if (meta.length) {
                card.appendChild(wd.el('span', 'pride-event-card__meta', meta.join(' \u00B7 ')));
            }

            var participants = wd.val(b, 'participants');
            if (participants) {
                card.appendChild(wd.el('span', 'pride-event-card__participants',
                    parseInt(participants, 10).toLocaleString() + ' ' + (i18n ? i18n.t('home.participants') : 'participants')));
            }

            grid.appendChild(card);
        });

        container.appendChild(grid);
    }

    /* ----------------------------------------------------------
       Section: Pride flag colour strip
       ---------------------------------------------------------- */
    function loadFlagStrip() {
        var container = document.getElementById('home-flags');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        var sparql = [
            'SELECT ?flag ?flagLabel ?image WHERE {',
            '  ?flag wdt:P279* wd:Q7242811 .',
            '  ?flag wdt:P18 ?image .',
            '  ' + wd.labelService(),
            '}',
            'ORDER BY (?flagLabel)',
            'LIMIT 30'
        ].join('\n');

        wd.query(sparql)
            .then(function (bindings) {
                doneLoading();
                renderFlagStrip(container, bindings);
            })
            .catch(function () {
                doneLoading();
                wd.showError(container, i18n ? i18n.t('home.errorFlags') : 'Could not load pride flags.');
            });
    }

    function renderFlagStrip(container, bindings) {
        if (!bindings.length) return;

        var seen = {};
        var flags = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'flag');
            if (!seen[id]) { seen[id] = true; flags.push(b); }
        });

        var strip = wd.el('div', 'flag-strip');

        flags.forEach(function (b) {
            var card = wd.el('a', 'flag-card');
            card.href = wd.entityUrl(wd.qid(b, 'flag'));
            card.target = '_blank';
            card.rel = 'noopener';
            card.title = wd.val(b, 'flagLabel');

            var img = document.createElement('img');
            img.src = wd.thumb(wd.val(b, 'image'), 160);
            img.alt = wd.val(b, 'flagLabel');
            img.loading = 'lazy';
            card.appendChild(img);

            card.appendChild(wd.el('span', 'flag-card__label', wd.val(b, 'flagLabel')));

            strip.appendChild(card);
        });

        container.appendChild(strip);
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
