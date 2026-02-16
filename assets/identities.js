/* ============================================================
   Queer Memory — Identities Page
   Fetches and renders LGBTQIA+ identity data from Wikidata.
   Depends on: wikidata.js (QM.wikidata)
   ============================================================ */

(function () {
    'use strict';

    var wd = QM.wikidata;
    var i18n = QM.i18n;
    var lang = i18n ? i18n.getLang() : 'en';
    var wikiUrl = i18n ? i18n.wikiUrl() : 'https://en.wikipedia.org/';

    /* ----------------------------------------------------------
       Configuration — curated identity QIDs
       ---------------------------------------------------------- */

    /**
     * Sexual orientations to display.
     * Property P91 links a person to their sexual orientation.
     */
    var ORIENTATIONS = [
        { qid: 'Q6636', label: 'Homosexuality' },
        { qid: 'Q6649', label: 'Lesbianism' },
        { qid: 'Q592', label: 'Gay' },
        { qid: 'Q43200', label: 'Bisexuality' },
        { qid: 'Q271534', label: 'Pansexuality' },
        { qid: 'Q724351', label: 'Asexuality' },
        { qid: 'Q51415', label: 'Queer' },
        { qid: 'Q23912283', label: 'Demisexuality' },
        { qid: 'Q2094204', label: 'Polysexuality' }
    ];

    /**
     * Gender identities to display.
     * Property P21 links a person to their sex or gender.
     */
    var GENDER_IDENTITIES = [
        { qid: 'Q189125', label: 'Transgender' },
        { qid: 'Q48270', label: 'Non-binary' },
        { qid: 'Q1052281', label: 'Trans woman' },
        { qid: 'Q2449503', label: 'Trans man' },
        { qid: 'Q505371', label: 'Agender' },
        { qid: 'Q12964198', label: 'Genderqueer' },
        { qid: 'Q18116794', label: 'Genderfluid' },
        { qid: 'Q1097630', label: 'Intersex' },
        { qid: 'Q301702', label: 'Two-spirit' },
        { qid: 'Q48279', label: 'Third gender' },
        { qid: 'Q1062222', label: 'Travesti' },
        { qid: 'Q7852710', label: 'Tumtum' },
        { qid: 'Q17148251', label: 'Travesti (identity)' },
        { qid: 'Q56388896', label: 'Calabai' },
        { qid: 'Q65212675', label: 'Calalai' },
        { qid: 'Q96000630', label: 'Genre X' },
        { qid: 'Q106647045', label: 'Sekhet' },
        { qid: 'Q2904759', label: 'Bissu' },
        { qid: 'Q3333006', label: 'Mukhannathun' },
        { qid: 'Q4700377', label: "'akava'ine" },
        { qid: 'Q6538491', label: 'Lhamana' },
        { qid: 'Q24886035', label: 'Mudoko dako' },
        { qid: 'Q25035965', label: 'Koekchuch' },
        { qid: 'Q30689479', label: 'Meti' },
        { qid: 'Q108266757', label: 'Vakasalewalewa' },
        { qid: 'Q130388254', label: 'Qariwarmi' },
        { qid: 'Q130388275', label: 'Ubhatovyanjanaka' },
        { qid: 'Q136443143', label: 'Tida wena' },
        { qid: 'Q7130936', label: 'Pangender' },
        { qid: 'Q660882', label: 'Hijra' },
        { qid: 'Q746411', label: 'Kathoey' },
        { qid: 'Q1399232', label: "Fa'afafine" },
        { qid: 'Q3177577', label: 'Muxe' },
        { qid: 'Q3277905', label: 'Mahu' }
    ];

    /* Flat maps for quick lookup */
    var ORIENTATION_MAP = {};
    ORIENTATIONS.forEach(function (o) { ORIENTATION_MAP[o.qid] = o; });

    var GENDER_MAP = {};
    GENDER_IDENTITIES.forEach(function (g) { GENDER_MAP[g.qid] = g; });

    /* ----------------------------------------------------------
       Page initialisation
       ---------------------------------------------------------- */

    function init() {
        loadIdentityCards('orientations-grid', ORIENTATIONS, 'Q17888', 'P91');
        loadIdentityCards('genders-grid', GENDER_IDENTITIES, 'Q48264', 'P21');
        loadPeopleCounts();
    }


    /* ----------------------------------------------------------
       Section 1 & 2: Identity cards grid
       ---------------------------------------------------------- */

    function loadIdentityCards(containerId, identities, classQid, property) {
        var container = document.getElementById(containerId);
        if (!container) return;

        var qids = identities.map(function (i) { return i.qid; });
        var doneLoading = wd.showLoading(container);

        wd.fetchItems(qids)
            .then(function (bindings) {
                doneLoading();
                renderIdentityCards(container, bindings, identities, property);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load identities from Wikidata:', err);
                wd.showError(container, 'Could not load identity data. Please try again later.');
            });
    }

    function renderIdentityCards(container, bindings, identities, property) {
        /* Build a map from QID to binding data */
        var dataMap = {};
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'item');
            /* Keep the first binding per QID (sometimes duplicates due to multiple images) */
            if (!dataMap[id]) dataMap[id] = b;
        });

        /* Render in the curated order */
        identities.forEach(function (identity) {
            var b = dataMap[identity.qid];
            var card = wd.el('article', 'identity-card card');

            /* Color accent — use a data attribute for CSS targeting */
            card.setAttribute('data-qid', identity.qid);

            /* Image */
            var imageUrl = b ? wd.val(b, 'image') : '';
            if (imageUrl) {
                var imgWrap = wd.el('div', 'identity-card__image');
                var img = document.createElement('img');
                img.src = wd.thumb(imageUrl, 400);
                img.alt = identity.label;
                img.loading = 'lazy';
                imgWrap.appendChild(img);
                card.appendChild(imgWrap);
            }

            /* Title */
            var label = b ? wd.val(b, 'itemLabel') : identity.label;
            var title = wd.el('h3', 'identity-card__title', label);
            card.appendChild(title);

            /* Description */
            var desc = b ? wd.val(b, 'itemDescription') : '';
            if (desc) {
                var descEl = wd.el('p', 'identity-card__desc', desc);
                card.appendChild(descEl);
            }

            /* Links */
            var links = wd.el('div', 'identity-card__links');

            var wdLink = document.createElement('a');
            wdLink.href = wd.entityUrl(identity.qid);
            wdLink.target = '_blank';
            wdLink.rel = 'noopener';
            wdLink.textContent = i18n ? i18n.t('link.wikidata') : 'Wikidata';
            wdLink.className = 'identity-card__link';
            links.appendChild(wdLink);

            var articleUrl = b ? wd.val(b, 'article') : '';
            if (articleUrl) {
                var wpLink = document.createElement('a');
                wpLink.href = articleUrl;
                wpLink.target = '_blank';
                wpLink.rel = 'noopener';
                wpLink.textContent = i18n ? i18n.t('link.wikipedia') : 'Wikipedia';
                wpLink.className = 'identity-card__link';
                links.appendChild(wpLink);
            }

            /* "Show people" button */
            var peopleBtn = document.createElement('button');
            peopleBtn.type = 'button';
            peopleBtn.className = 'btn btn--secondary identity-card__people-btn';
            peopleBtn.textContent = i18n ? i18n.t('btn.notablePeople') : 'Notable people';
            peopleBtn.setAttribute('data-qid', identity.qid);
            peopleBtn.setAttribute('data-property', property);
            peopleBtn.setAttribute('aria-expanded', 'false');
            peopleBtn.addEventListener('click', onPeopleClick);
            links.appendChild(peopleBtn);

            card.appendChild(links);

            /* People list (hidden until button clicked) */
            var peopleList = wd.el('div', 'identity-card__people');
            peopleList.id = 'people-' + identity.qid;
            peopleList.hidden = true;
            card.appendChild(peopleList);

            container.appendChild(card);
        });
    }


    /* ----------------------------------------------------------
       "Notable people" expand/collapse
       ---------------------------------------------------------- */

    function onPeopleClick(e) {
        var btn = e.currentTarget;
        var qidVal = btn.getAttribute('data-qid');
        var property = btn.getAttribute('data-property');
        var peopleContainer = document.getElementById('people-' + qidVal);
        if (!peopleContainer) return;

        var expanded = btn.getAttribute('aria-expanded') === 'true';
        if (expanded) {
            /* Collapse */
            peopleContainer.hidden = true;
            btn.setAttribute('aria-expanded', 'false');
            return;
        }

        /* Expand */
        btn.setAttribute('aria-expanded', 'true');
        peopleContainer.hidden = false;

        /* Only load once */
        if (peopleContainer.getAttribute('data-loaded')) return;
        peopleContainer.setAttribute('data-loaded', 'true');

        var doneLoading = wd.showLoading(peopleContainer);

        wd.fetchPeopleBy(property, qidVal, { limit: 12 })
            .then(function (bindings) {
                doneLoading();
                renderPeopleList(peopleContainer, bindings);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load people:', err);
                wd.showError(peopleContainer, 'Could not load people from Wikidata.');
            });
    }

    function renderPeopleList(container, bindings) {
        if (!bindings.length) {
            container.appendChild(wd.el('p', 'qm-empty', i18n ? i18n.t('empty.noPeople') : 'No people found in Wikidata for this identity.'));
            return;
        }

        /* Deduplicate by person QID */
        var seen = {};
        var unique = [];
        bindings.forEach(function (b) {
            var id = wd.qid(b, 'person');
            if (!seen[id]) {
                seen[id] = true;
                unique.push(b);
            }
        });

        var list = wd.el('ul', 'people-list');

        unique.forEach(function (b) {
            var li = wd.el('li', 'people-list__item');

            /* Thumbnail */
            var imgUrl = wd.val(b, 'image');
            if (imgUrl) {
                var img = document.createElement('img');
                img.src = wd.thumb(imgUrl, 80);
                img.alt = '';
                img.loading = 'lazy';
                img.className = 'people-list__photo';
                li.appendChild(img);
            }

            var info = wd.el('div', 'people-list__info');

            /* Name — link to Wikipedia or Wikidata */
            var articleUrl = wd.val(b, 'article');
            var personQid = wd.qid(b, 'person');
            var nameEl;
            if (articleUrl) {
                nameEl = document.createElement('a');
                nameEl.href = articleUrl;
                nameEl.target = '_blank';
                nameEl.rel = 'noopener';
            } else {
                nameEl = document.createElement('a');
                nameEl.href = wd.entityUrl(personQid);
                nameEl.target = '_blank';
                nameEl.rel = 'noopener';
            }
            nameEl.textContent = wd.val(b, 'personLabel');
            nameEl.className = 'people-list__name';
            info.appendChild(nameEl);

            /* Dates */
            var dob = wd.val(b, 'dob');
            var dod = wd.val(b, 'dod');
            if (dob) {
                var dateStr = formatYear(dob);
                if (dod) dateStr += ' \u2013 ' + formatYear(dod);
                var dateEl = wd.el('span', 'people-list__dates', dateStr);
                info.appendChild(dateEl);
            }

            /* Short description */
            var descText = wd.val(b, 'personDescription');
            if (descText) {
                var descEl = wd.el('span', 'people-list__desc', descText);
                info.appendChild(descEl);
            }

            li.appendChild(info);
            list.appendChild(li);
        });

        container.appendChild(list);
    }

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
       Section 3: People count summary
       ---------------------------------------------------------- */

    function loadPeopleCounts() {
        var container = document.getElementById('identity-counts');
        if (!container) return;

        var doneLoading = wd.showLoading(container);

        /* Fetch counts for orientations and genders in parallel */
        var orientationQids = ORIENTATIONS.map(function (o) { return o.qid; });
        var genderQids = GENDER_IDENTITIES.map(function (g) { return g.qid; });

        Promise.all([
            wd.fetchPeopleCounts('P91', orientationQids),
            wd.fetchPeopleCounts('P21', genderQids)
        ])
            .then(function (results) {
                doneLoading();
                var orientationCounts = results[0];
                var genderCounts = results[1];
                renderPeopleCounts(container, orientationCounts, genderCounts);
            })
            .catch(function (err) {
                doneLoading();
                console.error('Failed to load people counts:', err);
                wd.showError(container, 'Could not load Wikidata statistics.');
            });
    }

    function renderPeopleCounts(container, orientationCounts, genderCounts) {
        var section = wd.el('div', 'counts-grid');

        /* Combine and sort by count */
        var allCounts = orientationCounts.concat(genderCounts);
        allCounts.sort(function (a, b) {
            return parseInt(wd.val(b, 'count'), 10) - parseInt(wd.val(a, 'count'), 10);
        });

        allCounts.forEach(function (b) {
            var id = wd.qid(b, 'identity');
            var label = wd.val(b, 'identityLabel');
            var count = parseInt(wd.val(b, 'count'), 10);

            if (count === 0) return;

            var card = wd.el('div', 'count-card');
            var countEl = wd.el('span', 'count-card__number', count.toLocaleString());
            var labelEl = wd.el('span', 'count-card__label', label);

            card.appendChild(countEl);
            card.appendChild(labelEl);

            /* Link to Wikidata */
            card.setAttribute('title', 'People identified as ' + label + ' on Wikidata');
            card.setAttribute('data-qid', id);

            section.appendChild(card);
        });

        container.appendChild(section);
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
