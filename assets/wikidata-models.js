/* ============================================================
   Queer Memory — Wikidata WikiProject LGBT Data Models Reference
   Extracted from: https://www.wikidata.org/wiki/Wikidata:WikiProject_LGBT/Models
   Including sub-pages: Properties, Models/pride, Models/Flags, gender

   This file contains every property (P-number) and item (Q-number)
   referenced in the WikiProject LGBT data models, organized by
   topic domain.
   ============================================================ */

var QM = window.QM || {};

QM.models = (function () {
    'use strict';

    /* ===========================================================
       SECTION 1: PROPERTIES (P-numbers)
       All properties referenced across the WikiProject LGBT models
       =========================================================== */

    var PROPERTIES = {

        /* --- Core person properties --- */
        P21:    { id: 'P21',    label: 'sex or gender',                        domain: 'person' },
        P91:    { id: 'P91',    label: 'sexual orientation',                   domain: 'person' },
        P26:    { id: 'P26',    label: 'spouse',                               domain: 'person' },
        P451:   { id: 'P451',   label: 'unmarried partner',                    domain: 'person' },
        P6553:  { id: 'P6553',  label: 'personal pronoun',                     domain: 'person' },
        P13260: { id: 'P13260', label: 'romantic orientation',                 domain: 'person' },
        P13564: { id: 'P13564', label: 'third-gender population',             domain: 'person' },
        P106:   { id: 'P106',   label: 'occupation',                           domain: 'person' },

        /* --- Core classification properties --- */
        P31:    { id: 'P31',    label: 'instance of',                          domain: 'classification' },
        P136:   { id: 'P136',   label: 'genre',                                domain: 'classification' },
        P180:   { id: 'P180',   label: 'depicts',                              domain: 'classification' },
        P101:   { id: 'P101',   label: 'field of work',                        domain: 'classification' },
        P921:   { id: 'P921',   label: 'main subject',                         domain: 'classification' },

        /* --- Location and temporal properties --- */
        P17:    { id: 'P17',    label: 'country',                              domain: 'location' },
        P131:   { id: 'P131',   label: 'located in the administrative territorial entity', domain: 'location' },
        P571:   { id: 'P571',   label: 'inception',                            domain: 'temporal' },
        P585:   { id: 'P585',   label: 'point in time',                        domain: 'temporal' },

        /* --- Media and depiction properties --- */
        P18:    { id: 'P18',    label: 'image',                                domain: 'media' },
        P170:   { id: 'P170',   label: 'creator',                              domain: 'media' },
        P462:   { id: 'P462',   label: 'color',                                domain: 'media' },
        P487:   { id: 'P487',   label: 'Unicode character',                    domain: 'media' },

        /* --- Structural/relational properties --- */
        P155:   { id: 'P155',   label: 'follows',                              domain: 'structural' },
        P156:   { id: 'P156',   label: 'followed by',                          domain: 'structural' },
        P287:   { id: 'P287',   label: 'designed by',                          domain: 'structural' },
        P361:   { id: 'P361',   label: 'part of',                              domain: 'structural' },
        P373:   { id: 'P373',   label: 'Commons category',                     domain: 'structural' },
        P1299:  { id: 'P1299', label: 'depicted by',                           domain: 'structural' },

        /* --- Pride event properties --- */
        P393:   { id: 'P393',   label: 'edition number',                       domain: 'event' },
        P664:   { id: 'P664',   label: 'organizer',                            domain: 'event' },
        P1132:  { id: 'P1132',  label: 'number of participants',               domain: 'event' },
        P1290:  { id: 'P1290',  label: 'godparent',                            domain: 'event' },
        P1427:  { id: 'P1427',  label: 'start point',                          domain: 'event' },
        P1444:  { id: 'P1444',  label: 'destination point',                    domain: 'event' },
        P1451:  { id: 'P1451',  label: 'motto text',                           domain: 'event' },
        P1546:  { id: 'P1546',  label: 'motto',                                domain: 'event' },
        P2825:  { id: 'P2825',  label: 'via',                                  domain: 'event' },

        /* --- Other classification --- */
        P887:   { id: 'P887',   label: 'based on heuristic',                   domain: 'metadata' },
        P2521:  { id: 'P2521',  label: 'female form of label',                 domain: 'metadata' },

        /* --- LGBT-specific identifier properties --- */
        P6417:  { id: 'P6417',  label: 'Homosaurus ID (V2)',                   domain: 'identifier' },
        P10192: { id: 'P10192', label: 'Homosaurus ID (V3)',                   domain: 'identifier' },
        P13438: { id: 'P13438', label: 'Homosaurus ID (V4)',                   domain: 'identifier' },
        P9827:  { id: 'P9827',  label: 'GSSO ID',                              domain: 'identifier',
                  description: 'Gender, Sex, and Sexual Orientation ontology' },
        P8285:  { id: 'P8285',  label: 'LGBT Danmark online dictionary ID',    domain: 'identifier' },
        P8243:  { id: 'P8243',  label: '500 Queer Scientists profile',         domain: 'identifier' },
        P8244:  { id: 'P8244',  label: 'Mediaqueer.ca artist ID',              domain: 'identifier' },
        P8245:  { id: 'P8245',  label: 'Mediaqueer.ca movie ID',               domain: 'identifier' },
        P6554:  { id: 'P6554',  label: 'Represent Me ID',                      domain: 'identifier' },
        P6780:  { id: 'P6780',  label: 'LGBTFansDB character ID (archived)',   domain: 'identifier' },
        P7105:  { id: 'P7105',  label: 'LezWatch.TV actor ID',                 domain: 'identifier' },
        P7106:  { id: 'P7106',  label: 'LezWatch.TV character ID',             domain: 'identifier' },
        P7107:  { id: 'P7107',  label: 'LezWatch.TV show ID',                  domain: 'identifier' },
        P11852: { id: 'P11852', label: 'QLIT ID',                              domain: 'identifier' },
        P13967: { id: 'P13967', label: 'Out tag ID',                           domain: 'identifier' },
        P13968: { id: 'P13968', label: 'GayCities ID',                         domain: 'identifier' },
        P14003: { id: 'P14003', label: 'The Advocate tag ID',                  domain: 'identifier' },
        P14053: { id: 'P14053', label: 'Nonbinary Wiki ID',                    domain: 'identifier' }
    };


    /* ===========================================================
       SECTION 2: ITEMS (Q-numbers) — CLASSES AND INSTANCES
       Organized by topic domain
       =========================================================== */

    /* -----------------------------------------------------------
       2A. SEXUAL ORIENTATIONS & GENDER IDENTITIES
       ----------------------------------------------------------- */

    var SEXUAL_ORIENTATIONS = {
        Q17888: { id: 'Q17888', label: 'sexual orientation',
                  description: 'Umbrella concept for sexual orientations' },
        Q154136: { id: 'Q154136', label: 'human sexuality' },
        Q170912: { id: 'Q170912', label: 'sexology' }
    };

    var GENDER_IDENTITIES = {
        Q48264: { id: 'Q48264', label: 'gender identity',
                  description: 'Umbrella concept for gender identities' },
        Q6581072: { id: 'Q6581072', label: 'female' },
        Q48270:   { id: 'Q48270',   label: 'non-binary' },
        Q505371:  { id: 'Q505371',  label: 'agender' },
        Q660882:  { id: 'Q660882',  label: 'hijra' },
        Q189125:  { id: 'Q189125',  label: 'transgender' },
        Q1052281: { id: 'Q1052281', label: 'trans woman' },
        Q1097630: { id: 'Q1097630', label: 'intersex' },
        Q43445:   { id: 'Q43445',   label: 'female organism' },
        Q15404978: { id: 'Q15404978', label: 'gender expression' }
    };

    var GENDER_STUDIES = {
        Q1662673: { id: 'Q1662673', label: 'gender studies' },
        Q2122680: { id: 'Q2122680', label: 'queer studies' }
    };

    /* -----------------------------------------------------------
       2B. RIGHTS AND LAWS
       ----------------------------------------------------------- */

    var RIGHTS = {
        /* Core rights items */
        Q17625913: { id: 'Q17625913', label: 'LGBTQ rights',
                     description: 'Use with P101 (field of work) or P921 (main subject)' },
        Q17898:    { id: 'Q17898',    label: 'LGBT rights by country or territory',
                     description: 'Use with P31 (instance of)' },
        Q6517455:  { id: 'Q6517455',  label: 'transgender rights' },
        Q17900:    { id: 'Q17900',    label: 'LGBT adoption' },
        Q46839:    { id: 'Q46839',    label: 'LGBT parenting' },
        Q2673498:  { id: 'Q2673498',  label: 'LGBTQ+ and military service' },

        /* Rights by geographic region */
        Q130262462: { id: 'Q130262462', label: 'same-sex marriage in a geographic region',
                      description: 'Subclass of Q130265950' },
        Q130265950: { id: 'Q130265950', label: 'same-sex union in a geographic region',
                      description: 'Use with P31 under Q17898' },
        Q130286663: { id: 'Q130286663', label: 'decriminalization of homosexuality in a geographical region',
                      example: 'Q109423387' },
        Q130286655: { id: 'Q130286655', label: 'same-sex adoption in a geographical region',
                      example: 'Q6457816' },
        Q130320678: { id: 'Q130320678', label: 'outlawing of conversion therapy in a geographic region',
                      example: 'Q130320682' },
        Q123237562: { id: 'Q123237562', label: 'transgender rights by country or territory',
                      example: 'Q30324547' },
        Q130301689: { id: 'Q130301689', label: 'intersex rights by geographical region',
                      example: 'Q30642076' },

        /* Example country-level items */
        Q664194:  { id: 'Q664194',  label: 'LGBT rights in the United States' },
        Q680831:  { id: 'Q680831',  label: 'LGBT rights in Austria' },
        Q1286736: { id: 'Q1286736', label: 'LGBT rights in France' },
        Q1569096: { id: 'Q1569096', label: 'LGBT rights in Pakistan' }
    };

    /* -----------------------------------------------------------
       2C. DISCRIMINATION AND VIOLENCE
       ----------------------------------------------------------- */

    var DISCRIMINATION = {
        Q130297530: { id: 'Q130297530', label: 'discrimination against LGBT people in a geographical region' },
        Q130297534: { id: 'Q130297534', label: 'violence against LGBT people in a geographical region' },
        Q130297541: { id: 'Q130297541', label: 'history of violence against LGBT people in a geographical region',
                      example: 'Q5871051' },

        /* Specific discrimination types */
        homophobia_by_region:  { note: 'homophobia in a geographic region', example: 'Q56310488' },
        transphobia_by_region: { note: 'transphobia in a geographic region', example: 'Q127685213' },
        employment_discrimination: { note: 'LGBT employment discrimination in a geographic region', example: 'Q6457842' },
        military_discrimination:   { note: 'Sexual orientation and gender identity in military by region', example: 'Q65042352' },
        violence_against_trans:    { note: 'violence against transgender people in a geographic region', example: 'Q104861206' },

        /* Example instances */
        Q56310488:  { id: 'Q56310488',  label: 'homophobia in France' },
        Q127685213: { id: 'Q127685213', label: 'transphobia in Norway' },
        Q6457842:   { id: 'Q6457842',   label: 'LGBT employment discrimination in the United States' },
        Q65042352:  { id: 'Q65042352',  label: 'Sexual orientation and gender identity in the South Korean military' },
        Q104861206: { id: 'Q104861206', label: 'Violence against transgender people in the United States' },
        Q5871051:   { id: 'Q5871051',   label: 'history of violence against LGBT people in the United States' }
    };

    /* -----------------------------------------------------------
       2D. ACTIVISM AND MOVEMENT
       ----------------------------------------------------------- */

    var ACTIVISM = {
        Q130283248: { id: 'Q130283248', label: 'LGBT movement in a geographic area',
                      description: 'Use with P31',
                      example: 'Q130283252' },
        Q130285134: { id: 'Q130285134', label: 'LGBT pride in a geographic region',
                      example: 'Q126962269' },
        Q19509201:  { id: 'Q19509201',  label: 'LGBTQ rights activist',
                      description: 'Use with P106 (occupation)' },
        Q6458277:   { id: 'Q6458277',   label: 'LGBTQ+ rights organization' },
        Q125506609: { id: 'Q125506609', label: 'LGBT+ protest' },

        /* Example instances */
        Q126962269: { id: 'Q126962269', label: 'LGBT pride in Ecuador' }
    };

    /* -----------------------------------------------------------
       2E. EVENTS (Pride Parades, etc.)
       ----------------------------------------------------------- */

    var EVENTS = {
        Q51404:    { id: 'Q51404',    label: 'Pride parade',
                     description: 'Instance class for pride marches' },
        Q27968055: { id: 'Q27968055', label: 'recurring event edition',
                     description: 'Used for specific yearly editions of a Pride' },
        Q64348974: { id: 'Q64348974', label: 'LGBTQ+ event' },
        Q61740765: { id: 'Q61740765', label: 'LGBTQIA+ awareness period' },
        Q429785:   { id: 'Q429785',   label: 'poster',
                     description: 'Used for pride posters (P31=poster)' }
    };

    /* Pride event data model (from Models/pride sub-page):
       GENERIC PRIDE (recurring):
         P31  -> Q51404 (Pride parade)
         P17  -> [country]
         P131 -> [city/admin region]
         P571 -> [inception year]
         P18  -> [image]
         P373 -> [Commons category]

       SPECIFIC EDITION (yearly):
         P31  -> Q51404 (Pride parade) AND Q27968055 (recurring event edition)
         P361 -> [parent recurring Pride]
         P17  -> [country]
         P131 -> [city]
         P18  -> [image]
         P373 -> [Commons category]
         P155 -> [previous edition]
         P156 -> [next edition]
         P393 -> [edition number]
         P585 -> [date]
         P1299 -> [poster item]
         P1451 -> [motto text]
         P664  -> [organizer]
         P1290 -> [godparent]
         P1427 -> [start point]
         P1444 -> [destination point]
         P2825 -> [route via]
         P1132 -> [number of participants]

       PRIDE POSTER:
         P31  -> Q429785 (poster)
         P571 -> [year]
         P170 -> [creator]
         P180 -> Q51404 (depicts Pride), plus specific depicted items
    */

    /* -----------------------------------------------------------
       2F. PLACES AND ORGANIZATIONS
       ----------------------------------------------------------- */

    var PLACES = {
        Q64364539:  { id: 'Q64364539',  label: 'LGBT place',
                      description: 'Generic; use only if more specific item does not exist' },
        Q105321449: { id: 'Q105321449', label: 'LGBTQ bar',
                      description: 'General LGBTQ bar class' },
        Q1043639:   { id: 'Q1043639',   label: 'gay bar',
                      description: 'Subclass of LGBTQ bar' },
        Q30324198:  { id: 'Q30324198',  label: 'lesbian bar',
                      description: 'Subclass of LGBTQ bar' },
        Q61710650:  { id: 'Q61710650',  label: 'LGBT museum' },
        Q2945640:   { id: 'Q2945640',   label: 'LGBT community center' },
        Q62128088:  { id: 'Q62128088',  label: 'LGBT library' },
        Q61696039:  { id: 'Q61696039',  label: 'LGBTQ+ bookshop' },
        Q61755026:  { id: 'Q61755026',  label: 'LGBT publisher' },
        Q29469577:  { id: 'Q29469577',  label: 'LGBT historic place' },
        Q118108259: { id: 'Q118108259', label: 'LGBT+ information point' },
        Q7242780:   { id: 'Q7242780',   label: 'Pride House',
                      description: 'Sports-related Pride space' }
    };

    var ORGANIZATIONS = {
        Q64606659:  { id: 'Q64606659',  label: 'LGBTQ+ organization',
                      description: 'General LGBTQ organization class' },
        Q84433816:  { id: 'Q84433816',  label: 'lesbian organization',
                      description: 'Subclass of LGBTQ+ organization' },
        Q125886122: { id: 'Q125886122', label: 'intersex organization',
                      description: 'Subclass of LGBTQ+ organization' },
        Q125888609: { id: 'Q125888609', label: 'transgender organization',
                      description: 'Subclass of LGBTQ+ organization' },

        /* Sports organizations */
        Q112253143: { id: 'Q112253143', label: 'LGBT sports organization' },
        Q112252973: { id: 'Q112252973', label: 'LGBT sports club' }
    };

    /* -----------------------------------------------------------
       2G. CULTURE: LITERATURE, FILM, MEDIA, ARTS
       ----------------------------------------------------------- */

    var CULTURE = {
        /* --- Use with P136 (genre) --- */
        Q10318944:  { id: 'Q10318944',  label: 'LGBT-related literature',
                      description: 'General; use with P136 (genre)' },
        Q106771428: { id: 'Q106771428', label: 'LGBT play',
                      description: 'Subclass of Q10318944' },
        Q18211073:  { id: 'Q18211073',  label: 'LGBT literature',
                      description: 'Subclass of Q10318944; specifically literature written/read by LGBT+ people' },
        Q3294465:   { id: 'Q3294465',   label: 'lesbian literature',
                      description: 'Subclass of Q18211073' },
        Q1862618:   { id: 'Q1862618',   label: 'gay literature',
                      description: 'Subclass of Q18211073' },
        Q99596429:  { id: 'Q99596429',  label: 'transgender literature',
                      description: 'Subclass of Q18211073' },
        Q20442589:  { id: 'Q20442589',  label: 'LGBT-related film',
                      description: 'Use with P136 (genre) or P180 (depicts)' },
        Q85133165:  { id: 'Q85133165',  label: 'LGBT-related television series',
                      description: 'Use with P136 (genre) or P180 (depicts)' },
        Q61851987:  { id: 'Q61851987',  label: 'LGBT magazine' },

        /* --- Use with P31 (instance of) --- */
        Q61745175:  { id: 'Q61745175',  label: 'LGBT comic' },
        Q127607260: { id: 'Q127607260', label: 'LGBT literary work' },
        Q62018250:  { id: 'Q62018250',  label: 'LGBT film festival' },
        Q61744628:  { id: 'Q61744628',  label: 'LGBT film award' },
        Q1820625:   { id: 'Q1820625',   label: 'LGBT chorus' },
        Q61710689:  { id: 'Q61710689',  label: 'LGBT archive' },

        /* --- Video games (unclear if P31 or P136 as of Jan 2023) --- */
        Q85341917:  { id: 'Q85341917',  label: 'LGBT-themed video game' },
        Q85422949:  { id: 'Q85422949',  label: 'video game with LGBT character' },
        Q61642128:  { id: 'Q61642128',  label: 'video game with protagonist of selectable gender' },

        /* --- Characters and depiction (use with P180) --- */
        Q116687013: { id: 'Q116687013', label: 'LGBTQ character',
                      description: 'Use with P180 (depicts) for media items' },
        Q116687042: { id: 'Q116687042', label: 'LGBTQ protagonist',
                      description: 'Use with P180 (depicts) for media items' },
        Q130287298: { id: 'Q130287298', label: 'queer-coded character',
                      description: 'Use with P31 or P180' },
        Q125388025: { id: 'Q125388025', label: 'LGBTQ antagonist',
                      description: 'Use with P31 or P180' },
        Q106727126: { id: 'Q106727126', label: 'sissy villain',
                      description: 'Use with P31 or P180' },

        /* --- Public art and installations --- */
        Q112244623: { id: 'Q112244623', label: 'LGBT+ pride colors in public art' },
        Q28147359:  { id: 'Q28147359',  label: 'Rainbow crossing',
                      description: 'Subclass of Q112244623' },
        Q112244692: { id: 'Q112244692', label: 'LGBT bench',
                      description: 'Subclass of Q112244623' },
        Q112244752: { id: 'Q112244752', label: 'Rainbow postbox',
                      description: 'Subclass of Q112244623' },
        Q112243154: { id: 'Q112243154', label: 'Rainbow stairs',
                      description: 'Subclass of Q112244623' },

        /* --- Culture by region --- */
        Q97278186:  { id: 'Q97278186',  label: 'LGBT culture of an area',
                      example: 'Q6457827' },
        Q114609714: { id: 'Q114609714', label: 'LGBT literature in a geographic region',
                      example: 'Q123885839' },
        Q130285217: { id: 'Q130285217', label: 'LGBT cinema in a geographic region',
                      example: 'Q85751989' },
        Q130285074: { id: 'Q130285074', label: 'LGBT tourism in a geographic region',
                      example: 'Q15299962' },
        Q130283328: { id: 'Q130283328', label: 'Drag in a geographic area',
                      example: 'Q125744745' }
    };

    /* -----------------------------------------------------------
       2H. FLAGS AND SYMBOLS
       ----------------------------------------------------------- */

    var FLAGS = {
        Q7242811: { id: 'Q7242811', label: 'pride flag',
                    description: 'Use with P31' },
        Q51401:   { id: 'Q51401',   label: 'LGBTQ pride flag',
                    description: 'The rainbow flag designed by Gilbert Baker' },
        Q1426529: { id: 'Q1426529', label: 'bisexual pride flag' }
    };

    /* Flag data model (from Models/Flags sub-page):
       P18  -> [image file]
       P31  -> Q7242811 (pride flag)
       P571 -> [inception year]
       P287 -> [designed by]
       P487 -> [Unicode character/emoji]
       P462 -> [color]
    */

    /* -----------------------------------------------------------
       2I. BY-COUNTRY STRUCTURE
       ----------------------------------------------------------- */

    var BY_COUNTRY = {
        /* Top-level */
        Q129675479: { id: 'Q129675479', label: 'LGBT of a geographic region',
                      description: 'Top-level country article class',
                      example: 'Q16150728' },

        /* History */
        Q130262508: { id: 'Q130262508', label: 'LGBTQ history in a geographic region',
                      example: 'Q4204645' },
        Q125143610: { id: 'Q125143610', label: 'LGBT timeline',
                      example: 'Q126091996' },

        /* Culture subtopics */
        Q130301730: { id: 'Q130301730', label: 'LGBT retirement in a geographical region',
                      example: 'Q6457922' },
        Q130301738: { id: 'Q130301738', label: 'health access for LGBT people in a geographic region' },
        Q131322980: { id: 'Q131322980', label: 'HIV/AIDS in a geographical region',
                      example: 'Q1099260' },

        /* Identity subtopics */
        Q130283338: { id: 'Q130283338', label: 'lesbianism in a geographical area',
                      example: 'Q109326545' },
        Q130301672: { id: 'Q130301672', label: 'lesbian history in a geographical region',
                      example: 'Q115406349' },
        Q130283346: { id: 'Q130283346', label: 'transidentities in a geographical area',
                      example: 'Q113841331' },
        Q130301682: { id: 'Q130301682', label: 'transgender history in a geographical region',
                      example: 'Q123823211' },
        Q28136463:  { id: 'Q28136463',  label: 'Intersexuation by geographical area',
                      example: 'Q30591011' }
    };

    /* -----------------------------------------------------------
       2J. OTHER RELEVANT ITEMS
       ----------------------------------------------------------- */

    var OTHER = {
        Q208099:   { id: 'Q208099',   label: 'coming out' },
        Q120800775: { id: 'Q120800775', label: 'Rainbow Plaques project' },
        Q63870987: { id: 'Q63870987', label: 'Wikidata property related to LGBT',
                     description: 'Metaproperty class; tag P31 of relevant properties with this value' }
    };

    /* -----------------------------------------------------------
       2K. WIKIMEDIA MOVEMENT ITEMS
       ----------------------------------------------------------- */

    var WIKIMEDIA = {
        Q15092984: { id: 'Q15092984', label: 'WikiProject LGBTQ+ studies' },
        Q67184848: { id: 'Q67184848', label: 'Wikimedia LGBT+' },
        Q24909800: { id: 'Q24909800', label: 'Art+Feminism' },
        Q43653733: { id: 'Q43653733', label: 'Women in Red' },
        Q17002416: { id: 'Q17002416', label: 'gender bias on Wikipedia' }
    };

    /* -----------------------------------------------------------
       2L. GENDER MODEL EXAMPLES (from /gender sub-page)
       ----------------------------------------------------------- */

    var GENDER_MODEL_EXAMPLES = [
        {
            person: 'Q365144',  personLabel: 'Caitlyn Jenner',
            current: { P21: 'Q1052281 (trans woman)' },
            proposed: { gender: 'Q6581072 (female)', transgender_status: 'Q189125 (transgender)' }
        },
        {
            person: 'Q59160028', personLabel: 'Kitty Anderson',
            current: { P21: 'Q1097630 (intersex), Q6581072 (female)' },
            proposed: { gender: 'Q6581072 (female)', sex: 'Q1097630 (intersex)' }
        },
        {
            person: 'Q3942185',  personLabel: 'Ruby Rose',
            current: { P21: 'Q48270 (non-binary)' },
            proposed: { gender: 'Q48270 (non-binary)', transgender_status: 'Q189125 (transgender)' }
        },
        {
            person: 'Q55800',    personLabel: 'Oprah Winfrey',
            current: { P21: 'Q6581072 (female)' },
            proposed: { gender: 'Q6581072 (female)' }
        },
        {
            person: 'Q6505228',  personLabel: 'Laxmi Narayan Tripathi',
            current: { P21: 'Q6581072 (female)' },
            proposed: { gender: 'Q660882 (hijra)', transgender_status: 'Q189125 (transgender)' }
        },
        {
            person: 'Q10306630', personLabel: 'Public Universal Friend',
            current: { P21: 'Q505371 (agender)' },
            proposed: { gender: 'Q505371 (agender)' }
        },
        {
            person: 'Q171433',   personLabel: 'Dolly the Sheep',
            current: { P21: 'Q43445 (female organism)' },
            proposed: { sex: 'Q43445 (female organism)' }
        }
    ];


    /* ===========================================================
       SECTION 3: ENTITY SCHEMAS
       =========================================================== */

    var SCHEMAS = {
        E57:  { id: 'E57',  label: 'Shape expression of a Pride' },
        E58:  { id: 'E58',  label: 'Shape expression of a Pride flag' },
        E215: { id: 'E215', label: 'same-sex marriage' }
    };


    /* ===========================================================
       SECTION 4: LINKED LIST PAGES
       These are separate WikiProject pages containing curated lists.
       =========================================================== */

    var LISTS = {
        concepts: {
            sexual_orientations: 'Wikidata:WikiProject LGBT/Lists/SexualOrientations',
            genders:             'Wikidata:WikiProject LGBT/Lists/Genders'
        },
        rights: {
            same_sex_marriage:   'Wikidata:WikiProject LGBT/Same-sex marriage'
        },
        culture: {
            television_series:   'Wikidata:WikiProject LGBT/Television Series',
            films:               'Wikidata:WikiProject LGBT/Films',
            books:               'Wikidata:WikiProject LGBT/Books',
            museums:             'Wikidata:WikiProject LGBT/Museums',
            film_festivals:      'Wikidata:WikiProject LGBT/Film_festivals',
            archives:            'Wikidata:WikiProject LGBT/Archives_and_Magazines',
            bars:                'Wikidata:WikiProject LGBT/bars',
            gay_villages:        'Wikidata:WikiProject LGBT/Lists/Gay_villages',
            media_magazines:     'Wikidata:WikiProject LGBT/Lists/Media Magazines'
        },
        persons: {
            activists:           'Wikidata:WikiProject LGBT/Activists',
            by_sexual_orientation: 'Wikidata:WikiProject LGBT/PersonsBySexualOrientation',
            asexual:             'Wikidata:WikiProject LGBT/PersonsBySexualOrientation/Asexual',
            bisexual:            'Wikidata:WikiProject LGBT/PersonsBySexualOrientation/Bisexual',
            pansexual:           'Wikidata:WikiProject LGBT/PersonsBySexualOrientation/Pansexual',
            by_romantic_orientation: 'Wikidata:WikiProject LGBT/PersonsByRomanticOrientation',
            by_gender_identity:  'Wikidata:WikiProject LGBT/PersonsByGenderIdentity'
        },
        movement: {
            flags:               'Wikidata:WikiProject LGBT/Flags',
            chorus:              'Wikidata:WikiProject LGBT/Chorus',
            organizations:       'Wikidata:WikiProject LGBT/LGBT organizations',
            awareness_days:      'Wikidata:WikiProject LGBT/Awareness Days',
            pride_parades:       'Wikidata:WikiProject LGBT/Pride Parades'
        },
        properties:              'Wikidata:WikiProject LGBT/Properties',
        statistics:              'Wikidata:WikiProject LGBT/P91 distribution_by_gender',
        maintenance:             'Wikidata:WikiProject LGBT/MaintenanceLists',
        personal_pronouns:       'Wikidata:WikiProject_Personal_Pronouns'
    };


    /* ===========================================================
       SECTION 5: RELATIONSHIP MAP
       How properties connect classes to items in this model.
       =========================================================== */

    var RELATIONSHIPS = {

        /* --- Person modeling --- */
        person: {
            description: 'Properties for describing LGBT people (humans and fictional characters)',
            properties: ['P21', 'P91', 'P26', 'P451', 'P6553', 'P13260', 'P106'],
            notes: [
                'P21 (sex or gender) is the most contested property; see /gender sub-page',
                'P91 (sexual orientation) accepts items like Q6636 (homosexuality)',
                'P6553 (personal pronoun) is used for non-default pronouns',
                'P13260 (romantic orientation) was added for split-attraction model',
                'P106 with Q19509201 marks someone as an LGBTQ rights activist'
            ]
        },

        /* --- Instance classification --- */
        classification: {
            description: 'P31 (instance of) class hierarchy',
            P31_classes: [
                'Q129675479 - LGBT of a geographic region (top-level country articles)',
                'Q17898 - LGBT rights by country or territory',
                'Q130283248 - LGBT movement in a geographic area',
                'Q64348974 - LGBTQ+ event',
                'Q51404 - Pride parade',
                'Q61745175 - LGBT comic',
                'Q127607260 - LGBT literary work',
                'Q62018250 - LGBT film festival',
                'Q61744628 - LGBT film award',
                'Q1820625 - LGBT chorus',
                'Q61710689 - LGBT archive',
                'Q64364539 - LGBT place',
                'Q105321449 - LGBTQ bar',
                'Q61710650 - LGBT museum',
                'Q2945640 - LGBT community center',
                'Q64606659 - LGBTQ+ organization',
                'Q112253143 - LGBT sports organization',
                'Q112252973 - LGBT sports club',
                'Q7242780 - Pride House',
                'Q7242811 - pride flag',
                'Q112244623 - LGBT+ pride colors in public art'
            ]
        },

        /* --- Genre classification --- */
        genre: {
            description: 'P136 (genre) values for creative works',
            P136_values: [
                'Q10318944 - LGBT-related literature',
                'Q18211073 - LGBT literature (subset: by/for LGBT people)',
                'Q20442589 - LGBT-related film',
                'Q85133165 - LGBT-related television series',
                'Q85341917 - LGBT-themed video game',
                'Q85422949 - video game with LGBT character',
                'Q61642128 - video game with protagonist of selectable gender'
            ]
        },

        /* --- Subject/field classification --- */
        subject: {
            description: 'P101 (field of work) or P921 (main subject) values',
            values: [
                'Q17625913 - LGBTQ rights',
                'Q6517455 - transgender rights',
                'Q1662673 - gender studies',
                'Q2122680 - queer studies',
                'Q15404978 - gender expression',
                'Q154136 - human sexuality',
                'Q17888 - sexual orientation',
                'Q48264 - gender identity',
                'Q170912 - sexology',
                'Q17900 - LGBT adoption',
                'Q46839 - LGBT parenting',
                'Q2673498 - LGBTQ+ and military service',
                'Q1286736 - LGBT rights in France',
                'Q1569096 - LGBT rights in Pakistan',
                'Q680831 - LGBT rights in Austria',
                'Q664194 - LGBT rights in the United States'
            ]
        },

        /* --- Depiction --- */
        depiction: {
            description: 'P180 (depicts) values for media featuring LGBT content',
            values: [
                'Q116687013 - LGBTQ character',
                'Q116687042 - LGBTQ protagonist',
                'Q106727126 - sissy villain',
                'Q130287298 - queer-coded character',
                'Q125388025 - LGBTQ antagonist'
            ],
            notes: 'Use P180 with these values if the character is a protagonist, for works that are P31=Q20442589 or P31=Q85133165'
        },

        /* --- Metaproperty tagging --- */
        metaproperties: {
            description: 'Tagging relevant properties as LGBT-related using P31=Q63870987',
            class: 'Q63870987 - Wikidata property related to LGBT',
            usage: 'Set P31 of any relevant property to Q63870987 (or subclass) to enable listing all gender-related properties via SPARQL',
            sparql_listing_url: 'https://w.wiki/3bDR'
        }
    };


    /* ===========================================================
       SECTION 6: PRIDE PARADE DATA MODEL (detailed)
       From Models/pride sub-page
       =========================================================== */

    var PRIDE_MODEL = {
        generic_event: {
            description: 'Data model for a recurring Pride parade (e.g., "Pride of [City]")',
            naming: 'LGBT Pride of [Town]',
            properties: {
                P31:  { value: 'Q51404', label: 'Pride parade' },
                P17:  { description: 'country where Pride takes place' },
                P131: { description: 'city/administrative region' },
                P571: { description: 'year of first edition' },
                P18:  { description: 'image' },
                P373: { description: 'Commons category' }
            }
        },
        specific_edition: {
            description: 'Data model for a specific yearly edition (e.g., "Pride of [City] [Year]")',
            naming: 'LGBT Pride of [Town] [Year]',
            properties: {
                P31:   [
                    { value: 'Q51404',    label: 'Pride parade' },
                    { value: 'Q27968055', label: 'recurring event edition' }
                ],
                P361:  { description: 'parent recurring Pride event' },
                P17:   { description: 'country' },
                P131:  { description: 'city' },
                P18:   { description: 'image' },
                P373:  { description: 'Commons category' },
                P155:  { description: 'previous edition' },
                P156:  { description: 'next edition' },
                P393:  { description: 'edition number' },
                P585:  { description: 'date' },
                P1299: { description: 'depicted by (poster)' },
                P1451: { description: 'motto text' },
                P664:  { description: 'organizer' },
                P1290: { description: 'godparent' },
                P1427: { description: 'start point' },
                P1444: { description: 'destination point' },
                P2825: { description: 'route via' },
                P1132: { description: 'number of participants' }
            }
        },
        poster: {
            description: 'Data model for a Pride poster',
            properties: {
                P31:  { value: 'Q429785', label: 'poster' },
                P571: { description: 'year' },
                P170: { description: 'creator' },
                P180: { description: 'depicts (e.g., Q51404 Pride parade, specific symbols)' }
            }
        },
        integraality_properties: ['P131', 'P17', 'P18', 'P361', 'P393', 'P585', 'P664', 'P1132', 'P1427']
    };


    /* ===========================================================
       SECTION 7: FLAG DATA MODEL (detailed)
       From Models/Flags sub-page
       =========================================================== */

    var FLAG_MODEL = {
        description: 'Data model for Pride/rainbow flags',
        schema: 'EntitySchema:E58',
        properties: {
            P18:  { description: 'image file (e.g., Gay_Pride_Flag.svg)' },
            P31:  { value: 'Q7242811', label: 'pride flag' },
            P571: { description: 'inception year (e.g., 1978 for rainbow flag)' },
            P287: { description: 'designed by (e.g., Q4081194 Gilbert Baker)' },
            P487: { description: 'Unicode character/emoji' },
            P462: { description: 'color (e.g., Q2468392 lavender)' }
        },
        examples: {
            Q51401:   'LGBTQ pride flag (rainbow flag)',
            Q1426529: 'bisexual pride flag'
        }
    };


    /* ===========================================================
       SECTION 8: ALL IDENTIFIER PROPERTIES (consolidated)
       From Properties sub-page
       =========================================================== */

    var IDENTIFIER_PROPERTIES = {
        people: {
            P7105:  'LezWatch.TV actor ID',
            P8243:  '500 Queer Scientists profile',
            P8244:  'Mediaqueer.ca artist ID'
        },
        cultural_works: {
            P6554:  'Represent Me ID',
            P6780:  'LGBTFansDB character ID (archived)',
            P7106:  'LezWatch.TV character ID',
            P7107:  'LezWatch.TV show ID',
            P8245:  'Mediaqueer.ca movie ID'
        },
        vocabularies_and_ontologies: {
            P6417:  'Homosaurus ID (V2)',
            P10192: 'Homosaurus ID (V3)',
            P13438: 'Homosaurus ID (V4)',
            P9827:  'GSSO ID (Gender, Sex, and Sexual Orientation ontology)',
            P8285:  'LGBT Danmark online dictionary ID',
            P11852: 'QLIT ID',
            P14053: 'Nonbinary Wiki ID'
        },
        media_tags: {
            P13967: 'Out tag ID',
            P13968: 'GayCities ID',
            P14003: 'The Advocate tag ID'
        },
        core_person_properties: {
            P21:    'sex or gender',
            P91:    'sexual orientation',
            P6553:  'personal pronoun',
            P13260: 'romantic orientation',
            P13564: 'third-gender population'
        }
    };


    /* ===========================================================
       PUBLIC API
       =========================================================== */

    return {
        PROPERTIES:            PROPERTIES,
        SEXUAL_ORIENTATIONS:   SEXUAL_ORIENTATIONS,
        GENDER_IDENTITIES:     GENDER_IDENTITIES,
        GENDER_STUDIES:        GENDER_STUDIES,
        RIGHTS:                RIGHTS,
        DISCRIMINATION:        DISCRIMINATION,
        ACTIVISM:              ACTIVISM,
        EVENTS:                EVENTS,
        PLACES:                PLACES,
        ORGANIZATIONS:         ORGANIZATIONS,
        CULTURE:               CULTURE,
        FLAGS:                 FLAGS,
        BY_COUNTRY:            BY_COUNTRY,
        OTHER:                 OTHER,
        WIKIMEDIA:             WIKIMEDIA,
        GENDER_MODEL_EXAMPLES: GENDER_MODEL_EXAMPLES,
        SCHEMAS:               SCHEMAS,
        LISTS:                 LISTS,
        RELATIONSHIPS:         RELATIONSHIPS,
        PRIDE_MODEL:           PRIDE_MODEL,
        FLAG_MODEL:            FLAG_MODEL,
        IDENTIFIER_PROPERTIES: IDENTIFIER_PROPERTIES,

        /**
         * Look up a property by its P-number.
         * @param {string} pid - e.g. 'P21'
         * @return {Object|undefined}
         */
        getProperty: function (pid) {
            return PROPERTIES[pid];
        },

        /**
         * Look up an item across all domain objects.
         * @param {string} qid - e.g. 'Q17898'
         * @return {Object|undefined}
         */
        getItem: function (qid) {
            var domains = [
                SEXUAL_ORIENTATIONS, GENDER_IDENTITIES, GENDER_STUDIES,
                RIGHTS, DISCRIMINATION, ACTIVISM, EVENTS,
                PLACES, ORGANIZATIONS, CULTURE, FLAGS,
                BY_COUNTRY, OTHER, WIKIMEDIA
            ];
            for (var i = 0; i < domains.length; i++) {
                if (domains[i][qid]) return domains[i][qid];
            }
            return undefined;
        },

        /**
         * Get all properties filtered by domain.
         * @param {string} domain - e.g. 'person', 'identifier', 'event'
         * @return {Object[]}
         */
        getPropertiesByDomain: function (domain) {
            var result = [];
            for (var pid in PROPERTIES) {
                if (PROPERTIES[pid].domain === domain) {
                    result.push(PROPERTIES[pid]);
                }
            }
            return result;
        }
    };

})();

window.QM = QM;
