// Page-specific copy for subpages. Both NL and EN.
// Homepage copy lives in copy.jsx.

const PAGES = {
  regelgeving: {
    nl: {
      breadcrumb: [{ label: "Home", href: "index.html" }, { label: "Regelgeving" }],
      eyebrow: "Regelgeving",
      title: "De Omgevingswet en de praktijk van participatie",
      sub: "Wat de wet vereist, hoe gemeenten het invullen, en waarom 35+ verschillende kaders bestaan voor \u00e9\u00e9n verplichting.",
      toc: [
        { id: "wet",       label: "1. De Omgevingswet (2024)" },
        { id: "artikel",   label: "2. Artikel 16.55" },
        { id: "varianten", label: "3. Implementatie\u00advarianten" },
        { id: "vergelijk", label: "4. Vergelijking gemeenten" },
        { id: "gevolgen",  label: "5. Gevolgen in de praktijk" },
      ],
      sections: [
        {
          id: "wet",
          h: "De Omgevingswet (1 januari 2024)",
          body: [
            { p: "Op 1 januari 2024 trad de Omgevingswet in werking. Daarmee werden 26 aparte wetten over ruimte, milieu, bouw en water samengevoegd tot \u00e9\u00e9n juridisch kader. Het doel: minder regels, meer samenhang, snellere besluitvorming." },
            { p: "Voor ontwikkelaars veranderde de praktijk fundamenteel. De vergunning werd hernoemd naar \u201eomgevingsvergunning\u201d en \u00e9\u00e9n loket (Omgevingsloket) verving de oude DSO-aanvraag\u00adstromen. De nieuwe structuur introduceerde ook een verplichting die voorheen niet bestond: participatie." },
            { callout: { label: "Kernwijziging", text: "Voor BOPA-aanvragen (Buitenplanse Omgevingsplan\u00adactiviteit) is het aanvragers verplicht aantoonbaar te maken dat zij belanghebbenden hebben betrokken bij hun plan v\u00f3\u00f3r indiening." } },
          ],
        },
        {
          id: "artikel",
          h: "Artikel 16.55 \u2014 wat de wet zegt",
          body: [
            { p: "Artikel 16.55 lid 7 van de Omgevingswet vereist dat de aanvrager bij een BOPA-aanvraag aangeeft of, en zo ja hoe, belanghebbenden zijn betrokken. Dit wordt het \u201eparticipatieverslag\u201d genoemd." },
            { p: "Cruciaal: de wet legt de verplichting v\u00e1st, maar laat de invulling aan gemeenten over. Iedere gemeente bepaalt zelf welke activiteiten participatie vereisen, in welke vorm de documentatie moet, en wat geldt als \u201evoldoende\u201d betrokkenheid." },
            { source: "Omgevingswet art. 16.55, lid 7 \u00b7 wetten.overheid.nl" },
            { h3: "Wat dit betekent voor de aanvrager" },
            { ul: [
              "De participatieverplichting is een ontvankelijkheidseis \u2014 onvolledige documentatie leidt tot afwijzing als incompleet.",
              "Wat \u201evoldoende\u201d is, verschilt per gemeente. Een verslag dat in Almere voldoet kan in Amsterdam onvolledig zijn.",
              "De Raad van State heeft sinds 2024 meerdere uitspraken gedaan waarin participatieverslagen ontoereikend werden geacht.",
            ] },
          ],
        },
        {
          id: "varianten",
          h: "Implementatie\u00advarianten per gemeente",
          body: [
            { p: "Per april 2026 hebben 307 van de 342 Nederlandse gemeenten een participatiebeleid gepubliceerd. Onze analyse identificeert ze\u00e9s onderscheidende beleidsbenaderingen \u2014 in totaal 35+ unieke implementaties als je drempelwaarden en uitzonderingen meetelt." },
            { table: {
              head: ["#", "Beleidsbenadering", "Aantal", "Wat dit betekent voor jou"],
              rows: [
                ["01", { name: "Algeheel verplicht", desc: "Alle BOPA-aanvragen vereisen participatie" }, "2", "Geen ruimte voor interpretatie. Documenteer altijd."],
                ["02", { name: "Activiteitenlijst", desc: "Specifieke projecttypes triggeren de verplichting" }, "9", "Check of jouw project op de lijst staat."],
                ["03", { name: "Impact-scoring", desc: "Puntensysteem op basis van impact" }, "2", "Score eerst je project; documentatie volgt uit drempel."],
                ["04", { name: "Procesgebaseerd", desc: "Verplicht proces, niet aan project gebonden" }, "1", "Volg het procesvoorschrift exact."],
                ["05", { name: "Beoordelingsruimte", desc: "Per geval bepaalt de gemeente" }, "9", "Vooroverleg met gemeente noodzakelijk."],
                ["06", { name: "Vrijwillig + disclosure", desc: "Niet verplicht, maar vermelden hoe je het hebt aangepakt" }, "4", "Lichtere lat, maar verslagleggings\u00adplicht blijft."],
                ["07", { name: "Geen gepubliceerd beleid", desc: "Gemeente heeft geen kader vastgesteld" }, "35", "Direct contact met gemeente voor verwachtingen."],
              ],
            } },
          ],
        },
        {
          id: "vergelijk",
          h: "Vergelijking grote gemeenten",
          body: [
            { p: "Onderstaande tabel vergelijkt zes representatieve gemeenten op de belangrijkste verschillen. Volledige profielen zijn beschikbaar in de referentietool." },
            { compTable: {
              head: ["Gemeente", "Benadering", "Drempel", "Format", "Beoordeling", "Bron"],
              rows: [
                ["Almere",    "Activiteitenlijst", "\u22654 woningen of >500 m\u00b2", "Vrij format", "Op compleetheid", "CVDR685432"],
                ["Amsterdam", "Impact-scoring",     "Score \u22657 punten",          "Verplicht model", "Inhoudelijk", "CVDR701294"],
                ["Rotterdam", "Beoordelingsruimte", "Per geval",                    "Vrij format", "Pre-beoordeling", "CVDR698117"],
                ["Utrecht",   "Activiteitenlijst", "\u22653 woningen",              "Verplicht model", "Op compleetheid", "CVDR692058"],
                ["Den Haag",  "Procesgebaseerd",    "Alle BOPA",                    "Vast proces", "Procesconform", "CVDR687744"],
                ["Eindhoven", "Impact-scoring",     "Impact + omvang",              "Verplicht model", "Inhoudelijk", "CVDR690225"],
              ],
            } },
            { source: "Bron: lokaleregelgeving.overheid.nl per april 2026" },
          ],
        },
        {
          id: "gevolgen",
          h: "Gevolgen in de praktijk",
          body: [
            { p: "Voor ontwikkelaars die in meerdere gemeenten actief zijn, betekent deze variatie dat \u00e9\u00e9n standaardproces niet werkt. Wat in de ene gemeente een ontvankelijke aanvraag is, leidt elders tot afwijzing." },
            { ul: [
              "Vooroverleg met de gemeente is vaak noodzakelijk om toepasselijke vereisten vast te stellen.",
              "Een participatie\u00adverslag dat \u00e9\u00e9n gemeente goedkeurt, kan elders ontoereikend zijn.",
              "Vertraging treedt op wanneer initi\u00eble documentatie wordt afgewezen wegens niet-conformiteit.",
              "Over meerdere projecten heen moet je meerdere kaders parallel beheren.",
            ] },
            { callout: { label: "Onze positie", text: "Deze referentietool catalogiseert gemeentelijk beleid uit officie\u00eble bronnen. Het vervangt geen vooroverleg of juridisch advies \u2014 het maakt zichtbaar wat anders verspreid is over honderden documenten." } },
          ],
        },
      ],
    },
  },
  validatie: {
    nl: {
      breadcrumb: [{ label: "Home", href: "index.html" }, { label: "Validatie" }],
      eyebrow: "Validatie & bronnen",
      title: "Hoe deze referentie tot stand komt.",
      sub: "Elke regel heeft een bron. Elk bron heeft een datum. Je kunt elk antwoord verifi\u00ebren bij de oorspronkelijke gemeente.",
      stats: [
        { v: "28", l: "gemeenten volledig geprofileerd" },
        { v: "212", l: "bron\u00addocumenten gecatalogiseerd" },
        { v: "1", l: "praktijkvalidatie met actieve ontwikkelaar" },
      ],
      toc: [
        { id: "bronnen",   label: "1. Officiële bronnen" },
        { id: "methode",   label: "2. Methode" },
        { id: "veld",      label: "3. Veldvalidatie" },
        { id: "infra",     label: "4. Technische infrastructuur" },
        { id: "limieten",  label: "5. Beperkingen & verantwoordelijkheid" },
      ],
      sections: [
        {
          id: "bronnen",
          h: "Officiële bronnen",
          body: [
            { p: "Alle gemeentelijke beleidsdocumentatie wordt rechtstreeks ontleend aan officie\u00eble, gepubliceerde overheidsbronnen. Geen secundaire interpretaties, geen gerefereerde commentaren." },
            { ul: [
              "lokaleregelgeving.overheid.nl \u2014 officieel Nederlands lokaal regelgevingsregister",
              "Officiële gemeente\u00adwebsites en gepubliceerde beleidsdocumenten",
              "Gemeenteblad en officiële bekendmakingen (gemeente.overheid.nl)",
              "Parolo beleidsindex (parolo.nl) als startpunt voor systematische review",
            ] },
            { p: "Elk gemeenteprofiel bevat directe verwijzingen naar bron\u00addocumenten met CVDR-nummer en publicatie\u00addatum. Klik op elke bronvermelding om naar het origineel te gaan." },
          ],
        },
        {
          id: "methode",
          h: "Methode",
          body: [
            { p: "De ontwikkeling van de referentietool volgde een gestructureerde, herhaalbare methode:" },
            { h3: "1. Beleidsindex" },
            { p: "Systematische review van de Parolo-index van gemeentelijk participatiebeleid. Dit gaf de volledige populatie van 342 gemeenten en hun status (gepubliceerd / in voorbereiding / niet gepubliceerd)." },
            { h3: "2. Brondocument-extractie" },
            { p: "Voor elke geprofileerde gemeente: ophalen van het officiële beleidsdocument via lokaleregelgeving.overheid.nl. Vastleggen van CVDR-nummer, publicatie\u00addatum en laatste wijziging." },
            { h3: "3. Categorisering" },
            { p: "Indeling van participatie\u00advereisten naar regelgevings\u00adarchitectuur (algeheel verplicht, activiteitenlijst, impact-scoring, beoordelingsruimte, vrijwillig). Drempelwaarden, formaat\u00adeisen en beoordelings\u00admethodiek apart vastgelegd." },
            { h3: "4. Cross-verificatie" },
            { p: "Controle van ge\u00ebxtraheerde vereisten tegen feitelijk ingediende documentatie en officiële guidance\u00admaterialen waar beschikbaar." },
          ],
        },
        {
          id: "veld",
          h: "Veldvalidatie",
          body: [
            { p: "De referentietool is gevalideerd in samenwerking met een actieve vastgoedontwikkelaar met lopende projecten in meerdere gemeenten. De validatie bevestigde de juistheid van ge\u00ebxtraheerde vereisten en de praktische bruikbaarheid van de tool-output." },
            { callout: {
              label: "Validatie-resultaat",
              text: "\u201eGetest op mijn lopende project in Almere. De participatieregels klopten precies. Bespaarde me uren bellen met de gemeente.\u201d \u2014 Actieve vastgoedontwikkelaar, Almere (naam op verzoek niet vermeld).",
            } },
            { p: "Verdere validatie via gestructureerde feedback van bredere klantengroep is gepland voor Q2 2026." },
          ],
        },
        {
          id: "infra",
          h: "Technische infrastructuur",
          body: [
            { p: "De applicatie draait op productie\u00adhosting met continue integratie vanuit de bronrepository. Tool-queries worden uitgevoerd tegen een gesynchroniseerde gemeentelijke beleids\u00addatabase." },
            { ul: [
              "PDOK Locatieserver-integratie voor adres- en gemeente-identificatie",
              "BAG (Basisregistratie Adressen en Gebouwen) voor pand- en bestemmings\u00adcontext",
              "Continuous integration vanuit versiebeheer; elke wijziging logged en herleidbaar",
              "TLS encryptie en uptime monitoring op productie",
            ] },
          ],
        },
        {
          id: "limieten",
          h: "Beperkingen & verantwoordelijkheid",
          body: [
            { p: "Deze referentietool levert informatie gebaseerd op gedocumenteerd gemeentelijk beleid op de moment van bevraging. Gebruikers blijven verantwoordelijk voor:" },
            { ul: [
              "Het bevestigen van actuele vereisten direct bij de toepasselijke gemeente v\u00f3\u00f3r indiening",
              "Het doornemen van volledige officiële beleidsdocumenten (links worden meegeleverd)",
              "Consultatie met juridisch adviseur bij complexe projecten of regelgevingsvragen",
              "Het verifi\u00ebren dat hun specifieke project\u00adkenmerken aansluiten bij gedocumenteerde vereisten",
            ] },
            { callout: {
              label: "Disclaimer",
              text: "Beleidswijzigingen die plaatsvinden na een tool-query moeten direct met de gemeente worden geverifieerd. Wij maken geen claims over juridische geldigheid of toereikendheid van documentatie voor specifieke projecten.",
            } },
          ],
        },
      ],
    },
  },
};

window.PAGES = PAGES;
