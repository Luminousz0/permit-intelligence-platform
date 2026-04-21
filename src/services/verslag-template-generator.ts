export interface VerslagTemplateData {
  projectName: string;
  projectAddress: string;
  municipality: string;
  activityType: string;
  housingUnits?: number;
  applicantName?: string;
}

export function generateVerslagTemplateHTML(data: VerslagTemplateData): string {
  const date = new Date().toLocaleDateString('nl-NL', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });
  
  const projectName = data.projectName || `Project ${data.projectAddress.split(',')[0]}`;
  const applicant = data.applicantName || '[Vul naam in]';
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: 'Calibri', 'Arial', sans-serif;
      line-height: 1.6;
      color: #1a1a1a;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
    }
    h1 {
      color: #1a365d;
      border-bottom: 2px solid #3182ce;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }
    h2 {
      color: #2c5282;
      margin-top: 30px;
      margin-bottom: 15px;
      font-size: 1.3em;
    }
    .metadata {
      background: #f7fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }
    .metadata p {
      margin: 5px 0;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    th, td {
      border: 1px solid #e2e8f0;
      padding: 12px;
      text-align: left;
    }
    th {
      background: #edf2f7;
      font-weight: 600;
      color: #2d3748;
    }
    .warning {
      background: #fffaf0;
      border-left: 4px solid #ed8936;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .placeholder {
      color: #a0aec0;
      font-style: italic;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e2e8f0;
      font-size: 0.9em;
      color: #718096;
    }
  </style>
</head>
<body>

<h1>Participatieverslag — ${projectName}</h1>

<div class="metadata">
  <p><strong>Gemeente:</strong> ${data.municipality}</p>
  <p><strong>Projectadres:</strong> ${data.projectAddress}</p>
  <p><strong>Datum aanvraag:</strong> ${date}</p>
  <p><strong>Aanvrager:</strong> ${applicant}</p>
  <p><strong>Type activiteit:</strong> ${data.activityType}</p>
  ${data.housingUnits ? `<p><strong>Aantal eenheden:</strong> ${data.housingUnits}</p>` : ''}
</div>

<h2>1. Projectoverzicht</h2>
<p class="placeholder">[Beschrijf hier kort uw project. Wat gaat u bouwen, verbouwen of veranderen?]</p>

<h2>2. Betrokken Belanghebbenden</h2>
<p>De volgende partijen zijn geïdentificeerd als belanghebbenden bij dit project:</p>

<table>
  <thead>
    <tr>
      <th>Groep</th>
      <th>Waarom betrokken</th>
      <th>Hoe geïdentificeerd</th>
      <th>Contactmethode</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Direct omwonenden (binnen 50m)</td>
      <td>Direct zicht/hinder</td>
      <td>Adresregistratie gemeente</td>
      <td>Brief/e-mail</td>
    </tr>
    <tr>
      <td class="placeholder">[Voeg meer groepen toe]</td>
      <td class="placeholder">[Reden]</td>
      <td class="placeholder">[Methode]</td>
      <td class="placeholder">[Contact]</td>
    </tr>
  </tbody>
</table>

<h2>3. Uitgevoerde Participatieactiviteiten</h2>

<table>
  <thead>
    <tr>
      <th>Datum</th>
      <th>Type</th>
      <th>Locatie/Methode</th>
      <th>Deelnemers</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="placeholder">[DD-MM-JJJJ]</td>
      <td class="placeholder">[Bijv. Informatiebijeenkomst]</td>
      <td class="placeholder">[Adres/Online]</td>
      <td class="placeholder">[Aantal en type deelnemers]</td>
    </tr>
  </tbody>
</table>

<h3>Details per activiteit</h3>
<p><strong>[Datum] — [Type activiteit]</strong></p>
<ul>
  <li><strong>Locatie:</strong> <span class="placeholder">[Adres of online platform]</span></li>
  <li><strong>Aanwezigen:</strong> <span class="placeholder">[Namen of groepen]</span></li>
  <li><strong>Besproken:</strong> <span class="placeholder">[Korte samenvatting van wat besproken is]</span></li>
  <li><strong>Uitkomsten:</strong> <span class="placeholder">[Wat is er uit gekomen?]</span></li>
</ul>

<h2>4. Ontvangen Feedback en Verwerking</h2>

<h3>Feedback die is verwerkt in het plan</h3>
<table>
  <thead>
    <tr>
      <th>Ingebracht door</th>
      <th>Zorg/Input</th>
      <th>Aanpassing in plan</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="placeholder">[Naam/groep]</td>
      <td class="placeholder">[Beschrijving zorg]</td>
      <td class="placeholder">[Wat is aangepast?]</td>
    </tr>
  </tbody>
</table>

<h3>Feedback die niet is verwerkt (met reden)</h3>
<table>
  <thead>
    <tr>
      <th>Ingebracht door</th>
      <th>Zorg/Input</th>
      <th>Reden niet verwerkt</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td class="placeholder">[Naam/groep]</td>
      <td class="placeholder">[Beschrijving zorg]</td>
      <td class="placeholder">[Waarom niet?]</td>
    </tr>
  </tbody>
</table>

<h2>5. Conclusie en Vervolg</h2>
<p class="placeholder">[Beschrijf hier de uitkomst van het participatieproces. Is er consensus bereikt? Wat is de huidige relatie met belanghebbenden? Zijn er nog openstaande punten?]</p>

<h2>6. Verklaring</h2>
<p>Ondergetekende verklaart dat bovenstaand participatieproces te goeder trouw is uitgevoerd, dat alle geïdentificeerde belanghebbenden adequaat zijn geïnformeerd en in de gelegenheid zijn gesteld input te leveren, en dat dit verslag een accurate weergave is van het proces en de uitkomsten.</p>

<p style="margin-top: 30px;">
  <strong>Aanvrager:</strong> ${applicant}<br>
  <strong>Datum:</strong> ${date}
</p>

<div class="footer">
  <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
  <p><em>Dit verslag is gegenereerd door Permit Intelligence Platform en dient als eerste opzet. Vul de gemarkeerde velden in en pas aan waar nodig.</em></p>
</div>

</body>
</html>`;
}

export function generateMunicipalitySpecificNotesHTML(municipality: string): string {
  const notes: Record<string, string> = {
    'Amsterdam': `
<div class="warning" style="margin-top: 30px;">
  <h3 style="color: #ed8936; margin-top: 0;">⚠️ Amsterdam-specifieke vereisten</h3>
  <p>Amsterdam hanteert een verplichte participatiecategorie (1, 2, of 3) op basis van de impactscore van uw project:</p>
  <ul>
    <li><strong>Categorie 1 (beperkte gevolgen):</strong> Informeren van direct omwonenden</li>
    <li><strong>Categorie 2 (middelgrote gevolgen):</strong> Raadplegen bredere groep</li>
    <li><strong>Categorie 3 (aanzienlijke gevolgen):</strong> Actief adviesproces met gebiedsmakelaar</li>
  </ul>
  <p>Zorg dat uw participatieplan aansluit bij de juiste categorie.</p>
</div>`,
    'Utrecht': `
<div class="warning" style="margin-top: 30px;">
  <h3 style="color: #ed8936; margin-top: 0;">⚠️ Utrecht-specifieke vereisten</h3>
  <p>Utrecht vereist het doorlopen van het 'Kompas voor Zeggenschap' voor BOPA-aanvragen.</p>
  <ul>
    <li>Gebruik het Kompas om de juiste samenwerkingsvorm te bepalen</li>
    <li>Dien zowel een Samenwerkingsplan (vooraf) als Samenwerkingsverslag (achteraf) in</li>
    <li>Contact: samenstadmaken@utrecht.nl</li>
  </ul>
</div>`,
    'Almere': `
<div class="warning" style="margin-top: 30px;">
  <h3 style="color: #ed8936; margin-top: 0;">⚠️ Almere-specifieke vereisten</h3>
  <p>Almere beoordeelt participatie per geval. Er zijn geen vaste drempels of categorieën.</p>
  <ul>
    <li>Neem vooraf contact op met de gemeente over de verwachtingen</li>
    <li>Documenteer alle participatie-activiteiten uitgebreid</li>
    <li>Bij onvoldoende participatie kan de gemeente zelf zienswijzen ophalen (veroorzaakt vertraging)</li>
  </ul>
  <p>Meer informatie: https://www.almere.nl/bouwen/omgevingswet/participatie-omgevingswet</p>
</div>`,
    'Rotterdam': `
<div class="warning" style="margin-top: 30px;">
  <h3 style="color: #ed8936; margin-top: 0;">⚠️ Rotterdam-specifieke vereisten</h3>
  <p>Rotterdam maakt onderscheid tussen grote en kleine initiatieven:</p>
  <ul>
    <li><strong>Grote initiatieven:</strong> Verplicht intake-team, participatieadviseur, participatierapportage</li>
    <li><strong>Kleine initiatieven:</strong> Lichtere toets, factsheet volstaat vaak</li>
    <li><strong>Vrijstelling:</strong> Projecten die passen binnen een reeds goedgekeurd ruimtelijk kader zijn vrijgesteld</li>
  </ul>
</div>`,
    'Groningen': `
<div class="warning" style="margin-top: 30px;">
  <h3 style="color: #ed8936; margin-top: 0;">⚠️ Groningen-specifieke vereisten</h3>
  <p>Groningen hanteert een activiteitenlijst met 14 categorieën waarvoor participatie verplicht is.</p>
  <ul>
    <li>Uw project valt onder een verplichte categorie</li>
    <li>U bent zelf verantwoordelijk voor het participatieproces</li>
    <li>Betrek alle belanghebbenden en geef hen identieke informatie</li>
    <li>Bij onvoldoende participatie: één herstelmogelijkheid, daarna afwijzing</li>
  </ul>
</div>`
  };
  
  return notes[municipality] || '';
}

// Legacy function for backward compatibility
export function generateVerslagTemplate(data: VerslagTemplateData): string {
  return generateVerslagTemplateHTML(data);
}

export function generateMunicipalitySpecificNotes(municipality: string): string {
  return generateMunicipalitySpecificNotesHTML(municipality);
}
