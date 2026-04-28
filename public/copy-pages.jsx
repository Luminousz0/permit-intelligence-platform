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
    en: {
      breadcrumb: [{ label: "Home", href: "index.html" }, { label: "Regulatory" }],
      eyebrow: "Regulatory framework",
      title: "The Omgevingswet and the practice of participation",
      sub: "What the law requires, how municipalities implement it, and why 35+ different frameworks exist for one obligation.",
      toc: [
        { id: "wet",       label: "1. The Omgevingswet (2024)" },
        { id: "artikel",   label: "2. Article 16.55" },
        { id: "varianten", label: "3. Implementation variants" },
        { id: "vergelijk", label: "4. Municipality comparison" },
        { id: "gevolgen",  label: "5. Practical consequences" },
      ],
      sections: [
        {
          id: "wet",
          h: "The Omgevingswet (January 1, 2024)",
          body: [
            { p: "On January 1, 2024, the Omgevingswet entered into force. It consolidated 26 separate laws on space, environment, construction, and water into one legal framework. The goal: fewer rules, more coherence, faster decision-making." },
            { p: "For developers, the practical changes were fundamental. The permit was renamed \u201eomgevingsvergunning\u201d and one portal (Omgevingsloket) replaced the old DSO application streams. The new structure also introduced a requirement that did not previously exist: participation." },
            { callout: { label: "Core change", text: "For BOPA applications (non-zoning Omgevingsplan Activity), applicants are required to demonstrably involve stakeholders in their plan before submission." } },
          ],
        },
        {
          id: "artikel",
          h: "Article 16.55 \u2014 what the law says",
          body: [
            { p: "Article 16.55 section 7 of the Omgevingswet requires that the applicant indicate whether, and if so how, stakeholders have been involved in a BOPA application. This is called the \u201eparticipation report.\u201d" },
            { p: "Crucial: the law establishes the requirement, but leaves the implementation to municipalities. Each municipality determines which activities require participation, in what form documentation must be, and what counts as \u201csufficient\u201d involvement." },
            { source: "Omgevingswet art. 16.55, section 7 \u00b7 wetten.overheid.nl" },
            { h3: "What this means for the applicant" },
            { ul: [
              "The participation requirement is an admissibility condition \u2014 incomplete documentation leads to rejection as incomplete.",
              "What is \u201csufficient\u201d varies by municipality. A report that suffices in Almere may be incomplete in Amsterdam.",
              "The Council of State has issued multiple rulings since 2024 in which participation reports were deemed insufficient.",
            ] },
          ],
        },
        {
          id: "varianten",
          h: "Implementation variants per municipality",
          body: [
            { p: "As of April 2026, 307 of the 342 Dutch municipalities have published participation policies. Our analysis identifies six distinct policy approaches \u2014 totaling 35+ unique implementations when you count thresholds and exceptions." },
            { table: {
              head: ["#", "Policy approach", "Count", "What this means for you"],
              rows: [
                ["01", { name: "Mandatory for all", desc: "All BOPA applications require participation" }, "2", "No room for interpretation. Document always."],
                ["02", { name: "Activity list", desc: "Specific project types trigger the requirement" }, "9", "Check if your project is on the list."],
                ["03", { name: "Impact scoring", desc: "Points system based on impact" }, "2", "Score your project first; documentation follows from threshold."],
                ["04", { name: "Process-based", desc: "Mandatory process, not project-dependent" }, "1", "Follow the process requirements exactly."],
                ["05", { name: "Discretionary", desc: "Municipality decides per case" }, "9", "Pre-consultation with municipality necessary."],
                ["06", { name: "Voluntary + disclosure", desc: "Not mandatory, but disclose how you handled it" }, "4", "Lower threshold, but disclosure obligation remains."],
                ["07", { name: "No published policy", desc: "Municipality has not established a framework" }, "35", "Direct contact with municipality for expectations."],
              ],
            } },
          ],
        },
        {
          id: "vergelijk",
          h: "Comparison: major municipalities",
          body: [
            { p: "The table below compares six representative municipalities on key differences. Complete profiles are available in the reference tool." },
            { compTable: {
              head: ["Municipality", "Approach", "Threshold", "Format", "Assessment", "Source"],
              rows: [
                ["Almere",    "Activity list", "\u22654 units or >500 m\u00b2", "Free format", "Completeness", "CVDR685432"],
                ["Amsterdam", "Impact scoring", "Score \u22657 points", "Mandatory form", "Substantive", "CVDR701294"],
                ["Rotterdam", "Discretionary", "Per case", "Free format", "Pre-assessment", "CVDR698117"],
                ["Utrecht",   "Activity list", "\u22653 units", "Mandatory form", "Completeness", "CVDR692058"],
                ["The Hague", "Process-based", "All BOPA", "Fixed process", "Process-compliant", "CVDR687744"],
                ["Eindhoven", "Impact scoring", "Impact + scale", "Mandatory form", "Substantive", "CVDR690225"],
              ],
            } },
            { source: "Source: lokaleregelgeving.overheid.nl as of April 2026" },
          ],
        },
        {
          id: "gevolgen",
          h: "Practical consequences",
          body: [
            { p: "For developers active in multiple municipalities, this variation means that one standard process does not work. What is an acceptable application in one municipality leads to rejection elsewhere." },
            { ul: [
              "Pre-consultation with the municipality is often necessary to establish applicable requirements.",
              "A participation report that one municipality approves may be insufficient elsewhere.",
              "Delays occur when initial documentation is rejected as non-compliant.",
              "Across multiple projects, you must manage multiple frameworks in parallel.",
            ] },
            { callout: { label: "Our position", text: "This reference tool catalogs municipal policies from official sources. It does not replace pre-consultation or legal advice \u2014 it makes visible what is otherwise scattered across hundreds of documents." } },
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
    en: {
      breadcrumb: [{ label: "Home", href: "index.html" }, { label: "Validation" }],
      eyebrow: "Validation",
      title: "How the tool is tested and what it guarantees",
      sub: "Data sources, methodology, field testing, and our responsibility to you.",
      toc: [
        { id: "data",   label: "1. Data sources" },
        { id: "methodo", label: "2. Methodology" },
        { id: "veld",   label: "3. Field validation" },
        { id: "infra",  label: "4. Infrastructure" },
        { id: "limieten", label: "5. Limitations" },
      ],
      stats: [
        { v: "307", l: "Municipalities with published policy" },
        { v: "35+", l: "Distinct policy approaches" },
        { v: "28", l: "Fully profiled" },
        { v: "100%", l: "Source-cited" },
      ],
      sections: [
        {
          id: "data",
          h: "Data sources",
          body: [
            { p: "All data is extracted from official government sources: lokaleregelgeving.overheid.nl and official municipal websites. Each profile cites the CVDR number and publication date. You can verify any source directly." },
            { h3: "Municipalities" },
            { p: "28 municipalities are fully profiled. These represent the primary development markets in the Netherlands. Profiles are continuously updated as municipalities publish policy changes." },
          ],
        },
        {
          id: "methodo",
          h: "Methodology",
          body: [
            { p: "Each municipality's participation requirements are extracted from official policy documents and structured into a standardized profile." },
            { ul: [
              "Official source documents (municipal bylaws, regulatory rules, decision frameworks) are collected",
              "Requirements are categorized by project type, scale threshold, and process",
              "Extracted rules are cross-checked against source documents",
              "Profiles are timestamped and linked to official publication numbers (CVDR)",
            ] },
          ],
        },
        {
          id: "veld",
          h: "Field validation",
          body: [
            { p: "The reference tool has been validated in collaboration with an active real estate developer with ongoing projects in multiple municipalities. Validation confirmed the accuracy of extracted requirements and the practical utility of tool output." },
            { callout: {
              label: "Validation result",
              text: "\u201cTested on my actual project in Almere. The participation rules were exactly right. Saved me hours of calling the municipality.\u201d \u2014 Active real estate developer, Almere (name withheld at request).",
            } },
            { p: "Further validation through structured feedback from a broader customer group is planned for Q2 2026." },
          ],
        },
        {
          id: "infra",
          h: "Technical infrastructure",
          body: [
            { p: "The application runs on production hosting with continuous integration from the source repository. Tool queries are executed against a synchronized municipal policy database." },
            { ul: [
              "PDOK Locatieserver integration for address and municipality identification",
              "BAG (Dutch national address and building registry) for property and zoning context",
              "Continuous integration from version control; all changes are logged and traceable",
              "TLS encryption and uptime monitoring in production",
            ] },
          ],
        },
        {
          id: "limieten",
          h: "Limitations & responsibility",
          body: [
            { p: "This reference tool provides information based on documented municipal policy at the time of query. Users remain responsible for:" },
            { ul: [
              "Confirming current requirements directly with the applicable municipality before submission",
              "Reviewing complete official policy documents (links are provided)",
              "Consulting a legal advisor for complex projects or regulatory questions",
              "Verifying that their specific project characteristics align with documented requirements",
            ] },
            { callout: {
              label: "Disclaimer",
              text: "Policy changes that occur after a tool query must be verified directly with the municipality. We make no claims about legal validity or sufficiency of documentation for specific projects.",
            } },
          ],
        },
      ],
    },
  },
};

window.PAGES = PAGES;
